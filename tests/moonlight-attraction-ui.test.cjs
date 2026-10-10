/* Run the real optional-adventure DOM controller and game sessions with DOM/scene doubles.
   These tests verify integration behavior, not browser layout or GPU rendering. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Games=require('../games/moonlight-hollow/mini-games.js'),Destinations=require('../games/moonlight-hollow/destinations.js');
const source=fs.readFileSync(path.join(__dirname,'../games/moonlight-hollow/attraction-ui.js'),'utf8');
function harness(){
 const elements=new Map(),events={},documentEvents={},profiles=[{id:'one',campaign:{completed:[1,2]},attractions:{}},{id:'two',campaign:{completed:[3]},attractions:{}}];
 let current=0,blocked=false,mode='third',external=false,saveCount=0,resetCount=0,leaveCount=0,failStart=false,failCreate=false;
 const prefs={lang:'nl',difficulty:'auto',quality:'low',motion:true},runtimeCalls=[],music=[],motors=[];
 function element(id='',tagName='DIV'){
  const classes=new Set(),listeners={};
  return {id,tagName,children:[],dataset:{},hidden:false,disabled:false,textContent:'',options:[{},{}],attributes:{},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)},append(x){this.children.push(x);},replaceChildren(...children){this.children=children;},querySelectorAll(){return this.children;},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){(listeners[k]??=[]).push(fn);},dispatch(k,e){for(const fn of listeners[k]||[])fn(e);},focus(){doc.activeElement=this;},close(){this.closed=true;}};
 }
 const doc={body:element('body'),hidden:false,activeElement:null,createElement:tag=>element('',tag.toUpperCase()),addEventListener:(k,fn)=>documentEvents[k]=fn};
 const $=id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id);};
 for(const [name,axis,value]of [['left','x',-1],['right','x',1],['forward','z',1],['back','z',-1],['up','y',1],['down','y',-1]]){const b=$('mini-'+name);b.tagName='BUTTON';b.dataset={axis,value:String(value)};$('mini-driving').append(b);}
 const world={hero:{position:{x:0,z:0}},scene:{activeCamera:{name:'explorer'}},viewMode:()=>mode,view:v=>mode=v,resetInput(){resetCount++;},railState:()=>({station:2}),start(p,station){this.hero.position={...p};this.lastStation=station;},externalActivity(v){external=v;this.scene.activeCamera={name:v?'pending':'explorer',mode};}};
 const destinationCalls={language:[],ticks:[]};
 const win={BABYLON:{Vector3:{Up:()=>({}),TransformNormal:()=>({normalize:()=>({})})}},addEventListener:(k,fn)=>events[k]=fn,MoonMiniGames:Games,MoonDestinations:{sites:Destinations.sites,create:()=>({nearest:Destinations.nearest,language:l=>destinationCalls.language.push(l),tick:(...args)=>destinationCalls.ticks.push(args)})},MoonMiniGameWorld:{create(options){if(failCreate)throw Error('create');const rt={options,inputCalls:[],disposed:false,start(id,config){if(failStart)throw Error('start');this.id=id;this.config=config;this.previous=world.scene.activeCamera;world.scene.activeCamera={name:'mini',computeWorldMatrix(){},getForwardRay:()=>({direction:{}}),getWorldMatrix:()=>({})};this.game=Games.create(id,config);options.onUpdate(this.game.snapshot());},action(id){const snap=this.game.action(id);options.onUpdate(snap);if(snap.completed)options.onComplete(snap);},input(...axes){this.inputCalls.push(axes);},refit(){},tick(dt){this.lastTick=dt;},dispose(){this.disposed=true;world.scene.activeCamera=this.previous;}};runtimeCalls.push(rt);return rt;}}};
 vm.runInNewContext(source,{window:win,document:doc,console:{error(){}}});
 const controller=win.MoonAttractions.attach({$,world,prefs:()=>prefs,profile:()=>profiles[current],save:()=>saveCount++,blocked:()=>blocked,leaveCampaign:()=>leaveCount++,soundtrack:{vehicle:s=>motors.push(s),weather(){},setMusic:(...args)=>music.push(args),position(){}},effect(){},frame:()=>({width:1,height:1})});
 function finish(){const rt=runtimeCalls.at(-1);while(!rt.game.snapshot().completed){const s=rt.game.snapshot();if(s.id==='potions'){for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)rt.action('add:'+i);rt.action('check');}else{for(const id of s.task.solution)rt.action(id);if(['garden','railway'].includes(s.id))rt.action('check');}}return rt.game.snapshot();}
 return {$,doc,prefs,profiles,world,events,controller,runtimeCalls,destinationCalls,music,motors,finish,setProfile:i=>current=i,setBlocked:v=>blocked=v,setFailStart:v=>failStart=v,setFailCreate:v=>failCreate=v,get saved(){return saveCount;},get resets(){return resetCount;},get external(){return external;},get campaignLeaves(){return leaveCount;}};
}
test('six map destinations require a started journey and offer entry after travel',()=>{
 const h=harness();assert.equal(h.$('attraction-map').children.length,6);assert(h.$('attraction-map').children.every(b=>b.disabled));assert.equal(h.controller.enter('mansion'),false);
 h.controller.start();assert(h.$('attraction-map').children.every(b=>!b.disabled));h.$('attraction-map').children[4].onclick();assert.deepEqual(h.world.hero.position,Destinations.sites.railway.entry);assert.equal(h.world.lastStation,2);assert.equal(h.campaignLeaves,1);assert.equal(h.controller.active,null);assert.equal(h.controller.near,'railway');assert.equal(h.$('attraction-offer').hidden,false);assert(h.$('journal').closed);assert(h.resets>0);
});
test('landmark offers follow proximity and are hidden while paused or in campaign/train modes',()=>{
 const h=harness();h.controller.start();h.world.hero.position={...Destinations.sites.broom.entry};h.controller.frame(.02,{blocked:false,mode:'world'});assert.equal(h.controller.near,'broom');assert.equal(h.$('attraction-offer').hidden,false);
 for(const status of [{blocked:true,mode:'world'},{blocked:false,mode:'puzzle'},{blocked:false,mode:'ride'}]){h.controller.frame(.02,status);assert.equal(h.controller.near,null);assert(h.$('attraction-offer').hidden);h.controller.frame(.02,{blocked:false,mode:'world'});assert.equal(h.controller.near,'broom');}
 h.controller.enter();assert(h.$('attraction-offer').hidden);assert.equal(h.controller.active,'broom');assert(h.doc.body.classList.contains('mini-game-mode'));assert(h.external);
});
test('all six completions save once per session and leave campaign/profile data isolated',()=>{
 const h=harness();h.controller.start();const campaigns=JSON.stringify(h.profiles.map(p=>p.campaign));
 for(const id of Object.keys(Games.catalog)){assert(h.controller.enter(id));const done=h.finish(),rt=h.runtimeCalls.at(-1);rt.options.onComplete(done);assert.equal(h.profiles[0].attractions[id].sessions,1);assert.equal(h.profiles[0].attractions[id].bestLevel,1);assert.match(h.profiles[0].attractions[id].lastPlayed,/^\d{4}-/);h.controller.leave();}
 assert.equal(h.$('mini-progress').textContent,'★ Drie rondes gelukt');assert.equal(h.saved,6);assert.deepEqual(h.profiles[1].attractions,{});assert.equal(JSON.stringify(h.profiles.map(p=>p.campaign)),campaigns);
 h.setProfile(1);h.controller.enter('mansion');h.finish();h.controller.leave();assert.equal(h.profiles[1].attractions.mansion.sessions,1);assert.equal(h.profiles[0].attractions.mansion.sessions,1);assert.equal(h.saved,7);
});
test('replay advances automatic difficulty, caps at three, and honors explicit difficulty',()=>{
 const h=harness();h.controller.start();h.controller.enter('mansion');assert.equal(h.runtimeCalls.at(-1).config.level,1);h.finish();h.$('mini-replay').onclick();assert.equal(h.runtimeCalls.at(-1).config.level,2);h.finish();h.$('mini-replay').onclick();assert.equal(h.runtimeCalls.at(-1).config.level,3);h.finish();h.$('mini-replay').onclick();assert.equal(h.runtimeCalls.at(-1).config.level,3);h.controller.leave();h.prefs.difficulty='1';h.controller.enter('mansion');assert.equal(h.runtimeCalls.at(-1).config.level,1);h.finish();assert.equal(h.profiles[0].attractions.mansion.bestLevel,3);
});
test('leaving disposes the arena, clears held input, and restores exploration and editing',()=>{
 const h=harness();h.controller.start();h.$('view-toggle').onclick();assert.equal(h.world.viewMode(),'first');h.controller.enter('broom');const rt=h.runtimeCalls.at(-1);assert.equal(h.world.scene.activeCamera.name,'mini');assert(h.$('language').disabled);assert(h.$('view-toggle').disabled);assert(h.$('view').disabled);
 h.$('mini-left').onpointerdown({button:0,pointerId:7,preventDefault(){}});assert.deepEqual(rt.inputCalls.at(-1),[-1,0,0]);h.controller.leave();assert(rt.disposed);assert.deepEqual(rt.inputCalls.at(-1),[0,0,0]);assert.equal(h.world.scene.activeCamera.name,'explorer');assert.equal(h.world.viewMode(),'first');assert.equal(h.external,false);assert.equal(h.controller.active,null);assert(h.$('mini-panel').hidden);assert(!h.doc.body.classList.contains('mini-game-mode'));assert(!h.$('mini-left').classList.contains('held'));assert(!h.$('language').disabled);assert(!h.$('view-toggle').disabled);assert(!h.$('view').disabled);assert.equal(h.saved,0);
});
test('French language reaches sessions, labels, map and landmark signs; pause neutralizes driving',()=>{
 const h=harness();h.prefs.lang='fr';h.controller.localize();h.controller.start();assert.equal(h.$('attraction-map-title').textContent,'Six aventures supplémentaires');assert.match(h.$('attraction-map').children[0].textContent,/manoir lunaire/);assert.equal(h.destinationCalls.language.at(-1),'fr');h.controller.enter('rally');const rt=h.runtimeCalls.at(-1);assert.equal(rt.config.lang,'fr');assert.equal(h.$('mini-title').textContent,Games.catalog.rally.name.fr);h.$('mini-forward').onpointerdown({button:0,pointerId:1,preventDefault(){}});h.setBlocked(true);h.controller.frame(.02,{blocked:true,mode:'world'});assert.deepEqual(rt.inputCalls.at(-1),[0,0,0]);assert.equal(rt.lastTick,undefined);h.setBlocked(false);h.controller.frame(.02,{blocked:false,mode:'world'});assert.equal(rt.lastTick,.02);h.finish();assert.equal(h.$('mini-progress').textContent,'★ Trois manches réussies');
});
test('runtime start failure returns to exploration and allows retry',()=>{
 const h=harness();h.controller.start();h.setFailStart(true);assert.equal(h.controller.enter('mansion'),false);assert.equal(h.controller.active,null);assert.equal(h.external,false);assert(!h.$('language').disabled);assert(h.runtimeCalls.at(-1).disposed);assert.match(h.$('lumi-line').textContent,/kon niet starten/);h.setFailStart(false);assert(h.controller.enter('mansion'));
});

test('runtime construction failure restores editing and external activity state',()=>{
 const h=harness();h.controller.start();h.setFailCreate(true);assert.equal(h.controller.enter('garden'),false);assert.equal(h.controller.active,null);assert.equal(h.external,false);assert(h.$('mini-panel').hidden);assert(!h.$('language').disabled);assert(!h.doc.body.classList.contains('mini-game-mode'));h.setFailCreate(false);assert(h.controller.enter('garden'));
});

test('racing HUD keeps its riddle, separates guided help and reports live telemetry; pause/exit silence the engine',()=>{
 const h=harness();h.controller.start();h.controller.enter('rally');const rt=h.runtimeCalls.at(-1);assert(h.doc.body.classList.contains('rally-mode'));assert.equal(h.$('mini-tools').open,false);assert.equal(h.$('mini-race-telemetry').hidden,false);assert.match(h.$('mini-question').textContent,/poort/);
 rt.options.onTelemetry({...rt.game.snapshot(),speed:5,speedKmh:18,speedLimit:6,gear:'D',distance:11});assert.equal(h.$('mini-speed').textContent,'18');assert.equal(h.$('mini-gear').textContent,'D');assert.match(h.$('mini-distance').textContent,/11 m/);assert.equal(h.motors.at(-1).active,true);
 rt.options.onUpdate({...rt.game.snapshot(),busy:true,animation:{kind:'gate'},choices:rt.game.snapshot().choices.map(c=>({...c,disabled:true}))});assert.equal(h.$('mini-panel').attributes['aria-busy'],'true');assert(h.$('mini-choices').children.every(b=>b.disabled));assert.equal(h.motors.at(-1).active,false);h.setBlocked(true);h.controller.frame(.1,{blocked:true});assert.equal(h.motors.at(-1),null);h.controller.leave();assert(!h.doc.body.classList.contains('rally-mode'));assert(h.$('mini-race-telemetry').hidden);assert.equal(h.motors.at(-1),null);
});
