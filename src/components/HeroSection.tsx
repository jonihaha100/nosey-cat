import React, { useState } from 'react';
import { Copy, Check, Send, ArrowUpRight } from 'lucide-react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { playCoinSound } from '../utils/soundEffects';
import { MascotInteractive } from './MascotInteractive';

interface HeroSectionProps {
  chaosMode: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ chaosMode }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isComingSoon = TOKEN_CONFIG.contractAddress === 'COMING_SOON_ON_PUMPFUN';

  const handleCopyCA = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN_CONFIG.contractAddress);
      playCoinSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback copy
      playCoinSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section id="about" className="relative w-full py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Mascot & Interactive Clicker */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <MascotInteractive chaosMode={chaosMode} copiedCA={copied} />
        </div>

        {/* Right Column: Title, Badges, CA Box, and CTAs */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Subtitle Badges */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <span className="bg-arcade-yellow text-black border-2 border-black font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm font-bold">
              ⚡ SOLANA DEGEN
            </span>
            <span className="bg-arcade-pink text-black border-2 border-black font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm font-bold">
              🔥 0% TAX NO BS
            </span>
            <span className="bg-white text-black border-2 border-black font-pixel text-[10px] sm:text-xs px-2.5 py-1 shadow-pixel-sm font-bold">
              🔒 100% RUG-PROOF
            </span>
          </div>

          {/* Main Title */}
          <div>
            <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl text-arcade-black leading-tight drop-shadow-[4px_4px_0px_#ffffff]">
              {TOKEN_CONFIG.name}
            </h1>
            <p className="font-pixel text-xl sm:text-2xl text-green-800 mt-1 font-bold">
              {TOKEN_CONFIG.ticker}
            </p>
          </div>

          {/* Narrative / Lore */}
          <div className="bg-arcade-chalk border-4 border-black p-4 shadow-pixel max-w-xl">
            <p className="font-retro text-xl sm:text-2xl text-arcade-black leading-relaxed">
              Not your lazy house cat sleeping all day! <strong>$KEPO</strong> is the most curious and boopable tuxedo cat on Solana, watching your wallet 24/7. 
              <strong> 0% buy/sell tax</strong>, liquidity burned into the void, and dev keys locked away forever. Boop Kepo's pink snoot, stack your bag, and send it straight to the moon! 🚀🐾
            </p>
          </div>

          {/* 1-Click Copy Contract Address (CA) Box */}
          <div className="w-full max-w-xl space-y-2">
            <div className="flex items-center justify-between font-pixel text-xs text-black font-bold">
              <span>CONTRACT ADDRESS (CA):</span>
              {isComingSoon && (
                <span className="text-red-700 bg-yellow-300 border border-black px-1.5 py-0.5 animate-pixel-blink text-[10px]">
                  🚨 LAUNCHING SOON ON PUMP.FUN
                </span>
              )}
            </div>

            <div 
              onClick={handleCopyCA}
              className="group cursor-pointer bg-black text-arcade-yellow border-4 border-black p-3.5 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-between gap-3"
              title="Click to copy Contract Address"
            >
              <div className="font-mono text-xs sm:text-sm truncate select-all text-left">
                {TOKEN_CONFIG.contractAddress}
              </div>
              <button
                type="button"
                className="flex-shrink-0 bg-arcade-yellow text-black border-2 border-white px-3 py-1 font-pixel text-[10px] sm:text-xs flex items-center gap-1.5 font-bold uppercase"
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-[3]" />
                    <span>COPIED! 🚀</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="stroke-[3]" />
                    <span>COPY CA</span>
                  </>
                )}
              </button>
            </div>

            {isComingSoon && (
              <p className="font-retro text-lg text-black bg-white border-2 border-black px-3 py-1 text-center font-bold">
                📢 JOIN TELEGRAM FOR THE OFFICIAL CA DROP AT LAUNCH!
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2 w-full max-w-xl justify-center lg:justify-start">
            <a
              href={TOKEN_CONFIG.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[160px] h-12 bg-arcade-green text-black border-4 border-black font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
            >
              <span>BUY NOW</span>
              <ArrowUpRight size={18} />
            </a>

            <a
              href={TOKEN_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[140px] h-12 bg-arcade-yellow text-black border-4 border-black font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
            >
              <Send size={16} />
              <span>TELEGRAM</span>
            </a>

            <a
              href={TOKEN_CONFIG.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[140px] h-12 bg-black text-white border-4 border-black font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
            >
              <span>𝕏 / TWITTER</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

