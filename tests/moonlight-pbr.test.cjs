const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../games/moonlight-hollow/pbr-materials.js');
test('UV-tileable ORM has matching edges, correct channels and material distinctions',()=>{
 for(const type of ['wood','stone','roof','metal','pumpkin','cloth','earth','plaster']){
  const {orm,albedo,normal,resolution:n}=P.generate(type,128);
  assert.equal(orm.length,128*128*4);assert.equal(albedo.length,orm.length);assert.equal(normal.length,orm.length);
  for(let i=0;i<n;i++)for(let c=0;c<4;c++){
   assert.equal(orm[(i*n)*4+c],orm[(i*n+n-1)*4+c],type+' X seam');
   assert.equal(orm[i*4+c],orm[((n-1)*n+i)*4+c],type+' Y seam');
  }
  for(let j=0;j<orm.length;j+=4){
   assert(orm[j]>=175&&orm[j]<=255,'AO within bounds');assert(orm[j+1]>=20&&orm[j+1]<=255,'roughness within bounds');
   assert.equal(orm[j+2]>0,type==='metal','metallic only for metal');assert.equal(orm[j+3],255);
  }
 }
});
function doubles(){
 const tex=[],mats=[],handlers=[],scene={materials:[],getEngine:()=>({getCaps:()=>({maxTextureSize:4096})}),onDisposeObservable:{addOnce:fn=>handlers.push(fn)}};
 class Color3{constructor(x,y,z){this.x=x;this.y=y;this.z=z;}static FromHexString(h){return h;}set(x,y,z){this.x=x;this.y=y;this.z=z;}}
 class PBRMaterial{constructor(name){this.name=name;this.albedoColor='#ffffff';mats.push(this);scene.materials.push(this);}dispose(){this.dead=true;scene.materials.splice(scene.materials.indexOf(this),1);}isDisposed(){return !!this.dead;}}
 class DynamicTexture{constructor(name,size){this.name=name;this.size=size;tex.push(this);this.ctx={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:v=>this.data=v.data};}getContext(){return this.ctx;}update(v){this.inverted=v;}dispose(){this.dead=(this.dead||0)+1;}}
 const B={Color3,PBRMaterial,DynamicTexture,Texture:{WRAP_ADDRESSMODE:1,TRILINEAR_SAMPLINGMODE:3}};return{B,scene,tex,mats,handlers};
}
test('PBR maps are on the matching Babylon material slots and shared by surface + repeat',()=>{
 const d=doubles(),bank=P.create(d.B,d.scene,{quality:'low',budgetMiB:24});
 const a=bank.material('wood','#715640',2),b=bank.material('wood','#75402a',2);
 assert.equal(a.albedoTexture,b.albedoTexture);assert.equal(a.metallicTexture,b.metallicTexture);
 assert.equal(a.bumpTexture,b.bumpTexture);assert.equal(d.tex.length,3);
 assert.equal(a.metallicTexture.gammaSpace,false);assert.equal(a.bumpTexture.gammaSpace,false);
 assert.equal(a.albedoTexture.gammaSpace,true);assert.equal(a.albedoTexture.uScale,2);
 assert.equal(a.useRoughnessFromMetallicTextureGreen,true);
 assert.equal(a.useRoughnessFromMetallicTextureAlpha,false);
 assert.equal(a.useMetallnessFromMetallicTextureBlue,true);
 assert.equal(a.useAmbientOcclusionFromMetallicTextureRed,true);
 assert.equal(a.metadata.moonSurface.type,'wood');assert.equal(a.metadata.moonSurface.resolution,512);
 assert.equal(a.diffuseColor,a.albedoColor);a.diffuseColor='#abcdef';assert.equal(a.albedoColor,'#abcdef');
 assert.equal(bank.stats.textures,3);
 const c=bank.material('pumpkin','#dd8030',1);
 assert.notEqual(c.metallicTexture,a.metallicTexture);
 assert.equal(bank.quality('balanced'),true);assert(bank.stats.estimatedBytes<=24*1048576);
 assert.equal(bank.quality('low'),true);
 bank.dispose();bank.dispose();assert.equal(bank.stats.disposed,true);
 assert(d.tex.every(t=>t.dead===1),'textures released exactly once');
});
test('PBR bank rejects a StandardMaterial rather than silently dropping ORM',()=>{
 const d=doubles(),bank=P.create(d.B,d.scene,{quality:'low'});assert.throws(()=>bank.apply({diffuseColor:'#ffffff'},{}),/PBRMaterial/);assert.equal(bank.stats.textures,0);bank.dispose();
});
test('desktop HD PBR bank holds seven full 2K surface sets',()=>{
 const d=doubles(),bank=P.create(d.B,d.scene,{quality:'high'});
 for(const type of ['wood','stone','roof','metal','pumpkin','cloth','earth'])bank.material(type);
 assert.equal(bank.stats.pairs,7);
 assert(bank.stats.surfaces.every(surface=>surface.resolution===2048));
 assert.equal(bank.stats.estimatedBytes,448*1048576);
 assert(bank.stats.estimatedBytes<=bank.stats.budgetMiB*1048576);
 bank.dispose();
});
test('mobile PBR bank stays at balanced resolution when HD is selected',()=>{
 const d=doubles(),bank=P.create(d.B,d.scene,{quality:'high',maxQuality:'balanced',budgetMiB:128});
 bank.material('stone');
 assert.equal(bank.stats.quality,'balanced');assert.equal(bank.stats.surfaces[0].resolution,1024);
 assert.equal(bank.quality('high'),false);assert.equal(bank.stats.quality,'balanced');
 bank.dispose();
});
test('actual vendored Babylon NullEngine accepts the PBR/ORM material layout',t=>{
 let canvas;try{canvas=require('@napi-rs/canvas');}catch{t.skip('Canvas unavailable');return;}
 const prev=global.OffscreenCanvas;global.OffscreenCanvas=class{constructor(w,h){return canvas.createCanvas(w,h);}};
 const B=require('../games/moonlight-hollow/vendor/babylon.js'),engine=new B.NullEngine({renderWidth:64,renderHeight:64}),scene=new B.Scene(engine);engine.getCaps().maxTextureSize=2048;
 try{
  const bank=P.create(B,scene,{quality:'low'}),m=bank.material('stone','#738793',3);
  assert(m instanceof B.PBRMaterial);assert.equal(m.albedoTexture.getSize().width,512);
  assert.equal(m.bumpTexture.getSize().width,512);assert.equal(m.metallicTexture.getSize().width,512);
  assert([m.albedoTexture,m.bumpTexture,m.metallicTexture].every(texture=>scene.textures.includes(texture)));assert.equal(scene.materials.length,1);
  const box=B.MeshBuilder.CreateBox('test-pbr-uv',{size:1},scene);box.material=m;
  assert(box.isVerticesDataPresent(B.VertexBuffer.UVKind),'mesh UV coordinates exist');
  bank.dispose();assert([m.albedoTexture,m.bumpTexture,m.metallicTexture].every(texture=>!scene.textures.includes(texture)));scene.dispose();
 }finally{engine.dispose();global.OffscreenCanvas=prev;}
});

test('PBR quality upgrades account for simultaneous old and new GPU textures',()=>{
 const d=doubles(),bank=P.create(d.B,d.scene,{quality:'low',budgetMiB:24});
 const wood=bank.material('wood','#715640',1);
 const pumpkin=bank.material('pumpkin','#cb721b',1);
 assert.equal(bank.stats.estimatedBytes,8*1048576);
 assert.equal(bank.quality('balanced'),true);
 assert(bank.stats.lastPeakBytes<=24*1048576,'upgrade must not exceed GPU budget during upload');
 assert(bank.stats.estimatedBytes<=24*1048576,'steady-state resident bytes remain bounded');
 assert.equal(wood.albedoTexture.dead,undefined,'bound materials retain live textures');
 assert.equal(pumpkin.albedoTexture.dead,undefined,'other bound materials retain live textures');
 assert(bank.stats.surfaces.some(surface=>surface.resolution===1024),'first pair can be upgraded');
 assert(bank.stats.surfaces.some(surface=>surface.resolution===512),'later pair remains at fallback resolution');
 bank.dispose();
 assert(d.tex.every(t=>t.dead===1),'all replacement and retired textures disposed once');
});
