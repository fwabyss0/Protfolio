const http = require('http');
const https = require('https');
const { getPortfolioContext } = require('./portfolioService');

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
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
    const msg = userMessage.toLowerCase();

    if (liveDataContext) {
        return liveDataContext;
    }

    let preferredLang = null;
    if (Array.isArray(history)) {
        history.forEach(h => {
            if (h.role === 'user' && h.content.toLowerCase().includes('python')) preferredLang = 'Python';
            if (h.role === 'user' && h.content.toLowerCase().includes('javascript')) preferredLang = 'JavaScript';
        });
    }

    if (msg.includes('project') || msg.includes('recommend a project')) {
        const lang = preferredLang || 'Python';
        return `Since you're interested in ${lang}, here are some great project ideas you can build:\n\n` +
               `1. **AI Chatbot with Web Search**: Build a conversational bot in ${lang} using local models or API endpoints.\n` +
               `2. **Real-Time Data Dashboard**: Connect live APIs (Weather, Stocks, GitHub) into an interactive UI.\n` +
               `3. **Automated Task Scheduler**: Write script automation for repetitive workflow tasks.`;
    }

    if (msg.includes('joke')) {
        const jokes = [
            "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
            "There are 10 types of people in the world: those who understand binary, and those who don't! 😂",
            "Why did the developer leave his job? Because he didn't get arrays! 💻"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (msg.includes('quote') || msg.includes('motivation')) {
        const quotes = [
            "\"The best way to predict the future is to invent it.\" – Alan Kay 🚀",
            "\"Code is like humor. When you have to explain it, it's bad.\" – Cory House ✨",
            "\"First, solve the problem. Then, write the code.\" – John Johnson 💡"
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    if (msg.includes('fact')) {
        return "💡 **Interesting Tech Fact**: The first computer bug was an actual real moth found trapped inside a Harvard Mark II computer in 1947!";
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
