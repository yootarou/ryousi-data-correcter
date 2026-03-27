import { useState, useEffect, useCallback, useMemo } from 'react';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { deploymentsRepo } from '@/services/db/deployments';
import { retrievalsRepo } from '@/services/db/retrievals';
import { routePointsRepo } from '@/services/db/routePoints';
import { FishingSpotMap } from '@/components/features/spotmap/FishingSpotMap';
import { formatDate } from '@/utils/formatters';
import type { FishingRecord, Deployment, Retrieval, RoutePoint } from '@/types';

export type ViewMode = 'fish' | 'ship';

export interface SpotData {
  deployment: Deployment;
  record: FishingRecord;
  retrieval?: Retrieval;
}

export interface RouteData {
  record: FishingRecord;
  points: RoutePoint[];
}

const FishingSpotMapPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('fish');
  const [spots, setSpots] = useState<SpotData[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Date range filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected items
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await fishingRecordsRepo.getAll();

      // Load fish mode data
      const [allDeployments, allRetrievals] = await Promise.all([
        deploymentsRepo.getAll(),
        retrievalsRepo.getAll(),
      ]);

      const recordMap = new Map(records.map((r) => [r.id, r]));
      const retrievalMap = new Map(allRetrievals.map((r) => [r.deployment_id, r]));

      const spotDataList: SpotData[] = [];
      for (const dep of allDeployments) {
        if (!dep.position.latitude || !dep.position.longitude) continue;
        const record = recordMap.get(dep.record_id);
        if (!record) continue;
        spotDataList.push({
          deployment: dep,
          record,
          retrieval: retrievalMap.get(dep.id),
        });
      }
      setSpots(spotDataList);

      // Load ship mode data
      const routeDataList: RouteData[] = [];
      for (const record of records) {
        const points = await routePointsRepo.getByRecordId(record.id);
        if (points.length > 0) {
          routeDataList.push({ record, points });
        }
      }
      setRoutes(routeDataList);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter by date range
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (dateFrom && spot.record.date < dateFrom) return false;
      if (dateTo && spot.record.date > dateTo) return false;
      return true;
    });
  }, [spots, dateFrom, dateTo]);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (dateFrom && route.record.date < dateFrom) return false;
      if (dateTo && route.record.date > dateTo) return false;
      return true;
    });
  }, [routes, dateFrom, dateTo]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('ja-JP').format(n);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--bottom-nav-height))] max-w-[var(--max-content-width)] mx-auto animate-fade-in">
      {/* Controls Bar */}
      <div className="p-3 space-y-2 bg-white border-b border-gray-200 flex-shrink-0">
        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setViewMode('fish');
              setSelectedRoute(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-colors ${
              viewMode === 'fish'
                ? 'bg-white text-ocean-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span className="text-base">🐟</span>
            漁場スポット
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('ship');
              setSelectedSpot(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-semibold transition-colors ${
              viewMode === 'ship'
                ? 'bg-white text-ocean-600 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <span className="text-base">🚢</span>
            航路
          </button>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 bg-white min-h-[36px]"
          />
          <span className="text-gray-400 text-sm">〜</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-gray-300 bg-white min-h-[36px]"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-ocean-600 font-medium whitespace-nowrap"
            >
              解除
            </button>
          )}
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500">
          {viewMode === 'fish'
            ? `${filteredSpots.length}件のスポット`
            : `${filteredRoutes.length}件の航路`}
        </p>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <FishingSpotMap
          viewMode={viewMode}
          spots={viewMode === 'fish' ? filteredSpots : []}
          routes={viewMode === 'ship' ? filteredRoutes : []}
          selectedSpot={selectedSpot}
          selectedRoute={selectedRoute}
          onSelectSpot={setSelectedSpot}
          onSelectRoute={setSelectedRoute}
        />

        {/* Fish mode detail panel */}
        {viewMode === 'fish' && selectedSpot && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-h-[50%] overflow-y-auto z-[1000] animate-fade-in">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    第{selectedSpot.deployment.line_number}投 - {formatDate(selectedSpot.record.date)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedSpot.record.vessel_name} / {selectedSpot.record.departure.departure_port}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSpot(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">投縄時刻</p>
                  <p className="font-medium">{selectedSpot.deployment.deployment_time}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">水深</p>
                  <p className="font-medium">{selectedSpot.deployment.depth}m</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">餌</p>
                  <p className="font-medium">{selectedSpot.deployment.bait_type}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">水温</p>
                  <p className="font-medium">{selectedSpot.deployment.water_temp}°C</p>
                </div>
              </div>

              {selectedSpot.retrieval && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">漁獲結果</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-sea-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">針掛かり率</p>
                      <p className="text-lg font-bold text-sea-600">
                        {selectedSpot.retrieval.hook_rate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-sea-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">滞留時間</p>
                      <p className="text-lg font-bold text-gray-700">
                        {selectedSpot.retrieval.dwell_time_minutes}分
                      </p>
                    </div>
                  </div>
                  {selectedSpot.retrieval.species_catches.length > 0 && (
                    <div className="space-y-1">
                      {selectedSpot.retrieval.species_catches.map((sc, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                        >
                          <span className="font-medium">{sc.species}</span>
                          <span className="text-gray-500">
                            {sc.count}匹 / {sc.weight_kg.toFixed(1)}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ship mode detail panel */}
        {viewMode === 'ship' && selectedRoute && (
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-h-[40%] overflow-y-auto z-[1000] animate-fade-in">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {formatDate(selectedRoute.record.date)}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedRoute.record.vessel_name} / {selectedRoute.record.departure.departure_port}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRoute(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">記録点数</p>
                  <p className="text-lg font-bold text-gray-700">{selectedRoute.points.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">走行距離</p>
                  <p className="text-lg font-bold text-ocean-600">
                    {selectedRoute.record.total_distance_km
                      ? `${selectedRoute.record.total_distance_km}km`
                      : '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">漁場</p>
                  <p className="text-sm font-bold text-gray-700">
                    {selectedRoute.record.departure.target_area || '-'}
                  </p>
                </div>
              </div>

              {selectedRoute.record.return && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sea-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">漁獲量</p>
                    <p className="text-sm font-bold text-gray-700">
                      {selectedRoute.record.return.total_catch_kg.toFixed(1)}kg
                    </p>
                  </div>
                  <div className="bg-sea-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">売上</p>
                    <p className="text-sm font-bold text-sea-600">
                      ¥{formatCurrency(selectedRoute.record.return.total_revenue)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FishingSpotMapPage;
