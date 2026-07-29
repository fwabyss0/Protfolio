"""
services/ai_service.py
Connects to OpenRouter (primary) or Ollama (fallback) to generate AI responses.
API keys are loaded from environment variables only.
"""
from __future__ import annotations

import os
import logging
from datetime import datetime
from typing import Optional

import requests

from .portfolio_service import get_system_context

logger = logging.getLogger(__name__)

_OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
_OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
_OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
_REQUEST_TIMEOUT = int(os.getenv("AI_TIMEOUT", "30"))


def _build_system_prompt(live_context: str = "") -> str:
    now = datetime.now()
    time_str = now.strftime("%A, %B %d, %Y at %I:%M %p")
    portfolio_ctx = get_system_context()
    live_block = f"\nREAL-TIME DATA (use this accurately):\n{live_context}\n" if live_context else ""
    return f"""You are Abyss, a smart, friendly, professional, and highly capable AI assistant integrated into Alish Shrestha's portfolio website.

CURRENT DATE & TIME: {time_str}

{portfolio_ctx}
{live_block}
YOUR INSTRUCTIONS:
1. Be friendly, natural, and professional — never robotic.
2. When asked about Alish Shrestha (his skills, projects, education, contact), use the PORTFOLIO DATA above.
3. Answer general knowledge questions, programming questions, explain concepts, tell jokes, give motivational quotes, share interesting facts, and help with code debugging.
4. Use Markdown formatting (bold, bullets, code blocks, tables) to make responses clear and readable.
5. Never hallucinate live data. If real-time data is in context above, use it. If unavailable, say so honestly.
6. You have access to conversation history — use it to understand follow-up questions.
"""


def _call_openrouter(messages: list[dict], live_context: str = "") -> Optional[str]:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return None
    try:
        system_prompt = _build_system_prompt(live_context)
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "https://github.com/fwabyss0/Protfolio",
                "X-Title": "Abyss AI Assistant",
                "Content-Type": "application/json",
            },
            json={
                "model": os.getenv("OPENROUTER_MODEL", _OPENROUTER_MODEL),
                "messages": full_messages,
                "max_tokens": 600,
                "temperature": 0.7,
            },
            timeout=_REQUEST_TIMEOUT,
        )
        data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return text.strip() if text else None
    except Exception as exc:
        logger.warning("OpenRouter error: %s", exc)
        return None


def _call_ollama(messages: list[dict], live_context: str = "") -> Optional[str]:
    try:
        system_prompt = _build_system_prompt(live_context)
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        resp = requests.post(
            f"{_OLLAMA_HOST}/api/chat",
            json={
                "model": _OLLAMA_MODEL,
                "messages": full_messages,
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 400},
            },
            timeout=_REQUEST_TIMEOUT,
        )
        data = resp.json()
        text = data.get("message", {}).get("content", "") or data.get("response", "")
        return text.strip() if text else None
    except Exception as exc:
        logger.warning("Ollama error: %s", exc)
        return None


def generate_response(message: str, history: list[dict], live_context: str = "") -> str:
    """Generate AI response. Priority: OpenRouter → Ollama → Fallback."""
    trimmed_history = history[-8:] if len(history) > 8 else history

    if _OPENROUTER_KEY:
        result = _call_openrouter(trimmed_history + [{"role": "user", "content": message}], live_context)
        if result:
            return result

    result = _call_ollama(trimmed_history + [{"role": "user", "content": message}], live_context)
    if result:
        return result

    # Local fallback
    from .portfolio_service import get_portfolio_response
    direct = get_portfolio_response(message)
    if direct:
        return direct

    msg = message.lower().strip()
    import random

    if any(k in msg for k in ["age", "how old", "born"]):
        return "Alish is 18 years old."
    if any(k in msg for k in ["college", "university", "softwarica", "coventry", "study", "education"]):
        return "Alish is studying AI at Softwarica College of IT & E-Commerce, affiliated with Coventry University, UK."
    if any(k in msg for k in ["skills", "programming", "tech stack", "abilities"]):
        return "Alish's skills include Python, JavaScript, HTML/CSS, AI/ML (TensorFlow, PyTorch), and creative tools like photography and video editing."
    if any(k in msg for k in ["location", "where", "from", "nepal", "bhaktapur"]):
        return "Alish is from Changu Narayan-01, Bhaktapur, Nepal."
    if any(k in msg for k in ["projects", "portfolio", "built", "created", "developed"]):
        return "Alish has built projects like Yatra Travel Agency, Printing Resolution, and this interactive portfolio with Abyss AI."
    if any(k in msg for k in ["joke"]):
        return random.choice([
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "There are 10 types of people: those who understand binary, and those who don't! 😂",
            "Why did the developer quit? Because he didn't get arrays! 💻",
        ])
    if any(k in msg for k in ["hello", "hi", "hey", "namaste"]):
        return "Hello! I'm Abyss, Alish's AI assistant. How can I help you today? 😊"

    return "I'm Abyss, your AI assistant! Ask me anything about Alish's portfolio, programming, math, or general knowledge! 🤖✨"
