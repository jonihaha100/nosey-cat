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
🐾 **Meow! Welcome ${senderName}!** 😼✨
I'm **Nosey Cat ($NOSEY)** — The most curious & boopable 16-bit tuxedo cat on Solana!

I'm here 24/7 to guard your bags from jeets, provide alpha telemetry, and keep the community buzzing! 🚀

🎯 **What you can do with me:**
• **Chat Live:** Ask me anything about the token, Solana, dev security, or meme lore. Powered by Gemini AI!
• **Check Business Status:** Type \`/status\` to view live telemetry & sentiment metrics.
• **Switch Strategic Phase (Admin):** Type \`/set_phase [PRE_LAUNCH|LIVE_LAUNCH|COMMUNITY_HOLD]\`.
• **Inject Live Directives (Admin):** Type \`/set_directive [instruction]\`.
• **Community Raid:** Type \`/raid [target]\`.
• **Generate Viral Tweets:** Type \`/tweet\`.
• **Play on Website:** Boop my pink snoot at [Nosey Cat Website](${website}) to boost Total Nose Boops & unlock Chaos Laser Eyes! 👃⚡️

Try greeting me right now: ask *"When launch?"* or *"Is the contract safe?"* 🐾
    `.trim();

    bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown', disable_web_page_preview: true });
  });

  // 1. /status command
  bot.onText(/^\/status/i, async (msg) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Access denied. This command is restricted to the Project Director / Admin.');
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
📊 **EXECUTIVE BUSINESS MONITOR ($NOSEY)** 🐾
━━━━━━━━━━━━━━━━━━━━━━
⏱ **Agent Uptime:** ${hours}h ${minutes}m
🎯 **Business Phase:** \`${brainState.currentPhase}\`
🧠 **Active Directive:**
"${brainState.activeDirective}"

💬 **Group Activity:**
• Messages Processed: ${brainState.totalMessagesProcessed}
• AI Replies Delivered: ${brainState.totalRepliesSent}
• Community Sentiment:
  - 🟢 Bullish: ${brainState.sentimentCounters.bullish} (${bullishPct}%)
  - 🔴 FUD: ${brainState.sentimentCounters.fud} (${fudPct}%)
  - ⚪️ Neutral: ${brainState.sentimentCounters.neutral}

📈 **Market Telemetry (DexScreener):**
• Price: ${metrics.priceUsd}
• 24h Change: ${metrics.priceChange24h}
• 24h Volume: ${metrics.volume24h}
• Market Cap: ${metrics.marketCapUsd}
• Liquidity: ${metrics.liquidityUsd}

━━━━━━━━━━━━━━━━━━━━━━
💡 _Use /set_phase or /set_directive to steer the AI's brain in real-time._
    `.trim();

    bot.sendMessage(msg.chat.id, report, { parse_mode: 'Markdown' });
  });

  // 2. /set_phase [PRE_LAUNCH | LIVE_LAUNCH | COMMUNITY_HOLD]
  bot.onText(/^\/set_phase(?:\s+(.+))?/i, (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Access denied.');
      return;
    }

    const requestedPhase = match?.[1]?.trim().toUpperCase();
    if (!requestedPhase || !Object.values(BusinessPhase).includes(requestedPhase as BusinessPhase)) {
      bot.sendMessage(
        msg.chat.id,
        `⚠️ Invalid phase format! Valid options:\n` +
        `• \`/set_phase PRE_LAUNCH\` (Focus on mystery, lore & booping)\n` +
        `• \`/set_phase LIVE_LAUNCH\` (Focus on conversion, CA & raids)\n` +
        `• \`/set_phase COMMUNITY_HOLD\` (Focus on retention & meme contests)`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    setBusinessPhase(requestedPhase as BusinessPhase);
    bot.sendMessage(
      msg.chat.id,
      `✅ **SUCCESS!** Business phase switched to: \`${requestedPhase}\`.\n\n` +
      `🧠 AI Agent's tone and promotional goals updated immediately across all channels!\n` +
      `🎯 New active directive: "${brainState.activeDirective}"`,
      { parse_mode: 'Markdown' }
    );
  });

  // 3. /set_directive [new instruction]
  bot.onText(/^\/set_directive(?:\s+(.+))?/i, (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Access denied.');
      return;
    }

    const directive = match?.[1]?.trim();
    if (!directive) {
      bot.sendMessage(
        msg.chat.id,
        `⚠️ Please enter an instruction to inject!\nExample:\n\`/set_directive Challenge all members to create laser-eyes memes on the website for a 1 SOL prize!\``,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    setActiveDirective(directive);
    bot.sendMessage(
      msg.chat.id,
      `✅ **DIRECTIVE INJECTED!**\n\nNosey Cat's system instructions are now focused on:\n` +
      `👉 "${directive}"\n\n` +
      `The AI Agent will immediately incorporate this direction in subsequent conversations! 🚀`,
      { parse_mode: 'Markdown' }
    );
  });

  // 4. /raid [target]
  bot.onText(/^\/raid(?:\s+(.+))?/i, async (msg, match) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Access denied.');
      return;
    }

    const target = match?.[1]?.trim() || 'Top Solana Influencers / Pump.fun';
    const raidMsg = generateRaidTrigger(target);

    // Send preview to admin
    await bot.sendMessage(msg.chat.id, raidMsg, { parse_mode: 'Markdown' });

    // If target group ID is configured, optionally broadcast to community group
    const targetGroupId = process.env.TELEGRAM_GROUP_ID;
    if (targetGroupId && targetGroupId.startsWith('-')) {
      try {
        await bot.sendMessage(targetGroupId, raidMsg, { parse_mode: 'Markdown' });
        bot.sendMessage(msg.chat.id, `🚀 Raid Alert has been automatically broadcasted to the community group!`);
      } catch (err: any) {
        bot.sendMessage(msg.chat.id, `⚠️ Failed to broadcast to group (${err?.message}). Please copy-paste the template above manually.`);
      }
    }
  });

  // 5. /tweet
  bot.onText(/^\/tweet/i, async (msg) => {
    if (!isAdminUser(msg)) {
      bot.sendMessage(msg.chat.id, '⛔ Access denied.');
      return;
    }

    bot.sendMessage(msg.chat.id, '⏳ Crafting viral tweet drafts for X (Twitter)...');
    const tweets = await generateDailyTweets(2);

    for (let i = 0; i < tweets.length; i++) {
      const tweetText = tweets[i];
      const reply = `
📝 **TWEET DRAFT #${i + 1}:**
━━━━━━━━━━━━━━━━━━━━━━
${tweetText}
━━━━━━━━━━━━━━━━━━━━━━
Type \`/post_tweet ${i + 1}\` to auto-post if X API is connected, or copy-paste directly!
      `.trim();
      await bot.sendMessage(msg.chat.id, reply, { parse_mode: 'Markdown' });
    }
  });

  // 6. /help command
  bot.onText(/^\/help/i, (msg) => {
    const helpText = `
👑 **NOSEY CAT EXECUTIVE COMMAND SUITE:**

• \`/status\` — Live health summary, market sentiment, token telemetry, and agent uptime.
• \`/set_phase [PHASE]\` — Change business phase: \`PRE_LAUNCH\`, \`LIVE_LAUNCH\`, or \`COMMUNITY_HOLD\`.
• \`/set_directive [text]\` — Dynamically inject high-priority campaign instructions into the AI brain.
• \`/raid [target]\` — Generate a coordinated community raid message.
• \`/tweet\` — Generate viral, high-conversion tweets for X (Twitter).
• \`/help\` — This command reference.
    `.trim();

    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });
}
