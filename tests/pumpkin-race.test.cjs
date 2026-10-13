const assert=require('node:assert/strict');
const R=require('../games/moonlight-hollow/pumpkin-race.js');
for(let index=0;index<10;index++)for(const lang of ['nl','fr']){
 const r=R.create({circuit:index,level:1+Math.floor(index/4),lang,seed:17}),track=r.track;
 assert.equal(track.index,index);assert(track.length>300);assert.equal(track.closed,index%2===0);assert(track.gates.length>=4);
 const totalLaps=track.closed?3:1;for(let lap=0;lap<totalLaps;lap++){for(let gate=0;gate<track.gates.length;gate++){
  const s=r.snapshot(),correct=s.task.items.findIndex(i=>i.id===s.task.solution[0]),wrong=(correct+1)%3;
  assert.equal(new Set(s.task.items.map(i=>i.value)).size,3);
  r.place(track.gates[gate].s-.1,(wrong-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,(lap*track.gates.length+gate)/(track.gates.length*totalLaps),'wrong lane stays closed');assert.equal(r.snapshot().speed,0);assert.equal(r.snapshot().vehicle.s,track.gates[gate].s-10,'wrong gate returns exactly ten metres');assert.equal(r.snapshot().task,s.task,'same question remains for retry');assert.equal(r.snapshot().vehicle.heading,R.at(track,track.gates[gate].s-10).heading,'retry faces the gates');assert(!r.snapshot().choices.some(c=>c.id.startsWith('pick:')),'no answer buttons');
  r.place(track.gates[gate].s-.1,-3.5);r.tick(.05,0,1);assert.equal(r.snapshot().progress,(lap*track.gates.length+gate)/(track.gates.length*totalLaps),'divider cannot bypass');
  r.place(track.gates[gate].s-.1,(correct-1)*7);r.tick(.05,0,1);assert.equal(r.snapshot().progress,(lap*track.gates.length+gate+1)/(track.gates.length*totalLaps));assert(r.snapshot().speed>0,'correct gate preserves forward speed');assert.equal(r.snapshot().completed,false,'must reach finish physically');
 }
 r.place(track.length-6.1);for(let i=0;i<20&&r.snapshot().laps.completed===lap;i++)r.tick(.05,0,1);
 assert.equal(r.snapshot().laps.completed,lap+1);assert.equal(r.snapshot().completed,lap===totalLaps-1);
 }assert.equal(r.snapshot().result.lapTimes.length,totalLaps);assert.equal(r.snapshot().result.laps,totalLaps);assert(r.snapshot().result.accuracy<.8);
}
let p=R.progression({}, {accuracy:1,hints:0});assert.equal(p.circuit,0);p=R.progression(p,{accuracy:1,hints:0});assert.equal(p.circuit,1);assert.equal(R.progression(p,{accuracy:.7,hints:0}).circuit,1);assert.equal(R.progression({circuit:9,streak:3},{accuracy:1,hints:0}).circuit,9);assert.equal(R.progression({streak:1},{accuracy:1,hints:1}).circuit,0);
const r=R.create();r.tick(.05,0,-1);assert(r.snapshot().speed<0);r.stop();assert.equal(r.snapshot().speed,0);const gate=r.track.gates[0];r.place(gate.s-3,11.7);for(let i=0;i<30;i++)r.tick(.05,1,1);assert(R.project(r.track,r.snapshot().vehicle.x,r.snapshot().vehicle.z).distance<=10.81,'boundaries constrain car');r.action(r.snapshot().task.solution[0]);assert.equal(r.snapshot().progress,0,'answer actions cannot bypass driving');
console.log('20 circuit/language runs: gates, barriers, finish, reverse, boundaries and mastery passed.');
// Complete every circuit through steering/throttle only, without placing or submitting answers.
for(let circuit=0;circuit<10;circuit++){
 const race=R.create({circuit,seed:21,level:3});let ticks=0;
 while(!race.snapshot().completed&&ticks++<24000){const s=race.snapshot(),track=race.track,v=s.vehicle,gate=s.awaitingFinish?null:track.gates[s.checkpoint-1],lane=gate?(s.task.items.findIndex(i=>i.id===s.task.solution[0])-1)*7:0,target=R.at(track,Math.min(track.length,v.s+8),lane),desired=Math.atan2(target.x-v.x,target.z-v.z),turn=Math.atan2(Math.sin(desired-v.heading),Math.cos(desired-v.heading));race.tick(.05,Math.max(-1,Math.min(1,turn*3)),1);}
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
let previousLength=0;for(let i=0;i<10;i++){const track=R.circuit(i);assert(track.length>previousLength+100,'each unlocked track is longer');assert(Math.abs(track.length-(460+i*105))<2,'length stays near authored progression');previousLength=track.length;}console.log('All ten tracks increase consistently in length.');

// Per-circuit, per-level rankings use completed race times and do not mix different laps.
const timed=R.create({circuit:0,level:2,bestSeconds:120});timed.tick(.05,0,0);
assert.equal(timed.snapshot().laps.total,3);assert.equal(timed.snapshot().timing.personalBest,120);
assert.equal(timed.snapshot().timing.elapsed,.05);
const open=R.create({circuit:1});assert.equal(open.snapshot().laps.total,1);
const key=R.recordKey(0,2,3);const players=[{id:'a',name:'Alice',attractions:{rally:{records:{[key]:{seconds:96}}}}},{id:'b',name:'Bob',attractions:{rally:{records:{[key]:{seconds:82}}}}},{id:'c',name:'C',attractions:{rally:{records:{'1:2:1':{seconds:50}}}}}];
assert.deepEqual(R.standings(players,0,2,3).map(x=>x.id),['b','a']);assert.equal(R.standings(players,0,3,3).length,0);

// Fresh seeds and extended race history prevent repeating first-attempt questions on a replay.
const V=require('../games/moonlight-hollow/variety.js');
const earlier=R.create({circuit:2,level:2,seed:100003}),first=V.signature(earlier.snapshot().task);
const newer=R.create({circuit:2,level:2,seed:100004,recent:[first]});
assert.notEqual(V.signature(newer.snapshot().task),first);
const themed=R.circuit(2);assert(themed.length>400);
console.log('Replay question regeneration and Halloween finish circuit checks passed.');
