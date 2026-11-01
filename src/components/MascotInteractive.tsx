import React, { useState, useEffect, useRef } from 'react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { playBoopSound } from '../utils/soundEffects';
import { getAssetUrl } from '../utils/assets';

interface MascotInteractiveProps {
  chaosMode: boolean;
  copiedCA: boolean;
}

interface BoopParticle {
  id: number;
  x: number;
  y: number;
}

export const MascotInteractive: React.FC<MascotInteractiveProps> = ({
  chaosMode,
  copiedCA,
}) => {
  // Head tilt state: -20, -10, 0, 10, 20 degrees
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isSquashing, setIsSquashing] = useState<boolean>(false);
  const [boopCount, setBoopCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nosey_boop_count') || localStorage.getItem('boop_count') || localStorage.getItem('kepo_boop_count');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [particles, setParticles] = useState<BoopParticle[]>([]);
  const [speechIndex, setSpeechIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stepped Cursor Tracking (-20deg, -10deg, 0deg, 10deg, 20deg)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const normalizedX = (e.clientX / windowWidth) - 0.5; // -0.5 to 0.5

      let angle = 0;
      if (normalizedX < -0.3) angle = -20;
      else if (normalizedX < -0.1) angle = -10;
      else if (normalizedX > 0.3) angle = 20;
      else if (normalizedX > 0.1) angle = 10;
      else angle = 0;

      setTiltAngle(angle);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Speech bubble cycling every 5 seconds
  useEffect(() => {
    if (copiedCA) return; // Freeze on success message if copied
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % TOKEN_CONFIG.catSpeechLines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [copiedCA]);

  // Boop click handler
  const handleMascotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    playBoopSound();

    // Trigger squash & stretch
    setIsSquashing(true);
    setTimeout(() => setIsSquashing(false), 150);

    // Update boop counter
    const newCount = boopCount + 1;
    setBoopCount(newCount);
    try {
      localStorage.setItem('nosey_boop_count', newCount.toString());
      localStorage.setItem('boop_count', newCount.toString());
      localStorage.setItem('kepo_boop_count', newCount.toString());
    } catch {
      // ignore storage error
    }

    // Add floating particle
    const rect = containerRef.current?.getBoundingClientRect();
    const clickX = rect ? e.clientX - rect.left : 150;
    const clickY = rect ? e.clientY - rect.top : 150;

    const newParticle: BoopParticle = {
      id: Date.now() + Math.random(),
      x: clickX,
      y: clickY,
    };

    setParticles((prev) => [...prev, newParticle]);

    // Remove particle after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 600);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center select-none">
      {/* Golden Community Motto Alert */}
      <div className="mb-3 px-3 py-1.5 bg-arcade-yellow text-black border-2 border-black font-pixel text-[9px] sm:text-[10px] shadow-pixel-sm text-center flex items-center justify-center gap-1.5 max-w-sm sm:max-w-md animate-pixel-blink">
        <span>⚠️</span>
        <span>&ldquo;TIDAK ASYIK MASUK WEBSITE TANPA MEGANG HIDUNG KUCING INI!&rdquo;</span>
        <span>🐾</span>
      </div>

      {/* 8-Bit Retro Speech Bubble */}
      <div className="relative mb-6 max-w-sm sm:max-w-md bg-arcade-chalk border-4 border-black p-4 shadow-pixel text-center z-20">
        <p className="font-pixel text-xs sm:text-sm text-arcade-black leading-relaxed">
          {copiedCA 
            ? "🔥 BASED! CA COPIED, GO SWAP RIGHT NOW!" 
            : TOKEN_CONFIG.catSpeechLines[speechIndex]}
        </p>
        
        {/* Pixel speech tail pointing down */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-black" />
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[11px] border-t-arcade-chalk" />
      </div>

      {/* Interactive Cat Mascot Container */}
      <div 
        onClick={handleMascotClick}
        className="relative cursor-pointer group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
      >
        {/* Cat Sprite with stepped tilt & squash */}
        <div 
          className={`w-full h-full border-4 border-black bg-arcade-grass shadow-pixel-lg overflow-hidden transition-transform duration-75 ${
            isSquashing ? 'scale-x-125 scale-y-75' : ''
          }`}
          style={{
            transform: isSquashing 
              ? 'scale(1.25, 0.75)' 
              : `rotate(${tiltAngle}deg)`,
            transitionTimingFunction: 'steps(3, end)',
          }}
        >
          <img 
            src={getAssetUrl('/mascot-pixel.png')} 
            alt="Nosey Cat Mascot Pixel" 
            className="w-full h-full object-cover pixelated select-none pointer-events-none" 
          />

          {/* Interactive Nose Beacon & Reticle Target - Exactly on Pink Nose (X: 57.5%, Y: 41.1%) */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-7 sm:w-11 sm:h-8 pointer-events-none z-20 flex items-center justify-center"
            style={{ top: '41.1%', left: '57.5%' }}
          >
            {/* Subtle idle pulsing pink glow to attract clicks */}
            <span className="w-3 h-2.5 bg-pink-400/50 rounded-none animate-ping opacity-75" />

            {/* Hover Reticle & Crosshairs */}
            <div className="absolute inset-0 border-2 border-red-500 bg-red-500/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-red-600 border border-white" />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-600 border border-white" />
              <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-red-600 border border-white" />
              <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-red-600 border border-white" />
              
              <span className="font-pixel text-[8px] text-yellow-300 bg-black px-1.5 py-0.5 border border-white whitespace-nowrap shadow-pixel-sm -top-6 left-1/2 -translate-x-1/2 absolute">
                BOOP NOSE! 🐾
              </span>
            </div>
          </div>

          {/* Laser Eyes Effect in CHAOS MODE - Anchored to actual eye pupils */}
          {chaosMode && (
            <>
              {/* Left Eye Laser (X: 46.8%, Y: 38.9%) */}
              <div 
                className="absolute w-3 h-48 bg-gradient-to-b from-yellow-300 via-red-600 to-transparent border-x-2 border-black -rotate-12 animate-pixel-blink pointer-events-none"
                style={{ top: '38.9%', left: '46.8%', imageRendering: 'pixelated' }}
              />
              {/* Right Eye Laser (X: 63.1%, Y: 32.3%) */}
              <div 
                className="absolute w-3 h-48 bg-gradient-to-b from-yellow-300 via-red-600 to-transparent border-x-2 border-black rotate-12 animate-pixel-blink pointer-events-none"
                style={{ top: '32.3%', left: '63.1%', imageRendering: 'pixelated' }}
              />
            </>
          )}
        </div>

        {/* Floating +1 BOOP! Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute font-pixel text-sm sm:text-base font-bold text-arcade-pink bg-black border-2 border-white px-2 py-0.5 shadow-pixel-sm pointer-events-none animate-boop-text z-30"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
            }}
          >
            🐾 +1 BOOP!
          </div>
        ))}
      </div>

      {/* Nose Boop Score Counter - Ample mt-20 sm:mt-24 clearance so cat frame rotation never clips letter T */}
      <div className="mt-20 sm:mt-24 relative z-10 bg-black text-arcade-yellow border-4 border-black px-6 sm:px-8 py-3 font-pixel text-xs sm:text-sm leading-normal shadow-pixel text-center inline-flex items-center justify-center gap-2 overflow-visible">
        <span className="tracking-wide">TOTAL NOSE BOOPS:</span>
        <span className="text-white font-bold">{boopCount.toLocaleString()}</span>
      </div>

      {/* Real-time Booper Level Status */}
      <div className="mt-3 relative z-10 flex flex-col items-center gap-1.5 text-center">
        <div className={`px-3 py-1 border-2 border-black font-pixel text-[9px] sm:text-[10px] font-bold shadow-pixel-sm ${
          boopCount === 0
            ? 'bg-red-500 text-white animate-pulse'
            : boopCount < 10
            ? 'bg-arcade-yellow text-black'
            : boopCount < 25
            ? 'bg-arcade-green text-black'
            : 'bg-arcade-pink text-black'
        }`}>
          {boopCount === 0 && '🚨 STATUS: UNBOOPED VISITOR (CLICK PINK SNOOT!)'}
          {boopCount > 0 && boopCount < 10 && `🐾 STATUS: NOVICE SNOOTER (${boopCount} BOOPS)`}
          {boopCount >= 10 && boopCount < 25 && `🔥 STATUS: BASED DIAMOND PAW (${boopCount} BOOPS)`}
          {boopCount >= 25 && `👑 STATUS: GIGA-CHAD SNOOT MASTER (${boopCount} BOOPS)`}
        </div>
        <p className="font-retro text-base sm:text-lg text-black font-bold">
          {boopCount === 0 
            ? '👉 Press the pink nose above to unlock green candle blessings!'
            : '✨ Proof-of-Boop (PoB) verified! Keep pressing for maximum luck!'}
        </p>
      </div>
    </div>
  );
};

