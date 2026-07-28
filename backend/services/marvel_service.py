"""
marvel_service.py
Provides Marvel knowledge using Marvel API and TMDB.
"""
import hashlib
import os
import re
import time
import logging
from datetime import datetime
from typing import Optional

import requests

logger = logging.getLogger(__name__)

MARVEL_PUBLIC_KEY = os.getenv("MARVEL_PUBLIC_KEY", "")
MARVEL_PRIVATE_KEY = os.getenv("MARVEL_PRIVATE_KEY", "")
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
MARVEL_TIMEOUT = 8
CACHE_TTL = 3600

_CACHE: dict[str, tuple[str, float]] = {}


def _cache_get(key: str) -> Optional[str]:
    item = _CACHE.get(key)
    if not item:
        return None
    data, ts = item
    if time.time() - ts > CACHE_TTL:
        del _CACHE[key]
        return None
    return data


def _cache_set(key: str, data: str) -> None:
    _CACHE[key] = (data, time.time())


def _marvel_auth() -> dict:
    ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    hash_str = hashlib.md5(f"{ts}{MARVEL_PRIVATE_KEY}{MARVEL_PUBLIC_KEY}".encode()).hexdigest()
    return {"apikey": MARVEL_PUBLIC_KEY, "ts": ts, "hash": hash_str}


def _marvel_api_search(query: str) -> Optional[str]:
    if not MARVEL_PUBLIC_KEY or not MARVEL_PRIVATE_KEY:
        return None
    try:
        params = _marvel_auth()
        params["nameStartsWith"] = query
        params["limit"] = 5
        resp = requests.get(
            "https://gateway.marvel.com/v1/public/characters",
            params=params,
            timeout=MARVEL_TIMEOUT,
        )
        data = resp.json()
        chars = data.get("data", {}).get("results", [])
        if not chars:
            return None
        c = chars[0]
        name = c.get("name", "Unknown")
        desc = (c.get("description") or "No description available.").strip()
        comics = c.get("comics", {}).get("available", 0)
        short_desc = desc[:120] + "..." if len(desc) > 120 else desc
        return f"**{name}**\n{short_desc}\nComics: {comics}"
    except Exception as e:
        logger.warning(f"[MarvelService] Marvel API error: {e}")
        return None


def _tmdb_search(query: str, media_type: str = "movie") -> Optional[str]:
    if not TMDB_API_KEY:
        return None
    try:
        params = {"api_key": TMDB_API_KEY, "query": query, "page": 1}
        if media_type:
            params["type"] = media_type
        resp = requests.get(
            "https://api.themoviedb.org/3/search/multi",
            params=params,
            timeout=MARVEL_TIMEOUT,
        )
        data = resp.json()
        results = data.get("results", [])
        if not results:
            return None
        top = results[0]
        title = top.get("title") or top.get("name")
        overview = top.get("overview", "")
        release = top.get("release_date", "") or top.get("first_air_date", "")
        short_overview = overview[:150] + "..." if len(overview) > 150 else overview
        return f"**{title}** ({release[:4] if release else 'N/A'}): {short_overview}"
    except Exception as e:
        logger.warning(f"[MarvelService] TMDB error: {e}")
        return None


def get_marvel_response(message: str) -> Optional[str]:
    msg = message.lower().strip()
    query = re.sub(
        r"^(tell me about|what is|who is|search|find|look up|explain|marvel|mc|mcu)\s+",
        "",
        msg,
        flags=re.IGNORECASE,
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
    if not result and MARVEL_PUBLIC_KEY and MARVEL_PRIVATE_KEY:
        result = _marvel_api_search(query)

    if result:
        _cache_set(cache_key, result)
    return result


def is_marvel_query(message: str) -> bool:
    msg = message.lower()
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
    return any(t in msg for t in triggers)
