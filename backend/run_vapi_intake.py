#!/usr/bin/env python3
"""
Vapi Conversational Intake Agent Runner Script
Starts only the Vapi Conversational Intake Agent
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class VapiIntakeRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/vapi_conversational_intake.py"
    
    def start_vapi_intake(self):
        """Start the Vapi Conversational Intake agent"""
        try:
            print("🚀 Starting Vapi Conversational Intake Agent...")
            print("=" * 60)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Vapi intake agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Vapi Intake Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print(f"🌐 Endpoint: http://localhost:8001")
            print("=" * 60)
            print("📋 Vapi Intake Agent Logs:")
            print("-" * 60)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Vapi Intake Agent: {e}")
            return False
    
    def stop_vapi_intake(self):
        """Stop the Vapi Intake agent"""
        if self.process:
            print("\n🛑 Stopping Vapi Intake Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Vapi Intake Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Vapi Intake Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Vapi Intake Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Vapi Intake Agent...")
            self.stop_vapi_intake()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_vapi_intake():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_vapi_intake()
        except Exception as e:
            print(f"❌ Error running Vapi Intake Agent: {e}")
            self.stop_vapi_intake()
            sys.exit(1)

def main():
    print("🤖 Vapi Conversational Intake Agent Runner")
    print("=" * 60)
    print("This script starts only the Vapi Conversational Intake Agent")
    print("Handles emergency calls and processes incident data")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    runner = VapiIntakeRunner()
    runner.run()

if __name__ == "__main__":
    main()
