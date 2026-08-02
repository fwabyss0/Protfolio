export class ChatUI {
    constructor() {
        console.log('[ChatUI] Initializing ChatUI...');
        this.chatbot = document.getElementById('chatbot');
        this.toggle = document.getElementById('chatbot-toggle');
        this.close = document.getElementById('chatbot-close');
        this.messages = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input-field');
        this.send = document.getElementById('chatbot-send');
        this.fullscreen = document.getElementById('chatbot-fullscreen');
        this.clear = document.getElementById('chatbot-clear');
        this.retry = document.getElementById('chatbot-retry');
        console.log('[ChatUI] Elements found:', {
            chatbot: !!this.chatbot,
            toggle: !!this.toggle,
            messages: !!this.messages,
            input: !!this.input,
            send: !!this.send
        });
        this.isOpen = false;
        this.isFullscreen = false;
        this.history = [];
        this.sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        this.isTyping = false;
        this.lastUserMessage = '';
        
        this.init();
    }

    init() {
        // Event listeners are handled by inline fallback in index.html
        // This module only provides methods for message rendering and chat state
        this.showWelcome();
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        if (this.chatbot) {
            this.chatbot.classList.add('active');
        }
        if (this.input) {
            this.input.focus();
        }
        this.scrollToBottom();
    }

    closeChat() {
        this.isOpen = false;
        if (this.chatbot) {
            this.chatbot.classList.remove('active');
        }
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        if (this.chatbot) {
            this.chatbot.classList.toggle('fullscreen', this.isFullscreen);
        }
    }

    showWelcome() {
        if (!this.messages) return;
        this.messages.innerHTML = '';
        
        const welcome = document.createElement('div');
        welcome.className = 'message bot-message';
        welcome.innerHTML = `
            <div class="message-avatar bot"><img src="a.png" class="avatar-image" alt="Abyss"></div>
            <div class="message-content">
                <p>Hi! I'm Abyss, Alish's AI assistant. How can I help you today?</p>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        this.messages.appendChild(welcome);
        this.addQuickActions();
    }

    addQuickActions() {
        if (!this.messages) return;
        const actions = document.createElement('div');
        actions.className = 'quick-actions';
        actions.innerHTML = `
            <h4>Quick Info:</h4>
            <div class="action-buttons">
                <button class="action-btn" data-action="about">About</button>
                <button class="action-btn" data-action="age">Age</button>
                <button class="action-btn" data-action="skills">Skills</button>
                <button class="action-btn" data-action="location">Location</button>
            </div>
        `;
        
        actions.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const messages = {
                    about: "Tell me about Alish",
                    age: "How old is Alish?",
                    skills: "What are Alish's skills?",
                    location: "Where is Alish from?"
                };
                if (messages[action]) {
                    if (this.input) {
                        this.input.value = messages[action];
                    }
                    this.sendMessage();
                }
                actions.remove();
            });
        });
        
        this.messages.appendChild(actions);
        this.scrollToBottom();
    }

    async sendMessage() {
        console.log('[ChatUI] sendMessage called');
        if (!this.input || this.isTyping) {
            console.log('[ChatUI] sendMessage blocked: input missing or typing');
            return;
        }
        const message = this.input.value.trim();
        if (!message) {
            console.log('[ChatUI] sendMessage blocked: empty message');
            return;
        }

        this.lastUserMessage = message;
        console.log('[ChatUI] Sending message:', message);
        
        try {
            this.addMessage(message, 'user');
            this.playUserSound();
            this.input.value = '';
            this.showTypingIndicator();
            this.playTypingSound();

            const event = new CustomEvent('chatbot-message', {
                detail: { message, history: this.history, sessionId: this.sessionId },
                bubbles: true,
            });
            document.dispatchEvent(event);
            console.log('[ChatUI] chatbot-message event dispatched');

            setTimeout(() => {
                if (this.isTyping) {
                    console.warn('[ChatUI] Timeout: removing typing indicator');
                    this.removeTypingIndicator();
                    this.addMessage("I'm having trouble responding right now. Please try again.", 'bot');
                    this.playBotSound();
                }
            }, 15000);
        } catch (error) {
            console.error('[ChatUI] Error in sendMessage:', error);
            this.removeTypingIndicator();
        }
    }

    addMessage(text, type) {
        console.log('[ChatUI] addMessage called:', text.substring(0, 30));
        if (!this.messages) {
            console.warn('[ChatUI] messages container not found');
            return;
        }
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-image';
        avatarImg.alt = type === 'user' ? 'User' : 'Abyss';
        avatarImg.src = type === 'user' ? 'user.png' : 'a.png';
        avatar.appendChild(avatarImg);

        const content = document.createElement('div');
        content.className = 'message-content';
        const p = document.createElement('p');
        p.innerHTML = text;
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        content.appendChild(p);
        content.appendChild(time);

        if (type === 'user') {
            msg.appendChild(content);
            msg.appendChild(avatar);
        } else {
            msg.appendChild(avatar);
            msg.appendChild(content);
        }

        this.messages.appendChild(msg);
        this.scrollToBottom();
    }

    addStreamingMessage(text, type) {
        if (!this.messages) return;
        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        const avatarImg = document.createElement('img');
        avatarImg.className = 'avatar-image';
        avatarImg.alt = type === 'user' ? 'User' : 'Abyss';
        avatarImg.src = type === 'user' ? 'user.png' : 'a.png';
        avatar.appendChild(avatarImg);

        const content = document.createElement('div');
        content.className = 'message-content';
        const p = document.createElement('p');
        p.innerHTML = '';
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        content.appendChild(p);
        content.appendChild(time);

        if (type === 'user') {
            msg.appendChild(content);
            msg.appendChild(avatar);
        } else {
            msg.appendChild(avatar);
            msg.appendChild(content);
        }

        this.messages.appendChild(msg);
        this.scrollToBottom();

        if (type === 'bot') {
            const words = text.split(' ');
            let currentText = '';
            let wIdx = 0;
            const typeWord = () => {
                if (wIdx < words.length) {
                    currentText += (wIdx === 0 ? '' : ' ') + words[wIdx];
                    p.innerHTML = this.parseMarkdown(currentText);
                    this.scrollToBottom();
                    wIdx++;
                    setTimeout(typeWord, 20);
                }
            };
            setTimeout(typeWord, 20);
        }
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (!this.messages) return;
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'message bot-message';
        typing.innerHTML = `
            <div class="message-avatar bot"><img src="a.png" class="avatar-image" alt="Abyss"></div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        this.messages.appendChild(typing);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        this.isTyping = false;
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    parseMarkdown(text) {
        if (!text) return '';
        let html = text;
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    playUserSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        } catch (e) {
            console.log('Sound error:', e);
        }
    }

    playBotSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.linearRampToValueAtTime(450, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.25);
        } catch (e) {
            console.log('Sound error:', e);
        }
    }

    playTypingSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Sound error:', e);
        }
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            if (this.messages) {
                this.messages.scrollTop = this.messages.scrollHeight;
            }
        });
    }

    clearChat() {
        this.history = [];
        this.sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
        this.showWelcome();
    }

    retryLast() {
        if (this.lastUserMessage) {
            if (this.input) {
                this.input.value = this.lastUserMessage;
            }
            this.sendMessage();
        }
    }
}
