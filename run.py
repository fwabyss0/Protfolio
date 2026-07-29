"""
run.py (project root)
Launches the Python Flask backend.
Run with: python run.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from backend.app import app
from backend.config import settings

if __name__ == "__main__":
    port = settings.port
    print("=" * 55)
    print("  🤖 Abyss AI Chatbot Python Backend Starting...")
    print(f"  🚀 Running at: http://localhost:{port}")
    print(f"  🧠 OpenRouter: {'✅ configured' if settings.openrouter_api_key else '⚠️  not configured'}")
    print(f"  🌤️  Weather API: {'✅ configured' if settings.openweather_api_key else '⚠️  not configured'}")
    print(f"  🦙 Ollama Host: {settings.ollama_host}")
    print("=" * 55)
    app.run(debug=False, host="0.0.0.0", port=port)