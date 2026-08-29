(function () {
    // Prevent multiple injections
    if (document.getElementById('andarta-chatbot-root')) return;

// Create container
const container = document.createElement('div');
container.id = 'andarta-chatbot-root';
container.innerHTML = `
    <style>
        #andarta-chat-bubble {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #000;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 24px;
            z-index: 999999;
        }
        #andarta-chat-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 450px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999999;
            font-family: sans-serif;
        }
        #andarta-chat-header {
            background: #000;
            color: #fff;
            padding: 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #andarta-chat-close {
            background: none;
            border: none;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
        }
        #andarta-chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            font-size: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .andarta-message {
            padding: 10px;
            border-radius: 8px;
            max-width: 80%;
            line-height: 1.4;
        }
        .andarta-message.user {
            background: #f1f1f1;
            align-self: flex-end;
            color: #000;
        }
        .andarta-message.bot {
            background: #000;
            color: #fff;
            align-self: flex-start;
        }
        #andarta-chat-input-area {
            display: flex;
            border-top: 1px solid #ddd;
            padding: 10px;
            background: #fff;
        }
        #andarta-chat-input {
            flex: 1;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            outline: none;
            font-size: 14px;
        }
        #andarta-chat-send {
            background: #000;
            color: #fff;
            border: none;
            padding: 8px 15px;
            margin-left: 5px;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>

    <button id="andarta-chat-bubble">💬</button>
    <div id="andarta-chat-window">
        <div id="andarta-chat-header">
            <span>AI Support</span>
            <button id="andarta-chat-close">&times;</button>
        </div>
        <div id="andarta-chat-messages">
            <div class="andarta-message bot">Hello! How can I help you with our store today?</div>
        </div>
        <div id="andarta-chat-input-area">
            <input type="text" id="andarta-chat-input" placeholder="Type a message..." />
            <button id="andarta-chat-send">Send</button>
        </div>
    </div>
`;
document.body.appendChild(container);

const bubble = document.getElementById('andarta-chat-bubble');
const windowEl = document.getElementById('andarta-chat-window');
const closeBtn = document.getElementById('andarta-chat-close');
const sendBtn = document.getElementById('andarta-chat-send');
const inputEl = document.getElementById('andarta-chat-input');
const messagesEl = document.getElementById('andarta-chat-messages');

bubble.onclick = () => windowEl.style.display = windowEl.style.display === 'flex' ? 'none' : 'flex';
closeBtn.onclick = () => windowEl.style.display = 'none';

async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    messagesEl.innerHTML += `<div class="andarta-message user">${text}</div>`;
    inputEl.value = '';
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
        const res = await fetch('[https://andarta-chatbot.onrender.com/chat](https://andarta-chatbot.onrender.com/chat)', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
        });
        const data = await res.json();
        
        if (res.ok) {
            messagesEl.innerHTML += `<div class="andarta-message bot">${data.reply}</div>`;
        } else {
            messagesEl.innerHTML += `<div class="andarta-message bot">${data.error || 'Service unavailable.'}</div>`;
        }
    } catch (err) {
        messagesEl.innerHTML += `<div class="andarta-message bot">Error connecting to chat.</div>`;
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

sendBtn.onclick = handleSend;
inputEl.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };