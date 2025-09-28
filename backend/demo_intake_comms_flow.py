"""
Demo Script: Intake-Comms Flow

This script demonstrates the complete flow from Vapi Conversational Intake
to Comms Agent with frontend integration using mock data.
"""

import asyncio
import json
import logging
from datetime import datetime
from uuid import uuid4
from unittest.mock import Mock, AsyncMock, patch

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def demo_intake_comms_flow():
    """Demonstrate the complete intake-comms flow"""
    print("=" * 80)
    print("🚀 DEMO: VAPI CONVERSATIONAL INTAKE TO COMMS AGENT FLOW")
    print("=" * 80)
    
    # Mock Redis client
    mock_redis = Mock()
    mock_redis.setex = AsyncMock()
    mock_redis.lpush = AsyncMock()
    mock_redis.publish = AsyncMock()
    mock_redis.ping = Mock()
    mock_redis.close = Mock()
    
    # Mock incident registry
    mock_registry = Mock()
    mock_registry.add_active_incident = AsyncMock(return_value=True)
    
    # Mock Vapi service
    mock_vapi = Mock()
    mock_vapi.send_update = AsyncMock(return_value={"success": True, "message": "Mock SMS sent"})
    mock_vapi.send_dispatch_notification = AsyncMock(return_value={"success": True, "message": "Mock notification sent"})
    
    # Mock frontend broadcast functions
    mock_frontend = Mock()
    mock_frontend.broadcast_fact_update = AsyncMock()
    mock_frontend.broadcast_comms_message = AsyncMock()
    mock_frontend.broadcast_transcript_update = AsyncMock()
    
    print("\n📋 Step 1: Creating Sample Incident")
    print("-" * 40)
    
    # Create sample incident fact
    incident_fact = {
        "case_id": str(uuid4()),
        "emergency_type": "Fire",
        "location": "123 Main St, Ann Arbor, MI",
        "latitude": 42.2808,
        "longitude": -83.7430,
        "is_active_threat": True,
        "details": "Building fire with smoke visible from second floor",
        "people_involved": 3,
        "callback_number": "+15551234567",
        "timestamp": datetime.now().isoformat()
    }
    
    call_id = "demo_call_123"
    conversation_summary = "Caller reported building fire with visible smoke and people trapped"
    
    print(f"   📞 Call ID: {call_id}")
    print(f"   🚨 Emergency: {incident_fact['emergency_type']}")
    print(f"   📍 Location: {incident_fact['location']}")
    print(f"   👥 People Involved: {incident_fact['people_involved']}")
    print(f"   📱 Callback: {incident_fact['callback_number']}")
    
    print("\n📋 Step 2: Intake Agent Processing")
    print("-" * 40)
    
    # Simulate intake agent processing
    with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis), \
         patch('agents.vapi_conversational_intake.incident_registry', mock_registry), \
         patch('agents.vapi_conversational_intake.broadcast_fact_update', mock_frontend.broadcast_fact_update), \
         patch('agents.vapi_conversational_intake.broadcast_comms_message', mock_frontend.broadcast_comms_message):
        
        # Import intake functions
        from agents.vapi_conversational_intake import (
            store_incident_in_redis,
            publish_incident_to_queue,
            publish_completion_log,
            register_incident_in_registry,
            notify_frontend_incident_completed
        )
        
        # Store incident in Redis
        print("   💾 Storing incident in Redis...")
        await store_incident_in_redis(call_id, incident_fact, conversation_summary)
        print("   ✅ Incident stored in Redis")
        
        # Publish to incident queue
        print("   📤 Publishing to incident queue...")
        await publish_incident_to_queue(call_id, incident_fact, conversation_summary)
        print("   ✅ Published to incident queue")
        
        # Publish completion log
        print("   📝 Publishing completion log...")
        await publish_completion_log(call_id, incident_fact)
        print("   ✅ Completion log published")
        
        # Register in incident registry
        print("   🗺️ Registering in incident registry...")
        await register_incident_in_registry(incident_fact)
        print("   ✅ Registered in incident registry")
        
        # Notify frontend
        print("   📱 Notifying frontend...")
        await notify_frontend_incident_completed(call_id, incident_fact)
        print("   ✅ Frontend notified")
    
    print("\n📋 Step 3: Comms Agent Processing")
    print("-" * 40)
    
    # Simulate comms agent processing
    with patch('agents.comms_agent.redis.from_url', return_value=mock_redis), \
         patch('agents.comms_agent.vapi_service', mock_vapi):
        
        from agents.comms_agent import CommsAgent
        
        comms_agent = CommsAgent()
        comms_agent.redis_client = mock_redis
        
        # Create log data that would be received from Redis
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "action": "incident_completed",
            "case_id": call_id,
            "emergency_type": incident_fact["emergency_type"],
            "location": incident_fact["location"],
            "callback_number": incident_fact["callback_number"],
            "incident_data": {
                "call_id": call_id,
                "incident_fact": incident_fact
            }
        }
        
        print("   📨 Processing log entry...")
        await comms_agent.process_log(log_data)
        print("   ✅ Log processed")
        
        # Simulate unit dispatch notification
        dispatch_log = {
            "timestamp": datetime.now().isoformat(),
            "action": "unit_dispatched",
            "case_id": call_id,
            "unit_id": "POLICE_001",
            "unit_type": "Police",
            "distance_km": 2.5,
            "incident_data": {
                "incident_fact": incident_fact
            }
        }
        
        print("   🚔 Processing unit dispatch...")
        await comms_agent.process_log(dispatch_log)
        print("   ✅ Unit dispatch processed")
        
        # Simulate SMS sending
        sms_log = {
            "timestamp": datetime.now().isoformat(),
            "action": "dispatch_failed",
            "case_id": call_id,
            "incident_data": {
                "incident_fact": incident_fact
            }
        }
        
        print("   📱 Processing SMS notification...")
        await comms_agent.process_log(sms_log)
        print("   ✅ SMS notification processed")
    
    print("\n📋 Step 4: Frontend Integration")
    print("-" * 40)
    
    # Simulate frontend API calls
    print("   🌐 Frontend APIs available:")
    print("   - WebSocket: ws://localhost:8000/api/frontend/ws/dashboard")
    print("   - WebSocket: ws://localhost:8000/api/frontend/ws/call/{call_id}")
    print("   - POST /api/frontend/transcript/{call_id}")
    print("   - POST /api/frontend/fact-update/{call_id}")
    print("   - POST /api/frontend/send-sms")
    print("   - GET /api/frontend/dashboard")
    
    print("\n📋 Step 5: Verification")
    print("-" * 40)
    
    # Verify all operations were called
    print("   ✅ Redis operations:")
    print(f"      - setex called: {mock_redis.setex.called}")
    print(f"      - lpush called: {mock_redis.lpush.called}")
    print(f"      - publish called: {mock_redis.publish.call_count} times")
    
    print("   ✅ Incident registry:")
    print(f"      - add_active_incident called: {mock_registry.add_active_incident.called}")
    
    print("   ✅ Vapi service:")
    print(f"      - send_update called: {mock_vapi.send_update.called}")
    print(f"      - send_dispatch_notification called: {mock_vapi.send_dispatch_notification.called}")
    
    print("   ✅ Frontend notifications:")
    print(f"      - broadcast_fact_update called: {mock_frontend.broadcast_fact_update.called}")
    print(f"      - broadcast_comms_message called: {mock_frontend.broadcast_comms_message.called}")
    
    print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("📋 Summary of Flow:")
    print("   1. Vapi Conversational Intake receives incident data")
    print("   2. Incident is stored in Redis and published to queues")
    print("   3. Incident is registered in active incident registry")
    print("   4. Frontend is notified of incident completion")
    print("   5. Comms Agent processes logs and sends notifications")
    print("   6. SMS messages are sent to original caller")
    print("   7. Frontend receives real-time updates via WebSocket")
    print("=" * 80)

async def demo_frontend_apis():
    """Demonstrate frontend API usage"""
    print("\n🌐 FRONTEND API DEMO")
    print("=" * 40)
    
    print("📱 Available Frontend APIs:")
    print()
    print("1. WebSocket Connections:")
    print("   - Dashboard: ws://localhost:8000/api/frontend/ws/dashboard")
    print("   - Call-specific: ws://localhost:8000/api/frontend/ws/call/{call_id}")
    print()
    print("2. REST Endpoints:")
    print("   - POST /api/frontend/transcript/{call_id}")
    print("   - POST /api/frontend/fact-update/{call_id}")
    print("   - POST /api/frontend/comms-message")
    print("   - POST /api/frontend/send-sms")
    print("   - GET /api/frontend/incidents")
    print("   - GET /api/frontend/call/{call_id}/status")
    print("   - GET /api/frontend/dashboard")
    print()
    print("3. Example Usage:")
    print("   # Send transcript update")
    print("   curl -X POST http://localhost:8000/api/frontend/transcript/call_123 \\")
    print("        -H 'Content-Type: application/json' \\")
    print("        -d '{\"text\": \"Caller: There is a fire at my house\", \"speaker\": \"caller\"}'")
    print()
    print("   # Send fact update")
    print("   curl -X POST http://localhost:8000/api/frontend/fact-update/call_123 \\")
    print("        -H 'Content-Type: application/json' \\")
    print("        -d '{\"field\": \"emergency_type\", \"value\": \"Fire\"}'")
    print()
    print("   # Send SMS")
    print("   curl -X POST http://localhost:8000/api/frontend/send-sms \\")
    print("        -H 'Content-Type: application/json' \\")
    print("        -d '{\"phone_number\": \"+15551234567\", \"message\": \"Help is on the way!\"}'")

if __name__ == "__main__":
    asyncio.run(demo_intake_comms_flow())
    asyncio.run(demo_frontend_apis())
