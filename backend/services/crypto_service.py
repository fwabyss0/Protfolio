"""
services/crypto_service.py
Cryptocurrency prices via CoinGecko public API.
"""
from __future__ import annotations

import logging
import os
import time
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_CACHE: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 60.0

_COIN_MAP = {
    "bitcoin": "bitcoin",
    "btc": "bitcoin",
    "ethereum": "ethereum",
    "eth": "ethereum",
    "solana": "solana",
    "sol": "solana",
    "bnb": "binancecoin",
    "binance": "binancecoin",
    "dogecoin": "dogecoin",
    "doge": "dogecoin",
    "cardano": "cardano",
    "ada": "cardano",
    "ripple": "ripple",
    "xrp": "ripple",
    "polkadot": "polkadot",
    "dot": "polkadot",
    "avalanche": "avalanche-2",
    "avax": "avalanche-2",
}


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


def _fetch_coin(coin_id: str) -> Optional[dict]:
    cache_key = f"coin:{coin_id}"
    cached = _cache_get(cache_key)
    if cached:
        return cached

    try:
        resp = get(
            f"https://api.coingecko.com/api/v3/coins/{coin_id}",
            params={"localization": "false", "tickers": "false", "market_data": "true", "community_data": "false", "developer_data": "false"},
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        market = data.get("market_data", {})
        current = market.get("current_price", {}).get("usd")
        change_24h = market.get("price_change_percentage_24h")
        market_cap = market.get("market_cap", {}).get("usd")
        result = {
            "name": data.get("name", coin_id),
            "symbol": data.get("symbol", coin_id).upper(),
            "price": current,
            "change_24h": change_24h,
            "market_cap": market_cap,
        }
        _cache_set(cache_key, result)
        return result
    except Exception as exc:
        logger.warning("CoinGecko fetch failed for %s: %s", coin_id, exc)
        return None


def get_crypto_response(message: str) -> Optional[str]:
    msg = message.lower()
    coin_id = None
    for key, val in _COIN_MAP.items():
        if key in msg:
            coin_id = val
            break

    if not coin_id:
        return None

    data = _fetch_coin(coin_id)
    if not data or data.get("price") is None:
        return f"⚠️ Could not fetch crypto data for {coin_id}"

    price = data["price"]
    change = data.get("change_24h")
    cap = data.get("market_cap")
    emoji = "🪙" if "bitcoin" in coin_id else "🪙"

    change_str = ""
    if change is not None:
        emoji_change = "📈" if change >= 0 else "📉"
        change_str = f" | {emoji_change} {change:+.2f}%"

    cap_str = ""
    if cap:
        cap_str = f" | Cap ${cap/1e9:.2f}B" if cap > 1e9 else f" | Cap ${cap/1e6:.2f}M"

    return f"{emoji} **{data['name']} ({data['symbol']})**: ${price:,.2f}{change_str}{cap_str}"


def get_trending() -> Optional[str]:
    try:
        resp = get(
            "https://api.coingecko.com/api/v3/search/trending",
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        coins = data.get("coins", [])[:5]
        if not coins:
            return None
        lines = ["🔥 **Trending Coins:**"]
        for item in coins:
            c = item.get("item", {})
            lines.append(f"- {c.get('name', '?')} ({c.get('symbol', '?').upper()})")
        return "\n".join(lines)
    except Exception as exc:
        logger.warning("CoinGecko trending failed: %s", exc)
        return None


def is_crypto_query(message: str) -> bool:
    keywords = ["bitcoin", "btc", "ethereum", "eth", "solana", "bnb", "dogecoin", "doge", "crypto", "market cap", "top gainers", "top losers", "trending"]
    msg = message.lower()
    return any(k in msg for k in keywords)
