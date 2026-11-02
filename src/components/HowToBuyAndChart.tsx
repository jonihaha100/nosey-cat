import React from 'react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { Wallet, Coins, ArrowRightLeft, Radio, Send, ExternalLink } from 'lucide-react';

export const HowToBuyAndChart: React.FC = () => {
  const isComingSoon = 
    !TOKEN_CONFIG.contractAddress || 
    TOKEN_CONFIG.contractAddress.includes('COMING_SOON');

  return (
    <section id="howtobuy" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-arcade-chalk border-b-4 border-black select-none">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-arcade-yellow border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm font-bold">
            🕹️ ARCADE QUEST: 3 SIMPLE STEPS
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-black">
            HOW TO BUY $KEPO ON SOLANA
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-gray-700 max-w-2xl mx-auto">
            Complete the quest below to become an official $KEPO diamond-paw holder!
          </p>
        </div>

        {/* 3 Arcade Quest Stages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stage 1 */}
          <div className="bg-white border-4 border-black p-6 shadow-pixel relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-arcade-yellow text-black border-2 border-black font-pixel text-xs px-2.5 py-1 font-bold">
                  STAGE 1
                </span>
                <Wallet size={24} className="text-black" />
              </div>
              <h3 className="font-pixel text-base text-black mb-2">
                DOWNLOAD PHANTOM
              </h3>
              <p className="font-retro text-xl text-gray-800 leading-relaxed">
                Download a Solana wallet like <strong>Phantom</strong> or <strong>Solflare</strong> from their official website or mobile app store.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-300 font-pixel text-[10px] text-green-700 font-bold">
              STATUS: WALLET READY 💼
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-white border-4 border-black p-6 shadow-pixel relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-arcade-pink text-black border-2 border-black font-pixel text-xs px-2.5 py-1 font-bold">
                  STAGE 2
                </span>
                <Coins size={24} className="text-black" />
              </div>
              <h3 className="font-pixel text-base text-black mb-2">
                LOAD UP ON SOL
              </h3>
              <p className="font-retro text-xl text-gray-800 leading-relaxed">
                Buy some <strong>SOL</strong> on any exchange (Coinbase, Binance, Kraken, Bybit, etc.) and send it to your Phantom wallet address.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-300 font-pixel text-[10px] text-green-700 font-bold">
              STATUS: GAS LOADED ⛽
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-white border-4 border-black p-6 shadow-pixel relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="bg-arcade-grass text-black border-2 border-black font-pixel text-xs px-2.5 py-1 font-bold">
                  STAGE 3
                </span>
                <ArrowRightLeft size={24} className="text-black" />
              </div>
              <h3 className="font-pixel text-base text-black mb-2">
                SWAP FOR $KEPO
              </h3>
              <p className="font-retro text-xl text-gray-800 leading-relaxed">
                Open <strong>Pump.fun</strong> or <strong>Raydium</strong>, paste our official Contract Address (CA), and swap your SOL for $KEPO!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t-2 border-gray-300 font-pixel text-[10px] text-green-700 font-bold">
              STATUS: MISSION COMPLETE 🚀
            </div>
          </div>
        </div>

        {/* Live DexScreener Chart or Retro Radar Screen */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-pixel text-xs text-black">
            <span className="flex items-center gap-2">
              <Radio size={16} className="text-red-600 animate-pixel-blink" />
              <span>LIVE ON-CHAIN RADAR / DEX CHART</span>
            </span>
            <a
              href={TOKEN_CONFIG.dexScreenerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:underline flex items-center gap-1 font-bold"
            >
              <span>OPEN DEXSCREENER</span>
              <ExternalLink size={14} />
            </a>
          </div>

          <div className="bg-black border-4 border-black shadow-pixel-lg overflow-hidden min-h-[420px] flex items-center justify-center relative">
            {!isComingSoon ? (
              <iframe
                title="DexScreener Chart"
                src={`https://dexscreener.com/${TOKEN_CONFIG.chain}/${TOKEN_CONFIG.contractAddress}?embed=1&theme=dark&trades=0&info=0`}
                className="w-full h-[520px] border-none"
              />
            ) : (
              /* Retro CRT Radar Screen with Sweeping Beam */
              <div className="relative w-full h-[450px] bg-[#07130a] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Radar Grid Circles */}
                <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 border-green-500/40 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-green-500/30 flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-green-500/20" />
                  </div>
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-green-500/30" />
                  <div className="absolute h-full w-[1px] bg-green-500/30" />
                  {/* Sweeping Radar Line */}
                  <div 
                    className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent to-green-400 origin-right right-1/2 top-1/2 animate-spin" 
                    style={{ animationDuration: '3s' }}
                  />
                </div>

                {/* Radar Status Badge & Content */}
                <div className="relative z-10 space-y-4 max-w-lg">
                  <div className="inline-block bg-yellow-400 text-black border-2 border-black px-3 py-1 font-pixel text-xs animate-pixel-blink font-bold">
                    📡 RADAR SYSTEM ONLINE
                  </div>

                  <h3 className="font-pixel text-lg sm:text-2xl text-green-400 tracking-wider">
                    WAITING FOR TOKEN LAUNCH SIGNAL...
                  </h3>

                  <p className="font-retro text-xl sm:text-2xl text-green-300 leading-relaxed">
                    Interactive DexScreener charts will illuminate automatically as soon as the token drops on Pump.fun / Raydium.
                  </p>

                  <div className="pt-2">
                    <a
                      href={TOKEN_CONFIG.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-12 px-6 bg-arcade-yellow text-black border-4 border-black font-pixel text-xs sm:text-sm shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 transition-all font-bold"
                    >
                      <Send size={16} />
                      <span>JOIN TELEGRAM FOR LAUNCH SIGNAL</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

