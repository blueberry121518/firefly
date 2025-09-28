#!/usr/bin/env python3
"""
Ngrok Setup Script for Twilio Webhooks
Exposes local server to the internet for Twilio webhook testing
"""

import subprocess
import sys
import time
import requests
import json
from pathlib import Path

def check_ngrok_installed():
    """Check if ngrok is installed"""
    try:
        result = subprocess.run(['ngrok', 'version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ngrok is installed")
            return True
        else:
            print("❌ Ngrok is not installed")
            return False
    except FileNotFoundError:
        print("❌ Ngrok is not installed")
        return False

def install_ngrok():
    """Install ngrok using brew (macOS)"""
    try:
        print("📦 Installing ngrok...")
        result = subprocess.run(['brew', 'install', 'ngrok/ngrok/ngrok'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ngrok installed successfully")
            return True
        else:
            print(f"❌ Failed to install ngrok: {result.stderr}")
            return False
    except FileNotFoundError:
        print("❌ Homebrew not found. Please install ngrok manually from https://ngrok.com/")
        return False

def start_ngrok_tunnel(port=8000):
    """Start ngrok tunnel for the specified port"""
    try:
        print(f"🚇 Starting ngrok tunnel on port {port}...")
        
        # Start ngrok in background
        process = subprocess.Popen(
            ['ngrok', 'http', str(port), '--log=stdout'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for ngrok to start
        time.sleep(3)
        
        # Get the public URL
        try:
            response = requests.get('http://localhost:4040/api/tunnels')
            if response.status_code == 200:
                tunnels = response.json()
                if tunnels['tunnels']:
                    public_url = tunnels['tunnels'][0]['public_url']
                    print(f"✅ Ngrok tunnel started: {public_url}")
                    return public_url, process
                else:
                    print("❌ No tunnels found")
                    return None, process
            else:
                print("❌ Failed to get tunnel info")
                return None, process
        except Exception as e:
            print(f"❌ Error getting tunnel URL: {e}")
            return None, process
            
    except Exception as e:
        print(f"❌ Error starting ngrok: {e}")
        return None, None

def update_env_file(public_url):
    """Update .env file with the ngrok URL"""
    try:
        env_file = Path(".env")
        if not env_file.exists():
            print("❌ .env file not found")
            return False
        
        # Read current .env file
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Update or add TWILIO_WEBHOOK_BASE_URL
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('TWILIO_WEBHOOK_BASE_URL='):
                lines[i] = f'TWILIO_WEBHOOK_BASE_URL={public_url}\n'
                updated = True
                break
        
        if not updated:
            lines.append(f'TWILIO_WEBHOOK_BASE_URL={public_url}\n')
        
        # Write updated .env file
        with open(env_file, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Updated .env file with webhook URL: {public_url}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating .env file: {e}")
        return False

def setup_twilio_webhook(public_url):
    """Set up Twilio webhook URL"""
    print("\n📞 Twilio Webhook Setup Instructions:")
    print("=" * 50)
    print(f"1. Go to your Twilio Console: https://console.twilio.com/")
    print(f"2. Navigate to Phone Numbers > Manage > Active numbers")
    print(f"3. Click on your Twilio phone number")
    print(f"4. Set the webhook URL to: {public_url}/api/v1/twilio/incoming-call")
    print(f"5. Set HTTP method to: POST")
    print(f"6. Save the configuration")
    print("=" * 50)
    print("\n🎯 Your webhook endpoints:")
    print(f"   • Incoming calls: {public_url}/api/v1/twilio/incoming-call")
    print(f"   • Media stream: {public_url}/api/v1/twilio/media-stream/{{call_sid}}")
    print(f"   • Conversation feed: {public_url}/api/v1/twilio/conversation-feed")

def main():
    """Main setup function"""
    print("🚀 Setting up Ngrok for Twilio Webhooks")
    print("=" * 40)
    
    # Check if ngrok is installed
    if not check_ngrok_installed():
        if not install_ngrok():
            print("❌ Please install ngrok manually and try again")
            return False
    
    # Start ngrok tunnel
    public_url, process = start_ngrok_tunnel(8000)
    if not public_url:
        print("❌ Failed to start ngrok tunnel")
        return False
    
    # Update .env file
    if not update_env_file(public_url):
        print("❌ Failed to update .env file")
        return False
    
    # Show Twilio setup instructions
    setup_twilio_webhook(public_url)
    
    print("\n✅ Setup complete!")
    print("🔄 Keep this script running to maintain the tunnel")
    print("🛑 Press Ctrl+C to stop")
    
    try:
        # Keep the script running
        process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping ngrok tunnel...")
        process.terminate()
        print("✅ Tunnel stopped")
    
    return True

if __name__ == "__main__":
    main()
