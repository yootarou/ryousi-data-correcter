import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useBattery } from '@/hooks/useBattery';

export const AppBar = () => {
  const isOnline = useOnlineStatus();
  const battery = useBattery();

  const batteryPercent = Math.round(battery.level * 100);
  const batteryColor =
    batteryPercent > 20 ? 'text-sea-400' : 'text-red-400';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-ocean-700 safe-area-top"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center justify-between px-4 h-full max-w-[var(--max-content-width)] mx-auto">
        <h1 className="text-lg font-bold text-white tracking-wide">Smart Fishing</h1>

        <div className="flex items-center gap-3">
          {/* Sync status */}
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-ocean-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          {/* Battery */}
          {battery.supported && (
            <div className={`flex items-center gap-0.5 ${batteryColor}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="22" y="9" width="1.5" height="6" rx="0.5" fill="currentColor" />
                <rect
                  x="4"
                  y="8"
                  width={Math.max(1, 14 * battery.level)}
                  height="8"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
              <span className="text-[10px] font-medium">{batteryPercent}%</span>
            </div>
          )}

          {/* Online status */}
          <div className="flex items-center gap-1">
            <span
              className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-sea-400 animate-pulse-dot' : 'bg-red-400'}`}
            />
            <span className="text-[10px] text-ocean-200 font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
