/**
 * X (Twitter) Content & Community Raid Generator
 * Automatically prepares viral daily tweets, alpha threads, and raid call-to-actions.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TwitterApi } from 'twitter-api-v2';
import { brainState, BusinessPhase } from './brainConfig.js';
import { getMarketContextString } from './dexScreenerClient.js';

export interface TweetDraft {
  id: string;
  type: 'DAILY_BANTER' | 'ALPHA_THREAD' | 'RAID_TRIGGER';
  content: string | string[];
  phase: BusinessPhase;
  createdAt: Date;
}

let twitterClient: TwitterApi | null = null;

function getTwitterClient(): TwitterApi | null {
  const appKey = process.env.X_API_KEY;
  const appSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;

  if (appKey && appSecret && accessToken && accessSecret) {
    if (!twitterClient) {
      twitterClient = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });
    }
    return twitterClient;
  }
  return null;
}

/**
 * Generates engaging daily tweets formatted for X (under 280 chars)
 */
export async function generateDailyTweets(count: number = 3): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';
  const ticker = process.env.TOKEN_TICKER || '$KEPO';

  const defaultTemplates = [
    `They told you cats are lazy. Not $KEPO.\n\nWhile other meme coins rug in 5 mins, our pink snoot watches your Solana wallet 24/7.\n\n0% tax. LP burned. Boop the nose: ${website} 🐾👃`,
    `Did you touch the cat's nose today?\n\nLegend says booping $KEPO's pink snoot summons 1000x green candles on Pump.fun.\n\nTry CHAOS MODE if you dare: ${website} ⚡️🚀`,
    `Paper hands sell the dip, gigachads boop the snoot.\n\n$KEPO is not just a coin, it's a 16-bit arcade movement on Solana. 0% tax, no dev bs.\n\nAre you in? 🐾🔥`,
  ];

  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return defaultTemplates.slice(0, count);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const dexContext = await getMarketContextString();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });

    const prompt = `
Generate ${count} viral Twitter/X drafts in natural crypto-native English for the Solana meme coin "${process.env.TOKEN_NAME || 'Nosey Cat'}" (${ticker}).
Current business phase: ${brainState.currentPhase}
Market telemetry: ${dexContext}
Website link: ${website}

Requirements:
1. Maximum 280 characters per tweet.
2. Use engaging emojis: 🐾, 👃, 🚀, ⚡, 😼, 🕯️.
3. Hook must be viral, snappy, degen, anti-slop, highlighting the interactive pink snoot boop on the website.
4. Separate each tweet with "---TWEET---".
    `.trim();

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const tweets = raw
      .split('---TWEET---')
      .map(t => t.trim())
      .filter(t => t.length > 10);

    return tweets.length > 0 ? tweets.slice(0, count) : defaultTemplates.slice(0, count);
  } catch (err) {
    console.warn('[XPlanner] Error generating tweets with Gemini, using defaults:', err);
    return defaultTemplates.slice(0, count);
  }
}

/**
 * Generates an educational 4-part short thread explaining why $KEPO is rug-proof
 */
export async function generateAlphaThread(): Promise<string[]> {
  const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';
  const ticker = process.env.TOKEN_TICKER || '$NOSEY';

  return [
    `1/4 🧵 Why $NOSEY is the most boopable & unruggable tuxedo cat on Solana.\n\nLet's break down the tokenomics that jeets don't want you to know 👇🐾`,
    `2/4 🔒 Zero BS Security:\n• 0% Buy / Sell Tax (Forever)\n• 100% LP Liquidity Keys burned to the void\n• Dev can't mint, freeze, or alter contracts\n• Total Transparency.`,
    `3/4 🕹️ Retro Arcade Culture:\nForget boring static images. $NOSEY is powered by a full 16-Bit retro arcade site featuring interactive Nose Boops, Chaos Mode, and an in-browser Meme Studio.\n\nPlay here: ${website}`,
    `4/4 🌕 The Cult of the Snoot:\nWe're stealth dropping on Pump.fun.\nBoop the pink snoot, stack your bag, and send it to Valhalla.\n\nJoin the telegram portal: https://t.me/noseycat_portal 🚀`,
  ];
}

/**
 * Generates an explosive Raid message for the Telegram community to raid an X target
 */
export function generateRaidTrigger(targetAccountOrUrl: string = 'Solana Influencers / Pump.fun'): string {
  const ticker = process.env.TOKEN_TICKER || '$NOSEY';
  const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';

  return `
🚨🚨🚨 **SNOOT RAID ALARM ENGAGED!** 🚨🚨🚨

🐾 Raid Target: **${targetAccountOrUrl}**
🎯 Mission: Raid comments with ${ticker} memes & snoot stickers!
💬 Copy this exact phrase and drop it in the replies:

*"The most curious cat on Solana is taking over! 0% tax, burned LP, interactive pink snoot booper. $NOSEY to Valhalla! 🐾👃 ${website}"*

👉 **Unleash the Diamond Paws! Like, RT, and reply to make us trend!** 🚀🔥
  `.trim();
}

/**
 * Posts a tweet directly to X if API keys are configured
 */
export async function postTweetToX(text: string): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const client = getTwitterClient();
  if (!client) {
    return {
      success: false,
      error: 'X_API credentials not configured in .env. Tweet draft ready for manual 1-Click Post.',
    };
  }

  try {
    const rwClient = client.readWrite;
    const response = await rwClient.v2.tweet(text);
    return {
      success: true,
      tweetId: response.data.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to post tweet to X',
    };
  }
}
