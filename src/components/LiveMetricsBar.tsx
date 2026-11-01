import React, { useState, useEffect } from 'react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { DollarSign, BarChart3, Droplets, PieChart, ShieldCheck } from 'lucide-react';

interface DexPairData {
  priceUsd?: string;
  fdv?: number;
  volume?: {
    h24?: number;
  };
  liquidity?: {
    usd?: number;
  };
}

export const LiveMetricsBar: React.FC = () => {
  const [metrics, setMetrics] = useState<DexPairData | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isComingSoon = 
    !TOKEN_CONFIG.contractAddress || 
    TOKEN_CONFIG.contractAddress.includes('COMING_SOON');

  useEffect(() => {
    if (isComingSoon) {
      setIsLive(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_CONFIG.contractAddress}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        
        if (data.pairs && data.pairs.length > 0) {
          // Sort by liquidity or pick highest volume
          const primaryPair = data.pairs[0];
          setMetrics(primaryPair);
          setIsLive(true);
        } else {
          setIsLive(false);
        }
      } catch {
        setIsLive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [isComingSoon]);

  // Format currency helpers
  const formatUSD = (val?: number | string) => {
    if (val === undefined || val === null) return '$0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '$0.00';
    if (num < 0.00001) return `$${num.toFixed(8)}`;
    if (num < 0.01) return `$${num.toFixed(6)}`;
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
  };

  const formatCompact = (val?: number) => {
    if (!val) return '$0';
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="w-full bg-arcade-black border-y-4 border-black py-8 px-4 sm:px-6 lg:px-8 text-white select-none">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pb-2 border-b-2 border-gray-800 font-pixel text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 border border-black ${isLive ? 'bg-green-500 animate-ping' : 'bg-arcade-yellow'}`} />
            <span className="text-arcade-yellow tracking-wider">
              {isLive ? '● ON-CHAIN LIVE TELEMETRY (DEXSCREENER)' : '★ TOKENOMICS PROTOCOL (FAIR LAUNCH)'}
            </span>
          </div>
          <span className="text-gray-400 text-[10px]">
            {isLive ? `REFRESHES EVERY 30S ${loading ? '⏳' : '⚡'}` : '16-BIT RETRO • 100% TRANSPARENT & VERIFIED'}
          </span>
        </div>

        {/* 4 Neo-Brutalist Cards */}
        {isLive && metrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Live Price */}
            <div className="bg-arcade-chalk text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-700 mb-1">
                <span>LIVE PRICE</span>
                <DollarSign size={16} className="text-green-600" />
              </div>
              <div className="font-pixel text-lg sm:text-xl truncate text-green-700">
                {formatUSD(metrics.priceUsd)}
              </div>
              <div className="font-retro text-lg text-gray-600 mt-1">
                Real-Time USD
              </div>
            </div>

            {/* Card 2: Market Cap / FDV */}
            <div className="bg-arcade-yellow text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-800 mb-1">
                <span>MARKET CAP (FDV)</span>
                <PieChart size={16} />
              </div>
              <div className="font-pixel text-lg sm:text-xl truncate">
                {formatCompact(metrics.fdv)}
              </div>
              <div className="font-retro text-lg text-gray-800 mt-1">
                Fully Diluted Val
              </div>
            </div>

            {/* Card 3: 24h Volume */}
            <div className="bg-arcade-grass text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-900 mb-1">
                <span>24H VOLUME</span>
                <BarChart3 size={16} />
              </div>
              <div className="font-pixel text-lg sm:text-xl truncate">
                {formatCompact(metrics.volume?.h24)}
              </div>
              <div className="font-retro text-lg text-gray-900 mt-1">
                24H Trading Volume
              </div>
            </div>

            {/* Card 4: Dex Liquidity */}
            <div className="bg-arcade-pink text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-900 mb-1">
                <span>DEX LIQUIDITY</span>
                <Droplets size={16} />
              </div>
              <div className="font-pixel text-lg sm:text-xl truncate">
                {formatCompact(metrics.liquidity?.usd)}
              </div>
              <div className="font-retro text-lg text-gray-900 mt-1">
                Locked Pool
              </div>
            </div>
          </div>
        ) : (
          /* Fallback Tokenomics Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fallback 1: Total Supply */}
            <div className="bg-arcade-chalk text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-gray-700 mb-1">
                <span>TOTAL SUPPLY</span>
                <PieChart size={16} className="text-black" />
              </div>
              <div className="font-pixel text-base sm:text-lg text-green-800 truncate">
                {TOKEN_CONFIG.defaultTokenomics.totalSupply}
              </div>
              <div className="font-retro text-lg text-gray-600 mt-1">
                100% Fixed Supply (No Mint)
              </div>
            </div>

            {/* Fallback 2: Tax */}
            <div className="bg-arcade-yellow text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
                <span>TRANSACTION TAX</span>
                <DollarSign size={16} />
              </div>
              <div className="font-pixel text-base sm:text-lg text-black truncate">
                {TOKEN_CONFIG.defaultTokenomics.tax}
              </div>
              <div className="font-retro text-lg text-gray-900 mt-1">
                0% Buy & 0% Sell Forever
              </div>
            </div>

            {/* Fallback 3: Liquidity */}
            <div className="bg-arcade-grass text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
                <span>LIQUIDITY POOL</span>
                <Droplets size={16} />
              </div>
              <div className="font-pixel text-base sm:text-lg text-black truncate">
                {TOKEN_CONFIG.defaultTokenomics.liquidity}
              </div>
              <div className="font-retro text-lg text-gray-900 mt-1">
                LP Burned to Black Hole
              </div>
            </div>

            {/* Fallback 4: Dev Supply */}
            <div className="bg-arcade-pink text-black border-4 border-black p-4 shadow-pixel">
              <div className="flex items-center justify-between font-pixel text-[10px] text-black mb-1">
                <span>DEV ALLOCATION</span>
                <ShieldCheck size={16} />
              </div>
              <div className="font-pixel text-base sm:text-lg text-black truncate">
                {TOKEN_CONFIG.defaultTokenomics.devSupply}
              </div>
              <div className="font-retro text-lg text-gray-900 mt-1">
                Streamflow Contract Vesting
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

