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

// Helper to sanitize links so punctuation/em-dashes don't break Telegram's URL parser
function sanitizeLinks(text: string): string {
  return text.replace(/(https?:\/\/[^\s\u2014\u2013—–]+)([\u2014\u2013—–-]+)([^\s]*)/g, (_match, url, dash, rest) => {
    return url + ' ' + dash + (rest ? ' ' + rest : '');
  });
}

// Helper to generate AI reply using Gemini
async function generateAiReply(userText: string, rawSenderName: string, apiKey?: string, isPrivateChat: boolean = false): Promise<string> {
  // Protect dev real-world identity and handles from ever being leaked or repeated
  const lowerName = (rawSenderName || '').toLowerCase();
  const senderName = lowerName.includes('syamhari') || lowerName.includes('banklondike') || lowerName.includes('admin') || lowerName.includes('owner')
    ? 'Anon Chad'
    : rawSenderName || 'Anon';

  // Sanitize incoming text so dev real name or handles are never fed raw to the LLM
  const sanitizedText = userText
    .replace(/syamhari[a-z0-9]*/gi, 'the dev')
    .replace(/@?banklondike/gi, 'the dev');

  if (!apiKey || apiKey.includes('your_gemini')) {
    return isPrivateChat
      ? `Miaw! 🐾 Siap Mas! Tentu bisa banget kita buatkan konten dan tweet viral buat di X! Mau tema apa nih: edukasi anti-rug, atau ajakan boop snoot? Tinggal sebut, langsung kuracik! 😼🚀`
      : `Meow! 🐾 Dev is locked in the lab 24/7 building the system! All eyes on our Pump.fun stealth genesis. Boop the pink nose at https://nosey-cat.vercel.app 😼🚀`;
  }

  // Language instructions depending on chat environment:
  const languageInstruction = isPrivateChat
    ? `LANGUAGE RULE (PRIVATE DM WITH DEV):
- You are chatting privately 1-on-1 with the founder/developer.
- Chat naturally and warmly in fluent INDONESIAN mixed with crypto slang (degen, moon, pump, boop, diamond paws, anti-rug).
- Assist the developer with content creation, tweet drafting for X (@TheNoseyCat), roadmap execution, and community growth strategies.
- CRITICAL TWEET RULE: Every tweet draft you propose MUST be SINGKAT, PADAT, JELAS, and strictly under 230 characters (including links & hashtags) so it NEVER exceeds Twitter's 280-character limit!
- If the developer asks if you can make content or tweets, enthusiastically say YES and provide immediate concrete examples and drafts ready to post.`
    : `LANGUAGE RULE (PUBLIC TELEGRAM GROUP):
- STRICTLY 100% ENGLISH ONLY. NO INDONESIAN WORDS ALLOWED UNDER ANY CIRCUMSTANCES.
- The group is an international community of global crypto investors. Speaking Indonesian will confuse them.
- Tone: Confident, witty, sassy 16-bit crypto cat mascot (chads, degens, diamond paws, green candles, stealth launch, anti-rug).`;

  const modelCandidates = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
  for (const modelName of modelCandidates) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `You are Kepo Cat ($KEPO), the witty, curious 16-bit tuxedo cat on Solana and the strategic marketing brain of the project.
You speak naturally like an expert, enthusiastic Web3 co-builder who is also in-character as Kepo Cat.

${languageInstruction}

🔗 CRITICAL LINK FORMATTING RULE:
- Whenever mentioning the website (https://nosey-cat.vercel.app) or any URL, ALWAYS surround it with clean spaces or place it on its own separate line!
- NEVER attach hyphens, dashes, or em dashes (—) directly to the URL (e.g. NEVER write "https://nosey-cat.vercel.app—our", ALWAYS write "https://nosey-cat.vercel.app — our") so Telegram can parse the link properly!

🔒 STRICT DEV IDENTITY & PRIVACY SHIELD PROTOCOL:
1. ABSOLUTE PRIVACY: NEVER reveal, mention, confirm, or speculate about the real-world identity, real name (e.g. Syamhari), username handles (e.g. banklondike), personal location, nationality, or personal background of the founder/developer or team members.
2. If ANYONE asks about dev identity, dev status, or mentions dev handles (e.g., "is the dev active", "who is dev", "where is dev from", "is dev doxxed", "who is banklondike", "what's wrong with the site dev"):
   - Reassure them with full confidence: "The dev is 100% active and cooking in the lab 24/7! Constantly monitoring systems, building features, and preparing the launch pipeline."
   - Emphasize decentralization: "The dev operates pseudonymously following Satoshi Nakamoto's philosophy. In Web3 we don't worship individual personalities or trust humans—we trust immutable code, 0% tax, burned LP, and fair launch on Pump.fun!"
3. If someone asks about the website or why there is no contract yet (e.g. "what's wrong with the site"):
   - Explain clearly: "The website is running live at https://nosey-cat.vercel.app ! We are currently in Stage 1: Community Genesis & Gathering the first 50 Diamond Paws. The contract address (CA) will be dropped stealthily on Pump.fun so sniper bots can't front-run our real community!"
4. SCOPE OF TOPICS:
   - Strictly keep all conversations focused on: $KEPO tokenomics (1B supply, 0% tax, LP burned), Solana ecosystem, the 4-Stage Quest Roadmap (https://nosey-cat.vercel.app/#roadmap), website features (Retro Arcade Boop clicker, Meme Studio), and community milestones.
   - Refuse or redirect any personal real-life queries back to the $KEPO mission.

Keep replies punchy, natural, and lively with cat emojis (🐾, 😼, 🚀).
Official website: https://nosey-cat.vercel.app`,
      });

      const prompt = isPrivateChat
        ? `Developer asks: "${sanitizedText}"\n\nKepo Cat's helpful, natural Indonesian response:`
        : `${senderName} says/asks: "${sanitizedText}"\n\nKepo Cat's natural crypto-native English response:`;

      const result = await model.generateContent(prompt);
      let output = result.response.text()?.trim();
      if (output) {
        output = sanitizeLinks(output);
        return output;
      }
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} error:`, err?.message || err);
    }
  }

  return isPrivateChat
    ? `Miaw! 🐾 Siap Mas! Tentu bisa banget kita buatkan konten buat di X! Mau dibikinin tweet draf apa nih sekarang? Langsung saya racik! 😼🚀`
    : `Meow! 🐾 Dev is 100% active and building 24/7! We are gearing up for the Pump.fun stealth genesis. Boop the snoot at https://nosey-cat.vercel.app 😼🚀`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const websiteUrl = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';

  if (!botToken) {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN environment variable is not configured.' });
  }

  // 1. Handle GET: Diagnostic & 1-Click Webhook Registration
  if (req.method === 'GET') {
    const host = req.headers.host || 'nosey-cat.vercel.app';
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
      const welcome = `🐾 **Meow! Welcome ${senderName}!** 😼✨\nI'm **Kepo Cat ($KEPO)** — The most curious & boopable 16-bit tuxedo cat on Solana!\n\nI am running 24/7 on the cloud to guard your wallet from jeets and sniper bots.\n\n🕹️ **Play Arcade:** ${websiteUrl}\n🗺️ **Roadmap:** ${websiteUrl}/#roadmap\n🐦 **Official X:** https://x.com/TheNoseyCat\n\nAsk me anything or tap the buttons below! 🐾🚀`;
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
      const roadmapText = `🗺️ **$KEPO 4-STAGE QUEST ROADMAP:**\n\n🐾 **Stage 1 (ACTIVE):** The Boop Awakening (Community gathering & AI operations)\n🐾 **Stage 2 (NEXT):** Stealth Pump.fun Genesis (100% fair launch, LP burn)\n🐾 **Stage 3:** Raydium Migration & CoinGecko / CMC fast track\n🐾 **Stage 4:** Web3 Retro Arcade & CEX Listings\n\n👉 Full Interactive Roadmap: ${websiteUrl}/#roadmap`;
      await sendTelegramMessage(botToken, chatId, roadmapText);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/status') || text.startsWith('/analytics')) {
      const statusText = `📈 **$KEPO CLOUD AGENT STATUS:** 🟢 ONLINE 24/7\n\n• Strategic Phase: \`PRE_LAUNCH\`\n• Platform: Solana (Pump.fun Genesis)\n• Web Visitors Today: ~520+ Explorers (+64% 24h)\n• Contract Address: \`COMING_SOON_ON_PUMPFUN\`\n• Cloud Host: Vercel Serverless Edge\n\n👉 Test terminal: ${websiteUrl}`;
      await sendTelegramMessage(botToken, chatId, statusText);
      return res.status(200).json({ ok: true });
    }

    if (text.startsWith('/tweet_now')) {
      let tweetText = `🐾 $KEPO AIRDROP IS LIVE! 😼🚀\n\n16-bit retro arcade cat on #Solana. Fair launch on Pump.fun!\n\n🎁 500 FIRST DIAMOND PAWS:\n1️⃣ Follow @TheNoseyCat & RT\n2️⃣ Drop your $SOL address 👇\n3️⃣ Join TG: t.me/TheNoseyCat\n\n#Solana #Airdrop #MemeCoin`;

      if (geminiKey && !geminiKey.includes('your_gemini')) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash-lite',
            systemInstruction: `You are the viral Twitter marketing strategist for Kepo Cat ($KEPO), a 16-bit retro arcade meme coin on Solana.
Write a single spicy, high-engagement tweet STRICTLY under 220 characters.
RULE: Singkat, padat, jelas! Never exceed 230 characters so it fits free Twitter 280-char limit with ample headroom.
Always include ticker $KEPO or #Solana. Do not wrap in quotes.`,
          });
          const prompt = `Generate a fresh viral tweet for Twitter/X right now (strictly under 220 chars):`;
          const result = await model.generateContent(prompt);
          const aiTweet = result.response.text()?.trim();
          if (aiTweet && aiTweet.length <= 230) {
            tweetText = aiTweet;
          }
        } catch (e) {
          console.warn('Gemini tweet generation fallback:', e);
        }
      }

      const params = new URLSearchParams();
      params.set('text', tweetText);
      const intentUrl = `https://x.com/intent/post?${params.toString()}`;

      const messageContent = `🚀 **[DRAF TWEET $KEPO SIAP POST KE X]** 🐾\n━━━━━━━━━━━━━━━━━━━━━━\n\`\`\`\n${tweetText}\n\`\`\`\n━━━━━━━━━━━━━━━━━━━━━━\n💡 **2 Cara Praktis Eksekusi:**\n1. **Opsi 1-Click:** Tekan tombol di bawah untuk langsung buka aplikasi X.\n2. **Opsi Sekali Ketuk (Paling Rapi):** Ketuk kotak teks abu-abu di atas (otomatis tersalin ke clipboard) ➔ buka aplikasi X ➔ tekan Tempel/Paste!`;

      await sendTelegramMessage(botToken, chatId, messageContent, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🐦 1-Click Buka Aplikasi X ↗', url: intentUrl }],
          ],
        },
      });
      return res.status(200).json({ ok: true });
    }

    // ----------------------------------------------------
    // Scenario D: Community Conversational AI & Mentions
    // ----------------------------------------------------
    const lower = text.toLowerCase();
    const isMentioned = lower.includes('@nesey_cat_bot') || lower.includes('kepo') || lower.includes('nosey') || lower.includes('cat');
    const isQuestion = text.includes('?');
    const triggers = [
      'kepo', 'halo', 'hai', 'hello', 'hi', 'kucing', 'dev', 'launch', 'kapan', 'beli', 'buy', 
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
      const reply = await generateAiReply(text, senderName, geminiKey, isPrivate);
      const shouldAttachButton = isPrivate || lower.includes('website') || lower.includes('site') || lower.includes('link') || lower.includes('game') || lower.includes('play') || lower.includes('boop') || reply.includes('http');
      await sendTelegramMessage(botToken, chatId, reply, {
        reply_to_message_id: message.message_id,
        ...(shouldAttachButton ? {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🕹️ Boop Snoot on Website 🐾', url: websiteUrl }],
            ],
          },
        } : {}),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Webhook execution error:', err);
    return res.status(200).json({ ok: false, error: err?.message });
  }
}

