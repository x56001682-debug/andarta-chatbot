(function() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
        .chat-toggle-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: #000;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .chat-widget {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 320px;
            height: 400px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: sans-serif;
        }
        .chat-widget.hidden { display: none; }
        .chat-header { background: #000; color: #fff; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
        .chat-messages { flex: 1; padding: 10px; overflow-y: auto; font-size: 14px; }
        .chat-form { display: flex; border-top: 1px solid #ddd; }
        .chat-form input { flex: 1; border: none; padding: 10px; outline: none; }
        .chat-form button { background: #000; color: #fff; border: none; padding: 10px 15px; cursor: pointer; }
        .message.bot { background: #f1f1f1; padding: 8px; border-radius: 6px; margin-bottom: 8px; }
        .message.user { background: #000; color: #fff; padding: 8px; border-radius: 6px; margin-bottom: 8px; text-align: right; }
    `;
    document.head.appendChild(style);

    // Inject HTML structure
    const container = document.createElement('div');
    container.innerHTML = `
        <button id="chatToggle" class="chat-toggle-btn">💬</button>
        <div id="chat-widget" class="chat-widget hidden">
            <div class="chat-header">
                <h3>Support Chat</h3>
                <button id="close-chat" style="background:none; border:none; color:#fff; font-size:18px; cursor:pointer;">&times;</button>
            </div>
            <div id="chat-messages" class="chat-messages">
                <div class="message bot">Yo! How can I help you today?</div>
            </div>
            <form id="chat-form" class="chat-form">
                <input type="text" id="user-input" placeholder="Type a message..." autocomplete="off">
                <button type="submit">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(container);

    // Add interactivity logic
    const toggleBtn = document.getElementById('chatToggle');
    const closeBtn = document.getElementById('close-chat');
    const widget = document.getElementById('chat-widget');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');

    toggleBtn.addEventListener('click', () => widget.classList.toggle('hidden'));
    closeBtn.addEventListener('click', () => widget.classList.add('hidden'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        messages.innerHTML += `<div class="message user">${text}</div>`;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        try {
            const res = await fetch('https://andarta-chatbot.onrender.com/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
            });
            const data = await res.json();
            messages.innerHTML += `<div class="message bot">${data.reply}</div>`;
            messages.scrollTop = messages.scrollHeight;
        } catch (err) {
            messages.innerHTML += `<div class="message bot">Error connecting to chat.</div>`;
        }
    });
})();