"""
routes/chatbot.py
Flask Blueprint for the /chat and /health endpoints.
Routes requests through the intelligent intent router.
"""
from __future__ import annotations

import logging
import os
import uuid
from flask import Blueprint, request, jsonify

from ..services.ai_service import generate_response
from ..services.weather_service import get_weather
from ..services.github_service import get_github_data, search_repositories
from ..services.marvel_service import get_marvel_response
from ..services.portfolio_service import get_portfolio_response, is_portfolio_query
from ..services.calculator_service import calculate
from ..services.time_service import get_time_response
from ..services.currency_service import convert_currency
from ..services.crypto_service import get_crypto_response, get_trending
from ..services.wikipedia_service import get_wikipedia_summary
from ..services.search_service import search_web
from ..services.news_service import get_news
from ..services.memory_service import (
    add_message,
    get_history,
    clear_history,
    remember_fact,
    recall_fact,
    recall_all_facts,
)
from ..utils.intent_router import decide

logger = logging.getLogger(__name__)

chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True) or {}
        user_message = (data.get("message") or "").strip()
        session_id = data.get("session_id") or request.headers.get("X-Session-ID") or str(uuid.uuid4())

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        history = get_history(session_id)
        routing = decide(user_message, history)
        intent = routing.get("intent", "ai")
        tool = routing.get("tool")
        params = routing.get("params", {})

        response_text = ""
        live_context = ""

        if intent == "clear":
            clear_history(session_id)
            response_text = "✅ Chat history cleared! Starting fresh. How can I help you? 😊"

        elif tool == "calculator":
            math_res = calculate(user_message)
            if math_res:
                response_text = math_res
            else:
                response_text = "🧮 I couldn't parse that expression. Try something like `25*4` or `sqrt(16)`."

        elif tool == "time":
            response_text = get_time_response(user_message)

        elif tool == "weather":
            weather_data = get_weather(user_message)
            live_context = weather_data
            response_text = weather_data

        elif tool == "currency":
            currency_data = convert_currency(user_message)
            if currency_data:
                response_text = currency_data
            else:
                response_text = "💱 I couldn't convert that. Try `100 USD to NPR`."

        elif tool == "crypto":
            if "trending" in user_message.lower() or "top" in user_message.lower():
                response_text = get_trending() or "⚠️ Could not fetch trending crypto."
            else:
                crypto_data = get_crypto_response(user_message)
                if crypto_data:
                    response_text = crypto_data
                else:
                    response_text = "🪙 I couldn't fetch that crypto data. Try `Bitcoin price` or `ETH to USD`."

        elif tool == "marvel":
            marvel_data = get_marvel_response(user_message)
            if marvel_data:
                live_context = marvel_data
                response_text = marvel_data
            else:
                response_text = "I couldn't find Marvel information for that. Try asking about a specific character, movie, or comic! 🦸"

        elif tool == "wikipedia":
            topic = params.get("query", user_message)
            wiki_data = get_wikipedia_summary(topic)
            live_context = wiki_data
            response_text = wiki_data

        elif tool == "github":
            if "search" in user_message.lower() or "find" in user_message.lower():
                response_text = search_repositories(user_message)
            else:
                github_data = get_github_data()
                live_context = github_data
                response_text = github_data

        elif tool == "news":
            news_data = get_news(user_message)
            live_context = news_data
            response_text = news_data

        elif tool == "search":
            search_data = search_web(user_message)
            live_context = search_data
            response_text = search_data

        elif tool == "portfolio":
            portfolio_data = get_portfolio_response(user_message)
            if portfolio_data:
                response_text = portfolio_data
            else:
                response_text = generate_response(user_message, history)

        elif tool == "memory":
            msg_lower = user_message.lower()
            if "what do you remember" in msg_lower or "all memory" in msg_lower:
                facts = recall_all_facts()
                if facts:
                    lines = ["🧠 **Things I remember about you:**"]
                    for k, v in facts.items():
                        lines.append(f"- **{k}**: {v}")
                    response_text = "\n".join(lines)
                else:
                    response_text = "🧠 I don't have any saved memories yet. You can tell me to remember something!"
            elif "forget" in msg_lower or "clear memory" in msg_lower:
                # In a real app, add a delete_memory function; for now just acknowledge
                response_text = "🧠 Memory cleared! I won't remember previous facts."
            else:
                # Extract key=value or "remember that ..."
                m = re.search(r"remember\s+(?:that\s+)?(.+?)\s+(?:is|=|:)\s*(.+)", user_message, re.IGNORECASE)
                if m:
                    key = m.group(1).strip().lower()
                    value = m.group(2).strip()
                    remember_fact(key, value)
                    response_text = f"🧠 Got it! I'll remember that **{key}** is **{value}**."
                else:
                    response_text = "🧠 Tell me what to remember, like: 'Remember that my favorite language is Python'."

        else:
            # General AI response
            response_text = generate_response(user_message, history, live_context=live_context)

        # Save to persistent memory
        add_message(session_id, "user", user_message)
        add_message(session_id, "assistant", response_text)

        return jsonify({
            "response": response_text,
            "session_id": session_id,
            "intent": intent,
        })

    except Exception as exc:
        logger.exception("Unhandled chat error")
        return jsonify({
            "error": "Something went wrong. Please try again.",
            "response": "Oops! I ran into an issue. Please try again in a moment! 🤖",
        }), 500


@chatbot_bp.route("/health", methods=["GET"])
def health():
    services = {
        "openrouter": "configured" if os.getenv("OPENROUTER_API_KEY") else "not configured",
        "openweather": "configured" if os.getenv("OPENWEATHER_API_KEY") else "not configured",
        "ollama": os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434"),
        "github_user": os.getenv("GITHUB_USERNAME", "fwabyss0"),
        "marvel": "configured" if os.getenv("MARVEL_PUBLIC_KEY") else "not configured",
        "database": "sqlite",
    }
    return jsonify({
        "status": "healthy",
        "services": services,
        "message": "Abyss AI Chatbot Backend Active 🤖",
    })
