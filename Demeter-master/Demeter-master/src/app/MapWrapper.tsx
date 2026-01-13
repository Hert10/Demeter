'use client';

import dynamic from 'next/dynamic';
import { LocationProvider } from '../context/LocationContext';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div style={{ height: '500px', width: '100%', background: '#f0f0f0' }}>Loading map...</div>,
});

export default function MapWrapper() {
  return (
    <LocationProvider>
      <Map />
    </LocationProvider>
  );
}