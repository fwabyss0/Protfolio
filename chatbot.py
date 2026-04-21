from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re

app = Flask(__name__)
CORS(app)

# Load training data
def load_training_data():
    try:
        with open('chatbot_training.txt', 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        return ""

TRAINING_DATA = load_training_data()

# Social media links
SOCIAL_LINKS = {
    'facebook': 'https://www.facebook.com/alish.shrestha.138982',
    'instagram': 'https://www.instagram.com/aliisshhhhhh/',
    'linkedin': 'https://www.linkedin.com/in/alish-shrestha-4276b8379/',
    'github': 'https://github.com/fwabyss0',
    'discord': 'fwabyss'
}

# Enhanced keyword matching with shorter responses
KNOWLEDGE_BASE = {
    'greetings': {
        'keywords': ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'sup', 'yo'],
        'responses': [
            "Hello! 👋 I'm Abyss, Alish's AI assistant!",
            "Hi there! 😊 I'm Abyss! What can I tell you about Alish?",
            "Hey! 🎉 Abyss here, ready to chat about Alish!",
            "Namaste! 🙏 I'm Abyss - ask me anything about Alish!",
            "Hello! ✨ Abyss here, I know all about Alish's journey!"
            
        ]
    },
    'about': {
        'keywords': ['who is alish', 'about alish', 'tell me about', 'introduce', 'background'],
        'responses': [
            "Alish is an 18-year-old AI student from Bhaktapur, Nepal! 🇳🇵",
            "He's studying AI at Softwarica College 🎓",
            "Tech wizard from Nepal, passionate about AI! 🧠✨",
            "18-year-old future AI developer from Bhaktapur! 🚀",
            "Creative coder from Nepal studying AI! 💻"
        ]
    },
    'age': {
        'keywords': ['age', 'old', 'how old', 'years old', 'born', 'birthday', 'when was he born', 'what age', 'his age'],
        'responses': [
            "18 years old! 🎉",
            "He's 18! 😊",
            "18 🎂",
            "Young at 18! ✨",
            "Just 18! 🚀"
        ]
    },
    'skills': {
        'keywords': ['skills', 'programming', 'languages', 'technologies', 'what can he do', 'abilities', 'tech stack', 'what does he know', 'coding skills', 'technical skills', 'expertise'],
        'responses': [
            "Python, JavaScript, HTML/CSS, AI/ML! 💻",
            "AI, TensorFlow, Web Dev, Photography! 🚀",
            "Programming + Creative skills! ✨",
            "Python 🐍 JavaScript ⚡ AI 🤖 Photography 📸",
            "Tech + Creative combo! 🎨💻",
            "Web dev, AI, and creative arts! 🎆"
        ]
    },
    'education': {
        'keywords': ['education', 'study', 'college', 'university', 'softwarica', 'coventry', 'learning'],
        'responses': [
            "AI at Softwarica College (Coventry University)! 🎓",
            "Studying Artificial Intelligence! 🧠",
            "Softwarica College - AI student! ✨",
            "Learning AI at university! 🚀"
        ]
    },
    'location': {
        'keywords': ['location', 'where', 'from', 'live', 'address', 'nepal', 'bhaktapur'],
        'responses': [
            "Changu Narayan-01, Bhaktapur, Nepal! 🇳🇵",
            "Bhaktapur, Nepal! 🏰",
            "From Nepal! 🇳🇵✨",
            "Beautiful Bhaktapur! 🌄"
        ]
    },
    'projects': {
        'keywords': ['projects', 'work', 'portfolio', 'created', 'built', 'developed'],
        'responses': [
            "This portfolio + chatbot! 🎉",
            "You're seeing his work now! ✨",
            "Check his GitHub for more! 💻",
            "Interactive portfolio project! 🚀"
        ]
    },
    'contact': {
        'keywords': ['contact', 'email', 'reach', 'connect', 'get in touch'],
        'responses': [
            "Email: alish@example.com 📧",
            "Ask me for social media links! 🚀",
            "LinkedIn, Instagram, Facebook, GitHub! 🌐",
            "Connect via social media! ✨"
        ]
    }
}

def get_social_media_response(platform):
    """Generate social media response with clickable links"""
    platform_lower = platform.lower()
    
    if 'instagram' in platform_lower:
        return f"📸 Find Alish on Instagram @aliisshhhhhh! He shares creative content and personal moments.<br><br><a href='{SOCIAL_LINKS['instagram']}' target='_blank' style='color: #e4405f; text-decoration: none; font-weight: bold;'>🔗 Visit Instagram Profile</a> 🌟"
    
    elif 'linkedin' in platform_lower:
        return f"💼 Connect with Alish on LinkedIn for professional networking! He shares AI journey updates and career progress.<br><br><a href='{SOCIAL_LINKS['linkedin']}' target='_blank' style='color: #0077b5; text-decoration: none; font-weight: bold;'>🔗 Visit LinkedIn Profile</a> 🚀"
    
    elif 'facebook' in platform_lower:
        return f"👥 Connect with Alish on Facebook! He shares updates and connects with friends.<br><br><a href='{SOCIAL_LINKS['facebook']}' target='_blank' style='color: #1877f2; text-decoration: none; font-weight: bold;'>🔗 Visit Facebook Profile</a> 👋"
    
    elif 'github' in platform_lower:
        return f"👨‍💻 Check out Alish's code on GitHub @alish-shrestha! All his projects and contributions are there.<br><br><a href='{SOCIAL_LINKS['github']}' target='_blank' style='color: #333; text-decoration: none; font-weight: bold;'>🔗 Visit GitHub Profile</a> 🗺️"
    
    elif 'discord' in platform_lower:
        return f"🎮 Add Alish on Discord: {SOCIAL_LINKS['discord']}! Perfect for tech chats and gaming. Just search for his username and send a friend request! 🛡️"
    
    return None

def generate_intelligent_response(message):
    """Generate intelligent responses using keyword matching and context"""
    message_lower = message.lower()
    
    # Check for social media first (highest priority)
    social_platforms = ['instagram', 'linkedin', 'facebook', 'github', 'discord']
    for platform in social_platforms:
        if platform in message_lower:
            social_response = get_social_media_response(platform)
            if social_response:
                return social_response
    
    # Check knowledge base
    for category, data in KNOWLEDGE_BASE.items():
        if any(keyword in message_lower for keyword in data['keywords']):
            import random
            return random.choice(data['responses'])
    
    # Default responses for unknown queries
    default_responses = [
        "Ask me about Alish! 🚀",
        "Try: skills, age, projects, social media! ✨",
        "What would you like to know? 🤔",
        "Ask about his AI journey! 🧠",
        "Skills? Projects? Social media? 🎉",
        "I know lots about Alish! 💡"
    ]
    
    import random
    return random.choice(default_responses)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Generate response
        response = generate_intelligent_response(user_message)
        
        return jsonify({'response': response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'Alish\'s AI Chatbot is running! 🤖✨'})

if __name__ == '__main__':
    print("🤖 Starting Alish's AI Chatbot...")
    print("📚 Loading training data...")
    print(f"✅ Loaded {len(TRAINING_DATA)} characters of training data")
    print("🚀 Chatbot ready at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
