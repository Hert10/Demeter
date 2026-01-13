// src/components/Map.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '../context/LocationContext';

// Import default marker icon images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default icon issue
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
  });
};

export default function Map() {
  const { location, setLocation, setCountryRegion } = useLocation();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    // Fix leaflet icon issue
    fixLeafletIcon();
    
    if (!mapRef.current || leafletMap.current) return;
    
    // Default coordinates if no location is set
    const defaultPosition: [number, number] = [51.505, -0.09]; // London
    const initialPosition = location || defaultPosition;
    
    // Create map
    leafletMap.current = L.map(mapRef.current).setView(initialPosition, 5);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(leafletMap.current);
    
    setIsMapInitialized(true);
    
    // Cleanup on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, []);

  // Handle marker creation/update when location or map initialization changes
  useEffect(() => {
    if (!leafletMap.current || !isMapInitialized || !location) return;
    
    // Remove existing marker if it exists
    if (markerRef.current) {
      markerRef.current.remove();
    }
    
    // Create new marker
    markerRef.current = L.marker(location, {
      draggable: true
    }).addTo(leafletMap.current);
    
    // Pan map to new location
    leafletMap.current.setView(location, leafletMap.current.getZoom());
    
    // Add drag end event
    markerRef.current.on('dragend', handleMarkerDragEnd);
    
    // Cleanup this effect
    return () => {
      if (markerRef.current) {
        markerRef.current.off('dragend', handleMarkerDragEnd);
      }
    };
  }, [location, isMapInitialized]);

  // Handle marker drag end to update location
  const handleMarkerDragEnd = async (event: L.DragEndEvent) => {
    const marker = event.target;
    const position = marker.getLatLng();
    const newLocation: [number, number] = [position.lat, position.lng];
    
    // Update location in context
    setLocation(newLocation);
    
    // Reverse geocode to get country and region
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.address) {
        const country = data.address.country || '';
        // Try to get the most relevant administrative region
        const region = 
          data.address.state || 
          data.address.county || 
          data.address.province || 
          data.address.region || 
          '';
        
        // Update country and region in context
        setCountryRegion(country, region);
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    }
  };

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
}
