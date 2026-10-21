/* Broom Flight finale scenery. Non-interactive, budgeted and fully scene-owned.
 * Artwork is original SVG mapped onto distant sky/horizon meshes; no CDN.
 * Physics, gates and scoring stay authoritative in broom-course.js.
 */
(function(root){'use strict';
function decorate({B,scene,course,mesh,material,own,layer,origin=120,quality='balanced',reducedMotion=false}={}){
 if(!B||!scene||!course||!mesh||!material||!own)throw Error('Broom atmosphere requires tracked scene factories');
 const mobile=quality==='low',rich=quality==='high';
 const stats={skyImages:0,horizonImages:0,trees:0,lanterns:0,landmarks:0,ghosts:0,windStreaks:0,sparks:0};
 const decorations=[],sparks=[],wind=[],animated=[];
 const colors={
  bark:material('broom-twisted-bark','#50445b'),
  needles:material('broom-shadow-leaves','#293f49'),
  rock:material('broom-ancient-stone','#6b7080'),
  copper:material('broom-lantern-copper','#b99069'),
  pumpkin:material('broom-ember-pumpkin','#eaa052'),
  glow:material('broom-magic-glow','#e8a1fd'),
  blue:material('broom-ghost-glow','#91e7f3'),
  moss:material('broom-moss','#465f56')
 };
 for(const key of ['glow','blue','pumpkin']){const m=colors[key];m.emissiveColor=m.diffuseColor.scale(key==='pumpkin'?.9:1.15);}
 colors.glow.disableLighting=true;colors.blue.disableLighting=true;
 function part(kind,name,options,x,y,z,mat){
  const m=mesh(kind,name,options,[x,y,z],mat);
  m.isPickable=false;m.metadata={...m.metadata,broomAtmosphere:true,decorative:true};
  decorations.push(m);return m;
 }
 const end=course.LENGTH+course.OUTRUN,portalZ=end-7;
 // Keep the sky inside the isolated flight camera's 220-unit far plane.
 const SKY_DIAMETER=300;
 let sky=null;
 function imageMaterial(name,url,alpha=false){
  const m=own(new B.StandardMaterial('mini-broom-backdrop-'+name,scene));
  m.disableLighting=true;m.backFaceCulling=false;m.fogEnabled=false;m.disableDepthWrite=true;
  m.emissiveColor=new B.Color3(1,1,1);m.diffuseColor=new B.Color3(0,0,0);
  const t=own(new B.Texture(url,scene,false,false,B.Texture.BILINEAR_SAMPLINGMODE));
  t.hasAlpha=alpha;m.emissiveTexture=t;m.diffuseTexture=t;
  if(alpha){m.useAlphaFromDiffuseTexture=true;m.transparencyMode=B.Material.MATERIAL_ALPHABLEND;}
  return m;
 }
 // NullEngine cannot decode browser images. Geometry still receives full lifecycle testing.
 const imageCapable=!(B.NullEngine&&scene.getEngine() instanceof B.NullEngine);
 if(imageCapable){
  const skyMat=imageMaterial('moonlit','assets/broom/sky-moonlit.svg');
  sky=own(B.MeshBuilder.CreateSphere('mini-broom-moonlit-sky',{diameter:SKY_DIAMETER,segments:16,sideOrientation:B.Mesh.BACKSIDE},scene));
  sky.position.set(0,origin+3,0);sky.layerMask=layer;
  sky.isPickable=false;sky.material=skyMat;stats.skyImages++;
  const horizon=[['forest','assets/broom/forest-horizon.svg'],['castle','assets/broom/castle-horizon.svg']];
  for(const [i,item] of horizon.entries()){
   const mat=imageMaterial(item[0],item[1],true);
   const depth=i?end+42:course.LENGTH+12;
   for(const side of [-1,1]){
    const x=(side<0?-1:1)*(i?56:61);
    const panel=part('CreatePlane','broom-horizon-panel',{width:i?96:110,height:i?26:20},x,i?14:10,depth,mat);
    panel.billboardMode=B.Mesh.BILLBOARDMODE_Y;
    stats.horizonImages++;
   }
  }
 }
 function tree(x,z,i){
  const y=course.center(z,1).rise,h=4.8+(i%4)*.9;
  const trunk=part('CreateCylinder','broom-crooked-trunk',{diameter:.38,height:h*.75,tessellation:5},x,y+h*.36,z,colors.bark);
  trunk.rotation.z=(i%2?1:-1)*.12;
  const crown=part('CreateSphere','broom-crooked-crown',{diameter:3.4,segments:mobile?6:10},x+.4,y+h*.8,z,colors.needles);
  crown.scaling.set(.9,1.25,.75);stats.trees++;
 }
 function lantern(x,z,i){
  const y=course.center(z,1).rise;
  part('CreateCylinder','broom-lantern-stem',{diameter:.11,height:3.2,tessellation:6},x,y+1.6,z,colors.bark);
  const lamp=part('CreateSphere','broom-lantern-orb',{diameter:.52,segments:mobile?6:10},x,y+3.3,z,colors.pumpkin);
  animated.push({mesh:lamp,y:lamp.position.y,offset:i*1.7,type:'light'});
  part('CreateCylinder','broom-lantern-cap',{diameter:.65,height:.22,tessellation:6},x,y+3.7,z,colors.copper);
  stats.lanterns++;
 }
 function pumpkin(x,z,i){
  const y=course.center(z,1).rise;
  const body=part('CreateSphere','broom-pumpkin',{diameter:1+(i%3)*.2,segments:mobile?8:12},x,y+.5,z,colors.pumpkin);
  body.scaling.y=.75;
  part('CreateCylinder','broom-pumpkin-stalk',{diameter:.14,height:.3,tessellation:5},x,y+1,z,colors.moss);
 }
 // Outrun clusters begin beyond the last question-gate collision corridor.
 const clusters=mobile?5:rich?11:8;
 for(let i=0;i<clusters;i++){
  const z=course.LENGTH+5+(i+.25)*(course.OUTRUN-16)/clusters,c=course.center(z,1);
  for(const side of [-1,1]){
   const x=c.x+side*(18+(i%3)*3);
   tree(x,z+(i%2?2:-2),i);
   if(i%2===0)lantern(c.x+side*13.8,z+1,i*2+(side>0?1:0));
   if(i%3===0)pumpkin(c.x+side*15,z+3,i);
  }
 }
 // Low-cost animated spirits hover beyond the last educational gates.
 for(let i=0;i<(mobile?2:4);i++){
  const z=course.LENGTH+18+i*14,c=course.center(z,1),side=i%2?1:-1,x=c.x+side*19,y=c.rise+4.2;
  const ghost=part('CreateSphere','broom-floating-ghost',{diameter:1.35,segments:mobile?8:12},x,y,z,colors.blue);
  ghost.scaling.set(.75,1.3,.6);animated.push({mesh:ghost,y:ghost.position.y,offset:i*1.8,type:'ghost'});
  for(const eye of [-.22,.22])part('CreateSphere','broom-ghost-eye',{diameter:.12,segments:6},x+eye,y+.14,z-.48,colors.bark);
  stats.ghosts++;
 }
 // Reuse a tiny geometry pool for parallax streaks; keep it away from gate labels.
 for(let i=0;i<(mobile?5:rich?13:9);i++){
  const streak=part('CreateBox','broom-wind-streak',{width:.045,height:.035,depth:1.9},0,4,course.LENGTH+10,colors.blue);
  streak.setEnabled(false);wind.push(streak);
 }
 stats.windStreaks=wind.length;
 // A ruined Gothic watchtower identifies the finish from a distance.
 const towerX=course.center(portalZ-15,1).x+26,towerZ=portalZ-15;
 const towerBase=course.center(towerZ,1).rise;
 part('CreateCylinder','broom-ruined-tower',{diameter:4.8,height:11,tessellation:8},towerX,towerBase+5.5,towerZ,colors.rock);
 part('CreateCylinder','broom-tower-roof',{diameterTop:0,diameterBottom:6.4,height:5,tessellation:8},towerX,towerBase+13,towerZ,colors.bark);
 for(const side of [-1,1])part('CreateBox','broom-lit-window',{width:.5,height:1.3,depth:.16},towerX+side*1.1,towerBase+8,towerZ-2.4,colors.pumpkin);
 stats.landmarks++;
 const center=course.center(portalZ,1),cx=center.x,cy=5.7+center.rise;
 const rim=part('CreateTorus','broom-finish-portal',{diameter:10,thickness:.55,tessellation:rich?64:32},cx,cy,portalZ,colors.glow);
 rim.rotation.x=Math.PI/2;rim.rotation.y=center.heading;
 const inner=part('CreateTorus','broom-finish-aura',{diameter:9.1,thickness:.12,tessellation:rich?48:24},cx,cy,portalZ+.08,colors.blue);
 inner.rotation.x=Math.PI/2;inner.rotation.y=center.heading;
 for(let i=0;i<8;i++){
  const angle=i*Math.PI/4;
  const rune=part('CreateSphere','broom-portal-rune',{diameter:.3,segments:6},cx+5*Math.cos(angle),cy+5*Math.sin(angle),portalZ+.15,colors.pumpkin);
  animated.push({mesh:rune,y:rune.position.y,offset:i*.65,type:'rune'});
 }
 stats.landmarks++;
 for(let i=0;i<(mobile?8:rich?26:16);i++){
  const spark=part('CreateSphere','broom-magic-spark',{diameter:mobile?.14:.2,segments:4},cx,cy,portalZ, i%2?colors.blue:colors.glow);
  spark.setEnabled(false);sparks.push(spark);
 }
 stats.sparks=sparks.length;
 let clock=0,celebration=0;
 function update(dt,viewer,speed=0){
  if(!Number.isFinite(dt)||dt<=0)return;
  clock+=Math.min(.1,dt);if(celebration>0)celebration=Math.max(0,celebration-dt);
  // Camera-facing infinite background: follow the flyer without pushing it beyond farZ.
  if(sky&&viewer)sky.position.copyFrom(viewer);
  if(reducedMotion)return;
  const windActive=!!viewer&&viewer.z>=course.LENGTH&&viewer.z<end&&speed>5;
  for(let i=0;i<wind.length;i++){
   const w=wind[i];w.setEnabled(windActive);
   if(windActive){const side=i%2?-1:1;w.position.set(viewer.x+side*(2.7+(i%4)*1.1),viewer.y+.7+(i%3)*.65,viewer.z+5+(i*2.2+clock*speed*1.5)%18);}
  }
  for(const item of animated){
   const wave=Math.sin(clock*1.7+item.offset);
   item.mesh.position.y=item.y+(item.type==='ghost'?.32:item.type==='light'?.1:.08)*wave;
   if(item.type==='rune')item.mesh.scaling.setAll(1+.22*wave);
  }
  const near=viewer&&Math.abs(viewer.z-portalZ)<105;
  for(let i=0;i<sparks.length;i++){
   const m=sparks[i];m.setEnabled(!!near||celebration>0);
   if(!m.isEnabled())continue;
   const t=clock*(celebration>0?3.5:1.0)+i*2.4,angle=i*2.399+t*.33,rad=2.2+(i%5)*.76;
   m.position.set(cx+Math.cos(angle)*rad,origin+cy+Math.sin(t)*2+(i%4)*.8,portalZ+Math.cos(t*.5+i)*2);
   m.scaling.setAll(celebration>0?1.9:.8+.3*Math.sin(t));
  }
  rim.scaling.setAll(1+.012*Math.sin(clock*2.8));
  inner.scaling.setAll(1+.045*Math.sin(clock*1.8));
 }
 function celebrate(){celebration=1.5;for(const p of sparks)p.setEnabled(!reducedMotion);}
 return{update,celebrate,stats,portalZ};
}
const api={decorate};root.MoonBroomAtmosphere=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
