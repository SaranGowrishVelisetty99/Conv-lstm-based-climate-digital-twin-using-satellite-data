'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AP_BOUNDS, GRID_ROWS, GRID_COLS, gridToLatLng } from '@/lib/geo';
import { getColorForValue } from '@/lib/colors';
import AP_OUTLINE from '@/lib/apOutline';

export interface MapViewProps {
  data: number[][] | null;
  variable: string;
  title?: string;
  minVal?: number;
  maxVal?: number;
  height?: string;
}

export default function MapView({
  data,
  variable,
  title,
  minVal,
  maxVal,
  height = '400px',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [16.0, 80.8],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.polyline(
      AP_OUTLINE.map(([lat, lng]) => [lat, lng]),
      { color: '#06b6d4', weight: 2.5, fill: false, opacity: 0.8 }
    ).addTo(map);

    mapRef.current = map;
    gridLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      gridLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (gridLayerRef.current) {
      gridLayerRef.current.clearLayers();
    }

    if (!data) return;

    const actualMin = minVal ?? Math.min(...data.flat());
    const actualMax = maxVal ?? Math.max(...data.flat());

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const value = data[r]?.[c] ?? 0;
        const [lat, lng] = gridToLatLng(r, c);
        const dLat = (AP_BOUNDS.lat_max - AP_BOUNDS.lat_min) / GRID_ROWS / 2;
        const dLng = (AP_BOUNDS.lon_max - AP_BOUNDS.lon_min) / GRID_COLS / 2;
        const bounds: L.LatLngBoundsExpression = [
          [lat - dLat, lng - dLng],
          [lat + dLat, lng + dLng],
        ];
        const color = getColorForValue(value, variable, actualMin, actualMax);
        const rect = L.rectangle(bounds, {
          color: color,
          weight: 0,
          fillColor: color,
          fillOpacity: 0.7,
        });
        rect.bindTooltip(`${value.toFixed(1)} ${getUnit(variable)}`, {
          sticky: true,
        });
        gridLayerRef.current?.addLayer(rect);
      }
    }
  }, [data, variable, title, minVal, maxVal]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div ref={mapContainerRef} style={{ height, width: '100%', borderRadius: '0.5rem' }} />
      {title && data && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            zIndex: 1000,
            background: 'rgba(255,255,255,0.9)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#333',
            pointerEvents: 'none',
          }}
        >
          <strong>{title}</strong>
          <br />
          {Math.min(...data.flat()).toFixed(1)} &ndash; {Math.max(...data.flat()).toFixed(1)}{' '}
          {getUnit(variable)}
        </div>
      )}
    </div>
  );
}

function getUnit(variable: string): string {
  switch (variable) {
    case 'rainfall':
      return 'mm/day';
    case 'max_temp':
    case 'min_temp':
    case 'temperature':
      return '°C';
    default:
      return '';
  }
}
