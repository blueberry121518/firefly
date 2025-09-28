#!/usr/bin/env python3
"""
Test script for Vapi integration

This script tests the new Vapi-based emergency dispatch system
"""

import asyncio
import httpx
import json
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000"
VAPI_HANDLER_URL = f"{BASE_URL}/api/v1/vapi/handler"
VAPI_TRANSCRIPT_URL = f"{BASE_URL}/api/v1/vapi/transcripts"
CALL_INITIATION_URL = f"{BASE_URL}/api/v1/calls/initiate-call"

async def test_vapi_logic_handler():
    """Test the Vapi logic handler endpoint"""
    print("🧪 Testing Vapi Logic Handler...")
    
    # Simulate a Vapi webhook request
    test_request = {
        "call": {
            "id": "test-call-123",
            "status": "in-progress"
        },
        "message": {
            "role": "user",
            "content": "I need help, there's a fire at my house",
            "timestamp": datetime.now().isoformat()
        },
        "callId": "test-call-123",
        "customer": {
            "number": "+1234567890",
            "name": "Test Caller"
        }
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                VAPI_HANDLER_URL,
                json=test_request,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Logic Handler Response: {result}")
                return True
            else:
                print(f"❌ Logic Handler Error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Logic Handler Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_vapi_transcript_handler():
    """Test the Vapi transcript handler endpoint"""
    print("🧪 Testing Vapi Transcript Handler...")
    
    # Simulate a transcript event
    test_transcript = {
        "callId": "test-call-123",
        "transcript": "I need help, there's a fire at my house",
        "role": "user",
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                VAPI_TRANSCRIPT_URL,
                json=test_transcript,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Transcript Handler Response: {result}")
                return True
            else:
                print(f"❌ Transcript Handler Error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Transcript Handler Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_call_initiation():
    """Test the call initiation endpoint"""
    print("🧪 Testing Call Initiation...")
    
    # Simulate call initiation request
    test_request = {
        "phone_number": "+1234567890",
        "caller_name": "Test Caller",
        "emergency_type": "Fire",
        "location": "123 Test Street"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                CALL_INITIATION_URL,
                json=test_request,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Call Initiation Response: {result}")
                return True
            else:
                print(f"❌ Call Initiation Error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Call Initiation Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_dashboard_websocket():
    """Test the dashboard WebSocket connection"""
    print("🧪 Testing Dashboard WebSocket...")
    
    try:
        import websockets
        # Test WebSocket connection
        async with websockets.connect(f"ws://localhost:8000/api/v1/vapi/ws/dashboard") as websocket:
            print("✅ Dashboard WebSocket connected successfully")
            
            # Send a test message
            await websocket.send("test message")
            
            # Wait for response
            response = await websocket.recv()
            print(f"✅ WebSocket Response: {response}")
            
            return True
                
    except Exception as e:
        print(f"❌ Dashboard WebSocket Exception: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting Vapi Integration Tests")
    print("=" * 50)
    
    tests = [
        ("Logic Handler", test_vapi_logic_handler),
        ("Transcript Handler", test_vapi_transcript_handler),
        ("Call Initiation", test_call_initiation),
        ("Dashboard WebSocket", test_dashboard_websocket)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Vapi integration is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    asyncio.run(main())
