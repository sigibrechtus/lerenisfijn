"""Original deterministic musical arrangements and sound design for Moonlight Hollow.
No samples, copyrighted compositions or external generation services.
Run from the repository root: python tools/render-moonlight-audio.py
"""
from pathlib import Path
import json, math, subprocess, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
ROOT=Path(__file__).resolve().parents[1]/'games/moonlight-hollow/audio'
ROOT.mkdir(parents=True,exist_ok=True)
SR=22050
rng=np.random.default_rng(7102026)
manifest={'version':1,'sampleRate':SR,'provenance':'Original compositions and deterministic procedural sound design; no third-party samples.','music':{},'ambience':{},'effects':{}}
def freq(m): return 440*2**((m-69)/12)
def voice(m,d,kind):
 t=np.arange(max(1,int(d*SR)))/SR;f=freq(m)
 if kind=='bell':
  a=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for r,g,k in [(1,1,1.8),(2,.32,3),(3,.12,5),(4.02,.08,7)])
 elif kind=='harp':
  a=sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(2.4+h*.6))/h**1.7 for h in range(1,7))
 elif kind=='flute':
  a=np.sin(2*np.pi*f*t+.004*f*np.sin(2*np.pi*4.5*t))+.14*np.sin(4*np.pi*f*t);a*=np.minimum(t/.1,1)*np.minimum((d-t)/.22,1)
 elif kind=='pad':
  a=sum(np.sin(2*np.pi*f*(h+(j-.5)*.002)*t)/(h**2) for h in [1,2,3] for j in [0,1]);a*=np.minimum(t/.35,1)*np.minimum((d-t)/.45,1)
 else:
  a=np.sin(2*np.pi*f*t)*np.exp(-t*2)+.18*np.sin(4*np.pi*f*t)*np.exp(-t*4)
 # Every voice has short silent attack/release to avoid discontinuities.
 a*=np.minimum(t/.012,1)*np.minimum((d-t)/.035,1)
 return a.astype(np.float32)
def add(buf,w,at,g=.1,pan=0,wrap=False):
 i=int(at*SR);n=len(w);v=w[:,None]*np.array([math.sqrt((1-pan)/2),math.sqrt((1+pan)/2)],np.float32)[None,:]*g
 if wrap:
  idx=(np.arange(n)+i)%len(buf);np.add.at(buf,idx,v)
 elif i<len(buf):buf[i:min(i+n,len(buf))]+=v[:min(n,len(buf)-i)]
def export(name,buf,category,meta=None,mp3=False,loop=False):
 peak=float(np.max(np.abs(buf)));buf*=min(1,.65/max(peak,.0001));buf=np.clip(buf,-.9,.9)
 if loop:
  # Wrap-added note/reverb tails form a continuous loop. Tiny boundary taper prevents encoder-edge clicks.
  n=128;buf[:n]*=np.linspace(.8,1,n)[:,None];buf[-n:]*=np.linspace(1,.8,n)[:,None]
 if not loop:
  n=min(int(.06*SR),len(buf));buf[-n:]*=np.linspace(1,0,n,dtype=np.float32)[:,None]**2
 pcm=(buf*32767).astype(np.int16)
 file=ROOT/(name+('.mp3' if mp3 else '.wav'))
 if mp3:
  with tempfile.NamedTemporaryFile(suffix='.wav') as tmp:
   wavfile.write(tmp.name,SR,pcm)
   subprocess.run(['ffmpeg','-loglevel','error','-y','-i',tmp.name,'-codec:a','libmp3lame','-b:a','96k',str(file)],check=True)
 else:wavfile.write(file,SR,pcm)
 manifest[category][name]={'file':file.name,'duration':round(len(buf)/SR,3),'loop':loop,**(meta or {})}
def reverb(buf,wrap=False):
 original=buf.copy()
 for delay,g in [(.127,.16),(.253,.11),(.409,.07)]:
  n=int(delay*SR)
  if wrap:buf+=np.roll(original[:,::-1],n,axis=0)*g
  else:buf[n:]+=original[:-n,::-1]*g
 return buf
# Eight complete 16-bar arrangements: one shared original motif, region-specific instrumentation and harmony.
tracks={
 'menu':(74,0,'bell',[0,4,7,9,7,4,2,7]),
 'village':(78,0,'harp',[0,4,7,9,7,4,2,0]),
 'woods':(70,-3,'flute',[0,3,7,10,7,5,3,2]),
 'garden':(82,2,'bell',[0,4,7,12,9,7,4,2]),
 'library':(68,0,'harp',[7,4,2,0,4,7,9,7]),
 'tower':(80,2,'bell',[0,7,4,9,7,2,4,0]),
 'castle':(66,-3,'flute',[0,3,7,5,3,2,0,7]),
 'festival':(88,0,'bell',[0,4,7,12,11,9,7,4])}
chords=[[0,4,7],[5,9,12],[9,12,16],[7,11,14]]
for name,(bpm,transpose,instrument,motif) in tracks.items():
 beat=60/bpm;dur=64*beat;buf=np.zeros((int(dur*SR),2),np.float32)
 for bar in range(16):
  root=48+transpose;chord=chords[(bar//2)%4]
  for tone in chord:add(buf,voice(root+tone,4*beat+.4,'pad'),bar*4*beat,.034,pan=(tone%3-1)*.28,wrap=True)
  for b in [0,2]:add(buf,voice(root-12+chord[0],1.8*beat,'bass'),(bar*4+b)*beat,.09,wrap=True)
  for b in range(4):
   pitch=root+12+chord[[0,1,2,1][b]];add(buf,voice(pitch,1.6*beat,'harp'),(bar*4+b+.5)*beat,.055,pan=(-1 if b%2 else 1)*.35,wrap=True)
  # Two melody phrases with rests and a varied answer phrase in bars 8–15.
  for j in [0,1,2]:
   if bar%4==3 and j==2:continue
   pitch=72+transpose+motif[(bar*2+j)%len(motif)]+(0 if bar<8 else (12 if bar%4==2 else 0))
   add(buf,voice(pitch,1.6*beat,instrument),(bar*4+j*1.25)*beat,.12 if instrument=='flute' else .11,pan=.1,wrap=True)
  if name in ['village','tower','festival']:
   for b in [0,2]:
    t=np.arange(int(.08*SR))/SR;wood=np.sin(2*np.pi*180*t)*np.exp(-t*70)+rng.normal(0,.12,len(t))*np.exp(-t*100)
    add(buf,wood.astype(np.float32),(bar*4+b)*beat,.022,pan=-.2,wrap=True)
 export(name,reverb(buf,True),'music',{'bpm':bpm,'bars':16,'instrument':instrument},mp3=True,loop=True)
# Six restrained looping environmental beds; effects volume controls them.
for name in ['village','woods','garden','library','tower','castle']:
 duration=12;buf=np.zeros((duration*SR,2),np.float32);noise=rng.normal(0,1,len(buf));filtered=sosfilt(butter(2,700,fs=SR,output='sos'),noise)
 mod=.8+.2*np.sin(np.arange(len(buf))/SR*2*np.pi/duration)
 for ch in range(2):buf[:,ch]=filtered*mod*.025
 if name in ['village','woods']:
  for at in [2,6,10]:add(buf,voice(76 if name=='village' else 64,.45,'flute'),at,.025,pan=-.5+at/12,wrap=True)
 if name=='garden':
  for at in [1,3,5,7,9,11]:add(buf,voice(87,.2,'bell'),at,.022,pan=math.sin(at)*.5,wrap=True)
 if name=='library':
  for at in [3,8]:
   t=np.arange(int(.5*SR))/SR;w=rng.normal(0,.04,len(t))*np.sin(np.pi*t/.5)**2;add(buf,w,at,.4,pan=.35,wrap=True)
 if name=='tower':
  for at in np.arange(0,duration,.75):add(buf,voice(50,.065,'harp'),at,.06,pan=.2,wrap=True)
 if name=='castle':
  add(buf,voice(45,12,'pad'),0,.04,pan=-.3,wrap=True);add(buf,voice(52,12,'pad'),0,.025,pan=.3,wrap=True)
 export('ambient-'+name,buf,'ambience',mp3=True,loop=True)
# One-shot Foley and magical interface sounds.
cues={
 'ui':[76], 'back':[72,67], 'pickup':[79,86], 'place':[72], 'remove':[67,64],
 'tile':[62], 'stone':[48], 'pour':[81,76], 'bubble':[60,67,72], 'bottle':[79],
 'letter':[74], 'page':[69,76], 'clock':[60], 'mirror':[84,79], 'pattern':[76,79],
 'hint':[72,79,76], 'retry':[69,72], 'solve':[72,76,79,84], 'lantern':[79,84,88],
 'path':[60,67,72,79], 'chapter':[60,64,67,72,76,79,84], 'festival':[60,64,67,72,79,84,88,91],
 'train':[55,62,67], 'ghost':[79,76,72], 'reset':[67,72], 'riddle':[76,79,84],
 'leaf':[69], 'footstep-stone':[43], 'footstep-leaves':[47], 'footstep-wood':[50]}
for name,notes in cues.items():
 dur=2.8 if name in ['chapter','festival'] else 1.5 if name in ['path','train'] else .95 if name in ['solve','lantern'] else .45
 buf=np.zeros((int(dur*SR),2),np.float32)
 for i,n in enumerate(notes):
  at=i*min(.13,dur/(len(notes)+1));instrument='bell' if name not in ['tile','stone','clock','train'] else 'harp'
  add(buf,voice(n,min(.7,dur-at),instrument),at,.2,pan=(i%3-1)*.15)
 if name in ['page','leaf','footstep-leaves','footstep-wood','footstep-stone','pour']:
  t=np.arange(int(min(.3,dur)*SR))/SR
  noise=rng.normal(0,1,len(t));cutoff=2500 if name in ['page','leaf','footstep-leaves'] else 650
  w=sosfilt(butter(2,cutoff,fs=SR,output='sos'),noise)*np.sin(np.pi*np.arange(len(t))/len(t))**2
  add(buf,w.astype(np.float32),0,.045)
 export(name,reverb(buf),'effects')
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'musicTracks':len(manifest['music']),'ambienceLoops':len(manifest['ambience']),'effects':len(manifest['effects']),'totalBytes':sum(f.stat().st_size for f in ROOT.iterdir())}))
