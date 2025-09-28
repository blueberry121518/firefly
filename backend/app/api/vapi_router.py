"""
Vapi API Router for Emergency Dispatch System

This router handles webhooks from Vapi for:
1. Logic Handler - The "brain" that determines next questions
2. Transcription Handler - Real-time transcript updates for dashboard
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import json
import logging
from datetime import datetime

from app.core.config import settings
from app.schemas.incident_schema import IncidentFact
from app.services.incident_service import IncidentService
from app.agent_registry import agent_registry
import google.generativeai as genai
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Configure Gemini
genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# WebSocket connection manager for dashboard
class DashboardConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Dashboard connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Dashboard disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast_transcript(self, data: dict):
        """Broadcast transcript data to all connected dashboard clients"""
        if not self.active_connections:
            logger.warning("No dashboard connections available for transcript broadcast")
            return
            
        message = json.dumps(data)
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting to dashboard: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_fact_update(self, call_id: str, field: str, value: str):
        """Broadcast fact sheet updates to dashboard"""
        if not self.active_connections:
            logger.warning("No dashboard connections available for fact update broadcast")
            return
        
        message = json.dumps({
            "type": "fact_update",
            "call_id": call_id,
            "timestamp": datetime.now().isoformat(),
            "data": {
                "field": field,
                "value": value,
                "message": f"Updated {field}: {value}"
            }
        })
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                logger.error(f"Error broadcasting fact update: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

# Global connection manager
dashboard_manager = DashboardConnectionManager()

# Pydantic models for Vapi webhooks
class VapiMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class VapiHandlerRequest(BaseModel):
    call: Dict[str, Any]
    message: Optional[VapiMessage] = None
    transcript: Optional[str] = None
    callId: str
    customer: Dict[str, Any]

class VapiTranscriptRequest(BaseModel):
    callId: str
    transcript: str
    role: str  # "user" or "assistant"
    timestamp: Optional[datetime] = None

class VapiResponse(BaseModel):
    transcript: str

# In-memory storage for call contexts (in production, use Redis)
call_contexts: Dict[str, Dict[str, Any]] = {}

@router.post("/handler")
async def vapi_logic_handler(request: VapiHandlerRequest):
    """
    Vapi Logic Handler - The "brain" of our dispatch agent
    
    This endpoint receives conversation history from Vapi and determines
    the next question to ask based on the current IncidentFact state.
    """
    try:
        logger.info(f"Vapi Logic Handler called for call {request.callId}")
        
        # Initialize or get call context
        if request.callId not in call_contexts:
            call_contexts[request.callId] = {
                "incident_fact": IncidentFact(),
                "conversation_history": [],
                "call_start_time": datetime.now()
            }
        
        call_context = call_contexts[request.callId]
        
        # Add new message to conversation history
        if request.message:
            call_context["conversation_history"].append({
                "role": request.message.role,
                "content": request.message.content,
                "timestamp": request.message.timestamp or datetime.now()
            })
        
        # Extract facts from conversation history
        await extract_facts_from_conversation(call_context)
        
        # Determine what information is still missing
        missing_fields = get_missing_incident_fields(call_context["incident_fact"])
        
        # Generate next question using Gemini
        next_question = await generate_next_question(
            call_context["conversation_history"],
            call_context["incident_fact"],
            missing_fields
        )
        
        # If incident is complete, finalize it
        if not missing_fields:
            await finalize_incident(call_context, request.callId)
            next_question = "Thank you for providing all the necessary information. Emergency services are being dispatched to your location. Please stay on the line if you need any additional assistance."
        else:
            # Add urgency to questions if critical information is missing
            if "location" in missing_fields or "emergency_type" in missing_fields:
                next_question = f"URGENT: {next_question}"
        
        logger.info(f"Generated next question for call {request.callId}: {next_question}")
        
        return VapiResponse(transcript=next_question)
        
    except Exception as e:
        logger.error(f"Error in Vapi Logic Handler: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/transcripts")
async def vapi_transcript_handler(request: VapiTranscriptRequest):
    """
    Vapi Transcription Handler - Real-time transcript updates
    
    This endpoint receives transcript events from Vapi and broadcasts
    them to the dashboard WebSocket for real-time display.
    """
    try:
        logger.info(f"Transcript received for call {request.callId}: {request.transcript}")
        
        # Prepare transcript data for dashboard
        transcript_data = {
            "callId": request.callId,
            "transcript": request.transcript,
            "role": request.role,
            "timestamp": request.timestamp or datetime.now().isoformat(),
            "type": "transcript"
        }
        
        # Broadcast to dashboard
        await dashboard_manager.broadcast_transcript(transcript_data)
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error in Vapi Transcript Handler: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/call-context/{call_id}")
async def get_call_context(call_id: str):
    """
    Get the current call context and incident fact sheet data
    """
    if call_id not in call_contexts:
        raise HTTPException(status_code=404, detail="Call not found")
    
    context = call_contexts[call_id]
    return {
        "call_id": call_id,
        "incident_fact": context["incident_fact"].dict(),
        "conversation_history": context["conversation_history"],
        "call_start_time": context["call_start_time"].isoformat()
    }

@router.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    """
    WebSocket endpoint for dashboard real-time updates
    """
    await dashboard_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        dashboard_manager.disconnect(websocket)

async def extract_facts_from_conversation(call_context: Dict[str, Any]):
    """Extract incident facts from conversation history using Gemini"""
    try:
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in call_context["conversation_history"]
        ])
        
        prompt = f"""
        Analyze this emergency call conversation and extract relevant information for an incident report.
        
        Conversation:
        {conversation_text}
        
        Please extract the following information if mentioned:
        - Emergency type (fire, medical, police, etc.)
        - Location/address
        - Number of people involved
        - Severity/urgency level
        - Any specific details about the situation
        
        Return the information in a structured format.
        """
        
        response = model.generate_content(prompt)
        
        # Parse response and update incident fact
        # This is a simplified version - in production, you'd want more sophisticated parsing
        incident_fact = call_context["incident_fact"]
        
        # Enhanced fact extraction using Gemini's structured output
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in call_context["conversation_history"]
        ])
        
        # Use Gemini to extract structured information
        extraction_prompt = f"""
        Analyze this emergency call conversation and extract specific information:
        
        Conversation:
        {conversation_text}
        
        Extract and return ONLY the following information in this exact format:
        EMERGENCY_TYPE: [Fire/Medical/Police/Other]
        LOCATION: [exact address or location mentioned]
        SEVERITY: [Low/Medium/High/Critical]
        PEOPLE_INVOLVED: [number of people mentioned]
        CALLER_SAFE: [Yes/No/Unknown]
        DESCRIPTION: [brief description of the incident]
        
        If information is not mentioned, use "Not specified"
        """
        
        extraction_response = model.generate_content(extraction_prompt)
        extracted_text = extraction_response.text
        
        # Parse the structured response
        lines = extracted_text.strip().split('\n')
        for line in lines:
            if line.startswith('EMERGENCY_TYPE:'):
                incident_fact.emergency_type = line.split(':', 1)[1].strip()
            elif line.startswith('LOCATION:'):
                location = line.split(':', 1)[1].strip()
                if location != "Not specified":
                    incident_fact.location = location
            elif line.startswith('SEVERITY:'):
                incident_fact.severity = line.split(':', 1)[1].strip()
            elif line.startswith('PEOPLE_INVOLVED:'):
                try:
                    people = int(line.split(':', 1)[1].strip())
                    incident_fact.people_involved = people
                except:
                    pass
            elif line.startswith('CALLER_SAFE:'):
                safe = line.split(':', 1)[1].strip().lower()
                incident_fact.is_caller_safe = safe == "yes"
            elif line.startswith('DESCRIPTION:'):
                incident_fact.description = line.split(':', 1)[1].strip()
        
        # Fallback to basic keyword extraction if structured extraction fails
        if not incident_fact.emergency_type:
            if "fire" in conversation_text.lower():
                incident_fact.emergency_type = "Fire"
            elif "medical" in conversation_text.lower() or "ambulance" in conversation_text.lower():
                incident_fact.emergency_type = "Medical"
            elif "police" in conversation_text.lower() or "crime" in conversation_text.lower():
                incident_fact.emergency_type = "Police"
        
        logger.info(f"Extracted facts: {incident_fact}")
        
    except Exception as e:
        logger.error(f"Error extracting facts: {e}")

def get_missing_incident_fields(incident_fact: IncidentFact) -> List[str]:
    """Determine which required fields are still missing from the incident fact"""
    missing_fields = []
    
    # Critical fields that must be filled
    if not incident_fact.emergency_type or incident_fact.emergency_type == "Not specified":
        missing_fields.append("emergency_type")
    if not incident_fact.location or incident_fact.location == "Not specified":
        missing_fields.append("location")
    if not incident_fact.severity or incident_fact.severity == "Not specified":
        missing_fields.append("severity")
    if not incident_fact.description or incident_fact.description == "Not specified":
        missing_fields.append("description")
    
    # Important fields for emergency response
    if incident_fact.is_caller_safe is None:
        missing_fields.append("caller_safety")
    if not incident_fact.people_involved or incident_fact.people_involved == 0:
        missing_fields.append("people_involved")
    
    return missing_fields

async def generate_next_question(
    conversation_history: List[Dict],
    incident_fact: IncidentFact,
    missing_fields: List[str]
) -> str:
    """Generate the next question using Gemini based on missing information"""
    try:
        conversation_text = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in conversation_history[-5:]  # Last 5 messages for context
        ])
        
        missing_fields_text = ", ".join(missing_fields)
        
        # Create a priority order for missing fields
        field_priorities = {
            "emergency_type": 1,
            "location": 2, 
            "severity": 3,
            "caller_safety": 4,
            "people_involved": 5,
            "description": 6
        }
        
        # Sort missing fields by priority
        sorted_missing = sorted(missing_fields, key=lambda x: field_priorities.get(x, 99))
        most_important_missing = sorted_missing[0] if sorted_missing else "general_info"
        
        prompt = f"""
        You are an emergency dispatcher conducting an intake call. Based on the conversation so far, 
        determine the single most important question to ask next to gather missing information.
        
        Current conversation:
        {conversation_text}
        
        Current incident information:
        - Emergency Type: {incident_fact.emergency_type or 'Not specified'}
        - Location: {incident_fact.location or 'Not specified'}
        - Severity: {incident_fact.severity or 'Not specified'}
        - Caller Safe: {incident_fact.is_caller_safe if incident_fact.is_caller_safe is not None else 'Not specified'}
        - People Involved: {incident_fact.people_involved or 'Not specified'}
        - Description: {incident_fact.description or 'Not specified'}
        
        Missing information: {missing_fields_text}
        Most critical missing field: {most_important_missing}
        
        Generate a single, clear, and empathetic question to ask the caller. 
        Be professional but reassuring. Keep it concise and specific to the missing information.
        If this is a critical emergency, be more direct and urgent.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Error generating next question: {e}")
        return "Can you please provide more details about the emergency?"

async def finalize_incident(call_context: Dict[str, Any], call_id: str):
    """Finalize the incident and send to conversational intake agent"""
    try:
        incident_fact = call_context["incident_fact"]
        incident_fact.callback_number = call_context.get("caller_number", "Unknown")
        incident_fact.timestamp = datetime.now()
        
        # Create conversation summary
        conversation_summary = "\n".join([
            f"{msg['role']}: {msg['content']}" 
            for msg in call_context["conversation_history"]
        ])
        
        # Send to conversational intake agent
        conversational_intake_address = agent_registry.get_agent_address("conversational_intake")
        if conversational_intake_address:
            logger.info(f"Sending completed incident to conversational intake agent: {conversational_intake_address}")
            
            # Send message to agent
            message_data = {
                "call_id": call_id,
                "incident_fact": incident_fact.dict(),
                "conversation_summary": conversation_summary,
                "timestamp": datetime.now().isoformat()
            }
            
            # Send HTTP request to agent
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"http://localhost:8001/submit",
                    json=message_data,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Successfully sent incident to conversational intake agent")
                else:
                    logger.error(f"Failed to send incident to agent: {response.status_code}")
        else:
            logger.warning("Conversational intake agent not found in registry")
        
    except Exception as e:
        logger.error(f"Error finalizing incident: {e}")

@router.get("/calls/{call_id}/status")
async def get_call_status(call_id: str):
    """Get the current status of a call"""
    if call_id not in call_contexts:
        raise HTTPException(status_code=404, detail="Call not found")
    
    call_context = call_contexts[call_id]
    return {
        "callId": call_id,
        "incidentFact": call_context["incident_fact"].dict(),
        "conversationHistory": call_context["conversation_history"],
        "callStartTime": call_context["call_start_time"]
    }
