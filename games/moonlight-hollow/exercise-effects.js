/* Bounded live action feedback for campaign objects. No assets or meshes allocated per frame. */
(function(root){'use strict';
function create({B,scene,layer=0x10000000}={}){
 const materials=[],mat=(name,hex)=>{const m=new B.StandardMaterial(name,scene);m.diffuseColor=B.Color3.FromHexString(hex);m.emissiveColor=m.diffuseColor.scale(.65);m.fogEnabled=false;materials.push(m);return m;},gold=mat('exercise-action-gold','#ffce78'),blue=mat('exercise-action-blue','#86dbe3'),pink=mat('exercise-action-pink','#dd8ca3');
 const particles=Array.from({length:12},(_,i)=>{const m=B.MeshBuilder.CreateSphere('exercise-action-mote',{diameter:.09,segments:8},scene);m.material=gold;m.layerMask=layer;m.isPickable=false;m.setEnabled(false);return m;});
 const ring=B.MeshBuilder.CreateTorus('exercise-action-ring',{diameter:1,thickness:.025,tessellation:32},scene);ring.material=gold;ring.layerMask=layer;ring.isPickable=false;ring.setEnabled(false);
 let active=null,disposed=false,plays=0;
 function clear(){if(active)for(const t of active.targets)if(!t.mesh.isDisposed())t.mesh.scaling.copyFrom(t.scale);active=null;ring.setEnabled(false);particles.forEach(m=>m.setEnabled(false));}
 function play(kind,{point,from,meshes=[],reducedMotion=false}={}){
  if(disposed||!point)return false;clear();const targets=meshes.filter(m=>m&&!m.isDisposed()).slice(0,4).map(mesh=>({mesh,scale:mesh.scaling.clone()}));
  active={kind,point:new B.Vector3(point.x,point.y,point.z),from:from?new B.Vector3(from.x,from.y,from.z):null,targets,time:0,duration:reducedMotion?.12:kind==='pour'?.7:kind==='mirror'?.55:.42,reducedMotion};plays++;ring.position.copyFrom(active.point);ring.material=kind==='retry'?pink:kind==='pour'?blue:gold;ring.setEnabled(true);ring.visibility=.85;
  particles.forEach(m=>{m.material=ring.material;m.setEnabled(!reducedMotion);});tick(0);return true;
 }
 function tick(dt,{paused=false,reducedMotion=false}={}){
  if(!active||disposed||paused)return;const a=active;a.time+=Math.max(0,Math.min(.1,Number(dt)||0));const p=Math.min(1,a.time/a.duration),ease=p*p*(3-2*p),still=a.reducedMotion||reducedMotion;
  ring.visibility=(1-p)*.85;ring.scaling.setAll(still?1:.7+p*.9);
  for(const t of a.targets)if(!t.mesh.isDisposed())t.mesh.scaling.copyFrom(t.scale.scale(still?1:1+Math.sin(p*Math.PI)*.05));
  particles.forEach((m,i)=>{m.setEnabled(!still&&p<1);if(still)return;const angle=i*Math.PI*2/particles.length,r=.1+p*.5,center=a.from?B.Vector3.Lerp(a.from,a.point,ease):a.point;const y=a.kind==='pour'?(1-ease)*1.2:a.kind==='mirror'?0:Math.sin(p*Math.PI)*.25;m.position.set(center.x+Math.cos(angle)*r,center.y+y,center.z+Math.sin(angle)*r);m.visibility=1-p;});
  if(p===1)clear();
 }
 function snapshot(){return{active:active?.kind||null,plays,particleCount:particles.length,point:active?.point.asArray()||null};}
 function dispose(){if(disposed)return;clear();disposed=true;ring.dispose();particles.forEach(m=>m.dispose());materials.forEach(m=>m.dispose());}
 return{play,tick,clear,snapshot,dispose};
}
const api={create};root.MoonExerciseEffects=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
