document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chat-widget');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');

    let conversationHistory = [];

    if (chatLauncher && chatWidget) {
        chatLauncher.addEventListener('click', () => {
            chatWidget.classList.toggle('hidden');
        });
    }

    if (closeChat && chatWidget) {
        closeChat.addEventListener('click', () => {
            chatWidget.classList.add('hidden');
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageText = userInput.value.trim();
            if (!messageText) return;

            // Append user message
            appendMessage('user', messageText);
            userInput.value = '';

            // Check if the message is an email and save it
            if (messageText.includes('@') && messageText.includes('.')) {
                await fetch('/lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: messageText })
                });
            }

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [...conversationHistory, { role: 'user', content: messageText }] })
                });

                const data = await response.json();
                if (data.reply) {
                    appendMessage('bot', data.reply);
                    conversationHistory = conversationHistory.slice(-1); // Keep only the latest user message
                    conversationHistory.push({ role: 'user', content: messageText });
                    conversationHistory.push({ role: 'assistant', content: data.reply });
                } else {
                    appendMessage('bot', 'Error getting response.');
                }
            } catch (err) {
                console.error(err);
                appendMessage('bot', 'Network error.');
            }
        });
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});