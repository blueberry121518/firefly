from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import random
import logging

logger = logging.getLogger(__name__)

hospital_router = APIRouter()

# Mock hospital data - simulates real-time hospital status
MOCK_HOSPITALS = {
    "HOSPITAL_001": {
        "name": "General Hospital Downtown",
        "er_status": "Normal",
        "er_bed_availability": 8,
        "icu_bed_availability": 3,
        "trauma_level": "Level 1",
        "specialties": ["Trauma", "Cardiology", "Neurology", "Pediatrics"],
        "location": {"lat": 37.7849, "lon": -122.4094}
    },
    "HOSPITAL_002": {
        "name": "Community Medical Center",
        "er_status": "Overrun",
        "er_bed_availability": 2,
        "icu_bed_availability": 1,
        "trauma_level": "Level 2",
        "specialties": ["Emergency", "Internal Medicine", "Surgery"],
        "location": {"lat": 37.7749, "lon": -122.4194}
    },
    "HOSPITAL_003": {
        "name": "Regional Trauma Center",
        "er_status": "Busy",
        "er_bed_availability": 5,
        "icu_bed_availability": 4,
        "trauma_level": "Level 1",
        "specialties": ["Trauma", "Critical Care", "Burn Unit"],
        "location": {"lat": 37.7949, "lon": -122.3994}
    }
}

@hospital_router.get("/internal/hospital/status/{hospital_id}")
async def get_hospital_status(hospital_id: str) -> Dict[str, Any]:
    """Get current hospital status for internal use by Hospital Agent"""
    try:
        if hospital_id not in MOCK_HOSPITALS:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_data = MOCK_HOSPITALS[hospital_id].copy()
        
        # Simulate dynamic status changes
        # Randomly update bed availability and ER status to simulate real-time changes
        if random.random() < 0.3:  # 30% chance to change status
            status_options = ["Normal", "Busy", "Overrun"]
            hospital_data["er_status"] = random.choice(status_options)
        
        # Simulate bed availability changes
        if random.random() < 0.4:  # 40% chance to change bed availability
            hospital_data["er_bed_availability"] = max(0, hospital_data["er_bed_availability"] + random.randint(-2, 2))
            hospital_data["icu_bed_availability"] = max(0, hospital_data["icu_bed_availability"] + random.randint(-1, 1))
        
        logger.info(f"Hospital {hospital_id} status requested: {hospital_data['er_status']} with {hospital_data['er_bed_availability']} ER beds")
        
        return {
            "hospital_id": hospital_id,
            "timestamp": "2024-01-01T12:00:00Z",  # In real implementation, this would be current timestamp
            **hospital_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving hospital status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve hospital status")

@hospital_router.get("/internal/hospitals")
async def get_all_hospitals() -> Dict[str, Any]:
    """Get all hospitals for reference"""
    return {
        "hospitals": [
            {
                "hospital_id": hospital_id,
                **hospital_data
            }
            for hospital_id, hospital_data in MOCK_HOSPITALS.items()
        ]
    }

@hospital_router.get("/internal/hospital/{hospital_id}/capabilities")
async def get_hospital_capabilities(hospital_id: str) -> Dict[str, Any]:
    """Get hospital capabilities and specialties"""
    try:
        if hospital_id not in MOCK_HOSPITALS:
            raise HTTPException(status_code=404, detail="Hospital not found")
        
        hospital_data = MOCK_HOSPITALS[hospital_id]
        
        return {
            "hospital_id": hospital_id,
            "trauma_level": hospital_data["trauma_level"],
            "specialties": hospital_data["specialties"],
            "max_capacity": {
                "er_beds": 15,  # Mock maximum capacity
                "icu_beds": 8
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving hospital capabilities: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve hospital capabilities")
