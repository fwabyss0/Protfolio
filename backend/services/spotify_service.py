"""
spotify_service.py
Handles Spotify Web API authentication and data fetching.
Uses refresh token to automatically get access tokens.
"""

import os
import time
import requests
from datetime import datetime, timezone


class SpotifyService:
    """Service class for Spotify Web API interactions."""

    def __init__(self):
        self.client_id = os.getenv("SPOTIFY_CLIENT_ID", "")
        self.client_secret = os.getenv("SPOTIFY_CLIENT_SECRET", "")
        self.refresh_token = os.getenv("SPOTIFY_REFRESH_TOKEN", "")
        self.token_url = "https://accounts.spotify.com/api/token"
        self.api_base = "https://api.spotify.com/v1"
        self._access_token = None
        self._token_expires_at = 0

    def _get_access_token(self) -> str:
        """
        Get a valid access token using the refresh token.
        Automatically refreshes if expired or about to expire.
        """
        if self._access_token and time.time() < self._token_expires_at - 60:
            print("[Spotify] Using cached access token")
            return self._access_token

        if not self.refresh_token or not self.client_id or not self.client_secret:
            print("[Spotify] ERROR: Missing credentials")
            raise ValueError("Missing Spotify credentials. Check environment variables.")

        print("[Spotify] Refreshing access token...")
        auth = (self.client_id, self.client_secret)
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.refresh_token,
        }

        try:
            response = requests.post(self.token_url, auth=auth, data=data, timeout=10)
            print(f"[Spotify] Token refresh response: {response.status_code}")
            response.raise_for_status()
            token_data = response.json()
            print(f"[Spotify] Token refresh data: {token_data}")

            self._access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            self._token_expires_at = time.time() + expires_in

            return self._access_token
        except requests.exceptions.RequestException as e:
            print(f"[Spotify] Token refresh failed: {e}")
            raise RuntimeError(f"Failed to refresh Spotify token: {e}")

    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        """
        Make an authenticated request to the Spotify API.
        """
        token = self._get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        url = f"{self.api_base}/{endpoint.lstrip('/')}"
        print(f"[Spotify] API request: {url}")
        response = requests.get(url, headers=headers, params=params, timeout=10)
        print(f"[Spotify] API response: {response.status_code}")
        response.raise_for_status()
        return response.json()

    def get_currently_playing(self) -> dict:
        """
        Get the currently playing track.
        Returns None if nothing is playing.
        """
        try:
            data = self._make_request("/me/player/currently-playing")
            print(f"[Spotify] Currently playing data: {data}")

            if not data or data.get("currently_playing_type") != "track":
                print("[Spotify] Nothing currently playing")
                return None

            item = data.get("item", {})
            if not item:
                print("[Spotify] No track item in response")
                return None

            return {
                "title": item.get("name", "Unknown"),
                "artist": ", ".join([a.get("name", "") for a in item.get("artists", [])]),
                "album": item.get("album", {}).get("name", "Unknown Album"),
                "album_cover": self._get_best_image(item.get("album", {}).get("images", [])),
                "progress": data.get("progress_ms", 0),
                "duration": item.get("duration_ms", 0),
                "spotify_url": item.get("external_urls", {}).get("spotify", "#"),
                "is_playing": data.get("is_playing", False),
            }
        except requests.exceptions.RequestException as e:
            print(f"[Spotify] Currently playing request failed: {e}")
            return None

    def get_recently_played(self, limit: int = 1) -> dict:
        """
        Get the most recently played track.
        Returns None if no history exists.
        """
        try:
            data = self._make_request("/me/player/recently-played", params={"limit": limit})
            print(f"[Spotify] Recently played data items: {len(data.get('items', []))}")

            if not data.get("items"):
                print("[Spotify] No recently played tracks")
                return None

            track = data["items"][0].get("track", {})
            played_at = data["items"][0].get("played_at", "")

            return {
                "title": track.get("name", "Unknown"),
                "artist": ", ".join([a.get("name", "") for a in track.get("artists", [])]),
                "album": track.get("album", {}).get("name", "Unknown Album"),
                "album_cover": self._get_best_image(track.get("album", {}).get("images", [])),
                "spotify_url": track.get("external_urls", {}).get("spotify", "#"),
                "played_at": self._format_played_at(played_at),
                "is_playing": False,
            }
        except requests.exceptions.RequestException as e:
            print(f"[Spotify] Recently played request failed: {e}")
            return None

    @staticmethod
    def _get_best_image(images: list) -> str:
        """
        Get the best sized album image (prefer 300-400px width).
        """
        if not images:
            return ""

        # Sort by width descending
        sorted_images = sorted(images, key=lambda x: x.get("width", 0) or 0, reverse=True)

        # Try to find an image in the 200-400px range
        for img in sorted_images:
            width = img.get("width", 0) or 0
            if 200 <= width <= 400:
                return img.get("url", "")

        # Fallback to the largest image
        return sorted_images[0].get("url", "") if sorted_images else ""

    @staticmethod
    def _format_played_at(iso_timestamp: str) -> str:
        """
        Format ISO timestamp to a human-readable relative time.
        """
        if not iso_timestamp:
            return "Unknown"

        try:
            played_time = datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            diff = now - played_time

            minutes = int(diff.total_seconds() / 60)
            hours = int(minutes / 60)
            days = int(hours / 24)

            if minutes < 1:
                return "Just now"
            elif minutes < 60:
                return f"{minutes} min ago"
            elif hours < 24:
                return f"{hours}h ago"
            else:
                return f"{days}d ago"
        except (ValueError, TypeError):
            return "Unknown"

    def get_now_playing(self) -> dict:
        """
        Get the best available track info.
        Priority: currently playing → recently played → None
        """
        # Try currently playing first
        current = self.get_currently_playing()
        if current:
            return current

        # Fallback to recently played
        recent = self.get_recently_played(limit=1)
        if recent:
            return recent

        return None
