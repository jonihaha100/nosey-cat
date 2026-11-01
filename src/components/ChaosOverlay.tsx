import React, { useMemo } from 'react';

interface ChaosOverlayProps {
  active: boolean;
}

interface FloatingMemeItem {
  id: number;
  type: 'emoji' | 'pill';
  content: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
  color?: string;
}

const DEGEN_PILLS = [
  '🚀 PUMP IT!',
  '🕯️ GOD CANDLE!',
  '💎 100M MCAP!',
  '🐾 MEGA BOOP!',
  '🔥 DEV IS COOKING!',
  '⚡️ SO BULLISH!',
  '🌕 TO THE MOON!',
  '🔒 100% RUGPROOF!',
  '💰 STACK SNOOT!',
  '👑 BASED CT ANON!',
];

const DEGEN_EMOJIS = ['🚀', '🕯️', '💎', '🐾', '🔥', '⚡️', '💸', '🌕', '✨'];

export const ChaosOverlay: React.FC<ChaosOverlayProps> = ({ active }) => {
  // Generate randomized falling meme elements with ample spacing
  const items: FloatingMemeItem[] = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      const isPill = i % 3 === 0;
      return {
        id: i,
        type: isPill ? 'pill' : 'emoji',
        content: isPill 
          ? DEGEN_PILLS[Math.floor(Math.random() * DEGEN_PILLS.length)]
          : DEGEN_EMOJIS[Math.floor(Math.random() * DEGEN_EMOJIS.length)],
        left: 2 + Math.random() * 94,
        duration: 2.2 + Math.random() * 2.8,
        delay: Math.random() * 2.2,
        size: isPill ? 12 : 22 + Math.floor(Math.random() * 24),
        rotation: (Math.random() - 0.5) * 30,
        color: ['bg-arcade-yellow text-black', 'bg-arcade-pink text-white', 'bg-green-400 text-black', 'bg-cyan-400 text-black'][Math.floor(Math.random() * 4)],
      };
    });
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* High-voltage Screen Strobe Vignette */}
      <div className="absolute inset-0 border-8 border-red-500/40 pointer-events-none animate-pulse" />

      {/* Falling Meme Rain */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute select-none will-change-transform z-10"
          style={{
            left: `${item.left}%`,
            top: '-80px',
            animation: `chaosFall ${item.duration}s linear infinite`,
            animationDelay: `${item.delay}s`,
            transform: `rotate(${item.rotation}deg)`,
          }}
        >
          {item.type === 'pill' ? (
            <div className={`px-2.5 py-1 border-2 border-black font-pixel text-[10px] sm:text-xs shadow-pixel whitespace-nowrap ${item.color}`}>
              {item.content}
            </div>
          ) : (
            <span 
              style={{ fontSize: `${item.size}px` }}
              className="drop-shadow-[2px_2px_0px_#000] inline-block"
            >
              {item.content}
            </span>
          )}
        </div>
      ))}

      {/* Retro Chaos Warning Ticker (Top) */}
      <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 bg-red-600 text-yellow-200 border-4 border-black px-4 sm:px-6 py-2 font-pixel text-[10px] sm:text-xs shadow-pixel animate-arcade-shake whitespace-nowrap z-40 max-w-[95vw] overflow-hidden text-ellipsis">
        🚨 EMERGENCY BROADCAST: $NOSEY HYPER-CHAOS UNLOCKED! 10x SNOOT MULTIPLIER ACTIVE! 🚨
      </div>

      {/* Retro Bottom Degen Strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-arcade-yellow text-black border-4 border-black px-4 py-1.5 font-pixel text-[9px] sm:text-[11px] shadow-pixel whitespace-nowrap z-40 max-w-[95vw] overflow-hidden text-ellipsis flex items-center gap-2">
        <span>⚡️</span>
        <span>SUPER SAIYAN SNOOT ENGAGED • ALL BEARS REKT • GREEN CANDLES TO VALHALLA</span>
        <span>⚡️</span>
      </div>

      <style>{`
        @keyframes chaosFall {
          0% {
            top: -100px;
            opacity: 1;
          }
          100% {
            top: 105vh;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
