const { isPortfolioQuery, getPortfolioDirectResponse } = require('./portfolioService');
const { isWeatherQuery, getWeatherData } = require('./weatherService');
const { isNewsQuery, getNewsData } = require('./newsService');
const { isCryptoQuery, getCryptoData } = require('./cryptoService');
const { isCurrencyQuery, getCurrencyData } = require('./currencyService');
const { isGithubQuery, getGithubData } = require('./githubService');
const { isMathQuery, getMathResponse } = require('./mathService');
const { generateAIResponse } = require('./aiService');

function getCurrentTimeDateResponse(message) {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const dayStr = days[now.getDay()];
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const msg = message.toLowerCase();
    const isTimeOnly = (msg.includes('time') || msg.includes('clock')) && !msg.includes('date') && !msg.includes('day');
    const isDateOnly = (msg.includes('date') || msg.includes('today')) && !msg.includes('time');

    if (isTimeOnly) {
        return `🕒 Current Time: **${timeStr}** (${timezone})`;
    }
    if (isDateOnly) {
        return `📅 Today's Date: **${dayStr}, ${dateStr}**`;
    }
    return `🕒 **${timeStr}** on 📅 **${dayStr}, ${dateStr}** (${timezone})`;
}

function isTimeQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['what time', 'current time', 'what date', 'current date', 'what day is it', 'today\'s date', 'clock', 'what day is today'];
    return keywords.some(kw => msg.includes(kw));
}

async function handleChatRequest(message, history = []) {
    if (!message || typeof message !== 'string') {
        return "Please provide a valid question!";
    }

    // 1. Time / Date Query Routing
    if (isTimeQuery(message)) {
        return getCurrentTimeDateResponse(message);
    }

    // 2. Direct Link / Quick Portfolio Matches (Handled by AI primarily, fallback locally in aiService)
    // const directPortfolioRes = getPortfolioDirectResponse(message);
    // if (directPortfolioRes) {
    //     return directPortfolioRes;
    // }

    // 3. Basic Math Calculation Routing
    if (isMathQuery(message)) {
        const mathRes = getMathResponse(message);
        if (mathRes) {
            return mathRes;
        }
    }

    // 4. Weather Routing (Using OpenWeatherMap + Open-Meteo)
    if (isWeatherQuery(message)) {
        const liveWeather = await getWeatherData(message);
        return generateAIResponse(message, history, liveWeather);
    }

    // 5. Tech News Routing
    if (isNewsQuery(message)) {
        const liveNews = await getNewsData();
        return generateAIResponse(message, history, liveNews);
    }

    // 6. Crypto Routing
    if (isCryptoQuery(message)) {
        const liveCrypto = await getCryptoData(message);
        return generateAIResponse(message, history, liveCrypto);
    }

    // 7. Currency Exchange Routing
    if (isCurrencyQuery(message)) {
        const liveCurrency = await getCurrencyData();
        return generateAIResponse(message, history, liveCurrency);
    }

    // 8. GitHub Stats Routing
    if (isGithubQuery(message)) {
        const liveGithub = await getGithubData();
        return generateAIResponse(message, history, liveGithub);
    }

    // 9. General AI / Portfolio / Complex Math / OpenRouter Response
    return generateAIResponse(message, history);
}

module.exports = {
    handleChatRequest
};
