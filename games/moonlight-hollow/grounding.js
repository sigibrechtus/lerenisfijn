/* Terrain contact for rooted scenery. Buildings retain one level group; their
   foundation fills the slope below it. Small foot props settle into the soil. */
(function(root){'use strict';
const EPSILON=1e-8;
function finite(value,name){if(!Number.isFinite(value))throw new TypeError('Invalid terrain '+name);return value;}
function footprint(shape={},spacing=.75){
 spacing=finite(spacing,'sample spacing');if(spacing<=0)throw new RangeError('Terrain sample spacing must be positive');
 const x=finite(shape.x??0,'footprint x'),z=finite(shape.z??0,'footprint z'),perimeter=[],probes=[];
 if(shape.radius!==undefined){
  const r=finite(shape.radius,'footprint radius');if(r<=0)throw new RangeError('Terrain footprint radius must be positive');
  const count=Math.max(16,Math.ceil(Math.PI*2*r/spacing));for(let i=0;i<count;i++){const a=i/count*Math.PI*2;perimeter.push({x:x+Math.cos(a)*r,z:z+Math.sin(a)*r});}
  const countAcross=Math.max(2,Math.ceil(r*2/spacing));for(let ix=0;ix<=countAcross;ix++)for(let iz=0;iz<=countAcross;iz++){const dx=-r+ix/countAcross*r*2,dz=-r+iz/countAcross*r*2;if(dx*dx+dz*dz<=r*r+EPSILON)probes.push({x:x+dx,z:z+dz});}
 }else{
  const w=finite(shape.width??.2,'footprint width'),d=finite(shape.depth??w,'footprint depth');if(w<=0||d<=0)throw new RangeError('Terrain footprint dimensions must be positive');
  const nx=Math.max(1,Math.ceil(w/spacing)),nz=Math.max(1,Math.ceil(d/spacing));
  for(let i=0;i<nx;i++)perimeter.push({x:x-w/2+i/nx*w,z:z-d/2});
  for(let i=0;i<nz;i++)perimeter.push({x:x+w/2,z:z-d/2+i/nz*d});
  for(let i=0;i<nx;i++)perimeter.push({x:x+w/2-i/nx*w,z:z+d/2});
  for(let i=0;i<nz;i++)perimeter.push({x:x-w/2,z:z+d/2-i/nz*d});
  for(let ix=0;ix<=nx;ix++)for(let iz=0;iz<=nz;iz++)probes.push({x:x-w/2+ix/nx*w,z:z-d/2+iz/nz*d});
 }
 probes.push({x,z});return{center:{x,z},perimeter,probes};
}
function contact(height,pose,shape,spacing=.75){
 if(typeof height!=='function')throw new TypeError('Terrain height must be a function');
 const points=footprint(shape,spacing),x=finite(pose.x??0,'position x'),z=finite(pose.z??0,'position z'),yaw=finite(pose.yaw??0,'yaw'),sx=finite(pose.scaleX??1,'x scale'),sz=finite(pose.scaleZ??1,'z scale'),c=Math.cos(yaw),s=Math.sin(yaw);
 if(sx<=0||sz<=0)throw new RangeError('Terrain group scales must be positive');
 const sample=p=>{const px=p.x*sx,pz=p.z*sz,wx=x+px*c+pz*s,wz=z-px*s+pz*c;return{localX:p.x,localZ:p.z,x:wx,z:wz,height:finite(height(wx,wz),'height')};};
 const perimeter=points.perimeter.map(sample),probes=points.probes.map(sample),samples=[...perimeter,...probes],heights=samples.map(p=>p.height);
 return{center:sample(points.center),perimeter,probes,samples,min:Math.min(...heights),max:Math.max(...heights)};
}
function poseFor(node){
 if(node.parent)throw new Error('Terrain contact expects a root scenery group');
 const rotation=node.rotationQuaternion?.toEulerAngles()||node.rotation;if(Math.abs(rotation.x)>EPSILON||Math.abs(rotation.z)>EPSILON)throw new Error('Terrain group must remain upright; lean its children instead');
 return{x:node.position.x,z:node.position.z,yaw:rotation.y,scaleX:node.scaling.x,scaleZ:node.scaling.z};
}
function groundFoot(node,height,shape={radius:.1},options={}){
 const sampled=contact(height,poseFor(node),shape,options.spacing),bottom=finite(options.bottom??0,'foot bottom'),embed=finite(options.embed??.04,'foot embed');
 // Lowest footprint contact and a small burial avoid a visible gap on the
 // downhill side of a narrow trunk, stalk, pumpkin or grass clump.
 node.position.y=sampled.min-bottom*node.scaling.y-embed;
 node.metadata={...node.metadata,terrainContact:{mode:'foot',min:sampled.min,max:sampled.max,bottom,embed,level:node.position.y+bottom*node.scaling.y}};
 node.computeWorldMatrix(true);return sampled;
}
function supportGroup(B,scene,height,node,shape,options={}){
 const sampled=contact(height,poseFor(node),shape,options.spacing),base=finite(options.base??0,'foundation base'),clearance=finite(options.clearance??0,'foundation clearance'),embed=finite(options.embed??.18,'foundation embed'),sy=finite(node.scaling.y,'y scale');
 if(sy<=0||embed<0||clearance<0)throw new RangeError('Terrain foundation requires positive scale and nonnegative clearances');
 const level=sampled.max+clearance;node.position.y=level-base*sy;
 const mesh=new B.Mesh(options.name||node.name+'-foundation',scene),positions=[],indices=[],normals=[];
 const point=(sample,top)=>[sample.localX,top?base:base+(sample.height-level-embed)/sy,sample.localZ];
 const tri=(a,b,c)=>{const i=positions.length/3;positions.push(...a,...b,...c);indices.push(i,i+1,i+2);};
 const centerTop=point(sampled.center,true),centerBottom=point(sampled.center,false);
 for(let i=0;i<sampled.perimeter.length;i++){
  const current=sampled.perimeter[i],next=sampled.perimeter[(i+1)%sampled.perimeter.length],ct=point(current,true),nt=point(next,true),cb=point(current,false),nb=point(next,false);
  tri(centerTop,nt,ct);tri(centerBottom,cb,nb);tri(ct,nt,cb);tri(nt,nb,cb);
 }
 B.VertexData.ComputeNormals(positions,indices,normals);const data=new B.VertexData();data.positions=positions;data.indices=indices;data.normals=normals;data.applyToMesh(mesh);
 mesh.parent=node;mesh.material=options.material||null;mesh.isPickable=false;mesh.receiveShadows=true;
 mesh.metadata={terrainSupport:{mode:'foundation',top:level,embed,footprint:{...shape},samples:sampled.samples,perimeter:sampled.perimeter}};
 node.metadata={...node.metadata,terrainContact:{mode:'foundation',min:sampled.min,max:sampled.max,base,level,embed}};
 node.computeWorldMatrix(true);mesh.computeWorldMatrix(true);return{mesh,contact:sampled,level};
}
const api={footprint,contact,groundFoot,supportGroup};root.MoonGrounding=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
