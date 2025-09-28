#!/usr/bin/env python3
"""
Simple Vapi Setup Script using the Vapi Python SDK
"""

import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def setup_vapi_assistant():
    """Set up Vapi assistant using the Python SDK"""
    try:
        import vapi
    except ImportError:
        print("❌ Vapi Python SDK not installed. Installing...")
        os.system("pip install vapi-python")
        import vapi
    
    # Get API key from environment
    api_key = os.getenv("VAPI_API_KEY")
    if not api_key:
        print("❌ VAPI_API_KEY not found in .env file")
        print("Please add: VAPI_API_KEY=your_api_key_here")
        return
    
    webhook_base_url = os.getenv("VAPI_WEBHOOK_BASE_URL")
    if not webhook_base_url:
        print("❌ VAPI_WEBHOOK_BASE_URL not found in .env file")
        print("Please add: VAPI_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io")
        return
    
    print(f"🔧 Setting up Vapi with webhook: {webhook_base_url}")
    
    # Initialize Vapi client
    vapi_client = vapi.Vapi(api_key=api_key)
    
    try:
        # Create assistant
        print("🤖 Creating Vapi Assistant...")
        assistant = await vapi_client.assistant.create(
            name="Emergency Dispatch Assistant",
            model={
                "provider": "openai",
                "model": "gpt-4o",
                "temperature": 0.7,
                "system_prompt": """You are an emergency dispatcher conducting an intake call. Your role is to:

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

Be concise but thorough. Ask one question at a time and wait for responses."""
            },
            voice={
                "provider": "openai",
                "voice_id": "shimmer"
            },
            first_sentence="Hello, this is emergency dispatch. What is your emergency?",
            server_url=f"{webhook_base_url}/api/v1/vapi/handler",
            transcription_url=f"{webhook_base_url}/api/v1/vapi/transcripts",
            end_call_function_enabled=True,
            recording_enabled=True
        )
        
        print(f"✅ Assistant created successfully!")
        print(f"Assistant ID: {assistant.id}")
        print(f"Name: {assistant.name}")
        
        # Update .env file with assistant ID
        with open(".env", "a") as f:
            f.write(f"\nVAPI_ASSISTANT_ID={assistant.id}\n")
        
        print(f"💾 Assistant ID saved to .env file")
        
        return assistant.id
        
    except Exception as e:
        print(f"❌ Error creating assistant: {e}")
        return None

async def list_phone_numbers():
    """List available phone numbers"""
    try:
        import vapi
    except ImportError:
        print("❌ Vapi Python SDK not installed")
        return
    
    api_key = os.getenv("VAPI_API_KEY")
    if not api_key:
        print("❌ VAPI_API_KEY not found")
        return
    
    vapi_client = vapi.Vapi(api_key=api_key)
    
    try:
        print("📞 Available phone numbers:")
        phone_numbers = await vapi_client.phone.list()
        
        if not phone_numbers:
            print("No phone numbers found. You need to purchase one in the Vapi dashboard.")
            return
        
        for i, phone in enumerate(phone_numbers):
            print(f"{i+1}. {phone.number} (ID: {phone.id})")
        
        return phone_numbers
        
    except Exception as e:
        print(f"❌ Error listing phone numbers: {e}")
        return None

async def main():
    """Main setup function"""
    print("🚀 Vapi Setup for Emergency Dispatch System")
    print("=" * 50)
    
    # Check if API key is configured
    api_key = os.getenv("VAPI_API_KEY")
    if not api_key or api_key == "your_vapi_api_key_here":
        print("❌ Please set your VAPI_API_KEY in the .env file")
        print("Get your API key from: https://vapi.ai")
        return
    
    print("📋 Setup Options:")
    print("1. Create Assistant")
    print("2. List Phone Numbers")
    print("3. Both")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice in ["1", "3"]:
        assistant_id = await setup_vapi_assistant()
        if assistant_id:
            print(f"\n✅ Assistant setup complete!")
            print(f"Assistant ID: {assistant_id}")
    
    if choice in ["2", "3"]:
        phone_numbers = await list_phone_numbers()
        if phone_numbers:
            print(f"\n📞 Phone numbers available for use")
    
    print("\n📚 Next Steps:")
    print("1. If you have a phone number, update VAPI_PHONE_NUMBER_ID in .env")
    print("2. Test the integration with: python test_vapi_integration.py")
    print("3. Make a test call using the call initiation API")

if __name__ == "__main__":
    asyncio.run(main())
