"""
Vapi Conversational Intake Agent

This agent works with Vapi to handle emergency dispatch calls.
Since Vapi manages the conversation flow, this agent focuses on:
1. Processing completed incident facts from Vapi
2. Sending them to the routing agent
3. Managing incident logs
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from uagents import Agent, Context, Model, Protocol
from app.schemas.incident_schema import IncidentFact
from app.core.config import settings
from services.incident_registry import incident_registry
import redis.asyncio as redis
import asyncio
import json
import logging
from typing import Dict, Any
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis connection
redis_client = None

# Message models for agent communication
class IncidentFactCompleted(Model):
    """Message sent when an incident fact is completed by Vapi"""
    call_id: str
    incident_fact: dict  # Use dict instead of IncidentFact to avoid Pydantic v1/v2 conflicts
    conversation_summary: str
    timestamp: str  # Use string for datetime to avoid serialization issues

class IncidentProcessingRequest(Model):
    """Request to process a completed incident"""
    call_id: str
    incident_fact: dict  # Use dict instead of IncidentFact
    conversation_summary: str

class MessageAcknowledgment(Model):
    """Acknowledgment message"""
    message_id: str
    status: str
    timestamp: str  # Use string for datetime

class ErrorAcknowledgment(Model):
    """Error acknowledgment message"""
    message_id: str
    error: str
    timestamp: str  # Use string for datetime

# Create the conversational intake agent
conversational_intake = Agent(
    name="conversational_intake",
    seed=settings.AGENT_IDENTITY_KEY or "conversational-intake-seed-key",
    port=8001,
    endpoint=f"http://localhost:8001/submit",
)

# Protocol for handling incident processing
incident_protocol = Protocol("incident_processing")

@conversational_intake.on_message(IncidentProcessingRequest)
async def handle_incident_processing(ctx: Context, sender: str, msg: IncidentProcessingRequest):
    """Handle a completed incident from Vapi"""
    try:
        logger.info(f"Processing completed incident for call {msg.call_id}")
        
        # Convert dict to IncidentFact object for processing
        incident_fact = IncidentFact(**msg.incident_fact)
        
        # Validate the incident fact
        if not incident_fact.emergency_type:
            logger.warning(f"Incomplete incident fact for call {msg.call_id}: missing emergency type")
            await ctx.send(sender, ErrorAcknowledgment(
                message_id=msg.call_id,
                error="Missing emergency type",
                timestamp=datetime.now().isoformat()
            ))
            return
        
        # CommsAgent consumes from Redis log queue
        
        # Store in Redis for dashboard
        await store_incident_in_redis(msg.call_id, incident_fact, msg.conversation_summary)
        
        # Publish to incident queue for Router Agent
        await publish_incident_to_queue(msg.call_id, incident_fact, msg.conversation_summary)
        
        # Publish completion log to log queue for Comms Agent
        await publish_completion_log(msg.call_id, incident_fact)
        
        # Register incident in Redis active incident registry (units will poll)
        await register_incident_in_registry(incident_fact)
        
        # Notify frontend of incident completion
        await notify_frontend_incident_completed(msg.call_id, incident_fact)
        
        # Send acknowledgment
        await ctx.send(sender, MessageAcknowledgment(
            message_id=msg.call_id,
            status="processed",
            timestamp=datetime.now().isoformat()
        ))
        
        logger.info(f"Successfully processed incident for call {msg.call_id}")
        
    except Exception as e:
        logger.error(f"Error processing incident for call {msg.call_id}: {e}")
        await ctx.send(sender, ErrorAcknowledgment(
            message_id=msg.call_id,
            error=str(e),
            timestamp=datetime.now().isoformat()
        ))

# Protocol is now handled directly by the agent

async def store_incident_in_redis(call_id: str, incident_fact: IncidentFact, conversation_summary: str):
    """Store incident data in Redis for dashboard access"""
    try:
        global redis_client
        if not redis_client:
            redis_client = redis.from_url(settings.REDIS_URL)
        
        incident_data = {
            "call_id": call_id,
            "incident_fact": incident_fact.model_dump(),
            "conversation_summary": conversation_summary,
            "timestamp": datetime.now().isoformat(),
            "status": "completed"
        }
        
        # Store in Redis with expiration (24 hours)
        await redis_client.setex(
            f"incident:{call_id}",
            86400,  # 24 hours
            json.dumps(incident_data)
        )
        
        # Add to incidents list
        await redis_client.lpush("incidents:completed", call_id)
        
        logger.info(f"Stored incident data in Redis for call {call_id}")
        
    except Exception as e:
        logger.error(f"Error storing incident in Redis: {e}")

async def publish_incident_to_queue(call_id: str, incident_fact: IncidentFact, conversation_summary: str):
    """Publish incident to incident_queue for Router Agent"""
    try:
        global redis_client
        if not redis_client:
            redis_client = redis.from_url(settings.REDIS_URL)
        
        incident_data = {
            "call_id": call_id,
            "incident_fact": incident_fact.model_dump(),
            "conversation_summary": conversation_summary,
            "timestamp": datetime.now().isoformat(),
            "status": "ready_for_dispatch"
        }
        
        # Publish to incident queue
        await redis_client.publish("incident_queue", json.dumps(incident_data))
        
        logger.info(f"📤 Published incident to incident_queue for call {call_id}")
        
    except Exception as e:
        logger.error(f"Error publishing incident to queue: {e}")

async def publish_completion_log(call_id: str, incident_fact: IncidentFact):
    """Publish completion log to log_queue for Comms Agent"""
    try:
        global redis_client
        if not redis_client:
            redis_client = redis.from_url(settings.REDIS_URL)
        
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "action": "incident_completed",
            "case_id": call_id,
            "emergency_type": incident_fact.emergency_type,
            "location": incident_fact.location,
            "callback_number": incident_fact.callback_number,
            "incident_data": {
                "call_id": call_id,
                "incident_fact": incident_fact.model_dump()
            }
        }
        
        # Publish to log queue
        await redis_client.publish("log_queue", json.dumps(log_data))
        
        logger.info(f"📝 Published completion log for call {call_id}")
        
    except Exception as e:
        logger.error(f"Error publishing completion log: {e}")

@conversational_intake.on_event("startup")
async def startup(ctx: Context):
    """Agent startup handler"""
    logger.info("🚀 Starting Vapi Conversational Intake Agent")
    
    # Initialize Redis connection
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        await redis_client.ping()
        logger.info("✅ Redis connection established")
    except Exception as e:
        logger.error(f"❌ Redis connection failed: {e}")

@conversational_intake.on_event("shutdown")
async def shutdown(ctx: Context):
    """Agent shutdown handler"""
    logger.info("🛑 Shutting down Vapi Conversational Intake Agent")
    
    # Close Redis connection
    global redis_client
    if redis_client:
        await redis_client.close()
        logger.info("✅ Redis connection closed")

# API endpoint for Vapi to send completed incidents
@conversational_intake.on_message(IncidentFactCompleted)
async def handle_incident_fact_completed(ctx: Context, sender: str, msg: IncidentFactCompleted):
    """Handle completed incident facts from Vapi"""
    try:
        logger.info(f"Received completed incident fact for call {msg.call_id}")
        
        # Create processing request
        processing_request = IncidentProcessingRequest(
            call_id=msg.call_id,
            incident_fact=msg.incident_fact,
            conversation_summary=msg.conversation_summary
        )
        
        # Process the incident
        await handle_incident_processing(ctx, sender, processing_request)
        
    except Exception as e:
        logger.error(f"Error handling completed incident fact: {e}")

async def register_incident_in_registry(incident_fact: IncidentFact):
    """Write incident into the Redis active incident registry for unit polling"""
    try:
        incident_data = {
            "case_id": str(incident_fact.case_id),
            "emergency_type": incident_fact.emergency_type,
            "location": incident_fact.location,
            "latitude": incident_fact.latitude,
            "longitude": incident_fact.longitude,
            "is_active_threat": incident_fact.is_active_threat,
            "details": incident_fact.details,
            "people_involved": incident_fact.people_involved,
            "timestamp": incident_fact.timestamp.isoformat() if incident_fact.timestamp else datetime.now().isoformat()
        }
        success = await incident_registry.add_active_incident(incident_data)
        if success:
            logger.info(f"✅ Incident {incident_data['case_id']} registered in active registry")
        else:
            logger.warning(f"⚠️ Failed to register incident {incident_data['case_id']}")
    except Exception as e:
        logger.error(f"❌ Error registering incident in registry: {e}")

async def notify_frontend_incident_completed(call_id: str, incident_fact: IncidentFact):
    """Notify frontend that incident processing is completed"""
    try:
        # Import here to avoid circular imports
        from app.api.frontend_router import broadcast_fact_update, broadcast_comms_message
        
        # Notify frontend of completed incident
        fact_data = {
            "status": "completed",
            "incident_fact": incident_fact.model_dump(),
            "message": f"Incident {incident_fact.emergency_type} at {incident_fact.location} has been processed"
        }
        
        await broadcast_fact_update(call_id, fact_data)
        
        # Send communication message
        comms_data = {
            "call_id": call_id,
            "type": "incident_processed",
            "message": f"Your {incident_fact.emergency_type} emergency at {incident_fact.location} has been processed and help is on the way.",
            "timestamp": datetime.now().isoformat()
        }
        
        await broadcast_comms_message(call_id, comms_data)
        
        logger.info(f"📱 Frontend notified of incident completion for call {call_id}")
        
    except Exception as e:
        logger.error(f"❌ Error notifying frontend: {e}")


if __name__ == "__main__":
    logger.info("🚀 Starting Vapi Conversational Intake Agent...")
    conversational_intake.run()
