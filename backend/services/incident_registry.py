"""
Incident Registry Service (Redis GEO-based)

Stores active incidents in Redis using GEO indexes and provides queries
for units to find nearby incidents.
"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
import redis

from app.core.config import settings

logger = logging.getLogger(__name__)


class IncidentRegistry:
    def __init__(self, redis_url: str = None):
        self.redis_url = redis_url or settings.REDIS_URL
        self.client: Optional[redis.Redis] = None
        # Keys
        self.geo_key = "incidents:geo"
        self.data_key_prefix = "incident:data:"
        self.active_set_key = "incidents:active"

    async def connect(self) -> None:
        if self.client is None:
            self.client = redis.from_url(self.redis_url, decode_responses=True)
            await asyncio.get_event_loop().run_in_executor(None, self.client.ping)

    async def add_active_incident(self, incident: Dict[str, Any]) -> bool:
        try:
            await self.connect()
            incident_id = str(incident.get("case_id") or incident.get("id") or incident.get("call_id") or "unknown")
            lat = float(incident.get("latitude", 0.0))
            lon = float(incident.get("longitude", 0.0))
            if lat == 0.0 and lon == 0.0:
                logger.warning("Incident missing coordinates; skipping GEO add")
            else:
                # GEOADD expects lon, lat order
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.geoadd(self.geo_key, {incident_id: (lon, lat)})
                )

            # Store incident payload
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.set(self.data_key_prefix + incident_id, json.dumps(incident))
            )
            # Track in active set
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.sadd(self.active_set_key, incident_id)
            )
            logger.info(f"Registered active incident {incident_id} at ({lat},{lon})")
            return True
        except Exception as e:
            logger.error(f"Failed to add active incident: {e}")
            return False

    async def remove_incident(self, incident_id: str) -> None:
        try:
            await self.connect()
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.delete(self.data_key_prefix + incident_id)
            )
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.zrem(self.geo_key, incident_id)
            )
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.srem(self.active_set_key, incident_id)
            )
        except Exception as e:
            logger.error(f"Failed to remove incident {incident_id}: {e}")

    async def get_nearby_incidents(self, lat: float, lon: float, radius_km: float = 10.0, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            await self.connect()
            # GEORADIUSBYMEMBER is deprecated; use GEOSEARCH (not available in old clients). Use GEOSEARCH-like via GEORADIUS.
            ids = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.client.georadius(self.geo_key, lon, lat, radius_km, unit="km", withdist=True, count=limit, sort="ASC")
            )
            results: List[Dict[str, Any]] = []
            for member, dist in ids:
                raw = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.client.get(self.data_key_prefix + member)
                )
                if raw:
                    try:
                        payload = json.loads(raw)
                        payload["distance_km"] = round(float(dist), 2)
                        results.append(payload)
                    except Exception:
                        continue
            return results
        except Exception as e:
            logger.error(f"Failed to query nearby incidents: {e}")
            return []


incident_registry = IncidentRegistry()


