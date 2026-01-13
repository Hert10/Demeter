// src/components/country_region_selector.tsx
'use client';

import { useEffect, useState } from 'react';
import { useLocation } from '../context/LocationContext';

interface Props {
  userId?: string;
  onSave?: () => void;
}

declare global {
  interface Window {
    crs: {
      init: () => void;
    };
  }
}

export default function CountryRegionDropdowns({ userId, onSave }: Props) {
  const { location, country, region, setLocation, setCountryRegion, saveLocationData } = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isUpdatingDropdowns, setIsUpdatingDropdowns] = useState(false);

  // Initialize country-region-selector
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/js/crs.min.js';
    script.onload = () => {
      window.crs?.init();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Handle location change initiated from dropdowns
  const handleLocationChange = async (newCountry: string, newRegion: string) => {
    if (!newCountry) return;
    
    // Skip geocoding if we're currently updating from the map
    if (isUpdatingDropdowns) return;
    
    // Update context with country and region
    setCountryRegion(newCountry, newRegion);
    
    const query = newRegion ? `${newRegion}, ${newCountry}` : newCountry;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=1`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data?.length > 0) {
        const { lat, lon } = data[0];
        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
        
        setLocation(coords);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };
  
  useEffect(() => {
    if (!country || !region) return;
    
    setIsUpdatingDropdowns(true);
    
    const countryDropdown = document.getElementById('country') as HTMLSelectElement;
    if (countryDropdown) {
      let countryExists = false;
      for (let i = 0; i < countryDropdown.options.length; i++) {
        if (countryDropdown.options[i].text === country) {
          countryDropdown.selectedIndex = i;
          countryExists = true;
          break;
        }
      }
      
      if (!countryExists) {
        console.warn(`Country "${country}" not found in dropdown options`);
      }
    }
    
    setTimeout(() => {
      const regionDropdown = document.getElementById('region') as HTMLSelectElement;
      if (regionDropdown) {
        let regionExists = false;
        for (let i = 0; i < regionDropdown.options.length; i++) {
          if (regionDropdown.options[i].text === region) {
            regionDropdown.selectedIndex = i;
            regionExists = true;
            break;
          }
        }
        
        if (!regionExists) {
          console.warn(`Region "${region}" not found in dropdown options`);
        }
      }
      
      // Reset flag
      setIsUpdatingDropdowns(false);
    }, 300);
  }, [country, region]);
  
  const handleSave = async () => {
    if (!userId) {
      setSaveMessage('User ID is required to save location');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const success = await saveLocationData(userId);
      
      if (success) {
        setSaveMessage('Location saved successfully!');
        if (onSave) onSave();
      } else {
        setSaveMessage('Failed to save location data');
      }
    } catch (error) {
      console.error('Error in save handler:', error);
      setSaveMessage('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0">
  <div className="row g-3">
    <div className="col-md-6">
      <label htmlFor="country" className="form-label">Country:</label>
      <select
        id="country"
        className="form-select crs-country"
        data-region-id="region"
        data-default-option="Select Country"
        onChange={(e) => {
          if (isUpdatingDropdowns) return;
          const val = e.target.value;
          handleLocationChange(val, '');
        }}
      >
        <option value="">Select Country</option>
      </select>
    </div>
    <div className="col-md-6">
      <label htmlFor="region" className="form-label">Region:</label>
      <select
        id="region"
        className="form-select crs-region"
        data-default-option="Select Region"
        onChange={(e) => {
          if (isUpdatingDropdowns) return;
          const val = e.target.value;
          const countryDropdown = document.getElementById('country') as HTMLSelectElement;
          const countryVal = countryDropdown?.value || '';
          handleLocationChange(countryVal, val);
        }}
      >
        <option value="">Select Region</option>
      </select>
    </div>
  </div>
  
  {location && (
    <div className="form-text mt-2">
      Coordinates: {location[0].toFixed(6)}, {location[1].toFixed(6)}
    </div>
  )}
  
  <div className="mt-3">
    <button 
      onClick={handleSave}
      disabled={isSaving || !location}
      className="btn btn-primary"
    >
      {isSaving ? 'Saving...' : 'Save Location'}
    </button>
    
    {saveMessage && (
      <p className={`mt-2 ${saveMessage.includes('success') ? 'text-success' : 'text-danger'}`}>
        {saveMessage}
      </p>
    )}
  </div>
</div>
  );
}