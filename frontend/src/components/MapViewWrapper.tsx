'use client';

import dynamic from 'next/dynamic';
import { type MapViewProps } from './MapView';

const MapViewClient = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '400px',
        width: '100%',
        borderRadius: '0.5rem',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
      }}
    >
      Loading map...
    </div>
  ),
});

export default function MapViewWrapper(props: MapViewProps) {
  return <MapViewClient {...props} />;
}
