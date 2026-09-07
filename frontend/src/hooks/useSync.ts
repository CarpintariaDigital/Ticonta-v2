import { useEffect } from "react";
import { syncEngine } from "@/services/sync-engine";
import { useSyncStore } from "@/store/sync.store";

export function useSync() {
  const isOnline = useSyncStore((s) => s.isOnline);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const lastSyncTimestamp = useSyncStore((s) => s.lastSyncTimestamp);
  const lastError = useSyncStore((s) => s.lastError);
  const recentLogs = useSyncStore((s) => s.recentLogs);

  useEffect(() => {
    // Sincronizar ao carregar o hook e checar fila
    syncEngine.refreshPendingCount();
  }, []);

  const syncNow = async () => {
    return syncEngine.sync();
  };

  const queueOperation = async (
    entity: string,
    operation: "CREATE" | "UPDATE" | "DELETE",
    endpoint: string,
    payload: any,
    entityId?: number | string
  ) => {
    return syncEngine.queueOperation(entity, operation, endpoint, payload, entityId);
  };

  const clearQueue = async () => {
    return syncEngine.clearQueue();
  };

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTimestamp,
    lastError,
    recentLogs,
    syncNow,
    queueOperation,
    clearQueue,
  };
}
