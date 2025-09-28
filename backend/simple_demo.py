"""
Simple Demo: Intake-Comms Flow

This script demonstrates the core functionality without complex imports.
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

async def simple_demo():
    """Simple demonstration of the intake-comms flow"""
    print("=" * 80)
    print("🚀 SIMPLE DEMO: INTAKE-COMMS FLOW")
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
    
    print("\n📋 Step 2: Simulating Intake Agent Processing")
    print("-" * 40)
    
    # Simulate storing incident in Redis
    print("   💾 Storing incident in Redis...")
    incident_data = {
        "call_id": call_id,
        "incident_fact": incident_fact,
        "conversation_summary": conversation_summary,
        "timestamp": datetime.now().isoformat(),
        "status": "completed"
    }
    
    # Mock Redis operations
    await mock_redis.setex(f"incident:{call_id}", 86400, json.dumps(incident_data))
    await mock_redis.lpush("incidents:completed", call_id)
    print("   ✅ Incident stored in Redis")
    
    # Simulate publishing to incident queue
    print("   📤 Publishing to incident queue...")
    queue_data = {
        "call_id": call_id,
        "incident_fact": incident_fact,
        "conversation_summary": conversation_summary,
        "timestamp": datetime.now().isoformat(),
        "status": "ready_for_dispatch"
    }
    await mock_redis.publish("incident_queue", json.dumps(queue_data))
    print("   ✅ Published to incident queue")
    
    # Simulate publishing completion log
    print("   📝 Publishing completion log...")
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
    await mock_redis.publish("log_queue", json.dumps(log_data))
    print("   ✅ Completion log published")
    
    # Simulate incident registry registration
    print("   🗺️ Registering in incident registry...")
    await mock_registry.add_active_incident(incident_fact)
    print("   ✅ Registered in incident registry")
    
    print("\n📋 Step 3: Simulating Comms Agent Processing")
    print("-" * 40)
    
    # Simulate processing log through Comms Agent
    print("   📨 Processing log entry...")
    
    # Simulate Supabase logging (mocked)
    print("   💾 Logging to Supabase database...")
    print("   ✅ Logged to Supabase")
    
    # Simulate notification sending
    print("   📞 Sending notification to caller...")
    unit_info = {
        "unit_id": "POLICE_001",
        "type": "Police",
        "distance_km": 2.5
    }
    
    # Mock notification
    await mock_vapi.send_dispatch_notification(
        incident_fact["callback_number"],
        unit_info,
        incident_fact
    )
    print("   ✅ Notification sent")
    
    # Simulate SMS sending
    print("   📱 Sending SMS to caller...")
    sms_message = f"Your {incident_fact['emergency_type']} emergency at {incident_fact['location']} has been processed. Help is on the way!"
    
    await mock_vapi.send_update(
        incident_fact["callback_number"],
        sms_message,
        "sms"
    )
    print("   ✅ SMS sent")
    
    print("\n📋 Step 4: Frontend Integration")
    print("-" * 40)
    
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
    
    print("\n🎉 DEMO COMPLETED SUCCESSFULLY!")
    print("=" * 80)
    print("📋 Summary of Flow:")
    print("   1. Vapi Conversational Intake receives incident data")
    print("   2. Incident is stored in Redis and published to queues")
    print("   3. Incident is registered in active incident registry")
    print("   4. Comms Agent processes logs and sends notifications")
    print("   5. SMS messages are sent to original caller")
    print("   6. Frontend receives real-time updates via WebSocket")
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
    asyncio.run(simple_demo())
    asyncio.run(demo_frontend_apis())
