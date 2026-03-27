import { useParams, Link } from 'react-router-dom';
import { useRouteData } from '@/hooks/useRouteData';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { RouteMap, TrackingControls } from '@/components/features/route';
import { formatDuration } from '@/services/calculations/duration';

const RoutePage = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const { routePoints, deployments, isLoading } = useRouteData(recordId);
  const tracking = useGPSTracking(recordId);

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

  // Calculate route stats
  const totalPoints = routePoints.length + tracking.pointCount;
  const routeDuration =
    routePoints.length >= 2
      ? Math.round(
          (new Date(routePoints[routePoints.length - 1].timestamp).getTime() -
            new Date(routePoints[0].timestamp).getTime()) /
            60_000,
        )
      : 0;

  return (
    <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <h1>航路記録</h1>
        <Link to="/" className="text-sm text-sea-600">
          ホームに戻る
        </Link>
      </div>

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

      {/* Route Stats */}
      {totalPoints > 0 && (
        <div className="card">
          <h2 className="text-gray-700 mb-3">航路統計</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
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
    </div>
  );
};

export default RoutePage;
