from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from uuid import UUID, uuid4
from datetime import datetime

class IncidentFact(BaseModel):
    model_config = ConfigDict(
        json_encoders={
            UUID: str,
            datetime: lambda v: v.isoformat()
        }
    )
    
    case_id: UUID = Field(default_factory=uuid4)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    emergency_type: Optional[str] = None
    incident_type: Optional[str] = None  # Alias for emergency_type
    location: Optional[str] = None
    caller_name: Optional[str] = None
    callback_number: str = ""  # Required field with default empty string
    is_caller_safe: Optional[bool] = None
    people_involved: int = 1
    affected_individuals: Optional[int] = None  # Alias for people_involved
    is_active_threat: bool = False
    details: str = ""
    description: Optional[str] = None  # Alias for details
    severity: Optional[str] = None
    
    def get_location_coordinates(self) -> dict:
        """Extract lat/lon coordinates from location string if available"""
        if not self.location or "," not in self.location:
            # Default to San Francisco if no coordinates provided
            return {"lat": 37.7749, "lon": -122.4194}
        
        try:
            # Try to parse "lat,lon" format
            parts = self.location.split(",")
            if len(parts) >= 2:
                return {
                    "lat": float(parts[0].strip()),
                    "lon": float(parts[1].strip())
                }
        except (ValueError, IndexError):
            pass
        
        # Fallback to default coordinates
        return {"lat": 37.7749, "lon": -122.4194}

class NewCall(BaseModel):
    call_sid: str
    from_number: str
    to_number: str

class AudioChunk(BaseModel):
    call_sid: str
    audio_data: bytes
    sequence_number: int

class NewIncidentLog(BaseModel):
    case_id: UUID
    timestamp: datetime
    incident_fact: IncidentFact
    routing_agent_address: str
