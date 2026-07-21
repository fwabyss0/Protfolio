const https = require('https');

function isGithubQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['github stats', 'github profile', 'github repos', 'github repositories', 'fwabyss0', 'alish github', 'github followers'];
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

let githubCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 mins cache

async function getGithubData() {
    if (githubCache.data && (Date.now() - githubCache.timestamp < CACHE_TTL)) {
        return githubCache.data;
    }

    try {
        const user = await fetchJson('https://api.github.com/users/fwabyss0');
        const repos = await fetchJson('https://api.github.com/users/fwabyss0/repos?sort=updated&per_page=5');

        if (!user || !user.login) {
            return "Live GitHub statistics are currently unavailable right now.";
        }

        let result = `### 🐙 Alish Shrestha's Live GitHub Stats (@${user.login})\n\n`;
        result += `- **Public Repositories:** ${user.public_repos}\n`;
        result += `- **Followers:** ${user.followers}\n`;
        result += `- **Following:** ${user.following}\n`;
        result += `- **Profile Link:** [github.com/fwabyss0](${user.html_url})\n\n`;

        if (Array.isArray(repos) && repos.length > 0) {
            result += `**Recent Active Repositories:**\n`;
            repos.forEach(repo => {
                const desc = repo.description ? ` - ${repo.description}` : '';
                result += `- [**${repo.name}**](${repo.html_url}) ⭐ ${repo.stargazers_count}${desc}\n`;
            });
        }

        githubCache = { data: result, timestamp: Date.now() };
        return result;
    } catch (error) {
        console.error('GitHub API error:', error.message);
        return "Live GitHub profile statistics are currently unavailable right now. Please try again later.";
    }
}

module.exports = {
    isGithubQuery,
    getGithubData
};
