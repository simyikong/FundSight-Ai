from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    class Config:
        env_file = ".env"
        extra = "allow"

    # Database settings
    DB_PATH: str = "sqlite:///./financial_docs.db"
    
    # API Keys
    QWEN_API_KEY: Optional[str] = None
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Other settings
    DEBUG: bool = True
    ENVIRONMENT: str = "development"


# Create and export settings instance
settings = Settings()

# Export settings for use in other modules
__all__ = ["settings"]
