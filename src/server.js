import 'dotenv/config';
import express from 'express';
import { handleSallaCallback } from './salla/oauth.js';
import { sallaWebhookHandler } from './salla/webhook.js';
import { adminPanelHandler } from './admin/panel.js';
import { startTelegramBot } from './telegram/bot.js';

const app = express();
app.use(express.json());
app.get('/', (req,res)=>res.send('Sakura Land V3 is running 🔥'));
app.get('/health', (req,res)=>res.json({ok:true}));
app.get('/callback', handleSallaCallback);
app.post('/webhook/salla', sallaWebhookHandler);
app.get('/admin', adminPanelHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async ()=>{ console.log(`Server running on port ${PORT}`); await startTelegramBot(); });
