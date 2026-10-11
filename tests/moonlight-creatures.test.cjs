const test=require('node:test'),assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js'),C=require('../games/moonlight-hollow/creatures.js'),L=require('../games/moonlight-hollow/landscape.js');
const near=(a,b,message)=>assert(Math.abs(a-b)<1e-4,`${message}: ${a} != ${b}`);
const counts=s=>({meshes:s.meshes.length,materials:s.materials.length,multi:s.multiMaterials.length,textures:s.textures.length,nodes:s.transformNodes.length});
function fixture(options={}){const engine=new B.NullEngine(),scene=new B.Scene(engine),runtime=C.create({B,scene,...options});return{engine,scene,runtime,close(){runtime.dispose();scene.dispose();engine.dispose();}};}
test('each location receives twelve diverse creatures using four shared source geometries',()=>{
 const anchors=Object.entries(L.sites).map(([id,p])=>({id,...p})),f=fixture({anchors,layer:0x10000000});
 try{
  const snapshot=f.runtime.snapshot();assert.equal(snapshot.total,anchors.length*12);assert.equal(snapshot.sourceMeshes,4);assert.equal(snapshot.sharedMaterials,6);
  for(const a of snapshot.anchors){assert.equal(a.count,12);assert.deepEqual(a.species,{ghost:3,bat:3,spider:3,pumpkin:3});}
  const instances=f.scene.meshes.filter(m=>m.sourceMesh),sources=f.scene.meshes.filter(m=>m.name.startsWith('creature-template-'));assert.equal(instances.length,60);assert.equal(sources.length,4);assert.equal(f.scene.transformNodes.length,1);
  for(const m of f.scene.meshes){assert.equal(m.layerMask,0x10000000);assert.equal(m.isPickable,false);assert.equal(m.checkCollisions,false);}
  for(const m of instances){assert.equal(m.sourceMesh.geometry,sources.find(s=>s.name==='creature-template-'+m.metadata.creature.species).geometry,'geometry shared by species');assert(m.isVisible);}
  const shape=name=>{const b=sources.find(m=>m.name==='creature-template-'+name).getBoundingInfo().boundingBox;return{width:b.maximum.x-b.minimum.x,height:b.maximum.y-b.minimum.y};};assert(shape('bat').width>shape('bat').height*1.8,'recognizable broad bat wings');assert(shape('ghost').height>shape('ghost').width,'upright ghost silhouette');assert(shape('spider').width>shape('spider').height*2,'eight-legged low spider silhouette');
  assert(sources.reduce((n,m)=>n+m.getTotalVertices(),0)<12000,'fixed source vertex budget');
 }finally{f.close();}
});
test('patrols are deterministic, move every inhabitant, and keep complete footprints outside protected paths',()=>{
 const anchors=[{id:'hillside',x:-50,z:70,innerRadius:5,radius:9},{id:'valley',x:80,z:30,innerRadius:5,radius:9}],height=L.makeHeight(),avoid=(x,z,a)=>Math.abs(x-a.x)<2&&z>a.z,f=fixture({anchors,height,avoid,seed:'repeatable'}),g=fixture({anchors,height,avoid,seed:'repeatable'});
 try{
  const start=f.runtime.snapshot(true);assert.deepEqual(start,g.runtime.snapshot(true));let groundSamples=0;
  for(let frame=0;frame<160;frame++){
   f.runtime.update(.05);g.runtime.update(.05);const state=f.runtime.snapshot(true);assert.deepEqual(state,g.runtime.snapshot(true));
   for(const item of state.creatures){const a=anchors.find(a=>a.id===item.anchor),d=Math.hypot(item.x-a.x,item.z-a.z);assert(d-item.foot>=a.innerRadius-1e-5&&d+item.foot<=a.radius+1e-5,'whole creature remains inside its patrol ring');assert(!avoid(item.x,item.z,a));for(let k=0;k<8;k++){const angle=k/8*Math.PI*2;assert(!avoid(item.x+Math.cos(angle)*item.foot,item.z+Math.sin(angle)*item.foot,a),'footprint never enters a path');}
    if(item.airborne)assert(item.y-height(item.x,item.z)>1,'ghosts and bats are intentionally airborne');else{let floor=height(item.x,item.z);for(let k=0;k<8;k++){const angle=k/8*Math.PI*2;floor=Math.min(floor,height(item.x+Math.cos(angle)*item.foot,item.z+Math.sin(angle)*item.foot));}near(item.y,floor-.025*item.scale,'ground species follow actual terrain');assert(floor<0,'real valley terrain is sampled');groundSamples++;}
   }
  }
  const end=f.runtime.snapshot(true);for(let i=0;i<start.creatures.length;i++)assert(Math.hypot(start.creatures[i].x-end.creatures[i].x,start.creatures[i].z-end.creatures[i].z)>.01,'every inhabitant moves along its local patrol');assert(groundSamples>1000);
 }finally{f.close();g.close();}
});
test('six elevated mini stages keep ground creatures on the floor and outside every rotated gameplay frame',()=>{
 const anchors=Array.from({length:6},(_,i)=>({id:'stage-'+i,x:32*i,z:(i%2)*22,heading:i%2?-.12:.12,innerRadius:14,radius:20,minY:120,altitude:3})),avoid=(x,z)=>anchors.some(a=>{const dx=x-a.x,dz=z-a.z,lx=dx*Math.cos(a.heading)-dz*Math.sin(a.heading),lz=dx*Math.sin(a.heading)+dz*Math.cos(a.heading);return Math.abs(lx)<7&&lz>=0&&lz<=15;}),f=fixture({anchors,avoid,height:()=>119.9,layer:0x20000000,fogEnabled:false});
 try{
  assert.equal(f.runtime.snapshot().total,72);assert(f.scene.materials.every(m=>m.fogEnabled===false));for(let i=0;i<100;i++)f.runtime.update(.05);
  for(const item of f.runtime.snapshot(true).creatures){assert(!avoid(item.x,item.z),'mini workspace remains clear');const mesh=f.scene.meshes.find(m=>m.name==='halloween-'+item.species+'-'+item.anchor+'-'+item.id.split(':').at(-1));mesh.computeWorldMatrix(true);assert.equal(mesh.layerMask,0x20000000);if(item.airborne)assert(mesh.getBoundingInfo().boundingBox.minimumWorld.y>121);else near(mesh.getBoundingInfo().boundingBox.minimumWorld.y,120-.025*item.scale,'actual grounded feet contact elevated floor');}
 }finally{f.close();}
});
test('pause and reduced motion freeze creatures; quality preserves population and bounds distant work',()=>{
 const f=fixture({anchors:[{id:'near',x:0,z:0},{id:'far',x:200,z:0}]});
 try{
  f.runtime.update(.1);const before=f.runtime.snapshot(true),baseline=counts(f.scene);for(let i=0;i<50;i++)f.runtime.update(.1,{paused:true});assert.deepEqual(f.runtime.snapshot(true),before);for(let i=0;i<50;i++)f.runtime.update(.1,{reducedMotion:true});assert.deepEqual(f.runtime.snapshot(true),before);
  for(const tier of ['low','medium','high']){f.runtime.quality(tier);f.runtime.update(0,{paused:true,viewer:{x:0,z:0}});const state=f.runtime.snapshot();assert.equal(state.total,24);assert.equal(state.visible,12);assert(state.anchors.every(a=>a.count===12));}
  f.runtime.update(0,{paused:true,viewer:{x:200,z:0}});assert.equal(f.runtime.snapshot().visible,12);assert(f.scene.meshes.filter(m=>m.sourceMesh&&m.isEnabled()).every(m=>m.metadata.creature.anchor==='far'));
  for(let i=0;i<200;i++)f.runtime.update(.05);assert.deepEqual(counts(f.scene),baseline,'motion and quality allocate no scene resources');
 }finally{f.close();}
});
test('scene ownership is explicit and disposal or failed creation returns all resources to baseline',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),box=B.MeshBuilder.CreateBox('caller-owned',{},scene),material=new B.StandardMaterial('caller-material',scene);box.material=material;const baseline=counts(scene);
 try{
  for(let i=0;i<3;i++){const runtime=C.create({B,scene,anchors:[{id:'owned',x:0,z:0}],count:10});assert.equal(runtime.snapshot().total,10);runtime.dispose();runtime.dispose();runtime.update(.1);assert.deepEqual(counts(scene),baseline);assert(!box.isDisposed());}
  for(const config of [{count:9},{anchors:[{id:'blocked'}],avoid:()=>true},{anchors:[{id:'bad-height'}],height:()=>NaN},{anchors:[{id:'bad-altitude',altitude:-1}]},{anchors:[{id:'duplicate'},{id:'duplicate'}]}]){assert.throws(()=>C.create({B,scene,anchors:[{id:'default'}],...config}));assert.deepEqual(counts(scene),baseline,'invalid creation releases partially built resources');}
 }finally{scene.dispose();engine.dispose();}
});
