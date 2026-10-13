"""Original Midify-ready scores and deterministic renders for Moonlight Hollow.
Creates complete ABC/MIDI scores, seamless OGG loops, MP3 browser fallbacks and musical SFX.
No third-party samples. Run from any directory with numpy, scipy and ffmpeg available.
"""
from pathlib import Path
import json, math, struct, subprocess, tempfile, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

BASE=Path(__file__).resolve().parents[1]/'games/moonlight-hollow/audio'
SCORES=BASE/'scores'; SCORES.mkdir(exist_ok=True)
SR=32000
PARTS=[('Celesta',8,'bell',.5),('Clarinet',71,'reed',-.22),('Flute',73,'flute',.3),('Low strings',48,'strings',-.38),('High strings',48,'strings',.38),('Pizzicato',45,'pluck',-.15),('Bassoon',70,'bass',0),('Fairground organ',20,'organ',.18),('Woodblock',115,'wood',-.35),('Starlight bells',9,'bell',-.45)]
SPECS={
 'village':('Lanterns at the Little Fair',84,'world',.58,.75),
 'woods':('Whispers Beyond the Pumpkins',74,'world',.27,.28),
 'garden':('Moonflowers and Mischief',80,'world',.48,.35),
 'library':('The Books That Whisper',70,'world',.22,.18),
 'tower':('Tick-Tock Moon Carnival',88,'world',.48,.58),
 'castle':('A Friendly Ghost at the Gate',76,'world',.36,.4),
 'exercise-woods':('Count the Firefly Lights',72,'exercise',.23,.2),
 'exercise-garden':('A Drop of Moonlight',74,'exercise',.28,.16),
 'exercise-library':('Letters in the Candlelight',68,'exercise',.16,.08),
 'exercise-tower':('The Clockmaker’s Riddle',76,'exercise',.22,.28),
 'exercise-castle':('The Secret of the Stars',70,'exercise',.23,.18),
 'carnival':('The Friendly Haunted Fair',98,'minigame',.68,.9),
 'broom-flight':('Brooms Above the Fairground',104,'minigame',.62,.58),
 'pumpkin-rally':('Pumpkin Wheels and Lanterns',110,'minigame',.82,.7),
 'train':('The Moon Express Waltzes On',94,'train',.58,.86),
 'festival':('The Lantern Fair Awakens',100,'celebration',.86,1),
}
# D minor with an occasional hopeful Dorian B and a softly resolving dominant.
HARMONY=[(50,53,57),(50,53,57),(55,58,62),(55,58,62),(46,50,53),(53,57,60),(45,52,57),(45,49,55),
         (50,53,57),(53,57,60),(48,52,55),(55,59,62),(46,50,53),(55,58,62),(45,50,57),(45,49,55)]
MOTIF=[(74,77,81,79),(77,76,74,69),(79,82,81,77),(76,77,74,72),
       (77,81,82,81),(81,79,77,76),(76,74,73,76),(73,76,69,73),
       (74,81,79,77),(77,79,81,84),(79,76,72,76),(79,83,81,79),
       (82,81,77,74),(79,77,74,70),(76,74,73,69),(73,76,77,73)]

def score(name):
 title,bpm,mode,energy,fun=SPECS[name]; bars=[[] for _ in PARTS]; prev=[57,69]
 for b,chord in enumerate(HARMONY):
  melody=MOTIF[b]; exercise=mode=='exercise'
  bars[0].append([(melody[0],1), (None,1),(melody[2],1),(melody[3],1)] if not exercise else [(melody[0],2),(None,1),(melody[3],1)])
  bars[1].append([(None,2),(melody[1]-12,1),(melody[3]-12,1)] if b%2 else [(melody[0]-12,3),(None,1)])
  bars[2].append([(None,2),(melody[2],2)] if b%4==2 else [(None,4)])
  for p,c in [(3,chord[1]),(4,chord[2]+12)]:
   options=[c-12,c,c+12]; pitch=min(options,key=lambda n:abs(n-prev[p-3])); prev[p-3]=pitch; bars[p].append([(pitch,4)])
  bars[5].append([(chord[0]+12,.5),(None,.5),(chord[2]+12,.5),(None,.5),(chord[1]+12,.5),(None,.5),(chord[2]+12,.5),(None,.5)] if not exercise else [(chord[0]+12,.5),(None,1.5),(chord[2]+12,.5),(None,1.5)])
  bars[6].append([(chord[0]-12,1.8),(None,.2),(chord[2]-12,1.8),(None,.2)])
  bars[7].append([(chord[1]+12,1.5),(None,.5),(chord[2]+12,1.5),(None,.5)] if fun>.5 else [(None,4)])
  bars[8].append([(62,.25),(None,1.75),(65,.25),(None,1.75)] if energy>.5 else [(None,4)])
  bars[9].append([(chord[2]+24,1),(None,3)] if b%4==0 else [(None,4)])
 return {'title':title,'bpm':bpm,'mode':mode,'energy':energy,'fairground':fun,'bars':bars}

def abc_note(n):
 if n is None:return 'z'
 pitch=['C','^C','D','_E','E','F','^F','G','_A','A','_B','=B'][n%12]; octave=n//12-1
 if octave>=5:pitch=pitch.lower()+"'"*(octave-5)
 elif octave<4:pitch+=','*(4-octave)
 return pitch
def abc_duration(d):
 return {4:'4',3:'3',2:'2',1:'',.5:'/2',.25:'/4',1.5:'3/2',1.75:'7/4',1.8:'9/5',.2:'/5'}[d]
def abc_suite(names):
 lines=['X:1','T:Moonlight Hollow — The Lantern Fair Suite','C:Original composition for Moonlight Hollow','M:4/4','L:1/4','Q:1/4=84','K:Dm']
 for i,(label,program,kind,pan) in enumerate(PARTS):lines.append(f'V:{i+1} name="{label}" clef='+('bass' if i in [3,6] else 'treble'))
 for i,(label,program,kind,pan) in enumerate(PARTS):
  lines += [f'V:{i+1}',f'%%MIDI program {program}','!mp!' if i not in [3,4,6,8,9] else '!p!']
  for name in names:
   data=score(name);lines += ['{'+name.replace('-','_')+'}',f'!t{data["bpm"]}!']
   for b,bar in enumerate(data['bars'][i]):
    body=[]
    for n,d in bar:
     tie='-' if i in [3,4] and b<15 and data['bars'][i][b+1][0][0]==n else ''
     body.append(abc_note(n)+abc_duration(d)+tie)
    lines.append('| '+' '.join(body))
   lines[-1]+=' |'
 return '\n'.join(lines)+'\n'

def vlq(n):
 out=[n&127];n>>=7
 while n:out.insert(0,(n&127)|128);n>>=7
 return bytes(out)
def midi(data):
 tracks=[]; tempo=round(60000000/data['bpm']); tracks.append(b'\0\xff\x51\x03'+tempo.to_bytes(3,'big')+b'\0\xff\x2f\0')
 for i,(_,program,_,pan) in enumerate(PARTS):
  channel=i if i<9 else i+1; events=[(0,bytes([0xc0|channel,program])),(0,bytes([0xb0|channel,10,round(64+pan*63)]))]
  for b,bar in enumerate(data['bars'][i]):
   beat=b*4
   for n,d in bar:
    if n is not None:events += [(round(beat*480),bytes([0x90|channel,n,55 if i in [3,4,6] else 68])),(round((beat+d)*480),bytes([0x80|channel,n,0]))]
    beat+=d
  events.sort(key=lambda e:(e[0],0 if e[1][0]&240==128 else 1));out=bytearray();last=0
  for at,message in events:out+=vlq(at-last)+message;last=at
  out+=vlq(64*480-last)+b'\xff\x2f\0';tracks.append(bytes(out))
 return b'MThd'+struct.pack('>IHHH',6,1,len(tracks),480)+b''.join(b'MTrk'+struct.pack('>I',len(t))+t for t in tracks)

def voice(note,duration,kind,sr=SR):
 release=.4 if kind in ['strings','flute','reed','organ'] else .14
 t=np.arange(round((duration+release)*sr),dtype=np.float64)/sr;f=440*2**((note-69)/12)
 vibrato=.003*np.sin(2*np.pi*4.7*t)*np.minimum(t/.35,1);phase=2*np.pi*f*(t+vibrato/(2*np.pi*4.7))
 if kind=='strings':wave=sum(np.sin(phase*h)/h**1.6 for h in range(1,8))+.18*np.sin(phase*1.003);attack=.14
 elif kind=='reed':wave=np.sin(phase)+.22*np.sin(phase*3)+.055*np.sin(phase*5);attack=.07
 elif kind=='flute':wave=np.sin(phase)+.06*np.sin(phase*2);attack=.13
 elif kind=='organ':wave=np.sin(phase)+.25*np.sin(phase*2)+.10*np.sin(phase*4);attack=.06
 elif kind=='bell':wave=sum(g*np.sin(2*np.pi*f*r*t)*np.exp(-t*k) for r,g,k in [(1,1,2.6),(2,.25,4),(3.01,.10,6)]);attack=.008
 elif kind=='pluck':wave=sum(np.sin(2*np.pi*f*h*t)/h**1.7 for h in range(1,6))*np.exp(-t*5);attack=.008
 elif kind=='wood':wave=np.sin(2*np.pi*f*t)*np.exp(-t*28)+.12*np.sin(2*np.pi*f*2.31*t)*np.exp(-t*40);attack=.002
 else:wave=np.sin(phase)+.13*np.sin(phase*2);attack=.07
 env=np.minimum(t/attack,1)*np.minimum(np.maximum((duration+release-t)/release,0),1)
 return (wave*env).astype(np.float32)

def add(buf,w,at,g,pan,sr=SR,wrap=True):
 v=w[:,None]*np.array([math.sqrt((1-pan)/2),math.sqrt((1+pan)/2)],dtype=np.float32)*g
 offset=round(at*sr)
 if wrap:np.add.at(buf,(np.arange(len(w))+offset)%len(buf),v)
 elif offset<len(buf):buf[offset:min(offset+len(w),len(buf))]+=v[:min(len(w),len(buf)-offset)]

def normalize(buf,loop):
 original=buf.copy()
 for delay,g in [(.083,.14),(.173,.10),(.317,.075),(.557,.045)]:
  n=round(delay*SR)
  if loop:buf+=np.roll(original[:,::-1],n,axis=0)*g
  elif n<len(buf):buf[n:]+=original[:-n,::-1]*g
 rms=float(np.sqrt(np.mean(buf**2)));peak=float(np.max(np.abs(buf)));buf*=min(.11/max(rms,1e-6),.68/max(peak,1e-6))
 n=64 if loop else min(round(.08*SR),len(buf));buf[:64]*=np.linspace(0,1,64)[:,None];buf[-n:]*=np.linspace(1,0,n)[:,None]
 return np.clip(buf,-.85,.85)

def render(data):
 beat=60/data['bpm'];buf=np.zeros((round(64*beat*SR),2),dtype=np.float32)
 for i,(_,_,kind,pan) in enumerate(PARTS):
  base=[.075,.045,.026,.035,.025,.043,.05,.028,.045,.017][i]
  gain=base*(.45+data['energy']*.55) if i not in [3,4,6] else base
  for b,bar in enumerate(data['bars'][i]):
   at=b*4
   for n,d in bar:
    if n is not None:add(buf,voice(n,d*beat,kind),at*beat,gain*(1+.035*math.sin(b+i)),pan)
    at+=d
 return normalize(buf,True)

manifest=json.loads((BASE/'manifest.json').read_text());manifest['version']=2;manifest['scoreProvenance']='Original multivoice Midify ABC suite, with deterministic local renders of the same notes; no third-party samples.'
for name in SPECS:
 if '--effects-only' in sys.argv:continue
 data=score(name);(SCORES/(name+'.mid')).write_bytes(midi(data));(SCORES/(name+'.abc')).write_text(abc_suite([name]));buf=render(data)
 stem='halloween-'+name
 with tempfile.NamedTemporaryFile(suffix='.wav') as temp:
  wavfile.write(temp.name,SR,(buf*32767).astype(np.int16))
  for ext,args in [('ogg',['-codec:a','libvorbis','-q:a','1']),('mp3',['-codec:a','libmp3lame','-b:a','64k'])]:subprocess.run(['ffmpeg','-v','error','-y','-i',temp.name,*args,str(BASE/(stem+'.'+ext))],check=True)
 manifest['music'][name]={'file':stem+'.ogg','fallback':stem+'.mp3','duration':round(len(buf)/SR,3),'loop':True,'bpm':data['bpm'],'bars':16,'instrument':'10-part celesta, woodwinds, legato strings, pizzicato and fairground organ','description':data['title'],'context':data['mode'],'score':'scores/'+name+'.mid','sampleRate':SR,'provenance':manifest['scoreProvenance']}
 print(name,data['bpm'],round(len(buf)/SR,1),'seconds',flush=True)

# Gentle musical feedback. The train whistle/vehicle/footstep Foley remains unchanged.
CUES={'pickup':([74,77],.42),'place':([77,74],.42),'hint':([69,74,76],.65),'retry':([77,76,74],.7),'ghost':([74,77,76,74],.9),'solve':([74,77,81,86],1.15),'lantern':([69,74,77,81],1.1),'path':([74,76,77,81,86],1.6),'chapter':([74,77,81,84,81,86],2.8),'festival':([74,77,81,86,89,86],2.8)}
for name,(notes,duration) in CUES.items():
 buf=np.zeros((round(duration*SR),2),dtype=np.float32);spacing=(duration-.22)/len(notes)
 for i,n in enumerate(notes):add(buf,voice(n,spacing*.82,'bell'),i*spacing,.16,(i/max(1,len(notes)-1)-.5)*.45,wrap=False)
 if name in ['solve','chapter','festival']:
  for n in [62,65,69]:add(buf,voice(n,duration*.75,'strings'),0,.025,0,wrap=False)
 buf=normalize(buf,False)
 wavfile.write(BASE/(name+'.wav'),22050,(np.clip(resample_poly(buf,441,640),-.85,.85)*32767).astype(np.int16))
 manifest['effects'][name].update(duration=duration,provenance='Original Midify-suite motif arranged as a gentle musical cue')
duration=.62;t=np.arange(round(duration*22050))/22050;rolling=np.zeros_like(t)
for at in [0,.155,.31,.465]:
 u=np.maximum(t-at,0);rolling+=(t>=at)*(.15*np.sin(2*np.pi*140*u)+.07*np.sin(2*np.pi*295*u))*np.exp(-u*48)
rolling*=np.minimum(t/.005,1)*np.minimum(np.maximum((duration-t)/.05,0),1)
wavfile.write(BASE/'train-roll.wav',22050,(np.column_stack([rolling,rolling*.93])*32767).astype(np.int16))
manifest['effects']['train-roll']={'file':'train-roll.wav','duration':duration,'loop':False,'provenance':'Original quiet wood-and-wheel rhythm; train whistle reserved for boarding and calling'}
(SCORES/'halloween-suite.abc').write_text(abc_suite(['village','exercise-library','carnival','train']))
(SCORES/'score-bank.json').write_text(json.dumps({name:score(name) for name in SPECS},separators=(',',':')))
(BASE/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
