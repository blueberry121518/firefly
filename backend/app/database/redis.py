import redis.asyncio as redis
from app.core.config import settings
from typing import AsyncGenerator

# Redis client instance
redis_client = None

async def get_redis_client() -> redis.Redis:
    """Initialize and return Redis client"""
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client

async def get_redis_dependency() -> AsyncGenerator[redis.Redis, None]:
    """Dependency to get Redis client"""
    client = await get_redis_client()
    try:
        yield client
    finally:
        # Connection will be closed when the client is garbage collected
        pass
