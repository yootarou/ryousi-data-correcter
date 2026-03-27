import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { SpotData, RouteData, ViewMode } from '@/pages/FishingSpotMapPage';

interface FishingSpotMapProps {
  viewMode: ViewMode;
  spots: SpotData[];
  routes: RouteData[];
  selectedSpot: SpotData | null;
  selectedRoute: RouteData | null;
  onSelectSpot: (spot: SpotData | null) => void;
  onSelectRoute: (route: RouteData | null) => void;
}

// Fish mode colors by catch weight
function getSpotColor(retrieval?: SpotData['retrieval']): string {
  if (!retrieval) return '#94a3b8';
  const totalKg = retrieval.species_catches.reduce((s, c) => s + c.weight_kg, 0);
  if (totalKg >= 50) return '#ef4444';
  if (totalKg >= 20) return '#f59e0b';
  if (totalKg > 0) return '#3b82f6';
  return '#94a3b8';
}

function getSpotRadius(retrieval?: SpotData['retrieval']): number {
  if (!retrieval) return 6;
  const totalKg = retrieval.species_catches.reduce((s, c) => s + c.weight_kg, 0);
  return Math.max(6, Math.min(16, 6 + totalKg * 0.2));
}

// Ship mode route colors - cycle through palette for different routes
const ROUTE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

function makeFishIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? 36 : 28;
  return L.divIcon({
    className: '',
    html: `<div style="font-size:${size}px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.3));${isSelected ? 'transform:scale(1.2);' : ''}">🐟</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const FishingSpotMap: React.FC<FishingSpotMapProps> = ({
  viewMode,
  spots,
  routes,
  selectedSpot,
  selectedRoute,
  onSelectSpot,
  onSelectRoute,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = [33.0, 135.0];
    mapRef.current = L.map(containerRef.current, { maxZoom: 13 }).setView(defaultCenter, 7);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 13,
      },
    ).addTo(mapRef.current);

    layerGroupRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Update fish mode markers
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || viewMode !== 'fish') return;

    layerGroup.clearLayers();

    if (spots.length === 0) return;

    for (const spot of spots) {
      const lat = spot.deployment.position.latitude!;
      const lng = spot.deployment.position.longitude!;
      const isSelected = selectedSpot?.deployment.id === spot.deployment.id;

      const marker = L.marker([lat, lng], {
        icon: makeFishIcon(isSelected),
      }).addTo(layerGroup);

      marker.on('click', () => {
        onSelectSpot(spot);
      });
    }

    // Fit bounds
    const latlngs: L.LatLngExpression[] = spots.map((s) => [
      s.deployment.position.latitude!,
      s.deployment.position.longitude!,
    ]);
    if (latlngs.length > 0) {
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 12 });
    }
  }, [viewMode, spots, selectedSpot, onSelectSpot]);

  // Update ship mode routes
  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup || viewMode !== 'ship') return;

    layerGroup.clearLayers();

    if (routes.length === 0) return;

    const allLatLngs: L.LatLngExpression[] = [];

    routes.forEach((route, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
      const isSelected = selectedRoute?.record.id === route.record.id;
      const latlngs: L.LatLngExpression[] = route.points.map((p) => [p.latitude, p.longitude]);

      if (latlngs.length === 0) return;

      allLatLngs.push(...latlngs);

      // Route polyline
      const polyline = L.polyline(latlngs, {
        color: isSelected ? '#1e40af' : color,
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 1 : 0.7,
      }).addTo(layerGroup);

      polyline.on('click', () => {
        onSelectRoute(route);
      });

      // Start marker (green circle)
      L.circleMarker(latlngs[0] as [number, number], {
        radius: isSelected ? 8 : 5,
        fillColor: '#22c55e',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      }).addTo(layerGroup);

      // End marker (red circle)
      if (latlngs.length > 1) {
        L.circleMarker(latlngs[latlngs.length - 1] as [number, number], {
          radius: isSelected ? 8 : 5,
          fillColor: '#ef4444',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(layerGroup);
      }
    });

    // Fit bounds to all routes
    if (allLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [40, 40], maxZoom: 12 });
    }
  }, [viewMode, routes, selectedRoute, onSelectRoute]);

  // Pan to selected route
  useEffect(() => {
    if (!mapRef.current || viewMode !== 'ship' || !selectedRoute) return;
    const latlngs: L.LatLngExpression[] = selectedRoute.points.map((p) => [p.latitude, p.longitude]);
    if (latlngs.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 12 });
    }
  }, [viewMode, selectedRoute]);

  // Pan to selected spot
  useEffect(() => {
    if (!mapRef.current || viewMode !== 'fish' || !selectedSpot) return;
    mapRef.current.panTo([
      selectedSpot.deployment.position.latitude!,
      selectedSpot.deployment.position.longitude!,
    ]);
  }, [viewMode, selectedSpot]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '300px' }}
    />
  );
};
