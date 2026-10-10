/* Real world/gesture integration using Babylon NullEngine, not a GPU or device test. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js'));
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
global.window=global;global.matchMedia=()=>({matches:true});global.devicePixelRatio=3;
const windowEvents={};global.addEventListener=(type,fn)=>(windowEvents[type]??=[]).push(fn);global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};global.BABYLON=B;
for(const name of ['engine','camera','campaign','controls','graphics','landscape','railway','atmosphere','puzzle-actions'])require(path.join(base,name+'.js'));
const source=fs.readFileSync(path.join(base,'world.js'),'utf8').replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'').replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:390,renderHeight:844})").replaceAll('camera.attachControl(canvas,true);','').replace('engine.runRenderLoop(()=>{','engine.runRenderLoop=fn=>{global.frame=fn;};engine.runRenderLoop(()=>{');vm.runInThisContext(source);
class Target{
 constructor(width=390,height=844){this.clientWidth=width;this.clientHeight=height;this.events={};this.captured=new Set();this.style={};this.classList={add(){},remove(){}};}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn);}removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(v=>v!==fn);}
 setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
 getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
 emit(type,id,x,y,stamp=0,pointerType='touch',button=0){let stopped=false;const e={pointerType,button,pointerId:id,clientX:x,clientY:y,timeStamp:stamp,preventDefault(){},stopImmediatePropagation(){stopped=true;}};for(const fn of this.events[type]||[]){fn(e);if(stopped)break;}}
}

let preference={motion:true},blocked=false,changed=[],audioPose=null,stationCalls=0,nearCalls=0,frames=[];
const canvas=new Target(),joystick=new Target(128,128),knob=new Target();
const api={joystick,knob,prefs:()=>preference,lang:()=> 'nl',time:String,blocked:()=>blocked,solved:()=>false,goal:()=> 'bridge',interact(){},near(){nearCalls++;},change(){},select(){},objects(){},effect(){},ride(){},position(){},station(){stationCalls++;},viewChanged(mode){changed.push(mode);},frame(dt,state){frames.push(state);},audioListener(p,forward,up){audioPose={p:p.clone(),forward:forward.clone(),up:up.clone()};}};
const world=MoonWorld.create(canvas,api);world.engine.getDeltaTime=()=>1000/60;
// Geometry/picking are covered in the existing projection tests; this suite exercises simulation.
world.scene.render=()=>{};
function steps(n=1){for(let i=0;i<n;i++)global.frame();}
function key(key,extra={}){for(const fn of windowEvents.keydown||[])fn({key,target:{tagName:'CANVAS'},preventDefault(){},...extra});}
world.start({x:0,z:-3});steps();assert.equal(world.viewMode(),'third');assert(world.hero.isEnabled());
key('v',{repeat:true});assert.equal(world.viewMode(),'third');
for(const target of [{tagName:'INPUT'},{tagName:'BUTTON'},{tagName:'DIV',isContentEditable:true}]){key('v',{target});assert.equal(world.viewMode(),'third');}
key('V');steps();assert.equal(world.viewMode(),'first');assert.deepEqual(changed,['first']);
const eye=world.scene.activeCamera;assert.equal(eye.name,'exploration-first-person');assert(!world.hero.isEnabled());assert(Math.abs(eye.rotation.x-(Math.PI/2-world.camera.beta))<1e-6,'switch preserves pitch direction');
assert(B.Vector3.Distance(audioPose.p,eye.globalPosition)<1e-6);assert(Math.abs(eye.position.y-world.hero.position.y-2.08)<1e-6);
const initialYaw=eye.rotation.y,position=world.hero.position.clone();
canvas.emit('pointerdown',1,100,100);canvas.emit('pointermove',1,140,130);canvas.emit('pointerup',1,140,130);steps();
assert.notEqual(eye.rotation.y,initialYaw);assert(B.Vector3.Distance(position,world.hero.position)<1e-6,'look does not walk');
const beforeMouse=eye.rotation.y;
canvas.emit('pointerdown',2,100,100,0,'mouse',2);canvas.emit('pointermove',2,140,100,0,'mouse',2);canvas.emit('pointerup',2,140,100,0,'mouse',2);
assert.notEqual(eye.rotation.y,beforeMouse,'right mouse drag looks');
eye.rotation.set(0,Math.PI/2,0);world.setStick(0,-.5);steps(60);world.resetInput();
assert(Math.abs(world.hero.position.x-position.x-2.5)<1e-6,'forward follows eye yaw at proportional joystick speed');assert(Math.abs(world.hero.position.z-position.z)<1e-6);
const q=MoonCampaign.make(0,1,'nl');world.enter(q,MoonCampaign.initial(q));steps();
assert.equal(world.scene.activeCamera,world.camera);assert(world.hero.isEnabled());key('v');assert.equal(world.viewMode(),'first');
world.leave();steps();assert.equal(world.scene.activeCamera,eye);assert(!world.hero.isEnabled());assert.equal(eye.rotation.y,Math.PI/2);
preference={motion:false,view:'first'};world.enter(q,MoonCampaign.initial(q));steps(45);world.leave();steps(45);assert.equal(world.scene.activeCamera,eye);assert(!world.hero.isEnabled());assert(Math.abs(eye.position.y-world.hero.position.y-2.08)<1e-6,'eye stays steady without head bob');preference={motion:true};
// Third-person orbit still restores when an exercise is interrupted or left.
world.view('third');world.camera.alpha=-1;world.camera.beta=.9;world.camera.radius=12;
world.enter(q,MoonCampaign.initial(q));world.leave();steps();assert.equal(world.camera.alpha,-1);assert.equal(world.camera.radius,12);
// Existing train view is independent of preferred exploration view.
preference={motion:true,view:'first'};world.start(MoonRailway.platform(0),0);assert.equal(world.viewMode(),'first');assert(world.ride(1));
assert.equal(world.scene.activeCamera.name,'train-first-person');key('v');assert.equal(world.viewMode(),'first');
for(let i=0;i<2500&&world.railState().active;i++)steps();assert(!world.railState().active);assert.equal(world.scene.activeCamera,eye);assert(!world.hero.isEnabled());
// An external camera owns rendering while exploration, weather, train and HUD remain suspended.
world.start(MoonRailway.platform(2),0);assert(world.callTrain());steps(90);
const sun=world.scene.getMeshByName('sun'),sunBefore=sun.position.clone(),railBefore=world.railState().travelled,heroBefore=world.hero.position.clone();
world.externalActivity(true);const external=new B.UniversalCamera('separate-game',new B.Vector3(0,10,0),world.scene);external.inputs.clear();world.scene.activeCamera=external;
const stationBefore=stationCalls,nearBefore=nearCalls,yawBefore=eye.rotation.y;world.setStick(1,1);key('w');key('v');
canvas.emit('pointerdown',3,100,100);canvas.emit('pointermove',3,150,150);canvas.emit('pointerup',3,150,150);steps(60);
assert.equal(world.scene.activeCamera,external);assert(world.hero.position.equals(heroBefore));assert.equal(world.railState().travelled,railBefore);assert(sun.position.equals(sunBefore));assert.equal(stationCalls,stationBefore);assert.equal(nearCalls,nearBefore);assert.equal(eye.rotation.y,yawBefore);assert(frames.at(-1).externalActive);
assert(!world.scene.getMeshByName('ground-haze').isEnabled());assert(!world.scene.getMeshByName('wind-leaf').isEnabled());assert(!world.callTrain());assert(!world.ride());
blocked=true;steps();assert(frames.at(-1).blocked);blocked=false;const hiddenCount=frames.length;document.hidden=true;steps();document.hidden=false;assert.equal(frames.length,hiddenCount,'hidden tab skips both world and external runtime');
world.externalActivity(false);steps();assert.equal(world.scene.activeCamera,eye);assert(world.railState().travelled>railBefore);assert(!frames.at(-1).externalActive);
// Profile start applies its own preference and cancels stale movement.
preference={motion:true};key('w');world.start({x:0,z:-3},0);steps();assert.equal(world.hero.position.z,-3,'profile start clears keyboard input');assert.equal(world.viewMode(),'third');assert.equal(world.scene.activeCamera,world.camera);assert(world.hero.isEnabled());
world.addObstacles([{x:0,z:-2,w:1,d:1},{x:0,z:0,w:-1,d:1},{x:NaN,z:0,w:1,d:1}]);world.camera.alpha=-Math.PI/2;const beforeObstacle=world.hero.position.clone();world.setStick(0,-1);steps(60);world.resetInput();assert(world.hero.position.z< -2.5,'registered building blocks walking');
assert(Number.isFinite(world.terrainHeight(95,12)));world.stop();
console.log(JSON.stringify({firstPersonLookAndMovement:true,exerciseRestoration:true,trainPreferenceRestoration:true,externalCameraSuspension:true,editableAndRepeatKeyGuards:true,profilePreferenceReset:true,addedObstacleCollision:true}));
