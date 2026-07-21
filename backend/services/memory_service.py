"""
memory_service.py
Lightweight in-memory conversation history store for multi-turn chat sessions.
"""
from collections import defaultdict
from datetime import datetime

# Stores histories keyed by session_id
_histories: dict[str, list[dict]] = defaultdict(list)
MAX_HISTORY = 16  # Max messages kept per session


def add_message(session_id: str, role: str, content: str) -> None:
    """Add a message to session history. role = 'user' | 'assistant'."""
    _histories[session_id].append({
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat()
    })
    # Trim to max history
    if len(_histories[session_id]) > MAX_HISTORY:
        _histories[session_id] = _histories[session_id][-MAX_HISTORY:]


def get_history(session_id: str) -> list[dict]:
    """Return message history for a session (without internal timestamps)."""
    return [
        {"role": m["role"], "content": m["content"]}
        for m in _histories.get(session_id, [])
    ]


def clear_history(session_id: str) -> None:
    """Clear all history for a session."""
    _histories[session_id] = []


def get_session_ids() -> list[str]:
    """Return all active session IDs."""
    return list(_histories.keys())


def get_context_string(session_id: str) -> str:
    """
    Returns last few messages as a simple context string.
    Useful for detecting follow-up questions.
    """
    history = get_history(session_id)
    if not history:
        return ""
    lines = []
    for msg in history[-6:]:
        prefix = "User" if msg["role"] == "user" else "Abyss"
        lines.append(f"{prefix}: {msg['content']}")
    return "\n".join(lines)
