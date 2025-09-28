from fastapi import APIRouter, HTTPException, Depends
from app.schemas.unit_schema import FireUnitState, PoliceUnitState
from app.database.redis import get_redis_dependency
import redis.asyncio as redis
import subprocess
import json
import logging
import os
import sys
from typing import Union

logger = logging.getLogger(__name__)

unit_onboarding_router = APIRouter()

# Base paths for agent scripts
AGENT_SCRIPTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "agents")

@unit_onboarding_router.post("/api/units/onboard")
async def onboard_unit(
    unit_data: Union[FireUnitState, PoliceUnitState],
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """Dynamically launch a new unit agent subprocess"""
    try:
        unit_id = unit_data.unit_id
        unit_type = unit_data.unit_type if hasattr(unit_data, 'unit_type') else "Police"
        
        logger.info(f"Onboarding new unit: {unit_id} ({unit_type})")
        
        # Determine agent script based on unit type
        if unit_type in ["Engine", "Ladder", "Rescue", "Command", "Hazmat"]:
            agent_script = "unit_fire.py"
        elif unit_type in ["Police", "Patrol"]:
            agent_script = "unit_police.py"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported unit type: {unit_type}")
        
        # Generate unique agent name and seed from unit_id
        agent_name = f"unit_{unit_id.lower()}"
        agent_seed = f"{unit_id}_secret_seed_{hash(unit_id) % 100000}"
        
        # Create agent script path
        script_path = os.path.join(AGENT_SCRIPTS_DIR, agent_script)
        
        if not os.path.exists(script_path):
            raise HTTPException(status_code=500, detail=f"Agent script not found: {script_path}")
        
        # Prepare environment variables for the subprocess
        env = os.environ.copy()
        env.update({
            "UNIT_ID": unit_id,
            "UNIT_TYPE": unit_type,
            "AGENT_NAME": agent_name,
            "AGENT_SEED": agent_seed,
            "UNIT_DATA": json.dumps(unit_data.model_dump())
        })
        
        # Launch the agent subprocess
        process = subprocess.Popen(
            [sys.executable, script_path],
            cwd=os.path.dirname(script_path),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Store initial unit state in Redis
        key = f"unit:{unit_id}"
        await redis_client.setex(key, 86400, json.dumps(unit_data.model_dump()))
        
        logger.info(f"Successfully onboarded unit {unit_id} with PID {process.pid}")
        
        return {
            "success": True,
            "unit_id": unit_id,
            "unit_type": unit_type,
            "agent_name": agent_name,
            "process_id": process.pid,
            "message": f"Unit {unit_id} successfully onboarded and agent started"
        }
        
    except Exception as e:
        logger.error(f"Failed to onboard unit {unit_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to onboard unit: {str(e)}")

@unit_onboarding_router.delete("/api/units/{unit_id}/offboard")
async def offboard_unit(
    unit_id: str,
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """Remove a unit from the system"""
    try:
        # Remove from Redis
        key = f"unit:{unit_id}"
        await redis_client.delete(key)
        
        # Note: In a production system, you would also need to track and terminate
        # the associated agent process. This would require process management.
        
        logger.info(f"Unit {unit_id} offboarded successfully")
        
        return {
            "success": True,
            "unit_id": unit_id,
            "message": f"Unit {unit_id} offboarded successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to offboard unit {unit_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to offboard unit: {str(e)}")

@unit_onboarding_router.get("/api/units/onboarded")
async def list_onboarded_units(
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """List all currently onboarded units"""
    try:
        # Get all unit keys
        keys = await redis_client.keys("unit:*")
        
        units = []
        for key in keys:
            unit_data = await redis_client.get(key)
            if unit_data:
                unit_info = json.loads(unit_data)
                units.append(unit_info)
        
        return {
            "success": True,
            "total_units": len(units),
            "units": units
        }
        
    except Exception as e:
        logger.error(f"Failed to list onboarded units: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list units: {str(e)}")
