"""
run.py (project root)
Launches the Python Flask backend.
Run with: python run.py
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from backend.app import app, _load_env

if __name__ == "__main__":
    _load_env()
    port = int(os.getenv("PORT", 5000))
    print("=" * 55)
    print("  🤖 Abyss AI Chatbot Python Backend Starting...")
    print(f"  🚀 Running at: http://localhost:{port}")
    print(f"  🧠 OpenRouter: {'✅ configured' if os.getenv('OPENROUTER_API_KEY') else '⚠️  not configured'}")
    print(f"  🌤️  Weather API: {'✅ configured' if os.getenv('OPENWEATHER_API_KEY') else '⚠️  not configured'}")
    print(f"  🦙 Ollama Host: {os.getenv('OLLAMA_HOST', 'http://localhost:11434')}")
    print("=" * 55)
    app.run(debug=False, host="0.0.0.0", port=port)
