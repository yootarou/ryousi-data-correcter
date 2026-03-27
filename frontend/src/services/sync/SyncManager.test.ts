import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncManager } from './SyncManager';

// Mock dependencies
vi.mock('@/services/db/syncQueue', () => ({
  syncQueueRepo: {
    getPending: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue(1),
    markProcessing: vi.fn().mockResolvedValue(1),
    remove: vi.fn().mockResolvedValue(undefined),
    incrementRetry: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/db/fishingRecords', () => ({
  fishingRecordsRepo: {
    update: vi.fn().mockResolvedValue(1),
  },
}));

vi.mock('@/services/api/syncAPI', () => ({
  syncAPI: {
    upload: vi.fn().mockResolvedValue({ success: true, id: 'test', message: 'ok' }),
    fetchLatest: vi.fn().mockResolvedValue({ records: [], deployments: [], retrievals: [], synced_at: '' }),
  },
}));

describe('SyncManager', () => {
  let manager: SyncManager;

  beforeEach(() => {
    manager = new SyncManager();
    vi.clearAllMocks();
  });

  it('starts in idle state', () => {
    expect(manager.getState()).toBe('idle');
  });

  it('has empty progress initially', () => {
    const progress = manager.getProgress();
    expect(progress.total).toBe(0);
    expect(progress.completed).toBe(0);
    expect(progress.failed).toBe(0);
  });

  it('returns success when queue is empty', async () => {
    const result = await manager.startSync();
    expect(result.success).toBe(true);
    expect(result.synced).toBe(0);
  });

  it('does not sync when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    const result = await manager.startSync();
    expect(result.success).toBe(false);
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  it('subscribe/unsubscribe works', () => {
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);
    // Immediately called on subscribe
    expect(listener).toHaveBeenCalledWith('idle', expect.any(Object));
    unsubscribe();
  });

  it('enqueue adds item to sync queue', async () => {
    const { syncQueueRepo } = await import('@/services/db/syncQueue');
    await manager.enqueue('fishing_record', { id: 'test' }, 1);
    expect(syncQueueRepo.add).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fishing_record',
        payload: { id: 'test' },
        priority: 1,
        status: 'pending',
        retry_count: 0,
      }),
    );
  });

  it('clearQueue resets state', async () => {
    await manager.clearQueue();
    expect(manager.getState()).toBe('idle');
    expect(manager.getProgress().total).toBe(0);
  });

  it('getPendingCount returns count', async () => {
    const count = await manager.getPendingCount();
    expect(count).toBe(0);
  });
});
