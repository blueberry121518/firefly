import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MapPin, 
  Truck, 
  Zap, 
  Heart,
  Shield,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Navigation,
  TrendingUp,
  Target,
  Hospital,
  Ambulance,
  Flame,
  AlertTriangle
} from 'lucide-react';

// Import Mapbox GL JS
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import the routing optimizer
import { RouteOptimizer, RouteAssignment } from './RouteOptimizer';
import { toast } from 'sonner@2.0.3';

export interface EmergencyUnit {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  status: 'available' | 'enroute' | 'onscene' | 'returning';
  position: { lng: number; lat: number };
  assignedIncident?: string;
  eta?: number;
  speed?: number; // Movement speed
  heading?: number; // Direction in degrees
  patrolRoute?: { lng: number; lat: number }[]; // Patrol route points
  currentPatrolIndex?: number; // Current point in patrol route
  patrolBehavior?: 'patrol' | 'stationary' | 'strategic_positioning'; // Different movement behaviors
  homeBase?: { lng: number; lat: number }; // Home station position
}

export interface MapIncident {
  id: string;
  type: 'medical' | 'fire' | 'police';
  position: { lng: number; lat: number };
  status: 'active' | 'dispatched' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  unitsAssigned: string[];
  isVictim?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  position: { lng: number; lat: number };
  type: 'general' | 'trauma' | 'pediatric' | 'cardiac';
  capacity: number;
  availableBeds: number;
}

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

interface MapboxEmergencyMapProps {
  embedded?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  filters?: MapFilters;
}

export function MapboxEmergencyMap({ embedded = false, onError, onLoad, filters }: MapboxEmergencyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Default filters if none provided
  const activeFilters = filters || {
    emsAmbulance: true,
    fireDepartment: true,
    police: true,
    onSceneUnits: true,
    victims: true,
    highPriorityIncidents: true,
    hospitals: true,
    optimalRoutes: true,
    unitMovementTrails: true
  };

  // Helper function to check if a unit should be displayed
  const shouldShowUnit = (unit: EmergencyUnit) => {
    // Check unit type filters
    if (unit.type === 'ambulance' && !activeFilters.emsAmbulance) return false;
    if (unit.type === 'fire' && !activeFilters.fireDepartment) return false;
    if (unit.type === 'police' && !activeFilters.police) return false;
    
    // Check on-scene filter
    if (unit.status === 'onscene' && !activeFilters.onSceneUnits) return false;
    
    return true;
  };

  // Helper function to check if an incident should be displayed
  const shouldShowIncident = (incident: MapIncident) => {
    // Check for victims (critical incidents)
    if (incident.priority === 'critical' && incident.isVictim && !activeFilters.victims) return false;
    
    // Check for high priority incidents
    if ((incident.priority === 'high' || incident.priority === 'medium') && !activeFilters.highPriorityIncidents) return false;
    
    return true;
  };

  // Helper function to check if infrastructure should be displayed
  const shouldShowHospitals = () => activeFilters.hospitals;
  
  // San Francisco hospitals with real coordinates
  const [hospitals] = useState<Hospital[]>([
    {
      id: 'SFGH',
      name: 'San Francisco General Hospital',
      position: { lng: -122.4048, lat: 37.7576 },
      type: 'trauma',
      capacity: 50,
      availableBeds: 12
    },
    {
      id: 'UCSF',
      name: 'UCSF Medical Center',
      position: { lng: -122.4574, lat: 37.7625 },
      type: 'general',
      capacity: 80,
      availableBeds: 25
    },
    {
      id: 'CPM',
      name: 'California Pacific Medical Center',
      position: { lng: -122.4342, lat: 37.7886 },
      type: 'general',
      capacity: 60,
      availableBeds: 18
    },
    {
      id: 'STHC',
      name: 'St. Francis Memorial Hospital',
      position: { lng: -122.4198, lat: 37.7925 },
      type: 'cardiac',
      capacity: 40,
      availableBeds: 8
    },
    {
      id: 'KAISER',
      name: 'Kaiser Permanente SF',
      position: { lng: -122.4467, lat: 37.7848 },
      type: 'general',
      capacity: 55,
      availableBeds: 15
    }
  ]);

  // Emergency units with realistic patrol patterns - Only dispatched units have routes
  const [units, setUnits] = useState<EmergencyUnit[]>([
    // DISPATCHED UNITS (Only these should have routes)
    { 
      id: 'AMB-01', 
      type: 'ambulance', 
      status: 'enroute', 
      position: { lng: -122.4094, lat: 37.7849 }, 
      assignedIncident: 'INC-001', 
      eta: 3,
      speed: 0.000003, // Emergency response movement
      heading: 45,
      homeBase: { lng: -122.4094, lat: 37.7849 },
      patrolBehavior: 'strategic_positioning'
    },
    { 
      id: 'FIRE-01', 
      type: 'fire', 
      status: 'onscene', 
      position: { lng: -122.4194, lat: 37.7749 }, 
      assignedIncident: 'INC-002',
      speed: 0,
      heading: 0,
      homeBase: { lng: -122.4194, lat: 37.7749 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'FIRE-02', 
      type: 'fire', 
      status: 'available', 
      position: { lng: -122.4394, lat: 37.7549 },
      speed: 0,
      heading: 90,
      homeBase: { lng: -122.4394, lat: 37.7549 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'PD-03', 
      type: 'police', 
      status: 'onscene', 
      position: { lng: -122.4194, lat: 37.7749 }, 
      assignedIncident: 'INC-002', 
      eta: null,
      speed: 0,
      heading: 0,
      homeBase: { lng: -122.4194, lat: 37.7749 },
      patrolBehavior: 'stationary'
    },
    
    // AVAILABLE UNITS (No routes, ready and alert)
    { 
      id: 'AMB-02', 
      type: 'ambulance', 
      status: 'available', 
      position: { lng: -122.4294, lat: 37.7849 },
      speed: 0,
      heading: 180,
      homeBase: { lng: -122.4294, lat: 37.7849 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'AMB-03', 
      type: 'ambulance', 
      status: 'available', 
      position: { lng: -122.4044, lat: 37.7599 },
      speed: 0,
      heading: 270,
      homeBase: { lng: -122.4044, lat: 37.7599 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'AMB-04', 
      type: 'ambulance', 
      status: 'available', 
      position: { lng: -122.4544, lat: 37.7699 },
      speed: 0,
      heading: 90,
      homeBase: { lng: -122.4544, lat: 37.7699 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'FIRE-03', 
      type: 'fire', 
      status: 'available', 
      position: { lng: -122.4394, lat: 37.7499 },
      speed: 0,
      heading: 135,
      homeBase: { lng: -122.4394, lat: 37.7499 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'FIRE-04', 
      type: 'fire', 
      status: 'available', 
      position: { lng: -122.4144, lat: 37.7599 },
      speed: 0,
      heading: 225,
      homeBase: { lng: -122.4144, lat: 37.7599 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'FIRE-05', 
      type: 'fire', 
      status: 'available', 
      position: { lng: -122.4444, lat: 37.7799 },
      speed: 0,
      heading: 0,
      homeBase: { lng: -122.4444, lat: 37.7799 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'PD-01', 
      type: 'police', 
      status: 'available', 
      position: { lng: -122.4344, lat: 37.7749 },
      speed: 0,
      heading: 315,
      homeBase: { lng: -122.4344, lat: 37.7749 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'PD-02', 
      type: 'police', 
      status: 'available', 
      position: { lng: -122.4244, lat: 37.7699 },
      speed: 0,
      heading: 225,
      homeBase: { lng: -122.4244, lat: 37.7699 },
      patrolBehavior: 'stationary'
    },
    { 
      id: 'PD-04', 
      type: 'police', 
      status: 'available', 
      position: { lng: -122.4100, lat: 37.7650 },
      speed: 0,
      heading: 60,
      homeBase: { lng: -122.4100, lat: 37.7650 },
      patrolBehavior: 'stationary'
    }



  ]);

  // All incidents with proper urgency-based response assignments
  const [incidents, setIncidents] = useState<MapIncident[]>([
    { 
      id: 'INC-001', 
      type: 'medical', 
      position: { lng: -122.4164, lat: 37.7764 }, 
      status: 'dispatched', 
      priority: 'critical',
      unitsAssigned: ['AMB-01'],
      isVictim: true
    },
    { 
      id: 'INC-002', 
      type: 'fire', 
      position: { lng: -122.4194, lat: 37.7749 }, 
      status: 'active', 
      priority: 'high',
      unitsAssigned: ['FIRE-01', 'PD-03'],
      isVictim: false
    },
    { 
      id: 'INC-003', 
      type: 'medical', 
      position: { lng: -122.4174, lat: 37.7774 }, 
      status: 'active', 
      priority: 'medium',
      unitsAssigned: [],
      isVictim: false
    },
    { 
      id: 'INC-004', 
      type: 'police', 
      position: { lng: -122.4320, lat: 37.7580 }, 
      status: 'active', 
      priority: 'low',
      unitsAssigned: [],
      isVictim: false
    }
  ]);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [routeMode, setRouteMode] = useState<'optimal' | 'fastest' | 'alternative'>('optimal');
  const [calculatedRoutes, setCalculatedRoutes] = useState<{[key: string]: any}>({});
  const [showPathHistory, setShowPathHistory] = useState(true);
  const [unitPaths, setUnitPaths] = useState<{[key: string]: {lng: number, lat: number, timestamp: number}[]}>({});
  const [pathOptimization, setPathOptimization] = useState<'time' | 'distance' | 'traffic'>('time');
  
  // Routing optimization state
  const [routeAssignments, setRouteAssignments] = useState<RouteAssignment[]>([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState<any[]>([]);
  const [assignedUnits, setAssignedUnits] = useState<string[]>([]);
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [lastIncidentCount, setLastIncidentCount] = useState(0);
  const [lastUnitCount, setLastUnitCount] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Set your Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlcnJ5Y2FvMTgiLCJhIjoiY21nMm50YTAyMTFrbjJqcHVmb3NlbnlpNSJ9.Hlnfxvju35IL_FZphm55pg';
    
    // Check if we have a valid token
    const tokenPlaceholder = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';
    const mockToken = 'mock-token';
    const hasValidToken = mapboxgl.accessToken && mapboxgl.accessToken !== tokenPlaceholder && !mapboxgl.accessToken.includes(mockToken);
    
    if (!hasValidToken) {
      console.warn('Mapbox token not configured. Please add your token to the MapboxEmergencyMap component.');
      setMapLoaded(false);
      if (onError) onError();
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-122.4194, 37.7749], // San Francisco coordinates
        zoom: 13,
        pitch: 0,
        bearing: 0,
        attributionControl: true,
        preserveDrawingBuffer: true,
        antialias: true
      });

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setMapLoaded(true);
        
        try {
          addMapSources();
          addMapLayers();
          updateMapData();
          console.log('Map sources and layers added successfully');
        } catch (error) {
          console.error('Error adding map sources/layers:', error);
          setMapLoaded(false);
          if (onError) {
            onError();
          }
        }
        
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
            map.current.triggerRepaint();
          }
        }, 100);
        
        if (onLoad) {
          onLoad();
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error?.message || 'Unknown Mapbox error');
        setMapLoaded(false);
        if (onError) {
          console.log('Falling back to SVG map due to Mapbox error');
          onError();
        }
      });
      
      map.current.on('styledata', () => {
        if (map.current) {
          map.current.resize();
        }
      });

      // Add navigation controls
      const navControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false
      });
      
      map.current.addControl(navControl, 'top-right');
      
      // Handle container resize
      try {
        resizeObserver.current = new ResizeObserver(() => {
          if (map.current) {
            map.current.resize();
          }
        });
        
        if (mapContainer.current) {
          resizeObserver.current.observe(mapContainer.current);
        }
      } catch (e) {
        console.warn('ResizeObserver not supported:', e);
      }

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapLoaded(false);
      if (onError) onError();
    }

    return () => {
      if (resizeObserver.current) {
        try {
          resizeObserver.current.disconnect();
          resizeObserver.current = null;
        } catch (e) {
          console.warn('Error disconnecting resize observer:', e);
        }
      }
      
      if (map.current) {
        try {
          map.current.off();
          map.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        map.current = null;
      }
    };
  }, []);

  // Add map sources
  const addMapSources = () => {
    if (!map.current) return;

    try {
      // Emergency units source
      map.current.addSource('units', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Incidents source
      map.current.addSource('incidents', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Victim radar pulse source
      map.current.addSource('victim-radar', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Hospitals source
      map.current.addSource('hospitals', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Hospital labels source (separate for point geometry)
      map.current.addSource('hospital-labels', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Routes source
      map.current.addSource('routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Optimal paths source
      map.current.addSource('optimal-paths', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Path history source
      map.current.addSource('path-history', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

    } catch (error) {
      console.error('Error adding map sources:', error);
      throw error;
    }
  };

  // Add map layers
  const addMapLayers = () => {
    if (!map.current) return;

    try {
      // Path history layer (faded trails)
      map.current.addLayer({
        id: 'path-history',
        type: 'line',
        source: 'path-history',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2,
          'line-opacity': 0.4
        }
      });

      // Optimal paths layer
      map.current.addLayer({
        id: 'optimal-paths',
        type: 'line', 
        source: 'optimal-paths',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['case',
            ['has', 'color'], ['get', 'color'],
            '#22c55e' // default green color
          ],
          'line-width': ['case',
            ['has', 'strokeWidth'], ['get', 'strokeWidth'],
            4 // default width
          ],
          'line-opacity': ['case',
            ['has', 'opacity'], ['get', 'opacity'],
            0.8 // default opacity
          ],
          'line-dasharray': ['case', 
            ['==', ['get', 'segmentType'], 'victim-to-hospital'], ['literal', [5, 5]],
            ['==', ['get', 'segmentType'], 'no-unit-warning'], ['literal', [3, 3]],
            ['literal', [1, 0]] // solid line default
          ]
        }
      });

      // Route lines layer  
      map.current.addLayer({
        id: 'routes',
        type: 'line',
        source: 'routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Victim radar pulse layer (animated) - DISABLED FOR DEBUGGING
      /*
      map.current.addLayer({
        id: 'victim-radar',
        type: 'circle',
        source: 'victim-radar',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 20,
            15, 40,
            20, 80
          ],
          'circle-color': '#dc2626',
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 0.1,
            0.5, 0.4,
            1, 0.1
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#dc2626',
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 0.8,
            0.5, 1,
            1, 0.8
          ]
        }
      });
      */

      // Hospitals layer - DISABLED FOR DEBUGGING
      /*
      map.current.addLayer({
        id: 'hospitals',
        type: 'circle',
        source: 'hospitals',
        paint: {
          'circle-radius': 12,
          'circle-color': '#22c55e',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });
      */

      // Hospitals layer (green squares)
      map.current.addLayer({
        id: 'hospitals',
        type: 'fill',
        source: 'hospitals',
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.8
        }
      });

      // Hospital borders
      map.current.addLayer({
        id: 'hospital-borders',
        type: 'line',
        source: 'hospitals', 
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 1
        }
      });

      // Hospital labels
      map.current.addLayer({
        id: 'hospital-labels',
        type: 'symbol',
        source: 'hospital-labels',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, -2.5],
          'text-anchor': 'bottom'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Emergency units layer (colored circles)
      map.current.addLayer({
        id: 'units',
        type: 'circle',
        source: 'units',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'selected'], true], 12,
            10
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'selected'], true], 3,
            2
          ],
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Unit labels - DISABLED
      /*
      map.current.addLayer({
        id: 'unit-labels',
        type: 'symbol',
        source: 'units',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, -2],
          'text-anchor': 'bottom'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });
      */

      // Victim radar pulse layer (animated)
      map.current.addLayer({
        id: 'victim-radar',
        type: 'circle',
        source: 'victim-radar',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 20,
            15, 40,
            20, 80
          ],
          'circle-color': '#dc2626',
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 0.1,
            0.5, 0.4,
            1, 0.1
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#dc2626',
          'circle-stroke-opacity': [
            'interpolate',
            ['linear'],
            ['get', 'pulse'],
            0, 0.8,
            0.5, 1,
            1, 0.8
          ]
        }
      });

      // Incidents layer (including victims as red circles)
      map.current.addLayer({
        id: 'incidents',
        type: 'circle',
        source: 'incidents',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'isVictim'], true], 15,
            12
          ],
          'circle-color': ['get', 'color'],
          'circle-stroke-width': [
            'case',
            ['==', ['get', 'isVictim'], true], 4,
            3
          ],
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Incident labels - DISABLED
      /*
      map.current.addLayer({
        id: 'incident-labels',
        type: 'symbol',
        source: 'incidents',
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, -2],
          'text-anchor': 'bottom'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });
      */

      // Add click handlers
      map.current.on('click', 'units', (e) => {
        if (e.features && e.features[0]) {
          setSelectedUnit(e.features[0].properties?.id || null);
        }
      });

      map.current.on('click', 'incidents', (e) => {
        if (e.features && e.features[0]) {
          setSelectedIncident(e.features[0].properties?.id || null);
        }
      });

      // Change cursor on hover
      ['units', 'incidents', 'hospitals'].forEach(layer => {
        map.current!.on('mouseenter', layer, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current!.on('mouseleave', layer, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });
      });

    } catch (error) {
      console.error('Error adding map layers:', error);
      throw error;
    }
  };

  // Calculate distance between two points
  const calculateDistance = (a: {lng: number, lat: number}, b: {lng: number, lat: number}) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const h = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
    
    return R * c;
  };

  // Find closest available unit to victim
  const findClosestUnit = (victimPosition: {lng: number, lat: number}, unitType?: string) => {
    let availableUnits = units.filter(unit => unit.status === 'available');
    
    if (unitType) {
      availableUnits = availableUnits.filter(unit => unit.type === unitType);
    }

    if (availableUnits.length === 0) return null;

    let closestUnit = availableUnits[0];
    let minDistance = calculateDistance(victimPosition, closestUnit.position);

    availableUnits.forEach(unit => {
      const distance = calculateDistance(victimPosition, unit.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestUnit = unit;
      }
    });

    return { unit: closestUnit, distance: minDistance };
  };

  // Get color for unit based on type and status
  const getUnitColor = (type: string, status: string) => {
    // Base colors by unit type
    const baseColors = {
      ambulance: '#3b82f6', // blue
      fire: '#f97316', // orange  
      police: '#eab308' // yellow
    };

    const baseColor = baseColors[type as keyof typeof baseColors] || '#6b7280';
    
    // Modify opacity/brightness based on status
    switch (status) {
      case 'available': return baseColor; // full color
      case 'enroute': return baseColor; // full color
      case 'onscene': return '#ef4444'; // red for all on-scene units
      case 'returning': 
        // Convert hex to RGB and add alpha for transparency
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, 0.5)`; // semi-transparent
      default: return '#6b7280'; // gray
    }
  };

  // Get color for incident priority
  const getIncidentColor = (priority: string, isVictim: boolean = false) => {
    if (isVictim) {
      return '#dc2626'; // bright red for victims
    }
    switch (priority) {
      case 'critical': return '#dc2626'; // red
      case 'high': return '#f59e0b'; // orange
      case 'medium': return '#eab308'; // yellow
      case 'low': return '#22c55e'; // green
      default: return '#6b7280'; // gray
    }
  };

  // Update map data
  const updateMapData = () => {
    if (!map.current || !mapLoaded) return;

    try {
      // Update units (filter based on activeFilters)
      const unitFeatures = units.filter(shouldShowUnit).map(unit => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [unit.position.lng, unit.position.lat]
        },
        properties: {
          id: unit.id,
          type: unit.type,
          status: unit.status,
          color: getUnitColor(unit.type, unit.status),
          label: unit.id,
          selected: selectedUnit === unit.id,
          eta: unit.eta || 0
        }
      }));

      // Update incidents (filter based on activeFilters)
      const incidentFeatures = incidents.filter(shouldShowIncident).map(incident => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [incident.position.lng, incident.position.lat]
        },
        properties: {
          id: incident.id,
          type: incident.type,
          priority: incident.priority,
          color: getIncidentColor(incident.priority, incident.isVictim),
          label: incident.id,
          selected: selectedIncident === incident.id,
          isVictim: incident.isVictim || false
        }
      }));

      // Create victim radar pulses - optimized calculation (filter based on activeFilters)
      const pulseTime = (Date.now() % 3000) / 3000; // Increased to 3 second cycle for smoother animation
      const victimRadarFeatures = incidents
        .filter(incident => incident.isVictim && shouldShowIncident(incident))
        .map(victim => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [victim.position.lng, victim.position.lat]
          },
          properties: {
            id: victim.id,
            pulse: pulseTime
          }
        }));

      // Update hospitals (as rectangles) - filter based on activeFilters
      const hospitalFeatures = shouldShowHospitals() ? hospitals.map(hospital => {
        const size = 0.0008; // Rectangle size in degrees - reduced for less prominence
        const lng = hospital.position.lng;
        const lat = hospital.position.lat;
        
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [lng - size, lat - size],
              [lng + size, lat - size],
              [lng + size, lat + size],
              [lng - size, lat + size],
              [lng - size, lat - size]
            ]]
          },
          properties: {
            id: hospital.id,
            name: hospital.name,
            type: hospital.type,
            capacity: hospital.capacity,
            availableBeds: hospital.availableBeds
          }
        };
      }) : [];

      // Use pre-calculated optimal routes for rendering
      let optimalPathFeatures: any[] = [];
      
      if (showRoutes && activeFilters.optimalRoutes) {
        // Use the optimized routes calculated by the real-time system
        optimalPathFeatures = [...optimizedRoutes];
        
        // URGENCY-BASED EMERGENCY RESPONSE: Assign responders based on incident priority
        const connectedUnits = new Set(); // Track which units already have connections
        
        // Process ALL incidents based on urgency level (not just victims)
        incidents.forEach(incident => {
          
          // Determine response level based on urgency/priority
          const needsFire = incident.priority === 'critical' || incident.priority === 'high';
          const needsEMS = incident.priority === 'critical' || incident.priority === 'medium';
          const needsPolice = true; // All incidents get police response
          const needsHospital = incident.priority === 'critical' || incident.priority === 'medium' || incident.priority === 'high';

          // 1. FIRE TRUCK - Only for CRITICAL/HIGH urgency incidents
          if (needsFire) {
            const availableFire = units.filter(u => 
              u.type === 'fire' && 
              (u.status === 'available' || (u.status === 'onscene' && u.assignedIncident === incident.id)) &&
              !connectedUnits.has(u.id)
            );
            
            if (availableFire.length > 0) {
              const closestFire = availableFire.reduce((closest, unit) => {
                const incidentDist = Math.sqrt(
                  Math.pow(incident.position.lng - unit.position.lng, 2) + 
                  Math.pow(incident.position.lat - unit.position.lat, 2)
                );
                const closestDist = Math.sqrt(
                  Math.pow(incident.position.lng - closest.position.lng, 2) + 
                  Math.pow(incident.position.lat - closest.position.lat, 2)
                );
                return incidentDist < closestDist ? unit : closest;
              });

              // Add Fire-to-incident route
              optimalPathFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [closestFire.position.lng, closestFire.position.lat],
                    [incident.position.lng, incident.position.lat]
                  ]
                },
                properties: {
                  unitId: closestFire.id,
                  incidentId: incident.id,
                  color: closestFire.status === 'onscene' ? '#dc2626' : '#f97316', // red if on scene, orange if potential
                  strokeWidth: incident.priority === 'critical' ? 6 : 5,
                  opacity: closestFire.status === 'onscene' ? 1.0 : 0.8,
                  segmentType: closestFire.status === 'onscene' ? 'active-fire' : 'potential-fire',
                  priority: incident.priority
                }
              });
              
              connectedUnits.add(closestFire.id);
            }
          }

          // 2. EMS UNIT - For CRITICAL/MEDIUM urgency incidents  
          if (needsEMS) {
            const availableEMS = units.filter(u => 
              u.type === 'ambulance' && 
              (u.status === 'available' || (u.status === 'enroute' && u.assignedIncident === incident.id)) &&
              !connectedUnits.has(u.id)
            );
            
            if (availableEMS.length > 0) {
              const closestEMS = availableEMS.reduce((closest, unit) => {
                const incidentDist = Math.sqrt(
                  Math.pow(incident.position.lng - unit.position.lng, 2) + 
                  Math.pow(incident.position.lat - unit.position.lat, 2)
                );
                const closestDist = Math.sqrt(
                  Math.pow(incident.position.lng - closest.position.lng, 2) + 
                  Math.pow(incident.position.lat - closest.position.lat, 2)
                );
                return incidentDist < closestDist ? unit : closest;
              });

              // Add EMS-to-incident route
              optimalPathFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [closestEMS.position.lng, closestEMS.position.lat],
                    [incident.position.lng, incident.position.lat]
                  ]
                },
                properties: {
                  unitId: closestEMS.id,
                  incidentId: incident.id,
                  color: closestEMS.status === 'enroute' ? '#dc2626' : '#3b82f6', // red if active, blue if potential
                  strokeWidth: closestEMS.status === 'enroute' ? 5 : 4,
                  opacity: closestEMS.status === 'enroute' ? 1.0 : 0.8,
                  segmentType: closestEMS.status === 'enroute' ? 'active-ems' : 'potential-ems',
                  priority: incident.priority
                }
              });
              
              connectedUnits.add(closestEMS.id);
            }
          }

          // 3. POLICE UNIT - ALL incidents get police response
          if (needsPolice) {
            const availablePolice = units.filter(u => 
              u.type === 'police' && 
              (u.status === 'available' || (u.status === 'onscene' && u.assignedIncident === incident.id)) &&
              !connectedUnits.has(u.id)
            );
            
            if (availablePolice.length > 0) {
              const closestPolice = availablePolice.reduce((closest, unit) => {
                const incidentDist = Math.sqrt(
                  Math.pow(incident.position.lng - unit.position.lng, 2) + 
                  Math.pow(incident.position.lat - unit.position.lat, 2)
                );
                const closestDist = Math.sqrt(
                  Math.pow(incident.position.lng - closest.position.lng, 2) + 
                  Math.pow(incident.position.lat - closest.position.lat, 2)
                );
                return incidentDist < closestDist ? unit : closest;
              });

              // Add Police-to-incident route
              optimalPathFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [closestPolice.position.lng, closestPolice.position.lat],
                    [incident.position.lng, incident.position.lat]
                  ]
                },
                properties: {
                  unitId: closestPolice.id,
                  incidentId: incident.id,
                  color: closestPolice.status === 'onscene' ? '#10b981' : '#eab308', // green if on scene, yellow if potential
                  strokeWidth: incident.priority === 'low' ? 3 : 4, // thinner line for low priority
                  opacity: closestPolice.status === 'onscene' ? 1.0 : 0.7,
                  segmentType: closestPolice.status === 'onscene' ? 'active-police' : 'potential-police',
                  priority: incident.priority
                }
              });
              
              connectedUnits.add(closestPolice.id);
            }
          }

          // 4. HOSPITAL - Only for incidents needing medical transport (not low priority)
          if (needsHospital && hospitals.length > 0) {
            const closestHospital = hospitals.reduce((closest, hospital) => {
              const incidentDist = Math.sqrt(
                Math.pow(incident.position.lng - hospital.position.lng, 2) + 
                Math.pow(incident.position.lat - hospital.position.lat, 2)
              );
              const closestDist = Math.sqrt(
                Math.pow(incident.position.lng - closest.position.lng, 2) + 
                Math.pow(incident.position.lat - closest.position.lat, 2)
              );
              return incidentDist < closestDist ? hospital : closest;
            });

            // Add incident-to-hospital transport route
            optimalPathFeatures.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [incident.position.lng, incident.position.lat],
                  [closestHospital.position.lng, closestHospital.position.lat]
                ]
              },
              properties: {
                incidentId: incident.id,
                hospitalId: closestHospital.id,
                color: incident.priority === 'critical' ? '#f59e0b' : '#a3a3a3', // amber for critical, gray for others
                strokeWidth: incident.priority === 'critical' ? 4 : 3,
                opacity: incident.priority === 'critical' ? 0.9 : 0.6,
                segmentType: 'incident-to-hospital',
                priority: incident.priority,
                dashArray: [5, 5] // dashed line for hospital transport
              }
            });
          }
        });



        console.log('🗺️ Generated route features:', optimalPathFeatures.length);
      }

      // Path history features - DISABLED FOR DEBUGGING
      const pathHistoryFeatures: any[] = [];
      /* PATH HISTORY DISABLED FOR DEBUGGING
      if (showPathHistory) {
        Object.entries(unitPaths).forEach(([unitId, path]) => {
          if (path.length > 1) {
            pathHistoryFeatures.push({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: path.map(point => [point.lng, point.lat])
              },
              properties: {
                unitId: unitId,
                color: getUnitColor(units.find(u => u.id === unitId)?.type || 'ambulance', units.find(u => u.id === unitId)?.status || 'available')
              }
            });
          }
        });
      }
      */

      // Update map sources
      const unitsSource = map.current.getSource('units') as mapboxgl.GeoJSONSource;
      if (unitsSource) {
        unitsSource.setData({
          type: 'FeatureCollection',
          features: unitFeatures
        });
      }

      const incidentsSource = map.current.getSource('incidents') as mapboxgl.GeoJSONSource;
      if (incidentsSource) {
        incidentsSource.setData({
          type: 'FeatureCollection',
          features: incidentFeatures
        });
      }

      const victimRadarSource = map.current.getSource('victim-radar') as mapboxgl.GeoJSONSource;
      if (victimRadarSource) {
        victimRadarSource.setData({
          type: 'FeatureCollection',
          features: victimRadarFeatures
        });
      }

      const hospitalsSource = map.current.getSource('hospitals') as mapboxgl.GeoJSONSource;
      if (hospitalsSource && showHospitals) {
        hospitalsSource.setData({
          type: 'FeatureCollection',
          features: hospitalFeatures
        });
        
        // Also update hospital labels with point geometry
        const hospitalLabelFeatures = hospitals.map(hospital => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [hospital.position.lng, hospital.position.lat]
          },
          properties: {
            id: hospital.id,
            name: hospital.name,
            type: hospital.type,
            capacity: hospital.capacity,
            availableBeds: hospital.availableBeds
          }
        }));
        
        // Update the hospital labels source
        const hospitalLabelsSource = map.current.getSource('hospital-labels') as mapboxgl.GeoJSONSource;
        if (hospitalLabelsSource) {
          hospitalLabelsSource.setData({
            type: 'FeatureCollection',
            features: hospitalLabelFeatures
          });
        }
      }

      // Update optimal routes source
      const optimalPathsSource = map.current.getSource('optimal-paths') as mapboxgl.GeoJSONSource;
      if (optimalPathsSource) {
        console.log('🗺️ Updating optimal routes with features:', optimalPathFeatures.length, optimalPathFeatures);
        optimalPathsSource.setData({
          type: 'FeatureCollection',
          features: optimalPathFeatures
        });
      }

      // Update path history source
      const pathHistorySource = map.current.getSource('path-history') as mapboxgl.GeoJSONSource;
      if (pathHistorySource && showPathHistory) {
        const pathHistoryFeatures: any[] = [];
        
        if (showPathHistory) {
          Object.entries(unitPaths).forEach(([unitId, path]) => {
            if (path.length > 1) {
              pathHistoryFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: path.map(point => [point.lng, point.lat])
                },
                properties: {
                  unitId: unitId,
                  color: getUnitColor(units.find(u => u.id === unitId)?.type || 'ambulance', units.find(u => u.id === unitId)?.status || 'available')
                }
              });
            }
          });
        }
        
        pathHistorySource.setData({
          type: 'FeatureCollection',
          features: pathHistoryFeatures
        });
      }

    } catch (error) {
      console.error('Error updating map data:', error);
    }
  };

  // Update map when data changes - debounced with longer delay
  useEffect(() => {
    if (mapLoaded) {
      const timeoutId = setTimeout(() => {
        updateMapData();
      }, 200); // Increased delay to 200ms to reduce rapid updates
      
      return () => clearTimeout(timeoutId);
    }
  }, [units, incidents, selectedUnit, selectedIncident, showRoutes, showHospitals, showPathHistory, mapLoaded, activeFilters]);

  // Real-time emergency detection and route calculation
  useEffect(() => {
    const currentIncidentCount = incidents.filter(inc => inc.isVictim && inc.status === 'active').length;
    const currentUnitCount = units.filter(unit => unit.status === 'available').length;
    
    // Check for new emergencies or changes in available units
    if (currentIncidentCount !== lastIncidentCount || currentUnitCount !== lastUnitCount) {
      console.log('🚨 Emergency status change detected:', {
        newIncidents: currentIncidentCount > lastIncidentCount,
        incidentCount: currentIncidentCount,
        unitCount: currentUnitCount
      });
      
      setLastIncidentCount(currentIncidentCount);
      setLastUnitCount(currentUnitCount);
      
      // Trigger immediate route calculation if there are active victims
      if (currentIncidentCount > 0) {
        setRoutingInProgress(true);
        
        // Show toast notification for route calculation start
        toast.info('🧠 AI calculating optimal emergency routes...', {
          duration: 2000,
        });
        
        // Simulate real-time route calculation with slight delay for realism
        setTimeout(() => {
          try {
            console.log('🧠 Starting route optimization...');
            
            // Get optimized route assignments
            const assignments = RouteOptimizer.optimizeRoutes(units, incidents, hospitals);
            
            console.log('✅ Route optimization complete:', assignments);
            
            // Update the route assignments state immediately
            setRouteAssignments(assignments);
            
            // Get visualization data
            const { routeLines, assignedUnits: newAssignedUnits } = RouteOptimizer.getRouteVisualizationData(assignments);
            
            // Update assigned units state
            setAssignedUnits(newAssignedUnits);
            
            // Store the route lines
            setOptimizedRoutes(routeLines);
            
            setRoutingInProgress(false);
            
            console.log('🎯 Routes deployed:', newAssignedUnits);
            
            // Show success toast with route details
            if (assignments.length > 0) {
              toast.success(`✅ ${assignments.length} optimal routes deployed successfully`, {
                description: `Units dispatched: ${newAssignedUnits.join(', ')}`,
                duration: 3000,
              });
            }
            
          } catch (error) {
            console.error('❌ Route optimization failed:', error);
            setRoutingInProgress(false);
            
            toast.error('❌ Route optimization failed', {
              description: 'Please try again or check system status',
              duration: 4000,
            });
          }
        }, 300); // Small delay to show processing
      }
    }
  }, [incidents, units, lastIncidentCount, lastUnitCount, hospitals]);

  // Auto-update unit statuses based on route assignments
  useEffect(() => {
    if (routeAssignments.length > 0) {
      console.log('🚑 Updating unit statuses based on assignments...');
      
      setUnits(prevUnits => 
        prevUnits.map(unit => {
          // Find if this unit is assigned to any route
          const assignment = routeAssignments.find(a => a.unitId === unit.id);
          
          if (assignment) {
            // Unit is assigned - set to enroute if currently available
            if (unit.status === 'available') {
              const victim = incidents.find(inc => inc.id === assignment.victimId);
              console.log(`📡 Dispatching ${unit.id} to ${assignment.victimId}`);
              return {
                ...unit,
                status: 'enroute' as const,
                assignedIncident: assignment.victimId,
                eta: Math.round(assignment.estimatedTime),
                speed: 0.000003 // Set emergency response speed
              };
            }
          } else if (assignedUnits.length > 0 && !assignedUnits.includes(unit.id)) {
            // Unit is not assigned and there are assignments - ensure it's available if not busy
            if (unit.status === 'enroute' && !unit.assignedIncident) {
              return {
                ...unit,
                status: 'available' as const,
                assignedIncident: undefined,
                eta: undefined,
                speed: unit.type === 'police' ? 0.0000002 : 
                       unit.type === 'ambulance' ? 0.0000001 : 0.00000008
              };
            }
          }
          
          return unit;
        })
      );
    }
  }, [routeAssignments, assignedUnits, incidents]);

  // Function to simulate new emergencies (for demo purposes)
  const simulateNewEmergency = () => {
    const newIncidentId = `INC-${Date.now()}`;
    const emergencyTypes = ['medical', 'fire', 'police'] as const;
    const priorities = ['critical', 'high', 'medium'] as const;
    
    // Random position within San Francisco bounds
    const position = {
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
      lat: 37.7749 + (Math.random() - 0.5) * 0.1
    };
    
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const isVictim = Math.random() > 0.2; // 80% chance of being a victim requiring emergency response
    
    const newIncident: MapIncident = {
      id: newIncidentId,
      type: emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)],
      position: position,
      status: 'active',
      priority: priority,
      unitsAssigned: [],
      isVictim: isVictim
    };
    
    setIncidents(prev => [...prev, newIncident]);
    console.log('🚨 NEW EMERGENCY SIMULATED:', newIncident);
    
    // Show immediate feedback that a new victim was added
    if (isVictim) {
      toast.info(`🚨 New ${priority.toUpperCase()} emergency victim detected!`, {
        description: `${newIncident.type} incident at ${newIncident.position.lat.toFixed(4)}, ${newIncident.position.lng.toFixed(4)} - Route lines will auto-generate`,
        duration: 4000,
      });
    }
  };

  // Listen for test emergency events from dashboard button
  useEffect(() => {
    const handleTestEmergency = (event: CustomEvent) => {
      console.log('🎯 Test emergency triggered:', event.detail);
      simulateNewEmergency();
    };

    const handleForceRouteCalculation = () => {
      console.log('🎯 Manual route calculation triggered');
      
      const activeVictims = incidents.filter(inc => inc.isVictim && inc.status === 'active');
      if (activeVictims.length > 0) {
        setRoutingInProgress(true);
        
        toast.info('🧠 Manual route calculation started...', {
          duration: 2000,
        });
        
        setTimeout(() => {
          try {
            const assignments = RouteOptimizer.optimizeRoutes(units, incidents, hospitals);
            setRouteAssignments(assignments);
            
            const { routeLines, assignedUnits: newAssignedUnits } = RouteOptimizer.getRouteVisualizationData(assignments);
            setAssignedUnits(newAssignedUnits);
            setOptimizedRoutes(routeLines);
            
            setRoutingInProgress(false);
            
            toast.success(`✅ ${assignments.length} routes calculated manually`, {
              description: `Units: ${newAssignedUnits.join(', ')}`,
              duration: 3000,
            });
          } catch (error) {
            console.error('❌ Manual route calculation failed:', error);
            setRoutingInProgress(false);
            toast.error('❌ Manual route calculation failed');
          }
        }, 500);
      } else {
        toast.info('No active emergencies requiring routes', {
          duration: 2000,
        });
      }
    };

    window.addEventListener('testEmergency', handleTestEmergency as EventListener);
    window.addEventListener('forceRouteCalculation', handleForceRouteCalculation as EventListener);
    
    return () => {
      window.removeEventListener('testEmergency', handleTestEmergency as EventListener);
      window.removeEventListener('forceRouteCalculation', handleForceRouteCalculation as EventListener);
    };
  }, [incidents, units, hospitals]);

  // Simulate new emergencies periodically (every 45 seconds for demo)
  useEffect(() => {
    const emergencySimulationInterval = setInterval(() => {
      // Only simulate if we have less than 5 active incidents
      const activeIncidents = incidents.filter(inc => inc.status === 'active');
      if (activeIncidents.length < 5) {
        simulateNewEmergency();
      }
    }, 45000); // 45 seconds

    return () => clearInterval(emergencySimulationInterval);
  }, [incidents]);

  // Removed redundant radar animation - handled above

  // Simulate unit movement - separate intervals for patrol vs emergency
  useEffect(() => {
    // Emergency movement - faster updates
    const emergencyMovementInterval = setInterval(() => {
      const currentTime = Date.now();
      
      setUnits(prev => prev.map(unit => {
        if (unit.status !== 'enroute' && unit.status !== 'returning') return unit;
        
        // Store current position in path history for emergency units
        setUnitPaths(prevPaths => {
          const currentPath = prevPaths[unit.id] || [];
          const newPath = [...currentPath, {
            lng: unit.position.lng,
            lat: unit.position.lat,
            timestamp: currentTime
          }];
          
          // Keep only last 50 positions for performance
          if (newPath.length > 50) {
            newPath.shift();
          }
          
          return {
            ...prevPaths,
            [unit.id]: newPath
          };
        });

        // Emergency response movement logic
        if (unit.speed && unit.speed > 0) {
          const newPosition = { ...unit.position };
          let updatedUnit = { ...unit };
          
          if (unit.status === 'enroute' && unit.assignedIncident) {
            // Move towards assigned incident (emergency response)
            const incident = incidents.find(inc => inc.id === unit.assignedIncident);
            if (incident) {
              const dx = incident.position.lng - unit.position.lng;
              const dy = incident.position.lat - unit.position.lat;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0.00002) { // Still moving - much smaller threshold
                const moveX = (dx / distance) * unit.speed;
                const moveY = (dy / distance) * unit.speed;
                
                newPosition.lng += moveX;
                newPosition.lat += moveY;
                
                // Update heading to face incident
                updatedUnit.heading = Math.atan2(dy, dx) * (180 / Math.PI);
              } else {
                // Arrived at incident
                return { ...unit, status: 'onscene', speed: 0 };
              }
            }
          } else if (unit.status === 'returning' && unit.homeBase) {
            // Return to base
            const dx = unit.homeBase.lng - unit.position.lng;
            const dy = unit.homeBase.lat - unit.position.lat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.00002) {
              const moveX = (dx / distance) * unit.speed;
              const moveY = (dy / distance) * unit.speed;
              
              newPosition.lng += moveX;
              newPosition.lat += moveY;
              
              updatedUnit.heading = Math.atan2(dy, dx) * (180 / Math.PI);
            } else {
              // Arrived at base - resume patrol
              return { 
                ...unit, 
                status: 'available', 
                speed: unit.type === 'police' ? 0.0000002 : unit.type === 'ambulance' ? 0.0000001 : 0.00000008,
                currentPatrolIndex: 0
              };
            }
          }
          
          return { ...updatedUnit, position: newPosition };
        }
        
        return unit;
      }));
    }, 800); // Slightly faster updates for emergency movement

    // Patrol movement - much slower updates
    const patrolMovementInterval = setInterval(() => {
      const currentTime = Date.now();
      
      setUnits(prev => prev.map(unit => {
        if (unit.status !== 'available') return unit;
        
        // Store current position in path history for patrol units (less frequently)
        setUnitPaths(prevPaths => {
          const currentPath = prevPaths[unit.id] || [];
          const newPath = [...currentPath, {
            lng: unit.position.lng,
            lat: unit.position.lat,
            timestamp: currentTime
          }];
          
          // Keep only last 30 positions for patrol units
          if (newPath.length > 30) {
            newPath.shift();
          }
          
          return {
            ...prevPaths,
            [unit.id]: newPath
          };
        });

        // Gentle patrol movement logic
        if (unit.speed && unit.speed > 0) {
          const newPosition = { ...unit.position };
          let updatedUnit = { ...unit };
          
          // Ultra-smooth patrol movement for available units
          if (unit.patrolRoute && unit.patrolRoute.length > 0) {
            const currentTargetIndex = unit.currentPatrolIndex || 0;
            const target = unit.patrolRoute[currentTargetIndex];
            
            const dx = target.lng - unit.position.lng;
            const dy = target.lat - unit.position.lat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0.00001) { // Very small threshold for smooth arrival
              // Add slight curve to movement for more natural patrol behavior
              const baseHeading = Math.atan2(dy, dx);
              const curveAmount = Math.sin(Date.now() * 0.0001) * 0.1; // Gentle sine wave curve
              const adjustedHeading = baseHeading + curveAmount;
              
              const moveX = Math.cos(adjustedHeading) * unit.speed;
              const moveY = Math.sin(adjustedHeading) * unit.speed;
              
              newPosition.lng += moveX;
              newPosition.lat += moveY;
              
              updatedUnit.heading = adjustedHeading * (180 / Math.PI);
            } else {
              // Reached patrol point, move to next very smoothly
              updatedUnit.currentPatrolIndex = (currentTargetIndex + 1) % unit.patrolRoute.length;
              // Add a slight pause at patrol points
              updatedUnit.speed = unit.speed * 0.3; // Slow down briefly
            }
          } else {
            // Very gentle wandering movement for units without routes
            const heading = unit.heading || 0;
            const headingRad = (heading * Math.PI) / 180;
            
            // Add gentle sine wave to create smooth curved movement
            const time = Date.now() * 0.00005; // Very slow time progression
            const curveFactor = Math.sin(time) * 0.3;
            const adjustedHeading = headingRad + curveFactor;
            
            newPosition.lng += Math.cos(adjustedHeading) * unit.speed;
            newPosition.lat += Math.sin(adjustedHeading) * unit.speed;
            
            // Very occasionally and very gently change base direction
            if (Math.random() < 0.02) { // Even less frequent direction changes
              updatedUnit.heading = (heading + (Math.random() - 0.5) * 20) % 360; // Smaller direction changes
            }
          }
          
          // Gradually restore speed if it was reduced at patrol points
          if (updatedUnit.speed < unit.speed) {
            updatedUnit.speed = Math.min(unit.speed, updatedUnit.speed * 1.1);
          }
          
          return { ...updatedUnit, position: newPosition };
        }
        
        return unit;
      }));
    }, 12000); // 12 second updates for very gentle patrol movement (reduced frequency)

    return () => {
      clearInterval(emergencyMovementInterval);
      clearInterval(patrolMovementInterval);
    };
  }, [incidents]);

  // Radar pulse animation for victims - separated from main data updates
  useEffect(() => {
    const radarUpdateInterval = setInterval(() => {
      if (mapLoaded && map.current) {
        // Only update victim radar, not all map data
        const pulseTime = (Date.now() % 3000) / 3000;
        const victimRadarFeatures = incidents
          .filter(incident => incident.isVictim)
          .map(victim => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [victim.position.lng, victim.position.lat]
            },
            properties: {
              id: victim.id,
              pulse: pulseTime
            }
          }));

        const victimRadarSource = map.current.getSource('victim-radar') as mapboxgl.GeoJSONSource;
        if (victimRadarSource) {
          victimRadarSource.setData({
            type: 'FeatureCollection',
            features: victimRadarFeatures
          });
        }
      }
    }, 200); // Reduced frequency from 100ms to 200ms

    return () => clearInterval(radarUpdateInterval);
  }, [mapLoaded, incidents]);



  if (!embedded) {
    return (
      <div className="h-full flex flex-col">
        {/* Map Container */}
        <div ref={mapContainer} className="flex-1 relative">
          {/* Routing Status Indicator */}
          {routingInProgress && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-400 font-medium">AI calculating optimal routes...</span>
              </div>
            </div>
          )}
          
          {/* Route Assignments Status */}
          {routeAssignments.length > 0 && !routingInProgress && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-green-400 font-medium">
                  {routeAssignments.length} optimal routes deployed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {(selectedUnit || selectedIncident) && (
          <div className="p-4 bg-card border-t">
            {selectedUnit && (
              <div className="space-y-2">
                <h4 className="font-medium">Unit: {selectedUnit}</h4>
                {(() => {
                  const unit = units.find(u => u.id === selectedUnit);
                  if (!unit) return null;
                  
                  const victims = incidents.filter(inc => inc.isVictim);
                  const closestVictim = victims.length > 0 ? 
                    victims.reduce((closest, victim) => {
                      const distToCurrent = calculateDistance(unit.position, victim.position);
                      const distToClosest = calculateDistance(unit.position, closest.position);
                      return distToCurrent < distToClosest ? victim : closest;
                    }) : null;

                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="text-muted-foreground">Type:</span> {unit.type}</p>
                        <p><span className="text-muted-foreground">Status:</span> {unit.status}</p>
                        {unit.eta && <p><span className="text-muted-foreground">ETA:</span> {unit.eta} min</p>}
                      </div>
                      {closestVictim && (
                        <div>
                          <p className="text-muted-foreground">Closest Victim:</p>
                          <p>{closestVictim.id}</p>
                          <p className="text-xs text-green-400">
                            Distance: {calculateDistance(unit.position, closestVictim.position).toFixed(2)} km
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            
            {selectedIncident && (
              <div className="space-y-2">
                <h4 className="font-medium">Incident: {selectedIncident}</h4>
                {(() => {
                  const incident = incidents.find(i => i.id === selectedIncident);
                  if (!incident) return null;
                  
                  return (
                    <div className="text-sm">
                      <p><span className="text-muted-foreground">Type:</span> {incident.type}</p>
                      <p><span className="text-muted-foreground">Priority:</span> {incident.priority}</p>
                      <p><span className="text-muted-foreground">Status:</span> {incident.status}</p>
                      {incident.isVictim && (
                        <p className="text-red-400 font-medium">🚨 VICTIM LOCATION</p>
                      )}
                      <p><span className="text-muted-foreground">Units Assigned:</span> {incident.unitsAssigned.length}</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}


      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainer} className="h-full w-full" />
      
      {/* Routing Status Indicator for Embedded View */}
      {routingInProgress && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-400 font-medium">AI routing...</span>
          </div>
        </div>
      )}
      
      {/* Route Assignments Status for Embedded View */}
      {routeAssignments.length > 0 && !routingInProgress && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400 font-medium">
              {routeAssignments.length} routes active
            </span>
          </div>
        </div>
      )}
    </div>
  );
}