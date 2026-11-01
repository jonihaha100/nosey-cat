/**
 * Entry Point for Kucing Kepo ($KEPO / $NOSEY) Autonomous Social & Business Monitoring Agent
 */

import dotenv from 'dotenv';
dotenv.config();

import { TelegramAgentService } from './telegramAgent.js';
import { brainState } from './brainConfig.js';
import { fetchTokenMarketMetrics } from './dexScreenerClient.js';

const ASCII_BANNER = `
 =====================================================================
  _  ___   _  ____ ___ _   _  ____   _  _______ ____   ___  
 | |/ / | | |/ ___|_ _| \\ | |/ ___| | |/ / ____|  _ \\ / _ \\ 
 | ' /| | | | |    | ||  \\| | |  _  | ' /|  _| | |_) | | | |
 | . \\| |_| | |___ | || |\\  | |_| | | . \\| |___|  __/| |_| |
 |_|\\_\\\\___/ \\____|___|_| \\_|\\____| |_|\\_\\_____|_|    \\___/ 
 
     🐾 KUCING KEPO AUTONOMOUS SOCIAL & MONITORING AGENT 🐾
     Solana Meme Coin 24/7 Living Community & Executive Brain
 =====================================================================
`;

async function main() {
  console.log(ASCII_BANNER);

  // 1. Validate Core Environment
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  console.log('🔍 System Diagnostics:');
  console.log(`• Default Phase     : ${brainState.currentPhase}`);
  console.log(`• Website URL       : ${process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app'}`);
  console.log(`• Telegram Bot      : ${botToken && !botToken.includes('your_') ? '✅ Configured' : '⚠️ Missing (Add to .env)'}`);
  console.log(`• Gemini AI Key     : ${geminiKey && !geminiKey.includes('your_') ? '✅ Connected' : '⚠️ Missing (Will use offline fallback)'}`);
  console.log(`• Admin ID          : ${adminId && !adminId.includes('your_') ? `✅ Restricted (${adminId})` : '⚠️ Open (Anyone can run admin commands)'}`);
  console.log(`• Idle Chime Interv : ${process.env.IDLE_CHIME_MINUTES || 30} Minutes\n`);

  // 2. Fetch Initial Market State
  const initialMetrics = await fetchTokenMarketMetrics();
  console.log(`📈 DexScreener Telemetry: ${initialMetrics.priceUsd} | Liquidity: ${initialMetrics.liquidityUsd}\n`);

  // 3. Start Telegram Living Agent
  const telegramAgent = new TelegramAgentService();
  await telegramAgent.start();

  console.log('🚀 Agent is live and listening! Press Ctrl+C to terminate.\n');

  // Graceful Shutdown
  const handleExit = () => {
    console.log('\n🛑 Shutting down Kucing Kepo Agent gracefully...');
    telegramAgent.stop();
    process.exit(0);
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

main().catch((err) => {
  console.error('Fatal agent error on startup:', err);
  process.exit(1);
});
