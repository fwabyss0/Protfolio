import { MarvelService, WeatherService, CalculatorService, TimeService, PortfolioService } from './services.js';

const INTENT_RULES = [
    {
        intent: 'marvel',
        keywords: ['marvel', 'mcu', 'avengers', 'spider-man', 'iron man', 'thor', 'captain america', 'black panther', 'doctor strange', 'guardians', 'x-men', 'fantastic four', 'infinity stones', 'thanos', 'loki', 'wolverine', 'deadpool', 'multiverse', 'superhero', 'comic', 'comics'],
        patterns: [/who is .+/, /tell me about .+/, /show .+ comics/, /explain .+/],
    },
    {
        intent: 'weather',
        keywords: ['weather', 'temperature', 'forecast', 'climate', 'how hot', 'how cold', 'is it raining', 'rain', 'sunny', 'cloudy', 'wind', 'humidity', 'will it rain', 'weather today', 'weather tomorrow'],
        patterns: [/weather\s+(?:in|at|for)?\s*[a-zA-Z\s]+/],
    },
    {
        intent: 'calculator',
        keywords: ['calculate', 'solve', 'math', 'compute', 'sqrt', 'square root', 'percent', '%', 'bmi', 'age', 'convert'],
        patterns: [/\d+\s*[\+\-\*\/\^]\s*\d+/, /^\d+\s*$/],
    },
    {
        intent: 'time',
        keywords: ['time', 'clock', 'date', 'today', 'day', 'what time', 'current time', 'timezone'],
        patterns: [/what time/i, /current time/i, /today's date/i],
    },
    {
        intent: 'portfolio',
        keywords: ['who are you', 'about alish', 'about you', 'portfolio', 'cv', 'resume', 'contact', 'skills', 'projects', 'experience', 'education', 'github', 'linkedin', 'discord', 'location', 'age', 'old'],
        patterns: [/tell me about .+/, /show .+/, /what .+ know/],
    },
];

export function detectIntent(message) {
    const msg = message.toLowerCase().trim();
    
    for (const rule of INTENT_RULES) {
        if (rule.keywords.some(k => msg.includes(k))) {
            return rule.intent;
        }
        if (rule.patterns.some(p => p.test(msg))) {
            return rule.intent;
        }
    }
    
    return 'general';
}

export async function executeTool(intent, message) {
    switch (intent) {
        case 'weather': {
            const cityMatch = message.match(/(?:weather|temperature|forecast|climate|how hot|how cold|is it raining|temp in|rain in)\s+(?:in|at|for)?\s*([a-zA-Z\s,]+?)(?:\?|$|\s*please)/i);
            const city = cityMatch ? cityMatch[1].trim() : 'Bhaktapur';
            if (message.includes('forecast') || message.includes('weekly') || message.includes('week')) {
                const result = await WeatherService.getForecast(city);
                if (result) return { tool: 'weather', result };
                return { tool: 'weather', result: null, error: 'Weather forecast unavailable' };
            }
            const result = await WeatherService.getCurrent(city);
            if (result) return { tool: 'weather', result };
            return { tool: 'weather', result: null, error: 'Weather service unavailable' };
        }
        case 'marvel': {
            const query = message.replace(/[?!!]/g, '').trim() || 'Spider-Man';
            const result = await MarvelService.search(query);
            if (result) return { tool: 'marvel', result };
            return { tool: 'marvel', result: null, error: 'Marvel service unavailable' };
        }
        case 'calculator': {
            const result = CalculatorService.calculate(message);
            if (result) return { tool: 'calculator', result };
            return { tool: 'calculator', result: null, error: 'Could not parse calculation' };
        }
        case 'time': {
            const result = TimeService.get(message);
            return { tool: 'time', result };
        }
        case 'portfolio': {
            const result = PortfolioService.answer(message);
            if (result) return { tool: 'portfolio', result };
            return { tool: 'portfolio', result: null, error: null };
        }
        default:
            return null;
    }
}
