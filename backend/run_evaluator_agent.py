#!/usr/bin/env python3
"""
Evaluator Agent Runner Script
Starts only the Evaluator Agent for intelligence and learning
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class EvaluatorAgentRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/evaluator_agent.py"
    
    def start_evaluator_agent(self):
        """Start the Evaluator agent"""
        try:
            print("🚀 Starting Evaluator Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Evaluator agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Evaluator Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Evaluator Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Evaluator Agent: {e}")
            return False
    
    def stop_evaluator_agent(self):
        """Stop the Evaluator agent"""
        if self.process:
            print("\n🛑 Stopping Evaluator Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Evaluator Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Evaluator Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Evaluator Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Evaluator Agent...")
            self.stop_evaluator_agent()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_evaluator_agent():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_evaluator_agent()
        except Exception as e:
            print(f"❌ Error running Evaluator Agent: {e}")
            self.stop_evaluator_agent()
            sys.exit(1)

def main():
    print("🤖 Evaluator Agent Runner")
    print("=" * 50)
    print("This script starts only the Evaluator Agent")
    print("Handles intelligence gathering and learning from incidents")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = EvaluatorAgentRunner()
    runner.run()

if __name__ == "__main__":
    main()
