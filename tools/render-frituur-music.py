"""Reproduce the original Frit’Academy instrumental; no third-party samples.
Run from the repository root: python tools/render-frituur-music.py
Requires numpy, scipy and ffmpeg. Rendering is not required at runtime.
"""
from pathlib import Path
import hashlib
import json
import math
import subprocess
import tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parents[1] / 'games/frit-academy/audio'
SR, BPM, BARS = 22050, 112, 32
BEAT = 60 / BPM
rng = np.random.default_rng(10102026)
buf = np.zeros((round(BARS * 4 * BEAT * SR), 2), np.float32)

def voice(midi, duration, instrument):
    t = np.arange(round(duration * SR)) / SR
    f = 440 * 2 ** ((midi - 69) / 12)
    if instrument == 'accordion':
        # Detuned reed pairs, rounded harmonics and gently breathing bellows.
        phase = 2 * np.pi * f * t + .022 * np.sin(2 * np.pi * 5 * t)
        w = sum((np.sin(h * phase) + .65 * np.sin(h * phase * 1.003)) / h ** 1.65 for h in range(1, 9))
        w *= (.9 + .1 * np.sin(2 * np.pi * 2.3 * t)) * np.minimum(t / .028, 1)
    elif instrument == 'guitar':
        w = sum(np.sin(2 * np.pi * f * h * t + .15 * h) * np.exp(-t * (5 + h)) / h ** 1.7 for h in range(1, 8))
    elif instrument == 'bass':
        w = (np.sin(2 * np.pi * f * t) + .28 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 3.6)
    else:
        w = sum(g * np.sin(2 * np.pi * f * h * t) * np.exp(-t * decay) for h, g, decay in [(1, 1, 6), (2, .3, 9), (3, .12, 12)])
    w *= np.minimum(t / .008, 1) * np.clip((duration - t) / .06, 0, 1)
    return w.astype(np.float32)

def add(wave, beat, gain, pan=0):
    start = round(beat * BEAT * SR)
    values = wave[:, None] * np.array([math.sqrt((1 - pan) / 2), math.sqrt((1 + pan) / 2)]) * gain
    np.add.at(buf, (np.arange(len(wave)) + start) % len(buf), values)

# C6 / A7 / Dm7 / G7, F6 / C6 / Dm7-G7 / C6: an original musette swing.
chords = [(48, [60, 64, 67, 69]), (45, [61, 64, 67, 69]),
          (50, [60, 62, 65, 69]), (43, [59, 62, 65, 67]),
          (41, [60, 65, 69, 74]), (48, [60, 64, 67, 69]),
          (50, [60, 62, 65, 69]), (43, [59, 62, 65, 67])]
# Explicit 8-bar phrases with rests, repeated notes, and an answering B section.
a = [[(0, 76, .7), (1, 79, .45), (1.66, 81, .28), (2, 79, .8), (3, 76, .65)],
     [(0, 73, .8), (1.66, 76, .3), (2, 79, .65), (3, 81, .75)],
     [(0, 77, .6), (1, 74, .7), (2, 72, .8), (3, 74, .55)],
     [(0, 71, .6), (1, 74, .55), (2, 77, .6), (3, 79, .8)],
     [(0, 81, .85), (1.66, 79, .3), (2, 77, .7), (3, 74, .6)],
     [(0, 76, .65), (1, 79, .7), (2, 84, 1.25)],
     [(0, 81, .6), (1, 77, .6), (2, 74, .8), (3, 72, .6)],
     [(0, 71, .65), (1, 74, .55), (2, 79, .8), (3.66, 74, .27)]]
b = [[(0, 79, .8), (1, 76, .55), (2, 72, .65), (3, 76, .65)],
     [(0, 81, .8), (1.66, 79, .3), (2, 76, .7), (3, 73, .7)],
     [(0, 74, .55), (1, 77, .6), (2, 81, .85), (3, 84, .7)],
     [(0, 83, .75), (1.66, 81, .3), (2, 79, 1.3)],
     [(0, 77, .7), (1, 81, .55), (2, 86, .8), (3, 84, .55)],
     [(0, 79, .7), (1, 76, .6), (2, 72, 1.3)],
     [(0, 74, .7), (1, 77, .6), (2, 81, .55), (3, 74, .6)],
     [(0, 71, .6), (1, 74, .6), (2, 72, 1.2)]]
for bar in range(BARS):
    root, chord = chords[bar % 8]
    for beat in range(4):
        timing = rng.uniform(-.012, .012)
        add(voice(root if beat % 2 == 0 else root + 7, BEAT * .85, 'bass'), bar * 4 + beat + timing, .18, -.12)
        for j, pitch in enumerate(chord):
            add(voice(pitch, BEAT * .65, 'guitar'), bar * 4 + beat + .66 + j * .014, .04, -.4)
        t = np.arange(round(.12 * SR)) / SR
        brush = sosfilt(butter(2, 3500, fs=SR, btype='high', output='sos'), rng.normal(0, 1, len(t)))
        brush *= np.exp(-t * 38) * np.minimum(t / .004, 1)
        add(brush, bar * 4 + beat + .66, .014 if beat % 2 == 0 else .028, .4)
    phrase = a if bar < 8 or 16 <= bar < 24 else b
    for at, pitch, length in phrase[bar % 8]:
        add(voice(pitch, length * BEAT, 'accordion'), bar * 4 + at + rng.uniform(-.008, .008), .125, .12)
        if bar >= 24 and at == 0:
            add(voice(pitch + 12, .65 * BEAT, 'bell'), bar * 4 + at, .035, .4)

dry = buf.copy()
for delay, level in [(.071, .1), (.143, .07), (.277, .04)]:
    buf += np.roll(dry[:, ::-1], round(delay * SR), axis=0) * level
buf *= .78 / float(np.max(np.abs(buf)))
ROOT.mkdir(parents=True, exist_ok=True)
target = ROOT / 'frituur-swing.mp3'
with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
    wavfile.write(tmp.name, SR, (buf * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp.name, '-codec:a', 'libmp3lame', '-b:a', '96k', '-metadata', 'title=Frituur Swing', '-metadata', 'artist=FritAcademy', str(target)], check=True)
manifest = {'title': 'Frituur Swing', 'file': target.name, 'bpm': BPM, 'bars': BARS,
            'durationSeconds': round(len(buf) / SR, 3), 'loop': True, 'vocals': False,
            'instruments': ['procedural accordion reeds', 'plucked guitar', 'bass', 'brush percussion', 'bells'],
            'provenance': 'Original composition and deterministic synthesis made for FritAcademy. No third-party samples or external generation service.',
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({**manifest, 'bytes': target.stat().st_size}))
