"""
services/weather_service.py
Fetches live weather using OpenWeatherMap API with Open-Meteo fallback.
Uses api_manager for HTTP requests.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_WEATHER_EMOJIS = {
    "clear": "☀️",
    "clouds": "☁️",
    "rain": "🌧️",
    "drizzle": "🌦️",
    "thunderstorm": "🌩️",
    "snow": "❄️",
    "mist": "🌫️",
    "fog": "🌫️",
    "haze": "🌫️",
    "smoke": "🌫️",
    "dust": "💨",
    "tornado": "🌪️",
}


def _extract_city(message: str) -> str:
    import re
    patterns = [
        r"weather\s+(?:in|at|for|of)?\s*([a-zA-Z\s,]+?)(?:\?|$|\s*please)",
        r"temperature\s+(?:in|at|for)?\s*([a-zA-Z\s,]+?)(?:\?|$)",
        r"forecast\s+(?:in|at|for)?\s*([a-zA-Z\s,]+?)(?:\?|$)",
        r"([a-zA-Z\s,]+?)\s+weather",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            city = match.group(1).strip()
            noise = ["today", "now", "current", "the", "please", "tell me", "what is", "how is", "is it"]
            for word in noise:
                city = city.replace(word, "").strip()
            if len(city) > 1:
                return city
    return "Bhaktapur"


def _get_from_openweathermap(city: str, api_key: str) -> Optional[str]:
    try:
        resp = get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": city, "appid": api_key, "units": "metric"},
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = resp.json()
        if data.get("cod") != 200:
            return None

        name = data["name"]
        country = data.get("sys", {}).get("country", "")
        cond = data["weather"][0]["main"].lower()
        desc = data["weather"][0]["description"].capitalize()
        emoji = _WEATHER_EMOJIS.get(cond, "🌤️")
        temp_c = data["main"]["temp"]
        feels_c = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind = data["wind"]["speed"]
        wind_kmh = round(wind * 3.6, 1)

        return (
            f"{emoji} **{name}**: {desc}\n"
            f"🌡️ {temp_c:.1f}°C | Feels {feels_c:.1f}°C\n"
            f"💧 {humidity}% | 🌬️ {wind_kmh} km/h"
        )
    except Exception as exc:
        logger.warning("OpenWeatherMap error: %s", exc)
        return None


def _get_from_open_meteo(city: str) -> Optional[str]:
    try:
        geo_resp = get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": city, "count": 1, "language": "en", "format": "json"},
            timeout=settings.weather_timeout,
            retries=2,
        )
        geo = geo_resp.json()
        results = geo.get("results", [])
        if not results:
            return None

        loc = results[0]
        lat, lon = loc["latitude"], loc["longitude"]
        place = f"{loc['name']}{', ' + loc.get('country', '') if loc.get('country') else ''}"

        weather_resp = get(
            "https://api.open-meteo.com/v1/forecast",
            params={"latitude": lat, "longitude": lon, "current_weather": "true"},
            timeout=settings.weather_timeout,
            retries=2,
        )
        data = weather_resp.json()
        curr = data.get("current_weather")
        if not curr:
            return None

        temp_c = curr["temperature"]
        wind = curr["windspeed"]
        return f"🌤️ **{place}**: {temp_c}°C | Wind {wind} km/h"
    except Exception as exc:
        logger.warning("Open-Meteo error: %s", exc)
        return None


def get_weather(message: str) -> str:
    city = _extract_city(message)
    api_key = os.getenv("OPENWEATHER_API_KEY", settings.openweather_api_key)

    if api_key:
        result = _get_from_openweathermap(city, api_key)
        if result:
            return result

    result = _get_from_open_meteo(city)
    if result:
        return result

    return f"⚠️ Live weather for **{city}** is currently unavailable. Please try again later."


def is_weather_query(message: str) -> bool:
    keywords = ["weather", "temperature", "forecast", "climate", "how hot", "how cold", "is it raining", "temp in", "rain in"]
    return any(k in message.lower() for k in keywords)
