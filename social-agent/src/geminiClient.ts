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
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

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
      formattedHistory = 'Percakapan grup terakhir:\n' + 
        chatHistory.slice(-5).map(h => `${h.sender}: ${h.text}`).join('\n') + '\n\n';
    }

    const prompt = `${formattedHistory}${senderName} berkata: "${userMessage}"\n\nBalasan Kucing Kepo:`;

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
  if (lower.includes('rug') || lower.includes('scam') || lower.includes('drop') || lower.includes('dump') || lower.includes('jeed') || lower.includes('turun') || lower.includes('rugpull')) {
    brainState.sentimentCounters.fud++;
    return 'fud';
  }

  if (lower.includes('moon') || lower.includes('pump') || lower.includes('terbang') || lower.includes('serok') || lower.includes('buy') || lower.includes('ape') || lower.includes('candle') || lower.includes('gacor') || lower.includes('mantap')) {
    brainState.sentimentCounters.bullish++;
    return 'bullish';
  }

  brainState.sentimentCounters.neutral++;
  return 'neutral';
}

/**
 * Generates an automated idle chime-in joke, tease, or meme question
 */
export async function generateIdleChimeIn(): Promise<string> {
  const instance = getGeminiInstance();
  const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';
  const ticker = process.env.TOKEN_TICKER || '$KEPO';

  const defaultJokes = [
    `🐾 *krik krik* Sepi bener nih grup, pada lagi pantengin chart Solana apa lagi ketiduran? Mending pencet idung gua di ${website} biar dapet berkah green candle! 👃✨`,
    `😼 Hidung gue gatel nih... biasanya kalo idung si ${ticker} gatel tandanya bakal ada 1000x god candle di Pump.fun! Ada yang masih melek? 🕯️🚀`,
    `👃 Anon, jangan ngaku degen sejati kalo belum pernah nyalain CHAOS MODE di website kita: ${website}! Udah pada berapa kali mencet idung gue hari ini? ⚡`,
    `💸 Dev can't rug, LP burned to void, tax 0%! Yang paper hand mending nonton kartun dulu, yang diamond paws cung tangannya! 🐾💎`,
    `🎨 Lagi gabut? Bikin meme sekreatif mungkin di 16-Bit MEME STUDIO kita: ${website}! Yang paling kocak bakal dipajang di panggung snoot! 🚀`,
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
          text: 'Grup Telegram sedang sepi hening selama 30 menit. Berikan 1 celetukan lucu, tengil, santai, dan mengajak member interaksi (bisa tebak-tebakan kripto, nanya kabar boop hidung di web, atau tebar optimisme Solana). Maksimal 2 kalimat!'
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
 * Offline witty fallback in case GEMINI_API_KEY is not configured or network drops
 */
function getOfflineFallbackReply(userMessage: string, senderName: string): string {
  const website = process.env.WEBSITE_URL || 'https://jonihaha100.github.io/nosey-cat/';
  const ca = process.env.SOLANA_TOKEN_CA || 'COMING_SOON_ON_PUMPFUN';
  const lower = userMessage.toLowerCase();

  if (lower.includes('ca') || lower.includes('kontrak') || lower.includes('address')) {
    if (ca.includes('COMING_SOON')) {
      return `😼 Sabar dong ${senderName}! CA masih rahasia (${ca}) biar bot sniper ga curang! Pantengin terus grup ini ya! 🐾`;
    }
    return `🚀 Nih CA resmi $KEPO / $NOSEY: \`${ca}\`! Cek di Pump.fun atau Raydium, LP udah gosong dibakar! 🔒`;
  }

  if (lower.includes('aman') || lower.includes('rug') || lower.includes('dev')) {
    return `🔒 100% RUG-PROOF fren! 0% Buy/Sell Tax, LP keys udah dibuang ke black hole, dev no greedy allocation! Cek bukti auditnya di ${website} 🐾`;
  }

  if (lower.includes('kapan') || lower.includes('launch') || lower.includes('rilis')) {
    return `⏳ Kita stealth launch di Pump.fun! Daripada bengong mending nabung Nose Boops dulu di website: ${website} 👃`;
  }

  const randomReplies = [
    `Meoong! ${senderName}, daripada FUD mending colek dulu hidung pink gue di web: ${website} biar hoki! 🐾👃`,
    `Tumben nanya gitu ${senderName}? Kucing Kepo lagi mantau blockchain Solana nih, bau-bau cuan tercium! 🕯️🚀`,
    `Gaspol fren! Jangan lupa cobain CHAOS MODE di ${website}, ada laser mata neon 1000 watt! ⚡😼`,
  ];

  return randomReplies[Math.floor(Math.random() * randomReplies.length)];
}
