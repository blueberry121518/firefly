from fastapi import APIRouter, Depends, HTTPException
from app.schemas.unit_schema import FireUnitState, PoliceUnitState
from app.database.redis import get_redis_dependency
import redis.asyncio as redis
import json
import logging

logger = logging.getLogger(__name__)

units_router = APIRouter()

@units_router.post("/status")
async def update_unit_status(
    unit_data: FireUnitState | PoliceUnitState,
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """Update unit status in Redis database"""
    try:
        # Use unit_id as the Redis key
        key = f"unit:{unit_data.unit_id}"
        
        # Convert Pydantic model to JSON string
        unit_json = unit_data.model_dump_json()
        
        # Store in Redis with expiration (24 hours)
        await redis_client.setex(key, 86400, unit_json)
        
        logger.info(f"Updated status for unit {unit_data.unit_id}: {unit_data.status}")
        
        return {
            "message": "Unit status updated successfully",
            "unit_id": unit_data.unit_id,
            "status": unit_data.status
        }
        
    except Exception as e:
        logger.error(f"Error updating unit status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update unit status")

@units_router.get("/{unit_id}/status")
async def get_unit_status(
    unit_id: str,
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """Get unit status from Redis database"""
    try:
        key = f"unit:{unit_id}"
        unit_json = await redis_client.get(key)
        
        if not unit_json:
            raise HTTPException(status_code=404, detail="Unit not found")
        
        unit_data = json.loads(unit_json)
        return unit_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving unit status: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve unit status")

@units_router.get("/")
async def get_all_units(
    redis_client: redis.Redis = Depends(get_redis_dependency)
):
    """Get all active units from Redis database"""
    try:
        # Get all unit keys
        keys = await redis_client.keys("unit:*")
        
        if not keys:
            return {"units": []}
        
        # Get all unit data
        units = []
        for key in keys:
            unit_json = await redis_client.get(key)
            if unit_json:
                unit_data = json.loads(unit_json)
                units.append(unit_data)
        
        return {"units": units}
        
    except Exception as e:
        logger.error(f"Error retrieving all units: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve units")
