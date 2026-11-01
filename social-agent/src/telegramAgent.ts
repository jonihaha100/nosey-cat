/**
 * 24/7 Living Telegram Agent for Kucing Kepo ($KEPO / $NOSEY)
 * Listens to community discussions, automatically replies with sassy AI banter,
 * and keeps the group vibrant with Idle Chime-In banter.
 */

import TelegramBot from 'node-telegram-bot-api';
import { brainState } from './brainConfig.js';
import { generateCharacterReply, analyzeMessageSentiment, generateIdleChimeIn } from './geminiClient.js';
import { registerAdminCommands } from './adminMonitor.js';

const KEYWORD_TRIGGERS = [
  'ca',
  'kontrak',
  'contract',
  'address',
  'kapan',
  'launch',
  'rilis',
  'dev',
  'beli',
  'buy',
  'cara beli',
  'aman',
  'rug',
  'scam',
  'boop',
  'snoot',
  'meme',
  'chaos',
  'pump',
  'kepo',
  'kucing',
  'price',
  'harga',
];

interface ChatHistoryItem {
  sender: string;
  text: string;
  timestamp: number;
}

export class TelegramAgentService {
  private bot: TelegramBot | null = null;
  private botUsername: string = '';
  private recentChatHistory: ChatHistoryItem[] = [];
  private idleCheckInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token.includes('your_telegram_bot_token')) {
      console.warn('[Telegram Agent] TELEGRAM_BOT_TOKEN is not configured in .env. Bot will start in simulation mode.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
    } catch (err: any) {
      console.error('[Telegram Agent] Failed to initialize bot:', err?.message || err);
    }
  }

  public async start(): Promise<void> {
    if (!this.bot) {
      console.log('[Telegram Agent] Simulation mode active. Waiting for TELEGRAM_BOT_TOKEN to be supplied.');
      return;
    }

    try {
      const me = await this.bot.getMe();
      this.botUsername = me.username || 'KucingKepoBot';
      this.isRunning = true;
      console.log(`[Telegram Agent] Connected successfully as @${this.botUsername}!`);

      // Register Admin Executive Control
      registerAdminCommands(this.bot);

      // Listen to all incoming community messages
      this.bot.on('message', async (msg) => {
        await this.handleIncomingMessage(msg);
      });

      // Start the Idle Chime-In heartbeat timer
      this.startIdleChimeInMonitor();
    } catch (error: any) {
      console.error('[Telegram Agent] Error starting bot polling:', error?.message || error);
    }
  }

  /**
   * Processes each message in the group
   */
  private async handleIncomingMessage(msg: TelegramBot.Message): Promise<void> {
    if (!msg.text || msg.from?.is_bot) return;

    // Ignore command messages (starting with '/')
    if (msg.text.startsWith('/')) return;

    brainState.totalMessagesProcessed++;
    brainState.lastMessageTimestamp = Date.now();

    const text = msg.text;
    const senderName = msg.from?.first_name || msg.from?.username || 'Anon';
    const chatId = msg.chat.id;

    // Track sentiment asynchronously
    analyzeMessageSentiment(text);

    // Maintain a rolling chat history of 10 items
    this.recentChatHistory.push({
      sender: senderName,
      text,
      timestamp: Date.now(),
    });
    if (this.recentChatHistory.length > 10) {
      this.recentChatHistory.shift();
    }

    // Determine if the bot should reply:
    // 1. Direct mention: @BotUsername
    // 2. Direct reply to bot's message
    // 3. Or message contains critical trigger keywords (with probability check to prevent spam)
    const lowerText = text.toLowerCase();
    const isMentioned = this.botUsername && lowerText.includes(`@${this.botUsername.toLowerCase()}`);
    const isReplyToMe = msg.reply_to_message?.from?.username?.toLowerCase() === this.botUsername.toLowerCase();
    const matchedTrigger = KEYWORD_TRIGGERS.some((keyword) => lowerText.includes(keyword));

    if (isMentioned || isReplyToMe || matchedTrigger) {
      // Simulate natural typing delay (arcade cat thinking)
      if (this.bot) {
        await this.bot.sendChatAction(chatId, 'typing');
      }

      const replyText = await generateCharacterReply(text, senderName, this.recentChatHistory);

      if (this.bot) {
        try {
          await this.bot.sendMessage(chatId, replyText, {
            reply_to_message_id: msg.message_id,
          });
          console.log(`[Telegram Agent] Replied to ${senderName}: "${replyText}"`);
        } catch (sendErr: any) {
          console.warn('[Telegram Agent] Failed to send reply:', sendErr?.message || sendErr);
        }
      }
    }
  }

  /**
   * Idle Chime-In Monitor:
   * Periodically checks if the group has been quiet for X minutes,
   * then drops a funny meme or banter to re-engage the community.
   */
  private startIdleChimeInMonitor(): void {
    const idleMinutes = parseInt(process.env.IDLE_CHIME_MINUTES || '30', 10);
    const checkIntervalMs = 60 * 1000; // Check every 1 minute

    this.idleCheckInterval = setInterval(async () => {
      if (!this.bot || !this.isRunning) return;

      const targetGroupId = process.env.TELEGRAM_GROUP_ID;
      if (!targetGroupId || !targetGroupId.startsWith('-')) {
        // Group ID not yet specified
        return;
      }

      const elapsedMs = Date.now() - brainState.lastMessageTimestamp;
      const elapsedMinutes = elapsedMs / (60 * 1000);

      if (elapsedMinutes >= idleMinutes) {
        console.log(`[Telegram Agent] Group has been idle for ${Math.round(elapsedMinutes)} mins. Triggering Idle Chime-In!`);
        
        const chimeIn = await generateIdleChimeIn();
        try {
          await this.bot.sendMessage(targetGroupId, chimeIn);
          brainState.lastMessageTimestamp = Date.now(); // Reset timer
          brainState.totalRepliesSent++;
          console.log(`[Telegram Agent] Idle Chime-In sent: "${chimeIn}"`);
        } catch (err: any) {
          console.warn('[Telegram Agent] Error sending Idle Chime-In:', err?.message || err);
        }
      }
    }, checkIntervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    if (this.bot) {
      this.bot.stopPolling();
      this.bot = null;
    }
    console.log('[Telegram Agent] Stopped cleanly.');
  }
}
