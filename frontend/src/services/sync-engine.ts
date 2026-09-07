import { apiClient } from "@/services/auth";
import { db, SyncQueueItem } from "@/services/db";
import { useSyncStore } from "@/store/sync.store";

export class SyncEngine {
  private static instance: SyncEngine;
  private isProcessing = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private maxRetries = 5;
  private backoffBaseMs = 1000;

  private constructor() {
    if (typeof window !== "undefined") {
      this.initListeners();
      this.refreshPendingCount();
    }
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  private initListeners() {
    if (typeof window === "undefined") return;

    window.addEventListener("online", () => {
      useSyncStore.getState().setIsOnline(true);
      useSyncStore.getState().addLog("Conexão com a rede restaurada. A iniciar sincronização...", "info");
      this.sync();
    });

    window.addEventListener("offline", () => {
      useSyncStore.getState().setIsOnline(false);
      useSyncStore.getState().addLog("Sem conexão com a rede. Modo offline ativado.", "info");
    });

    // Heartbeat a cada 30 segundos
    this.heartbeatInterval = setInterval(() => {
      this.checkConnectivity();
    }, 30000);
  }

  public async checkConnectivity(): Promise<boolean> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      useSyncStore.getState().setIsOnline(false);
      return false;
    }

    try {
      // Ping rápido no healthcheck do backend
      await apiClient.get("/health", { timeout: 3000 });
      useSyncStore.getState().setIsOnline(true);
      return true;
    } catch {
      useSyncStore.getState().setIsOnline(false);
      return false;
    }
  }

  public async queueOperation(
    entity: string,
    operation: "CREATE" | "UPDATE" | "DELETE",
    endpoint: string,
    payload: any,
    entityId?: number | string
  ): Promise<string> {
    const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    await db.syncQueue.add({
      client_mutation_id: mutationId,
      entity,
      entity_id: entityId,
      operation,
      endpoint,
      payload,
      retry_count: 0,
      status: "PENDING",
      created_at: now,
      updated_at: now,
    });

    await this.refreshPendingCount();
    useSyncStore.getState().addLog(`Operação offline enfileirada: ${operation} ${entity}`, "info");

    // Se estiver online, tenta enviar imediatamente
    if (useSyncStore.getState().isOnline) {
      this.sync();
    }

    return mutationId;
  }

  public async sync(): Promise<{ success: boolean; processed: number }> {
    if (this.isProcessing) {
      return { success: false, processed: 0 };
    }

    const isConnected = await this.checkConnectivity();
    if (!isConnected) {
      return { success: false, processed: 0 };
    }

    this.isProcessing = true;
    useSyncStore.getState().setIsSyncing(true);
    useSyncStore.getState().setLastError(null);

    let processedCount = 0;

    try {
      // 1. Push: Enviar operações pendentes para o servidor
      processedCount = await this.pushToServer();

      // 2. Pull: Atualizar dados mestres (produtos e clientes)
      await this.pullFromServer();

      const timestamp = new Date().toISOString();
      useSyncStore.getState().setLastSyncTimestamp(timestamp);
      await db.syncMeta.put({ key: "last_sync_timestamp", value: timestamp, updated_at: timestamp });

      if (processedCount > 0) {
        useSyncStore.getState().addLog(`${processedCount} operação(ões) sincronizadas com o servidor com sucesso.`, "success");
      }
    } catch (err: any) {
      useSyncStore.getState().setLastError(err.message || "Erro durante a sincronização.");
      useSyncStore.getState().addLog(`Falha na sincronização: ${err.message}`, "error");
    } finally {
      this.isProcessing = false;
      useSyncStore.getState().setIsSyncing(false);
      await this.refreshPendingCount();
    }

    return { success: true, processed: processedCount };
  }

  public async pushToServer(): Promise<number> {
    const pendingItems = await db.syncQueue
      .where("status")
      .equals("PENDING")
      .or("status")
      .equals("FAILED")
      .toArray();

    const eligibleItems = pendingItems.filter((i) => i.retry_count < this.maxRetries);
    if (eligibleItems.length === 0) return 0;

    // Montar payload em lote agrupado
    const operations = eligibleItems.map((item) => ({
      client_mutation_id: item.client_mutation_id,
      entity: item.entity,
      entity_id: typeof item.entity_id === "number" ? item.entity_id : undefined,
      operation: item.operation,
      client_timestamp: item.created_at,
      payload: item.payload,
    }));

    try {
      const response = await apiClient.post("/api/v1/sync/push", {
        company_id: 1,
        device_id: "CLIENT-WEB-APP",
        operations,
      });

      const results: { client_mutation_id: string; status: string; server_entity_id?: number }[] =
        response.data.results || [];

      for (const res of results) {
        const item = eligibleItems.find((i) => i.client_mutation_id === res.client_mutation_id);
        if (item && item.id) {
          if (res.status === "APPLIED" || res.status === "DUPLICATE_SKIPPED") {
            await db.syncQueue.update(item.id, {
              status: "COMPLETED",
              updated_at: new Date().toISOString(),
            });
          } else {
            await db.syncQueue.update(item.id, {
              status: "FAILED",
              retry_count: item.retry_count + 1,
              error_message: res.status,
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      return results.length;
    } catch (err: any) {
      // Aplicar backoff incremental aos itens
      for (const item of eligibleItems) {
        if (item.id) {
          await db.syncQueue.update(item.id, {
            status: "FAILED",
            retry_count: item.retry_count + 1,
            error_message: err.message,
            updated_at: new Date().toISOString(),
          });
        }
      }
      throw err;
    }
  }

  public async pullFromServer(): Promise<void> {
    const meta = await db.syncMeta.get("last_sync_timestamp");
    const lastSync = meta ? meta.value : undefined;

    const url = lastSync
      ? `/api/v1/sync/pull?company_id=1&last_sync_timestamp=${encodeURIComponent(lastSync)}`
      : "/api/v1/sync/pull?company_id=1";

    const response = await apiClient.get(url);
    const changes: { entity: string; entity_id: number; operation: string; data: any }[] =
      response.data.changes || [];

    for (const change of changes) {
      if (change.entity === "Product") {
        await db.products.put(change.data);
      } else if (change.entity === "Customer") {
        await db.customers.put(change.data);
      }
    }
  }

  public async refreshPendingCount(): Promise<number> {
    const count = await db.syncQueue
      .where("status")
      .equals("PENDING")
      .or("status")
      .equals("FAILED")
      .and((item) => item.retry_count < this.maxRetries)
      .count();

    useSyncStore.getState().setPendingCount(count);
    return count;
  }

  public async getQueueStatus(): Promise<SyncQueueItem[]> {
    return db.syncQueue.toArray();
  }

  public async clearQueue(): Promise<void> {
    await db.syncQueue.clear();
    await this.refreshPendingCount();
    useSyncStore.getState().addLog("Fila de sincronização limpa manualmente.", "info");
  }
}

export const syncEngine = SyncEngine.getInstance();
