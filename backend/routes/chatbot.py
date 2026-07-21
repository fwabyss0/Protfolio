"""
chatbot.py  (backend/routes/chatbot.py)
Flask Blueprint for the /chat and /health endpoints.
Receives messages, routes intents, and returns JSON responses.
"""
import math
import re
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify

from ..services.intent_service import detect_intent, is_follow_up
from ..services.memory_service import add_message, get_history, clear_history
from ..services.portfolio_service import get_portfolio_response, is_portfolio_query
from ..services.weather_service import get_weather
from ..services.github_service import get_github_data
from ..services.ai_service import generate_response

chatbot_bp = Blueprint("chatbot", __name__)


# ── Math Evaluator ──────────────────────────────────────────────────────────

def _evaluate_math(expression: str) -> str | None:
    """Safely evaluate a basic math expression."""
    expr = expression.lower().strip()

    # Strip common prefixes
    for prefix in ["what is", "calculate", "solve", "how much is"]:
        expr = expr.replace(prefix, "").strip()
    expr = expr.rstrip("?").strip()

    # Percentage: "15% of 200"
    pct_match = re.match(r'^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$', expr)
    if pct_match:
        pct = float(pct_match.group(1))
        total = float(pct_match.group(2))
        result = (pct / 100) * total
        return f"### 🧮 Math Result\n- **Calculation:** `{pct}% of {total}`\n- **Result:** **`{_fmt(result)}`**"

    # Word replacements
    for word, sym in [("plus", "+"), ("minus", "-"), ("times", "*"), ("multiplied by", "*"),
                      ("divided by", "/"), ("over", "/"), ("power of", "**"), ("x", "*")]:
        expr = expr.replace(word, sym)

    expr = expr.replace("^", "**")

    # Math functions
    expr = re.sub(r'\bsqrt\(', 'math.sqrt(', expr)
    expr = re.sub(r'\bsin\(', 'math.sin(', expr)
    expr = re.sub(r'\bcos\(', 'math.cos(', expr)
    expr = re.sub(r'\btan\(', 'math.tan(', expr)
    expr = re.sub(r'\babs\(', 'abs(', expr)
    expr = re.sub(r'\blog\(', 'math.log10(', expr)
    expr = expr.replace("pi", str(math.pi)).replace(" e ", str(math.e))

    # Sanitize — allow only safe chars
    if not re.match(r'^[0-9\+\-\*\/\%\.\(\)\s\,math\.sqrtsincogtabpile\*]+$', expr):
        return None

    try:
        result = eval(expr, {"__builtins__": {}}, {"math": math, "abs": abs})  # noqa: S307
        if isinstance(result, (int, float)) and not (result != result):  # not NaN
            return f"### 🧮 Math Result\n- **Calculation:** `{expression.strip()}`\n- **Result:** **`{_fmt(result)}`**"
    except Exception:
        return None

    return None


def _fmt(value: float) -> str:
    """Format a number nicely."""
    if isinstance(value, float) and value == int(value):
        return str(int(value))
    return f"{value:.6g}"


def _get_time_response(message: str) -> str:
    now = datetime.now()
    msg = message.lower()
    time_str = now.strftime("%I:%M:%S %p")
    date_str = now.strftime("%A, %B %d, %Y")
    tz = "Asia/Kathmandu"

    if ("time" in msg or "clock" in msg) and "date" not in msg and "day" not in msg:
        return f"🕒 Current Time: **{time_str}** ({tz})"
    if ("date" in msg or "today" in msg) and "time" not in msg:
        return f"📅 Today's Date: **{date_str}**"
    return f"🕒 **{time_str}** on 📅 **{date_str}** ({tz})"


# ── Main Chat Endpoint ───────────────────────────────────────────────────────

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(force=True) or {}
        user_message = (data.get("message") or "").strip()
        session_id = data.get("session_id") or request.headers.get("X-Session-ID") or str(uuid.uuid4())

        if not user_message:
            return jsonify({"error": "No message provided"}), 400

        # Load session memory
        history = get_history(session_id)

        # Detect intent
        intent = detect_intent(user_message)

        response_text = ""

        if intent == "clear":
            clear_history(session_id)
            response_text = "✅ Chat history cleared! Starting fresh. How can I help you? 😊"

        elif intent == "time":
            response_text = _get_time_response(user_message)

        elif intent == "weather":
            weather_data = get_weather(user_message)
            response_text = generate_response(user_message, history, live_context=weather_data)

        elif intent == "github":
            github_data = get_github_data()
            response_text = generate_response(user_message, history, live_context=github_data)

        elif intent == "math":
            math_result = _evaluate_math(user_message)
            if math_result:
                response_text = math_result
            else:
                # Let AI solve complex math
                response_text = generate_response(user_message, history)

        elif intent == "portfolio":
            portfolio_resp = get_portfolio_response(user_message)
            if portfolio_resp:
                response_text = portfolio_resp
            else:
                # Fall through to AI with portfolio context
                response_text = generate_response(user_message, history)

        else:
            # General AI response
            response_text = generate_response(user_message, history)

        # Save to memory
        add_message(session_id, "user", user_message)
        add_message(session_id, "assistant", response_text)

        return jsonify({
            "response": response_text,
            "session_id": session_id,
            "intent": intent
        })

    except Exception as e:
        print(f"[ChatbotRoute] Unhandled error: {e}")
        return jsonify({
            "error": "Something went wrong. Please try again.",
            "response": "Oops! I ran into an issue. Please try again in a moment! 🤖"
        }), 500


@chatbot_bp.route("/health", methods=["GET"])
def health():
    import os
    return jsonify({
        "status": "healthy",
        "services": {
            "openrouter": "configured" if os.getenv("OPENROUTER_API_KEY") else "not configured",
            "openweather": "configured" if os.getenv("OPENWEATHER_API_KEY") else "not configured",
            "ollama": os.getenv("OLLAMA_HOST", "http://localhost:11434"),
            "github_user": os.getenv("GITHUB_USERNAME", "fwabyss0"),
        },
        "message": "Abyss AI Chatbot Backend Active 🤖"
    })
