const bot = {
    isOpen: false,

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.greet();
    },

    cacheDOM() {
        this.container = document.querySelector('.chat-window');
        this.messages = document.querySelector('.chat-messages');
        this.input = document.querySelector('.chat-input');
        this.orb = document.querySelector('.bot-orb');
    },

    bindEvents() {
        this.orb.addEventListener('click', () => this.toggleChat());
        document.querySelector('.close-chat').addEventListener('click', () => this.toggleChat());
        document.querySelector('.send-btn').addEventListener('click', () => this.handleSend());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    },

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.remove('hidden');
            this.input.focus();
        } else {
            this.container.classList.add('hidden');
        }
    },

    handleSend() {
        const text = this.input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.input.value = '';

        // Simulate thinking delay
        setTimeout(() => {
            const response = this.generateResponse(text.toLowerCase());
            this.addMessage(response, 'bot');
        }, 600);
    },

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
        div.innerHTML = text; // Allow innerHTML for links
        this.messages.appendChild(div);
        this.messages.scrollTop = this.messages.scrollHeight;
    },

    greet() {
        setTimeout(() => {
            this.addMessage("Hello! I'm your AI Portfolio Assistant. Ask me anything about skills, projects, or how to contact Ajay!", 'bot');
        }, 1000);
    },

    generateResponse(input) {
        // Simple Rule-Based Logic

        // 1. Navigation Commands
        if (input.includes('contact') || input.includes('email') || input.includes('hire')) {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            return "navigated to the Contact section for you! You can find email and social links there.";
        }
        if (input.includes('project') || input.includes('work') || input.includes('portfolio')) {
            document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
            return "Check out these selected projects! Click 'View Code' to see the magic.";
        }
        if (input.includes('skill') || input.includes('stack') || input.includes('tech')) {
            document.querySelector('#skills').scrollIntoView({ behavior: 'smooth' });
            return "Here is the tech stack. It includes Python, Java, Web Tech, and AI/ML tools.";
        }

        // 2. Q&A
        if (input.includes('who') || input.includes('name')) {
            return "I am the virtual assistant for Ajay (Kiran), a creative technologist building futuristic web experiences.";
        }
        if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
            return "Hello there! Ready to explore the future?";
        }
        if (input.includes('resume') || input.includes('cv')) {
            return "To get the full resume, please reach out via the Contact section!";
        }
        if (input.includes('github') || input.includes('repo')) {
            return "You can find code repositories in the 'Get In Touch' section or by clicking 'View Code' on projects.";
        }

        // Default
        return "I'm not sure about that, but I can take you to the <a href='#contact' style='color:var(--accent)'>Contact section</a> if you have specific questions!";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    bot.init();
});
