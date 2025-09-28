"""
Mock Data Generator for Emergency Dispatch System

This script generates realistic historical unit data for testing the emergency dispatch system.
It creates data for Police Cars, Fire Trucks, EMS Vehicles, and Hospitals in and around Ann Arbor, MI.
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import os

# Ann Arbor, MI coordinates and surrounding area
ANN_ARBOR_CENTER = (42.2808, -83.7430)
AREA_BOUNDS = {
    'north': 42.35,
    'south': 42.20,
    'east': -83.65,
    'west': -83.85
}

def generate_gps_coordinates() -> tuple:
    """Generate realistic GPS coordinates within Ann Arbor area"""
    lat = random.uniform(AREA_BOUNDS['south'], AREA_BOUNDS['north'])
    lon = random.uniform(AREA_BOUNDS['west'], AREA_BOUNDS['east'])
    return (round(lat, 6), round(lon, 6))

def generate_status_history(unit_type: str, start_time: datetime) -> List[Dict[str, Any]]:
    """Generate 5-minute status history for a unit"""
    statuses = ["available", "enroute", "on_scene"]
    history = []
    current_time = start_time
    
    # Start with available status
    history.append({
        "timestamp": current_time.isoformat(),
        "status": "available",
        "location": generate_gps_coordinates()
    })
    
    # Generate random status changes over 5 minutes
    for _ in range(random.randint(2, 5)):
        current_time += timedelta(seconds=random.randint(30, 120))
        if current_time > start_time + timedelta(minutes=5):
            break
            
        status = random.choice(statuses)
        history.append({
            "timestamp": current_time.isoformat(),
            "status": status,
            "location": generate_gps_coordinates()
        })
    
    return history

def generate_vehicle_unit(unit_id: str, unit_type: str, start_time: datetime) -> Dict[str, Any]:
    """Generate a single vehicle unit with status history"""
    return {
        "unit_id": unit_id,
        "type": unit_type,
        "status_history": generate_status_history(unit_type, start_time),
        "current_status": "available",
        "current_location": generate_gps_coordinates(),
        "last_updated": start_time.isoformat()
    }

def generate_hospital(hospital_id: str) -> Dict[str, Any]:
    """Generate a hospital unit with static data"""
    return {
        "unit_id": hospital_id,
        "type": "HOSPITAL",
        "name": f"Hospital {hospital_id.split('_')[1]}",
        "location": generate_gps_coordinates(),
        "er_capacity": random.randint(20, 100),
        "current_patients": random.randint(5, 80),
        "available_beds": random.randint(5, 25),
        "specialties": random.sample([
            "Emergency Medicine", "Trauma", "Cardiology", "Neurology", 
            "Pediatrics", "Orthopedics", "Burn Unit"
        ], random.randint(2, 4)),
        "last_updated": datetime.utcnow().isoformat()
    }

def generate_mock_data() -> Dict[str, Any]:
    """Generate complete mock dataset"""
    print("🚨 Generating mock emergency dispatch data...")
    
    # Set base time to 5 minutes ago
    base_time = datetime.utcnow() - timedelta(minutes=5)
    
    data = {
        "generated_at": datetime.utcnow().isoformat(),
        "units": []
    }
    
    # Generate Police Cars
    print("👮 Generating 10 Police Cars...")
    for i in range(1, 11):
        unit_id = f"police_{i:02d}"
        unit = generate_vehicle_unit(unit_id, "POLICE", base_time)
        data["units"].append(unit)
    
    # Generate Fire Trucks
    print("🚒 Generating 10 Fire Trucks...")
    for i in range(1, 11):
        unit_id = f"fire_{i:02d}"
        unit = generate_vehicle_unit(unit_id, "FIRE", base_time)
        data["units"].append(unit)
    
    # Generate EMS Vehicles
    print("🚑 Generating 10 EMS Vehicles...")
    for i in range(1, 11):
        unit_id = f"ems_{i:02d}"
        unit = generate_vehicle_unit(unit_id, "EMS", base_time)
        data["units"].append(unit)
    
    # Generate Hospitals
    print("🏥 Generating 5 Hospitals...")
    for i in range(1, 6):
        hospital_id = f"hospital_{i:02d}"
        hospital = generate_hospital(hospital_id)
        data["units"].append(hospital)
    
    print(f"✅ Generated {len(data['units'])} total units")
    return data

def save_to_file(data: Dict[str, Any], filename: str = "historical_unit_data.json") -> None:
    """Save data to JSON file"""
    # Ensure data directory exists
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"💾 Data saved to {filename}")

def main():
    """Main function to generate and save mock data"""
    print("=" * 60)
    print("🚨 EMERGENCY DISPATCH MOCK DATA GENERATOR")
    print("=" * 60)
    
    # Generate mock data
    data = generate_mock_data()
    
    # Save to file
    save_to_file(data, "backend/data/historical_unit_data.json")
    
    # Print summary
    print("\n📊 DATA SUMMARY:")
    print(f"   Total Units: {len(data['units'])}")
    
    unit_types = {}
    for unit in data['units']:
        unit_type = unit['type']
        unit_types[unit_type] = unit_types.get(unit_type, 0) + 1
    
    for unit_type, count in unit_types.items():
        print(f"   {unit_type}: {count}")
    
    print(f"\n🎯 Coverage Area: Ann Arbor, MI and surrounding area")
    print(f"⏰ Time Range: Last 5 minutes of simulated activity")
    print("=" * 60)

if __name__ == "__main__":
    main()
