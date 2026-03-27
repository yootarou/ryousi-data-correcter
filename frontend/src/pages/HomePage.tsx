import { Link } from 'react-router-dom';
import { useFishingRecords, useMonthlyStats, useTodayRecord } from '@/hooks/useFishingRecords';
import { formatDate } from '@/utils/formatters';

const HomePage = () => {
  const { records, isLoading: recordsLoading } = useFishingRecords();
  const { stats, isLoading: statsLoading } = useMonthlyStats();
  const { record: todayRecord } = useTodayRecord();

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ja-JP').format(n);

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      {/* Today's operation card */}
      <div className="card">
        <h2 className="text-gray-700 mb-1">今日の操業</h2>
        {todayRecord ? (
          <div className="space-y-2">
            <p className="text-sm text-sea-600 font-medium">
              操業中 - {todayRecord.vessel_name}
            </p>
            <p className="text-xs text-gray-400">
              出港: {todayRecord.departure.fishing_start_time}
            </p>
            <div className="flex gap-2">
              <Link
                to={`/deployment/${todayRecord.id}`}
                className="flex-1 inline-flex items-center justify-center py-3 px-4 bg-ocean-100 text-ocean-700 rounded-xl font-semibold text-sm min-h-[44px] transition-colors duration-150"
              >
                投縄記録を追加
              </Link>
              <Link
                to={`/route/${todayRecord.id}`}
                className="inline-flex items-center justify-center py-3 px-4 bg-sea-100 text-sea-700 rounded-xl font-semibold text-sm min-h-[44px] transition-colors duration-150"
              >
                航路
              </Link>
            </div>
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
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-400">まだ記録がありません</p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
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
