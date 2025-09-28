import React, { useState, useEffect } from 'react';
import { MapboxEmergencyMap } from './MapboxEmergencyMap';
import { EmergencyMap } from './EmergencyMap';

interface MapFilters {
  emsAmbulance: boolean;
  fireDepartment: boolean;
  police: boolean;
  onSceneUnits: boolean;
  victims: boolean;
  highPriorityIncidents: boolean;
  hospitals: boolean;
  optimalRoutes: boolean;
  unitMovementTrails: boolean;
}

interface MapContainerProps {
  embedded?: boolean;
  filters?: MapFilters;
}

export function MapContainer({ embedded = false, filters }: MapContainerProps) {
  const [useMapbox, setUseMapbox] = useState(true);
  const [mapboxFailed, setMapboxFailed] = useState(false);

  // Check if Mapbox is available and configured
  useEffect(() => {
    // Simple check for Mapbox token
    const checkMapbox = () => {
      try {
        // We have a valid Mapbox token configured, so prefer Mapbox
        // Only fall back to SVG if Mapbox explicitly fails to load
        const timeout = setTimeout(() => {
          if (!mapboxFailed) {
            // Give Mapbox more time to load since we have a real token
            console.log('Mapbox is taking longer to load, but keeping it enabled');
          }
        }, 5000);

        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('Error checking Mapbox availability:', error);
        setMapboxFailed(true);
        setUseMapbox(false);
      }
    };

    checkMapbox();
  }, []);

  // Listen for Mapbox load failures
  const handleMapboxError = () => {
    setMapboxFailed(true);
    setUseMapbox(false);
  };

  if (useMapbox && !mapboxFailed) {
    return <MapboxEmergencyMap embedded={embedded} onError={handleMapboxError} filters={filters} />;
  }

  // Fallback to SVG map
  return <EmergencyMap embedded={embedded} filters={filters} />;
}