import { Button } from '@/components/common/Button';

interface TrackingControlsProps {
  isTracking: boolean;
  pointCount: number;
  accuracy: number | null;
  speed: number | null;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export const TrackingControls: React.FC<TrackingControlsProps> = ({
  isTracking,
  pointCount,
  accuracy,
  speed,
  error,
  onStart,
  onStop,
}) => {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              isTracking ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <span className="font-medium text-gray-700">
            {isTracking ? 'GPS記録中' : 'GPS停止中'}
          </span>
        </div>
        <Button
          variant={isTracking ? 'outline' : 'primary'}
          size="sm"
          onClick={isTracking ? onStop : onStart}
        >
          {isTracking ? '停止' : '記録開始'}
        </Button>
      </div>

      {isTracking && (
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-gray-400">記録点</p>
            <p className="font-bold text-gray-700">{pointCount}</p>
          </div>
          <div>
            <p className="text-gray-400">精度</p>
            <p className="font-bold text-gray-700">
              {accuracy ? `${Math.round(accuracy)}m` : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-400">速度</p>
            <p className="font-bold text-gray-700">
              {speed !== null ? `${(speed * 1.944).toFixed(1)}kt` : '-'}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
