'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const library=require('../games/moonlight-hollow/asset-library.js');
const base=path.resolve(__dirname,'../games/moonlight-hollow');

function harness(){
 const requests=[],textures=[],parts=[];
 class PBRMaterial{constructor(name){this.name=name;}}
 class TransformNode{
  constructor(name){this.name=name;this.metadata=null;this.scaling={setAll:v=>{this.scale=v;}};}
  getChildMeshes(){return parts.filter(p=>p.parent===this);}
  isDisposed(){return false;}
 }
 class Texture{
  constructor(name){this.name=name;textures.push(name);}
 }
 const B={PBRMaterial,TransformNode,Texture,SceneLoader:{
  async ImportMeshAsync(_names,_root,file){
   requests.push(file);
   const part={name:'hero-wheel',material:new PBRMaterial('moon-red-pbr'),
    metadata:{},isPickable:true,checkCollisions:true,receiveShadows:false,
    setParent(node){this.parent=node;},dispose(){this.disposed=true;}};
   parts.push(part);return{meshes:[part]};
  }
 }};
 const scene={isDisposed:()=>false,getEngine:()=>({getCaps:()=>({maxTextureSize:4096})})};
 const parent={isDisposed:()=>false,name:'moon-express'};
 return{B,scene,parent,requests,textures,parts};
}

test('69K-triangle hero train drives transport at mobile texture quality',async()=>{
 const original=globalThis.BABYLON,h=harness();globalThis.BABYLON=h.B;
 try{
  const node=await library.placeProduction(h.scene,'moon-express-locomotive',h.parent,{
   quality:'balanced',geometryQuality:'high',textureQuality:'balanced',scale:.85
  });
  assert.ok(node);
  assert.equal(h.requests[0],'assets/models/custom/moon-express/moon-express-hero.glb');
  assert.equal(node.parent,h.parent);
  assert.equal(node.scale,.85);
  assert.equal(node.metadata.geometryQuality,'high');
  assert.equal(node.metadata.textureQuality,'balanced');
  assert.deepEqual(h.textures,[],'mobile uses embedded PBR maps, not 4K downloads');
  assert.equal(h.parts[0].checkCollisions,false);
  assert.equal(h.parts[0].isPickable,false);
  assert.equal(h.parts[0].metadata.moonVisualOnly,true);
 }finally{globalThis.BABYLON=original;}
});

test('optional 4K locomotive textures only load for desktop HD',async()=>{
 const original=globalThis.BABYLON,h=harness();globalThis.BABYLON=h.B;
 try{
  const node=await library.placeProduction(h.scene,'moon-express-locomotive',h.parent,{
   quality:'high',geometryQuality:'high',textureQuality:'high',scale:.85
  });
  assert.ok(node);
  assert.equal(h.requests[0],'assets/models/custom/moon-express/moon-express-hero.glb');
  assert.equal(h.textures.length,3);
  assert(h.textures.every(s=>s.startsWith('assets/models/custom/moon-express/textures-4k/')));
 }finally{globalThis.BABYLON=original;}
});

test('high-mesh GLB asset exists and the authored report documents the mesh',()=>{
 const dir=path.join(base,'assets/models/custom/moon-express');
 const report=JSON.parse(fs.readFileSync(path.join(dir,'model-report.json'),'utf8'));
 assert.equal(report.hero.triangles,69772);
 assert(fs.statSync(path.join(dir,'moon-express-hero.glb')).size>1000000);
});
