import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RoutePoint, Deployment } from '@/types';

// Fix Leaflet default marker icon issue with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface RouteMapProps {
  routePoints: RoutePoint[];
  deployments: Deployment[];
  currentPosition?: { latitude: number; longitude: number } | null;
  isTracking?: boolean;
}

const DEPLOYMENT_ICON = L.divIcon({
  className: '',
  html: '<div style="background:#ef4444;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);">⚓</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const CURRENT_ICON = L.divIcon({
  className: '',
  html: '<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const RouteMap: React.FC<RouteMapProps> = ({
  routePoints,
  deployments,
  currentPosition,
  isTracking,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = [35.0, 138.5]; // 駿河湾付近
    mapRef.current = L.map(containerRef.current).setView(defaultCenter, 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
    }

    if (routePoints.length === 0) return;

    const latlngs: L.LatLngExpression[] = routePoints.map((p) => [p.latitude, p.longitude]);

    polylineRef.current = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.8,
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [routePoints]);

  // Deployment markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: L.Marker[] = [];
    for (const dep of deployments) {
      if (dep.position.latitude && dep.position.longitude) {
        const marker = L.marker([dep.position.latitude, dep.position.longitude], {
          icon: DEPLOYMENT_ICON,
        })
          .bindPopup(
            `<strong>投縄 #${dep.line_number}</strong><br/>時刻: ${dep.deployment_time}<br/>水深: ${dep.depth}m<br/>餌: ${dep.bait_type}`,
          )
          .addTo(map);
        markers.push(marker);
      }
    }

    // If no route points, fit to deployment positions
    if (routePoints.length === 0 && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [deployments, routePoints.length]);

  // Current position marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    if (currentPosition && isTracking) {
      currentMarkerRef.current = L.marker(
        [currentPosition.latitude, currentPosition.longitude],
        { icon: CURRENT_ICON },
      )
        .bindPopup('現在位置')
        .addTo(map);

      map.panTo([currentPosition.latitude, currentPosition.longitude]);
    }
  }, [currentPosition, isTracking]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border border-gray-200"
      style={{ height: '400px' }}
    />
  );
};
