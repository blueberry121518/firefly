from uagents import Agent, Context, Model, Protocol
import httpx
import random
import asyncio
import logging
import time
import json
import redis
import sys
import os
from uuid import uuid4
from datetime import datetime

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.unit_schema import FireUnitState, Location
from app.schemas.dispatch_schema import DispatchOrder
from app.schemas.acknowledgment_schema import MessageAcknowledgment, ErrorAcknowledgment
from app.agent_registry import agent_registry
from agents.intelligent_unit_base import IntelligentUnitBase
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Agentverse
from app.core.config import settings
if settings.AGENTVERSE_API_KEY:
    from uagents.setup import fund_agent_if_low
    print("🔑 Agentverse API key found - configuring fire unit agent for deployment")
else:
    print("⚠️  No Agentverse API key found - running fire unit agent in local mode only")

# Agent setup
fire_unit_agent = Agent(
    name="unit_fire", 
    seed="unit_fire_secret_seed_phrase_11111",
    endpoint=[f"http://127.0.0.1:8005/submit"]  # Add endpoint for Agentverse
)

# Create protocol for message handling
fire_protocol = Protocol("fire_protocol")

# API endpoint for status updates
API_BASE_URL = "http://localhost:8000"

# Initialize fire unit state
fire_unit_state = {
    "unit_id": "FIRE_ENGINE_001",
    "unit_type": "Engine",
    "status": "Available",
    "location": {
        "lat": 37.7749,  # San Francisco coordinates
        "lon": -122.4194
    },
    "crew_size": 4,
    "water_capacity_gallons": 750
}

# Initialize intelligent unit capabilities
intelligent_unit = IntelligentUnitBase(
    unit_id=fire_unit_state["unit_id"],
    unit_type="fire"
)

# Redis connection for incident polling
redis_client = None

@fire_unit_agent.on_interval(period=5.0)
async def update_status(ctx: Context):
    """Update fire unit status every 5 seconds"""
    try:
        # Simulate movement by slightly modifying GPS coordinates
        # Add small random variations to simulate patrol movement
        lat_variation = random.uniform(-0.001, 0.001)  # ~100m variation
        lon_variation = random.uniform(-0.001, 0.001)
        
        fire_unit_state["location"]["lat"] += lat_variation
        fire_unit_state["location"]["lon"] += lon_variation
        
        # Occasionally change status (simulate dispatch/return)
        if random.random() < 0.1:  # 10% chance to change status
            statuses = ["Available", "Dispatched", "On_Scene", "En_Route", "Out_of_Service"]
            current_status = fire_unit_state["status"]
            other_statuses = [s for s in statuses if s != current_status]
            fire_unit_state["status"] = random.choice(other_statuses)
        
        # Create Pydantic model instance
        unit_state = FireUnitState(**fire_unit_state)
        
        # Send status update to API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{API_BASE_URL}/api/units/status",
                json=unit_state.model_dump()
            )
            
            if response.status_code == 200:
                ctx.logger.info(f"Fire unit status updated: {unit_state.status} at ({unit_state.location.lat:.6f}, {unit_state.location.lon:.6f})")
            else:
                ctx.logger.error(f"Failed to update fire unit status: {response.status_code}")
                
    except Exception as e:
        ctx.logger.error(f"Error updating fire unit status: {e}")

@fire_unit_agent.on_interval(period=60.0)
async def patrol_route(ctx: Context):
    """Simulate patrol route movement every minute"""
    try:
        # Simulate patrol route by moving to different areas
        patrol_locations = [
            {"lat": 37.7749, "lon": -122.4194},  # Downtown SF
            {"lat": 37.7849, "lon": -122.4094},  # North of downtown
            {"lat": 37.7649, "lon": -122.4294},  # South of downtown
            {"lat": 37.7749, "lon": -122.4394},  # West of downtown
            {"lat": 37.7849, "lon": -122.4294},  # Northwest
        ]
        
        # Move to a random patrol location
        if fire_unit_state["status"] == "Available":
            new_location = random.choice(patrol_locations)
            fire_unit_state["location"]["lat"] = new_location["lat"] + random.uniform(-0.0005, 0.0005)
            fire_unit_state["location"]["lon"] = new_location["lon"] + random.uniform(-0.0005, 0.0005)
            
            ctx.logger.info(f"Fire unit moved to patrol location: ({fire_unit_state['location']['lat']:.6f}, {fire_unit_state['location']['lon']:.6f})")
            
    except Exception as e:
        ctx.logger.error(f"Error in patrol route: {e}")

@fire_unit_agent.on_message(model=DispatchOrder)
async def handle_dispatch_order(ctx: Context, sender: str, msg: DispatchOrder):
    """Handle dispatch orders from routing agent"""
    start_time = time.time()
    message_id = uuid4()
    
    try:
        ctx.logger.info(f"Received dispatch order for case {msg.case_id}: {msg.emergency_type}")
        
        # Update unit status to dispatched
        fire_unit_state["status"] = "Dispatched"
        
        # Simulate response to dispatch
        ctx.logger.info(f"Fire unit {fire_unit_state['unit_id']} responding to {msg.emergency_type} incident")
        ctx.logger.info(f"Special instructions: {msg.special_instructions}")
        
        # Send acknowledgment
        processing_time = int((time.time() - start_time) * 1000)
        ack = MessageAcknowledgment(
            message_id=message_id,
            status="dispatched",
            message=f"Fire unit {fire_unit_state['unit_id']} responding to incident",
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

@fire_unit_agent.on_message(model=IntelligentBidRequest)
async def handle_intelligent_bid_request(ctx: Context, sender: str, msg: IntelligentBidRequest):
    """Handle intelligent bid calculation requests"""
    start_time = time.time()
    
    try:
        ctx.logger.info(f"🧠 Received intelligent bid request for incident {msg.incident_id}")
        
        # Calculate intelligent bid using strategic and tactical intelligence
        bid_result = await intelligent_unit.calculate_bid_for_incident(
            incident_details=msg.incident_details,
            current_location=fire_unit_state["location"]
        )
        
        # Create response
        processing_time = int((time.time() - start_time) * 1000)
        response = IntelligentBidResponse(
            unit_id=fire_unit_state["unit_id"],
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
            unit_id=fire_unit_state["unit_id"],
            incident_id=msg.incident_id,
            bid_score=0,
            intelligence_used={"error": True},
            strategic_insights_count=0,
            eta_minutes=0,
            strategic_advice=f"Error: {str(e)}",
            processing_time_ms=int((time.time() - start_time) * 1000)
        )
        await ctx.send(sender, error_response)

@fire_unit_agent.on_interval(period=7.0)
async def poll_nearby_incidents(ctx: Context):
    """Poll Redis incident registry for nearby incidents and prepare bids"""
    try:
        global redis_client
        if redis_client is None:
            redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

        # Query incident registry service directly for simplicity
        from services.incident_registry import incident_registry
        unit_loc = fire_unit_state["location"]
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

@fire_unit_agent.on_message(model=MessageAcknowledgment)
async def handle_acknowledgment(ctx: Context, sender: str, msg: MessageAcknowledgment):
    """Handle acknowledgment messages from other agents"""
    logger.info(f"Received acknowledgment from {sender}: {msg.status} - {msg.message}")
    if msg.processing_time_ms:
        logger.debug(f"Processing time: {msg.processing_time_ms}ms")

@fire_unit_agent.on_message(model=ErrorAcknowledgment)
async def handle_error_acknowledgment(ctx: Context, sender: str, msg: ErrorAcknowledgment):
    """Handle error acknowledgment messages from other agents"""
    logger.error(f"Received error acknowledgment from {sender}: {msg.error_type} - {msg.error_message}")
    if msg.retry_after_seconds:
        logger.info(f"Suggested retry after {msg.retry_after_seconds} seconds")

@fire_unit_agent.on_interval(period=60.0)
async def register_agent(ctx: Context):
    """Register this agent in the registry"""
    agent_registry.register_agent("unit_fire", str(ctx.agent.address))

# Include protocol and publish manifest
fire_unit_agent.include(fire_protocol, publish_manifest=True)

if __name__ == "__main__":
    # Fund agent if needed (for Agentverse deployment)
    if settings.AGENTVERSE_API_KEY:
        print("💰 Checking fire unit agent funding...")
        fund_agent_if_low(fire_unit_agent.wallet.address())
        print("✅ Fire unit agent funding check completed")
    
    print("🚀 Starting fire unit agent...")
    fire_unit_agent.run()
