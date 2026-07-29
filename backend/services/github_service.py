"""
services/github_service.py
Fetches live GitHub profile stats and repositories using api_manager.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Optional

from ..utils.api_manager import get
from ..config import settings

logger = logging.getLogger(__name__)

_CACHE: dict = {"data": None, "timestamp": None}
_CACHE_TTL = 1800


def _is_cache_valid() -> bool:
    if _CACHE["data"] is None or _CACHE["timestamp"] is None:
        return False
    elapsed = (datetime.utcnow() - _CACHE["timestamp"]).total_seconds()
    return elapsed < _CACHE_TTL


def get_github_data() -> str:
    if _is_cache_valid():
        return _CACHE["data"]

    username = os.getenv("GITHUB_USERNAME", settings.github_username)
    token = os.getenv("GITHUB_TOKEN", settings.github_token)
    headers = {"User-Agent": "Abyss-Portfolio-Chatbot/1.0"}
    if token:
        headers["Authorization"] = f"token {token}"

    try:
        user_resp = get(
            f"https://api.github.com/users/{username}",
            headers=headers,
            timeout=settings.github_timeout,
            retries=2,
        )
        if user_resp.status_code != 200:
            return "⚠️ Live GitHub profile data is currently unavailable. Please try again later."
        user = user_resp.json()

        repos_resp = get(
            f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5",
            headers=headers,
            timeout=settings.github_timeout,
            retries=2,
        )
        repos = repos_resp.json() if repos_resp.status_code == 200 else []

        result = (
            f"### 🐙 @{user.get('login')} GitHub Stats\n\n"
            f"- **Public Repos:** {user.get('public_repos', 0)}\n"
            f"- **Followers:** {user.get('followers', 0)}\n"
            f"- **Following:** {user.get('following', 0)}\n"
        )
        if user.get("bio"):
            result += f"- **Bio:** {user['bio']}\n"

        if isinstance(repos, list) and repos:
            result += "\n**Recent Active Repositories:**\n"
            for repo in repos[:5]:
                stars = repo.get("stargazers_count", 0)
                desc = f" — {repo['description']}" if repo.get("description") else ""
                result += f"- [**{repo['name']}**]({repo['html_url']}) ⭐ {stars}{desc}\n"

        _CACHE["data"] = result
        _CACHE["timestamp"] = datetime.utcnow()
        return result
    except Exception as exc:
        logger.warning("GitHub fetch error: %s", exc)
        return "⚠️ Live GitHub profile data is currently unavailable. Please try again later."


def search_repositories(query: str) -> str:
    try:
        resp = get(
            "https://api.github.com/search/repositories",
            params={"q": query, "sort": "stars", "per_page": 5},
            timeout=settings.github_timeout,
            retries=2,
        )
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return f"No GitHub repositories found for '{query}'."
        lines = [f"🔍 **Top repos for '{query}':**"]
        for repo in items[:5]:
            stars = repo.get("stargazers_count", 0)
            desc = repo.get("description", "") or ""
            lines.append(f"- [{repo['full_name']}]({repo['html_url']}) ⭐ {stars} — {desc[:80]}")
        return "\n".join(lines)
    except Exception as exc:
        logger.warning("GitHub search error: %s", exc)
        return f"⚠️ GitHub search failed for '{query}'."


def is_github_query(message: str) -> bool:
    keywords = ["github stats", "github profile", "github repos", "github repositories",
                "fwabyss0", "alish github", "github followers", "his repositories", "search github", "find github"]
    return any(k in message.lower() for k in keywords)
