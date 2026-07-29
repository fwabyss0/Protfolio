"""
app.py  (backend/app.py)
Main Flask application entry point for the Abyss AI Chatbot Python backend.
"""
from __future__ import annotations

import os
import sys

from flask import Flask, send_from_directory
from flask_cors import CORS

from .config import settings
from .database.models import init_db
from .routes.chatbot import chatbot_bp


def create_app() -> Flask:
    app = Flask(__name__, static_folder="../static", static_url_path="/static")
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.register_blueprint(chatbot_bp)

    @app.route("/")
    def serve_index():
        return send_from_directory("..", "index.html")

    @app.route("/<path:filename>")
    def serve_static_files(filename):
        return send_from_directory("..", filename)

    return app


app = create_app()
init_db()

if __name__ == "__main__":
    port = int(os.getenv("PORT", settings.port))
    print("=" * 55)
    print("  🤖 Abyss AI Chatbot Python Backend Starting...")
    print(f"  🚀 Running at: http://localhost:{port}")
    print(f"  🧠 OpenRouter: {'✅ configured' if os.getenv('OPENROUTER_API_KEY') else '⚠️  not configured'}")
    print(f"  🌤️  Weather API: {'✅ configured' if os.getenv('OPENWEATHER_API_KEY') else '⚠️  not configured'}")
    print(f"  🦙 Ollama Host: {os.getenv('OLLAMA_HOST', 'http://127.0.0.1:11434')}")
    print("=" * 55)
    app.run(debug=False, host="0.0.0.0", port=port)
