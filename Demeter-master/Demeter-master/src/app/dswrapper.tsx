// src/components/ClientComponentsWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { LocationProvider } from '../context/LocationContext';

// Dynamic imports in client component
const CountryRegionDropdowns = dynamic(() => import('./country_region_selector'), { ssr: true });
const Map = dynamic(() => import('./Map'), { ssr: false });

interface ClientComponentsWrapperProps {
  userId: string;
}

export default function ClientComponentsWrapper({ userId }: ClientComponentsWrapperProps) {
  return (
    <LocationProvider>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Location Selector</h2>
          <CountryRegionDropdowns 
            userId={userId} 
            onSave={() => console.log('Location saved')} 
          />
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl text-center font-semibold mb-4">Map View</h2>
          <Map />
        </div>
      </div>
    </LocationProvider>
  );
}