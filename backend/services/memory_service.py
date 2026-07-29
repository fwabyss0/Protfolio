"""
services/memory_service.py
Persistent chat history and user memory via SQLite.
"""
from __future__ import annotations

import logging
from typing import Optional

from ..database.models import (
    add_message as db_add_message,
    get_history as db_get_history,
    clear_history as db_clear_history,
    get_session_ids as db_get_session_ids,
    get_context_string as db_get_context_string,
    set_memory as db_set_memory,
    get_memory as db_get_memory,
    get_all_memories as db_get_all_memories,
)

logger = logging.getLogger(__name__)


def add_message(session_id: str, role: str, content: str) -> None:
    db_add_message(session_id, role, content)


def get_history(session_id: str, limit: int = 50) -> list[dict]:
    return db_get_history(session_id, limit=limit)


def clear_history(session_id: str) -> None:
    db_clear_history(session_id)


def get_session_ids() -> list[str]:
    return db_get_session_ids()


def get_context_string(session_id: str) -> str:
    return db_get_context_string(session_id)


def remember_fact(key: str, value: str) -> None:
    db_set_memory(key, value)


def recall_fact(key: str) -> Optional[str]:
    return db_get_memory(key)


def recall_all_facts() -> dict[str, str]:
    return db_get_all_memories()
