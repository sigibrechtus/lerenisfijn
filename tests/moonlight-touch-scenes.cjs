/* Real world/gesture integration using Babylon NullEngine, not a GPU or device test. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
const base=path.join(__dirname,'../games/moonlight-hollow'),B=require(path.join(base,'vendor/babylon.js'));
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
global.window=global;global.matchMedia=()=>({matches:true});global.devicePixelRatio=3;
global.addEventListener=()=>{};global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};global.BABYLON=B;
for(const name of ['engine','camera','campaign','controls','graphics'])require(path.join(base,name+'.js'));
const source=fs.readFileSync(path.join(base,'world.js'),'utf8').replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'').replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:390,renderHeight:844})").replaceAll('camera.attachControl(canvas,true);','').replace('engine.runRenderLoop(()=>{','engine.runRenderLoop=fn=>{global.frame=fn;};engine.runRenderLoop(()=>{');vm.runInThisContext(source);
class Target{
 constructor(width=390,height=844){this.clientWidth=width;this.clientHeight=height;this.events={};this.captured=new Set();this.style={};this.classList={add(){},remove(){}};}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn);}removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(v=>v!==fn);}
 setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
 getBoundingClientRect(){return {left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
 emit(type,id,x,y,stamp=0){let stopped=false;const e={pointerType:'touch',button:0,pointerId:id,clientX:x,clientY:y,timeStamp:stamp,preventDefault(){},stopImmediatePropagation(){stopped=true;}};for(const fn of this.events[type]||[]){fn(e);if(stopped)break;}}
}
const canvas=new Target(),joystick=new Target(128,128),knob=new Target(),api={joystick,knob,prefs:()=>({motion:true}),lang:()=> 'nl',time:String,blocked:()=>false,solved:()=>false,goal:()=> 'bridge',interact(){},near(){},change(){},select(){},objects(){},effect(){},ride(){},position(){}};
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
assert(world.scene.getMaterialByName('wood').diffuseTexture);assert(world.scene.getMeshByName('twilight-sky'));assert(world.scene.imageProcessingConfiguration.toneMappingEnabled);world.quality('low');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,false);world.quality('high');assert.equal(world.scene.effectLayers.find(v=>v.name==='lantern-glow').isEnabled,true);world.stop();
console.log(JSON.stringify({proportionalMovement:true,dragDoesNotWalk:true,pinchBounds:true,puzzleViewRestored:true,materialsAndQualityTiers:true,clockOrientationAndSelection:true}));
