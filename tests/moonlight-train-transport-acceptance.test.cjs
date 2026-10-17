'use strict';
// Focused transport acceptance: exercise the exact production import, parking,
// motion, and ride-camera blocks extracted from the shipped world.js.
// This is a transform/logic regression; no GPU or visual quality is asserted.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const R=require('../games/moonlight-hollow/railway.js');
const source=fs.readFileSync(path.join(__dirname,'../games/moonlight-hollow/world.js'),'utf8');
function section(from,to){
 const a=source.indexOf(from),b=source.indexOf(to,a);
 assert(a>=0&&b>a,'production code section found: '+from);
 return source.slice(a,b);
}
const parking=section("const train=new B.TransformNode('moon-express',scene);","const trainMat=material('train'");
const importAndCamera=section("const locomotiveMount=new B.TransformNode('moon-express-locomotive-front',scene);",'// Friendly castle and observatory.');
const move=section('function moveTrain(state,rollDistance=0){','function finishRide(');
async function exercise(importer){
 const hidden=[],loaded=[],cameras=[],warnings=[];
 class Vector3{constructor(x,y,z){this.x=x;this.y=y;this.z=z;}set(x,y,z){this.x=x;this.y=y;this.z=z;}}
 class TransformNode{
  constructor(name){this.name=name;this.position=null;this.rotation={y:0};this.meshes=[{isDisposed:()=>false,setEnabled:v=>hidden.push(v)}];}
  getChildMeshes(){return this.meshes;}
  isDisposed(){return false;}
  computeWorldMatrix(){this.worldUpdated=true;}
 }
 const B={Vector3,TransformNode,UniversalCamera:class {
  constructor(name,at,scene){this.name=name;this.position=at;this.scene=scene;this.inputs={clear(){}};}
 }};
 const scene={isDisposed:()=>false},pipeline={addCamera:camera=>cameras.push(camera)};
 const library=importer&&{placeProduction:(scene,id,parent,opts)=>{loaded.push({scene,id,parent,opts});return importer(scene,id,parent,opts);}};
 const scope={B,scene,R,root:{MoonAssetLibrary:library},api:{prefs:()=>({quality:'high'})},mobileSafari:false,pipeline,console:{warn:x=>warnings.push(x)},Promise};
 vm.runInNewContext(parking+'\nconst wheels=[];\n'+importAndCamera+'\n'+move+'\nthis.acceptance={train,locomotiveMount,railMotion,rideCamera,moveTrain,wheels};',scope,{filename:'world-train-acceptance.js'});
 await new Promise(resolve=>setImmediate(resolve));
 return{...scope.acceptance,hidden,loaded,cameras,warnings,scene};
}
test('hero GLB attaches to the actual train, castle parking and ride camera follow one transform',async()=>{
 const model={kind:'hero'};
 const s=await exercise((_scene,_id,parent)=>{model.parent=parent;return model;});
 assert.equal(s.loaded.length,1);
 assert.equal(s.loaded[0].id,'moon-express-locomotive');
 assert.equal(s.loaded[0].parent,s.locomotiveMount);
 assert.equal(s.loaded[0].opts.geometryQuality,'high');
 assert.equal(s.loaded[0].opts.textureQuality,'high');
 assert.equal(s.loaded[0].opts.scale,.85);
 assert.deepEqual(s.hidden,[],'boarding wagon must remain visible');
 assert.equal(model.parent,s.locomotiveMount,'GLB is mounted ahead of wagon');
 assert.equal(s.railMotion.snapshot().station,0,'castle station is initial location');
 assert.equal(s.train.position.x,R.stations[0].x);
 assert.equal(s.train.position.z,R.stations[0].z);
 assert.equal(s.rideCamera.parent,s.train);
 assert.equal(s.cameras[0],s.rideCamera);
 assert.equal(s.rideCamera.position.y,1.82);
 assert.equal(s.rideCamera.position.z,-1.7);
 assert.equal(s.rideCamera.minZ,.08);
 assert.equal(s.rideCamera.maxZ,500);
 assert.equal(s.railMotion.call(1),true,'empty train can be summoned to village');
 const moving=s.railMotion.tick(s.railMotion.snapshot().duration/2);
 s.moveTrain(moving,0);
 assert.equal(s.train.position.x,moving.x);
 assert.equal(s.train.position.z,moving.z);
 assert.equal(s.train.rotation.y,moving.heading);
 assert.equal(s.rideCamera.parent,s.train,'camera follows same transform during travel');
 s.railMotion.tick(1000);s.moveTrain(s.railMotion.snapshot(),0);
 assert.equal(s.railMotion.snapshot().station,1);
 assert.equal(s.train.position.x,R.stations[1].x);
 assert.equal(s.train.position.z,R.stations[1].z);
});
test('GLB import failure keeps the procedural transport and camera functional',async()=>{
 const s=await exercise(()=>Promise.reject(Error('WebGL GLB unavailable')));
 assert.deepEqual(s.hidden,[]);
 assert.equal(s.warnings.length,1);
 assert.equal(s.railMotion.snapshot().station,2);
 assert.equal(s.rideCamera.parent,s.train);
 assert.equal(s.railMotion.call(0),true);
});

test('HD train aligns to measured local bounds and preserves +Z-forward transport',()=>{
 const asset=fs.readFileSync(path.join(__dirname,'../games/moonlight-hollow/asset-library.js'),'utf8');
 assert.match(asset,/id==='moon-express-locomotive'&&B\.Matrix\?\.Invert/);
 assert.match(asset,/2\.25\/width,4\.45\/length,3\.05\/height/);
 assert.match(asset,/node\.position\.x-=midX\*fit/);
 assert.match(asset,/node\.position\.z-=midZ\*fit/);
 assert.match(asset,/node\.position\.y\+=\.12-mins\[1\]\*fit/);
 assert.match(source,/geometryQuality:'high'/,'production hero mesh remains selected');
});

test('locomotive occupies forward mounting point with boarding wagon preserved',()=>{assert.match(source,/locomotiveMount\.position\.set\(0,0,4\.5\)/);assert.doesNotMatch(source,/trainProxyMeshes\.filter\(/);});
