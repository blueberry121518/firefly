#!/usr/bin/env python3
"""
Police Unit Agent Runner Script
Starts only the Police Unit Agent for law enforcement dispatch
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class PoliceUnitRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/unit_police.py"
    
    def start_police_unit(self):
        """Start the Police Unit agent"""
        try:
            print("🚀 Starting Police Unit Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Police Unit agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Police Unit Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Police Unit Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Police Unit Agent: {e}")
            return False
    
    def stop_police_unit(self):
        """Stop the Police Unit agent"""
        if self.process:
            print("\n🛑 Stopping Police Unit Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Police Unit Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Police Unit Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Police Unit Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Police Unit Agent...")
            self.stop_police_unit()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_police_unit():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_police_unit()
        except Exception as e:
            print(f"❌ Error running Police Unit Agent: {e}")
            self.stop_police_unit()
            sys.exit(1)

def main():
    print("🤖 Police Unit Agent Runner")
    print("=" * 50)
    print("This script starts only the Police Unit Agent")
    print("Handles law enforcement dispatch and patrol operations")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = PoliceUnitRunner()
    runner.run()

if __name__ == "__main__":
    main()
