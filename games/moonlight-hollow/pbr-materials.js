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
 const limit=Math.min(hardware,4096),fourKTypes=new Set(Array.isArray(opts.fourKTypes)?opts.fourKTypes:['wood','stone','roof','pumpkin']);
 let fourKEnabled=opts.enable4K===true&&limit>=4096;
 // Seven independent 2K PBR triplets require 448 MiB including mipmaps.
 // The world supplies a lower explicit budget for iOS devices.
 const budgetFor=q=>(Number.isFinite(opts.budgetMiB)?max(4,opts.budgetMiB):(q==='low'?48:q==='high'?640:128))*1048576;
 const pairs=new Map(),bindings=new Map(),owned=new Set(),mats=new Map();
 const pairBytes=size=>Math.ceil(size*size*4*3*4/3);
 function expected(type,tier){
  if(tier==='low')return 512;
  if(tier==='balanced')return 1024;
  return fourKEnabled&&fourKTypes.has(type)?4096:2048;
 }
 // Allocate across all live UV variants. Greedy per-material allocation can spend
 // the entire 128 MiB iOS bank on the first eight 1024px triplets.
 const priorities={stone:5,wood:5,pumpkin:5,roof:4,earth:3,plaster:2,cloth:2,metal:1};
 const reserveFor=tier=>fourKEnabled?Math.min(64*1048576,budgetFor(tier)/4):Math.min(16*1048576,budgetFor(tier)/16);
 function cappedSize(type,tier){
  let n=expected(type,tier);
  while(n>limit&&n>128)n/=2;
  return n;
 }
 function planSizes(tier,extra=null){
  const entries=[...pairs.entries()].map(([key,p])=>({key,type:p.type,repeat:p.repeat,size:cappedSize(p.type,tier)}));
  if(extra)entries.push({...extra,size:cappedSize(extra.type,tier)});
  const target=budgetFor(tier)-reserveFor(tier);
  let total=entries.reduce((sum,e)=>sum+pairBytes(e.size),0);
  // Prefer degrading secondary maps while retaining sharp near-camera materials.
  while(total>target){
   const candidates=entries.filter(e=>e.size>128).sort((a,b)=>
    (priorities[a.type]||0)-(priorities[b.type]||0) ||
    b.size-a.size || a.key.localeCompare(b.key));
   if(!candidates.length)throw new RangeError('Moonlight PBR memory budget exhausted');
   const victim=candidates[0],old=victim.size;
   victim.size=old/2;total-=pairBytes(old)-pairBytes(victim.size);
  }
  return entries;
 }
 function replacePair(key,old,size,tier){
  if(size===old.resolution){
   for(const t of [old.albedo,old.normal,old.orm])t.anisotropicFilteringLevel=tier==='low'?2:8;
   return;
  }
  // Keep the current textures valid if any new upload fails.
  const fresh=upload(old.type,old.repeat,size,tier);
  peak=max(peak,bytes+fresh.bytes);
  for(const [mat,b]of bindings)if(b.type===old.type&&b.repeat===old.repeat)bind(mat,fresh);
  pairs.set(key,fresh);bytes+=fresh.bytes-old.bytes;
  old.albedo.dispose();old.normal.dispose();old.orm.dispose();
 }
 function resizeExisting(plan,tier,upgrades){
  for(const e of plan){
   const p=pairs.get(e.key);
   if(p&&e.size<p.resolution)replacePair(e.key,p,e.size,tier);
  }
  if(!upgrades)return;
  for(const e of plan){
   const p=pairs.get(e.key);if(!p)continue;
   let size=e.size;
   // Peak GPU residency contains the old maps and the new maps until the swap.
   while(size>p.resolution&&bytes+pairBytes(size)>budgetFor(tier))size/=2;
   if(size<p.resolution)size=p.resolution;
   replacePair(e.key,p,size,tier);
  }
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
  const plan=planSizes(quality,{key,type,repeat});
  // Reclaim lower-priority maps before introducing another UV variant.
  resizeExisting(plan,quality,false);
  const n=plan.find(e=>e.key===key).size;
  const p=upload(type,repeat,n,quality);
  pairs.set(key,p);bytes+=p.bytes;peak=max(peak,bytes);
  return p;
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
  mat.albedoTexture=p.albedo;mat.bumpTexture=p.normal;mat.metallicTexture=p.orm;mat.ambientTexture=p.orm;
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
 function setQuality(value,force=false){
  if(disposed)throw Error('Moonlight PBR bank disposed');
  let next=['low','balanced','high'].includes(value)?value:'balanced';
  if(rank[next]>rank[maxQuality])next=maxQuality;
  if(next===quality&&!force)return false;
  const plan=planSizes(next);
  peak=bytes;
  resizeExisting(plan,next,true);
  quality=next;
  return true;
 }
 function set4KEnabled(enabled){
  if(disposed)throw Error('Moonlight PBR bank disposed');
  const next=enabled===true&&limit>=4096;
  if(next===fourKEnabled)return false;
  const previous=fourKEnabled;fourKEnabled=next;
  try{setQuality(quality,true);}catch(error){fourKEnabled=previous;throw error;}
  return true;
 }
 function previewResolution(type,tier='high'){
  if(!types.includes(type))throw new RangeError('Unknown PBR surface '+type);
  return planSizes(tier,{key:'preview:'+type,type,repeat:1}).find(e=>e.key==='preview:'+type).size;
 }
 function dispose(){
  if(disposed)return;disposed=true;
  for(const m of owned)if(live(m))m.dispose(false,false);
  for(const p of pairs.values()){p.albedo.dispose();p.normal.dispose();p.orm.dispose();}
  pairs.clear();bindings.clear();mats.clear();owned.clear();bytes=0;
 }
 scene.onDisposeObservable?.addOnce?.(dispose);
 return{pbr:true,prepare,apply,material,quality:setQuality,set4KEnabled,previewResolution,dispose,get stats(){return{quality,fourKEnabled,pairs:pairs.size,textures:pairs.size*3,estimatedBytes:bytes,lastPeakBytes:peak,budgetMiB:budgetFor(quality)/1048576,surfaces:[...pairs.values()].map(p=>({type:p.type,repeat:p.repeat,resolution:p.resolution,orm:true})),disposed};}};
}
const api={generate,create};
root.MoonPBRMaterials=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
