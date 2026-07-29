"""
utils/intent_router.py
Intelligent intent router using Ollama (primary) and keyword fallback.
Returns structured decisions for tool use or direct AI response.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

import requests

from ..config import settings

logger = logging.getLogger(__name__)

_TOOL_INTENTS = {
    "calculator",
    "time",
    "weather",
    "currency",
    "crypto",
    "marvel",
    "wikipedia",
    "github",
    "news",
    "search",
    "portfolio",
    "memory",
    "clear",
}

_SYSTEM_PROMPT = """You are an intent router for an AI assistant called Abyss.
Analyze the user message and conversation history.
Decide the best intent and whether a tool should be called.

Return ONLY a JSON object with these keys:
{
  "intent": one of [calculator, time, weather, currency, crypto, marvel, wikipedia, github, news, search, portfolio, memory, clear, ai],
  "tool": null or the same value as intent if a tool should be called,
  "params": {} or relevant extracted parameters like {"city": "Kathmandu", "expression": "12+5", "from": "USD", "to": "NPR"}
}

Rules:
- calculator: math expressions, percentages, powers, trig, unit math
- time: current time/date/timezone conversion
- weather: current/future weather, temperature, forecast, humidity, wind, rain
- currency: currency conversion
- crypto: cryptocurrency prices, market cap, trends
- marvel: characters, movies, TV, MCU, comics, multiverse, Infinity Stones, X-Men, Avengers
- wikipedia: factual summaries on science, history, programming, countries, people, animals, technology
- github: repositories, stars, forks, commits, contributors, releases
- news: latest news by category (technology, AI, Marvel, sports, world, Nepal, business, entertainment)
- search: recent events or facts not covered by other tools
- portfolio: anything about Alish Shrestha, his skills, projects, education, contact, CV
- memory: user asks what you remember, or tells you to remember/forget something
- clear: user wants to clear/reset chat history
- ai: general conversation, greetings, jokes, quotes, explanations, code help

If unsure, choose "ai" with tool null.
Never return markdown, only raw JSON.
"""


def _keyword_fallback(message: str) -> dict[str, Any]:
    msg = message.lower().strip()
    if any(k in msg for k in ["clear chat", "clear history", "reset chat", "start over"]):
        return {"intent": "clear", "tool": "clear", "params": {}}
    if any(k in msg for k in ["weather", "temperature", "forecast", "humidity", "rain", "wind"]):
        return {"intent": "weather", "tool": "weather", "params": {"query": message}}
    if any(k in msg for k in ["time", "date", "day", "clock", "timezone", "tokyo", "london", "kathmandu"]):
        return {"intent": "time", "tool": "time", "params": {"query": message}}
    if any(k in msg for k in ["calculate", "solve", "math", "what is", "how much", "%", "+", "-", "*", "/", "^", "sqrt", "sin", "cos", "tan", "log"]):
        return {"intent": "calculator", "tool": "calculator", "params": {"query": message}}
    if any(k in msg for k in ["usd", "eur", "gbp", "npr", "inr", "jpy", "currency", "convert", "exchange"]):
        return {"intent": "currency", "tool": "currency", "params": {"query": message}}
    if any(k in msg for k in ["bitcoin", "btc", "ethereum", "eth", "solana", "bnb", "dogecoin", "crypto", "market cap"]):
        return {"intent": "crypto", "tool": "crypto", "params": {"query": message}}
    if any(k in msg for k in ["marvel", "mcu", "avengers", "spider-man", "iron man", "thor", "captain america", "black panther", "doctor strange", "x-men", "thanos", "loki"]):
        return {"intent": "marvel", "tool": "marvel", "params": {"query": message}}
    if any(k in msg for k in ["github", "repos", "stars", "forks", "commits", "contributors", "fwabyss0"]):
        return {"intent": "github", "tool": "github", "params": {"query": message}}
    if any(k in msg for k in ["news", "headline", "latest", "breaking", "technology", "ai news", "sports", "world", "nepal"]):
        return {"intent": "news", "tool": "news", "params": {"query": message}}
    if any(k in msg for k in ["search", "google", "look up", "find", "who is", "what is", "explain"]) and len(msg.split()) > 3:
        return {"intent": "search", "tool": "search", "params": {"query": message}}
    if any(k in msg for k in ["remember", "forget", "memory", "what do you remember"]):
        return {"intent": "memory", "tool": "memory", "params": {"query": message}}
    if any(k in msg for k in ["alish", "skills", "projects", "education", "college", "softwarica", "coventry", "cv", "contact", "email", "location", "bhaktapur", "age", "github", "linkedin", "instagram", "discord"]):
        return {"intent": "portfolio", "tool": None, "params": {}}
    return {"intent": "ai", "tool": None, "params": {}}


def decide(message: str, history: list[dict] | None = None) -> dict[str, Any]:
    """
    Decide which tool or AI path should handle the message.
    Returns dict with keys: intent, tool, params.
    """
    history = history or []

    # Always try LLM router first if Ollama is available
    ollama_host = os.getenv("OLLAMA_HOST", settings.ollama_host)
    ollama_model = os.getenv("OLLAMA_MODEL", settings.ollama_model)

    if ollama_host:
        try:
            messages = [
                {"role": "system", "content": _SYSTEM_PROMPT},
                *history[-6:],
                {"role": "user", "content": message},
            ]
            resp = requests.post(
                f"{ollama_host}/api/chat",
                json={
                    "model": ollama_model,
                    "messages": messages,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_predict": 120},
                },
                timeout=settings.ai_timeout,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data.get("message", {}).get("content", "").strip()
            if text:
                parsed = json.loads(text)
                if isinstance(parsed, dict) and "intent" in parsed:
                    intent = parsed.get("intent", "ai")
                    tool = parsed.get("tool")
                    params = parsed.get("params", {})
                    if intent in _TOOL_INTENTS:
                        logger.debug("LLM router intent=%s tool=%s", intent, tool)
                        return {"intent": intent, "tool": tool, "params": params}
        except Exception as exc:
            logger.warning("LLM intent router failed: %s", exc)

    return _keyword_fallback(message)
