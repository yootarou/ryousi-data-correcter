import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useRouteData } from '@/hooks/useRouteData';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { RouteMap, TrackingControls } from '@/components/features/route';
import { formatDuration } from '@/services/calculations/duration';
import { calculateTotalDistance, kmToNauticalMiles } from '@/services/calculations/distance';
import { fishingRecordsRepo } from '@/services/db/fishingRecords';
import { routePointsRepo } from '@/services/db/routePoints';
import { VoyageSummary } from '@/components/features/route/VoyageSummary';
import type { FishingRecord } from '@/types';

const RoutePage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { routePoints, deployments, retrievals, isLoading, reload } = useRouteData(recordId);
  const tracking = useGPSTracking(recordId);
  const [record, setRecord] = useState<FishingRecord | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const autoStarted = useRef(false);

  // Load record info
  useEffect(() => {
    if (!recordId) return;
    fishingRecordsRepo.getById(recordId).then((r) => r && setRecord(r));
  }, [recordId]);

  // Auto-start GPS when coming from departure form
  useEffect(() => {
    if (
      searchParams.get('autostart') === '1' &&
      !autoStarted.current &&
      recordId &&
      !tracking.isTracking
    ) {
      autoStarted.current = true;
      // Small delay to let the page render first
      setTimeout(() => tracking.start(), 500);
    }
  }, [searchParams, recordId, tracking]);

  if (!recordId) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">レコードIDが指定されていません</p>
        <Link to="/" className="text-sea-600 underline mt-2 inline-block">
          ホームに戻る
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalPoints = routePoints.length + tracking.pointCount;
  const routeDuration =
    routePoints.length >= 2
      ? Math.round(
          (new Date(routePoints[routePoints.length - 1].timestamp).getTime() -
            new Date(routePoints[0].timestamp).getTime()) /
            60_000,
        )
      : 0;
  const totalDistanceKm = calculateTotalDistance(routePoints);
  const retrievalByDeploymentId = new Map(retrievals.map((retrieval) => [retrieval.deployment_id, retrieval]));
  const sortedDeployments = [...deployments].sort((a, b) => a.line_number - b.line_number);

  const handleFinish = async () => {
    // Stop tracking and flush remaining buffer
    await tracking.stop();

    // Reload route points from DB to get complete data
    await reload();

    // Calculate final distance with all points
    const allPoints = await routePointsRepo.getByRecordId(recordId);
    const finalDistance = calculateTotalDistance(allPoints);

    // Save total distance to record
    if (recordId) {
      await fishingRecordsRepo.update(recordId, {
        total_distance_km: finalDistance,
        updated_at: new Date().toISOString(),
      });
      // Refresh record
      const updated = await fishingRecordsRepo.getById(recordId);
      if (updated) setRecord(updated);
    }

    setShowSummary(true);
  };

  if (showSummary && record) {
    return (
      <VoyageSummary
        record={record}
        routePoints={routePoints}
        deployments={deployments}
        totalDistanceKm={record.total_distance_km ?? totalDistanceKm}
        onClose={() => navigate('/')}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <h1>航路記録</h1>
        <Link to="/" className="text-sm text-sea-600">
          ホームに戻る
        </Link>
      </div>

      {/* Record context */}
      {record && (
        <div className="card bg-ocean-50">
          <p className="text-sm font-medium text-ocean-700">
            {record.vessel_name} - {record.departure.departure_port}
          </p>
          <p className="text-xs text-ocean-500">
            出港: {record.departure.fishing_start_time} / {record.departure.target_species.join(', ')}
          </p>
        </div>
      )}

      {/* Tracking Controls */}
      <TrackingControls
        isTracking={tracking.isTracking}
        pointCount={tracking.pointCount}
        accuracy={tracking.accuracy}
        speed={tracking.speed}
        error={tracking.error}
        onStart={tracking.start}
        onStop={tracking.stop}
      />

      {/* Map */}
      <RouteMap
        routePoints={routePoints}
        deployments={deployments}
        currentPosition={tracking.currentPosition}
        isTracking={tracking.isTracking}
      />

      {/* Route Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          to={`/deployment/${recordId}`}
          className="inline-flex items-center justify-center py-3 px-4 bg-ocean-100 text-ocean-700 rounded-xl font-semibold text-sm min-h-[44px] transition-colors duration-150 hover:bg-ocean-200"
        >
          投縄記録
        </Link>
        <Link
          to={`/return/${recordId}`}
          className="inline-flex items-center justify-center py-3 px-4 bg-sea-100 text-sea-700 rounded-xl font-semibold text-sm min-h-[44px] transition-colors duration-150 hover:bg-sea-200"
        >
          帰港
        </Link>
      </div>

      {/* Deployment Status */}
      {sortedDeployments.length > 0 && (
        <div className="card">
          <h2 className="text-gray-700 mb-3">投縄状況</h2>
          <div className="space-y-2">
            {sortedDeployments.map((deployment) => {
              const retrieval = retrievalByDeploymentId.get(deployment.id);
              const isRetrieved = Boolean(retrieval);
              return (
                <button
                  key={deployment.id}
                  type="button"
                  disabled={isRetrieved}
                  onClick={() => navigate(`/retrieval/${deployment.id}`)}
                  className={`w-full text-left rounded-lg border p-3 transition-colors ${
                    isRetrieved
                      ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'border-ocean-200 bg-white hover:bg-ocean-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">投縄 #{deployment.line_number}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isRetrieved ? 'bg-gray-200 text-gray-600' : 'bg-ocean-100 text-ocean-700'
                      }`}
                    >
                      {isRetrieved ? '回収済み' : '投縄中'}
                    </span>
                  </div>
                  <p className="text-xs mt-2 text-gray-500">時刻: {deployment.deployment_time}</p>
                  <p className="text-xs mt-1 text-gray-500">
                    座標: {deployment.position.latitude.toFixed(4)}, {deployment.position.longitude.toFixed(4)}
                  </p>
                  {isRetrieved && retrieval && (
                    <p className="text-xs mt-1 text-gray-400">回収時刻: {retrieval.retrieval_time}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Route Stats */}
      {totalPoints > 0 && (
        <div className="card">
          <h2 className="text-gray-700 mb-3">航路統計</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-400">記録点数</p>
              <p className="text-xl font-bold text-gray-700">{totalPoints}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">記録時間</p>
              <p className="text-xl font-bold text-gray-700">
                {routeDuration > 0 ? formatDuration(routeDuration) : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">走行距離</p>
              <p className="text-xl font-bold text-gray-700">
                {totalDistanceKm > 0
                  ? `${totalDistanceKm}km (${kmToNauticalMiles(totalDistanceKm)}海里)`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">投縄数</p>
              <p className="text-xl font-bold text-gray-700">{deployments.length}</p>
            </div>
          </div>
        </div>
      )}

      {totalPoints === 0 && !tracking.isTracking && (
        <div className="card text-center text-gray-400 py-8">
          <p>航路データがありません</p>
          <p className="text-sm mt-1">「記録開始」を押してGPS記録を開始してください</p>
        </div>
      )}

      {/* Finish Button */}
      {(totalPoints > 0 || tracking.isTracking) && (
        <button
          type="button"
          onClick={handleFinish}
          className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-semibold text-base min-h-[52px] transition-colors duration-150 shadow-sm"
        >
          航海を完了する
        </button>
      )}
    </div>
  );
};

export default RoutePage;
