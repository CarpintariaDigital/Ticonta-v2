import { create } from 'zustand';

export interface SyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;

  setIsOnline: (status: boolean) => void;
  setPendingCount: (count: number) => void;
  setIsSyncing: (status: boolean) => void;
  setLastSyncAt: (date: Date | null) => void;
  setError: (error: string | null) => void;
  syncNow: () => Promise<void>;
  updateQueueSize: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount: 0,
  isSyncing: false,
  lastSyncAt: null,
  error: null,

  setIsOnline: (status) => set({ isOnline: status }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setIsSyncing: (status) => set({ isSyncing: status }),
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
  setError: (error) => set({ error }),
  syncNow: async () => {
    set({ isSyncing: true, error: null });
    try {
      set({ isSyncing: false, lastSyncAt: new Date() });
    } catch (err: any) {
      set({ isSyncing: false, error: err.message || 'Erro ao sincronizar' });
    }
  },
  updateQueueSize: () => {
    // Pode ser chamado pelo sync engine
  },
}));
