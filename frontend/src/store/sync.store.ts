import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SyncQueueItem } from "@/services/db";

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTimestamp: string | null;
  lastError: string | null;
  recentLogs: { id: string; message: string; timestamp: string; status: "success" | "error" | "info" }[];

  setIsOnline: (online: boolean) => void;
  setIsSyncing: (syncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncTimestamp: (timestamp: string) => void;
  setLastError: (error: string | null) => void;
  addLog: (message: string, status: "success" | "error" | "info") => void;
  clearLogs: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      isSyncing: false,
      pendingCount: 0,
      lastSyncTimestamp: null,
      lastError: null,
      recentLogs: [],

      setIsOnline: (isOnline) => set({ isOnline }),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
      setPendingCount: (pendingCount) => set({ pendingCount }),
      setLastSyncTimestamp: (lastSyncTimestamp) => set({ lastSyncTimestamp }),
      setLastError: (lastError) => set({ lastError }),
      addLog: (message, status) =>
        set((state) => ({
          recentLogs: [
            {
              id: Math.random().toString(36).substring(2, 9),
              message,
              status,
              timestamp: new Date().toLocaleTimeString("pt-MZ"),
            },
            ...state.recentLogs.slice(0, 19),
          ],
        })),
      clearLogs: () => set({ recentLogs: [] }),
    }),
    {
      name: "ticonta-sync-store",
    }
  )
);
