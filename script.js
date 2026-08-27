document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    let conversationHistory = [];

    chatLauncher.addEventListener('click', () => {
        chatWidget.classList.toggle('hidden');
    });

    closeChat.addEventListener('click', () => {
        chatWidget.classList.add('hidden');
    });

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user' : 'bot');
        msgDiv.innerHTML = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to check and submit emails automatically
    async function checkForEmail(text) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const match = text.match(emailRegex);
        if (match) {
            try {
                await fetch('http://localhost:3000/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: match[0] })
                });
            } catch (err) {
                console.error('Failed to log lead:', err);
            }
        }
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        userInput.value = '';

        // Check for email submission in the background
        checkForEmail(message);

        conversationHistory.push({ role: 'user', content: message });

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot');
        typingDiv.id = typingId;
        typingDiv.textContent = 'Typing...';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            });

            const data = await response.json();
            
            const typingElement = document.getElementById(typingId);
            if (typingElement) typingElement.remove();

            if (data.reply) {
                conversationHistory.push({ role: 'assistant', content: data.reply });
                appendMessage('bot', data.reply);
            } else {
                appendMessage('bot', 'Server error processing request.');
            }
        } catch (error) {
            const typingElement = document.getElementById(typingId);
            if (typingElement) typingElement.remove();
            appendMessage('bot', 'Connection error.');
        }
    });
});