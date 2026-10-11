/* Original offline surface artwork. Rasterized at native resolution, with periodic
   multiscale relief and tangent-space normals; text labels are deliberately separate. */
(function(root){'use strict';
const TAU=Math.PI*2,types=['wood','stone','roof','metal','pumpkin','cloth','earth','plaster'];
const colors={wood:'#715640',stone:'#738793',roof:'#654b70',metal:'#c7a361',pumpkin:'#d97830',cloth:'#4caaaa',earth:'#416763',plaster:'#d5bd99'};
const strengths={wood:.65,stone:.8,roof:.8,metal:.6,pumpkin:.42,cloth:.4,earth:.6,plaster:.32};
function hash(x,y,seed){let n=Math.imul(x+seed,374761393)^Math.imul(y+seed,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function mod(n,p){return((n%p)+p)%p;}
function smooth(t){return t*t*(3-2*t);}
function octave(resolution,cells,seed){const period=resolution-1,indices=new Int32Array(resolution),weights=new Float32Array(resolution),grid=new Float32Array(cells*cells);for(let i=0;i<resolution;i++){const p=i/period*cells;indices[i]=Math.floor(p)%cells;weights[i]=smooth(p-Math.floor(p));}for(let y=0;y<cells;y++)for(let x=0;x<cells;x++)grid[y*cells+x]=hash(x,y,seed);return{cells,indices,weights,grid};}
function value(o,x,y){const ix=o.indices[x],iy=o.indices[y],fx=o.weights[x],fy=o.weights[y],a=iy*o.cells,b=((iy+1)%o.cells)*o.cells,j=(ix+1)%o.cells;return(o.grid[a+ix]*(1-fx)+o.grid[a+j]*fx)*(1-fy)+(o.grid[b+ix]*(1-fx)+o.grid[b+j]*fx)*fy;}
function resolutionFor(type,quality='balanced'){return quality==='low'?512:quality==='high'&&['wood','stone','roof'].includes(type)?2048:1024;}
function generate(type,resolution=1024){
 if(!types.includes(type))throw new RangeError('Unknown Moonlight surface: '+type);
 if(![128,256,512,1024,2048].includes(resolution))throw new RangeError('Surface resolution must be a supported power of two');
 const seed=types.indexOf(type)*977+31,period=resolution-1,coarse=octave(resolution,8,seed),medium=octave(resolution,32,seed+7),fine=octave(resolution,128,seed+19),height=new Float32Array(resolution*resolution),albedo=new Uint8ClampedArray(resolution*resolution*4),normal=new Uint8ClampedArray(albedo.length);
 const sinX=new Float32Array(resolution),sinY=new Float32Array(resolution);for(let i=0;i<resolution;i++){sinX[i]=Math.sin(TAU*i/period);sinY[i]=Math.sin(TAU*i/period);}
 for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
  const u=x===period?0:x/period,v=y===period?0:y/period,c=value(coarse,x,y),m=value(medium,x,y),f=value(fine,x,y),micro=hash(x%period,y%period,seed+97),grain=(micro-.5)*.035;
  let h=.45+c*.1+m*.075+f*.045+grain,shade=0;
  if(type==='wood'){
   // Fine growth rings bend around three original, repeating knots.
   let warp=sinY[y]*.9+sinX[x]*.15;for(const [kx,ky]of [[.25,.3],[.73,.72],[.46,.88]]){const dx=Math.min(Math.abs(u-kx),1-Math.abs(u-kx)),dy=Math.min(Math.abs(v-ky),1-Math.abs(v-ky)),r=Math.hypot(dx*2.7,dy);warp+=Math.exp(-r*r*140)*Math.cos(r*65)*.8;}
   const ring=(Math.sin(TAU*(u*42+warp))*.5+.5),streak=Math.pow(1-ring,8);h+=ring*.08-streak*.08;shade=-streak*.16+(f-.5)*.06;
  }else if(type==='stone'||type==='roof'){
   const rows=type==='roof'?12:8,row=Math.floor(v*rows),fy=mod(v*rows,1),fx=mod(u*(type==='roof'?8:4)+(row%2)*.5,1),edge=Math.min(fx,1-fx,fy,1-fy),joint=1-smooth(Math.min(1,edge/(type==='roof'?.07:.06))),block=hash(Math.floor(u*(type==='roof'?8:4)+(row%2)*.5)%(type==='roof'?8:4),row%rows,seed);
   h+=type==='roof'?fy*.14-joint*.22:block*.07-joint*.24;shade=-joint*.19+(block-.5)*.1+(f-.5)*.06;
  }else if(type==='metal'){h=.48+c*.035+(hash(0,y%period,seed)-.5)*.045+grain*.12;shade=(hash(0,y%period,seed)-.5)*.055+(m-.5)*.025;
  }else if(type==='pumpkin'){const rib=Math.cos(TAU*u*10);h+=rib*.17+Math.sin(TAU*v*3)*.015;shade=rib*.035+(f-.5)*.03;
  }else if(type==='cloth'){const a=Math.sin(TAU*u*128),b=Math.sin(TAU*v*128);h+=a*b*.035+(Math.abs(a)+Math.abs(b))*.012;shade=a*b*.025+(m-.5)*.045;
  }else if(type==='earth'){h+=(c-.5)*.1+Math.pow(f,5)*.06;shade=(c-.5)*.16+(m-.5)*.1+(micro-.5)*.07;
  }else{h+=(f-.5)*.02;shade=(m-.5)*.06+(f-.5)*.065;}
  const i=y*resolution+x,j=i*4; height[i]=h;const light=Math.max(145,Math.min(255,220+(h-.5)*38+shade*255));albedo[j]=light;albedo[j+1]=light;albedo[j+2]=light;albedo[j+3]=255;
 }
 // Duplicate endpoint texels and wrap derivatives over the unique periodic domain.
 // Normals are computed from relief, never from light or palette colour.
 const scale=resolution/256*strengths[type],sample=(x,y)=>height[mod(y,period)*resolution+mod(x,period)];
 for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){const dx=(sample(x-1,y)-sample(x+1,y))*scale,dy=(sample(x,y-1)-sample(x,y+1))*scale,length=Math.hypot(dx,dy,1),j=(y*resolution+x)*4;normal[j]=(dx/length*.5+.5)*255;normal[j+1]=(dy/length*.5+.5)*255;normal[j+2]=(1/length*.5+.5)*255;normal[j+3]=255;}
 return{type,resolution,albedo,normal,height};
}
function create(B,scene,options={}){
 let quality=['low','balanced','high'].includes(options.quality)?options.quality:'balanced';
 const customBudget=Number.isFinite(options.budgetMiB)?Math.max(1,options.budgetMiB):null,budgetFor=q=>customBudget??(q==='high'?192:q==='low'?32:96),deviceLimit=scene.getEngine?.().getCaps?.().maxTextureSize||2048,pairs=new Map(),materials=new Map(),bindings=new Map();
 let disposed=false,bytes=0,lastPeakBytes=0;
 const pairBytes=n=>Math.ceil(n*n*4*2*4/3); // Both RGBA maps, including the complete mip pyramid.
 function sizeFor(type,tier,remaining){let size=resolutionFor(type,tier);while(size>128&&size>deviceLimit)size/=2;while(size>128&&pairBytes(size)>remaining)size/=2;if(pairBytes(size)>remaining)throw new RangeError('Moonlight texture budget exhausted');return size;}
 function upload(type,repeat,size,tier){
  const pixels=generate(type,size),owned=[],key=type+':'+repeat;try{
   for(const [suffix,data]of [['albedo',pixels.albedo],['normal',pixels.normal]]){const tx=new B.DynamicTexture('moon-surface-'+key+'-'+suffix,{width:size,height:size},scene,true,B.Texture?.TRILINEAR_SAMPLINGMODE);owned.push(tx);const ctx=tx.getContext(),image=ctx.createImageData(size,size);image.data.set(data);ctx.putImageData(image,0,0);tx.wrapU=tx.wrapV=B.Texture?.WRAP_ADDRESSMODE??1;tx.uScale=tx.vScale=repeat;tx.anisotropicFilteringLevel=tier==='low'?2:8;tx.update(false);}
  }catch(error){for(const tx of owned)tx.dispose();throw error;}
  // Normal maps must bypass sRGB colour decoding in Babylon.
  owned[1].gammaSpace=false;owned[1].level=1;
  return{albedo:owned[0],normal:owned[1],resolution:size,type,repeat,bytes:pairBytes(size)};
 }
 function pair(type,repeat){
  if(disposed)throw Error('Moonlight material bank is disposed');if(!types.includes(type))throw new RangeError('Unknown Moonlight surface: '+type);
  const key=type+':'+repeat;if(pairs.has(key))return pairs.get(key);const size=sizeFor(type,quality,budgetFor(quality)*1048576-bytes),result=upload(type,repeat,size,quality);pairs.set(key,result);bytes+=result.bytes;lastPeakBytes=Math.max(lastPeakBytes,bytes);return result;
 }
 function bind(mat,p){mat.diffuseTexture=p.albedo;mat.bumpTexture=p.normal;mat.metadata={...mat.metadata,moonSurface:{type:p.type,resolution:p.resolution,repeat:p.repeat}};}
 function apply(mat,{type='stone',color=colors[type],repeat=1}={}){repeat=Number.isFinite(repeat)&&repeat>0?repeat:1;const p=pair(type,repeat);mat.diffuseColor=B.Color3.FromHexString(color);bind(mat,p);mat.specularColor=B.Color3.FromHexString(type==='metal'?'#9e8c70':'#242424');mat.specularPower=type==='metal'?72:type==='pumpkin'?32:16;bindings.set(mat,{type,repeat});return mat;}
 function material(type,color=colors[type],repeat=1){const key=type+':'+color+':'+repeat;if(materials.has(key))return materials.get(key);const m=new B.StandardMaterial('moon-material-'+key,scene);try{apply(m,{type,color,repeat});}catch(error){m.dispose();throw error;}materials.set(key,m);return m;}
 function live(mat){return !(typeof mat.isDisposed==='function'&&mat.isDisposed())&&!mat._isDisposed&&!mat.disposals&&!(typeof mat.getScene==='function'&&scene.materials&&!scene.materials.includes(mat));}
 function setQuality(value){
  if(disposed)throw Error('Moonlight material bank is disposed');const next=['low','balanced','high'].includes(value)?value:'balanced';if(next===quality)return false;
  // Preflight the whole target budget, then swap one successfully uploaded pair at
  // a time. GPU residency peaks at the current bank plus one replacement pair,
  // rather than retaining a second complete bank. A failed pair keeps its maps;
  // earlier swaps remain valid and a retry finishes the requested tier.
  const plan=[];let remaining=budgetFor(next)*1048576;for(const [key,p]of pairs){const size=sizeFor(p.type,next,remaining);remaining-=pairBytes(size);plan.push({key,p,size});}
  for(const [mat]of bindings)if(!live(mat))bindings.delete(mat);
  lastPeakBytes=bytes;
  for(const {key,p,size}of plan){
   if(p.resolution===size){p.albedo.anisotropicFilteringLevel=p.normal.anisotropicFilteringLevel=next==='low'?2:8;continue;}
   lastPeakBytes=Math.max(lastPeakBytes,bytes+pairBytes(size));const fresh=upload(p.type,p.repeat,size,next);
   for(const [mat,binding]of bindings)if(binding.type===p.type&&binding.repeat===p.repeat)bind(mat,fresh);
   pairs.set(key,fresh);bytes+=fresh.bytes-p.bytes;p.albedo.dispose();p.normal.dispose();
  }
  quality=next;return true;
 }
 function dispose(){if(disposed)return;disposed=true;for(const m of materials.values())if(live(m))m.dispose(false,false);for(const p of pairs.values()){p.albedo.dispose();p.normal.dispose();}materials.clear();pairs.clear();bindings.clear();bytes=0;}
 scene.onDisposeObservable?.addOnce?.(dispose);
 return{apply,material,quality:setQuality,dispose,get stats(){return{quality,budgetMiB:budgetFor(quality),estimatedBytes:bytes,lastPeakBytes,pairs:pairs.size,textures:pairs.size*2,materials:materials.size,disposed,surfaces:[...pairs.values()].map(p=>({type:p.type,repeat:p.repeat,resolution:p.resolution}))};}};
}
const api={types,colors,resolutionFor,generate,create};root.MoonMaterials=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
