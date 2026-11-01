// 8-Bit Web Audio API Synthesizer (Zero External Dependencies)

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Audio Context Singleton with lazy unlock on user gesture
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const getAudioMuteStatus = (): boolean => isMuted;

export const setAudioMuteStatus = (muted: boolean): void => {
  isMuted = muted;
};

export const toggleAudioMute = (): boolean => {
  isMuted = !isMuted;
  return isMuted;
};

/**
 * High-pitched bleep / meow-chirp sound for clicking the cat's nose (Boop)
 */
export const playBoopSound = (): void => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    
    // Quick rising pitch chirp (480Hz -> 960Hz)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(1020, now + 0.08);

    // Envelope
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

/**
 * Classic 8-bit arcade coin sound (rising B5: ~988Hz to E6: ~1319Hz)
 */
export const playCoinSound = (): void => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';

    // Note 1: B5 (~987.77 Hz)
    osc.frequency.setValueAtTime(987.77, now);
    // Note 2: E6 (~1318.51 Hz) after 0.07s
    osc.frequency.setValueAtTime(1318.51, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

/**
 * 8-Bit rapid ascending power-up arpeggio for CHAOS MODE
 */
export const playPowerUpSound = (): void => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Frequencies: C5, E5, G5, B5, C6, E6, G6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    const stepDuration = 0.045;

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + (idx * stepDuration);

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + stepDuration * 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + stepDuration * 1.5);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

/**
 * 8-Bit error / cancel sound
 */
export const playBuzzerSound = (): void => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};

