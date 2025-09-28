import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MapContainer } from './MapContainer';

import { 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Activity, 
  Zap,
  Heart,
  Shield,
  Truck,
  Phone,
  Users,
  TrendingUp,
  CheckCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Siren,
  Maximize
} from 'lucide-react';

interface CriticalIncident {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  status: 'processing' | 'dispatched' | 'enroute' | 'onscene';
  priority: 'critical' | 'high' | 'medium' | 'low';
  processingTime: number;
  unitsAssigned: string[];
  eta?: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

interface DispatchEvent {
  id: string;
  unitId: string;
  unitType: 'EMS' | 'FIRE' | 'POLICE';
  incidentId: string;
  incidentType: string;
  location: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  eta: number;
}

interface DispatcherDashboardProps {
  onFullscreenToggle?: () => void;
}

export function DispatcherDashboard({ onFullscreenToggle }: DispatcherDashboardProps = {}) {
  const [activeIncidents] = useState<CriticalIncident[]>([
    {
      id: "INC-2024-006",
      type: "Medical Emergency",
      location: "124 Post Street, San Francisco",
      timestamp: "14:37:22",
      status: "enroute",
      priority: "low",
      processingTime: 1.8,
      unitsAssigned: ["AMB-05"],
      eta: 8
    },
    {
      id: "INC-2024-001",
      type: "Cardiac Emergency",
      location: "Main St & 5th Ave",
      timestamp: "14:32:18",
      status: "enroute",
      priority: "critical",
      processingTime: 8.2,
      unitsAssigned: ["AMB-01", "PD-03"],
      eta: 3
    },
    {
      id: "INC-2024-002", 
      type: "Structure Fire",
      location: "Oak Grove Complex",
      timestamp: "14:28:45",
      status: "onscene",
      priority: "high",
      processingTime: 12.8,
      unitsAssigned: ["FIRE-01", "FIRE-02", "EMS-15"]
    },
    {
      id: "INC-2024-003",
      type: "Traffic Accident",
      location: "Highway 101 & Exit 23",
      timestamp: "14:35:12", 
      status: "processing",
      priority: "medium",
      processingTime: 4.1,
      unitsAssigned: []
    }
  ]);

  const [systemAlerts] = useState<SystemAlert[]>([
    {
      id: "AL-001",
      type: "warning",
      message: "Unit AMB-02 low on fuel - returning to base",
      timestamp: "14:30:15"
    },
    {
      id: "AL-002", 
      type: "info",
      message: "Agent processing completed in 4.2s - within target",
      timestamp: "14:35:20"
    }
  ]);

  const [quickStats] = useState({
    activeIncidents: 3,
    availableUnits: 8,
    activeUnits: 15,
    avgProcessingTime: 11.4,
    systemLoad: 67,
    callsToday: 247
  });

  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [recentDispatches, setRecentDispatches] = useState<DispatchEvent[]>([]);
  
  // Map filter states
  const [mapFilters, setMapFilters] = useState({
    // Emergency Units
    emsAmbulance: true,
    fireDepartment: true,
    police: true,
    onSceneUnits: true,
    // Incidents & Infrastructure
    victims: true,
    highPriorityIncidents: true,
    hospitals: true,
    // Routes & Paths
    optimalRoutes: true,
    unitMovementTrails: true
  });

  // Available units for dispatch simulation
  const availableUnits = {
    EMS: ['AMB-01', 'AMB-02', 'AMB-03', 'EMS-15', 'EMS-22'],
    FIRE: ['FIRE-01', 'FIRE-02', 'FIRE-03', 'ENGINE-7', 'LADDER-12'],
    POLICE: ['PD-01', 'PD-02', 'PD-03', 'POLICE-ALPHA', 'POLICE-BETA']
  };





  // Simulate realistic unit dispatches
  useEffect(() => {
    const dispatchSimulation = setInterval(() => {
      // Randomly decide if a dispatch should occur (30% chance every 8-15 seconds)
      if (Math.random() < 0.3) {
        const incidentTypes = [
          { type: 'Cardiac Emergency', priority: 'critical', unitTypes: ['EMS', 'POLICE'] },
          { type: 'Structure Fire', priority: 'high', unitTypes: ['FIRE', 'EMS', 'POLICE'] },
          { type: 'Traffic Accident', priority: 'medium', unitTypes: ['EMS', 'POLICE'] },
          { type: 'Medical Emergency', priority: 'high', unitTypes: ['EMS'] },
          { type: 'Domestic Disturbance', priority: 'medium', unitTypes: ['POLICE'] },
          { type: 'Overdose', priority: 'critical', unitTypes: ['EMS', 'POLICE'] },
          { type: 'Apartment Fire', priority: 'critical', unitTypes: ['FIRE', 'EMS'] },
          { type: 'Robbery in Progress', priority: 'high', unitTypes: ['POLICE'] },
          { type: 'Vehicle Fire', priority: 'high', unitTypes: ['FIRE'] },
          { type: 'Assault', priority: 'medium', unitTypes: ['EMS', 'POLICE'] }
        ];

        const locations = [
          'Main St & 5th Ave', 'Oak Grove Complex', 'Highway 101 & Exit 23',
          'Downtown Plaza', 'Riverside Park', 'Central Station',
          'Hospital District', 'University Campus', 'Shopping Center',
          'Industrial District', 'Residential Zone 7', 'Business Park'
        ];

        const selectedIncident = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
        const selectedLocation = locations[Math.floor(Math.random() * locations.length)];
        const selectedUnitType = selectedIncident.unitTypes[Math.floor(Math.random() * selectedIncident.unitTypes.length)] as 'EMS' | 'FIRE' | 'POLICE';
        const availableUnitsOfType = availableUnits[selectedUnitType];
        const selectedUnit = availableUnitsOfType[Math.floor(Math.random() * availableUnitsOfType.length)];

        const newDispatch: DispatchEvent = {
          id: `DISPATCH-${Date.now()}`,
          unitId: selectedUnit,
          unitType: selectedUnitType,
          incidentId: `INC-2024-${String(Math.floor(Math.random() * 999) + 100).padStart(3, '0')}`,
          incidentType: selectedIncident.type,
          location: selectedLocation,
          priority: selectedIncident.priority as 'critical' | 'high' | 'medium' | 'low',
          timestamp: new Date().toLocaleTimeString(),
          eta: Math.floor(Math.random() * 8) + 2 // 2-10 minutes
        };

        // Add to recent dispatches
        setRecentDispatches(prev => [newDispatch, ...prev].slice(0, 10));
      }
    }, Math.random() * 7000 + 8000); // Every 8-15 seconds

    return () => clearInterval(dispatchSimulation);
  }, []);

  const getCurrentProcessingStage = () => {
    return {
      currentCall: "3 Active Incidents • 8 Available Units • System Load: 67%",
      stage: "All agents operational",
      progress: 94,
      timeElapsed: 11.4,
      expectedCompletion: 0.6
    };
  };

  const processingStage = getCurrentProcessingStage();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/10 border-red-500/50';
      case 'high': return 'bg-orange-500/10 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/50';
      case 'low': return 'bg-green-500/10 border-green-500/50';
      default: return 'bg-gray-500/10 border-gray-500/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-yellow-400';
      case 'dispatched': return 'text-blue-400';
      case 'enroute': return 'text-orange-400';
      case 'onscene': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600/60 text-white border-0';
      case 'high': return 'bg-orange-600/60 text-white border-0';
      case 'medium': return 'bg-yellow-600/60 text-white border-0';
      case 'low': return 'bg-green-600/60 text-white border-0';
      default: return 'bg-gray-600/60 text-white border-0';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-400" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">

      {/* Map Background with Responsive Panels */}
<div className="relative h-[100vh] w-full min-h-[500px]">
        {/* Background Map - Adjusts for open panels */}
        <Card className={`absolute inset-0 transition-all duration-300 ${
          leftPanelCollapsed && rightPanelCollapsed ? '' :
          leftPanelCollapsed ? 'right-80' :
          rightPanelCollapsed ? 'left-80' :
          'left-80 right-80'
        }`}>
          <CardContent className="p-0 h-full relative">
            <MapContainer embedded={true} filters={mapFilters} />
            
            {/* Fullscreen Button */}
            {onFullscreenToggle && (
              <div className="absolute top-4 right-4 z-40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFullscreenToggle}
                  className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-black/90 h-10 px-4"
                >
                  <Maximize className="w-4 h-4 mr-2" />
                  Fullscreen
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Left Panel - Active Incidents */}
        <div className={`absolute top-4 left-4 bottom-4 ${leftPanelCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 z-10`}>
          <div className="relative h-full">
            {/* Toggle Strip - Right Edge */}
            <div 
              className={`absolute ${leftPanelCollapsed ? '-right-16' : '-right-16'} top-0 bottom-0 w-16 cursor-pointer`}
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
            >
            </div>

            {!leftPanelCollapsed && (
              <Card className="h-full bg-black/90 backdrop-blur-md border-border/50 pr-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-white text-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span>Active ({activeIncidents.length})</span>
                  </CardTitle>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        window.location.href = 'tel:4086449723';
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      New Call
                    </Button>

                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // Trigger immediate route calculation
                        const event = new CustomEvent('forceRouteCalculation');
                        window.dispatchEvent(event);
                      }}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Calculate Routes
                    </Button>

                  </div>
                </CardHeader>
                <CardContent className="space-y-3 overflow-y-auto dispatch-scrollbar pr-2" style={{maxHeight: 'calc(100vh - 280px)'}}>
                  {/* Recent Dispatches Section */}
                  {recentDispatches.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Radio className="w-3 h-3 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">Recent Dispatches</span>
                      </div>
                      <div className="space-y-1">
                        {recentDispatches.slice(0, 2).map((dispatch) => (
                          <div key={dispatch.id} className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-400">{dispatch.unitId}</span>

                            </div>
                            <div className="text-gray-300">{dispatch.incidentType}</div>
                            <div className="text-gray-400 flex items-center">
                              <MapPin className="w-2 h-2 mr-1" />
                              {dispatch.location}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Active Incidents */}
                  {activeIncidents.slice(0, 3).map((incident) => (
                    <div key={incident.id} className="p-3 bg-gray-800/50 rounded border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs h-4 font-mono">
                            {incident.id.split('-')[2]}
                          </Badge>
                          <Badge className={`text-xs h-4 ${getPriorityBadgeColor(incident.priority)}`}>
                            {incident.priority.charAt(0).toUpperCase()}
                          </Badge>
                        </div>

                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-white text-sm font-medium">{incident.type}</p>
                        <p className="text-gray-400 text-xs flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {incident.location}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${getStatusColor(incident.status)} font-medium`}>
                            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                          </span>
                          <span className="text-gray-400">{incident.processingTime.toFixed(1)}s</span>
                        </div>
                        
                        {incident.unitsAssigned.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {incident.unitsAssigned.map(unit => (
                              <Badge key={unit} variant="outline" className="text-xs h-4 bg-gray-700/50">
                                {unit}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {incident.eta && (
                          <div className="flex items-center text-orange-400 text-xs mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>ETA: {incident.eta}m</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {leftPanelCollapsed && (
              <div className="h-full w-12 bg-black/90 backdrop-blur-md border border-border/50 rounded flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Unit Status */}
        <div className={`absolute top-4 right-4 bottom-4 ${rightPanelCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 z-10`}>
          <div className="relative h-full">
            {/* Toggle Strip - Left Edge */}
            <div 
              className={`absolute ${rightPanelCollapsed ? '-left-16' : '-left-16'} top-0 bottom-0 w-16 cursor-pointer`}
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            >
            </div>

            {!rightPanelCollapsed && (
              <Card className="h-full bg-black/90 backdrop-blur-md border-border/50 pl-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-white text-sm">
                    <Users className="w-4 h-4" />
                    <span>Unit Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pl-2">
                  {/* EMS Units */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-white text-xs font-medium">EMS</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-400 font-medium">3</span>
                          <span className="text-gray-400">avail</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-400 font-medium">2</span>
                          <span className="text-gray-400">busy</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-green-400 w-3/5"></div>
                      <div className="bg-orange-400 w-2/5"></div>
                    </div>
                  </div>

                  {/* Fire Units */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-white text-xs font-medium">FIRE</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-400 font-medium">2</span>
                          <span className="text-gray-400">avail</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-400 font-medium">3</span>
                          <span className="text-gray-400">busy</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-green-400 w-2/5"></div>
                      <div className="bg-orange-400 w-3/5"></div>
                    </div>
                  </div>

                  {/* Police Units */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-white text-xs font-medium">POLICE</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-green-400 font-medium">3</span>
                          <span className="text-gray-400">avail</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-orange-400 font-medium">1</span>
                          <span className="text-gray-400">busy</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="bg-green-400 w-3/4"></div>
                      <div className="bg-orange-400 w-1/4"></div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Total Available</span>
                      <span className="text-green-400 font-medium">8 units</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Total Deployed</span>
                      <span className="text-orange-400 font-medium">6 units</span>
                    </div>
                  </div>

                  {/* Interactive Map Filters */}
                  <div className="pt-3 border-t border-gray-700">
                    <h4 className="text-white text-xs font-medium mb-3 flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>Map Filters</span>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] h-3 px-1">
                        LIVE
                      </Badge>
                    </h4>
                    <div className="space-y-3 text-xs max-h-64 overflow-y-auto dispatch-scrollbar">
                      {/* Emergency Units */}
                      <div>
                        <div className="text-gray-400 text-[10px] font-medium mb-2">Emergency Units</div>
                        <div className="space-y-1.5">
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, emsAmbulance: !prev.emsAmbulance }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.emsAmbulance 
                                ? 'bg-blue-500/20 border border-blue-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-[10px] font-medium">EMS/Ambulance</span>
                          </button>
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, fireDepartment: !prev.fireDepartment }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.fireDepartment 
                                ? 'bg-orange-500/20 border border-orange-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-[10px] font-medium">Fire Department</span>
                          </button>
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, police: !prev.police }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.police 
                                ? 'bg-yellow-500/20 border border-yellow-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-[10px] font-medium">Police</span>
                          </button>

                        </div>
                      </div>
                      
                      {/* Incidents & Infrastructure */}
                      <div>
                        <div className="text-gray-400 text-[10px] font-medium mb-2">Incidents & Infrastructure</div>
                        <div className="space-y-1.5">
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, victims: !prev.victims }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.victims 
                                ? 'bg-red-500/20 border border-red-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-[10px] font-medium">Victim</span>
                          </button>
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, highPriorityIncidents: !prev.highPriorityIncidents }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.highPriorityIncidents 
                                ? 'bg-orange-500/20 border border-orange-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <span className="text-[10px] font-medium">High Priority Incident</span>
                          </button>
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, hospitals: !prev.hospitals }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.hospitals 
                                ? 'bg-green-500/20 border border-green-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-[10px] font-medium">Hospital</span>
                          </button>
                        </div>
                      </div>

                      {/* Routes & Paths */}
                      <div>
                        <div className="text-gray-400 text-[10px] font-medium mb-2">Routes & Paths</div>
                        <div className="space-y-1.5">
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, optimalRoutes: !prev.optimalRoutes }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.optimalRoutes 
                                ? 'bg-green-500/20 border border-green-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-3 h-0.5 bg-green-500 rounded"></div>
                            <span className="text-[10px] font-medium">Optimal Route</span>
                          </button>
                          <button 
                            onClick={() => setMapFilters(prev => ({ ...prev, unitMovementTrails: !prev.unitMovementTrails }))}
                            className={`flex items-center space-x-2 p-2 rounded transition-all duration-200 w-full text-left ${
                              mapFilters.unitMovementTrails 
                                ? 'bg-gray-500/20 border border-gray-500/40 text-white shadow-sm' 
                                : 'bg-gray-700/30 border border-gray-600/30 text-gray-400 hover:bg-gray-600/40 hover:text-gray-300'
                            }`}
                          >
                            <div className="w-3 h-0.5 bg-gray-500 opacity-50 rounded"></div>
                            <span className="text-[10px] font-medium">Unit Movement Trail</span>
                          </button>
                        </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setMapFilters({
                                emsAmbulance: true,
                                fireDepartment: true,
                                police: true,
                                onSceneUnits: true,
                                victims: true,
                                highPriorityIncidents: true,
                                hospitals: true,
                                optimalRoutes: true,
                                unitMovementTrails: true
                              });
                            }}
                            className="h-6 text-[9px] px-2 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                          >
                            All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setMapFilters({
                                emsAmbulance: false,
                                fireDepartment: false,
                                police: false,
                                onSceneUnits: false,
                                victims: false,
                                highPriorityIncidents: false,
                                hospitals: false,
                                optimalRoutes: false,
                                unitMovementTrails: false
                              });
                            }}
                            className="h-6 text-[9px] px-2 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          >
                            None
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setMapFilters({
                                emsAmbulance: true,
                                fireDepartment: true,
                                police: true,
                                onSceneUnits: true,
                                victims: false,
                                highPriorityIncidents: false,
                                hospitals: false,
                                optimalRoutes: false,
                                unitMovementTrails: false
                              });
                            }}
                            className="h-6 text-[9px] px-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                          >
                            Units
                          </Button>
                        </div>
                      </div>

                      {/* Active Filter Count */}
                      <div className="pt-1">
                        <div className="text-center">
                          <Badge variant="outline" className="text-[9px] h-4 px-2 bg-gray-500/10 text-gray-400 border-gray-500/30">
                            {Object.values(mapFilters).filter(Boolean).length} of {Object.keys(mapFilters).length} active
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {rightPanelCollapsed && (
              <div className="h-full w-12 bg-black/90 backdrop-blur-md border border-border/50 rounded flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>



    </div>
  );
}