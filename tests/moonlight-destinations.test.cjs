const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js')),{createCanvas}=require('@napi-rs/canvas');
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};global.window=global;global.addEventListener=()=>{};global.removeEventListener=()=>{};global.BABYLON=B;
const G=require(path.join(base,'mini-games.js')),D=require(path.join(base,'destinations.js')),L=require(path.join(base,'landscape.js'));
test('six landmarks have flat reachable entrances and release their bounded scene resources',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),height=L.makeHeight(),colliders=[],baseline={meshes:scene.meshes.length,materials:scene.materials.length,textures:scene.textures.length,nodes:scene.transformNodes.length};
 const world={scene,terrainHeight:height,addObstacles:v=>colliders.push(...v)},scenery=D.create(world,{lang:()=> 'nl'});
 assert.deepEqual(Object.keys(D.sites).sort(),Object.keys(G.catalog).sort());assert.equal(colliders.length,4);
 for(const [id,s]of Object.entries(D.sites)){
  assert(L.validPosition(s.entry));assert.equal(D.nearest(s.entry.x,s.entry.z),id);assert(D.reserved(s.x,s.z));
  for(let t=0;t<=1;t+=.05)assert.equal(height(s.entry.x*t,s.entry.z*t),0,'flat approach');
  for(let a=0;a<Math.PI*2;a+=.3)assert.equal(height(s.x+12*Math.cos(a),s.z+12*Math.sin(a)),0,'flat courtyard');
  assert(scene.getMeshByName('destination-sign-'+id));
  assert(!colliders.some(c=>Math.abs(s.entry.x-c.x)<c.w/2+1&&Math.abs(s.entry.z-c.z)<c.d/2+1),'clear entry');
 }
 const counts=[scene.meshes.length,scene.materials.length,scene.textures.length];scenery.language('fr');for(let i=0;i<600;i++)scenery.tick(1/60,false);assert.deepEqual([scene.meshes.length,scene.materials.length,scene.textures.length],counts);
 scenery.dispose();assert.equal(scene.meshes.length,baseline.meshes);assert.equal(scene.materials.length,baseline.materials);assert.equal(scene.textures.length,baseline.textures);assert.equal(scene.transformNodes.length,baseline.nodes);scene.dispose();engine.dispose();
});
