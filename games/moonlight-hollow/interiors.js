/* Open-front quarter dome. Walls/ceiling and planar floor use separate AI assets. */
(function(root){'use strict';
const banks=new WeakMap();
function decorate({B,scene,parent,originY=0,layer=0x10000000,topView=false,floorY=.134}){
 let bank=banks.get(scene);
 if(!bank){
  const wood=new B.StandardMaterial('interior-carved-wood',scene);wood.diffuseColor=B.Color3.FromHexString('#63432e');wood.fogEnabled=false;
  const brass=new B.StandardMaterial('interior-brass',scene);brass.diffuseColor=B.Color3.FromHexString('#d4a85d');brass.specularPower=64;brass.fogEnabled=false;
  const pumpkin=new B.StandardMaterial('interior-pumpkin',scene);pumpkin.diffuseColor=B.Color3.FromHexString('#d88739');pumpkin.emissiveColor=new B.Color3(.08,.025,.005);pumpkin.fogEnabled=false;
  const glow=new B.StandardMaterial('interior-lantern-glow',scene);glow.diffuseColor=B.Color3.FromHexString('#ffe1a0');glow.emissiveColor=glow.diffuseColor;glow.fogEnabled=false;
  function artwork(name,file){const m=new B.StandardMaterial(name,scene),t=new B.Texture(file,scene,false,true,B.Texture.TRILINEAR_SAMPLINGMODE);t.anisotropicFilteringLevel=8;m.diffuseTexture=t;m.emissiveTexture=t;m.emissiveColor=B.Color3.White();m.disableLighting=true;m.backFaceCulling=false;m.fogEnabled=false;return m;}
  bank={wood,brass,pumpkin,glow,floor:artwork('interior-stone-floor','assets/interior-floor-v30.webp'),dome:artwork('interior-half-dome-art','assets/interior-dome-v30.webp'),users:0};banks.set(scene,bank);
  bank.floor.diffuseTexture.uScale=10;bank.floor.diffuseTexture.vScale=10;
  bank.floor.diffuseTexture.wrapU=B.Texture.MIRROR_ADDRESSMODE;bank.floor.diffuseTexture.wrapV=B.Texture.MIRROR_ADDRESSMODE;
  bank.release=()=>{if(--bank.users>0)return;for(const key of ['floor','dome'])bank[key].diffuseTexture.dispose();for(const key of ['wood','brass','pumpkin','glow','floor','dome'])bank[key].dispose();banks.delete(scene);};
 }
 bank.users++;parent.onDisposeObservable.addOnce(bank.release);
 const meshes=[];
 function adopt(m,mat,kind){m.parent=parent;m.layerMask=layer;m.material=mat;m.isPickable=false;m.metadata={indoorScenery:true,interiorPart:kind};meshes.push(m);return m;}
 function mesh(kind,name,opts,x,y,z,mat,part='prop'){const m=adopt(B.MeshBuilder[kind]('interior-'+name,opts,scene),mat,part);m.position.set(x,originY+y,z);return m;}
 // Flat floor extends through the open entrance, above the support plinth but
 // below the lowest activity surface. It never participates in camera fitting.
 mesh('CreateGround','floor',{width:80,height:80,subdivisions:1},0,floorY,2,bank.floor,'floor');
 // Top view gets floor only: no ceiling, walls, pictures or decorative props.
 if(topView)return meshes;
 const radius=28,height=18,centerZ=-6,columns=96,rows=32,positions=[],uvs=[],indices=[];
 for(let j=0;j<rows;j++){const elevation=j/rows*Math.PI/2;for(let i=0;i<=columns;i++){const azimuth=(i/columns-.5)*Math.PI;positions.push(radius*Math.sin(azimuth)*Math.cos(elevation),originY+floorY+height*Math.sin(elevation),centerZ+radius*Math.cos(azimuth)*Math.cos(elevation));uvs.push(i/columns,j/rows);}}
 for(let j=0;j<rows-1;j++)for(let i=0;i<columns;i++){const a=j*(columns+1)+i,b=a+1,c=a+columns+1,d=c+1;indices.push(a,c,b,b,c,d);}
 // A shared zenith vertex avoids a ring of zero-area pole triangles.
 const pole=positions.length/3;positions.push(0,originY+floorY+height,centerZ);uvs.push(.5,1);
 for(let i=0;i<columns;i++){const a=(rows-1)*(columns+1)+i;indices.push(a,pole,a+1);}
 const shell=adopt(new B.Mesh('interior-quarter-dome',scene),bank.dome,'dome'),data=new B.VertexData();data.positions=positions;data.indices=indices;data.uvs=uvs;data.normals=[];B.VertexData.ComputeNormals(positions,indices,data.normals);data.applyToMesh(shell);shell.metadata.projection={azimuthDegrees:180,elevationDegrees:90,radius,height,centerZ};
 // True 3D decorations with grounded bases, outside the interaction corridor.
 for(const [x,z,size]of [[-15,7,1.4],[15,7,1.4],[-19,2,1.1],[19,2,1.1]]){
  const body=mesh('CreateSphere','ribbed-pumpkin',{diameter:1,segments:32},x,floorY+size*.36,z,bank.pumpkin);
  const p=body.getVerticesData(B.VertexBuffer.PositionKind);for(let i=0;i<p.length;i+=3){const a=Math.atan2(p[i+2],p[i]),rib=1+.1*Math.cos(8*a)*Math.max(0,1-4*p[i+1]*p[i+1]);p[i]*=rib;p[i+2]*=rib;}body.setVerticesData(B.VertexBuffer.PositionKind,p);const normals=[];B.VertexData.ComputeNormals(p,body.getIndices(),normals);body.setVerticesData(B.VertexBuffer.NormalKind,normals);body.scaling.set(size,size*.72,size);body.refreshBoundingInfo();
  const stem=mesh('CreateCylinder','pumpkin-stem',{height:size*.2,diameter:size*.12,tessellation:24},x,floorY+size*.8,z,bank.wood);stem.rotation.z=x<0?.2:-.2;
 }
 for(const x of [-11,11]){
  mesh('CreateBox','lantern-pedestal',{width:1,height:1.4,depth:1},x,floorY+.7,9,bank.wood);
  for(const y of [1.46,2.2])mesh('CreateBox','lantern-cap',{width:.82,height:.1,depth:.82},x,floorY+y,9,bank.brass);
  for(const dx of [-.34,.34])for(const dz of [-.34,.34])mesh('CreateCylinder','lantern-frame',{height:.74,diameter:.055,tessellation:12},x+dx,floorY+1.83,9+dz,bank.brass);
  mesh('CreateSphere','lantern-light',{diameter:.48,segments:24},x,floorY+1.83,9,bank.glow);
 }
 root.MoonAssetLibrary?.enhanceInterior(scene,parent);
 return meshes;
}
root.MoonInteriors={decorate};if(typeof module!=='undefined')module.exports={decorate};
})(typeof window!=='undefined'?window:globalThis);
