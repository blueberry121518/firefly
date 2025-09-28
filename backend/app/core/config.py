from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    DATABASE_URL: str = ""  # Direct PostgreSQL connection string for SQLAlchemy
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Application settings
    APP_NAME: str = "Emergency Dispatch System"
    DEBUG: bool = True
    
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Vapi Configuration
    VAPI_API_KEY: str = ""
    VAPI_WEBHOOK_BASE_URL: str = "https://your-ngrok-url.ngrok.io"  # Update with your ngrok URL
    VAPI_PHONE_NUMBER_ID: str = ""  # This should be a Vapi phone number ID (UUID), not a phone number
    VAPI_ASSISTANT_ID: str = ""
    
    # OpenAI API Key (for STT and TTS)
    OPENAI_API_KEY: str = ""
    
    # Google Gemini API Key (for conversational logic)
    GOOGLE_API_KEY: str = ""
    
    # Fetch.ai Configuration
    AGENTVERSE_API_KEY: str = ""
    AGENT_IDENTITY_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
