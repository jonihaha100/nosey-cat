/**
 * Executive Business Monitor via Telegram Admin Commands
 * Enables the creator to steer the AI Agent's brain and monitor project health in real-time.
 */

import TelegramBot from 'node-telegram-bot-api';
import { brainState, setBusinessPhase, setActiveDirective, BusinessPhase } from './brainConfig.js';
import { fetchTokenMarketMetrics } from './dexScreenerClient.js';
import { generateDailyTweets, generateAlphaThread, generateRaidTrigger, postTweetToX } from './xContentPlanner.js';

/**
 * Checks if the message sender is the authorized project admin
 */
export function isAdminUser(msg: TelegramBot.Message): boolean {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminId || adminId.includes('your_personal')) {
    // If admin ID is not yet explicitly restricted in .env, allow first user or log warning
    return true;
  }
  return msg.from?.id?.toString() === adminId.trim();
}

/**
 * Registers all executive admin command handlers
 */
export function registerAdminCommands(bot: TelegramBot): void {
  // 0. /start command (Welcome message for everyone)
  bot.onText(/^\/start/i, async (msg) => {
    const senderName = msg.from?.first_name || 'Fren';
    const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';
    const welcome = `
🐾 **Meoong! Halo ${senderName}!** 😼✨
Gue **Kucing Kepo ($NOSEY / $KEPO)** — Kucing tuxedo 16-bit paling tengil & boopable di blockchain Solana!

Gue di sini buat nemenin lu 24/7, mantau wallet dari jeet & rugger, dan bikin komunitas makin rame! 🚀

🎯 **Yang bisa lu lakuin bareng gue:**
• **Ngobrol Langsung:** Tanya apa aja soal koin, Solana, dev, atau sekadar curhat receh. Gue bakal jawab pakai AI Gemini!
• **Cek Status Bisnis:** Ketik \`/status\` untuk pantau metrik live & sentimen.
• **Ganti Fase Strategi (Admin):** Ketik \`/set_phase [PRE_LAUNCH|LIVE_LAUNCH|COMMUNITY_HOLD]\`.
• **Suntik Arahan Live (Admin):** Ketik \`/set_directive [arahan]\`.
• **Raid Komunitas:** Ketik \`/raid [target]\`.
• **Bikin Tweet Viral:** Ketik \`/tweet\`.
• **Main di Website:** Pencet hidung gue di [Nosey Cat Website](${website}) buat nabung *Total Nose Boops* dan cobain *Chaos Laser Eyes*! 👃⚡️

Coba sapa gue sekarang: ketik *"Halo cing, kapan launch?"* atau *"Dev aman gak nih?"* 🐾
    `.trim();

    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown', disable_web_page_preview: true });
  });

  // 1. /status command
  bot.onText(/^\/status/i, async (msg) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Akses ditolak. Perintah ini khusus Direktur/Admin Kucing Kepo.');
      return;
    }

    const uptimeSeconds = Math.floor((Date.now() - brainState.startTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    const metrics = await fetchTokenMarketMetrics();
    const totalSentiments = brainState.sentimentCounters.bullish + brainState.sentimentCounters.fud + brainState.sentimentCounters.neutral || 1;
    const bullishPct = Math.round((brainState.sentimentCounters.bullish / totalSentiments) * 100);
    const fudPct = Math.round((brainState.sentimentCounters.fud / totalSentiments) * 100);

    const report = `
📊 **EXECUTIVE BUSINESS MONITOR ($KEPO / $NOSEY)** 🐾
━━━━━━━━━━━━━━━━━━━━━━
⏱ **Agent Uptime:** ${hours} jam ${minutes} menit
🎯 **Fase Bisnis:** \`${brainState.currentPhase}\`
🧠 **Active Directive:**
"${brainState.activeDirective}"

💬 **Aktivitas Grup:**
• Pesan Diproses: ${brainState.totalMessagesProcessed}
• Balasan AI Dikirim: ${brainState.totalRepliesSent}
• Sentimen Komunitas:
  - 🟢 Bullish: ${brainState.sentimentCounters.bullish} (${bullishPct}%)
  - 🔴 FUD: ${brainState.sentimentCounters.fud} (${fudPct}%)
  - ⚪️ Netral: ${brainState.sentimentCounters.neutral}

📈 **Market Telemetri (DexScreener):**
• Harga: ${metrics.priceUsd}
• Perubahan 24h: ${metrics.priceChange24h}
• Volume 24h: ${metrics.volume24h}
• Market Cap: ${metrics.marketCapUsd}
• Likuiditas: ${metrics.liquidityUsd}

━━━━━━━━━━━━━━━━━━━━━━
💡 _Gunakan /set_phase atau /set_directive untuk mengubah haluan strategi secara instan._
    `.trim();

    bot.sendMessage(msg.chat.id, report, { parse_mode: 'Markdown' });
  });

  // 2. /set_phase [PRE_LAUNCH | LIVE_LAUNCH | COMMUNITY_HOLD]
  bot.onText(/^\/set_phase(?:\s+(.+))?/i, (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Akses ditolak.');
      return;
    }

    const requestedPhase = match?.[1]?.trim().toUpperCase();
    if (!requestedPhase || !Object.values(BusinessPhase).includes(requestedPhase as BusinessPhase)) {
      bot.sendMessage(
        msg.chat.id,
        `⚠️ Format salah! Pilihan fase yang valid:\n` +
        `• \`/set_phase PRE_LAUNCH\` (Fokus misteri & boop)\n` +
        `• \`/set_phase LIVE_LAUNCH\` (Fokus konversi & raid)\n` +
        `• \`/set_phase COMMUNITY_HOLD\` (Fokus retensi & meme)`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    setBusinessPhase(requestedPhase as BusinessPhase);
    bot.sendMessage(
      msg.chat.id,
      `✅ **SUKSES!** Fase bisnis Kucing Kepo berhasil diubah ke: \`${requestedPhase}\`.\n\n` +
      `🧠 Otak dan gaya bicara Agent di seluruh medsos telah menyesuaikan otomatis!\n` +
      `🎯 Arahan default baru: "${brainState.activeDirective}"`,
      { parse_mode: 'Markdown' }
    );
  });

  // 3. /set_directive [instruksi baru]
  bot.onText(/^\/set_directive(?:\s+(.+))?/i, (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Akses ditolak.');
      return;
    }

    const directive = match?.[1]?.trim();
    if (!directive) {
      bot.sendMessage(
        msg.chat.id,
        `⚠️ Masukkan arahan yang ingin disuntikkan!\nContoh:\n\`/set_directive Hari ini fokus ajak member lomba bikin meme di website untuk hadiah 1 SOL!\``,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    setActiveDirective(directive);
    bot.sendMessage(
      msg.chat.id,
      `✅ **DIRECTIVE TERSUNTIKKAN!**\n\nInstruksi sistem Kucing Kepo sekarang difokuskan ke:\n` +
      `👉 "${directive}"\n\n` +
      `AI Agent akan langsung menyisipkan arahan ini dalam setiap interaksi tanpa perlu restart server! 🚀`,
      { parse_mode: 'Markdown' }
    );
  });

  // 4. /raid [target]
  bot.onText(/^\/raid(?:\s+(.+))?/i, async (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Akses ditolak.');
      return;
    }

    const target = match?.[1]?.trim() || 'Akun Kripto Populer Solana / Pump.fun';
    const raidMsg = generateRaidTrigger(target);

    // Send preview to admin
    await bot.sendMessage(msg.chat.id, raidMsg, { parse_mode: 'Markdown' });

    // If target group ID is configured, optionally broadcast to community group
    const targetGroupId = process.env.TELEGRAM_GROUP_ID;
    if (targetGroupId && targetGroupId.startsWith('-')) {
      try {
        await bot.sendMessage(targetGroupId, raidMsg, { parse_mode: 'Markdown' });
        bot.sendMessage(msg.chat.id, `🚀 Peringatan Raid telah otomatis dibroadcast ke grup komunitas!`);
      } catch (err: any) {
        bot.sendMessage(msg.chat.id, `⚠️ Gagal broadcast ke grup (${err?.message}). Silakan copy-paste manual pesan di atas.`);
      }
    }
  });

  // 5. /tweet
  bot.onText(/^\/tweet/i, async (msg) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Akses ditolak.');
      return;
    }

    bot.sendMessage(msg.chat.id, '⏳ Menyiapkan draf cuitan viral untuk X (Twitter)...');
    const tweets = await generateDailyTweets(2);

    for (let i = 0; i < tweets.length; i++) {
      const tweetText = tweets[i];
      const reply = `
📝 **DRAF TWEET #${i + 1}:**
━━━━━━━━━━━━━━━━━━━━━━
${tweetText}
━━━━━━━━━━━━━━━━━━━━━━
Ketik \`/post_tweet ${i + 1}\` untuk auto-post ke akun X resmi, atau copy-paste langsung!
      `.trim();
      await bot.sendMessage(msg.chat.id, reply, { parse_mode: 'Markdown' });
    }
  });

  // 6. /help command
  bot.onText(/^\/help/i, (msg) => {
    const helpText = `
👑 **DAFTAR PERINTAH EKSEKUTIF DIREKTUR KUCING KEPO:**

• \`/status\` — Rangkuman kesehatan grup, sentimen pasar, metrik token, dan uptime.
• \`/set_phase [PHASE]\` — Ganti fase bisnis: \`PRE_LAUNCH\`, \`LIVE_LAUNCH\`, atau \`COMMUNITY_HOLD\`.
• \`/set_directive [teks]\` — Suntikkan instruksi kampanye spesifik ke otak AI secara *live*.
• \`/raid [target]\` — Buat pesan alarm Raid dan tembakkan ke grup Telegram komunitas.
• \`/tweet\` — Hasilkan draf konten X (Twitter) siap posting.
• \`/help\` — Panduan ini.
    `.trim();

    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });
}
