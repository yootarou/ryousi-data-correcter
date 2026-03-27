import { useState, useEffect } from 'react';

interface BatteryState {
  level: number;
  charging: boolean;
  supported: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

export const useBattery = (): BatteryState => {
  const [battery, setBattery] = useState<BatteryState>({
    level: 1,
    charging: false,
    supported: false,
  });

  useEffect(() => {
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };

    if (!nav.getBattery) return;

    let bm: BatteryManager | null = null;

    const update = () => {
      if (bm) {
        setBattery({
          level: bm.level,
          charging: bm.charging,
          supported: true,
        });
      }
    };

    nav.getBattery().then((manager) => {
      bm = manager;
      update();
      manager.addEventListener('levelchange', update);
      manager.addEventListener('chargingchange', update);
    });

    return () => {
      if (bm) {
        bm.removeEventListener('levelchange', update);
        bm.removeEventListener('chargingchange', update);
      }
    };
  }, []);

  return battery;
};
