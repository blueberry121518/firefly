#!/usr/bin/env python3
"""
Comms Agent Runner Script
Starts only the Comms Agent for logging and notifications
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class CommsAgentRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/comms_agent.py"
    
    def start_comms_agent(self):
        """Start the Comms agent"""
        try:
            print("🚀 Starting Comms Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Comms agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Comms Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Comms Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Comms Agent: {e}")
            return False
    
    def stop_comms_agent(self):
        """Stop the Comms agent"""
        if self.process:
            print("\n🛑 Stopping Comms Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Comms Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Comms Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Comms Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Comms Agent...")
            self.stop_comms_agent()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_comms_agent():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_comms_agent()
        except Exception as e:
            print(f"❌ Error running Comms Agent: {e}")
            self.stop_comms_agent()
            sys.exit(1)

def main():
    print("🤖 Comms Agent Runner")
    print("=" * 50)
    print("This script starts only the Comms Agent")
    print("Handles logging to Supabase and SMS notifications")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = CommsAgentRunner()
    runner.run()

if __name__ == "__main__":
    main()
