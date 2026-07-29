"""
services/time_service.py
Time and date service with timezone support.
"""
from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import Optional

from zoneinfo import ZoneInfo, available_timezones

logger = logging.getLogger(__name__)


def _match_timezone(query: str) -> Optional[str]:
    q = query.lower().replace(" ", "_")
    common = {
        "tokyo": "Asia/Tokyo",
        "london": "Europe/London",
        "new_york": "America/New_York",
        "newyork": "America/New_York",
        "paris": "Europe/Paris",
        "dubai": "Asia/Dubai",
        "sydney": "Australia/Sydney",
        "kathmandu": "Asia/Kathmandu",
        "nepal": "Asia/Kathmandu",
        "india": "Asia/Kolkata",
        "delhi": "Asia/Kolkata",
        "singapore": "Asia/Singapore",
        "hong_kong": "Asia/Hong_Kong",
        "hongkong": "Asia/Hong_Kong",
        "los_angeles": "America/Los_Angeles",
        "losangeles": "America/Los_Angeles",
        "chicago": "America/Chicago",
        "toronto": "America/Toronto",
        "vancouver": "America/Vancouver",
        "berlin": "Europe/Berlin",
        "rome": "Europe/Rome",
        "moscow": "Europe/Moscow",
        "beijing": "Asia/Shanghai",
        "shanghai": "Asia/Shanghai",
        "seoul": "Asia/Seoul",
        "bangkok": "Asia/Bangkok",
        "dubai": "Asia/Dubai",
        "istanbul": "Europe/Istanbul",
        "cairo": "Africa/Cairo",
        "johannesburg": "Africa/Johannesburg",
        "lagos": "Africa/Lagos",
        "auckland": "Pacific/Auckland",
        "fiji": "Pacific/Fiji",
        "honolulu": "Pacific/Honolulu",
    }
    if q in common:
        return common[q]
    # Fuzzy match against IANA database
    for tz in available_timezones():
        if q in tz.lower():
            return tz
    return None


def get_time_response(message: str) -> str:
    msg = message.lower()
    tz_match = re.search(r'(?:in|at|for)\s+([A-Za-z\s]+)', msg)
    city = tz_match.group(1).strip().lower() if tz_match else ""
    tz_name = _match_timezone(city) if city else None

    now = datetime.now()

    if tz_name:
        try:
            now = datetime.now(ZoneInfo(tz_name))
            tz_label = tz_name.split("/")[-1].replace("_", " ")
        except Exception:
            tz_label = tz_name
    else:
        tz_label = "Asia/Kathmandu"

    time_str = now.strftime("%I:%M:%S %p").lstrip("0")
    date_str = now.strftime("%A, %B %d, %Y")
    day_str = now.strftime("%A")

    if "time" in msg and "date" not in msg and "day" not in msg:
        return f"🕒 {time_str} ({tz_label})"
    if "date" in msg and "time" not in msg:
        return f"📅 {date_str}"
    if "day" in msg and "time" not in msg and "date" not in msg:
        return f"📆 {day_str}"
    return f"🕒 {time_str} | 📅 {date_str} ({tz_label})"


def is_time_query(message: str) -> bool:
    keywords = ["time", "clock", "date", "today", "day", "timezone", "time in", "date in"]
    msg = message.lower()
    return any(k in msg for k in keywords)
