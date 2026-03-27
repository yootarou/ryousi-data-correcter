import { useState, useEffect, useCallback, useRef } from 'react';
import { syncManager, type SyncState, type SyncProgress } from '@/services/sync/SyncManager';

export type { SyncState, SyncProgress };

export const useSync = () => {
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [progress, setProgress] = useState<SyncProgress>({ total: 0, completed: 0, failed: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const initialized = useRef(false);

  // Subscribe to SyncManager state changes
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state, prog) => {
      setSyncState(state);
      setProgress(prog);
    });

    return unsubscribe;
  }, []);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Start auto-sync on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      syncManager.startAutoSync();
      refreshPendingCount();
    }

    return () => {
      syncManager.stopAutoSync();
    };
  }, []);

  const refreshPendingCount = useCallback(async () => {
    const count = await syncManager.getPendingCount();
    setPendingCount(count);
  }, []);

  const startSync = useCallback(async () => {
    const result = await syncManager.startSync();
    await refreshPendingCount();
    return result;
  }, [refreshPendingCount]);

  const clearQueue = useCallback(async () => {
    await syncManager.clearQueue();
    setPendingCount(0);
  }, []);

  return {
    syncState,
    progress,
    pendingCount,
    isOnline,
    startSync,
    clearQueue,
    refreshPendingCount,
  };
};
