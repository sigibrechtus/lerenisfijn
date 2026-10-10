const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../games/moonlight-hollow/audio.js'),'utf8');
function harness({hold=false,blocked=false,sessionThrows=false,spatial=false,legacy=false,weather=false}={}){
  const order=[],sources=[],nodes=[],requests=[],waiting=[],statuses=[],timers=[];
  class Param{constructor(value=1){this.value=value;}setTargetAtTime(v){this.value=v;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}}
  class Node{constructor(){this.connections=[];nodes.push(this);}connect(n){this.connections.push(n);}disconnect(){this.connections=[];}}
  class Context{
    constructor(){order.push('context');this.state='suspended';this.currentTime=0;this.sampleRate=48000;this.destination=new Node();if(spatial){this.listener=new Node();if(legacy){this.listener.setPosition=(...v)=>this.listener.position=v;this.listener.setOrientation=(...v)=>this.listener.orientation=v;}else for(const k of ['positionX','positionY','positionZ','forwardX','forwardY','forwardZ','upX','upY','upZ'])this.listener[k]=new Param(0);this.createPanner=()=>{const n=new Node();n.spatial=true;if(legacy)n.setPosition=(...v)=>n.position=v;else for(const k of ['positionX','positionY','positionZ'])n[k]=new Param(0);return n;};}if(!weather)this.createBiquadFilter=undefined;Context.last=this;}
    createGain(){const n=new Node();n.gain=new Param();return n;}
    createDynamicsCompressor(){const n=new Node();for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();return n;}
    createAnalyser(){const n=new Node();n.fftSize=2048;n.getFloatTimeDomainData=a=>a.fill(.03);return n;}
    createStereoPanner(){const n=new Node();n.pan=new Param(0);return n;}
    createBuffer(channels=1,length=1){return weather?{warm:length===1,getChannelData:()=>new Float32Array(length)}:{warm:true};}
    createBiquadFilter(){if(!weather)return null;const n=new Node();n.frequency=new Param();n.Q=new Param();return n;}
    createBufferSource(){const n=new Node();n.playbackRate=new Param();n.start=()=>{n.started=true;sources.push(n);order.push(n.buffer.warm?'warm-start':'audio-start');};n.stop=()=>{n.stopped=true;n.onended?.();};return n;}
    resume(){order.push('resume');if(!blocked)this.state='running';return Promise.resolve();}
    suspend(){this.state='suspended';return Promise.resolve();}
    close(){this.state='closed';return Promise.resolve();}
    decodeAudioData(){order.push('decode');return Promise.resolve({decoded:true});}
  }
  const prefs={music:45,effects:65,muted:false},session={};Object.defineProperty(session,'type',{set(value){order.push('session:'+value);if(sessionThrows)throw Error('unsupported setter');}});
  const sandbox={module:{exports:{}},AudioContext:Context,navigator:{audioSession:session},setTimeout:fn=>timers.push(fn),fetch:path=>{requests.push(path);order.push('fetch');const result={ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};return hold?new Promise(resolve=>waiting.push(()=>resolve(result))):Promise.resolve(result);}};
  vm.runInNewContext(source,sandbox);const audio=sandbox.module.exports.create({prefs:()=>prefs,status:(...args)=>statuses.push(args)});
  const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
  return{audio,prefs,order,sources,nodes,requests,waiting,statuses,timers,context:()=>Context.last,flush};
}
test('iOS playback session and silent source start happen synchronously before asynchronous loading',async()=>{
  const h=harness(),ready=h.audio.unlock();assert.deepEqual(h.order.slice(0,4),['session:playback','context','warm-start','resume']);assert(!h.order.includes('fetch'));assert.equal(await ready,true);await h.flush();assert.equal(h.audio.state().context,'running');
});
test('an unsupported audio-session setter does not prevent other browsers from playing',async()=>{const h=harness({sessionThrows:true});assert.equal(await h.audio.unlock(),true);assert.equal(await h.audio.testEffect('ui'),true);});
test('a browser that keeps its context suspended reports the block and does not claim playback',async()=>{const h=harness({blocked:true});assert.equal(await h.audio.unlock(),false);assert.equal(h.audio.state().unlocked,false);assert(h.statuses.some(v=>v[0]==='blocked'));assert.equal(h.requests.length,0);});
test('repeated world positions during a slow download share the same loop request',async()=>{
  const h=harness({hold:true});await h.audio.unlock();for(let i=0;i<20;i++)h.audio.position(0,0);for(const done of h.waiting.splice(0))done();await h.flush();assert.equal(h.requests.filter(v=>v==='audio/village.mp3').length,1);assert.equal(h.audio.state().music,'village');assert.equal(h.audio.state().ambience,'village');assert.equal(h.audio.state().loops,2);
});
test('returning to the current region cancels a slow pending transition',async()=>{
  const h=harness();await h.audio.unlock();await h.flush();const original=h.audio.state().music;assert.equal(original,'menu');h.context().decodeAudioData=()=>new Promise(resolve=>h.waiting.push(()=>resolve({decoded:true})));const travel=h.audio.setMusic('woods');await h.flush();await h.audio.setMusic(original);h.waiting.splice(0).forEach(fn=>fn());await travel;assert.equal(h.audio.state().music,original);
});
test('each audible source is routed to the destination through the volume buses',async()=>{
  const h=harness();await h.audio.unlock();await h.flush();await h.audio.play('ui',{pan:.5,force:true});
  function routed(n,seen=new Set()){if(n===h.context().destination)return true;if(seen.has(n))return false;seen.add(n);return n.connections.some(v=>routed(v,seen));}
  for(const n of h.sources.filter(v=>!v.buffer.warm))assert(routed(n));assert.equal(h.audio.state().voices,1);
});
test('suspending cancels an in-flight effect so it does not play later on resume',async()=>{
  const h=harness();await h.audio.unlock();await h.flush();h.context().decodeAudioData=()=>new Promise(resolve=>h.waiting.push(()=>resolve({decoded:true})));const effect=h.audio.play('train',{force:true});await h.flush();await h.audio.suspend();await h.audio.resume();h.waiting.splice(0).forEach(fn=>fn());assert.equal(await effect,false);assert.equal(h.audio.state().voices,0);
});
test('music volume changed from zero starts the previously selected music',async()=>{
  const h=harness();h.prefs.music=0;await h.audio.unlock();await h.flush();assert.equal(h.audio.state().music,undefined);h.prefs.music=45;h.audio.update();await h.flush();assert.equal(h.audio.state().music,'menu');
});
test('preview reports mute rather than a misleading success and verifies an output signal when enabled',async()=>{
  const h=harness();h.prefs.muted=true;assert.equal(await h.audio.testEffect('ui'),false);assert(h.statuses.some(v=>v[0]==='muted'));h.prefs.muted=false;assert.equal(await h.audio.testEffect('ui'),true);h.timers.splice(0).forEach(fn=>fn());assert(h.statuses.some(v=>v[0]==='signal'));
});

// Babylon's left-handed coordinates are reflected into Web Audio's right-handed space.
test('world source and listener use distance-aware HRTF with consistent handedness',async()=>{
 const h=harness({spatial:true});await h.audio.unlock();h.audio.listener({x:2,y:1.3,z:4},{x:0,y:0,z:1});
 assert.equal(await h.audio.play('train',{point:{x:8,y:2,z:10},force:true}),true);
 const n=h.nodes.find(n=>n.spatial),l=h.context().listener;assert.equal(n.panningModel,'HRTF');assert.equal(n.distanceModel,'inverse');assert.equal(n.refDistance,6);assert.equal(n.positionX.value,8);assert.equal(n.positionZ.value,-10);assert.equal(l.positionZ.value,-4);assert.equal(l.forwardZ.value,-1);assert.equal(l.upY.value,1);
 // The transformed camera-right direction remains audio-right, including a reversed view.
 assert((l.forwardY.value*l.upZ.value-l.forwardZ.value*l.upY.value)*(n.positionX.value-l.positionX.value)>0);
 h.audio.listener({x:2,y:1.3,z:4},{x:0,y:0,z:-1});assert.equal(l.forwardZ.value,1);
});
test('moving train source follows its emitter and is removed when stopped',async()=>{
 const h=harness({spatial:true});await h.audio.unlock();let p={x:1,y:2,z:3};await h.audio.play('train',{point:()=>p,force:true});const n=h.nodes.find(n=>n.spatial);p={x:12,y:2,z:30};h.audio.updateSpatial();assert.equal(n.positionX.value,12);assert.equal(n.positionZ.value,-30);
 await h.audio.suspend();p={x:99,y:2,z:99};h.audio.updateSpatial();assert.equal(n.positionX.value,12);assert.equal(n.connections.length,0);assert.equal(h.audio.state().voices,0);
});
test('spatial audio supports legacy position setters and stereo fallback',async()=>{
 const h=harness({spatial:true,legacy:true});await h.audio.unlock();h.audio.listener({x:1,y:2,z:3},{x:0,y:0,z:1});await h.audio.play('thunder',{point:{x:28,y:40,z:68},refDistance:80,force:true});const n=h.nodes.find(n=>n.spatial);assert.deepEqual(h.context().listener.position,[1,2,-3]);assert.deepEqual(n.position,[28,40,-68]);assert.equal(n.refDistance,80);
 const fallback=harness();await fallback.audio.unlock();assert.equal(await fallback.audio.play('train',{point:{x:2,y:0,z:3},pan:.4,force:true}),true);assert(fallback.nodes.some(n=>n.pan?.value===.4));
});
test('mute and in-flight cancellation also apply to spatial sounds',async()=>{
 const h=harness({spatial:true});await h.audio.unlock();await h.flush();h.prefs.muted=true;assert.equal(await h.audio.play('train',{point:{x:2,y:0,z:3},force:true}),false);assert(!h.nodes.some(n=>n.spatial));h.prefs.muted=false;
 h.context().decodeAudioData=()=>new Promise(resolve=>h.waiting.push(()=>resolve({decoded:true})));const effect=h.audio.play('thunder',{point:{x:28,y:40,z:68},force:true});await h.flush();await h.audio.suspend();await h.audio.resume();h.waiting.splice(0).forEach(fn=>fn());assert.equal(await effect,false);assert(!h.nodes.some(n=>n.spatial));
});

test('rain and wind loops use the effects volume, master mute, suspend and cleanup',async()=>{const h=harness({weather:true});h.audio.weather({rain:1,wind:.7});await h.audio.unlock();await h.flush();const noise=h.sources.filter(s=>s.buffer.getChannelData&&!s.buffer.warm);assert.equal(noise.length,2);for(const source of noise)assert(source.connections[0].gain.value>0);h.prefs.muted=true;h.audio.update();for(const source of noise)assert.equal(source.connections[0].gain.value,0);h.prefs.muted=false;await h.audio.suspend();assert.equal(h.audio.state().context,'suspended');await h.audio.resume();for(const source of noise)assert(source.connections[0].gain.value>0);h.audio.stop();assert.equal(h.audio.state().loops,0);assert(noise.every(s=>s.stopped));});

test('rally engine pitch follows speed with one loop and stops for mute, pause and leaving',async()=>{
 const h=harness({weather:true});assert.equal(h.audio.vehicle({active:true,speed:0,limit:6}),false);await h.audio.unlock();await h.flush();const initial=h.sources.length;
 assert(h.audio.vehicle({active:true,speed:0,limit:6}));const motor=h.sources.at(-1),idle=motor.playbackRate.value;for(let n=0;n<50;n++)h.audio.vehicle({active:true,speed:6,limit:6});assert.equal(h.sources.length,initial+1);assert(motor.playbackRate.value>idle);assert(h.audio.state().vehicle);
 h.prefs.muted=true;assert.equal(h.audio.vehicle({active:true,speed:6,limit:6}),false);assert(motor.stopped);assert(!h.audio.state().vehicle);h.prefs.muted=false;h.audio.vehicle({active:true,speed:3,limit:6});const second=h.sources.at(-1);await h.audio.suspend();assert(second.stopped);assert(!h.audio.state().vehicle);await h.audio.resume();h.audio.vehicle({active:true,speed:1,limit:6});const last=h.sources.at(-1);h.audio.vehicle(null);assert(last.stopped);assert(!h.audio.state().vehicle);
});
