"""
Test suite for Vapi Conversational Intake Agent

Tests the intake agent's ability to process incident facts from Vapi
and register them in the incident registry.
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

# Mock uagents before importing the agent
with patch.dict('sys.modules', {
    'uagents': Mock(),
    'uagents.Agent': Mock,
    'uagents.Context': Mock,
    'uagents.Model': Mock,
    'uagents.Protocol': Mock,
}):
    from agents.vapi_conversational_intake import (
        IncidentFactCompleted,
        IncidentProcessingRequest,
        MessageAcknowledgment,
        ErrorAcknowledgment,
        send_area_alert_to_nearby_units,
        register_incident_in_registry,
        store_incident_in_redis,
        publish_incident_to_queue,
        publish_completion_log
    )
    from app.schemas.incident_schema import IncidentFact

class TestIntakeAgent:
    """Test cases for the intake agent functionality"""
    
    @pytest.fixture
    def sample_incident_fact(self):
        """Create a sample incident fact for testing"""
        return IncidentFact(
            case_id=uuid4(),
            emergency_type="Fire",
            location="123 Main St, Ann Arbor, MI",
            latitude=42.2808,
            longitude=-83.7430,
            is_active_threat=True,
            details="Building fire with smoke visible",
            people_involved=5,
            callback_number="+15551234567",
            timestamp=datetime.now()
        )
    
    @pytest.fixture
    def sample_incident_data(self, sample_incident_fact):
        """Convert incident fact to dictionary format"""
        return {
            "case_id": str(sample_incident_fact.case_id),
            "emergency_type": sample_incident_fact.emergency_type,
            "location": sample_incident_fact.location,
            "latitude": sample_incident_fact.latitude,
            "longitude": sample_incident_fact.longitude,
            "is_active_threat": sample_incident_fact.is_active_threat,
            "details": sample_incident_fact.details,
            "people_involved": sample_incident_fact.people_involved,
            "timestamp": sample_incident_fact.timestamp.isoformat()
        }
    
    @pytest.mark.asyncio
    async def test_register_incident_in_registry_success(self, sample_incident_fact):
        """Test successful incident registration in Redis registry"""
        with patch('agents.vapi_conversational_intake.incident_registry') as mock_registry:
            mock_registry.add_active_incident = AsyncMock(return_value=True)
            
            await register_incident_in_registry(sample_incident_fact)
            
            mock_registry.add_active_incident.assert_called_once()
            call_args = mock_registry.add_active_incident.call_args[0][0]
            assert call_args["case_id"] == str(sample_incident_fact.case_id)
            assert call_args["emergency_type"] == "Fire"
            assert call_args["latitude"] == 42.2808
            assert call_args["longitude"] == -83.7430
    
    @pytest.mark.asyncio
    async def test_register_incident_in_registry_failure(self, sample_incident_fact):
        """Test incident registration failure handling"""
        with patch('agents.vapi_conversational_intake.incident_registry') as mock_registry:
            mock_registry.add_active_incident = AsyncMock(return_value=False)
            
            # Should not raise exception, just log warning
            await register_incident_in_registry(sample_incident_fact)
            
            mock_registry.add_active_incident.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_register_incident_in_registry_exception(self, sample_incident_fact):
        """Test incident registration exception handling"""
        with patch('agents.vapi_conversational_intake.incident_registry') as mock_registry:
            mock_registry.add_active_incident = AsyncMock(side_effect=Exception("Redis error"))
            
            # Should not raise exception, just log error
            await register_incident_in_registry(sample_incident_fact)
            
            mock_registry.add_active_incident.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_store_incident_in_redis_success(self, sample_incident_fact):
        """Test successful incident storage in Redis"""
        mock_redis = AsyncMock()
        mock_redis.setex = AsyncMock()
        mock_redis.lpush = AsyncMock()
        
        with patch('agents.vapi_conversational_intake.redis_client', mock_redis):
            await store_incident_in_redis(
                "test_call_123", 
                sample_incident_fact, 
                "Test conversation summary"
            )
            
            # Verify Redis operations
            mock_redis.setex.assert_called_once()
            mock_redis.lpush.assert_called_once_with("incidents:completed", "test_call_123")
    
    @pytest.mark.asyncio
    async def test_store_incident_in_redis_exception(self, sample_incident_fact):
        """Test Redis storage exception handling"""
        mock_redis = AsyncMock()
        mock_redis.setex = AsyncMock(side_effect=Exception("Redis connection error"))
        
        with patch('agents.vapi_conversational_intake.redis_client', mock_redis):
            # Should not raise exception, just log error
            await store_incident_in_redis(
                "test_call_123", 
                sample_incident_fact, 
                "Test conversation summary"
            )
    
    @pytest.mark.asyncio
    async def test_publish_incident_to_queue_success(self, sample_incident_fact):
        """Test successful incident publishing to Redis queue"""
        mock_redis = AsyncMock()
        mock_redis.lpush = AsyncMock()
        
        with patch('agents.vapi_conversational_intake.redis_client', mock_redis):
            await publish_incident_to_queue(
                "test_call_123", 
                sample_incident_fact, 
                "Test conversation summary"
            )
            
            mock_redis.lpush.assert_called_once()
            call_args = mock_redis.lpush.call_args[0]
            assert call_args[0] == "incident_queue"
            incident_data = json.loads(call_args[1])
            assert incident_data["incident_fact"]["emergency_type"] == "Fire"
    
    @pytest.mark.asyncio
    async def test_publish_completion_log_success(self, sample_incident_fact):
        """Test successful completion log publishing"""
        mock_redis = AsyncMock()
        mock_redis.publish = AsyncMock()
        
        with patch('agents.vapi_conversational_intake.redis_client', mock_redis):
            await publish_completion_log("test_call_123", sample_incident_fact)
            
            mock_redis.publish.assert_called_once()
            call_args = mock_redis.publish.call_args[0]
            assert call_args[0] == "log_queue"
            log_data = json.loads(call_args[1])
            assert log_data["action"] == "incident_processed"
            assert log_data["case_id"] == str(sample_incident_fact.case_id)
    
    def test_incident_processing_request_model(self):
        """Test IncidentProcessingRequest model structure"""
        request = IncidentProcessingRequest(
            call_id="test_call_123",
            incident_fact=IncidentFact(
                case_id=uuid4(),
                emergency_type="Medical",
                location="Test Location",
                latitude=0.0,
                longitude=0.0
            ),
            conversation_summary="Test summary"
        )
        
        assert request.call_id == "test_call_123"
        assert request.incident_fact.emergency_type == "Medical"
        assert request.conversation_summary == "Test summary"
    
    def test_message_acknowledgment_model(self):
        """Test MessageAcknowledgment model structure"""
        ack = MessageAcknowledgment(
            message_id="test_123",
            status="processed",
            timestamp=datetime.now()
        )
        
        assert ack.message_id == "test_123"
        assert ack.status == "processed"
        assert isinstance(ack.timestamp, datetime)
    
    def test_error_acknowledgment_model(self):
        """Test ErrorAcknowledgment model structure"""
        error_ack = ErrorAcknowledgment(
            message_id="test_123",
            error="Test error message",
            timestamp=datetime.now()
        )
        
        assert error_ack.message_id == "test_123"
        assert error_ack.error == "Test error message"
        assert isinstance(error_ack.timestamp, datetime)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
