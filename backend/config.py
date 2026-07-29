"""
config.py
Centralized configuration loader for the Abyss AI Chatbot backend.
Loads environment variables from backend/.env or project root .env.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


def _load_dotenv(env_path: Path) -> None:
    """Minimal .env loader (avoids extra dependency)."""
    if not env_path.exists():
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip("\"'")
            if key and not os.environ.get(key):
                os.environ[key] = val


# Resolve .env location
_backend_dir = Path(__file__).resolve().parent
_project_root = _backend_dir.parent

_load_dotenv(_backend_dir / ".env")
_load_dotenv(_project_root / ".env")


@dataclass
class Settings:
    """Application settings loaded from environment variables."""

    # Server
    port: int = int(os.getenv("PORT", "5000"))

    # AI / LLM
    openrouter_api_key: Optional[str] = os.getenv("OPENROUTER_API_KEY")
    openrouter_model: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    ollama_host: str = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
    ai_timeout: int = int(os.getenv("AI_TIMEOUT", "30"))

    # Weather
    openweather_api_key: Optional[str] = os.getenv("OPENWEATHER_API_KEY")
    weather_timeout: int = int(os.getenv("WEATHER_TIMEOUT", "10"))

    # GitHub
    github_username: str = os.getenv("GITHUB_USERNAME", "fwabyss0")
    github_token: Optional[str] = os.getenv("GITHUB_TOKEN")
    github_timeout: int = int(os.getenv("GITHUB_TIMEOUT", "10"))

    # Marvel
    marvel_public_key: Optional[str] = os.getenv("MARVEL_PUBLIC_KEY")
    marvel_private_key: Optional[str] = os.getenv("MARVEL_PRIVATE_KEY")
    tmdb_api_key: Optional[str] = os.getenv("TMDB_API_KEY")

    # News / Search
    newsapi_key: Optional[str] = os.getenv("NEWSAPI_KEY")
    gnews_key: Optional[str] = os.getenv("GNEWS_KEY")

    # Database
    database_url: str = os.getenv("DATABASE_URL", f"sqlite:///{_backend_dir}/data/chatbot.db")

    # Cache defaults (seconds)
    default_cache_ttl: int = int(os.getenv("DEFAULT_CACHE_TTL", "1800"))


settings = Settings()
