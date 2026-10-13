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
root.MoonAssetLibrary={place,replace,enhanceWorld,enhanceRace,enhanceInterior};
if(typeof module!=='undefined')module.exports=root.MoonAssetLibrary;
})(typeof window!=='undefined'?window:globalThis);
