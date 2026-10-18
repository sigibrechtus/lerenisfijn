const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../games/moonlight-hollow/railway.js');
const L=require('../games/moonlight-hollow/landscape.js');
const D=require('../games/moonlight-hollow/destinations.js');
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} ≈ ${b}`);
const count=R.stations.length;
test('one continuous rail loop serves the village and every minigame gate',()=>{
 assert.equal(count,6+Object.keys(D.sites).length);
 assert.equal(R.stations[0].id,'centre');assert.equal(R.stations[1].id,'clock');
 assert.equal(new Set(R.stations.map(s=>s.id)).size,count);
 assert(R.track.length>500);
 const first=R.track.samples[0],last=R.track.samples.at(-1);near(first.x,last.x);near(first.z,last.z);
 for(const [i,s] of R.stations.entries()){
  const p=R.track.pose(s.distance),platform=R.platform(i);
  near(p.x,s.x);near(p.z,s.z);
  const entrance=s.gate||(s.id==='centre'?{x:0,z:0}:L.sites[s.id]);
  assert(entrance,'station has an entrance');
  assert(Math.hypot(platform.x-entrance.x,platform.z-entrance.z)<16,'platform close to entrance: '+s.id);
  assert(L.validPosition(s),'station inside world: '+s.id);
  assert(R.track.samples.some(q=>Math.hypot(q.x-s.x,q.z-s.z)<1e-7),'station on rail: '+s.id);
 }
 for(const [id,site] of Object.entries(D.sites)){
  const s=R.stations.find(st=>st.attraction===id);
  assert(s,'attraction has a station: '+id);
  near(s.gate.x,site.entry.x);near(s.gate.z,site.entry.z);
  assert(Math.hypot(s.x-site.entry.x,s.z-site.entry.z)>=7,'tracks clear gate: '+id);
 }
 let turn=0;for(let d=0;d<R.track.length;d+=.5){const a=R.track.pose(d),b=R.track.pose(d+.5);assert(Math.hypot(a.x-b.x,a.z-b.z)<.51);turn=Math.max(turn,Math.abs(Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading))));}
 assert(turn<.2,'bounded carriage turning on curves');
});
test('passenger rides accelerate brake and park for all station pairs',()=>{
 for(let from=0;from<count;from++)for(let to=0;to<count;to++){
  if(from===to)continue;const r=R.create();assert(r.park(from));assert(r.begin(to));assert.equal(r.begin(to),false);
  r.tick(1.2);assert.equal(r.snapshot().phase,'travel');assert.equal(r.snapshot().speed,0);
  const duration=r.snapshot().duration;
  r.tick(duration/4);const early=r.snapshot();r.tick(duration/4);const middle=r.snapshot();
  assert(early.speed<middle.speed);assert(middle.speed<=10);
  r.tick(duration/4);assert(r.snapshot().speed<middle.speed);
  r.tick(duration/4);assert.equal(r.snapshot().phase,'arrival');assert.equal(r.snapshot().speed,0);
  near(r.snapshot().x,R.stations[to].x);near(r.snapshot().z,R.stations[to].z);
  r.tick(1);assert.equal(r.snapshot().active,false);assert.equal(r.snapshot().station,to);
  assert.deepEqual(r.tick(99),r.snapshot());
 }
});
test('empty train calls select the shortest track direction for each station',()=>{
 for(let target=1;target<count;target++){
  const r=R.create();assert.equal(r.call(0),false);assert(r.call(target));
  assert.equal(r.snapshot().summoned,true);assert.equal(r.snapshot().phase,'travel');
  assert.equal(r.call(0),false);assert.equal(r.begin(),false);
  r.tick(r.snapshot().duration/2);assert(r.snapshot().travelled<=R.track.length/4+.01);
  r.tick(1000);assert.equal(r.snapshot().station,target);
  assert.equal(r.snapshot().speed,0);assert.equal(r.snapshot().summoned,false);
  assert(r.call(0));r.tick(1000);assert.equal(r.snapshot().station,0);
 }
});
test('railway motion is frame independent and station indices are validated',()=>{
 const a=R.create(),b=R.create();a.begin(3);b.begin(3);a.tick(7.2);
 for(let i=0;i<432;i++)b.tick(1/60);
 near(a.snapshot().x,b.snapshot().x);near(a.snapshot().z,b.snapshot().z);near(a.snapshot().heading,b.snapshot().heading);
 const before=b.snapshot();for(const dt of [NaN,Infinity,-1,0])assert.deepEqual(b.tick(dt),before);
 assert.equal(b.park(0),false);b.finish();
 for(const x of [count,-1,1.2]){assert.equal(b.park(x),false);assert.equal(b.begin(x),false);}
 assert(b.park(1));assert.equal(b.snapshot().station,1);
 assert(b.park(count-1));assert.equal(b.snapshot().station,count-1);
});
test('terrain is level under the whole loop and boarding platforms',()=>{
 const h=L.makeHeight(R.track.samples);
 for(const p of R.track.samples){assert.equal(h(p.x,p.z),0);assert.equal(h(p.x+Math.cos(p.heading)*4,p.z-Math.sin(p.heading)*4),0);}
 for(let i=0;i<count;i++){const p=R.platform(i);assert.equal(h(p.x,p.z),0);}
});
