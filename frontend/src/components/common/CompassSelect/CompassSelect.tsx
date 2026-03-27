import type { Direction } from '@/types';
import type { CompassSelectProps } from './CompassSelect.types';

const directions: { value: Direction; label: string; angle: number }[] = [
  { value: 'N', label: '北', angle: 0 },
  { value: 'NE', label: '北東', angle: 45 },
  { value: 'E', label: '東', angle: 90 },
  { value: 'SE', label: '南東', angle: 135 },
  { value: 'S', label: '南', angle: 180 },
  { value: 'SW', label: '南西', angle: 225 },
  { value: 'W', label: '西', angle: 270 },
  { value: 'NW', label: '北西', angle: 315 },
];

const COMPASS_SIZE = 224;
const BUTTON_RADIUS = 85;

export const CompassSelect: React.FC<CompassSelectProps> = ({
  label,
  value,
  onChange,
  error,
  required,
  className = '',
}) => {
  const center = COMPASS_SIZE / 2;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className="relative mx-auto"
        style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}
      >
        {/* Compass circle */}
        <div className="absolute inset-3 rounded-full border-2 border-gray-200 bg-white" />
        {/* Cross lines */}
        <div
          className="absolute h-px bg-gray-100"
          style={{ top: center, left: 20, right: 20 }}
        />
        <div
          className="absolute w-px bg-gray-100"
          style={{ left: center, top: 20, bottom: 20 }}
        />

        {directions.map((dir) => {
          const selected = value === dir.value;
          const rad = (dir.angle - 90) * (Math.PI / 180);
          const x = center + BUTTON_RADIUS * Math.cos(rad);
          const y = center + BUTTON_RADIUS * Math.sin(rad);

          return (
            <button
              key={dir.value}
              type="button"
              onClick={() => onChange(dir.value)}
              className={`
                absolute w-10 h-10 rounded-full
                flex items-center justify-center
                text-xs font-bold transition-all duration-150
                ${selected
                  ? 'bg-ocean-600 text-white shadow-md scale-110'
                  : 'bg-gray-50 text-gray-500 hover:bg-ocean-50 hover:text-ocean-600 border border-gray-200'
                }
              `}
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {dir.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
};
