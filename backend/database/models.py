"""
database/models.py
SQLite-backed persistence for chat history and user memory.
"""
from __future__ import annotations

import sqlite3
import threading
from datetime import datetime
from pathlib import Path
from typing import Optional


_db_lock = threading.Lock()


def _get_db_path() -> Path:
    from ..config import settings
    url = settings.database_url
    if url.startswith("sqlite:///"):
        return Path(url.replace("sqlite:///", ""))
    if url.startswith("sqlite://"):
        return Path(url.replace("sqlite://", ""))
    return Path(url)


def _conn() -> sqlite3.Connection:
    db_path = _get_db_path()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    """Create tables if they do not exist."""
    with _db_lock:
        conn = _conn()
        try:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
                    content TEXT NOT NULL,
                    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
                );
                CREATE TABLE IF NOT EXISTS memories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL UNIQUE,
                    value TEXT NOT NULL,
                    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                );
                CREATE INDEX IF NOT EXISTS idx_messages_session
                    ON messages(session_id, timestamp DESC);
                """
            )
            conn.commit()
        finally:
            conn.close()


def add_message(session_id: str, role: str, content: str) -> None:
    with _db_lock:
        conn = _conn()
        try:
            conn.execute(
                "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
                (session_id, role, content),
            )
            conn.commit()
        finally:
            conn.close()


def get_history(session_id: str, limit: int = 50) -> list[dict]:
    with _db_lock:
        conn = _conn()
        try:
            cur = conn.execute(
                "SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY timestamp ASC LIMIT ?",
                (session_id, limit),
            )
            return [dict(row) for row in cur.fetchall()]
        finally:
            conn.close()


def clear_history(session_id: str) -> None:
    with _db_lock:
        conn = _conn()
        try:
            conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            conn.commit()
        finally:
            conn.close()


def get_session_ids(limit: int = 100) -> list[str]:
    with _db_lock:
        conn = _conn()
        try:
            cur = conn.execute(
                "SELECT DISTINCT session_id FROM messages ORDER BY MAX(timestamp) DESC LIMIT ?",
                (limit,),
            )
            return [row["session_id"] for row in cur.fetchall()]
        finally:
            conn.close()


def get_context_string(session_id: str) -> str:
    history = get_history(session_id, limit=6)
    if not history:
        return ""
    lines = []
    for msg in history:
        prefix = "User" if msg["role"] == "user" else "Abyss"
        lines.append(f"{prefix}: {msg['content']}")
    return "\n".join(lines)


def set_memory(key: str, value: str) -> None:
    with _db_lock:
        conn = _conn()
        try:
            conn.execute(
                """
                INSERT INTO memories (key, value, updated_at) VALUES (?, ?, datetime('now'))
                ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
                """,
                (key, value),
            )
            conn.commit()
        finally:
            conn.close()


def get_memory(key: str) -> Optional[str]:
    with _db_lock:
        conn = _conn()
        try:
            cur = conn.execute("SELECT value FROM memories WHERE key = ?", (key,))
            row = cur.fetchone()
            return row["value"] if row else None
        finally:
            conn.close()


def get_all_memories() -> dict[str, str]:
    with _db_lock:
        conn = _conn()
        try:
            cur = conn.execute("SELECT key, value FROM memories")
            return {row["key"]: row["value"] for row in cur.fetchall()}
        finally:
            conn.close()
