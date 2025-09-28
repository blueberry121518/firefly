from uagents import Agent, Context, Protocol, Model
import httpx
import random
import asyncio
import logging
import time
import json
import redis
import sys
import os
from typing import Dict, Optional
from uuid import uuid4
from datetime import datetime

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.unit_schema import Location, EMSUnitState
from app.schemas.transport_schema import TransportRequest, TransportResponse
from app.schemas.dispatch_schema import DispatchOrder
from app.schemas.acknowledgment_schema import MessageAcknowledgment, ErrorAcknowledgment
from app.agent_registry import agent_registry, get_hospital_agent_address
from agents.intelligent_unit_base import IntelligentUnitBase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Agentverse
from app.core.config import settings
if settings.AGENTVERSE_API_KEY:
    from uagents.setup import fund_agent_if_low
    print("🔑 Agentverse API key found - configuring EMS unit agent for deployment")
else:
    print("⚠️  No Agentverse API key found - running EMS unit agent in local mode only")

# Agent setup
ems_unit_agent = Agent(
    name="unit_ems", 
    seed="unit_ems_secret_seed_phrase_33333",
    endpoint=[f"http://127.0.0.1:8007/submit"]  # Add endpoint for Agentverse
)

# Create protocol for message handling
ems_protocol = Protocol("ems_protocol")

# API endpoint for status updates
API_BASE_URL = "http://localhost:8000"

# Initialize EMS unit state with medical-specific fields
ems_unit_state = {
    "unit_id": "EMS_AMBULANCE_001",
    "unit_type": "ALS",  # Advanced Life Support
    "status": "Available",
    "location": {
        "lat": 37.7649,  # San Francisco coordinates
        "lon": -122.4294
    },
    "crew_size": 2,
    "unit_level": "ALS",  # Advanced Life Support
    "patient_count": 0,
    "equipment_status": "Fully_Stocked",
    "current_patient": None
}

# Track pending transport requests
pending_requests: Dict[str, TransportRequest] = {}

# Initialize intelligent unit capabilities
intelligent_unit = IntelligentUnitBase(
    unit_id=ems_unit_state["unit_id"],
    unit_type="ems"
)

# Redis connection for incident polling
redis_client = None

@ems_unit_agent.on_interval(period=5.0)
async def update_status(ctx: Context):
    """Update EMS unit status every 5 seconds"""
    try:
        # Simulate movement by slightly modifying GPS coordinates
        lat_variation = random.uniform(-0.001, 0.001)  # ~100m variation
        lon_variation = random.uniform(-0.001, 0.001)
        
        ems_unit_state["location"]["lat"] += lat_variation
        ems_unit_state["location"]["lon"] += lon_variation
        
        # Occasionally change status (simulate dispatch/return)
        if random.random() < 0.12:  # 12% chance to change status
            statuses = ["Available", "Dispatched", "On_Scene", "En_Route", "Out_of_Service"]
            current_status = ems_unit_state["status"]
            other_statuses = [s for s in statuses if s != current_status]
            new_status = random.choice(other_statuses)
            ems_unit_state["status"] = new_status
            
            # Trigger transport request when arriving on scene with patient
            if new_status == "On_Scene" and current_status == "En_Route":
                await handle_patient_on_scene(ctx)
        
        # Send status update to API (using unit_schema structure)
        from app.schemas.unit_schema import PoliceUnitState  # Reuse similar structure
        unit_state = PoliceUnitState(
            unit_id=ems_unit_state["unit_id"],
            status=ems_unit_state["status"],
            location=Location(**ems_unit_state["location"]),
            assigned_officer_id=f"PARAMEDIC_{ems_unit_state['crew_size']}"
        )
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/api/units/status",
                json=unit_state.model_dump()
            )
            
            if response.status_code == 200:
                ctx.logger.info(f"EMS unit status updated: {unit_state.status} at ({unit_state.location.lat:.6f}, {unit_state.location.lon:.6f})")
            else:
                ctx.logger.error(f"Failed to update EMS unit status: {response.status_code}")
                
    except Exception as e:
        ctx.logger.error(f"Error updating EMS unit status: {e}")

async def handle_patient_on_scene(ctx: Context):
    """Handle patient pickup and initiate transport request"""
    try:
        # Simulate patient assessment
        patient_severity = random.choice(["Critical", "Severe", "Moderate", "Minor", "Stable"])
        condition_summary = generate_condition_summary(patient_severity)
        
        ctx.logger.info(f"Patient on scene - Severity: {patient_severity}, Condition: {condition_summary}")
        
        # Update unit state
        ems_unit_state["patient_count"] = 1
        ems_unit_state["current_patient"] = {
            "severity": patient_severity,
            "condition": condition_summary,
            "pickup_time": "2024-01-01T12:00:00Z"
        }
        
        # Create transport request
        transport_request = TransportRequest(
            patient_severity=patient_severity,
            condition_summary=condition_summary,
            ems_unit_id=ems_unit_state["unit_id"],
            estimated_arrival="15 minutes",
            special_requirements=get_special_requirements(patient_severity)
        )
        
        # Store pending request
        pending_requests[transport_request.request_id] = transport_request
        
        # Get hospital agent address from registry
        hospital_address = get_hospital_agent_address()
        if hospital_address:
            start_time = time.time()
            message_id = uuid4()
            
            try:
                await ctx.send(hospital_address, transport_request)
                
                # Send acknowledgment
                processing_time = int((time.time() - start_time) * 1000)
                ack = MessageAcknowledgment(
                    message_id=message_id,
                    status="transport_request_sent",
                    message=f"Transport request sent for {patient_severity} patient",
                    processing_time_ms=processing_time
                )
                await ctx.send(hospital_address, ack)
                
            except Exception as e:
                logger.error(f"Error sending transport request: {e}")
                error_ack = ErrorAcknowledgment(
                    message_id=message_id,
                    error_type="transport_request_failed",
                    error_message=str(e),
                    retry_after_seconds=60
                )
                await ctx.send(hospital_address, error_ack)
        else:
            logger.warning("Hospital agent not registered, cannot send transport request")
        
        ctx.logger.info(f"Sent transport request to hospital: {patient_severity} patient")
        
    except Exception as e:
        ctx.logger.error(f"Error handling patient on scene: {e}")

@ems_unit_agent.on_message(model=DispatchOrder)
async def handle_dispatch_order(ctx: Context, sender: str, msg: DispatchOrder):
    """Handle dispatch orders from routing agent"""
    start_time = time.time()
    message_id = uuid4()
    
    try:
        ctx.logger.info(f"Received dispatch order for case {msg.case_id}: {msg.emergency_type}")
        
        # Update unit status to dispatched
        ems_unit_state["status"] = "Dispatched"
        
        # Simulate response to dispatch
        ctx.logger.info(f"EMS unit {ems_unit_state['unit_id']} responding to {msg.emergency_type} incident")
        ctx.logger.info(f"Special instructions: {msg.special_instructions}")
        
        # Send acknowledgment
        processing_time = int((time.time() - start_time) * 1000)
        ack = MessageAcknowledgment(
            message_id=message_id,
            status="dispatched",
            message=f"EMS unit {ems_unit_state['unit_id']} responding to incident",
            processing_time_ms=processing_time
        )
        await ctx.send(sender, ack)
        
    except Exception as e:
        ctx.logger.error(f"Error handling dispatch order: {e}")
        
        # Send error acknowledgment
        error_ack = ErrorAcknowledgment(
            message_id=message_id,
            error_type="dispatch_handling_failed",
            error_message=str(e),
            retry_after_seconds=30
        )
        await ctx.send(sender, error_ack)

@ems_unit_agent.on_message(model=TransportResponse)
async def handle_transport_response(ctx: Context, sender: str, msg: TransportResponse):
    """Handle transport response from hospital agent"""
    start_time = time.time()
    message_id = uuid4()
    
    try:
        ctx.logger.info(f"Received transport response: {msg.decision} - {msg.reason}")
        
        # Update unit status based on response
        if msg.decision == "Accept":
            ems_unit_state["status"] = "En_Route"
            ctx.logger.info(f"Transport accepted by {msg.hospital_id} - ETA: {msg.estimated_wait_time} minutes")
        else:
            ctx.logger.info(f"Transport diverted to {msg.alternative_hospital} - Reason: {msg.reason}")
            # In real implementation, would update destination
        
        # Clean up pending request
        if msg.request_id in pending_requests:
            del pending_requests[msg.request_id]
        
        # Send acknowledgment
        processing_time = int((time.time() - start_time) * 1000)
        ack = MessageAcknowledgment(
            message_id=message_id,
            status="transport_response_processed",
            message=f"Transport response processed: {msg.decision}",
            processing_time_ms=processing_time
        )
        await ctx.send(sender, ack)
            
    except Exception as e:
        ctx.logger.error(f"Error handling transport response: {e}")
        
        # Send error acknowledgment
        error_ack = ErrorAcknowledgment(
            message_id=message_id,
            error_type="transport_response_processing_failed",
            error_message=str(e),
            retry_after_seconds=30
        )
        await ctx.send(sender, error_ack)

def generate_condition_summary(severity: str) -> str:
    """Generate realistic condition summary based on severity"""
    conditions = {
        "Critical": [
            "Cardiac arrest, CPR in progress",
            "Major trauma with uncontrolled bleeding",
            "Severe respiratory distress, intubated",
            "Massive stroke with loss of consciousness"
        ],
        "Severe": [
            "Chest pain with ST elevation",
            "Severe abdominal pain, possible appendicitis",
            "Head injury with altered mental status",
            "Severe allergic reaction with airway compromise"
        ],
        "Moderate": [
            "Broken arm with visible deformity",
            "Moderate chest pain, stable vital signs",
            "Laceration requiring sutures",
            "Fall with possible hip fracture"
        ],
        "Minor": [
            "Minor cuts and bruises",
            "Mild chest pain, resolved",
            "Sprained ankle",
            "Minor burn, first degree"
        ],
        "Stable": [
            "Stable vital signs, minor injuries",
            "Patient stable, transport for observation",
            "No acute distress, routine transport",
            "Patient stable, non-emergency transport"
        ]
    }
    return random.choice(conditions.get(severity, ["Unknown condition"]))

def get_special_requirements(severity: str) -> str:
    """Get special medical requirements based on severity"""
    if severity == "Critical":
        return "ICU bed, trauma team standby, blood products available"
    elif severity == "Severe":
        return "Cardiac monitoring, IV access established"
    elif severity == "Moderate":
        return "Pain management, immobilization"
    else:
        return "Standard care, observation"

@ems_unit_agent.on_interval(period=60.0)
async def patrol_route(ctx: Context):
    """Simulate EMS patrol route movement every minute"""
    try:
        patrol_locations = [
            {"lat": 37.7649, "lon": -122.4294},  # South SF
            {"lat": 37.7749, "lon": -122.4194},  # Downtown
            {"lat": 37.7849, "lon": -122.4094},  # North SF
            {"lat": 37.7549, "lon": -122.4394},  # Southwest
            {"lat": 37.7949, "lon": -122.4194},  # Northeast
        ]
        
        # Move to a random patrol location when available
        if ems_unit_state["status"] == "Available":
            new_location = random.choice(patrol_locations)
            ems_unit_state["location"]["lat"] = new_location["lat"] + random.uniform(-0.0005, 0.0005)
            ems_unit_state["location"]["lon"] = new_location["lon"] + random.uniform(-0.0005, 0.0005)
            
            ctx.logger.info(f"EMS unit moved to patrol location: ({ems_unit_state['location']['lat']:.6f}, {ems_unit_state['location']['lon']:.6f})")
            
    except Exception as e:
        ctx.logger.error(f"Error in EMS patrol route: {e}")

@ems_unit_agent.on_interval(period=180.0)  # Every 3 minutes
async def equipment_check(ctx: Context):
    """Simulate equipment status checks"""
    try:
        equipment_statuses = ["Fully_Stocked", "Well_Stocked", "Needs_Restock", "Critical_Shortage"]
        if random.random() < 0.1:  # 10% chance to change equipment status
            ems_unit_state["equipment_status"] = random.choice(equipment_statuses)
            ctx.logger.info(f"Equipment status updated: {ems_unit_state['equipment_status']}")
            
    except Exception as e:
        ctx.logger.error(f"Error in equipment check: {e}")

# Message models for intelligent bid requests
class IntelligentBidRequest(Model):
    """Request for intelligent bid calculation"""
    incident_id: str
    incident_details: dict
    request_timestamp: str

class IntelligentBidResponse(Model):
    """Response with intelligent bid calculation"""
    unit_id: str
    incident_id: str
    bid_score: float
    intelligence_used: dict
    strategic_insights_count: int
    eta_minutes: int
    strategic_advice: str
    processing_time_ms: int

@ems_unit_agent.on_message(model=IntelligentBidRequest)
async def handle_intelligent_bid_request(ctx: Context, sender: str, msg: IntelligentBidRequest):
    """Handle intelligent bid calculation requests"""
    start_time = time.time()
    
    try:
        ctx.logger.info(f"🧠 Received intelligent bid request for incident {msg.incident_id}")
        
        # Calculate intelligent bid using strategic and tactical intelligence
        bid_result = await intelligent_unit.calculate_bid_for_incident(
            incident_details=msg.incident_details,
            current_location=ems_unit_state["location"]
        )
        
        # Create response
        processing_time = int((time.time() - start_time) * 1000)
        response = IntelligentBidResponse(
            unit_id=ems_unit_state["unit_id"],
            incident_id=msg.incident_id,
            bid_score=bid_result.get("bid_score", 0),
            intelligence_used=bid_result.get("intelligence_used", {}),
            strategic_insights_count=bid_result.get("strategic_insights_count", 0),
            eta_minutes=bid_result.get("eta_minutes", 0),
            strategic_advice=bid_result.get("strategic_advice", ""),
            processing_time_ms=processing_time
        )
        
        await ctx.send(sender, response)
        ctx.logger.info(f"✅ Sent intelligent bid response: score {bid_result.get('bid_score', 0)}")
        
    except Exception as e:
        ctx.logger.error(f"❌ Error handling intelligent bid request: {e}")
        
        # Send error response
        error_response = IntelligentBidResponse(
            unit_id=ems_unit_state["unit_id"],
            incident_id=msg.incident_id,
            bid_score=0,
            intelligence_used={"error": True},
            strategic_insights_count=0,
            eta_minutes=0,
            strategic_advice=f"Error: {str(e)}",
            processing_time_ms=int((time.time() - start_time) * 1000)
        )
        await ctx.send(sender, error_response)

@ems_unit_agent.on_interval(period=7.0)
async def poll_nearby_incidents(ctx: Context):
    """Poll Redis incident registry for nearby incidents and prepare bids"""
    try:
        global redis_client
        if redis_client is None:
            redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

        # Query incident registry service directly for simplicity
        from services.incident_registry import incident_registry
        unit_loc = ems_unit_state["location"]
        nearby = await incident_registry.get_nearby_incidents(
            lat=unit_loc["lat"], lon=unit_loc["lon"], radius_km=10.0, limit=3
        )

        for incident in nearby:
            # Prepare an internal log; actual bid happens when router solicits
            ctx.logger.info(
                f"📍 Nearby incident {incident.get('case_id')} at {incident.get('distance_km')} km; ready to bid when solicited"
            )
    except Exception as e:
        ctx.logger.error(f"Error polling nearby incidents: {e}")

@ems_unit_agent.on_message(model=MessageAcknowledgment)
async def handle_acknowledgment(ctx: Context, sender: str, msg: MessageAcknowledgment):
    """Handle acknowledgment messages from other agents"""
    logger.info(f"Received acknowledgment from {sender}: {msg.status} - {msg.message}")
    if msg.processing_time_ms:
        logger.debug(f"Processing time: {msg.processing_time_ms}ms")

@ems_unit_agent.on_message(model=ErrorAcknowledgment)
async def handle_error_acknowledgment(ctx: Context, sender: str, msg: ErrorAcknowledgment):
    """Handle error acknowledgment messages from other agents"""
    logger.error(f"Received error acknowledgment from {sender}: {msg.error_type} - {msg.error_message}")
    if msg.retry_after_seconds:
        logger.info(f"Suggested retry after {msg.retry_after_seconds} seconds")

@ems_unit_agent.on_interval(period=60.0)
async def register_agent(ctx: Context):
    """Register this agent in the registry"""
    agent_registry.register_agent("unit_ems", str(ctx.agent.address))

# Include protocol and publish manifest
ems_unit_agent.include(ems_protocol, publish_manifest=True)

if __name__ == "__main__":
    # Fund agent if needed (for Agentverse deployment)
    if settings.AGENTVERSE_API_KEY:
        print("💰 Checking EMS unit agent funding...")
        fund_agent_if_low(ems_unit_agent.wallet.address())
        print("✅ EMS unit agent funding check completed")
    
    print("🚀 Starting EMS unit agent...")
    ems_unit_agent.run()
