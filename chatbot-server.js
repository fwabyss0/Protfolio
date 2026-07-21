const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple zero-dependency .env loader
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx > 0) {
                    const key = trimmed.slice(0, eqIdx).trim();
                    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        });
    }
}
loadEnv();

const { handleChatRequest } = require('./services/intentRouter');

const PORT = process.env.PORT || 5000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';

// Check Ollama status helper
async function checkOllamaStatus() {
    return new Promise((resolve) => {
        try {
            const url = new URL(`${OLLAMA_HOST}/api/tags`);
            const req = http.request({
                hostname: url.hostname,
                port: url.port || 11434,
                path: url.pathname,
                method: 'GET',
                timeout: 2000
            }, (res) => {
                resolve(res.statusCode === 200);
            });
            req.on('error', () => resolve(false));
            req.on('timeout', () => { req.destroy(); resolve(false); });
            req.end();
        } catch (e) {
            resolve(false);
        }
    });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health Check Endpoint
    if (req.url === '/health' && req.method === 'GET') {
        const isOllamaRunning = await checkOllamaStatus();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            ollama: isOllamaRunning ? 'connected' : 'disconnected',
            services: ['Portfolio', 'AI', 'Weather', 'News', 'Crypto', 'Currency', 'GitHub'],
            message: "Abyss AI Chatbot Engine Active 🤖"
        }));
        return;
    }

    // Chat API Endpoint
    if (req.url === '/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const userMessage = data.message || '';
                const history = Array.isArray(data.history) ? data.history : [];

                if (!userMessage.trim()) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No message provided' }));
                    return;
                }

                // Route query through intelligent intent router
                const botResponse = await handleChatRequest(userMessage, history);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response: botResponse }));

            } catch (error) {
                console.error('Chat endpoint error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: 'Server error',
                    response: "Oops! I encountered an error while processing your request. Please try again! 🤖"
                }));
            }
        });
        return;
    }

    // 404 Route
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log('----------------------------------------------------');
    console.log(`🤖 Starting Abyss AI Chatbot Server on port ${PORT}...`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/chat`);
    console.log(`🛠️ Service Modules: Portfolio, AI, Weather, News, Crypto, Currency, GitHub`);
    console.log('----------------------------------------------------');
});

module.exports = { server };
