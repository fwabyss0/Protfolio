const https = require('https');

function isWeatherQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['weather', 'temperature', 'forecast', 'climate', 'how hot', 'how cold', 'is it raining', 'rain in', 'temp in'];
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

function extractLocation(message) {
    const msg = message.trim();
    const match = msg.match(/(?:weather|temperature|forecast|temp|climate)\s+(?:in|at|for|of)?\s*([a-zA-Z\s,]+)/i) ||
                  msg.match(/([a-zA-Z\s,]+)\s+(?:weather|temperature|forecast|climate)/i);
    
    if (match && match[1]) {
        const cleaned = match[1].replace(/\b(today|now|tomorrow|current|the|in|at|for|please|tell me|what is|whats|how is|is it)\b/gi, '').trim();
        if (cleaned.length > 1) return cleaned;
    }
    return 'Bhaktapur'; // Default location
}

const WEATHER_CODES = {
    0: 'Clear sky ☀️',
    1: 'Mainly clear 🌤️',
    2: 'Partly cloudy ⛅',
    3: 'Overcast ☁️',
    45: 'Foggy 🌫️',
    48: 'Depositing rime fog 🌫️',
    51: 'Light drizzle 🌧️',
    53: 'Moderate drizzle 🌧️',
    55: 'Dense drizzle 🌧️',
    61: 'Slight rain 🌧️',
    63: 'Moderate rain 🌧️',
    65: 'Heavy rain 🌧️',
    71: 'Slight snow ❄️',
    73: 'Moderate snow ❄️',
    75: 'Heavy snow ❄️',
    80: 'Rain showers 🌦️',
    81: 'Moderate rain showers 🌦️',
    82: 'Violent rain showers ⛈️',
    95: 'Thunderstorm 🌩️'
};

async function getWeatherData(message) {
    try {
        const city = extractLocation(message);
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        const geoData = await fetchJson(geoUrl);

        if (!geoData.results || geoData.results.length === 0) {
            return `I couldn't locate "${city}" for weather information. Try asking "Weather in Kathmandu" or "Weather in Tokyo".`;
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const placeName = `${location.name}${location.country ? ', ' + location.country : ''}`;

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const weatherData = await fetchJson(weatherUrl);

        if (!weatherData.current_weather) {
            return "Live weather data is currently unavailable right now.";
        }

        const curr = weatherData.current_weather;
        const tempC = curr.temperature;
        const tempF = ((tempC * 9/5) + 32).toFixed(1);
        const condition = WEATHER_CODES[curr.weathercode] || 'Clear';
        const wind = curr.windspeed;

        return `### 🌤️ Weather for **${placeName}**\n` +
               `- **Condition:** ${condition}\n` +
               `- **Temperature:** ${tempC}°C (${tempF}°F)\n` +
               `- **Wind Speed:** ${wind} km/h\n` +
               `*Data provided in real-time by Open-Meteo.*`;
    } catch (error) {
        console.error('Weather API error:', error.message);
        return "Live weather information is currently unavailable right now. Please try again later.";
    }
}

module.exports = {
    isWeatherQuery,
    getWeatherData
};
