const assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js');
const {createCanvas}=require('@napi-rs/canvas');global.document={hidden:false,createElement:()=>createCanvas(512,128),addEventListener(){},removeEventListener(){}};
// Continuous kart circuits have dedicated physical and projection coverage in pumpkin-race-world.test.cjs.
const G=require('../games/moonlight-hollow/mini-games.js'),W=require('../games/moonlight-hollow/mini-game-world.js');
function perform(r,id){r.action(id);for(let i=0;i<400&&(r.snapshot().busy||r.snapshot().assisted);i++)r.tick(.1);assert(!r.snapshot().busy,'operation finished');}
const engine=new B.NullEngine({renderWidth:1280,renderHeight:720}),scene=new B.Scene(engine),main=new B.UniversalCamera('main',B.Vector3.Zero(),scene);scene.activeCamera=main;const baseline={meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,cameras:scene.cameras.length,lights:scene.lights.length,nodes:scene.transformNodes.length};let updates=0,complete=0,paused=false;
const runtime=W.create({B,scene,paused:()=>paused,quality:'low',reducedMotion:true,frame:()=>({x:0,y:.2,width:.7,height:.8}),onUpdate:s=>{assert(s.name&&s.question);updates++;},onComplete:()=>complete++});
for(const id of Object.keys(G.catalog).filter(id=>id!=='rally')){
 runtime.start(id,{level:3,lang:'fr',seed:8});const arena=runtime.scene;assert.equal(arena.activeCamera.layerMask,W.LAYER);assert.equal(arena.activeCamera.viewport.width,id==='broom'?1:.7);assert(arena.meshes.length>10);assert(arena.meshes.every(m=>m.layerMask===W.LAYER));
 assert.equal(runtime.snapshot().rounds,6);for(let round=0;round<runtime.snapshot().rounds;round++){
  const s=runtime.snapshot();if(id==='potions'){for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)perform(runtime,'add:'+i);perform(runtime,'check');}
  else if(id==='broom'||id==='rally'){perform(runtime,s.task.solution[0]);for(let n=0;n<100&&runtime.snapshot().progress===round/s.rounds;n++)runtime.tick(.1);}
  else{for(const choice of s.task.solution)perform(runtime,choice);if(id==='garden'||id==='railway')perform(runtime,'check');}
  assert.equal(runtime.snapshot().progress,(round+1)/s.rounds);if(round===0){assert.equal(runtime.snapshot().completed,false);assert.equal(complete,Object.keys(G.catalog).filter(id=>id!=='rally').indexOf(id));}
 }
 assert.equal(runtime.snapshot().completed,true);if(['broom','rally'].includes(id)){const done=runtime.snapshot(),markers=scene.meshes.filter(m=>m.name==='mini-checkpoint'&&m.metadata?.checkpoint===true);assert.equal(markers.length,done.rounds);assert(markers.every(m=>m.metadata.completed));assert.equal(done.vehicle.z,done.rounds*24);assert.equal(arena.activeCamera.metadata.firstPerson,true);}runtime.dispose();assert.equal(scene.activeCamera,main);assert.equal(scene.meshes.length,baseline.meshes);assert.equal(scene.materials.length,baseline.materials);assert.equal(scene.textures.length,baseline.textures);assert.equal(scene.cameras.length,baseline.cameras);assert.equal(scene.lights.length,baseline.lights);assert.equal(scene.transformNodes.length,baseline.nodes);
}
assert.equal(complete,5);assert(updates>30);
// Three physical stages prove course progression independently of guided-answer buttons.
for(const id of ['broom']){
 runtime.start(id,{level:1,seed:4});const arena=runtime.scene;for(let stage=1;stage<=3;stage++){
  const s=runtime.snapshot(),i=s.task.items.findIndex(t=>t.id===s.task.solution[0]),x=(i-1)*7,gateZ=19;
  assert.equal(s.round,stage);assert.equal(s.gateZ,s.course.gate.z);assert.equal(s.vehicle.localZ,0);assert(Math.abs(s.vehicle.x-s.course.start.x)<1e-4);assert(Math.abs(s.vehicle.z-s.course.start.z)<1e-4);if(stage>1){assert.notEqual(s.course.heading,0);assert.notEqual(s.course.start.x,0);}
  const checkpoints=arena.meshes.filter(m=>m.name==='mini-checkpoint'&&m.metadata?.checkpoint===true);assert.equal(checkpoints.length,s.rounds);assert.equal(checkpoints.filter(m=>m.metadata.completed).length,stage-1);
  const labels=arena.meshes.filter(m=>m.metadata?.miniLabel?.gate);assert.equal(labels.length,3);assert(labels.every(m=>m.position.z===gateZ));
  if(id==='broom'){
   const ring=arena.meshes.filter(m=>m.name==='mini-answer-ring')[i],targetY=ring.position.y-120;runtime.input(Math.sign(x),0,0);for(let n=0;n<Math.round(Math.abs(x)/.6);n++)runtime.tick(.1);
   const initialY=runtime.snapshot().vehicle.y;runtime.input(0,0,Math.sign(targetY-initialY));for(let n=0;n<Math.round(Math.abs(targetY-initialY)/.6);n++)runtime.tick(.1);runtime.input(0,1,0);for(let n=0;n<60&&runtime.snapshot().progress===(stage-1)/s.rounds;n++)runtime.tick(.1);
  }else for(let n=0;n<300&&runtime.snapshot().progress===(stage-1)/s.rounds;n++){const v=runtime.snapshot().vehicle,target=Math.atan2(x-v.localX,gateZ-v.localZ),localHeading=v.heading-s.course.heading,turn=Math.atan2(Math.sin(target-localHeading),Math.cos(target-localHeading));runtime.input(Math.max(-1,Math.min(1,turn*3)),1,0);runtime.tick(.05);}
  for(let n=0;n<40&&runtime.snapshot().busy;n++)runtime.tick(.1);assert.equal(runtime.snapshot().progress,stage/s.rounds);assert.equal(runtime.snapshot().vehicle.localZ,0);assert.equal(runtime.snapshot().completed,false);const parked=runtime.snapshot().vehicle.z;runtime.tick(.1);assert.equal(runtime.snapshot().vehicle.z,parked,'next stage waits for fresh movement');
 }
 runtime.dispose();
}
runtime.start('rally',{seed:2});runtime.input(0,1);for(let n=0;n<20;n++)runtime.tick(.1);assert(runtime.snapshot().speed>0);const parked=runtime.snapshot().vehicle;paused=true;runtime.tick(.1);assert.equal(runtime.snapshot().speed,0);runtime.action(runtime.snapshot().task.solution[0]);for(let n=0;n<20;n++)runtime.tick(.1);assert.equal(runtime.snapshot().vehicle.z,parked.z);assert.equal(runtime.snapshot().progress,0);paused=false;runtime.input(0,-1);for(let n=0;n<10;n++)runtime.tick(.1);assert(runtime.snapshot().vehicle.z<parked.z);runtime.dispose();scene.dispose();engine.dispose();
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
