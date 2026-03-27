import { useState, useEffect, useCallback, useMemo } from 'react';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';
import { routePointsRepo } from '@/services/db/routePoints';
import { formatDate } from '@/utils/formatters';
import { formatDuration, calculateDwellTime } from '@/services/calculations/duration';
import type { FishingRecord } from '@/types';
import type { Deployment } from '@/types/deployment.types';

const SPECIES_LIST = ['マグロ', 'カツオ', 'ブリ', 'タイ', 'ヒラメ', 'イカ', 'サバ', 'アジ'];

const HistoryPage = () => {
  const [records, setRecords] = useState<FishingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<FishingRecord | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await fishingRecordsRepo.getAll();
      setRecords(all);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const matchVessel = r.vessel_name.toLowerCase().includes(q);
        const matchPort = r.departure.departure_port.toLowerCase().includes(q);
        const matchArea = r.departure.target_area.toLowerCase().includes(q);
        if (!matchVessel && !matchPort && !matchArea) return false;
      }
      if (filterSpecies) {
        if (!r.departure.target_species.includes(filterSpecies)) return false;
      }
      if (filterMonth) {
        if (!r.date.startsWith(filterMonth)) return false;
      }
      return true;
    });
  }, [records, search, filterSpecies, filterMonth]);

  const openDetail = useCallback(async (record: FishingRecord) => {
    setSelectedRecord(record);
    const deps = await deploymentsRepo.getByRecordId(record.id);
    setDeployments(deps);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedRecord(null);
    setDeployments([]);
  }, []);

  const deleteRecord = useCallback(async (record: FishingRecord) => {
    if (!window.confirm(`${formatDate(record.date)}の記録を削除しますか？\nこの操作は元に戻せません。`)) {
      return;
    }

    // Delete related data
    const deps = await deploymentsRepo.getByRecordId(record.id);
    for (const dep of deps) {
      const retrieval = await retrievalsRepo.getByDeploymentId(dep.id);
      if (retrieval) {
        await retrievalsRepo.delete(retrieval.id);
      }
    }
    for (const dep of deps) {
      await deploymentsRepo.delete(dep.id);
    }
    await routePointsRepo.deleteByRecordId(record.id);
    await fishingRecordsRepo.delete(record.id);

    // Refresh list and close modal
    closeDetail();
    await loadRecords();
  }, [closeDetail, loadRecords]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('ja-JP').format(n);

  return (
    <div className="p-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      <h1 className="mb-4">過去の記録</h1>

      {/* Search & Filters */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="船名・港・漁場で検索..."
            className="w-full pl-10 pr-3 py-2.5 text-base rounded-lg border border-gray-300 bg-white min-h-[44px] focus:outline-ocean-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white min-h-[40px]"
          >
            <option value="">全魚種</option>
            {SPECIES_LIST.map((sp) => (
              <option key={sp} value={sp}>{sp}</option>
            ))}
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white min-h-[40px]"
          />
        </div>
        {(search || filterSpecies || filterMonth) && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {filteredRecords.length}件の記録
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterSpecies('');
                setFilterMonth('');
              }}
              className="text-sm text-ocean-600 font-medium"
            >
              フィルター解除
            </button>
          </div>
        )}
      </div>

      {/* Record List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-400">
            {records.length === 0 ? 'まだ記録がありません' : '条件に一致する記録がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => openDetail(record)}
              className="w-full card text-left transition-shadow hover:shadow-md active:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(record.date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {record.vessel_name} - {record.departure.departure_port}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {record.departure.target_species.map((sp) => (
                      <span
                        key={sp}
                        className="inline-block px-2 py-0.5 text-xs bg-ocean-50 text-ocean-600 rounded-full"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  {record.return ? (
                    <>
                      <p className="text-sm font-bold text-sea-600">
                        ¥{formatCurrency(record.return.total_revenue)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.return.total_catch_kg.toFixed(1)}kg
                      </p>
                    </>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs bg-ocean-50 text-ocean-600 rounded-full font-medium">
                      操業中
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={closeDetail}
        >
          <div
            className="w-full max-w-[var(--max-content-width)] bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-fade-in safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-4 pb-20 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {formatDate(selectedRecord.date)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedRecord.vessel_name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetail}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Departure Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">出航情報</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">出港時刻</p>
                    <p className="font-medium">{selectedRecord.departure.fishing_start_time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">出港地</p>
                    <p className="font-medium">{selectedRecord.departure.departure_port}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">天候</p>
                    <p className="font-medium">{selectedRecord.departure.weather}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">漁場</p>
                    <p className="font-medium">{selectedRecord.departure.target_area || '-'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-1">対象魚種</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRecord.departure.target_species.map((sp) => (
                      <span key={sp} className="px-2 py-0.5 text-xs bg-ocean-100 text-ocean-700 rounded-full">
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400 mb-1">乗組員</p>
                  <p className="text-sm">{selectedRecord.departure.crew.join('、')}</p>
                </div>
              </div>

              {/* Deployments */}
              {deployments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">
                    投縄記録（{deployments.length}回）
                  </h3>
                  {deployments.map((dep) => (
                    <div key={dep.id} className="bg-gray-50 rounded-lg p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">第{dep.line_number}投</span>
                        <span className="text-gray-400">{dep.deployment_time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        餌: {dep.bait_type} / 水深: {dep.depth}m / 針数: {dep.hook_count}本
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Return Info */}
              {selectedRecord.return && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">帰港情報</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">帰港時刻</p>
                      <p className="font-medium">{selectedRecord.return.fishing_end_time}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">操業時間</p>
                      <p className="font-medium">
                        {formatDuration(
                          calculateDwellTime(
                            selectedRecord.departure.fishing_start_time,
                            selectedRecord.return.fishing_end_time,
                          ),
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Revenue Summary */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-sea-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">漁獲量</p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedRecord.return.total_catch_kg.toFixed(1)}kg
                      </p>
                    </div>
                    <div className="bg-sea-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">売上</p>
                      <p className="text-sm font-bold text-sea-600">
                        ¥{formatCurrency(selectedRecord.return.total_revenue)}
                      </p>
                    </div>
                    <div className="bg-sea-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">経費</p>
                      <p className="text-sm font-bold text-gray-800">
                        ¥{formatCurrency(
                          selectedRecord.return.fuel_used +
                          selectedRecord.return.ice_cost +
                          selectedRecord.return.bait_cost +
                          selectedRecord.return.other_cost,
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedRecord.return.memo && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">メモ</p>
                      <p className="text-sm">{selectedRecord.return.memo}</p>
                    </div>
                  )}
                  {selectedRecord.return.trouble && (
                    <div className="bg-red-50 rounded-lg p-2">
                      <p className="text-xs text-red-400">トラブル</p>
                      <p className="text-sm text-red-600">{selectedRecord.return.trouble}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Delete button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => deleteRecord(selectedRecord)}
                  className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl font-semibold text-sm min-h-[44px] transition-colors duration-150"
                >
                  この記録を削除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
