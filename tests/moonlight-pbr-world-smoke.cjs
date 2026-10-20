/* PBR-integration smoke: builds the actual Moonlight scene on Babylon's NullEngine.
   It verifies material ownership, mapping, primitive UVs and separate creature maps.
   This is a scene-structure test, not GPU visual validation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.join(__dirname,'..'));
const {createCanvas}=require('@napi-rs/canvas');
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h);}};
global.window=global;global.devicePixelRatio=1;global.matchMedia=()=>({matches:false});
const simulateIphone=process.env.MOONLIGHT_SIMULATE_IPHONE==='1';
if(simulateIphone)global.navigator={userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1'};
global.addEventListener=()=>{};global.removeEventListener=()=>{};
global.document={hidden:false,createElement:()=>createCanvas(512,512),addEventListener(){},removeEventListener(){}};
const B=global.BABYLON=require('../games/moonlight-hollow/vendor/babylon.js');
for(const name of ['engine','grounding','camera','controls','graphics','landscape','railway','atmosphere','puzzle-actions','campaign','materials','pbr-materials','creatures'])
 require('../games/moonlight-hollow/'+name+'.js');
let code=fs.readFileSync('./games/moonlight-hollow/world.js','utf8')
 .replace("if(!B||!B.Engine.isSupported())throw Error('WebGL');",'')
 .replace("new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,powerPreference:'high-performance'})","new B.NullEngine({renderWidth:800,renderHeight:600})")
 .replaceAll('camera.attachControl(canvas,true);','');
vm.runInThisContext(code);
const api={prefs:()=>({quality:simulateIphone?'high':'low',motion:false}),lang:()=> 'nl',time:n=>String(n),blocked:()=>false,solved:()=>false,goal:()=>null,interact(){},near(){},change(){},select(){},objects(){},effect(){},ride(){},position(){}};
const world=MoonWorld.create({addEventListener(){},removeEventListener(){}},api);
const pbrMaterials=world.scene.materials.filter(m=>m instanceof B.PBRMaterial&&m.metadata?.moonSurface);
assert(pbrMaterials.length>=8,'world has real mapped PBR surfaces');
for(const m of pbrMaterials){
 const p=m.metadata.moonSurface;
 assert(m.albedoTexture&&m.bumpTexture&&m.metallicTexture,'all PBR maps assigned to '+m.name);
 assert.equal(m.metallicTexture.gammaSpace,false);
 assert.equal(p.resolution,m.albedoTexture.getSize().width);
 assert.equal(m.albedoTexture.uScale,p.repeat);
 assert.equal(m.bumpTexture.uScale,p.repeat);
 assert.equal(m.metallicTexture.uScale,p.repeat);
}
const meshes=world.scene.meshes.filter(m=>m.material instanceof B.PBRMaterial&&m.material.metadata?.moonSurface);
assert(meshes.length>30,'world props reuse PBR textures');
assert(meshes.some(m=>m.isVerticesDataPresent(B.VertexBuffer.UVKind)),'PBR models have built-in UVs');
const creatures=world.scene.materials.filter(m=>m.name?.startsWith('creature-')&&m.metadata?.moonSurface);
assert(creatures.some(m=>m.metadata.moonSurface.type==='pumpkin'));
assert(creatures.some(m=>m.metadata.moonSurface.type==='cloth'));
if(simulateIphone){
 const {materials}=world;
 assert.equal(materials.stats.budgetMiB,128);
 for(const quality of ['high','sharp','low','sharp','high']){
  assert.doesNotThrow(()=>world.quality(quality),'mobile '+quality+' must never exhaust the PBR budget');
  assert(materials.stats.estimatedBytes<=128*1048576);
  assert(materials.stats.lastPeakBytes<=128*1048576);
 }
 assert(world.scene.materials.filter(m=>m.metadata?.moonSurface).every(m=>m.albedoTexture&&!m.albedoTexture.isDisposed()),'live surface maps after quality changes');
}
console.log(JSON.stringify({simulatedIphone:simulateIphone,pbrMaterials:pbrMaterials.length,pbrMeshes:meshes.length,creatureMaps:creatures.length,materialBank:world.materials.stats}));
world.stop();