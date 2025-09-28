from uagents import Model
from pydantic import Field
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime

class DispatchOrder(Model):
    """Order sent to a single unit for dispatch"""
    case_id: UUID
    unit_id: str
    incident_location: Dict[str, float]
    emergency_type: str
    priority: str = "Medium"
    estimated_arrival: int = 15
    special_instructions: str = ""

class DispatchPlan(Model):
    """Complete dispatch plan sent to Secure Comms Agent"""
    case_id: UUID
    emergency_type: str
    incident_location: Dict[str, float]
    dispatched_units: List[Dict[str, Any]]
    total_units: int
    estimated_response_time: int = 15
    created_at: datetime = datetime.utcnow()

class StatusUpdate(Model):
    """Status update from a unit agent"""
    case_id: UUID
    unit_id: str
    status: str = Field(..., description="Unit status: En_Route, On_Scene, etc.")
    location: Dict[str, float] = Field(..., description="Current unit location")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message: str = Field(default="", description="Optional status message from unit")
    eta_minutes: Optional[int] = Field(None, description="Estimated time of arrival in minutes")

class SMSNotification(Model):
    """SMS notification request"""
    phone_number: str = Field(..., description="Recipient phone number")
    message: str = Field(..., description="SMS message content")
    case_id: Optional[UUID] = Field(None, description="Associated case ID for tracking")
