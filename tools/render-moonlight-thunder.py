"""Render a quiet original distant rumble; deterministic, no third-party samples."""
from pathlib import Path
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
root=Path(__file__).resolve().parents[1]/'games/moonlight-hollow/audio'
sr=22050;t=np.arange(sr*3)/sr;rng=np.random.default_rng(13102026)
noise=sosfilt(butter(3,[40,650],btype='bandpass',fs=sr,output='sos'),rng.normal(size=len(t)))
envelope=np.minimum(t/.35,1)*np.exp(-t*1.1)*np.minimum((3-t)/.3,1)**2
mono=noise*envelope;mono*=.45/max(abs(mono))
stereo=np.column_stack((mono,np.roll(mono,110)*.85));stereo[:220]*=np.linspace(0,1,220)[:,None];stereo[-1323:]*=np.linspace(1,0,1323)[:,None]**2
wavfile.write(root/'thunder.wav',sr,(stereo*32767).astype(np.int16))
p=root/'manifest.json';m=json.loads(p.read_text());m['effects']['thunder']={'file':'thunder.wav','duration':3,'description':'Original soft distant thunder rumble'};p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
