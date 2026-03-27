import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGPSTracking } from './useGPSTracking';

vi.mock('@/services/db/routePoints', () => ({
  routePointsRepo: {
    bulkAdd: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useGPSTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockReset();
    (navigator.geolocation.clearWatch as ReturnType<typeof vi.fn>).mockReset();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useGPSTracking('record-1'));
    expect(result.current.isTracking).toBe(false);
    expect(result.current.currentPosition).toBeNull();
    expect(result.current.accuracy).toBeNull();
    expect(result.current.speed).toBeNull();
    expect(result.current.pointCount).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('sets error when recordId is undefined', () => {
    const { result } = renderHook(() => useGPSTracking(undefined));
    act(() => {
      result.current.start();
    });
    expect(result.current.error).toBe('GPS非対応またはレコードIDなし');
    expect(result.current.isTracking).toBe(false);
  });

  it('calls watchPosition on start', () => {
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockReturnValue(42);
    const { result } = renderHook(() => useGPSTracking('record-1'));

    act(() => {
      result.current.start();
    });

    expect(result.current.isTracking).toBe(true);
    expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true }),
    );
  });

  it('updates position on GPS success callback', () => {
    let successCallback: (pos: GeolocationPosition) => void = () => {};
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (success) => {
        successCallback = success;
        return 1;
      },
    );

    const { result } = renderHook(() => useGPSTracking('record-1'));

    act(() => {
      result.current.start();
    });

    act(() => {
      successCallback({
        coords: {
          latitude: 35.0,
          longitude: 139.0,
          accuracy: 10,
          speed: 5.2,
          heading: 180,
          altitude: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    expect(result.current.currentPosition).toEqual({ latitude: 35.0, longitude: 139.0 });
    expect(result.current.accuracy).toBe(10);
    expect(result.current.speed).toBe(5.2);
    expect(result.current.pointCount).toBe(1);
  });

  it('discards low-accuracy points (>100m)', () => {
    let successCallback: (pos: GeolocationPosition) => void = () => {};
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (success) => {
        successCallback = success;
        return 1;
      },
    );

    const { result } = renderHook(() => useGPSTracking('record-1'));
    act(() => { result.current.start(); });

    act(() => {
      successCallback({
        coords: {
          latitude: 35.0,
          longitude: 139.0,
          accuracy: 150, // too inaccurate
          speed: null,
          heading: null,
          altitude: null,
          altitudeAccuracy: null,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    expect(result.current.pointCount).toBe(0);
    expect(result.current.currentPosition).toBeNull();
  });

  it('sets error on GPS error callback', () => {
    let errorCallback: (err: GeolocationPositionError) => void = () => {};
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (_success, error) => {
        errorCallback = error;
        return 1;
      },
    );

    const { result } = renderHook(() => useGPSTracking('record-1'));
    act(() => { result.current.start(); });

    act(() => {
      errorCallback({ code: 1, message: 'denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
    });

    expect(result.current.error).toBe('GPS権限が拒否されました');
  });

  it('clears watch on stop', async () => {
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockReturnValue(42);
    const { result } = renderHook(() => useGPSTracking('record-1'));

    act(() => { result.current.start(); });
    await act(async () => { await result.current.stop(); });

    expect(navigator.geolocation.clearWatch).toHaveBeenCalledWith(42);
    expect(result.current.isTracking).toBe(false);
  });

  it('flushes buffer on stop', async () => {
    const { routePointsRepo } = await import('@/services/db/routePoints');
    let successCallback: (pos: GeolocationPosition) => void = () => {};
    (navigator.geolocation.watchPosition as ReturnType<typeof vi.fn>).mockImplementation(
      (success) => {
        successCallback = success;
        return 1;
      },
    );

    const { result } = renderHook(() => useGPSTracking('record-1'));
    act(() => { result.current.start(); });

    // Add a point to the buffer
    act(() => {
      successCallback({
        coords: { latitude: 35.0, longitude: 139.0, accuracy: 10, speed: null, heading: null, altitude: null, altitudeAccuracy: null },
        timestamp: Date.now(),
      } as GeolocationPosition);
    });

    await act(async () => { await result.current.stop(); });

    expect(routePointsRepo.bulkAdd).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ latitude: 35.0, longitude: 139.0 }),
      ]),
    );
  });
});
