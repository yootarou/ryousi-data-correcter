import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFishingRecords, useMonthlyStats, useTodayRecord } from '@/hooks/useFishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { formatDate } from '@/utils/formatters';

const HomePage = () => {
  const { records, isLoading: recordsLoading } = useFishingRecords();
  const { stats, isLoading: statsLoading } = useMonthlyStats();
  const { record: todayRecord, isLoading: todayLoading } = useTodayRecord();
  const [deploymentCount, setDeploymentCount] = useState<number | null>(null);

  useEffect(() => {
    if (!todayRecord) {
      setDeploymentCount(null);
      return;
    }
    let cancelled = false;
    deploymentsRepo.getByRecordId(todayRecord.id).then((list) => {
      if (!cancelled) setDeploymentCount(list.length);
    });
    return () => {
      cancelled = true;
    };
  }, [todayRecord]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ja-JP').format(n);
  const recentRecords = records.filter((record, index, all) => {
    if (record.return) return true;
    return !all.slice(0, index).some((item) => !item.return && item.date === record.date);
  });

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      {/* Today's operation card */}
      <div className="card">
        <h2 className="text-gray-700 mb-3">今日の操業</h2>
        {todayLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
          </div>
        ) : todayRecord ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-sea-600">
                {todayRecord.return ? '本日の記録（帰港済み）' : '操業中'}
              </p>
              <span className="text-xs text-gray-500">{formatDate(todayRecord.date)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">船名</p>
                <p className="text-sm font-medium text-gray-900">{todayRecord.vessel_name}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">出港時刻</p>
                <p className="text-sm font-medium text-gray-900">
                  {todayRecord.departure.fishing_start_time}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 col-span-2">
                <p className="text-xs text-gray-500">出港地</p>
                <p className="text-sm font-medium text-gray-900">
                  {todayRecord.departure.departure_port}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 col-span-2">
                <p className="text-xs text-gray-500">漁場・魚種</p>
                <p className="text-sm font-medium text-gray-900">
                  {todayRecord.departure.target_area} —{' '}
                  {todayRecord.departure.target_species.join('、')}
                </p>
              </div>
              {!todayRecord.return && (
                <div className="rounded-lg bg-ocean-50 p-3 col-span-2">
                  <p className="text-xs text-ocean-600">今日の投縄回数</p>
                  <p className="text-lg font-bold text-ocean-800">
                    {deploymentCount === null ? '…' : deploymentCount}
                    <span className="text-sm font-normal text-ocean-600 ml-1">回</span>
                  </p>
                </div>
              )}
            </div>

            {todayRecord.return && (
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 p-3 bg-white">
                <div>
                  <p className="text-xs text-gray-500">漁獲量</p>
                  <p className="text-base font-semibold text-gray-900">
                    {todayRecord.return.total_catch_kg.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">売上</p>
                  <p className="text-base font-semibold text-sea-600">
                    ¥{formatCurrency(todayRecord.return.total_revenue)}
                  </p>
                </div>
              </div>
            )}

            {!todayRecord.return && (
              <Link
                to="/departure"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white rounded-xl font-semibold text-base min-h-[44px] transition-colors duration-150 shadow-sm"
              >
                操業画面を開く
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-3">記録がありません</p>
            <Link
              to="/departure"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white rounded-xl font-semibold text-base min-h-[44px] transition-colors duration-150 shadow-sm"
            >
              新しい漁を開始
            </Link>
          </>
        )}
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">今月の出漁日数</p>
          <p className="text-2xl font-bold text-gray-800">
            {statsLoading ? '-' : stats.fishingDays}
            <span className="text-sm font-normal text-gray-400 ml-0.5">日</span>
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">今月の漁獲量</p>
          <p className="text-2xl font-bold text-gray-800">
            {statsLoading ? '-' : stats.totalCatchKg.toFixed(1)}
            <span className="text-sm font-normal text-gray-400 ml-0.5">kg</span>
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">今月の売上</p>
          <p className="text-2xl font-bold text-sea-600">
            ¥{statsLoading ? '-' : formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">今月のROI</p>
          <p className="text-2xl font-bold text-gray-800">
            {statsLoading ? '-' : stats.roi !== null ? stats.roi : '-'}
            <span className="text-sm font-normal text-gray-400 ml-0.5">%</span>
          </p>
        </div>
      </div>

      {/* Recent records */}
      <div className="card">
        <h2 className="text-gray-700 mb-2">最近の記録</h2>
        {recordsLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
          </div>
        ) : recentRecords.length === 0 ? (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {formatDate(record.date)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {record.vessel_name} - {record.departure.target_species.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  {record.return ? (
                    <>
                      <p className="text-sm font-semibold text-sea-600">
                        ¥{formatCurrency(record.return.total_revenue)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.return.total_catch_kg.toFixed(1)}kg
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-ocean-500 font-medium">操業中</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
