import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { Button } from './components/ui/button';
import { Alert, AlertDescription } from './components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { ScrollArea } from './components/ui/scroll-area';
import { MapContainer } from './components/MapContainer';
import { AgentFlowConsole } from './components/AgentFlowConsole';
import { DispatcherDashboard } from './components/DispatcherDashboard';
import { QuickInterventionButton } from './components/QuickInterventionButton';
import { QuickInterventionModal } from './components/QuickInterventionModal';
import { FireflyLanding } from './components/FireflyLanding';
import { 
  fetchActiveIncidents, 
  fetchCompletedIncidents, 
  subscribeToIncidentUpdates, 
  createMockIncidents,
  testBackendConnection,
  BackendIncident,
  getIncidentType 
} from './utils/incident-integration';
import { publicAnonKey, getExistingClient, resetClient } from './utils/supabase/info';

import { FireflyLogo } from './components/FireflyLogo';
import { Toaster } from './components/ui/sonner';
import { 
  Activity, 
  Shield, 
  Map, 
  Database, 
  Gavel, 
  Megaphone, 
  CheckCircle, 
  Users, 
  Brain,
  Clock,
  Zap,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Radio,
  Home,
  Menu,
  X,
  Phone,
  Maximize,
  Minimize
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'processing' | 'idle';
  icon: React.ReactNode;
  lastAction: string;
  processingTime: number;
}

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface ActiveIncident {
  id: string;
  type: string;
  location: string;
  timestamp: string;
  status: 'processing' | 'dispatched' | 'responded' | 'active' | 'completed';
  agentsInvolved: number[];
  processingTime: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  emergency_type?: string;
  caller_name?: string;
  people_involved?: number;
  is_active_threat?: boolean;
  details?: string;
  ai_confidence?: number;
  units_assigned?: string[];
}

interface CallTranscript {
  id: string;
  incidentId: string;
  timestamp: string;
  duration: string;
  status: 'live' | 'completed' | 'escalated';
  aiConfidence: number;
  transcript: {
    speaker: 'ai' | 'caller';
    time: string;
    message: string;
    confidence?: number;
  }[];
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardBottomTab, setDashboardBottomTab] = useState<string | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "Conversational Intake Agent",
      description: "Ephemeral AEA - Created for each incoming call to acquire complete IncidentFact sheet with maximum speed",
      status: "active",
      icon: <Shield className="w-5 h-5" />,
      lastAction: "LIVE CALL - Processing caller 'Alvin Tan' at 124 Post Street - Medical emergency schema extraction 96.4% confidence",
      processingTime: 1.8
    },
    {
      id: 2,
      name: "Routing Master Agent",
      description: "Market Orchestrator AEA - Hosts real-time combinatorial auctions to procure optimal DispatchPlan",
      status: "processing",
      icon: <Gavel className="w-5 h-5" />,
      lastAction: "Preparing auction for Alvin Tan incident - Low priority medical, calculating optimal EMS dispatch strategy",
      processingTime: 2.9
    },
    {
      id: 3,
      name: "Fire Unit Agent",
      description: "Digital Twin AEA - Autonomous representation of fire units, maximizing utility through auction bidding",
      status: "processing",
      icon: <Megaphone className="w-5 h-5" />,
      lastAction: "Engine-7 calculating competitive bid score 94.2 - Registered on Fetch.ai Almanac",
      processingTime: 2.8
    },
    {
      id: 4,
      name: "Police Unit Agent",
      description: "Digital Twin AEA - Police unit autonomous agent competing for dispatch contracts via market mechanisms",
      status: "active",
      icon: <Shield className="w-5 h-5" />,
      lastAction: "Police-Alpha autonomously discovered via Agentverse - Real-time status: Available, ETA 4min",
      processingTime: 1.9
    },
    {
      id: 5,
      name: "EMS Unit Agent", 
      description: "Digital Twin AEA - Medical unit agent optimizing patient transport through hospital capacity queries",
      status: "processing",
      icon: <Users className="w-5 h-5" />,
      lastAction: "AMB-05 calculating bid for Post Street incident - Non-urgent medical transport, ETA 8min optimal",
      processingTime: 2.2
    },
    {
      id: 6,
      name: "Hospital Agent",
      description: "Service Provider AEA - Signals capacity and specialty status to enable optimal patient transport decisions", 
      status: "active",
      icon: <Database className="w-5 h-5" />,
      lastAction: "SFGH trauma bay available - Broadcasting capacity via Fetch.ai network for autonomous discovery",
      processingTime: 0.8
    },
    {
      id: 7,
      name: "Secure Comms Agent",
      description: "Service Provider AEA - Provides immutable logging to Fetch Network ledger through agent transactions",
      status: "processing",
      icon: <Radio className="w-5 h-5" />,
      lastAction: "Writing incident state to decentralized ledger - FET tokens transacting for logging service",
      processingTime: 2.3
    }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    {
      label: "Call Processing Time (90% threshold)",
      value: 47.2,
      target: 60,
      unit: "seconds",
      status: "good"
    },
    {
      label: "Internal Agent Processing",
      value: 11.4,
      target: 15,
      unit: "seconds",
      status: "good"
    },
    {
      label: "PSAP Transfer Time (95% threshold)",
      value: 23.8,
      target: 30,
      unit: "seconds",
      status: "good"
    },
    {
      label: "System Uptime",
      value: 99.97,
      target: 99.9,
      unit: "%",
      status: "good"
    }
  ]);

  const [activeIncidents, setActiveIncidents] = useState<ActiveIncident[]>([]);
  const [backendIncidents, setBackendIncidents] = useState<BackendIncident[]>([]);
  const [backendConnected, setBackendConnected] = useState(true); // SIMULATED VAPI CONNECTION
  const [backendError, setBackendError] = useState<string | null>(null);

  const [systemStats, setSystemStats] = useState({
    totalCallsProcessed: 1247,
    averageResponseTime: 42.3,
    activeUnits: 23,
    availableUnits: 8,
    complianceRate: 94.2
  });

  const [callTranscripts, setCallTranscripts] = useState<CallTranscript[]>([
    {
      id: "CALL-2024-006",
      incidentId: "INC-2024-006",
      timestamp: new Date().toLocaleTimeString(),
      duration: "1:32",
      status: "live",
      aiConfidence: 96.4,
      transcript: [
        {
          speaker: "ai",
          time: "00:00",
          message: "911, what is your emergency?",
          confidence: 100
        },
        {
          speaker: "caller",
          time: "00:03",
          message: "Hi, my name is Alvin Tan. I'm at 124 Post Street in San Francisco and I have a broken leg."
        },
        {
          speaker: "ai",
          time: "00:06",
          message: "I understand you have a leg injury, Alvin. Are you in immediate danger or severe pain?",
          confidence: 97.8
        },
        {
          speaker: "caller",
          time: "00:09",
          message: "No, it's not urgent. I can walk on it, but I think I should get it checked out at the hospital."
        },
        {
          speaker: "ai",
          time: "00:13",
          message: "I see. Can you confirm your exact location at 124 Post Street? Are you in an apartment or business?",
          confidence: 95.2
        },
        {
          speaker: "caller",
          time: "00:17",
          message: "Yes, 124 Post Street. It's an office building, I'm in the lobby area."
        },
        {
          speaker: "ai",
          time: "00:21",
          message: "Thank you, Alvin. I'm arranging non-urgent medical transport for you. Can you stay on the line while I process this?",
          confidence: 98.1
        },
        {
          speaker: "caller",
          time: "00:25",
          message: "Sure, no problem. Like I said, it's not an emergency - I just want to make sure it's not serious."
        }
      ]
    },
    {
      id: "CALL-2024-001",
      incidentId: "INC-2024-001",
      timestamp: "14:32:18",
      duration: "2:45",
      status: "completed",
      aiConfidence: 94.8,
      transcript: [
        {
          speaker: "ai",
          time: "00:00",
          message: "911, what is your emergency?",
          confidence: 100
        },
        {
          speaker: "caller",
          time: "00:02",
          message: "Help! My dad is having chest pains! He can't breathe!"
        },
        {
          speaker: "ai",
          time: "00:04",
          message: "I'm sending help right away. What's your exact address?",
          confidence: 98.2
        },
        {
          speaker: "caller",
          time: "00:07",
          message: "425 Main Street, apartment 2B. Please hurry!"
        },
        {
          speaker: "ai",
          time: "00:12",
          message: "Help is on the way. Is your father conscious? Can he speak to you?",
          confidence: 96.5
        },
        {
          speaker: "caller",
          time: "00:16",
          message: "He's awake but he says his chest really hurts and he's sweating a lot!"
        }
      ]
    },
    {
      id: "CALL-2024-002",
      incidentId: "INC-2024-002", 
      timestamp: "14:28:45",
      duration: "3:12",
      status: "completed",
      aiConfidence: 96.7,
      transcript: [
        {
          speaker: "ai",
          time: "00:00",
          message: "911, what is your emergency?",
          confidence: 100
        },
        {
          speaker: "caller",
          time: "00:03",
          message: "There's a huge fire at Oak Grove Complex! People are trapped!"
        },
        {
          speaker: "ai",
          time: "00:05",
          message: "I'm dispatching fire units immediately. Can you tell me exactly which building?",
          confidence: 99.1
        },
        {
          speaker: "caller",
          time: "00:08",
          message: "Building C, second floor! I can see people at the windows!"
        },
        {
          speaker: "ai",
          time: "00:11",
          message: "Fire department is en route. Are you in a safe location?",
          confidence: 97.8
        },
        {
          speaker: "caller",
          time: "00:14",
          message: "Yes, I'm across the street. There's a man in the window who looks like he's having trouble breathing!"
        }
      ]
    },
    {
      id: "CALL-2024-003",
      incidentId: "INC-2024-003",
      timestamp: "14:35:12",
      duration: "1:48",
      status: "escalated",
      aiConfidence: 87.3,
      transcript: [
        {
          speaker: "ai",
          time: "00:00",
          message: "911, what is your emergency?",
          confidence: 100
        },
        {
          speaker: "caller",
          time: "00:04",
          message: "There's been a car accident on Highway 101! Multiple cars involved!"
        },
        {
          speaker: "ai",
          time: "00:06",
          message: "I'm sending help to Highway 101. Can you tell me which exit or mile marker?",
          confidence: 75.2
        },
        {
          speaker: "caller",
          time: "00:09",
          message: "It's right near Exit 23, southbound lane. I can see at least 3 cars!"
        }
      ]
    }
  ]);

  const [vapiSummaries, setVapiSummaries] = useState({
    'INC-2024-006': {
      name: "Alvin Tan",
      location: "124 Post Street, San Francisco CA",
      injury: "Broken leg - non-urgent orthopedic injury",
      urgency: "LOW - Non-critical medical transport needed",
      additionalNotes: "Patient reports broken leg injury, ambulatory but requesting medical evaluation. No immediate danger, conscious and alert. Patient states injury is not urgent and can wait for appropriate transport. No signs of compound fracture or severe trauma."
    },
    'INC-2024-001': {
      name: "Robert Chen",
      location: "425 Main Street, Apartment 2B, San Francisco CA",
      injury: "Cardiac distress - chest pain, shortness of breath, profuse sweating",
      urgency: "CRITICAL - Suspected myocardial infarction",
      additionalNotes: "77-year-old male, conscious and alert, history of heart disease per caller (daughter). Patient experiencing severe chest pain radiating to left arm, difficulty breathing, and diaphoresis. Caller reports patient took nitroglycerin without relief."
    },
    'INC-2024-002': {
      name: "Unknown trapped victims",
      location: "Oak Grove Complex, Building C, 2nd Floor, San Francisco CA",
      injury: "Smoke inhalation, potential burns, respiratory distress",
      urgency: "HIGH - Structure fire with entrapment",
      additionalNotes: "Multiple residents trapped on second floor of apartment building. Witness reports at least 2-3 people visible at windows showing signs of respiratory distress from smoke inhalation. Fire started in lower level and spreading rapidly. Building evacuation in progress."
    },
    'INC-2024-003': {
      name: "Multiple vehicle occupants",
      location: "Highway 101 Southbound, Exit 23, San Francisco CA",
      injury: "Unknown injuries - multi-vehicle collision",
      urgency: "MEDIUM - Traffic accident assessment needed",
      additionalNotes: "Multi-vehicle accident involving 3+ cars on Highway 101 southbound near Exit 23. Caller is witness, unable to assess specific injuries from distance. Traffic is backing up, potential for secondary accidents. Weather conditions clear, good visibility."
    },
    'INC-2024-004': {
      name: "Maria Rodriguez",
      location: "1542 Pine Street, Apartment 3A, San Francisco CA", 
      injury: "Fall-related injuries - possible hip fracture",
      urgency: "LOW - Non-critical medical assistance",
      additionalNotes: "82-year-old female fell in bathroom, unable to stand. Alert and oriented, no head injury reported. Complaining of right hip pain, unable to bear weight. Patient takes blood thinners (warfarin). Daughter on scene providing care."
    },
    'INC-2024-005': {
      name: "James Wilson",
      location: "789 Market Street, San Francisco CA",
      injury: "Wellness check - no injuries reported",
      urgency: "LOW - Welfare check completed",
      additionalNotes: "Wellness check requested by family member. Subject found safe and unharmed at residence. Had turned off phone due to work stress. No medical intervention needed. Family notified of subject's wellbeing."
    }
  });

  const [systemLogs, setSystemLogs] = useState([
    {
      timestamp: "14:35:22",
      level: "INFO",
      component: "Routing Agent",
      message: "Auction completed for INC-2024-003 - Engine-7 selected with bid score 94.2"
    },
    {
      timestamp: "14:35:18",
      level: "INFO", 
      component: "Conversational Intake",
      message: "Call INC-2024-003 schema complete - 97.8% confidence, transferring to Routing Agent"
    },
    {
      timestamp: "14:35:15",
      level: "WARN",
      component: "EMS Unit Agent",
      message: "Unit EMS-22 battery low (18%) - recommend return to station for charging"
    },
    {
      timestamp: "14:35:10",
      level: "INFO",
      component: "Secure Comms",
      message: "Encrypted channel established - All units INC-2024-002 connected"
    },
    {
      timestamp: "14:34:58",
      level: "INFO",
      component: "Hospital Agent",
      message: "SFGH trauma bay 2 now available - capacity update broadcasted to EMS agents"
    },
    {
      timestamp: "14:34:45", 
      level: "ERROR",
      component: "Fire Unit Agent",
      message: "Engine-12 GPS signal lost - switching to backup positioning system"
    },
    {
      timestamp: "14:34:32",
      level: "INFO",
      component: "Police Unit Agent", 
      message: "Unit Police-Alpha arrival confirmed at Oak Grove Complex - securing perimeter"
    },
    {
      timestamp: "14:34:28",
      level: "INFO",
      component: "Verifier Agent",
      message: "Audit log entry created - INC-2024-002 dispatch verification complete"
    }
  ]);

  const [unitStatus, setUnitStatus] = useState({
    ems: { available: 4, busy: 1, total: 5 },
    fire: { available: 4, busy: 1, total: 5 },
    police: { available: 3, busy: 1, total: 4 }
  });

  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(null);
  const [showDeploymentMap, setShowDeploymentMap] = useState(false);

  // Backend Integration - SIMULATED VAPI CALL ACTIVE
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeBackendConnection = async () => {
      console.log('🔄 SIMULATED VAPI CONNECTION - FireFly backend active...');
      setBackendError(null);
      
      // Simulate live VAPI call creating new incident
      console.log('📞 LIVE VAPI CALL DETECTED:');
      console.log('- Caller: Alvin Tan');
      console.log('- Location: 124 Post Street, San Francisco');
      console.log('- Emergency: Broken leg (non-urgent)');
      console.log('- AI Processing: 96.4% confidence');
      
      // SIMULATE LIVE VAPI INCIDENT CREATION
      console.log('✅ VAPI Call Connected - Creating live incident from voice data');
      
      // Create the new Alvin Tan incident
      const newVapiIncident: BackendIncident = {
        case_id: 'INC-2024-006',
        timestamp: new Date().toISOString(),
        status: 'processing',
        priority: 'low',
        incident_fact: {
          emergency_type: 'medical',
          location: '124 Post Street, San Francisco CA',
          caller_name: 'Alvin Tan',
          callback_number: '+1 (415) 555-0142',
          people_involved: 1,
          is_active_threat: false,
          details: 'Broken leg - patient conscious and alert, non-urgent transport needed'
        },
        ai_confidence: 96.4,
        processing_time: 1.8,
        conversation_summary: 'Patient Alvin Tan reports broken leg injury at 124 Post Street. Patient is conscious, alert, and states injury is non-urgent. Requests medical evaluation and transport when available.',
        units_assigned: []
      };

      // Create mock incidents plus the new VAPI incident
      const mockIncidents = createMockIncidents();
      const allIncidents = [newVapiIncident, ...mockIncidents];
      
      console.log(`✅ VAPI Backend Connected - Processing ${allIncidents.length} incidents including live VAPI call`);
      setBackendIncidents(allIncidents);
      setBackendConnected(true);
      
      // Convert to frontend format with Alvin Tan incident first
      const frontendIncidents: ActiveIncident[] = allIncidents.map((incident, index) => ({
        id: incident.case_id,
        type: getIncidentType(incident.incident_fact.emergency_type),
        location: incident.incident_fact.location,
        timestamp: new Date(incident.timestamp).toLocaleTimeString(),
        status: incident.status,
        agentsInvolved: incident.case_id === 'INC-2024-006' ? [1, 2, 5, 6, 7] : [1, 2, 5, 6, 7],
        processingTime: incident.processing_time || 0,
        priority: incident.priority,
        emergency_type: incident.incident_fact.emergency_type,
        caller_name: incident.incident_fact.caller_name,
        people_involved: incident.incident_fact.people_involved,
        is_active_threat: incident.incident_fact.is_active_threat,
        details: incident.incident_fact.details,
        ai_confidence: incident.ai_confidence,
        units_assigned: incident.units_assigned || []
      }));
      
      // Ensure Alvin Tan's incident is always first (current active)
      const alvinIncident = frontendIncidents.find(inc => inc.id === 'INC-2024-006');
      const otherIncidents = frontendIncidents.filter(inc => inc.id !== 'INC-2024-006');
      const sortedIncidents = alvinIncident ? [alvinIncident, ...otherIncidents] : frontendIncidents;
      
      setActiveIncidents(sortedIncidents);
      
      // Auto-select Alvin Tan's incident as the current active incident
      setTimeout(() => {
        setExpandedIncident('INC-2024-006');
      }, 1000);
      
      // Simulate real-time VAPI updates
      console.log('📡 VAPI real-time connection established');
      console.log('🤖 AI Agents now processing Alvin Tan incident...');
      
      // Simulate agent processing updates
      setTimeout(() => {
        console.log('🔄 Routing Agent calculating optimal EMS dispatch for non-urgent medical...');
        setAgents(prev => prev.map(agent => 
          agent.id === 2 ? {...agent, status: 'active', lastAction: 'Auction complete - AMB-05 selected for Alvin Tan (124 Post St) - Non-urgent transport ETA 8min'} : agent
        ));
      }, 3000);

      setTimeout(() => {
        console.log('🚑 EMS Unit Agent bidding completed - Unit AMB-05 assigned');
        setActiveIncidents(prev => prev.map(incident => 
          incident.id === 'INC-2024-006' ? {...incident, status: 'dispatched', units_assigned: ['AMB-05']} : incident
        ));
        // Auto-expand Alvin Tan's incident to show details
        setExpandedIncident('INC-2024-006');
      }, 5000);
    };

    initializeBackendConnection();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Update VAPI summaries from backend incidents
  useEffect(() => {
    if (backendIncidents.length > 0) {
      const newVapiSummaries: any = {};
      
      backendIncidents.forEach(incident => {
        newVapiSummaries[incident.case_id] = {
          name: incident.incident_fact.caller_name || 'Unknown caller',
          location: incident.incident_fact.location || 'Location unknown',
          injury: incident.incident_fact.details || 'Details not provided',
          urgency: `${incident.priority.toUpperCase()} - ${incident.incident_fact.emergency_type}`,
          additionalNotes: incident.conversation_summary || `${incident.incident_fact.people_involved} people involved. ${incident.incident_fact.is_active_threat ? 'ACTIVE THREAT PRESENT.' : ''} Callback: ${incident.incident_fact.callback_number}`
        };
      });
      
      setVapiSummaries(prev => ({...prev, ...newVapiSummaries}));
    }
  }, [backendIncidents]);

  const activeDeployments = [
    {
      id: "AMB-01", 
      type: "EMS",
      location: "Main St & 5th Ave",
      incident: "Cardiac Emergency", 
      status: "ENROUTE",
      coordinates: { lat: 37.7849, lng: -122.4094 },
      eta: "3m",
      priority: "CRITICAL"
    },
    {
      id: "FIRE-01",
      type: "FIRE",
      location: "Oak Grove Complex",
      incident: "Structure Fire",
      status: "ON SCENE", 
      coordinates: { lat: 37.7749, lng: -122.4194 },
      eta: null,
      priority: "HIGH"
    },
    {
      id: "PD-03",
      type: "POLICE",
      location: "Oak Grove Complex", 
      incident: "Structure Fire - Traffic Control",
      status: "ON SCENE",
      coordinates: { lat: 37.7749, lng: -122.4194 },
      eta: null,
      priority: "MEDIUM"
    }
  ];

  const handleDeploymentClick = (deployment: any) => {
    setSelectedDeployment(deployment.id);
    setShowDeploymentMap(true);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'agents', label: 'Agents', icon: <Shield className="w-4 h-4" /> },
    { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'units', label: 'Units', icon: <Users className="w-4 h-4" /> },
    { id: 'emergency-intervention', label: 'Emergency Intervention', icon: <Zap className="w-4 h-4" /> }
  ];

  const dashboardBottomTabs = [
    { id: 'flow', label: 'Agent Flow', icon: <Activity className="w-4 h-4" /> },
    { id: 'map', label: 'Live Map', icon: <Map className="w-4 h-4" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: Math.random() > 0.7 ? 'processing' : Math.random() > 0.3 ? 'active' : 'idle',
        processingTime: Math.random() * 4 + 0.5
      })));

      setPerformanceMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 2,
        status: metric.value < metric.target * 0.8 ? 'good' : 
                metric.value < metric.target ? 'warning' : 'critical'
      })));

      setSystemStats(prev => ({
        ...prev,
        totalCallsProcessed: prev.totalCallsProcessed + Math.floor(Math.random() * 3),
        averageResponseTime: prev.averageResponseTime + (Math.random() - 0.5) * 2,
        complianceRate: Math.max(90, Math.min(99, prev.complianceRate + (Math.random() - 0.5) * 2))
      }));
    }, 8000); // Increased to 8000ms to reduce map twitching and improve performance

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400';
      case 'processing': return 'bg-yellow-400';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mapFullscreen) {
        setMapFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [mapFullscreen]);

  const renderContent = () => {
    // Handle dashboard with bottom tabs
    if (currentView === 'dashboard') {
      if (dashboardBottomTab === 'flow') {
        return <AgentFlowConsole />;
      } else if (dashboardBottomTab === 'map') {
        return <MapContainer />;
      } else {
        return <DispatcherDashboard onFullscreenToggle={() => setMapFullscreen(true)} />;
      }
    }

    switch (currentView) {
      case 'flow':
        return <AgentFlowConsole />;
      case 'map':
        return <MapContainer />;
      case 'agents':
        return (
          <div className="relative h-[calc(100vh-80px)] w-full min-h-[600px] overflow-hidden">
            {/* Top Action Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    <Brain className="w-3 h-3 mr-2" />
                    Fetch.ai Agent Network
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                    Autonomous Auction Active
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    7 AEAs Online
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                    FET Network Connected
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 pt-20">
              <div className="grid grid-cols-5 gap-4 h-full p-4">
                {/* Left Panel - Active Agent Processes */}
                <div className="col-span-1 space-y-3 overflow-y-auto dispatch-scrollbar">
                  {/* Agent 001 - Intake Processing */}
                  <Card className="border-l-4 border-l-blue-500 bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">001</h4>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs h-4">I</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">14:32:18</span>
                      </div>
                      <h5 className="font-medium text-sm mb-1">Intake Agent</h5>
                      <p className="text-xs text-muted-foreground mb-2">📍 Voice processing active</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="text-green-400">97.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Schema:</span>
                          <span className="text-blue-400">94% complete</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-2 h-4">PROCESSING</Badge>
                      <div className="text-xs text-muted-foreground mt-1">⏱️ ETA: 2.1s</div>
                    </CardContent>
                  </Card>

                  {/* Agent 002 - Routing */}
                  <Card className="border-l-4 border-l-purple-500 bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">002</h4>
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs h-4">A</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">14:28:45</span>
                      </div>
                      <h5 className="font-medium text-sm mb-1">Auction Master</h5>
                      <p className="text-xs text-muted-foreground mb-2">📍 Multi-unit optimization</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bids:</span>
                          <span className="text-green-400">23 received</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Scenarios:</span>
                          <span className="text-blue-400">847 tested</span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs mt-2 h-4 animate-pulse">AUCTION</Badge>
                      <div className="text-xs text-muted-foreground mt-1">⏱️ ETA: 3.4s</div>
                    </CardContent>
                  </Card>

                  {/* Agent 003 - Unit Swarm */}
                  <Card className="border-l-4 border-l-red-500 bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">003</h4>
                          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs h-4">S</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">14:35:12</span>
                      </div>
                      <h5 className="font-medium text-sm mb-1">Unit Swarm</h5>
                      <p className="text-xs text-muted-foreground mb-2">📍 Fire • EMS • Police bidding</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active:</span>
                          <span className="text-green-400">F:2 E:3 P:4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Best:</span>
                          <span className="text-blue-400">ENG-07 (94.2)</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs mt-2 h-4">BIDDING</Badge>
                      <div className="text-xs text-muted-foreground mt-1">⏱️ Processing: 2.8s</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Panel - Agent Performance & Flow Visualization */}
                <div className="col-span-3 space-y-4 overflow-y-auto dispatch-scrollbar">
                  {/* Agent Processing Pipeline */}
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <h3 className="font-medium">AI Agent Processing Pipeline</h3>
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-4">LIVE</Badge>
                      </div>
                      
                      {/* Pipeline Flow Visualization */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-6">
                          {/* Stage 1: Intake */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-blue-500/20 border-2 border-blue-500/40 rounded-full flex items-center justify-center relative">
                              <Shield className="w-5 h-5 text-blue-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium text-blue-400">Intake</div>
                              <div className="text-xs text-muted-foreground">2.1s avg</div>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 mx-4 relative">
                            <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-purple-400 border-t border-b border-transparent transform -translate-y-1"></div>
                          </div>
                          
                          {/* Stage 2: Routing */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-purple-500/20 border-2 border-purple-500/40 rounded-full flex items-center justify-center relative">
                              <Gavel className="w-5 h-5 text-purple-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium text-purple-400">Auction</div>
                              <div className="text-xs text-muted-foreground">3.4s avg</div>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-400 to-red-400 mx-4 relative">
                            <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-red-400 border-t border-b border-transparent transform -translate-y-1"></div>
                          </div>
                          
                          {/* Stage 3: Unit Swarm */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center relative">
                              <Users className="w-5 h-5 text-red-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium text-red-400">Units</div>
                              <div className="text-xs text-muted-foreground">2.8s avg</div>
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex-1 h-0.5 bg-gradient-to-r from-red-400 to-green-400 mx-4 relative">
                            <div className="absolute right-0 top-0 w-0 h-0 border-l-2 border-l-green-400 border-t border-b border-transparent transform -translate-y-1"></div>
                          </div>
                          
                          {/* Stage 4: Dispatch */}
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center relative">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-medium text-green-400">Dispatch</div>
                              <div className="text-xs text-muted-foreground">0.8s avg</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Current Processing Status */}
                        <div className="bg-muted/30 border border-border/50 rounded-lg p-3">
                          <div className="text-xs text-muted-foreground mb-2">Current Processing:</div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">INC-2024-003 → Intake (94% confidence)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                              <span className="text-xs">INC-2024-002 → Auction (23 bids received)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Processing Time Chart */}
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Clock className="w-4 h-4 text-green-400" />
                          <h4 className="font-medium text-sm">Processing Times</h4>
                        </div>
                        
                        {/* Simple Bar Chart */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-blue-400">Intake Agent</span>
                            <span className="text-xs text-muted-foreground">2.1s</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{width: '35%'}}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-purple-400">Routing Agent</span>
                            <span className="text-xs text-muted-foreground">3.4s</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-purple-400 h-2 rounded-full" style={{width: '57%'}}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-red-400">Unit Swarm</span>
                            <span className="text-xs text-muted-foreground">2.8s</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-red-400 h-2 rounded-full" style={{width: '47%'}}></div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-green-400">Secure Comms</span>
                            <span className="text-xs text-muted-foreground">0.8s</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-green-400 h-2 rounded-full" style={{width: '13%'}}></div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border/50 text-center">
                          <div className="text-lg font-medium text-green-400">9.1s</div>
                          <div className="text-xs text-muted-foreground">Total Average</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Success Rate Chart */}
                    <Card className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <h4 className="font-medium text-sm">Success Rates</h4>
                        </div>
                        
                        {/* Circular Progress Indicators */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-2">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" 
                                  className="text-blue-400" strokeDasharray="175.93" strokeDashoffset="17.59" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-medium text-blue-400">97%</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">AI Accuracy</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-2">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/30" />
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" 
                                  className="text-green-400" strokeDasharray="175.93" strokeDashoffset="26.39" strokeLinecap="round" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-medium text-green-400">94%</span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">Dispatch Rate</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Total Calls Today:</span>
                            <span className="font-medium text-green-400">1,247</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Avg Confidence:</span>
                            <span className="font-medium text-blue-400">96.8%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Auction Calculation Engine */}
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Gavel className="w-4 h-4 text-purple-400" />
                        <h3 className="font-medium">Multi-Criteria Auction Calculations</h3>
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs h-4">
                          LIVE BIDDING
                        </Badge>
                      </div>
                      
                      {/* Current Auction Status */}
                      <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-purple-400">Incident: INC-2024-003</div>
                          <div className="text-xs text-muted-foreground">Cardiac Emergency • Main St & 5th</div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-yellow-400 font-medium">23</div>
                            <div className="text-muted-foreground">Bids Received</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-medium">847</div>
                            <div className="text-muted-foreground">Scenarios Tested</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-medium">2.3s</div>
                            <div className="text-muted-foreground">Compute Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-orange-400 font-medium">94.7</div>
                            <div className="text-muted-foreground">Best Score</div>
                          </div>
                        </div>
                      </div>

                      {/* Bidding Matrix */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 text-blue-400">Live Bid Matrix</h4>
                        <div className="bg-muted/20 border border-border/50 rounded-lg p-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border/30">
                                <th className="text-left py-1 text-muted-foreground">Unit</th>
                                <th className="text-center py-1 text-muted-foreground">ETA</th>
                                <th className="text-center py-1 text-muted-foreground">Fuel</th>
                                <th className="text-center py-1 text-muted-foreground">Capability</th>
                                <th className="text-center py-1 text-muted-foreground">Status</th>
                                <th className="text-center py-1 text-muted-foreground">Score</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-border/20">
                                <td className="py-1 text-blue-400 font-medium">AMB-01</td>
                                <td className="text-center py-1 text-green-400">3.2m</td>
                                <td className="text-center py-1 text-green-400">87%</td>
                                <td className="text-center py-1 text-blue-400">ALS</td>
                                <td className="text-center py-1 text-green-400">Available</td>
                                <td className="text-center py-1 text-green-400 font-medium">94.7</td>
                              </tr>
                              <tr className="border-b border-border/20">
                                <td className="py-1 text-blue-400 font-medium">AMB-02</td>
                                <td className="text-center py-1 text-yellow-400">5.8m</td>
                                <td className="text-center py-1 text-yellow-400">62%</td>
                                <td className="text-center py-1 text-blue-400">BLS</td>
                                <td className="text-center py-1 text-green-400">Available</td>
                                <td className="text-center py-1 text-yellow-400">76.3</td>
                              </tr>
                              <tr className="border-b border-border/20">
                                <td className="py-1 text-red-400 font-medium">FIRE-01</td>
                                <td className="text-center py-1 text-green-400">2.9m</td>
                                <td className="text-center py-1 text-green-400">91%</td>
                                <td className="text-center py-1 text-purple-400">Paramedic</td>
                                <td className="text-center py-1 text-orange-400">Returning</td>
                                <td className="text-center py-1 text-orange-400">82.1</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-yellow-400 font-medium">PD-03</td>
                                <td className="text-center py-1 text-blue-400">4.1m</td>
                                <td className="text-center py-1 text-green-400">95%</td>
                                <td className="text-center py-1 text-gray-400">First Aid</td>
                                <td className="text-center py-1 text-green-400">Patrol</td>
                                <td className="text-center py-1 text-blue-400">68.9</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Optimization Algorithm */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 text-orange-400">Multi-Criteria Optimization</h4>
                        <div className="bg-muted/20 border border-border/50 rounded-lg p-3">
                          <div className="text-xs font-mono text-purple-400 mb-2">
                            Score = w₁×(1/ETA) + w₂×Fuel + w₃×Capability + w₄×Status + w₅×Distance⁻¹
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ETA Weight (w₁):</span>
                              <span className="text-blue-400 font-mono">0.35</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fuel Weight (w₂):</span>
                              <span className="text-green-400 font-mono">0.15</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Capability (w₃):</span>
                              <span className="text-purple-400 font-mono">0.30</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status (w₄):</span>
                              <span className="text-orange-400 font-mono">0.20</span>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-green-400">
                            ✓ Winner: AMB-01 (Score: 94.7) - Optimal ALS unit with 3.2min ETA
                          </div>
                        </div>
                      </div>

                      {/* Real-time Calculation Updates */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 text-green-400">Calculation Engine Status</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs">
                            <div className="text-green-400 font-medium">CPU Load</div>
                            <div className="text-muted-foreground">78% (8 threads)</div>
                          </div>
                          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
                            <div className="text-blue-400 font-medium">Algorithm</div>
                            <div className="text-muted-foreground">TOPSIS + Genetic</div>
                          </div>
                          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs">
                            <div className="text-purple-400 font-medium">Iterations</div>
                            <div className="text-muted-foreground">1,247 cycles</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Agent Health & Monitoring */}
                <div className="col-span-1 space-y-3 overflow-y-auto dispatch-scrollbar">
                  {/* Agent Health Status */}
                  <Card className="bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <h4 className="font-medium text-sm">Agent Health</h4>
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-4">ALL OK</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-400">Intake Agent</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400">99.8%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-purple-400">Routing Agent</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400">99.2%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-red-400">Unit Swarm</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-yellow-400">97.1%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-400">Hospital Agent</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400">100%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-orange-400">Secure Comms</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400">99.9%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Processing Load */}
                  <Card className="bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-3 h-3 text-blue-400" />
                        <h4 className="font-medium text-sm">Processing Load</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">CPU Usage</span>
                            <span className="text-blue-400">67%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-blue-400 h-1.5 rounded-full" style={{width: '67%'}}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Memory</span>
                            <span className="text-green-400">43%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-green-400 h-1.5 rounded-full" style={{width: '43%'}}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Network I/O</span>
                            <span className="text-purple-400">82%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-purple-400 h-1.5 rounded-full" style={{width: '82%'}}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agent Queues */}
                  <Card className="bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <h4 className="font-medium text-sm">Processing Queues</h4>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pending Calls</span>
                          <span className="text-yellow-400">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Auctions</span>
                          <span className="text-purple-400">2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unit Confirmations</span>
                          <span className="text-blue-400">7</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Encryption Queue</span>
                          <span className="text-green-400">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Errors */}
                  <Card className="bg-card/50">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <h4 className="font-medium text-sm">Recent Alerts</h4>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                          <div className="font-medium text-yellow-400">WARN</div>
                          <div className="text-muted-foreground">Agent 003 response +2s</div>
                          <div className="text-muted-foreground">2m ago</div>
                        </div>
                        
                        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs">
                          <div className="font-medium text-red-400">ERROR</div>
                          <div className="text-muted-foreground">GPS signal lost unit</div>
                          <div className="text-muted-foreground">5m ago</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Agent Controls */}
                  <Card className="bg-card/50">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm mb-3">Quick Actions</h4>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Test All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Restart
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          Retrain
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                        >
                          <Database className="w-3 h-3 mr-1" />
                          Backup
                        </Button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-8 text-xs bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => setLogsDialogOpen(true)}
                        >
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          View System Logs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>


          </div>
        );
      case 'incidents':
        return (
          <div className="relative h-[calc(100vh-80px)] w-full min-h-[600px] overflow-hidden">
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertTriangle className="w-3 h-3 mr-2" />
                    Active Incidents ({activeIncidents.length})
                  </Badge>
                  <Badge variant="outline" className={`${
                    backendConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                    backendError ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    <Radio className="w-3 h-3 mr-2" />
                    {backendConnected ? 'Live Backend Connected' : 
                     backendError ? 'Backend Connection Failed' :
                     'Demo Mode Active'}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Clock className="w-3 h-3 mr-2" />
                    Avg Response: 28.4s
                  </Badge>
                </div>
                
                {!backendConnected && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 text-blue-400" />
                    <span>Generate incidents: </span>
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-mono">
                      +1 (669) 205 9496
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="absolute inset-0 pt-20">
              <div className="grid grid-cols-3 gap-6 h-full p-6">
                {/* Left Panel - Active Incidents (Wider) */}
                <div className="col-span-1 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Active Incidents</h3>
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs h-5">3</Badge>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-scroll dispatch-scrollbar" style={{maxHeight: 'calc(100vh - 200px)'}}>
                    {/* Dynamic Incident Cards from Backend */}
                    {activeIncidents.map((incident, index) => {
                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'critical': return 'border-l-red-500';
                          case 'high': return 'border-l-orange-500';
                          case 'medium': return 'border-l-yellow-500';
                          case 'low': return 'border-l-blue-500';
                          default: return 'border-l-gray-500';
                        }
                      };

                      const getPriorityBadge = (priority: string) => {
                        switch (priority) {
                          case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
                          case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
                          case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
                          case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                          default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
                        }
                      };

                      const getPriorityLetter = (priority: string) => {
                        switch (priority) {
                          case 'critical': return 'C';
                          case 'high': return 'H';  
                          case 'medium': return 'M';
                          case 'low': return 'L';
                          default: return 'M';
                        }
                      };

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'dispatched': return 'text-yellow-400';
                          case 'active': return 'text-green-400';
                          case 'processing': return 'text-blue-400';
                          case 'completed': return 'text-green-400';
                          default: return 'text-gray-400';
                        }
                      };

                      const getStatusDisplay = (status: string, units: string[]) => {
                        if (status === 'dispatched' && units.length > 0) {
                          return 'Enroute';
                        }
                        switch (status) {
                          case 'processing': return 'Processing';
                          case 'active': return 'Onscene';
                          case 'completed': return 'Completed';
                          default: return status;
                        }
                      };

                      const isExpanded = expandedIncident === incident.id;
                      const isAlvinTan = incident.id === 'INC-2024-006';

                      return (
                        <Card 
                          key={incident.id}
                          className={`border-l-4 ${getPriorityColor(incident.priority || 'medium')} bg-card/50 cursor-pointer transition-all ${
                            isExpanded ? `ring-2 ring-${incident.priority === 'critical' ? 'red' : incident.priority === 'high' ? 'orange' : incident.priority === 'medium' ? 'yellow' : 'blue'}-500/50 bg-${incident.priority === 'critical' ? 'red' : incident.priority === 'high' ? 'orange' : incident.priority === 'medium' ? 'yellow' : 'blue'}-500/5` : 'hover:bg-card/70'
                          } ${isAlvinTan ? 'ring-2 ring-blue-500/30' : ''}`} 
                          onClick={() => setExpandedIncident(isExpanded ? null : incident.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium text-lg">{String(index + 1).padStart(3, '0')}</h4>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${getPriorityBadge(incident.priority || 'medium')}`}>
                                  {getPriorityLetter(incident.priority || 'medium')}
                                </div>
                                {incident.is_active_threat && (
                                  <Badge variant="destructive" className="text-xs h-4 animate-pulse">THREAT</Badge>
                                )}
                                {isAlvinTan && (
                                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs h-5 animate-pulse">
                                    LIVE CALL
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <h5 className="font-medium text-lg mb-1">{incident.type}</h5>
                            <div className="flex items-center space-x-1 mb-3">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">{incident.location}</p>
                            </div>
                            
                            {/* Enhanced details for Alvin Tan */}
                            {isAlvinTan && (
                              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Caller:</span>
                                    <span className="font-medium text-blue-400">{incident.caller_name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Injury:</span>
                                    <span className="text-white">Broken leg (non-urgent)</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Condition:</span>
                                    <span className="text-green-400">Conscious & Alert</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Status and Details Display */}
                            <div className="space-y-3">
                              {/* Status Badge with Color */}
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className={`text-sm h-6 px-3 font-medium ${
                                  incident.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                  incident.status === 'dispatched' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  incident.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}>
                                  {getStatusDisplay(incident.status, incident.units_assigned || [])}
                                </Badge>
                                {incident.ai_confidence && (
                                  <span className="text-sm text-green-400 font-medium">{incident.ai_confidence}%</span>
                                )}
                              </div>

                              {/* Units Assigned */}
                              {incident.units_assigned && incident.units_assigned.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {incident.units_assigned.map(unit => (
                                    <Badge key={unit} variant="outline" className="bg-white/10 text-white border-white/20 text-sm h-6 px-3">
                                      {unit}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* ETA for Alvin Tan's dispatched unit */}
                              {isAlvinTan && incident.status === 'dispatched' && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Clock className="w-4 h-4 text-orange-400" />
                                  <span className="text-orange-400 font-medium">ETA: 8m</span>
                                </div>
                              )}

                              {/* Processing Time */}
                              {incident.processingTime > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  Process time: {incident.processingTime}s
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Recent Completed Incidents */}
                    <div className="pt-4 border-t border-border/50">
                      <h4 className="font-medium text-sm mb-3 text-muted-foreground">Recently Completed</h4>
                      <div className="space-y-2">
                        <Card className="border-l-4 border-l-green-500 bg-card/30 hover:bg-card/40 cursor-pointer" onClick={() => setExpandedIncident('INC-2024-004')}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-sm">004 - Medical Call</h5>
                                <p className="text-xs text-muted-foreground">Resolved • 14:15:30 • AI: 96.2%</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-4">CLOSED</Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500 bg-card/30 hover:bg-card/40 cursor-pointer" onClick={() => setExpandedIncident('INC-2024-005')}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-sm">005 - Wellness Check</h5>
                                <p className="text-xs text-muted-foreground">Resolved • 13:58:12 • AI: 91.8%</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-4">CLOSED</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Panel - AI Conversation Replay (Wider) */}
                <div className="col-span-2 flex flex-col h-full">
                  {expandedIncident ? (
                    // Active Conversation View
                    <div className="h-full flex flex-col bg-card/50 rounded-lg border">
                      {/* Conversation Header */}
                      <div className="flex items-center justify-between p-6 border-b border-border/50">
                        <div className="flex items-center space-x-4">
                          <Radio className="w-6 h-6 text-blue-400" />
                          <div>
                            <h3 className="font-medium text-lg">AI Call Transcript - {expandedIncident}</h3>
                            <p className="text-sm text-muted-foreground">Emergency conversation with AI confidence scoring</p>
                          </div>
                          {expandedIncident.includes('001') || expandedIncident.includes('003') ? (
                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                          ) : null}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedIncident(null)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* VAPI Summary - Main Content */}
                      <div className="flex-1 p-6 overflow-y-auto dispatch-scrollbar">
                        <div className="max-w-4xl mx-auto">
                          {(() => {
                            const currentSummary = vapiSummaries[expandedIncident];
                            const currentTranscript = callTranscripts.find(t => t.incidentId === expandedIncident);
                            
                            if (!currentSummary) return null;
                            
                            return (
                              <div className="space-y-6">
                                {/* VAPI Summary Section */}
                                <div className="bg-card/70 border rounded-lg p-6">
                                  <h4 className="font-medium text-lg mb-4 text-blue-400">AI Summary</h4>
                                  
                                  <div className="grid grid-cols-1 gap-4">
                                    {/* Name */}
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs h-5">NAME</Badge>
                                      </div>
                                      <p className="text-base font-medium text-white">{currentSummary.name}</p>
                                    </div>

                                    {/* Location */}
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-5">LOCATION</Badge>
                                      </div>
                                      <p className="text-base text-white">{currentSummary.location}</p>
                                    </div>

                                    {/* Injury */}
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs h-5">INJURY</Badge>
                                      </div>
                                      <p className="text-base text-white">{currentSummary.injury}</p>
                                    </div>

                                    {/* Urgency */}
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className={`text-xs h-5 ${
                                          currentSummary.urgency.includes('CRITICAL') ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                          currentSummary.urgency.includes('HIGH') ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        }`}>URGENCY</Badge>
                                      </div>
                                      <p className={`text-base font-medium ${
                                        currentSummary.urgency.includes('CRITICAL') ? 'text-red-400' :
                                        currentSummary.urgency.includes('HIGH') ? 'text-orange-400' :
                                        'text-yellow-400'
                                      }`}>{currentSummary.urgency}</p>
                                    </div>

                                    {/* Additional Notes */}
                                    <div className="p-4 bg-muted/30 border border-border/50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs h-5">ADDITIONAL NOTES</Badge>
                                      </div>
                                      <p className="text-base leading-relaxed text-white">{currentSummary.additionalNotes}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Call Transcript Section */}
                                {currentTranscript && (
                                  <div className="bg-card/50 border rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                      <h4 className="font-medium text-lg text-muted-foreground">Call Transcript</h4>
                                      <div className="flex items-center space-x-3">
                                        <Badge variant="outline" className="text-xs h-5">
                                          AI Confidence: {currentTranscript.aiConfidence}%
                                        </Badge>
                                        <Badge variant="outline" className="text-xs h-5">
                                          Duration: {currentTranscript.duration}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3 max-h-60 overflow-y-auto dispatch-scrollbar">
                                      {currentTranscript.transcript.map((entry, index) => (
                                        <div key={index} className={`flex ${entry.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                          <div className={`max-w-[75%] ${
                                            entry.speaker === 'ai' 
                                              ? 'bg-blue-500/10 border border-blue-500/20' 
                                              : 'bg-muted/70 border border-muted'
                                          } rounded-lg p-3`}>
                                            <div className="flex items-center space-x-2 mb-2">
                                              <Badge variant="outline" className="text-xs h-4">
                                                {entry.speaker === 'ai' ? 'AI DISPATCHER' : 'CALLER'}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground font-mono">{entry.time}</span>
                                              {entry.confidence && (
                                                <Badge variant="outline" className={`text-xs h-4 ${
                                                  entry.confidence >= 95 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                                  entry.confidence >= 85 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                  'bg-red-500/20 text-red-400 border-red-500/30'
                                                }`}>
                                                  {entry.confidence}%
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-sm">{entry.message}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Live Call Indicator */}
                                {currentTranscript && currentTranscript.status === 'live' && (
                                  <div className="flex justify-center py-4">
                                    <div className="flex items-center space-x-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                                      <span className="text-sm text-blue-400 font-medium">Call in progress...</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="p-6 border-t border-border/50 bg-muted/30">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-8">
                            {(() => {
                              const currentTranscript = callTranscripts.find(t => t.incidentId === expandedIncident);
                              const currentSummary = vapiSummaries[expandedIncident];
                              if (!currentTranscript || !currentSummary) return null;
                              
                              return (
                                <>
                                  <div>AI Confidence: <span className="font-medium text-green-400 text-lg">{currentTranscript.aiConfidence}%</span></div>
                                  <div>Status: <span className="font-medium text-blue-400">{currentTranscript.status.toUpperCase()}</span></div>
                                  <div>Priority: <span className={`font-medium ${
                                    currentSummary.urgency.includes('CRITICAL') ? 'text-red-400' :
                                    currentSummary.urgency.includes('HIGH') ? 'text-orange-400' :
                                    'text-yellow-400'
                                  }`}>
                                    {currentSummary.urgency.includes('CRITICAL') ? 'CRITICAL' :
                                     currentSummary.urgency.includes('HIGH') ? 'HIGH' : 'MEDIUM'}
                                  </span></div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="flex justify-center space-x-4">
                          <Button className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 px-8 py-3">
                            <CheckCircle className="w-5 h-5 mr-3" />
                            Approve & Dispatch
                          </Button>
                          <Button variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 px-8 py-3">
                            <Clock className="w-5 h-5 mr-3" />
                            Hold for Review
                          </Button>
                          <Button variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 px-8 py-3">
                            <X className="w-5 h-5 mr-3" />
                            Cancel Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // No Incident Selected State
                    <div className="h-full flex items-center justify-center bg-card/30 rounded-lg border border-dashed border-border">
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Radio className="w-10 h-10 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg mb-3">Select an Incident to View AI Summary</h3>
                          <p className="text-muted-foreground">Click on any incident in the left panel to see the detailed AI voice summary with structured emergency information</p>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>AI Summary includes:</p>
                          <div className="flex flex-wrap justify-center gap-4 text-xs">
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Name</Badge>
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">Location</Badge>
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">Injury</Badge>
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">Urgency</Badge>
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Additional Notes</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'units':
        return (
          <div className="relative h-[calc(100vh-30px)] w-full min-h-[600px] overflow-hidden">
            {/* Map Background - Main Container */}
            <div className="absolute inset-0 bg-gray-900">
              <div className="relative w-full h-full">
                <MapContainer />
                
                {/* UI Panels Container - Positioned within map bounds with 24px margin */}
                <div className="absolute inset-6">
                  {/* Unit Type Summary - Top Right (Within Map Frame) */}
                  <div className="absolute top-[50px] right-[50px] bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 z-40 w-52">
                    <h3 className="text-xs font-medium text-white mb-2 flex items-center space-x-2">
                      <Activity className="w-3 h-3 text-white" />
                      <span>Unit Summary</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs text-blue-400">EMS</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-400">{unitStatus.ems.available}</span>
                          <span className="text-orange-400">{unitStatus.ems.busy}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-xs text-red-400">FIRE</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-400">{unitStatus.fire.available}</span>
                          <span className="text-orange-400">{unitStatus.fire.busy}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-xs text-yellow-400">POLICE</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-green-400">{unitStatus.police.available}</span>
                          <span className="text-orange-400">{unitStatus.police.busy}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quick Status Summary */}
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center">
                          <div className="text-green-400">8</div>
                          <div className="text-gray-400 text-xs">Avail</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-400">6</div>
                          <div className="text-gray-400 text-xs">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-400">14</div>
                          <div className="text-gray-400 text-xs">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Deployments Panel - Left Side (Within Map Frame) */}
                  <div className="absolute top-[50px] left-0 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 z-40 w-68">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-medium text-white flex items-center space-x-2">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span>Active Deployments</span>
                      </h3>
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs h-4">
                        {activeDeployments.length}
                      </Badge>
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto dispatch-scrollbar">
                      {activeDeployments.map((deployment) => (
                        <div 
                          key={deployment.id} 
                          className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => handleDeploymentClick(deployment)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                deployment.type === 'EMS' ? 'bg-blue-400' :
                                deployment.type === 'FIRE' ? 'bg-red-400' : 'bg-yellow-400'
                              }`}></div>
                              <span className="text-xs font-medium text-white">{deployment.id}</span>
                              {deployment.priority === 'CRITICAL' && (
                                <Badge variant="destructive" className="text-xs h-3 px-1">CRIT</Badge>
                              )}
                            </div>
                            <Badge variant="outline" className={`text-xs h-4 px-1 ${
                              deployment.status === 'ON SCENE' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                            }`}>
                              {deployment.status === 'ON SCENE' ? 'ON SCENE' : 'ENROUTE'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-300 mb-1">
                            📍 {deployment.location}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {deployment.incident}
                          </div>
                          {deployment.eta && (
                            <div className="text-xs text-blue-400 mt-1">
                              ETA: {deployment.eta}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Units Panel - Bottom Right (Within Map Frame) */}
                  <div className="absolute bottom-[125px] right-0 bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg p-3 z-40 w-52">
                    <h3 className="text-xs font-medium text-white mb-2 flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Available Units</span>
                    </h3>
                    <div className="space-y-1 max-h-32 overflow-y-auto dispatch-scrollbar">
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-medium text-xs">AMB-02, 03, 04</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 h-3 text-xs px-1">
                            RDY
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-xs">EMS Units</div>
                      </div>
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-medium text-xs">FIRE-03, 04</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 h-3 text-xs px-1">
                            RDY
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-xs">Fire Units</div>
                      </div>
                      <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 font-medium text-xs">PD-01, 02, 04</span>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 h-3 text-xs px-1">
                            RDY
                          </Badge>
                        </div>
                        <div className="text-gray-400 text-xs">Police Units</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'transcripts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Live Call Transcripts</h2>
                <p className="text-sm text-muted-foreground">Real-time voice AI interactions with emergency callers</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span>1 Live Call</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  AI Confidence: 94.8%
                </Badge>
              </div>
            </div>

            {callTranscripts.map((call) => (
              <Card key={call.id} className={`${call.status === 'live' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <Radio className="w-4 h-4" />
                        <span>{call.id}</span>
                        {call.status === 'live' && (
                          <Badge variant="destructive" className="text-xs animate-pulse">LIVE</Badge>
                        )}
                        {call.status === 'escalated' && (
                          <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">ESCALATED</Badge>
                        )}
                        {call.status === 'completed' && (
                          <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">COMPLETED</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Incident: {call.incidentId} • Duration: {call.duration} • Started: {call.timestamp}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">AI Confidence</div>
                      <div className="text-sm font-medium">{call.aiConfidence}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {call.transcript.map((entry, index) => (
                      <div key={index} className={`flex ${entry.speaker === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          entry.speaker === 'ai' 
                            ? 'bg-blue-500/10 border border-blue-500/20' 
                            : 'bg-muted/50 border'
                        }`}>
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs h-4">
                              {entry.speaker === 'ai' ? 'AI DISPATCHER' : 'CALLER'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{entry.time}</span>
                            {entry.confidence && (
                              <span className="text-xs text-muted-foreground">
                                ({entry.confidence}% confidence)
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{entry.message}</p>
                          {entry.speaker === 'ai' && entry.confidence && entry.confidence < 90 && (
                            <div className="mt-1 text-xs text-yellow-400">
                              ��� Low confidence - human review recommended
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {call.status === 'live' && (
                      <div className="flex justify-center">
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                          <span>Call in progress...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Call Analytics */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-medium">Response Time</div>
                        <div className="text-muted-foreground">
                          {call.id === 'CALL-2024-003' ? '12.8s' : 
                           call.id === 'CALL-2024-002' ? '8.2s' : '6.1s'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Keywords Detected</div>
                        <div className="text-muted-foreground">
                          {call.id === 'CALL-2024-003' ? 'fire, trapped, cardiac' : 
                           call.id === 'CALL-2024-002' ? 'unconscious, CPR' : 'gun, robbery, hiding'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">Priority Level</div>
                        <div className={`${
                          call.id === 'CALL-2024-001' ? 'text-red-400' : 
                          call.id === 'CALL-2024-003' ? 'text-orange-400' : 'text-yellow-400'
                        }`}>
                          {call.id === 'CALL-2024-001' ? 'CRITICAL' : 
                           call.id === 'CALL-2024-003' ? 'HIGH' : 'URGENT'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* AI Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Voice AI Performance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-lg font-medium text-green-400">94.3%</div>
                    <div className="text-xs text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-lg font-medium text-blue-400">2.1s</div>
                    <div className="text-xs text-muted-foreground">Avg Response Time</div>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="text-lg font-medium text-purple-400">97.8%</div>
                    <div className="text-xs text-muted-foreground">Keyword Accuracy</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="text-lg font-medium text-orange-400">12</div>
                    <div className="text-xs text-muted-foreground">Escalations Today</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'emergency-intervention':
        setInterventionModalOpen(true);
        setCurrentView('dashboard'); // Return to dashboard after opening modal
        return <DispatcherDashboard onFullscreenToggle={() => setMapFullscreen(true)} />;
      default:
        return <DispatcherDashboard />;
    }
  };

  // Show Landing Page
  if (showLanding) {
    return (
      <div className="dark">
        <FireflyLanding onEnterDemo={() => setShowLanding(false)} />
      </div>
    );
  }

  // Fullscreen Map Mode
  if (mapFullscreen) {
    return (
      <div className="dark min-h-screen bg-background relative">
        {/* Fullscreen Map */}
        <div className="absolute inset-0">
          <DispatcherDashboard onFullscreenToggle={() => setMapFullscreen(false)} />
        </div>
        
        {/* Fullscreen Controls - Top Right */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapFullscreen(false)}
            className="bg-black/80 backdrop-blur-sm border-white/20 text-white hover:bg-black/90 h-10 px-4"
          >
            <Minimize className="w-4 h-4 mr-2" />
            Exit Fullscreen
          </Button>
        </div>
        
        {/* Fullscreen Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
            <p className="text-white text-sm">Press <kbd className="bg-white/20 px-2 py-1 rounded text-xs">ESC</kbd> or click Exit Fullscreen to return</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 border-r border-border bg-muted/30`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <FireflyLogo size="md" className="shrink-0" />
                <div>
                  <h2 className="font-semibold text-lg text-foreground">FireFly</h2>
                  <p className="text-sm text-muted-foreground">Emergency Response System</p>
                </div>
              </div>
            )}
            {!sidebarOpen && (
              <div className="flex items-center justify-center w-full">
                <FireflyLogo size="sm" className="shrink-0" />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className={`w-full justify-start h-auto py-3 px-3 ${!sidebarOpen && 'px-2'} ${
                  currentView === item.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setCurrentView(item.id)}
              >
                <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : ''}`}>
                  <div className="shrink-0">
                    {item.icon}
                  </div>
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Button>
            ))}
          </nav>



          {/* Quick Status Indicators */}
          {sidebarOpen && (
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg border">
                <h3 className="text-sm font-medium mb-3 text-foreground flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>System Status</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Backend Connection</span>
                    <Badge variant={backendConnected ? "default" : "outline"} className={`h-5 text-xs ${
                      backendConnected ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                      backendError ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {backendConnected ? 'LIVE' : backendError ? 'ERROR' : 'DEMO'}
                    </Badge>
                  </div>
                  {backendError && (
                    <div className="text-xs text-red-400 mt-1 truncate" title={backendError}>
                      {backendError.length > 40 ? `${backendError.substring(0, 40)}...` : backendError}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Incidents</span>
                    <Badge variant="destructive" className="h-5 text-xs">{activeIncidents.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Available Units</span>
                    <Badge variant="outline" className="h-5 text-xs">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">System Load</span>
                    <Badge variant="outline" className="h-5 text-xs">67%</Badge>
                  </div>
                </div>
                
                {/* Voice Agent Info */}
                {!backendConnected && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {backendError && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          resetClient();
                          setBackendError(null);
                          window.location.reload();
                        }}
                        className="w-full h-7 text-xs mb-2 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                      >
                        Reset & Retry
                      </Button>
                    )}
                    <div className="text-xs text-muted-foreground mb-1">Generate Real Incidents:</div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-blue-400" />
                      <span className="text-xs font-mono text-blue-400">+1 (669) 205 9496</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Call Vapi AI Voice Agent</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4">




          {/* Dynamic Content */}
          {renderContent()}


        </div>
      </div>

      {/* System Logs Dialog */}
      <Dialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Logs</span>
            </DialogTitle>
            <DialogDescription>
              Real-time system logs from all Firefly agents and components
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full">
            <div className="space-y-2 p-4">
              {systemLogs.map((log, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${
                  log.level === 'ERROR' ? 'bg-red-500/10 border-red-500/20' :
                  log.level === 'WARN' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  'bg-muted/50 border-border'
                }`}>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className={`text-xs h-5 ${
                      log.level === 'ERROR' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {log.level}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{log.timestamp}</span>
                      <Badge variant="outline" className="text-xs h-4">
                        {log.component}
                      </Badge>
                    </div>
                    <p className="text-sm">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live logging active - Updates every 5 seconds</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Export Logs
              </Button>
              <Button variant="outline" size="sm">
                Clear Buffer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deployment Location Map Dialog */}
      <Dialog open={showDeploymentMap} onOpenChange={setShowDeploymentMap}>
        <DialogContent className="max-w-5xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Unit Location: {selectedDeployment}</span>
            </DialogTitle>
            <DialogDescription>
              Real-time location and status of deployed emergency unit
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] w-full relative">
            {/* Map Container */}
            <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
              <MapContainer />
            </div>
            
            {/* Unit Details Overlay */}
            {selectedDeployment && (
              <div className="absolute top-[114px] left-[11px] bg-black/96 backdrop-blur-sm border border-white/10 rounded-lg p-2 z-40 w-52">
                {(() => {
                  const deployment = activeDeployments.find(d => d.id === selectedDeployment);
                  if (!deployment) return null;
                  
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-2 h-2 rounded-full ${
                            deployment.type === 'EMS' ? 'bg-blue-400' :
                            deployment.type === 'FIRE' ? 'bg-red-400' : 'bg-yellow-400'
                          }`}></div>
                          <span className="font-medium text-white text-xs">{deployment.id}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] h-3 px-1 ${
                          deployment.status === 'ON SCENE' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {deployment.status === 'ON SCENE' ? 'SCENE' : 'ROUTE'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-0.5 text-[10px]">
                        <div className="flex">
                          <span className="text-gray-400 w-12">Type:</span>
                          <span className="text-white">{deployment.type}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-400 w-12">Loc:</span>
                          <span className="text-white truncate">{deployment.location}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-400 w-12">Inc:</span>
                          <span className="text-white truncate">{deployment.incident}</span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-400 w-12">Pri:</span>
                          <span className={`${
                            deployment.priority === 'CRITICAL' ? 'text-red-400' :
                            deployment.priority === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>
                            {deployment.priority}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="text-gray-400 w-12">GPS:</span>
                          <span className="text-blue-300 font-mono text-[9px]">
                            {deployment.coordinates.lat.toFixed(3)}, {deployment.coordinates.lng.toFixed(3)}
                          </span>
                        </div>
                        {deployment.eta && (
                          <div className="flex">
                            <span className="text-gray-400 w-12">ETA:</span>
                            <span className="text-blue-400">{deployment.eta}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 flex space-x-0.5">
                        <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] px-1">
                          <Radio className="w-2.5 h-2.5 mr-0.5" />
                          Radio
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 h-6 text-[10px] px-1">
                          <Phone className="w-2.5 h-2.5 mr-0.5" />
                          Call
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-40">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowDeploymentMap(false)}
                className="bg-black/90 backdrop-blur-sm border-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Intervention Modal */}
      <QuickInterventionModal 
        open={interventionModalOpen} 
        onOpenChange={setInterventionModalOpen}
      />

      {/* Toast Notifications */}
      <Toaster />

    </div>
  );
}