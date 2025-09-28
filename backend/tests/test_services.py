"""
Comprehensive test suite for Services

Tests the incident registry and other service components.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime
from uuid import uuid4

# Mock the kubernetes imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with patch.dict('sys.modules', {
    'kubernetes': Mock(),
    'kubernetes.client': Mock(),
    'kubernetes.config': Mock(),
}):
    from services.incident_registry import IncidentRegistry

class TestIncidentRegistry:
    """Test cases for the incident registry service"""
    
    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client"""
        mock_client = Mock()
        mock_client.ping = Mock()
        mock_client.geoadd = Mock()
        mock_client.set = Mock()
        mock_client.sadd = Mock()
        mock_client.delete = Mock()
        mock_client.zrem = Mock()
        mock_client.srem = Mock()
        mock_client.georadius = Mock(return_value=[])
        mock_client.get = Mock(return_value=None)
        mock_client.close = Mock()
        return mock_client
    
    @pytest.fixture
    def incident_registry(self, mock_redis_client):
        """Create a test incident registry with mocked dependencies"""
        with patch('services.incident_registry.redis.from_url', return_value=mock_redis_client):
            registry = IncidentRegistry()
            registry.client = mock_redis_client
            return registry
    
    @pytest.fixture
    def sample_incident(self):
        """Create sample incident data for testing"""
        return {
            "case_id": str(uuid4()),
            "emergency_type": "Fire",
            "location": "123 Main St, Ann Arbor, MI",
            "latitude": 42.2808,
            "longitude": -83.7430,
            "is_active_threat": True,
            "details": "Building fire with smoke visible",
            "people_involved": 5,
            "timestamp": datetime.now().isoformat()
        }
    
    def test_incident_registry_initialization(self, incident_registry):
        """Test incident registry initialization"""
        assert incident_registry.geo_key == "incidents:geo"
        assert incident_registry.data_key_prefix == "incident:data:"
        assert incident_registry.active_set_key == "incidents:active"
        assert incident_registry.client is not None
    
    @pytest.mark.asyncio
    async def test_connect_success(self, incident_registry, mock_redis_client):
        """Test successful connection establishment"""
        await incident_registry.connect()
        
        assert incident_registry.client is not None
        mock_redis_client.ping.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_connect_failure(self, incident_registry):
        """Test connection failure"""
        with patch('services.incident_registry.redis.from_url', side_effect=Exception("Redis error")):
            with pytest.raises(Exception):
                await incident_registry.connect()
    
    @pytest.mark.asyncio
    async def test_add_active_incident_success(self, incident_registry, mock_redis_client, sample_incident):
        """Test successful incident addition"""
        mock_redis_client.geoadd.return_value = 1
        mock_redis_client.set.return_value = True
        mock_redis_client.sadd.return_value = 1
        
        success = await incident_registry.add_active_incident(sample_incident)
        
        assert success is True
        
        # Verify Redis operations
        mock_redis_client.geoadd.assert_called_once()
        mock_redis_client.set.assert_called_once()
        mock_redis_client.sadd.assert_called_once()
        
        # Verify GEOADD call
        geoadd_args = mock_redis_client.geoadd.call_args
        assert geoadd_args[0][0] == "incidents:geo"
        assert sample_incident["case_id"] in geoadd_args[0][1]
    
    @pytest.mark.asyncio
    async def test_add_active_incident_no_coordinates(self, incident_registry, mock_redis_client):
        """Test incident addition without coordinates"""
        incident_no_coords = {
            "case_id": str(uuid4()),
            "emergency_type": "Fire",
            "location": "Test Location",
            "latitude": 0.0,
            "longitude": 0.0
        }
        
        mock_redis_client.set.return_value = True
        mock_redis_client.sadd.return_value = 1
        
        success = await incident_registry.add_active_incident(incident_no_coords)
        
        assert success is True
        
        # Verify GEOADD was not called
        mock_redis_client.geoadd.assert_not_called()
        # But other operations should still happen
        mock_redis_client.set.assert_called_once()
        mock_redis_client.sadd.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_add_active_incident_failure(self, incident_registry, mock_redis_client, sample_incident):
        """Test incident addition failure"""
        mock_redis_client.geoadd.side_effect = Exception("Redis error")
        
        success = await incident_registry.add_active_incident(sample_incident)
        
        assert success is False
    
    @pytest.mark.asyncio
    async def test_remove_incident_success(self, incident_registry, mock_redis_client):
        """Test successful incident removal"""
        incident_id = "test_incident_123"
        
        await incident_registry.remove_incident(incident_id)
        
        # Verify Redis operations
        mock_redis_client.delete.assert_called_once_with(f"incident:data:{incident_id}")
        mock_redis_client.zrem.assert_called_once_with("incidents:geo", incident_id)
        mock_redis_client.srem.assert_called_once_with("incidents:active", incident_id)
    
    @pytest.mark.asyncio
    async def test_remove_incident_failure(self, incident_registry, mock_redis_client):
        """Test incident removal failure"""
        mock_redis_client.delete.side_effect = Exception("Redis error")
        
        # Should not raise exception
        await incident_registry.remove_incident("test_incident_123")
    
    @pytest.mark.asyncio
    async def test_get_nearby_incidents_success(self, incident_registry, mock_redis_client):
        """Test successful nearby incidents retrieval"""
        # Mock Redis GEO query results
        mock_redis_client.georadius.return_value = [
            ("incident_001", 2.5),
            ("incident_002", 5.1)
        ]
        
        # Mock incident data
        incident_data_1 = {
            "case_id": "incident_001",
            "emergency_type": "Fire",
            "location": "Location 1"
        }
        incident_data_2 = {
            "case_id": "incident_002",
            "emergency_type": "Police",
            "location": "Location 2"
        }
        
        mock_redis_client.get.side_effect = [
            json.dumps(incident_data_1),
            json.dumps(incident_data_2)
        ]
        
        incidents = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=10.0, limit=5
        )
        
        assert len(incidents) == 2
        assert incidents[0]["case_id"] == "incident_001"
        assert incidents[0]["distance_km"] == 2.5
        assert incidents[1]["case_id"] == "incident_002"
        assert incidents[1]["distance_km"] == 5.1
        
        # Verify Redis operations
        mock_redis_client.georadius.assert_called_once()
        georadius_args = mock_redis_client.georadius.call_args
        assert georadius_args[0][0] == "incidents:geo"
        assert georadius_args[0][1] == -83.7430  # lon
        assert georadius_args[0][2] == 42.2808   # lat
        assert georadius_args[0][3] == 10.0      # radius
    
    @pytest.mark.asyncio
    async def test_get_nearby_incidents_no_incidents(self, incident_registry, mock_redis_client):
        """Test nearby incidents retrieval when no incidents found"""
        mock_redis_client.georadius.return_value = []
        
        incidents = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=10.0
        )
        
        assert incidents == []
    
    @pytest.mark.asyncio
    async def test_get_nearby_incidents_invalid_json(self, incident_registry, mock_redis_client):
        """Test nearby incidents retrieval with invalid JSON data"""
        mock_redis_client.georadius.return_value = [("incident_001", 2.5)]
        mock_redis_client.get.return_value = "invalid json"
        
        incidents = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=10.0
        )
        
        assert incidents == []
    
    @pytest.mark.asyncio
    async def test_get_nearby_incidents_failure(self, incident_registry, mock_redis_client):
        """Test nearby incidents retrieval failure"""
        mock_redis_client.georadius.side_effect = Exception("Redis error")
        
        incidents = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=10.0
        )
        
        assert incidents == []
    
    @pytest.mark.asyncio
    async def test_get_nearby_incidents_with_limit(self, incident_registry, mock_redis_client):
        """Test nearby incidents retrieval with limit"""
        mock_redis_client.georadius.return_value = [
            ("incident_001", 1.0),
            ("incident_002", 2.0),
            ("incident_003", 3.0)
        ]
        
        mock_redis_client.get.return_value = json.dumps({"case_id": "test"})
        
        incidents = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=10.0, limit=2
        )
        
        # Should respect the limit
        assert len(incidents) <= 2
    
    @pytest.mark.asyncio
    async def test_close_connection(self, incident_registry, mock_redis_client):
        """Test connection closure"""
        await incident_registry.close()
        
        mock_redis_client.close.assert_called_once()
    
    def test_incident_registry_key_structure(self, incident_registry):
        """Test that registry uses correct key structure"""
        assert incident_registry.geo_key == "incidents:geo"
        assert incident_registry.data_key_prefix == "incident:data:"
        assert incident_registry.active_set_key == "incidents:active"
    
    @pytest.mark.asyncio
    async def test_incident_registry_integration_flow(self, incident_registry, mock_redis_client):
        """Test complete integration flow: add, query, remove"""
        # Add incident
        incident = {
            "case_id": "integration_test_001",
            "emergency_type": "Fire",
            "location": "Test Location",
            "latitude": 42.2808,
            "longitude": -83.7430
        }
        
        mock_redis_client.geoadd.return_value = 1
        mock_redis_client.set.return_value = True
        mock_redis_client.sadd.return_value = 1
        
        success = await incident_registry.add_active_incident(incident)
        assert success is True
        
        # Query nearby incidents
        mock_redis_client.georadius.return_value = [("integration_test_001", 0.5)]
        mock_redis_client.get.return_value = json.dumps(incident)
        
        nearby = await incident_registry.get_nearby_incidents(
            lat=42.2808, lon=-83.7430, radius_km=1.0
        )
        
        assert len(nearby) == 1
        assert nearby[0]["case_id"] == "integration_test_001"
        assert nearby[0]["distance_km"] == 0.5
        
        # Remove incident
        await incident_registry.remove_incident("integration_test_001")
        
        # Verify all operations were called
        mock_redis_client.geoadd.assert_called_once()
        mock_redis_client.set.assert_called_once()
        mock_redis_client.sadd.assert_called_once()
        mock_redis_client.georadius.assert_called_once()
        mock_redis_client.get.assert_called_once()
        mock_redis_client.delete.assert_called_once()
        mock_redis_client.zrem.assert_called_once()
        mock_redis_client.srem.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
