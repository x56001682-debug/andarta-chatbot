import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.static('.'));
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to get clean domain from headers
function getCleanDomain(req) {
    const origin = req.headers.origin || req.headers.referer || 'localhost:3000';
    return origin.replace(/https?:\/\//, '').split('/')[0];
}

// Secure /embed.js route with domain lock and trial/expiration check
app.get('/embed.js', (req, res) => {
    try {
        const cleanDomain = getCleanDomain(req);
        const storesData = JSON.parse(fs.readFileSync('./stores.json', 'utf8'));
        const store = storesData[cleanDomain];

        // If domain isn't registered, status is expired, or trial date has passed, block it
        if (!store || store.status === 'expired' || (store.expiresAt && new Date() > new Date(store.expiresAt))) {
            return res.send(`console.log("Ai Chatbot: Trial expired or unauthorized domain.");`);
        }

        // Serve the embed script if valid
        res.sendFile(path.resolve('./embed.js'));
    } catch (error) {
        console.error(error);
        res.status(500).send('console.log("Ai Chatbot: Server error loading widget.");');
    }
});

// Chat Route with active status validation
app.post('/chat', async (req, res) => {
  try {
    const cleanDomain = getCleanDomain(req);
    const storesData = JSON.parse(fs.readFileSync('./stores.json', 'utf8'));
    const store = storesData[cleanDomain] || storesData['localhost:3000'];

    if (!store || store.status === 'expired' || (store.expiresAt && new Date() > new Date(store.expiresAt))) {
        return res.status(403).json({ error: 'Trial expired or unauthorized domain.' });
    }

    const systemPrompt = `You are a helpful customer service chatbot for ${store.storeName}. 
    Products we sell: ${store.products}. 
    Store policies: ${store.policy}`;

    const { messages } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Lead Capture Route
app.post('/lead', (req, res) => {
  try {
    const { email } = req.body;
    const cleanDomain = getCleanDomain(req);
    
    const leadData = {
      email,
      store: cleanDomain,
      date: new Date().toISOString()
    };

    const leadFile = './leads.json';
    let leads = [];
    if (fs.existsSync(leadFile)) {
      leads = JSON.parse(fs.readFileSync(leadFile, 'utf8'));
    }
    
    leads.push(leadData);
    fs.writeFileSync(leadFile, JSON.stringify(leads, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));