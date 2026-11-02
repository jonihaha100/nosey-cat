import React, { useState } from 'react';
import { TopMarquee } from './components/TopMarquee';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LiveMetricsBar } from './components/LiveMetricsBar';
import { LiveTrafficMonitor } from './components/LiveTrafficMonitor';
import { SecurityProof } from './components/SecurityProof';
import { EcosystemHub } from './components/EcosystemHub';
import { ArcadeRoadmap } from './components/ArcadeRoadmap';
import { SnootLoreSection } from './components/SnootLoreSection';
import { LiveTrollbox } from './components/LiveTrollbox';
import { MemeStudio } from './components/MemeStudio';
import { HowToBuyAndChart } from './components/HowToBuyAndChart';
import { ChaosOverlay } from './components/ChaosOverlay';
import { CRTOverlay } from './components/CRTOverlay';
import { TOKEN_CONFIG } from './config/tokenConfig';
import { getAssetUrl } from './utils/assets';
import { 
  playBoopSound,
  playPowerUpSound, 
  playLaserSound,
  getAudioMuteStatus, 
  toggleAudioMute 
} from './utils/soundEffects';
import { ArrowUp, Heart, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [chaosMode, setChaosMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => getAudioMuteStatus());

  // Toggle CHAOS MODE with 8-bit sound and disco effect
  const handleToggleChaos = () => {
    const nextState = !chaosMode;
    setChaosMode(nextState);
    if (nextState) {
      playLaserSound();
      playPowerUpSound();
    } else {
      playBoopSound();
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = toggleAudioMute();
    setIsMuted(nextMute);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      className={`min-h-screen relative flex flex-col font-retro overflow-x-hidden w-full max-w-full ${
        chaosMode ? 'chaos-active-bg' : 'bg-arcade-grass'
      }`}
    >
      {/* Fixed CRT Scanline Overlay */}
      <CRTOverlay />

      {/* Chaos Mode Falling Sprites & Banners */}
      <ChaosOverlay active={chaosMode} />

      {/* Top Infinite Marquee */}
      <TopMarquee />

      {/* Sticky Arcade Navbar */}
      <Navbar
        chaosMode={chaosMode}
        onToggleChaos={handleToggleChaos}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {/* Section 1: Hero & Mascot Clicker */}
        <HeroSection chaosMode={chaosMode} />

        {/* Section 2: Real-Time Metrics & Tokenomics Bar */}
        <LiveMetricsBar />

        {/* Section 2.5: Live Traffic & Community Health Telemetry */}
        <LiveTrafficMonitor />

        {/* Section 3: The Snoot Lore & Origin Story */}
        <SnootLoreSection />

        {/* Section 4: Anti-Rug On-Chain Security Proofs */}
        <SecurityProof />

        {/* Section 4.2: Ecosystem Hub & 48s Teaser Trailer (ChillMech Inspired) */}
        <EcosystemHub />

        {/* Section 4.5: Master 4-Stage Arcade Roadmap */}
        <ArcadeRoadmap />

        {/* Section 5: Anonymous Live Trollbox (Fans vs Haters Filter) */}
        <LiveTrollbox />

        {/* Section 6: Client-Side Pixel Meme & PFP Studio */}
        <MemeStudio />

        {/* Section 5: Arcade Quest & Live DexScreener Chart */}
        <HowToBuyAndChart />
      </main>

      {/* Retro Arcade Footer */}
      <footer className="w-full bg-arcade-black text-white border-t-4 border-black py-12 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-gray-800 pb-8 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-white bg-arcade-grass">
                <img 
                  src={getAssetUrl('/mascot-pixel.png')} 
                  alt="Mascot Icon" 
                  className="w-full h-full object-cover pixelated" 
                />
              </div>
              <div>
                <h4 className="font-pixel text-base text-arcade-yellow">
                  {TOKEN_CONFIG.name} ({TOKEN_CONFIG.ticker})
                </h4>
                <p className="font-retro text-lg text-gray-400">
                  16-Bit Retro Arcade Meme Coin • Solana
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 font-pixel text-xs">
              <a 
                href={TOKEN_CONFIG.buyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-arcade-green hover:underline"
              >
                PUMP.FUN
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href={TOKEN_CONFIG.telegramUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-arcade-yellow hover:underline"
              >
                TELEGRAM
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href={TOKEN_CONFIG.twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-arcade-pink hover:underline"
              >
                TWITTER
              </a>
              <span className="text-gray-600">•</span>
              <a 
                href={TOKEN_CONFIG.dexScreenerUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-400 hover:underline"
              >
                DEXSCREENER
              </a>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="h-10 px-4 bg-arcade-chalk text-black border-2 border-white font-pixel text-xs flex items-center gap-2 shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <span>TOP</span>
              <ArrowUp size={14} />
            </button>
          </div>

          {/* Legal / Degen Disclaimer */}
          <div className="bg-[#121216] border-2 border-gray-700 p-4 text-xs font-mono text-gray-400 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-pixel text-[10px]">
              <ShieldAlert size={14} />
              <span>CRYPTO & MEME TOKEN RISK DISCLAIMER:</span>
            </div>
            <p className="leading-relaxed">
              $KEPO is a decentralized meme token created strictly for community entertainment, retro arcade lore, and digital culture. 
              Meme coins possess extreme market volatility and come with no intrinsic financial guarantees or profit expectations. 
              Always do your own research (DYOR) and never risk more than you can comfortably afford to lose.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-gray-500 font-pixel text-[10px] gap-2">
            <span>© 2026 {TOKEN_CONFIG.name}. ALL PIXELS RESERVED.</span>
            <span className="flex items-center gap-1">
              POWERED BY $KEPO DEGENS • TO THE MOON <Heart size={10} className="text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

