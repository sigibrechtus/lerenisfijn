const test=require('node:test'),assert=require('node:assert/strict'),E=require('../games/moonlight-hollow/engine.js'),C=require('../games/moonlight-hollow/campaign.js');
test('every mirror direction obeys the reflection law and stays on the incident side',()=>{
 for(const orientation of [0,1])for(const incoming of [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}]){
  const outgoing=E.reflect(incoming,orientation),t=orientation===0?{x:Math.SQRT1_2,y:-Math.SQRT1_2}:{x:Math.SQRT1_2,y:Math.SQRT1_2},n={x:-t.y,y:t.x};
  const dot=v=>v.x*n.x+v.y*n.y;
  assert(Math.abs(dot(incoming)+dot(outgoing))<1e-9,'opposite normal components');
  assert((-dot(incoming))*dot(outgoing)>0,'incoming-side reflection');
  assert(Math.abs(incoming.x*outgoing.x+incoming.y*outgoing.y)<1e-9,'45-degree mirror turns beam 90 degrees');
 }
});
test('advanced optics require both target beams and cannot exceed the limited stock',()=>{
 const q=C.make(11,3),solution=q.mirrors.map(m=>({...m.solution}));assert.deepEqual(q.inventory,{mirror:3,splitter:1});assert.equal(E.check(q,solution),true);
 const trace=E.trace(q,solution);assert.equal(trace.lit.length,2);const split=trace.hits.find(h=>h.type==='splitter');assert.equal(split.outgoing.length,2);assert.equal(split.outgoing.reduce((n,v)=>n+v.intensity,0),1);
 const onlyMirror=solution.map(m=>m.type==='splitter'?{type:'mirror',orientation:m.orientation}:m);assert.equal(E.check(q,onlyMirror),false);
 const qLegacy={...q};delete qLegacy.optics;delete qLegacy.inventory;delete qLegacy.targets;
 assert(E.check(qLegacy,solution.map(m=>m.orientation)),'legacy four-mirror save remains solvable');
 assert.equal(E.trace(qLegacy,solution.map(m=>m.orientation)).hits.every(h=>h.outgoing.length===1),true,'ordinary mirror never transmits');
 const first=E.placeOptic(q,C.initial(q),0,'splitter');assert.deepEqual(E.remaining(q,first),{mirror:3,splitter:0});
 assert.equal(E.placeOptic(q,first,1,'splitter'),null);const rotated=E.placeOptic(q,first,0,'splitter');assert.equal(rotated[0].orientation,1);assert.equal(E.remaining(q,rotated).splitter,0);
 const removed=E.placeOptic(q,rotated,0,null);assert.equal(E.remaining(q,removed).splitter,1);assert.equal(first[0].orientation,0,'actions do not mutate saved answers');
 const replaced=E.placeOptic(q,first,0,'mirror');assert.deepEqual(E.remaining(q,replaced),{mirror:2,splitter:1});
 for(const invalid of [[],null,[...solution,{type:'mirror',orientation:0}],solution.map(m=>({...m,orientation:2})),solution.map(m=>({...m,type:'laser'}))])assert.equal(E.check(q,invalid),false);
});
test('reset and JSON restoration preserve independent inventory state',()=>{
 const q=C.make(22,3,'fr'),a=C.initial(q);a[0].type='splitter';assert.equal(q.initial[0].type,null);
 const restored=JSON.parse(JSON.stringify({q,a}));assert(E.validOptics(restored.q,restored.a));assert.deepEqual(E.remaining(restored.q,restored.a),{mirror:3,splitter:0});assert.deepEqual(E.remaining(q,C.initial(q)),q.inventory);
});

test('advanced practice varies the splitter site while retaining solvable optics',()=>{const positions=new Set();for(let seed=0;seed<40;seed++){const q=C.make(28,3,'nl',seed),answer=q.mirrors.map(m=>m.solution);positions.add(answer.findIndex(m=>m.type==='splitter'));assert(C.check(q,answer));}assert.equal(positions.size,4);});

test('the compatibility game retains numeric level-3 mirror answers',()=>{const q=E.make('lights',3,'nl',()=>.4);assert.equal(q.optics,undefined);assert(q.initial.every(Number.isInteger));assert(E.check(q,q.mirrors.map(m=>m.solution)));});
