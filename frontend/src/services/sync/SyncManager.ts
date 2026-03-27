import { syncQueueRepo } from '@/services/db/syncQueue';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { syncAPI } from '@/services/api/syncAPI';
import type { SyncQueueItem } from '@/types';

export type SyncState = 'idle' | 'syncing' | 'error';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

type SyncListener = (state: SyncState, progress: SyncProgress) => void;

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // exponential backoff

export class SyncManager {
  private isRunning = false;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null;
  private state: SyncState = 'idle';
  private progress: SyncProgress = { total: 0, completed: 0, failed: 0 };

  /** Register a listener for sync state changes */
  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.state, this.progress);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.state, this.progress);
    }
  }

  private setState(state: SyncState) {
    this.state = state;
    this.notify();
  }

  private setProgress(progress: Partial<SyncProgress>) {
    this.progress = { ...this.progress, ...progress };
    this.notify();
  }

  /** Start a sync cycle */
  async startSync(): Promise<SyncResult> {
    if (this.isRunning || !navigator.onLine) {
      return { success: false, synced: 0, failed: 0, errors: ['Sync already running or offline'] };
    }

    this.isRunning = true;
    this.setState('syncing');

    const errors: string[] = [];
    let synced = 0;
    let failed = 0;

    try {
      // 1. Get pending items from queue
      const pendingItems = await syncQueueRepo.getPending();

      if (pendingItems.length === 0) {
        this.setProgress({ total: 0, completed: 0, failed: 0 });
        this.setState('idle');
        this.isRunning = false;
        return { success: true, synced: 0, failed: 0, errors: [] };
      }

      // 2. Sort by priority (lower number = higher priority)
      const sorted = this.sortByPriority(pendingItems);

      this.setProgress({ total: sorted.length, completed: 0, failed: 0 });

      // 3. Process each item sequentially
      for (const item of sorted) {
        try {
          await this.syncItem(item);
          synced++;
          this.setProgress({ completed: synced });
        } catch (error) {
          failed++;
          const msg = error instanceof Error ? error.message : String(error);
          errors.push(`${item.type} (id:${item.id}): ${msg}`);
          this.setProgress({ failed });
        }
      }

      // 4. Fetch latest data from server
      await this.fetchLatestData();

      this.setState(failed > 0 ? 'error' : 'idle');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(`Sync cycle error: ${msg}`);
      this.setState('error');
    } finally {
      this.isRunning = false;
    }

    return { success: failed === 0, synced, failed, errors };
  }

  /** Sync a single queue item */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Skip items that exceeded max retries
    if (item.retry_count >= MAX_RETRIES) {
      await this.markFailed(item);
      throw new Error(`Max retries exceeded for ${item.type}`);
    }

    // Mark as processing
    if (item.id) {
      await syncQueueRepo.markProcessing(item.id);
    }

    try {
      // Upload to server
      await syncAPI.upload(item.type, item.payload);

      // Remove from queue on success
      if (item.id) {
        await syncQueueRepo.remove(item.id);
      }

      // Update local record sync status
      await this.updateLocalSyncStatus(item, 'synced');
    } catch (error) {
      // Increment retry count
      if (item.id) {
        await syncQueueRepo.incrementRetry(item.id);
      }

      // Wait before next item (backoff)
      const delay = RETRY_DELAYS[Math.min(item.retry_count, RETRY_DELAYS.length - 1)];
      await new Promise((resolve) => setTimeout(resolve, delay));

      throw error;
    }
  }

  /** Mark an item as permanently failed */
  private async markFailed(item: SyncQueueItem): Promise<void> {
    if (item.id) {
      await syncQueueRepo.remove(item.id);
    }
    await this.updateLocalSyncStatus(item, 'error');
  }

  /** Update the sync_status on the local record */
  private async updateLocalSyncStatus(
    item: SyncQueueItem,
    status: 'synced' | 'error',
  ): Promise<void> {
    const payload = item.payload as { id?: string; record_id?: string; deployment_id?: string };

    if (item.type === 'fishing_record' && payload.id) {
      await fishingRecordsRepo.update(payload.id, { sync_status: status });
    }
    // deployment and retrieval sync status updates can be added
    // when those repos support sync_status updates
  }

  /** Fetch latest data from cloud (pull sync) */
  private async fetchLatestData(): Promise<void> {
    try {
      const lastSync = localStorage.getItem('last_sync_at') || '1970-01-01T00:00:00Z';
      await syncAPI.fetchLatest(lastSync);
      localStorage.setItem('last_sync_at', new Date().toISOString());
    } catch {
      // Pull sync failure is non-critical; push sync already succeeded
      console.warn('Failed to fetch latest data from server');
    }
  }

  private sortByPriority(items: SyncQueueItem[]): SyncQueueItem[] {
    return [...items].sort((a, b) => a.priority - b.priority);
  }

  /** Enqueue a record for sync */
  async enqueue(
    type: SyncQueueItem['type'],
    payload: unknown,
    priority: number = 5,
  ): Promise<void> {
    await syncQueueRepo.add({
      type,
      payload,
      priority,
      created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    });

    // Auto-sync if online
    if (navigator.onLine && !this.isRunning) {
      // Debounce: wait a moment for potential batch saves
      setTimeout(() => this.startSync(), 500);
    }
  }

  /** Start auto-sync on interval (e.g., every 5 minutes) */
  startAutoSync(intervalMs: number = 5 * 60 * 1000): void {
    this.stopAutoSync();

    // Listen for online events
    window.addEventListener('online', this.handleOnline);

    this.autoSyncInterval = setInterval(() => {
      if (navigator.onLine && !this.isRunning) {
        this.startSync();
      }
    }, intervalMs);
  }

  /** Stop auto-sync */
  stopAutoSync(): void {
    window.removeEventListener('online', this.handleOnline);
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  /** Trigger sync when coming back online */
  private handleOnline = (): void => {
    if (!this.isRunning) {
      this.startSync();
    }
  };

  /** Get count of pending sync items */
  async getPendingCount(): Promise<number> {
    const items = await syncQueueRepo.getPending();
    return items.length;
  }

  /** Clear all pending sync items */
  async clearQueue(): Promise<void> {
    await syncQueueRepo.clear();
    this.setProgress({ total: 0, completed: 0, failed: 0 });
    this.setState('idle');
  }

  /** Get current state */
  getState(): SyncState {
    return this.state;
  }

  /** Get current progress */
  getProgress(): SyncProgress {
    return this.progress;
  }
}

// Singleton instance
export const syncManager = new SyncManager();
