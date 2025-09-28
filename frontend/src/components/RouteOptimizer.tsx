import { EmergencyUnit, MapIncident, Hospital } from './MapboxEmergencyMap';

export interface RouteAssignment {
  victimId: string;
  unitId: string;
  hospitalId?: string;
  path: RouteSegment[];
  totalScore: number;
  totalDistance: number;
  estimatedTime: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface RouteSegment {
  from: { lng: number; lat: number };
  to: { lng: number; lat: number };
  type: 'unit-to-victim' | 'victim-to-hospital';
  unitId?: string;
  victimId?: string;
  hospitalId?: string;
  distance: number;
  estimatedTime: number;
  color: string;
}

export interface OptimizationWeights {
  distance: number;
  eta: number;
  capability: number;
  hospitalCapacity: number;
  unitAvailability: number;
}

export class RouteOptimizer {
  private static readonly DEFAULT_WEIGHTS: OptimizationWeights = {
    distance: 0.35,
    eta: 0.25,
    capability: 0.20,
    hospitalCapacity: 0.15,
    unitAvailability: 0.05
  };

  private static calculateDistance(
    a: { lng: number; lat: number }, 
    b: { lng: number; lat: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    const h = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
    
    return R * c;
  }

  private static estimateTime(distance: number, unitType: string): number {
    // Average speeds in km/h for different unit types during emergency response
    const speeds = {
      ambulance: 45, // EMS with lights and sirens
      fire: 40,      // Fire trucks are slower but urgent
      police: 55     // Police units fastest
    };
    
    const speed = speeds[unitType as keyof typeof speeds] || 45;
    return (distance / speed) * 60; // Convert to minutes
  }

  private static getCapabilityScore(unitType: string, incidentType: string): number {
    // Capability matrix - how well each unit type handles different incident types
    const capabilityMatrix: Record<string, Record<string, number>> = {
      cardiac: { ambulance: 1.0, fire: 0.8, police: 0.3 },
      fire: { fire: 1.0, ambulance: 0.6, police: 0.4 },
      accident: { ambulance: 0.9, fire: 0.7, police: 1.0 },
      assault: { police: 1.0, ambulance: 0.8, fire: 0.2 },
      medical: { ambulance: 1.0, fire: 0.5, police: 0.3 },
      default: { ambulance: 0.8, fire: 0.6, police: 0.7 }
    };

    const incidentKey = incidentType.toLowerCase().includes('cardiac') ? 'cardiac' :
                       incidentType.toLowerCase().includes('fire') ? 'fire' :
                       incidentType.toLowerCase().includes('accident') ? 'accident' :
                       incidentType.toLowerCase().includes('assault') ? 'assault' :
                       incidentType.toLowerCase().includes('medical') ? 'medical' : 'default';

    return capabilityMatrix[incidentKey][unitType] || 0.5;
  }

  private static scoreUnitForVictim(
    unit: EmergencyUnit,
    victim: MapIncident,
    weights: OptimizationWeights = RouteOptimizer.DEFAULT_WEIGHTS
  ): number {
    if (unit.status !== 'available') return 0;

    const distance = RouteOptimizer.calculateDistance(unit.position, victim.position);
    const eta = RouteOptimizer.estimateTime(distance, unit.type);
    const capability = RouteOptimizer.getCapabilityScore(unit.type, victim.type);
    
    // Normalize scores (lower distance and ETA = higher score)
    const distanceScore = Math.max(0, 1 - (distance / 10)); // Max 10km consideration
    const etaScore = Math.max(0, 1 - (eta / 30)); // Max 30min consideration
    const availabilityScore = unit.status === 'available' ? 1.0 : 0.0;

    return (
      weights.distance * distanceScore +
      weights.eta * etaScore +
      weights.capability * capability +
      weights.unitAvailability * availabilityScore
    );
  }

  private static findBestHospital(
    victimPosition: { lng: number; lat: number },
    hospitals: Hospital[],
    incidentType: string
  ): Hospital | null {
    let bestHospital = hospitals[0];
    let bestScore = 0;

    for (const hospital of hospitals) {
      const distance = RouteOptimizer.calculateDistance(victimPosition, hospital.position);
      const distanceScore = Math.max(0, 1 - (distance / 15)); // Max 15km consideration
      const capacityScore = hospital.availableBeds / hospital.capacity;
      
      // Specialty matching bonus
      let specialtyBonus = 1.0;
      if (incidentType.toLowerCase().includes('cardiac') && hospital.name.includes('General')) {
        specialtyBonus = 1.2; // General hospitals often have better cardiac care
      }

      const score = (distanceScore * 0.6 + capacityScore * 0.4) * specialtyBonus;
      
      if (score > bestScore) {
        bestScore = score;
        bestHospital = hospital;
      }
    }

    return bestHospital;
  }

  public static optimizeRoutes(
    units: EmergencyUnit[],
    incidents: MapIncident[],
    hospitals: Hospital[],
    weights: OptimizationWeights = RouteOptimizer.DEFAULT_WEIGHTS
  ): RouteAssignment[] {
    const assignments: RouteAssignment[] = [];
    const availableUnits = [...units.filter(u => u.status === 'available')];
    
    // Sort victims by priority (critical first)
    const victims = incidents
      .filter(inc => inc.isVictim)
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const victim of victims) {
      let bestUnit: EmergencyUnit | null = null;
      let bestScore = 0;

      // Find the best available unit for this victim
      for (const unit of availableUnits) {
        const score = RouteOptimizer.scoreUnitForVictim(unit, victim, weights);
        
        if (score > bestScore) {
          bestScore = score;
          bestUnit = unit;
        }
      }

      if (bestUnit) {
        // Remove unit from available list
        const unitIndex = availableUnits.findIndex(u => u.id === bestUnit!.id);
        if (unitIndex > -1) {
          availableUnits.splice(unitIndex, 1);
        }

        const path: RouteSegment[] = [];
        const unitToVictimDistance = RouteOptimizer.calculateDistance(
          bestUnit.position, 
          victim.position
        );
        const unitToVictimTime = RouteOptimizer.estimateTime(unitToVictimDistance, bestUnit.type);

        // First segment: Unit to victim
        path.push({
          from: bestUnit.position,
          to: victim.position,
          type: 'unit-to-victim',
          unitId: bestUnit.id,
          victimId: victim.id,
          distance: unitToVictimDistance,
          estimatedTime: unitToVictimTime,
          color: bestUnit.type === 'ambulance' ? '#3b82f6' : // blue
                 bestUnit.type === 'fire' ? '#f97316' : // orange
                 '#eab308' // yellow for police
        });

        let assignment: RouteAssignment = {
          victimId: victim.id,
          unitId: bestUnit.id,
          path: path,
          totalScore: bestScore,
          totalDistance: unitToVictimDistance,
          estimatedTime: unitToVictimTime,
          priority: victim.priority
        };

        // For high priority incidents (critical/high), add hospital route
        if (victim.priority === 'critical' || victim.priority === 'high') {
          const bestHospital = RouteOptimizer.findBestHospital(
            victim.position, 
            hospitals, 
            victim.type
          );

          if (bestHospital) {
            const victimToHospitalDistance = RouteOptimizer.calculateDistance(
              victim.position, 
              bestHospital.position
            );
            const victimToHospitalTime = RouteOptimizer.estimateTime(
              victimToHospitalDistance, 
              bestUnit.type
            );

            // Second segment: Victim to hospital
            path.push({
              from: victim.position,
              to: bestHospital.position,
              type: 'victim-to-hospital',
              unitId: bestUnit.id,
              victimId: victim.id,
              hospitalId: bestHospital.id,
              distance: victimToHospitalDistance,
              estimatedTime: victimToHospitalTime,
              color: '#22c55e' // green for hospital transport
            });

            assignment.hospitalId = bestHospital.id;
            assignment.totalDistance += victimToHospitalDistance;
            assignment.estimatedTime += victimToHospitalTime;
          }
        }

        assignments.push(assignment);
      }
    }

    return assignments;
  }

  public static getRouteVisualizationData(assignments: RouteAssignment[]) {
    const routeLines: any[] = [];
    const assignedUnits: string[] = [];
    
    assignments.forEach(assignment => {
      assignedUnits.push(assignment.unitId);
      
      assignment.path.forEach(segment => {
        routeLines.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [segment.from.lng, segment.from.lat],
              [segment.to.lng, segment.to.lat]
            ]
          },
          properties: {
            unitId: segment.unitId,
            victimId: segment.victimId,
            hospitalId: segment.hospitalId,
            segmentType: segment.type,
            color: segment.color,
            distance: segment.distance,
            estimatedTime: segment.estimatedTime,
            strokeWidth: segment.type === 'victim-to-hospital' ? 4 : 3,
            opacity: segment.type === 'victim-to-hospital' ? 0.9 : 0.7,
            dashArray: segment.type === 'victim-to-hospital' ? [5, 5] : null
          }
        });
      });
    });

    return { routeLines, assignedUnits };
  }
}