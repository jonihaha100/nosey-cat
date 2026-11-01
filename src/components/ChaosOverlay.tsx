import React, { useMemo } from 'react';
import { getAssetUrl } from '../utils/assets';

interface ChaosOverlayProps {
  active: boolean;
}

interface RainDrop {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
}

export const ChaosOverlay: React.FC<ChaosOverlayProps> = ({ active }) => {
  // Generate randomized falling cats
  const drops: RainDrop[] = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      duration: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 2,
      size: 32 + Math.floor(Math.random() * 40),
      rotation: Math.floor(Math.random() * 4) * 90, // 0, 90, 180, 270 deg
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Falling pixel cat rain */}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute pixelated select-none"
          style={{
            left: `${drop.left}%`,
            top: '-80px',
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            animation: `chaosFall ${drop.duration}s steps(12, end) infinite`,
            animationDelay: `${drop.delay}s`,
            transform: `rotate(${drop.rotation}deg)`,
          }}
        >
          <img
            src={getAssetUrl('/mascot-pixel.png')}
            alt="Falling Mascot"
            className="w-full h-full object-contain filter drop-shadow-[2px_2px_0px_#000]"
          />
        </div>
      ))}

      {/* Retro Warning Banners */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-600 text-yellow-200 border-4 border-black px-6 py-2 font-pixel text-xs sm:text-sm shadow-pixel animate-arcade-shake whitespace-nowrap">
        ⚠️ WARNING: CHAOS MODE ACTIVATED! MAXIMUM DEGEN LEVEL! ⚠️
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

