import { db } from './FishingDB';
import type { SyncQueueItem } from '@/types';

export const syncQueueRepo = {
  async add(item: Omit<SyncQueueItem, 'id'>): Promise<number> {
    return await db.sync_queue.add(item as SyncQueueItem);
  },

  async getPending(): Promise<SyncQueueItem[]> {
    return await db.sync_queue.where('status').equals('pending').sortBy('priority');
  },

  async markProcessing(id: number): Promise<number> {
    return await db.sync_queue.update(id, { status: 'processing' });
  },

  async remove(id: number): Promise<void> {
    return await db.sync_queue.delete(id);
  },

  async incrementRetry(id: number): Promise<void> {
    const item = await db.sync_queue.get(id);
    if (item) {
      await db.sync_queue.update(id, {
        retry_count: item.retry_count + 1,
        status: 'pending',
      });
    }
  },

  async clear(): Promise<void> {
    await db.sync_queue.clear();
  },
};
