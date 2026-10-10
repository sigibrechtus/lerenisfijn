/* Live operation choreography. One operation at a time; a fixed particle pool, no video downloads. */
(function(root){'use strict';
function create({B,scene,layer,origin=120,quality='balanced',reducedMotion=false,effect=()=>{}}){
 let operation=null,pool=[],mat=null;
 const ease=t=>t*t*(3-2*t),name=(list,n)=>list.find(m=>m.name==='mini-'+n);
 function ensurePool(){if(mat)return;mat=new B.StandardMaterial('mini-operation-glow',scene);mat.diffuseColor=B.Color3.FromHexString('#ffd489');mat.emissiveColor=mat.diffuseColor;mat.disableLighting=true;mat.fogEnabled=false;for(let i=0;i<(quality==='low'?12:24);i++){const m=B.MeshBuilder.CreateSphere('mini-operation-particle',{diameter:.16,segments:6},scene);m.material=mat;m.layerMask=layer;m.isPickable=false;m.setEnabled(false);pool.push(m);}}
 function restore(){if(!operation)return;for(const item of operation.saved){item.m.position.copyFrom(item.p);item.m.rotation.copyFrom(item.r);item.m.scaling.copyFrom(item.s);item.m.visibility=item.visibility;}for(const m of pool)m.setEnabled(false);operation=null;}
 function play({id,action,before,meshes,correct=false}){
  restore();ensurePool();let kind='select',sound='pickup',duration=.65;
  if(action==='hint'){kind='hint';sound='hint';duration=.55;}
  else if(action==='reset'){kind='reset';sound='reset';duration=.65;}
  else if(action==='undo'||action.startsWith('remove:')){kind='remove';sound='remove';duration=.6;}
  else if(action==='slower'||action==='faster'){kind='pace';sound='ui';duration=.35;}
  else if(id==='potions'){kind=action==='check'?'mix':action==='add:0'?'pour':'powder';sound=kind==='pour'?'pour':kind==='mix'?'bubble':'place';duration=kind==='mix'?1.45:.9;}
  else if(id==='mansion'){kind='unlock';sound='bottle';duration=correct?1.15:.8;}
  else if(id==='garden'){kind=action==='check'?(correct?'grow':'verify'):'plant';sound=kind==='plant'?'leaf':correct?'lantern':'retry';duration=.85;}
  else if(id==='railway'){kind=action==='check'?(correct?'depart':'verify'):'station';sound=kind==='depart'?'train':kind==='verify'?'retry':'clock';duration=kind==='depart'&&correct?1.5:.7;}
  else if(id==='broom'||id==='rally'){kind='gate';sound=correct?'lantern':'retry';duration=.8;}
  let targets=meshes.filter(m=>m.metadata?.miniAction===action);
  if(id==='potions'&&action.startsWith('add:')){const index=Number(action.split(':')[1]);targets=meshes.filter(m=>m.name==='mini-bottle'&&Math.sign(m.position.x)===(index===0?-1:1));}
  if(!targets.length)targets=meshes.filter(m=>['mini-cauldron','mini-sprout','mini-station','mini-kart','mini-broom','mini-train','mini-key-bow','mini-seed-packet'].includes(m.name));
  const relevant=[...new Set([...targets,...meshes.filter(m=>['mini-door','mini-stirrer','mini-liquid','mini-train'].includes(m.name))])];
  const saved=relevant.map(m=>({m,p:m.position.clone(),r:m.rotation.clone(),s:m.scaling.clone(),visibility:m.visibility}));
  mat.emissiveColor=B.Color3.FromHexString(correct?'#b5ebcb':kind==='verify'?'#eaa884':'#ffd489');
  operation={id,action,kind,correct,time:0,duration:reducedMotion?.22:duration,before,meshes,targets,saved,sound,point:targets[0]?.getAbsolutePosition().clone()||new B.Vector3(0,origin+3,12)};
  effect(sound,{point:operation.point,refDistance:24,gain:.65});return state();
 }
 function tick(dt){if(!operation)return false;const o=operation;o.time+=dt;const t=Math.min(1,o.time/o.duration),e=ease(t),arc=Math.sin(Math.PI*t);
  for(const item of o.saved){const m=item.m;m.position.copyFrom(item.p);m.rotation.copyFrom(item.r);m.scaling.copyFrom(item.s);}
  if(!reducedMotion){
   for(const item of o.saved.filter(v=>o.targets.includes(v.m))){const m=item.m;
    if(o.kind==='pour'||o.kind==='powder'){m.position.x=item.p.x*(1-.8*e);m.position.y=item.p.y+arc*2;m.rotation.z=(item.p.x<0?-1:1)*arc*.85;}
    else if(o.kind==='unlock'){m.position.x=item.p.x*(1-e);m.position.y=item.p.y+arc*1.5;m.position.z=item.p.z+(19-item.p.z)*e;m.rotation.y=item.r.y+e*Math.PI;}
    else if(o.kind==='plant'){const i=o.before.selected.length,x=(i-(o.before.task.items.length-1)/2)*5;m.position.x=item.p.x+(x-item.p.x)*e;m.position.z=item.p.z+6*e;m.position.y=item.p.y*(1-.35*e)+arc;}
    else if(o.kind==='remove'){m.position.y=item.p.y+arc*.65;m.scaling.scaleInPlace(1-arc*.35);}
    else if(o.kind==='reset'){m.scaling.scaleInPlace(1-arc*.45);m.rotation.y=item.r.y+arc*.35;}
    else{m.position.y=item.p.y+arc*.35;m.scaling.scaleInPlace(1+arc*.15);}
   }
   const spoon=name(o.meshes,'stirrer'),liquid=name(o.meshes,'liquid'),door=name(o.meshes,'door'),train=name(o.meshes,'train');
   if(o.kind==='mix'&&spoon){spoon.position.x=Math.cos(t*Math.PI*6)*.8;spoon.position.z=12+Math.sin(t*Math.PI*6)*.8;spoon.rotation.z=Math.sin(t*Math.PI*6)*.35;}
   if(o.kind==='mix'&&liquid)liquid.rotation.y=t*Math.PI*4;
   if(o.kind==='unlock'&&door&&o.correct)door.rotation.y=-e*1.2;
   if(o.kind==='depart'&&train&&o.correct)train.position.z=4+e*19;
  }
  const count=reducedMotion?3:pool.length;
  for(let i=0;i<pool.length;i++){const m=pool[i];m.setEnabled(i<count&&t<1);if(i>=count)continue;const p=(t+i/count)%1,a=i*2.4;
   if(o.kind==='pour'||o.kind==='powder'){m.position.set(Math.cos(a)*.65,origin+5-p*2.5,12+Math.sin(a)*.65);m.scaling.setAll(o.kind==='powder'?.55:.9);}
   else{const radius=reducedMotion?.45:1+p*2.5;m.position.set(o.point.x+Math.cos(a)*radius,o.point.y+(reducedMotion?.2:p*2),o.point.z+Math.sin(a)*radius);m.scaling.setAll(.4+Math.sin(Math.PI*p)*.8);}
   m.visibility=Math.max(.15,Math.sin(Math.PI*t));
  }
  return t>=1;
 }
 function motion(point,speed,fly,time){if(operation)return;if(reducedMotion||Math.abs(speed)<.4){for(const m of pool)m.setEnabled(false);return;}ensurePool();for(let i=0;i<pool.length;i++){const m=pool[i],p=(time*1.8+i/pool.length)%1;m.setEnabled(i<(fly?8:6));m.position.set(point.x+Math.sin(i*2.4)*.7,point.y-(fly?.15:.7)+p*.4,point.z-1-p*2);m.scaling.setAll(fly?.55:.75);m.visibility=(1-p)*.45;}}
 function state(){return operation?{action:operation.action,kind:operation.kind,progress:Math.min(1,operation.time/operation.duration),duration:operation.duration}:null;}
 function dispose(){restore();for(const m of pool)m.dispose();pool=[];mat?.dispose();mat=null;}
 return{play,tick,motion,state,clear:restore,dispose};
}
const api={create};root.MoonMiniGameEffects=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
