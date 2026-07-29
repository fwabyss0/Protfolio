"""
services/wikipedia_service.py
Wikipedia summaries via REST API.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

import requests

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_WIKI_API = "https://en.wikipedia.org/api/rest_v1/page/summary/"


def get_wikipedia_summary(topic: str) -> str:
    topic = re.sub(r'\s+', '_', topic.strip())
    try:
        resp = get(_WIKI_API + topic, timeout=settings.weather_timeout, retries=2)
        data = resp.json()
        title = data.get("title", topic)
        extract = data.get("extract", "")
        url = data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{topic}")
        if not extract:
            return f"I couldn't find a Wikipedia summary for **{title}**."
        return f"📚 **{title}**: {extract}\n\n[Read more]({url})"
    except Exception as exc:
        logger.warning("Wikipedia fetch failed for '%s': %s", topic, exc)
        return f"⚠️ Could not fetch Wikipedia data for '{topic}'."


def is_wikipedia_query(message: str) -> bool:
    prefixes = ["who is", "what is", "tell me about", "search", "find", "look up", "wikipedia"]
    msg = message.lower().strip()
    return any(msg.startswith(p) for p in prefixes) or len(msg.split()) > 4
