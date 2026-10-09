const test=require('node:test'),assert=require('node:assert/strict'),F=require('../games/moonlight-hollow/camera.js');
test('fast follow catches 95% of a position change within 125ms at any frame rate',()=>{
  for(const fps of [30,60,120]){let error=1;for(let i=0;i<Math.ceil(fps*.125);i++)error*=1-F.followWeight(1/fps);assert(error<=.05);}
  assert.equal(F.followWeight(0),0);assert.equal(F.followWeight(-1),0);
});
test('activity viewport excludes header and controls on desktop, portrait and landscape phones',()=>{
  for(const [w,h,top,bottom]of [[1920,1080,65,820],[390,844,52,520],[844,390,44,210],[320,568,52,320]]){const r=F.safeFrame(w,h,top,bottom);assert(r.x>=0&&r.y>=0&&r.x+r.width<=1&&r.y+r.height<=1);assert((1-r.y-r.height)*h>=top);assert((1-r.y)*h<bottom);assert(r.width*w>=w*.9);}
});
test('perspective fit contains all corners of wide, tall and deep activities with margin',()=>{
  for(const aspect of [.35,.7,1,1.78,3,5])for(const width of [2,7,14,22])for(const depth of [2,6,10]){
    const bounds={min:{x:20-width/2,y:.1,z:-depth/2},max:{x:20+width/2,y:3,z:depth/2}},p=F.fit(bounds,aspect);
    const s=Math.sin(p.beta),c=Math.cos(p.beta),tanV=Math.tan(.4),tanH=tanV*aspect;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const dx=x-p.target.x,dy=y-p.target.y,dz=z-p.target.z,distance=p.radius-(dy*c-dz*s);assert(distance>.2);assert(Math.abs(dx)/(distance*tanH)<.9);assert(Math.abs(dy*s+dz*c)/(distance*tanV)<.9);}
  }
});
test('camera transitions take the short rotation and ease without overshooting',()=>{assert(Math.abs(F.angleDelta(Math.PI-.1,-Math.PI+.1)-.2)<1e-9);assert.equal(F.ease(-1),0);assert.equal(F.ease(2),1);let last=0;for(let i=0;i<=100;i++){const value=F.ease(i/100);assert(value>=last&&value<=1);last=value;}});
