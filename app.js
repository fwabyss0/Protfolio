// Global audio context for sound management
let globalAudioContext = null;

console.log('[App] app.js module loaded, readyState:', document.readyState);

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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    try {
        enableAudioOnInteraction();
        showLoadingScreen();

        setTimeout(() => {
            try {
                initializeNavigation();
            } catch (e) {
                console.error('initializeNavigation error:', e);
            }
            try {
                initializeAnimations();
            } catch (e) {
                console.error('initializeAnimations error:', e);
            }
            try {
                initializeSkillBars();
            } catch (e) {
                console.error('initializeSkillBars error:', e);
            }
            try {
                initializeScrollEffects();
            } catch (e) {
                console.error('initializeScrollEffects error:', e);
            }
            try {
                initializeMobileMenu();
            } catch (e) {
                console.error('initializeMobileMenu error:', e);
            }
            try {
                initializeWelcomePopup();
            } catch (e) {
                console.error('initializeWelcomePopup error:', e);
            }
            try {
                hideLoadingScreen();
            } catch (e) {
                console.error('hideLoadingScreen error:', e);
            }
        }, 3000);
    } catch (e) {
        console.error('init error:', e);
        hideLoadingScreen();
    }
}

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
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdditional);
} else {
    initAdditional();
}

function initAdditional() {
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
}

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

