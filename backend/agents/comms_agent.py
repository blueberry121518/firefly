"""
Comms Agent for Emergency Dispatch System

This agent listens for dispatch logs on Redis pub/sub and handles:
1. Logging to Supabase (PostgreSQL) database
2. Sending notifications to callers via Vapi
3. Managing communication workflows
"""

import asyncio
import json
import logging
import redis
import sys
import os
from typing import Dict, Any, Optional
from datetime import datetime
import httpx

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from uagents import Agent, Context, Model
from app.core.config import settings
from services.vapi_service import vapi_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Message models for uAgent communication
class LogMessage(Model):
    """Message containing log data to be processed"""
    timestamp: str
    action: str
    case_id: str
    details: dict
    incident_data: dict

class NotificationRequest(Model):
    """Request to send a notification to a caller"""
    case_id: str
    callback_number: str
    message: str
    notification_type: str

class LogProcessed(Model):
    """Confirmation that a log has been processed"""
    case_id: str
    action: str
    status: str
    timestamp: str

class NotificationSent(Model):
    """Confirmation that a notification has been sent"""
    case_id: str
    callback_number: str
    status: str
    timestamp: str

# Create the comms agent
comms_agent = Agent(
    name="comms_agent",
    seed=settings.AGENT_IDENTITY_KEY or "comms-agent-seed-key",
    port=8003,
    endpoint=f"http://localhost:8003/submit",
)

class CommsAgent:
    """Handles communications and logging for the dispatch system"""
    
    def __init__(self, redis_url: str = None, supabase_url: str = None, supabase_key: str = None):
        """Initialize Comms Agent"""
        self.redis_url = redis_url or settings.REDIS_URL
        self.supabase_url = supabase_url or settings.SUPABASE_URL
        self.supabase_key = supabase_key or settings.SUPABASE_SERVICE_ROLE_KEY
        
        self.redis_client = None
        self.pubsub = None
        self.running = False
        
        # Redis channels
        self.log_channel = "log_queue"
        
        # Supabase configuration
        self.supabase_headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }
    
    async def connect(self):
        """Establish Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            self.pubsub = self.redis_client.pubsub()
            
            # Test connection
            await asyncio.get_event_loop().run_in_executor(None, self.redis_client.ping)
            logger.info("✅ Comms Agent connected to Redis")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    async def log_to_supabase(self, log_data: Dict[str, Any]) -> bool:
        """Log an entry to Supabase database"""
        try:
            if not self.supabase_url or not self.supabase_key:
                logger.warning("⚠️ Supabase not configured - logging to console only")
                logger.info(f"📝 [MOCK LOG] {log_data}")
                return True
            
            # Prepare log entry for database
            log_entry = {
                "timestamp": log_data.get('timestamp', datetime.utcnow().isoformat()),
                "action": log_data.get('action', 'unknown'),
                "case_id": log_data.get('case_id'),
                "unit_id": log_data.get('unit_id'),
                "unit_type": log_data.get('unit_type'),
                "distance_km": log_data.get('distance_km'),
                "incident_location": log_data.get('incident_location'),
                "unit_location": json.dumps(log_data.get('unit_location', [])),
                "incident_data": json.dumps(log_data.get('incident_data', {})),
                "error": log_data.get('error'),
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Insert into Supabase (assumes a table public.incident_logs exists via PostgREST)
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.supabase_url}/rest/v1/incident_logs",
                    headers=self.supabase_headers,
                    json=log_entry,
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    logger.info(f"✅ Logged to Supabase: {log_data.get('action', 'unknown')}")
                    return True
                else:
                    logger.error(f"❌ Supabase log failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"❌ Error logging to Supabase: {e}")
            return False
    
    async def should_send_notification(self, log_data: Dict[str, Any]) -> bool:
        """Determine if a notification should be sent based on the log"""
        action = log_data.get('action', '')
        
        # Send notifications for these actions
        notification_actions = [
            'unit_dispatched',
            'unit_on_scene',
            'unit_completed',
            'dispatch_failed'
        ]
        
        return action in notification_actions
    
    async def send_notification(self, log_data: Dict[str, Any]) -> bool:
        """Send appropriate notification based on log data"""
        try:
            action = log_data.get('action', '')
            incident_data = log_data.get('incident_data', {})
            incident_fact = incident_data.get('incident_fact', {})
            callback_number = incident_fact.get('callback_number', '')
            
            if not callback_number:
                logger.warning("⚠️ No callback number available for notification")
                return False
            
            unit_info = {
                'unit_id': log_data.get('unit_id', 'Unknown'),
                'type': log_data.get('unit_type', 'Emergency Unit'),
                'distance_km': log_data.get('distance_km', 0)
            }
            
            if action == 'unit_dispatched':
                # Send dispatch notification
                result = await vapi_service.send_dispatch_notification(
                    callback_number,
                    unit_info,
                    incident_fact
                )
                
            elif action in ['unit_on_scene', 'unit_completed']:
                # Send status update
                status = 'on_scene' if action == 'unit_on_scene' else 'completed'
                result = await vapi_service.send_status_update(
                    callback_number,
                    status,
                    unit_info
                )
                
            elif action == 'dispatch_failed':
                # Send failure notification
                message = (
                    f"We apologize, but we were unable to dispatch a unit to your "
                    f"{incident_fact.get('emergency_type', 'emergency')} at "
                    f"{incident_fact.get('location', 'your location')}. "
                    f"Please call back if you need immediate assistance."
                )
                
                result = await vapi_service.send_update(
                    callback_number,
                    message,
                    "call"
                )
                
            else:
                logger.info(f"ℹ️ No notification needed for action: {action}")
                return True
            
            if result.get('success'):
                logger.info(f"✅ Notification sent successfully for action: {action}")
                return True
            else:
                logger.error(f"❌ Notification failed for action: {action}: {result.get('error', 'Unknown error')}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending notification: {e}")
            return False
    
    async def process_log(self, log_data: Dict[str, Any]) -> None:
        """Process a log entry from the log queue"""
        try:
            logger.info(f"📝 Processing log: {log_data.get('action', 'unknown')}")
            
            # Log to Supabase
            log_success = await self.log_to_supabase(log_data)
            
            if not log_success:
                logger.warning("⚠️ Failed to log to Supabase, but continuing...")
            
            # Check if notification should be sent
            if await self.should_send_notification(log_data):
                # Send notification
                notification_success = await self.send_notification(log_data)
                
                if notification_success:
                    logger.info("✅ Notification sent successfully")
                else:
                    logger.warning("⚠️ Notification failed, but continuing...")
            else:
                logger.info("ℹ️ No notification needed for this log entry")
                
        except Exception as e:
            logger.error(f"❌ Error processing log: {e}")
    
    async def listen_for_logs(self) -> None:
        """Listen for log entries on Redis pub/sub"""
        try:
            # Subscribe to log queue
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.pubsub.subscribe(self.log_channel)
            )
            
            logger.info(f"👂 Listening for logs on channel: {self.log_channel}")
            
            # Listen for messages
            while self.running:
                try:
                    message = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.pubsub.get_message(timeout=1.0)
                    )
                    
                    if message and message['type'] == 'message':
                        try:
                            # Parse log data
                            log_data = json.loads(message['data'])
                            logger.info("📨 Received new log entry")
                            
                            # Process the log
                            await self.process_log(log_data)
                            
                        except json.JSONDecodeError as e:
                            logger.error(f"❌ Invalid JSON in log message: {e}")
                        except Exception as e:
                            logger.error(f"❌ Error processing log message: {e}")
                
                except redis.TimeoutError:
                    # No message received, continue listening
                    continue
                except Exception as e:
                    logger.error(f"❌ Error in message loop: {e}")
                    await asyncio.sleep(1)  # Brief pause before retrying
            
        except Exception as e:
            logger.error(f"❌ Error in log listener: {e}")
            raise
    
    async def start(self) -> None:
        """Start the Comms Agent"""
        try:
            logger.info("🚀 Starting Comms Agent...")
            
            # Connect to Redis
            await self.connect()
            
            # Set running flag
            self.running = True
            
            # Start listening for logs
            await self.listen_for_logs()
            
        except KeyboardInterrupt:
            logger.info("🛑 Comms Agent stopped by user")
        except Exception as e:
            logger.error(f"❌ Comms Agent error: {e}")
            raise
        finally:
            await self.stop()
    
    async def stop(self) -> None:
        """Stop the Comms Agent"""
        logger.info("🛑 Stopping Comms Agent...")
        self.running = False
        
        if self.pubsub:
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.pubsub.unsubscribe(self.log_channel)
            )
        
        if self.redis_client:
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.redis_client.close
            )
        
        logger.info("✅ Comms Agent stopped")

# Global comms instance
comms_instance = CommsAgent()

@comms_agent.on_message(LogMessage)
async def handle_log_message(ctx: Context, sender: str, msg: LogMessage):
    """Handle a log message from other agents"""
    try:
        logger.info(f"📝 Processing log for case {msg.case_id} from {sender}")
        
        # Process the log
        await comms_instance.process_log({
            'timestamp': msg.timestamp,
            'action': msg.action,
            'case_id': msg.case_id,
            'details': msg.details,
            'incident_data': msg.incident_data
        })
        
        # Send confirmation
        await ctx.send(sender, LogProcessed(
            case_id=msg.case_id,
            action=msg.action,
            status="processed",
            timestamp=datetime.now().isoformat()
        ))
        
    except Exception as e:
        logger.error(f"❌ Error processing log for case {msg.case_id}: {e}")

@comms_agent.on_message(NotificationRequest)
async def handle_notification_request(ctx: Context, sender: str, msg: NotificationRequest):
    """Handle a notification request"""
    try:
        logger.info(f"📱 Sending notification for case {msg.case_id} to {msg.callback_number}")
        
        # Send notification
        success = await comms_instance.send_notification(
            msg.callback_number,
            msg.message,
            msg.notification_type
        )
        
        # Send confirmation
        await ctx.send(sender, NotificationSent(
            case_id=msg.case_id,
            callback_number=msg.callback_number,
            status="sent" if success else "failed",
            timestamp=datetime.now().isoformat()
        ))
        
    except Exception as e:
        logger.error(f"❌ Error sending notification for case {msg.case_id}: {e}")

@comms_agent.on_event("startup")
async def startup(ctx: Context):
    """Agent startup handler"""
    logger.info("🚀 Starting Comms Agent")
    
    # Initialize Redis connection
    try:
        await comms_instance.connect()
        logger.info("✅ Comms Agent connected to Redis")
    except Exception as e:
        logger.error(f"❌ Comms Agent Redis connection failed: {e}")

@comms_agent.on_event("shutdown")
async def shutdown(ctx: Context):
    """Agent shutdown handler"""
    logger.info("🛑 Shutting down Comms Agent")
    
    # Close Redis connection
    if comms_instance.redis_client:
        await asyncio.get_event_loop().run_in_executor(
            None,
            comms_instance.redis_client.close
        )
    logger.info("✅ Comms Agent shutdown complete")

if __name__ == "__main__":
    logger.info("🚀 Starting Comms Agent...")
    comms_agent.run()
