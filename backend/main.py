from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(
    title="AI-Powered Emergency Dispatch System",
    description="Backend API for emergency dispatch system with AI agents",
    version="1.0.0"
)

# Health check endpoint
@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "emergency-dispatch-api"}

# Include API router
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
