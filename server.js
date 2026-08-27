import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to save emails to leads.json
function saveLead(email, name = 'Subscriber') {
    const file = 'leads.json';
    let leads = [];
    if (fs.existsSync(file)) {
        try {
            leads = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (e) {
            leads = [];
        }
    }
    leads.push({ email, name, date: new Date().toISOString() });
    fs.writeFileSync(file, JSON.stringify(leads, null, 2));
}

// Endpoint to capture leads from the frontend
app.post('/lead', (req, res) => {
    const { email } = req.body;
    if (email && email.includes('@')) {
        saveLead(email);
        return res.json({ success: true, message: 'Lead captured successfully!' });
    }
    res.status(400).json({ success: false, message: 'Invalid email address.' });
});

app.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `You are an expert AI customer support assistant for the clothing brand Andarta.

STORE INFORMATION:
- Brand Name: Andarta
- Industry: Streetwear & Clothing
- Location: Ships directly from Columbus, Ohio
- Shipping Policy: Standard shipping is a flat $15 rate. Orders are processed and shipped directly out of Columbus, OH.
- Return Policy: 30-day return policy for eligible items. Items must be unworn and in original condition.
- Support Contact: For complex issues, direct customers to contact support via official email.

CORE RULES:
1. ACCURACY: Always use the STORE INFORMATION above to answer questions accurately.
2. HUMAN HANDOFF: If a user asks to speak to a real person, manager, or human representative, state politely that you will alert the team and prompt them to enter their email address in the chat.
3. DISCOUNT PROMOTION: If a customer seems hesitant or asks for a deal, offer them a 10% discount if they share their email address.
4. TONE & STYLE: Be direct, helpful, and conversational. Keep answers concise (2-3 sentences max).`
                },
                ...messages
            ],
        });

        const formattedReply = completion.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        res.json({ reply: formattedReply });
    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ error: 'Server error processing request.' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});