// src/context/LocationContext.tsx
'use client';

import { createContext, useState, useContext, ReactNode } from 'react';

type LocationContextType = {
  location: [number, number] | null;
  country: string;
  region: string;
  setLocation: (location: [number, number] | null) => void;
  setCountryRegion: (country: string, region: string) => void;
  saveLocationData: (userId: string) => Promise<boolean>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [country, setCountry] = useState<string>('');
  const [region, setRegion] = useState<string>('');

  const setCountryRegion = (country: string, region: string) => {
    setCountry(country);
    setRegion(region);
  };

  const saveLocationData = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/save-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          country,
          region,
          coordinates: location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location data');
      }

      return true;
    } catch (error) {
      console.error('Error saving location:', error);
      return false;
    }
  };

  return (
    <LocationContext.Provider value={{ 
      location, 
      country, 
      region, 
      setLocation, 
      setCountryRegion, 
      saveLocationData 
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}