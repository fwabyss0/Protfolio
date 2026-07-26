const http = require('http');
const https = require('https');
const { getPortfolioContext } = require('./portfolioService');

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';

function buildSystemPrompt(liveDataContext = null) {
    const portfolioContext = getPortfolioContext();
    const now = new Date();
    const sysTime = `CURRENT DATE & TIME: ${now.toDateString()} ${now.toLocaleTimeString('en-US')} (Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone})`;

    let liveContextBlock = '';
    if (liveDataContext) {
        liveContextBlock = `\nREAL-TIME DATA (Use this exact information):\n${liveDataContext}\n`;
    }

    return `You are Abyss, a smart, friendly, professional, and highly capable AI assistant integrated into Alish Shrestha's portfolio website.

${sysTime}

${portfolioContext}

${liveContextBlock}

YOUR CAPABILITIES & INSTRUCTIONS:
1. **Persona**: You are friendly, professional, helpful, and natural. Keep conversation engaging.
2. **Portfolio Questions**: Prioritize Alish Shrestha's real data when users ask about Alish, his projects, skills, education, experience, or contact details.
3. **General Intelligence & Math**: Answer general knowledge, science, programming, math calculations, step-by-step problem solving, concept explanations, quotes, jokes, facts, recommendations (books, movies, sites), translation, summarization, and project ideas.
4. **Multi-Turn Memory**: You have access to recent message history in this chat session. Use previous user statements to answer follow-up questions intelligently.
5. **Response Formatting**: Use Markdown freely! Use bullet points, numbered lists, tables, bold text, inline code, and code blocks with language tags (e.g. \`\`\`python ... \`\`\`) when explaining code or data.
6. **Live Data Rule**: Do NOT hallucinate live data. If live data is provided in context above, use it accurately. If live data is unavailable, state it politely.
7. **No Robotic Phrases**: Speak like a natural human assistant. Avoid repeating yourself.
`;
}

// Call OpenRouter API (Primary LLM Provider)
async function callOpenRouterApi(userMessage, history = [], liveDataContext = null) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    return new Promise((resolve, reject) => {
        const systemPrompt = buildSystemPrompt(liveDataContext);
        const messages = [{ role: 'system', content: systemPrompt }];

        if (Array.isArray(history)) {
            history.slice(-8).forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({ role: msg.role, content: msg.content });
                }
            });
        }
        messages.push({ role: 'user', content: userMessage });

        const requestData = JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: messages,
            max_tokens: 600,
            temperature: 0.7
        });

        const options = {
            hostname: 'openrouter.ai',
            path: '/api/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/fwabyss0/Protfolio',
                'X-Title': 'Abyss AI Assistant',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestData)
            },
            timeout: 15000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const text = parsed.choices?.[0]?.message?.content;
                    resolve(text ? text.trim() : null);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('OpenRouter API request timeout'));
        });

        req.write(requestData);
        req.end();
    });
}

// Call Ollama /api/chat with full message history (Fallback Provider 1)
async function callOllamaChat(userMessage, history = [], liveDataContext = null) {
    return new Promise((resolve, reject) => {
        const systemPrompt = buildSystemPrompt(liveDataContext);
        const messages = [{ role: 'system', content: systemPrompt }];

        if (Array.isArray(history)) {
            history.slice(-8).forEach(msg => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({ role: msg.role, content: msg.content });
                }
            });
        }
        messages.push({ role: 'user', content: userMessage });

        const requestData = JSON.stringify({
            model: MODEL,
            messages: messages,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 400
            }
        });

        const url = new URL(`${OLLAMA_HOST}/api/chat`);
        const options = {
            hostname: url.hostname,
            port: url.port || 11434,
            path: url.pathname,
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
                    const text = response.message?.content || response.response || '';
                    resolve(text.trim() || null);
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

// Fallback intelligent generator if external LLMs are unreachable
function generateFallbackAIResponse(userMessage, history = [], liveDataContext = null) {
    const msg = userMessage.toLowerCase().trim();

    if (liveDataContext) {
        return liveDataContext;
    }

    // Helper to randomly combine sentence components
    function mix(openings, cores, closings) {
        const o = openings[Math.floor(Math.random() * openings.length)];
        const c = cores[Math.floor(Math.random() * cores.length)];
        const cl = closings[Math.floor(Math.random() * closings.length)];
        return `${o}${c}${cl}`;
    }

    // Import direct links mapping
    const { getPortfolioDirectResponse } = require('./portfolioService');
    const directRes = getPortfolioDirectResponse(userMessage);
    if (directRes) {
        return directRes;
    }

    // 1. AGE MATCH
    if (msg.includes('age') || msg.includes('how old') || msg.includes('years old') || msg.includes('birthday') || msg.includes('born')) {
        return mix(
            ["Alish is ", "He is currently ", "Alish's age is ", "He is about "],
            ["18 years old", "18 years young", "in his late teens at 18", "18, full of energy and coding passion"],
            [" and studying computer science.", " with a bright future ahead in AI.", " and constantly learning new tools.", "."]
        );
    }

    // 2. EDUCATION / COLLEGE MATCH
    if (msg.includes('college') || msg.includes('university') || msg.includes('softwarica') || msg.includes('coventry') || msg.includes('study') || msg.includes('education') || msg.includes('school')) {
        return mix(
            ["Alish is studying ", "He is currently pursuing AI ", "His higher education is ", "He studies AI "],
            ["at Softwarica College of IT & E-Commerce", "affiliated with Coventry University, UK", "focusing on machine learning and neural networks", "specializing in Artificial Intelligence"],
            [" in Kathmandu.", " to build future-ready solutions.", " where he learns data science.", "."]
        );
    }

    // 3. SKILLS MATCH
    if (msg.includes('skills') || msg.includes('what can he do') || msg.includes('abilities') || msg.includes('tech stack') || msg.includes('programming') || msg.includes('languages') || msg.includes('expertise')) {
        return mix(
            ["Alish has skills in ", "His main expertise includes ", "He is skilled in ", "His tech stack covers "],
            ["Programming (Python, JS, HTML/CSS) and AI (TensorFlow)", "AI & Machine Learning (neural networks, deep learning)", "Creative Design (photography, video editing, UI/UX)", "Tools & Platforms like GitHub, VS Code, Git, and Terminal"],
            [" which he uses to build neat projects.", " for developing end-to-end applications.", " enabling him to merge technology and design.", "."]
        );
    }

    // 4. LOCATION MATCH
    if (msg.includes('location') || msg.includes('where') || msg.includes('from') || msg.includes('live') || msg.includes('nepal') || msg.includes('bhaktapur')) {
        return mix(
            ["Alish comes from ", "He lives in ", "He is based in ", "His hometown is "],
            ["Changu Narayan-01, Bhaktapur, Nepal", "the historic city of Bhaktapur, Nepal", "Nepal, near the beautiful mountains of Bhaktapur", "Bhaktapur, Nepal, a UNESCO World Heritage site"],
            [" where he codes.", " and pursues his AI studies.", " enjoying the culture and tech scene.", "."]
        );
    }

    // 5. EXPERIENCE / PROJECTS MATCH
    if (msg.includes('experience') || msg.includes('work') || msg.includes('projects') || msg.includes('portfolio') || msg.includes('built') || msg.includes('created') || msg.includes('developed')) {
        return mix(
            ["Alish is gaining experience ", "He builds practical skills ", "His experience comes from ", "He has hands-on experience "],
            ["by developing web apps and coding projects", "through interactive projects like this portfolio", "exploring TensorFlow and machine learning models", "challenges and personal software building"],
            [" while actively looking for new opportunities.", " and expanding his knowledge.", " to solve real-world problems.", "."]
        );
    }

    // 6. ABOUT ALISH MATCH
    if (msg.includes('alish') || msg.includes('who') || msg.includes('about') || msg.includes('tell me') || msg.includes('introduce') || msg.includes('background') || msg.includes('person')) {
        return mix(
            ["Alish Shrestha is ", "Meet Alish - ", "He is ", "Alish is a creative "],
            ["a 19-year-old AI enthusiast and Manager at Print Village from Nepal", "a student pursuing Computer Science & AI at Softwarica College", "a passionate programmer and technology creator", "a developer who loves merging code with creativity"],
            [" who loves building web apps and models.", " and enjoys learning deep learning and neural networks.", " with skills in Python, JavaScript, and TensorFlow.", "."]
        );
    }

    // General programming interest detection from history
    let preferredLang = 'Python';
    if (Array.isArray(history)) {
        history.forEach(h => {
            if (h.content && h.content.toLowerCase().includes('python')) preferredLang = 'Python';
            if (h.content && h.content.toLowerCase().includes('javascript')) preferredLang = 'JavaScript';
        });
    }

    if (msg.includes('project') || msg.includes('recommend a project') || msg.includes('idea')) {
        return `Since you're interested in ${preferredLang}, here are some great project ideas you can build:\n\n` +
               `1. **AI Chatbot with Web Search**: Build a conversational bot in ${preferredLang} using local models or API endpoints.\n` +
               `2. **Real-Time Data Dashboard**: Connect live APIs (Weather, Stocks, GitHub) into an interactive UI.\n` +
               `3. **Automated Task Scheduler**: Write script automation for repetitive workflow tasks.`;
    }

    if (msg.includes('joke')) {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "There are 10 types of people in the world: those who understand binary, and those who don't! 😂",
            "Why did the developer leave his job? Because he didn't get arrays! 💻",
            "What is a programmer's favorite hangout place? Foo Bar! 🍻",
            "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (msg.includes('quote') || msg.includes('motivation')) {
        const quotes = [
            "\"The best way to predict the future is to invent it.\" – Alan Kay 🚀",
            "\"Code is like humor. When you have to explain it, it's bad.\" – Cory House ✨",
            "\"First, solve the problem. Then, write the code.\" – John Johnson 💡",
            "\"Simplicity is the soul of efficiency.\" – Austin Freeman ⚡",
            "\"Make it work, make it right, make it fast.\" – Kent Beck 🏃"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    if (msg.includes('fact')) {
        const facts = [
            "💡 **Interesting Tech Fact**: The first computer bug was an actual real moth found trapped inside a Harvard Mark II computer in 1947!",
            "💡 **Interesting Tech Fact**: The first webcam was created at Cambridge University to monitor a coffee pot so researchers wouldn't waste trips!",
            "💡 **Interesting Tech Fact**: Python was named after the British comedy troupe 'Monty Python', not the snake!"
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }

    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('namaste')) {
        const greets = [
            "Hello! I'm Abyss, Alish's AI assistant. What would you like to know about him? 🤖",
            "Hi there! How can I help you explore Alish's portfolio today? 😊",
            "Hey! Abyss here, ready to share info about Alish's AI journey! 🚀",
            "Namaste! Ask me anything about Alish's skills, college, projects, or CV! 🙏"
        ];
        return greets[Math.floor(Math.random() * greets.length)];
    }

    return "I'm Abyss, your AI assistant! Ask me anything about programming, math calculations, technology, general knowledge, or Alish Shrestha's portfolio! 🤖✨";
}


async function generateAIResponse(userMessage, history = [], liveDataContext = null) {
    // 1. Try OpenRouter API (Primary LLM)
    try {
        const openRouterRes = await callOpenRouterApi(userMessage, history, liveDataContext);
        if (openRouterRes) return openRouterRes;
    } catch (e) {
        console.log('OpenRouter API failed or timed out:', e.message);
    }

    // 2. Try Ollama local LLM (Fallback 1)
    try {
        const ollamaRes = await callOllamaChat(userMessage, history, liveDataContext);
        if (ollamaRes) return ollamaRes;
    } catch (e) {
        // ignore & fallback
    }

    // 3. Fallback AI generator
    return generateFallbackAIResponse(userMessage, history, liveDataContext);
}

module.exports = {
    generateAIResponse
};
