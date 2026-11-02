import wave
import struct
import math
import os
import subprocess

SAMPLE_RATE = 44100
TOTAL_SECONDS = 26.0
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_SECONDS)

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

# A. Power Up Arpeggio on CRT Pump at t = 7.5s (playPowerUpSound)
power_freqs = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98]
step_dur = 0.05
for p_idx, f in enumerate(power_freqs):
    t_start = 7.5 + p_idx * step_dur
    add_tone(t_start, step_dur * 1.5, (lambda f_val: lambda t: f_val)(f), lambda t: 0.40 * (1.0 - min(1.0, t / (step_dur * 1.5))), 'square')

# B. Proof of Boop Chirp at t = 13.2s (playBoopSound)
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

add_tone(13.2, 0.16, boop1_freq, boop1_gain, 'sine')
add_tone(13.2, 0.14, boop2_freq, boop2_gain, 'triangle')

# C. Coin Sound for 100% LP Burn & 0% Tax at t = 17.8s (playCoinSound)
def coin_freq(t):
    return 987.77 if t < 0.08 else 1318.51

def coin_gain(t):
    if t < 0.08:
        return 0.45
    progress = min(1.0, (t - 0.08) / 0.3)
    return 0.45 * (1.0 - progress)

add_tone(17.8, 0.38, coin_freq, coin_gain, 'square')

# D. Outro Boop at t = 24.2s
add_tone(24.2, 0.16, boop1_freq, boop1_gain, 'sine')
add_tone(24.2, 0.14, boop2_freq, boop2_gain, 'triangle')

# E. Soft Typewriter Dialogue Bips
def add_bip(t):
    add_tone(t, 0.03, lambda _: 1100.0, lambda x: 0.12 * (1.0 - x/0.03), 'triangle')

for interval in [(0.4, 2.8), (5.8, 7.8), (11.4, 13.0), (16.8, 19.0), (21.8, 23.8)]:
    curr = interval[0]
    while curr < interval[1]:
        add_bip(curr)
        curr += 0.13

# Write to WAV and convert to M4A
sfx_wav_path = "/tmp/story_sfx_v2.wav"
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

subprocess.call(['afconvert', '-f', 'm4af', '-d', 'aac', sfx_wav_path, '/tmp/story_sfx_v2.m4a'])
print("Generated /tmp/story_sfx_v2.m4a successfully!")

