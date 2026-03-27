import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FishingGroundPoint } from '@/services/analytics/catchAnalytics';

interface FishingGroundMapProps {
  data: FishingGroundPoint[];
}

export const FishingGroundMap: React.FC<FishingGroundMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = [35.0, 138.5];
    mapRef.current = L.map(containerRef.current).setView(defaultCenter, 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || data.length === 0) return;

    const circles: L.CircleMarker[] = [];
    const maxWeight = Math.max(...data.map((d) => d.totalWeight), 1);

    for (const point of data) {
      const radius = Math.max(8, (point.totalWeight / maxWeight) * 30);
      const intensity = point.totalWeight / maxWeight;
      const color = `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;

      const circle = L.circleMarker([point.latitude, point.longitude], {
        radius,
        fillColor: color,
        fillOpacity: 0.7,
        color: '#ef4444',
        weight: 1,
      })
        .bindPopup(
          `<strong>漁場</strong><br/>投縄回数: ${point.catchCount}回<br/>漁獲量: ${point.totalWeight.toFixed(1)}kg`,
        )
        .addTo(map);

      circles.push(circle);
    }

    // Fit bounds
    if (circles.length > 0) {
      const bounds = L.latLngBounds(circles.map((c) => c.getLatLng()));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      circles.forEach((c) => c.remove());
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="card">
        <h2 className="text-gray-700 mb-3">漁場マップ</h2>
        <p className="text-center text-gray-400 py-8">位置データなし</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-gray-700 mb-3">漁場マップ</h2>
      <div
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height: '350px' }}
      />
    </div>
  );
};
