const assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js');
const {createCanvas}=require('@napi-rs/canvas');global.document={hidden:false,createElement:()=>createCanvas(512,128),addEventListener(){},removeEventListener(){}};
const G=require('../games/moonlight-hollow/mini-games.js'),W=require('../games/moonlight-hollow/mini-game-world.js');
function perform(r,id){r.action(id);for(let i=0;i<400&&(r.snapshot().busy||r.snapshot().assisted);i++)r.tick(.1);assert(!r.snapshot().busy,'operation finished');}
const engine=new B.NullEngine({renderWidth:1280,renderHeight:720}),scene=new B.Scene(engine),main=new B.UniversalCamera('main',B.Vector3.Zero(),scene);scene.activeCamera=main;const baseline={meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,cameras:scene.cameras.length};let updates=0,complete=0,paused=false;
const runtime=W.create({B,scene,paused:()=>paused,quality:'low',reducedMotion:true,frame:()=>({x:0,y:.2,width:.7,height:.8}),onUpdate:s=>{assert(s.name&&s.question);updates++;},onComplete:()=>complete++});
for(const id of Object.keys(G.catalog)){
 runtime.start(id,{level:3,lang:'fr',seed:8});assert.equal(scene.activeCamera.layerMask,W.LAYER);assert.equal(scene.activeCamera.viewport.width,.7);assert(scene.meshes.length>10);assert(scene.meshes.every(m=>m.layerMask===W.LAYER));
 for(let round=0;round<3;round++){
  const s=runtime.snapshot();if(id==='potions'){for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)perform(runtime,'add:'+i);perform(runtime,'check');}
  else if(id==='broom'||id==='rally'){perform(runtime,s.task.solution[0]);for(let n=0;n<100&&runtime.snapshot().progress===round/3;n++)runtime.tick(.1);}
  else{for(const choice of s.task.solution)perform(runtime,choice);if(id==='garden'||id==='railway')perform(runtime,'check');}
  assert.equal(runtime.snapshot().progress,(round+1)/3);
 }
 assert.equal(runtime.snapshot().completed,true);runtime.dispose();assert.equal(scene.activeCamera,main);assert.equal(scene.meshes.length,baseline.meshes);assert.equal(scene.materials.length,baseline.materials);assert.equal(scene.textures.length,baseline.textures);assert.equal(scene.cameras.length,baseline.cameras);
}
assert.equal(complete,6);assert(updates>30);
// Steering and flight input physically reach the correct answer, independently of choice buttons.
for(const id of ['broom','rally']){runtime.start(id,{level:1,seed:4});const s=runtime.snapshot(),i=s.task.items.findIndex(t=>t.id===s.task.solution[0]),x=(i-1)*7,y=id==='broom'?2+i*1.5:1,vehicle=scene.meshes.find(m=>m.name===('mini-'+(id==='broom'?'broom':'kart')));if(id==='broom'){runtime.input(Math.sign(x),0,0);for(let n=0;n<Math.round(Math.abs(x)/.6);n++)runtime.tick(.1);runtime.input(0,0,Math.sign(y-3));for(let n=0;n<Math.round(Math.abs(y-3)/.6);n++)runtime.tick(.1);runtime.input(0,1,0);for(let n=0;n<40&&runtime.snapshot().progress===0;n++)runtime.tick(.1);}else{for(let n=0;n<250&&runtime.snapshot().progress===0;n++){const v=runtime.snapshot().vehicle,target=Math.atan2(x-v.x,19-v.z),turn=Math.atan2(Math.sin(target-v.heading),Math.cos(target-v.heading));runtime.input(Math.max(-1,Math.min(1,turn*3)),1,0);runtime.tick(.05);}}for(let n=0;n<20&&runtime.snapshot().busy;n++)runtime.tick(.1);assert.equal(runtime.snapshot().progress,1/3);runtime.dispose();}
runtime.start('rally',{seed:2});runtime.input(0,1);for(let n=0;n<20;n++)runtime.tick(.1);assert(runtime.snapshot().speed>0);const parked=runtime.snapshot().vehicle;paused=true;runtime.tick(.1);assert.equal(runtime.snapshot().speed,0);runtime.action(runtime.snapshot().task.solution[0]);for(let n=0;n<20;n++)runtime.tick(.1);assert.equal(runtime.snapshot().vehicle.z,parked.z);assert.equal(runtime.snapshot().progress,0);paused=false;runtime.input(0,-1);for(let n=0;n<10;n++)runtime.tick(.1);assert(runtime.snapshot().vehicle.z<parked.z);runtime.dispose();scene.dispose();engine.dispose();
// Project every active sign corner into the camera's safe viewport at three screen sizes.
const F=require('../games/moonlight-hollow/camera.js');let projectedSigns=0;
for(const [width,height] of [[390,844],[844,390],[1440,900]]){
 const e=new B.NullEngine({renderWidth:width,renderHeight:height}),s=new B.Scene(e);s.fogMode=B.Scene.FOGMODE_EXP2;s.fogDensity=.04;let viewport=F.safeFrame(width,height,90,height*.56);const r=W.create({B,scene:s,frame:()=>viewport});
 for(const id of Object.keys(G.catalog))for(const lang of ['nl','fr'])for(const level of [1,2,3]){
  viewport=F.safeFrame(width,height,90,id==='rally'?height:height*.56);r.start(id,{lang,level,seed:42});r.refit();s.activeCamera.getViewMatrix(true);s.activeCamera.getProjectionMatrix(true);const transform=s.activeCamera.getViewMatrix().multiply(s.activeCamera.getProjectionMatrix());
  for(const sign of s.meshes.filter(m=>m.name==='mini-label'&&!m.metadata?.miniDecor)){sign.computeWorldMatrix(true);for(const corner of sign.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.TransformCoordinates(corner,transform);assert(Math.abs(p.x)<=1.001,`${id} ${width}x${height} sign x ${p.x}`);assert(Math.abs(p.y)<=1.001,`${id} ${width}x${height} sign y ${p.y}`);assert(p.z>=0&&p.z<=1,`${id} sign clipped ${p.z}`);}projectedSigns++;}
  assert(s.materials.every(m=>m.fogEnabled===false));viewport=F.safeFrame(width,height,110,id==='rally'?height:height*.52);r.refit();const resized=s.activeCamera.getViewMatrix(true).multiply(s.activeCamera.getProjectionMatrix(true));for(const sign of s.meshes.filter(m=>m.name==='mini-label'&&!m.metadata?.miniDecor))for(const corner of sign.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.TransformCoordinates(corner,resized);assert(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001&&p.z>=0&&p.z<=1,'refit projection');}viewport=F.safeFrame(width,height,90,height*.56);r.dispose();assert.equal(s.meshes.length,0);assert.equal(s.materials.length,0);assert.equal(s.textures.length,0);
 }
 s.dispose();e.dispose();
}
assert(projectedSigns>400);console.log(`Projected ${projectedSigns} signs inside safe camera frames at portrait, landscape and desktop sizes.`);
console.log('Mini-game Babylon arenas: all six completion flows, physical vehicle controls, camera frames and resource disposal pass.');
