"""
Configuration management for the AI Security Assessor service
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    app_name: str = "AI Security Assessor"
    app_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False

    # Database Configuration
    cache_db_path: str = "assessment_cache.db"
    cache_ttl_days: int = 30

    # Logging Configuration
    request_log_file: str = "api_request_log.txt"
    enable_request_logging: bool = True

    # Assessment Configuration
    default_trust_score: int = 50
    min_confidence_threshold: float = 0.5

    # External API Keys (for future integration)
    nvd_api_key: Optional[str] = None
    shodan_api_key: Optional[str] = None
    virustotal_api_key: Optional[str] = None

    # LLM Configuration (for future integration)
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    llm_model: str = "gpt-4"
    llm_temperature: float = 0.1

    # Rate Limiting
    rate_limit_per_minute: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
