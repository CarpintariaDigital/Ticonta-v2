import { db, SyncQueueItem } from './db';
import { useSyncStore } from '../store/sync.store';
import { apiClient } from './auth';

export class SyncEngine {
  async queueOperation(
    entity: string,
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    endpoint: string,
    payload: any
  ): Promise<string> {
    const mutationId = `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const item: SyncQueueItem = {
      client_mutation_id: mutationId,
      entity,
      operation,
      endpoint,
      payload,
      retry_count: 0,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db.syncQueue.add(item);
    await this.refreshPendingCount();
    return mutationId;
  }

  async refreshPendingCount(): Promise<number> {
    const count = await db.syncQueue.where('status').equals('PENDING').count();
    useSyncStore.getState().setPendingCount(count);
    return count;
  }

  async getQueueSize(): Promise<number> {
    return this.refreshPendingCount();
  }

  async sync(): Promise<{ success: boolean; processed: number }> {
    const isOnline = useSyncStore.getState().isOnline;
    if (!isOnline) {
      return { success: false, processed: 0 };
    }

    useSyncStore.getState().setIsSyncing(true);
    try {
      const pending = await db.syncQueue.where('status').equals('PENDING').toArray();
      if (pending.length === 0) {
        useSyncStore.getState().setIsSyncing(false);
        useSyncStore.getState().setLastSyncAt(new Date());
        return { success: true, processed: 0 };
      }

      const res = await apiClient.post('/api/v1/sync/push', { mutations: pending });
      const processedCount = res.data?.processed ?? pending.length;
      const results = res.data?.results;

      if (results && Array.isArray(results)) {
        for (const r of results) {
          if (r.status === 'APPLIED') {
            await db.syncQueue
              .where('client_mutation_id')
              .equals(r.client_mutation_id)
              .modify({ status: 'COMPLETED', updated_at: new Date().toISOString() });
          }
        }
      } else {
        for (const item of pending) {
          if (item.id) {
            await db.syncQueue.update(item.id, {
              status: 'COMPLETED',
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      await this.refreshPendingCount();
      useSyncStore.getState().setIsSyncing(false);
      useSyncStore.getState().setLastSyncAt(new Date());
      return { success: true, processed: processedCount };
    } catch (err: any) {
      useSyncStore.getState().setIsSyncing(false);
      useSyncStore.getState().setError(err.message);
      return { success: false, processed: 0 };
    }
  }

  async flush(): Promise<void> {
    await this.sync();
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      await apiClient.get('/api/v1/health');
      useSyncStore.getState().setIsOnline(true);
      return true;
    } catch {
      useSyncStore.getState().setIsOnline(false);
      return false;
    }
  }

  onOnline(): void {
    useSyncStore.getState().setIsOnline(true);
    this.sync();
  }

  onOffline(): void {
    useSyncStore.getState().setIsOnline(false);
  }
}

export const syncEngine = new SyncEngine();
