'use strict';
// Regression: optional 3D model imports must never prevent the playable Babylon
// world from starting, including when iOS holds an older cached asset-library.js.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const base=path.resolve(__dirname,'../games/moonlight-hollow');
const worldSource=fs.readFileSync(path.join(base,'world.js'),'utf8');
const start=worldSource.indexOf("const locomotiveMount=new B.TransformNode('moon-express-locomotive-front',scene);");
const end=worldSource.indexOf('const railMotion=R.create()',start);
assert.ok(start>0&&end>start,'Production import block must remain identifiable');
const importCode=worldSource.slice(start,end);

async function simulate({library,quality='auto',userAgent='',disposed=false}={}){
 const calls=[],warnings=[],hidden=[],artHidden=[];
 const train={
  getChildMeshes:()=>[{isDisposed:()=>false,setEnabled:enabled=>hidden.push(enabled)}],
  isDisposed:()=>disposed
 };
 const scene={isDisposed:()=>disposed};
 const locomotiveMount={parent:train,position:{x:0,y:0,z:4.5,set(x,y,z){this.x=x;this.y=y;this.z=z;}},isDisposed:()=>disposed};
 const B={TransformNode:class {constructor(){return locomotiveMount;}}};
 vm.runInNewContext(importCode,{
  root:{MoonAssetLibrary:library,navigator:{userAgent}},
  api:{prefs:()=>({quality})},scene,train,B,mode:'world',mobileSafari:/iPhone|iPad|iPod/i.test(userAgent),
  console:{warn:(...args)=>warnings.push(args)},
  Promise
 },{filename:'moonlight-production-import.js'});
 // Drain both the deferred import and its fulfillment/rejection handlers.
 await new Promise(resolve=>setImmediate(resolve));
 return {calls,warnings,hidden,artHidden,scene,train};
}

test('missing asset library does not crash or hide original locomotive',async()=>{
 const r=await simulate();
 assert.deepEqual(r.hidden,[]);
 assert.deepEqual(r.warnings,[]);
});

test('outdated cached asset library without placeProduction is harmless',async()=>{
 const r=await simulate({library:{place(){}}});
 assert.deepEqual(r.hidden,[]);
 assert.deepEqual(r.warnings,[]);
});

test('failed production importer leaves procedural train visible',async()=>{
 const r=await simulate({library:{placeProduction:()=>{throw Error('Asset unavailable');}}});
 assert.deepEqual(r.hidden,[]);
 assert.equal(r.warnings.length,1);
});

test('rejected production import leaves procedural train visible',async()=>{
 const r=await simulate({library:{placeProduction:()=>Promise.reject(Error('HTTP 404'))}});
 assert.deepEqual(r.hidden,[]);
 assert.equal(r.warnings.length,1);
});

test('successful import preserves HD locomotive and boarding wagon',async()=>{
 const calls=[],art={setEnabled:()=>{}};
 const r=await simulate({library:{placeProduction:(scene,id,parent,opts)=>{calls.push({scene,id,parent,opts});return Promise.resolve(art);}}});
 assert.equal(calls.length,1);
 assert.equal(calls[0].id,'moon-express-locomotive');
 assert.equal(calls[0].opts.quality,'balanced');
 assert.equal(calls[0].opts.geometryQuality,'high');
 assert.equal(calls[0].opts.textureQuality,'balanced');
 assert.equal(calls[0].opts.scale,.85);
 assert.deepEqual(r.hidden,[]);
});

test('iPhone HD uses high-poly train with mobile-safe 512px PBR textures',async()=>{
 const options=[];
 const r=await simulate({quality:'high',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',library:{
  placeProduction:(_scene,_id,_parent,opts)=>{options.push(opts);return Promise.resolve({setEnabled(){}});}
 }});
 assert.equal(options.length,1);
 assert.equal(options[0].geometryQuality,'high');
 assert.equal(options[0].quality,'balanced');
 assert.equal(options[0].textureQuality,'balanced');
 assert.deepEqual(r.hidden,[false]);
});

test('desktop HD retains the full 69K-triangle model and 4K PBR path',async()=>{
 const qualities=[];
 await simulate({quality:'high',library:{
  placeProduction:(_scene,_id,_parent,opts)=>{qualities.push(opts.quality);return null;}
 }});
 assert.deepEqual(qualities,['high']);
});

test('Eco mode still uses the hero locomotive as transport when available',async()=>{
 const calls=[];
 const r=await simulate({quality:'low',library:{placeProduction:(_scene,_id,_train,opts)=>{calls.push(opts);return Promise.resolve({setEnabled(){}});}}});
 assert.equal(calls.length,1);
 assert.equal(calls[0].geometryQuality,'high');
 assert.equal(calls[0].textureQuality,'balanced');
 assert.deepEqual(r.hidden,[false]);
});

test('HTML and service worker publish the same versioned train scripts',()=>{
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 for(const name of ['asset-library.js','world.js','adventure.js']){
  const version=html.match(new RegExp('src="'+name.replace('.','\\.')+'\\?v=\\d+"'));
  assert.ok(version,name+' must have versioned HTML script');
  assert.ok(sw.includes('./'+version[0].slice(5,-1)),name+' service-worker version must match');
 }
 assert.match(sw,/moonlight-hollow-3d-v\d+/);
});
test('boarding and moving never hide the production locomotive; ride camera is inside hero cabin',()=>{
 const src=fs.readFileSync(path.join(base,'world.js'),'utf8');
 const board=src.slice(src.indexOf('function boardTrain('),src.indexOf('function tickRide(',src.indexOf('function boardTrain(')));
 const tick=src.slice(src.indexOf('function tickRide('),src.indexOf('function interactable(',src.indexOf('function tickRide(')));
 const finish=src.slice(src.indexOf('function finishRide('),src.indexOf('function nearbyStation('));
 assert.doesNotMatch(board,/productionTrain\?\.setEnabled\(false\)/);
 assert.doesNotMatch(tick,/productionTrain\?\.setEnabled\(false\)/);
 assert.doesNotMatch(finish,/productionTrain\?\.setEnabled\(true\)/);
 assert.match(board,/hero\.parent=train/);
 assert.match(board,/rideCamera\.position\.set\(-4\*railMotion\.snapshot\(\)\.direction,1\.82,-1\.7\)/);
 assert.match(tick,/rideCamera\.position\.set\(-4\*state\.direction\*\(1-t\),1\.82,-1\.7\)/);
 assert.match(src,/function moveTrain\(state,rollDistance=0\)\{train\.position\.set\(state\.x,typeof terrainHeight==='function'\?terrainHeight\(state\.x,state\.z\):0,state\.z\)/,'moving train follows the same terrain elevation as the rails');
});

