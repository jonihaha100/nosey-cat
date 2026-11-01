import React from 'react';
import { Volume2, VolumeX, Flame, Zap, ArrowUpRight } from 'lucide-react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { getAssetUrl } from '../utils/assets';

interface NavbarProps {
  chaosMode: boolean;
  onToggleChaos: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  chaosMode,
  onToggleChaos,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-arcade-chalk border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        {/* Logo & Ticker */}
        <a 
          href="#" 
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-12 h-12 border-4 border-black bg-arcade-grass shadow-pixel-sm overflow-hidden flex-shrink-0 group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
            <img 
              src={getAssetUrl('/mascot-pixel.png')} 
              alt="Nosey Cat Mascot" 
              className="w-full h-full object-cover pixelated" 
            />
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-sm md:text-lg tracking-wider text-arcade-black leading-tight">
              {TOKEN_CONFIG.name}
            </span>
            <span className="font-pixel text-xs text-green-700 font-bold">
              {TOKEN_CONFIG.ticker}
            </span>
          </div>
        </a>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 font-pixel text-xs">
          <a 
            href="#about" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            ABOUT
          </a>
          <a 
            href="#lore" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            THE SNOOT
          </a>
          <a 
            href="#trollbox" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            TROLLBOX
          </a>
          <a 
            href="#security" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            SECURITY
          </a>
          <a 
            href="#studio" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            MEME STUDIO
          </a>
          <a 
            href="#howtobuy" 
            className="text-arcade-black hover:text-green-700 hover:underline decoration-4 underline-offset-4 transition-colors"
          >
            HOW TO BUY
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute 8-Bit Audio" : "Mute Audio"}
            className="h-11 w-11 flex items-center justify-center border-4 border-black bg-arcade-yellow text-black shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-none focus:outline-none"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* CHAOS MODE Toggle */}
          <button
            onClick={onToggleChaos}
            className={`h-11 px-3 sm:px-4 flex items-center gap-1.5 font-pixel text-[10px] sm:text-xs border-4 border-black rounded-none shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none transition-colors ${
              chaosMode 
                ? 'bg-red-500 text-white animate-arcade-shake' 
                : 'bg-arcade-pink text-black hover:bg-pink-300'
            }`}
          >
            {chaosMode ? <Zap size={16} className="text-yellow-300 fill-yellow-300" /> : <Flame size={16} />}
            <span className="hidden sm:inline">CHAOS:</span>
            <span>{chaosMode ? 'ON!' : 'OFF'}</span>
          </button>

          {/* Buy CTA */}
          <a
            href={TOKEN_CONFIG.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-11 px-3 sm:px-5 flex items-center gap-1.5 font-pixel text-xs sm:text-sm bg-arcade-green text-black border-4 border-black rounded-none shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-bold"
          >
            <span>BUY</span>
            <span className="hidden xs:inline">{TOKEN_CONFIG.ticker}</span>
            <ArrowUpRight size={18} className="stroke-[3]" />
          </a>
        </div>
      </div>
    </header>
  );
};

