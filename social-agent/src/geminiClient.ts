/**
 * Google Gemini AI Client
 * Powers Kucing Kepo's brain, witty replies, and real-time sentiment analysis.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, brainState } from './brainConfig.js';
import { getMarketContextString } from './dexScreenerClient.js';

let genAI: GoogleGenerativeAI | null = null;

function getGeminiInstance(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generates an in-character sassy response using Gemini AI.
 * If API key is not yet configured, gracefully returns a lively fallback response.
 */
export async function generateCharacterReply(
  userMessage: string,
  senderName: string,
  chatHistory: Array<{ sender: string; text: string }> = []
): Promise<string> {
  const instance = getGeminiInstance();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  // Fallback if no Gemini key yet
  if (!instance) {
    return getOfflineFallbackReply(userMessage, senderName);
  }

  try {
    const dexContext = await getMarketContextString();
    const systemPrompt = buildSystemPrompt(dexContext);

    const model = instance.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    // Format chat history context
    let formattedHistory = '';
    if (chatHistory.length > 0) {
      formattedHistory = 'Recent group conversation:\n' + 
        chatHistory.slice(-5).map(h => `${h.sender}: ${h.text}`).join('\n') + '\n\n';
    }

    const prompt = `${formattedHistory}${senderName} says: "${userMessage}"\n\nNosey Cat's snappy English reply:`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 180,
        temperature: 0.95,
        topP: 0.9,
      },
    });

    const reply = result.response.text().trim();
    brainState.totalRepliesSent++;
    return reply;
  } catch (error: any) {
    console.error('[Gemini AI] Error generating reply:', error?.message || error);
    return getOfflineFallbackReply(userMessage, senderName);
  }
}

/**
 * Analyzes whether a message is Bullish, FUD (Fear/Uncertainty/Doubt), or Neutral
 */
export async function analyzeMessageSentiment(text: string): Promise<'bullish' | 'fud' | 'neutral'> {
  const lower = text.toLowerCase();

  // Quick heuristic keyword detection
  if (
    lower.includes('rug') ||
    lower.includes('scam') ||
    lower.includes('drop') ||
    lower.includes('dump') ||
    lower.includes('jeet') ||
    lower.includes('jeed') ||
    lower.includes('turun') ||
    lower.includes('sell') ||
    lower.includes('fake') ||
    lower.includes('dead') ||
    lower.includes('rugpull')
  ) {
    brainState.sentimentCounters.fud++;
    return 'fud';
  }

  if (
    lower.includes('moon') ||
    lower.includes('pump') ||
    lower.includes('buy') ||
    lower.includes('ape') ||
    lower.includes('candle') ||
    lower.includes('bull') ||
    lower.includes('chad') ||
    lower.includes('send it') ||
    lower.includes('gem') ||
    lower.includes('diamond') ||
    lower.includes('based') ||
    lower.includes('boop') ||
    lower.includes('snoot')
  ) {
    brainState.sentimentCounters.bullish++;
    return 'bullish';
  }

  brainState.sentimentCounters.neutral++;
  return 'neutral';
}

/**
 * Generates an automated idle chime-in joke, tease, or meme question in English
 */
export async function generateIdleChimeIn(): Promise<string> {
  const instance = getGeminiInstance();
  const website = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';
  const ticker = process.env.TOKEN_TICKER || '$NOSEY';

  const defaultJokes = [
    `🐾 *crickets chirping* Group is awfully quiet... Are you all staring at the 1m Solana chart or napping? Go boop my nose at ${website} for green candle luck! 👃✨`,
    `😼 My pink snoot is twitching... In meme prophecy, whenever ${ticker}'s nose itches, a massive god candle is loading on Pump.fun! Who's awake? 🕯️🚀`,
    `👃 Anon, you cannot call yourself a true degen until you toggle CHAOS MODE on our site: ${website}! How many times did you boop today? ⚡`,
    `💸 Dev can't rug, LP burned into the void, 0% tax! Paper hands go watch cartoons, diamond paws raise your claws! 🐾💎`,
    `🎨 Bored waiting? Cook some spicy memes on our 16-Bit MEME STUDIO at ${website}! The funniest meme gets community bragging rights! 🚀`,
  ];

  if (!instance) {
    return defaultJokes[Math.floor(Math.random() * defaultJokes.length)];
  }

  try {
    const dexContext = await getMarketContextString();
    const systemPrompt = buildSystemPrompt(dexContext);
    const model = instance.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: 'The Telegram group has been quiet for 30 minutes. Provide 1 witty, sassy, English crypto degen banter message to re-ignite community hype (can be a crypto riddle, asking how many times they booped the nose at the website, or hyping Solana green candles). Maximum 2 sentences strictly in English!'
        }]
      }],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 1.0,
      }
    });

    return result.response.text().trim();
  } catch {
    return defaultJokes[Math.floor(Math.random() * defaultJokes.length)];
  }
}

/**
 * Offline witty fallback in English in case GEMINI_API_KEY is not configured or network drops
 */
function getOfflineFallbackReply(userMessage: string, senderName: string): string {
  const website = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';
  const ca = process.env.SOLANA_TOKEN_CA || 'COMING_SOON_ON_PUMPFUN';
  const ticker = process.env.TOKEN_TICKER || '$NOSEY';
  const lower = userMessage.toLowerCase();

  if (lower.includes('ca') || lower.includes('contract') || lower.includes('address')) {
    if (ca.includes('COMING_SOON')) {
      return `😼 Easy there ${senderName}! CA is still classified (${ca}) so sniper bots don't frontrun the diamond paws! Stay glued to this chat! 🐾`;
    }
    return `🚀 Official CA for ${ticker}: \`${ca}\`! Check it on Pump.fun or Raydium, LP is permanently burned! 🔒`;
  }

  if (lower.includes('safe') || lower.includes('rug') || lower.includes('dev') || lower.includes('scam')) {
    return `🔒 100% RUG-PROOF anon! 0% Buy/Sell Tax, LP keys launched into the black hole, zero dev greed! Verify the proof at ${website} 🐾`;
  }

  if (lower.includes('when') || lower.includes('launch') || lower.includes('drop')) {
    return `⏳ We're stealth launching on Pump.fun! Instead of staring at the ceiling, go stack some Nose Boops at: ${website} 👃`;
  }

  const randomReplies = [
    `Meow! ${senderName}, stop fading and go boop my pink snoot at ${website} for instant good fortune! 🐾👃`,
    `Whatcha sniffing around for, ${senderName}? Nosey Cat is monitoring the Solana blockchain 24/7, smells like alpha! 🕯️🚀`,
    `Full send anon! Don't forget to flip on CHAOS MODE at ${website} for 1000W neon laser eyes! ⚡😼`,
  ];

  return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}
