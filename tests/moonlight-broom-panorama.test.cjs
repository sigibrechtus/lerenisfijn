'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../games/moonlight-hollow');
const Atmosphere=require(path.join(root,'broom-atmosphere.js'));

test('mobile, balanced and HD panoramas cover a complete 360-degree horizon',()=>{
 for(const count of [8,10,12]){
  const ring=Atmosphere.panoramaLayout(count,96);
  assert.equal(ring.length,count);
  assert(ring.some(p=>p.x>80)&&ring.some(p=>p.x< -80),'left and right horizons are represented');
  assert(ring.some(p=>p.z>80)&&ring.some(p=>p.z< -80),'front and rear horizons are represented');
  assert(ring.some(p=>p.kind==='castle')&&ring.some(p=>p.kind==='forest'));
  const chord=2*96*Math.sin(Math.PI/count);
  for(const panel of ring){
   assert(Math.abs(Math.hypot(panel.x,panel.z)-96)<1e-8,'panorama stays at camera-safe radius');
   assert(panel.width>chord*1.3,'neighbouring panels overlap and mask fading edges');
   assert(panel.width<chord*1.5,'panoramas are not oversized transparent surfaces');
  }
 }
});

test('sky, scenery belt and static landmarks remain independent of flight and camera turns',()=>{
 const src=fs.readFileSync(path.join(root,'broom-atmosphere.js'),'utf8');
 assert(src.includes('if(sky&&viewer)sky.position.copyFrom(viewer)'),'sky follows camera in 3D');
 assert(src.includes('item.mesh.position.x=viewer.x+RING_RADIUS*Math.cos(item.angle)'),'horizon follows flight horizontally');
 assert(src.includes('item.mesh.position.z=viewer.z+RING_RADIUS*Math.sin(item.angle)'));
 assert(!/item\.mesh\.position\.y=viewer\.y/.test(src),'horizon must stay grounded during altitude changes');
 assert(src.includes('panel.billboardMode=B.Mesh.BILLBOARDMODE_Y'),'sky-facing panels remain upright on head turns');
 assert(src.includes('new B.Texture(url,scene,false,alpha,'),'alpha panorama textures preserve corrected invertY setting');
 assert(src.includes('const SKY_DIAMETER=300')&&src.includes('const RING_RADIUS=96'));
});
