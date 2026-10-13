const assert=require('node:assert/strict');
const R=require('../games/moonlight-hollow/pumpkin-race.js');
for(let index=0;index<10;index++)for(const lang of ['nl','fr']){
 const r=R.create({circuit:index,level:1+Math.floor(index/4),lang,seed:17}),track=r.track;
 assert.equal(track.index,index);assert(track.length>300);assert.equal(track.closed,index%2===0);assert(track.gates.length>=4);
 for(let gate=0;gate<track.gates.length;gate++){
  const s=r.snapshot(),correct=s.task.items.findIndex(i=>i.id===s.task.solution[0]),wrong=(correct+1)%3;
  assert.equal(new Set(s.task.items.map(i=>i.value)).size,3);
  r.place(track.gates[gate].s-.1,(wrong-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,gate/track.gates.length,'wrong lane stays closed');assert.equal(r.snapshot().speed,0);assert.equal(r.snapshot().vehicle.s,track.gates[gate].s-10,'wrong gate returns exactly ten metres');assert.equal(r.snapshot().task,s.task,'same question remains for retry');assert.equal(r.snapshot().vehicle.heading,R.at(track,track.gates[gate].s-10).heading,'retry faces the gates');assert(!r.snapshot().choices.some(c=>c.id.startsWith('pick:')),'no answer buttons');
  r.place(track.gates[gate].s-.1,-3.5);r.tick(.05,0,1);assert.equal(r.snapshot().progress,gate/track.gates.length,'divider cannot bypass');
  r.place(track.gates[gate].s-.1,(correct-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,(gate+1)/track.gates.length);assert(r.snapshot().speed>0,'correct gate preserves forward speed');assert.equal(r.snapshot().completed,false,'must reach finish physically');
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

// Comparison gates contain both numbers, with a distinct distractor that cannot change the comparison.
const G=require('../games/moonlight-hollow/mini-games.js');let largest=0,smallest=0;
for(const lang of ['nl','fr'])for(const level of [1,2])for(let seed=1;seed<501;seed++){const q=G.make('rally',level,lang,seed);if(!q.comparison)continue;const [a,b]=q.operands,values=q.items.map(i=>i.value);assert.notEqual(a,b);assert(values.includes(a)&&values.includes(b));assert.equal(new Set(values).size,3);const expected=q.comparison==='largest'?Math.max(a,b):Math.min(a,b);assert.equal(q.items.find(i=>i.id===q.solution[0]).value,expected);assert.equal(q.comparison==='largest'?Math.max(...values):Math.min(...values),expected);q.comparison==='largest'?largest++:smallest++;}assert(largest&&smallest);
for(let index=0;index<10;index++){const track=R.circuit(index),ys=track.points.map(p=>p.y);assert(Math.max(...ys)-Math.min(...ys)>1,'each circuit changes elevation');assert.equal(ys[0],0);assert(Math.abs(ys.at(-1))<1e-8);for(const p of track.points.slice(1,-1))assert(Math.abs(R.at(track,p.s).grade)<.15,'driveable hill gradients');}
const fastResult={accuracy:1,hints:0,decisionSamples:4,meanDecisionSeconds:3};let skill=R.progression({},fastResult);assert.equal(skill.speedTier,0);skill=R.progression(skill,fastResult);assert.equal(skill.speedTier,1);assert.equal(R.progression(skill,{...fastResult,accuracy:.5,proposedSpeedTier:6}).speedTier,1);assert.equal(R.progression(skill,{...fastResult,hints:1}).speedTier,1);assert.equal(R.progression(skill,{...fastResult,meanDecisionSeconds:15}).speedTier,1);const ceiling=R.create({speedTier:6});for(let i=0;i<15;i++)ceiling.action('faster');assert.equal(ceiling.snapshot().speedCeiling,17);assert.equal(ceiling.snapshot().speedLimit,17);ceiling.action('slower');assert.equal(ceiling.snapshot().speedLimit,15);ceiling.action('faster');assert.equal(ceiling.snapshot().speedLimit,17);
console.log('Both comparison operands, ten smooth elevation profiles and accuracy/pace-based speed tiers pass.');
