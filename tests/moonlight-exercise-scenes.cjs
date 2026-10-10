process.on('uncaughtException',e=>{console.log(e.message);console.log(e.stack.split('\n').slice(0,8).join('\n'));process.exit(1);});
process.chdir(require('node:path').join(__dirname,'..'));
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{createCanvas}=require('@napi-rs/canvas');
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};global.window=global;global.matchMedia=()=>({matches:false});global.devicePixelRatio=1;global.addEventListener=()=>{};global.removeEventListener=()=>{};global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};global.BABYLON=require('../games/moonlight-hollow/vendor/babylon.js');
require('../games/moonlight-hollow/engine.js');require('../games/moonlight-hollow/grounding.js');require('../games/moonlight-hollow/camera.js');require('../games/moonlight-hollow/controls.js');require('../games/moonlight-hollow/graphics.js');require('../games/moonlight-hollow/landscape.js');require('../games/moonlight-hollow/railway.js');require('../games/moonlight-hollow/atmosphere.js');require('../games/moonlight-hollow/puzzle-actions.js');const C=require('../games/moonlight-hollow/campaign.js');let source=fs.readFileSync('./games/moonlight-hollow/world.js','utf8').replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'').replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:1920,renderHeight:1080})").replaceAll('camera.attachControl(canvas,true);','').replace('engine.runRenderLoop(()=>{','engine.runRenderLoop=fn=>{global.frame=fn;};engine.runRenderLoop(()=>{');vm.runInThisContext(source);

const canvas={addEventListener(){},removeEventListener(){}};let current,solved=false,names=[];const api={prefs:()=>({motion:true}),lang:()=> 'nl',time:String,blocked:()=>false,solved:()=>solved,goal:()=> 'bridge',interact(){},near(){},change:a=>current=a,select(){},objects:n=>names=n,effect(){},ride(){},position(){}};
const world=MoonWorld.create(canvas,api);world.engine.getDeltaTime=()=>1000/60;world.start();let cases=0;
function use(name){const m=world.scene.meshes.find(m=>m.isPickable&&m.metadata?.name===String(name)&&m.parent?.name==='puzzle');assert(m,'missing action '+name);m.metadata.use();}
for(const lang of ['nl','fr'])for(let level=1;level<=3;level++)for(let i=0;i<30;i++){
 const q=C.make(i,level,lang);api.lang=()=>lang;current=C.initial(q);solved=false;world.enter(q,current);global.frame();assert(names.length>0,q.type);
 if(q.type==='route'){const eye=world.scene.activeCamera;eye.getViewMatrix(true);const transform=eye.getViewMatrix().multiply(eye.getProjectionMatrix(true)),vp=eye.viewport.toGlobal(1920,1080);const tiles=world.scene.meshes.filter(m=>m.name==='puzzle-tile'&&m.parent?.name==='puzzle');const start=tiles.find(m=>Math.abs(m.position.x+2.8)<1e-6&&m.position.y===1),target=tiles.find(m=>Math.abs(m.position.x-((q.target[0]-1)*1.1-1.7))<1e-6&&Math.abs(m.position.y-(1+q.target[1]*1.1))<1e-6);const screen=m=>BABYLON.Vector3.Project(m.getAbsolutePosition(),BABYLON.Matrix.Identity(),transform,vp);assert(screen(target).y<screen(start).y,'up points toward screen top');use('↑');use('↓');use('→');use('←');assert.equal(current,'NSEW');use('⌧');assert.equal(current,'');for(const c of q.answer)use(c==='E'?'→':'↑');use('↶');use(q.answer.at(-1)==='E'?'→':'↑');}
 else if(q.type==='groups')q.targets.forEach((n,j)=>{while(current[j]<n)use((lang==='fr'?'Panier ':'Mand ')+(j+1));});
 else if(q.type==='fraction'){for(let j=0;j<q.total;j++){world.select(j<q.moon?0:1);use((lang==='fr'?'Mesure ':'Vak ')+(j+1));}}
 else if(q.type==='word'){for(const letter of q.word){const t=q.tiles.find(t=>t.letter===letter&&!current.includes(t.id));use(t.letter);}}
 else if(q.type==='mirror'){world.change(q.mirrors.map(m=>m.solution));current=q.mirrors.map(m=>m.solution);}
 else if(q.type==='time'){world.change(q.answer);current=q.answer;}
 else if(q.type==='riddle')use(q.choices.find(v=>v.value===q.answer).label);
 else if(q.type==='deduction')use(q.choices[q.answer]);
 else if(q.type==='pattern')use(q.answer===0?'☾':'★');
 else use(q.answer);
 assert(C.check(q,current),q.type+' solved via actions');solved=true;const before=JSON.stringify(current);world.objectsUse();assert.equal(JSON.stringify(current),before,'solved answer cannot change');world.leave();cases++;
}
console.log(JSON.stringify({exerciseActionCases:cases,routeDirection:true,solvedLocked:true}));world.stop();
