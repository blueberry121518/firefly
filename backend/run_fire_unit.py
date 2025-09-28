#!/usr/bin/env python3
"""
Fire Unit Agent Runner Script
Starts only the Fire Unit Agent for fire department dispatch
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class FireUnitRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/unit_fire.py"
    
    def start_fire_unit(self):
        """Start the Fire Unit agent"""
        try:
            print("🚀 Starting Fire Unit Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Fire Unit agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Fire Unit Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Fire Unit Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Fire Unit Agent: {e}")
            return False
    
    def stop_fire_unit(self):
        """Stop the Fire Unit agent"""
        if self.process:
            print("\n🛑 Stopping Fire Unit Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Fire Unit Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Fire Unit Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Fire Unit Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Fire Unit Agent...")
            self.stop_fire_unit()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_fire_unit():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_fire_unit()
        except Exception as e:
            print(f"❌ Error running Fire Unit Agent: {e}")
            self.stop_fire_unit()
            sys.exit(1)

def main():
    print("🤖 Fire Unit Agent Runner")
    print("=" * 50)
    print("This script starts only the Fire Unit Agent")
    print("Handles fire department dispatch and emergency response")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = FireUnitRunner()
    runner.run()

if __name__ == "__main__":
    main()
