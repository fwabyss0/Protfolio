const https = require('https');

function isWeatherQuery(message) {
    const msg = message.toLowerCase();
    const keywords = ['weather', 'temperature', 'forecast', 'climate', 'how hot', 'how cold', 'is it raining', 'rain in', 'temp in'];
    return keywords.some(kw => msg.includes(kw));
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 6000 }, (res) => {
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
    return 'Bhaktapur';
}

const WEATHER_EMOJIS = {
    'clear': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'drizzle': '🌦️',
    'thunderstorm': '🌩️',
    'snow': '❄️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️'
};

async function getWeatherFromOpenWeatherMap(city, apiKey) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    const data = await fetchJson(url);

    if (!data || data.cod != 200) return null;

    const placeName = `${data.name}, ${data.sys?.country || ''}`;
    const mainCondition = data.weather?.[0]?.main || 'Clear';
    const description = data.weather?.[0]?.description || mainCondition;
    const emoji = WEATHER_EMOJIS[mainCondition.toLowerCase()] || '🌤️';

    const tempC = data.main.temp.toFixed(1);
    const tempF = ((data.main.temp * 9/5) + 32).toFixed(1);
    const feelsC = data.main.feels_like.toFixed(1);
    const humidity = data.main.humidity;
    const windKmH = (data.wind.speed * 3.6).toFixed(1);

    return `### ${emoji} Weather for **${placeName}**\n` +
           `- **Condition:** ${description.charAt(0).toUpperCase() + description.slice(1)} ${emoji}\n` +
           `- **Temperature:** ${tempC}°C (${tempF}°F) | Feels like: ${feelsC}°C\n` +
           `- **Humidity:** ${humidity}%\n` +
           `- **Wind Speed:** ${windKmH} km/h\n` +
           `*Data provided in real-time by OpenWeatherMap.*`;
}

async function getWeatherFromOpenMeteo(city) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoData = await fetchJson(geoUrl);

    if (!geoData.results || geoData.results.length === 0) return null;

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const placeName = `${location.name}${location.country ? ', ' + location.country : ''}`;

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const weatherData = await fetchJson(weatherUrl);

    if (!weatherData.current_weather) return null;

    const curr = weatherData.current_weather;
    const tempC = curr.temperature;
    const tempF = ((tempC * 9/5) + 32).toFixed(1);

    return `### 🌤️ Weather for **${placeName}**\n` +
           `- **Temperature:** ${tempC}°C (${tempF}°F)\n` +
           `- **Wind Speed:** ${curr.windspeed} km/h\n` +
           `*Data provided in real-time by Open-Meteo.*`;
}

async function getWeatherData(message) {
    const city = extractLocation(message);
    const apiKey = process.env.WEATHER_API_KEY;

    // 1. Try OpenWeatherMap API
    if (apiKey) {
        try {
            const owmResult = await getWeatherFromOpenWeatherMap(city, apiKey);
            if (owmResult) return owmResult;
        } catch (e) {
            console.error('OpenWeatherMap API error:', e.message);
        }
    }

    // 2. Fallback to Open-Meteo API
    try {
        const omResult = await getWeatherFromOpenMeteo(city);
        if (omResult) return omResult;
    } catch (e) {
        console.error('Open-Meteo API error:', e.message);
    }

    return `Live weather information for "${city}" is currently unavailable right now. Please try again later.`;
}

module.exports = {
    isWeatherQuery,
    getWeatherData
};
