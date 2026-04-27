const http = require('http');
const fs = require('fs');
const path = require('path');

// Portfolio context for short responses
const PORTFOLIO_CONTEXT = `
You are Abyss, Alish Shrestha's AI assistant. Answer questions about Alish using ONLY this information. Keep responses SHORT (1-2 sentences max).

ABOUT ALISH:
- Name: Alish Shrestha
- Age: 18 years old
- Location: Changu Narayan-01, Bhaktapur, Nepal
- Email: shresthaalish444@gmail.com

EDUCATION:
- Currently: Softwarica College (Coventry University) - Bachelor's in Artificial Intelligence
- 2023-2025: Khwopa Secondary School, Bhaktapur - Computer Science specialization
- Primary: North East English Secondary School, Bhaktapur

SKILLS:
Programming: Python, JavaScript, HTML/CSS, C++, C#
AI/ML: TensorFlow, PyTorch, Machine Learning, Neural Networks, Data Science
Tools: VS Code, GitHub, Git, Arduino, DevTools
Creative: Video Editing, UI/UX Design, Photography, Communication

PROJECTS:
1. Yatra Travel Agency - Travel booking website with tour packages (yatrala.netlify.app)
2. Printing Resolution - Online printing service platform (printresolution.netlify.app)
3. This Portfolio - Interactive portfolio with AI chatbot

SOCIAL LINKS:
- GitHub: github.com/fwabyss0
- LinkedIn: linkedin.com/in/alish-shrestha-4276b8379
- Instagram: @aliisshhhhhh
- Facebook: facebook.com/alish.shrestha.138982

PERSONALITY: Friendly, tech-enthusiast, creative, always learning. Responds briefly with occasional emojis.

RULES:
- Keep answers SHORT (1-2 sentences, under 100 characters when possible)
- Use emojis occasionally
- If unsure, say "Ask Alish directly at shresthaalish444@gmail.com!"
- Never make up information not listed above
`;

// Ollama configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

// Simple HTTP server
const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
        try {
            // Check if Ollama is running
            const ollamaCheck = await checkOllamaStatus();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                ollama: ollamaCheck ? 'connected' : 'disconnected',
                message: "Abyss AI Chatbot is running! 🤖"
            }));
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                ollama: 'disconnected',
                message: "Abyss AI Chatbot running (Ollama offline)"
            }));
        }
        return;
    }

    // Chat endpoint
    if (req.url === '/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const userMessage = data.message || '';

                if (!userMessage) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No message provided' }));
                    return;
                }

                // Try Ollama first, fallback to keyword matching
                const response = await generateResponse(userMessage);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response }));

            } catch (error) {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Failed to generate response',
                    response: "Oops! Something went wrong. Try again! 🤖"
                }));
            }
        });
        return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Check if Ollama is running
async function checkOllamaStatus() {
    return new Promise((resolve) => {
        const options = {
            hostname: '127.0.0.1',
            port: 11434,
            path: '/api/tags',
            method: 'GET',
            timeout: 2000
        };

        const req = http.request(options, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

// Generate response using Ollama or fallback
async function generateResponse(userMessage) {
    // Try Ollama first
    try {
        const ollamaResponse = await callOllama(userMessage);
        if (ollamaResponse) return ollamaResponse;
    } catch (e) {
        console.log('Ollama failed, using fallback:', e.message);
    }

    // Fallback to keyword matching
    return generateFallbackResponse(userMessage);
}

// Call Ollama API
async function callOllama(userMessage) {
    return new Promise((resolve, reject) => {
        const prompt = `${PORTFOLIO_CONTEXT}\n\nUser: ${userMessage}\nAbyss:`;

        const requestData = JSON.stringify({
            model: MODEL,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 100,  // Short responses
                stop: ["User:", "Abyss:", "\n\n"]
            }
        });

        const options = {
            hostname: '127.0.0.1',
            port: 11434,
            path: '/api/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            },
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    // Clean up the response
                    let text = response.response || response.message?.content || '';
                    text = text.trim().replace(/^Abyss:\s*/i, '');
                    text = text.replace(/\n+/g, ' ').trim();
                    resolve(text || null);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Ollama request timeout'));
        });

        req.write(requestData);
        req.end();
    });
}

// Fallback keyword-based responses (from original chatbot.py)
const KNOWLEDGE_BASE = {
    greetings: {
        keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'sup', 'yo'],
        responses: ["Hello! 👋 I'm Abyss!", "Hi there! 😊", "Hey! 🎉", "Namaste! 🙏"]
    },
    about: {
        keywords: ['who is alish', 'about alish', 'tell me about', 'introduce'],
        responses: ["Alish is 18, from Bhaktapur, Nepal! 🇳🇵 Studying AI at Softwarica College.", "18-year-old AI student from Nepal! 🚀", "Tech wizard studying AI! 🧠"]
    },
    age: {
        keywords: ['age', 'old', 'how old', 'years old', 'born'],
        responses: ["18 years old! 🎉", "He's 18! 😊", "18 🎂"]
    },
    skills: {
        keywords: ['skills', 'programming', 'languages', 'tech stack', 'coding'],
        responses: ["Python, JavaScript, AI/ML, TensorFlow! 💻", "AI + Web Dev + Creative! ✨", "Python 🐍 JavaScript ⚡ AI 🤖"]
    },
    education: {
        keywords: ['education', 'study', 'college', 'university', 'softwarica'],
        responses: ["AI at Softwarica College (Coventry)! 🎓", "Studying Artificial Intelligence! 🧠", "Softwarica - AI student! ✨"]
    },
    location: {
        keywords: ['location', 'where', 'from', 'live', 'nepal', 'bhaktapur'],
        responses: ["Bhaktapur, Nepal! 🇳🇵", "From Nepal! 🏰", "Changu Narayan-01, Bhaktapur! 🌄"]
    },
    projects: {
        keywords: ['projects', 'work', 'portfolio', 'built'],
        responses: ["Yatra Travel + Printing Resolution! 🚀", "Check his GitHub! 💻", "Interactive portfolio + chatbot! ✨"]
    },
    contact: {
        keywords: ['contact', 'email', 'reach'],
        responses: ["shresthaalish444@gmail.com 📧", "Social links in Connect section! 🌐"]
    },
    github: {
        keywords: ['github', 'code', 'repo'],
        responses: ["github.com/fwabyss0 👨‍💻", "Check his GitHub! 🗺️"]
    },
    linkedin: {
        keywords: ['linkedin', 'professional'],
        responses: ["linkedin.com/in/alish-shrestha-4276b8379 💼"]
    },
    instagram: {
        keywords: ['instagram', 'ig'],
        responses: ["@aliisshhhhhh 📸"]
    },
    facebook: {
        keywords: ['facebook', 'fb'],
        responses: ["facebook.com/alish.shrestha.138982 👥"]
    }
};

function generateFallbackResponse(message) {
    const msg = message.toLowerCase();

    for (const category in KNOWLEDGE_BASE) {
        const data = KNOWLEDGE_BASE[category];
        if (data.keywords.some(k => msg.includes(k))) {
            return data.responses[Math.floor(Math.random() * data.responses.length)];
        }
    }

    return "Ask about Alish! 🚀 (skills, age, projects, social)";
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log('🤖 Starting Alish\'s AI Chatbot...');
    console.log('🦙 Ollama Integration: ' + (OLLAMA_HOST.includes('11434') ? 'Enabled' : 'Disabled'));
    console.log(`🚀 Chatbot ready at http://localhost:${PORT}`);
    console.log('📡 Waiting for connections...\n');
});

module.exports = { server };
