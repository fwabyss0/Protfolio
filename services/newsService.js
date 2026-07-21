const https = require('https');

function isNewsQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['news', 'tech news', 'latest tech', 'technology news', 'headlines', "what's new in tech", 'ai news', 'coding news'];
    return keywords.some(kw => msg.includes(kw));
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'PortfolioChatbot/1.0' }, timeout: 5000 }, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`HTTP status ${res.statusCode}`));
            }
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });
    });
}

let newsCache = { data: null, timestamp: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 mins cache

async function getNewsData() {
    if (newsCache.data && (Date.now() - newsCache.timestamp < CACHE_TTL)) {
        return newsCache.data;
    }

    try {
        // Dev.to API for tech articles
        const articles = await fetchJson('https://dev.to/api/articles?tag=tech&per_page=5');

        if (!Array.isArray(articles) || articles.length === 0) {
            return "Live tech news is currently unavailable right now.";
        }

        let result = "### 📰 Latest Tech News & Articles\n\n";
        articles.forEach((art, idx) => {
            const title = art.title.replace(/[\[\]]/g, '');
            const url = art.url;
            const reactions = art.public_reactions_count || 0;
            result += `${idx + 1}. **[${title}](${url})** (${reactions} 👍)\n`;
        });
        result += "\n*Source: Live Dev.to Tech Feed*";

        newsCache = { data: result, timestamp: Date.now() };
        return result;
    } catch (error) {
        console.error('News API error:', error.message);
        return "Live tech news is currently unavailable right now. Please check back shortly.";
    }
}

module.exports = {
    isNewsQuery,
    getNewsData
};
