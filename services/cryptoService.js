const https = require('https');

function isCryptoQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'dogecoin', 'doge', 'binance', 'crypto price', 'coin price'];
    return keywords.some(kw => msg.includes(kw));
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 }, (res) => {
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

let cryptoCache = { data: null, timestamp: 0 };
const CACHE_TTL = 2 * 60 * 1000; // 2 mins cache

async function getCryptoData(message) {
    if (cryptoCache.data && (Date.now() - cryptoCache.timestamp < CACHE_TTL)) {
        return cryptoCache.data;
    }

    // Try Binance API first
    try {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT', 'ADAUSDT'];
        const url = `https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
        const data = await fetchJson(url);

        if (Array.isArray(data) && data.length > 0) {
            let result = "### 🪙 Live Cryptocurrency Prices (USD)\n\n";
            result += `| Coin | Symbol | Price (USD) |\n`;
            result += `| :--- | :--- | :--- |\n`;

            const nameMap = {
                'BTCUSDT': { name: 'Bitcoin', code: 'BTC' },
                'ETHUSDT': { name: 'Ethereum', code: 'ETH' },
                'SOLUSDT': { name: 'Solana', code: 'SOL' },
                'DOGEUSDT': { name: 'Dogecoin', code: 'DOGE' },
                'ADAUSDT': { name: 'Cardano', code: 'ADA' }
            };

            data.forEach(item => {
                const meta = nameMap[item.symbol];
                if (meta) {
                    const priceNum = parseFloat(item.price);
                    const formatted = priceNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
                    result += `| **${meta.name}** | \`${meta.code}\` | **$${formatted}** |\n`;
                }
            });

            result += "\n*Data provided in real-time by Binance API.*";
            cryptoCache = { data: result, timestamp: Date.now() };
            return result;
        }
    } catch (binanceErr) {
        console.error('Binance API error:', binanceErr.message);
    }

    // Fallback to CoinGecko
    try {
        const data = await fetchJson('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=usd');
        if (data && data.bitcoin) {
            let result = "### 🪙 Live Cryptocurrency Prices (USD)\n\n";
            result += `- **Bitcoin (BTC):** $${data.bitcoin.usd.toLocaleString()}\n`;
            result += `- **Ethereum (ETH):** $${data.ethereum.usd.toLocaleString()}\n`;
            result += `- **Solana (SOL):** $${data.solana ? data.solana.usd.toLocaleString() : 'N/A'}\n`;
            result += `- **Dogecoin (DOGE):** $${data.dogecoin ? data.dogecoin.usd : 'N/A'}\n`;
            return result;
        }
    } catch (geckoErr) {
        console.error('CoinGecko API error:', geckoErr.message);
    }

    return "Live cryptocurrency prices are currently unavailable right now. Please try again later.";
}

module.exports = {
    isCryptoQuery,
    getCryptoData
};
