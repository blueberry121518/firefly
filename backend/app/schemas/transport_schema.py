from uagents import Model
from pydantic import Field
from typing import Literal
from uuid import UUID, uuid4

class TransportRequest(Model):
    """Request from EMS agent to hospital for patient transport"""
    request_id: UUID = uuid4()
    patient_severity: Literal["Critical", "Severe", "Moderate", "Minor", "Stable"] = "Moderate"
    condition_summary: str
    ems_unit_id: str
    estimated_arrival: str
    special_requirements: str = ""

class TransportResponse(Model):
    """Response from hospital agent regarding transport request"""
    request_id: UUID
    hospital_id: str
    decision: Literal["Accept", "Divert"] = "Accept"
    reason: str
    estimated_wait_time: int = 0
    alternative_hospital: str = ""
