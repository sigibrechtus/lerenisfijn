/* AI environment artwork combined with physical room trim. Open front preserves framing. */
(function(root){'use strict';
const banks=new WeakMap();
function decorate({B,scene,parent,originY=0,layer=0x10000000}){
 let bank=banks.get(scene);
 if(!bank){
  const wood=new B.StandardMaterial('interior-carved-wood',scene);wood.diffuseColor=B.Color3.FromHexString('#63432e');wood.specularColor=B.Color3.FromHexString('#41382f');wood.fogEnabled=false;
  const gold=new B.StandardMaterial('interior-brass',scene);gold.diffuseColor=B.Color3.FromHexString('#d4a85d');gold.specularColor=B.Color3.FromHexString('#b79b6a');gold.specularPower=64;gold.fogEnabled=false;
  const art=new B.StandardMaterial('interior-ai-panorama',scene);const texture=new B.Texture('assets/enchanted-interior.webp',scene,true,false,B.Texture.TRILINEAR_SAMPLINGMODE);texture.anisotropicFilteringLevel=8;art.diffuseTexture=texture;art.emissiveTexture=texture;art.emissiveColor=new B.Color3(.65,.65,.65);art.disableLighting=true;art.backFaceCulling=false;art.fogEnabled=false;
  bank={wood,gold,art,users:0};banks.set(scene,bank);
  bank.release=()=>{if(--bank.users>0)return;texture.dispose();for(const m of [wood,gold,art])m.dispose();banks.delete(scene);};
 }
 bank.users++;parent.onDisposeObservable.addOnce(bank.release);
 const meshes=[];
 function mesh(kind,name,options,x,y,z,mat){const m=B.MeshBuilder[kind]('interior-'+name,options,scene);m.parent=parent;m.position.set(x,originY+y,z);m.layerMask=layer;m.material=mat;m.isPickable=false;m.metadata={indoorScenery:true};meshes.push(m);return m;}
 // Environment planes are decorative views; their pixels are never used as playable objects.
 mesh('CreatePlane','room-view',{width:26,height:10},0,4.8,18,bank.art);
 for(const x of [-13,13]){const view=mesh('CreatePlane','side-view',{width:18,height:10},x,4.8,9,bank.art);view.rotation.y=x<0?Math.PI/2:-Math.PI/2;}
 for(const x of [-12.6,-8.5,8.5,12.6]){
  mesh('CreateCylinder','column',{height:9.8,diameter:.5,tessellation:48},x,4.7,17.7,bank.wood);
  for(const y of [.2,.4,8.7,9.1]){const ring=mesh('CreateTorus','carved-capital',{diameter:.7,thickness:.1,tessellation:64},x,y,17.7,bank.gold);ring.rotation.x=0;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;mesh('CreateCylinder','fluted-carving',{height:8.1,diameter:.045,tessellation:12},x+Math.cos(a)*.26,4.6,17.7+Math.sin(a)*.26,bank.gold);}
 }
 for(const y of [-.1,9.7])mesh('CreateBox','wall-moulding',{width:26,height:.2,depth:.3},0,y,17.65,bank.wood);
 // Two framed interior pictures beside the activity, outside its interaction corridor.
 for(const x of [-10,10]){
  mesh('CreateBox','picture-frame',{width:3.5,height:2.5,depth:.2},x,3.5,10,bank.gold);
  mesh('CreatePlane','interior-picture',{width:3.15,height:2.15},x,3.5,9.88,bank.art);
 }
 return meshes;
}
root.MoonInteriors={decorate};if(typeof module!=='undefined')module.exports={decorate};
})(typeof window!=='undefined'?window:globalThis);
