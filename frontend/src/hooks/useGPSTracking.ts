import { useState, useCallback, useRef, useEffect } from 'react';
import { routePointsRepo } from '@/services/db/routePoints';
import type { RoutePoint } from '@/types';

const FLUSH_INTERVAL = 30_000; // Flush buffer to DB every 30 seconds
const MIN_ACCURACY = 100; // Discard points with accuracy > 100m

interface GPSTrackingState {
  isTracking: boolean;
  currentPosition: { latitude: number; longitude: number } | null;
  accuracy: number | null;
  speed: number | null;
  pointCount: number;
  error: string | null;
}

export const useGPSTracking = (recordId: string | undefined) => {
  const [state, setState] = useState<GPSTrackingState>({
    isTracking: false,
    currentPosition: null,
    accuracy: null,
    speed: null,
    pointCount: 0,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const bufferRef = useRef<RoutePoint[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointCountRef = useRef(0);

  const flushBuffer = useCallback(async () => {
    if (bufferRef.current.length === 0) return;
    const points = [...bufferRef.current];
    bufferRef.current = [];
    await routePointsRepo.bulkAdd(points);
  }, []);

  const start = useCallback(() => {
    if (!recordId || !navigator.geolocation) {
      setState((s) => ({ ...s, error: 'GPS非対応またはレコードIDなし' }));
      return;
    }

    setState((s) => ({ ...s, isTracking: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;

        // Skip low-accuracy points
        if (accuracy > MIN_ACCURACY) return;

        const point: RoutePoint = {
          id: crypto.randomUUID(),
          record_id: recordId,
          latitude,
          longitude,
          accuracy,
          speed: speed ?? null,
          heading: heading ?? null,
          timestamp: new Date().toISOString(),
        };

        bufferRef.current.push(point);
        pointCountRef.current += 1;

        setState((s) => ({
          ...s,
          currentPosition: { latitude, longitude },
          accuracy,
          speed,
          pointCount: pointCountRef.current,
          error: null,
        }));
      },
      (err) => {
        setState((s) => ({
          ...s,
          error:
            err.code === 1
              ? 'GPS権限が拒否されました'
              : err.code === 2
                ? 'GPS位置を取得できません'
                : 'GPSタイムアウト',
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 30_000,
      },
    );

    // Periodic flush
    flushTimerRef.current = setInterval(flushBuffer, FLUSH_INTERVAL);
  }, [recordId, flushBuffer]);

  const stop = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    // Flush remaining buffer
    await flushBuffer();
    setState((s) => ({ ...s, isTracking: false }));
  }, [flushBuffer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
      }
      // Best-effort flush
      if (bufferRef.current.length > 0) {
        routePointsRepo.bulkAdd([...bufferRef.current]);
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
  };
};
