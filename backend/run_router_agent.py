#!/usr/bin/env python3
"""
Router Agent Runner Script
Starts only the Router Agent for the Emergency Dispatch System
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class RouterAgentRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/router_agent.py"
    
    def start_router_agent(self):
        """Start the router agent"""
        try:
            print("🚀 Starting Router Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the router agent (it's a regular Python script, not uAgent)
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Router Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Router Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Router Agent: {e}")
            return False
    
    def stop_router_agent(self):
        """Stop the router agent"""
        if self.process:
            print("\n🛑 Stopping Router Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Router Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Router Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Router Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Router Agent...")
            self.stop_router_agent()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_router_agent():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_router_agent()
        except Exception as e:
            print(f"❌ Error running Router Agent: {e}")
            self.stop_router_agent()
            sys.exit(1)

def main():
    print("🤖 Router Agent Runner")
    print("=" * 50)
    print("This script starts only the Router Agent")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = RouterAgentRunner()
    runner.run()

if __name__ == "__main__":
    main()
