#!/usr/bin/env python3
"""
Agent Starter Script
Starts all agents for the Emergency Dispatch System
"""

import subprocess
import sys
import time
import signal
from pathlib import Path

class AgentManager:
    def __init__(self):
        self.processes = []
        self.agent_scripts = [
            "agents/conversational_intake.py",
            "agents/router_agent.py",
            "agents/hospital.py",
            "agents/unit_fire.py",
            "agents/unit_police.py",
            "agents/unit_ems.py"
        ]
    
    def start_agent(self, script_path):
        """Start a single agent"""
        try:
            print(f"🚀 Starting {script_path}...")
            process = subprocess.Popen(
                [sys.executable, script_path],
                cwd=Path(__file__).parent,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            self.processes.append((script_path, process))
            print(f"✅ {script_path} started (PID: {process.pid})")
            return True
        except Exception as e:
            print(f"❌ Failed to start {script_path}: {e}")
            return False
    
    def start_all_agents(self):
        """Start all agents"""
        print("🤖 Starting all agents...")
        print("=" * 50)
        
        success_count = 0
        for script in self.agent_scripts:
            if self.start_agent(script):
                success_count += 1
            time.sleep(1)  # Small delay between starts
        
        print("=" * 50)
        print(f"✅ Started {success_count}/{len(self.agent_scripts)} agents successfully")
        
        if success_count > 0:
            print("\n📋 Agent Status:")
            for script, process in self.processes:
                status = "🟢 Running" if process.poll() is None else "🔴 Stopped"
                print(f"  {script}: {status} (PID: {process.pid})")
        
        return success_count > 0
    
    def cleanup(self):
        """Stop all agents"""
        print("\n🛑 Stopping all agents...")
        for script, process in self.processes:
            if process.poll() is None:  # Process is still running
                print(f"🛑 Stopping {script}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        print("✅ All agents stopped")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print(f"\n🛑 Received signal {signum}, stopping agents...")
        self.cleanup()
        sys.exit(0)
    
    def run(self):
        """Main run loop"""
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            if self.start_all_agents():
                print("\n🎉 All agents started successfully!")
                print("Press Ctrl+C to stop all agents")
                print("=" * 50)
                
                # Keep running and monitor agents
                while True:
                    time.sleep(5)
                    
                    # Check if any agents stopped
                    stopped_agents = []
                    for script, process in self.processes:
                        if process.poll() is not None:
                            stopped_agents.append(script)
                    
                    if stopped_agents:
                        print(f"⚠️  Some agents stopped: {stopped_agents}")
                        print("Press Ctrl+C to stop remaining agents")
            else:
                print("❌ Failed to start agents")
                return False
                
        except KeyboardInterrupt:
            print("\n🛑 Shutdown requested by user")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
        finally:
            self.cleanup()
        
        return True

def main():
    """Main entry point"""
    manager = AgentManager()
    manager.run()

if __name__ == "__main__":
    main()
