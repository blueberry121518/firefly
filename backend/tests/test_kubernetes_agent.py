"""
Test suite for Kubernetes Orchestrator Agent

Tests the orchestrator's ability to monitor incident queues and
intelligently scale Kubernetes deployments based on workload.
"""

import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from datetime import datetime, timedelta
from dataclasses import dataclass

# Mock the kubernetes imports
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with patch.dict('sys.modules', {
    'kubernetes': Mock(),
    'kubernetes.client': Mock(),
    'kubernetes.config': Mock(),
}):
    from agents.kubernetes import (
        KubernetesOrchestrator,
        ScalingConfig,
        ScalingAction,
        ScalingMetrics
    )

class TestKubernetesOrchestrator:
    """Test cases for the Kubernetes orchestrator functionality"""
    
    @pytest.fixture
    def scaling_config(self):
        """Create a test scaling configuration"""
        return ScalingConfig(
            high_water_mark=5,
            low_water_mark=2,
            emergency_threshold=20,
            min_replicas=1,
            max_replicas=10,
            scale_up_step=2,
            scale_down_step=1,
            cooldown_seconds=30,
            check_interval=10
        )
    
    @pytest.fixture
    def mock_redis_client(self):
        """Create a mock Redis client"""
        mock_client = Mock()
        mock_client.ping = Mock()
        mock_client.llen = Mock(return_value=0)
        mock_client.close = Mock()
        return mock_client
    
    @pytest.fixture
    def mock_k8s_client(self):
        """Create mock Kubernetes clients"""
        mock_apps_v1 = Mock()
        mock_core_v1 = Mock()
        
        # Mock deployment object
        mock_deployment = Mock()
        mock_deployment.spec.replicas = 3
        mock_deployment.metadata.name = "emergency-agents"
        
        mock_apps_v1.read_namespaced_deployment.return_value = mock_deployment
        mock_apps_v1.patch_namespaced_deployment.return_value = None
        
        return mock_apps_v1, mock_core_v1
    
    @pytest.fixture
    def orchestrator(self, scaling_config, mock_redis_client, mock_k8s_client):
        """Create a test orchestrator with mocked dependencies"""
        mock_apps_v1, mock_core_v1 = mock_k8s_client
        
        with patch('agents.kubernetes.redis.from_url', return_value=mock_redis_client), \
             patch('agents.kubernetes.client.AppsV1Api', return_value=mock_apps_v1), \
             patch('agents.kubernetes.client.CoreV1Api', return_value=mock_core_v1), \
             patch('agents.kubernetes.config.load_incluster_config'), \
             patch('agents.kubernetes.config.load_kube_config'):
            
            orchestrator = KubernetesOrchestrator(
                scaling_config=scaling_config,
                deployment_name="test-agents",
                namespace="test"
            )
            orchestrator.redis_client = mock_redis_client
            orchestrator.k8s_apps_v1 = mock_apps_v1
            orchestrator.k8s_core_v1 = mock_core_v1
            return orchestrator
    
    def test_scaling_config_defaults(self):
        """Test default scaling configuration values"""
        config = ScalingConfig()
        
        assert config.high_water_mark == 10
        assert config.low_water_mark == 2
        assert config.emergency_threshold == 50
        assert config.min_replicas == 1
        assert config.max_replicas == 20
        assert config.scale_up_step == 2
        assert config.scale_down_step == 1
        assert config.cooldown_seconds == 60
        assert config.check_interval == 30
    
    def test_scaling_action_enum(self):
        """Test scaling action enumeration"""
        assert ScalingAction.SCALE_UP.value == "scale_up"
        assert ScalingAction.SCALE_DOWN.value == "scale_down"
        assert ScalingAction.NO_ACTION.value == "no_action"
        assert ScalingAction.EMERGENCY_SCALE_UP.value == "emergency_scale_up"
    
    def test_orchestrator_initialization(self, scaling_config):
        """Test orchestrator initialization"""
        orchestrator = KubernetesOrchestrator(
            scaling_config=scaling_config,
            deployment_name="test-agents",
            namespace="test"
        )
        
        assert orchestrator.deployment_name == "test-agents"
        assert orchestrator.namespace == "test"
        assert orchestrator.scaling_config == scaling_config
        assert orchestrator.running is False
        assert orchestrator.consecutive_failures == 0
    
    @pytest.mark.asyncio
    async def test_get_incident_queue_length_success(self, orchestrator, mock_redis_client):
        """Test successful incident queue length retrieval"""
        mock_redis_client.llen.return_value = 15
        
        length = await orchestrator.get_incident_queue_length()
        
        assert length == 15
        mock_redis_client.llen.assert_called_once_with("incident_queue")
    
    @pytest.mark.asyncio
    async def test_get_incident_queue_length_failure(self, orchestrator, mock_redis_client):
        """Test incident queue length retrieval failure"""
        mock_redis_client.llen.side_effect = Exception("Redis error")
        
        length = await orchestrator.get_incident_queue_length()
        
        assert length == 0
    
    @pytest.mark.asyncio
    async def test_get_current_replicas_success(self, orchestrator, mock_k8s_client):
        """Test successful current replicas retrieval"""
        mock_apps_v1, _ = mock_k8s_client
        mock_apps_v1.read_namespaced_deployment.return_value.spec.replicas = 5
        
        replicas = await orchestrator.get_current_replicas()
        
        assert replicas == 5
        mock_apps_v1.read_namespaced_deployment.assert_called_once_with(
            name="test-agents", namespace="test"
        )
    
    @pytest.mark.asyncio
    async def test_get_current_replicas_failure(self, orchestrator, mock_k8s_client):
        """Test current replicas retrieval failure"""
        mock_apps_v1, _ = mock_k8s_client
        mock_apps_v1.read_namespaced_deployment.side_effect = Exception("K8s error")
        
        replicas = await orchestrator.get_current_replicas()
        
        assert replicas == 0
    
    def test_calculate_scaling_action_emergency(self, orchestrator):
        """Test emergency scale-up calculation"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=25,  # Above emergency threshold
            current_replicas=3
        )
        
        assert action == ScalingAction.EMERGENCY_SCALE_UP
        assert target_replicas == 9  # 3 + (2 * 3) = 9
    
    def test_calculate_scaling_action_scale_up(self, orchestrator):
        """Test normal scale-up calculation"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=7,  # Above high water mark
            current_replicas=3
        )
        
        assert action == ScalingAction.SCALE_UP
        assert target_replicas == 5  # 3 + 2 = 5
    
    def test_calculate_scaling_action_scale_down(self, orchestrator):
        """Test scale-down calculation"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=1,  # Below low water mark
            current_replicas=5
        )
        
        assert action == ScalingAction.SCALE_DOWN
        assert target_replicas == 4  # 5 - 1 = 4
    
    def test_calculate_scaling_action_no_action(self, orchestrator):
        """Test no action calculation"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=3,  # Between water marks
            current_replicas=5
        )
        
        assert action == ScalingAction.NO_ACTION
        assert target_replicas == 5  # No change
    
    def test_calculate_scaling_action_respect_max_replicas(self, orchestrator):
        """Test that scaling respects maximum replica limit"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=25,  # Emergency threshold
            current_replicas=9  # Near max
        )
        
        assert action == ScalingAction.EMERGENCY_SCALE_UP
        assert target_replicas == 10  # Capped at max_replicas
    
    def test_calculate_scaling_action_respect_min_replicas(self, orchestrator):
        """Test that scaling respects minimum replica limit"""
        action, target_replicas = orchestrator.calculate_scaling_action(
            incident_count=0,  # Below low water mark
            current_replicas=1  # At minimum
        )
        
        assert action == ScalingAction.NO_ACTION
        assert target_replicas == 1  # Cannot go below min_replicas
    
    def test_can_scale_no_previous_scaling(self, orchestrator):
        """Test scaling allowed when no previous scaling action"""
        assert orchestrator.can_scale() is True
    
    def test_can_scale_within_cooldown(self, orchestrator):
        """Test scaling blocked during cooldown period"""
        orchestrator.last_scaling_time = datetime.now()
        orchestrator.scaling_config.cooldown_seconds = 60
        
        assert orchestrator.can_scale() is False
    
    def test_can_scale_after_cooldown(self, orchestrator):
        """Test scaling allowed after cooldown period"""
        orchestrator.last_scaling_time = datetime.now() - timedelta(seconds=70)
        orchestrator.scaling_config.cooldown_seconds = 60
        
        assert orchestrator.can_scale() is True
    
    @pytest.mark.asyncio
    async def test_scale_deployment_success(self, orchestrator, mock_k8s_client):
        """Test successful deployment scaling"""
        mock_apps_v1, _ = mock_k8s_client
        mock_deployment = Mock()
        mock_deployment.spec.replicas = 3
        mock_apps_v1.read_namespaced_deployment.return_value = mock_deployment
        
        success = await orchestrator.scale_deployment(5, ScalingAction.SCALE_UP)
        
        assert success is True
        assert orchestrator.last_scaling_action == ScalingAction.SCALE_UP
        assert orchestrator.consecutive_failures == 0
        assert len(orchestrator.scaling_history) == 1
        
        # Verify Kubernetes API calls
        mock_apps_v1.read_namespaced_deployment.assert_called_once()
        mock_apps_v1.patch_namespaced_deployment.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_scale_deployment_failure(self, orchestrator, mock_k8s_client):
        """Test deployment scaling failure"""
        mock_apps_v1, _ = mock_k8s_client
        mock_apps_v1.read_namespaced_deployment.side_effect = Exception("K8s error")
        
        success = await orchestrator.scale_deployment(5, ScalingAction.SCALE_UP)
        
        assert success is False
        assert orchestrator.consecutive_failures == 1
    
    @pytest.mark.asyncio
    async def test_scale_deployment_respects_safety_limits(self, orchestrator, mock_k8s_client):
        """Test that scaling respects safety limits"""
        mock_apps_v1, _ = mock_k8s_client
        mock_deployment = Mock()
        mock_deployment.spec.replicas = 3
        mock_apps_v1.read_namespaced_deployment.return_value = mock_deployment
        
        # Try to scale to 0 (below minimum)
        success = await orchestrator.scale_deployment(0, ScalingAction.SCALE_DOWN)
        
        assert success is True
        # Verify the deployment was scaled to minimum replicas
        call_args = mock_apps_v1.patch_namespaced_deployment.call_args[1]['body']
        assert call_args.spec.replicas == 1  # min_replicas
    
    @pytest.mark.asyncio
    async def test_check_system_health_healthy(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test system health check when healthy"""
        mock_apps_v1, _ = mock_k8s_client
        mock_apps_v1.read_namespaced_deployment.return_value.spec.replicas = 3
        
        health = await orchestrator.check_system_health()
        
        assert health == "healthy"
    
    @pytest.mark.asyncio
    async def test_check_system_health_redis_failure(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test system health check with Redis failure"""
        mock_redis_client.ping.side_effect = Exception("Redis error")
        
        health = await orchestrator.check_system_health()
        
        assert health == "unhealthy"
    
    @pytest.mark.asyncio
    async def test_check_system_health_k8s_failure(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test system health check with Kubernetes failure"""
        mock_apps_v1, _ = mock_k8s_client
        mock_apps_v1.read_namespaced_deployment.side_effect = Exception("K8s error")
        
        health = await orchestrator.check_system_health()
        
        assert health == "unhealthy"
    
    @pytest.mark.asyncio
    async def test_check_system_health_too_many_failures(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test system health check with too many consecutive failures"""
        orchestrator.consecutive_failures = 10
        orchestrator.max_consecutive_failures = 5
        
        health = await orchestrator.check_system_health()
        
        assert health == "unhealthy"
    
    def test_get_status_report(self, orchestrator):
        """Test status report generation"""
        orchestrator.running = True
        orchestrator.health_status = "healthy"
        orchestrator.consecutive_failures = 0
        orchestrator.last_scaling_action = ScalingAction.SCALE_UP
        orchestrator.last_scaling_time = datetime.now()
        
        report = orchestrator.get_status_report()
        
        assert report["running"] is True
        assert report["health_status"] == "healthy"
        assert report["consecutive_failures"] == 0
        assert report["last_scaling_action"] == "scale_up"
        assert "timestamp" in report
        assert "config" in report
    
    @pytest.mark.asyncio
    async def test_monitor_and_scale_loop(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test the main monitoring and scaling loop"""
        mock_apps_v1, _ = mock_k8s_client
        mock_deployment = Mock()
        mock_deployment.spec.replicas = 3
        mock_apps_v1.read_namespaced_deployment.return_value = mock_deployment
        
        # Set up Redis to return high incident count
        mock_redis_client.llen.return_value = 8  # Above high water mark
        
        # Set running flag and start monitoring
        orchestrator.running = True
        
        # Run for a short time
        task = asyncio.create_task(orchestrator.monitor_and_scale())
        await asyncio.sleep(0.1)  # Let it run briefly
        orchestrator.running = False
        await task
        
        # Verify scaling was attempted
        assert len(orchestrator.scaling_history) > 0
    
    @pytest.mark.asyncio
    async def test_connect_success(self, orchestrator, mock_redis_client, mock_k8s_client):
        """Test successful connection establishment"""
        mock_apps_v1, _ = mock_k8s_client
        mock_deployment = Mock()
        mock_deployment.metadata.name = "test-agents"
        mock_apps_v1.read_namespaced_deployment.return_value = mock_deployment
        
        await orchestrator.connect()
        
        assert orchestrator.redis_client is not None
        assert orchestrator.k8s_apps_v1 is not None
        assert orchestrator.k8s_core_v1 is not None
    
    @pytest.mark.asyncio
    async def test_connect_redis_failure(self, orchestrator):
        """Test connection failure with Redis"""
        with patch('agents.kubernetes.redis.from_url', side_effect=Exception("Redis error")):
            with pytest.raises(Exception):
                await orchestrator.connect()
    
    @pytest.mark.asyncio
    async def test_connect_k8s_failure(self, orchestrator, mock_redis_client):
        """Test connection failure with Kubernetes"""
        with patch('agents.kubernetes.config.load_incluster_config', side_effect=Exception("K8s error")):
            with patch('agents.kubernetes.config.load_kube_config', side_effect=Exception("K8s error")):
                with pytest.raises(Exception):
                    await orchestrator.connect()
    
    @pytest.mark.asyncio
    async def test_stop(self, orchestrator, mock_redis_client):
        """Test orchestrator stop functionality"""
        orchestrator.running = True
        orchestrator.redis_client = mock_redis_client
        
        await orchestrator.stop()
        
        assert orchestrator.running is False
        mock_redis_client.close.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
