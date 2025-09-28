#!/usr/bin/env python3
"""
Vapi Setup Script

This script helps configure Vapi for the emergency dispatch system
"""

import httpx
import json
import os
from app.core.config import settings

VAPI_BASE_URL = "https://api.vapi.ai"

async def create_vapi_assistant():
    """Create a Vapi assistant for emergency dispatch"""
    print("🤖 Creating Vapi Assistant...")
    
    headers = {
        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    assistant_config = {
        "name": "Emergency Dispatch Assistant",
        "model": {
            "provider": "openai",
            "model": "gpt-4",
            "temperature": 0.7,
            "maxTokens": 1000
        },
        "voice": {
            "provider": "elevenlabs",
            "voiceId": "21m00Tcm4TlvDq8ikWAM",  # Default voice
            "speed": 1.0,
            "stability": 0.5,
            "clarity": 0.75
        },
        "firstMessage": "Hello, this is the emergency dispatch system. I'm here to help you with your emergency. What is the nature of your emergency?",
        "systemMessage": """You are an emergency dispatcher conducting an intake call. Your role is to:

1. Gather essential information about the emergency
2. Ask clear, specific questions to understand the situation
3. Be empathetic and reassuring while maintaining professionalism
4. Focus on gathering: emergency type, location, severity, number of people involved, and any immediate dangers

Key information to collect:
- Type of emergency (fire, medical, police, etc.)
- Exact location/address
- Severity level (low, medium, high, critical)
- Number of people involved
- Any immediate dangers or hazards
- Caller's name and contact information

Be concise but thorough. Ask one question at a time and wait for responses.""",
        "endCallMessage": "Thank you for providing the information. Emergency services have been notified and are on their way. Please stay safe and follow any safety instructions given by first responders.",
        "endCallPhrases": ["goodbye", "thank you", "that's all", "end call", "hang up"],
        "silenceTimeoutSeconds": 30,
        "responseDelaySeconds": 1,
        "interruptThreshold": 0.5,
        "backgroundSound": "office",
        "maxSilenceSeconds": 5,
        "language": "en-US",
        "endCallFunctionEnabled": True,
        "fillersEnabled": True,
        "backchannelingEnabled": True,
        "voicemailDetectionEnabled": True,
        "voicemailMessage": "I'm sorry, I couldn't reach you. Please call back or contact emergency services directly at 911."
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{VAPI_BASE_URL}/assistant",
                headers=headers,
                json=assistant_config,
                timeout=30.0
            )
            
            if response.status_code == 200:
                assistant_data = response.json()
                print(f"✅ Assistant created successfully!")
                print(f"Assistant ID: {assistant_data.get('id')}")
                print(f"Name: {assistant_data.get('name')}")
                return assistant_data.get('id')
            else:
                print(f"❌ Failed to create assistant: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Error creating assistant: {e}")
        return None

async def create_vapi_phone_number():
    """Create a Vapi phone number for emergency calls"""
    print("📞 Creating Vapi Phone Number...")
    
    headers = {
        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    phone_config = {
        "number": "+1234567890",  # Replace with your desired number
        "provider": "twilio",  # or "vonage"
        "accountId": "your-twilio-account-id",  # Replace with your Twilio account ID
        "accountSid": "your-twilio-account-sid",  # Replace with your Twilio account SID
        "authToken": "your-twilio-auth-token"  # Replace with your Twilio auth token
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{VAPI_BASE_URL}/phone-number",
                headers=headers,
                json=phone_config,
                timeout=30.0
            )
            
            if response.status_code == 200:
                phone_data = response.json()
                print(f"✅ Phone number created successfully!")
                print(f"Phone Number ID: {phone_data.get('id')}")
                print(f"Number: {phone_data.get('number')}")
                return phone_data.get('id')
            else:
                print(f"❌ Failed to create phone number: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"❌ Error creating phone number: {e}")
        return None

async def test_vapi_connection():
    """Test connection to Vapi API"""
    print("🔌 Testing Vapi API Connection...")
    
    headers = {
        "Authorization": f"Bearer {settings.VAPI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{VAPI_BASE_URL}/assistant",
                headers=headers,
                timeout=10.0
            )
            
            if response.status_code == 200:
                print("✅ Vapi API connection successful!")
                return True
            else:
                print(f"❌ Vapi API connection failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Vapi API connection error: {e}")
        return False

async def main():
    """Main setup function"""
    print("🚀 Vapi Setup for Emergency Dispatch System")
    print("=" * 50)
    
    # Check if API key is configured
    if not settings.VAPI_API_KEY:
        print("❌ VAPI_API_KEY not found in environment variables")
        print("Please set VAPI_API_KEY in your .env file")
        return
    
    # Test connection
    if not await test_vapi_connection():
        print("❌ Cannot connect to Vapi API. Check your API key.")
        return
    
    print("\n📋 Setup Options:")
    print("1. Create Assistant")
    print("2. Create Phone Number")
    print("3. Test Connection Only")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1":
        assistant_id = await create_vapi_assistant()
        if assistant_id:
            print(f"\n💾 Save this Assistant ID: {assistant_id}")
            print("Update your Vapi service configuration with this ID")
    
    elif choice == "2":
        phone_id = await create_vapi_phone_number()
        if phone_id:
            print(f"\n💾 Save this Phone Number ID: {phone_id}")
            print("Update your Vapi service configuration with this ID")
    
    elif choice == "3":
        print("✅ Connection test completed")
    
    else:
        print("❌ Invalid choice")
    
    print("\n📚 Next Steps:")
    print("1. Update your .env file with the generated IDs")
    print("2. Configure your webhook URL in Vapi dashboard")
    print("3. Test the integration with test_vapi_integration.py")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
