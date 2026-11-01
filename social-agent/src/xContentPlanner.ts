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
 * Safely cleans and enforces Twitter's strict 280-character limit (URLs count as 23 chars, emojis count as 2)
 */
export function getTwitterWeightedLength(text: string): number {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, '');
  let weight = urls.length * 23;
  for (const char of Array.from(textWithoutUrls)) {
    const codePoint = char.codePointAt(0) || 0;
    // Standard ASCII and European / common ranges count as 1, emojis/symbols/CJK count as 2
    if (codePoint <= 0x10FF) {
      weight += 1;
    } else {
      weight += 2;
    }
  }
  return weight;
}

export function cleanAndEnforceTwitterLimit(rawText: string, website: string): string {
  // 1. Remove prefixes like "Draft 1:", "Tweet 1:", "1. ", "Option 1:", quotes, etc.
  let cleaned = rawText
    .replace(/^(Draft\s*\d+:?|Tweet\s*\d+:?|\d+[\.:\)]|Option\s*\d+:?)\s*/i, '')
    .replace(/^["'“”](.*)["'“”]$/s, '$1')
    .trim();

  // 2. Remove redundant "Draft 1:" if repeated inside
  cleaned = cleaned.replace(/\bDraft\s*\d+:?\s*/gi, '').trim();

  // 3. Ensure website URL is included cleanly
  if (!cleaned.includes('nosey-cat.vercel.app') && !cleaned.includes(website)) {
    cleaned += `\n${website}`;
  }

  // 4. Calculate Twitter weighted length
  const weight = getTwitterWeightedLength(cleaned);

  // If exceeding 255 weighted characters, cleanly truncate to guarantee it NEVER exceeds 260
  if (weight > 255) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = cleaned.match(urlRegex) || [];
    const textWithoutUrls = cleaned.replace(urlRegex, '').trim();
    const words = textWithoutUrls.split(/\s+/);
    let truncated = '';
    for (const w of words) {
      const candidate = (truncated ? truncated + ' ' : '') + w;
      const candidateWeight = getTwitterWeightedLength(candidate + '...\n' + urls.join(' '));
      if (candidateWeight > 250) break;
      truncated = candidate;
    }
    cleaned = `${truncated.trim()}...\n${urls.join(' ')}`;
  }

  return cleaned.trim();
}

/**
 * Generates engaging daily tweets formatted for X (strictly under 260 chars)
 */
export async function generateDailyTweets(count: number = 3): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const website = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';
  const ticker = process.env.TOKEN_TICKER || '$NOSEY';

  const defaultTemplates = [
    `They said cats are lazy. Not ${ticker} 😼\n\n16-bit tuxedo cat guarding your Solana wallet 24/7.\n⚠️ It's a crime to visit without booping my pink snoot!\n\n🕹️ Boop & Play: ${website} 🐾🚀 #Solana #NOSEY`,
    `Did you touch the cat's nose today? 👃\n\nLegend says booping ${ticker}'s pink snoot summons 1000x green candles on Pump.fun.\n\n0% Tax • LP Burned: ${website} ⚡️🚀`,
    `Paper hands sell the dip, gigachads boop the snoot.\n\n${ticker} is a 16-bit arcade movement on Solana. 0% tax, no dev bs. Boop now:\n${website} 🐾🔥`,
  ];

  if (!apiKey || apiKey.includes('your_gemini_api_key')) {
    return defaultTemplates.slice(0, count).map(t => cleanAndEnforceTwitterLimit(t, website));
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const dexContext = await getMarketContextString();
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });

    const prompt = `
Generate ${count} short, viral Twitter/X posts in natural crypto-native English for the Solana meme coin "${process.env.TOKEN_NAME || 'Nosey Cat'}" (${ticker}).
Current business phase: ${brainState.currentPhase}
Market telemetry: ${dexContext}
Website link: ${website}

CRITICAL CONSTRAINTS - STRICT CHARACTER LIMIT:
1. MAX 210 CHARACTERS PER TWEET (including emojis, spaces, and the website link ${website}). X strictly blocks posts over 280 characters!
2. DO NOT include prefixes like "Draft 1:", "Tweet 1:", "1.", or quotes. Output ONLY the raw tweet text.
3. Keep it punchy, funny, degen, highlighting the interactive pink snoot booper on the website.
4. Emojis: 🐾, 👃, 🚀, ⚡, 😼, 🕯️.
5. Separate each tweet with "---TWEET---".
    `.trim();

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const tweets = raw
      .split('---TWEET---')
      .map(t => cleanAndEnforceTwitterLimit(t, website))
      .filter(t => t.length > 20);

    return tweets.length > 0 ? tweets.slice(0, count) : defaultTemplates.slice(0, count);
  } catch (err) {
    console.warn('[XPlanner] Error generating tweets with Gemini, using defaults:', err);
    return defaultTemplates.slice(0, count).map(t => cleanAndEnforceTwitterLimit(t, website));
  }
}

/**
 * Generates an educational 4-part short thread explaining why $KEPO is rug-proof
 */
export async function generateAlphaThread(): Promise<string[]> {
  const website = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';
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
  const website = process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app';

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
export async function postTweetToX(text: string): Promise<{ success: boolean; tweetId?: string; intentUrl?: string; error?: string }> {
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  const client = getTwitterClient();
  if (!client) {
    return {
      success: false,
      intentUrl,
      error: 'X_API credentials not configured in .env. Tweet draft ready for manual 1-Click Post.',
    };
  }

  try {
    const rwClient = client.readWrite;
    const response = await rwClient.v2.tweet(text);
    return {
      success: true,
      tweetId: response.data.id,
      intentUrl,
    };
  } catch (error: any) {
    const detail = error?.data?.detail || error?.message || '';
    return {
      success: false,
      intentUrl,
      error: detail || 'Failed to post tweet directly to X',
    };
  }
}
