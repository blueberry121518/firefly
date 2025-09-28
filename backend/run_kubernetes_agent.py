#!/usr/bin/env python3
"""
Kubernetes Agent Runner Script
Starts only the Kubernetes Agent for auto-scaling
"""

import subprocess
import sys
import time
import signal
import os
from pathlib import Path

class KubernetesAgentRunner:
    def __init__(self):
        self.process = None
        self.script_path = "agents/kubernetes.py"
    
    def start_kubernetes_agent(self):
        """Start the Kubernetes agent"""
        try:
            print("🚀 Starting Kubernetes Agent...")
            print("=" * 50)
            
            # Change to backend directory
            backend_dir = Path(__file__).parent
            os.chdir(backend_dir)
            
            # Start the Kubernetes agent
            self.process = subprocess.Popen(
                [sys.executable, self.script_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            print(f"✅ Kubernetes Agent started (PID: {self.process.pid})")
            print(f"📁 Working directory: {backend_dir}")
            print(f"🔧 Script: {self.script_path}")
            print("=" * 50)
            print("📋 Kubernetes Agent Logs:")
            print("-" * 50)
            
            # Stream output in real-time
            for line in iter(self.process.stdout.readline, ''):
                if line:
                    print(line.rstrip())
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to start Kubernetes Agent: {e}")
            return False
    
    def stop_kubernetes_agent(self):
        """Stop the Kubernetes agent"""
        if self.process:
            print("\n🛑 Stopping Kubernetes Agent...")
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
                print("✅ Kubernetes Agent stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Force killing Kubernetes Agent...")
                self.process.kill()
                self.process.wait()
                print("✅ Kubernetes Agent force stopped")
    
    def run(self):
        """Main run method with signal handling"""
        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, stopping Kubernetes Agent...")
            self.stop_kubernetes_agent()
            sys.exit(0)
        
        # Register signal handlers
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        try:
            if self.start_kubernetes_agent():
                # Wait for process to complete
                self.process.wait()
            else:
                sys.exit(1)
        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            self.stop_kubernetes_agent()
        except Exception as e:
            print(f"❌ Error running Kubernetes Agent: {e}")
            self.stop_kubernetes_agent()
            sys.exit(1)

def main():
    print("🤖 Kubernetes Agent Runner")
    print("=" * 50)
    print("This script starts only the Kubernetes Agent")
    print("Handles auto-scaling of agent deployments based on demand")
    print("Press Ctrl+C to stop")
    print("=" * 50)
    
    runner = KubernetesAgentRunner()
    runner.run()

if __name__ == "__main__":
    main()
