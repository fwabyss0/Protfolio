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
document.addEventListener('DOMContentLoaded', function () {
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
    const loadingName = document.getElementById('loading-name');

    if (loadingScreen) {
        loadingScreen.style.display = 'flex';

        // Scramble animation for loading name
        if (loadingName) {
            scrambleText(loadingName, 'Alish Shrestha', 1200);
        }

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

function scrambleText(element, finalText, duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        let text = '';
        const revealCount = Math.floor(progress * finalText.length);
        
        for (let i = 0; i < finalText.length; i++) {
            if (i < revealCount) {
                text += finalText[i];
            } else if (finalText[i] === ' ') {
                text += ' ';
            } else {
                text += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        element.textContent = text;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = finalText;
        }
    }
    
    requestAnimationFrame(update);
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
        link.addEventListener('click', function (e) {
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
    window.addEventListener('scroll', function () {
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
        hamburger.addEventListener('click', function () {
            navMenu.classList.toggle('active');

            // Animate hamburger bars
            this.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
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

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections for animations
    const elementsToAnimate = document.querySelectorAll('.education-card, .about-content, .contact-container');
    elementsToAnimate.forEach(el => observer.observe(el));

    // Profile image error handling with placeholder
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.onerror = function () {
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

    window.addEventListener('scroll', function () {
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

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        });
    }

    function initChatbotResize() {
        const handle = document.getElementById('chatbot-resize-handle');
        const header = document.getElementById('chatbot-header');
        if (!handle || !header || !chatbot) return;

        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = chatbot.offsetWidth;
            startHeight = chatbot.offsetHeight;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const newWidth = Math.max(320, startWidth + (e.clientX - startX));
            const newHeight = Math.max(250, startHeight + (e.clientY - startY));
            chatbot.style.width = newWidth + 'px';
            chatbot.style.maxHeight = newHeight + 'px';
            chatbot.classList.add('expanded');
            scrollToBottom();
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
            }
        });

        header.addEventListener('dblclick', () => {
            if (chatbot.classList.contains('expanded')) {
                chatbot.classList.remove('expanded');
                chatbot.style.width = '';
                chatbot.style.maxHeight = '';
            } else {
                chatbot.classList.add('expanded');
                chatbot.style.width = '600px';
                chatbot.style.maxHeight = '700px';
            }
            scrollToBottom();
        });
    }

    // Toggle chatbot visibility
    chatbotToggle?.addEventListener('click', function () {
        chatbot.classList.toggle('active');

        if (chatbot.classList.contains('active')) {
            chatbotInput.focus();
            initChatbotResize();
            scrollToBottom();

            // Initialize initial option button listeners
            initializeInitialOptionButtons();
        }
    });

    // Close chatbot
    chatbotClose?.addEventListener('click', function () {
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

    chatbotInput?.addEventListener('keypress', function (e) {
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
        scrollToBottom();
    }

    // Clear all chat messages with loading state
    function clearChatMessages() {
        chatSessionHistory = [];
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
            scrollToBottom();

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

        scrollToBottom();
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
        scrollToBottom();
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
            btn.addEventListener('click', function () {
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

        switch (action) {
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
            btn.addEventListener('click', function () {
                const social = this.getAttribute('data-social');
                console.log('Social button clicked:', social); // Debug log
                handleSocialMediaClick(social);
                socialOptionsDiv.remove(); // Remove social options after click
            });
        });

        if (chatbotMessages) {
            chatbotMessages.appendChild(socialOptionsDiv);
            scrollToBottom();
            console.log('Social media options added to chat'); // Debug log
        } else {
            console.error('chatbotMessages element not found');
        }
    }

    // Handle social media button clicks
    function handleSocialMediaClick(social) {
        let message = '';
        switch (social) {
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
            btn.addEventListener('click', function () {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
                // Remove this quick actions div after click
                newQuickActionsDiv.remove();
            });
        });

        chatbotMessages.appendChild(newQuickActionsDiv);
        scrollToBottom();
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
            btn.addEventListener('click', function () {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
            });
        });

        chatbotMessages.appendChild(quickActionsDiv);
        scrollToBottom();
    }

    // Handle quick action button clicks
    function handleQuickAction(action) {
        let message = '';
        switch (action) {
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

    // Smart keyword-based response generation with dynamic sentence mixing
    function generateResponse(message) {
        const msg = message.toLowerCase().trim();

        // Helper to randomly combine sentence components
        function mix(openings, cores, closings) {
            const o = openings[Math.floor(Math.random() * openings.length)];
            const c = cores[Math.floor(Math.random() * cores.length)];
            const cl = closings[Math.floor(Math.random() * closings.length)];
            return `${o}${c}${cl}`;
        }

        function choice(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        // Expanded keyword recognition list (fuzzy matching)
        const categories = {
            clear: ["clear", "reset", "clean", "delete messages", "start over", "new conversation"],
            time: ["time", "clock", "date", "today", "day"],
            weather: ["weather", "temperature", "forecast", "climate", "how hot", "how cold", "is it raining", "temp in", "rain in"],
            math: ["calculate", "solve", "math:", "what is", "how much is"],
            marvel: ["marvel", "mcu", "avengers", "spider-man", "iron man", "thor", "captain america", "black panther", "doctor strange", "guardians", "x-men", "fantastic four", "infinity stones", "thanos", "loki", "wolverine", "deadpool", "multiverse"],
            age: ["age", "old", "years", "birthday", "born", "birth", "when", "how old"],
            alish: ["alish", "who", "about", "introduce", "background", "person"],
            abyss: ["abyss", "you", "chatbot", "ai assistant", "who are you", "yourself", "what are you", "tell me about you", "your name"],
            college: ["college", "university", "softwarica", "coventry", "learning", "study", "education", "school", "high school", "higher secondary", "12th grade", "+2", "intermediate"],
            secondary: ["secondary school", "secondary education", "khwopa"],
            primary: ["primary school", "elementary school", "primary education", "elementary", "childhood school", "north east"],
            skills: ["skills", "abilities", "can do", "technologies", "what skills", "expertise"],
            ai: ["ai", "artificial intelligence", "machine learning", "ml", "tensorflow", "neural networks", "deep learning", "data science"],
            programming: ["programming", "coding", "development", "software development", "web development", "app development", "languages", "python", "javascript", "html", "css", "c++", "c#"],
            creativedesign: ["creative", "design", "photography", "video editing", "ui/ux", "graphic design", "creative skills"],
            tools: ["tools", "platforms", "software", "vs code", "vscode", "terminal", "command line", "github", "git", "tensorflow"],
            experience: ["experience", "work", "projects", "portfolio", "built", "created", "developed", "yatra", "printing resolution"],
            location: ["location", "where", "from", "live", "nepal", "bhaktapur", "address", "place"],
            greetings: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening", "namaste", "sup", "yo", "how are you"],
            cv: ["cv", "resume", "curriculum vitae", "download", "download cv", "get cv", "curriculum", "vitae"],
            email: ["email", "contact email", "shresthaalish444@gmail.com", "gmail", "reach out", "contact him"],
            linkedin: ["linkedin", "professional", "network", "career", "job", "work"],
            facebook: ["facebook", "fb", "social", "friends"],
            discord: ["discord", "gaming", "chat", "fwabyss", "friend request"],
            github_link: ["github profile", "github link", "github account", "github repo"],
            joke: ["joke", "jokes", "tell a joke", "laugh", "funny"],
            quote: ["quote", "quotes", "motivation", "motivate"],
            fact: ["fact", "facts", "tech fact"],
            ai_explanation: ["what is ai", "what is machine learning", "explain ai"],
            coding_explanation: ["what is programming", "what is coding", "how to code"]
        };

        // Find which category matched
        let matchedCategory = null;
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => msg.includes(keyword))) {
                matchedCategory = category;
                break;
            }
        }

        if (!matchedCategory) {
            // Default dynamic responses for unmatched queries
            return choice([
                "I'd love to help you learn more about Alish! Try asking about his age, skills, experience, CV download, or contact information!",
                "Feel free to ask me about Alish's background, location, projects, CV, or how to connect with him!",
                "I'm here to share Alish's story! You can ask about his coding skills, AI studies, download his CV, or creative projects!",
                "Try keywords like 'age', 'skills', 'cv', 'linkedin', 'github', 'experience', or 'location' to learn about Alish!",
                "I know lots about Alish! Ask me about his programming journey, contact details, CV download, or where he's from!"
            ]);
        }

        // Handle category matching
        switch (matchedCategory) {
            case 'clear':
                clearChatMessages();
                return null;

            case 'age':
                return mix(
                    ["Alish is ", "He is currently ", "Alish's age is ", "He's about "],
                    ["18 years old", "18 years young", "18, full of energy and coding passion", "18 years of age"],
                    [" and studying computer science.", " with a bright future ahead in AI.", " and constantly learning new tools.", "."]
                );

            case 'alish':
                return mix(
                    ["Alish Shrestha is ", "Meet Alish - ", "He is ", "Alish is a creative "],
                    ["an 18-year-old AI enthusiast from Nepal", "a student pursuing Computer Science & AI at Softwarica College", "a passionate programmer and technology creator", "a developer who loves merging code with creativity"],
                    [" who loves building web apps and models.", " and enjoys learning deep learning and neural networks.", " with skills in Python, JavaScript, and TensorFlow.", "."]
                );

            case 'abyss':
                return choice([
                    "I'm Abyss! I'm an AI assistant with a passion for technology. I was created to be Alish's digital companion and I love chatting with visitors like you!",
                    "Hey there! I'm Abyss - an intelligent chatbot. I'm here 24/7 to answer questions and have meaningful conversations. What would you like to explore?",
                    "I'm Abyss, your friendly AI companion! I love technology, learning, and helping people discover information about Alish's work.",
                    "Nice to meet you! I'm Abyss - an AI chatbot designed with personality. I enjoy conversations, solving problems, and sharing knowledge!"
                ]);

            case 'college':
                return mix(
                    ["Alish is studying ", "He is currently pursuing AI ", "His higher education is ", "He studies AI "],
                    ["at Softwarica College of IT & E-Commerce", "affiliated with Coventry University, UK", "focusing on machine learning and neural networks", "specializing in Artificial Intelligence"],
                    [" in Kathmandu.", " to build future-ready solutions.", " where he learns data science.", "."]
                );

            case 'secondary':
                return mix(
                    ["Alish completed his secondary education at ", "He finished high school at ", "For secondary school, he went to "],
                    ["Khwopa Secondary School in Dekocha-06, Bhaktapur", "Khwopa Secondary School, focusing on Computer Science", "Khwopa Secondary School"],
                    [" from 2023 to 2025.", " where he built his programming foundation.", "."]
                );

            case 'primary':
                return mix(
                    ["Alish completed his primary education at ", "His schooling journey started at ", "For elementary school, he attended "],
                    ["North East English Secondary School", "North East English Secondary School in Bhaktapur, Nepal", "North East English Secondary School"],
                    [" where he excelled in academic performance.", " developing a love for learning.", "."]
                );

            case 'skills':
                return mix(
                    ["Alish has skills in ", "His main expertise includes ", "He is skilled in ", "His tech stack covers "],
                    ["Programming (Python, JS, HTML/CSS) and AI (TensorFlow)", "AI & Machine Learning (neural networks, deep learning)", "Creative Design (photography, video editing, UI/UX)", "Tools & Platforms like GitHub, VS Code, Git, and Terminal"],
                    [" which he uses to build neat projects.", " for developing end-to-end applications.", " enabling him to merge technology and design.", "."]
                );

            case 'ai':
                return mix(
                    ["Alish specializes in AI technologies like ", "His machine learning interests cover ", "AI/ML focus areas include "],
                    ["TensorFlow (deep learning framework)", "Neural Networks and deep learning architectures", "Data Science and pattern recognition", "building brain-inspired AI systems"],
                    [" for complex AI applications.", " to extract insights.", " currently studying advanced AI at Softwarica College.", "."]
                );

            case 'programming':
                return mix(
                    ["Alish specializes in programming languages like ", "His coding stack includes ", "Core programming skills are "],
                    ["Python for artificial intelligence and ML", "JavaScript for interactive web development", "HTML/CSS for modern responsive designs", "Python and JavaScript"],
                    [" which he uses to build full-stack projects.", " allowing him to develop interactive web tools.", "."]
                );

            case 'creativedesign':
                return mix(
                    ["Alish blends tech with creative skills like ", "His creative portfolio includes ", "Creative specializations cover "],
                    ["Photography (capturing artistic compositions)", "Video Editing (visual storytelling)", "UI/UX Design (creating user-centered designs)", "Graphic Design (visual branding)"],
                    [" for clean visual impact.", " and content creation.", "."]
                );

            case 'tools':
                return mix(
                    ["Alish uses development tools like ", "His technical toolkit includes ", "For building projects, he relies on "],
                    ["VS Code (primary code editor)", "GitHub (code hosting and collaboration)", "Git (distributed version control)", "Terminal (command line master)"],
                    [" to manage his coding workflows smoothly.", " for collaborating on open-source projects.", "."]
                );

            case 'experience':
                return mix(
                    ["Alish is building experience ", "He gains hands-on skills ", "His portfolio experience includes "],
                    ["by building travel websites like Yatra", "developing custom printing sites like Printing Resolution", "exploring ML frameworks and web developer tools", "creating personal interactive web applications"],
                    [" to solve real-world problems.", " while actively looking for new opportunities.", "."]
                );

            case 'location':
                return mix(
                    ["Alish comes from ", "He lives in ", "He is based in ", "His hometown is "],
                    ["Changu Narayan-01, Bhaktapur, Nepal", "the historic city of Bhaktapur, Nepal", "Nepal, near the beautiful mountains of Bhaktapur", "Bhaktapur, Nepal, a UNESCO World Heritage site"],
                    [" where he codes.", " and pursues his AI studies.", " enjoying the culture and tech scene.", "."]
                );

            case 'greetings':
                return choice([
                    "Hello! I'm Abyss, Alish's AI assistant. What would you like to know about him? 🤖",
                    "Hi there! How can I help you explore Alish's portfolio today? 😊",
                    "Hey! Abyss here, ready to share info about Alish's AI journey! 🚀",
                    "Namaste! Ask me anything about Alish's skills, college, projects, or CV! 🙏",
                    "Hey there! What's on your mind today? Let's talk about AI, coding, or Alish's work! 💻"
                ]);

            case 'cv':
                const cvText1 = choice(["You can download Alish's CV directly!", "Here's Alish's CV for download.", "Ready to download Alish's professional CV?"]);
                const cvText2 = choice(["Click the download button below:", "It includes all his skills, education, and experience:", "Click below to get it instantly:"]);
                return `${cvText1}<br>${cvText2}<br><br><a href='Alish_Shrestha_CV.html' download='Alish_Shrestha_CV.html' style='color: #8b5fbf; text-decoration: none; font-weight: bold; display: inline-flex; align-items: center; gap: 5px;'><i class='fas fa-download'></i> Download CV</a>`;

            case 'email':
                const mailText = choice([
                    "You can reach Alish directly at: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> for any inquiries.",
                    "Contact Alish via email: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> - feel free to reach out!",
                    "Email Alish directly: <a href='mailto:shresthaalish444@gmail.com' style='color: #8b5fbf; text-decoration: none; font-weight: bold;'>shresthaalish444@gmail.com</a> for collaborations, or just to say hello!"
                ]);
                return mailText;

            case 'linkedin':
                return choice([
                    "Connect with Alish on LinkedIn for professional networking! He shares AI journey updates and career progress.<br><br><a href='https://www.linkedin.com/in/alish-shrestha-4276b8379/' target='_blank' style='color: #0077b5; text-decoration: none; font-weight: bold;'>Visit LinkedIn Profile</a>",
                    "Check out Alish's professional journey on LinkedIn:<br><br><a href='https://www.linkedin.com/in/alish-shrestha-4276b8379/' target='_blank' style='color: #0077b5; text-decoration: none; font-weight: bold;'>Link to LinkedIn Profile</a> 🚀"
                ]);

            case 'facebook':
                return `Connect with Alish on Facebook! He shares updates and connects with friends.<br><br><a href='https://www.facebook.com/alish.shrestha.138982' target='_blank' style='color: #1877f2; text-decoration: none; font-weight: bold;'>Visit Facebook Profile</a> 👋`;

            case 'discord':
                return choice([
                    "Add Alish on Discord: **fwabyss**. Just search for his username and send a friend request!",
                    "You can find Alish on Discord with username: **fwabyss**. Perfect for tech chats and gaming!",
                    "Connect with Alish on Discord! Username: **fwabyss** - send him a friend request to chat."
                ]);

            case 'github_link':
                return choice([
                    "Check out Alish's code and projects on GitHub at https://github.com/fwabyss0.<br><br><a href='https://github.com/fwabyss0' target='_blank' style='color: #333; text-decoration: none; font-weight: bold;'>Visit GitHub Profile</a>",
                    "Explore Alish's GitHub repositories at github.com/fwabyss0 - lots of interesting projects and code samples!<br><br><a href='https://github.com/fwabyss0' target='_blank' style='color: #333; text-decoration: none; font-weight: bold;'>Check out GitHub</a>"
                ]);

            case 'joke':
                return choice([
                    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
                    "There are 10 types of people in the world: those who understand binary, and those who don't! 😂",
                    "Why did the developer leave his job? Because he didn't get arrays! 💻",
                    "What is a programmer's favorite hangout place? Foo Bar! 🍻",
                    "How many programmers does it take to change a light bulb? None, that's a hardware problem! 💡"
                ]);

            case 'quote':
                return choice([
                    "\"The best way to predict the future is to invent it.\" – Alan Kay 🚀",
                    "\"Code is like humor. When you have to explain it, it's bad.\" – Cory House ✨",
                    "\"First, solve the problem. Then, write the code.\" – John Johnson 💡",
                    "\"Simplicity is the soul of efficiency.\" – Austin Freeman ⚡",
                    "\"Make it work, make it right, make it fast.\" – Kent Beck 🏃"
                ]);

            case 'fact':
                return choice([
                    "💡 **Interesting Tech Fact**: The first computer bug was an actual real moth found trapped inside a Harvard Mark II computer in 1947!",
                    "💡 **Interesting Tech Fact**: The first webcam was created at Cambridge University to monitor a coffee pot so researchers wouldn't waste trips!",
                    "💡 **Interesting Tech Fact**: Python was named after the British comedy troupe 'Monty Python', not the snake!"
                ]);

            case 'ai_explanation':
                return "Artificial Intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of humans or other animals. It involves creating algorithms that can learn from data, reason, solve problems, and make decisions. Alish is currently studying AI at Softwarica College to learn how to build neural networks and machine learning models!";

            case 'coding_explanation':
                return "Coding or programming is the process of writing instructions that a computer can understand and execute. It allows us to build software, games, websites, and AI systems. Alish codes in Python and JavaScript to build applications and neural networks!";

            case 'time': {
                const now = new Date();
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const msg = message.toLowerCase();
                if ((msg.includes('time') || msg.includes('clock')) && !msg.includes('date') && !msg.includes('day')) {
                    return `🕒 ${timeStr} (${timezone})`;
                }
                if ((msg.includes('date') || msg.includes('today')) && !msg.includes('time')) {
                    return `📅 ${dateStr}`;
                }
                return `🕒 ${timeStr} | 📅 ${dateStr} (${timezone})`;
            }

            case 'weather':
                return "🌤️ I can check live weather! But the backend server needs to be running. Make sure the Python backend is active on port 5000.";

            case 'math': {
                const mathRes = evaluateMathClient(message);
                if (mathRes) return mathRes;
                return "🧮 I can calculate that! Try simpler expressions like `25 * 4` or `15% of 200`.";
            }

            case 'marvel':
                return "🦸 I love Marvel! Ask me about characters like Iron Man, Spider-Man, or movies like Avengers. The backend can fetch live Marvel data when connected.";
        }

        return "I'm Abyss, your AI assistant! Ask me anything about programming, math calculations, technology, general knowledge, or Alish Shrestha's portfolio! 🤖✨";
    }

    // Session Memory History Array
    let chatSessionHistory = [];
    let currentSessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);

    // Markdown Parser for Chatbot Responses
    function parseMarkdownToHtml(markdownText) {
        if (!markdownText) return '';
        let text = markdownText;

        // Code blocks ```lang\ncode\n```
        text = text.replace(/```(?:[a-z0-9]+)?\n([\s\S]*?)```/gi, (match, code) => {
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<pre style="background: rgba(0,0,0,0.4); padding: 10px; border-radius: 8px; font-family: monospace; font-size: 0.85em; overflow-x: auto; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1);"><code>${escaped.trim()}</code></pre>`;
        });

        // Inline code `code`
        text = text.replace(/`([^`]+)`/g, (match, code) => {
            const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #38bdf8;">${escaped}</code>`;
        });

        // Markdown Links [text](url)
        text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline; font-weight: 600;">$1</a>');

        // Bold **text** or __text__
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic *text* or _text_
        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Headers ### Title
        text = text.replace(/^###\s+(.*$)/gim, '<strong style="display:block; font-size: 1.1em; margin: 6px 0 3px;">$1</strong>');
        text = text.replace(/^##\s+(.*$)/gim, '<strong style="display:block; font-size: 1.15em; margin: 6px 0 3px;">$1</strong>');
        text = text.replace(/^#\s+(.*$)/gim, '<strong style="display:block; font-size: 1.2em; margin: 6px 0 3px;">$1</strong>');

        // Tables & Lists line by line
        const lines = text.split('\n');
        let inTable = false;
        let tableHtml = '';
        const resultLines = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();

            if (line.startsWith('|') && line.endsWith('|')) {
                if (line.includes('---')) continue;
                const cells = line.split('|').slice(1, -1).map(c => c.trim());
                if (!inTable) {
                    inTable = true;
                    tableHtml = '<table style="width:100%; border-collapse: collapse; margin: 8px 0; font-size: 0.85em; background: rgba(0,0,0,0.2); border-radius: 6px; overflow: hidden;"><tbody><tr style="background: rgba(255,255,255,0.1); text-align: left;">' +
                        cells.map(c => `<th style="padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${c}</th>`).join('') + '</tr>';
                } else {
                    tableHtml += '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">' +
                        cells.map(c => `<td style="padding: 5px 10px;">${c}</td>`).join('') + '</tr>';
                }
            } else {
                if (inTable) {
                    inTable = false;
                    tableHtml += '</tbody></table>';
                    resultLines.push(tableHtml);
                    tableHtml = '';
                }

                if (/^[-*]\s+/.test(line)) {
                    line = '<span style="display:inline-block; margin-left: 4px;">• ' + line.replace(/^[-*]\s+/, '') + '</span>';
                } else if (/^\d+\.\s+/.test(line)) {
                    line = '<span style="display:inline-block; margin-left: 4px;">' + line + '</span>';
                }

                resultLines.push(line);
            }
        }

        if (inTable) {
            tableHtml += '</tbody></table>';
            resultLines.push(tableHtml);
        }

        let finalHtml = resultLines.join('<br>');
        finalHtml = finalHtml.replace(/<br>\s*<pre/gi, '<pre').replace(/<\/pre>\s*<br>/gi, '</pre>');
        finalHtml = finalHtml.replace(/<br>\s*<table/gi, '<table').replace(/<\/table>\s*<br>/gi, '</table>');

        return finalHtml;
    }

    // Send message to bot backend with real-time streaming & conversation memory
    async function sendToBot(message) {
        chatSessionHistory.push({ role: 'user', content: message });
        if (chatSessionHistory.length > 16) {
            chatSessionHistory = chatSessionHistory.slice(-16);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: chatSessionHistory,
                    session_id: currentSessionId
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const botResponse = data.response;
                currentSessionId = data.session_id || currentSessionId;
                chatSessionHistory.push({ role: 'assistant', content: botResponse });

                setTimeout(() => {
                    removeTypingIndicator();
                    addStreamingMessage(botResponse, 'bot');
                }, 400);
                return;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.log('Backend server offline or timeout, falling back to intelligent client-side engine:', error.message);
        }

        const fallbackResponse = generateResponse(message);
        if (fallbackResponse !== null) {
            chatSessionHistory.push({ role: 'assistant', content: fallbackResponse });
            setTimeout(() => {
                removeTypingIndicator();
                addStreamingMessage(fallbackResponse, 'bot');
            }, 600);
        } else {
            setTimeout(() => {
                removeTypingIndicator();
            }, 100);
        }
    }

    // Add streaming message with typewriter effect & markdown support
    function addStreamingMessage(text, type) {
        playChatSound(type);

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        if (type === 'user') {
            messageDiv.classList.add('user');
        }

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;

        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-image';
        avatarImg.alt = type === 'user' ? 'User Avatar' : 'Abyss Avatar';
        avatarImg.src = type === 'user' ? 'user.png' : 'a.png';
        avatar.appendChild(avatarImg);

        const messageP = document.createElement('p');
        messageP.innerHTML = '';

        if (type === 'user') {
            messageDiv.appendChild(messageP);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageP);
        }

        chatbotMessages.appendChild(messageDiv);
        scrollToBottom();

        if (type === 'bot') {
            const renderedHtml = parseMarkdownToHtml(text);

            // If text contains HTML elements, code blocks or tables, render directly for visual perfection
            if (text.includes('```') || text.includes('|') || text.includes('<a href')) {
                messageP.innerHTML = renderedHtml;
                scrollToBottom();
            } else {
                // Word-by-word streaming effect
                const words = text.split(' ');
                let currentText = '';
                let wIdx = 0;

                function typeWord() {
                    if (wIdx < words.length) {
                        currentText += (wIdx === 0 ? '' : ' ') + words[wIdx];
                        messageP.innerHTML = parseMarkdownToHtml(currentText);
                        wIdx++;
                        scrollToBottom();
                        setTimeout(typeWord, 20);
                    } else {
                        messageP.innerHTML = renderedHtml;
                    }
                }
                typeWord();
            }
        } else {
            messageP.innerHTML = parseMarkdownToHtml(text);
        }
    }
}

// Utility Functions
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function evaluateMathClient(message) {
    try {
        let expr = message.toLowerCase().trim();
        for (const prefix of ["what is", "calculate", "solve", "how much is"]) {
            expr = expr.replace(prefix, "").trim();
        }
        expr = expr.replace(/\?/g, "").trim();

        const pctMatch = expr.match(/^(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)$/);
        if (pctMatch) {
            const pct = parseFloat(pctMatch[1]);
            const total = parseFloat(pctMatch[2]);
            const result = (pct / 100) * total;
            return `🧮 \`${pct}% of ${total}\` = **${Number.isInteger(result) ? result : result.toFixed(6).replace(/\.?0+$/, "")}**`;
        }

        const replacements = [
            ["plus", "+"], ["minus", "-"], ["times", "*"], ["multiplied by", "*"],
            ["divided by", "/"], ["over", "/"], ["power of", "**"], ["x", "*"]
        ];
        for (const [word, sym] of replacements) {
            expr = expr.replace(new RegExp(word, "g"), sym);
        }
        expr = expr.replace(/\^/g, "**");

        const sanitized = expr.replace(/[^0-9+\-*/.%() ]/g, "");
        if (!sanitized) return null;

        const result = Function('"use strict"; return (' + sanitized + ')')();
        if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
            const display = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
            return `🧮 \`${message.trim()}\` = **${display}**`;
        }
    } catch {
        return null;
    }
    return null;
}

// Add smooth page transitions
window.addEventListener('beforeunload', function () {
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
        toggleButton.addEventListener('click', function () {
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
        link.addEventListener('click', function (e) {
            const platform = this.classList[1]; // Gets the social platform class
            console.log(`Social link clicked: ${platform}`);

            // Here you could send analytics data
            // gtag('event', 'social_click', { 'platform': platform });
        });
    });
}

// Keyboard navigation
document.addEventListener('keydown', function (e) {
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
document.addEventListener('mousedown', function () {
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
        popupClose.addEventListener('click', function () {
            welcomePopup.classList.remove('show');
        });
    }

    // Close on click outside
    document.addEventListener('click', function (e) {
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
        link.addEventListener('click', function (e) {
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
document.addEventListener('DOMContentLoaded', function () {
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
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function (registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

/* ══════════════════════════════════════════════════════════════
   PARTICLE CANVAS — INTERACTIVE HERO BACKGROUND
   ══════════════════════════════════════════════════════════════ */
(function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null };
    let animationId;

    function resize() {
        const hero = canvas.parentElement;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.color = ['#FFE141', '#14F1D9', '#FF6B9D', '#C77DFF'][Math.floor(Math.random() * 4)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x -= dx * force * 0.03;
                    this.y -= dy * force * 0.03;
                }
            }

            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function init() {
        resize();
        particles = [];
        const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        resize();
        init();
    });

    init();
    animate();
})();

/* ══════════════════════════════════════════════════════════════
   3D TILT EFFECT — CARDS & PROJECTS
   ══════════════════════════════════════════════════════════════ */
(function initTilt() {
    const cards = document.querySelectorAll('.project-card, .acard, .skill-cat, .edu-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
})();

/* ══════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED REVEAL ANIMATIONS
   ══════════════════════════════════════════════════════════════ */
(function initScrollReveal() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll(
        '.project-card, .acard, .skill-cat, .edu-card, .cc, .social-link, .btn, .chip, .hero-btns, .hero-chips'
    );

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add revealed styles
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════════════════════
   SMOOTH SCROLL ACTIVE NAV HIGHLIGHT
   ══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
})();

/* ══════════════════════════════════════════════════════════════
   MAGNETIC BUTTON EFFECT
   ══════════════════════════════════════════════════════════════ */
(function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .chatbot-toggle, .nav-pill');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.3s ease';
        });

        btn.addEventListener('mouseenter', () => {
            btn.style.transition = 'none';
        });
    });
})();

/* ══════════════════════════════════════════════════════════════
   PARALLAX STICKERS ON MOUSE MOVE
   ══════════════════════════════════════════════════════════════ */
(function initStickerParallax() {
    const hero = document.querySelector('.hero');
    const stickers = document.querySelectorAll('.sticker');
    if (!hero || !stickers.length) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        stickers.forEach((sticker, index) => {
            const speed = (index + 1) * 8;
            const dir = index % 2 === 0 ? 1 : -1;
            sticker.style.transform = `translate(${x * speed}px, ${y * speed}px) rotate(${dir * x * 5}deg)`;
        });
    });

    hero.addEventListener('mouseleave', () => {
        stickers.forEach(sticker => {
            sticker.style.transform = 'translate(0, 0) rotate(0deg)';
            sticker.style.transition = 'transform 0.5s ease';
        });
    });

    hero.addEventListener('mouseenter', () => {
        stickers.forEach(sticker => {
            sticker.style.transition = 'none';
        });
    });
})();
