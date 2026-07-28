"""
intent_service.py
Detects the user's intent and routes to the correct service.
"""
import re


def detect_intent(message: str) -> str:
    """
    Returns one of:
      'time'       → current date/time
      'weather'    → weather_service
      'github'     → github_service
      'math'       → math evaluation
      'marvel'     → marvel_service
      'portfolio'  → portfolio_service
      'clear'      → clear chat
      'ai'         → ai_service (general)
    """
    msg = message.lower().strip()

    # --- Clear chat ---
    if any(kw in msg for kw in ["clear chat", "clear history", "reset chat", "start over", "new conversation"]):
        return "clear"

    # --- Time / Date ---
    time_kws = ["what time", "current time", "what date", "current date", "what day is it", "today's date", "what day is today"]
    if any(kw in msg for kw in time_kws):
        return "time"

    # --- Weather ---
    weather_kws = ["weather", "temperature", "forecast", "climate", "how hot", "how cold", "is it raining", "temp in", "rain in"]
    if any(kw in msg for kw in weather_kws):
        return "weather"

    # --- Marvel (before GitHub so character queries don't go to GitHub) ---
    marvel_kws = [
        "marvel", "mcu", "avengers", "spider-man", "iron man", "thor",
        "captain america", "black panther", "doctor strange", "guardians",
        "x-men", "fantastic four", "infinity stones", "thanos", "loki",
        "wolverine", "deadpool", "multiverse", "secret wars", "doctor doom",
        "kang", "celestials", "wakanda", "asgard", "ant-man", "scarlet witch",
        "vision", "falcon", "winter soldier", "shield", "hydra",
        "spider-verse", "nick fury", "daredevil", "jessica jones",
        "luke cage", "iron fist", "punisher", "ghost rider",
    ]
    if any(kw in msg for kw in marvel_kws):
        return "marvel"

    # --- GitHub ---
    github_kws = ["github stats", "github profile", "github repos", "github repositories",
                  "fwabyss0", "alish github", "github followers", "his repositories"]
    if any(kw in msg for kw in github_kws):
        return "github"

    # --- Math ---
    math_kws = ["calculate", "solve", "math:", "what is", "how much is"]
    has_math_kw = any(kw in msg for kw in math_kws) and bool(re.search(r'\d', msg))
    has_math_expr = bool(re.search(
        r'(\d+(\.\d+)?\s*[\+\-\*\/\^]\s*\d+)|(\d+%\s*of\s*\d+)|(sqrt|sin|cos|tan|log)\(',
        msg
    ))
    if has_math_kw or has_math_expr:
        return "math"

    # --- Portfolio (local data, no AI needed) ---
    portfolio_kws = [
        "alish", "who is", "about alish", "tell me about", "skills", "programming",
        "tech stack", "education", "college", "university", "softwarica", "coventry",
        "projects", "yatra", "printing resolution", "contact", "email", "linkedin",
        "instagram", "facebook", "discord", "github", "location", "nepal", "bhaktapur",
        "age", "how old", "cv", "resume", "abyss", "chatbot", "who are you"
    ]
    if any(kw in msg for kw in portfolio_kws):
        return "portfolio"

    # --- Default → AI ---
    return "ai"


def is_follow_up(message: str, history: list[dict]) -> bool:
    """
    Detects if a message is a follow-up to previous conversation.
    E.g. 'tell me more', 'what else', 'and?'
    """
    follow_up_kws = ["tell me more", "what else", "and?", "more details", "elaborate",
                     "explain more", "continue", "go on", "anything else", "what about"]
    msg = message.lower()
    return any(kw in msg for kw in follow_up_kws) and len(history) > 0
