const{test}=require('node:test'),assert=require('node:assert/strict'),E=require('../games/moonlight-hollow/engine.js');
test('generated learning tasks have valid solutions in every area, level and language',()=>{
for(const lang of ['nl','fr'])for(const area of E.areas)for(let level=1;level<=3;level++)for(let i=0;i<300;i++){
const q=E.make(area,level,lang);let answer;
if(area==='bridge'){assert.equal(q.total-q.initial,q.pool);assert(q.targets.every(x=>x>0));answer=q.targets;assert(!E.check(q,q.targets.map(x=>x+1)));}
if(area==='garden'){assert(Number.isInteger(q.moon));assert(q.moon>0&&q.moon<q.total);answer=Array.from({length:q.total},(_,i)=>i<q.moon?0:1);assert(!E.check(q,Array(q.total).fill(0)));}
if(area==='library'){assert.equal(q.tiles.map(x=>x.letter).sort().join(''),[...q.word].sort().join(''));assert.equal(new Set(q.tiles.map(x=>x.id)).size,q.tiles.length);answer=q.word;assert(!E.check(q,q.word+'a'));}
if(area==='clock'){assert(q.answer>=0&&q.answer<1440);assert.equal(q.answer%5,0);answer=q.answer;assert(!E.check(q,null));assert(!E.check(q,q.answer+5));if(q.kind==='read')assert(E.check(q,q.answer%720));}
if(area==='lights'){if(q.kind==='pattern'){answer=q.answer;assert.equal(q.answer,q.unit[q.missing%q.unit.length]);let run=1;for(let j=1;j<q.sequence.length;j++){run=q.sequence[j]===q.sequence[j-1]?run+1:1;assert(run<=3);}}else{answer=q.mirrors.map(m=>m.solution);assert(E.trace(q,answer).success);assert(!E.trace(q,q.initial).success);assert(E.trace(q,[...q.initial]).points.length<=82);}}
assert(E.check(q,answer),area+' '+level+' '+lang);
}
});
const event=(id,overrides={})=>({id:String(id),area:'bridge',level:1,attempts:1,assisted:false,date:new Date().toISOString(),...overrides});
test('adaptation only follows comparable independent successes',()=>{
assert.equal(E.stats(Array.from({length:6},(_,i)=>event(i)),'bridge').level,2);
assert.equal(E.stats(Array.from({length:6},(_,i)=>event(i,{assisted:true})),'bridge').level,1);
assert.equal(E.stats(Array.from({length:6},(_,i)=>event(i,{attempts:2})),'bridge').level,1);
assert.equal(E.stats(Array.from({length:6},(_,i)=>event(i,{area:'garden'})),'bridge').level,1);
});
test('world unlocks are reachable and branches can be explored in either order',()=>{
assert(E.unlocked([],'bridge'));assert(!E.unlocked([],'garden'));assert(!E.unlocked([],'clock'));
assert(E.unlocked([event(1)],'garden'));assert(E.unlocked([event(1)],'library'));
assert(E.unlocked([event(1,{area:'library'})],'clock'));assert(E.unlocked([event(1,{area:'clock'})],'lights'));
});
test('wrong, incomplete and malformed answers cannot restore locations',()=>{
for(const area of E.areas){const q=E.make(area,3);assert(!E.check(q,null));}
assert(!E.check(E.make('garden'),[0,1,2]));assert(!E.check(E.make('lights',3),[7,7,7,7]));
assert(!E.validEvent(event(1,{attempts:0})));assert(!E.validEvent(event(1,{area:'invalid'})));
});

