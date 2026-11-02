import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Video,
  RotateCcw,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Flame,
  Lock,
} from 'lucide-react';
import { getAssetUrl } from '../utils/assets';
import { startSoundtrack, stopActiveSoundtrack } from '../utils/chiptuneSequencer';
import { playBoopSound, playCoinSound } from '../utils/soundEffects';

interface PromoTrailerStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoTrailerStudio: React.FC<PromoTrailerStudioProps> = ({
  isOpen,
  onClose,
}) => {
  // Studio Display Settings
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedCa, setCopiedCa] = useState<boolean>(false);

  // References
  const stageRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Sound Controller
  const chiptuneRef = useRef<{ stop: () => void } | null>(null);

  // Clean exit
  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setIsRecording(false);
    setCountdown(null);
    setPlaybackTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (chiptuneRef.current) {
      chiptuneRef.current.stop();
      chiptuneRef.current = null;
    }
    stopActiveSoundtrack();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignored
      }
    }
  }, []);

  // Frame ticker
  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    if (elapsed >= 20.0) {
      setPlaybackTime(20.0);
      setIsPlaying(false);
      if (chiptuneRef.current) {
        chiptuneRef.current.stop();
        chiptuneRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    setPlaybackTime(elapsed);
    animationFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Launch playback sequence after countdown
  const launchSequence = useCallback(
    (recordMode = false, stream?: MediaStream) => {
      setCountdown(null);
      setIsPlaying(true);
      setPlaybackTime(0);
      startTimeRef.current = performance.now();

      // Start 20s 8-Bit Chiptune Sequencer
      if (!isMuted) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();

          let recordingDestNode: AudioNode | undefined;
          if (recordMode && stream) {
            const dest = ctx.createMediaStreamDestination();
            recordingDestNode = dest;
            dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
          }

          chiptuneRef.current = startSoundtrack(ctx, recordingDestNode);
        } catch (err) {
          console.warn('[Studio] Audio sequencer startup error:', err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    },
    [isMuted, tick]
  );

  // Trigger 3-second countdown preview
  const handleStartPreview = () => {
    stopPlayback();
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        launchSequence(false);
      }
    }, 1000);
  };

  // Trigger recording via getDisplayMedia + MediaRecorder
  const handleStartRecording = async () => {
    stopPlayback();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('Browser Anda tidak mendukung perekaman getDisplayMedia. Gunakan Chrome, Edge, atau Brave desktop!');
        return;
      }

      // Prompt user to select this tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: 60,
        },
        audio: true,
      } as any);

      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kepo-promo-trailer-${aspectRatio === '16:9' ? 'landscape' : 'vertical'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Start countdown
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          launchSequence(true, stream);
        }
      }, 1000);
    } catch (err: any) {
      console.warn('[Studio] Recording canceled or failed:', err);
      setIsRecording(false);
      setCountdown(null);
    }
  };

  const handleCopyCa = () => {
    navigator.clipboard.writeText('COMING_SOON_ON_PUMPFUN');
    setCopiedCa(true);
    playCoinSound();
    setTimeout(() => setCopiedCa(false), 2000);
  };

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Scene Determinations (20.0s Total)
  const isScene1 = playbackTime >= 0.0 && playbackTime < 4.0;
  const isScene2 = playbackTime >= 4.0 && playbackTime < 10.0;
  const isScene3 = playbackTime >= 10.0 && playbackTime < 16.0;
  const isScene4 = playbackTime >= 16.0 && playbackTime <= 20.0;

  // Boop Count Progression in Scene 2 (from 58 to 9,999+)
  const boopProgress = Math.min(1, Math.max(0, (playbackTime - 4.0) / 5.8));
  const currentBoopCount = Math.floor(58 + Math.pow(boopProgress, 2.2) * 9941);

  // Scene 3 Card timings
  const showCard1 = playbackTime >= 10.5;
  const showCard2 = playbackTime >= 11.7;
  const showCard3 = playbackTime >= 12.9;
  const showCard4 = playbackTime >= 14.1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 overflow-y-auto font-pixel">
      {/* Studio Header Toolbar */}
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Top Control Bar (Hidden during countdown & play if recording to keep clean frame) */}
        <div
          className={`w-full bg-[#161D14] border-4 border-black p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-[6px_6px_0_#000] transition-opacity duration-300 ${
            (countdown !== null || isPlaying) && isRecording ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl">🎬</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs sm:text-sm font-bold tracking-wide">
                  AUTOMATED PROMO STUDIO
                </span>
                <span className="bg-[#C8F31D] text-black text-[9px] px-2 py-0.5 border border-black font-bold">
                  20s 16-BIT DIRECTOR
                </span>
              </div>
              <span className="text-[#8B9B85] text-[10px] font-mono">
                {isRecording ? '🔴 SEDANG MEREKAM TAB KE .WEBM' : 'SIAP PRODUKSI KONTEN VIRAL UNTUK X & TIKTOK'}
              </span>
            </div>
          </div>

          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-black p-1 border-2 border-[#283826]">
            <button
              onClick={() => {
                setAspectRatio('16:9');
                playBoopSound();
              }}
              className={`px-3 py-1 text-[10px] border border-black transition-all font-bold ${
                aspectRatio === '16:9'
                  ? 'bg-[#C8F31D] text-black shadow-[2px_2px_0_#2457D6]'
                  : 'bg-[#1a261a] text-[#8B9B85] hover:text-white'
              }`}
            >
              16:9 LANDSCAPE (X/TG)
            </button>
            <button
              onClick={() => {
                setAspectRatio('9:16');
                playBoopSound();
              }}
              className={`px-3 py-1 text-[10px] border border-black transition-all font-bold ${
                aspectRatio === '9:16'
                  ? 'bg-[#C8F31D] text-black shadow-[2px_2px_0_#2457D6]'
                  : 'bg-[#1a261a] text-[#8B9B85] hover:text-white'
              }`}
            >
              9:16 VERTICAL (SHORTS/TIKTOK)
            </button>
          </div>

          {/* Audio Mute & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-black border-2 border-[#283826] text-white hover:text-[#C8F31D]"
              title={isMuted ? 'Unmute BGM' : 'Mute BGM'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              onClick={handleClose}
              className="p-2 bg-red-600 hover:bg-red-500 text-white border-2 border-black shadow-[2px_2px_0_#000]"
              title="Close Studio (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            STAGE CANVAS / DISPLAY CONTAINER
            ========================================================================= */}
        <div
          ref={stageRef}
          className={`relative border-8 border-black bg-black overflow-hidden shadow-[12px_12px_0_#000] select-none transition-all duration-300 ${
            aspectRatio === '16:9'
              ? 'w-full max-w-[960px] aspect-video'
              : 'w-full max-w-[420px] aspect-[9/16]'
          }`}
          style={{ imageRendering: 'pixelated' }}
        >
          {/* CRT Scanlines Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-40 opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45) 2px, transparent 2px, transparent 4px)',
            }}
          />

          {/* Vignette Screen Glow */}
          <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_100px_rgba(0,0,0,0.85)]" />

          {/* ----------------------------------------------------
              COUNTDOWN OVERLAY (3... 2... 1...)
              ---------------------------------------------------- */}
          {countdown !== null && (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-6">
              <span className="text-[#8B9B85] text-xs mb-3 font-mono">
                {isRecording ? '🎬 PEREKAMAN DIMULAI DALAM:' : 'MEMULAI PREVIEW DALAM:'}
              </span>
              <span className="text-8xl sm:text-9xl text-[#C8F31D] font-black animate-pulse drop-shadow-[6px_6px_0_#FF4040]">
                {countdown}
              </span>
              <span className="text-white text-xs mt-4 bg-red-600 px-3 py-1 border-2 border-black font-bold">
                SIAPKAN FOKUS KE LAYAR RETRO!
              </span>
            </div>
          )}

          {/* ----------------------------------------------------
              IDLE POSTER / STANDBY SCREEN (BEFORE PLAY)
              ---------------------------------------------------- */}
          {!isPlaying && countdown === null && (
            <div className="absolute inset-0 z-20 bg-cover bg-center flex flex-col items-center justify-between p-6"
              style={{ backgroundImage: `url(${getAssetUrl('/banners/kepo-cyberpunk-alley-master.jpg')})` }}
            >
              <div className="bg-black/90 border-2 border-[#C8F31D] p-3 text-center shadow-[4px_4px_0_#000]">
                <div className="text-[#C8F31D] text-xs sm:text-sm font-bold tracking-wider">
                  KUCING KEPO ($KEPO) — PROMO DIRECTOR
                </div>
                <div className="text-white text-[10px] font-mono mt-1">
                  DURASI PRESISI: 20 DETIK • 16-BIT CHIPTUNE • SIAP EXPORT .WEBM
                </div>
              </div>

              <div className="bg-black/85 border-4 border-black p-4 text-center max-w-md shadow-[6px_6px_0_#000]">
                <p className="text-white text-xs sm:text-sm mb-3">
                  Pilih mode preview atau rekam langsung dari browser untuk menghasilkan video promosi siap upload ke Twitter/X, Telegram, dan TikTok!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={handleStartPreview}
                    className="py-2.5 px-4 bg-[#C8F31D] text-black text-xs font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 transition-all flex items-center gap-1.5"
                  >
                    <Play size={14} className="fill-black" />
                    <span>▶️ PUTAR PREVIEW (3s COUNTDOWN)</span>
                  </button>
                  <button
                    onClick={handleStartRecording}
                    className="py-2.5 px-4 bg-[#FF4040] text-white text-xs font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:bg-red-500 transition-all flex items-center gap-1.5"
                  >
                    <Video size={14} />
                    <span>🔴 REKAM & DOWNLOAD (.WEBM)</span>
                  </button>
                </div>
              </div>

              <div className="text-[10px] font-mono bg-black/80 text-[#8B9B85] px-3 py-1 border border-white/20">
                FRAME RATIO: {aspectRatio} • AUDIO: NATIVE WEB AUDIO API
              </div>
            </div>
          )}

          {/* =========================================================================
              SCENE 1 (00.0s – 04.0s): THE RUG PULL HOOK
              ========================================================================= */}
          {isPlaying && isScene1 && (
            <div className="absolute inset-0 bg-[#0c0914] flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Plunging Red Candlesticks Background */}
              <div className="absolute inset-0 opacity-30 flex items-end justify-around px-8 pb-12 pointer-events-none">
                <div className="w-4 bg-red-600 h-48 animate-pulse" />
                <div className="w-4 bg-red-700 h-64" />
                <div className="w-4 bg-red-600 h-32" />
                <div className="w-4 bg-red-800 h-80" />
                <div className="w-4 bg-red-500 h-40 animate-pulse" />
              </div>

              {/* Red Alert Header */}
              <div className="z-10 text-center mb-4">
                <div className="inline-block bg-red-600 text-white text-xs sm:text-base px-4 py-1.5 border-4 border-black shadow-[4px_4px_0_#000] animate-bounce font-bold tracking-wider mb-2">
                  ⚠️ CAPEK KENA RUG PULL & KOIN SLOP?!
                </div>
                <div className="text-red-400 font-mono text-[10px] sm:text-xs">
                  -99.8% JEET DUMP • DEV RUGGED IN 3 MINUTES
                </div>
              </div>

              {/* Glitch & Mascot Breakthrough at 2.0s */}
              {playbackTime >= 2.0 && (
                <div className="z-20 flex flex-col items-center animate-in zoom-in-75 duration-300">
                  {/* Comic Speech Bubble */}
                  <div className="bg-white text-black text-xs sm:text-sm px-4 py-2 border-4 border-black shadow-[4px_4px_0_#FF4040] mb-3 relative font-bold">
                    Dompet lu bau sangkut koin sebelah ya? 😼
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-4 border-b-4 border-black rotate-45" />
                  </div>

                  {/* Mascot Peeking In (Tilt Head -20deg) */}
                  <div className="w-36 sm:w-48 aspect-square relative -rotate-12 transition-transform scale-110">
                    <img
                      src={getAssetUrl('/mascot-pixel.png')}
                      alt="Kepo Cat Mascot"
                      className="w-full h-full object-contain pixelated drop-shadow-[6px_6px_0_#000]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              SCENE 2 (04.0s – 10.0s): THE NOSE BOOP TWIST
              ========================================================================= */}
          {isPlaying && isScene2 && (
            <div
              className="absolute inset-0 bg-[#4ADE80] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Top Banner */}
              <div className="bg-black text-[#C8F31D] text-xs sm:text-sm px-4 py-1.5 border-4 border-black shadow-[4px_4px_0_#000] font-bold">
                👆 RITUAL SAKRAL: PROOF-OF-BOOP!
              </div>

              {/* Center Cat Mascot with Squash-and-Stretch Bounce */}
              <div className="relative flex items-center justify-center my-auto">
                <div
                  className="w-44 sm:w-60 aspect-square relative transition-transform duration-100"
                  style={{
                    transform: `scale(${1 + Math.sin(playbackTime * 15) * 0.08}, ${
                      1 - Math.sin(playbackTime * 15) * 0.08
                    }) rotate(-15deg)`,
                  }}
                >
                  <img
                    src={getAssetUrl('/mascot-pixel.png')}
                    alt="Kepo Cat"
                    className="w-full h-full object-contain pixelated drop-shadow-[8px_8px_0_#000]"
                  />

                  {/* Glowing Pink Nose Target */}
                  <div className="absolute top-[38%] left-[46%] w-7 h-7 bg-[#FF4081] rounded-full animate-ping opacity-75 border-2 border-black" />

                  {/* Floating +1 BOOP! Particle */}
                  <div
                    className="absolute -top-4 right-2 bg-yellow-300 text-black text-xs font-black px-2 py-0.5 border-2 border-black shadow-[2px_2px_0_#000] animate-bounce"
                  >
                    +1 BOOP!
                  </div>
                </div>

                {/* Big Animated Pixel Hand Cursor */}
                <div
                  className="absolute z-30 pointer-events-none transition-all duration-75 text-4xl sm:text-5xl"
                  style={{
                    top: `${42 + Math.sin(playbackTime * 18) * 6}%`,
                    left: `${52 + Math.cos(playbackTime * 18) * 4}%`,
                  }}
                >
                  👆
                </div>
              </div>

              {/* Dynamic Boop Counter Box */}
              <div className="bg-black border-4 border-black p-3 text-center w-full max-w-sm shadow-[6px_6px_0_#2457D6]">
                <div className="text-[#8B9B85] text-[10px] font-mono tracking-wider">
                  TOTAL PROOF-OF-BOOPS:
                </div>
                <div className="text-2xl sm:text-3xl text-yellow-400 font-black tracking-widest">
                  {currentBoopCount.toLocaleString()}+
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              SCENE 3 (10.0s – 16.0s): CHAOS MODE & ANTI-RUG PROOF CARDS
              ========================================================================= */}
          {isPlaying && isScene3 && (
            <div
              className="absolute inset-0 bg-[#120a1f] flex flex-col items-center justify-between p-4 overflow-hidden"
              style={{
                transform: `translate(${Math.sin(playbackTime * 50) * 2}px, ${
                  Math.cos(playbackTime * 50) * 2
                }px)`,
              }}
            >
              {/* Rain of falling pixel cats in background */}
              <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-xl animate-bounce"
                    style={{
                      left: `${(i * 13) % 95}%`,
                      top: `${((playbackTime * 60 + i * 40) % 110) - 10}%`,
                    }}
                  >
                    😼
                  </div>
                ))}
              </div>

              {/* Top CHAOS: ON Badge */}
              <div className="z-10 flex items-center gap-2 bg-[#FF007A] text-white text-xs sm:text-sm px-4 py-1 border-4 border-black shadow-[4px_4px_0_#000] animate-pulse font-black">
                <Zap size={16} />
                <span>CHAOS MODE: ON (1000W LASER EYES)</span>
              </div>

              {/* Center 4 Anti-Rug Proof Cards */}
              <div className="z-20 w-full max-w-md my-auto space-y-2">
                {showCard1 && (
                  <div className="bg-[#101610] text-[#C8F31D] border-4 border-black p-2.5 flex items-center gap-3 shadow-[4px_4px_0_#000] animate-in slide-in-from-left duration-200">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold">SOLANA NETWORK — 100% COMMUNITY OWNED</div>
                      <div className="text-[9px] text-[#8B9B85] font-mono">Zero VC allocation • Stealth Genesis</div>
                    </div>
                  </div>
                )}

                {showCard2 && (
                  <div className="bg-[#101610] text-white border-4 border-black p-2.5 flex items-center gap-3 shadow-[4px_4px_0_#000] animate-in slide-in-from-right duration-200">
                    <ShieldCheck size={24} className="text-[#00FF66] shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#00FF66]">0% PAJAK TRANSAKSI (NO TAX)</div>
                      <div className="text-[9px] text-[#8B9B85] font-mono">0% Beli • 0% Jual • Bebas trading</div>
                    </div>
                  </div>
                )}

                {showCard3 && (
                  <div className="bg-[#101610] text-[#FF4040] border-4 border-black p-2.5 flex items-center gap-3 shadow-[4px_4px_0_#000] animate-in slide-in-from-left duration-200">
                    <Flame size={24} className="text-[#FF4040] shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold">LIKUIDITAS DIBAKAR PERMANEN</div>
                      <div className="text-[9px] text-[#8B9B85] font-mono">100% LP Burned to Void on Pump.fun</div>
                    </div>
                  </div>
                )}

                {showCard4 && (
                  <div className="bg-[#101610] text-[#FFD700] border-4 border-black p-2.5 flex items-center gap-3 shadow-[4px_4px_0_#000] animate-in slide-in-from-right duration-200">
                    <Lock size={24} className="text-[#FFD700] shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold">ALOKASI DEV DIKUNCI TRANSPARAN</div>
                      <div className="text-[9px] text-[#8B9B85] font-mono">Zero insider dumping • Proof on-chain</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom laser cat glance */}
              <div className="z-10 text-[10px] font-mono bg-black/80 text-white/90 px-3 py-1 border border-white/20">
                PUMP.FUN VERIFIED PROTOCOL • 1,000,000,000 $KEPO
              </div>
            </div>
          )}

          {/* =========================================================================
              SCENE 4 (16.0s – 20.0s): THE FOMO CALL TO ACTION
              ========================================================================= */}
          {isPlaying && isScene4 && (
            <div
              className="absolute inset-0 bg-[#0A0E0A] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 40%, rgba(200,243,29,0.15) 0%, transparent 60%)',
              }}
            >
              {/* Mascot With Thug Life Shades */}
              <div className="relative mt-2">
                <div className="w-28 sm:w-36 aspect-square relative -rotate-12">
                  <img
                    src={getAssetUrl('/mascot-pixel.png')}
                    alt="Kepo Cat Mascot"
                    className="w-full h-full object-contain pixelated drop-shadow-[6px_6px_0_#000]"
                  />
                  {/* Thug Life Shades Dropping on eyes */}
                  <div className="absolute top-[28%] left-[22%] -rotate-20 text-3xl sm:text-4xl animate-bounce">
                    🕶️
                  </div>
                </div>
              </div>

              {/* Title & Token Info */}
              <div className="text-center z-10">
                <h1 className="text-xl sm:text-3xl text-white font-black tracking-wider drop-shadow-[3px_3px_0_#2457D6] mb-1">
                  KUCING KEPO ($KEPO)
                </h1>
                <div className="inline-block bg-[#C8F31D] text-black text-[10px] sm:text-xs px-3 py-1 border-2 border-black font-bold mb-3 shadow-[3px_3px_0_#000]">
                  THE 16-BIT RETRO MEME COIN ON SOLANA
                </div>

                {/* CA Box */}
                <div className="bg-black border-4 border-black p-2 flex items-center justify-center gap-2 max-w-sm mx-auto shadow-[4px_4px_0_#000] mb-3">
                  <span className="text-[#8B9B85] font-mono text-xs select-all">
                    COMING_SOON_ON_PUMPFUN
                  </span>
                  <button
                    onClick={handleCopyCa}
                    className="px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-bold border border-black flex items-center gap-1"
                  >
                    {copiedCa ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedCa ? 'COPIED!' : 'COPY CA'}</span>
                  </button>
                </div>

                {/* CTA Callout */}
                <div className="bg-[#2457D6] text-white text-[10px] sm:text-xs px-4 py-2 border-2 border-black shadow-[4px_4px_0_#000] font-bold animate-pulse">
                  📢 GABUNG TELEGRAM UNTUK NOTIFIKASI CA RESMI SAAT LAUNCH!
                </div>
              </div>

              {/* Official Social Links */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-[#8B9B85]">
                <span>🌐 nosey-cat.vercel.app</span>
                <span>•</span>
                <span>🐦 @TheNoseyCat</span>
                <span>•</span>
                <span>💬 t.me/TheNoseyCat</span>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              PLAYHEAD / PROGRESS BAR (BOTTOM OF SCREEN)
              ---------------------------------------------------- */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60 z-40">
              <div
                className="h-full bg-[#C8F31D] transition-all duration-75"
                style={{ width: `${(playbackTime / 20.0) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* =========================================================================
            BOTTOM CONTROLLER & TIMELINE FOOTER
            ========================================================================= */}
        <div className="w-full bg-[#161D14] border-4 border-black p-3 mt-3 flex flex-wrap items-center justify-between gap-3 shadow-[6px_6px_0_#000]">
          {/* Timeline Timecode */}
          <div className="flex items-center gap-2 font-mono text-xs text-white">
            <span className="text-[#C8F31D] font-bold">TIMECODE:</span>
            <span className="bg-black px-2 py-1 border border-[#283826] text-yellow-400">
              {playbackTime.toFixed(1)}s / 20.0s
            </span>
            <span className="text-white/40">|</span>
            <span className="text-[#8B9B85] text-[10px]">
              {isScene1 && 'SCENE 1: RUG PULL HOOK'}
              {isScene2 && 'SCENE 2: NOSE BOOP TWIST'}
              {isScene3 && 'SCENE 3: CHAOS & PROOF'}
              {isScene4 && 'SCENE 4: FOMO OUTRO'}
              {!isPlaying && 'STANDBY'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isPlaying ? (
              <>
                <button
                  onClick={handleStartPreview}
                  className="py-2 px-3 bg-[#C8F31D] text-black text-xs font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:bg-yellow-300 transition-all flex items-center gap-1.5"
                >
                  <Play size={14} className="fill-black" />
                  <span>▶️ PUTAR PREVIEW (3s)</span>
                </button>
                <button
                  onClick={handleStartRecording}
                  className="py-2 px-3 bg-[#FF4040] text-white text-xs font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:bg-red-500 transition-all flex items-center gap-1.5"
                >
                  <Video size={14} />
                  <span>🔴 REKAM & DOWNLOAD (.WEBM)</span>
                </button>
              </>
            ) : (
              <button
                onClick={stopPlayback}
                className="py-2 px-3 bg-red-600 text-white text-xs font-bold border-2 border-black shadow-[3px_3px_0_#000] hover:bg-red-500 transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>⏹ STOP / RESET</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
