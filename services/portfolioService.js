const PORTFOLIO_DATA = {
    name: "Alish Shrestha",
    age: 18,
    location: "Changu Narayan-01, Bhaktapur, Nepal",
    email: "shresthaalish444@gmail.com",
    college: "Softwarica College of IT & E-Commerce (Coventry University, UK)",
    degree: "BSc (Hons) Computer Science with Artificial Intelligence",
    secondarySchool: "Khwopa Secondary School, Bhaktapur (Computer Science Specialization, 2023-2025)",
    primarySchool: "North East English Secondary School, Bhaktapur",
    skills: {
        programming: ["Python", "JavaScript", "HTML5", "CSS3", "C++", "C#"],
        ai_ml: ["TensorFlow", "PyTorch", "Machine Learning", "Neural Networks", "Deep Learning", "Data Science"],
        tools: ["VS Code", "GitHub", "Git", "Terminal", "Arduino"],
        creative: ["Photography", "Video Editing", "UI/UX Design", "Communication"]
    },
    projects: [
        {
            name: "Yatra Travel Agency",
            description: "Travel booking & tour guide website built for Nepal tourism.",
            link: "https://yatrala.netlify.app",
            github: "https://github.com/fwabyss0/Yatra.git"
        },
        {
            name: "Printing Resolution",
            description: "Online printing service platform for custom prints and designs.",
            link: "https://printresolution.netlify.app",
            github: "https://github.com/fwabyss0/pr"
        },
        {
            name: "Interactive Portfolio & AI Assistant (Abyss)",
            description: "Personal interactive web portfolio featuring real-time AI assistant.",
            github: "https://github.com/fwabyss0/Protfolio.git"
        }
    ],
    social: {
        github: "https://github.com/fwabyss0",
        linkedin: "https://www.linkedin.com/in/alish-shrestha-4276b8379/",
        instagram: "https://www.instagram.com/aliisshhhhhh/",
        facebook: "https://www.facebook.com/alish.shrestha.138982",
        discord: "fwabyss"
    },
    cv: "Alish_Shrestha_CV.pdf"
};

function isPortfolioQuery(message) {
    const msg = message.toLowerCase();
    const keywords = [
        'alish', 'who are you', 'your name', 'created you', 'creator', 'owner',
        'skills', 'programming', 'languages', 'tech stack', 'coding', 'experience',
        'education', 'college', 'university', 'softwarica', 'khwopa', 'school',
        'projects', 'yatra', 'printing resolution', 'portfolio', 'built', 'work',
        'contact', 'email', 'reach', 'social', 'github', 'linkedin', 'instagram', 'facebook', 'discord', 'fwabyss',
        'location', 'where', 'from', 'live', 'nepal', 'bhaktapur', 'age', 'how old', 'cv', 'resume'
    ];
    return keywords.some(kw => msg.includes(kw));
}

function getPortfolioContext() {
    return `
ABOUT ALISH SHRESTHA (Portfolio Owner):
- Name: Alish Shrestha
- Age: 18 years old
- Location: Changu Narayan-01, Bhaktapur, Nepal 🇳🇵
- Email: shresthaalish444@gmail.com
- Status: Passionate AI student, developer, and creative designer

EDUCATION:
- Currently: Softwarica College of IT & E-Commerce (Coventry University, UK) - Bachelor's in Artificial Intelligence (BSc Hons)
- 2023-2025: Khwopa Secondary School, Dekocha-06, Bhaktapur - Computer Science Specialization
- Primary: North East English Secondary School, Changunarayan-03, Bhaktapur

SKILLS:
- Programming: Python, JavaScript, HTML5/CSS3, C++, C#
- AI / ML: TensorFlow, PyTorch, Machine Learning, Neural Networks, Deep Learning, Data Science
- Tools & Platforms: VS Code, GitHub, Git, Terminal, Arduino
- Creative: Photography, Video Editing, UI/UX Design, Communication

PROJECTS:
1. Yatra Travel Agency - Travel booking website for Nepal (https://yatrala.netlify.app | Repo: https://github.com/fwabyss0/Yatra.git)
2. Printing Resolution - Online printing service (https://printresolution.netlify.app | Repo: https://github.com/fwabyss0/pr)
3. Interactive Portfolio with AI Assistant (Abyss) - Personal portfolio (https://github.com/fwabyss0/Protfolio.git)

SOCIAL & CONTACT LINKS:
- GitHub: https://github.com/fwabyss0
- LinkedIn: https://www.linkedin.com/in/alish-shrestha-4276b8379/
- Instagram: @aliisshhhhhh (https://www.instagram.com/aliisshhhhhh/)
- Facebook: https://www.facebook.com/alish.shrestha.138982
- Discord: fwabyss
- Download CV: Alish_Shrestha_CV.pdf

PORTFOLIO RULE: Always prioritize this data when asked about Alish, his skills, projects, education, or contact details. Keep replies clear and engaging.
`;
}

function getPortfolioDirectResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('discord') || msg.includes('fwabyss')) {
        return "You can add Alish on Discord with username: **fwabyss**! Feel free to send a friend request for tech chats or gaming. 🎮";
    }
    if (msg.includes('email') || msg.includes('contact') || msg.includes('reach')) {
        return "You can reach Alish directly at: [shresthaalish444@gmail.com](mailto:shresthaalish444@gmail.com) 📧";
    }
    if (msg.includes('cv') || msg.includes('resume')) {
        return "You can download Alish's official CV here: [Download CV](Alish_Shrestha_CV.pdf) 📄";
    }
    if (msg.includes('github')) {
        return "Check out Alish's code repositories on GitHub: [github.com/fwabyss0](https://github.com/fwabyss0) 💻";
    }
    if (msg.includes('linkedin')) {
        return "Connect with Alish on LinkedIn: [Alish Shrestha LinkedIn](https://www.linkedin.com/in/alish-shrestha-4276b8379/) 💼";
    }
    if (msg.includes('instagram')) {
        return "Follow Alish on Instagram: [@aliisshhhhhh](https://www.instagram.com/aliisshhhhhh/) 📸";
    }
    if (msg.includes('facebook')) {
        return "Connect with Alish on Facebook: [Alish Shrestha Facebook](https://www.facebook.com/alish.shrestha.138982) 👤";
    }

    return null;
}

module.exports = {
    PORTFOLIO_DATA,
    isPortfolioQuery,
    getPortfolioContext,
    getPortfolioDirectResponse
};
