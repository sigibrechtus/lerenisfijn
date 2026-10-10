const test=require('node:test'),assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js'),{createCanvas}=require('@napi-rs/canvas');
global.document={hidden:false,createElement:()=>createCanvas(512,256),addEventListener(){},removeEventListener(){}};
const W=require('../games/moonlight-hollow/mini-game-world.js'),F=require('../games/moonlight-hollow/camera.js');
test('first-person gate glyphs exceed 20 screen pixels at the starting line on small phones, landscape phones and desktop',()=>{
 let minPixels=Infinity,signs=0;
 for(const [width,height,top=90,bottom=height]of [[320,568],[360,780],[390,844],[844,390],[1440,900],[320,568,200,498],[844,390,175,320]]){
  const e=new B.NullEngine({renderWidth:width,renderHeight:height}),scene=new B.Scene(e),r=W.create({B,scene,reducedMotion:true,frame:()=>F.safeFrame(width,height,top,bottom)});
  for(const id of ['broom','rally'])for(const level of [1,2,3])for(const seed of [1,8,42,99]){
   r.start(id,{level,seed});const c=scene.activeCamera;assert.equal(c.metadata.firstPerson,true);
   const transform=c.getViewMatrix(true).multiply(c.getProjectionMatrix(true)),vp=c.viewport.toGlobal(width,height);
   for(const sign of scene.meshes.filter(m=>m.metadata?.miniLabel?.gate)){
    const label=sign.metadata.miniLabel,glyph=label.glyphs[0],matrix=sign.computeWorldMatrix(true),center=(.5-glyph.y)*label.height;
    const top=B.Vector3.TransformCoordinates(new B.Vector3(0,center+glyph.height*label.height/2,0),matrix),bottom=B.Vector3.TransformCoordinates(new B.Vector3(0,center-glyph.height*label.height/2,0),matrix);
    const a=B.Vector3.Project(top,B.Matrix.Identity(),transform,vp),b=B.Vector3.Project(bottom,B.Matrix.Identity(),transform,vp),pixels=Math.abs(b.y-a.y);
    minPixels=Math.min(minPixels,pixels);assert(pixels>=20,`${id} ${width}x${height} ${label.text}: ${pixels.toFixed(1)}px`);
    assert.equal(sign.isPickable,false,'cross a gate to answer; explicit guided help is separate');signs++;
   }
   r.dispose();
  }
  scene.dispose();e.dispose();
 }
 console.log(`Measured ${signs} first-person gate signs: minimum glyph height ${minPixels.toFixed(1)} screen pixels.`);
});
test('broom camera follows its rider, lateral movement and altitude; release and pause stop movement',()=>{
 const e=new B.NullEngine(),scene=new B.Scene(e);let paused=false;const r=W.create({B,scene,reducedMotion:true,paused:()=>paused});
 r.start('broom',{seed:42});const c=scene.activeCamera,start=c.position.clone();assert.equal(c.name,'broom-first-person-camera');
 r.input(1,0,1);r.tick(.1);assert(c.position.x>start.x&&c.position.y>start.y);assert.equal(c.position.z,start.z);assert.equal(c.rotation.y,0);
 const rider=scene.meshes.find(m=>m.name==='mini-broom');assert.equal(c.position.y,rider.position.y+.8);
 r.input(0,0,0);r.tick(.1);assert.equal(r.snapshot().speed,0);const stopped=c.position.clone();r.input(1,1,1);paused=true;r.tick(.1);assert.deepEqual(c.position.asArray(),stopped.asArray());paused=false;r.tick(.1);assert.deepEqual(c.position.asArray(),stopped.asArray());
 r.input(1,1,1);r.action(r.snapshot().task.solution[0]);for(let i=0;i<400&&r.snapshot().progress===0;i++)r.tick(.1);assert.equal(r.snapshot().progress,1/r.snapshot().rounds);const nextStart=c.position.clone();r.tick(.1);assert.deepEqual(c.position.asArray(),nextStart.asArray());assert.equal(r.snapshot().speed,0,'new question waits for new movement input');
 r.dispose();scene.dispose();e.dispose();
});
test('all four workstations keep a low first-person eye and readable mounted signs inside the usable frame',()=>{
 let signs=0,minPixels=Infinity;
 for(const [width,height]of [[390,844],[844,390],[1440,900]]){
  const engine=new B.NullEngine({renderWidth:width,renderHeight:height}),scene=new B.Scene(engine);let top=90,bottom=height*.56;const r=W.create({B,scene,reducedMotion:true,frame:()=>F.safeFrame(width,height,top,bottom)});
  for(const id of ['mansion','potions','garden','railway'])for(const lang of ['nl','fr'])for(const level of [1,2,3]){
   r.start(id,{lang,level,seed:42});assert.equal(r.snapshot().rounds,6);const camera=scene.activeCamera;assert.equal(camera.metadata.firstPerson,true);assert.equal(camera.metadata.workstation,true);assert(camera.metadata.eyeHeight>0&&camera.metadata.eyeHeight<=2.4);assert(camera.position.y>=120&&camera.position.y<=122.4,`${id}: camera ${camera.position.y-120}m above platform`);
   for(const [header,panelTop]of [[90,height*.56],[110,height*.52]]){
    top=header;bottom=panelTop;r.refit();assert(camera.position.y<=122.4,'responsive fit never raises the eye');const transform=camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true)),vp=camera.viewport.toGlobal(width,height);
    for(const sign of scene.meshes.filter(m=>m.metadata?.miniLabel&&!m.metadata.miniDecor)){
     const label=sign.metadata.miniLabel,matrix=sign.computeWorldMatrix(true);
     for(const corner of sign.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.TransformCoordinates(corner,transform);assert(Math.abs(p.x)<=1.001&&Math.abs(p.y)<=1.001&&p.z>=0&&p.z<=1,`${id} ${width}x${height}: mounted ${label.text} clipped (${p.x},${p.y},${p.z})`);}
     for(const glyph of label.glyphs){const center=(.5-glyph.y)*label.height,a=B.Vector3.TransformCoordinates(new B.Vector3(0,center+glyph.height*label.height/2,0),matrix),b=B.Vector3.TransformCoordinates(new B.Vector3(0,center-glyph.height*label.height/2,0),matrix),pa=B.Vector3.Project(a,B.Matrix.Identity(),transform,vp),pb=B.Vector3.Project(b,B.Matrix.Identity(),transform,vp),pixels=Math.abs(pb.y-pa.y);if(header===90){minPixels=Math.min(minPixels,pixels);assert(pixels>=16,`${id} ${width}x${height}: ${label.text} glyph ${pixels.toFixed(1)}px`);}}signs++;
    }
   }
   r.dispose();assert.equal(scene.meshes.length,0);assert.equal(scene.materials.length,0);assert.equal(scene.textures.length,0);top=90;bottom=height*.56;
  }
  scene.dispose();engine.dispose();
 }
 assert(signs>100);console.log(`Measured ${signs} low-eye mounted signs; smallest text glyph ${minPixels.toFixed(1)}px. CPU projection evidence only.`);
});
test('hints offer at least three meaningful levels while leaving all six stages available',()=>{
 const e=new B.NullEngine(),scene=new B.Scene(e),r=W.create({B,scene,reducedMotion:true});
 for(const id of ['mansion','potions','broom','garden','railway','rally'])for(const lang of ['nl','fr']){
  r.start(id,{lang,level:2,seed:42});const feedback=[];for(let i=0;i<3;i++){r.action('hint');for(let n=0;n<30&&r.snapshot().busy;n++)r.tick(.1);const s=r.snapshot();assert(s.feedback.length>0);feedback.push(s.feedback);assert.equal(s.progress,0);assert.equal(s.completed,false);}assert.equal(new Set(feedback).size,3,`${id}/${lang}: hints should progress through three distinct explanations`);r.dispose();
 }
 scene.dispose();e.dispose();
});
test('arena owns keyboard and visibility listeners, ignores focused controls and clears movement on blur',()=>{
 const winEvents=new Map(),docEvents=new Map(),oldAdd=global.addEventListener,oldRemove=global.removeEventListener,docAdd=document.addEventListener,docRemove=document.removeEventListener;
 global.addEventListener=(name,fn)=>winEvents.set(name,fn);global.removeEventListener=(name,fn)=>{if(winEvents.has(name))assert.equal(winEvents.get(name),fn);winEvents.delete(name);};document.addEventListener=(name,fn)=>docEvents.set(name,fn);document.removeEventListener=(name,fn)=>{if(docEvents.has(name))assert.equal(docEvents.get(name),fn);docEvents.delete(name);};
 const e=new B.NullEngine(),scene=new B.Scene(e),r=W.create({B,scene,reducedMotion:true});try{
  r.start('broom',{seed:6});const initial=r.snapshot().vehicle.z;
  winEvents.get('keydown')({key:'ArrowUp',target:{closest:()=>({tagName:'BUTTON'})},preventDefault(){throw Error('focused button should keep its own input');}});r.tick(.1);assert.equal(r.snapshot().vehicle.z,initial);
  let prevented=false;winEvents.get('keydown')({key:'ArrowUp',target:{closest:()=>null},preventDefault(){prevented=true;}});r.tick(.1);assert(prevented);assert(r.snapshot().vehicle.z>initial);winEvents.get('blur')();const blurZ=r.snapshot().vehicle.z;r.tick(.1);assert.equal(r.snapshot().vehicle.z,blurZ);
  r.input(0,1);document.hidden=true;docEvents.get('visibilitychange')();document.hidden=false;r.tick(.1);assert.equal(r.snapshot().vehicle.z,blurZ);r.dispose();assert.equal(winEvents.size,0);assert.equal(docEvents.size,0);
 }finally{r.dispose();scene.dispose();e.dispose();global.addEventListener=oldAdd;global.removeEventListener=oldRemove;document.addEventListener=docAdd;document.removeEventListener=docRemove;document.hidden=false;}
});
