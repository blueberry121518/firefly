from uagents import Model
from typing import Literal, Optional

class Location(Model):
    """GPS location coordinates"""
    lat: float
    lon: float

class FireUnitState(Model):
    """Fire department unit state"""
    unit_id: str
    unit_type: Literal["Engine", "Ladder", "Rescue", "Command", "Hazmat"] = "Engine"
    status: Literal["Available", "Dispatched", "On_Scene", "En_Route", "Out_of_Service"] = "Available"
    location: Location
    crew_size: int = 4
    water_capacity_gallons: int = 750

class PoliceUnitState(Model):
    """Police department unit state"""
    unit_id: str
    status: Literal["Available", "Dispatched", "On_Scene", "En_Route", "Out_of_Service"] = "Available"
    location: Location
    assigned_officer_id: Optional[str] = None

class EMSUnitState(Model):
    """EMS unit state with medical-specific fields"""
    unit_id: str
    unit_level: Literal["Basic", "Advanced", "Critical_Care"] = "Advanced"
    status: Literal["Available", "Dispatched", "On_Scene", "En_Route", "Out_of_Service"] = "Available"
    location: Location
    crew_size: int = 2
    patient_count: int = 0
    equipment_status: Literal["Fully_Operational", "Minor_Issues", "Major_Issues", "Out_of_Service"] = "Fully_Operational"
    current_patient: Optional[dict] = None
