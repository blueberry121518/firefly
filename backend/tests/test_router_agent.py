"""
Test Router Agent

This test suite verifies that the Router Agent correctly:
1. Finds the closest available unit
2. Updates unit status in Redis
3. Publishes dispatch logs
"""

import pytest
import asyncio
import json
import math
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

# Add backend directory to path
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.router_agent import RouterAgent

class MockRedisClient:
    """Mock Redis client for testing"""
    
    def __init__(self):
        self.units = {}
        self.published_logs = []
        self.unit_types = {
            'police': set(),
            'fire': set(),
            'ems': set(),
            'hospital': set()
        }
    
    def smembers(self, key):
        """Mock smembers for unit type sets"""
        unit_type = key.split(':')[1]
        return self.unit_types.get(unit_type, set())
    
    def hgetall(self, key):
        """Mock hgetall for unit data"""
        return self.units.get(key, {})
    
    def hset(self, key, mapping=None, **kwargs):
        """Mock hset for updating unit data"""
        if key not in self.units:
            self.units[key] = {}
        
        if mapping:
            self.units[key].update(mapping)
        self.units[key].update(kwargs)
        return 1
    
    def publish(self, channel, message):
        """Mock publish for logging"""
        self.published_logs.append({
            'channel': channel,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        return 1
    
    def ping(self):
        """Mock ping"""
        return True

@pytest.fixture
def mock_redis():
    """Create a mock Redis client"""
    return MockRedisClient()

@pytest.fixture
def router_agent(mock_redis):
    """Create a RouterAgent with mocked Redis"""
    agent = RouterAgent()
    agent.redis_client = mock_redis
    return agent

@pytest.fixture
def sample_units():
    """Sample unit data for testing"""
    return {
        'unit:police_01': {
            'unit_id': 'police_01',
            'type': 'POLICE',
            'status': 'available',
            'location': json.dumps([42.2808, -83.7430]),  # Ann Arbor center
            'last_updated': datetime.now().isoformat()
        },
        'unit:police_02': {
            'unit_id': 'police_02',
            'type': 'POLICE',
            'status': 'available',
            'location': json.dumps([42.2900, -83.7500]),  # Slightly north
            'last_updated': datetime.now().isoformat()
        },
        'unit:police_03': {
            'unit_id': 'police_03',
            'type': 'POLICE',
            'status': 'enroute',  # Not available
            'location': json.dumps([42.2700, -83.7300]),
            'last_updated': datetime.now().isoformat()
        },
        'unit:fire_01': {
            'unit_id': 'fire_01',
            'type': 'FIRE',
            'status': 'available',
            'location': json.dumps([42.2750, -83.7400]),
            'last_updated': datetime.now().isoformat()
        }
    }

@pytest.fixture
def sample_incident():
    """Sample incident data for testing"""
    return {
        'call_id': 'test-call-123',
        'incident_fact': {
            'case_id': 'test-case-123',
            'emergency_type': 'Fire',
            'location': '123 Main Street, Ann Arbor, MI',
            'callback_number': '+1234567890',
            'severity': 'High',
            'description': 'House fire with visible flames'
        },
        'conversation_summary': 'Caller reported house fire with visible flames',
        'timestamp': datetime.now().isoformat(),
        'status': 'ready_for_dispatch'
    }

class TestRouterAgent:
    """Test cases for RouterAgent"""
    
    def test_haversine_distance(self, router_agent):
        """Test haversine distance calculation"""
        # Test distance between Ann Arbor and Detroit (approximately 40 km)
        ann_arbor = (42.2808, -83.7430)
        detroit = (42.3314, -83.0458)
        
        distance = router_agent.haversine_distance(
            ann_arbor[0], ann_arbor[1],
            detroit[0], detroit[1]
        )
        
        # Should be approximately 40 km (allowing for some variance)
        assert 35 <= distance <= 45, f"Expected distance ~40km, got {distance}km"
    
    def test_haversine_distance_same_location(self, router_agent):
        """Test haversine distance for same location"""
        location = (42.2808, -83.7430)
        distance = router_agent.haversine_distance(
            location[0], location[1],
            location[0], location[1]
        )
        
        assert distance == 0, f"Expected distance 0, got {distance}"
    
    @pytest.mark.asyncio
    async def test_get_available_units(self, router_agent, mock_redis, sample_units):
        """Test getting available units from Redis"""
        # Setup mock data
        mock_redis.units = sample_units
        mock_redis.unit_types['police'] = {'unit:police_01', 'unit:police_02', 'unit:police_03'}
        
        # Test getting available police units
        available_units = await router_agent.get_available_units('POLICE')
        
        # Should return 2 available units (police_01 and police_02)
        assert len(available_units) == 2
        
        # Check that only available units are returned
        unit_ids = [unit['unit_id'] for unit in available_units]
        assert 'police_01' in unit_ids
        assert 'police_02' in unit_ids
        assert 'police_03' not in unit_ids  # Not available
    
    @pytest.mark.asyncio
    async def test_get_available_units_empty(self, router_agent, mock_redis):
        """Test getting available units when none exist"""
        # No units in Redis
        mock_redis.units = {}
        mock_redis.unit_types['police'] = set()
        
        available_units = await router_agent.get_available_units('POLICE')
        
        assert len(available_units) == 0
    
    def test_find_closest_unit(self, router_agent, sample_units):
        """Test finding the closest unit"""
        # Convert sample units to list format
        units = []
        for unit_data in sample_units.values():
            if unit_data['status'] == 'available':
                unit = unit_data.copy()
                unit['location'] = json.loads(unit['location'])
                units.append(unit)
        
        # Test location (Ann Arbor center)
        incident_location = (42.2808, -83.7430)
        
        closest_unit = router_agent.find_closest_unit(units, incident_location)
        
        # Should find police_01 as closest (at same location)
        assert closest_unit is not None
        assert closest_unit['unit_id'] == 'police_01'
        assert 'distance_km' in closest_unit
        assert closest_unit['distance_km'] == 0  # Same location
    
    def test_find_closest_unit_empty_list(self, router_agent):
        """Test finding closest unit with empty list"""
        closest_unit = router_agent.find_closest_unit([], (42.2808, -83.7430))
        
        assert closest_unit is None
    
    @pytest.mark.asyncio
    async def test_update_unit_status(self, router_agent, mock_redis):
        """Test updating unit status in Redis"""
        # Setup initial unit data
        mock_redis.units['unit:police_01'] = {
            'unit_id': 'police_01',
            'status': 'available',
            'last_updated': '2023-01-01T00:00:00'
        }
        
        # Update status
        success = await router_agent.update_unit_status('police_01', 'enroute')
        
        assert success is True
        assert mock_redis.units['unit:police_01']['status'] == 'enroute'
        assert 'last_updated' in mock_redis.units['unit:police_01']
    
    @pytest.mark.asyncio
    async def test_publish_log(self, router_agent, mock_redis):
        """Test publishing log to Redis"""
        log_data = {
            'action': 'unit_dispatched',
            'case_id': 'test-case-123',
            'unit_id': 'police_01'
        }
        
        await router_agent.publish_log(log_data)
        
        # Check that log was published
        assert len(mock_redis.published_logs) == 1
        published_log = mock_redis.published_logs[0]
        
        assert published_log['channel'] == 'log_queue'
        assert json.loads(published_log['message']) == log_data
    
    @pytest.mark.asyncio
    async def test_process_incident_success(self, router_agent, mock_redis, sample_units, sample_incident):
        """Test successful incident processing"""
        # Setup mock data
        mock_redis.units = sample_units
        mock_redis.unit_types['fire'] = {'unit:fire_01'}
        
        # Process incident
        await router_agent.process_incident(sample_incident)
        
        # Check that unit status was updated
        assert mock_redis.units['unit:fire_01']['status'] == 'enroute'
        
        # Check that log was published
        assert len(mock_redis.published_logs) == 1
        log_message = json.loads(mock_redis.published_logs[0]['message'])
        assert log_message['action'] == 'unit_dispatched'
        assert log_message['case_id'] == 'test-case-123'
        assert log_message['unit_id'] == 'fire_01'
    
    @pytest.mark.asyncio
    async def test_process_incident_no_units(self, router_agent, mock_redis, sample_incident):
        """Test incident processing when no units are available"""
        # No units available
        mock_redis.units = {}
        mock_redis.unit_types['fire'] = set()
        
        # Process incident
        await router_agent.process_incident(sample_incident)
        
        # Check that failure log was published
        assert len(mock_redis.published_logs) == 1
        log_message = json.loads(mock_redis.published_logs[0]['message'])
        assert log_message['action'] == 'dispatch_failed'
        assert 'No available FIRE units' in log_message['reason']
    
    @pytest.mark.asyncio
    async def test_process_incident_emergency_type_mapping(self, router_agent, mock_redis, sample_units):
        """Test emergency type to unit type mapping"""
        # Test different emergency types
        test_cases = [
            ('Fire', 'FIRE'),
            ('Medical', 'EMS'),
            ('Police', 'POLICE'),
            ('Other', 'EMS'),
            ('Unknown', 'EMS')
        ]
        
        for emergency_type, expected_unit_type in test_cases:
            incident = {
                'call_id': f'test-{emergency_type.lower()}-123',
                'incident_fact': {
                    'emergency_type': emergency_type,
                    'location': '123 Test St',
                    'callback_number': '+1234567890'
                }
            }
            
            # Setup units for this type
            mock_redis.units = sample_units
            mock_redis.unit_types[expected_unit_type.lower()] = {f'unit:{expected_unit_type.lower()}_01'}
            
            # Clear previous logs
            mock_redis.published_logs = []
            
            # Process incident
            await router_agent.process_incident(incident)
            
            # Should have published a log
            assert len(mock_redis.published_logs) >= 1

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
