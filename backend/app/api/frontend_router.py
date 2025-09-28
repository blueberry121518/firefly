"""
Frontend API Router for Emergency Dispatch System

Provides real-time APIs for the frontend dashboard including:
- Real-time transcript updates
- Incident fact sheet updates
- Communication messages
- SMS sending functionality
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import HTMLResponse
from typing import List, Dict, Any, Optional
import json
import asyncio
import logging
from datetime import datetime
from uuid import uuid4

from app.core.config import settings
from app.schemas.incident_schema import IncidentFact
from services.vapi_service import vapi_service

logger = logging.getLogger(__name__)

# Create router
frontend_router = APIRouter(prefix="/api/frontend", tags=["frontend"])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.call_connections: Dict[str, List[WebSocket]] = {}  # call_id -> [websockets]
    
    async def connect(self, websocket: WebSocket, call_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if call_id:
            if call_id not in self.call_connections:
                self.call_connections[call_id] = []
            self.call_connections[call_id].append(websocket)
        
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket, call_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if call_id and call_id in self.call_connections:
            if websocket in self.call_connections[call_id]:
                self.call_connections[call_id].remove(websocket)
            if not self.call_connections[call_id]:
                del self.call_connections[call_id]
        
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_all(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")
    
    async def broadcast_to_call(self, call_id: str, message: str):
        if call_id in self.call_connections:
            for connection in self.call_connections[call_id]:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to call {call_id}: {e}")

# Global connection manager
manager = ConnectionManager()

@frontend_router.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    """WebSocket endpoint for dashboard updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@frontend_router.websocket("/ws/call/{call_id}")
async def websocket_call(websocket: WebSocket, call_id: str):
    """WebSocket endpoint for specific call updates"""
    await manager.connect(websocket, call_id)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, call_id)

@frontend_router.post("/transcript/{call_id}")
async def update_transcript(call_id: str, transcript_data: Dict[str, Any]):
    """Update real-time transcript for a call"""
    try:
        # Broadcast transcript update to all call-specific connections
        message = {
            "type": "transcript_update",
            "call_id": call_id,
            "timestamp": datetime.now().isoformat(),
            "data": transcript_data
        }
        
        await manager.broadcast_to_call(call_id, json.dumps(message))
        
        # Also broadcast to dashboard
        await manager.broadcast_to_all(json.dumps(message))
        
        logger.info(f"📝 Transcript updated for call {call_id}")
        return {"status": "success", "message": "Transcript updated"}
        
    except Exception as e:
        logger.error(f"❌ Error updating transcript: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.post("/fact-update/{call_id}")
async def update_fact_sheet(call_id: str, fact_data: Dict[str, Any]):
    """Update incident fact sheet and notify frontend"""
    try:
        # Broadcast fact update to all call-specific connections
        message = {
            "type": "fact_update",
            "call_id": call_id,
            "timestamp": datetime.now().isoformat(),
            "data": fact_data
        }
        
        await manager.broadcast_to_call(call_id, json.dumps(message))
        
        # Also broadcast to dashboard
        await manager.broadcast_to_all(json.dumps(message))
        
        logger.info(f"📋 Fact sheet updated for call {call_id}: {fact_data.get('field', 'unknown')}")
        return {"status": "success", "message": "Fact sheet updated"}
        
    except Exception as e:
        logger.error(f"❌ Error updating fact sheet: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.post("/comms-message")
async def send_comms_message(message_data: Dict[str, Any]):
    """Send a communication message and notify frontend"""
    try:
        call_id = message_data.get("call_id", "unknown")
        
        # Broadcast communication message to all connections
        message = {
            "type": "comms_message",
            "call_id": call_id,
            "timestamp": datetime.now().isoformat(),
            "data": message_data
        }
        
        await manager.broadcast_to_all(json.dumps(message))
        
        logger.info(f"📞 Communication message sent for call {call_id}")
        return {"status": "success", "message": "Communication message sent"}
        
    except Exception as e:
        logger.error(f"❌ Error sending comms message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.post("/send-sms")
async def send_sms(sms_data: Dict[str, Any]):
    """Send SMS to a phone number"""
    try:
        phone_number = sms_data.get("phone_number")
        message = sms_data.get("message")
        call_id = sms_data.get("call_id", "unknown")
        
        if not phone_number or not message:
            raise HTTPException(status_code=400, detail="phone_number and message are required")
        
        # Send SMS via Vapi service
        result = await vapi_service.send_update(phone_number, message, "sms")
        
        # Broadcast SMS notification to frontend
        notification = {
            "type": "sms_sent",
            "call_id": call_id,
            "timestamp": datetime.now().isoformat(),
            "data": {
                "phone_number": phone_number,
                "message": message,
                "result": result
            }
        }
        
        await manager.broadcast_to_all(json.dumps(notification))
        
        logger.info(f"📱 SMS sent to {phone_number} for call {call_id}")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error sending SMS: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.get("/incidents")
async def get_incidents():
    """Get all incidents for dashboard display"""
    try:
        # This would typically fetch from Redis or database
        # For now, return mock data
        incidents = [
            {
                "call_id": "call_123",
                "emergency_type": "Fire",
                "location": "123 Main St",
                "status": "active",
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        return {"incidents": incidents}
        
    except Exception as e:
        logger.error(f"❌ Error fetching incidents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.get("/call/{call_id}/status")
async def get_call_status(call_id: str):
    """Get status of a specific call"""
    try:
        # This would typically fetch from Redis
        # For now, return mock data
        status = {
            "call_id": call_id,
            "status": "active",
            "transcript": [],
            "facts": {},
            "last_update": datetime.now().isoformat()
        }
        
        return status
        
    except Exception as e:
        logger.error(f"❌ Error fetching call status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@frontend_router.get("/dashboard")
async def get_dashboard():
    """Get dashboard HTML page"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Emergency Dispatch Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .transcript { background: #f5f5f5; padding: 10px; height: 300px; overflow-y: auto; }
            .facts { background: #e8f4f8; padding: 10px; }
            .messages { background: #f0f8f0; padding: 10px; height: 200px; overflow-y: auto; }
            .status { color: green; font-weight: bold; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Emergency Dispatch Dashboard</h1>
            
            <div class="section">
                <h2>Real-time Transcript</h2>
                <div id="transcript" class="transcript"></div>
            </div>
            
            <div class="section">
                <h2>Incident Facts</h2>
                <div id="facts" class="facts"></div>
            </div>
            
            <div class="section">
                <h2>Communication Messages</h2>
                <div id="messages" class="messages"></div>
            </div>
            
            <div class="section">
                <h2>Send SMS</h2>
                <input type="text" id="phoneNumber" placeholder="Phone Number" />
                <input type="text" id="smsMessage" placeholder="Message" />
                <button onclick="sendSMS()">Send SMS</button>
            </div>
        </div>
        
        <script>
            const ws = new WebSocket('ws://localhost:8000/api/frontend/ws/dashboard');
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                console.log('Received:', data);
                
                if (data.type === 'transcript_update') {
                    const transcript = document.getElementById('transcript');
                    transcript.innerHTML += '<div>' + JSON.stringify(data.data) + '</div>';
                    transcript.scrollTop = transcript.scrollHeight;
                } else if (data.type === 'fact_update') {
                    const facts = document.getElementById('facts');
                    facts.innerHTML += '<div><strong>' + data.timestamp + ':</strong> ' + JSON.stringify(data.data) + '</div>';
                } else if (data.type === 'comms_message') {
                    const messages = document.getElementById('messages');
                    messages.innerHTML += '<div><strong>' + data.timestamp + ':</strong> ' + JSON.stringify(data.data) + '</div>';
                    messages.scrollTop = messages.scrollHeight;
                } else if (data.type === 'sms_sent') {
                    const messages = document.getElementById('messages');
                    messages.innerHTML += '<div class="status">SMS Sent: ' + JSON.stringify(data.data) + '</div>';
                }
            };
            
            function sendSMS() {
                const phoneNumber = document.getElementById('phoneNumber').value;
                const message = document.getElementById('smsMessage').value;
                
                fetch('/api/frontend/send-sms', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        phone_number: phoneNumber,
                        message: message,
                        call_id: 'dashboard_test'
                    })
                })
                .then(response => response.json())
                .then(data => console.log('SMS Result:', data));
            }
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)

# Helper functions for other parts of the system to use
async def broadcast_transcript_update(call_id: str, transcript_data: Dict[str, Any]):
    """Helper function to broadcast transcript updates"""
    message = {
        "type": "transcript_update",
        "call_id": call_id,
        "timestamp": datetime.now().isoformat(),
        "data": transcript_data
    }
    await manager.broadcast_to_call(call_id, json.dumps(message))
    await manager.broadcast_to_all(json.dumps(message))

async def broadcast_fact_update(call_id: str, fact_data: Dict[str, Any]):
    """Helper function to broadcast fact sheet updates"""
    message = {
        "type": "fact_update",
        "call_id": call_id,
        "timestamp": datetime.now().isoformat(),
        "data": fact_data
    }
    await manager.broadcast_to_call(call_id, json.dumps(message))
    await manager.broadcast_to_all(json.dumps(message))

async def broadcast_comms_message(call_id: str, message_data: Dict[str, Any]):
    """Helper function to broadcast communication messages"""
    message = {
        "type": "comms_message",
        "call_id": call_id,
        "timestamp": datetime.now().isoformat(),
        "data": message_data
    }
    await manager.broadcast_to_all(json.dumps(message))
