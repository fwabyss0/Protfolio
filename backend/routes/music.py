"""
backend/routes/music.py
Dynamic music folder scanner and API.
"""
import os
import json
from flask import Blueprint, jsonify, current_app

music_bp = Blueprint("music", __name__, url_prefix="/api/music")

SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a"}
DEFAULT_COVER = "/static/images/music/default.jpg"


@music_bp.route("", methods=["GET"])
def list_music():
    music_dir = os.path.join(current_app.static_folder, "music")
    images_dir = os.path.join(current_app.static_folder, "images", "music")
    lyrics_dir = os.path.join(current_app.static_folder, "lyrics")

    songs = []
    if os.path.isdir(music_dir):
        for filename in sorted(os.listdir(music_dir)):
            ext = os.path.splitext(filename)[1].lower()
            if ext not in SUPPORTED_EXTENSIONS:
                continue

            basename = os.path.splitext(filename)[0]
            cover_in_music = os.path.join(images_dir, f"{basename}.jpg")
            cover_in_images = os.path.join(current_app.static_folder, "images", f"{basename}.jpg")
            if os.path.exists(cover_in_music):
                cover_url = f"/static/images/music/{basename}.jpg"
            elif os.path.exists(cover_in_images):
                cover_url = f"/static/images/{basename}.jpg"
            else:
                cover_url = DEFAULT_COVER

            lrc_path = os.path.join(lyrics_dir, f"{basename}.lrc")
            has_lyrics = os.path.exists(lrc_path)

            songs.append({
                "title": basename,
                "artist": "Unknown Artist",
                "album": "Local Music",
                "cover": cover_url,
                "file": f"/static/music/{filename}",
                "lyrics": f"/static/lyrics/{basename}.lrc" if has_lyrics else None,
            })

    return jsonify(songs)
