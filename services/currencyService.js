const https = require('https');

function isCurrencyQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['currency', 'exchange rate', 'forex', 'dollar rate', 'usd to', 'rate of usd', 'npr rate', 'conversion rate'];
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

let currencyCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 mins cache

async function getCurrencyData() {
    if (currencyCache.data && (Date.now() - currencyCache.timestamp < CACHE_TTL)) {
        return currencyCache.data;
    }

    try {
        const data = await fetchJson('https://open.er-api.com/v6/latest/USD');

        if (!data || !data.rates) {
            return "Live currency exchange rates are currently unavailable right now.";
        }

        const rates = data.rates;
        let result = "### 💱 Live Exchange Rates (Base: 1 USD)\n\n";
        result += `| Currency | Code | Rate |\n`;
        result += `| :--- | :--- | :--- |\n`;

        const currencies = [
            { name: 'Nepalese Rupee 🇳🇵', code: 'NPR' },
            { name: 'Indian Rupee 🇮🇳', code: 'INR' },
            { name: 'Euro 🇪🇺', code: 'EUR' },
            { name: 'British Pound 🇬🇧', code: 'GBP' },
            { name: 'Japanese Yen 🇯🇵', code: 'JPY' },
            { name: 'Australian Dollar 🇦🇺', code: 'AUD' },
            { name: 'Canadian Dollar 🇨🇦', code: 'CAD' }
        ];

        currencies.forEach(c => {
            if (rates[c.code]) {
                const val = rates[c.code].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                result += `| **${c.name}** | \`${c.code}\` | ${val} |\n`;
            }
        });

        result += "\n*Data updated live from ExchangeRate API.*";

        currencyCache = { data: result, timestamp: Date.now() };
        return result;
    } catch (error) {
        console.error('Currency API error:', error.message);
        return "Live currency exchange rates are currently unavailable right now. Please try again later.";
    }
}

module.exports = {
    isCurrencyQuery,
    getCurrencyData
};
