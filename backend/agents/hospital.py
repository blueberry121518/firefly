from uagents import Agent, Context, Protocol
import httpx
import logging
import asyncio
import time
import sys
import os
from uuid import uuid4

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas.transport_schema import TransportRequest, TransportResponse
from app.schemas.acknowledgment_schema import MessageAcknowledgment, ErrorAcknowledgment
from app.agent_registry import agent_registry

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Agentverse
from app.core.config import settings
if settings.AGENTVERSE_API_KEY:
    from uagents.setup import fund_agent_if_low
    print("🔑 Agentverse API key found - configuring hospital agent for deployment")
else:
    print("⚠️  No Agentverse API key found - running hospital agent in local mode only")

# Agent setup
hospital_agent = Agent(
    name="hospital", 
    seed="hospital_secret_seed_phrase_44444",
    endpoint=[f"http://127.0.0.1:8004/submit"]  # Add endpoint for Agentverse
)

# Create protocol for message handling
hospital_protocol = Protocol("hospital_protocol")

# Hospital configuration
HOSPITAL_ID = "HOSPITAL_001"  # General Hospital Downtown
API_BASE_URL = "http://localhost:8000"

@hospital_agent.on_message(model=TransportRequest)
async def handle_transport_request(ctx: Context, sender: str, msg: TransportRequest):
    """Handle transport requests from EMS agents"""
    start_time = time.time()
    message_id = uuid4()
    
    try:
        ctx.logger.info(f"Received transport request from {msg.ems_unit_id}: {msg.patient_severity} - {msg.condition_summary}")
        
        # Step 1: Fetch current hospital status from internal API
        hospital_status = await get_hospital_status()
        
        # Step 2: Implement decision logic
        decision = make_transport_decision(msg, hospital_status)
        
        # Step 3: Create and send response
        response = TransportResponse(
            request_id=msg.request_id,
            hospital_id=HOSPITAL_ID,
            decision=decision["decision"],
            reason=decision["reason"],
            estimated_wait_time=decision["wait_time"],
            alternative_hospital=decision["alternative"] if decision["decision"] == "Divert" else ""
        )
        
        # Send response back to requesting EMS agent
        await ctx.send(sender, response)
        
        # Send acknowledgment
        processing_time = int((time.time() - start_time) * 1000)
        ack = MessageAcknowledgment(
            message_id=message_id,
            status="transport_request_processed",
            message=f"Transport request processed: {decision['decision']}",
            processing_time_ms=processing_time
        )
        await ctx.send(sender, ack)
        
        ctx.logger.info(f"Sent transport response: {decision['decision']} - {decision['reason']}")
        
    except Exception as e:
        ctx.logger.error(f"Error handling transport request: {e}")
        
        # Send error response
        error_response = TransportResponse(
            request_id=msg.request_id,
            hospital_id=HOSPITAL_ID,
            decision="Divert",
            reason="Internal error processing request",
            estimated_wait_time=0,
            alternative_hospital="HOSPITAL_002"
        )
        await ctx.send(sender, error_response)
        
        # Send error acknowledgment
        error_ack = ErrorAcknowledgment(
            message_id=message_id,
            error_type="transport_request_processing_failed",
            error_message=str(e),
            retry_after_seconds=60
        )
        await ctx.send(sender, error_ack)

async def get_hospital_status():
    """Fetch current hospital status from internal API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{API_BASE_URL}/internal/hospital/status/{HOSPITAL_ID}")
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"Failed to fetch hospital status: {response.status_code}")
                # Return default status if API fails
                return {
                    "er_status": "Normal",
                    "er_bed_availability": 5,
                    "icu_bed_availability": 2
                }
                
    except Exception as e:
        logger.error(f"Error fetching hospital status: {e}")
        # Return default status if API fails
        return {
            "er_status": "Normal", 
            "er_bed_availability": 5,
            "icu_bed_availability": 2
        }

def make_transport_decision(request: TransportRequest, hospital_status: dict) -> dict:
    """Make intelligent transport decision based on patient severity and hospital status"""
    
    # Critical thinking logic
    patient_severity = request.patient_severity
    er_status = hospital_status.get("er_status", "Normal")
    er_beds = hospital_status.get("er_bed_availability", 0)
    icu_beds = hospital_status.get("icu_bed_availability", 0)
    
    # Decision logic implementation
    if patient_severity == "Critical":
        # Always accept critical patients regardless of hospital status
        return {
            "decision": "Accept",
            "reason": f"Critical patient - immediate care required regardless of current status",
            "wait_time": 0
        }
    
    elif patient_severity == "Severe":
        # Accept severe patients unless hospital is completely overrun
        if er_status == "Overrun" and er_beds <= 1:
            return {
                "decision": "Divert",
                "reason": f"Hospital overrun with only {er_beds} ER beds available - diverting to ensure patient safety",
                "wait_time": 0,
                "alternative": "HOSPITAL_003"  # Regional Trauma Center
            }
        else:
            return {
                "decision": "Accept",
                "reason": f"Severe patient accepted - {er_beds} ER beds available, status: {er_status}",
                "wait_time": 15 if er_status == "Busy" else 5
            }
    
    elif patient_severity in ["Moderate", "Minor", "Stable"]:
        # Check hospital capacity for non-critical patients
        if er_status == "Overrun":
            return {
                "decision": "Divert",
                "reason": f"Hospital overrun - diverting {patient_severity.lower()} patient to ensure faster care",
                "wait_time": 0,
                "alternative": "HOSPITAL_002"  # Community Medical Center
            }
        elif er_status == "Busy" and er_beds <= 2:
            return {
                "decision": "Divert",
                "reason": f"Hospital busy with limited capacity ({er_beds} beds) - diverting for better care",
                "wait_time": 0,
                "alternative": "HOSPITAL_002"
            }
        else:
            return {
                "decision": "Accept",
                "reason": f"{patient_severity} patient accepted - adequate capacity available",
                "wait_time": 30 if er_status == "Busy" else 10
            }
    
    else:
        # Default case - accept with caution
        return {
            "decision": "Accept",
            "reason": f"Patient accepted - standard protocol",
            "wait_time": 20
        }

@hospital_agent.on_interval(period=300.0)  # Every 5 minutes
async def status_check(ctx: Context):
    """Periodic status check and logging"""
    try:
        hospital_status = await get_hospital_status()
        ctx.logger.info(f"Hospital status check - ER: {hospital_status['er_status']}, "
                       f"ER beds: {hospital_status['er_bed_availability']}, "
                       f"ICU beds: {hospital_status['icu_bed_availability']}")
    except Exception as e:
        ctx.logger.error(f"Error in status check: {e}")

@hospital_agent.on_message(model=MessageAcknowledgment)
async def handle_acknowledgment(ctx: Context, sender: str, msg: MessageAcknowledgment):
    """Handle acknowledgment messages from other agents"""
    logger.info(f"Received acknowledgment from {sender}: {msg.status} - {msg.message}")
    if msg.processing_time_ms:
        logger.debug(f"Processing time: {msg.processing_time_ms}ms")

@hospital_agent.on_message(model=ErrorAcknowledgment)
async def handle_error_acknowledgment(ctx: Context, sender: str, msg: ErrorAcknowledgment):
    """Handle error acknowledgment messages from other agents"""
    logger.error(f"Received error acknowledgment from {sender}: {msg.error_type} - {msg.error_message}")
    if msg.retry_after_seconds:
        logger.info(f"Suggested retry after {msg.retry_after_seconds} seconds")

@hospital_agent.on_interval(period=60.0)
async def register_agent(ctx: Context):
    """Register this agent in the registry"""
    agent_registry.register_agent("hospital", str(ctx.agent.address))

# Include protocol and publish manifest
hospital_agent.include(hospital_protocol, publish_manifest=True)

if __name__ == "__main__":
    # Fund agent if needed (for Agentverse deployment)
    if settings.AGENTVERSE_API_KEY:
        print("💰 Checking hospital agent funding...")
        fund_agent_if_low(hospital_agent.wallet.address())
        print("✅ Hospital agent funding check completed")
    
    print("🚀 Starting hospital agent...")
    hospital_agent.run()
