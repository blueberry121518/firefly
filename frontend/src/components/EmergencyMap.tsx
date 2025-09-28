import React, { useState, useEffect } from 'react';
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
  Layers
} from 'lucide-react';

// Import the routing optimizer and types
import { RouteOptimizer, RouteAssignment } from './RouteOptimizer';
import type { EmergencyUnit as MapboxEmergencyUnit, MapIncident as MapboxMapIncident, Hospital } from './MapboxEmergencyMap';

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

interface EmergencyMapProps {
  embedded?: boolean;
  filters?: MapFilters;
}

interface EmergencyUnit {
  id: string;
  type: 'ambulance' | 'fire' | 'police';
  status: 'available' | 'enroute' | 'onscene' | 'returning';
  position: { x: number; y: number };
  assignedIncident?: string;
  eta?: number;
}

interface MapIncident {
  id: string;
  type: 'medical' | 'fire' | 'police';
  position: { x: number; y: number };
  status: 'active' | 'dispatched' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
  unitsAssigned: string[];
  isVictim?: boolean;
}

export function EmergencyMap({ embedded = false, filters }: EmergencyMapProps) {
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

  const [units, setUnits] = useState<EmergencyUnit[]>([
    { id: 'AMB-01', type: 'ambulance', status: 'enroute', position: { x: 350, y: 280 }, assignedIncident: 'INC-001', eta: 4 },
    { id: 'AMB-02', type: 'ambulance', status: 'available', position: { x: 150, y: 180 } },
    { id: 'FIRE-01', type: 'fire', status: 'onscene', position: { x: 580, y: 220 }, assignedIncident: 'INC-002' },
    { id: 'FIRE-02', type: 'fire', status: 'returning', position: { x: 420, y: 340 } },
    { id: 'PD-01', type: 'police', status: 'enroute', position: { x: 280, y: 200 }, assignedIncident: 'INC-003', eta: 2 },
    { id: 'PD-02', type: 'police', status: 'available', position: { x: 480, y: 160 } },
    { id: 'AMB-03', type: 'ambulance', status: 'available', position: { x: 200, y: 380 } },
    { id: 'FIRE-03', type: 'fire', status: 'available', position: { x: 520, y: 340 } }
  ]);

  const [incidents, setIncidents] = useState<MapIncident[]>([
    { id: 'INC-001', type: 'medical', position: { x: 400, y: 250 }, status: 'active', priority: 'critical', unitsAssigned: ['AMB-01'], isVictim: true },
    { id: 'INC-002', type: 'fire', position: { x: 550, y: 200 }, status: 'active', priority: 'high', unitsAssigned: ['FIRE-01'], isVictim: false },
    { id: 'INC-003', type: 'police', position: { x: 300, y: 180 }, status: 'active', priority: 'medium', unitsAssigned: ['PD-01'], isVictim: false }
  ]);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState<'optimal' | 'fastest' | 'alternative'>('optimal');
  
  // Routing optimization state
  const [routeAssignments, setRouteAssignments] = useState<RouteAssignment[]>([]);
  const [routingInProgress, setRoutingInProgress] = useState(false);
  const [lastIncidentCount, setLastIncidentCount] = useState(0);

  // Convert SVG coordinates to lng/lat for RouteOptimizer
  const convertToGeoPosition = (svgPos: { x: number; y: number }) => ({
    lng: -122.4194 + (svgPos.x - 350) * 0.0001,
    lat: 37.7749 + (200 - svgPos.y) * 0.0001
  });

  const convertToSvgPosition = (geoPos: { lng: number; lat: number }) => ({
    x: 350 + (geoPos.lng + 122.4194) * 10000,
    y: 200 - (geoPos.lat - 37.7749) * 10000
  });

  // Mock hospital data for SVG map
  const hospitals: Hospital[] = [
    {
      id: 'HOSP-1',
      name: 'Medical Center',
      position: convertToGeoPosition({ x: 165, y: 165 }),
      type: 'general',
      capacity: 100,
      availableBeds: 20
    }
  ];

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
    if (incident.priority === 'critical' && !activeFilters.victims) return false;
    
    // Check for high priority incidents
    if ((incident.priority === 'high' || incident.priority === 'medium') && !activeFilters.highPriorityIncidents) return false;
    
    return true;
  };

  // Helper function to check if infrastructure should be displayed
  const shouldShowHospitals = () => activeFilters.hospitals;

  // Real-time emergency detection and route calculation
  useEffect(() => {
    const currentIncidentCount = incidents.filter(inc => inc.isVictim && inc.status === 'active').length;
    
    if (currentIncidentCount !== lastIncidentCount) {
      console.log('🚨 [SVG Map] Emergency status change detected:', {
        newIncidents: currentIncidentCount > lastIncidentCount,
        incidentCount: currentIncidentCount
      });
      
      setLastIncidentCount(currentIncidentCount);
      
      if (currentIncidentCount > 0) {
        setRoutingInProgress(true);
        
        setTimeout(() => {
          try {
            // Convert SVG units and incidents to geo format for RouteOptimizer
            const geoUnits: MapboxEmergencyUnit[] = units.map(unit => ({
              ...unit,
              position: convertToGeoPosition(unit.position),
              type: unit.type,
              status: unit.status,
              speed: 0.000001,
              heading: 0,
              homeBase: convertToGeoPosition(unit.position),
              patrolBehavior: 'stationary' as const
            }));

            const geoIncidents: MapboxMapIncident[] = incidents.map(incident => ({
              ...incident,
              position: convertToGeoPosition(incident.position)
            }));

            console.log('🧠 [SVG Map] Starting route optimization...');
            const assignments = RouteOptimizer.optimizeRoutes(geoUnits, geoIncidents, hospitals);
            
            setRouteAssignments(assignments);
            setRoutingInProgress(false);
            
            console.log('✅ [SVG Map] Route optimization complete:', assignments);
            
          } catch (error) {
            console.error('❌ [SVG Map] Route optimization failed:', error);
            setRoutingInProgress(false);
          }
        }, 200);
      }
    }
  }, [incidents, units, lastIncidentCount]);

  // Auto-update unit statuses based on route assignments
  useEffect(() => {
    if (routeAssignments.length > 0) {
      console.log('🚑 [SVG Map] Updating unit statuses based on assignments...');
      
      setUnits(prevUnits => 
        prevUnits.map(unit => {
          const assignment = routeAssignments.find(a => a.unitId === unit.id);
          
          if (assignment && unit.status === 'available') {
            console.log(`📡 [SVG Map] Dispatching ${unit.id} to ${assignment.victimId}`);
            return {
              ...unit,
              status: 'enroute' as const,
              assignedIncident: assignment.victimId,
              eta: Math.round(assignment.estimatedTime)
            };
          }
          
          return unit;
        })
      );
    }
  }, [routeAssignments]);

  const getUnitColor = (status: string) => {
    switch (status) {
      case 'available': return '#22c55e';
      case 'enroute': return '#eab308';
      case 'onscene': return '#ef4444';
      case 'returning': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getIncidentColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  };

  if (embedded) {
    return (
      <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
        {/* Embedded Map Content */}
        <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button 
              variant={showRoutes ? "default" : "outline"}
              size="sm"
              onClick={() => setShowRoutes(!showRoutes)}
              className="h-7 text-xs"
            >
              <Layers className="w-3 h-3 mr-1" />
              Routes
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Routing Status Indicator */}
        {routingInProgress && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400 font-medium">AI routing...</span>
            </div>
          </div>
        )}
        
        {/* Route Assignments Status */}
        {routeAssignments.length > 0 && !routingInProgress && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-lg px-3 py-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400 font-medium">
                {routeAssignments.length} routes active
              </span>
            </div>
          </div>
        )}
        
        <svg 
          viewBox="0 0 700 400" 
          className="w-full h-full"
          style={{ backgroundColor: '#1f2937' }}
        >
          {/* Street Grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Main Streets */}
          <line x1="0" y1="200" x2="700" y2="200" stroke="#4b5563" strokeWidth="4" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="#4b5563" strokeWidth="4" />
          <line x1="500" y1="0" x2="500" y2="400" stroke="#4b5563" strokeWidth="4" />
          <line x1="0" y1="100" x2="700" y2="100" stroke="#6b7280" strokeWidth="2" />
          <line x1="0" y1="300" x2="700" y2="300" stroke="#6b7280" strokeWidth="2" />
          <line x1="350" y1="0" x2="350" y2="400" stroke="#6b7280" strokeWidth="2" />

          {/* Buildings/Landmarks */}
          <rect x="180" y="180" width="40" height="40" fill="#374151" stroke="#4b5563" />
          <rect x="480" y="80" width="40" height="40" fill="#374151" stroke="#4b5563" />
          <rect x="320" y="280" width="60" height="40" fill="#374151" stroke="#4b5563" />
          
          {/* Hospital */}
          {shouldShowHospitals() && (
            <>
              <rect x="155" y="155" width="20" height="20" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
              <text x="165" y="148" fill="white" fontSize="10" textAnchor="middle">UCSF Medical Center</text>
            </>
          )}
          
          {/* Additional Hospitals */}
          <rect x="525" y="325" width="20" height="20" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
          <text x="535" y="318" fill="white" fontSize="10" textAnchor="middle">SFGH</text>

          <rect x="55" y="55" width="20" height="20" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
          <text x="65" y="48" fill="white" fontSize="10" textAnchor="middle">Kaiser SF</text>

          {/* Victims with pulsating radar */}
          {incidents.filter(incident => incident.isVictim && shouldShowIncident(incident)).map(incident => (
            <g key={`victim-${incident.id}`}>
              {/* Pulsating radar effect */}
              <circle
                cx={incident.position.x}
                cy={incident.position.y}
                r="30"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeOpacity="0.4"
                className="radar-pulse"
              />
              <circle
                cx={incident.position.x}
                cy={incident.position.y}
                r="20"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1"
                strokeOpacity="0.6"
                className="radar-pulse"
                style={{animationDelay: '0.5s'}}
              />
            </g>
          ))}

          {/* Incidents - Red circles for victims, colored circles for others */}
          {incidents.filter(shouldShowIncident).map(incident => (
            <g key={incident.id}>
              <circle
                cx={incident.position.x}
                cy={incident.position.y}
                r={incident.isVictim ? "15" : "12"}
                fill={incident.isVictim ? "#dc2626" : getIncidentColor(incident.priority)}
                stroke="#ffffff"
                strokeWidth={incident.isVictim ? "4" : "3"}
                opacity="0.8"
                className="cursor-pointer"
                onClick={() => setSelectedIncident(incident.id)}
              />
            </g>
          ))}

          {/* Route Lines - Show optimal routes when available */}
          {showRoutes && (
            <>
              {/* AI-calculated optimal routes */}
              {routeAssignments.map(assignment => {
                const unit = units.find(u => u.id === assignment.unitId);
                const incident = incidents.find(i => i.id === assignment.victimId);
                
                if (!unit || !incident) return null;
                
                return (
                  <g key={`route-${assignment.unitId}-${assignment.victimId}`}>
                    {assignment.path.map((segment, segmentIndex) => {
                      const fromSvg = convertToSvgPosition(segment.from);
                      const toSvg = convertToSvgPosition(segment.to);
                      
                      return (
                        <line
                          key={`segment-${segmentIndex}`}
                          x1={fromSvg.x}
                          y1={fromSvg.y}
                          x2={toSvg.x}
                          y2={toSvg.y}
                          stroke={segment.color}
                          strokeWidth={segment.type === 'victim-to-hospital' ? "4" : "3"}
                          strokeOpacity={segment.type === 'victim-to-hospital' ? "0.9" : "0.7"}
                          strokeDasharray={segment.type === 'victim-to-hospital' ? "5,5" : "none"}
                          className="route-line"
                        />
                      );
                    })}
                    
                    {/* Route direction arrow */}
                    <polygon
                      points={`${incident.position.x-3},${incident.position.y-6} ${incident.position.x+3},${incident.position.y-6} ${incident.position.x},${incident.position.y-12}`}
                      fill="#22c55e"
                      opacity="0.8"
                    />
                    
                    {/* ETA indicator */}
                    <text
                      x={(unit.position.x + incident.position.x) / 2}
                      y={(unit.position.y + incident.position.y) / 2 - 5}
                      fill="#22c55e"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-bold"
                    >
                      ETA: {Math.round(assignment.estimatedTime)}m
                    </text>
                  </g>
                );
              })}
              
              {/* Simple direct lines for ALL victims - guaranteed visualization */}
              {routeAssignments.length === 0 && incidents.filter(inc => inc.isVictim && inc.status === 'active').map(victim => {
                // Always find the closest unit, regardless of status
                const allUnits = units.filter(u => u.status !== 'offline');
                if (allUnits.length === 0) return null;
                
                const closestUnit = allUnits.reduce((closest, unit) => {
                  const victimDist = Math.sqrt(
                    Math.pow(victim.position.x - unit.position.x, 2) + 
                    Math.pow(victim.position.y - unit.position.y, 2)
                  );
                  const closestDist = Math.sqrt(
                    Math.pow(victim.position.x - closest.position.x, 2) + 
                    Math.pow(victim.position.y - closest.position.y, 2)
                  );
                  return victimDist < closestDist ? unit : closest;
                });
                
                // Determine line style based on unit status and victim priority
                let strokeColor = '#22c55e'; // default green
                let strokeWidth = '2';
                let strokeOpacity = '0.5';
                let strokeDasharray = '3,3';
                let routeLabel = 'Potential Route';

                if (closestUnit.status === 'available') {
                  strokeColor = '#22c55e'; // green for available
                  strokeOpacity = '0.7';
                  routeLabel = 'Available Unit';
                } else if (closestUnit.status === 'busy' || closestUnit.status === 'onscene') {
                  strokeColor = '#f59e0b'; // amber for busy
                  strokeOpacity = '0.4';
                  routeLabel = 'Backup Unit';
                } else if (closestUnit.status === 'returning') {
                  strokeColor = '#8b5cf6'; // purple for returning
                  strokeOpacity = '0.5';
                  routeLabel = 'Returning Unit';
                }

                // Critical victims get enhanced styling
                if (victim.priority === 'critical') {
                  strokeWidth = '3';
                  strokeOpacity = Math.min(1.0, parseFloat(strokeOpacity) + 0.3).toString();
                  strokeColor = strokeColor === '#22c55e' ? '#10b981' : strokeColor;
                }
                
                return (
                  <g key={`guaranteed-route-${victim.id}`}>
                    <line
                      x1={closestUnit.position.x}
                      y1={closestUnit.position.y}
                      x2={victim.position.x}
                      y2={victim.position.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={strokeDasharray}
                      className="route-line"
                    />
                    <text
                      x={(closestUnit.position.x + victim.position.x) / 2}
                      y={(closestUnit.position.y + victim.position.y) / 2 - 5}
                      fill={strokeColor}
                      fontSize="7"
                      textAnchor="middle"
                      className="font-bold"
                    >
                      {routeLabel}
                    </text>
                    
                    {/* Priority indicator for critical victims */}
                    {victim.priority === 'critical' && (
                      <text
                        x={(closestUnit.position.x + victim.position.x) / 2}
                        y={(closestUnit.position.y + victim.position.y) / 2 + 8}
                        fill="#dc2626"
                        fontSize="6"
                        textAnchor="middle"
                        className="font-bold"
                      >
                        CRITICAL
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Active dispatch routes */}
              {units.filter(unit => unit.status === 'enroute' && unit.assignedIncident).map(unit => {
                const incident = incidents.find(inc => inc.id === unit.assignedIncident);
                if (!incident) return null;
                
                return (
                  <g key={`active-route-${unit.id}`}>
                    <line
                      x1={unit.position.x}
                      y1={unit.position.y}
                      x2={incident.position.x}
                      y2={incident.position.y}
                      stroke="#dc2626"
                      strokeWidth="4"
                      strokeOpacity="0.9"
                      className="route-line"
                    />
                    <text
                      x={(unit.position.x + incident.position.x) / 2}
                      y={(unit.position.y + incident.position.y) / 2 - 5}
                      fill="#dc2626"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-bold"
                    >
                      ACTIVE
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Emergency Units - Colored circles (Blue=EMS, Orange=Fire, Yellow=Police) */}
          {units.filter(shouldShowUnit).map(unit => (
            <g key={unit.id}>
              <circle
                cx={unit.position.x}
                cy={unit.position.y}
                r={selectedUnit === unit.id ? "12" : "10"}
                fill={
                  unit.type === 'ambulance' ? '#3b82f6' :  // Blue for EMS
                  unit.type === 'fire' ? '#f97316' :       // Orange for Fire
                  unit.type === 'police' ? '#eab308' :     // Yellow for Police
                  '#6b7280'                                // Gray fallback
                }
                stroke="#ffffff"
                strokeWidth={selectedUnit === unit.id ? "3" : "2"}
                opacity="0.9"
                className="cursor-pointer"
                onClick={() => setSelectedUnit(unit.id)}
              />
              {unit.eta && (
                <text
                  x={unit.position.x}
                  y={unit.position.y - 15}
                  fill="#fbbf24"
                  fontSize="8"
                  textAnchor="middle"
                  className="font-bold"
                >
                  ETA: {unit.eta.toFixed(0)}m
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Map View */}
      <div className="lg:col-span-3">
        <Card className="h-[600px]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Real-Time Emergency Response Map</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={showRoutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowRoutes(!showRoutes)}
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Routes
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <div className="flex border rounded">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full h-[520px] bg-gray-800 rounded-b-lg overflow-hidden">
              {/* Map Background */}
              <svg 
                viewBox="0 0 700 400" 
                className="w-full h-full"
                style={{ backgroundColor: '#1f2937' }}
              >
                {/* Street Grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Main Streets */}
                <line x1="0" y1="200" x2="700" y2="200" stroke="#4b5563" strokeWidth="4" />
                <line x1="200" y1="0" x2="200" y2="400" stroke="#4b5563" strokeWidth="4" />
                <line x1="500" y1="0" x2="500" y2="400" stroke="#4b5563" strokeWidth="4" />
                <line x1="0" y1="100" x2="700" y2="100" stroke="#6b7280" strokeWidth="2" />
                <line x1="0" y1="300" x2="700" y2="300" stroke="#6b7280" strokeWidth="2" />
                <line x1="350" y1="0" x2="350" y2="400" stroke="#6b7280" strokeWidth="2" />

                {/* Buildings/Landmarks */}
                <rect x="180" y="180" width="40" height="40" fill="#374151" stroke="#4b5563" />
                <rect x="480" y="80" width="40" height="40" fill="#374151" stroke="#4b5563" />
                <rect x="320" y="280" width="60" height="40" fill="#374151" stroke="#4b5563" />
                
                {/* Hospital */}
                {shouldShowHospitals() && (
                  <>
                    <rect x="150" y="150" width="30" height="30" fill="#dc2626" stroke="#ef4444" />
                    <text x="165" y="168" fill="white" fontSize="12" textAnchor="middle">H</text>
                  </>
                )}
                
                {/* Fire Station */}
                <rect x="520" y="320" width="30" height="30" fill="#ea580c" stroke="#f97316" />
                <text x="535" y="338" fill="white" fontSize="12" textAnchor="middle">F</text>

                {/* Police Station */}
                <rect x="50" y="50" width="30" height="30" fill="#2563eb" stroke="#3b82f6" />
                <text x="65" y="68" fill="white" fontSize="12" textAnchor="middle">P</text>

                {/* Incidents - NO CIRCLES, JUST TEXT LABELS */}
                {incidents.filter(shouldShowIncident).map(incident => (
                  <g key={incident.id}>
                    {/* INCIDENT CIRCLE COMPLETELY REMOVED */}
                    <text
                      x={incident.position.x}
                      y={incident.position.y - 15}
                      fill="white"
                      fontSize="10"
                      textAnchor="middle"
                      className="font-medium cursor-pointer"
                      onClick={() => setSelectedIncident(incident.id)}
                    >
                      {incident.id}
                    </text>
                    <text
                      x={incident.position.x}
                      y={incident.position.y}
                      fill={getIncidentColor(incident.priority)}
                      fontSize="8"
                      textAnchor="middle"
                      className="font-bold"
                    >
                      [{incident.priority.toUpperCase()}]
                    </text>
                  </g>
                ))}

                {/* Emergency Units - NO CIRCLES, JUST TEXT LABELS */}
                {units.filter(shouldShowUnit).map(unit => (
                  <g key={unit.id}>
                    {/* UNIT CIRCLE COMPLETELY REMOVED */}
                    <text
                      x={unit.position.x}
                      y={unit.position.y + 3}
                      fill="white"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-bold cursor-pointer"
                      onClick={() => setSelectedUnit(unit.id)}
                    >
                      {unit.type.charAt(0).toUpperCase()}
                    </text>
                    <text
                      x={unit.position.x}
                      y={unit.position.y + 20}
                      fill="white"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-medium"
                    >
                      {unit.id}
                    </text>
                    {unit.eta && (
                      <text
                        x={unit.position.x}
                        y={unit.position.y - 12}
                        fill="#fbbf24"
                        fontSize="8"
                        textAnchor="middle"
                        className="font-bold"
                      >
                        ETA: {unit.eta.toFixed(0)}m
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unit Details Panel */}
      <div className="lg:col-span-1">
        <Card className="h-[600px]">
          <CardHeader>
            <CardTitle className="text-lg">Unit Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>All circles have been removed to debug twitching issue.</p>
              <p>Only text labels remain visible.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}