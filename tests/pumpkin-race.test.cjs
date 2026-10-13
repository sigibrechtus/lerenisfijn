const assert=require('node:assert/strict');
const R=require('../games/moonlight-hollow/pumpkin-race.js');
for(let index=0;index<10;index++)for(const lang of ['nl','fr']){
 const r=R.create({circuit:index,level:1+Math.floor(index/4),lang,seed:17}),track=r.track;
 assert.equal(track.index,index);assert(track.length>300);assert.equal(track.closed,index%2===0);assert(track.gates.length>=4);
 for(let gate=0;gate<track.gates.length;gate++){
  const s=r.snapshot(),correct=s.task.items.findIndex(i=>i.id===s.task.solution[0]),wrong=(correct+1)%3;
  assert.equal(new Set(s.task.items.map(i=>i.value)).size,3);
  r.place(track.gates[gate].s-.1,(wrong-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,gate/track.gates.length,'wrong lane stays closed');assert.equal(r.snapshot().speed,0);assert(r.snapshot().vehicle.s<track.gates[gate].s);
  r.place(track.gates[gate].s-.1,-3.5);r.tick(.05,0,1);assert.equal(r.snapshot().progress,gate/track.gates.length,'divider cannot bypass');
  r.place(track.gates[gate].s-.1,(correct-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,(gate+1)/track.gates.length);assert.equal(r.snapshot().completed,false,'must reach finish physically');
 }
 r.place(track.length-6.1);for(let i=0;i<20&&!r.snapshot().completed;i++)r.tick(.05,0,1);assert(r.snapshot().completed);assert(r.snapshot().result.accuracy<.8);
}
let p=R.progression({}, {accuracy:1,hints:0});assert.equal(p.circuit,0);p=R.progression(p,{accuracy:1,hints:0});assert.equal(p.circuit,1);assert.equal(R.progression(p,{accuracy:.7,hints:0}).circuit,1);assert.equal(R.progression({circuit:9,streak:3},{accuracy:1,hints:0}).circuit,9);assert.equal(R.progression({streak:1},{accuracy:1,hints:1}).circuit,0);
const r=R.create();r.tick(.05,0,-1);assert(r.snapshot().speed<0);r.stop();assert.equal(r.snapshot().speed,0);const gate=r.track.gates[0];r.place(gate.s-3,11.7);for(let i=0;i<30;i++)r.tick(.05,1,1);assert(R.project(r.track,r.snapshot().vehicle.x,r.snapshot().vehicle.z).distance<=10.81,'boundaries constrain car');r.action(r.snapshot().task.solution[0]);assert.equal(r.snapshot().progress,0,'answer actions cannot bypass driving');
console.log('20 circuit/language runs: gates, barriers, finish, reverse, boundaries and mastery passed.');
// Complete every circuit through steering/throttle only, without placing or submitting answers.
for(let circuit=0;circuit<10;circuit++){
 const race=R.create({circuit,seed:21,level:3});let ticks=0;
 while(!race.snapshot().completed&&ticks++<24000){const s=race.snapshot(),track=race.track,v=s.vehicle,gate=track.gates[s.passed.length],lane=gate?(s.task.items.findIndex(i=>i.id===s.task.solution[0])-1)*7:0,target=R.at(track,Math.min(track.length,v.s+8),lane),desired=Math.atan2(target.x-v.x,target.z-v.z),turn=Math.atan2(Math.sin(desired-v.heading),Math.cos(desired-v.heading));race.tick(.05,Math.max(-1,Math.min(1,turn*3)),1);}
 assert(race.snapshot().completed,`circuit ${circuit} traversable with physical controls`);assert.equal(race.snapshot().result.accuracy,1);
}
console.log('All ten circuits completed through steering and throttle only.');

const reverseStart=R.create();for(let i=0;i<600;i++)reverseStart.tick(.05,0,-1);assert.equal(reverseStart.snapshot().progress,0);assert(reverseStart.snapshot().vehicle.s<=3,'reverse cannot skip checkpoints across a loop seam');
