from fastapi import APIRouter
from app.api.incidents_router import incidents_router

# Master API router that aggregates all other resource routers
api_router = APIRouter()

# Include all resource routers
api_router.include_router(incidents_router, prefix="/incidents", tags=["incidents"])
