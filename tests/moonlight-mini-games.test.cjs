const assert=require('node:assert/strict');
const G=require('../games/moonlight-hollow/mini-games.js');
for(const id of Object.keys(G.catalog))for(const lang of ['nl','fr'])for(let level=1;level<=3;level++)for(const seed of [1,2,99]){
 const a=G.make(id,level,lang,seed,0),b=G.make(id,level,lang,seed,0);assert.deepEqual(a,b);assert(a.question&&a.how);assert.notDeepEqual(a,G.make(id,level,lang,seed,1));
 const session=G.create(id,{level,lang,seed});for(let round=0;round<3;round++){
  let s=session.snapshot();assert.equal(s.round,round+1);assert.equal(s.progress,round/3);const invalid=JSON.stringify(s);session.action('unknown:999');assert.equal(JSON.stringify(session.snapshot()),invalid);
  if(id==='potions'){session.action('add:0');assert.equal(session.snapshot().amounts[0],1);session.action('undo');assert.equal(session.snapshot().amounts[0],0);session.action('check');assert.equal(session.snapshot().progress,round/3);s=session.snapshot();for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)session.action('add:'+i);session.action('check');}
  else if(['garden','railway'].includes(id)){session.action(s.task.solution.at(-1));session.action('check');assert.equal(session.snapshot().progress,round/3);session.action('reset');for(const choice of s.task.solution)session.action(choice);session.action('check');}
  else{const wrong=s.task.items.find(i=>!s.task.solution.includes(i.id));session.action(wrong.id);assert.equal(session.snapshot().progress,round/3);assert.equal(session.snapshot().selected.length,0);session.action(s.task.solution[0]);}
 }
 assert.equal(session.snapshot().completed,true);assert.equal(session.snapshot().progress,1);assert.deepEqual(session.snapshot().choices,[]);const done=JSON.stringify(session.snapshot());session.action('reset');assert.equal(JSON.stringify(session.snapshot()),done);
}
assert.throws(()=>G.make('bad'),RangeError);assert.equal(G.make('broom',99).level,3);assert.equal(G.make('broom',-1).level,1);
console.log('Mini-games: 108 deterministic sessions, all six types, both languages, all difficulty levels, retries and completion verified.');

// Added symbols include masculine nouns; clues must not give them a feminine article.
for(const level of [1,2])for(let seed=1;seed<=100;seed++)assert.doesNotMatch(G.make('mansion',level,'fr',seed).question,/une (?:soleil|cœur|losange)/);
