"""
portfolio_service.py
Handles all portfolio-related queries locally (no AI call needed).
"""
import random

PORTFOLIO_DATA = {
    "name": "Alish Shrestha",
    "age": 18,
    "location": "Changu Narayan-01, Bhaktapur, Nepal",
    "email": "shresthaalish444@gmail.com",
    "college": "Softwarica College of IT & E-Commerce (Coventry University, UK)",
    "degree": "BSc (Hons) Computer Science with Artificial Intelligence",
    "secondary_school": "Khwopa Secondary School, Bhaktapur (Computer Science, 2023-2025)",
    "primary_school": "North East English Secondary School, Bhaktapur",
    "skills": {
        "programming": ["Python", "JavaScript", "HTML5", "CSS3", "C++", "C#"],
        "ai_ml": ["TensorFlow", "PyTorch", "Machine Learning", "Neural Networks", "Deep Learning", "Data Science"],
        "tools": ["VS Code", "GitHub", "Git", "Terminal", "Arduino"],
        "creative": ["Photography", "Video Editing", "UI/UX Design", "Communication"]
    },
    "projects": [
        {
            "name": "Yatra Travel Agency",
            "description": "Travel booking & tour guide website built for Nepal tourism.",
            "link": "https://yatrala.netlify.app",
            "github": "https://github.com/fwabyss0/Yatra.git"
        },
        {
            "name": "Printing Resolution",
            "description": "Online printing service platform for custom prints and designs.",
            "link": "https://printresolution.netlify.app",
            "github": "https://github.com/fwabyss0/pr"
        },
        {
            "name": "Interactive Portfolio & AI Assistant (Abyss)",
            "description": "Personal interactive web portfolio featuring real-time AI assistant.",
            "github": "https://github.com/fwabyss0/Protfolio.git"
        }
    ],
    "social": {
        "github": "https://github.com/fwabyss0",
        "linkedin": "https://www.linkedin.com/in/alish-shrestha-4276b8379/",
        "instagram": "https://www.instagram.com/aliisshhhhhh/",
        "facebook": "https://www.facebook.com/alish.shrestha.138982",
        "discord": "fwabyss"
    },
    "cv": "Alish_Shrestha_CV.pdf"
}

PORTFOLIO_KEYWORDS = {
    "greeting": ["hi", "hello", "hey", "namaste", "good morning", "good afternoon", "good evening", "sup", "yo"],
    "about": ["who is alish", "about alish", "tell me about", "introduce", "background", "who are you", "alish"],
    "age": ["age", "how old", "years old", "born", "birthday"],
    "skills": ["skills", "programming", "tech stack", "coding", "abilities", "technologies", "expertise", "languages"],
    "education": ["education", "study", "college", "university", "softwarica", "coventry", "school", "degree", "learning"],
    "projects": ["projects", "work", "portfolio", "built", "created", "developed", "yatra", "printing resolution"],
    "contact": ["contact", "email", "reach", "get in touch"],
    "cv": ["cv", "resume", "curriculum vitae", "download cv"],
    "location": ["location", "where", "from", "live", "nepal", "bhaktapur", "address"],
    "social_github": ["github", "git", "code", "repositories", "repos"],
    "social_linkedin": ["linkedin", "professional", "network", "career"],
    "social_instagram": ["instagram", "insta", "ig", "photos"],
    "social_facebook": ["facebook", "fb", "friends"],
    "social_discord": ["discord", "gaming", "fwabyss", "friend request"],
    "abyss": ["abyss", "chatbot", "ai assistant", "who are you", "what are you"],
}


def is_portfolio_query(message: str) -> bool:
    msg = message.lower()
    for keywords in PORTFOLIO_KEYWORDS.values():
        if any(kw in msg for kw in keywords):
            return True
    return False


def get_portfolio_response(message: str) -> str | None:
    msg = message.lower()
    d = PORTFOLIO_DATA

    # Greetings
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["greeting"]):
        return random.choice([
            "Hello! 👋 I'm Abyss, Alish's AI assistant! How can I help you today?",
            "Hi there! 😊 I'm Abyss! What can I tell you about Alish?",
            "Hey! 🎉 Abyss here — ask me anything about Alish or anything else!",
            "Namaste! 🙏 I'm Abyss. How can I help you?"
        ])

    # Abyss identity
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["abyss"]) and "alish" not in msg:
        return (
            "I'm **Abyss** 🤖 — Alish Shrestha's personal AI assistant! "
            "I can answer questions about Alish, help with general knowledge, check live weather, "
            "fetch crypto prices, solve math problems, and much more. What would you like to know?"
        )

    # Social media — Discord
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["social_discord"]):
        return f"🎮 Add Alish on Discord: **{d['social']['discord']}** — send him a friend request to chat!"

    # Social media — GitHub
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["social_github"]):
        return (
            f"👨‍💻 Check out Alish's code on GitHub:\n\n"
            f"[github.com/fwabyss0]({d['social']['github']})"
        )

    # Social media — LinkedIn
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["social_linkedin"]):
        return (
            f"💼 Connect with Alish on LinkedIn:\n\n"
            f"[Alish Shrestha LinkedIn]({d['social']['linkedin']})"
        )

    # Social media — Instagram
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["social_instagram"]):
        return (
            f"📸 Follow Alish on Instagram:\n\n"
            f"[@aliisshhhhhh]({d['social']['instagram']})"
        )

    # Social media — Facebook
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["social_facebook"]):
        return (
            f"👥 Connect with Alish on Facebook:\n\n"
            f"[Alish Shrestha]({d['social']['facebook']})"
        )

    # CV / Resume
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["cv"]):
        return f"📄 You can download Alish's official CV here: [{d['cv']}]({d['cv']})"

    # Contact / Email
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["contact"]):
        return (
            f"📧 You can reach Alish directly at: [{d['email']}](mailto:{d['email']})\n\n"
            f"Or connect via LinkedIn, GitHub, or Instagram!"
        )

    # Location
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["location"]):
        return f"📍 Alish is from **{d['location']}** — a beautiful UNESCO heritage city in Nepal! 🇳🇵"

    # Age
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["age"]):
        return f"🎂 Alish is **{d['age']} years old** — young and full of ambition!"

    # Education
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["education"]):
        return (
            f"🎓 **Alish's Education:**\n\n"
            f"- **Currently:** {d['college']} — {d['degree']}\n"
            f"- **Secondary:** {d['secondary_school']}\n"
            f"- **Primary:** {d['primary_school']}"
        )

    # Skills
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["skills"]):
        skills = d["skills"]
        return (
            f"💻 **Alish's Skills:**\n\n"
            f"- **Programming:** {', '.join(skills['programming'])}\n"
            f"- **AI / ML:** {', '.join(skills['ai_ml'])}\n"
            f"- **Tools:** {', '.join(skills['tools'])}\n"
            f"- **Creative:** {', '.join(skills['creative'])}"
        )

    # Projects
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["projects"]):
        lines = ["🚀 **Alish's Projects:**\n"]
        for i, p in enumerate(d["projects"], 1):
            line = f"{i}. **{p['name']}** — {p['description']}"
            if p.get("link"):
                line += f" | [Live]({p['link']})"
            if p.get("github"):
                line += f" | [GitHub]({p['github']})"
            lines.append(line)
        return "\n".join(lines)

    # About Alish
    if any(kw in msg for kw in PORTFOLIO_KEYWORDS["about"]):
        return (
            f"👤 **About Alish Shrestha:**\n\n"
            f"Alish is an **{d['age']}-year-old** AI student and creative developer from **{d['location']}** 🇳🇵. "
            f"He is currently pursuing a **{d['degree']}** at **{d['college']}**. "
            f"Passionate about Python, Machine Learning, and building innovative web projects!"
        )

    return None


def get_system_context() -> str:
    """Returns full portfolio context for the AI system prompt."""
    d = PORTFOLIO_DATA
    return f"""
ABOUT ALISH SHRESTHA (Portfolio Owner):
- Name: {d['name']}
- Age: {d['age']} years old
- Location: {d['location']}
- Email: {d['email']}

EDUCATION:
- Currently: {d['college']} — {d['degree']}
- Secondary: {d['secondary_school']}
- Primary: {d['primary_school']}

SKILLS:
- Programming: {', '.join(d['skills']['programming'])}
- AI/ML: {', '.join(d['skills']['ai_ml'])}
- Tools: {', '.join(d['skills']['tools'])}
- Creative: {', '.join(d['skills']['creative'])}

PROJECTS:
{chr(10).join(f"- {p['name']}: {p['description']}" for p in d['projects'])}

SOCIAL:
- GitHub: {d['social']['github']}
- LinkedIn: {d['social']['linkedin']}
- Instagram: @aliisshhhhhh ({d['social']['instagram']})
- Facebook: {d['social']['facebook']}
- Discord: {d['social']['discord']}
"""
