"""
GSIS Backend Configuration — Environment and app settings.
"""

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "GSIS Backend"
    APP_VERSION: str = "5.2.0"
    DEBUG: bool = True

    # CORS — add your Vercel domain in production
    FRONTEND_URL: str = ""
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
    ]

    # Rate limits
    RATE_LIMIT_PREDICT: str = "30/minute"
    RATE_LIMIT_BATCH: str = "10/minute"
    RATE_LIMIT_DEFAULT: str = "60/minute"

    # Thresholds
    NDVI_ALERT_THRESHOLD: float = 0.2
    NDWI_FLOOD_THRESHOLD: float = 0.3
    MAX_BATCH_SIZE: int = 20
    MAX_FILE_SIZE_MB: int = 50

    # Supabase (for future direct DB access)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Sentinel Hub API
    SENTINEL_CLIENT_ID: str = ""
    SENTINEL_CLIENT_SECRET: str = ""

    # Monitoring
    MONITOR_INTERVAL_HOURS: int = 24

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
