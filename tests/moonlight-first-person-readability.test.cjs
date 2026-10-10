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
 r.input(1,1,1);r.action(r.snapshot().task.solution[0]);for(let i=0;i<400&&r.snapshot().progress===0;i++)r.tick(.1);assert.equal(r.snapshot().progress,1/3);const nextStart=c.position.clone();r.tick(.1);assert.deepEqual(c.position.asArray(),nextStart.asArray());assert.equal(r.snapshot().speed,0,'new question waits for new movement input');
 r.dispose();scene.dispose();e.dispose();
});
