const test=require('node:test'),assert=require('node:assert/strict'),R=require('../games/moonlight-hollow/railway.js');
test('railway boards, accelerates, brakes and remains at each station in both directions',()=>{
 const r=R.create();assert.equal(r.snapshot().z,0);assert(r.begin());assert.equal(r.begin(),false);
 r.tick(1.2);assert.equal(r.snapshot().phase,'travel');assert.equal(r.snapshot().speed,0);
 r.tick(3);const early=r.snapshot();r.tick(3);const middle=r.snapshot();assert(early.speed<middle.speed);assert(Math.abs(middle.z-14)<1e-6);
 r.tick(3);assert(r.snapshot().speed<middle.speed);r.tick(3);assert.equal(r.snapshot().z,28);assert.equal(r.snapshot().speed,0);assert.equal(r.snapshot().phase,'arrival');
 r.tick(1);assert.equal(r.snapshot().active,false);r.tick(99);assert.equal(r.snapshot().z,28);
 assert(r.begin());assert.equal(r.snapshot().direction,-1);r.tick(14.2);assert.equal(r.snapshot().z,0);assert.equal(r.snapshot().active,false);
});
test('rail travel is frame-rate independent and handles invalid time without moving',()=>{
 const a=R.create(),b=R.create();a.begin();b.begin();a.tick(7.2);for(let i=0;i<432;i++)b.tick(1/60);assert(Math.abs(a.snapshot().z-b.snapshot().z)<1e-8);
 const before=b.snapshot();for(const dt of [NaN,Infinity,-1,0])assert.deepEqual(b.tick(dt),before);
 const finished=b.finish();assert.equal(finished.phase,'idle');assert.equal(finished.speed,0);assert.equal(finished.z,28);
});

test('saved station can be restored only when parked',()=>{const r=R.create();assert(r.park(1));assert.equal(r.snapshot().z,28);assert.equal(r.snapshot().target,0);assert(r.begin());assert.equal(r.park(0),false);r.finish();assert.equal(r.park(3),false);});
