"""
weather_service.py
Fetches live weather using OpenWeatherMap API with Open-Meteo fallback.
"""
import os
import requests

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
REQUEST_TIMEOUT = 6

WEATHER_EMOJIS = {
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
    """Extract city name from weather query message."""
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
            # Remove noise words
            noise = ["today", "now", "current", "the", "please", "tell me", "what is", "how is", "is it"]
            for word in noise:
                city = city.replace(word, "").strip()
            if len(city) > 1:
                return city
    return "Bhaktapur"  # Default to Alish's hometown


def _get_from_openweathermap(city: str, api_key: str) -> str | None:
    """Fetch weather from OpenWeatherMap API."""
    try:
        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={requests.utils.quote(city)}&appid={api_key}&units=metric"
        )
        resp = requests.get(url, timeout=REQUEST_TIMEOUT)
        data = resp.json()

        if data.get("cod") != 200:
            return None

        name = data["name"]
        country = data.get("sys", {}).get("country", "")
        main_cond = data["weather"][0]["main"].lower()
        description = data["weather"][0]["description"].capitalize()
        emoji = WEATHER_EMOJIS.get(main_cond, "🌤️")
        temp_c = data["main"]["temp"]
        temp_f = round((temp_c * 9 / 5) + 32, 1)
        feels_c = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        wind_kmh = round(data["wind"]["speed"] * 3.6, 1)

        return (
            f"### {emoji} Weather for **{name}, {country}**\n\n"
            f"- **Condition:** {description} {emoji}\n"
            f"- **Temperature:** {temp_c:.1f}°C ({temp_f}°F)\n"
            f"- **Feels Like:** {feels_c:.1f}°C\n"
            f"- **Humidity:** {humidity}%\n"
            f"- **Wind Speed:** {wind_kmh} km/h\n\n"
            f"*Data provided in real-time by OpenWeatherMap.*"
        )
    except Exception as e:
        print(f"[WeatherService] OpenWeatherMap error: {e}")
        return None


def _get_from_open_meteo(city: str) -> str | None:
    """Fallback: Fetch weather from free Open-Meteo API."""
    try:
        geo_url = (
            f"https://geocoding-api.open-meteo.com/v1/search"
            f"?name={requests.utils.quote(city)}&count=1&language=en&format=json"
        )
        geo_resp = requests.get(geo_url, timeout=REQUEST_TIMEOUT).json()
        results = geo_resp.get("results", [])
        if not results:
            return None

        loc = results[0]
        lat, lon = loc["latitude"], loc["longitude"]
        place = f"{loc['name']}{', ' + loc.get('country', '') if loc.get('country') else ''}"

        weather_url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}&current_weather=true"
        )
        weather_resp = requests.get(weather_url, timeout=REQUEST_TIMEOUT).json()
        curr = weather_resp.get("current_weather")
        if not curr:
            return None

        temp_c = curr["temperature"]
        temp_f = round((temp_c * 9 / 5) + 32, 1)
        wind = curr["windspeed"]

        return (
            f"### 🌤️ Weather for **{place}**\n\n"
            f"- **Temperature:** {temp_c}°C ({temp_f}°F)\n"
            f"- **Wind Speed:** {wind} km/h\n\n"
            f"*Data provided in real-time by Open-Meteo.*"
        )
    except Exception as e:
        print(f"[WeatherService] Open-Meteo error: {e}")
        return None


def get_weather(message: str) -> str:
    """Main entry point — fetch weather for city extracted from message."""
    city = _extract_city(message)
    api_key = os.getenv("OPENWEATHER_API_KEY", OPENWEATHER_API_KEY)

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
    msg = message.lower()
    return any(kw in msg for kw in keywords)
