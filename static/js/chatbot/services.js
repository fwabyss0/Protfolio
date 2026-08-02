import { CONFIG } from './config.js';

const MarvelService = {
    FALLBACK: {
        "spider-man": "Spider-Man (Peter Parker): Teenage superhero with spider powers. Iconic Avengers member known for agility, web-slinging, and spider-sense.",
        "iron man": "Iron Man (Tony Stark): Genius billionaire inventor who built a powered suit of armor. Founding member of the Avengers.",
        "thor": "Thor Odinson: The Asgardian God of Thunder. Wields Mjolnir and is a founding member of the Avengers.",
        "captain america": "Captain America (Steve Rogers): WWII super-soldier enhanced to peak human potential. Wields a vibranium shield and is the moral center of the Avengers.",
        "black panther": "Black Panther (T'Challa): King of Wakanda and protector of his nation. Enhanced by the Heart-Shaped Herb and a vibranium suit.",
        "doctor strange": "Doctor Strange (Stephen Strange): Former neurosurgeon turned Sorcerer Supreme. Guards the mystic arts and protects Earth from magical threats.",
        "loki": "Loki: The God of Mischief from Asgard. Thor's adoptive brother, known for cunning, magic, shape-shifting, and the TVA saga.",
        "hulk": "Hulk (Bruce Banner): Gamma-radiation scientist who transforms into a giant green powerhouse with immense strength.",
        "black widow": "Black Widow (Natasha Romanoff): Former Russian spy turned elite Avenger. Expert in espionage and martial arts.",
        "thanos": "Thanos: Powerful Titan warlord obsessed with balance. Seeks the Infinity Stones to wipe out half the universe. Marvel's greatest villain.",
        "wolverine": "Wolverine (Logan): Mutant with enhanced senses, healing factor, and adamantium claws. Legendary X-Men member.",
        "deadpool": "Deadpool (Wade Wilson): Mercenary with twisted humor, fourth-wall-breaking, and regenerative healing factor. The 'Merc with a Mouth'.",
        "guardians": "Guardians of the Galaxy: Cosmic team including Star-Lord, Gamora, Drax, Rocket Raccoon, and Groot. Protect the galaxy from interstellar threats.",
        "x-men": "X-Men: Mutant heroes led by Professor X, including Cyclops, Storm, and Wolverine. Fight for peaceful coexistence between mutants and humans.",
        "fantastic four": "Fantastic Four: Mr. Fantastic, Invisible Woman, Human Torch, and The Thing. Cosmic explorers who gained powers from cosmic radiation.",
        "avengers": "The Avengers: Earth's mightiest heroes founded by Iron Man, Captain America, Thor, Hulk, Black Widow, and Hawkeye. United against threats no single hero can face.",
        "scarlet witch": "Scarlet Witch (Wanda Maximoff): Powerful Avenger with reality-warping and chaos magic abilities. One of the strongest beings in the Marvel Universe.",
        "vision": "Vision: Synthezoid Avenger created by Ultron and powered by the Mind Stone. Has superhuman strength and density control.",
        "ant-man": "Ant-Man (Scott Lang): Former thief turned hero who uses Pym Particles to shrink and grow. Can communicate with ants.",
        "wasp": "Wasp (Hope van Dyne): Hero who uses Pym Particles to shrink, grow, and fly with insect wings. Daughter of Hank Pym.",
        "hawkeye": "Hawkeye (Clint Barton): Master archer and marksman with no superpowers but exceptional skill and precision. Loyal Avenger.",
        "falcon": "Falcon (Sam Wilson): Veteran Air Force paratrooper with advanced winged flight gear. Close ally of Captain America.",
        "winter soldier": "Winter Soldier (Bucky Barnes): Captain America's childhood friend turned brainwashed assassin. Later redeemed as a hero.",
        "nick fury": "Nick Fury: Director of S.H.I.E.L.D. and master strategist. Assembled the Avengers and operates from the shadows.",
        "gamora": "Gamora: Deadliest assassin in the galaxy and adopted daughter of Thanos. Member of the Guardians of the Galaxy.",
        "rocket": "Rocket Raccoon: Genetically modified bounty hunter and weapons expert. Founding Guardian with sharp wit.",
        "groot": "Groot: Tree-like humanoid from planet Xandar. Loyal Guardian who communicates by saying 'I am Groot'.",
    },

    md5(string) {
        function rotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }
        function addUnsigned(lX, lY) {
            const lX8 = lX & 0x80000000;
            const lY8 = lY & 0x80000000;
            const lX4 = lX & 0x40000000;
            const lY4 = lY & 0x40000000;
            const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
            if (lX4 | lY4) {
                if (lResult & 0x40000000) return lResult ^ 0xC0000000 ^ lX8 ^ lY8;
                return lResult ^ 0x40000000 ^ lX8 ^ lY8;
            }
            return lResult ^ lX8 ^ lY8;
        }
        function f(x, y, z) { return (x & y) | ((~x) & z); }
        function g(x, y, z) { return (x & z) | (y & (~z)); }
        function h(x, y, z) { return x ^ y ^ z; }
        function i(x, y, z) { return y ^ (x | (~z)); }
        function ff(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        function gg(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        function hh(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        function ii(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
            return addUnsigned(rotateLeft(a, s), b);
        }
        function convertToWordArray(string) {
            let lWordCount;
            const lMessageLength = string.length;
            const lNumberOfWordsTemp1 = lMessageLength + 8;
            const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
            const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
            const lWordArray = new Array(lNumberOfWords - 1);
            let lBytePosition = 0;
            let lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength * 8;
            lWordArray[lNumberOfWords - 1] = 0;
            return lWordArray;
        }
        function wordToHex(lValue) {
            let wordToHexValue = '', wordToHexValueTemp = '', lByte;
            for (let lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                wordToHexValueTemp = '0' + lByte.toString(16);
                wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
            }
            return wordToHexValue;
        }
        const x = convertToWordArray(string);
        let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
        const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        for (let k = 0; k < x.length; k += 16) {
            let AA = a, BB = b, CC = c, DD = d;
            a = ff(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = ff(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = ff(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = ff(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = ff(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = ff(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = ff(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = ff(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = ff(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = ff(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = ff(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = ff(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = ff(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = ff(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = ff(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = ff(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = gg(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = gg(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = gg(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = ff(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = gg(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = gg(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = gg(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = gg(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = gg(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = gg(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = gg(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = gg(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = gg(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = gg(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = gg(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = hh(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = hh(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = hh(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = hh(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = hh(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = hh(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = hh(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = hh(b, c, d, a, x[k + 8], S34, 0xBEBFBC70);
            a = hh(a, b, c, d, x[k + 11], S31, 0x289B7EC6);
            d = hh(d, a, b, c, x[k + 14], S32, 0xEAA127FA);
            c = hh(c, d, a, b, x[k + 1], S33, 0xD4EF3085);
            b = hh(b, c, d, a, x[k + 12], S34, 0x4881D05);
            a = hh(a, b, c, d, x[k + 7], S31, 0xD9D4D039);
            d = hh(d, a, b, c, x[k + 10], S32, 0xE6DB99E5);
            c = hh(c, d, a, b, x[k + 13], S33, 0x1FA27CF8);
            b = hh(b, c, d, a, x[k + 0], S34, 0xC4AC5665);
            a = ii(a, b, c, d, x[k + 2], S41, 0xF7537E82);
            d = ii(d, a, b, c, x[k + 7], S42, 0xBD3AF235);
            c = ii(c, d, a, b, x[k + 12], S43, 0x2AD7D2BB);
            b = ii(b, c, d, a, x[k + 15], S44, 0xEB86D391);
            a = ii(a, b, c, d, x[k + 10], S41, 0x5787CDD);
            d = ii(d, a, b, c, x[k + 3], S42, 0x2D019DDF);
            c = ii(c, d, a, b, x[k + 8], S43, 0x3EA2E9A0);
            b = ii(b, c, d, a, x[k + 13], S44, 0x4C3A8F8);
            a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
        }
        let tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
        return tempValue.toLowerCase();
    },

    async search(query) {
        if (!CONFIG.MARVEL_PUBLIC_KEY || !CONFIG.MARVEL_PRIVATE_KEY) {
            return this.fallback(query);
        }
        try {
            const ts = Date.now().toString();
            const hash = this.md5(ts + CONFIG.MARVEL_PRIVATE_KEY + CONFIG.MARVEL_PUBLIC_KEY);
            const url = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${encodeURIComponent(query)}&limit=1&ts=${ts}&apikey=${CONFIG.MARVEL_PUBLIC_KEY}&hash=${hash}`;
            
            const resp = await fetch(url);
            if (!resp.ok) {
                console.warn('Marvel API error:', resp.status);
                return this.fallback(query);
            }
            const data = await resp.json();
            if (data.code !== 200) {
                console.warn('Marvel API error:', data.status);
                return this.fallback(query);
            }
            const chars = data.data?.results || [];
            if (!chars.length) return this.fallback(query);

            const c = chars[0];
            const name = c.name || 'Unknown';
            const desc = (c.description || 'No description available.').trim();
            const shortDesc = desc.length > 200 ? desc.substring(0, 197) + '...' : desc;
            const comics = c.comics?.available || 0;
            const thumbnail = c.thumbnail?.path ? `${c.thumbnail.path}.${c.thumbnail.extension}` : null;
            
            let result = `${name}: ${shortDesc} (Comics: ${comics})`;
            if (thumbnail) result += `\nImage: ${thumbnail}`;
            return result;
        } catch (e) {
            console.error('Marvel error:', e);
            return this.fallback(query);
        }
    },

    fallback(query) {
        const q = query.toLowerCase().trim();
        for (const [key, value] of Object.entries(this.FALLBACK)) {
            if (q.includes(key)) {
                return `🦸 **${value}**`;
            }
        }
        return null;
    }
};

const WeatherService = {
    async getCurrent(city = 'Bhaktapur') {
        if (!CONFIG.WEATHER_API_KEY) return null;
        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${CONFIG.WEATHER_API_KEY}`;
            const geoResp = await fetch(geoUrl);
            const geoData = await geoResp.json();
            if (!geoData.length) return null;

            const { lat, lon, name, country } = geoData[0];
            const weatherUrl = `${CONFIG.WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
            const weatherResp = await fetch(weatherUrl);
            const weatherData = await weatherResp.json();

            const temp = weatherData.main.temp;
            const feels = weatherData.main.feels_like;
            const desc = weatherData.weather[0].description;
            const humidity = weatherData.main.humidity;
            const wind = weatherData.wind.speed;
            const pressure = weatherData.main.pressure;
            const visibility = weatherData.visibility || 'N/A';
            const sunrise = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return `${name}, ${country}:
🌡️ Temp: ${temp}°C (Feels like ${feels}°C)
☁️ ${desc.charAt(0).toUpperCase() + desc.slice(1)}
💧 Humidity: ${humidity}%
🌬️ Wind: ${wind} m/s
👁️ Visibility: ${visibility}m
📊 Pressure: ${pressure} hPa
☀️ Sunrise: ${sunrise} | Sunset: ${sunset}`;
        } catch (e) {
            console.error('Weather error:', e);
            return null;
        }
    },

    async getForecast(city = 'Bhaktapur') {
        if (!CONFIG.WEATHER_API_KEY) return null;
        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${CONFIG.WEATHER_API_KEY}`;
            const geoResp = await fetch(geoUrl);
            const geoData = await geoResp.json();
            if (!geoData.length) return null;

            const { lat, lon, name, country } = geoData[0];
            const forecastUrl = `${CONFIG.WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`;
            const forecastResp = await fetch(forecastUrl);
            const forecastData = await forecastResp.json();

            const days = {};
            for (const item of forecastData.list) {
                const date = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                if (!days[date]) days[date] = [];
                days[date].push(item);
            }

            let result = `${name}, ${country} - 5 Day Forecast:\n`;
            for (const [date, items] of Object.entries(days).slice(0, 5)) {
                const temps = items.map(i => i.main.temp);
                const min = Math.min(...temps).toFixed(1);
                const max = Math.max(...temps).toFixed(1);
                const desc = items[Math.floor(items.length / 2)].weather[0].description;
                result += `\n📅 ${date}: ${min}°C - ${max}°C, ${desc}`;
            }
            return result;
        } catch (e) {
            console.error('Forecast error:', e);
            return null;
        }
    }
};

const CalculatorService = {
    safeEval(expr) {
        try {
            if (typeof math !== 'undefined' && math.evaluate) {
                const result = math.evaluate(expr);
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    return result;
                }
                return null;
            }
            
            const sanitized = expr.replace(/[^0-9+\-*/().^%sqrtpi e]/g, '').trim();
            if (!sanitized) return null;
            
            const jsExpr = sanitized
                .replace(/\^/g, '**')
                .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
                .replace(/pi/g, 'Math.PI')
                .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E');
            
            const result = Function('"use strict"; return (' + jsExpr + ')')();
            if (typeof result !== 'number' || !isFinite(result)) return null;
            return result;
        } catch (e) {
            return null;
        }
    },

    calculate(expression) {
        const msg = expression.toLowerCase().trim();
        
        const ageMatch = msg.match(/(?:my age|calculate age|age)\s*(?:is|:)?\s*(\d{4})\s*[-/]?\s*(\d{1,2})\s*[-/]?\s*(\d{1,2})?/);
        if (ageMatch) {
            const birthYear = parseInt(ageMatch[1]);
            const birthMonth = parseInt(ageMatch[2]);
            const birthDay = ageMatch[3] ? parseInt(ageMatch[3]) : 1;
            const today = new Date();
            let age = today.getFullYear() - birthYear;
            if ((today.getMonth(), today.getDate()) < (birthMonth - 1, birthDay)) age--;
            return `🎂 Age: ${age} years old`;
        }

        const bmiMatch = msg.match(/(?:bmi|body mass index)\s*(?:is|:)?\s*(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms)?\s*[-/x×]\s*(\d+(?:\.\d+)?)\s*(?:cm|m|meters|centimeters)?/);
        if (bmiMatch) {
            const weight = parseFloat(bmiMatch[1]);
            const height = parseFloat(bmiMatch[2]);
            const heightM = height > 3 ? height / 100 : height;
            const bmi = weight / (heightM ** 2);
            const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
            return `💪 BMI: ${bmi.toFixed(1)} (${category})`;
        }

        const unitMatch = msg.match(/convert\s+(\d+(?:\.\d+)?)\s*(km|kilometers?|miles?|kg|kilograms?|lbs?|pounds?|c|f|celsius|fahrenheit)\s+(?:to|in|into)\s+(km|kilometers?|miles?|kg|kilograms?|lbs?|pounds?|c|f|celsius|fahrenheit)/);
        if (unitMatch) {
            const value = parseFloat(unitMatch[1]);
            const from = unitMatch[2].toLowerCase();
            const to = unitMatch[3].toLowerCase();
            let result;
            if (from === 'km' && to === 'miles') result = value * 0.621371;
            else if (from === 'miles' && to === 'km') result = value * 1.60934;
            else if (from === 'kg' && to === 'lbs') result = value * 2.20462;
            else if (from === 'lbs' && to === 'kg') result = value * 0.453592;
            else if (['c', 'celsius'].includes(from) && ['f', 'fahrenheit'].includes(to)) result = (value * 9/5) + 32;
            else if (['f', 'fahrenheit'].includes(from) && ['c', 'celsius'].includes(to)) result = (value - 32) * 5/9;
            else return null;
            return `🔄 ${value} ${from} = ${result.toFixed(2)} ${to}`;
        }

        const cleaned = msg.replace(/^(calculate|solve|what is|how much is|compute|find|eval|=|\?)/g, '').trim();
        const result = this.safeEval(cleaned);
        if (result !== null) {
            return `🧮 ${cleaned} = ${result}`;
        }
        return null;
    }
};

const TimeService = {
    get(query) {
        const now = new Date();
        const tz = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'Local';
        const msg = query.toLowerCase();
        
        if (msg.includes('time') && !msg.includes('date') && !msg.includes('day')) {
            return `🕒 ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} (${tz})`;
        }
        if ((msg.includes('date') || msg.includes('today')) && !msg.includes('time')) {
            return `📅 ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        }
        return `🕒 ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} | 📅 ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} (${tz})`;
    }
};

const PortfolioService = {
    KNOWLEDGE: {
        name: 'Alish Shrestha',
        age: '19 years old',
        location: 'Changu Narayan-01, Bhaktapur, Nepal',
        education: 'Softwarica College of IT & E-Commerce, affiliated with Coventry University, UK',
        studies: 'Computer Science & AI, focusing on machine learning and neural networks',
        secondary: 'Khwopa Secondary School in Dekocha-06, Bhaktapur (2023-2025)',
        primary: 'North East English Secondary School in Bhaktapur',
        skills: ['Python', 'JavaScript', 'HTML/CSS', 'TensorFlow', 'AI/ML', 'UI/UX', 'photography', 'video editing'],
        tools: ['VS Code', 'GitHub', 'Git', 'Terminal'],
        projects: ['Yatra (travel website)', 'Printing Resolution (printing services site)'],
        contact: 'shresthaalish444@gmail.com',
        linkedin: 'https://www.linkedin.com/in/alish-shrestha-4276b8379/',
        github: 'https://github.com/fwabyss0',
        discord: 'fwabyss',
    },

    answer(query) {
        const q = query.toLowerCase();
        
        if (q.includes('age') || q.includes('old') || q.includes('years')) {
            return `Alish is ${this.KNOWLEDGE.age}.`;
        }
        if (q.includes('where') || q.includes('location') || q.includes('from') || q.includes('live')) {
            return `Alish is from ${this.KNOWLEDGE.location}.`;
        }
        if (q.includes('college') || q.includes('university') || q.includes('education') || q.includes('study')) {
            return `Alish is studying at ${this.KNOWLEDGE.education}. He is pursuing ${this.KNOWLEDGE.studies}.`;
        }
        if (q.includes('secondary') || q.includes('high school')) {
            return `Alish completed his secondary education at ${this.KNOWLEDGE.secondary}.`;
        }
        if (q.includes('primary') || q.includes('elementary') || q.includes('childhood school')) {
            return `Alish completed his primary education at ${this.KNOWLEDGE.primary}.`;
        }
        if (q.includes('skill') || q.includes('technology') || q.includes('tech stack') || q.includes('can do')) {
            return `Alish's skills include: ${this.KNOWLEDGE.skills.join(', ')}. He uses tools like ${this.KNOWLEDGE.tools.join(', ')}.`;
        }
        if (q.includes('project') || q.includes('portfolio') || q.includes('built') || q.includes('created')) {
            return `Alish has built projects like ${this.KNOWLEDGE.projects.join(' and ')}.`;
        }
        if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('gmail')) {
            return `You can reach Alish at ${this.KNOWLEDGE.contact}.`;
        }
        if (q.includes('linkedin')) {
            return `Connect with Alish on LinkedIn: ${this.KNOWLEDGE.linkedin}`;
        }
        if (q.includes('github')) {
            return `Check out Alish's code on GitHub: ${this.KNOWLEDGE.github}`;
        }
        if (q.includes('discord')) {
            return `Add Alish on Discord: ${this.KNOWLEDGE.discord}`;
        }
        if (q.includes('who are you') || q.includes('about you') || q.includes('tell me about you') || q.includes('your name')) {
            return `I'm Abyss, an AI assistant created for ${this.KNOWLEDGE.name}. I can answer questions about him, do calculations, check weather, and more!`;
        }
        if (q.includes('cv') || q.includes('resume')) {
            return `You can download Alish's CV from the portfolio page. It contains all his skills, education, and experience.`;
        }
        if (q.includes('who') || q.includes('about alish') || q.includes('introduce')) {
            return `${this.KNOWLEDGE.name} is ${this.KNOWLEDGE.age} from ${this.KNOWLEDGE.location}. He is studying ${this.KNOWLEDGE.studies} at ${this.KNOWLEDGE.education}. He is passionate about AI, web development, and creative design.`;
        }
        return null;
    }
};

export { MarvelService, WeatherService, CalculatorService, TimeService, PortfolioService };
