/* Original optional attraction landmarks: bounded scenery, shared materials, no remote assets. */
(function(root){'use strict';
const sites={
 mansion:{x:-96,z:81,entry:{x:-96,z:68},music:'castle',icon:'🏚'},
 potions:{x:84,z:-66,entry:{x:84,z:-78},music:'garden',icon:'⚗'},
 broom:{x:98,z:77,entry:{x:98,z:65},music:'tower',icon:'🧹'},
 garden:{x:-96,z:-69,entry:{x:-96,z:-82},music:'garden',icon:'🌱'},
 railway:{x:-34,z:140,entry:{x:-34,z:128},music:'tower',icon:'🚂'},
 rally:{x:38,z:-83,entry:{x:38,z:-97},music:'woods',icon:'🎃'}
};
function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
function reserved(x,z){return Object.values(sites).some(s=>Math.hypot(x-s.x,z-s.z)<15||segmentDistance(x,z,{x:0,z:0},s.entry)<3.6);}
function nearest(x,z,radius=5.5){let id=null,best=radius;for(const [key,s]of Object.entries(sites)){const d=Math.hypot(x-s.entry.x,z-s.entry.z);if(d<best){id=key;best=d;}}return id;}
function create(world,options={}){
 const B=root.BABYLON,T=root.MoonGrounding||(typeof require==='function'?require('./grounding.js'):null),scene=world.scene,height=world.terrainHeight,roots=[],materials=[],labels=[],animated=[],colliders=[];
 if(!T)throw new Error('Terrain grounding must load before destinations');
 const palette={stone:'#586079',wood:'#684132',plaster:'#aa8279',roof:'#352f52',gold:'#ecb861',orange:'#d97830',teal:'#59b8b2',purple:'#8c65ae',dark:'#211f37',light:'#ffd18a',soil:'#514039',leaf:'#799367'};
 const mats={};for(const [name,hex]of Object.entries(palette)){const m=new B.StandardMaterial('attraction-'+name,scene);m.diffuseColor=B.Color3.FromHexString(hex);m.specularColor=new B.Color3(.1,.1,.12);if(['light','teal'].includes(name))m.emissiveColor=m.diffuseColor.scale(name==='light'?.7:.12);mats[name]=m;materials.push(m);}
 function primitive(kind,name,opt,pos,mat,parent){const m=B.MeshBuilder[kind]('destination-'+name,opt,scene);m.position.set(...pos);m.material=mats[mat];m.parent=parent;m.isPickable=false;m.receiveShadows=true;return m;}
 const box=(n,p,s,m,parent)=>primitive('CreateBox',n,{width:s[0],height:s[1],depth:s[2]},p,m,parent);
 const cylinder=(n,p,h,d,m,parent,top=d)=>primitive('CreateCylinder',n,{height:h,diameter:d,diameterTop:top,tessellation:16},p,m,parent);
 function sphere(n,p,s,m,parent){const o=primitive('CreateSphere',n,{diameter:1,segments:16},p,m,parent);o.scaling.set(...s);return o;}
 function pumpkin(x,z,size,parent,base=.07){sphere('pumpkin',[x,base+size*.425,z],[size,size*.85,size],'orange',parent);cylinder('stem',[x,base+size*.95,z],size*.2,size*.12,'wood',parent);for(const d of [-1,1])sphere('pumpkin-eye',[x+d*size*.19,base+size*.56,z-size*.44],[size*.12,size*.15,size*.06],'light',parent);}
 function roof(x,y,z,w,d,parent){for(const side of [-1,1]){const m=box('roof',[x+side*w*.25,y,z],[w*.58,.3,d],'roof',parent);m.rotation.z=-side*.5;}box('ridge',[x,y+w*.12,z],[.35,.3,d],'gold',parent);}
 function window(x,y,z,parent){box('glowing-window',[x,y,z],[1.15,1.65,.13],'light',parent);box('window-cross',[x,y,z-.09],[.1,1.75,.15],'dark',parent);box('window-cross',[x,y,z-.09],[1.2,.1,.15],'dark',parent);}
 function sign(id,parent){const tex=new B.DynamicTexture('destination-title-'+id,{width:1024,height:256},scene,true);tex.hasAlpha=true;const mat=new B.StandardMaterial('destination-title-'+id,scene);mat.diffuseTexture=tex;mat.emissiveColor=B.Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;materials.push(mat);const m=B.MeshBuilder.CreatePlane('destination-sign-'+id,{width:8,height:2},scene);m.parent=parent;m.position.set(0,3,-11.2);m.material=mat;m.isPickable=false;labels.push({id,tex,m});}
 function arch(parent,z=-11){for(const x of [-4,4]){box('entrance-post',[x,1.8,z],[.45,3.6,.5],'wood',parent);sphere('entrance-lantern',[x,4.25,z],[.65,.8,.65],'light',parent);}box('entrance-beam',[0,3.65,z],[9,.5,.65],'roof',parent);}
 for(const [id,s]of Object.entries(sites)){
  const node=new B.TransformNode('destination-'+id,scene);node.position.set(s.x,height(s.x,s.z),s.z);roots.push(node);
  T.supportGroup(B,scene,height,node,{radius:12.5},{material:mats.stone,name:'destination-foundation-'+id});
  cylinder('courtyard',[0,.035,0],.07,25,'stone',node);
  arch(node);sign(id,node);
  if(id==='mansion'){
   box('mansion-main',[0,4,1],[14,8,10],'plaster',node);roof(0,8.3,1,15,12,node);
   for(const x of [-6,6]){cylinder('mansion-tower',[x,5,-2],10,3.2,'stone',node);cylinder('mansion-tower-roof',[x,11,-2],3.4,4.3,'roof',node,0);}
   box('mansion-door',[0,1.8,-4.1],[2.4,3.6,.2],'dark',node);box('door-frame',[0,3.75,-4.2],[3,.35,.35],'gold',node);
   for(const x of [-4,0,4])for(const y of [2.5,6])if(x||y>3)window(x,y,-4.12,node);
   for(const x of [-7,7])pumpkin(x,-7,1.3,node);
   colliders.push({x:s.x,z:s.z+1,w:14.6,d:10.6});
  }else if(id==='potions'){
   for(const x of [-5,5]){box('workshop-post',[x,2.9,0],[.45,5.8,.5],'wood',node);box('shelf',[x,2,1],[2,.25,5],'wood',node);}
   roof(0,6,0,12,10,node);cylinder('cauldron-foot',[0,.085,-1],.03,3.4,'stone',node);cylinder('cauldron',[0,1.15,-1],2.1,3.4,'dark',node,4);cylinder('potion-surface',[0,2.22,-1],.06,3.2,'teal',node);
   const bubble=sphere('potion-bubble',[0,2.9,-1],[.5,.5,.5],'teal',node);animated.push({m:bubble,kind:'bubble',base:2.9});
   for(const x of [-4,4])for(let i=0;i<3;i++){cylinder('bottle',[x,2.45,-.8+i*1.5],.7,.45,i%2?'purple':'orange',node,.25);cylinder('bottle-neck',[x,2.9,-.8+i*1.5],.3,.16,'gold',node);}
   colliders.push({x:s.x,z:s.z-1,w:4,d:4});
  }else if(id==='broom'){
   cylinder('flight-tower',[0,4,2],8,5,'stone',node);cylinder('flight-roof',[0,9.5,2],3.5,7,'roof',node,0);window(0,5,-.52,node);
   for(let i=0;i<3;i++){const hoop=primitive('CreateTorus','flight-ring',{diameter:4,thickness:.19,tessellation:24},[-7+i*7,5.8+i*.7,-3],'gold',node);hoop.rotation.x=Math.PI/2;}
   box('broom-shaft',[-5,1.5,-6],[4,.12,.12],'wood',node);sphere('broom-bristles',[-7,1.5,-6],[1.3,.4,.7],'gold',node);colliders.push({x:s.x,z:s.z+2,w:5.5,d:5.5});
  }else if(id==='garden'){
   for(const x of [-5,0,5])for(const z of [-4,1]){box('garden-bed',[x,.3,z],[3.5,.6,3.3],'wood',node);box('garden-soil',[x,.62,z],[3.1,.08,2.9],'soil',node);pumpkin(x,z,.9,node,.66);cylinder('moonflower-stem',[x+1,1.1,z+.8],1,.08,'leaf',node);sphere('moonflower',[x+1,1.65,z+.8],[.6,.35,.6],'purple',node);}
   const ghost=new B.TransformNode('destination-garden-spirit',scene);ghost.parent=node;ghost.position.set(0,3.2,4);ghost.metadata={terrainAirborne:true};sphere('garden-ghost',[0,0,0],[1.7,2,1.5],'teal',ghost);animated.push({m:ghost,kind:'ghost',base:3.2});for(const x of [-.35,.35])sphere('ghost-eye',[x,.2,-.7],[.16,.22,.09],'dark',ghost);
  }else if(id==='railway'){
   box('railway-depot',[0,2.4,2],[12,4.8,7],'plaster',node);roof(0,5.1,2,13,9,node);for(const x of [-4,4])window(x,2.7,-1.55,node);box('depot-door',[0,1.7,-1.6],[2.2,3.4,.2],'dark',node);
   for(const z of [-8.4,-7.2,-6,-4.8,-3.6])box('display-sleeper',[0,.105,z],[2.2,.07,.35],'wood',node);for(const x of [-.85,.85])box('display-rail',[x,.2,-6],[.1,.12,6],'gold',node);box('display-carriage',[0,1.2,-6],[2,1.5,3],'teal',node);for(const x of [-1,1])for(const z of [-7,-5]){const wheel=cylinder('display-wheel',[x,.5,z],.22,.7,'dark',node);wheel.rotation.z=Math.PI/2;}colliders.push({x:s.x,z:s.z+2,w:12.5,d:7.5});
  }else{
   primitive('CreateTorus','rally-track',{diameter:17,thickness:.85,tessellation:48},[0,.12,0],'wood',node);
   for(const x of [-6,6]){box('finish-post',[x,2.5,2],[.5,5,.6],'gold',node);}box('finish-banner',[0,4.7,2],[12,1,.3],'purple',node);
   const kart=new B.TransformNode('destination-display-kart',scene);kart.parent=node;kart.position.set(-5,.17,-5);sphere('kart-body',[0,.7,0],[2.5,1.4,2.3],'orange',kart);box('kart-seat',[0,1.2,.2],[.8,.3,.8],'dark',kart);for(const x of [-1.2,1.2])for(const z of [-.8,.8]){const wheel=cylinder('kart-wheel',[x,.3,z],.4,.8,'dark',kart);wheel.rotation.z=Math.PI/2;}
  }
  const end=s.entry,dist=Math.hypot(end.x,end.z),count=Math.ceil(dist/4),left=[],right=[];for(let i=0;i<=count;i++){const t=i/count,x=end.x*t,z=end.z*t,dx=-end.z/dist*1.2,dz=end.x/dist*1.2;left.push(new B.Vector3(x+dx,height(x+dx,z+dz)+.055,z+dz));right.push(new B.Vector3(x-dx,height(x-dx,z-dz)+.055,z-dz));}
  const trail=B.MeshBuilder.CreateRibbon('destination-trail-'+id,{pathArray:[left,right],sideOrientation:B.Mesh.DOUBLESIDE},scene);trail.material=mats.soil;trail.isPickable=false;trail.receiveShadows=true;roots.push(trail);
 }
 world.addObstacles?.(colliders);
 function language(lang){for(const {id,tex}of labels){const c=tex.getContext(),name=root.MoonMiniGames?.catalog[id]?.name[lang]||id;c.clearRect(0,0,1024,256);c.fillStyle='#211f37ed';c.fillRect(0,0,1024,256);c.strokeStyle='#ecb861';c.lineWidth=7;c.strokeRect(5,5,1014,246);c.font='bold 64px sans-serif';const size=Math.min(64,Math.floor(64*970/Math.max(1,c.measureText(name).width)));c.textAlign='center';c.fillStyle='#ffdda0';c.font='bold '+size+'px sans-serif';c.fillText(name,512,110);c.font='32px sans-serif';c.fillStyle='#d4e4e5';c.fillText(lang==='fr'?'Approche-toi pour jouer':'Kom dichterbij om te spelen',512,180);tex.update();}}
 language(options.lang?.()||'nl');
 for(const node of roots){node.computeWorldMatrix(true);for(const m of node.getChildMeshes?.()||[]){if(['destination-flight-ring','destination-broom-shaft','destination-broom-bristles','destination-potion-bubble'].includes(m.name))m.metadata={...m.metadata,terrainAirborne:true};if(!animated.some(a=>a.m===m||m.isDescendantOf(a.m)))m.freezeWorldMatrix();}}
 return {sites,nearest,language,tick(dt,reduced){if(reduced)return;for(const item of animated){item.phase=(item.phase||0)+dt;item.m.position.y=item.base+Math.sin(item.phase*1.6)*.18;}},dispose(){for(const node of roots)node.dispose();for(const {tex}of labels)tex.dispose();for(const mat of materials)mat.dispose();}};
}
const api={sites,reserved,nearest,segmentDistance,create};root.MoonDestinations=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
