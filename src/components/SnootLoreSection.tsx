import React from 'react';
import { Sparkles, HelpCircle, Trophy, Zap } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { playBoopSound } from '../utils/soundEffects';

export const SnootLoreSection: React.FC = () => {
  return (
    <section id="lore" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-arcade-chalk border-b-4 border-black select-none">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-arcade-pink text-black border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm font-bold">
            <Sparkles size={14} />
            <span>ORIGIN & LORE DOSSIER</span>
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-black">
            THE SNOOT CHRONICLES: WHY THE PINK NOSE?
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-gray-800 max-w-3xl mx-auto">
            The authentic story behind the most boopable meme icon on Solana — and why visiting without touching this nose is strictly forbidden!
          </p>
        </div>

        {/* Narrative & Visual Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Mascot Spotlight (4 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative bg-arcade-grass border-4 border-black p-4 shadow-pixel-lg max-w-sm w-full text-center">
              <div className="inline-block bg-arcade-yellow border-2 border-black px-2 py-0.5 font-pixel text-[10px] font-bold mb-3">
                ORIGINAL VIRAL ICON
              </div>
              <div
                onClick={() => playBoopSound()}
                className="cursor-pointer border-4 border-black bg-black overflow-hidden aspect-square relative group"
                title="Click to Boop!"
              >
                <img
                  src={getAssetUrl('/mascot-pixel.png')}
                  alt="Nosey Cat Authentic Icon"
                  className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-2 right-2 bg-pink-500 text-white font-pixel text-[9px] px-2 py-1 border border-white shadow-pixel-sm animate-pixel-blink">
                  TOUCH NOSE 🐾
                </div>
              </div>

              {/* Tagline Badge */}
              <div className="mt-4 bg-black text-yellow-300 border-2 border-black p-2.5 font-pixel text-xs leading-relaxed text-center">
                &ldquo;IT&apos;S A CRIME TO VISIT WITHOUT BOOPING NOSEY&apos;S PINK SNOOT!&rdquo;
              </div>
            </div>
          </div>

          {/* Right Column: 3 Pillars of Authenticity (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pillar 1 */}
            <div className="bg-white border-4 border-black p-5 shadow-pixel flex gap-4 items-start">
              <div className="p-2.5 bg-arcade-yellow border-2 border-black flex-shrink-0">
                <HelpCircle size={24} className="text-black" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-pixel text-sm sm:text-base text-black">
                  1. WHY THE PINK NOSE? (THE SNOOT PHENOMENON)
                </h3>
                <p className="font-retro text-lg sm:text-xl text-gray-800 leading-relaxed">
                  Look closely at our mascot photo: While normal cats look away, <strong>Nosey Cat</strong> tilts his head at a curious -20° angle and thrusts his glowing bubblegum-pink nose directly into your face. In internet folklore, cats with bright pink snoots are known as <em>&quot;The Sniffers of Green Candles&quot;</em> — detecting pump signals long before Raydium algorithms!
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white border-4 border-black p-5 shadow-pixel flex gap-4 items-start">
              <div className="p-2.5 bg-arcade-pink border-2 border-black flex-shrink-0">
                <Trophy size={24} className="text-black" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-pixel text-sm sm:text-base text-black">
                  2. PROOF-OF-BOOP (PoB) CONSENSUS
                </h3>
                <p className="font-retro text-lg sm:text-xl text-gray-800 leading-relaxed">
                  99% of meme coins are ghost towns where devs dump on silent Telegram groups. <strong>$KEPO</strong> changes the game with our proprietary <strong>Proof-of-Boop (PoB)</strong> mechanism. Every visitor touches the nose, hearing the 8-bit chirp, stacking score points, and proving real human diamond-paw presence. No bot can fake the boop!
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white border-4 border-black p-5 shadow-pixel flex gap-4 items-start">
              <div className="p-2.5 bg-arcade-green border-2 border-black flex-shrink-0">
                <Zap size={24} className="text-black" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-pixel text-sm sm:text-base text-black">
                  3. THE UNWRITTEN RULE OF $KEPO
                </h3>
                <p className="font-retro text-lg sm:text-xl text-gray-800 leading-relaxed">
                  Legend says that if you visit this site and close the tab without pressing Kepo&apos;s pink snoot, your next 3 crypto trades will get wicked out. But those who tap the nose receive instant green candle blessings. <em>Boop hard, ape in, and hold the line!</em> 🐾💎
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
