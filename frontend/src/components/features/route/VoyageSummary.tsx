import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDate } from '@/utils/formatters';
import { formatDuration, calculateDwellTime } from '@/services/calculations/duration';
import { kmToNauticalMiles } from '@/services/calculations/distance';
import type { FishingRecord, RoutePoint, Deployment } from '@/types';

interface VoyageSummaryProps {
  record: FishingRecord;
  routePoints: RoutePoint[];
  deployments: Deployment[];
  totalDistanceKm: number;
  onClose: () => void;
}

const DEPLOYMENT_ICON = L.divIcon({
  className: '',
  html: '<div style="background:#ef4444;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">⚓</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const VoyageSummary: React.FC<VoyageSummaryProps> = ({
  record,
  routePoints,
  deployments,
  totalDistanceKm,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  const formatCurrency = (n: number) => new Intl.NumberFormat('ja-JP').format(n);

  const operationDuration =
    record.return && record.departure.fishing_start_time
      ? calculateDwellTime(record.departure.fishing_start_time, record.return.fishing_end_time)
      : 0;

  // Initialize summary map with nautical chart
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 13,
    });

    // ESRI Ocean Basemap - clean marine chart with simple green land
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 13,
      },
    ).addTo(mapRef.current);

    // Route polyline
    if (routePoints.length > 0) {
      const latlngs: L.LatLngExpression[] = routePoints.map((p) => [p.latitude, p.longitude]);
      L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.9,
      }).addTo(mapRef.current);

      // Start marker
      L.circleMarker(latlngs[0] as [number, number], {
        radius: 8,
        fillColor: '#22c55e',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .bindPopup('出発')
        .addTo(mapRef.current);

      // End marker
      L.circleMarker(latlngs[latlngs.length - 1] as [number, number], {
        radius: 8,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .bindPopup('到着')
        .addTo(mapRef.current);

      // Fit bounds
      mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [30, 30] });
    }

    // Deployment markers
    for (const dep of deployments) {
      if (dep.position.latitude && dep.position.longitude) {
        L.marker([dep.position.latitude, dep.position.longitude], {
          icon: DEPLOYMENT_ICON,
        })
          .bindPopup(
            `<strong>第${dep.line_number}投</strong><br/>時刻: ${dep.deployment_time}<br/>水深: ${dep.depth}m`,
          )
          .addTo(mapRef.current);
      }
    }

    // If no route but has deployments, fit to deployments
    if (routePoints.length === 0 && deployments.length > 0) {
      const depLatLngs = deployments
        .filter((d) => d.position.latitude && d.position.longitude)
        .map((d) => [d.position.latitude!, d.position.longitude!] as L.LatLngExpression);
      if (depLatLngs.length > 0) {
        mapRef.current.fitBounds(L.latLngBounds(depLatLngs), { padding: [30, 30] });
      }
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [routePoints, deployments]);

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Map section */}
      <div
        ref={mapContainerRef}
        className="w-full"
        style={{ height: '45vh' }}
      />

      {/* Summary content */}
      <div className="p-4 space-y-4 max-w-[var(--max-content-width)] mx-auto -mt-6 relative z-[400]">
        {/* Header card */}
        <div className="card bg-white shadow-lg">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">航海完了</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(record.date)} - {record.vessel_name}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">走行距離</p>
            <p className="text-2xl font-bold text-ocean-600">
              {totalDistanceKm > 0 ? `${totalDistanceKm}` : '-'}
              <span className="text-sm font-normal text-gray-400 ml-0.5">km</span>
            </p>
            {totalDistanceKm > 0 && (
              <p className="text-xs text-gray-400">
                ({kmToNauticalMiles(totalDistanceKm)} 海里)
              </p>
            )}
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">操業時間</p>
            <p className="text-2xl font-bold text-gray-700">
              {operationDuration > 0 ? formatDuration(operationDuration) : '-'}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">投縄回数</p>
            <p className="text-2xl font-bold text-gray-700">
              {deployments.length}
              <span className="text-sm font-normal text-gray-400 ml-0.5">回</span>
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-gray-400 mb-1">記録点数</p>
            <p className="text-2xl font-bold text-gray-700">
              {routePoints.length}
              <span className="text-sm font-normal text-gray-400 ml-0.5">点</span>
            </p>
          </div>
        </div>

        {/* Revenue summary */}
        {record.return && (
          <div className="card bg-sea-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">漁獲結果</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">漁獲量</p>
                <p className="text-lg font-bold text-gray-700">
                  {record.return.total_catch_kg.toFixed(1)}kg
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">売上</p>
                <p className="text-lg font-bold text-sea-600">
                  ¥{formatCurrency(record.return.total_revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">経費</p>
                <p className="text-lg font-bold text-gray-700">
                  ¥{formatCurrency(
                    record.departure.fuel_cost +
                    record.return.fuel_used +
                    record.return.ice_cost +
                    record.return.bait_cost +
                    record.return.other_cost,
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deployment list */}
        {deployments.length > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">投縄記録</h2>
            <div className="space-y-2">
              {deployments.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium">第{dep.line_number}投</span>
                  <span className="text-gray-500">
                    {dep.deployment_time} / {dep.depth}m / {dep.bait_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 px-4 bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white rounded-xl font-semibold text-base min-h-[52px] transition-colors duration-150 shadow-sm mb-8"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
};
