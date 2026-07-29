"""
services/news_service.py
Latest news via GNews or NewsAPI with RSS fallback.
"""
from __future__ import annotations

import logging
import os
import time
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 900.0  # 15 minutes

_CATEGORIES = {
    "technology": "technology",
    "tech": "technology",
    "ai": "technology",
    "artificial intelligence": "technology",
    "marvel": "entertainment",
    "sports": "sports",
    "world": "general",
    "nepal": "general",
    "business": "business",
    "entertainment": "entertainment",
}


def _cache_get(key: str) -> str | None:
    item = _CACHE.get(key)
    if not item:
        return None
    data, ts = item
    if time.time() - ts > _CACHE_TTL:
        del _CACHE[key]
        return None
    return data


def _cache_set(key: str, data: str) -> None:
    _CACHE[key] = (data, time.time())


def get_news(query: str = "") -> str:
    cache_key = f"news:{query}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    # Determine category
    category = "general"
    for key, val in _CATEGORIES.items():
        if key in query.lower():
            category = val
            break

    # Try GNews first
    gnews_key = os.getenv("GNEWS_KEY", settings.gnews_key)
    if gnews_key:
        try:
            resp = get(
                "https://gnews.io/api/v4/top-headlines",
                params={"category": category, "lang": "en", "max": 5, "apikey": gnews_key},
                timeout=settings.weather_timeout,
                retries=2,
            )
            data = resp.json()
            articles = data.get("articles", [])
            if articles:
                lines = [f"📰 **Top {category.title()} News:**"]
                for a in articles[:5]:
                    title = a.get("title", "")
                    url = a.get("url", "")
                    source = a.get("source", {}).get("name", "")
                    lines.append(f"- {title} — *{source}* ([link]({url}))")
                result = "\n".join(lines)
                _cache_set(cache_key, result)
                return result
        except Exception as exc:
            logger.warning("GNews fetch failed: %s", exc)

    # Fallback: NewsAPI
    newsapi_key = os.getenv("NEWSAPI_KEY", settings.newsapi_key)
    if newsapi_key:
        try:
            resp = get(
                "https://newsapi.org/v2/top-headlines",
                params={"category": category, "language": "en", "pageSize": 5, "apiKey": newsapi_key},
                timeout=settings.weather_timeout,
                retries=2,
            )
            data = resp.json()
            articles = data.get("articles", [])
            if articles:
                lines = [f"📰 **Top {category.title()} News:**"]
                for a in articles[:5]:
                    title = a.get("title", "")
                    url = a.get("url", "")
                    source = a.get("source", {}).get("name", "")
                    lines.append(f"- {title} — *{source}* ([link]({url}))")
                result = "\n".join(lines)
                _cache_set(cache_key, result)
                return result
        except Exception as exc:
            logger.warning("NewsAPI fetch failed: %s", exc)

    return f"⚠️ Could not fetch news for '{query}'. Try again later."


def is_news_query(message: str) -> bool:
    keywords = ["news", "headline", "latest", "breaking", "top stories", "technology news", "ai news", "sports news", "world news"]
    msg = message.lower()
    return any(k in msg for k in keywords)
