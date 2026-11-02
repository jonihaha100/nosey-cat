/**
 * 8-Bit Chiptune Soundtrack & SFX Director
 * Pure Web Audio API procedural synthesis with zero external MP3 dependencies.
 * Routes to speakers and can bridge to MediaStreamAudioDestinationNode for video recording.
 */

export interface ChiptuneController {
  stop: () => void;
  audioContext: AudioContext;
}

let activeController: ChiptuneController | null = null;

export function stopActiveSoundtrack(): void {
  if (activeController) {
    try {
      activeController.stop();
    } catch {
      // Ignored
    }
    activeController = null;
  }
}

export function startSoundtrack(
  customCtx?: AudioContext,
  destinationNode?: AudioNode
): ChiptuneController {
  // Stop existing if running
  stopActiveSoundtrack();

  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = customCtx || new AudioContextClass();

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Master Gain Node
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

  // Connect to default output
  masterGain.connect(ctx.destination);

  // Connect to recording destination if provided
  if (destinationNode) {
    masterGain.connect(destinationNode);
  }

  const startTime = ctx.currentTime + 0.05;
  const scheduledNodes: (AudioScheduledSourceNode | NodeJS.Timeout)[] = [];
  const timeouts: NodeJS.Timeout[] = [];

  // Helper to schedule an 8-bit oscillator note
  const playNote = (
    type: OscillatorType,
    freq: number,
    time: number,
    duration: number,
    volume = 0.3
  ) => {
    if (time < ctx.currentTime) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.01);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + duration);
      scheduledNodes.push(osc);
    } catch {
      // Audio node scheduling error catch
    }
  };

  // Helper for 8-bit noise burst (TV Glitch & Snares)
  const playNoise = (time: number, duration: number, volume = 0.25) => {
    if (time < ctx.currentTime) return;
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noise.start(time);
      scheduledNodes.push(noise);
    } catch {
      // Ignored
    }
  };

  // Helper for 8-bit Cat Meow / Pitch Glide
  const playCatMeow = (time: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, time); // D5
      osc.frequency.exponentialRampToValueAtTime(880, time + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(659.25, time + 0.45); // E5

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + 0.45);
      scheduledNodes.push(osc);
    } catch {
      // Ignored
    }
  };

  // Helper for 8-bit Laser Sweep
  const playLaser = (time: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, time);
      osc.frequency.exponentialRampToValueAtTime(120, time + 0.2);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(time);
      osc.stop(time + 0.2);
      scheduledNodes.push(osc);
    } catch {
      // Ignored
    }
  };

  // Helper for 8-bit Coin Ring
  const playCoinRing = (time: number) => {
    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(987.77, time); // B5
      osc1.frequency.setValueAtTime(1318.51, time + 0.08); // E6

      osc2.frequency.setValueAtTime(1318.51, time);
      osc2.frequency.setValueAtTime(1760.0, time + 0.08);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(time);
      osc1.stop(time + 0.4);
      osc2.start(time);
      osc2.stop(time + 0.4);

      scheduledNodes.push(osc1, osc2);
    } catch {
      // Ignored
    }
  };

  // =========================================================================
  // 1. BEAT 0s - 4s: INTRO SUSPENSE (Rug Pull Heartbeat & TV Glitch)
  // =========================================================================
  const t0 = startTime;
  // Pulsing deep tension bass (E1, 41.2Hz / A1, 55Hz)
  const suspenseBass = [41.2, 41.2, 49.0, 41.2, 36.7, 41.2, 55.0, 41.2];
  suspenseBass.forEach((f, idx) => {
    playNote('triangle', f, t0 + idx * 0.45, 0.35, 0.4);
    playNoise(t0 + idx * 0.45, 0.06, 0.1);
  });

  // Glitch static at 2.2s
  playNoise(t0 + 2.2, 0.45, 0.35);

  // Cat sniff/meow at 2.8s when mascot breaks through
  playCatMeow(t0 + 2.8);

  // =========================================================================
  // 2. BEAT 4s - 10s: ARCADE GROOVE (140 BPM Nose Boop Melody)
  // =========================================================================
  const t4 = startTime + 4.0;
  // 140 BPM = ~0.428s per beat, 16th note = ~0.107s
  const arpeggioNotes = [
    261.63, 329.63, 392.0, 523.25, 392.0, 329.63, // C4 - E4 - G4 - C5 - G4 - E4
    293.66, 369.99, 440.0, 587.33, 440.0, 369.99, // D4 - F#4 - A4 - D5 - A4 - F#4
    329.63, 392.0, 493.88, 659.25, 493.88, 392.0, // E4 - G4 - B4 - E5 - B4 - G4
    392.0, 493.88, 587.33, 783.99, 587.33, 493.88, // G4 - B4 - D5 - G5 - D5 - B4
    261.63, 329.63, 392.0, 523.25, 392.0, 329.63,
    293.66, 369.99, 440.0, 587.33, 440.0, 369.99,
  ];

  arpeggioNotes.forEach((f, idx) => {
    playNote('square', f, t4 + idx * 0.16, 0.14, 0.2);
  });

  // Repeating high-pitch Nose Boop chirps every ~0.4s (15 boops across 6 seconds)
  for (let i = 0; i < 15; i++) {
    const boopTime = t4 + i * 0.4;
    playNote('sine', 1174.66, boopTime, 0.12, 0.35); // D6 boop chirp
    playNote('triangle', 1318.51, boopTime + 0.05, 0.08, 0.25); // E6 sparkle
    // Kick on every other boop
    if (i % 2 === 0) {
      playNote('triangle', 65.41, boopTime, 0.18, 0.5);
    }
  }

  // =========================================================================
  // 3. BEAT 10s - 16s: CHAOS OVERDRIVE & ANTI-RUG CARDS
  // =========================================================================
  const t10 = startTime + 10.0;

  // Power-Up Sweep at 10.0s
  try {
    const powerUp = ctx.createOscillator();
    const pGain = ctx.createGain();
    powerUp.type = 'sawtooth';
    powerUp.frequency.setValueAtTime(220, t10);
    powerUp.frequency.exponentialRampToValueAtTime(1760, t10 + 0.8);
    pGain.gain.setValueAtTime(0.001, t10);
    pGain.gain.linearRampToValueAtTime(0.3, t10 + 0.2);
    pGain.gain.exponentialRampToValueAtTime(0.001, t10 + 0.8);
    powerUp.connect(pGain);
    pGain.connect(masterGain);
    powerUp.start(t10);
    powerUp.stop(t10 + 0.8);
    scheduledNodes.push(powerUp);
  } catch {
    // Ignored
  }

  // 4 Anti-Rug cards slamming every 1.2s (at 10.0s, 11.2s, 12.4s, 13.6s, 14.8s)
  const cardTimes = [10.0, 11.2, 12.4, 13.6, 14.8];
  cardTimes.forEach((sec) => {
    const cTime = startTime + sec;
    // Heavy sub-bass impact
    playNote('triangle', 55.0, cTime, 0.3, 0.6);
    playNote('square', 110.0, cTime, 0.15, 0.4);
    playNoise(cTime, 0.18, 0.35);

    // Pew-pew laser beam firing simultaneously
    playLaser(cTime + 0.1);
  });

  // Fast driving 16-bit bassline across Chaos mode
  for (let k = 0; k < 24; k++) {
    const bassTime = t10 + k * 0.24;
    const baseFreq = k % 4 === 0 ? 98.0 : 82.4;
    playNote('sawtooth', baseFreq, bassTime, 0.15, 0.25);
  }

  // =========================================================================
  // 4. BEAT 16s - 20s: BOSS VICTORY OUTRO & COIN JACKPOT
  // =========================================================================
  const t16 = startTime + 16.0;

  // Victory Fanfare (Arcade Jackpot): C5 -> E5 -> G5 -> C6 high sustain
  const victoryNotes = [
    { f: 523.25, d: 0.18, offset: 0.0 }, // C5
    { f: 659.25, d: 0.18, offset: 0.2 }, // E5
    { f: 783.99, d: 0.18, offset: 0.4 }, // G5
    { f: 1046.5, d: 0.65, offset: 0.6 }, // C6
    { f: 880.0, d: 0.25, offset: 1.3 }, // A5
    { f: 1046.5, d: 0.8, offset: 1.6 }, // C6 sustain
  ];

  victoryNotes.forEach((n) => {
    playNote('square', n.f, t16 + n.offset, n.d, 0.32);
    playNote('sawtooth', n.f * 0.5, t16 + n.offset, n.d, 0.2);
  });

  // Rapid cascading coin rings from 17.5s to 20.0s
  for (let c = 0; c < 8; c++) {
    playCoinRing(t16 + 1.8 + c * 0.26);
  }

  // Final victory bass boom
  playNote('triangle', 65.41, t16 + 0.6, 1.2, 0.5);

  const controller: ChiptuneController = {
    audioContext: ctx,
    stop: () => {
      scheduledNodes.forEach((node) => {
        if ('stop' in node) {
          try {
            node.stop();
          } catch {
            // Ignored
          }
        }
      });
      timeouts.forEach(clearTimeout);
      masterGain.disconnect();
    },
  };

  activeController = controller;
  return controller;
}
