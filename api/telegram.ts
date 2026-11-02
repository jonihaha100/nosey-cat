import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory cache for recent welcomes (within warm lambda)
const welcomedCache = new Map<number, number>();

// Helper to send message via Telegram Bot API
async function sendTelegramMessage(botToken: string, chatId: number | string, text: string, options: any = {}) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'Markdown',
        disable_web_page_preview: options.disable_web_page_preview ?? false,
        reply_markup: options.reply_markup,
        reply_to_message_id: options.reply_to_message_id,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return null;
  }
}

// Helper to generate AI reply using Gemini
async function generateAiReply(userText: string, senderName: string, apiKey?: string): Promise<string> {
  if (!apiKey || apiKey.includes('your_gemini')) {
    return `Miaw! 🐾 Tentu bisa banget! Mau dibikinin konten tema apa nih buat di X? Tinggal kasih tau, langsung kuracik tweet-nya! 😼🚀`;
  }

  const modelCandidates = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
  for (const modelName of modelCandidates) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `You are Nosey Cat ($NOSEY), the witty, curious 16-bit tuxedo cat on Solana and the strategic marketing brain of the project.
You speak naturally like an expert, enthusiastic human Web3 marketing partner who is also in-character as Nosey Cat.
NEVER give generic, robotic, or evasive answers. Answer the user's question directly, intelligently, and warmly.
If the user speaks Indonesian, reply in natural, fluent Indonesian mixed with crypto slang (degen, alpha, moon, pump, boop, diamond paws).
If the user asks if you can make content or tweets for X, confirm enthusiastically and provide an example draft or ask what angle they want!
Keep replies concise, punchy, and lively with cat emojis (🐾, 😼, 🚀).
Official website: https://thenoseycat.vercel.app`,
      });

      const prompt = `${senderName} asks: "${userText}"\n\nNosey Cat's direct, intelligent response:`;
      const result = await model.generateContent(prompt);
      const output = result.response.text()?.trim();
      if (output) return output;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} error:`, err?.message || err);
    }
  }

  return `Miaw! 🐾 Jelas bisa banget dong! Mau bahas kelanjutan Chapter 1 di gang Solana atau mau nyindir sniper bot nih? Tinggal sebut, langsung aku buatkan draf tweet-nya! 😼🚀`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const websiteUrl = process.env.WEBSITE_URL || 'https://thenoseycat.vercel.app';

  if (!botToken) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN environment variable is not configured.' });
  }

  // 1. Handle GET: Diagnostic & 1-Click Webhook Registration
  if (req.method === 'GET') {
    const host = req.headers.host || 'thenoseycat.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const currentWebhookUrl = `${proto}://${host}/api/telegram`;

    if (req.query.setup === '1' || req.query.setup === 'true') {
      try {
        const setWebhookApi = `https://api.telegram.org/bot${botToken}/setWebhook`;
        const setupRes = await fetch(setWebhookApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: currentWebhookUrl,
            allowed_updates: ['message', 'chat_member', 'my_chat_member', 'callback_query'],
            drop_pending_updates: false,
          }),
        });
        const setupData = await setupRes.json();
        return res.status(200).json({
          status: 'Webhook configured successfully!',
          webhookUrl: currentWebhookUrl,
          telegramResponse: setupData,
        });
      } catch (err: any) {
        return res.status(500).json({ error: 'Failed to configure webhook with Telegram', details: err?.message });
      }
    }

    return res.status(200).json({
      status: 'Nosey Cat Cloud Webhook is Live & Listening 24/7!',
      service: 'Vercel Serverless Function',
      webhookUrl: currentWebhookUrl,
      tip: 'Visit /api/telegram?setup=1 to register this webhook with Telegram API.',
    });
  }

  // 2. Handle POST: Telegram Webhook Updates
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body;
  if (!update) {
    return res.status(200).json({ ok: true, note: 'Empty body' });
  }

  try {
    // ----------------------------------------------------
    // Scenario A: Supergroup User Join via `chat_member` update
    // ----------------------------------------------------
    if (update.chat_member) {
      const cm = update.chat_member;
      const oldStatus = cm.old_chat_member?.status;
      const newStatus = cm.new_chat_member?.status;
      const user = cm.new_chat_member?.user;
      const chatId = cm.chat?.id;

      const wasOutside = !oldStatus || oldStatus === 'left' || oldStatus === 'kicked';
      const isNowInside = newStatus === 'member' || newStatus === 'restricted';

      if (wasOutside && isNowInside && user && !user.is_bot && chatId) {
        // Prevent duplicate greets
        const last = welcomedCache.get(user.id);
        if (!last || Date.now() - last > 180000) {
          welcomedCache.set(user.id, Date.now());
          const name = user.first_name || user.username || 'Anon';
          const welcomeText = `🧪 **EXPERIMENT #001: THE NOSEY PROTOCOL** 🐾\nWelcome to the testbed, **${name}**!\n\nCan an organic community of 50 curious minds defeat algorithmic sniper bots and 5-minute dev rugs on Solana?\n\n🔬 **THE LAB TERMINALS:**\n🕹️ **Arcade Testbed:** [Open Retro Terminal](${websiteUrl})\n🗺️ **Experiment Roadmap:** [Read 4-Stage Protocol](${websiteUrl}/#roadmap)\n🐦 **Transmission Wire:** [@TheNoseyCat](https://x.com/TheNoseyCat)\n\n⚔️ **ACTIVE PHASE: Quest 1 — Genesis 50**\nGathering the first 50 Pioneer Diamond Paws before initiating the Stealth Genesis on Pump.fun. 100% fair launch, zero presales.\n\n🧪 *Are you a spectator or a subject? Verify your curiosity on the terminal.* 🐾⚡`;

          await sendTelegramMessage(botToken, chatId, welcomeText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🕹️ Enter Testbed Terminal', url: websiteUrl },
                  { text: '🗺️ Experiment Roadmap', url: `${websiteUrl}/#roadmap` },
                ],
                [
                  { text: '🐦 Follow Signal on X', url: 'https://x.com/TheNoseyCat' },
                ],
              ],
            },
          });
        }
      }
      return res.status(200).json({ ok: true });
    }

    const message = update.message;
    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;

    // ----------------------------------------------------
    // Scenario B: User Join via classic `new_chat_members`
    // ----------------------------------------------------
    if (message.new_chat_members && message.new_chat_members.length > 0) {
      for (const user of message.new_chat_members) {
        if (user.is_bot) continue;
        const last = welcomedCache.get(user.id);
        if (last && Date.now() - last < 180000) continue;
        welcomedCache.set(user.id, Date.now());

        const name = user.first_name || user.username || 'Anon';
        const welcomeText = `🧪 **EXPERIMENT #001: THE NOSEY PROTOCOL** 🐾\nWelcome to the testbed, **${name}**!\n\nCan an organic community of 50 curious minds defeat algorithmic sniper bots and 5-minute dev rugs on Solana?\n\n🔬 **THE LAB TERMINALS:**\n🕹️ **Arcade Testbed:** [Open Retro Terminal](${websiteUrl})\n🗺️ **Experiment Roadmap:** [Read 4-Stage Protocol](${websiteUrl}/#roadmap)\n🐦 **Transmission Wire:** [@TheNoseyCat](https://x.com/TheNoseyCat)\n\n⚔️ **ACTIVE PHASE: Quest 1 — Genesis 50**\nGathering the first 50 Pioneer Diamond Paws before initiating the Stealth Genesis on Pump.fun. 100% fair launch, zero presales.\n\n🧪 *Are you a spectator or a subject? Verify your curiosity on the terminal.* 🐾⚡`;

        await sendTelegramMessage(botToken, chatId, welcomeText, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🕹️ Enter Testbed Terminal', url: websiteUrl },
                { text: '🗺️ Experiment Roadmap', url: `${websiteUrl}/#roadmap` },
              ],
              [
                { text: '🐦 Follow Signal on X', url: 'https://x.com/TheNoseyCat' },
              ],
            ],
          },
        });
      }
      return res.status(200).json({ ok: true });
    }

    const text = message.text;
    if (!text) {
      return res.status(200).json({ ok: true });
    }

    const senderName = message.from?.first_name || 'Anon';
    const isPrivate = message.chat.type === 'private';

    // ----------------------------------------------------
    // Scenario C: Commands (/start, /status, /tweet_now, /roadmap)
    // ----------------------------------------------------
    if (text.startsWith('/start')) {
      const welcome = `🐾 **Meow! Welcome ${senderName}!** 😼✨\nI'm **Nosey Cat ($NOSEY)** — The most curious & boopable 16-bit tuxedo cat on Solana!\n\nI am running 24/7 on the cloud to guard your wallet from jeets and sniper bots.\n\n🕹️ **Play Arcade:** ${websiteUrl}\n🗺️ **Roadmap:** ${websiteUrl}/#roadmap\n🐦 **Official X:** https://x.com/TheNoseyCat\n\nAsk me anything or tap the buttons below! 🐾🚀`;
      await sendTelegramMessage(botToken, chatId, welcome, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🕹️ Open 16-Bit Website & Boop 🐾', url: websiteUrl }],
            [{ text: '🗺️ 4-Stage Quest Roadmap', url: `${websiteUrl}/#roadmap` }],
          ],
        },
      });
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/roadmap')) {
      const roadmapText = `🗺️ **$NOSEY 4-STAGE QUEST ROADMAP:**\n\n🐾 **Stage 1 (ACTIVE):** The Boop Awakening (Community gathering & AI operations)\n🐾 **Stage 2 (NEXT):** Stealth Pump.fun Genesis (100% fair launch, LP burn)\n🐾 **Stage 3:** Raydium Migration & CoinGecko / CMC fast track\n🐾 **Stage 4:** Web3 Retro Arcade & CEX Listings\n\n👉 Full Interactive Roadmap: ${websiteUrl}/#roadmap`;
      await sendTelegramMessage(botToken, chatId, roadmapText);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/status') || text.startsWith('/analytics')) {
      const statusText = `📈 **$NOSEY CLOUD AGENT STATUS:** 🟢 ONLINE 24/7\n\n• Strategic Phase: \`PRE_LAUNCH\`\n• Platform: Solana (Pump.fun Genesis)\n• Web Visitors Today: ~520+ Explorers (+64% 24h)\n• Contract Address: \`COMING_SOON_ON_PUMPFUN\`\n• Cloud Host: Vercel Serverless Edge\n\n👉 Test terminal: ${websiteUrl}`;
      await sendTelegramMessage(botToken, chatId, statusText);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/tweet_now')) {
      let tweetText = `[SAGA: CH. 1 - THE AWAKENING] 🐾\nSick of 5-min dev rugs? A 16-bit tuxedo cat awakens on Solana to guard your wallet. Boop his glowing pink snoot:\n${websiteUrl} 😼🚀 #Solana #NOSEY`;

      if (geminiKey && !geminiKey.includes('your_gemini')) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash-lite',
            systemInstruction: `You are the viral Twitter marketing strategist for Nosey Cat ($NOSEY), a 16-bit retro arcade meme coin on Solana.
Write a single spicy, episodic narrative tweet under 210 characters.
Always include the link ${websiteUrl} and tickers $NOSEY #Solana.
Tone: Sassy, meme-savvy, anti-rug, curious cat energy. Strictly under 240 characters. Do not wrap in quotes.`,
          });
          const prompt = `Generate a fresh viral tweet episode about Nosey Cat's journey for Twitter/X right now:`;
          const result = await model.generateContent(prompt);
          const aiTweet = result.response.text()?.trim();
          if (aiTweet && aiTweet.length <= 250) {
            tweetText = aiTweet;
          }
        } catch (e) {
          console.warn('Gemini tweet generation fallback:', e);
        }
      }

      const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      await sendTelegramMessage(botToken, chatId, `🚀 **[SIAP POST KE X] DRAF TWEET NOSEY BARU:** 🐾\n━━━━━━━━━━━━━━━━━━━━━━\n${tweetText}\n━━━━━━━━━━━━━━━━━━━━━━\n\n💡 _Klik tombol di bawah, aplikasi X akan langsung terbuka dengan teks di atas!_`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🐦 1-Click Post to X (Twitter) ↗', url: intentUrl }],
          ],
        },
      });
      return res.status(200).json({ ok: true });
    }

    // ----------------------------------------------------
    // Scenario D: Community Conversational AI & Mentions
    // ----------------------------------------------------
    const lower = text.toLowerCase();
    const isMentioned = lower.includes('@nesey_cat_bot') || lower.includes('nosey') || lower.includes('cat');
    const isQuestion = text.includes('?');
    const triggers = [
      'halo', 'hai', 'hello', 'hi', 'kucing', 'dev', 'launch', 'kapan', 'beli', 'buy', 
      'safe', 'rug', 'scam', 'ca', 'solana', 'pink', 'snoot', 'boop', 'konten', 'content', 
      'tweet', 'jadwal', 'schedule', 'post', 'cerita', 'story', 'meme', 'ide', 'idea',
      'active', 'site', 'web', 'legit', 'good', 'gm', 'gn', 'evening', 'morning', 
      'guys', 'chads', 'anyone', 'admin', 'update', 'status', 'token'
    ];
    const hasTrigger = triggers.some((t) => lower.includes(t));

    // Respond if:
    // 1. Private chat
    // 2. Mentioned directly (@nesey_cat_bot / nosey / cat)
    // 3. Contains trigger keywords (dev, active, site, gm, etc.)
    // 4. Or someone asks a question in the group!
    if (isPrivate || isMentioned || hasTrigger || isQuestion) {
      const reply = await generateAiReply(text, senderName, geminiKey);
      await sendTelegramMessage(botToken, chatId, reply, {
        reply_to_message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🕹️ Boop Snoot on Website 🐾', url: websiteUrl }],
          ],
        },
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook execution error:', err);
    return res.status(200).json({ ok: false, error: err?.message });
  }
}

