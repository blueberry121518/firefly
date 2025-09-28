/**
 * Backend Integration for FireFly Incident System
 * Connects frontend to Redis incident registry and Vapi voice AI data
 */

import { createClient, getExistingClient } from './supabase/info';

// Backend incident data structure matching your IncidentFact schema
export interface IncidentFact {
  case_id: string;
  timestamp: string;
  emergency_type: string;
  incident_type?: string; // Alias for emergency_type
  location: string;
  caller_name?: string;
  callback_number: string;
  is_caller_safe?: boolean;
  people_involved: number;
  affected_individuals?: number; // Alias for people_involved
  is_active_threat: boolean;
  details: string;
  description?: string; // Alias for details
  severity?: string;
  latitude?: number;
  longitude?: number;
}

// Frontend incident interface updated to match backend
export interface BackendIncident {
  case_id: string;
  incident_fact: IncidentFact;
  conversation_summary?: string;
  timestamp: string;
  status: 'active' | 'processing' | 'dispatched' | 'completed';
  ai_confidence?: number;
  distance_km?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  units_assigned: string[];
  processing_time?: number;
}

// Map emergency types to priority levels
export function getIncidentPriority(emergency_type: string, is_active_threat: boolean, severity?: string): 'low' | 'medium' | 'high' | 'critical' {
  // Critical incidents
  if (is_active_threat || 
      emergency_type?.toLowerCase().includes('cardiac') ||
      emergency_type?.toLowerCase().includes('heart') ||
      emergency_type?.toLowerCase().includes('breathing') ||
      emergency_type?.toLowerCase().includes('unconscious') ||
      severity?.toLowerCase().includes('critical')) {
    return 'critical';
  }
  
  // High priority incidents  
  if (emergency_type?.toLowerCase().includes('fire') ||
      emergency_type?.toLowerCase().includes('accident') ||
      emergency_type?.toLowerCase().includes('injury') ||
      emergency_type?.toLowerCase().includes('bleeding') ||
      severity?.toLowerCase().includes('high')) {
    return 'high';
  }
  
  // Medium priority incidents
  if (emergency_type?.toLowerCase().includes('medical') ||
      emergency_type?.toLowerCase().includes('fall') ||
      emergency_type?.toLowerCase().includes('pain') ||
      severity?.toLowerCase().includes('medium')) {
    return 'medium';
  }
  
  // Low priority (wellness checks, etc.)
  return 'low';
}

// Map emergency types to incident categories
export function getIncidentType(emergency_type: string): string {
  const type = emergency_type?.toLowerCase() || '';
  
  if (type.includes('cardiac') || type.includes('heart') || type.includes('chest')) {
    return 'Cardiac Emergency';
  }
  if (type.includes('fire') || type.includes('smoke') || type.includes('burn')) {
    return 'Structure Fire';
  }
  if (type.includes('accident') || type.includes('collision') || type.includes('crash')) {
    return 'Traffic Accident';
  }
  if (type.includes('medical') || type.includes('injury') || type.includes('pain')) {
    return 'Medical Emergency';
  }
  if (type.includes('wellness') || type.includes('check') || type.includes('welfare')) {
    return 'Wellness Check';
  }
  if (type.includes('police') || type.includes('crime') || type.includes('theft')) {
    return 'Police Matter';
  }
  
  // Default fallback
  return emergency_type || 'General Emergency';
}

// Parse location coordinates from your backend format
export function parseLocationCoordinates(location: string): { lat: number; lng: number } {
  // Default to San Francisco if no coordinates provided
  const defaultCoords = { lat: 37.7749, lng: -122.4194 };
  
  if (!location || !location.includes(',')) {
    return defaultCoords;
  }
  
  try {
    // Try to parse "lat,lon" format from your backend
    const parts = location.split(',');
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (error) {
    console.warn('Error parsing location coordinates:', error);
  }
  
  return defaultCoords;
}

// Convert backend incident to frontend format
export function convertBackendIncident(backendData: any): BackendIncident {
  const incident_fact: IncidentFact = backendData.incident_fact || backendData;
  
  // Parse coordinates
  const coordinates = parseLocationCoordinates(incident_fact.location);
  
  // Determine priority
  const priority = getIncidentPriority(
    incident_fact.emergency_type || incident_fact.incident_type,
    incident_fact.is_active_threat || false,
    incident_fact.severity
  );
  
  return {
    case_id: incident_fact.case_id || backendData.call_id || backendData.case_id,
    incident_fact: {
      ...incident_fact,
      latitude: incident_fact.latitude || coordinates.lat,
      longitude: incident_fact.longitude || coordinates.lng,
    },
    conversation_summary: backendData.conversation_summary,
    timestamp: incident_fact.timestamp || backendData.timestamp || new Date().toISOString(),
    status: backendData.status || 'active',
    ai_confidence: backendData.ai_confidence,
    distance_km: backendData.distance_km,
    priority,
    units_assigned: backendData.units_assigned || [],
    processing_time: backendData.processing_time
  };
}

// Fetch incidents from your Redis backend via Supabase edge function
export async function fetchActiveIncidents(): Promise<BackendIncident[]> {
  try {
    const supabase = getExistingClient() || createClient();
    
    // Set a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 8000);
    });
    
    const fetchPromise = supabase.functions.invoke('server', {
      body: JSON.stringify({
        path: '/make-server-39781649/incidents',
        method: 'GET'
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Race the fetch against timeout
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
    
    if (error) {
      console.warn('Supabase function error:', error.message || error);
      throw new Error(`Backend incidents fetch failed: ${error.message || 'Unknown error'}`);
    }
    
    if (!data) {
      console.warn('No data received from backend incidents endpoint');
      return [];
    }
    
    // Handle the response structure
    const responseData = data.success !== undefined ? data : { incidents: data, success: true };
    
    if (!responseData.incidents || !Array.isArray(responseData.incidents)) {
      console.warn('Invalid incidents data structure from backend:', responseData);
      return [];
    }
    
    console.log(`✅ Successfully fetched ${responseData.incidents.length} incidents from Redis backend`);
    
    // Convert backend incidents to frontend format
    return responseData.incidents.map(convertBackendIncident);
    
  } catch (error) {
    console.warn('Error fetching active incidents:', error.message || error);
    throw error; // Re-throw to trigger fallback in App.tsx
  }
}

// Fetch completed incidents from Redis
export async function fetchCompletedIncidents(): Promise<BackendIncident[]> {
  try {
    const supabase = getExistingClient() || createClient();
    
    const { data, error } = await supabase.functions.invoke('server', {
      body: JSON.stringify({
        path: '/make-server-39781649/incidents/completed',
        method: 'GET'
      }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Backend connection failed: ${error.message}`);
    }
    
    if (!data) {
      return [];
    }
    
    const responseData = data.success ? data : data;
    
    if (!responseData.incidents || !Array.isArray(responseData.incidents)) {
      return [];
    }
    
    return responseData.incidents.map(convertBackendIncident);
    
  } catch (error) {
    console.error('Error fetching completed incidents:', error);
    throw error;
  }
}

// Remove complex database tests - focus on Edge Function connectivity only

// Test backend connection with simplified approach
export async function testBackendConnection(): Promise<boolean> {
  console.log('🔍 Testing backend Edge Function connection...');
  
  try {
    // Use existing client to avoid creating multiple instances
    const supabase = getExistingClient() || createClient();
    
    console.log('📋 Testing Edge Function health check...');
    
    // Try multiple connection methods with shorter timeout
    const timeout = 8000; // 8 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), timeout);
    });
    
    let data: any = null;
    let error: any = null;
    
    // Method 1: Try simple function call first
    console.log('📡 Method 1: Testing basic function connectivity...');
    try {
      const basicPromise = supabase.functions.invoke('server');
      const basicResult = await Promise.race([basicPromise, timeoutPromise]);
      
      if (!basicResult.error && basicResult.data) {
        console.log('✅ Basic function call successful:', basicResult.data);
        data = basicResult.data;
        error = null;
      } else {
        throw new Error(basicResult.error?.message || 'Basic function call failed');
      }
    } catch (basicError) {
      console.warn('⚠️ Basic function call failed:', basicError.message);
      error = basicError;
    }
    
    // Method 2: Try health check via POST routing if basic call failed
    if (error) {
      console.log('📡 Method 2: Testing POST routing method...');
      try {
        const postPromise = supabase.functions.invoke('server', {
          method: 'POST',
          body: JSON.stringify({
            path: '/make-server-39781649/health',
            method: 'GET'
          }),
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Info': 'firefly-emergency-dashboard'
          }
        });
        
        const postResult = await Promise.race([postPromise, timeoutPromise]);
        
        if (!postResult.error && postResult.data) {
          console.log('✅ POST routing successful:', postResult.data);
          data = postResult.data;
          error = null;
        } else {
          throw new Error(postResult.error?.message || 'POST routing failed');
        }
      } catch (postError) {
        console.warn('⚠️ POST routing failed:', postError.message);
        error = postError;
      }
    }
    
    // Method 3: Try ping endpoint if still failing
    if (error) {
      console.log('📡 Method 3: Testing ping endpoint...');
      try {
        const pingPromise = supabase.functions.invoke('server', {
          method: 'POST',
          body: JSON.stringify({
            path: '/ping',
            method: 'GET'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const pingResult = await Promise.race([pingPromise, timeoutPromise]);
        
        if (!pingResult.error && pingResult.data?.ping === 'pong') {
          console.log('✅ Ping test successful - Server is responsive');
          data = pingResult.data;
          error = null;
        } else {
          throw new Error(pingResult.error?.message || 'Ping test failed');
        }
      } catch (pingError) {
        console.warn('⚠️ Ping test failed:', pingError.message);
        error = pingError;
      }
    }
    
    // Final evaluation
    if (error) {
      console.error('❌ All connection methods failed');
      console.error('🔍 Error details:', {
        message: error.message || 'Unknown error',
        type: error.name || 'ConnectionError'
      });
      
      console.error('🔧 This usually indicates:');
      console.error('  1. Edge Function "server" is not deployed');
      console.error('  2. Function has startup/compilation errors');
      console.error('  3. Network connectivity issues');
      console.error('  4. Supabase service outage');
      
      return false;
    }
    
    const isHealthy = data?.status === 'ok' || data?.success === true || data?.ping === 'pong';
    console.log(`🏥 Connection test result: ${isHealthy ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (data) {
      console.log('📊 Server response:', data);
    }
    
    return isHealthy;
    
  } catch (error) {
    console.error('🚨 Connection test exception:', error.message || error);
    console.error('💡 Check Supabase Edge Function deployment and logs');
    return false;
  }
}

// Subscribe to real-time incident updates
export function subscribeToIncidentUpdates(callback: (incident: BackendIncident) => void) {
  try {
    const supabase = getExistingClient() || createClient();
    
    // Subscribe to real-time incident updates via Supabase realtime
    const subscription = supabase
      .channel('incident-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'kv_store_39781649',
          filter: 'key=like.incident:*'
        }, 
        (payload) => {
          try {
            if (payload.new && payload.new.value) {
              const incidentData = JSON.parse(payload.new.value);
              const convertedIncident = convertBackendIncident(incidentData);
              callback(convertedIncident);
            }
          } catch (error) {
            console.error('Error processing incident update:', error);
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up real-time subscription:', error);
    return () => {}; // Return empty cleanup function
  }
}

// Create mock incidents for development/demo (when backend is not available)
export function createMockIncidents(): BackendIncident[] {
  return [
    {
      case_id: 'INC-2024-001',
      incident_fact: {
        case_id: 'INC-2024-001',
        timestamp: new Date().toISOString(),
        emergency_type: 'Cardiac Emergency',
        location: '37.7849,-122.4094', // Main St & 5th Ave coordinates
        caller_name: 'Sarah Chen',
        callback_number: '+14155551234',
        is_caller_safe: true,
        people_involved: 1,
        is_active_threat: false,
        details: '77-year-old male experiencing severe chest pain, shortness of breath, and sweating',
        severity: 'critical',
        latitude: 37.7849,
        longitude: -122.4094
      },
      conversation_summary: 'Cardiac emergency - elderly male with classic heart attack symptoms',
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      status: 'dispatched',
      ai_confidence: 97.8,
      priority: 'critical',
      units_assigned: ['AMB-01', 'PD-03'],
      processing_time: 8.2
    },
    {
      case_id: 'INC-2024-002', 
      incident_fact: {
        case_id: 'INC-2024-002',
        timestamp: new Date().toISOString(),
        emergency_type: 'Structure Fire',
        location: '37.7749,-122.4194', // Oak Grove Complex coordinates
        caller_name: 'Mike Rodriguez',
        callback_number: '+14155551235',
        is_caller_safe: true,
        people_involved: 3,
        is_active_threat: true,
        details: 'Apartment building fire with multiple residents trapped on second floor',
        severity: 'high',
        latitude: 37.7749,
        longitude: -122.4194
      },
      conversation_summary: 'Structure fire with entrapment - multiple victims requiring rescue',
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      status: 'active',
      ai_confidence: 96.7,
      priority: 'high',
      units_assigned: ['FIRE-01', 'FIRE-02', 'EMS-15', 'PD-03'],
      processing_time: 12.8
    },
    {
      case_id: 'INC-2024-003',
      incident_fact: {
        case_id: 'INC-2024-003',
        timestamp: new Date().toISOString(),
        emergency_type: 'Traffic Accident',
        location: '37.7649,-122.4294', // Highway 101 coordinates
        caller_name: 'Jessica Wong',
        callback_number: '+14155551236',
        is_caller_safe: true,
        people_involved: 3,
        is_active_threat: false,
        details: 'Multi-vehicle collision on Highway 101 near Exit 23, injuries unknown',
        severity: 'medium',
        latitude: 37.7649,
        longitude: -122.4294
      },
      conversation_summary: 'Traffic accident - multi-vehicle collision requiring assessment',
      timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
      status: 'processing',
      ai_confidence: 87.3,
      priority: 'medium',
      units_assigned: [],
      processing_time: 4.1
    }
  ];
}