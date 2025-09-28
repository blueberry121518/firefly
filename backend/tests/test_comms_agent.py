"""
Test Comms Agent

This test suite verifies that the Comms Agent correctly:
1. Logs entries to Supabase
2. Sends notifications via Vapi service
3. Handles different types of log entries
"""

import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

# Add backend directory to path
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.comms_agent import CommsAgent

class MockRedisClient:
    """Mock Redis client for testing"""
    
    def __init__(self):
        self.published_logs = []
    
    def ping(self):
        """Mock ping"""
        return True
    
    def pubsub(self):
        """Mock pubsub"""
        return MockPubSub()

class MockPubSub:
    """Mock Redis pub/sub for testing"""
    
    def __init__(self):
        self.subscribed_channels = []
        self.messages = []
    
    def subscribe(self, channel):
        """Mock subscribe"""
        self.subscribed_channels.append(channel)
    
    def get_message(self, timeout=None):
        """Mock get_message"""
        if self.messages:
            return self.messages.pop(0)
        return None
    
    def unsubscribe(self, channel):
        """Mock unsubscribe"""
        if channel in self.subscribed_channels:
            self.subscribed_channels.remove(channel)

class MockVapiService:
    """Mock Vapi service for testing"""
    
    def __init__(self):
        self.sent_notifications = []
        self.send_update_calls = []
        self.send_dispatch_notification_calls = []
        self.send_status_update_calls = []
    
    async def send_update(self, phone_number, message, call_type="call"):
        """Mock send_update"""
        self.send_update_calls.append({
            'phone_number': phone_number,
            'message': message,
            'call_type': call_type
        })
        return {'success': True, 'message': 'Mock notification sent'}
    
    async def send_dispatch_notification(self, phone_number, unit_info, incident_info):
        """Mock send_dispatch_notification"""
        self.send_dispatch_notification_calls.append({
            'phone_number': phone_number,
            'unit_info': unit_info,
            'incident_info': incident_info
        })
        return {'success': True, 'message': 'Mock dispatch notification sent'}
    
    async def send_status_update(self, phone_number, status, unit_info):
        """Mock send_status_update"""
        self.send_status_update_calls.append({
            'phone_number': phone_number,
            'status': status,
            'unit_info': unit_info
        })
        return {'success': True, 'message': 'Mock status update sent'}

@pytest.fixture
def mock_redis():
    """Create a mock Redis client"""
    return MockRedisClient()

@pytest.fixture
def mock_vapi_service():
    """Create a mock Vapi service"""
    return MockVapiService()

@pytest.fixture
def comms_agent(mock_redis, mock_vapi_service):
    """Create a CommsAgent with mocked dependencies"""
    agent = CommsAgent()
    agent.redis_client = mock_redis
    agent.pubsub = mock_redis.pubsub()
    
    # Mock the Vapi service
    with patch('agents.comms_agent.vapi_service', mock_vapi_service):
        yield agent

@pytest.fixture
def sample_log_data():
    """Sample log data for testing"""
    return {
        'timestamp': datetime.now().isoformat(),
        'action': 'unit_dispatched',
        'case_id': 'test-case-123',
        'unit_id': 'police_01',
        'unit_type': 'POLICE',
        'distance_km': 2.5,
        'incident_location': '123 Main Street, Ann Arbor, MI',
        'unit_location': [42.2808, -83.7430],
        'incident_data': {
            'call_id': 'test-call-123',
            'incident_fact': {
                'emergency_type': 'Police',
                'location': '123 Main Street, Ann Arbor, MI',
                'callback_number': '+1234567890',
                'severity': 'Medium'
            }
        }
    }

class TestCommsAgent:
    """Test cases for CommsAgent"""
    
    @pytest.mark.asyncio
    async def test_log_to_supabase_success(self, comms_agent, sample_log_data):
        """Test successful logging to Supabase"""
        with patch('httpx.AsyncClient') as mock_client:
            # Mock successful response
            mock_response = MagicMock()
            mock_response.status_code = 201
            mock_response.json.return_value = {'id': 'test-log-123'}
            
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            # Test logging
            result = await comms_agent.log_to_supabase(sample_log_data)
            
            assert result is True
            
            # Verify the request was made
            mock_client.return_value.__aenter__.return_value.post.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_log_to_supabase_failure(self, comms_agent, sample_log_data):
        """Test Supabase logging failure"""
        with patch('httpx.AsyncClient') as mock_client:
            # Mock failed response
            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_response.text = 'Internal Server Error'
            
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            # Test logging
            result = await comms_agent.log_to_supabase(sample_log_data)
            
            assert result is False
    
    @pytest.mark.asyncio
    async def test_log_to_supabase_no_config(self, comms_agent, sample_log_data):
        """Test Supabase logging when not configured"""
        # Remove Supabase configuration
        comms_agent.supabase_url = None
        comms_agent.supabase_key = None
        
        # Test logging (should return True for mock)
        result = await comms_agent.log_to_supabase(sample_log_data)
        
        assert result is True
    
    def test_should_send_notification(self, comms_agent):
        """Test notification decision logic"""
        # Test cases that should send notifications
        notification_actions = [
            'unit_dispatched',
            'unit_on_scene', 
            'unit_completed',
            'dispatch_failed'
        ]
        
        for action in notification_actions:
            log_data = {'action': action}
            result = asyncio.run(comms_agent.should_send_notification(log_data))
            assert result is True, f"Should send notification for action: {action}"
        
        # Test cases that should not send notifications
        non_notification_actions = [
            'incident_completed',
            'unit_available',
            'unknown_action'
        ]
        
        for action in non_notification_actions:
            log_data = {'action': action}
            result = asyncio.run(comms_agent.should_send_notification(log_data))
            assert result is False, f"Should not send notification for action: {action}"
    
    @pytest.mark.asyncio
    async def test_send_notification_dispatch(self, comms_agent, mock_vapi_service, sample_log_data):
        """Test sending dispatch notification"""
        # Test dispatch notification
        result = await comms_agent.send_notification(sample_log_data)
        
        assert result is True
        assert len(mock_vapi_service.send_dispatch_notification_calls) == 1
        
        call = mock_vapi_service.send_dispatch_notification_calls[0]
        assert call['phone_number'] == '+1234567890'
        assert 'unit_info' in call
        assert 'incident_info' in call
    
    @pytest.mark.asyncio
    async def test_send_notification_status_update(self, comms_agent, mock_vapi_service):
        """Test sending status update notification"""
        # Test on_scene status
        log_data = {
            'action': 'unit_on_scene',
            'unit_id': 'police_01',
            'unit_type': 'POLICE',
            'incident_data': {
                'incident_fact': {
                    'callback_number': '+1234567890'
                }
            }
        }
        
        result = await comms_agent.send_notification(log_data)
        
        assert result is True
        assert len(mock_vapi_service.send_status_update_calls) == 1
        
        call = mock_vapi_service.send_status_update_calls[0]
        assert call['phone_number'] == '+1234567890'
        assert call['status'] == 'on_scene'
    
    @pytest.mark.asyncio
    async def test_send_notification_dispatch_failed(self, comms_agent, mock_vapi_service):
        """Test sending dispatch failure notification"""
        log_data = {
            'action': 'dispatch_failed',
            'incident_data': {
                'incident_fact': {
                    'emergency_type': 'Fire',
                    'location': '123 Main Street',
                    'callback_number': '+1234567890'
                }
            }
        }
        
        result = await comms_agent.send_notification(log_data)
        
        assert result is True
        assert len(mock_vapi_service.send_update_calls) == 1
        
        call = mock_vapi_service.send_update_calls[0]
        assert call['phone_number'] == '+1234567890'
        assert 'Fire' in call['message']
        assert 'unable to dispatch' in call['message']
    
    @pytest.mark.asyncio
    async def test_send_notification_no_callback_number(self, comms_agent, mock_vapi_service):
        """Test notification when no callback number is available"""
        log_data = {
            'action': 'unit_dispatched',
            'incident_data': {
                'incident_fact': {
                    'callback_number': ''  # No callback number
                }
            }
        }
        
        result = await comms_agent.send_notification(log_data)
        
        assert result is False
        assert len(mock_vapi_service.send_dispatch_notification_calls) == 0
    
    @pytest.mark.asyncio
    async def test_process_log_success(self, comms_agent, mock_vapi_service, sample_log_data):
        """Test successful log processing"""
        with patch.object(comms_agent, 'log_to_supabase', return_value=True) as mock_log:
            # Process the log
            await comms_agent.process_log(sample_log_data)
            
            # Verify Supabase logging was called
            mock_log.assert_called_once_with(sample_log_data)
            
            # Verify notification was sent
            assert len(mock_vapi_service.send_dispatch_notification_calls) == 1
    
    @pytest.mark.asyncio
    async def test_process_log_supabase_failure(self, comms_agent, mock_vapi_service, sample_log_data):
        """Test log processing when Supabase logging fails"""
        with patch.object(comms_agent, 'log_to_supabase', return_value=False) as mock_log:
            # Process the log
            await comms_agent.process_log(sample_log_data)
            
            # Verify Supabase logging was called
            mock_log.assert_called_once_with(sample_log_data)
            
            # Should still send notification despite Supabase failure
            assert len(mock_vapi_service.send_dispatch_notification_calls) == 1
    
    @pytest.mark.asyncio
    async def test_process_log_no_notification_needed(self, comms_agent, mock_vapi_service):
        """Test log processing when no notification is needed"""
        log_data = {
            'action': 'incident_completed',  # No notification needed
            'case_id': 'test-case-123'
        }
        
        with patch.object(comms_agent, 'log_to_supabase', return_value=True) as mock_log:
            # Process the log
            await comms_agent.process_log(log_data)
            
            # Verify Supabase logging was called
            mock_log.assert_called_once_with(log_data)
            
            # Should not send notification
            assert len(mock_vapi_service.send_dispatch_notification_calls) == 0
            assert len(mock_vapi_service.send_status_update_calls) == 0
            assert len(mock_vapi_service.send_update_calls) == 0
    
    @pytest.mark.asyncio
    async def test_process_log_notification_failure(self, comms_agent, sample_log_data):
        """Test log processing when notification fails"""
        # Mock Vapi service to return failure
        with patch('agents.comms_agent.vapi_service') as mock_vapi:
            mock_vapi.send_dispatch_notification.return_value = {'success': False, 'error': 'Test error'}
            
            with patch.object(comms_agent, 'log_to_supabase', return_value=True):
                # Process the log
                await comms_agent.process_log(sample_log_data)
                
                # Should still complete processing despite notification failure
                mock_vapi.send_dispatch_notification.assert_called_once()

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
