"""
ai_service.py
Connects to OpenRouter (primary) or Ollama (fallback) to generate AI responses.
API keys are loaded from environment variables only.
"""
import os
import json
import requests
from datetime import datetime
from .portfolio_service import get_system_context

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")
REQUEST_TIMEOUT = 15


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
4. For math questions, provide clear step-by-step solutions.
5. Use Markdown formatting (bold, bullets, code blocks, tables) to make responses clear and readable.
6. Never hallucinate live data. If real-time data is in context above, use it. If unavailable, say so honestly.
7. You have access to conversation history — use it to understand follow-up questions.
"""


def _call_openrouter(messages: list[dict], live_context: str = "") -> str | None:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return None

    system_prompt = _build_system_prompt(live_context)
    full_messages = [{"role": "system", "content": system_prompt}] + messages

    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "https://github.com/fwabyss0/Protfolio",
                "X-Title": "Abyss AI Assistant",
                "Content-Type": "application/json",
            },
            json={
                "model": os.getenv("OPENROUTER_MODEL", OPENROUTER_MODEL),
                "messages": full_messages,
                "max_tokens": 600,
                "temperature": 0.7,
            },
            timeout=REQUEST_TIMEOUT,
        )
        data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return text.strip() if text else None
    except Exception as e:
        print(f"[AIService] OpenRouter error: {e}")
        return None


def _call_ollama(messages: list[dict], live_context: str = "") -> str | None:
    system_prompt = _build_system_prompt(live_context)
    full_messages = [{"role": "system", "content": system_prompt}] + messages
    ollama_host = os.getenv("OLLAMA_HOST", OLLAMA_HOST)
    ollama_model = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)

    try:
        resp = requests.post(
            f"{ollama_host}/api/chat",
            json={
                "model": ollama_model,
                "messages": full_messages,
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 400},
            },
            timeout=REQUEST_TIMEOUT,
        )
        data = resp.json()
        text = data.get("message", {}).get("content", "") or data.get("response", "")
        return text.strip() if text else None
    except Exception as e:
        print(f"[AIService] Ollama error: {e}")
        return None


def _fallback_response(message: str, history: list[dict]) -> str:
    msg = message.lower().strip()
    import random

    def mix(openings: list[str], cores: list[str], closings: list[str]) -> str:
        return f"{random.choice(openings)}{random.choice(cores)}{random.choice(closings)}"

    # Check for direct link matches first
    from .portfolio_service import get_portfolio_response
    direct_res = get_portfolio_response(message)
    if direct_res:
        return direct_res

    # 1. AGE MATCH
    if any(kw in msg for kw in ["age", "how old", "years old", "birthday", "born"]):
        return mix(
            ["Alish is ", "He is currently ", "Alish's age is ", "He is about "],
            ["18 years old", "18 years young", "in his late teens at 18", "18, full of energy and coding passion"],
            [" and studying computer science.", " with a bright future ahead in AI.", " and constantly learning new tools.", "."]
        )

    # 2. EDUCATION / COLLEGE MATCH
    if any(kw in msg for kw in ["college", "university", "softwarica", "coventry", "study", "education", "school"]):
        return mix(
            ["Alish is studying ", "He is currently pursuing AI ", "His higher education is ", "He studies AI "],
            ["at Softwarica College of IT & E-Commerce", "affiliated with Coventry University, UK", "focusing on machine learning and neural networks", "specializing in Artificial Intelligence"],
            [" in Kathmandu.", " to build future-ready solutions.", " where he learns data science.", "."]
        )

    # 3. SKILLS MATCH
    if any(kw in msg for kw in ["skills", "what can he do", "abilities", "tech stack", "programming", "languages", "expertise"]):
        return mix(
            ["Alish has skills in ", "His main expertise includes ", "He is skilled in ", "His tech stack covers "],
            ["Programming (Python, JS, HTML/CSS) and AI (TensorFlow)", "AI & Machine Learning (neural networks, deep learning)", "Creative Design (photography, video editing, UI/UX)", "Tools & Platforms like GitHub, VS Code, Git, and Terminal"],
            [" which he uses to build neat projects.", " for developing end-to-end applications.", " enabling him to merge technology and design.", "."]
        )

    # 4. LOCATION MATCH
    if any(kw in msg for kw in ["location", "where", "from", "live", "nepal", "bhaktapur"]):
        return mix(
            ["Alish comes from ", "He lives in ", "He is based in ", "His hometown is "],
            ["Changu Narayan-01, Bhaktapur, Nepal", "the historic city of Bhaktapur, Nepal", "Nepal, near the beautiful mountains of Bhaktapur", "Bhaktapur, Nepal, a UNESCO World Heritage site"],
            [" where he codes.", " and pursues his AI studies.", " enjoying the culture and tech scene.", "."]
        )

    # 5. EXPERIENCE / PROJECTS MATCH
    if any(kw in msg for kw in ["experience", "work", "projects", "portfolio", "built", "created", "developed"]):
        return mix(
            ["Alish is gaining experience ", "He builds practical skills ", "His experience comes from ", "He has hands-on experience "],
            ["by developing web apps and coding projects", "through interactive projects like this portfolio", "exploring TensorFlow and machine learning models", "challenges and personal software building"],
            [" while actively looking for new opportunities.", " and expanding his knowledge.", " to solve real-world problems.", "."]
        )

    # 6. ABOUT ALISH MATCH
    if any(kw in msg for kw in ["alish", "who", "about", "tell me", "introduce", "background", "person"]):
        return mix(
            ["Alish Shrestha is ", "Meet Alish - ", "He is ", "Alish is a creative "],
            ["a 19-year-old AI enthusiast and Manager at Print Village from Nepal", "a student pursuing Computer Science & AI at Softwarica College", "a passionate programmer and technology creator", "a developer who loves merging code with creativity"],
            [" who loves building web apps and models.", " and enjoys learning deep learning and neural networks.", " with skills in Python, JavaScript, and TensorFlow.", "."]
        )

    # Detect preferred language from history
    preferred_lang = "Python"
    for h in history:
        if "python" in h.get("content", "").lower():
            preferred_lang = "Python"
        elif "javascript" in h.get("content", "").lower():
            preferred_lang = "JavaScript"

    if "project" in msg or "idea" in msg:
        return (
            f"Here are some great {preferred_lang} project ideas:\n\n"
            f"1. **AI Chatbot** — Build a conversational bot using local models or API endpoints.\n"
            f"2. **Real-Time Dashboard** — Connect live APIs (Weather, Stocks, GitHub) to a UI.\n"
            f"3. **Task Automation** — Write scripts to automate repetitive workflows.\n"
            f"4. **Image Classifier** — Build an ML model using TensorFlow or PyTorch."
        )

    if "joke" in msg:
        return random.choice([
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "There are 10 types of people: those who understand binary, and those who don't! 😂",
            "Why did the developer quit? Because he didn't get arrays! 💻",
            "What is a programmer's favorite hangout place? Foo Bar! 🍻",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
        ])

    if "quote" in msg or "motivat" in msg:
        return random.choice([
            '"The best way to predict the future is to invent it." – Alan Kay 🚀',
            '"Code is like humor. When you have to explain it, it\'s bad." – Cory House ✨',
            '"First, solve the problem. Then, write the code." – John Johnson 💡',
            '"Simplicity is the soul of efficiency." – Austin Freeman ⚡',
            '"Make it work, make it right, make it fast." – Kent Beck 🏃'
        ])

    if "fact" in msg:
        return random.choice([
            "💡 **Interesting Tech Fact**: The first computer bug was an actual moth found trapped in a Harvard Mark II computer in 1947!",
            "💡 **Interesting Tech Fact**: The first webcam was created at Cambridge University to monitor a coffee pot so researchers wouldn't waste trips!",
            "💡 **Interesting Tech Fact**: Python was named after the British comedy troupe 'Monty Python', not the snake!"
        ])

    if any(kw in msg for kw in ["hi", "hello", "hey", "namaste"]):
        return random.choice([
            "Hello! I'm Abyss, Alish's AI assistant. What would you like to know about him? 🤖",
            "Hi there! How can I help you explore Alish's portfolio today? 😊",
            "Hey! Abyss here, ready to share info about Alish's AI journey! 🚀",
            "Namaste! Ask me anything about Alish's skills, college, projects, or CV! 🙏"
        ])

    return "I'm Abyss, your AI assistant! Ask me anything about Alish's portfolio, programming, math, or general knowledge! 🤖✨"


def generate_response(message: str, history: list[dict], live_context: str = "") -> str:
    """
    Generate an AI response.
    Priority: OpenRouter → Ollama → Fallback generator
    """
    # Trim history to last 8 exchanges
    trimmed_history = history[-8:] if len(history) > 8 else history

    # 1. Try OpenRouter
    result = _call_openrouter(trimmed_history + [{"role": "user", "content": message}], live_context)
    if result:
        return result

    # 2. Try Ollama
    result = _call_ollama(trimmed_history + [{"role": "user", "content": message}], live_context)
    if result:
        return result

    # 3. Built-in fallback
    return _fallback_response(message, history)
