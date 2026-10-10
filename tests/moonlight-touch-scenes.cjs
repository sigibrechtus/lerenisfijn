/* Real world/gesture integration using Babylon NullEngine, not a GPU or device test. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js'));
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
global.window=global;global.matchMedia=()=>({matches:true});global.devicePixelRatio=3;
global.addEventListener=()=>{};global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};global.BABYLON=B;
for(const name of ['engine','camera','campaign','controls','graphics','landscape','railway','atmosphere','puzzle-actions'])require(path.join(base,name+'.js'));
const source=fs.readFileSync(path.join(base,'world.js'),'utf8').replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'').replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:390,renderHeight:844})").replaceAll('camera.attachControl(canvas,true);','').replace('engine.runRenderLoop(()=>{','engine.runRenderLoop=fn=>{global.frame=fn;};engine.runRenderLoop(()=>{');vm.runInThisContext(source);
class Target{
 constructor(width=390,height=844){this.clientWidth=width;this.clientHeight=height;this.events={};this.captured=new Set();this.style={};this.classList={add(){},remove(){}};}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn);}removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(v=>v!==fn);}
 setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
 getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
 emit(type,id,x,y,stamp=0){let stopped=false;const e={pointerType:'touch',button:0,pointerId:id,clientX:x,clientY:y,timeStamp:stamp,preventDefault(){},stopImmediatePropagation(){stopped=true;}};for(const fn of this.events[type]||[]){fn(e);if(stopped)break;}}
}
let blocked=false;const canvas=new Target(),joystick=new Target(128,128),knob=new Target(),api={joystick,knob,prefs:()=>({motion:true}),lang:()=> 'nl',time:String,blocked:()=>blocked,solved:()=>false,goal:()=> 'bridge',interact(){},near(){},change(){},select(){},objects(){},effect(){},ride(){},position(){}};
const world=MoonWorld.create(canvas,api);world.engine.getDeltaTime=()=>1000/60;world.start();
assert.equal(world.engine._hardwareScalingLevel,2/3,'a high-density touch screen starts sharp, with glow');
const origin=world.hero.position.clone();world.setStick(.5,0);for(let i=0;i<60;i++)global.frame();assert(Math.abs(B.Vector3.Distance(origin,world.hero.position)-2.5)<.001,'half joystick input walks at half speed');world.resetInput();
const alpha=world.camera.alpha,beta=world.camera.beta,position=world.hero.position.clone();canvas.emit('pointerdown',1,200,200);canvas.emit('pointermove',1,240,220);canvas.emit('pointerup',1,240,220);global.frame();assert.notEqual(world.camera.alpha,alpha);assert.notEqual(world.camera.beta,beta);assert(B.Vector3.Distance(position,world.hero.position)<.001,'camera drag never walks');
const radius=world.camera.radius;canvas.emit('pointerdown',1,100,200);canvas.emit('pointerdown',2,200,200);canvas.emit('pointermove',2,250,200);canvas.emit('pointerup',2,250,200);canvas.emit('pointerup',1,100,200);assert(world.camera.radius<radius,'spreading fingers zooms in');
canvas.emit('pointerdown',1,100,200);canvas.emit('pointerdown',2,110,200);for(let i=0;i<20;i++)canvas.emit('pointermove',2,110+i*80,200);assert.equal(world.camera.radius,6,'pinch respects closest distance');canvas.emit('pointerup',2,1700,200);canvas.emit('pointerup',1,100,200);
const beforePuzzle={alpha:world.camera.alpha,beta:world.camera.beta,radius:world.camera.radius},q=MoonCampaign.make(0,1,'nl');world.enter(q,MoonCampaign.initial(q));const framedRadius=world.camera.radius;canvas.emit('pointerdown',1,100,100);canvas.emit('pointermove',1,150,150);canvas.emit('pointerup',1,150,150);assert.equal(world.camera.radius,framedRadius,'exploration gestures cannot change exercise framing');world.leave();assert(Math.abs(world.camera.alpha-beforePuzzle.alpha)<.001);assert(Math.abs(world.camera.radius-beforePuzzle.radius)<.001);
joystick.emit('pointerdown',1,64,30);global.frame();world.resetInput();const released=world.hero.position.clone();global.frame();assert(B.Vector3.Distance(released,world.hero.position)<.001,'opening a dialog cancels movement');
// The exercise camera looks from -Z: +Z is screen top and +X is screen right.
world.enter({type:'time',area:'clock',kind:'schedule',duration:15,start:180},180);
function clockNumber(n){return world.scene.meshes.find(m=>m.parent?.name==='puzzle'&&m.material?.diffuseTexture?.name==='tile-'+n);}
world.camera.getViewMatrix(true);
const transform=world.camera.getViewMatrix().multiply(world.camera.getProjectionMatrix(true)),viewport=world.camera.viewport.toGlobal(390,844);
function screen(m){m.computeWorldMatrix(true);return B.Vector3.Project(m.getAbsolutePosition(),B.Matrix.Identity(),transform,viewport);}
const top=screen(clockNumber(12)),right=screen(clockNumber(3)),bottom=screen(clockNumber(6)),left=screen(clockNumber(9));
assert(top.y<right.y&&top.y<left.y&&bottom.y>right.y&&bottom.y>left.y,'12 at top, 6 at bottom');
assert(right.x>top.x&&right.x>bottom.x&&left.x<top.x&&left.x<bottom.x,'3 on right, 9 on left');
const hands=world.scene.meshes.filter(m=>m.name==='clock-hand');
assert(hands[0].position.x>0&&Math.abs(hands[0].position.z)<1e-6,'hour hand points to 3 at 03:00');
assert(hands[1].position.z>0&&Math.abs(hands[1].position.x)<1e-6,'minute hand points to 12 at 03:00');
const originalPick=world.scene.pick;let pickedAnswer;api.change=a=>{pickedAnswer=a;};
for(let n=1;n<=12;n++){
 const number=clockNumber(n),point=number.getAbsolutePosition().clone(),dial=world.scene.getMeshByName('clock-face');
 world.scene.pick=()=>({hit:true,pickedMesh:dial,pickedPoint:point});
 world.scene.onPointerObservable.notifyObservers({type:B.PointerEventTypes.POINTERDOWN,event:{button:0,pointerType:'touch',clientX:100,clientY:100}});
 assert.equal(pickedAnswer,180+(n%12)*5,'selecting clock number '+n+' selects its minutes');
}
world.scene.pick=originalPick;world.leave();
// Verify ray reflection against the actual normals of the drawn opaque mirror faces.
const basicOptics=MoonCampaign.make(11,2),basicSolution=basicOptics.mirrors.map(m=>m.solution);
world.enter(basicOptics,basicSolution);
for(const hit of MoonEngine.trace(basicOptics,basicSolution).hits){
 const face=world.scene.meshes.find(m=>m.name==='mirror'&&m.metadata?.opticIndex===hit.index);face.computeWorldMatrix(true);
 const normal=B.Vector3.TransformNormal(B.Vector3.Forward(),face.getWorldMatrix()).normalize(),incoming=new B.Vector3(hit.incoming.x,0,hit.incoming.y),out=hit.outgoing[0],outgoing=new B.Vector3(out.x,0,out.y);
 const reflected=incoming.subtract(normal.scale(2*B.Vector3.Dot(incoming,normal)));
 assert(B.Vector3.Distance(reflected,outgoing)<1e-6,'rendered mirror normal agrees with reflection law');
 assert(B.Vector3.Dot(incoming.negate(),normal)*B.Vector3.Dot(outgoing,normal)>0,'reflection remains on incoming side of the drawn surface');assert.equal(face.material.alpha,1,'ordinary mirror is opaque');
 assert(face.getChildMeshes().every(m=>m.layerMask===face.layerMask),'reflector frames remain visible in puzzle layer');
}
world.leave();
const advancedOptics=MoonCampaign.make(22,3);let opticalAnswer,stockBlocked=0;api.change=a=>{opticalAnswer=a;};api.opticBlocked=()=>stockBlocked++;
world.enter(advancedOptics,MoonCampaign.initial(advancedOptics));world.select(1);world.objectsUse();assert.equal(opticalAnswer[0].type,'splitter');world.objectsMove(1);world.objectsUse();assert.equal(stockBlocked,1,'cannot create a second prism');
world.select(0);world.objectsUse();assert.equal(opticalAnswer[1].type,'mirror');world.select(2);world.objectsMove(-1);world.objectsUse();assert.equal(MoonEngine.remaining(advancedOptics,opticalAnswer).splitter,1,'returning a part refills the stock');
const advancedSolution=advancedOptics.mirrors.map(m=>m.solution);world.change(advancedSolution);
assert.equal(world.scene.meshes.filter(m=>m.name==='target-light'&&m.parent?.name==='puzzle'&&m.material.name==='warm-light').length,2,'both lanterns light on a correct solution');assert(world.scene.getMeshByName('beam-splitting-prism').material.alpha<1);
const beamSegments=world.scene.meshes.filter(m=>m.name==='light-beam'&&m.parent?.name==='puzzle').map(m=>m.metadata.segment);assert(beamSegments.some(s=>s.intensity===.5));assert(world.scene.getMeshByName('beam-direction'));
world.camera.getViewMatrix(true);const opticTransform=world.camera.getViewMatrix().multiply(world.camera.getProjectionMatrix(true)),opticViewport=world.camera.viewport.toGlobal(390,844);
for(const mesh of world.scene.getTransformNodeByName('puzzle').getChildMeshes()){mesh.computeWorldMatrix(true);for(const corner of mesh.getBoundingInfo().boundingBox.vectorsWorld){const p=B.Vector3.Project(corner,B.Matrix.Identity(),opticTransform,opticViewport);assert(p.x>=0&&p.x<=390&&p.y>=0&&p.y<=844&&p.z>0&&p.z<1,'advanced optics and tray remain fully framed');}}
world.leave();
// Curved route integration: calls, boarding, parented passengers, arrival, return and restoration.
const R=MoonRailway,train=world.scene.getTransformNodeByName('moon-express'),lumi=world.scene.getTransformNodeByName('Lumi');
world.engine.getDeltaTime=()=>1000/30;
function stepUntilParked(){for(let i=0;i<2500&&world.railState().active;i++)global.frame();assert(!world.railState().active);}
function atStation(i,park=i){const p=R.platform(i);world.start(p,park);global.frame();return p;}
world.start({x:0,z:-3},0);assert.equal(world.ride(),false,'cannot board from across the village');
for(let station=0;station<6;station++){
 const source=(station+3)%6,p=atStation(station,source),position=world.hero.position.clone();assert(world.callTrain());assert.equal(world.callTrain(),false);assert.equal(world.ride(),false);for(let i=0;i<30;i++)global.frame();assert(world.railState().travelled>0);assert(world.hero.position.equals(position));assert.equal(world.hero.parent,null);assert.equal(world.scene.activeCamera,world.camera);
 const pausedPosition=train.position.clone();blocked=true;for(let i=0;i<20;i++)global.frame();assert(train.position.equals(pausedPosition));blocked=false;stepUntilParked();assert.equal(world.railState().station,station);assert(Math.hypot(train.position.x-R.stations[station].x,train.position.z-R.stations[station].z)<1e-7);
 const target=(station+1)%6,oldOrbit={alpha:world.camera.alpha,beta:world.camera.beta,radius:world.camera.radius},wheelBefore=world.scene.getMeshByName('wheel').metadata.roll;
 assert(world.ride(target));assert.equal(world.ride(target),false);assert.equal(world.hero.parent,train);assert.equal(lumi.parent,train);assert.equal(world.scene.activeCamera.parent,train);assert.equal(world.hero.isEnabled(),false);
 for(let i=0;i<36;i++)global.frame();assert(Math.hypot(train.position.x-R.stations[station].x,train.position.z-R.stations[station].z)<1e-6,'boarding precedes movement');
 const heroLocal=world.hero.position.clone(),lumiLocal=lumi.position.clone();world.setStick(1,1);let turns=0,lastHeading=train.rotation.y;
 for(let i=0;i<90;i++){global.frame();assert(world.hero.position.equals(heroLocal));assert(lumi.position.equals(lumiLocal));world.hero.computeWorldMatrix(true);const passengerError=Math.hypot(world.hero.getAbsolutePosition().x-train.position.x,world.hero.getAbsolutePosition().z-train.position.z);assert(passengerError<1e-5,'passenger matrix error '+passengerError);turns+=Math.abs(Math.atan2(Math.sin(train.rotation.y-lastHeading),Math.cos(train.rotation.y-lastHeading)));lastHeading=train.rotation.y;}
 if(station!==3)assert(turns>.005,'carriage follows the curve');
 const onboard=world.scene.activeCamera,yaw=onboard.rotation.y;canvas.emit('pointerdown',8,100,100);canvas.emit('pointermove',8,160,100);canvas.emit('pointerup',8,160,100);assert.notEqual(onboard.rotation.y,yaw);
 stepUntilParked();const state=world.railState(),destination=R.platform(target);assert.equal(state.station,target);assert.equal(state.speed,0);assert(Math.abs(world.scene.getMeshByName('wheel').metadata.roll-wheelBefore+state.travelled/.32)<1e-5);assert.equal(world.hero.parent,null);assert(world.hero.isEnabled());assert.equal(world.scene.activeCamera,world.camera);assert(Math.hypot(world.hero.position.x-destination.x,world.hero.position.z-destination.z)<1e-6);assert.equal(world.camera.alpha,oldOrbit.alpha);assert.equal(world.camera.beta,oldOrbit.beta);assert.equal(world.camera.radius,oldOrbit.radius);for(let i=0;i<3;i++)global.frame();assert.equal(world.railState().station,target);
}
// Choosing a previous station reverses direction; interruptions safely detach passengers.
atStation(1);assert(world.ride(0));assert.equal(world.railState().direction,-1);stepUntilParked();assert.equal(world.railState().station,0);
assert(world.ride(1));for(let i=0;i<90;i++)global.frame();world.teleport('garden');assert.equal(world.hero.parent,null);assert(world.hero.isEnabled());assert.equal(world.scene.activeCamera,world.camera);assert.equal(world.hero.position.x,world.sites.garden.x);
atStation(5);assert.equal(world.railState().station,5);assert(world.ride(0));world.start({x:0,z:-3},0);assert.equal(world.hero.parent,null);assert.equal(world.scene.activeCamera,world.camera);assert.equal(world.railState().station,0);
// Terrain and the carriage route agree with the visual ground and avoid buildings/trees.
const h=MoonLandscape.makeHeight(R.track.samples);world.start({x:95,z:12},0);assert.equal(world.hero.position.y,h(95,12));const ground=world.scene.getMeshByName('earth'),positions=ground.getVerticesData(B.VertexBuffer.PositionKind);assert(Math.max(...positions.filter((v,i)=>i%3===1))>1);assert(Math.min(...positions.filter((v,i)=>i%3===1))<-2);
let blockers=0;for(const m of world.scene.meshes.filter(m=>m.checkCollisions)){m.computeWorldMatrix(true);const box=m.getBoundingInfo().boundingBox;for(const p of R.track.samples)if(p.x>box.minimumWorld.x-1.4&&p.x<box.maximumWorld.x+1.4&&p.z>box.minimumWorld.z-2.2&&p.z<box.maximumWorld.z+2.2){console.log('rail blocker',m.name,m.position.asArray(),p);blockers++;break;}}assert.equal(blockers,0,'track is clear of static collision geometry');
world.engine.getDeltaTime=()=>1000/60;
assert(world.scene.getMaterialByName('wood').diffuseTexture);assert(world.scene.getMeshByName('twilight-sky'));assert(world.scene.imageProcessingConfiguration.toneMappingEnabled);world.quality('low');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,false);world.quality('high');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,true);
const moon=world.scene.getMeshByName('moon'),sun=world.scene.getMeshByName('sun');assert(!moon.isWorldMatrixFrozen&&!sun.isWorldMatrixFrozen);
const beforeSun=sun.position.clone();api.prefs=()=>({motion:false});for(let i=0;i<90;i++)global.frame();assert(B.Vector3.Distance(sun.position,beforeSun)>.01);
assert(world.scene.getMeshByName('wind-leaf').isEnabled());const meshCount=world.scene.meshes.length;world.setStick(.3,0);for(let i=0;i<90;i++)global.frame();assert(world.scene.meshes.some(m=>m.name==='walking-dust'&&m.isEnabled()));assert.equal(world.scene.meshes.length,meshCount,'movement reuses its pool');world.resetInput();
blocked=true;const pausedSun=sun.position.clone();for(let i=0;i<20;i++)global.frame();assert.equal(B.Vector3.Distance(sun.position,pausedSun),0);blocked=false;
world.enter(q,MoonCampaign.initial(q));global.frame();assert.equal(world.scene.fogDensity,0);assert.equal(world.scene.getLightByName('moonwash').intensity,.75);assert(!world.scene.getMeshByName('wind-leaf').isEnabled());world.leave();global.frame();assert(world.scene.fogDensity>.002);
atStation(0);assert(world.ride());for(let i=0;i<150;i++)global.frame();assert(world.scene.meshes.some(m=>m.name==='train-mist'&&m.isEnabled()));world.start({x:0,z:-3},0);
api.prefs=()=>({motion:true});global.frame();assert(!world.scene.getMeshByName('wind-leaf').isEnabled());assert(!world.scene.getMeshByName('walking-dust').isEnabled());assert(!world.scene.getMeshByName('distant-lightning').isEnabled());world.stop();
console.log(JSON.stringify({proportionalMovement:true,dragDoesNotWalk:true,pinchBounds:true,puzzleViewRestored:true,materialsAndQualityTiers:true,clockOrientationAndSelection:true,trainRideAndPassengers:true,mirrorSurfaceAndInventory:true,sixStationCallsAndRides:true,curvedTrackClear:true,terrainFollow:true}));
