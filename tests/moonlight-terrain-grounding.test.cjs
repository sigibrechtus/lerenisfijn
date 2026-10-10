const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js')),{createCanvas}=require('@napi-rs/canvas');
global.BABYLON=B;global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
const T=require(path.join(base,'grounding.js')),D=require(path.join(base,'destinations.js')),L=require(path.join(base,'landscape.js'));
const near=(actual,expected,message)=>assert(Math.abs(actual-expected)<1e-4,`${message}: ${actual} != ${expected}`);
function inspectSupport(mesh,height){
 const data=mesh.metadata.terrainSupport,positions=mesh.getVerticesData(B.VertexBuffer.PositionKind),matrix=mesh.computeWorldMatrix(true);let topVertices=0,bottomVertices=0;
 for(let i=0;i<positions.length;i+=3){const p=B.Vector3.TransformCoordinates(new B.Vector3(positions[i],positions[i+1],positions[i+2]),matrix);if(Math.abs(p.y-data.top)<1e-4)topVertices++;else{near(p.y,height(p.x,p.z)-data.embed,'foundation reaches terrain');bottomVertices++;}}
 assert(topVertices>data.perimeter.length&&bottomVertices>data.perimeter.length,'continuous top and perimeter skirt');
 for(const p of data.samples)assert(data.top+1e-5>=height(p.x,p.z),'terrain cannot penetrate the supported footprint');
}
test('footprint contact samples the interior, edges, rotation and scale',()=>{
 const shape={width:6,depth:4,x:1,z:-2},pose={x:40,z:90,yaw:Math.PI/2,scaleX:2,scaleZ:.5},h=(x,z)=>3-.05*((x-39)**2+(z-88)**2),c=T.contact(h,pose,shape,.5);
 assert(c.probes.length>50&&c.perimeter.length>=40);assert(c.max>Math.max(...c.perimeter.map(p=>p.height)),'an interior high spot counts');
 near(c.center.x,39,'rotated footprint center x');near(c.center.z,88,'rotated footprint center z');
 near(c.max,3,'interior summit contact');assert.throws(()=>T.contact(()=>NaN,pose,shape),/height/);assert.throws(()=>T.footprint(shape,0),/positive/);
});
test('a level building and all roof children move together above a real sloping footprint',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),height=L.makeHeight(),node=new B.TransformNode('slope-cottage',scene);node.position.set(-50,0,70);node.rotation.y=.53;node.scaling.set(.8,1.1,1.3);
 const wall=B.MeshBuilder.CreateBox('walls',{width:5,height:4,depth:4},scene);wall.parent=node;wall.position.y=2;
 const roof=B.MeshBuilder.CreateBox('roof',{width:6,height:.3,depth:5},scene);roof.parent=node;roof.position.y=4.1;roof.rotation.z=.4;
 const localRoof=roof.position.asArray(),out=T.supportGroup(B,scene,height,node,{width:5.6,depth:4.8},{embed:.2});
 assert(out.contact.max-out.contact.min>1,'uses hills and valleys rather than a flat test plane');assert.deepEqual(roof.position.asArray(),localRoof);
 near(wall.computeWorldMatrix(true)&&wall.getBoundingInfo().boundingBox.minimumWorld.y,out.level,'building floor meets foundation top');near(node.position.y,out.level,'whole building root raised to footprint maximum');
 inspectSupport(out.mesh,height);
 const dense=T.contact(height,{x:node.position.x,z:node.position.z,yaw:node.rotation.y,scaleX:node.scaling.x,scaleZ:node.scaling.z},{width:5.6,depth:4.8},.15);assert(out.level+.02>=dense.max,'dense independent footprint stays supported');
 node.dispose();assert.equal(scene.meshes.length,0);scene.dispose();engine.dispose();
});
test('small rooted props settle their complete foot into real hillside terrain',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),height=L.makeHeight();
 for(const [x,z]of [[80,30],[-80,-35],[100,120]]){
  const node=new B.TransformNode('rooted-prop',scene);node.position.set(x,0,z);node.rotation.y=.4;
  const foot=B.MeshBuilder.CreateBox('foot',{width:.6,height:.8,depth:.6},scene);foot.parent=node;foot.position.y=.4;
  const sampled=T.groundFoot(node,height,{width:.6,depth:.6},{embed:.04,spacing:.15});near(foot.computeWorldMatrix(true)&&foot.getBoundingInfo().boundingBox.minimumWorld.y,sampled.min-.04,'prop foot rests in soil');
  for(const p of sampled.samples)assert(node.position.y<height(p.x,p.z),'every sampled foot edge reaches soil');node.dispose();
 }
 assert.equal(scene.meshes.length,0);scene.dispose();engine.dispose();
});
test('all six real destination courtyards have continuous terrain contact and supported displays',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),height=L.makeHeight(),scenery=D.create({scene,terrainHeight:height});
 for(const [id,s]of Object.entries(D.sites)){
  const node=scene.getTransformNodeByName('destination-'+id),foundation=scene.getMeshByName('destination-foundation-'+id);assert(node&&foundation);inspectSupport(foundation,height);near(node.position.y,height(s.x,s.z),'flat reserved court remains reachable');
 }
 const kartWheels=scene.meshes.filter(m=>m.name==='destination-kart-wheel'),rally=scene.getTransformNodeByName('destination-rally');for(const wheel of kartWheels){wheel.computeWorldMatrix(true);near(wheel.getBoundingInfo().boundingBox.minimumWorld.y,rally.position.y+.07,'kart wheels meet courtyard');}
 const cauldron=scene.getMeshByName('destination-cauldron'),cauldronFoot=scene.getMeshByName('destination-cauldron-foot');near(cauldron.computeWorldMatrix(true)&&cauldron.getBoundingInfo().boundingBox.minimumWorld.y,cauldronFoot.computeWorldMatrix(true)&&cauldronFoot.getBoundingInfo().boundingBox.maximumWorld.y,'cauldron rests on plinth');
 const sleeper=scene.getMeshByName('destination-display-sleeper'),rail=scene.getMeshByName('destination-display-rail');near(sleeper.computeWorldMatrix(true)&&sleeper.getBoundingInfo().boundingBox.maximumWorld.y,rail.computeWorldMatrix(true)&&rail.getBoundingInfo().boundingBox.minimumWorld.y,'display rails rest on sleepers');
 const spirit=scene.getTransformNodeByName('destination-garden-spirit'),eye=spirit.getChildMeshes().find(m=>m.name==='destination-ghost-eye'),before=eye.computeWorldMatrix(true)&&eye.getAbsolutePosition().y;scenery.tick(.25,false);near(eye.computeWorldMatrix(true)&&eye.getAbsolutePosition().y-before,spirit.position.y-3.2,'airborne spirit eyes follow their parent');
 const counts=[scene.meshes.length,scene.materials.length,scene.textures.length];for(let i=0;i<120;i++)scenery.tick(1/60,false);assert.deepEqual([scene.meshes.length,scene.materials.length,scene.textures.length],counts);scenery.dispose();assert.equal(scene.meshes.length,0);assert.equal(scene.transformNodes.length,0);assert.equal(scene.materials.length,0);assert.equal(scene.textures.length,0);scene.dispose();engine.dispose();
});
test('destination foundations also close their downhill perimeter when courtyards are sloped',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),height=(x,z)=>x*.06-z*.04+.1*Math.sin(x*.1),scenery=D.create({scene,terrainHeight:height});
 for(const id of Object.keys(D.sites)){const foundation=scene.getMeshByName('destination-foundation-'+id),data=foundation.metadata.terrainSupport;assert(data.top-Math.min(...data.samples.map(p=>p.height))>1.5);inspectSupport(foundation,height);}
 scenery.dispose();assert.equal(scene.meshes.length,0);scene.dispose();engine.dispose();
});
test('the complete native world grounds scenery before freezing and keeps architectural attachments joined',()=>{
 const fs=require('node:fs'),vm=require('node:vm');global.window=global;global.matchMedia=()=>({matches:false});global.devicePixelRatio=1;global.addEventListener=()=>{};global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};
 for(const file of ['engine.js','camera.js','controls.js','graphics.js','railway.js','atmosphere.js','puzzle-actions.js','campaign.js'])require(path.join(base,file));
 const source=fs.readFileSync(path.join(base,'world.js'),'utf8').replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'').replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:1280,renderHeight:720})").replaceAll('camera.attachControl(canvas,true);','').replace('engine.runRenderLoop(()=>{','engine.runRenderLoop=fn=>{global.__terrainFrame=fn;};engine.runRenderLoop(()=>{');
 assert(source.includes('new B.NullEngine'),'native engine replacement applied');vm.runInThisContext(source,{filename:'native-terrain-world.js'});
 const feet=new Map(),foundations=[],groundFoot=T.groundFoot,supportGroup=T.supportGroup;
 T.groundFoot=(node,height,shape,options={})=>{const result=groundFoot(node,height,shape,options);feet.set(node,{height,shape,options,placedY:node.position.y});return result;};
 T.supportGroup=(...args)=>{const result=supportGroup(...args);foundations.push({height:args[2],node:args[3],mesh:result.mesh});return result;};
 let world;
 try{
  world=MoonWorld.create({addEventListener(){},removeEventListener(){}},{prefs:()=>({motion:true}),lang:()=> 'nl',time:String,blocked:()=>false,solved:()=>false,goal:()=> 'bridge',interact(){},near(){},change(){},select(){},objects(){},effect(){},ride(){},position(){}});
  const scene=world.scene,height=world.terrainHeight,meshes=name=>scene.meshes.filter(m=>m.name===name),bounds=m=>{m.computeWorldMatrix(true);return m.getBoundingInfo().boundingBox;};
  assert.equal(foundations.length,8,'five cottages and three districts');for(const f of foundations){assert.equal(f.height,height,'foundation uses complete world terrain');inspectSupport(f.mesh,height);}
  for(const body of meshes('cottage')){assert.equal(body.parent.metadata.terrainContact.mode,'foundation');near(bounds(body).minimumWorld.y,body.parent.metadata.terrainContact.level,'cottage floor rests on foundation');assert.equal(body.parent.getChildMeshes().filter(m=>m.name==='roof').length,2,'both roof sides share cottage root');assert(body.parent.getChildMeshes().some(m=>m.name==='chimney-cap'),'chimney remains attached');}
  for(const [name,area]of [['greenhouse','garden'],['tower','clock'],['castle','lights']]){const body=meshes(name)[0];assert.equal(body.parent.name,'district-'+area);near(bounds(body).minimumWorld.y,body.parent.metadata.terrainContact.level,name+' floor rests on foundation');}
  for(const bed of meshes('garden-bed'))near(bounds(bed).minimumWorld.y,bed.parent.metadata.terrainContact.level,'garden bed rests on district foundation');
  const railBottom=Math.min(...meshes('curved-rail-0').concat(meshes('curved-rail-1')).map(m=>bounds(m).minimumWorld.y));for(const tie of meshes('rail-tie')){assert(bounds(tie).minimumWorld.y<=height(tie.position.x,tie.position.z)+1e-5,'rail sleeper reaches terrain');assert(bounds(tie).maximumWorld.y>=railBottom,'rails rest on sleepers');}
  const kinds={tree:0,mushroom:0,pumpkin:0,grass:0,boulder:0,post:0};
  for(const [node,record]of feet){
   assert.equal(record.height,height,'feet sample complete world terrain');near(node.position.y,record.placedY,'contact precedes final transform');const c=node.metadata.terrainContact;near(node.computeWorldMatrix(true)&&node.getAbsolutePosition().y+c.bottom*node.scaling.y,c.min-c.embed,'placed world foot reaches sampled terrain');
   const sampled=T.contact(height,{x:node.position.x,z:node.position.z,yaw:node.rotation.y,scaleX:node.scaling.x,scaleZ:node.scaling.z},record.shape,record.options.spacing);for(const p of sampled.samples)assert(c.level<=height(p.x,p.z)+1e-5,'full sampled foot is supported');
   if(node.name.startsWith('tree-ground-')){kinds.tree++;const trunk=node.getChildMeshes().find(m=>m.name==='tree');assert(bounds(trunk).minimumWorld.y<=c.min,'tree trunk enters soil');assert.equal(node.getChildMeshes().filter(m=>m.name==='autumn-crown').length,3,'tree crowns follow rooted trunk');}
   else if(node.name.startsWith('mushroom-ground-')){kinds.mushroom++;near(bounds(node.getChildMeshes().find(m=>m.name==='mushroom')).minimumWorld.y,c.min-c.embed,'mushroom stalk enters soil');assert(node.getChildMeshes().some(m=>m.name==='mushroom-cap'));}
   else if(node.name==='pumpkin'){kinds.pumpkin++;near(bounds(node.getChildMeshes().find(m=>m.name==='pumpkin')).minimumWorld.y,c.min-c.embed,'pumpkin body enters soil');}
   else if(node.name==='meadow-grass'){kinds.grass++;near(bounds(node).minimumWorld.y,c.min-c.embed,'grass root enters soil before wind motion');}
   else if(node.name==='weathered-boulder'){kinds.boulder++;assert(node.isWorldMatrixFrozen,'boulder freezes after terrain contact');near(bounds(node).minimumWorld.y,c.min-c.embed,'boulder enters soil after freezing');}
   else if(node.name.startsWith('site-post-')){kinds.post++;const children=node.getChildMeshes(),post=children.find(m=>m.name==='lantern-post'),frame=children.find(m=>m.name==='lantern-frame'),mount=children.find(m=>m.name==='site-sign-mount'),sign=children.find(m=>m.name==='label');near(bounds(post).minimumWorld.y,c.min-c.embed,'site post enters soil');near(bounds(mount).minimumWorld.y,bounds(frame).maximumWorld.y,'sign mount joins lantern frame');assert(bounds(sign).minimumWorld.y<=bounds(mount).maximumWorld.y,'sign panel touches its mount');}
  }
  for(const [kind,count]of Object.entries(kinds))assert(count>0,'real world '+kind+' inspected');assert.equal(kinds.pumpkin,30);assert.equal(kinds.post,5);
  const ivy=meshes('castle-ivy')[0];assert.equal(ivy.parent.name,'district-lights','ivy follows the castle foundation');assert(bounds(ivy).minimumWorld.y>=ivy.parent.position.y,'ivy is attached above the castle base');
  world.updateWorld(new Set(Object.keys(L.sites)),Object.fromEntries(Object.keys(L.sites).map(id=>[id,'Updated '+id])));for(const node of feet.keys())if(node.name.startsWith('site-post-')){const sign=node.getChildMeshes().find(m=>m.name==='label'),mount=node.getChildMeshes().find(m=>m.name==='site-sign-mount');assert.equal(sign.parent,node,'rebuilt sign retains grounded post parent');near(sign.getAbsolutePosition().y-node.getAbsolutePosition().y,4.5,'rebuilt sign retains local height');assert(bounds(sign).minimumWorld.y<=bounds(mount).maximumWorld.y,'rebuilt sign stays mounted');}
  const posts=meshes('festival-garland-post');assert.equal(posts.length,2);for(const p of posts){near(bounds(p).minimumWorld.y,height(p.position.x,p.position.z),'garland post reaches soil');near(bounds(p).maximumWorld.y,5.5,'garland joins post top');}
  assert.equal(meshes('garland-hanger').length,9);for(const hanger of meshes('garland-hanger')){const lantern=meshes('garland-lantern').find(m=>m.position.x===hanger.position.x);near(bounds(lantern).maximumWorld.y,bounds(hanger).minimumWorld.y,'garland lantern joins its hanger');const top=bounds(hanger).maximumWorld.y,hit=meshes('festival-garland')[0].intersects(new B.Ray(new B.Vector3(hanger.position.x,top-.15,hanger.position.z),B.Vector3.Up(),.2),false);assert(hit.hit&&hit.pickedPoint.y<=top+1e-4,'hanger enters the actual curved cable surface');}
  for(const bell of meshes('station-call-bell')){const children=bell.parent.getChildMeshes(),mount=children.find(m=>m.name==='station-bell-mount'),platform=children.find(m=>m.name==='station-platform');near(bounds(bell).minimumWorld.y,bounds(mount).maximumWorld.y,'station bell is mounted');near(bounds(mount).minimumWorld.y,bounds(platform).maximumWorld.y,'bell mount rests on platform');const first=children.filter(m=>m.name==='boarding-step').sort((a,b)=>a.position.y-b.position.y)[0];near(bounds(first).minimumWorld.y,0,'boarding steps begin on ground');}
  const joists=meshes('bridge-joist'),abutments=meshes('bridge-abutment');assert.equal(joists.length,2);assert.equal(abutments.length,2);for(const plank of meshes('bridge-plank')){assert(joists.every(j=>bounds(j).maximumWorld.y>=bounds(plank).minimumWorld.y),'bridge deck joins spanning joists');}for(const a of abutments){assert(joists.every(j=>bounds(a).maximumWorld.y>=bounds(j).minimumWorld.y),'bridge joists join end abutments');assert(bounds(a).minimumWorld.y<=height(a.position.x,a.position.z),'bridge abutment reaches bank terrain');}
  console.log('Complete native terrain inspection:',JSON.stringify({foundations:foundations.length,...kinds,garlandHangers:9,stationBells:meshes('station-call-bell').length,bridgeJoists:2}));
 }finally{T.groundFoot=groundFoot;T.supportGroup=supportGroup;world?.stop();delete global.__terrainFrame;}
});
