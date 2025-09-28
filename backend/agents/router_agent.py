"""
Router Agent for Emergency Dispatch System

This agent listens for new incidents on Redis pub/sub and dispatches the closest available unit.
It uses haversine distance calculation to find the optimal unit for each emergency.
"""

import asyncio
import json
import logging
import redis
import sys
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import math

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from uagents import Agent, Context, Model
from app.core.config import settings
from app.schemas.incident_schema import IncidentFact

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Message models for uAgent communication
class IncidentReceived(Model):
    """Message sent when a new incident is received"""
    case_id: str
    emergency_type: str
    location: str
    incident_fact: dict
    timestamp: str

class UnitDispatchRequest(Model):
    """Request to dispatch a unit to an incident"""
    case_id: str
    unit_id: str
    unit_type: str
    incident_location: str
    incident_fact: dict

class DispatchConfirmation(Model):
    """Confirmation that a unit has been dispatched"""
    case_id: str
    unit_id: str
    status: str
    timestamp: str

class DispatchError(Model):
    """Error message for dispatch failures"""
    case_id: str
    error: str
    timestamp: str

# Create the router agent
router_agent = Agent(
    name="router_agent",
    seed=settings.AGENT_IDENTITY_KEY or "router-agent-seed-key",
    port=8002,
    endpoint=f"http://localhost:8002/submit",
)

class RouterAgent:
    """Handles incident routing and unit dispatch"""
    
    def __init__(self, redis_url: str = None):
        """Initialize Router Agent"""
        self.redis_url = redis_url or settings.REDIS_URL
        self.redis_client = None
        self.pubsub = None
        self.running = False
        
        # Redis channels
        self.incident_channel = "incident_queue"
        self.log_channel = "log_queue"
        self.bid_requests_channel = "bid_requests"
        self.bids_channel = "bids"
        
        # Unit type mapping for different emergency types
        self.emergency_type_mapping = {
            "Fire": "FIRE",
            "Medical": "EMS", 
            "Police": "POLICE",
            "Other": "EMS"  # Default to EMS for unknown types
        }
    
    async def connect(self):
        """Establish Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            self.pubsub = self.redis_client.pubsub()
            
            # Test connection
            await asyncio.get_event_loop().run_in_executor(None, self.redis_client.ping)
            logger.info("✅ Router Agent connected to Redis")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    def haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on Earth (in kilometers)
        using the Haversine formula.
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        return c * r
    
    async def get_available_units(self, unit_type: str) -> List[Dict[str, Any]]:
        """Get all available units of a specific type from Redis"""
        try:
            # Get unit keys for this type
            type_key = f"units:{unit_type.lower()}"
            unit_keys = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.smembers(type_key)
            )
            
            if not unit_keys:
                logger.warning(f"⚠️ No units found for type {unit_type}")
                return []
            
            available_units = []
            
            # Check each unit's status
            for unit_key in unit_keys:
                unit_data = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda k=unit_key: self.redis_client.hgetall(k)
                )
                
                if unit_data and unit_data.get('status') == 'available':
                    # Parse location from JSON string
                    try:
                        location = json.loads(unit_data.get('location', '[0,0]'))
                        unit_data['location'] = location
                    except json.JSONDecodeError:
                        logger.warning(f"⚠️ Invalid location data for unit {unit_key}")
                        continue
                    
                    available_units.append(unit_data)
            
            logger.info(f"🔍 Found {len(available_units)} available {unit_type} units")
            return available_units
            
        except Exception as e:
            logger.error(f"❌ Error getting available units: {e}")
            return []
    
    def find_closest_unit(self, units: List[Dict[str, Any]], incident_location: Tuple[float, float]) -> Optional[Dict[str, Any]]:
        """Find the closest unit to the incident location"""
        if not units:
            return None
        
        incident_lat, incident_lon = incident_location
        closest_unit = None
        min_distance = float('inf')
        
        for unit in units:
            try:
                unit_location = unit.get('location', [0, 0])
                if isinstance(unit_location, list) and len(unit_location) >= 2:
                    unit_lat, unit_lon = unit_location[0], unit_location[1]
                    
                    # Calculate distance
                    distance = self.haversine_distance(
                        incident_lat, incident_lon,
                        unit_lat, unit_lon
                    )
                    
                    if distance < min_distance:
                        min_distance = distance
                        closest_unit = unit
                        closest_unit['distance_km'] = round(distance, 2)
                        
            except (ValueError, TypeError, IndexError) as e:
                logger.warning(f"⚠️ Invalid location data for unit {unit.get('unit_id', 'unknown')}: {e}")
                continue
        
        if closest_unit:
            logger.info(f"🎯 Closest unit: {closest_unit['unit_id']} ({closest_unit['distance_km']} km away)")
        
        return closest_unit
    
    async def update_unit_status(self, unit_id: str, new_status: str) -> bool:
        """Update a unit's status in Redis"""
        try:
            unit_key = f"unit:{unit_id}"
            
            # Update status and last_updated
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.hset(unit_key, mapping={
                    'status': new_status,
                    'last_updated': datetime.utcnow().isoformat()
                })
            )
            
            logger.info(f"✅ Updated unit {unit_id} status to {new_status}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update unit {unit_id} status: {e}")
            return False
    
    async def publish_log(self, log_data: Dict[str, Any]) -> None:
        """Publish a log entry to the log queue"""
        try:
            log_message = json.dumps(log_data)
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.publish(self.log_channel, log_message)
            )
            logger.info(f"📝 Published log: {log_data.get('action', 'unknown')}")
            
        except Exception as e:
            logger.error(f"❌ Failed to publish log: {e}")
    
    async def process_incident(self, incident_data: Dict[str, Any]) -> None:
        """Process a new incident using decentralized bidding and dispatch top scorer"""
        try:
            logger.info("🚨 Processing new incident...")
            
            # Extract incident information
            incident_fact = incident_data.get('incident_fact', {})
            emergency_type = incident_fact.get('emergency_type', 'Other')
            location = incident_fact.get('location', '')
            case_id = incident_fact.get('case_id', 'unknown')
            callback_number = incident_fact.get('callback_number', '')
            
            logger.info(f"📋 Incident Details:")
            logger.info(f"   Case ID: {case_id}")
            logger.info(f"   Emergency Type: {emergency_type}")
            logger.info(f"   Location: {location}")
            logger.info(f"   Callback: {callback_number}")
            
            # Determine required unit type (for logging/reference only)
            required_unit_type = self.emergency_type_mapping.get(emergency_type, 'EMS')
            logger.info(f"🎯 Required unit type: {required_unit_type}")

            # Derive an incident location tuple if possible; fallback to Ann Arbor center
            incident_location = (42.2808, -83.7430)
            if isinstance(location, str) and "," in location:
                try:
                    lat_str, lon_str = location.split(",")
                    incident_location = (float(lat_str.strip()), float(lon_str.strip()))
                except Exception:
                    pass
            elif isinstance(location, dict) and 'lat' in location and 'lon' in location:
                try:
                    incident_location = (float(location['lat']), float(location['lon']))
                except Exception:
                    pass

            # 1) Broadcast bid request to units
            bid_request = {
                'type': 'bid_request',
                'case_id': case_id,
                'emergency_type': emergency_type,
                'incident_location': list(incident_location),
                'incident_fact': incident_fact,
                'deadline_ms': 2000  # units have ~2s to respond
            }
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.publish(self.bid_requests_channel, json.dumps(bid_request))
            )
            logger.info(f"📣 Broadcast bid request for case {case_id}")

            # 2) Collect bids for a short window
            bids: List[Dict[str, Any]] = []
            collector_pubsub = self.redis_client.pubsub()
            await asyncio.get_event_loop().run_in_executor(None, lambda: collector_pubsub.subscribe(self.bids_channel))

            end_time = asyncio.get_event_loop().time() + 2.2  # give slightly more than deadline
            try:
                while asyncio.get_event_loop().time() < end_time:
                    message = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: collector_pubsub.get_message(timeout=0.2)
                    )
                    if message and message.get('type') == 'message':
                        try:
                            bid = json.loads(message['data'])
                            if bid.get('case_id') == case_id:
                                bids.append(bid)
                        except json.JSONDecodeError:
                            continue
            finally:
                try:
                    await asyncio.get_event_loop().run_in_executor(None, lambda: collector_pubsub.unsubscribe(self.bids_channel))
                except Exception:
                    pass

            logger.info(f"🧾 Collected {len(bids)} bids for case {case_id}")

            # 3) Select top scorer; fallback to proximity if no bids
            selected_unit_id: Optional[str] = None
            if bids:
                bids.sort(key=lambda b: b.get('bid_score', 0), reverse=True)
                top_bid = bids[0]
                selected_unit_id = top_bid.get('unit_id')
                logger.info(f"🥇 Top bid: {selected_unit_id} score={top_bid.get('bid_score')} ETA={top_bid.get('eta_minutes')}")
            else:
                # Fallback: proximity-based selection from available units
                available_units = await self.get_available_units(required_unit_type)
                if not available_units:
                    logger.error(f"❌ No available {required_unit_type} units found!")
                    await self.publish_log({
                        'timestamp': datetime.utcnow().isoformat(),
                        'action': 'dispatch_failed',
                        'case_id': case_id,
                        'reason': f'No available {required_unit_type} units',
                        'incident_data': incident_data
                    })
                    return
                closest_unit = self.find_closest_unit(available_units, incident_location)
                if closest_unit:
                    selected_unit_id = closest_unit['unit_id']
                    logger.info(f"📍 Fallback selected closest unit {selected_unit_id}")

            if not selected_unit_id:
                logger.error("❌ Could not determine a unit to dispatch")
                return

            # 4) Dispatch selected unit
            dispatch_success = await self.update_unit_status(selected_unit_id, 'enroute')

            if dispatch_success:
                dispatch_log = {
                    'timestamp': datetime.utcnow().isoformat(),
                    'action': 'unit_dispatched',
                    'case_id': case_id,
                    'unit_id': selected_unit_id,
                    'unit_type': required_unit_type,
                    'incident_location': location,
                    'incident_data': incident_data,
                    'bids_considered': len(bids)
                }
                await self.publish_log(dispatch_log)
                logger.info(f"✅ Dispatched {selected_unit_id} to incident {case_id}")
            else:
                logger.error(f"❌ Failed to dispatch unit {selected_unit_id}")
                
        except Exception as e:
            logger.error(f"❌ Error processing incident: {e}")
            
            # Log the error
            await self.publish_log({
                'timestamp': datetime.utcnow().isoformat(),
                'action': 'processing_error',
                'error': str(e),
                'incident_data': incident_data
            })
    
    async def listen_for_incidents(self) -> None:
        """Listen for new incidents on Redis pub/sub"""
        try:
            # Subscribe to incident queue
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.pubsub.subscribe(self.incident_channel)
            )
            
            logger.info(f"👂 Listening for incidents on channel: {self.incident_channel}")
            
            # Listen for messages
            while self.running:
                try:
                    message = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.pubsub.get_message(timeout=1.0)
                    )
                    
                    if message and message['type'] == 'message':
                        try:
                            # Parse incident data
                            incident_data = json.loads(message['data'])
                            logger.info("📨 Received new incident")
                            
                            # Process the incident
                            await self.process_incident(incident_data)
                            
                        except json.JSONDecodeError as e:
                            logger.error(f"❌ Invalid JSON in incident message: {e}")
                        except Exception as e:
                            logger.error(f"❌ Error processing incident message: {e}")
                
                except redis.TimeoutError:
                    # No message received, continue listening
                    continue
                except Exception as e:
                    logger.error(f"❌ Error in message loop: {e}")
                    await asyncio.sleep(1)  # Brief pause before retrying
            
        except Exception as e:
            logger.error(f"❌ Error in incident listener: {e}")
            raise
    
    async def start(self) -> None:
        """Start the Router Agent"""
        try:
            logger.info("🚀 Starting Router Agent...")
            
            # Connect to Redis
            await self.connect()
            
            # Set running flag
            self.running = True
            
            # Start listening for incidents
            await self.listen_for_incidents()
            
        except KeyboardInterrupt:
            logger.info("🛑 Router Agent stopped by user")
        except Exception as e:
            logger.error(f"❌ Router Agent error: {e}")
            raise
        finally:
            await self.stop()
    
    async def stop(self) -> None:
        """Stop the Router Agent"""
        logger.info("🛑 Stopping Router Agent...")
        self.running = False
        
        if self.pubsub:
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.pubsub.unsubscribe(self.incident_channel)
            )
        
        if self.redis_client:
            await asyncio.get_event_loop().run_in_executor(
                None,
                self.redis_client.close
            )
        
        logger.info("✅ Router Agent stopped")

# Global router instance
router_instance = RouterAgent()

@router_agent.on_message(IncidentReceived)
async def handle_incident_received(ctx: Context, sender: str, msg: IncidentReceived):
    """Handle a new incident received from the intake agent"""
    try:
        logger.info(f"🚨 Received incident {msg.case_id} from {sender}")
        
        # Convert message to incident data format
        incident_data = {
            'incident_fact': msg.incident_fact,
            'case_id': msg.case_id,
            'emergency_type': msg.emergency_type,
            'location': msg.location,
            'timestamp': msg.timestamp
        }
        
        # Process the incident
        await router_instance.process_incident(incident_data)
        
    except Exception as e:
        logger.error(f"❌ Error handling incident {msg.case_id}: {e}")
        await ctx.send(sender, DispatchError(
            case_id=msg.case_id,
            error=str(e),
            timestamp=datetime.now().isoformat()
        ))

@router_agent.on_event("startup")
async def startup(ctx: Context):
    """Agent startup handler"""
    logger.info("🚀 Starting Router Agent")
    
    # Initialize Redis connection
    try:
        await router_instance.connect()
        logger.info("✅ Router Agent connected to Redis")
    except Exception as e:
        logger.error(f"❌ Router Agent Redis connection failed: {e}")

@router_agent.on_event("shutdown")
async def shutdown(ctx: Context):
    """Agent shutdown handler"""
    logger.info("🛑 Shutting down Router Agent")
    
    # Close Redis connection
    if router_instance.redis_client:
        await asyncio.get_event_loop().run_in_executor(
            None,
            router_instance.redis_client.close
        )
    logger.info("✅ Router Agent shutdown complete")

if __name__ == "__main__":
    logger.info("🚀 Starting Router Agent...")
    router_agent.run()
