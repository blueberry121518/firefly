from fastapi import APIRouter

incidents_router = APIRouter()

@incidents_router.get("/")
async def get_incidents():
    """Get all incidents"""
    # TODO: Implement incident retrieval logic
    pass

@incidents_router.post("/")
async def create_incident():
    """Create a new incident"""
    # TODO: Implement incident creation logic
    pass
