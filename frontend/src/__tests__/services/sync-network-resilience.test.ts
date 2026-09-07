import { describe, it, expect, vi, beforeEach } from "vitest";
import { syncEngine } from "@/services/sync-engine";
import { useSyncStore } from "@/store/sync.store";
import { db } from "@/services/db";
import { apiClient } from "@/services/auth";

describe("TiConta v2 — Network Cut & Resume Resilience (Cloudflare D1 Outbox)", () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
    useSyncStore.getState().setIsOnline(true);
    useSyncStore.getState().setPendingCount(0);
    vi.clearAllMocks();
  });

  it("queues sales transaction locally in Dexie when offline without throwing", async () => {
    // 1. Simular corte de rede
    useSyncStore.getState().setIsOnline(false);

    const salePayload = {
      total: 3500.0,
      currency: "MZN",
      items: [{ id: 1, name: "Licença TiConta PME", price: 3500.0, vat_rate: 0.16 }],
      client_id: "POS-TERMINAL-01",
    };

    const mutationId = await syncEngine.queueOperation(
      "sales",
      "CREATE",
      "/api/v1/sync/push",
      salePayload
    );

    expect(mutationId).toBeDefined();
    expect(mutationId.startsWith("mut_")).toBe(true);

    const pendingCount = await syncEngine.refreshPendingCount();
    expect(pendingCount).toBe(1);

    const queuedItems = await db.syncQueue.toArray();
    expect(queuedItems.length).toBe(1);
    expect(queuedItems[0].status).toBe("PENDING");
    expect(queuedItems[0].payload.total).toBe(3500.0);
  });

  it("automatically resumes and pushes queued operations to D1 upon network reconnection", async () => {
    // 1. Inserir operação offline na fila do Dexie
    await db.syncQueue.add({
      client_mutation_id: "mut_test_offline_123",
      entity: "sales",
      operation: "CREATE",
      endpoint: "/api/v1/sync/push",
      payload: { invoice_number: "FT 2026/001", total: 1160.0, vat: 160.0 },
      retry_count: 0,
      status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await syncEngine.refreshPendingCount();
    expect(useSyncStore.getState().pendingCount).toBe(1);

    // 2. Mock da API de Sincronização Cloudflare D1
    vi.spyOn(apiClient, "get").mockResolvedValue({ data: { status: "ok" } });
    vi.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        success: true,
        processed: 1,
        results: [{ client_mutation_id: "mut_test_offline_123", status: "APPLIED" }],
      },
    });

    // 3. Simular retoma de rede
    useSyncStore.getState().setIsOnline(true);
    const syncResult = await syncEngine.sync();

    expect(syncResult.success).toBe(true);
    expect(syncResult.processed).toBe(1);

    // 4. Verificar que a fila foi atualizada para COMPLETED
    const item = await db.syncQueue.where("client_mutation_id").equals("mut_test_offline_123").first();
    expect(item?.status).toBe("COMPLETED");

    const remainingPending = await syncEngine.refreshPendingCount();
    expect(remainingPending).toBe(0);
  });
});
