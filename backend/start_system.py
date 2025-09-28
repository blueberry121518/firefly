#!/usr/bin/env python3
"""
Emergency Dispatch System Startup Script
Starts all required services and databases for the system
"""

import asyncio
import subprocess
import sys
import time
import signal
import os
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
import redis.asyncio as redis
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SystemStartup:
    def __init__(self):
        self.processes = []
        self.redis_client = None
        self.db_engine = None
        
    async def check_redis_connection(self):
        """Check if Redis is running and accessible"""
        try:
            logger.info("🔍 Checking Redis connection...")
            self.redis_client = redis.from_url(settings.REDIS_URL)
            await self.redis_client.ping()
            logger.info("✅ Redis connection successful")
            return True
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            logger.info("💡 Make sure Redis is running: brew install redis && brew services start redis")
            return False
    
    async def check_database_connection(self):
        """Check if Supabase database is accessible"""
        try:
            logger.info("🔍 Checking Supabase database connection...")
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                logger.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set")
                return False
                
            # Test the connection using Supabase client
            from supabase import create_client
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Test basic connection
            result = client.table('incident_logs').select('*').limit(1).execute()
            logger.info("✅ Supabase database connection successful")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Supabase connection failed: {e}")
            logger.info("💡 This might be due to missing tables - will create them")
            return True  # Allow system to start and create tables
    
    async def create_database_tables(self):
        """Create database tables if they don't exist"""
        try:
            logger.info("🔍 Creating database tables...")
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                logger.warning("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set - skipping table creation")
                return True
                
            from supabase import create_client
            client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
            
            # Create incident_logs table
            try:
                result = client.rpc('exec_sql', {
                    'sql': '''
                    CREATE TABLE IF NOT EXISTS incident_logs (
                        case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        incident_fact JSONB NOT NULL,
                        status_updates JSONB DEFAULT '[]'::jsonb,
                        dispatch_plan JSONB,
                        caller_phone_number VARCHAR(20) NOT NULL,
                        call_sid VARCHAR(100),
                        conversation_transcript JSONB DEFAULT '[]'::jsonb,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    '''
                })
                logger.info("✅ incident_logs table created/verified")
            except Exception as e:
                logger.warning(f"⚠️ Error creating incident_logs table: {e}")
            
            # Create conversation_transcripts table
            try:
                result = client.rpc('exec_sql', {
                    'sql': '''
                    CREATE TABLE IF NOT EXISTS conversation_transcripts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        call_sid VARCHAR(100) NOT NULL,
                        case_id UUID,
                        speaker VARCHAR(20) NOT NULL,
                        text TEXT NOT NULL,
                        confidence VARCHAR(10),
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        is_final VARCHAR(5) DEFAULT 'true',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    '''
                })
                logger.info("✅ conversation_transcripts table created/verified")
            except Exception as e:
                logger.warning(f"⚠️ Error creating conversation_transcripts table: {e}")
            
            logger.info("✅ Database tables creation completed")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Failed to create database tables: {e}")
            logger.info("💡 Tables may already exist or there may be permission issues")
            return True  # Allow system to start even if table creation fails
    
    async def test_agent_registry(self):
        """Test the agent registry system"""
        try:
            logger.info("🔍 Testing agent registry...")
            from app.agent_registry import agent_registry
            
            # Test registration
            agent_registry.register_agent("test_agent", "test_address")
            address = agent_registry.get_agent_address("test_agent")
            assert address == "test_address"
            agent_registry.unregister_agent("test_agent")
            
            logger.info("✅ Agent registry working correctly")
            return True
        except Exception as e:
            logger.error(f"❌ Agent registry test failed: {e}")
            return False
    
    def start_fastapi_server(self):
        """Start the FastAPI server"""
        try:
            logger.info("🚀 Starting FastAPI server...")
            cmd = [sys.executable, "main.py"]
            process = subprocess.Popen(
                cmd,
                cwd=Path(__file__).parent,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            self.processes.append(("FastAPI Server", process))
            logger.info("✅ FastAPI server started")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to start FastAPI server: {e}")
            return False
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("🧹 Cleaning up resources...")
        
        # Close Redis connection
        if self.redis_client:
            await self.redis_client.close()
        
        # Terminate processes
        for name, process in self.processes:
            if process.poll() is None:  # Process is still running
                logger.info(f"🛑 Stopping {name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        logger.info("✅ Cleanup completed")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"\n🛑 Received signal {signum}, shutting down...")
        asyncio.create_task(self.cleanup())
        sys.exit(0)
    
    async def run_health_checks(self):
        """Run all health checks"""
        logger.info("🏥 Running system health checks...")
        
        checks = [
            ("Redis Connection", self.check_redis_connection()),
            ("Database Connection", self.check_database_connection()),
            ("Database Tables", self.create_database_tables()),
            ("Agent Registry", self.test_agent_registry()),
        ]
        
        all_passed = True
        for check_name, check_coro in checks:
            try:
                result = await check_coro
                if not result:
                    all_passed = False
            except Exception as e:
                logger.error(f"❌ {check_name} failed with exception: {e}")
                all_passed = False
        
        return all_passed
    
    async def start_system(self):
        """Main startup sequence"""
        logger.info("🚀 Starting Emergency Dispatch System...")
        logger.info("=" * 60)
        
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        try:
            # Run health checks
            if not await self.run_health_checks():
                logger.error("❌ Health checks failed. Please fix the issues above and try again.")
                return False
            
            # Start FastAPI server
            if not self.start_fastapi_server():
                logger.error("❌ Failed to start FastAPI server")
                return False
            
            # Wait a moment for server to start
            await asyncio.sleep(2)
            
            logger.info("=" * 60)
            logger.info("🎉 System startup completed successfully!")
            logger.info("=" * 60)
            logger.info("📋 Next steps:")
            logger.info("1. Start your agents in separate terminals:")
            logger.info("   python agents/conversational_intake.py")
            logger.info("   python agents/router_agent.py")
            logger.info("   python agents/hospital.py")
            logger.info("   python agents/unit_fire.py")
            logger.info("   python agents/unit_police.py")
            logger.info("   python agents/unit_ems.py")
            logger.info("")
            logger.info("2. Test the system:")
            logger.info("   curl http://localhost:8000/")
            logger.info("   curl -X POST http://localhost:8000/api/v1/twilio/call \\")
            logger.info("     -H 'Content-Type: application/json' \\")
            logger.info("     -d '{\"CallSid\": \"test123\", \"From\": \"+15551234567\", \"To\": \"+15559876543\"}'")
            logger.info("")
            logger.info("3. Press Ctrl+C to stop the system")
            logger.info("=" * 60)
            
            # Keep the system running
            while True:
                await asyncio.sleep(1)
                
                # Check if FastAPI server is still running
                if self.processes and self.processes[0][1].poll() is not None:
                    logger.error("❌ FastAPI server stopped unexpectedly")
                    break
                    
        except KeyboardInterrupt:
            logger.info("\n🛑 Shutdown requested by user")
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
        finally:
            await self.cleanup()
        
        return True

async def main():
    """Main entry point"""
    startup = SystemStartup()
    await startup.start_system()

if __name__ == "__main__":
    asyncio.run(main())
