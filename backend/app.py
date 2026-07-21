"""
app.py  (backend/app.py)
Main Flask application entry point for the Abyss AI Chatbot Python backend.
Reads configuration from .env file.
"""
import os
import sys

# ── Load .env ───────────────────────────────────────────────────────────────
def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        # Try parent directory (project root)
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")

    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, _, val = line.partition("=")
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if key and not os.environ.get(key):
                        os.environ[key] = val
        print(f"[App] Loaded configuration from {env_path}")
    else:
        print("[App] WARNING: No .env file found. Using environment variables only.")

_load_env()

# ── Flask App ────────────────────────────────────────────────────────────────
from flask import Flask
from flask_cors import CORS
from .routes.chatbot import chatbot_bp

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register the chatbot blueprint at root (keeps /chat and /health paths)
    app.register_blueprint(chatbot_bp)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print("=" * 55)
    print("  🤖 Abyss AI Chatbot Python Backend Starting...")
    print(f"  🚀 Running at: http://localhost:{port}")
    print(f"  🧠 OpenRouter: {'✅ configured' if os.getenv('OPENROUTER_API_KEY') else '⚠️  not configured'}")
    print(f"  🌤️  Weather API: {'✅ configured' if os.getenv('OPENWEATHER_API_KEY') else '⚠️  not configured'}")
    print(f"  🦙 Ollama Host: {os.getenv('OLLAMA_HOST', 'http://localhost:11434')}")
    print("=" * 55)
    app.run(debug=False, host="0.0.0.0", port=port)
