/* Moonrise Village: curated, readable level-one scenery for Broom Flight.
 * The authoritative route / gates remain in broom-course.js. All procedural
 * meshes are created through the scene owner's tracked mesh() function.
 * Kenney CC0 GLBs in the existing asset manifest are optional visual upgrades.
 */
(function(root){'use strict';
function decorate({B,scene,origin=120,layer,course,mesh,material,quality='balanced',reducedMotion=false,assetLibrary=null,own=()=>{},isCurrent=()=>true}={}){
 if(!B||!course||!mesh||!material)throw Error('Moonrise scene needs Babylon and tracked mesh/material factories');
 const simple=quality==='low',stats={houses:0,trees:0,lanterns:0,props:0,glbRequested:0};
 const mats={
  stone:material('moonrise-aged-stone','#8e96a2'),
  wall:material('moonrise-lime-plaster','#c8b9ae'),
  dark:material('moonrise-dark-timber','#473a50'),
  roof:material('moonrise-purple-roof','#55426e'),
  copper:material('moonrise-copper','#c5a16f'),
  window:material('moonrise-lit-window','#f7cb76'),
  glass:material('moonrise-blue-glass','#8ccee4'),
  leaf:material('moonrise-cypress','#314e57'),
  trunk:material('moonrise-tree-trunk','#625063'),
  ember:material('moonrise-pumpkin','#ea9042'),
  terrain:material('moonrise-moss','#45575d'),
  stream:material('moonrise-stream','#436884')
 };
 // Each village home is a stable family of small architecture pieces,
 // never a billboard. Only the first 2 m above the runway stay empty.
 function part(type,name,dimensions,x,y,z,mat){
  const m=mesh(type,name,dimensions,[x,y,z],mat);m.metadata={...m.metadata,moonrise:true,decorative:true};
  m.isPickable=false;return m;
 }
 function house(x,z,index,scale=1){
  const shift=course.center(z,1),s=scale,front=x<shift.x?1:-1;
  const base=shift.rise-.05,ww=5.5*s,dd=4.9*s,hh=4.6*s;
  const wall=part('CreateBox','moonrise-house-wall',{width:ww,height:hh,depth:dd},x,base+hh/2,z,mats.wall);
  wall.metadata.building=index;
  part('CreateCylinder','moonrise-gabled-roof',{diameter:ww*1.24,height:dd+.55*s,tessellation:3},x,base+hh+.75*s,z,mats.roof).rotation.x=Math.PI/2;
  // Dark half-timbering and visible window depth read in perspective.
  for(const side of [-1,1]){
   part('CreateBox','moonrise-timber-post',{width:.17*s,height:hh*.94,depth:.21*s},x+side*(ww/2-.18*s),base+hh/2,z+front*(dd/2+.1*s),mats.dark);
   const wx=x+side*ww*.26,wz=z+front*(dd/2+.15*s),wy=base+hh*.64;
   part('CreateBox','moonrise-window-frame',{width:1.18*s,height:1.42*s,depth:.13*s},wx,wy,wz,mats.dark);
   part('CreateBox','moonrise-window-glow',{width:.91*s,height:1.15*s,depth:.15*s},wx,wy,wz+front*.08*s,mats.window);
   part('CreateBox','moonrise-window-cross',{width:.09*s,height:1.17*s,depth:.19*s},wx,wy,wz+front*.18*s,mats.copper);
  }
  part('CreateBox','moonrise-entry-door',{width:1.25*s,height:2.5*s,depth:.14*s},x,base+1.27*s,z+front*(dd/2+.16*s),mats.dark);
  part('CreateSphere','moonrise-door-knob',{diameter:.22*s,segments:8},x+.39*s,base+1.2*s,z+front*(dd/2+.26*s),mats.copper);
  part('CreateCylinder','moonrise-chimney',{height:2*s,diameter:.65*s,tessellation:6},x+ww*.28,base+hh+1.12*s,z-dd*.2,mats.stone);
  stats.houses++;
 }
 function tree(x,z,index){
  const h=4.7+(index%4)*.7,base=course.center(z,1).rise-.05;
  const t=part('CreateCylinder','moonrise-crooked-trunk',{height:h*.65,diameter:.43,tessellation:7},x,base+h*.32,z,mats.trunk);
  t.rotation.z=(index%2?1:-1)*.1;
  const crown=part('CreateSphere','moonrise-tree-canopy',{diameter:3.6,segments:simple?8:12},x+.32,base+h*.78,z,mats.leaf);
  crown.scaling.set(.92,1.15,.77);
  stats.trees++;
 }
 function lamp(x,z,index){
  const y=course.center(z,1).rise;
  part('CreateCylinder','moonrise-lantern-pole',{height:3.9,diameter:.12,tessellation:6},x,y+1.95,z,mats.dark);
  const glow=part('CreateSphere','moonrise-lantern-light',{diameter:.65,segments:10},x,y+3.85,z,mats.window);
  glow.metadata={...glow.metadata,lightFixture:true,index};
  part('CreateCylinder','moonrise-lantern-crown',{height:.18,diameter:.75,tessellation:6},x,y+4.23,z,mats.copper);
  stats.lanterns++;
 }
 function pumpkin(x,z,index){
  const base=course.center(z,1).rise,body=part('CreateSphere','moonrise-carved-pumpkin',{diameter:.85+(index%3)*.23,segments:simple?8:12},x,base+.49,z,mats.ember);
  body.scaling.y=.79;
  part('CreateCylinder','moonrise-pumpkin-stem',{height:.21,diameter:.15,tessellation:6},x,base+.95,z,mats.trunk);
  stats.props++;
 }
 // A visible village on BOTH sides of the flight corridor, never on top of
 // the educational rings or the approach to the next gate.
 for(let i=0;i<12;i++){
  const z=8+i*11.5,center=course.center(z,1),side=i%2?1:-1;
  house(center.x+side*(21+(i%3)*2.6),z+(i%3-1)*1.7,i,.78+(i%4)*.10);
 }
 for(let i=0;i<16;i++){
  const z=4+i*8.8,c=course.center(z,1),side=i%2?1:-1;
  tree(c.x+side*(16+(i%4)*3),z,i);
 }
 for(let i=0;i<14;i++){
  const z=5+i*9.8,c=course.center(z,1),side=i%2?1:-1;
  lamp(c.x+side*13.8,z,i);
 }
 for(let i=0;i<18;i++){
  const z=6+i*7.4,c=course.center(z,1);
  pumpkin(c.x+(i%2?1:-1)*(15.6+(i%3)*1.25),z,i);
 }
 // Low village fences communicate course boundaries without forming end
 // walls or obscuring the three answer gate plaques.
 for(let z=4;z<=140;z+=9){
  const center=course.center(z,1);
  for(const side of [-1,1]){
   const x=center.x+side*15.6,y=center.rise;
   part('CreateBox','moonrise-fence-post',{width:.22,height:1.15,depth:.22},x,y+.55,z,mats.dark);
   part('CreateBox','moonrise-fence-rail',{width:.13,height:.13,depth:8.7},x,y+.8,z+4.4,mats.dark);
  }
 }
 // Gothic bridge ornaments remain outside the 21m-wide live flight corridor.
 for(const z of [44,96]){
  const c=course.center(z,1);
  for(const side of [-1,1]){
   const x=c.x+side*17;
   part('CreateBox','moonrise-bridge-plinth',{width:2,height:2.4,depth:5},x,c.rise+.9,z,mats.stone);
   part('CreateCylinder','moonrise-bridge-finial',{diameter:1.05,height:1.65,tessellation:6},x,c.rise+2.6,z,mats.copper);
  }
 }
 // Night ambience comes from a few punctual, shadow-free lantern pools,
 // not fog, bloom or a postprocessing blur that could conceal quiz gates.
 if(B.PointLight){
  const lightCount=simple?2:4;
  for(let i=0;i<lightCount;i++){
   const z=16+i*(112/Math.max(1,lightCount-1)),c=course.center(z,1);
   const x=c.x+(i%2?1:-1)*15.7;
   const lampLight=own(new B.PointLight('moonrise-village-lantern-'+i,new B.Vector3(x,origin+c.rise+3.9,z),scene));
   lampLight.diffuse=new B.Color3(1,.66,.32);
   lampLight.intensity=simple?.38:.52;
   lampLight.range=20;
   lampLight.includeOnlyWithLayerMask=layer;
  }
 }
 // Existing, source-attributed GLBs improve a subset of near-camera props.
 // Async imports are fenced against rebuild/dispose; a failure never blocks
 // gameplay and the procedural village remains visible.
 if(assetLibrary?.place&&!simple){
  const recipes=[
   ['pumpkin-carved',-18,15,1.5,1.5],['lantern-candle',17,27,1.35,1.3],
   ['pine-crooked',-27,37,6.8,5.6],['rocks',23,54,2,3.2],
   ['pumpkin-tall-carved',-20,76,1.7,1.6],['lightpost-single',19,88,5,2.4],
   ['gravestone-decorative',-20,105,2.7,2.3],['pine-crooked',26,125,6,5.2]
  ];
  for(const [id,x,z,height,width]of recipes){
   stats.glbRequested++;
   Promise.resolve().then(()=>assetLibrary.place(scene,id,{x:x+course.center(z,1).x,y:origin+course.center(z,1).rise,z},{height,width,layer})).then(node=>{
    if(!node)return;
    if(!isCurrent()||scene.isDisposed?.()){node.dispose();return;}
    own(node);
   }).catch(()=>{/* Existing procedural scenery remains the safe fallback. */});
  }
 }
 return stats;
}
const api={decorate};root.MoonriseVillage=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
