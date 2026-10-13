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
const start=worldSource.indexOf('const trainProxyMeshes=train.getChildMeshes().slice();');
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
 vm.runInNewContext(importCode,{
  root:{MoonAssetLibrary:library,navigator:{userAgent}},
  api:{prefs:()=>({quality})},scene,train,mode:'world',
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

test('successful import preserves model upgrade and hides procedural visual',async()=>{
 const calls=[],art={setEnabled:()=>{}};
 const r=await simulate({library:{placeProduction:(scene,id,parent,opts)=>{calls.push({scene,id,parent,opts});return Promise.resolve(art);}}});
 assert.equal(calls.length,1);
 assert.equal(calls[0].id,'moon-express-locomotive');
 assert.equal(calls[0].opts.quality,'balanced');
 assert.deepEqual(r.hidden,[false]);
});

test('iPhone HD uses the PBR-enabled mobile GLB, avoiding optional 4K maps',async()=>{
 const qualities=[];
 const r=await simulate({quality:'high',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',library:{
  placeProduction:(_scene,_id,_parent,opts)=>{qualities.push(opts.quality);return Promise.resolve({setEnabled(){}});}
 }});
 assert.deepEqual(qualities,['balanced']);
 assert.deepEqual(r.hidden,[false]);
});

test('desktop HD retains the full 69K-triangle model and 4K PBR path',async()=>{
 const qualities=[];
 await simulate({quality:'high',library:{
  placeProduction:(_scene,_id,_parent,opts)=>{qualities.push(opts.quality);return null;}
 }});
 assert.deepEqual(qualities,['high']);
});

test('Eco mode does not import a production train at startup',async()=>{
 let called=false;
 const r=await simulate({quality:'low',library:{placeProduction:()=>{called=true;}}});
 assert.equal(called,false);
 assert.deepEqual(r.hidden,[]);
});

test('HTML and service-worker both reference the same v44 game scripts',()=>{
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 for(const name of ['asset-library.js','world.js','adventure.js']){
  assert.ok(html.includes('src="'+name+'?v=44"'),name+' HTML version');
  assert.ok(sw.includes('./'+name+'?v=44'),name+' service worker version');
 }
 assert.match(sw,/moonlight-hollow-3d-v44/);
});
