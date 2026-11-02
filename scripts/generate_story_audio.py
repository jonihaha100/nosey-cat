import wave
import struct
import math
import os
import subprocess

SAMPLE_RATE = 44100
TOTAL_SECONDS = 26.0
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_SECONDS)

# Create empty stereo buffer
left_channel = [0.0] * TOTAL_SAMPLES
right_channel = [0.0] * TOTAL_SAMPLES

def clamp(v):
    return max(-1.0, min(1.0, v))

def add_tone(start_time, duration, freq_func, gain_func, wave_type='sine'):
    start_sample = int(start_time * SAMPLE_RATE)
    num_samples = int(duration * SAMPLE_RATE)
    phase = 0.0
    for i in range(num_samples):
        idx = start_sample + i
        if idx >= TOTAL_SAMPLES:
            break
        t = i / SAMPLE_RATE
        freq = freq_func(t)
        gain = gain_func(t)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        
        if wave_type == 'sine':
            sample = math.sin(phase)
        elif wave_type == 'triangle':
            sample = 2.0 * abs(2.0 * (phase / (2.0 * math.pi) - math.floor(phase / (2.0 * math.pi) + 0.5))) - 1.0
        elif wave_type == 'square':
            sample = 1.0 if (math.sin(phase) >= 0.0) else -1.0
        elif wave_type == 'sawtooth':
            sample = 2.0 * (phase / (2.0 * math.pi) - math.floor(0.5 + phase / (2.0 * math.pi)))
        else:
            sample = math.sin(phase)
            
        left_channel[idx] += sample * gain
        right_channel[idx] += sample * gain

# 1. Synthesize SFX matching src/utils/soundEffects.ts

# A. Laser Sound at t = 2.4s (playLaserSound)
# 2800Hz -> 130Hz downward chirp with sub-bass thump
def laser_freq(t):
    # exponential ramp from 2800 down to 130 in 0.2s
    progress = min(1.0, t / 0.2)
    return 2800.0 * math.pow(130.0 / 2800.0, progress)

def laser_gain(t):
    progress = min(1.0, t / 0.2)
    return 0.55 * (1.0 - progress)

add_tone(2.4, 0.22, laser_freq, laser_gain, 'sawtooth')
add_tone(2.4, 0.25, lambda t: 180.0 * math.pow(40.0 / 180.0, min(1.0, t / 0.25)), lambda t: 0.45 * (1.0 - min(1.0, t / 0.25)), 'square')

# B. Boop Sound at t = 7.2s (playBoopSound)
# Primary rising chirp 540Hz -> 1380Hz in 0.09s, decay in 0.15s
def boop1_freq(t):
    progress = min(1.0, t / 0.09)
    return 540.0 * math.pow(1380.0 / 540.0, progress)

def boop1_gain(t):
    progress = min(1.0, t / 0.15)
    return 0.65 * (1.0 - progress)

def boop2_freq(t):
    progress = min(1.0, t / 0.08)
    return 880.0 * math.pow(1760.0 / 880.0, progress)

def boop2_gain(t):
    progress = min(1.0, t / 0.12)
    return 0.45 * (1.0 - progress)

add_tone(7.2, 0.16, boop1_freq, boop1_gain, 'sine')
add_tone(7.2, 0.14, boop2_freq, boop2_gain, 'triangle')

# C. Coin Sound at t = 12.8s (playCoinSound)
# rising B5: 988Hz to E6: 1319Hz in square wave
def coin_freq(t):
    return 987.77 if t < 0.08 else 1318.51

def coin_gain(t):
    if t < 0.08:
        return 0.5
    progress = min(1.0, (t - 0.08) / 0.3)
    return 0.5 * (1.0 - progress)

add_tone(12.8, 0.38, coin_freq, coin_gain, 'square')

# D. Power Up Arpeggio at t = 17.5s (playPowerUpSound)
# Ascending arpeggio [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98]
power_freqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98]
step_dur = 0.05
for p_idx, f in enumerate(power_freqs):
    t_start = 17.5 + p_idx * step_dur
    add_tone(t_start, step_dur * 1.5, (lambda f_val: lambda t: f_val)(f), lambda t: 0.45 * (1.0 - min(1.0, t / (step_dur * 1.5))), 'square')

# E. Outro Boop at t = 23.5s
add_tone(23.5, 0.16, boop1_freq, boop1_gain, 'sine')
add_tone(23.5, 0.14, boop2_freq, boop2_gain, 'triangle')

# F. Subtle Typewriter Retro Dialogue Bips throughout dialogue typing
# Every 0.12s during text reveal
def add_bip(t):
    add_tone(t, 0.035, lambda _: 1200.0, lambda x: 0.15 * (1.0 - x/0.035), 'triangle')

# Dialogue intervals: [0.5-3.5], [5.6-8.6], [10.8-13.8], [16.0-19.0], [21.2-24.2]
for interval in [(0.5, 3.2), (5.5, 7.0), (10.8, 12.6), (16.0, 17.3), (21.2, 23.2)]:
    curr = interval[0]
    while curr < interval[1]:
        add_bip(curr)
        curr += 0.14

# 2. Write SFX to temporary WAV file
sfx_wav_path = "/tmp/story_sfx.wav"
with wave.open(sfx_wav_path, 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SAMPLE_RATE)
    frames = bytearray()
    for l, r in zip(left_channel, right_channel):
        int_l = int(clamp(l) * 32767)
        int_r = int(clamp(r) * 32767)
        frames.extend(struct.pack('<hh', int_l, int_r))
    wf.writeframes(frames)

print(f"Generated {sfx_wav_path} (duration: {TOTAL_SECONDS}s)")
