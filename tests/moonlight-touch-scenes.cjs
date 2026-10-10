/* Real world/gesture integration using Babylon NullEngine, not a GPU or device test. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js'));
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
global.window=global;global.matchMedia=()=>({matches:true});global.devicePixelRatio=3;
global.addEventListener=()=>{};global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};global.BABYLON=B;
for(const name of ['engine','camera','campaign','controls','graphics','railway','atmosphere'])require(path.join(base,name+'.js'));
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
// Train motion, onboard camera and passenger attachment use the real world implementation.
const train=world.scene.getTransformNodeByName('moon-express'),lumi=world.scene.getTransformNodeByName('Lumi');
world.start({x:0,z:-3});assert.equal(world.ride(),false,'cannot board from across the village');
world.start({x:8,z:0});const oldOrbit={alpha:world.camera.alpha,beta:world.camera.beta,radius:world.camera.radius};
assert.equal(world.ride(),true);assert.equal(world.ride(),false,'double boarding cannot restart travel');
assert.equal(world.scene.activeCamera.name,'train-first-person');assert.equal(world.scene.activeCamera.parent,train);assert.equal(world.hero.parent,train);assert.equal(lumi.parent,train);assert.equal(world.hero.isEnabled(),false);
for(let i=0;i<72;i++)global.frame();assert(Math.abs(train.position.z)<1e-6,'boarding occurs before departure');
const passengerLocal=world.hero.position.clone(),lumiLocal=lumi.position.clone();world.setStick(1,1);
for(let i=0;i<300;i++){global.frame();assert(world.hero.position.equals(passengerLocal));assert(lumi.position.equals(lumiLocal));}
assert(train.position.z>0&&train.position.z<28);world.hero.computeWorldMatrix(true);assert(Math.abs(world.hero.getAbsolutePosition().z-train.position.z)<1e-6,'passenger moves with carriage');
const pausedZ=train.position.z;blocked=true;for(let i=0;i<60;i++)global.frame();assert.equal(train.position.z,pausedZ);blocked=false;
const onboard=world.scene.activeCamera,yaw=onboard.rotation.y;canvas.emit('pointerdown',8,100,100);canvas.emit('pointermove',8,160,100);canvas.emit('pointerup',8,160,100);assert.notEqual(onboard.rotation.y,yaw,'swiping looks around onboard');
for(let i=0;i<600;i++)global.frame();assert.equal(train.position.z,28);assert(Math.abs(world.scene.getMeshByName('wheel').metadata.roll+28/.32)<1e-6,'wheel rotation matches rail distance');assert.equal(world.hero.parent,null);assert(world.hero.isEnabled());assert.equal(world.scene.activeCamera,world.camera);assert.equal(world.hero.position.x,8);assert.equal(world.hero.position.z,28);assert.equal(world.camera.alpha,oldOrbit.alpha);assert.equal(world.camera.beta,oldOrbit.beta);assert.equal(world.camera.radius,oldOrbit.radius);
for(let i=0;i<60;i++)global.frame();assert.equal(train.position.z,28,'train remains parked after arrival');
assert.equal(world.ride(),true,'return ride boards at the destination');assert.equal(train.rotation.y,Math.PI);assert(world.scene.activeCamera.position.x>0,'return boarding starts at the same west platform');
for(let i=0;i<900;i++)global.frame();assert.equal(train.position.z,0);assert.equal(world.hero.position.z,0);assert.equal(world.scene.activeCamera,world.camera);
assert.equal(world.ride(),true);for(let i=0;i<150;i++)global.frame();world.teleport('garden');assert.equal(world.hero.parent,null);assert(world.hero.isEnabled());assert.equal(world.scene.activeCamera,world.camera);assert.equal(world.hero.position.x,world.sites.garden.x);assert.equal(train.position.z,28);
world.start({x:8,z:28});assert.equal(world.ride(),true);world.start({x:0,z:-3},0);assert.equal(world.hero.parent,null);assert.equal(world.hero.position.z,-3);assert.equal(train.position.z,0);assert.equal(world.scene.activeCamera,world.camera);world.start({x:8,z:28},1);assert.equal(train.position.z,28);assert.equal(world.ride(),true,'saved station supports a return trip after reload');world.start({x:0,z:-3},0);
assert(world.scene.getMaterialByName('wood').diffuseTexture);assert(world.scene.getMeshByName('twilight-sky'));assert(world.scene.imageProcessingConfiguration.toneMappingEnabled);world.quality('low');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,false);world.quality('high');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,true);
const moon=world.scene.getMeshByName('moon'),sun=world.scene.getMeshByName('sun');assert(!moon.isWorldMatrixFrozen&&!sun.isWorldMatrixFrozen);
const beforeSun=sun.position.clone();api.prefs=()=>({motion:false});for(let i=0;i<90;i++)global.frame();assert(B.Vector3.Distance(sun.position,beforeSun)>.01);
assert(world.scene.getMeshByName('wind-leaf').isEnabled());const meshCount=world.scene.meshes.length;world.setStick(.3,0);for(let i=0;i<90;i++)global.frame();assert(world.scene.meshes.some(m=>m.name==='walking-dust'&&m.isEnabled()));assert.equal(world.scene.meshes.length,meshCount,'movement reuses its pool');world.resetInput();
blocked=true;const pausedSun=sun.position.clone();for(let i=0;i<20;i++)global.frame();assert.equal(B.Vector3.Distance(sun.position,pausedSun),0);blocked=false;
world.enter(q,MoonCampaign.initial(q));global.frame();assert.equal(world.scene.fogDensity,0);assert.equal(world.scene.getLightByName('moonwash').intensity,.75);assert(!world.scene.getMeshByName('wind-leaf').isEnabled());world.leave();global.frame();assert(world.scene.fogDensity>.002);
world.start({x:8,z:0},0);assert(world.ride());for(let i=0;i<150;i++)global.frame();assert(world.scene.meshes.some(m=>m.name==='train-mist'&&m.isEnabled()));world.start({x:0,z:-3},0);
api.prefs=()=>({motion:true});global.frame();assert(!world.scene.getMeshByName('wind-leaf').isEnabled());assert(!world.scene.getMeshByName('walking-dust').isEnabled());assert(!world.scene.getMeshByName('distant-lightning').isEnabled());world.stop();
console.log(JSON.stringify({proportionalMovement:true,dragDoesNotWalk:true,pinchBounds:true,puzzleViewRestored:true,materialsAndQualityTiers:true,clockOrientationAndSelection:true,trainRideAndPassengers:true,mirrorSurfaceAndInventory:true}));
