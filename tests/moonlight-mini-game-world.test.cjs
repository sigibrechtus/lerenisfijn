const assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js');
const {createCanvas}=require('@napi-rs/canvas');global.document={hidden:false,createElement:()=>createCanvas(512,128),addEventListener(){},removeEventListener(){}};
// Continuous kart circuits have dedicated physical and projection coverage in pumpkin-race-world.test.cjs.
const G=require('../games/moonlight-hollow/mini-games.js'),W=require('../games/moonlight-hollow/mini-game-world.js'),Course=require('../games/moonlight-hollow/broom-course.js');
function perform(r,id){r.action(id);for(let i=0;i<400&&(r.snapshot().busy||r.snapshot().assisted);i++)r.tick(.1);assert(!r.snapshot().busy,'operation finished');}
const engine=new B.NullEngine({renderWidth:1280,renderHeight:720}),scene=new B.Scene(engine),main=new B.UniversalCamera('main',B.Vector3.Zero(),scene);scene.activeCamera=main;const baseline={meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,cameras:scene.cameras.length,lights:scene.lights.length,nodes:scene.transformNodes.length};let updates=0,complete=0,paused=false;
const runtime=W.create({B,scene,paused:()=>paused,quality:'low',reducedMotion:true,frame:()=>({x:0,y:.2,width:.7,height:.8}),onUpdate:s=>{assert(s.name&&s.question);updates++;},onComplete:()=>complete++});
for(const id of Object.keys(G.catalog).filter(id=>id!=='rally')){
 runtime.start(id,{level:3,lang:'fr',seed:8});const arena=runtime.scene;assert.equal(arena.activeCamera.layerMask,W.LAYER);assert.equal(arena.activeCamera.viewport.width,id==='broom'?1:.7);assert(arena.meshes.length>10);assert(arena.meshes.every(m=>m.layerMask===W.LAYER));
 if(id==='broom'){
  assert.equal(arena.fogMode,B.Scene.FOGMODE_NONE,'flight uses a fog-free isolated scene');
  assert(!arena.meshes.some(m=>m.name==='mini-clear-backdrop'),'no opaque wall beyond flight gate');
  const floors=arena.meshes.filter(m=>m.name==='mini-floor');assert.equal(floors.length,1,'one seamless flight runway replaces overlapping floor sections');floors[0].computeWorldMatrix(true);
  const box=floors[0].getBoundingInfo().boundingBox;assert(box.maximumWorld.z-box.minimumWorld.z>=6*24+25,'runway spans all gate positions without an end wall');
  const rails=arena.meshes.filter(m=>m.name==='mini-road-edge');assert(rails.length>=60,'continuous curved side rail pieces');const strips=arena.meshes.filter(m=>m.name==='mini-flight-road-strip');assert(strips.length>=36,'curved elevated runway is actually rendered');const heights=strips.map(m=>m.position.y),offsets=strips.map(m=>m.position.x);assert(Math.max(...heights)-Math.min(...heights)>.1,'runway elevation changes');assert(Math.max(...offsets)-Math.min(...offsets)>.15,'runway visibly bends');
  const broom=arena.meshes.find(m=>m.name==='mini-broom'),brush=arena.meshes.find(m=>m.name==='mini-broom-brush');
  assert(broom&&brush,'broom geometry exists for third-person camera');
  assert.equal(broom.isVisible,false,'first-person camera cannot see its own broom');
  assert.equal(brush.isVisible,false,'close broom brush cannot cover first-person lower viewport');
  runtime.action('camera');
  assert.equal(broom.isVisible,true,'third-person camera restores broom');
  assert.equal(brush.isVisible,true,'third-person camera restores brush');
  runtime.action('camera');
  assert.equal(brush.isVisible,false,'switching back hides brush again');
 }

 assert.equal(runtime.snapshot().rounds,6);for(let round=0;round<runtime.snapshot().rounds;round++){
  const s=runtime.snapshot();if(id==='potions'){for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)perform(runtime,'add:'+i);perform(runtime,'check');}
  else if(id==='broom'||id==='rally'){perform(runtime,s.task.solution[0]);for(let n=0;n<100&&runtime.snapshot().progress===round/s.rounds;n++)runtime.tick(.1);}
  else{for(const choice of s.task.solution)perform(runtime,choice);if(id==='garden'||id==='railway')perform(runtime,'check');}
  assert.equal(runtime.snapshot().progress,(round+1)/s.rounds);if(round===0){assert.equal(runtime.snapshot().completed,false);assert.equal(complete,Object.keys(G.catalog).filter(id=>id!=='rally').indexOf(id));}
 }
 assert.equal(runtime.snapshot().completed,true);if(['broom','rally'].includes(id)){const done=runtime.snapshot(),markers=arena.meshes.filter(m=>m.name==='mini-checkpoint'&&m.metadata?.checkpoint===true);assert.equal(markers.length,done.rounds);assert(markers.every(m=>m.metadata.completed));assert.equal(done.vehicle.z,done.rounds*24);assert.equal(arena.activeCamera.metadata.firstPerson,true);}runtime.dispose();assert.equal(scene.activeCamera,main);assert.equal(scene.meshes.length,baseline.meshes);assert.equal(scene.materials.length,baseline.materials);assert.equal(scene.textures.length,baseline.textures);assert.equal(scene.cameras.length,baseline.cameras);assert.equal(scene.lights.length,baseline.lights);assert.equal(scene.transformNodes.length,baseline.nodes);
}
assert.equal(complete,5);assert(updates>30);
// Moonrise village art belongs to difficulty one only, uses real 3D assets and
// keeps quiz gates free of scenery across all six sections.
runtime.start('broom',{level:1,lang:'nl',seed:33});
{
 const moonScene=runtime.scene,art=moonScene.metadata?.moonrise;
 assert(art,'Moonrise environment must load in playable level one');
 assert.equal(art.houses,12,'village homes have architectural geometry');
 assert.equal(art.trees,16,'Moonrise includes tree silhouettes');
 assert.equal(art.lanterns,14,'Moonrise includes illuminated street lanterns');
 assert(art.props>=18,'Moonrise adds pumpkin decorations');
 const homes=moonScene.meshes.filter(m=>m.name==='mini-moonrise-house-wall'),roofs=moonScene.meshes.filter(m=>m.name==='mini-moonrise-gabled-roof');
 assert.equal(homes.length,12);assert.equal(roofs.length,homes.length);
 assert(moonScene.meshes.some(m=>m.name==='mini-moonrise-window-glow'),'houses have individually glowing 3D windows');
 assert(moonScene.meshes.some(m=>m.name==='mini-moonrise-bridge-plinth'),'stone bridge details decorate the route');
 assert.equal(moonScene.meshes.filter(m=>m.name==='mini-moonrise-river').length,2,'two moonlit streams pass beneath the runway');
 assert(moonScene.lights.filter(l=>l.name.startsWith('moonrise-village-lantern-')).length===2,'mobile profile uses only two real ambient lantern lights');
 const kenney=require('../games/moonlight-hollow/assets/model-library.json');
 for(const id of ['pumpkin-carved','lantern-candle','pine-crooked','rocks','lightpost-single','tower-square','tower-hexagon-top','character-ghost']){
  assert(kenney.assets.some(a=>a.id===id&&a.license==='CC0-1.0'),'shipped and licensed GLB available: '+id);
 }

 assert(moonScene.meshes.every(m=>m.layerMask===W.LAYER),'all Moonrise pieces honor the flight scene layer');
 assert(homes.every(m=>{const c=Course.center(m.position.z,1);return Math.abs(m.position.x-c.x)>16;}),'houses stay outside the answer gate corridor');
 assert(moonScene.meshes.length<1150,'iPhone scene mesh count stays bounded');
 assert.equal(art.glbRequested,0,'low-quality profile does not import heavier GLBs');
 const before=moonScene.meshes.length;
 runtime.action('camera');assert.equal(moonScene.meshes.length,before,'camera switching cannot duplicate scenery');
}
runtime.dispose();assert.equal(scene.meshes.length,baseline.meshes,'Moonrise materials and meshes dispose with the scene');
runtime.start('broom',{level:2,seed:34});assert.equal(runtime.scene.metadata?.moonrise,undefined,'other difficulty environments remain unchanged');runtime.dispose();
// Course contracts: three difficulties retain large reachable gates, deterministic
// longitudinal progress, moderate winding, and individually staggered challenge gates.
for(const level of [1,2,3]){
 let last=null;
 for(let z=-4;z<=Course.LENGTH+4;z+=.5){const c=Course.center(z,level);assert(Number.isFinite(c.x)&&Number.isFinite(c.rise)&&Number.isFinite(c.heading));if(last){assert(Math.abs(c.x-last.x)<.45,'turn is continuous');assert(Math.abs(c.rise-last.rise)<.25,'slope is gentle');}last=c;}
 for(let stage=0;stage<6;stage++){const g=[0,1,2].map(i=>Course.gate(stage,i,level));assert(g.every(a=>a.diameter>=3.7),'rings remain children-friendly');assert(g.every(a=>a.z>=stage*24+17&&a.z<=stage*24+21),'gate depth leaves recovery distance');assert(g.every(a=>Math.abs(a.x)<11&&a.y>=1.5&&a.y<7),'each gate lies in reachable flight envelope');if(level>1)assert(new Set(g.map(a=>a.z)).size>1,'harder difficulty staggers gate depths');}
}
// Guided camera-safe passages also work with the staggered, rising gates
// at both harder settings; the task/scene are rebuilt without losing momentum.
for(const level of [2,3]){
 runtime.start('broom',{level,seed:12,lang:'nl'});
 for(let stage=1;stage<=3;stage++){
  const current=runtime.snapshot(),correct=current.task.solution[0],gate=current.gates.find((g,i)=>current.task.items[i].id===correct);
  assert(gate&&gate.diameter>=3.7);
  runtime.action(correct);
  for(let n=0;n<250&&runtime.snapshot().progress===(stage-1)/current.rounds;n++)runtime.tick(.1);
  assert.equal(runtime.snapshot().progress,stage/current.rounds,'guided flight traverses staggered gate at difficulty '+level);
  assert(runtime.snapshot().speed>0,'momentum continues at difficulty '+level);
 }
 runtime.dispose();
}
// Three physical stages prove course progression independently of guided-answer buttons.
for(const id of ['broom']){
 runtime.start(id,{level:1,seed:4});const arena=runtime.scene;for(let stage=1;stage<=3;stage++){
  const s=runtime.snapshot(),i=s.task.items.findIndex(t=>t.id===s.task.solution[0]),x=s.gates[i].x,gateZ=s.gates[1].z;
  assert.equal(s.round,stage);assert.equal(s.gateZ,s.course.gate.z);if(stage===1)assert.equal(s.vehicle.localZ,0);else{assert(s.vehicle.localZ>=-6&&s.vehicle.localZ<0,'next stage begins just beyond previous gate');assert.equal(s.course.heading,0,'continuous broom corridor preserves heading');}
  const checkpoints=arena.meshes.filter(m=>m.name==='mini-checkpoint'&&m.metadata?.checkpoint===true);assert.equal(checkpoints.length,s.rounds);assert.equal(checkpoints.filter(m=>m.metadata.completed).length,stage-1);
  const labels=arena.meshes.filter(m=>m.metadata?.miniLabel?.gate);assert.equal(labels.length,3);labels.forEach((sign,j)=>assert(Math.abs(sign.position.z-(s.gates[j].z-(stage-1)*Course.SECTION))<.01,'answer label must travel with its own gate'));
  if(id==='broom'){
   const ring=arena.meshes.filter(m=>m.name==='mini-answer-ring')[i],targetY=s.gates[i].y;assert(Math.abs(ring.position.y-120-targetY)<.01,'physical ring and collision target use same height');
   // Flight now has real momentum: steer towards the target rather than assuming 6m/s lateral motion.
   for(let n=0;n<100;n++){const v=runtime.snapshot().vehicle,dx=x-v.localX,dy=targetY-v.y;if(Math.abs(dx)<.35&&Math.abs(dy)<.25)break;runtime.input(Math.abs(dx)<.35?0:Math.sign(dx),0,Math.abs(dy)<.25?0:Math.sign(dy));runtime.tick(.05);}
   runtime.input(0,1,0);for(let n=0;n<180&&runtime.snapshot().progress===(stage-1)/s.rounds;n++)runtime.tick(.05);
  }else for(let n=0;n<300&&runtime.snapshot().progress===(stage-1)/s.rounds;n++){const v=runtime.snapshot().vehicle,target=Math.atan2(x-v.localX,gateZ-v.localZ),localHeading=v.heading-s.course.heading,turn=Math.atan2(Math.sin(target-localHeading),Math.cos(target-localHeading));runtime.input(Math.max(-1,Math.min(1,turn*3)),1,0);runtime.tick(.05);}
  for(let n=0;n<40&&runtime.snapshot().busy;n++)runtime.tick(.1);assert.equal(runtime.snapshot().progress,stage/s.rounds);assert(runtime.snapshot().speed>s.speedLimit,'correct gate accelerates beyond previous round speed limit');assert(runtime.snapshot().vehicle.localZ>=-6&&runtime.snapshot().vehicle.localZ<0,'correct gate retains progress instead of resetting');assert.equal(runtime.snapshot().completed,false);const next=runtime.snapshot().vehicle.z;runtime.input(0,0,0);runtime.tick(.1);assert(runtime.snapshot().vehicle.z>next,'flight continues forward after releasing the joystick');
 }
 runtime.dispose();
}
// Physically crossing an incorrect answer gate must return to the SAME question
// and checkpoint, with zero speed, rather than advancing or restarting the adventure.
runtime.start('broom',{level:1,seed:21});
{
 const start=runtime.snapshot(),wrong=start.task.items.findIndex(item=>item.id!==start.task.solution[0]),x=start.gates[wrong].x,targetY=start.gates[wrong].y;
 for(let n=0;n<100;n++){const v=runtime.snapshot().vehicle,dx=x-v.localX,dy=targetY-v.y;if(Math.abs(dx)<.35&&Math.abs(dy)<.25)break;runtime.input(Math.abs(dx)<.35?0:Math.sign(dx),0,Math.abs(dy)<.25?0:Math.sign(dy));runtime.tick(.05);}
 runtime.input(0,1,0,1);
 for(let n=0;n<250&&runtime.snapshot().flightStatus!=='checkpoint';n++)runtime.tick(.05);
 const retry=runtime.snapshot();
 assert.equal(retry.flightStatus,'checkpoint','wrong gate triggers checkpoint');
 assert.equal(retry.progress,0,'wrong answer does not advance');
 assert.equal(retry.round,1,'retry same question');
 assert.equal(retry.speed,0,'wrong answer resets forward momentum');
 assert.equal(retry.vehicle.localZ,0,'broom returns to checkpoint before gate');
 const parked=retry.vehicle.z;runtime.input(0,0,0);runtime.tick(.1);
 assert.equal(runtime.snapshot().vehicle.z,parked,'broom stays at checkpoint until accelerated');
}
runtime.dispose();
// Missing every answer ring is also a failed passage; recover before the gates without advancing.
runtime.start('broom',{level:1,seed:29});
{
 for(let n=0;n<45;n++){runtime.input(1,0,-1);runtime.tick(.05);}
 runtime.input(0,1,0,1);
 for(let n=0;n<250&&runtime.snapshot().flightStatus!=='checkpoint';n++)runtime.tick(.05);
 const missed=runtime.snapshot();
 assert.equal(missed.flightStatus,'checkpoint','missing all gates returns to checkpoint');
 assert.equal(missed.progress,0);
 assert.equal(missed.speed,0);
 assert.equal(missed.vehicle.localZ,0);
}
runtime.dispose();
runtime.start('rally',{seed:2});runtime.input(0,1);for(let n=0;n<50;n++)runtime.tick(.1);assert(runtime.snapshot().speed>0);const parked=runtime.snapshot().vehicle;paused=true;runtime.tick(.1);assert.equal(runtime.snapshot().speed,0);runtime.action(runtime.snapshot().task.solution[0]);for(let n=0;n<20;n++)runtime.tick(.1);assert.equal(runtime.snapshot().vehicle.z,parked.z);assert.equal(runtime.snapshot().progress,0);paused=false;runtime.input(0,-1);for(let n=0;n<10;n++)runtime.tick(.1);assert(runtime.snapshot().vehicle.z<parked.z);runtime.dispose();scene.dispose();engine.dispose();
// Project every active sign corner into the camera's safe viewport at three screen sizes.
const F=require('../games/moonlight-hollow/camera.js');let projectedSigns=0;
for(const [width,height] of [[390,844],[844,390],[1440,900]]){
 const e=new B.NullEngine({renderWidth:width,renderHeight:height}),s=new B.Scene(e);s.fogMode=B.Scene.FOGMODE_EXP2;s.fogDensity=.04;let viewport=F.safeFrame(width,height,90,height*.56);const r=W.create({B,scene:s,frame:()=>viewport});
 for(const id of Object.keys(G.catalog).filter(id=>id!=='rally'))for(const lang of ['nl','fr'])for(const level of [1,2,3]){
  viewport=F.safeFrame(width,height,90,['rally','broom'].includes(id)?height:height*.56);try{r.start(id,{lang,level,seed:42});r.refit();}catch(error){throw Error(`${id}/${lang}/L${level} ${width}x${height} safeFrame ${JSON.stringify(viewport)}: ${error.message}`);}const arena=r.scene;arena.activeCamera.getViewMatrix(true);arena.activeCamera.getProjectionMatrix(true);const transform=arena.activeCamera.getViewMatrix().multiply(arena.activeCamera.getProjectionMatrix());
  for(const sign of arena.meshes.filter(m=>m.name==='mini-label'&&!m.metadata?.miniDecor)){sign.computeWorldMatrix(true);for(const corner of sign.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.TransformCoordinates(corner,transform);assert(Math.abs(p.x)<=1.001,`${id} ${width}x${height} sign x ${p.x}`);assert(Math.abs(p.y)<=1.001,`${id} ${width}x${height} sign y ${p.y}`);assert(p.z>=0&&p.z<=1,`${id} sign clipped ${p.z}`);}projectedSigns++;}
  assert(arena.materials.every(m=>m.fogEnabled===false));viewport=F.safeFrame(width,height,110,['rally','broom'].includes(id)?height:height*.52);try{r.refit();}catch(error){throw Error(`${id}/${lang}/L${level} ${width}x${height} resizedFrame ${JSON.stringify(viewport)} bounds ${JSON.stringify(s.activeCamera.metadata?.miniBounds)}: ${error.message}`);}const resized=arena.activeCamera.getViewMatrix(true).multiply(arena.activeCamera.getProjectionMatrix(true));for(const sign of arena.meshes.filter(m=>m.name==='mini-label'&&!m.metadata?.miniDecor))for(const corner of sign.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.TransformCoordinates(corner,resized);assert(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001&&p.z>=0&&p.z<=1,'refit projection');}viewport=F.safeFrame(width,height,90,height*.56);r.dispose();assert.equal(s.meshes.length,0);assert.equal(s.materials.length,0);assert.equal(s.textures.length,0);
 }
 s.dispose();e.dispose();
}
assert(projectedSigns>400);console.log(`Projected ${projectedSigns} signs inside safe camera frames at portrait, landscape and desktop sizes.`);
console.log('Mini-game Babylon arenas: five workstation/flight completion flows plus rally pause, physical vehicle controls, camera frames and resource disposal pass.');
