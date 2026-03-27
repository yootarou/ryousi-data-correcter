import { useState, useCallback, useEffect } from 'react';
import { useSync } from '@/hooks/useSync';
import { useBattery } from '@/hooks/useBattery';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { Button } from '@/components/common/Button';

const SettingsPage = () => {
  const { syncState, progress, pendingCount, isOnline, startSync, clearQueue, refreshPendingCount } = useSync();
  const battery = useBattery();
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [recordCount, setRecordCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const count = await fishingRecordsRepo.count();
      setRecordCount(count);
      await refreshPendingCount();
    })();
  }, [refreshPendingCount]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const records = await fishingRecordsRepo.getAll();
      const allDeployments = [];
      for (const record of records) {
        const deps = await deploymentsRepo.getByRecordId(record.id);
        allDeployments.push(...deps);
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '0.1.0',
        records,
        deployments: allDeployments,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fishing-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleClearSyncQueue = useCallback(async () => {
    await clearQueue();
  }, [clearQueue]);

  const handleManualSync = useCallback(async () => {
    await startSync();
  }, [startSync]);

  const syncStateLabel = syncState === 'syncing'
    ? `同期中... (${progress.completed}/${progress.total})`
    : syncState === 'error'
      ? `エラー (${progress.failed}件失敗)`
      : '待機中';

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1>設定</h1>

      {/* Sync Status */}
      <div className="card">
        <h2 className="text-gray-700 mb-3">同期状態</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  isOnline ? 'bg-sea-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-600">
                {isOnline ? 'オンライン' : 'オフライン'}
              </span>
            </div>
            <span className="text-xs text-gray-400">{syncStateLabel}</span>
          </div>

          {/* Sync progress bar */}
          {syncState === 'syncing' && progress.total > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sea-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((progress.completed / progress.total) * 100)}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">未同期データ</span>
            <span className="font-medium text-gray-700">{pendingCount}件</span>
          </div>

          <div className="flex gap-2">
            {isOnline && pendingCount > 0 && syncState !== 'syncing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
              >
                今すぐ同期
              </Button>
            )}
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleClearSyncQueue}
                className="text-sm text-red-500 hover:text-red-600"
              >
                キューをクリア
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="card">
        <h2 className="text-gray-700 mb-3">デバイス情報</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">バッテリー</span>
            <span className="font-medium text-gray-700">
              {battery.supported
                ? `${Math.round(battery.level * 100)}%${battery.charging ? ' (充電中)' : ''}`
                : '取得不可'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">ストレージ</span>
            <span className="font-medium text-gray-700">
              {recordCount !== null ? `${recordCount}件の記録` : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-gray-700 mb-3">データ管理</h2>
        <div className="space-y-3">
          <Button
            variant="outline"
            size="md"
            fullWidth
            loading={isExporting}
            onClick={handleExport}
          >
            データをエクスポート（JSON）
          </Button>
          {exportSuccess && (
            <p className="text-sm text-sea-600 text-center">
              エクスポートが完了しました
            </p>
          )}
        </div>
      </div>

      {/* Install PWA */}
      {isInstallable && !isInstalled && (
        <div className="card">
          <h2 className="text-gray-700 mb-3">アプリをインストール</h2>
          <p className="text-sm text-gray-500 mb-3">
            ホーム画面に追加すると、オフラインでも素早くアクセスできます。
          </p>
          <Button variant="primary" size="md" fullWidth onClick={promptInstall}>
            ホーム画面に追加
          </Button>
        </div>
      )}
      {isInstalled && (
        <div className="card">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-sea-500" />
            <span className="text-sm text-gray-600">アプリとしてインストール済み</span>
          </div>
        </div>
      )}

      {/* App Info */}
      <div className="card">
        <h2 className="text-gray-700 mb-3">アプリ情報</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">アプリ名</span>
            <span className="font-medium text-gray-700">Smart Fishing</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">バージョン</span>
            <span className="font-medium text-gray-700">v0.1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">タイプ</span>
            <span className="font-medium text-gray-700">PWA（オフライン対応）</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
