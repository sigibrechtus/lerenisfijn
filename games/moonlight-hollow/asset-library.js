/* Moonlight Hollow — reusable glTF models, decoupled from game physics. */
(function(root){'use strict';
const INDEX='assets/model-library.json',sessions=new WeakMap();
function session(scene){
 if(sessions.has(scene))return sessions.get(scene);
 const s={imports:new Map(),disposed:false,catalog:fetch(INDEX).then(r=>{
   if(!r.ok)throw Error('catalog HTTP '+r.status);
   return r.json();
 }).then(j=>new Map((j.assets||[]).map(a=>[a.id,a]))).catch(e=>{
   console.warn('Moonlight asset catalog unavailable:',e.message);return new Map();
 })};
 sessions.set(scene,s);
 scene.onDisposeObservable.addOnce(()=>{s.disposed=true;s.imports.clear();sessions.delete(scene);});
 return s;
}
async function prototype(scene,id){
 const state=session(scene);
 if(!state.imports.has(id))state.imports.set(id,(async()=>{
  const B=root.BABYLON,entry=(await state.catalog).get(id);
  if(!entry||state.disposed||!B?.SceneLoader?.ImportMeshAsync)return null;
  try{
   const result=await B.SceneLoader.ImportMeshAsync(null,'',entry.path,scene,undefined,'.glb');
   if(state.disposed||scene.isDisposed()){result.meshes.forEach(m=>m.dispose());return null;}
   const group=new B.TransformNode('model-template-'+id,scene),loaded=new Set(result.meshes);
   result.meshes.filter(m=>!m.parent||!loaded.has(m.parent)).forEach(m=>m.setParent(group));
   const bounds=group.getHierarchyBoundingVectors(true),size=bounds.max.subtract(bounds.min);
   group.setEnabled(false);
   return {group,min:bounds.min.clone(),size,entry};
  }catch(e){console.warn('GLB '+id+' failed; leaving procedural fallback:',e.message);return null;}
 })());
 return state.imports.get(id);
}
async function place(scene,id,position={},opts={}){
 const s=session(scene),B=root.BABYLON,t=await prototype(scene,id);
 if(!t||s.disposed||scene.isDisposed()||opts.parent?.isDisposed?.())return null;
 const instance=t.group.clone('moon-model-'+id,opts.parent||null,false);
 if(!instance)return null;
 const height=opts.height||1.6,width=opts.width||2;
 const scale=Math.max(.025,Math.min(20,height/Math.max(.02,t.size.y),width/Math.max(.02,t.size.x,t.size.z)));
 instance.scaling.setAll(scale);
 instance.position.set(position.x||0,(position.y||0)-t.min.y*scale,position.z||0);
 instance.rotation.y=opts.rotation||0;
 instance.setEnabled(true);
 for(const m of instance.getChildMeshes()){
  m.isPickable=false;m.checkCollisions=false;m.receiveShadows=true;
  if(opts.layer!==undefined)m.layerMask=opts.layer;
  m.metadata={...m.metadata,moonVisualOnly:true,modelId:id};
 }
 instance.metadata={moonVisualOnly:true,modelId:id,license:t.entry.license};
 return instance;
}
async function replace(scene,original,id,opts={}){
 if(!original||original.isDisposed()||original.metadata?.miniAction||original.metadata?.use)return null;
 original.computeWorldMatrix(true);
 const box=original.getBoundingInfo?.().boundingBox;
 if(!box)return null;
 const size=box.maximumWorld.subtract(box.minimumWorld),center=box.centerWorld;
 const model=await place(scene,id,{x:center.x,y:box.minimumWorld.y,z:center.z},
  {height:opts.height||Math.max(.5,size.y),width:opts.width||Math.max(size.x,size.z,.7),rotation:original.rotation.y,layer:original.layerMask});
 if(model&&!original.isDisposed()&&opts.hideOriginal!==false)original.setEnabled(false);
 return model;
}
async function replacePumpkin(scene,node){
 if(!node||node.isDisposed())return;
 const parts=node.getChildMeshes().filter(m=>!m.metadata?.use&&!m.metadata?.miniAction);
 const body=parts.find(m=>m.name==='pumpkin');
 if(!body)return;
 const size=body.scaling.x||1;
 const model=await place(scene,'pumpkin-carved',{x:0,y:0,z:0},{parent:node,height:size*1.3,width:size*2});
 if(model&&!node.isDisposed())parts.forEach(m=>{if(!m.isDisposed())m.setEnabled(false);});
}
function nearObstacle(x,z,obstacles,track){
 if((obstacles||[]).some(o=>Math.abs(x-o.x)<o.w/2+2.5&&Math.abs(z-o.z)<o.d/2+2.5))return true;
 return (track?.samples||[]).some((p,i)=>i%4===0&&Math.hypot(x-p.x,z-p.z)<5.5);
}
function enhanceWorld({scene,sites,terrainHeight,obstacles,track,quality='balanced'}){
 if(!scene||quality==='low')return;
 const hi=quality==='high';
 scene.transformNodes.filter(n=>n.name==='pumpkin').slice(0,hi?80:18).forEach(n=>{replacePumpkin(scene,n);});
 scene.meshes.filter(m=>m.name==='weathered-boulder').slice(0,hi?32:10).forEach(m=>{replace(scene,m,'rocks');});
 const kinds=['gravestone-round','pumpkin-tall-carved','lantern-candle','mushroom-redgroup','plant-bushdetailed','gravestone-decorative','bench','crypt-small','pine-crooked','coffin','gravestone-cross','rock-largea','flower-purpleb','lightpost-single','hay-bale','tree-large','chest'];
 const centres=[{x:0,z:0},...Object.values(sites||{})];
 let placed=0;
 for(let i=0;i<(hi?100:40);i++){
  const c=centres[i%centres.length],angle=i*2.399963229728653,dist=13+i%4*3;
  const x=c.x+Math.cos(angle)*dist,z=c.z+Math.sin(angle)*dist;
  if(nearObstacle(x,z,obstacles,track))continue;
  const id=kinds[i%kinds.length],large=['pine-crooked','crypt-small','tree-large','lightpost-single'].includes(id);
  place(scene,id,{x,y:terrainHeight(x,z),z},{height:large?5:id==='mushroom-redgroup'?0.9:1.8,width:large?5:2.5,rotation:angle});
  placed++;
 }
 return placed;
}
function enhanceRace(scene,quality='balanced'){
 if(!scene||quality==='low')return;
 const mapping={'rally-gravestone':'gravestone-round','rally-boundary-pumpkin':'pumpkin-carved','rally-spectator-ghost':'character-ghost','pumpkin-cluster':'pumpkin-tall-carved','rally-zombie-body':'character-zombie'};
 const seen=new Map();
 scene.meshes.forEach(m=>{
  const id=mapping[m.name];if(!id)return;
  const count=seen.get(id)||0;seen.set(id,count+1);
  if(count<(quality==='high'?48:12))replace(scene,m,id);
 });
}
function enhanceInterior(scene,parent){
 if(!scene||!parent)return;
 parent.getChildMeshes().filter(m=>m.name==='interior-ribbed-pumpkin').slice(0,4).forEach(m=>replace(scene,m,'pumpkin-carved'));
}
// Authored production GLBs: separate from Kenney CC0 vendor manifest.
// Each may include its own node/material hierarchy and animation assets.
const PRODUCTION={
 'moon-express-locomotive':{
  high:'assets/models/custom/moon-express/moon-express-hero.glb',
  balanced:'assets/models/custom/moon-express/moon-express-mobile.glb',
  low:null
 }
};
async function placeProduction(scene,id,parent,opts={}){
 const B=root.BABYLON,info=PRODUCTION[id];
 if(!scene||!B?.SceneLoader?.ImportMeshAsync||!info||!parent||parent.isDisposed())return null;
 const geometryQuality=opts.geometryQuality==='high'||opts.quality==='high'?'high':'balanced';
 const textureQuality=opts.textureQuality==='high'?'high':'balanced';
 const path=info[geometryQuality];
 if(!path)return null;
 let result;
 try{
  result=await B.SceneLoader.ImportMeshAsync(null,'',path,scene,undefined,'.glb');
 }catch(e){
  console.warn('Production GLB unavailable; preserving procedural scene:',id,e?.message);
  return null;
 }
 if(scene.isDisposed()||parent.isDisposed()){
  result.meshes.forEach(m=>m.dispose());return null;
 }
 const node=new B.TransformNode('moon-production-'+id,scene);
 const included=new Set(result.meshes);
 // Imported GLB root transforms can contain absolute authoring offsets.
 // Preserve their local geometry hierarchy but discard imported scene placement.
 result.meshes.filter(m=>!m.parent||!included.has(m.parent)).forEach(m=>{
  m.setParent(node);
  m.position.set(0,0,0);
  m.rotationQuaternion=null;
  m.rotation.set(0,0,0);
 });
 node.parent=parent;
 node.scaling.setAll(opts.scale||.66);
 // Calibrate the imported locomotive against the actual 2 m rail gauge.
 // The GLB is authored +Y up / +Z forward; center its geometry on the
 // transport transform, fit its width and length uniformly, then seat it on the rails.
 if(id==='moon-express-locomotive'&&B.Matrix?.Invert&&B.Vector3?.TransformCoordinates){
  parent.computeWorldMatrix(true);node.computeWorldMatrix(true);
  // Measure imported bounds in the locomotive's own coordinates, never in the
   // carriage/world transform; otherwise calibration can offset it into the square.
   const inverse=B.Matrix.Invert(node.getWorldMatrix());
  const mins=[Infinity,Infinity,Infinity],maxs=[-Infinity,-Infinity,-Infinity];
  for(const part of node.getChildMeshes()){
   if(!part.getBoundingInfo)continue;
   part.computeWorldMatrix(true);
   const corners=part.getBoundingInfo()?.boundingBox?.vectorsWorld||[];
   for(const corner of corners){
    const p=B.Vector3.TransformCoordinates(corner,inverse);
    for(let i=0;i<3;i++){const v=[p.x,p.y,p.z][i];mins[i]=Math.min(mins[i],v);maxs[i]=Math.max(maxs[i],v);}
   }
  }
  const width=maxs[0]-mins[0],height=maxs[1]-mins[1],length=maxs[2]-mins[2];
  if([width,height,length].every(v=>Number.isFinite(v)&&v>.01)){
   // Keep wheels inside the rails and prevent an oversized body overhanging the station.
   const fit=Math.min(2.25/width,4.45/length,3.05/height,1.75);
   if(Number.isFinite(fit)&&fit>.05){
    node.scaling.scaleInPlace(fit);
    node.computeWorldMatrix(true);
    const midX=(mins[0]+maxs[0])/2,midZ=(mins[2]+maxs[2])/2;
    node.position.x-=midX*fit;
    node.position.z-=midZ*fit;
    node.position.y+=.12-mins[1]*fit;
    node.computeWorldMatrix(true);
    node.metadata={...node.metadata,trackFit:{width:width*fit,length:length*fit,height:height*fit}};
   }
  }
 }
 for(const part of node.getChildMeshes()){
  part.checkCollisions=false;part.isPickable=false;part.receiveShadows=true;
  part.metadata={...part.metadata,moonVisualOnly:true,productionAsset:id};
 }
 // High-tier PBR explicitly switches the locomotive's UV-compatible paint maps
 // to 4096² images. The GLB embeds 512px equivalents for balanced/mobile.
 if(geometryQuality==='high'&&textureQuality==='high'&&(scene.getEngine()?.getCaps()?.maxTextureSize||0)>=4096){
  const prefix='assets/models/custom/moon-express/textures-4k/';
  const paintMaterials=new Set(node.getChildMeshes().map(m=>m.material).filter(m=>
   m instanceof B.PBRMaterial&&m.name.includes('moon-red-pbr')));
  for(const m of paintMaterials){
   const albedo=new B.Texture(prefix+'albedo.png',scene,true,false);
   const normal=new B.Texture(prefix+'normal.png',scene,true,false);
   const packed=new B.Texture(prefix+'orm.png',scene,true,false);
   [albedo,normal,packed].forEach(t=>{t.anisotropicFilteringLevel=8;});
   m.albedoTexture=albedo;m.bumpTexture=normal;m.metallicTexture=packed;
   m.ambientTexture=packed;
   m.useRoughnessFromMetallicTextureGreen=true;
   m.useMetallnessFromMetallicTextureBlue=true;
   m.useAmbientInGrayScale=true;
  }
 }
 node.metadata={productionAsset:id,quality:geometryQuality,geometryQuality,textureQuality,source:path};
 return node;
}
root.MoonAssetLibrary={place,replace,enhanceWorld,enhanceRace,enhanceInterior,placeProduction,PRODUCTION};
if(typeof module!=='undefined')module.exports=root.MoonAssetLibrary;
})(typeof window!=='undefined'?window:globalThis);
