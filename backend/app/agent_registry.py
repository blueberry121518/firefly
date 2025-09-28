"""
Agent Address Registry for Fetch.ai Agent Communication
"""
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class AgentRegistry:
    """Simple in-memory registry for agent addresses"""
    
    def __init__(self):
        self._agents: Dict[str, str] = {}
    
    def register_agent(self, name: str, address: str):
        """Register an agent with its address"""
        self._agents[name] = address
        logger.info(f"Registered agent '{name}' with address: {address}")
    
    def get_agent_address(self, name: str) -> Optional[str]:
        """Get agent address by name"""
        return self._agents.get(name)
    
    def unregister_agent(self, name: str):
        """Unregister an agent"""
        if name in self._agents:
            del self._agents[name]
            logger.info(f"Unregistered agent '{name}'")
    
    def list_agents(self) -> Dict[str, str]:
        """List all registered agents"""
        return self._agents.copy()

# Global registry instance
agent_registry = AgentRegistry()

# Common agent names
ROUTING_AGENT = "routing"
HOSPITAL_AGENT = "hospital"

def get_routing_agent_address() -> Optional[str]:
    """Get routing agent address"""
    return agent_registry.get_agent_address(ROUTING_AGENT)

# secure_comms agent deprecated; CommsAgent listens on Redis

def get_hospital_agent_address() -> Optional[str]:
    """Get hospital agent address"""
    return agent_registry.get_agent_address(HOSPITAL_AGENT)

def get_unit_agent_address(unit_id: str) -> Optional[str]:
    """Get unit agent address by unit ID"""
    # Map unit IDs to agent names
    if "FIRE" in unit_id.upper():
        return agent_registry.get_agent_address("unit_fire")
    elif "POLICE" in unit_id.upper():
        return agent_registry.get_agent_address("unit_police")
    elif "EMS" in unit_id.upper():
        return agent_registry.get_agent_address("unit_ems")
    return None
