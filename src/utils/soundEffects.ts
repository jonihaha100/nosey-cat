// 8-Bit Web Audio API Synthesizer (Zero External Dependencies, High-Volume, Resilient)

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Audio Context Singleton with aggressive unlock on first user gesture
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Auto-unlock Web Audio on ANY user interaction (standard mobile browser compliance)
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'touchend', 'pointerdown', 'keydown'];
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}

export const getAudioMuteStatus = (): boolean => isMuted;

export const setAudioMuteStatus = (muted: boolean): void => {
  isMuted = muted;
};

export const toggleAudioMute = (): boolean => {
  isMuted = !isMuted;
  return isMuted;
};

// Safe audio executor that guarantees AudioContext is running before scheduling nodes
function playTone(builderFn: (ctx: AudioContext, startTime: number) => void) {
  if (isMuted) return;
  if (typeof window === 'undefined') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      try {
        builderFn(ctx, ctx.currentTime);
      } catch (err) {
        console.warn('Audio tone scheduling error:', err);
      }
    }).catch(() => {});
  } else {
    try {
      builderFn(ctx, ctx.currentTime);
    } catch (err) {
      console.warn('Audio tone scheduling error:', err);
    }
  }
}

/**
 * High-pitched bleep / meow-chirp sound for clicking the cat's nose (Boop)
 * Dual-layer: bright sine chirp + triangle harmonic pop + mobile haptic vibration
 */
export const playBoopSound = (): void => {
  // Mobile tactile feedback
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(35); } catch {}
  }

  playTone((ctx, now) => {
    // Primary rising chirp (540Hz -> 1380Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(540, now);
    osc1.frequency.exponentialRampToValueAtTime(1380, now + 0.09);

    gain1.gain.setValueAtTime(0.4, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Secondary retro arcade pop harmonic
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

    gain2.gain.setValueAtTime(0.28, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.12);
  });
};

/**
 * Classic 8-bit arcade coin sound (rising B5: ~988Hz to E6: ~1319Hz)
 */
export const playCoinSound = (): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(25); } catch {}
  }

  playTone((ctx, now) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.setValueAtTime(0.35, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.38);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  });
};

/**
 * 8-Bit rapid ascending power-up arpeggio for CHAOS MODE
 */
export const playPowerUpSound = (): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([20, 20, 20]); } catch {}
  }

  playTone((ctx, now) => {
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    const stepDuration = 0.05;

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + (idx * stepDuration);

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.005, noteTime + stepDuration * 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + stepDuration * 1.5);
    });
  });
};

/**
 * 8-Bit error / cancel sound
 */
export const playBuzzerSound = (): void => {
  playTone((ctx, now) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  });
};

/**
 * 8-Bit Sci-Fi Laser Beam Zap (High energy rapid frequency sweep)
 */
export const playLaserSound = (): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([30, 20, 45]); } catch {}
  }

  playTone((ctx, now) => {
    // Primary laser oscillator (rapid downward chirp 2800Hz -> 130Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(2800, now);
    osc1.frequency.exponentialRampToValueAtTime(130, now + 0.2);

    gain1.gain.setValueAtTime(0.38, now);
    gain1.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Sub-bass thump for laser impact
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain2.gain.setValueAtTime(0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.25);
  });
};
