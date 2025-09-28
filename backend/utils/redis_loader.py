"""
Redis Loader for Emergency Dispatch System

This script loads historical unit data from JSON into Redis for real-time access.
It stores the most recent status update for each unit using Redis Hash structures.
"""

import json
import redis
import asyncio
import logging
from typing import Dict, Any, List
from datetime import datetime
import os
import sys

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RedisLoader:
    """Handles loading unit data into Redis"""
    
    def __init__(self, redis_url: str = None):
        """Initialize Redis connection"""
        self.redis_url = redis_url or settings.REDIS_URL
        self.redis_client = None
        
    async def connect(self):
        """Establish Redis connection"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            # Test connection
            await asyncio.get_event_loop().run_in_executor(None, self.redis_client.ping)
            logger.info("✅ Connected to Redis successfully")
        except Exception as e:
            logger.error(f"❌ Failed to connect to Redis: {e}")
            raise
    
    async def load_units_from_file(self, file_path: str) -> Dict[str, Any]:
        """Load unit data from JSON file"""
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            logger.info(f"📁 Loaded data from {file_path}")
            return data
        except FileNotFoundError:
            logger.error(f"❌ File not found: {file_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON in file {file_path}: {e}")
            raise
    
    def get_latest_status(self, unit: Dict[str, Any]) -> Dict[str, Any]:
        """Extract the latest status from unit's status history"""
        if unit['type'] == 'HOSPITAL':
            # Hospitals are static, return their current data
            return {
                'unit_id': unit['unit_id'],
                'type': unit['type'],
                'status': 'available',  # Hospitals are always available
                'location': unit['location'],
                'last_updated': unit['last_updated'],
                'name': unit.get('name', ''),
                'er_capacity': unit.get('er_capacity', 0),
                'current_patients': unit.get('current_patients', 0),
                'available_beds': unit.get('available_beds', 0),
                'specialties': unit.get('specialties', [])
            }
        else:
            # For vehicles, get the latest status from history
            status_history = unit.get('status_history', [])
            if not status_history:
                logger.warning(f"⚠️ No status history for unit {unit['unit_id']}")
                return {
                    'unit_id': unit['unit_id'],
                    'type': unit['type'],
                    'status': 'unknown',
                    'location': unit.get('current_location', (0, 0)),
                    'last_updated': datetime.utcnow().isoformat()
                }
            
            # Get the most recent status update
            latest_status = max(status_history, key=lambda x: x['timestamp'])
            return {
                'unit_id': unit['unit_id'],
                'type': unit['type'],
                'status': latest_status['status'],
                'location': latest_status['location'],
                'last_updated': latest_status['timestamp']
            }
    
    async def store_unit_in_redis(self, unit_data: Dict[str, Any]) -> None:
        """Store a single unit's data in Redis as a Hash"""
        try:
            unit_id = unit_data['unit_id']
            unit_type = unit_data['type']
            
            # Create Redis key
            redis_key = f"unit:{unit_id}"
            
            # Prepare data for Redis Hash
            redis_data = {
                'unit_id': unit_data['unit_id'],
                'type': unit_data['type'],
                'status': unit_data['status'],
                'location': json.dumps(unit_data['location']),  # Store as JSON string
                'last_updated': unit_data['last_updated']
            }
            
            # Add hospital-specific fields if applicable
            if unit_type == 'HOSPITAL':
                redis_data.update({
                    'name': unit_data.get('name', ''),
                    'er_capacity': str(unit_data.get('er_capacity', 0)),
                    'current_patients': str(unit_data.get('current_patients', 0)),
                    'available_beds': str(unit_data.get('available_beds', 0)),
                    'specialties': json.dumps(unit_data.get('specialties', []))
                })
            
            # Store in Redis
            await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.redis_client.hset(redis_key, mapping=redis_data)
            )
            
            # Set expiration (24 hours)
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.expire(redis_key, 86400)
            )
            
            logger.debug(f"✅ Stored unit {unit_id} in Redis")
            
        except Exception as e:
            logger.error(f"❌ Failed to store unit {unit_data.get('unit_id', 'unknown')}: {e}")
            raise
    
    async def load_all_units(self, data: Dict[str, Any]) -> None:
        """Load all units from data into Redis"""
        units = data.get('units', [])
        logger.info(f"🔄 Loading {len(units)} units into Redis...")
        
        success_count = 0
        error_count = 0
        
        for unit in units:
            try:
                # Get latest status for the unit
                latest_status = self.get_latest_status(unit)
                
                # Store in Redis
                await self.store_unit_in_redis(latest_status)
                success_count += 1
                
            except Exception as e:
                logger.error(f"❌ Error processing unit {unit.get('unit_id', 'unknown')}: {e}")
                error_count += 1
        
        logger.info(f"📊 Load Summary: {success_count} successful, {error_count} errors")
    
    async def create_indexes(self) -> None:
        """Create Redis indexes for efficient querying"""
        try:
            # Create sets for each unit type for fast lookup
            unit_types = ['POLICE', 'FIRE', 'EMS', 'HOSPITAL']
            
            for unit_type in unit_types:
                # Get all units of this type
                pattern = f"unit:*"
                keys = await asyncio.get_event_loop().run_in_executor(
                    None, 
                    lambda: self.redis_client.keys(pattern)
                )
                
                # Filter by type and add to type set
                type_units = []
                for key in keys:
                    unit_type_in_redis = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda k=key: self.redis_client.hget(k, 'type')
                    )
                    if unit_type_in_redis == unit_type:
                        type_units.append(key)
                
                # Store in type-specific set
                if type_units:
                    type_key = f"units:{unit_type.lower()}"
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.redis_client.sadd(type_key, *type_units)
                    )
                    await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: self.redis_client.expire(type_key, 86400)
                    )
                    logger.info(f"📋 Created index for {len(type_units)} {unit_type} units")
            
        except Exception as e:
            logger.error(f"❌ Failed to create indexes: {e}")
            raise
    
    async def verify_data(self) -> None:
        """Verify that data was loaded correctly"""
        try:
            # Count total units
            pattern = "unit:*"
            keys = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.redis_client.keys(pattern)
            )
            
            logger.info(f"🔍 Verification: Found {len(keys)} units in Redis")
            
            # Count by type
            unit_types = ['POLICE', 'FIRE', 'EMS', 'HOSPITAL']
            for unit_type in unit_types:
                type_key = f"units:{unit_type.lower()}"
                count = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.redis_client.scard(type_key)
                )
                logger.info(f"   {unit_type}: {count} units")
            
        except Exception as e:
            logger.error(f"❌ Verification failed: {e}")
            raise
    
    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            await asyncio.get_event_loop().run_in_executor(None, self.redis_client.close)
            logger.info("🔌 Redis connection closed")

async def main():
    """Main function to load data into Redis"""
    print("=" * 60)
    print("🔄 REDIS LOADER - EMERGENCY DISPATCH SYSTEM")
    print("=" * 60)
    
    # Initialize loader
    loader = RedisLoader()
    
    try:
        # Connect to Redis
        await loader.connect()
        
        # Load data from file
        data_file = "backend/data/historical_unit_data.json"
        data = await loader.load_units_from_file(data_file)
        
        # Load all units into Redis
        await loader.load_all_units(data)
        
        # Create indexes
        await loader.create_indexes()
        
        # Verify data
        await loader.verify_data()
        
        print("\n✅ Data loading completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Data loading failed: {e}")
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    
    finally:
        await loader.close()

if __name__ == "__main__":
    asyncio.run(main())
