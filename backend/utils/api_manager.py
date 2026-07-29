"""
utils/api_manager.py
Reusable HTTP client with timeout, retries, and caching.
"""
from __future__ import annotations

import hashlib
import logging
import time
from typing import Any, Optional

import requests

from ..config import settings

logger = logging.getLogger(__name__)

_DEFAULT_TIMEOUT = 15
_DEFAULT_RETRIES = 2
_DEFAULT_BACKOFF = 1.5

_CACHE: dict[str, tuple[Any, float]] = {}
_CACHE_TTL = 1800.0


def _cache_key(method: str, url: str, params: Optional[dict]) -> str:
    raw = f"{method.upper()}:{url}:{sorted(params.items()) if params else ''}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _get_from_cache(key: str, ttl: float) -> Any | None:
    item = _CACHE.get(key)
    if not item:
        return None
    data, ts = item
    if time.time() - ts > ttl:
        del _CACHE[key]
        return None
    return data


def _set_cache(key: str, data: Any) -> None:
    _CACHE[key] = (data, time.time())


def request(
    method: str,
    url: str,
    *,
    params: Optional[dict] = None,
    json: Optional[dict] = None,
    headers: Optional[dict] = None,
    timeout: int = _DEFAULT_TIMEOUT,
    retries: int = _DEFAULT_RETRIES,
    backoff: float = _DEFAULT_BACKOFF,
    cache_ttl: float = 0.0,
    use_cache: bool = False,
) -> requests.Response:
    """
    HTTP request with retries and optional caching.
    Caching is based on method + url + params only (safe for GET).
    """
    if use_cache and cache_ttl > 0 and method.upper() == "GET":
        key = _cache_key(method, url, params)
        cached = _get_from_cache(key, cache_ttl)
        if cached is not None:
            logger.debug("Cache hit for %s %s", method, url)
            return cached

    last_exc: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            resp = requests.request(
                method=method.upper(),
                url=url,
                params=params,
                json=json,
                headers=headers,
                timeout=timeout,
            )
            resp.raise_for_status()
            if use_cache and cache_ttl > 0 and method.upper() == "GET":
                key = _cache_key(method, url, params)
                _set_cache(key, resp)
            return resp
        except Exception as exc:
            last_exc = exc
            logger.warning("Request failed (%s %s) attempt %s/%s: %s", method, url, attempt, retries, exc)
            time.sleep(backoff * attempt)

    raise last_exc or RuntimeError("Unknown request error")


def get(url: str, params: Optional[dict] = None, **kwargs: Any) -> requests.Response:
    return request("GET", url, params=params, **kwargs)


def post(url: str, json: Optional[dict] = None, **kwargs: Any) -> requests.Response:
    return request("POST", url, json=json, **kwargs)
