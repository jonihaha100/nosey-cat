import React, { useState } from 'react';
import { Volume2, VolumeX, Flame, Zap, ArrowUpRight, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-arcade-chalk border-b-4 border-black select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Brand Identity (Logo & Ticker) */}
        <div className="flex-shrink-0 flex items-center">
          <a 
            href="#" 
            className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 border-2 sm:border-4 border-black bg-arcade-grass shadow-pixel-sm overflow-hidden flex-shrink-0 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
              <img 
                src={getAssetUrl('/mascot-pixel.png')} 
                alt="Nosey Cat Mascot" 
                className="w-full h-full object-cover pixelated" 
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-pixel text-[11px] sm:text-sm lg:text-base tracking-wider text-arcade-black whitespace-nowrap">
                {TOKEN_CONFIG.name}
              </span>
              <span className="font-pixel text-[8px] sm:text-[9px] text-green-700 font-bold mt-1">
                {TOKEN_CONFIG.ticker}
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Zero Word-Wrapping, Balanced & Symmetrical) */}
        <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-1.5 font-pixel text-[9px] xl:text-[9.5px] whitespace-nowrap flex-shrink-0">
          <a 
            href="#about" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            ABOUT
          </a>
          <a 
            href="#lore" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            THE SNOOT
          </a>
          <a 
            href="#trollbox" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            TROLLBOX
          </a>
          <a 
            href="#security" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            SECURITY
          </a>
          <a 
            href="#roadmap" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            ROADMAP
          </a>
          <a 
            href="#studio" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            MEME STUDIO
          </a>
          <a 
            href="#howtobuy" 
            className="px-1.5 xl:px-2 py-1 text-arcade-black hover:text-black hover:bg-arcade-yellow border-2 border-transparent hover:border-black hover:shadow-pixel-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            HOW TO BUY
          </a>
        </nav>

        {/* Right: Symmetrical Action Controls */}
        <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
          {/* Audio Mute/Unmute (visible on mobile and desktop) */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute 8-Bit Audio" : "Mute Audio"}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border-2 sm:border-4 border-black bg-arcade-yellow text-black shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-none focus:outline-none flex-shrink-0"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* CHAOS MODE Toggle */}
          <button
            onClick={onToggleChaos}
            title="Toggle Chaos Mode"
            className={`h-8 sm:h-9 px-2 sm:px-2.5 flex items-center gap-1 font-pixel text-[9px] sm:text-[10px] border-2 sm:border-4 border-black rounded-none shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none transition-all whitespace-nowrap flex-shrink-0 ${
              chaosMode 
                ? 'bg-red-600 text-yellow-300 ring-2 ring-yellow-400 animate-arcade-shake font-bold' 
                : 'bg-arcade-pink text-black hover:bg-pink-300 font-bold'
            }`}
          >
            {chaosMode ? <Zap size={13} className="text-yellow-300 fill-yellow-300 animate-pulse" /> : <Flame size={13} className="text-red-600 fill-red-500" />}
            <span className="tracking-tight">{chaosMode ? 'CHAOS: ON!' : 'CHAOS: OFF'}</span>
          </button>

          {/* Buy CTA */}
          <a
            href={TOKEN_CONFIG.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1 font-pixel text-[9px] sm:text-[10px] bg-arcade-green text-black border-2 sm:border-4 border-black rounded-none shadow-pixel-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all font-bold whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">BUY NOW</span>
            <span className="sm:hidden">BUY</span>
            <ArrowUpRight size={13} className="stroke-[3]" />
          </a>

          {/* Mobile Menu Hamburger Button (< lg screens) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center border-2 sm:border-4 border-black bg-arcade-yellow text-black shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none rounded-none focus:outline-none flex-shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-arcade-chalk border-t-4 border-black px-4 py-3 flex flex-col gap-2 font-pixel text-xs shadow-pixel">
          {/* Mobile Sound Toggle */}
          <button 
            onClick={onToggleMute}
            className="sm:hidden p-2 border-2 border-black bg-arcade-yellow text-black flex items-center justify-between font-pixel text-xs"
          >
            <span>AUDIO SOUND FX:</span>
            <span className="font-bold">{isMuted ? 'MUTED ✕' : 'PLAYING ♪'}</span>
          </button>

          <a 
            href="#about" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            👉 ABOUT
          </a>
          <a 
            href="#lore" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            🐾 THE SNOOT LORE
          </a>
          <a 
            href="#trollbox" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            💬 LIVE TROLLBOX
          </a>
          <a 
            href="#security" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            🔒 SECURITY &amp; AUDIT
          </a>
          <a 
            href="#roadmap" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            🗺️ QUEST ROADMAP
          </a>
          <a 
            href="#studio" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            🎨 MEME STUDIO
          </a>
          <a 
            href="#howtobuy" 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 border-2 border-black bg-white hover:bg-arcade-yellow text-black transition-colors"
          >
            🚀 HOW TO BUY
          </a>
        </div>
      )}
    </header>
  );
};
