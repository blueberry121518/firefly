from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database URLs
    POSTGRES_URL: str = "postgresql+asyncpg://user:password@localhost/emergency_dispatch"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Application settings
    APP_NAME: str = "Emergency Dispatch System"
    DEBUG: bool = False
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
