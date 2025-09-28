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
    { id: 'INC-001', type: 'medical', position: { x: 400, y: 250 }, status: 'active', priority: 'critical', unitsAssigned: ['AMB-01'] },
    { id: 'INC-002', type: 'fire', position: { x: 550, y: 200 }, status: 'active', priority: 'high', unitsAssigned: ['FIRE-01'] },
    { id: 'INC-003', type: 'police', position: { x: 300, y: 180 }, status: 'active', priority: 'medium', unitsAssigned: ['PD-01'] }
  ]);

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState<'optimal' | 'fastest' | 'alternative'>('optimal');

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