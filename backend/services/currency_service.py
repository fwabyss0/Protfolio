"""
services/currency_service.py
Live currency conversion using exchangerate-api.com fallback to open.er-api.com.
"""
from __future__ import annotations

import logging
import os
import re
import time
from typing import Optional

import requests

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 3600.0  # 1 hour


def _cache_get(key: str) -> dict | None:
    item = _CACHE.get(key)
    if not item:
        return None
    data, ts = item
    if time.time() - ts > _CACHE_TTL:
        del _CACHE[key]
        return None
    return data


def _cache_set(key: str, data: dict) -> None:
    _CACHE[key] = (data, time.time())


def _fetch_rates(base: str = "USD") -> Optional[dict]:
    cache_key = f"rates:{base}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    # Try exchangerate-api.com
    try:
        resp = get(
            f"https://api.exchangerate-api.com/v4/latest/{base}",
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        rates = data.get("rates", {})
        _cache_set(cache_key, rates)
        return rates
    except Exception as exc:
        logger.warning("exchangerate-api failed: %s", exc)

    # Fallback: open.er-api.com
    try:
        resp = get(
            f"https://open.er-api.com/v6/latest/{base}",
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        rates = data.get("rates", {})
        _cache_set(cache_key, rates)
        return rates
    except Exception as exc:
        logger.warning("open.er-api failed: %s", exc)

    return None


def convert_currency(message: str) -> Optional[str]:
    text = message.upper().strip()
    m = re.search(r'(\d+(?:\.\d+)?)\s*([A-Z]{3})\s*(?:TO|IN)\s*([A-Z]{3})', text)
    if not m:
        return None

    amount = float(m.group(1))
    from_cur = m.group(2)
    to_cur = m.group(3)

    rates = _fetch_rates(from_cur)
    if not rates or to_cur not in rates:
        return f"⚠️ Could not fetch exchange rate for {from_cur} → {to_cur}"

    rate = rates[to_cur]
    result = amount * rate

    def _fmt(value: float) -> str:
        if value == int(value):
            return str(int(value))
        return f"{value:.4g}"

    return f"💱 `{amount} {from_cur}` = **{_fmt(result)} {to_cur}** (rate {_fmt(rate)})"


def _fmt(value: float) -> str:
    if value == int(value):
        return str(int(value))
    return f"{value:.4g}"


def is_currency_query(message: str) -> bool:
    keywords = ["usd", "eur", "gbp", "npr", "inr", "jpy", "currency", "convert", "exchange", "rate"]
    msg = message.lower()
    return any(k in msg for k in keywords)
