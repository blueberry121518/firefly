"""
Comprehensive test suite for Router Agent

Tests the router agent's decentralized bidding system and incident processing.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
from uuid import uuid4

# Mock the uagents imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with patch.dict('sys.modules', {
    'uagents': Mock(),
    'uagents.Agent': Mock,
    'uagents.Context': Mock,
    'uagents.Model': Mock,
    'uagents.Protocol': Mock,
}):
    from agents.router_agent import RouterAgent

class TestRouterAgent:
    """Test cases for the router agent functionality"""
    
    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client"""
        mock_client = Mock()
        mock_client.ping = Mock()
        mock_client.publish = Mock()
        mock_client.subscribe = Mock()
        mock_client.get_message = Mock(return_value=None)
        mock_client.close = Mock()
        return mock_client
    
    @pytest.fixture
    def router_agent(self, mock_redis_client):
        """Create a test router agent with mocked dependencies"""
        with patch('agents.router_agent.redis.from_url', return_value=mock_redis_client):
            agent = RouterAgent()
            agent.redis_client = mock_redis_client
            return agent
    
    @pytest.fixture
    def sample_incident_data(self):
        """Create sample incident data for testing"""
        return {
            "incident_fact": {
                "case_id": str(uuid4()),
                "emergency_type": "Fire",
                "location": "123 Main St, Ann Arbor, MI",
                "latitude": 42.2808,
                "longitude": -83.7430,
                "is_active_threat": True,
                "details": "Building fire with smoke visible",
                "people_involved": 5,
                "callback_number": "+15551234567"
            }
        }
    
    def test_router_agent_initialization(self, router_agent):
        """Test router agent initialization"""
        assert router_agent.redis_client is not None
        assert router_agent.bid_collection_window == 5.0
        assert router_agent.incident_channel == "incident_queue"
        assert router_agent.bid_solicitation_channel == "bid_solicitation_channel"
        assert router_agent.bid_response_channel == "bid_response_channel"
        assert router_agent.log_channel == "log_queue"
    
    def test_haversine_distance_calculation(self, router_agent):
        """Test haversine distance calculation"""
        # Test distance between two known points
        lat1, lon1 = 42.2808, -83.7430  # Ann Arbor
        lat2, lon2 = 37.7749, -122.4194  # San Francisco
        
        distance = router_agent.haversine_distance(lat1, lon1, lat2, lon2)
        
        # Should be approximately 2,100 km
        assert 2000 < distance < 2200
    
    def test_haversine_distance_same_point(self, router_agent):
        """Test haversine distance for same point"""
        lat, lon = 42.2808, -83.7430
        distance = router_agent.haversine_distance(lat, lon, lat, lon)
        assert distance == 0.0
    
    @pytest.mark.asyncio
    async def test_get_available_units_success(self, router_agent, mock_redis_client):
        """Test successful retrieval of available units"""
        # Mock Redis keys and data
        mock_redis_client.keys.return_value = [
            "unit:police_001", "unit:fire_001", "unit:ems_001"
        ]
        
        # Mock unit data
        unit_data = {
            "unit_id": "POLICE_001",
            "type": "Police",
            "status": "Available",
            "location": {"lat": 42.2808, "lon": -83.7430}
        }
        mock_redis_client.get.return_value = json.dumps(unit_data)
        
        units = await router_agent.get_available_units()
        
        assert len(units) == 3
        assert all(unit["status"] == "Available" for unit in units)
        mock_redis_client.keys.assert_called_once_with("unit:*")
    
    @pytest.mark.asyncio
    async def test_get_available_units_no_units(self, router_agent, mock_redis_client):
        """Test retrieval when no units are available"""
        mock_redis_client.keys.return_value = []
        
        units = await router_agent.get_available_units()
        
        assert units == []
    
    @pytest.mark.asyncio
    async def test_get_available_units_redis_error(self, router_agent, mock_redis_client):
        """Test retrieval with Redis error"""
        mock_redis_client.keys.side_effect = Exception("Redis error")
        
        units = await router_agent.get_available_units()
        
        assert units == []
    
    @pytest.mark.asyncio
    async def test_update_unit_status_success(self, router_agent, mock_redis_client):
        """Test successful unit status update"""
        mock_redis_client.hset.return_value = True
        
        success = await router_agent.update_unit_status("POLICE_001", "enroute")
        
        assert success is True
        mock_redis_client.hset.assert_called_once_with(
            "unit:POLICE_001", "status", "enroute"
        )
    
    @pytest.mark.asyncio
    async def test_update_unit_status_failure(self, router_agent, mock_redis_client):
        """Test unit status update failure"""
        mock_redis_client.hset.side_effect = Exception("Redis error")
        
        success = await router_agent.update_unit_status("POLICE_001", "enroute")
        
        assert success is False
    
    @pytest.mark.asyncio
    async def test_publish_log_success(self, router_agent, mock_redis_client):
        """Test successful log publishing"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "action": "test_action",
            "case_id": "test_123"
        }
        
        await router_agent.publish_log(log_data)
        
        mock_redis_client.publish.assert_called_once()
        call_args = mock_redis_client.publish.call_args[0]
        assert call_args[0] == "log_queue"
        published_data = json.loads(call_args[1])
        assert published_data["action"] == "test_action"
    
    @pytest.mark.asyncio
    async def test_publish_log_failure(self, router_agent, mock_redis_client):
        """Test log publishing failure"""
        mock_redis_client.publish.side_effect = Exception("Redis error")
        
        log_data = {"action": "test"}
        
        # Should not raise exception
        await router_agent.publish_log(log_data)
    
    @pytest.mark.asyncio
    async def test_process_incident_no_bids(self, router_agent, mock_redis_client, sample_incident_data):
        """Test incident processing when no bids are received"""
        # Mock Redis operations
        mock_redis_client.publish.return_value = True
        mock_redis_client.hset.return_value = True
        
        # Mock pubsub for bid collection (no bids)
        mock_pubsub = Mock()
        mock_pubsub.get_message.return_value = None
        router_agent.bid_pubsub = mock_pubsub
        
        await router_agent.process_incident(sample_incident_data)
        
        # Verify bid solicitation was published
        mock_redis_client.publish.assert_called()
        call_args = mock_redis_client.publish.call_args[0]
        assert call_args[0] == "bid_solicitation_channel"
        
        # Verify failure log was published
        published_calls = mock_redis_client.publish.call_args_list
        log_calls = [call for call in published_calls if call[0][0] == "log_queue"]
        assert len(log_calls) > 0
    
    @pytest.mark.asyncio
    async def test_process_incident_with_bids(self, router_agent, mock_redis_client, sample_incident_data):
        """Test incident processing with successful bids"""
        # Mock Redis operations
        mock_redis_client.publish.return_value = True
        mock_redis_client.hset.return_value = True
        
        # Mock pubsub for bid collection
        mock_pubsub = Mock()
        bid_response = {
            "type": "message",
            "data": json.dumps({
                "incident_id": sample_incident_data["incident_fact"]["case_id"],
                "unit_id": "POLICE_001",
                "bid_score": 85.5,
                "eta_minutes": 8,
                "strategic_advice": "Good location for police response"
            })
        }
        mock_pubsub.get_message.return_value = bid_response
        router_agent.bid_pubsub = mock_pubsub
        
        await router_agent.process_incident(sample_incident_data)
        
        # Verify bid solicitation was published
        mock_redis_client.publish.assert_called()
        
        # Verify unit was dispatched
        mock_redis_client.hset.assert_called()
        hset_calls = mock_redis_client.hset.call_args_list
        status_calls = [call for call in hset_calls if "status" in call[0]]
        assert len(status_calls) > 0
    
    @pytest.mark.asyncio
    async def test_process_incident_emergency_type_mapping(self, router_agent, mock_redis_client):
        """Test emergency type to unit type mapping"""
        # Test different emergency types
        test_cases = [
            ("Fire", "Fire"),
            ("Police", "Police"),
            ("Medical", "EMS"),
            ("Unknown", "EMS")
        ]
        
        for emergency_type, expected_unit_type in test_cases:
            incident_data = {
                "incident_fact": {
                    "case_id": str(uuid4()),
                    "emergency_type": emergency_type,
                    "location": "Test Location",
                    "latitude": 42.2808,
                    "longitude": -83.7430
                }
            }
            
            # Mock Redis operations
            mock_redis_client.publish.return_value = True
            mock_redis_client.hset.return_value = True
            
            # Mock pubsub (no bids)
            mock_pubsub = Mock()
            mock_pubsub.get_message.return_value = None
            router_agent.bid_pubsub = mock_pubsub
            
            await router_agent.process_incident(incident_data)
            
            # Verify the correct unit type was used in bid solicitation
            published_calls = mock_redis_client.publish.call_args_list
            bid_calls = [call for call in published_calls if call[0][0] == "bid_solicitation_channel"]
            if bid_calls:
                bid_data = json.loads(bid_calls[0][0][1])
                assert bid_data["required_unit_type"] == expected_unit_type
    
    @pytest.mark.asyncio
    async def test_process_incident_error_handling(self, router_agent, mock_redis_client, sample_incident_data):
        """Test error handling during incident processing"""
        # Mock Redis operations to fail
        mock_redis_client.publish.side_effect = Exception("Redis error")
        
        # Should not raise exception
        await router_agent.process_incident(sample_incident_data)
        
        # Verify error log was published
        published_calls = mock_redis_client.publish.call_args_list
        log_calls = [call for call in published_calls if call[0][0] == "log_queue"]
        assert len(log_calls) > 0
    
    @pytest.mark.asyncio
    async def test_connect_success(self, router_agent, mock_redis_client):
        """Test successful connection establishment"""
        await router_agent.connect()
        
        assert router_agent.redis_client is not None
        assert router_agent.bid_pubsub is not None
        mock_redis_client.ping.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_failure(self, router_agent, mock_redis_client):
        """Test connection failure"""
        mock_redis_client.ping.side_effect = Exception("Redis error")
        
        with pytest.raises(Exception):
            await router_agent.connect()
    
    @pytest.mark.asyncio
    async def test_start_success(self, router_agent, mock_redis_client):
        """Test successful agent start"""
        # Mock the monitoring loop to run briefly
        with patch.object(router_agent, 'monitor_incidents', new_callable=AsyncMock) as mock_monitor:
            mock_monitor.return_value = None
            
            # Start the agent
            task = asyncio.create_task(router_agent.start())
            await asyncio.sleep(0.1)  # Let it run briefly
            router_agent.running = False
            await task
            
            mock_monitor.assert_called()
    
    @pytest.mark.asyncio
    async def test_stop(self, router_agent, mock_redis_client):
        """Test agent stop functionality"""
        router_agent.running = True
        router_agent.redis_client = mock_redis_client
        
        await router_agent.stop()
        
        assert router_agent.running is False
        mock_redis_client.close.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
