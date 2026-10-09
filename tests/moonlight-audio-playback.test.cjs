const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../games/moonlight-hollow/audio.js'),'utf8');
function harness({hold=false,blocked=false,sessionThrows=false}={}){
  const order=[],sources=[],nodes=[],requests=[],waiting=[],statuses=[],timers=[];
  class Param{constructor(value=1){this.value=value;}setTargetAtTime(v){this.value=v;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}cancelScheduledValues(){}}
  class Node{constructor(){this.connections=[];nodes.push(this);}connect(n){this.connections.push(n);}disconnect(){this.connections=[];}}
  class Context{
    constructor(){order.push('context');this.state='suspended';this.currentTime=0;this.sampleRate=48000;this.destination=new Node();Context.last=this;}
    createGain(){const n=new Node();n.gain=new Param();return n;}
    createDynamicsCompressor(){const n=new Node();for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();return n;}
    createAnalyser(){const n=new Node();n.fftSize=2048;n.getFloatTimeDomainData=a=>a.fill(.03);return n;}
    createStereoPanner(){const n=new Node();n.pan=new Param(0);return n;}
    createBuffer(){return{warm:true};}
    createBufferSource(){const n=new Node();n.start=()=>{n.started=true;sources.push(n);order.push(n.buffer.warm?'warm-start':'audio-start');};n.stop=()=>{n.stopped=true;n.onended?.();};return n;}
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
