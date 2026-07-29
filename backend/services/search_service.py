"""
services/search_service.py
Web search via DuckDuckGo Instant Answer API with fallback.
"""
from __future__ import annotations

import logging
import urllib.parse
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)


def search_web(query: str) -> str:
    encoded = urllib.parse.quote_plus(query)
    try:
        resp = get(
            "https://api.duckduckgo.com/",
            params={"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"},
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        abstract = data.get("AbstractText")
        if abstract:
            source = data.get("AbstractURL", "")
            src_text = f" ([source]({source}))" if source else ""
            return f"🔍 **{query}**: {abstract}{src_text}"

        related = data.get("RelatedTopics", [])[:3]
        if related:
            lines = [f"🔍 **Search results for '{query}':**"]
            for topic in related:
                text = topic.get("Text", "")
                url = topic.get("FirstURL", "")
                if text and url:
                    lines.append(f"- {text} ([link]({url}))")
            return "\n".join(lines)

        return f"⚠️ No web results found for '{query}'."
    except Exception as exc:
        logger.warning("Web search failed: %s", exc)
        return f"⚠️ Search failed for '{query}'. Please try again later."


def is_search_query(message: str) -> bool:
    keywords = ["search", "look up", "find", "google", "who is", "what is", "explain", "news about"]
    msg = message.lower().strip()
    return any(k in msg for k in keywords) and len(msg.split()) > 3
