"""
Comprehensive test suite for Unit Agents (Police, Fire, EMS)

Tests the unit agents' intelligent bidding capabilities and incident polling.
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
    from agents.unit_police import (
        IntelligentBidRequest,
        IntelligentBidResponse,
        police_unit_state,
        intelligent_unit
    )
    from agents.intelligent_unit_base import IntelligentUnitBase

class TestUnitAgents:
    """Test cases for unit agent functionality"""
    
    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client"""
        mock_client = Mock()
        mock_client.ping = Mock()
        mock_client.from_url = Mock(return_value=mock_client)
        mock_client.close = Mock()
        return mock_client
    
    @pytest.fixture
    def mock_incident_registry(self):
        """Create a mock incident registry"""
        mock_registry = Mock()
        mock_registry.get_nearby_incidents = AsyncMock(return_value=[])
        return mock_registry
    
    @pytest.fixture
    def sample_incident_details(self):
        """Create sample incident details for testing"""
        return {
            "case_id": str(uuid4()),
            "emergency_type": "Fire",
            "location": "123 Main St, Ann Arbor, MI",
            "latitude": 42.2808,
            "longitude": -83.7430,
            "is_active_threat": True,
            "details": "Building fire with smoke visible",
            "people_involved": 5
        }
    
    def test_intelligent_bid_request_model(self):
        """Test IntelligentBidRequest model structure"""
        request = IntelligentBidRequest(
            incident_id="test_123",
            incident_details={"emergency_type": "Fire"},
            request_timestamp=datetime.now().isoformat()
        )
        
        assert request.incident_id == "test_123"
        assert request.incident_details["emergency_type"] == "Fire"
        assert isinstance(request.request_timestamp, str)
    
    def test_intelligent_bid_response_model(self):
        """Test IntelligentBidResponse model structure"""
        response = IntelligentBidResponse(
            unit_id="POLICE_001",
            incident_id="test_123",
            bid_score=85.5,
            intelligence_used={"strategic_insights_count": 2},
            strategic_insights_count=2,
            eta_minutes=8,
            strategic_advice="Good location for police response",
            processing_time_ms=150
        )
        
        assert response.unit_id == "POLICE_001"
        assert response.incident_id == "test_123"
        assert response.bid_score == 85.5
        assert response.strategic_insights_count == 2
        assert response.eta_minutes == 8
        assert response.processing_time_ms == 150
    
    def test_police_unit_state_initialization(self):
        """Test police unit state initialization"""
        assert police_unit_state["unit_id"] == "POLICE_PATROL_001"
        assert police_unit_state["status"] == "Available"
        assert police_unit_state["location"]["lat"] == 37.7849
        assert police_unit_state["location"]["lon"] == -122.4094
        assert police_unit_state["assigned_officer_id"] == "OFFICER_001"
    
    def test_intelligent_unit_initialization(self):
        """Test intelligent unit base initialization"""
        assert intelligent_unit.unit_id == "POLICE_PATROL_001"
        assert intelligent_unit.unit_type == "police"
        assert intelligent_unit.knowledge_client is not None
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_waze_simulation(self):
        """Test Waze route data simulation"""
        destination_coords = (42.2808, -83.7430)  # Ann Arbor
        
        waze_data = await intelligent_unit._get_waze_route_data(destination_coords)
        
        assert "eta_minutes" in waze_data
        assert "traffic_level" in waze_data
        assert "hazards" in waze_data
        assert isinstance(waze_data["eta_minutes"], int)
        assert waze_data["eta_minutes"] > 0
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_bid_calculation(self, sample_incident_details):
        """Test intelligent bid calculation"""
        current_location = {"lat": 42.2850, "lon": -83.7500}  # Near Ann Arbor
        
        bid_result = await intelligent_unit.calculate_bid_for_incident(
            incident_details=sample_incident_details,
            current_location=current_location
        )
        
        assert "bid_score" in bid_result
        assert "intelligence_used" in bid_result
        assert "strategic_advice" in bid_result
        assert "eta_minutes" in bid_result
        
        assert isinstance(bid_result["bid_score"], float)
        assert bid_result["bid_score"] >= 0
        assert isinstance(bid_result["eta_minutes"], int)
        assert bid_result["eta_minutes"] > 0
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_bid_calculation_with_strategic_advice(self, sample_incident_details):
        """Test bid calculation with strategic advice from knowledge base"""
        # Mock knowledge client to return strategic advice
        with patch.object(intelligent_unit.knowledge_client, 'query_knowledge') as mock_query:
            mock_doc = Mock()
            mock_doc.page_content = "This area has frequent traffic congestion. Consider alternative routes."
            mock_query.return_value = [mock_doc]
            
            current_location = {"lat": 42.2850, "lon": -83.7500}
            
            bid_result = await intelligent_unit.calculate_bid_for_incident(
                incident_details=sample_incident_details,
                current_location=current_location
            )
            
            assert "strategic_advice" in bid_result
            assert len(bid_result["strategic_advice"]) > 0
            assert "congestion" in bid_result["strategic_advice"].lower()
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_bid_calculation_with_hazards(self, sample_incident_details):
        """Test bid calculation with traffic hazards"""
        # Mock Waze data with hazards
        with patch.object(intelligent_unit, '_get_waze_route_data') as mock_waze:
            mock_waze.return_value = {
                "eta_minutes": 15,
                "traffic_level": "heavy",
                "hazards": ["accident_ahead", "road_closure"]
            }
            
            current_location = {"lat": 42.2850, "lon": -83.7500}
            
            bid_result = await intelligent_unit.calculate_bid_for_incident(
                incident_details=sample_incident_details,
                current_location=current_location
            )
            
            # Should have lower score due to hazards
            assert bid_result["bid_score"] < 100.0
            assert bid_result["intelligence_used"]["waze_data"]["hazards"] == ["accident_ahead", "road_closure"]
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_bid_calculation_emergency_type_mapping(self):
        """Test bid calculation for different emergency types"""
        emergency_types = ["Fire", "Police", "Medical", "Other"]
        
        for emergency_type in emergency_types:
            incident_details = {
                "case_id": str(uuid4()),
                "emergency_type": emergency_type,
                "location": "Test Location",
                "latitude": 42.2808,
                "longitude": -83.7430
            }
            
            current_location = {"lat": 42.2850, "lon": -83.7500}
            
            bid_result = await intelligent_unit.calculate_bid_for_incident(
                incident_details=incident_details,
                current_location=current_location
            )
            
            assert "bid_score" in bid_result
            assert bid_result["bid_score"] >= 0
    
    @pytest.mark.asyncio
    async def test_handle_intelligent_bid_request_success(self, sample_incident_details):
        """Test successful intelligent bid request handling"""
        # Mock the intelligent unit calculation
        with patch.object(intelligent_unit, 'calculate_bid_for_incident') as mock_calculate:
            mock_calculate.return_value = {
                "bid_score": 85.5,
                "intelligence_used": {"strategic_insights_count": 2},
                "strategic_advice": "Good location for police response",
                "eta_minutes": 8
            }
            
            # Mock context and sender
            mock_ctx = Mock()
            mock_ctx.logger = Mock()
            mock_ctx.send = AsyncMock()
            
            request = IntelligentBidRequest(
                incident_id="test_123",
                incident_details=sample_incident_details,
                request_timestamp=datetime.now().isoformat()
            )
            
            # Import the handler function
            from agents.unit_police import handle_intelligent_bid_request
            
            await handle_intelligent_bid_request(mock_ctx, "test_sender", request)
            
            # Verify the response was sent
            mock_ctx.send.assert_called_once()
            response = mock_ctx.send.call_args[0][1]
            assert response.unit_id == "POLICE_PATROL_001"
            assert response.incident_id == "test_123"
            assert response.bid_score == 85.5
    
    @pytest.mark.asyncio
    async def test_handle_intelligent_bid_request_error(self, sample_incident_details):
        """Test intelligent bid request handling with error"""
        # Mock the intelligent unit calculation to raise an error
        with patch.object(intelligent_unit, 'calculate_bid_for_incident') as mock_calculate:
            mock_calculate.side_effect = Exception("Calculation error")
            
            # Mock context and sender
            mock_ctx = Mock()
            mock_ctx.logger = Mock()
            mock_ctx.send = AsyncMock()
            
            request = IntelligentBidRequest(
                incident_id="test_123",
                incident_details=sample_incident_details,
                request_timestamp=datetime.now().isoformat()
            )
            
            # Import the handler function
            from agents.unit_police import handle_intelligent_bid_request
            
            await handle_intelligent_bid_request(mock_ctx, "test_sender", request)
            
            # Verify error response was sent
            mock_ctx.send.assert_called_once()
            response = mock_ctx.send.call_args[0][1]
            assert response.bid_score == 0
            assert "error" in response.intelligence_used
    
    @pytest.mark.asyncio
    async def test_poll_nearby_incidents_success(self, mock_redis_client, mock_incident_registry):
        """Test successful nearby incidents polling"""
        # Mock incident data
        mock_incidents = [
            {
                "case_id": "incident_001",
                "distance_km": 2.5,
                "emergency_type": "Fire"
            },
            {
                "case_id": "incident_002", 
                "distance_km": 5.1,
                "emergency_type": "Police"
            }
        ]
        mock_incident_registry.get_nearby_incidents.return_value = mock_incidents
        
        # Mock context
        mock_ctx = Mock()
        mock_ctx.logger = Mock()
        
        # Import the polling function
        from agents.unit_police import poll_nearby_incidents
        
        with patch('agents.unit_police.redis.from_url', return_value=mock_redis_client), \
             patch('agents.unit_police.incident_registry', mock_incident_registry):
            
            await poll_nearby_incidents(mock_ctx)
            
            # Verify incidents were logged
            assert mock_ctx.logger.info.call_count >= 2
    
    @pytest.mark.asyncio
    async def test_poll_nearby_incidents_error(self, mock_redis_client):
        """Test nearby incidents polling with error"""
        # Mock Redis to raise an error
        mock_redis_client.from_url.side_effect = Exception("Redis error")
        
        # Mock context
        mock_ctx = Mock()
        mock_ctx.logger = Mock()
        
        # Import the polling function
        from agents.unit_police import poll_nearby_incidents
        
        await poll_nearby_incidents(mock_ctx)
        
        # Verify error was logged
        mock_ctx.logger.error.assert_called()
    
    def test_police_unit_state_updates(self):
        """Test police unit state update functionality"""
        # Test status update
        original_status = police_unit_state["status"]
        police_unit_state["status"] = "En_Route"
        assert police_unit_state["status"] == "En_Route"
        
        # Test location update
        original_lat = police_unit_state["location"]["lat"]
        police_unit_state["location"]["lat"] = 42.3000
        assert police_unit_state["location"]["lat"] == 42.3000
        
        # Restore original values
        police_unit_state["status"] = original_status
        police_unit_state["location"]["lat"] = original_lat
    
    @pytest.mark.asyncio
    async def test_intelligent_unit_knowledge_client_integration(self):
        """Test integration with knowledge client"""
        # Mock knowledge client methods
        with patch.object(intelligent_unit.knowledge_client, 'query_knowledge') as mock_query:
            mock_doc = Mock()
            mock_doc.page_content = "Strategic insight for this location"
            mock_query.return_value = [mock_doc]
            
            incident_details = {
                "case_id": str(uuid4()),
                "emergency_type": "Fire",
                "location": "Test Location",
                "latitude": 42.2808,
                "longitude": -83.7430
            }
            
            current_location = {"lat": 42.2850, "lon": -83.7500}
            
            bid_result = await intelligent_unit.calculate_bid_for_incident(
                incident_details=incident_details,
                current_location=current_location
            )
            
            # Verify knowledge client was queried
            mock_query.assert_called_once()
            query_args = mock_query.call_args[0]
            assert "Fire" in query_args[0]
            assert "Test Location" in query_args[0]
            
            # Verify strategic advice was included
            assert "strategic_advice" in bid_result
            assert len(bid_result["strategic_advice"]) > 0

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
