/**
 * DexScreener Public API Client
 * Retrieves real-time token metrics, price, 24h change, and liquidity on Solana.
 */

export interface TokenMarketMetrics {
  isLive: boolean;
  priceUsd: string;
  priceChange24h: string;
  volume24h: string;
  liquidityUsd: string;
  marketCapUsd: string;
  pairAddress?: string;
  dexUrl?: string;
}

export async function fetchTokenMarketMetrics(tokenAddress?: string): Promise<TokenMarketMetrics> {
  const ca = tokenAddress || process.env.SOLANA_TOKEN_CA || 'COMING_SOON_ON_PUMPFUN';

  // Handle Pre-Launch state
  if (!ca || ca.toUpperCase().includes('COMING_SOON') || ca.length < 30) {
    return {
      isLive: false,
      priceUsd: '$0.00000000 (Pre-Launch on Pump.fun)',
      priceChange24h: '0%',
      volume24h: '$0',
      liquidityUsd: 'Pending Launch',
      marketCapUsd: 'Pre-Market',
      dexUrl: process.env.WEBSITE_URL || 'https://nosey-cat.vercel.app',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ca}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KucingKepoAgent/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`DexScreener API error: HTTP ${response.status}`);
    }

    const data: any = await response.json();

    if (!data.pairs || data.pairs.length === 0) {
      return {
        isLive: true,
        priceUsd: '$0.0000 (Pair initializing on Pump.fun/Raydium)',
        priceChange24h: '0%',
        volume24h: '$0',
        liquidityUsd: 'Bonding Curve / Initial Pool',
        marketCapUsd: 'Initializing',
      };
    }

    // Pick top pair by liquidity or volume
    const topPair = data.pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    const priceUsd = topPair.priceUsd ? `$${parseFloat(topPair.priceUsd).toFixed(8)}` : 'N/A';
    const priceChange24h = topPair.priceChange?.h24 ? `${topPair.priceChange.h24 > 0 ? '+' : ''}${topPair.priceChange.h24}%` : '0%';
    const volume24h = topPair.volume?.h24 ? `$${Math.round(topPair.volume.h24).toLocaleString()}` : '$0';
    const liquidityUsd = topPair.liquidity?.usd ? `$${Math.round(topPair.liquidity.usd).toLocaleString()}` : 'N/A';
    const marketCapUsd = topPair.fdv ? `$${Math.round(topPair.fdv).toLocaleString()}` : 'N/A';

    return {
      isLive: true,
      priceUsd,
      priceChange24h,
      volume24h,
      liquidityUsd,
      marketCapUsd,
      pairAddress: topPair.pairAddress,
      dexUrl: topPair.url || `https://dexscreener.com/solana/${ca}`,
    };
  } catch (error: any) {
    console.warn(`[DexScreener] Warning fetching data: ${error?.message || error}`);
    return {
      isLive: false,
      priceUsd: 'Error fetching live DexScreener stats',
      priceChange24h: '0%',
      volume24h: '$0',
      liquidityUsd: 'N/A',
      marketCapUsd: 'N/A',
    };
  }
}

/**
 * Helper to produce a clean string suitable for Gemini context injection
 */
export async function getMarketContextString(): Promise<string> {
  const metrics = await fetchTokenMarketMetrics();
  if (!metrics.isLive) {
    return `Token Status: PRE-LAUNCH (Belum ada pair di DexScreener, masih proses warming up menuju Pump.fun drop).`;
  }

  return `
- Harga Live: ${metrics.priceUsd}
- Perubahan 24 Jam: ${metrics.priceChange24h}
- Volume 24 Jam: ${metrics.volume24h}
- Likuiditas: ${metrics.liquidityUsd}
- Market Cap (FDV): ${metrics.marketCapUsd}
- URL DexScreener: ${metrics.dexUrl || 'https://dexscreener.com'}
  `.trim();
}
