import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, RotateCcw, Upload, Check, Sliders } from 'lucide-react';

interface AccessoryOption {
  id: string;
  name: string;
  icon: string;
}

const ACCESSORIES: AccessoryOption[] = [
  { id: 'glasses', name: 'Thug Life Shades', icon: '🕶️' },
  { id: 'laser', name: 'Red Laser Eyes', icon: '⚡' },
  { id: 'crown', name: 'Degen Crown', icon: '👑' },
  { id: 'coffee', name: 'Hot Coffee', icon: '☕' },
  { id: 'verified', name: '$NOSEY VERIFIED', icon: '🏷️' },
];

interface TransformState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

// Default calibrated position for Thug Life Glasses on the tilted mascot
const DEFAULT_GLASSES_TRANSFORM: TransformState = {
  x: 272,
  y: 178,
  rotation: -20,
  scale: 1.0,
};

export const MemeStudio: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [baseImageSrc, setBaseImageSrc] = useState<string>('/mascot-pixel.png');
  const [topText, setTopText] = useState<string>('BUY $NOSEY NOW');
  const [bottomText, setBottomText] = useState<string>('OR GET ZERO GAINS!');
  const [activeAccessories, setActiveAccessories] = useState<Record<string, boolean>>({
    glasses: true,
    verified: true,
  });
  
  // Custom transform for glasses so user can fine-tune if needed
  const [glassesTransform, setGlassesTransform] = useState<TransformState>(DEFAULT_GLASSES_TRANSFORM);
  const [showAdjustControls, setShowAdjustControls] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Toggle accessory
  const toggleAccessory = (id: string) => {
    setActiveAccessories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Draw crisp pixel accessories directly onto canvas
  const drawAccessories = (ctx: CanvasRenderingContext2D) => {
    // 1. Thug Life Glasses (🕶️) - Fitted accurately to tilted eye line
    if (activeAccessories.glasses) {
      ctx.save();
      // Translate to glasses center, rotate with cat's head tilt, and scale
      ctx.translate(glassesTransform.x, glassesTransform.y);
      ctx.rotate((glassesTransform.rotation * Math.PI) / 180);
      ctx.scale(glassesTransform.scale, glassesTransform.scale);

      ctx.fillStyle = '#000000';
      // Left Lens (centered at x = -45)
      ctx.fillRect(-71, -17, 52, 34);
      // Right Lens (centered at x = +45)
      ctx.fillRect(19, -17, 52, 34);
      // Bridge connecting both lenses
      ctx.fillRect(-19, -12, 38, 10);
      // Left and Right Arms
      ctx.fillRect(-95, -10, 24, 8);
      ctx.fillRect(71, -10, 24, 8);

      // White Pixel Glare reflections (Classic 8-bit stepped Thug Life highlight)
      ctx.fillStyle = '#FFFFFF';
      // Left lens glares
      ctx.fillRect(-64, -13, 8, 7);
      ctx.fillRect(-52, -5, 8, 7);
      // Right lens glares
      ctx.fillRect(26, -13, 8, 7);
      ctx.fillRect(38, -5, 8, 7);

      ctx.restore();
    }

    // 2. Pixel Red Laser Eyes (⚡) - Anchored to actual eye pupils
    if (activeAccessories.laser) {
      // Left eye is at (225, 195), Right eye is at (310, 165)
      const beams = [
        { sx: 225, sy: 195, ex: 10, ey: 480 },
        { sx: 310, sy: 165, ex: 490, ey: 440 },
      ];

      beams.forEach((b) => {
        // Red outer laser
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.lineTo(b.ex, b.ey);
        ctx.stroke();

        // Yellow core
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.lineTo(b.ex, b.ey);
        ctx.stroke();

        // White hot center line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.lineTo(b.ex, b.ey);
        ctx.stroke();
      });
    }

    // 3. Golden Degen Crown (👑) - Tilted on top of cat head
    if (activeAccessories.crown) {
      ctx.save();
      ctx.translate(285, 95);
      ctx.rotate((-19 * Math.PI) / 180);

      // Crown Base
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(-70, 0, 140, 35);

      // 3 Crown Points
      ctx.beginPath();
      // Left point
      ctx.moveTo(-70, 0);
      ctx.lineTo(-70, -40);
      ctx.lineTo(-30, 0);
      // Center point
      ctx.lineTo(0, -55);
      ctx.lineTo(30, 0);
      // Right point
      ctx.lineTo(70, -40);
      ctx.lineTo(70, 0);
      ctx.closePath();
      ctx.fill();

      // Black crown border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.strokeRect(-70, 0, 140, 35);

      // Jewels
      ctx.fillStyle = '#EF4444'; // Ruby center
      ctx.fillRect(-8, 8, 16, 16);
      ctx.fillStyle = '#3B82F6'; // Sapphire left & right
      ctx.fillRect(-50, 8, 14, 14);
      ctx.fillRect(36, 8, 14, 14);

      ctx.restore();
    }

    // 4. Steaming Coffee Mug (☕)
    if (activeAccessories.coffee) {
      // Mug body
      ctx.fillStyle = '#F472B6';
      ctx.fillRect(360, 360, 60, 75);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(360, 360, 60, 75);

      // Handle
      ctx.strokeRect(420, 375, 20, 45);

      // Coffee liquid
      ctx.fillStyle = '#78350F';
      ctx.fillRect(364, 364, 52, 10);

      // Pixel Steam rising
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(375, 345, 6, 8);
      ctx.fillRect(383, 335, 6, 8);
      ctx.fillRect(395, 345, 6, 8);
      ctx.fillRect(403, 335, 6, 8);
    }

    // 5. "$NOSEY VERIFIED" Badge Stamp (🏷️)
    if (activeAccessories.verified) {
      ctx.save();
      ctx.translate(350, 430);
      ctx.rotate(-0.1);

      // Badge Background
      ctx.fillStyle = '#22C55E';
      ctx.fillRect(0, 0, 135, 45);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(0, 0, 135, 45);

      // Text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('✔ VERIFIED', 67, 24);
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText('$NOSEY DEGEN', 67, 38);

      ctx.restore();
    }
  };

  // Render full canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    // Load base image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = baseImageSrc;

    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, 500, 500);

      // Draw base image centered
      ctx.drawImage(img, 0, 0, 500, 500);

      // Draw active accessories
      drawAccessories(ctx);

      // Helper function for classic bold meme text with thick black outline
      const drawMemeText = (text: string, yPos: number) => {
        if (!text.trim()) return;
        ctx.font = '900 24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;

        // Word wrap if text is long
        const words = text.toUpperCase().split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > 460 && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);

        lines.forEach((line, idx) => {
          const lineY = yPos + idx * 30;
          ctx.strokeText(line, 250, lineY);
          ctx.fillText(line, 250, lineY);
        });
      };

      // Draw Top Text
      drawMemeText(topText, 45);

      // Draw Bottom Text (computed from bottom upwards)
      drawMemeText(bottomText, 440);
    };
  }, [baseImageSrc, topText, bottomText, activeAccessories, glassesTransform]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle custom image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBaseImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default
  const handleReset = () => {
    setBaseImageSrc('/mascot-pixel.png');
    setTopText('BUY $NOSEY NOW');
    setBottomText('OR GET ZERO GAINS!');
    setActiveAccessories({
      glasses: true,
      verified: true,
    });
    setGlassesTransform(DEFAULT_GLASSES_TRANSFORM);
  };

  // Download meme PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `nosey-cat-meme-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <section id="studio" className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-arcade-grass border-b-4 border-black select-none">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-arcade-yellow border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm">
            🎨 COMMUNITY RAID TOOL
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-black">
            CLIENT-SIDE MEME & PFP STUDIO
          </h2>
          <p className="font-retro text-xl sm:text-2xl text-gray-900 max-w-2xl mx-auto">
            Create your custom 16-bit profile pictures (PFP) and viral raid memes directly in your browser!
          </p>
        </div>

        {/* Studio Workspace */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 bg-arcade-chalk border-4 border-black p-6 sm:p-8 shadow-pixel-lg">
          {/* Canvas Display */}
          <div className="flex flex-col items-center space-y-4">
            {/* Background Preset Selector */}
            <div className="w-full flex flex-wrap gap-2 justify-center mb-1">
              <span className="font-pixel text-[9px] text-gray-700 w-full text-center">
                SELECT TEMPLATE:
              </span>
              <button
                type="button"
                onClick={() => {
                  setBaseImageSrc('/mascot-pixel.png');
                  setActiveAccessories({ glasses: true, verified: true });
                }}
                className={`px-2 py-1 font-pixel text-[9px] border-2 border-black transition-all ${
                  baseImageSrc === '/mascot-pixel.png' ? 'bg-arcade-yellow shadow-pixel-sm' : 'bg-white hover:bg-gray-100'
                }`}
              >
                🐱 MASCOT
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseImageSrc('/banners/nosey-moon-mission.png');
                  setActiveAccessories({ glasses: false, verified: true });
                }}
                className={`px-2 py-1 font-pixel text-[9px] border-2 border-black transition-all ${
                  baseImageSrc === '/banners/nosey-moon-mission.png' ? 'bg-arcade-yellow shadow-pixel-sm' : 'bg-white hover:bg-gray-100'
                }`}
              >
                🚀 MOON
              </button>
              <button
                type="button"
                onClick={() => {
                  setBaseImageSrc('/banners/nosey-degen-battle-station.png');
                  setActiveAccessories({ glasses: false, verified: true });
                }}
                className={`px-2 py-1 font-pixel text-[9px] border-2 border-black transition-all ${
                  baseImageSrc === '/banners/nosey-degen-battle-station.png' ? 'bg-arcade-yellow shadow-pixel-sm' : 'bg-white hover:bg-gray-100'
                }`}
              >
                💻 STATION
              </button>
            </div>

            <div className="relative border-4 border-black shadow-pixel bg-arcade-grass w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] max-w-full aspect-square overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full h-full object-contain pixelated"
              />
            </div>
            <span className="font-pixel text-[10px] text-gray-700">
              RESOLUTION: 500x500 PIXELS • 100% CLIENT-SIDE
            </span>
          </div>

          {/* Controls & Customization */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Top & Bottom Text Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-xs text-black mb-1 font-bold">
                  TOP TEXT:
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="ENTER TOP TEXT..."
                  maxLength={40}
                  className="w-full h-11 px-3 bg-white text-black border-4 border-black font-mono text-sm uppercase shadow-pixel-sm focus:outline-none focus:bg-yellow-50"
                />
              </div>

              <div>
                <label className="block font-pixel text-xs text-black mb-1 font-bold">
                  BOTTOM TEXT:
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="ENTER BOTTOM TEXT..."
                  maxLength={40}
                  className="w-full h-11 px-3 bg-white text-black border-4 border-black font-mono text-sm uppercase shadow-pixel-sm focus:outline-none focus:bg-yellow-50"
                />
              </div>
            </div>

            {/* Accessories Selector */}
            <div>
              <label className="block font-pixel text-xs text-black mb-2 font-bold">
                16-BIT RETRO ACCESSORIES:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCESSORIES.map((acc) => {
                  const isActive = !!activeAccessories[acc.id];
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => toggleAccessory(acc.id)}
                      className={`h-11 px-2.5 flex items-center gap-1.5 border-4 border-black font-pixel text-[10px] rounded-none shadow-pixel-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                        isActive
                          ? 'bg-arcade-yellow text-black font-bold'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-base">{acc.icon}</span>
                      <span className="truncate">{acc.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fine-Tuning Controls for Glasses when Active */}
            {activeAccessories.glasses && (
              <div className="bg-yellow-100 border-4 border-black p-4 shadow-pixel-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-pixel text-xs font-bold text-black">
                    <Sliders size={16} />
                    <span>GLASSES POSITION SETTINGS 🕶️</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdjustControls(!showAdjustControls)}
                    className="font-pixel text-[10px] underline text-gray-800"
                  >
                    {showAdjustControls ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                {showAdjustControls && (
                  <div className="space-y-3 pt-2 border-t-2 border-black font-mono text-xs">
                    {/* Vertical Position (Y) */}
                    <div>
                      <div className="flex justify-between font-bold text-black mb-1">
                        <span>VERTICAL POSITION (Y):</span>
                        <span>{glassesTransform.y}px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGlassesTransform(p => ({ ...p, y: p.y - 4 }))}
                          className="px-2 py-1 bg-white border-2 border-black font-bold active:bg-yellow-200"
                        >
                          ▲ UP
                        </button>
                        <input
                          type="range"
                          min={120}
                          max={260}
                          value={glassesTransform.y}
                          onChange={(e) => setGlassesTransform(p => ({ ...p, y: parseInt(e.target.value, 10) }))}
                          className="flex-1 accent-black cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setGlassesTransform(p => ({ ...p, y: p.y + 4 }))}
                          className="px-2 py-1 bg-white border-2 border-black font-bold active:bg-yellow-200"
                        >
                          ▼ DOWN
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Position (X) */}
                    <div>
                      <div className="flex justify-between font-bold text-black mb-1">
                        <span>HORIZONTAL POSITION (X):</span>
                        <span>{glassesTransform.x}px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGlassesTransform(p => ({ ...p, x: p.x - 4 }))}
                          className="px-2 py-1 bg-white border-2 border-black font-bold active:bg-yellow-200"
                        >
                          ◀ LEFT
                        </button>
                        <input
                          type="range"
                          min={180}
                          max={350}
                          value={glassesTransform.x}
                          onChange={(e) => setGlassesTransform(p => ({ ...p, x: parseInt(e.target.value, 10) }))}
                          className="flex-1 accent-black cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setGlassesTransform(p => ({ ...p, x: p.x + 4 }))}
                          className="px-2 py-1 bg-white border-2 border-black font-bold active:bg-yellow-200"
                        >
                          ▶ RIGHT
                        </button>
                      </div>
                    </div>

                    {/* Tilt / Rotation */}
                    <div>
                      <div className="flex justify-between font-bold text-black mb-1">
                        <span>ROTATION TILT ANGLE:</span>
                        <span>{glassesTransform.rotation}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={-45}
                          max={45}
                          value={glassesTransform.rotation}
                          onChange={(e) => setGlassesTransform(p => ({ ...p, rotation: parseInt(e.target.value, 10) }))}
                          className="flex-1 accent-black cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setGlassesTransform(DEFAULT_GLASSES_TRANSFORM)}
                          className="px-2 py-1 bg-white border-2 border-black font-pixel text-[9px] font-bold"
                        >
                          RESET FIT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Custom Base Image */}
            <div className="pt-2">
              <label className="block font-pixel text-xs text-black mb-1.5 font-bold">
                UPLOAD CUSTOM IMAGE (OPTIONAL):
              </label>
              <label className="w-full h-11 bg-white hover:bg-gray-50 text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                <Upload size={16} />
                <span>CHOOSE FILE FROM DEVICE</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Action Buttons: Reset & Download */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-4 border-black">
              <button
                type="button"
                onClick={handleReset}
                className="h-12 px-4 bg-arcade-chalk text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 transition-all"
              >
                <RotateCcw size={16} />
                <span>RESET</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 h-12 px-6 bg-arcade-green text-black border-4 border-black font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 shadow-pixel hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-pixel-sm active:translate-x-1 active:translate-y-1 transition-all font-bold"
              >
                {downloadSuccess ? (
                  <>
                    <Check size={18} className="stroke-[3]" />
                    <span>DOWNLOADED! 🎉</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>DOWNLOAD MEME (.PNG)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Official Pump.fun & Twitter Banners Showcase */}
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <div className="inline-block bg-arcade-pink text-black border-2 border-black px-3 py-1 font-pixel text-xs shadow-pixel-sm font-bold">
              🔥 OFFICIAL PUMP.FUN & TWITTER BANNERS
            </div>
            <h3 className="font-pixel text-xl sm:text-2xl md:text-3xl text-black">
              16:9 LANDSCAPE RETRO ARCADE BACKGROUNDS
            </h3>
            <p className="font-retro text-lg sm:text-xl text-gray-800 max-w-xl mx-auto">
              Custom-crafted unique pixel art featuring Nosey Cat ($NOSEY). Free for holders to use on Pump.fun, Twitter/X, and Telegram!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banner 1: Moon Mission */}
            <div className="bg-arcade-chalk border-4 border-black p-5 shadow-pixel-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-arcade-yellow text-black border-2 border-black font-pixel text-[10px] px-2 py-0.5 font-bold">
                    🚀 BANNER #1: MOON MISSION
                  </span>
                  <span className="font-pixel text-[9px] text-gray-600">1920x1080 HD</span>
                </div>
                <div className="border-4 border-black overflow-hidden bg-black shadow-pixel-sm group relative aspect-video">
                  <img
                    src="/banners/nosey-moon-mission.png"
                    alt="Nosey Cat Moon Mission Banner"
                    className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="font-retro text-lg text-gray-800 leading-snug">
                  Nosey Cat perched on the arcade launchpad watching green rocket candles blast toward a giant 16-bit moon with glowing <strong>$NOSEY BOOP THE SNOOT</strong> neon billboard.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href="/banners/nosey-moon-mission-1080p.png"
                  download="nosey-cat-moon-mission-banner-1080p.png"
                  className="flex-1 h-11 bg-arcade-green text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 font-bold"
                >
                  <Download size={14} />
                  <span>DOWNLOAD BANNER</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setBaseImageSrc('/banners/nosey-moon-mission.png');
                    setActiveAccessories({ glasses: false, verified: true });
                    window.scrollTo({ top: document.getElementById('studio')?.offsetTop, behavior: 'smooth' });
                  }}
                  className="px-3 h-11 bg-white hover:bg-gray-100 text-black border-4 border-black font-pixel text-[10px] flex items-center justify-center gap-1 shadow-pixel-sm"
                  title="Load into Meme Studio"
                >
                  <span>EDIT IN STUDIO</span>
                </button>
              </div>
            </div>

            {/* Banner 2: Degen Battle Station */}
            <div className="bg-arcade-chalk border-4 border-black p-5 shadow-pixel-lg flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-arcade-pink text-black border-2 border-black font-pixel text-[10px] px-2 py-0.5 font-bold">
                    💻 BANNER #2: 24/7 DEGEN STATION
                  </span>
                  <span className="font-pixel text-[9px] text-gray-600">1920x1080 HD</span>
                </div>
                <div className="border-4 border-black overflow-hidden bg-black shadow-pixel-sm group relative aspect-video">
                  <img
                    src="/banners/nosey-degen-battle-station.png"
                    alt="Nosey Cat Degen Trading Battle Station Banner"
                    className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="font-retro text-lg text-gray-800 leading-snug">
                  Nosey Cat curiously peeking over stacked CRT monitors streaming live parabolic green Solana charts, pizza box, steaming coffee, and pink <strong>$NOSEY / 0% TAX</strong> neon signs.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href="/banners/nosey-degen-battle-station-1080p.png"
                  download="nosey-cat-degen-battle-station-banner-1080p.png"
                  className="flex-1 h-11 bg-arcade-green text-black border-4 border-black font-pixel text-xs flex items-center justify-center gap-2 shadow-pixel-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 font-bold"
                >
                  <Download size={14} />
                  <span>DOWNLOAD BANNER</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setBaseImageSrc('/banners/nosey-degen-battle-station.png');
                    setActiveAccessories({ glasses: false, verified: true });
                    window.scrollTo({ top: document.getElementById('studio')?.offsetTop, behavior: 'smooth' });
                  }}
                  className="px-3 h-11 bg-white hover:bg-gray-100 text-black border-4 border-black font-pixel text-[10px] flex items-center justify-center gap-1 shadow-pixel-sm"
                  title="Load into Meme Studio"
                >
                  <span>EDIT IN STUDIO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
