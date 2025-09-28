"""
End-to-End Test: Vapi Conversational Intake to Comms Agent

This test simulates the complete flow from incident intake through
to communication with the caller, including frontend notifications.
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
    from agents.vapi_conversational_intake import (
        IncidentFactCompleted,
        IncidentProcessingRequest,
        handle_incident_processing,
        store_incident_in_redis,
        publish_incident_to_queue,
        publish_completion_log,
        register_incident_in_registry,
        notify_frontend_incident_completed
    )
    from agents.comms_agent import CommsAgent
    from app.schemas.incident_schema import IncidentFact

class TestIntakeCommsE2E:
    """End-to-end test cases for intake to comms flow"""
    
    @pytest.fixture
    def sample_incident_fact(self):
        """Create a complete sample incident fact"""
        return IncidentFact(
            case_id=uuid4(),
            emergency_type="Fire",
            location="123 Main St, Ann Arbor, MI",
            latitude=42.2808,
            longitude=-83.7430,
            is_active_threat=True,
            details="Building fire with smoke visible from second floor",
            people_involved=3,
            callback_number="+15551234567",
            timestamp=datetime.now()
        )
    
    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client"""
        mock_client = Mock()
        mock_client.setex = AsyncMock()
        mock_client.lpush = AsyncMock()
        mock_client.publish = AsyncMock()
        mock_client.ping = Mock()
        mock_client.close = Mock()
        return mock_client
    
    @pytest.fixture
    def mock_incident_registry(self):
        """Create a mock incident registry"""
        mock_registry = Mock()
        mock_registry.add_active_incident = AsyncMock(return_value=True)
        return mock_registry
    
    @pytest.fixture
    def mock_vapi_service(self):
        """Create a mock Vapi service"""
        mock_service = Mock()
        mock_service.send_update = AsyncMock(return_value={"success": True, "message": "Mock SMS sent"})
        mock_service.send_dispatch_notification = AsyncMock(return_value={"success": True, "message": "Mock notification sent"})
        mock_service.send_status_update = AsyncMock(return_value={"success": True, "message": "Mock status update sent"})
        return mock_service
    
    @pytest.fixture
    def mock_frontend_broadcast(self):
        """Create mock frontend broadcast functions"""
        mock_broadcast = Mock()
        mock_broadcast.broadcast_fact_update = AsyncMock()
        mock_broadcast.broadcast_comms_message = AsyncMock()
        mock_broadcast.broadcast_transcript_update = AsyncMock()
        return mock_broadcast
    
    @pytest.mark.asyncio
    async def test_complete_intake_to_comms_flow(self, sample_incident_fact, mock_redis_client, mock_incident_registry, mock_vapi_service, mock_frontend_broadcast):
        """Test the complete flow from intake to comms with all integrations"""
        
        # Mock all external dependencies
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis_client), \
             patch('agents.vapi_conversational_intake.incident_registry', mock_incident_registry), \
             patch('agents.vapi_conversational_intake.broadcast_fact_update', mock_frontend_broadcast.broadcast_fact_update), \
             patch('agents.vapi_conversational_intake.broadcast_comms_message', mock_frontend_broadcast.broadcast_comms_message), \
             patch('agents.vapi_conversational_intake.broadcast_transcript_update', mock_frontend_broadcast.broadcast_transcript_update), \
             patch('agents.comms_agent.vapi_service', mock_vapi_service), \
             patch('agents.comms_agent.redis.from_url', return_value=mock_redis_client):
            
            # Step 1: Process incident through intake agent
            call_id = "test_call_123"
            conversation_summary = "Caller reported building fire with visible smoke"
            
            # Create processing request
            processing_request = IncidentProcessingRequest(
                call_id=call_id,
                incident_fact=sample_incident_fact,
                conversation_summary=conversation_summary
            )
            
            # Mock context and sender
            mock_ctx = Mock()
            mock_ctx.send = AsyncMock()
            mock_sender = "test_sender"
            
            # Process the incident
            await handle_incident_processing(mock_ctx, mock_sender, processing_request)
            
            # Verify Redis operations
            assert mock_redis_client.setex.called, "Incident should be stored in Redis"
            assert mock_redis_client.lpush.called, "Incident should be added to incidents list"
            assert mock_redis_client.publish.called, "Log should be published to log queue"
            
            # Verify incident registry
            mock_incident_registry.add_active_incident.assert_called_once()
            
            # Verify frontend notifications
            mock_frontend_broadcast.broadcast_fact_update.assert_called()
            mock_frontend_broadcast.broadcast_comms_message.assert_called()
            
            # Step 2: Process log through Comms Agent
            comms_agent = CommsAgent()
            comms_agent.redis_client = mock_redis_client
            
            # Mock log data that would be received from Redis
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "incident_completed",
                "case_id": call_id,
                "emergency_type": sample_incident_fact.emergency_type,
                "location": sample_incident_fact.location,
                "callback_number": sample_incident_fact.callback_number,
                "incident_data": {
                    "call_id": call_id,
                    "incident_fact": sample_incident_fact.model_dump()
                }
            }
            
            # Process the log
            await comms_agent.process_log(log_data)
            
            # Verify Comms Agent operations
            # Note: In a real test, we would verify Supabase logging and SMS sending
            # For now, we verify the log processing doesn't raise exceptions
            
            print("✅ Complete intake to comms flow test passed")
    
    @pytest.mark.asyncio
    async def test_incident_storage_in_redis(self, sample_incident_fact, mock_redis_client):
        """Test incident storage in Redis"""
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis_client):
            call_id = "test_call_123"
            conversation_summary = "Test conversation"
            
            await store_incident_in_redis(call_id, sample_incident_fact, conversation_summary)
            
            # Verify Redis operations
            mock_redis_client.setex.assert_called_once()
            mock_redis_client.lpush.assert_called_once()
            
            # Verify the stored data structure
            setex_args = mock_redis_client.setex.call_args
            assert setex_args[0][0] == f"incident:{call_id}"
            assert setex_args[0][1] == 86400  # 24 hours
            
            stored_data = json.loads(setex_args[0][2])
            assert stored_data["call_id"] == call_id
            assert stored_data["status"] == "completed"
            assert "incident_fact" in stored_data
    
    @pytest.mark.asyncio
    async def test_incident_queue_publishing(self, sample_incident_fact, mock_redis_client):
        """Test incident publishing to queue"""
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis_client):
            call_id = "test_call_123"
            conversation_summary = "Test conversation"
            
            await publish_incident_to_queue(call_id, sample_incident_fact, conversation_summary)
            
            # Verify Redis publish
            mock_redis_client.publish.assert_called_once()
            publish_args = mock_redis_client.publish.call_args
            assert publish_args[0][0] == "incident_queue"
            
            published_data = json.loads(publish_args[0][1])
            assert published_data["call_id"] == call_id
            assert published_data["status"] == "ready_for_dispatch"
    
    @pytest.mark.asyncio
    async def test_completion_log_publishing(self, sample_incident_fact, mock_redis_client):
        """Test completion log publishing"""
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis_client):
            call_id = "test_call_123"
            
            await publish_completion_log(call_id, sample_incident_fact)
            
            # Verify Redis publish
            mock_redis_client.publish.assert_called_once()
            publish_args = mock_redis_client.publish.call_args
            assert publish_args[0][0] == "log_queue"
            
            log_data = json.loads(publish_args[0][1])
            assert log_data["action"] == "incident_completed"
            assert log_data["case_id"] == call_id
            assert log_data["emergency_type"] == sample_incident_fact.emergency_type
    
    @pytest.mark.asyncio
    async def test_incident_registry_registration(self, sample_incident_fact, mock_incident_registry):
        """Test incident registration in active registry"""
        with patch('agents.vapi_conversational_intake.incident_registry', mock_incident_registry):
            await register_incident_in_registry(sample_incident_fact)
            
            # Verify registry call
            mock_incident_registry.add_active_incident.assert_called_once()
            
            # Verify incident data structure
            call_args = mock_incident_registry.add_active_incident.call_args[0][0]
            assert call_args["case_id"] == str(sample_incident_fact.case_id)
            assert call_args["emergency_type"] == sample_incident_fact.emergency_type
            assert call_args["location"] == sample_incident_fact.location
            assert call_args["latitude"] == sample_incident_fact.latitude
            assert call_args["longitude"] == sample_incident_fact.longitude
    
    @pytest.mark.asyncio
    async def test_frontend_notifications(self, sample_incident_fact, mock_frontend_broadcast):
        """Test frontend notification broadcasting"""
        with patch('agents.vapi_conversational_intake.broadcast_fact_update', mock_frontend_broadcast.broadcast_fact_update), \
             patch('agents.vapi_conversational_intake.broadcast_comms_message', mock_frontend_broadcast.broadcast_comms_message):
            
            call_id = "test_call_123"
            
            await notify_frontend_incident_completed(call_id, sample_incident_fact)
            
            # Verify frontend notifications
            mock_frontend_broadcast.broadcast_fact_update.assert_called_once()
            mock_frontend_broadcast.broadcast_comms_message.assert_called_once()
            
            # Verify fact update data
            fact_update_args = mock_frontend_broadcast.broadcast_fact_update.call_args
            assert fact_update_args[0][0] == call_id
            fact_data = fact_update_args[0][1]
            assert fact_data["status"] == "completed"
            assert "incident_fact" in fact_data
            
            # Verify comms message data
            comms_args = mock_frontend_broadcast.broadcast_comms_message.call_args
            assert comms_args[0][0] == call_id
            comms_data = comms_args[0][1]
            assert comms_data["type"] == "incident_processed"
            assert "emergency" in comms_data["message"]
    
    @pytest.mark.asyncio
    async def test_comms_agent_log_processing(self, mock_redis_client, mock_vapi_service):
        """Test Comms Agent log processing"""
        with patch('agents.comms_agent.redis.from_url', return_value=mock_redis_client), \
             patch('agents.comms_agent.vapi_service', mock_vapi_service):
            
            comms_agent = CommsAgent()
            comms_agent.redis_client = mock_redis_client
            
            # Test log that should trigger notification
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "unit_dispatched",
                "case_id": "test_call_123",
                "unit_id": "POLICE_001",
                "unit_type": "Police",
                "distance_km": 2.5,
                "incident_data": {
                    "incident_fact": {
                        "callback_number": "+15551234567",
                        "emergency_type": "Fire",
                        "location": "123 Main St"
                    }
                }
            }
            
            # Process the log
            await comms_agent.process_log(log_data)
            
            # Verify notification was sent
            mock_vapi_service.send_dispatch_notification.assert_called_once()
            
            # Verify notification parameters
            call_args = mock_vapi_service.send_dispatch_notification.call_args
            assert call_args[0][0] == "+15551234567"  # phone number
            assert "unit_id" in call_args[0][1]  # unit_info
            assert "emergency_type" in call_args[0][2]  # incident_info
    
    @pytest.mark.asyncio
    async def test_comms_agent_sms_sending(self, mock_redis_client, mock_vapi_service):
        """Test Comms Agent SMS sending functionality"""
        with patch('agents.comms_agent.redis.from_url', return_value=mock_redis_client), \
             patch('agents.comms_agent.vapi_service', mock_vapi_service):
            
            comms_agent = CommsAgent()
            comms_agent.redis_client = mock_redis_client
            
            # Test log that should trigger SMS
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "dispatch_failed",
                "case_id": "test_call_123",
                "incident_data": {
                    "incident_fact": {
                        "callback_number": "+15551234567",
                        "emergency_type": "Fire",
                        "location": "123 Main St"
                    }
                }
            }
            
            # Process the log
            await comms_agent.process_log(log_data)
            
            # Verify SMS was sent
            mock_vapi_service.send_update.assert_called_once()
            
            # Verify SMS parameters
            call_args = mock_vapi_service.send_update.call_args
            assert call_args[0][0] == "+15551234567"  # phone number
            assert "unable to dispatch" in call_args[0][1]  # message
            assert call_args[0][2] == "call"  # call type
    
    @pytest.mark.asyncio
    async def test_error_handling_flow(self, sample_incident_fact, mock_redis_client):
        """Test error handling throughout the flow"""
        # Test Redis connection error
        mock_redis_client.setex.side_effect = Exception("Redis error")
        
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis_client):
            call_id = "test_call_123"
            conversation_summary = "Test conversation"
            
            # Should not raise exception
            await store_incident_in_redis(call_id, sample_incident_fact, conversation_summary)
            
            # Test incident registry error
            with patch('agents.vapi_conversational_intake.incident_registry') as mock_registry:
                mock_registry.add_active_incident.side_effect = Exception("Registry error")
                
                # Should not raise exception
                await register_incident_in_registry(sample_incident_fact)
    
    @pytest.mark.asyncio
    async def test_mock_data_integration(self):
        """Test with realistic mock data"""
        # Create realistic incident data
        incident_fact = IncidentFact(
            case_id=uuid4(),
            emergency_type="Medical",
            location="456 Oak Ave, San Francisco, CA",
            latitude=37.7749,
            longitude=-122.4194,
            is_active_threat=False,
            details="Person collapsed on sidewalk, unconscious",
            people_involved=1,
            callback_number="+14155551234",
            timestamp=datetime.now()
        )
        
        # Mock all services
        mock_redis = Mock()
        mock_redis.setex = AsyncMock()
        mock_redis.lpush = AsyncMock()
        mock_redis.publish = AsyncMock()
        
        mock_registry = Mock()
        mock_registry.add_active_incident = AsyncMock(return_value=True)
        
        mock_vapi = Mock()
        mock_vapi.send_update = AsyncMock(return_value={"success": True})
        
        # Test complete flow
        with patch('agents.vapi_conversational_intake.redis.from_url', return_value=mock_redis), \
             patch('agents.vapi_conversational_intake.incident_registry', mock_registry), \
             patch('agents.comms_agent.vapi_service', mock_vapi):
            
            # Simulate intake processing
            call_id = "realistic_call_456"
            conversation_summary = "Caller reported medical emergency, person unconscious"
            
            await store_incident_in_redis(call_id, incident_fact, conversation_summary)
            await publish_incident_to_queue(call_id, incident_fact, conversation_summary)
            await publish_completion_log(call_id, incident_fact)
            await register_incident_in_registry(incident_fact)
            
            # Simulate comms processing
            comms_agent = CommsAgent()
            comms_agent.redis_client = mock_redis
            
            log_data = {
                "timestamp": datetime.now().isoformat(),
                "action": "incident_completed",
                "case_id": call_id,
                "emergency_type": incident_fact.emergency_type,
                "location": incident_fact.location,
                "callback_number": incident_fact.callback_number,
                "incident_data": {
                    "call_id": call_id,
                    "incident_fact": incident_fact.model_dump()
                }
            }
            
            await comms_agent.process_log(log_data)
            
            print("✅ Mock data integration test passed")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
