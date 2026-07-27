"""
spotify.py
Flask Blueprint for Spotify API endpoints.
Provides /api/spotify for the frontend widget.
"""

import os
import time
from datetime import datetime
from flask import Blueprint, jsonify, current_app
from ..services.spotify_service import SpotifyService

spotify_bp = Blueprint("spotify", __name__)

# Simple in-memory cache for Spotify responses
_cache = {"data": None, "expires_at": 0}
CACHE_TTL = int(os.getenv("SPOTIFY_CACHE_TTL", "15"))  # seconds

FAVORITE_SONG = {
    "title": "Gantabya",
    "artist": "Rockheads",
    "album": "Gantabya",
    "album_cover": "https://i.scdn.co/image/ab67616d0000b2737f033b9dcf0f676a73eeb92f",
    "spotify_url": "https://open.spotify.com/embed/playlist/62pCtrE3EcFtNaTlvQfNWN?utm_source=generator&theme=0&si=0f925d674e864c77",
}


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
    print(f"[Spotify] Endpoint called at {datetime.now().isoformat()}")

    # Serve cached response if still valid
    if _cache["data"] is not None and now < _cache["expires_at"]:
        print("[Spotify] Returning cached response")
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
            print("[Spotify] ERROR: Missing credentials")
            result = {
                "is_playing": False,
                "fallback": FAVORITE_SONG,
            }
            _cache["data"] = result
            _cache["expires_at"] = now + CACHE_TTL
            return jsonify(result)

        # Fetch now playing data
        print("[Spotify] Fetching now playing data...")
        track = service.get_now_playing()

        if track is None:
            print("[Spotify] No track found, returning favorite song fallback")
            result = {
                "is_playing": False,
                "fallback": FAVORITE_SONG,
            }
        else:
            print(f"[Spotify] Track found: {track.get('title')} by {track.get('artist')}")
            result = {
                "is_playing": track.get("is_playing", False),
                "fallback": None,
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
        print(f"[Spotify] ERROR: {type(e).__name__}: {e}")
        result = {
            "is_playing": False,
            "fallback": FAVORITE_SONG,
        }
        _cache["data"] = result
        _cache["expires_at"] = now + CACHE_TTL
        return jsonify(result)
