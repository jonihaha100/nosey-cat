export interface TokenConfig {
  name: string;
  ticker: string;
  chain: string;
  contractAddress: string;
  buyUrl: string;
  dexScreenerUrl: string;
  telegramUrl: string;
  twitterUrl: string;
  tokenLockProofUrl: string;
  defaultTokenomics: {
    totalSupply: string;
    tax: string;
    liquidity: string;
    devSupply: string;
  };
  marqueeMessages: string[];
  catSpeechLines: string[];
}

export const TOKEN_CONFIG: TokenConfig = {
  name: "Nosey Cat",
  ticker: "$NOSEY",
  chain: "solana",
  // Update to real contract address once launched on Pump.fun / Raydium
  contractAddress: "COMING_SOON_ON_PUMPFUN",
  buyUrl: "https://pump.fun",
  dexScreenerUrl: "https://dexscreener.com",
  telegramUrl: "https://t.me/nesey_cat_bot",
  twitterUrl: "https://x.com/TheNoseyCat",
  tokenLockProofUrl: "https://streamflow.finance",
  defaultTokenomics: {
    totalSupply: "1,000,000,000",
    tax: "0% BUY / 0% SELL",
    liquidity: "100% BURNED",
    devSupply: "LOCKED 30 DAYS"
  },
  marqueeMessages: [
    "🐾 $NOSEY: THE MOST CURIOUS & BOOPABLE TUXEDO CAT ON SOLANA!",
    "⚠️ 'IT'S A CRIME TO VISIT WITHOUT BOOPING NOSEY'S SNOOT!' — TAP THE PINK NOSE NOW!",
    "🔥 100% FAIR LAUNCH ON PUMP.FUN — LIQUIDITY BURNED FOREVER",
    "💎 ZERO TAX (0% BUY / 0% SELL) — 100% PROFIT TO NOSEY HOLDERS",
    "👉 BOOP NOSEY'S PINK SNOOT FOR MAXIMUM FORTUNE & GREEN CANDLES!"
  ],
  catSpeechLines: [
    "It's a crime to visit without booping my pink snoot anon! Tap me! 🐾",
    "Too nosey to let you miss this pump! Ape into $NOSEY anon! 🚀",
    "Boop my pink nose for instant green candles! 🚀",
    "Dev can't rug, liquidity keys are burned into the void! 🔒",
    "Curiosity didn't kill this cat, it made me rich! Hold $NOSEY! 💎",
    "Ape into $NOSEY now before you FOMO at the top! 🔥"
  ]
};

