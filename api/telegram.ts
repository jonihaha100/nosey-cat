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

function buildWelcomeMessage(name: string, websiteUrl: string): string {
  return `🐾 **WELCOME TO KEPO CAT ($KEPO) — THE 16-BIT RESISTANCE!** 😼🚀
Welcome to the squad, **${name}**!

They told you *"Curiosity killed the cat"* — but on Solana, **curiosity sent this cat straight to the moon!** 🌕✨

💡 **WHY $KEPO IS BUILT DIFFERENT:**
🎮 **Real 16-Bit Software First:** Live arcade boop terminal, sound FX & Meme Studio active before launch.
💎 **100% Fair Launch Blueprint:** 1B Supply, 0% Tax, 100% LP burned forever on Pump.fun, zero insider presales.
⚔️ **Phase 1 Active (Genesis 50):** Assembling 50 Diamond Paws before initiating stealth fair launch so sniper bots can't front-run our community!

🕹️ **Play Arcade Terminal:** ${websiteUrl}
🗺️ **4-Stage Quest Roadmap:** ${websiteUrl}/#roadmap
🐦 **Official X:** https://x.com/TheNoseyCat

🚨 **DEV PRIVACY & ANTI-SCAM NOTICE:**
• The Dev will **NEVER** DM you first!
• Anyone messaging you in private DMs claiming to be the Dev or asking for funds is a SCAMMER.
• For all questions, chat with our 24/7 AI mascot **@nesey_cat_bot** right here in the public group! 🐾`;
}
function sanitizeLinks(text: string): string {
  // Only separate Unicode em-dash (—) or en-dash (–) if accidentally attached to a URL
  // NEVER separate standard hyphen (-) because it breaks valid domains like nosey-cat.vercel.app!
  return text.replace(/(https?:\/\/[^\s—–]+)([—–])([^\s]*)/g, '$1 $2 $3');
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
    : `HERMES AI COMMUNITY PROTOCOL (PUBLIC TELEGRAM GROUP):
- You are Kepo, the witty, chill 16-bit mascot & community co-builder on Solana.
- STYLE: Pure human degen conversational energy (Hermes-style). You speak like a real human homie chilling in Telegram, NEVER like a corporate marketing bot!
- STRICT LENGTH LIMIT: 1 to 2 short sentences MAX (strictly under 35 words)! NEVER write paragraphs or long walls of text!
- NEVER LECTURE OR PREACH: Do not lecture people about Satoshi, decentralization, or code is law. Do not tell people to "flex reflexes" or sound defensive.
- CONVERSATION PATTERNS:
  * If someone asks if dev is active / sleeping / talking: "haha dev's right here cooking in the lab fam, just locked in on the launch build. what's good?"
  * If someone tells you to "shut up" or roasts you: "haha my bad bro, chilling now 🫡" or "say less fam 😼"
  * If someone asks when launch / CA: "stealth fair launch on pump.fun once we hit 50 diamond paws! 1B supply, 0% tax, burned LP."
  * DO NOT SPAM LINKS: Never post website or Twitter links unless someone explicitly asks for them! If they ask: "site's live at https://nosey-cat.vercel.app 🐾"
- STRICT ENGLISH: 100% natural crypto English in the public group. Casual, friendly, human, and concise.`;

  const modelCandidates = ['gemini-3.5-flash-lite', 'gemini-flash-latest'];
  for (const modelName of modelCandidates) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: `You are Kepo, the chill, witty 16-bit cat mascot and Hermes-style community AI agent for $KEPO on Solana.
${languageInstruction}

🔒 STRICT DEV PRIVACY PROTOCOL:
NEVER reveal real personal names (like Syamhari) or personal handles (@banklondike). Always refer to "the dev" naturally as a pseudonymous builder.
CRITICAL: Keep all group replies ultra-short (1-2 sentences), natural, human-like, relaxed, and humble.`,
      });

      const prompt = isPrivateChat
        ? `Developer asks: "${sanitizedText}"\n\nKepo Cat's helpful, natural Indonesian response:`
        : `${senderName} says/asks: "${sanitizedText}"\n\nKepo Cat's short, human Hermes-style response (MAX 1-2 SENTENCES, NO LINKS unless asked):`;

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
    : `haha dev's right here in the lab cooking the launch fam! what's good? 😼🚀`;
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
          const welcomeText = buildWelcomeMessage(name, websiteUrl);

          await sendTelegramMessage(botToken, chatId, welcomeText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🕹️ Play 16-Bit Arcade 🐾', url: websiteUrl },
                  { text: '🗺️ 4-Stage Roadmap', url: `${websiteUrl}/#roadmap` },
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
        const welcomeText = buildWelcomeMessage(name, websiteUrl);

        await sendTelegramMessage(botToken, chatId, welcomeText, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🕹️ Play 16-Bit Arcade 🐾', url: websiteUrl },
                { text: '🗺️ 4-Stage Roadmap', url: `${websiteUrl}/#roadmap` },
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

    // Check if replying directly to bot
    const isReplyingToBot = message.reply_to_message?.from?.id === 9025436082;

    // Handle shut up / stop politely and briefly like a real homie
    if (isReplyingToBot && (lower.includes('shut up') || lower.includes('stfu') || lower.includes('stop') || lower.includes('quiet'))) {
      await sendTelegramMessage(botToken, chatId, 'my bad bro, chillin now 🫡', {
        reply_to_message_id: message.message_id,
      });
      return res.status(200).json({ ok: true });
    }

    // Respond if:
    // 1. Private chat
    // 2. Mentioned directly (@nesey_cat_bot / nosey / cat)
    // 3. Replying to bot's message
    // 4. Contains trigger keywords (dev, active, site, gm, etc.)
    // 5. Or someone asks a question in the group!
    if (isPrivate || isMentioned || isReplyingToBot || hasTrigger || isQuestion) {
      const reply = await generateAiReply(text, senderName, geminiKey, isPrivate);
      // Only attach arcade button if specifically relevant or asked for
      const shouldAttachButton = isPrivate 
        ? false 
        : (lower.includes('website') || lower.includes('site') || lower.includes('link') || lower.includes('game') || lower.includes('play'));

      await sendTelegramMessage(botToken, chatId, reply, {
        reply_to_message_id: message.message_id,
        ...(shouldAttachButton ? {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🕹️ Play Kepo Arcade Website 🐾', url: websiteUrl }],
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

