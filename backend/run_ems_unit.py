#!/usr/bin/env python3
"""
EMS Unit Agent Runner Script
Starts only the EMS Unit Agent for emergency medical services dispatch
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class EMSUnitRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/unit_ems.py"
    
    def start_ems_unit(self):
        """Start the EMS Unit agent"""
        try:
            print("🚀 Starting EMS Unit Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the EMS Unit agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ EMS Unit Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 EMS Unit Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start EMS Unit Agent: {e}")
            return False
    
    def stop_ems_unit(self):
        """Stop the EMS Unit agent"""
        if self.process:
            print("\n🛑 Stopping EMS Unit Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ EMS Unit Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing EMS Unit Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ EMS Unit Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping EMS Unit Agent...")
            self.stop_ems_unit()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_ems_unit():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_ems_unit()
        except Exception as e:
            print(f"❌ Error running EMS Unit Agent: {e}")
            self.stop_ems_unit()
            sys.exit(1)

def main():
    print("🤖 EMS Unit Agent Runner")
    print("=" * 50)
    print("This script starts only the EMS Unit Agent")
    print("Handles emergency medical services dispatch and patient transport")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = EMSUnitRunner()
    runner.run()

if __name__ == "__main__":
    main()
