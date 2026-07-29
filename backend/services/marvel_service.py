"""
services/marvel_service.py
Marvel knowledge via Marvel API, TMDB, and Wikipedia fallback.
"""
from __future__ import annotations

import hashlib
import os
import re
import time
import logging
from datetime import datetime
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_MARVEL_PUBLIC = os.getenv("MARVEL_PUBLIC_KEY", settings.marvel_public_key)
_MARVEL_PRIVATE = os.getenv("MARVEL_PRIVATE_KEY", settings.marvel_private_key)
_TMDB_KEY = os.getenv("TMDB_API_KEY", settings.tmdb_api_key)
_CACHE: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 3600


def _cache_get(key: str) -> Optional[str]:
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


def _marvel_auth() -> dict:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    hash_str = hashlib.md5(f"{ts}{_MARVEL_PRIVATE}{_MARVEL_PUBLIC}".encode()).hexdigest()
    return {"apikey": _MARVEL_PUBLIC, "ts": ts, "hash": hash_str}


def _marvel_search(query: str) -> Optional[str]:
    if not _MARVEL_PUBLIC or not _MARVEL_PRIVATE:
        return None
    try:
        params = _marvel_auth()
        params["nameStartsWith"] = query
        params["limit"] = 5
        resp = get(
            "https://gateway.marvel.com/v1/public/characters",
            params=params,
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        chars = data.get("data", {}).get("results", [])
        if not chars:
            return None
        c = chars[0]
        name = c.get("name", "Unknown")
        desc = (c.get("description") or "No description available.").strip()
        comics = c.get("comics", {}).get("available", 0)
        short = desc[:180] + "..." if len(desc) > 180 else desc
        return f"**{name}**\n{short}\nComics appearances: {comics}"
    except Exception as exc:
        logger.warning("Marvel API error: %s", exc)
        return None


def _tmdb_search(query: str, media_type: str = "movie") -> Optional[str]:
    if not _TMDB_KEY:
        return None
    try:
        resp = get(
            "https://api.themoviedb.org/3/search/multi",
            params={"api_key": _TMDB_KEY, "query": query, "page": 1},
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        results = data.get("results", [])
        if not results:
            return None
        top = results[0]
        title = top.get("title") or top.get("name")
        overview = top.get("overview", "")
        release = top.get("release_date", "") or top.get("first_air_date", "")
        short = overview[:200] + "..." if len(overview) > 200 else overview
        return f"**{title}** ({release[:4] if release else 'N/A'}): {short}"
    except Exception as exc:
        logger.warning("TMDB error: %s", exc)
        return None


def get_marvel_response(message: str) -> Optional[str]:
    msg = message.lower().strip()
    query = re.sub(
        r"^(tell me about|what is|who is|search|find|look up|explain|marvel|mc|mcu)\s+",
        "", msg, flags=re.IGNORECASE
    ).strip()
    if not query or len(query) < 2:
        return None

    cache_key = query.lower()
    cached = _cache_get(cache_key)
    if cached:
        return cached

    movie_keywords = ["movie", "film", "series", "tv", "show", "phase", "timeline", "release order", "chronological"]
    is_movie = any(k in msg for k in movie_keywords)

    result = None
    if is_movie:
        result = _tmdb_search(query, media_type="tv" if "series" in msg or "tv" in msg else "movie")
    if not result and _MARVEL_PUBLIC and _MARVEL_PRIVATE:
        result = _marvel_search(query)

    if result:
        _cache_set(cache_key, result)
    return result


def is_marvel_query(message: str) -> bool:
    triggers = [
        "marvel", "mcu", "avengers", "spider-man", "iron man", "thor",
        "captain america", "black panther", "doctor strange", "guardians",
        "x-men", "fantastic four", "infinity stones", "thanos", "loki",
        "wolverine", "deadpool", "multiverse", "secret wars", "doctor doom",
        "kang", "celestials", "wakanda", "asgard", "ant-man", "scarlet witch",
        "vision", "falcon", "winter soldier", "shield", "hydra",
        "spider-verse", "nick fury", "daredevil", "jessica jones",
        "luke cage", "iron fist", "punisher", "ghost rider",
    ]
    return any(t in message.lower() for t in triggers)
