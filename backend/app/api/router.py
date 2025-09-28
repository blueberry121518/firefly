from fastapi import APIRouter
from app.api.incidents_router import incidents_router
from app.api.units_router import units_router
from app.api.hospital_router import hospital_router
from app.api.notifications_router import notifications_router
from app.api.unit_onboarding_router import unit_onboarding_router
from app.api.vapi_router import router as vapi_router
from app.api.call_initiation_router import router as call_initiation_router
from app.api.frontend_router import frontend_router

# Master API router that aggregates all other resource routers
api_router = APIRouter()

# Include all resource routers
api_router.include_router(incidents_router, prefix="/incidents", tags=["incidents"])
api_router.include_router(units_router, tags=["units"])
api_router.include_router(hospital_router, prefix="/internal", tags=["hospital-internal"])
api_router.include_router(notifications_router, tags=["notifications"])
api_router.include_router(unit_onboarding_router, tags=["unit-onboarding"])
api_router.include_router(vapi_router, prefix="/vapi", tags=["vapi-webhooks"])
api_router.include_router(call_initiation_router, prefix="/calls", tags=["call-initiation"])
api_router.include_router(frontend_router, tags=["frontend"])
