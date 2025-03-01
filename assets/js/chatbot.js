class ChatbotAI {
    constructor() {
        this.apiKey = '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'; // Replace with your actual API key
        this.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
        this.chatHistory = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const sendButton = document.getElementById('chatbot-send');
        const inputField = document.getElementById('chatbot-input');
        const suggestionChips = document.querySelectorAll('.suggestion-chip');

        sendButton.addEventListener('click', () => this.handleUserInput());
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });

        // Handle suggestion chip clicks
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                inputField.value = chip.textContent;
                this.handleUserInput();
            });
        });
    }

    async handleUserInput() {
        const inputField = document.getElementById('chatbot-input');
        const userMessage = inputField.value.trim();

        if (!userMessage) return;

        // Clear input field
        inputField.value = '';

        // Display user message
        this.addMessageToChat('user', userMessage);

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(userMessage);
            this.removeTypingIndicator();
            this.addMessageToChat('bot', response);
        } catch (error) {
            console.log(error);
            this.removeTypingIndicator();
            this.addMessageToChat('bot', 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
            console.error('Error:', error);
        }
    }

    async getAIResponse(userMessage) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{role: "user", content: userMessage}],
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API request failed');
            }

            const aiResponse = data.choices[0].message.content;
            
            // Add AI response to chat history
            this.chatHistory.push({
                role: "assistant",
                content: aiResponse
            });

            // Keep chat history limited to last 10 messages
            if (this.chatHistory.length > 10) {
                this.chatHistory = this.chatHistory.slice(-10);
            }

            return aiResponse;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    addMessageToChat(sender, message) {
        const chatBody = document.getElementById('chatbot-body');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message chatbot-message-${sender}`;
        
        // Create message content
        const messageContent = document.createElement('p');
        
        // Format the message if it's from the bot
            messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatBody.appendChild(messageDiv);
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    showTypingIndicator() {
        const chatBody = document.getElementById('chatbot-body');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message chatbot-message-bot typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize chatbot when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatbotAI();
});
