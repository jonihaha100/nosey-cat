import React, { useState, useEffect, useRef } from 'react';
import { TOKEN_CONFIG } from '../config/tokenConfig';
import { playBoopSound, playLaserSound } from '../utils/soundEffects';
import { getAssetUrl } from '../utils/assets';

interface MascotInteractiveProps {
  chaosMode: boolean;
  copiedCA: boolean;
}

interface BoopParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  isChaos?: boolean;
}

const CHAOS_SPEECH_LINES = [
  "⚡️ UNLEASHING 1,000,000 WATTS OF SNOOT LASER POWER! 💥",
  "🕯️ I SMELL 1000x GREEN CANDLES ON PUMP.FUN! LFG! 🚀",
  "💎 SUPER SAIYAN SNOOT ENGAGED! APE IN OR CRY LATER! 🐾",
  "🔥 DEV BURNED LP, KEYS IN THE VOID, WE ARE SENDING IT! 🔒",
  "🚀 TOUCH THE NOSE ANON! WE ARE BLASTING OFF TO VALHALLA! 🌕",
  "⚡️ VAPORIZING ALL JEETS & SHORT SELLERS WITH SNOOT BEAMS! 💸",
];

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

  // Speech bubble cycling every 4.5 seconds
  useEffect(() => {
    if (copiedCA) return; // Freeze on success message if copied
    const timer = setInterval(() => {
      setSpeechIndex((prev) => (prev + 1) % (chaosMode ? CHAOS_SPEECH_LINES.length : TOKEN_CONFIG.catSpeechLines.length));
    }, 4500);
    return () => clearInterval(timer);
  }, [copiedCA, chaosMode]);

  // Boop click handler (10x power in Chaos Mode)
  const handleMascotClick = (e?: React.MouseEvent<HTMLElement>) => {
    const isChaos = chaosMode;
    if (isChaos) {
      playLaserSound();
    } else {
      playBoopSound();
    }

    // Trigger squash & stretch
    setIsSquashing(true);
    setTimeout(() => setIsSquashing(false), 150);

    // Update boop counter (10x boost during Chaos!)
    const increment = isChaos ? 10 : 1;
    const newCount = boopCount + increment;
    setBoopCount(newCount);
    try {
      localStorage.setItem('nosey_boop_count', newCount.toString());
      localStorage.setItem('boop_count', newCount.toString());
      localStorage.setItem('kepo_boop_count', newCount.toString());
    } catch {
      // ignore storage error
    }

    // Add floating particles
    const rect = containerRef.current?.getBoundingClientRect();
    const clickX = e && rect ? e.clientX - rect.left : 160;
    const clickY = e && rect ? e.clientY - rect.top : 120;

    const particlePool = isChaos
      ? ['🔥 +10 BOOP!', '⚡️ SNOOT OVERDRIVE!', '🚀 LFG!', '💎 MOON!']
      : ['🐾 +1 BOOP!'];

    const newParticles: BoopParticle[] = particlePool.map((text, idx) => ({
      id: Date.now() + Math.random() + idx,
      x: clickX + (idx > 0 ? (idx % 2 === 0 ? 32 : -32) : 0),
      y: clickY - idx * 16,
      text,
      isChaos,
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some(np => np.id === p.id)));
    }, 700);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center select-none">
      {/* Golden Community Motto Alert */}
      <div className={`mb-3 px-3 py-1.5 border-2 border-black font-pixel text-[9px] sm:text-[10px] shadow-pixel-sm text-center flex items-center justify-center gap-1.5 max-w-sm sm:max-w-md animate-pixel-blink ${
        chaosMode ? 'bg-red-600 text-yellow-300' : 'bg-arcade-yellow text-black'
      }`}>
        <span>{chaosMode ? '⚡️' : '⚠️'}</span>
        <span>
          {chaosMode 
            ? "“CRITICAL ALERT: SNOOT LASERS ENGAGED! 10x BOOP POWER ACTIVE!”" 
            : "“IT'S A CRIME TO VISIT WITHOUT BOOPING NOSEY'S SNOOT!”"}
        </span>
        <span>{chaosMode ? '💥' : '🐾'}</span>
      </div>

      {/* 8-Bit Retro Speech Bubble */}
      <div className={`relative mb-6 max-w-sm sm:max-w-md border-4 border-black p-4 shadow-pixel text-center z-20 transition-colors ${
        chaosMode ? 'bg-black text-yellow-300' : 'bg-arcade-chalk text-arcade-black'
      }`}>
        <p className="font-pixel text-xs sm:text-sm leading-relaxed">
          {copiedCA 
            ? "🔥 BASED! CA COPIED, GO SWAP RIGHT NOW!" 
            : chaosMode 
            ? CHAOS_SPEECH_LINES[speechIndex % CHAOS_SPEECH_LINES.length]
            : TOKEN_CONFIG.catSpeechLines[speechIndex % TOKEN_CONFIG.catSpeechLines.length]}
        </p>
        
        {/* Pixel speech tail pointing down */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-black" />
        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[11px] ${
          chaosMode ? 'border-t-black' : 'border-t-arcade-chalk'
        }`} />
      </div>

      {/* Interactive Cat Mascot Container */}
      <div 
        onClick={handleMascotClick}
        className="relative cursor-pointer group w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
      >
        {/* Cat Sprite with stepped tilt & squash */}
        <div 
          className={`w-full h-full border-4 border-black bg-arcade-grass shadow-pixel-lg transition-transform duration-75 relative ${
            chaosMode ? 'overflow-visible ring-4 ring-red-500/80 animate-arcade-shake' : 'overflow-hidden'
          } ${isSquashing ? 'scale-x-125 scale-y-75' : ''}`}
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
            className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-7 sm:w-12 sm:h-9 pointer-events-none z-30 flex items-center justify-center"
            style={{ top: '41.1%', left: '57.5%' }}
          >
            {/* Subtle idle pulsing pink glow or chaos rainbow ping */}
            <span className={`w-3.5 h-3 rounded-none animate-ping ${
              chaosMode ? 'bg-yellow-300 opacity-90' : 'bg-pink-400/60 opacity-75'
            }`} />

            {/* Hover Reticle & Crosshairs */}
            <div className={`absolute inset-0 border-2 transition-opacity flex items-center justify-center ${
              chaosMode 
                ? 'opacity-100 border-yellow-300 bg-yellow-400/20' 
                : 'opacity-0 group-hover:opacity-100 border-red-500 bg-red-500/25'
            }`}>
              <span className={`absolute -top-1 -left-1 w-1.5 h-1.5 border border-white ${chaosMode ? 'bg-yellow-400' : 'bg-red-600'}`} />
              <span className={`absolute -top-1 -right-1 w-1.5 h-1.5 border border-white ${chaosMode ? 'bg-yellow-400' : 'bg-red-600'}`} />
              <span className={`absolute -bottom-1 -left-1 w-1.5 h-1.5 border border-white ${chaosMode ? 'bg-yellow-400' : 'bg-red-600'}`} />
              <span className={`absolute -bottom-1 -right-1 w-1.5 h-1.5 border border-white ${chaosMode ? 'bg-yellow-400' : 'bg-red-600'}`} />
              
              <span className={`font-pixel text-[8px] px-1.5 py-0.5 border border-white whitespace-nowrap shadow-pixel-sm -top-6 left-1/2 -translate-x-1/2 absolute ${
                chaosMode 
                  ? 'bg-red-600 text-yellow-300 animate-bounce' 
                  : 'bg-black text-yellow-300'
              }`}>
                {chaosMode ? '⚡️ 10x SUPER BOOP! ⚡️' : 'BOOP NOSE! 🐾'}
              </span>
            </div>
          </div>

          {/* Epic High-Voltage Crypto Laser Eyes in CHAOS MODE (ViewBox 1024x1024 Anchored to Pupils) */}
          {chaosMode && (
            <svg
              viewBox="0 0 1024 1024"
              className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible animate-laser-hum"
              style={{ filter: 'drop-shadow(0 0 12px rgba(255, 0, 70, 0.95))' }}
            >
              <defs>
                {/* Laser Glow Filter */}
                <filter id="superLaserGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Flare Gradient */}
                <radialGradient id="laserFlareOrb" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#ffee00" stopOpacity="0.95" />
                  <stop offset="65%" stopColor="#ff0055" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
                </radialGradient>

                {/* Conical Laser Beam Left */}
                <linearGradient id="beamGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="20%" stopColor="#ffff00" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#ff0044" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity="0.4" />
                </linearGradient>

                {/* Conical Laser Beam Right */}
                <linearGradient id="beamGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="20%" stopColor="#ffff00" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#ff0044" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ff0000" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* LEFT EYE LASER BEAM (Origin: 480, 395 -> Target: -250, 1400) */}
              <polygon
                points="468,390 492,400 -120,1440 -380,1320"
                fill="url(#beamGradLeft)"
                filter="url(#superLaserGlow)"
              />
              <polygon
                points="474,393 486,397 -190,1410 -310,1350"
                fill="#ffff00"
                opacity="0.9"
              />
              <line
                x1="480"
                y1="395"
                x2="-250"
                y2="1380"
                stroke="#ffffff"
                strokeWidth="5"
              />

              {/* RIGHT EYE LASER BEAM (Origin: 645, 345 -> Target: 1380, 1350) */}
              <polygon
                points="635,352 655,338 1480,1280 1260,1420"
                fill="url(#beamGradRight)"
                filter="url(#superLaserGlow)"
              />
              <polygon
                points="640,349 650,341 1440,1310 1300,1390"
                fill="#ffff00"
                opacity="0.9"
              />
              <line
                x1="645"
                y1="345"
                x2="1370"
                y2="1350"
                stroke="#ffffff"
                strokeWidth="5"
              />

              {/* ELECTRIC LIGHTNING ARC BETWEEN EYES */}
              <polyline
                points="480,395 515,375 535,395 575,345 605,365 645,345"
                stroke="#00ffff"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                filter="url(#superLaserGlow)"
                className="animate-pulse"
              />

              {/* LEFT EYE FLARE (Origin: 480, 395) */}
              <circle cx="480" cy="395" r="50" fill="url(#laserFlareOrb)" />
              <circle cx="480" cy="395" r="22" fill="#ffff00" opacity="0.9" />
              <circle cx="480" cy="395" r="10" fill="#ffffff" />
              <line x1="395" y1="395" x2="565" y2="395" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
              <line x1="480" y1="310" x2="480" y2="480" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
              <line x1="420" y1="335" x2="540" y2="455" stroke="#ffee00" strokeWidth="2" opacity="0.75" />
              <line x1="420" y1="455" x2="540" y2="335" stroke="#ffee00" strokeWidth="2" opacity="0.75" />

              {/* RIGHT EYE FLARE (Origin: 645, 345) */}
              <circle cx="645" cy="345" r="50" fill="url(#laserFlareOrb)" />
              <circle cx="645" cy="345" r="22" fill="#ffff00" opacity="0.9" />
              <circle cx="645" cy="345" r="10" fill="#ffffff" />
              <line x1="560" y1="345" x2="730" y2="345" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
              <line x1="645" y1="260" x2="645" y2="430" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
              <line x1="585" y1="285" x2="705" y2="405" stroke="#ffee00" strokeWidth="2" opacity="0.75" />
              <line x1="585" y1="405" x2="705" y2="285" stroke="#ffee00" strokeWidth="2" opacity="0.75" />
            </svg>
          )}
        </div>

        {/* Floating +1 BOOP! or +10 CHAOS BOOP! Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute font-pixel text-xs sm:text-sm font-bold border-2 border-white px-2 py-0.5 shadow-pixel-sm pointer-events-none animate-boop-text z-40 whitespace-nowrap ${
              p.isChaos ? 'bg-red-600 text-yellow-300' : 'bg-black text-arcade-pink'
            }`}
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
            }}
          >
            {p.text}
          </div>
        ))}
      </div>

      {/* Big Direct 1-Tap Boop Button for Mobile & Desktop */}
      <button
        type="button"
        onClick={handleMascotClick}
        className={`mt-14 sm:mt-16 relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 font-pixel text-xs sm:text-sm border-4 border-black shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer ${
          chaosMode
            ? 'bg-red-600 text-yellow-300 ring-2 ring-yellow-400 animate-arcade-shake font-bold'
            : 'bg-arcade-pink text-black hover:bg-pink-300 font-bold'
        }`}
      >
        <span>🐾</span>
        <span>{chaosMode ? '⚡️ 10x SUPER SNOOT BOOP! ⚡️' : 'TAP TO BOOP PINK SNOOT! 🐾'}</span>
      </button>

      {/* Nose Boop Score Counter */}
      <div className={`mt-3 relative z-10 border-4 border-black px-6 sm:px-8 py-2.5 font-pixel text-xs sm:text-sm leading-normal shadow-pixel text-center inline-flex items-center justify-center gap-2 overflow-visible ${
        chaosMode ? 'bg-red-600 text-yellow-300 animate-arcade-shake' : 'bg-black text-arcade-yellow'
      }`}>
        <span className="tracking-wide">TOTAL NOSE BOOPS:</span>
        <span className="text-white font-bold">{boopCount.toLocaleString()}</span>
        {chaosMode && <span className="text-[10px] bg-yellow-300 text-black px-1.5 py-0.5 ml-1 font-bold">10x MULTIPLIER!</span>}
      </div>

      {/* Real-time Booper Level Status */}
      <div className="mt-3 relative z-10 flex flex-col items-center gap-1.5 text-center">
        <div className={`px-3 py-1 border-2 border-black font-pixel text-[9px] sm:text-[10px] font-bold shadow-pixel-sm ${
          chaosMode
            ? 'bg-red-600 text-white animate-pulse'
            : boopCount === 0
            ? 'bg-red-500 text-white animate-pulse'
            : boopCount < 10
            ? 'bg-arcade-yellow text-black'
            : boopCount < 25
            ? 'bg-arcade-green text-black'
            : 'bg-arcade-pink text-black'
        }`}>
          {chaosMode && '⚡️ STATUS: SUPER SAIYAN SNOOT DEGEN (10x BOOP ACTIVE!)'}
          {!chaosMode && boopCount === 0 && '🚨 STATUS: UNBOOPED VISITOR (CLICK PINK SNOOT!)'}
          {!chaosMode && boopCount > 0 && boopCount < 10 && `🐾 STATUS: NOVICE SNOOTER (${boopCount} BOOPS)`}
          {!chaosMode && boopCount >= 10 && boopCount < 25 && `🔥 STATUS: BASED DIAMOND PAW (${boopCount} BOOPS)`}
          {!chaosMode && boopCount >= 25 && `👑 STATUS: GIGA-CHAD SNOOT MASTER (${boopCount} BOOPS)`}
        </div>
        <p className="font-retro text-base sm:text-lg text-black font-bold">
          {chaosMode
            ? '🔥 SNOOT LASERS CRITICAL! Tap the pink nose for 10x multiplier luck!'
            : boopCount === 0 
            ? '👉 Press the pink nose above to unlock green candle blessings!'
            : '✨ Proof-of-Boop (PoB) verified! Keep pressing for maximum luck!'}
        </p>
      </div>

      {/* CSS Animation Keyframes for Laser Hum */}
      <style>{`
        @keyframes laserHum {
          0%, 100% {
            transform: scale(1) translate(0, 0);
            filter: drop-shadow(0 0 12px rgba(255, 0, 70, 0.95)) drop-shadow(0 0 24px rgba(255, 230, 0, 0.8));
          }
          25% {
            transform: scale(1.015) translate(-1px, 1px);
            filter: drop-shadow(0 0 16px rgba(255, 0, 70, 1)) drop-shadow(0 0 32px rgba(255, 230, 0, 0.9));
          }
          50% {
            transform: scale(0.99) translate(1px, -1px);
            filter: drop-shadow(0 0 10px rgba(255, 0, 70, 0.85)) drop-shadow(0 0 20px rgba(255, 230, 0, 0.7));
          }
          75% {
            transform: scale(1.02) translate(-1px, -1px);
            filter: drop-shadow(0 0 18px rgba(255, 0, 70, 1)) drop-shadow(0 0 36px rgba(255, 230, 0, 1));
          }
        }
        .animate-laser-hum {
          animation: laserHum 0.08s steps(4, end) infinite;
        }
      `}</style>
    </div>
  );
};
