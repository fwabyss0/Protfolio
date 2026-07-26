"""
spotify.py
Flask Blueprint for Spotify API endpoints.
Provides /api/spotify for the frontend widget.
"""

import os
import time
from flask import Blueprint, jsonify, current_app
from ..services.spotify_service import SpotifyService

spotify_bp = Blueprint("spotify", __name__)

# Simple in-memory cache for Spotify responses
_cache = {"data": None, "expires_at": 0}
CACHE_TTL = int(os.getenv("SPOTIFY_CACHE_TTL", "15"))  # seconds


def _get_service() -> SpotifyService:
    """Lazy-load the Spotify service."""
    if not hasattr(current_app, "_spotify_service"):
        current_app._spotify_service = SpotifyService()
    return current_app._spotify_service


@spotify_bp.route("/api/spotify", methods=["GET"])
def get_spotify_data():
    """
    GET /api/spotify

    Returns current playback state or recently played track.
    Cached for 15-30 seconds to reduce rate limits.
    """
    now = time.time()

    # Serve cached response if still valid
    if _cache["data"] is not None and now < _cache["expires_at"]:
        return jsonify(_cache["data"])

    service = _get_service()

    try:
        # Get credentials status
        has_credentials = all([
            service.client_id,
            service.client_secret,
            service.refresh_token,
        ])

        if not has_credentials:
            _cache["data"] = {
                "error": "Spotify credentials not configured.",
                "is_configured": False,
            }
            _cache["expires_at"] = now + CACHE_TTL
            return jsonify(_cache["data"])

        # Fetch now playing data
        track = service.get_now_playing()

        if track is None:
            result = {
                "is_playing": False,
                "error": None,
                "is_configured": True,
                "no_recent": True,
                "message": "Nothing recently played.",
            }
        else:
            result = {
                "is_playing": track.get("is_playing", False),
                "error": None,
                "is_configured": True,
                "no_recent": False,
                "track": {
                    "title": track.get("title", "Unknown"),
                    "artist": track.get("artist", "Unknown Artist"),
                    "album": track.get("album", "Unknown Album"),
                    "album_cover": track.get("album_cover", ""),
                    "progress": track.get("progress", 0),
                    "duration": track.get("duration", 0),
                    "spotify_url": track.get("spotify_url", "#"),
                    "played_at": track.get("played_at"),
                },
            }

        _cache["data"] = result
        _cache["expires_at"] = now + CACHE_TTL
        return jsonify(result)

    except Exception as e:
        result = {
            "error": "Spotify Offline",
            "is_configured": True,
            "is_playing": False,
            "no_recent": False,
        }
        _cache["data"] = result
        _cache["expires_at"] = now + CACHE_TTL
        return jsonify(result)
