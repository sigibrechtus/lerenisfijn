/* Real Babylon geometry/ownership checks; not a browser GPU rendering test. */
const assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js'),I=require('../games/moonlight-hollow/interiors.js');
const engine=new B.NullEngine(),scene=new B.Scene(engine),baseline={materials:scene.materials.length,textures:scene.textures.length};
const parent=new B.TransformNode('test-room',scene),parts=I.decorate({B,scene,parent,originY:120,floorY:.004,layer:0x20000000});
assert(parts.every(m=>m.parent===parent&&!m.isPickable&&m.layerMask===0x20000000));
const floor=parts.find(m=>m.metadata.interiorPart==='floor'),dome=parts.find(m=>m.metadata.interiorPart==='dome');
floor.computeWorldMatrix(true);assert(Math.abs(floor.getBoundingInfo().boundingBox.minimumWorld.y-120.004)<1e-4);
assert.equal(floor.material.diffuseTexture.wrapU,B.Texture.MIRROR_ADDRESSMODE);assert.equal(floor.material.diffuseTexture.uScale,10);
assert.match(floor.material.diffuseTexture.url,/interior-floor-v30/);assert.match(dome.material.diffuseTexture.url,/interior-dome-v30/);
const p=dome.getVerticesData('position'),uv=dome.getVerticesData('uv'),ind=dome.getIndices();assert(p.every(Number.isFinite));assert(uv.every(v=>v>=0&&v<=1));
for(let i=0;i<p.length;i+=3){assert(p[i+1]>=120.004-1e-4&&p[i+2]>=-6-1e-4);const ellipsoid=(p[i]/28)**2+((p[i+1]-120.004)/18)**2+((p[i+2]+6)/28)**2;assert(Math.abs(ellipsoid-1)<1e-4);}
for(let i=0;i<ind.length;i+=3){const a=B.Vector3.FromArray(p,ind[i]*3),b=B.Vector3.FromArray(p,ind[i+1]*3),c=B.Vector3.FromArray(p,ind[i+2]*3);assert(B.Vector3.Cross(b.subtract(a),c.subtract(a)).length()>1e-6,'No degenerate dome triangles');}
const pumpkins=parts.filter(m=>m.name==='interior-ribbed-pumpkin');assert.equal(pumpkins.length,4);
for(const m of pumpkins){m.computeWorldMatrix(true);const box=m.getBoundingInfo().boundingBox;assert(Math.abs(box.minimumWorld.y-120.004)<1e-4,'Pumpkin rests on the floor');assert(Math.abs(m.position.x)>10,'Keep interaction corridor clear');assert(m.getVerticesData('normal').every(Number.isFinite));}
const materials=scene.materials.length,textures=scene.textures.length,topParent=new B.TransformNode('top-room',scene),top=I.decorate({B,scene,parent:topParent,topView:true});
assert.equal(top.length,1);assert.equal(top[0].metadata.interiorPart,'floor');assert.equal(scene.materials.length,materials);assert.equal(scene.textures.length,textures);
parent.dispose();assert.equal(scene.materials.length,materials,'Shared assets survive another room');topParent.dispose();
assert.equal(scene.meshes.length,0);assert.equal(scene.materials.length,baseline.materials);assert.equal(scene.textures.length,baseline.textures);
scene.dispose();engine.dispose();console.log('Quarter dome geometry, grounded props, floor-only top view and shared resource disposal pass.');
