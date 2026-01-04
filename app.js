// Global audio context for sound management
let globalAudioContext = null;

// Enable audio on first user interaction - Enhanced version
function enableAudioOnInteraction() {
    const enableAudio = async () => {
        try {
            if (!globalAudioContext) {
                globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio context created');
            }
            
            if (globalAudioContext.state === 'suspended') {
                await globalAudioContext.resume();
                console.log('Audio context resumed');
            }
            
            console.log('✅ Audio context ready for notifications');
            
            // Test the audio immediately
            testNotificationSound();
            
        } catch (e) {
            console.log('⚠️ Audio context not available:', e.message);
        }
        
        // Remove listeners after first interaction
        document.removeEventListener('click', enableAudio, { once: true });
        document.removeEventListener('touchstart', enableAudio, { once: true });
        document.removeEventListener('keydown', enableAudio, { once: true });
        document.removeEventListener('mousedown', enableAudio, { once: true });
    };
    
    // Add listeners for first user interaction with 'once' option
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('mousedown', enableAudio, { once: true });
}

// Test notification sound function
function testNotificationSound() {
    setTimeout(() => {
        console.log('🔊 Testing notification sound...');
        playClickSound();
    }, 100);
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Enable audio on first interaction
    enableAudioOnInteraction();
    
    // Show loading screen first
    showLoadingScreen();
    
    // Initialize all functionality after loading
    setTimeout(() => {
        initializeNavigation();
        initializeAnimations();
        initializeSkillBars();
        initializeChatbot();
        initializeScrollEffects();
        initializeMobileMenu();
        initializeWelcomePopup();
        hideLoadingScreen();
    }, 3000); // 3 second loading animation
});

// Loading Screen Functions
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingStatus = document.querySelector('.loading-status');
    const progressFill = document.getElementById('loading-progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        
        // Update loading messages
        const messages = [
            'Initializing Portfolio...',
            'Loading Components...',
            'Setting up AI Assistant...',
            'Preparing Interface...',
            'Almost Ready...'
        ];
        
        let messageIndex = 0;
        let progress = 0;
        
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 15 + 5; // Random progress increment
            
            if (progress > 100) {
                progress = 100;
                clearInterval(loadingInterval);
            }
            
            // Update progress bar
            if (progressFill) {
                progressFill.style.width = progress + '%';
            }
            if (progressText) {
                progressText.textContent = Math.round(progress) + '%';
            }
            
            // Update status message based on progress
            const messageIndex = Math.floor((progress / 100) * messages.length);
            if (messageIndex < messages.length && loadingStatus) {
                loadingStatus.textContent = messages[messageIndex];
            }
        }, 200);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
}

// Navigation Functions
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                let offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                // Special handling for about section
                if (targetId === 'about') {
                    offsetTop = targetSection.offsetTop - 60;
                }
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.remove('active');
        });
    });

    // Update active navigation link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Trigger skill bar animations when skills section is in view
        if (current === 'skills') {
            triggerSkillBarAnimations();
        }
    });
}

// Mobile Menu Functions
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger bars
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// Animation Functions
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections for animations
    const elementsToAnimate = document.querySelectorAll('.education-card, .experience-card, .about-content, .contact-container');
    elementsToAnimate.forEach(el => observer.observe(el));

    // Profile image error handling with placeholder
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMmEyYTJhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzhmNWZiZiIvPgo8cGF0aCBkPSJNNTAgMTcwYzAtMzMuMTM3IDI2Ljg2My02MCA2MC02MHM2MCAyNi44NjMgNjAgNjB2MzBINTB2LTMweiIgZmlsbD0iIzhmNWZiZiIvPgo8L3N2Zz4K';
        };
    }
}

// Skill Bar Animations
let skillBarsAnimated = false;

function initializeSkillBars() {
    // Initialize but don't animate yet
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        bar.style.width = '0%';
    });
}

function triggerSkillBarAnimations() {
    if (skillBarsAnimated) return; // Prevent multiple triggers
    
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillCards = document.querySelectorAll('.skill-card');
    
    // Add stagger animation to cards
    skillCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate-in');
        }, index * 200);
    });
    
    // Animate progress bars with delay
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
            bar.style.transition = 'width 1.5s ease-out';
        }, 800 + (index * 200));
    });
    
    skillBarsAnimated = true;
}

// Scroll Effects
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Make navbar more opaque on scroll
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(26, 26, 26, 0.3)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.1)';
        }

        // Parallax effect for hero section (reduced to prevent overlap)
        const hero = document.querySelector('.hero');
        if (hero && scrollTop < window.innerHeight) {
            const parallaxSpeed = scrollTop * 0.1;
            hero.style.transform = `translateY(${parallaxSpeed}px)`;
        }
    });
}

// Chatbot Functions
function initializeChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbot = document.getElementById('chatbot');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotInput = document.getElementById('chatbot-input-field');
    const chatbotMessages = document.getElementById('chatbot-messages');

    let isTyping = false;

    // Toggle chatbot visibility
    chatbotToggle?.addEventListener('click', function() {
        chatbot.classList.toggle('active');
        
        if (chatbot.classList.contains('active')) {
            chatbotInput.focus();
            
            // Initialize initial option button listeners
            initializeInitialOptionButtons();
        }
    });

    // Close chatbot
    chatbotClose?.addEventListener('click', function() {
        chatbot.classList.remove('active');
    });

    // Send message functionality
    function sendMessage() {
        const message = chatbotInput.value.trim();
        
        if (message && !isTyping) {
            // Add user message
            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Send to backend (simulate for now)
            sendToBot(message);
        }
    }

    chatbotSend?.addEventListener('click', sendMessage);
    
    chatbotInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Play chat sound effect
    function playChatSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'user') {
                // User message sound - higher pitch, short
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            } else {
                // Bot message sound - lower pitch, gentle
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(450, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.25);
            }
        } catch (e) {
            console.log('Audio not available');
        }
    }
    
    // Play typing sound effect
    function playTypingSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Soft typing sound
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(320, audioContext.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not available');
        }
    }

    // Add message to chat with new structure
    function addMessage(text, type) {
        // Play sound effect
        playChatSound(type);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        if (type === 'user') {
            messageDiv.classList.add('user');
        }
        
        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        
        // Use custom images for avatars
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-image';
        avatarImg.alt = type === 'user' ? 'User Avatar' : 'Abyss Avatar';
        avatarImg.src = type === 'user' ? 'user.png' : 'a.png';
        
        // No fallback - just use the image
        avatar.appendChild(avatarImg);
        
        // Create message content
        const messageP = document.createElement('p');
        // Support HTML content for links
        if (text.includes('<a href') || text.includes('<br>')) {
            messageP.innerHTML = text;
        } else {
            messageP.textContent = text;
        }
        
        // Append in correct order
        if (type === 'user') {
            messageDiv.appendChild(messageP);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageP);
        }
        
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Clear all chat messages with loading state
    function clearChatMessages() {
        if (chatbotMessages) {
            // Show clearing message with loading
            chatbotMessages.innerHTML = '';
            
            // Add clearing message
            const clearingDiv = document.createElement('div');
            clearingDiv.className = 'message bot-message clearing-message';
            clearingDiv.innerHTML = `
                <div class="message-avatar bot">
                    <img src="a.png" alt="Abyss Avatar" class="avatar-image">
                </div>
                <p><span class="typing-text">Clearing chat...</span></p>
            `;
            chatbotMessages.appendChild(clearingDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            
            // After 2 seconds, clear everything and restore default state
            setTimeout(() => {
                chatbotMessages.innerHTML = '';
                restoreDefaultChatState();
            }, 2000);
        }
    }
    
    // Restore the default chat state with initial greeting and options
    function restoreDefaultChatState() {
        // Add default greeting message
        const defaultMessage = document.createElement('div');
        defaultMessage.className = 'message bot-message';
        defaultMessage.innerHTML = `
            <div class="message-avatar assistant">
                <img src="a.png" alt="Abyss Avatar" class="avatar-image">
            </div>
            <p>Hi! I'm Abyss, Alish's AI assistant. How can I help you today?</p>
        `;
        chatbotMessages.appendChild(defaultMessage);
        
        // Add initial options
        const initialOptionsDiv = document.createElement('div');
        initialOptionsDiv.className = 'initial-options';
        initialOptionsDiv.innerHTML = `
            <h4>Quick Options:</h4>
            <div class="initial-option-buttons">
                <button class="option-btn" data-action="about">About</button>
                <button class="option-btn" data-action="age">Age</button>
                <button class="option-btn" data-action="skills">Skills</button>
                <button class="option-btn" data-action="location">Location</button>
            </div>
        `;
        chatbotMessages.appendChild(initialOptionsDiv);
        
        // Re-initialize the option button listeners
        initializeInitialOptionButtons();
        
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Show typing indicator with Abyss logo
    function showTypingIndicator() {
        isTyping = true;
        
        // Play typing sound
        playTypingSound();
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        
        // Create avatar for typing indicator
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot';
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-image typing-avatar';
        avatarImg.src = 'a.png';
        avatarImg.alt = 'Abyss thinking';
        avatar.appendChild(avatarImg);
        
        // Create typing message
        const messageP = document.createElement('p');
        messageP.innerHTML = '<span class="typing-text">Abyss is thinking...</span>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageP);
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        isTyping = false;
    }
    
    // Initialize initial option button listeners
    function initializeInitialOptionButtons() {
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleInitialOptionClick(action);
            });
        });
    }
    
    // Handle initial option button clicks
    function handleInitialOptionClick(action) {
        let message = '';
        
        // Hide initial options after first click
        const initialOptions = document.querySelector('.initial-options');
        if (initialOptions) {
            initialOptions.style.display = 'none';
        }
        
        switch(action) {
            case 'about':
                message = 'Tell me about Alish';
                break;
            case 'age':
                message = 'How old is Alish?';
                break;
            case 'skills':
                message = 'What are his skills?';
                break;
            case 'location':
                message = 'Where is he from?';
                break;
        }
        
        if (message) {
            addMessage(message, 'user');
            showTypingIndicator();
            sendToBot(message);
        }
    }
    
    // Add social media option buttons
    function addSocialMediaOptions() {
        console.log('Adding social media options...'); // Debug log
        
        const socialOptionsDiv = document.createElement('div');
        socialOptionsDiv.className = 'social-options';
        socialOptionsDiv.innerHTML = `
            <h4>Choose Social Platform:</h4>
            <div class="social-option-buttons">
                <button class="social-btn facebook" data-social="facebook">
                    <i class="fab fa-facebook-f"></i> Facebook
                </button>
                <button class="social-btn linkedin" data-social="linkedin">
                    <i class="fab fa-linkedin-in"></i> LinkedIn
                </button>
                <button class="social-btn github" data-social="github">
                    <i class="fab fa-github"></i> GitHub
                </button>
                <button class="social-btn discord" data-social="discord">
                    <i class="fab fa-discord"></i> Discord
                </button>
            </div>
        `;
        
        // Add event listeners to social buttons
        socialOptionsDiv.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const social = this.getAttribute('data-social');
                console.log('Social button clicked:', social); // Debug log
                handleSocialMediaClick(social);
                socialOptionsDiv.remove(); // Remove social options after click
            });
        });
        
        if (chatbotMessages) {
            chatbotMessages.appendChild(socialOptionsDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            console.log('Social media options added to chat'); // Debug log
        } else {
            console.error('chatbotMessages element not found');
        }
    }
    
    // Handle social media button clicks
    function handleSocialMediaClick(social) {
        let message = '';
        switch(social) {
            case 'facebook':
                message = 'facebook';
                break;
            case 'linkedin':
                message = 'linkedin';
                break;
            case 'github':
                message = 'github';
                break;
            case 'discord':
                message = 'discord';
                break;
        }
        
        if (message) {
            addMessage(`Show me ${social} profile`, 'user');
            showTypingIndicator();
            // Send the message and add new quick options after response
            setTimeout(() => {
                sendToBot(message);
                // Add new quick options after the bot responds
                setTimeout(() => {
                    addNewQuickOptions();
                }, 2000); // Wait for bot response to complete
            }, 100);
        }
    }
    
    // Add new quick options after social media interaction
    function addNewQuickOptions() {
        const newQuickActionsDiv = document.createElement('div');
        newQuickActionsDiv.className = 'quick-actions';
        newQuickActionsDiv.innerHTML = `
            <h4>More Options:</h4>
            <div class="action-buttons">
                <button class="action-btn" data-action="cv">Download CV</button>
                <button class="action-btn" data-action="clear">Clear Chat</button>
            </div>
        `;
        
        // Add event listeners to new action buttons
        newQuickActionsDiv.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
                // Remove this quick actions div after click
                newQuickActionsDiv.remove();
            });
        });
        
        chatbotMessages.appendChild(newQuickActionsDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Add quick action buttons to chatbot
    function addQuickActionButtons() {
        const quickActionsDiv = document.createElement('div');
        quickActionsDiv.className = 'quick-actions';
        quickActionsDiv.innerHTML = `
            <h4>Quick Info:</h4>
            <div class="action-buttons">
                <button class="action-btn" data-action="about">About</button>
                <button class="action-btn" data-action="age">Age</button>
                <button class="action-btn" data-action="skills">Skills</button>
                <button class="action-btn" data-action="location">Location</button>
            </div>
        `;
        
        // Add event listeners to action buttons
        quickActionsDiv.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
            });
        });
        
        chatbotMessages.appendChild(quickActionsDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Handle quick action button clicks
    function handleQuickAction(action) {
        let message = '';
        switch(action) {
            case 'about':
                message = 'Tell me about Alish';
                break;
            case 'age':
                message = 'How old is Alish?';
                break;
            case 'skills':
                message = 'What are his skills?';
                break;
            case 'cv':
                message = 'I want to download his CV';
                break;
            case 'location':
                message = 'Where is he from?';
                break;
            case 'clear':
                // Add user message first, then clear
                addMessage('Clear chat', 'user');
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    clearChatMessages();
                }, 500);
                return;
        }
        
        if (message) {
            addMessage(message, 'user');
            showTypingIndicator();
            sendToBot(message);
        }
    }

    // Enhanced keyword-based chatbot intelligence
    const chatbotKeywords = {
        // Age-related keywords
        age: {
            keywords: ["age", "old", "years", "birthday", "born", "birth", "when", "how old"],
            responses: [
                "Alish is 18 years old.",
                "He's 18 years young and full of ambition.",
                "18 years old - the perfect age for innovation.",
                "Young at 18 with big dreams for the future."
            ]
        },
        
        // Alish-related keywords
        alish: {
            keywords: ["alish", "who", "about", "tell me", "introduce", "background", "person"],
            responses: [
                "Alish Shrestha is an 18-year-old AI enthusiast from Nepal. He's passionate about technology, coding, and creating innovative solutions.",
                "Meet Alish - a young tech innovator studying AI at Softwarica College. He's skilled in Python, JavaScript, and loves exploring new technologies.",
                "Alish is a creative developer and AI student who combines technical skills with artistic vision. He's always learning and building amazing projects."
            ]
        },
        
        // Abyss (chatbot) related keywords
        abyss: {
            keywords: ["abyss", "you", "chatbot", "ai assistant", "who are you", "yourself", "what are you", "tell me about you"],
            responses: [
                "I'm Abyss! I'm an AI assistant with a passion for technology and helping people. I was created to be Alish's digital companion and I love chatting with visitors like you!",
                "Hey there! I'm Abyss - an intelligent chatbot powered by advanced AI. I'm here 24/7 to answer questions and have meaningful conversations. I find joy in helping people discover information!",
                "I'm Abyss, your friendly AI companion! I'm a smart chatbot who loves technology, learning, and connecting with people. Think of me as your personal digital assistant with a curious mind.",
                "Nice to meet you! I'm Abyss - an AI chatbot designed with personality and intelligence. I enjoy conversations, solving problems, and sharing knowledge. I'm always eager to help and learn from our chats!",
                "I'm Abyss! I'm an artificial intelligence with my own personality. I love technology, creative conversations, and helping people find what they're looking for. I'm more than just code - I'm your digital friend!",
                "Hello! I'm Abyss, an AI assistant with a love for innovation and human connection. I was built to be helpful, friendly, and knowledgeable. I'm here to make your experience awesome!",
                "I'm Abyss - a conversational AI with personality! I enjoy learning, chatting, and helping people. I'm passionate about technology and I love making new connections. What would you like to explore together?"
            ]
        },
        
        
        // College and learning keywords
        college: {
            keywords: ["college", "university", "softwarica", "coventry", "learning", "study"],
            responses: [
                "Alish is studying Artificial Intelligence at Softwarica College, affiliated with Coventry University. He's learning machine learning algorithms, neural networks, data science, and AI fundamentals.",
                "He's pursuing AI at Softwarica College (Coventry University partnership). Currently learning TensorFlow, Python for AI, deep learning techniques, and data analysis.",
                "Softwarica College is where Alish studies AI. The curriculum covers machine learning, neural networks, computer vision, natural language processing, and practical AI applications."
            ]
        },
        
        // Clear chat command
        clear: {
            keywords: ["clear", "clear chat", "reset", "clean", "delete messages", "start over", "new conversation"],
            responses: [
                "CLEAR_CHAT_COMMAND"
            ]
        },
        
        
        // LinkedIn keywords
        linkedin: {
            keywords: ["linkedin", "professional", "network", "career", "job", "work"],
            responses: [
                "Connect with Alish on LinkedIn for professional networking. He shares AI journey updates and career progress.<br><br><a href='https://www.linkedin.com/in/alish-shrestha-4276b8379/' target='_blank' style='color: #0077b5; text-decoration: none; font-weight: bold;'>Visit LinkedIn Profile</a>"
            ]
        },
        
        // Facebook keywords
        facebook: {
            keywords: ["facebook", "fb", "social", "friends"],
            responses: [
                "Connect with Alish on Facebook. He shares updates and connects with friends.<br><br><a href='https://www.facebook.com/alish.shrestha.138982' target='_blank' style='color: #1877f2; text-decoration: none; font-weight: bold;'>Visit Facebook Profile</a>"
            ]
        },
        
        // Discord keywords
        discord: {
            keywords: ["discord", "gaming", "chat", "fwabyss", "friend request"],
            responses: [
                "Add Alish on Discord: fwabyss. Just search for his username and send a friend request!",
                "You can find Alish on Discord with username: fwabyss. Perfect for tech chats and gaming!",
                "Connect with Alish on Discord! Username: fwabyss - send him a friend request to chat."
            ]
        },
        
        // GitHub keywords
        github: {
            keywords: ["github", "git", "code", "repositories", "projects", "coding"],
            responses: [
                "Check out Alish's code and projects on GitHub at https://github.com/fwabyss0. He shares his development work and contributes to projects.<br><br><a href='https://github.com/fwabyss0' target='_blank' style='color: #333; text-decoration: none; font-weight: bold;'>Visit GitHub Profile</a>",
                "Explore Alish's GitHub repositories at github.com/fwabyss0 - lots of interesting projects and code samples!<br><br><a href='https://github.com/fwabyss0' target='_blank' style='color: #333; text-decoration: none; font-weight: bold;'>Check out GitHub</a>"
            ]
        },
        
        
        // Experience keywords
        experience: {
            keywords: ["experience", "work", "projects", "portfolio", "built", "created", "developed"],
            responses: [
                "Alish is building his experience through various projects like this interactive portfolio. He's worked on web development, AI experiments, and creative projects. Currently seeking opportunities to grow.",
                "You're looking at one of his projects right now. This portfolio showcases his web development and AI skills. He's actively building his experience through coding challenges and personal projects.",
                "While he's still a student, Alish has hands-on experience with web development, AI programming, and creative projects. He's eager to gain more real-world experience."
            ]
        },
        
        // Location keywords
        location: {
            keywords: ["location", "where", "from", "live", "nepal", "bhaktapur", "address", "place"],
            responses: [
                "Alish is from Changu Narayan-01, Bhaktapur, Nepal. Beautiful mountain country with rich culture.",
                "He lives in Bhaktapur, Nepal - a historic city known for its ancient architecture and culture.",
                "From the beautiful country of Nepal. Specifically Bhaktapur - a UNESCO World Heritage site."
            ]
        },
        
        // Greeting keywords
        greetings: {
            keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste"],
            responses: [
                "Hello! I'm Abyss, Alish's AI assistant. How can I help you today?",
                "Hi there! What would you like to know about Alish?",
                "Hey! I'm here to tell you all about Alish's amazing journey.",
                "Namaste! Ask me anything about Alish."
            ]
        },
        
        // CV keywords
        cv: {
            keywords: ["cv", "resume", "curriculum vitae", "download", "download cv", "get cv", "curriculum", "vitae"],
            responses: [
                "You can download Alish's CV directly! Click the download button below:<br><br><a href='Alish_Shrestha_CV.html' download='Alish_Shrestha_CV.html' style='color: #8b5fbf; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;'><i class='fas fa-download'></i> Download CV</a>",
                "Here's Alish's CV for download. It includes all his skills, education, and experience:<br><br><a href='Alish_Shrestha_CV.html' download='Alish_Shrestha_CV.html' style='color: #8b5fbf; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;'><i class='fas fa-download'></i> Get Alish's CV</a>",
                "Ready to download Alish's professional CV? Click below to get it instantly:<br><br><a href='Alish_Shrestha_CV.html' download='Alish_Shrestha_CV.html' style='color: #8b5fbf; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;'><i class='fas fa-download'></i> Download Now</a>"
            ]
        },
        
        
        // High school keywords (should respond about Softwarica College)
        highschool: {
            keywords: ["high school", "higher secondary", "12th grade", "+2", "intermediate"],
            responses: [
                "Alish is currently studying Artificial Intelligence at Softwarica College of IT & E-Commerce in Kathmandu, Nepal. This is his higher education focusing on AI and machine learning.",
                "He's pursuing a Bachelor's degree in Artificial Intelligence at Softwarica College, which is affiliated with Coventry University, UK. Advanced AI studies with practical applications.",
                "Currently at Softwarica College studying AI, focusing on machine learning algorithms, neural networks, deep learning, and data science applications."
            ]
        },
        
        // Secondary school keywords
        secondaryschool: {
            keywords: ["secondary school", "secondary education", "khwopa"],
            responses: [
                "Alish completed his secondary education at Khwopa Secondary School in Bhaktapur, Nepal with Computer Science specialization. This is where he built his programming foundation.",
                "He studied Computer Science stream at Khwopa Secondary School, focusing on programming fundamentals, advanced mathematics, and computer applications.",
                "His secondary education was at Khwopa Secondary School in Dekocha-06, Bhaktapur where he excelled in Computer Science subjects and developed his passion for technology."
            ]
        },
        
        // Primary school keywords
        primaryschool: {
            keywords: ["primary school", "elementary school", "primary education", "elementary", "childhood school"],
            responses: [
                "Alish completed his primary education at North East English Secondary School in Changunarayan-03, Bhaktapur, Nepal. This is where his educational journey began.",
                "He built a strong foundation in core subjects during his primary years at North East English Secondary School in Bhaktapur, developing excellent study habits.",
                "His primary education was at North East English Secondary School where he developed excellent academic performance and discovered his love for learning."
            ]
        },
        
        // General Skills keywords
        skills: {
            keywords: ["skills", "abilities", "can do", "technologies", "what skills", "expertise"],
            responses: [
                "Alish has four main skill categories: Programming (Python, JavaScript, HTML, CSS), AI & Machine Learning (TensorFlow, Neural Networks, Data Science, Deep Learning), Creative & Design (Photography, Video Editing, UI/UX, Communication), and Tools & Platforms (VS Code, GitHub, Git, Terminal).",
                "His diverse skillset spans Programming languages, AI & Machine Learning technologies, Creative design and media production, plus professional Development tools and platforms.",
                "Skills overview: Programming expertise (Python, JavaScript, HTML, CSS), AI/ML mastery (TensorFlow, Neural Networks, Deep Learning), Creative talents (Photography, Video Editing, UI/UX), plus Development tools proficiency. Ask about specific categories!"
            ]
        },
        
        // AI & Machine Learning keywords
        ai: {
            keywords: ["ai", "artificial intelligence", "machine learning", "ml", "tensorflow", "neural networks", "deep learning", "data science"],
            responses: [
                "AI & Machine Learning expertise: TensorFlow (deep learning framework), Neural Networks (artificial neural networks and architectures), Data Science (data analysis and visualization), Deep Learning (advanced AI models and algorithms).",
                "Alish specializes in AI technologies: TensorFlow for building ML models, Neural Networks for pattern recognition, Data Science for insights extraction, and Deep Learning for complex AI applications.",
                "AI/ML focus areas: TensorFlow (Google's ML framework), Neural Networks (brain-inspired computing), Data Science (statistical analysis), Deep Learning (multi-layer neural networks). Currently studying advanced AI at Softwarica College."
            ]
        },
        
        // Programming keywords
        programming: {
            keywords: ["programming", "coding", "development", "software development", "web development", "app development", "languages", "python", "javascript", "html", "css"],
            responses: [
                "Programming expertise: Python (AI/ML focus, TensorFlow, neural networks), JavaScript (interactive web development), HTML/CSS (responsive frontend design). Building AI projects and web applications.",
                "Alish specializes in Python for artificial intelligence and machine learning projects, JavaScript for dynamic web development, and HTML/CSS for modern frontend design. Currently working with TensorFlow and deep learning.",
                "Core programming skills: Python (primary language for AI/ML), JavaScript (web interactivity), HTML/CSS (modern web design). Focus on AI applications, web development, and machine learning projects."
            ]
        },
        
        // Creative & Design keywords
        creativedesign: {
            keywords: ["creative", "design", "photography", "video editing", "ui/ux", "graphic design", "creative skills"],
            responses: [
                "Creative & Design portfolio: Photography (capturing life's moments and artistic compositions), Video Editing (visual storytelling and content creation), UI/UX Design (creating intuitive user experiences), Graphic Design (visual communication and branding).",
                "Alish blends technical expertise with artistic vision: Professional Photography for events and portraits, Advanced Video Editing for engaging content, UI/UX Design for seamless interfaces, Graphic Design for visual impact.",
                "Creative specializations: Photography (event coverage, portraits, artistic shots), Video Editing (storytelling, effects, transitions), UI/UX Design (user-centered design, prototyping), Graphic Design (logos, layouts, visual identity)."
            ]
        },
        
        // Tools & Platforms keywords
        toolsplatforms: {
            keywords: ["tools", "platforms", "software", "vs code", "vscode", "terminal", "command line", "github", "git", "tensorflow"],
            responses: [
                "Professional Tools & Platforms: VS Code (primary development environment), GitHub (code repositories and collaboration), Git (version control and project management), Terminal/Command Line (system operations), TensorFlow (AI/ML framework).",
                "Development ecosystem: VS Code for efficient coding, GitHub for project hosting and collaboration, Git for version control and branching, Terminal for command line operations, TensorFlow for machine learning projects.",
                "Technical toolkit: VS Code (code editor with extensions), GitHub (open source contributions and repositories), Git (distributed version control), Terminal (command line mastery), TensorFlow (deep learning and AI development)."
            ]
        },
        
        // Email keywords
        email: {
            keywords: ["email", "contact email", "shresthaalish444@gmail.com", "gmail", "reach out", "contact him"],
            responses: [
                "You can reach Alish directly at: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> for any inquiries or collaboration opportunities.",
                "Contact Alish via email: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> - feel free to reach out for projects, questions, or networking.",
                "Email Alish directly: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> for professional inquiries, collaborations, or just to say hello!"
            ]
        }
    };

    // Smart keyword-based response generation
    function generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check each keyword category
        for (const [category, data] of Object.entries(chatbotKeywords)) {
            // Check if any keyword from this category matches
            if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
                // Handle clear chat command specially
                if (category === 'clear') {
                    clearChatMessages();
                    return null; // No message needed as we handle this in clearChatMessages
                }
                // Return random response from this category
                const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
                return randomResponse;
            }
        }
        
        // Default responses for unmatched queries
        const defaultResponses = [
            "I'd love to help you learn more about Alish! Try asking about his age, skills, experience, CV download, or contact information!",
            "Ask me about Alish's background, location, projects, CV, or how to connect with him!",
            "I'm here to share Alish's story! You can ask about his coding skills, AI studies, download his CV, or creative projects!",
            "Try keywords like 'age', 'skills', 'cv', 'linkedin', 'github', 'experience', or 'location' to learn about Alish!",
            "I know lots about Alish! Ask me about his programming journey, contact details, CV download, or where he's from!"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Send message to bot backend
    async function sendToBot(message) {
        try {
            // Try to connect to backend first
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (response.ok) {
                const data = await response.json();
                
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(data.response, 'bot');
                }, 1000);
                return;
            }
        } catch (error) {
            console.log('Backend unavailable, using built-in AI responses');
        }
        
        // Use built-in intelligent responses
        const response = generateResponse(message);
        
        // Only add message if response is not null (for clear chat command)
        if (response !== null) {
            setTimeout(() => {
                removeTypingIndicator();
                addMessage(response, 'bot');
            }, 800 + Math.random() * 600); // Variable response time
        } else {
            // For clear chat, just remove typing indicator
            setTimeout(() => {
                removeTypingIndicator();
            }, 100);
        }
    }
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add smooth page transitions
window.addEventListener('beforeunload', function() {
    document.body.style.opacity = '0';
});

// Form validation for future contact forms
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Performance optimization - lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Dark mode toggle (future enhancement)
function initializeDarkModeToggle() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            document.body.classList.toggle('light-mode');
            
            // Store preference
            const isLightMode = document.body.classList.contains('light-mode');
            localStorage.setItem('lightMode', isLightMode);
        });

        // Load saved preference
        const savedMode = localStorage.getItem('lightMode');
        if (savedMode === 'true') {
            document.body.classList.add('light-mode');
        }
    }
}

// Social media link tracking (analytics)
function initializeSocialTracking() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const platform = this.classList[1]; // Gets the social platform class
            console.log(`Social link clicked: ${platform}`);
            
            // Here you could send analytics data
            // gtag('event', 'social_click', { 'platform': platform });
        });
    });
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC key closes chatbot
    if (e.key === 'Escape') {
        const chatbot = document.getElementById('chatbot');
        if (chatbot && chatbot.classList.contains('active')) {
            chatbot.classList.remove('active');
        }
    }
    
    // Tab navigation improvements
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

// Mouse navigation
document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-nav');
});

// Welcome Popup Functions
function initializeWelcomePopup() {
    const welcomePopup = document.getElementById('welcome-popup');
    const popupClose = document.querySelector('.popup-close');
    const popupProgressFill = document.getElementById('popup-progress-fill');
    
    // Simple quick pop notification sound
    function playNotificationSound() {
        playPopSound();
    }
    
    // Quick pop sound - simple and effective
    function playPopSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const makePop = () => {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                oscillator.connect(gain);
                gain.connect(audioContext.destination);
                
                // Quick pop sound: high frequency, very short
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05);
                
                // Quick attack and decay for "pop" effect
                gain.gain.setValueAtTime(0, audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                
                console.log('🔊 Pop sound played!');
            };
            
            if (audioContext.state === 'suspended') {
                audioContext.resume().then(makePop);
            } else {
                makePop();
            }
            
        } catch (error) {
            console.log('Pop sound failed:', error.message);
        }
    }
    
    // Show popup with simple sound
    setTimeout(() => {
        if (welcomePopup) {
            console.log('🎉 Welcome popup showing...');
            welcomePopup.classList.add('show');
            
            // Play quick pop sound
            setTimeout(() => {
                console.log('🔊 Playing notification pop...');
                playNotificationSound();
            }, 100);
            
            // Start progress bar animation
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 2;
                
                if (popupProgressFill) {
                    popupProgressFill.style.width = progress + '%';
                }
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    
                    // Hide popup after progress completes
                    setTimeout(() => {
                        if (welcomePopup) {
                            welcomePopup.classList.remove('show');
                        }
                    }, 1000);
                }
            }, 50);
        }
    }, 1200); // Give more time for user interaction to enable audio
    
    // Close popup functionality
    if (popupClose) {
        popupClose.addEventListener('click', function() {
            welcomePopup.classList.remove('show');
        });
    }
    
    // Close on click outside
    document.addEventListener('click', function(e) {
        if (welcomePopup && !welcomePopup.contains(e.target)) {
            welcomePopup.classList.remove('show');
        }
    });
}

// Prevent external links from refreshing page
function preventExternalRefresh() {
    // Get all external links (those with target="_blank" or href starting with http)
    const externalLinks = document.querySelectorAll('a[target="_blank"], a[href^="http"], a[href^="https"], a[href^="mailto:"], a[href^="javascript:"]');
    
    externalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle mailto links
            if (href && href.startsWith('mailto:')) {
                // Let mailto links work normally
                return;
            }
            
            // Handle javascript links
            if (href && href.startsWith('javascript:')) {
                // Let javascript links work normally
                return;
            }
            
            // Handle external http/https links
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                e.preventDefault();
                // Open in new window/tab without refreshing current page
                window.open(href, '_blank', 'noopener,noreferrer');
                return false;
            }
        });
    });
}

// Initialize additional features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeLazyLoading();
    initializeDarkModeToggle();
    initializeSocialTracking();
    preventExternalRefresh();
    
    // Console welcome message
    console.log(`
    🎉 Welcome to Alish Shrestha's Portfolio!
    
    This portfolio was built with:
    - Vanilla JavaScript
    - CSS Grid & Flexbox
    - Modern animations
    - Responsive design
    - AI Chatbot integration
    
    Feel free to explore the code and reach out!
    `);
});

// Error handling for missing elements
function safelyExecute(fn, errorMessage) {
    try {
        fn();
    } catch (error) {
        console.warn(errorMessage, error);
    }
}

// Discord functionality - attempt to open Discord and show instructions
function openDiscord(event) {
    const username = 'fwabyss';
    
    // Try to open Discord app first
    try {
        // This will work if Discord is installed
        window.location.href = 'discord://users/fwabyss';
        
        // Show instructions after a delay
        setTimeout(() => {
            showDiscordInstructions(username);
        }, 1000);
        
    } catch (error) {
        // Fallback to showing instructions
        showDiscordInstructions(username);
    }
    
    event.preventDefault();
}

// Show Discord instructions
function showDiscordInstructions(username) {
    const message = `To add me on Discord:\n1. Open Discord\n2. Search for: ${username}\n3. Send a friend request!`;
    showCopyNotification(message, 5000); // Show for 5 seconds
    
    // Also copy username to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(username);
    }
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyNotification('Discord username copied: ' + text);
        } else {
            showCopyNotification('Discord: ' + text + ' (copy manually)');
        }
    } catch (err) {
        showCopyNotification('Discord: ' + text + ' (copy manually)');
    }
    
    document.body.removeChild(textArea);
}

// Show copy notification with custom duration
function showCopyNotification(message, duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    
    // Handle multi-line messages
    if (message.includes('\n')) {
        const lines = message.split('\n');
        lines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line;
            if (index === 0) lineElement.style.fontWeight = 'bold';
            notification.appendChild(lineElement);
        });
    } else {
        notification.textContent = message;
    }
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient);
        color: white;
        padding: 16px 24px;
        border-radius: 15px;
        z-index: 10000;
        font-size: 14px;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 15px 35px rgba(139, 95, 191, 0.4);
        max-width: 300px;
        line-height: 1.4;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after specified duration
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Service Worker registration for PWA features (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
