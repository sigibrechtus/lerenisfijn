/* Original Halloween creature geometry. Four shared sources, bounded local
   patrols, no collision or picking, and explicit scene ownership. */
(function(root){'use strict';
const species=['ghost','bat','spider','pumpkin'],TAU=Math.PI*2;
function rngFor(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function create(options={}){
 const B=options.B||root.BABYLON,scene=options.scene,height=options.height||(()=>0),layer=options.layer??0x0fffffff,count=options.count??12,anchors=options.anchors||[];
 if(!B||!scene||typeof height!=='function')throw new TypeError('Creature scene, Babylon and floor height are required');
 if(!Number.isInteger(count)||count<10||count>20)throw new RangeError('Each creature anchor requires 10–20 inhabitants');
 if(!Array.isArray(anchors)||anchors.length>64)throw new RangeError('Creature anchors must be an array of at most 64 locations');
 const ownMaterials=[],multiMaterials=[],sourceParts=[],templates={},inhabitants=[],groups=[],container=new B.TransformNode('halloween-creatures',scene),avoid=options.avoid||(()=>false);let disposed=false,elapsed=0,accumulator=0,tier='medium',viewer=null;
 const material=(name,hex,emissive=0)=>{const m=new B.StandardMaterial('creature-'+name,scene);m.diffuseColor=B.Color3.FromHexString(hex);m.specularColor=new B.Color3(.05,.05,.06);m.emissiveColor=m.diffuseColor.scale(emissive);m.fogEnabled=options.fogEnabled!==false;ownMaterials.push(m);return m;};
 const mats={ghost:material('moon-white','#c6e7df',.16),dark:material('night','#252338'),wing:material('bat-wing','#69517f'),orange:material('pumpkin','#df802f'),green:material('stem','#687b49'),eyes:material('golden-eyes','#ffd37d',.35)};
 function part(kind,name,args,p,mat,scale){const m=B.MeshBuilder[kind]('creature-source-'+name,args,scene);m.position.set(...p);if(scale)m.scaling.set(...scale);m.material=mat;m.layerMask=layer;m.isPickable=false;sourceParts.push(m);return m;}
 function ell(name,p,scale,mat){return part('CreateSphere',name,{diameter:1,segments:8},p,mat,scale);}
 function tube(name,a,b,radius,mat){const start=new B.Vector3(...a),end=new B.Vector3(...b),delta=end.subtract(start),m=part('CreateCylinder',name,{height:delta.length(),diameter:radius*2,tessellation:6},start.add(end).scale(.5).asArray(),mat),up=B.Vector3.Up(),direction=delta.normalize(),axis=B.Vector3.Cross(up,direction);if(axis.lengthSquared()>1e-8)m.rotationQuaternion=B.Quaternion.RotationAxis(axis.normalize(),Math.acos(Math.max(-1,Math.min(1,B.Vector3.Dot(up,direction)))));return m;}
 function wing(side){const m=new B.Mesh('creature-source-bat-wing',scene),positions=[.1*side,.38,0,.74*side,.66,.025,.65*side,.37,.015,.51*side,.43,.015,.39*side,.15,0,.27*side,.3,0,.13*side,.16,0],indices=[];for(let i=1;i<6;i++)indices.push(0,i,i+1);const normals=[];B.VertexData.ComputeNormals(positions,indices,normals);const data=new B.VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.uvs=new Array(positions.length/3*2).fill(0);data.applyToMesh(m);m.material=mats.wing;mats.wing.backFaceCulling=false;m.layerMask=layer;m.isPickable=false;sourceParts.push(m);return m;}
 function merge(name,parts){const m=B.Mesh.MergeMeshes(parts,true,true,undefined,false,true);m.name='creature-template-'+name;m.isVisible=false;m.isPickable=false;m.layerMask=layer;m.receiveShadows=true;templates[name]=m;if(m.material?.getClassName()==='MultiMaterial')multiMaterials.push(m.material);}
 function build(){
  merge('ghost',[ell('ghost-body',[0,.54,0],[.61,.93,.52],mats.ghost),part('CreateCylinder','ghost-skirt',{height:.35,diameterTop:.48,diameterBottom:.65,tessellation:12},[0,.15,0],mats.ghost),...[-1,1].map(s=>ell('ghost-arm',[s*.32,.56,0],[.28,.19,.19],mats.ghost)),...[-1,1].map(s=>ell('ghost-eye',[s*.11,.65,-.247],[.095,.13,.035],mats.dark)),ell('ghost-mouth',[0,.43,-.259],[.095,.13,.04],mats.dark)]);
  merge('bat',[ell('bat-body',[0,.3,0],[.35,.48,.32],mats.dark),...[-1,1].map(s=>part('CreateCylinder','bat-ear',{height:.24,diameter:.14,diameterTop:0,tessellation:6},[s*.11,.61,0],mats.dark)),wing(-1),wing(1),...[-1,1].map(s=>ell('bat-eye',[s*.085,.42,-.148],[.07,.07,.027],mats.eyes))]);
  const spider=[ell('spider-body',[0,.23,.08],[.59,.37,.53],mats.dark),ell('spider-head',[0,.2,-.22],[.35,.29,.31],mats.wing),...[-1,1].map(s=>ell('spider-eye',[s*.075,.25,-.365],[.07,.07,.035],mats.eyes))];
  for(const side of [-1,1])for(let i=0;i<4;i++){const z=-.22+i*.15,knee=[side*.35,.25,z],foot=[side*(.5+(i%2)*.05),.02,z+(i-1.5)*.045];spider.push(tube('spider-upper-leg',[side*.15,.19,z],knee,.025,mats.dark),tube('spider-lower-leg',knee,foot,.02,mats.dark),ell('spider-foot',foot,[.04,.04,.04],mats.dark));}
  merge('spider',spider);
  merge('pumpkin',[ell('pumpkin-body',[0,.29,0],[.65,.52,.59],mats.orange),part('CreateCylinder','pumpkin-stem',{height:.18,diameter:.07,tessellation:6},[0,.64,0],mats.green),ell('pumpkin-leaf',[.075,.62,0],[.18,.065,.12],mats.green),...[-1,1].map(s=>ell('pumpkin-eye',[s*.115,.35,-.283],[.095,.105,.03],mats.eyes)),ell('pumpkin-mouth',[0,.2,-.283],[.23,.06,.035],mats.dark),...[-1,1].flatMap(x=>[-1,1].map(z=>ell('pumpkin-foot',[x*.22,.04,z*.14],[.13,.08,.17],mats.dark)))]);
 }
 const finite=(v,name)=>{if(!Number.isFinite(v))throw new TypeError('Invalid creature '+name);return v;};
 function floor(x,z,anchor){return Math.max(finite(height(x,z),'floor height'),anchor.minY);}
 function safePoint(x,z,anchor,foot){const d=Math.hypot(x-anchor.x,z-anchor.z);if(d-foot<anchor.innerRadius-1e-6||d+foot>anchor.radius+1e-6||avoid(x,z,anchor))return false;for(let k=0;k<8;k++){const a=k/8*TAU;if(avoid(x+Math.cos(a)*foot,z+Math.sin(a)*foot,anchor))return false;}return true;}
 function point(anchor,radius,angle){return{x:anchor.x+Math.sin(angle)*radius,z:anchor.z+Math.cos(angle)*radius};}
 function safeSegment(a,b,anchor,foot){const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.4));for(let i=0;i<=n;i++){const t=i/n;if(!safePoint(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,anchor,foot))return false;}return true;}
 function patrol(anchor,index,random,foot){
  const low=anchor.innerRadius+foot+.12,high=anchor.radius-foot-.12;if(high<=low)throw new RangeError('Creature annulus is too narrow at '+anchor.id);
  const preferred=index/count*TAU+random()*.12;
  for(let attempt=0;attempt<160;attempt++){
   const angle=preferred+attempt*2.399963229728653,radius=low+(high-low)*(attempt?random():.3+random()*.4),center=point(anchor,radius,angle);
   if(!safePoint(center.x,center.z,anchor,foot))continue;
   let span=.07,left=point(anchor,radius,angle-span),right=point(anchor,radius,angle+span);if(!safeSegment(left,center,anchor,foot)||!safeSegment(center,right,anchor,foot))continue;
   const limit=.42+random()*.3;for(let next=span+.07;next<=limit;next+=.07){const l=point(anchor,radius,angle-next),r=point(anchor,radius,angle+next);if(!safeSegment(l,left,anchor,foot)||!safeSegment(right,r,anchor,foot))break;span=next;left=l;right=r;}
   return{angle,radius,span};
  }
  throw new Error('No clear creature patrol near '+anchor.id+'; widen its annulus or move its anchor');
 }
 function place(item,time){
  let phase=time*item.speed+item.phase,angle=item.patrol.angle+Math.sin(phase)*item.patrol.span,next=point(item.anchor,item.patrol.radius,angle);const previous={x:item.mesh.position.x,z:item.mesh.position.z};
  if(!item.placed&&!safePoint(next.x,next.z,item.anchor,item.foot)){phase=item.phase=0;angle=item.patrol.angle;next=point(item.anchor,item.patrol.radius,angle);}
  if(item.placed&&!safeSegment(previous,next,item.anchor,item.foot))return;
  const m=item.mesh;m.position.x=next.x;m.position.z=next.z;
  const tangent=Math.cos(phase)>=0?1:-1;m.rotation.y=angle+(tangent>0?-Math.PI/2:Math.PI/2);
  if(item.airborne){m.position.y=floor(next.x,next.z,item.anchor)+item.altitude+Math.sin(phase*1.8)*.18;m.rotation.z=item.species==='bat'?Math.sin(phase*3)*.16:Math.sin(phase)*.045;}
  else{let low=floor(next.x,next.z,item.anchor);for(let k=0;k<8;k++){const a=k/8*TAU;low=Math.min(low,floor(next.x+Math.cos(a)*item.foot,next.z+Math.sin(a)*item.foot,item.anchor));}m.position.y=low-.025*item.scale;}
  item.placed=true;m.computeWorldMatrix(true);
 }
 function quality(value){tier=['low','medium','high'].includes(value)?value:'medium';return tier;}
 function cull(){const distance={low:48,medium:80,high:125}[tier];for(const item of inhabitants)item.mesh.setEnabled(!viewer||Math.hypot(item.anchor.x-viewer.x,item.anchor.z-viewer.z)<=distance+item.anchor.radius);}
 function snapshot(includePositions=false){const result={total:inhabitants.length,visible:inhabitants.filter(i=>i.mesh.isEnabled()).length,tier,elapsed,sourceMeshes:Object.keys(templates).length,sharedMaterials:ownMaterials.length,anchors:groups.map(a=>({id:a.id,count:a.count,innerRadius:a.innerRadius,radius:a.radius,species:{...a.species}}))};if(includePositions)result.creatures=inhabitants.map(i=>({id:i.id,anchor:i.anchor.id,species:i.species,airborne:i.airborne,x:i.mesh.position.x,y:i.mesh.position.y,z:i.mesh.position.z,scale:i.scale,patrolRadius:i.patrol.radius,foot:i.foot}));return result;}
 function dispose(){if(disposed)return;disposed=true;container.dispose();for(const m of sourceParts)if(!m.isDisposed())m.dispose();for(const m of Object.values(templates))m.dispose();for(const m of multiMaterials)m.dispose();for(const m of ownMaterials)m.dispose();inhabitants.length=0;groups.length=0;}
 try{
  build();sourceParts.length=0;const ids=new Set();
  for(let a=0;a<anchors.length;a++){
   const input=anchors[a],anchor={...input,id:String(input.id??a),x:finite(input.x??0,'anchor x'),z:finite(input.z??0,'anchor z'),innerRadius:finite(input.innerRadius??5,'inner radius'),radius:finite(input.radius??8,'outer radius'),minY:input.minY===undefined?-Infinity:finite(input.minY,'minimum floor'),count,species:Object.fromEntries(species.map(s=>[s,0]))};
   if(ids.has(anchor.id))throw new Error('Creature anchor IDs must be unique');ids.add(anchor.id);if(anchor.innerRadius<0||anchor.radius<=anchor.innerRadius)throw new RangeError('Invalid creature annulus at '+anchor.id);groups.push(anchor);
   const random=rngFor((options.seed??'moonlight-creatures')+':'+anchor.id);
   for(let i=0;i<count;i++){
    const type=species[i%species.length],scale=finite(input.scale??options.scale??1,'scale')*(.85+random()*.25);if(scale<=0)throw new RangeError('Creature scale must be positive');
    const airborne=type==='ghost'||type==='bat',foot=(type==='spider'?.67:type==='pumpkin'?.34:type==='bat'?.86:.52)*scale,path=patrol(anchor,i,random,foot),mesh=templates[type].createInstance('halloween-'+type+'-'+anchor.id+'-'+i),item={id:anchor.id+':'+i,anchor,species:type,mesh,airborne,foot,scale,patrol:path,phase:random()*TAU,speed:(.8+random()*.8)/(path.radius*path.span),altitude:finite(input.altitude??(type==='bat'?2.6:1.5),'altitude'),placed:false};
    if(airborne&&item.altitude<.8*scale)throw new RangeError('Airborne creature altitude must clear its floor');
    mesh.parent=container;mesh.scaling.setAll(scale);mesh.layerMask=layer;mesh.isPickable=false;mesh.checkCollisions=false;mesh.metadata={creature:{anchor:anchor.id,species:type,airborne}};inhabitants.push(item);anchor.species[type]++;place(item,0);
   }
  }
  quality(options.tier||'medium');
 }catch(error){dispose();throw error;}
 return{update(dt,state={}){if(disposed)return;if(state.viewer!==undefined)viewer=state.viewer;cull();const paused=state.paused??(typeof options.paused==='function'?options.paused():options.paused),reduced=state.reducedMotion??(typeof options.reducedMotion==='function'?options.reducedMotion():options.reducedMotion);if(paused||reduced)return;const delta=Number.isFinite(dt)?Math.max(0,Math.min(.1,dt)):0;elapsed+=delta;accumulator+=delta;const interval={low:1/15,medium:1/30,high:1/60}[tier];if(accumulator+1e-8<interval)return;accumulator=0;for(const item of inhabitants)if(item.mesh.isEnabled())place(item,elapsed);},quality,snapshot,dispose};
}
const api={species,create};root.MoonCreatures=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
