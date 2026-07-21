"""
github_service.py
Fetches live GitHub profile stats and repositories for Alish Shrestha.
"""
import os
import requests
from datetime import datetime

GITHUB_USERNAME = os.getenv("GITHUB_USERNAME", "fwabyss0")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
REQUEST_TIMEOUT = 6

# Cache to avoid hammering the API
_cache: dict = {"data": None, "timestamp": None}
CACHE_TTL_SECONDS = 1800  # 30 minutes


def _get_headers() -> dict:
    headers = {"User-Agent": "Abyss-Portfolio-Chatbot/1.0"}
    token = os.getenv("GITHUB_TOKEN", GITHUB_TOKEN)
    if token:
        headers["Authorization"] = f"token {token}"
    return headers


def _is_cache_valid() -> bool:
    if _cache["data"] is None or _cache["timestamp"] is None:
        return False
    elapsed = (datetime.utcnow() - _cache["timestamp"]).total_seconds()
    return elapsed < CACHE_TTL_SECONDS


def _fetch_github_data() -> str | None:
    username = os.getenv("GITHUB_USERNAME", GITHUB_USERNAME)
    headers = _get_headers()

    try:
        # Fetch user profile
        user_resp = requests.get(
            f"https://api.github.com/users/{username}",
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        if user_resp.status_code != 200:
            return None
        user = user_resp.json()

        # Fetch recent repos
        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos?sort=updated&per_page=5",
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        repos = repos_resp.json() if repos_resp.status_code == 200 else []

        result = (
            f"### 🐙 Alish Shrestha's Live GitHub Stats\n\n"
            f"- **Username:** [@{user.get('login')}]({user.get('html_url')})\n"
            f"- **Public Repositories:** {user.get('public_repos', 0)}\n"
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

        result += "\n*Data fetched in real-time from GitHub API.*"
        return result

    except Exception as e:
        print(f"[GitHubService] Error: {e}")
        return None


def get_github_data() -> str:
    if _is_cache_valid():
        return _cache["data"]

    data = _fetch_github_data()
    if data:
        _cache["data"] = data
        _cache["timestamp"] = datetime.utcnow()
        return data

    return "⚠️ Live GitHub profile data is currently unavailable. Please try again later."


def is_github_query(message: str) -> bool:
    keywords = ["github stats", "github profile", "github repos", "github repositories",
                 "fwabyss0", "alish github", "github followers", "his repositories"]
    msg = message.lower()
    return any(kw in msg for kw in keywords)
