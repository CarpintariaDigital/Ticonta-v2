import { create } from 'zustand';

interface SyncState {
  isOnline: boolean;
  dbType: 'IndexedDB (Offline-First)' | 'PostgreSQL (Cloud Direct)';
  pendingSyncCount: number;
  lastSyncTime: string;
  batteryLevel: number;
  isCharging: boolean;
  storageUsageMb: number;
  setOnlineStatus: (status: boolean) => void;
  incrementPending: () => void;
  triggerSync: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  dbType: 'IndexedDB (Offline-First)',
  pendingSyncCount: 3,
  lastSyncTime: 'Agora mesmo',
  batteryLevel: 94,
  isCharging: true,
  storageUsageMb: 14.8,
  setOnlineStatus: (status: boolean) => set({ isOnline: status }),
  incrementPending: () =>
    set((state) => ({ pendingSyncCount: state.pendingSyncCount + 1 })),
  triggerSync: () =>
    set({
      pendingSyncCount: 0,
      lastSyncTime: new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
    }),
}));
