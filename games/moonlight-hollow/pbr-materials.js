/* Native procedural albedo, tangent-space normal and glTF-style ORM textures.
   Each texture belongs to a named surface family, not to a cropped concept sheet.
   Purely procedural and offline-capable; 4K is opt-in on suitably provisioned devices. */
(function(root){'use strict';
const source=root.MoonMaterials||(typeof require==='function'?require('./materials.js'):null);
if(!source)throw Error('MoonMaterials must load before MoonPBRMaterials');
const baseRoughness={wood:.77,stone:.89,roof:.85,metal:.36,pumpkin:.63,cloth:.95,earth:.97,plaster:.91};
const max=(a,b)=>Math.max(a,b),clamp=x=>max(0,Math.min(255,Math.round(x)));
const types=source.types;
function generate(type,resolution=512){
 const surface=source.generate(type,resolution),{height}=surface,orm=new Uint8ClampedArray(resolution*resolution*4),p=resolution-1;
 // In glTF's packed ORM convention R=occlusion, G=roughness, B=metallic.
 // Small variations are derived from the actual surface height, not illumination.
 for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
  const i=y*resolution+x,j=i*4,h=height[i],left=height[y*resolution+(x===0||x===p?p-1:x-1)],up=height[(y===0||y===p?p-1:y-1)*resolution+x];
  const crevice=max(0,.53-h),ridge=Math.min(1,Math.abs(h-left)+Math.abs(h-up));
  orm[j]=clamp(255*(1-Math.min(.28,crevice*.45+ridge*.08)));
  orm[j+1]=clamp(255*Math.min(.99,max(.13,baseRoughness[type]+(h-.5)*.20+ridge*.10)));
  orm[j+2]=type==='metal'?clamp(255*Math.min(.92,max(.45,.82-crevice*.75))):0;
  orm[j+3]=255;
 }
 return {...surface,orm};
}
function create(B,scene,opts={}){
 if(!B?.PBRMaterial||!B?.DynamicTexture)throw new Error('Babylon PBRMaterial and DynamicTexture required');
 const rank={low:0,balanced:1,high:2},maxQuality=['low','balanced','high'].includes(opts.maxQuality)?opts.maxQuality:'high';
 let quality=['low','balanced','high'].includes(opts.quality)?opts.quality:'balanced',bytes=0,peak=0,disposed=false;
 if(rank[quality]>rank[maxQuality])quality=maxQuality;
 const caps=scene.getEngine?.().getCaps?.()||{},hardware=caps.maxTextureSize||2048;
 const limit=Math.min(hardware,opts.enable4K===true?4096:2048);
 // Seven independent 2K PBR triplets require 448 MiB including mipmaps.
 // The world supplies a lower explicit budget for iOS devices.
 const budgetFor=q=>(Number.isFinite(opts.budgetMiB)?max(4,opts.budgetMiB):(q==='low'?48:q==='high'?640:128))*1048576;
 const pairs=new Map(),bindings=new Map(),owned=new Set(),mats=new Map();
 const pairBytes=size=>Math.ceil(size*size*4*3*4/3);
 function expected(type,tier){
  if(tier==='low')return 512;
  if(tier==='balanced')return 1024;
  return opts.enable4K===true&&['wood','stone','roof','pumpkin'].includes(type)?4096:2048;
 }
 function sizeFor(type,tier,available){
  let n=expected(type,tier);
  while(n>limit&&n>128)n/=2;
  while(pairBytes(n)>available&&n>128)n/=2;
  if(pairBytes(n)>available)throw new RangeError('Moonlight PBR memory budget exhausted');
  return n;
 }
 function upload(type,repeat,size,tier){
  const pixels=generate(type,size),tex=[],key=type+':'+repeat;
  try{
   for(const [suffix,data] of [['albedo',pixels.albedo],['normal',pixels.normal],['orm',pixels.orm]]){
    const t=new B.DynamicTexture('moon-pbr-'+key+'-'+suffix,{width:size,height:size},scene,true,B.Texture?.TRILINEAR_SAMPLINGMODE);
    tex.push(t);
    const c=t.getContext(),image=c.createImageData(size,size);image.data.set(data);c.putImageData(image,0,0);
    t.wrapU=t.wrapV=B.Texture?.WRAP_ADDRESSMODE??1;t.uScale=t.vScale=repeat;
    t.anisotropicFilteringLevel=tier==='low'?2:8;
    t.gammaSpace=suffix==='albedo';t.update(false);
   }
  }catch(error){for(const t of tex)t.dispose();throw error;}
  return{type,repeat,resolution:size,albedo:tex[0],normal:tex[1],orm:tex[2],bytes:pairBytes(size)};
 }
 function pair(type,repeat){
  if(disposed)throw Error('Moonlight PBR bank disposed');
  if(!types.includes(type))throw new RangeError('Unknown PBR surface '+type);
  const key=type+':'+repeat;if(pairs.has(key))return pairs.get(key);
  const p=upload(type,repeat,sizeFor(type,quality,budgetFor(quality)-bytes),quality);
  pairs.set(key,p);bytes+=p.bytes;peak=max(peak,bytes);return p;
 }
 function prepare(mat){
  if(!mat||!('albedoColor' in mat))throw new TypeError('PBR surfaces require Babylon PBRMaterial');
  // Compatibility for world/mini-game code that still uses StandardMaterial names.
  if(!Object.prototype.hasOwnProperty.call(mat,'diffuseColor')){
   Object.defineProperty(mat,'diffuseColor',{configurable:true,get(){return this.albedoColor;},set(value){this.albedoColor=value;}});
   Object.defineProperty(mat,'diffuseTexture',{configurable:true,get(){return this.albedoTexture;},set(value){this.albedoTexture=value;}});
  }
  if(!mat.specularColor)mat.specularColor=new B.Color3(.12,.12,.12);
  return mat;
 }
 function bind(mat,p){
  mat.albedoTexture=p.albedo;mat.bumpTexture=p.normal;mat.metallicTexture=p.orm;
  mat.useRoughnessFromMetallicTextureAlpha=false;
  mat.useRoughnessFromMetallicTextureGreen=true;
  mat.useMetallnessFromMetallicTextureBlue=true;
  mat.useAmbientOcclusionFromMetallicTextureRed=true;
  mat.useAmbientInGrayScale=true;
  mat.ambientTextureStrength=.85;mat.metallic=1;mat.roughness=1;
  mat.forceIrradianceInFragment=true;
  mat.metadata={...mat.metadata,moonSurface:{type:p.type,repeat:p.repeat,resolution:p.resolution,channels:{albedo:'RGB',normal:'tangent-space',orm:'AO/Roughness/Metallic'}}};
 }
 function apply(mat,{type='stone',color=source.colors[type],repeat=1}={}){
  if(disposed)throw Error('Moonlight PBR bank disposed');
  prepare(mat);repeat=Number.isFinite(repeat)&&repeat>0?repeat:1;
  const p=pair(type,repeat);mat.albedoColor=B.Color3.FromHexString(color);bind(mat,p);
  bindings.set(mat,{type,repeat});return mat;
 }
 function material(type,color=source.colors[type],repeat=1){
  const key=[type,color,repeat].join(':');if(mats.has(key))return mats.get(key);
  const mat=new B.PBRMaterial('moon-pbr-'+key,scene);owned.add(mat);
  try{apply(mat,{type,color,repeat});}catch(e){mat.dispose();owned.delete(mat);throw e;}
  mats.set(key,mat);return mat;
 }
 function live(mat){return !(typeof mat.isDisposed==='function'&&mat.isDisposed())&&!mat._isDisposed&&(!scene.materials||scene.materials.includes(mat));}
 function setQuality(value){
  if(disposed)throw Error('Moonlight PBR bank disposed');
  let next=['low','balanced','high'].includes(value)?value:'balanced';if(rank[next]>rank[maxQuality])next=maxQuality;if(next===quality)return false;
  let remaining=budgetFor(next);const plan=[];
  for(const [key,p] of pairs){const size=sizeFor(p.type,next,remaining);remaining-=pairBytes(size);plan.push({key,p,size});}
  for(const [mat]of bindings)if(!live(mat))bindings.delete(mat);
  peak=bytes;
  for(const {key,p,size}of plan){
   if(size===p.resolution){for(const t of [p.albedo,p.normal,p.orm])t.anisotropicFilteringLevel=next==='low'?2:8;continue;}
   peak=max(peak,bytes+pairBytes(size));
   const fresh=upload(p.type,p.repeat,size,next);
   for(const [mat,b]of bindings)if(b.type===p.type&&b.repeat===p.repeat)bind(mat,fresh);
   pairs.set(key,fresh);bytes+=fresh.bytes-p.bytes;
   p.albedo.dispose();p.normal.dispose();p.orm.dispose();
  }
  quality=next;return true;
 }
 function dispose(){
  if(disposed)return;disposed=true;
  for(const m of owned)if(live(m))m.dispose(false,false);
  for(const p of pairs.values()){p.albedo.dispose();p.normal.dispose();p.orm.dispose();}
  pairs.clear();bindings.clear();mats.clear();owned.clear();bytes=0;
 }
 scene.onDisposeObservable?.addOnce?.(dispose);
 return{pbr:true,prepare,apply,material,quality:setQuality,dispose,get stats(){return{quality,pairs:pairs.size,textures:pairs.size*3,estimatedBytes:bytes,lastPeakBytes:peak,budgetMiB:budgetFor(quality)/1048576,surfaces:[...pairs.values()].map(p=>({type:p.type,repeat:p.repeat,resolution:p.resolution,orm:true})),disposed};}};
}
const api={generate,create};
root.MoonPBRMaterials=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
