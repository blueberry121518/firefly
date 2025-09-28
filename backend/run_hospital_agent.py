#!/usr/bin/env python3
"""
Hospital Agent Runner Script
Starts only the Hospital Agent for medical facility management
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class HospitalAgentRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/hospital.py"
    
    def start_hospital_agent(self):
        """Start the Hospital agent"""
        try:
            print("🚀 Starting Hospital Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Hospital agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Hospital Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Hospital Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Hospital Agent: {e}")
            return False
    
    def stop_hospital_agent(self):
        """Stop the Hospital agent"""
        if self.process:
            print("\n🛑 Stopping Hospital Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Hospital Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Hospital Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Hospital Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Hospital Agent...")
            self.stop_hospital_agent()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_hospital_agent():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_hospital_agent()
        except Exception as e:
            print(f"❌ Error running Hospital Agent: {e}")
            self.stop_hospital_agent()
            sys.exit(1)

def main():
    print("🤖 Hospital Agent Runner")
    print("=" * 50)
    print("This script starts only the Hospital Agent")
    print("Manages hospital capacity and patient transport")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = HospitalAgentRunner()
    runner.run()

if __name__ == "__main__":
    main()
