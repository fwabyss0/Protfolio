import { detectIntent, executeTool } from './intent.js';
import { ChatUI } from './ui.js';
import { CONFIG } from './config.js';

console.log('[Chatbot] Loading AbyssChatbot module...');

try {
    class AbyssChatbot {
        constructor() {
            console.log('[Chatbot] Creating AbyssChatbot instance...');
            this.ui = new ChatUI();
            console.log('[Chatbot] ChatUI created, toggle element:', this.ui.toggle);
            this.setupEventListeners();
            this.setupAudio();
            console.log('[Chatbot] AbyssChatbot initialized successfully');
        }

        setupEventListeners() {
            document.addEventListener('chatbot-message', async (e) => {
                console.log('[Chatbot] chatbot-message event received:', e.detail?.message);
                try {
                    const { message, history, sessionId } = e.detail;
                    await this.processMessage(message, history, sessionId);
                } catch (error) {
                    console.error('[Chatbot] Error processing message:', error);
                    this.ui.removeTypingIndicator();
                }
            });
        }

        async processMessage(message, history, sessionId) {
            this.ui.history = history;
            
            const intent = detectIntent(message);
            const toolResult = await executeTool(intent, message);
            
            let response;
            if (toolResult?.result) {
                response = toolResult.result;
            } else if (toolResult?.error) {
                response = `I'm having trouble with that right now. ${toolResult.error}. But I can still help with other questions!`;
            } else {
                response = this.getFallbackResponse(message);
            }

            this.ui.history.push({ role: 'user', content: message });
            this.ui.history.push({ role: 'assistant', content: response });
            if (this.ui.history.length > 16) {
                this.ui.history = this.ui.history.slice(-16);
            }

            this.ui.removeTypingIndicator();
            this.ui.addStreamingMessage(response, 'bot');
            this.ui.playBotSound();
        }

        getFallbackResponse(message) {
            const msg = message.toLowerCase().trim();
            
            const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'howdy'];
            if (greetings.some(g => msg.includes(g))) {
                return "Hello! I'm Abyss, Alish's AI assistant. How can I help you today? Feel free to ask about his work, skills, or anything else!";
            }
            
            const thanks = ['thank', 'thanks', 'appreciate'];
            if (thanks.some(t => msg.includes(t))) {
                return "You're welcome! Is there anything else I can help you with?";
            }
            
            const bye = ['bye', 'goodbye', 'see you', 'later', 'take care'];
            if (bye.some(b => msg.includes(b))) {
                return "Goodbye! Have a great day. Come back anytime you want to chat!";
            }
            
            if (msg.includes('help') || msg.includes('what can you do') || msg.includes('features') || msg.includes('assist')) {
                return "I can help you with: \n- Info about Alish (age, location, education, skills, projects)\n- Calculations (math, BMI, unit conversions)\n- Weather updates\n- Marvel character info\n- Current time and date\n- Contact info\n\nJust ask me anything!";
            }

            return "I'm Abyss, Alish's AI assistant! I can help you learn about Alish, do calculations, check weather, look up Marvel characters, and more. What would you like to know?";
        }
    }

    const chatbot = new AbyssChatbot();
    export default chatbot;
    console.log('[Chatbot] Module exported successfully');
} catch (error) {
    console.error('[Chatbot] Failed to initialize:', error);
}

window.sendChatbotMessage = function() {
    const input = document.getElementById('chatbot-input-field');
    const event = new CustomEvent('chatbot-message', {
        detail: { 
            message: input ? input.value.trim() : '', 
            history: [], 
            sessionId: 'fallback-' + Date.now() 
        },
        bubbles: true,
    });
    document.dispatchEvent(event);
};
