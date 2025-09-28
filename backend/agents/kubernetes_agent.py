"""
Kubernetes Orchestrator Agent for Emergency Dispatch System

This autonomous agent monitors the incident queue workload and intelligently
auto-scales the agent fleet based on real-world demand. It acts as a bridge
between application workload and Kubernetes infrastructure.

Key Features:
- Monitors Redis incident queue length as primary workload metric
- Implements configurable high/low water mark scaling logic
- Manages Kubernetes deployments programmatically
- Includes safety rails and error handling
- Runs as a perpetual, autonomous process
"""

import asyncio
import json
import logging
import time
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

# Add backend directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import redis
from kubernetes import client, config
from kubernetes.client.rest import ApiException
from uagents import Agent, Context, Model
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Message models for uAgent communication
class ScalingRequest(Model):
    """Request to scale a deployment"""
    deployment_name: str
    namespace: str
    target_replicas: int
    reason: str

class ScalingResponse(Model):
    """Response to scaling request"""
    deployment_name: str
    success: bool
    current_replicas: int
    target_replicas: int
    message: str

class HealthCheck(Model):
    """Health check request"""
    timestamp: str

class HealthStatus(Model):
    """Health status response"""
    status: str
    queue_length: int
    active_deployments: int
    timestamp: str

# Create the kubernetes agent
kubernetes_agent = Agent(
    name="kubernetes_agent",
    seed=settings.AGENT_IDENTITY_KEY or "kubernetes-agent-seed-key",
    port=8004,
    endpoint=f"http://localhost:8004/submit",
)

class ScalingAction(Enum):
    """Enumeration of possible scaling actions"""
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    NO_ACTION = "no_action"
    EMERGENCY_SCALE_UP = "emergency_scale_up"

@dataclass
class ScalingConfig:
    """Configuration for scaling behavior"""
    # Water marks for scaling decisions
    high_water_mark: int = 10  # Scale up when incidents exceed this
    low_water_mark: int = 2    # Scale down when incidents below this
    emergency_threshold: int = 50  # Emergency scale-up threshold
    
    # Safety constraints
    min_replicas: int = 1       # Minimum number of replicas
    max_replicas: int = 20      # Maximum number of replicas
    
    # Scaling behavior
    scale_up_step: int = 2      # Number of replicas to add per scale-up
    scale_down_step: int = 1    # Number of replicas to remove per scale-down
    cooldown_seconds: int = 60  # Minimum time between scaling actions
    
    # Monitoring intervals
    check_interval: int = 30    # Seconds between workload checks
    health_check_interval: int = 300  # Seconds between health checks

@dataclass
class ScalingMetrics:
    """Metrics for scaling decisions"""
    current_incidents: int
    current_replicas: int
    target_replicas: int
    last_scaling_action: Optional[ScalingAction]
    last_scaling_time: Optional[datetime]
    system_health: str

class KubernetesOrchestrator:
    """Main orchestrator class for managing Kubernetes agent scaling"""
    
    def __init__(self, 
                 redis_url: str = None,
                 scaling_config: ScalingConfig = None,
                 deployment_name: str = "emergency-agents",
                 namespace: str = "default"):
        """
        Initialize the Kubernetes orchestrator
        
        Args:
            redis_url: Redis connection URL
            scaling_config: Scaling configuration
            deployment_name: Name of the Kubernetes deployment to manage
            namespace: Kubernetes namespace
        """
        self.redis_url = redis_url or settings.REDIS_URL
        self.scaling_config = scaling_config or ScalingConfig()
        self.deployment_name = deployment_name
        self.namespace = namespace
        
        # Connection clients
        self.redis_client = None
        self.k8s_apps_v1 = None
        self.k8s_core_v1 = None
        
        # State tracking
        self.running = False
        self.last_scaling_action = None
        self.last_scaling_time = None
        self.consecutive_failures = 0
        self.max_consecutive_failures = 5
        
        # Metrics
        self.scaling_history: List[Dict] = []
        self.health_status = "unknown"
        
        logger.info(f"🚀 Kubernetes Orchestrator initialized")
        logger.info(f"   Deployment: {self.deployment_name}")
        logger.info(f"   Namespace: {self.namespace}")
        logger.info(f"   High water mark: {self.scaling_config.high_water_mark}")
        logger.info(f"   Low water mark: {self.scaling_config.low_water_mark}")
    
    async def connect(self):
        """Establish connections to Redis and Kubernetes"""
        try:
            # Connect to Redis
            self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
            await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.ping
            )
            logger.info("✅ Connected to Redis")
            
            # Connect to Kubernetes
            try:
                # Try in-cluster config first (when running in K8s)
                config.load_incluster_config()
                logger.info("✅ Loaded in-cluster Kubernetes config")
            except:
                # Fall back to kubeconfig (for local development)
                config.load_kube_config()
                logger.info("✅ Loaded kubeconfig")
            
            # Initialize Kubernetes API clients
            self.k8s_apps_v1 = client.AppsV1Api()
            self.k8s_core_v1 = client.CoreV1Api()
            
            # Verify connection
            await self._verify_k8s_connection()
            logger.info("✅ Connected to Kubernetes API")
            
        except Exception as e:
            logger.error(f"❌ Failed to establish connections: {e}")
            raise
    
    async def _verify_k8s_connection(self):
        """Verify Kubernetes connection and deployment exists"""
        try:
            deployment = self.k8s_apps_v1.read_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace
            )
            logger.info(f"✅ Found deployment: {deployment.metadata.name}")
            return True
        except ApiException as e:
            if e.status == 404:
                logger.error(f"❌ Deployment '{self.deployment_name}' not found in namespace '{self.namespace}'")
            else:
                logger.error(f"❌ Kubernetes API error: {e}")
            raise
    
    async def get_incident_queue_length(self) -> int:
        """Get the current length of the incident queue from Redis"""
        try:
            if not self.redis_client:
                await self.connect()
            
            # Get the length of the incident queue
            queue_length = await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.llen, "incident_queue"
            )
            
            logger.debug(f"📊 Incident queue length: {queue_length}")
            return queue_length
            
        except Exception as e:
            logger.error(f"❌ Error getting incident queue length: {e}")
            return 0
    
    async def get_current_replicas(self) -> int:
        """Get the current number of replicas for the deployment"""
        try:
            deployment = self.k8s_apps_v1.read_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace
            )
            current_replicas = deployment.spec.replicas or 0
            logger.debug(f"📊 Current replicas: {current_replicas}")
            return current_replicas
            
        except Exception as e:
            logger.error(f"❌ Error getting current replicas: {e}")
            return 0
    
    def calculate_scaling_action(self, 
                               incident_count: int, 
                               current_replicas: int) -> Tuple[ScalingAction, int]:
        """
        Calculate the appropriate scaling action based on workload
        
        Args:
            incident_count: Number of pending incidents
            current_replicas: Current number of replicas
            
        Returns:
            Tuple of (action, target_replicas)
        """
        # Emergency scale-up for critical situations
        if incident_count >= self.scaling_config.emergency_threshold:
            target_replicas = min(
                current_replicas + self.scaling_config.scale_up_step * 3,  # 3x normal scale-up
                self.scaling_config.max_replicas
            )
            if target_replicas > current_replicas:
                return ScalingAction.EMERGENCY_SCALE_UP, target_replicas
        
        # Normal scale-up when above high water mark
        if incident_count > self.scaling_config.high_water_mark:
            target_replicas = min(
                current_replicas + self.scaling_config.scale_up_step,
                self.scaling_config.max_replicas
            )
            if target_replicas > current_replicas:
                return ScalingAction.SCALE_UP, target_replicas
        
        # Scale-down when below low water mark
        elif incident_count < self.scaling_config.low_water_mark:
            target_replicas = max(
                current_replicas - self.scaling_config.scale_down_step,
                self.scaling_config.min_replicas
            )
            if target_replicas < current_replicas:
                return ScalingAction.SCALE_DOWN, target_replicas
        
        # No action needed
        return ScalingAction.NO_ACTION, current_replicas
    
    def can_scale(self) -> bool:
        """Check if scaling is allowed based on cooldown period"""
        if not self.last_scaling_time:
            return True
        
        time_since_last_scaling = datetime.now() - self.last_scaling_time
        return time_since_last_scaling.total_seconds() >= self.scaling_config.cooldown_seconds
    
    async def scale_deployment(self, target_replicas: int, action: ScalingAction) -> bool:
        """
        Scale the Kubernetes deployment to the target number of replicas
        
        Args:
            target_replicas: Target number of replicas
            action: Type of scaling action being performed
            
        Returns:
            True if scaling was successful, False otherwise
        """
        try:
            # Apply safety constraints
            target_replicas = max(target_replicas, self.scaling_config.min_replicas)
            target_replicas = min(target_replicas, self.scaling_config.max_replicas)
            
            # Get current deployment
            deployment = self.k8s_apps_v1.read_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace
            )
            
            # Update replica count
            deployment.spec.replicas = target_replicas
            
            # Apply the update
            self.k8s_apps_v1.patch_namespaced_deployment(
                name=self.deployment_name,
                namespace=self.namespace,
                body=deployment
            )
            
            # Update state
            self.last_scaling_action = action
            self.last_scaling_time = datetime.now()
            self.consecutive_failures = 0
            
            # Log scaling action
            logger.info(f"🔄 Scaled deployment to {target_replicas} replicas ({action.value})")
            
            # Record in history
            self.scaling_history.append({
                "timestamp": datetime.now().isoformat(),
                "action": action.value,
                "from_replicas": deployment.spec.replicas,
                "to_replicas": target_replicas,
                "incident_count": await self.get_incident_queue_length()
            })
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to scale deployment: {e}")
            self.consecutive_failures += 1
            return False
    
    async def check_system_health(self) -> str:
        """Check the overall health of the system"""
        try:
            # Check Redis connection
            await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.ping
            )
            
            # Check Kubernetes connection
            await self.get_current_replicas()
            
            # Check for consecutive failures
            if self.consecutive_failures > self.max_consecutive_failures:
                return "unhealthy"
            
            return "healthy"
            
        except Exception as e:
            logger.error(f"❌ Health check failed: {e}")
            return "unhealthy"
    
    async def monitor_and_scale(self):
        """Main monitoring and scaling loop"""
        try:
            logger.info("🔍 Starting monitoring and scaling loop")
            
            while self.running:
                try:
                    # Get current metrics
                    incident_count = await self.get_incident_queue_length()
                    current_replicas = await self.get_current_replicas()
                    
                    # Calculate scaling action
                    action, target_replicas = self.calculate_scaling_action(
                        incident_count, current_replicas
                    )
                    
                    # Create metrics object
                    metrics = ScalingMetrics(
                        current_incidents=incident_count,
                        current_replicas=current_replicas,
                        target_replicas=target_replicas,
                        last_scaling_action=self.last_scaling_action,
                        last_scaling_time=self.last_scaling_time,
                        system_health=self.health_status
                    )
                    
                    # Log current state
                    logger.info(f"📊 Metrics: {incident_count} incidents, {current_replicas} replicas")
                    
                    # Execute scaling if needed
                    if action != ScalingAction.NO_ACTION and self.can_scale():
                        logger.info(f"🎯 Scaling decision: {action.value} to {target_replicas} replicas")
                        
                        success = await self.scale_deployment(target_replicas, action)
                        if not success:
                            logger.warning(f"⚠️ Scaling failed, consecutive failures: {self.consecutive_failures}")
                    elif action != ScalingAction.NO_ACTION:
                        logger.info(f"⏳ Scaling delayed due to cooldown period")
                    else:
                        logger.debug("✅ No scaling action needed")
                    
                    # Update health status
                    self.health_status = await self.check_system_health()
                    
                    # Wait before next check
                    await asyncio.sleep(self.scaling_config.check_interval)
                    
                except Exception as e:
                    logger.error(f"❌ Error in monitoring loop: {e}")
                    self.consecutive_failures += 1
                    await asyncio.sleep(10)  # Brief pause before retry
                    
        except Exception as e:
            logger.error(f"❌ Fatal error in monitoring loop: {e}")
            raise
    
    async def start(self):
        """Start the orchestrator"""
        try:
            logger.info("🚀 Starting Kubernetes Orchestrator...")
            
            # Establish connections
            await self.connect()
            
            # Set running flag
            self.running = True
            
            # Start monitoring loop
            await self.monitor_and_scale()
            
        except KeyboardInterrupt:
            logger.info("🛑 Orchestrator stopped by user")
        except Exception as e:
            logger.error(f"❌ Orchestrator error: {e}")
            raise
        finally:
            await self.stop()
    
    async def stop(self):
        """Stop the orchestrator"""
        logger.info("🛑 Stopping Kubernetes Orchestrator...")
        self.running = False
        
        if self.redis_client:
            await asyncio.get_event_loop().run_in_executor(
                None, self.redis_client.close
            )
        
        logger.info("✅ Orchestrator stopped")
    
    def get_status_report(self) -> Dict:
        """Get a comprehensive status report"""
        return {
            "timestamp": datetime.now().isoformat(),
            "running": self.running,
            "health_status": self.health_status,
            "consecutive_failures": self.consecutive_failures,
            "last_scaling_action": self.last_scaling_action.value if self.last_scaling_action else None,
            "last_scaling_time": self.last_scaling_time.isoformat() if self.last_scaling_time else None,
            "scaling_history_count": len(self.scaling_history),
            "config": {
                "high_water_mark": self.scaling_config.high_water_mark,
                "low_water_mark": self.scaling_config.low_water_mark,
                "min_replicas": self.scaling_config.min_replicas,
                "max_replicas": self.scaling_config.max_replicas,
                "check_interval": self.scaling_config.check_interval
            }
        }

# Global orchestrator instance
orchestrator = None

@kubernetes_agent.on_message(ScalingRequest)
async def handle_scaling_request(ctx: Context, sender: str, msg: ScalingRequest):
    """Handle a scaling request from other agents"""
    try:
        logger.info(f"📈 Received scaling request for {msg.deployment_name} to {msg.target_replicas} replicas")
        
        if orchestrator:
            success = await orchestrator.scale_deployment(
                msg.deployment_name,
                msg.namespace,
                msg.target_replicas
            )
            
            current_replicas = await orchestrator.get_deployment_replicas(
                msg.deployment_name,
                msg.namespace
            )
            
            await ctx.send(sender, ScalingResponse(
                deployment_name=msg.deployment_name,
                success=success,
                current_replicas=current_replicas,
                target_replicas=msg.target_replicas,
                message="Scaling completed" if success else "Scaling failed"
            ))
        else:
            await ctx.send(sender, ScalingResponse(
                deployment_name=msg.deployment_name,
                success=False,
                current_replicas=0,
                target_replicas=msg.target_replicas,
                message="Orchestrator not initialized"
            ))
            
    except Exception as e:
        logger.error(f"❌ Error handling scaling request: {e}")
        await ctx.send(sender, ScalingResponse(
            deployment_name=msg.deployment_name,
            success=False,
            current_replicas=0,
            target_replicas=msg.target_replicas,
            message=f"Error: {str(e)}"
        ))

@kubernetes_agent.on_message(HealthCheck)
async def handle_health_check(ctx: Context, sender: str, msg: HealthCheck):
    """Handle a health check request"""
    try:
        if orchestrator:
            status_report = orchestrator.get_status_report()
            queue_length = await orchestrator.get_queue_length()
            active_deployments = len(await orchestrator.get_deployment_replicas("emergency-agents", "default"))
            
            await ctx.send(sender, HealthStatus(
                status="healthy" if orchestrator.health_status == "healthy" else "unhealthy",
                queue_length=queue_length,
                active_deployments=active_deployments,
                timestamp=datetime.now().isoformat()
            ))
        else:
            await ctx.send(sender, HealthStatus(
                status="unhealthy",
                queue_length=0,
                active_deployments=0,
                timestamp=datetime.now().isoformat()
            ))
            
    except Exception as e:
        logger.error(f"❌ Error handling health check: {e}")
        await ctx.send(sender, HealthStatus(
            status="error",
            queue_length=0,
            active_deployments=0,
            timestamp=datetime.now().isoformat()
        ))

@kubernetes_agent.on_event("startup")
async def startup(ctx: Context):
    """Agent startup handler"""
    logger.info("🚀 Starting Kubernetes Orchestrator Agent")
    
    # Create custom scaling configuration
    scaling_config = ScalingConfig(
        high_water_mark=10,      # Scale up when > 10 incidents
        low_water_mark=2,        # Scale down when < 2 incidents
        emergency_threshold=50,  # Emergency scale-up at 50+ incidents
        min_replicas=1,          # Never scale below 1 replica
        max_replicas=20,         # Never scale above 20 replicas
        scale_up_step=2,         # Add 2 replicas per scale-up
        scale_down_step=1,       # Remove 1 replica per scale-down
        cooldown_seconds=60,     # 1 minute cooldown between actions
        check_interval=30        # Check every 30 seconds
    )
    
    # Initialize orchestrator
    global orchestrator
    orchestrator = KubernetesOrchestrator(
        scaling_config=scaling_config,
        deployment_name="emergency-agents",
        namespace="default"
    )
    
    try:
        await orchestrator.start()
        logger.info("✅ Kubernetes Orchestrator Agent started")
    except Exception as e:
        logger.error(f"❌ Kubernetes Orchestrator Agent startup failed: {e}")

@kubernetes_agent.on_event("shutdown")
async def shutdown(ctx: Context):
    """Agent shutdown handler"""
    logger.info("🛑 Shutting down Kubernetes Orchestrator Agent")
    
    global orchestrator
    if orchestrator:
        await orchestrator.stop()
    logger.info("✅ Kubernetes Orchestrator Agent shutdown complete")

if __name__ == "__main__":
    logger.info("🚀 Starting Kubernetes Orchestrator Agent...")
    kubernetes_agent.run()
