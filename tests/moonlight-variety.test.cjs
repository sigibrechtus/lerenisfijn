const test=require('node:test'),assert=require('node:assert/strict');
require('../games/moonlight-hollow/engine.js');
const C=require('../games/moonlight-hollow/campaign.js'),G=require('../games/moonlight-hollow/mini-games.js'),V=require('../games/moonlight-hollow/variety.js');
const baseline=require('./fixtures/moonlight-variety-v20.json');
const {counts}=require('./moonlight-variety-counts.cjs');
test('each of 16 exercise families has at least five times the distinct v20 content at every level, in both languages',()=>{
 const measured=counts();
 for(const lang of ['nl','fr'])for(const [key,oldCount]of Object.entries(baseline.languages[lang]))assert(measured[lang][key]>=oldCount*5,`${lang} ${key}: ${measured[lang][key]} < ${oldCount} × 5`);
});
test('every campaign location can avoid its last twelve semantic tasks without counting answer-order changes',()=>{
 for(let index=0;index<C.layout.length;index++)for(const lang of ['nl','fr'])for(const level of [1,2,3]){
  let recent=[];
  for(let visit=0;visit<20;visit++){
   const chosen=V.fresh(seed=>C.make(index,level,lang,seed),visit,recent);
   assert(!recent.includes(chosen.key),`${index}/${lang}/${level} repeat`);recent=[...recent,chosen.key].slice(-12);
   assert.equal(V.signature(chosen.task),chosen.key);
  }
 }
});
test('mini-games reject recent content on entry and keep their three rounds distinct',()=>{
 for(const id of Object.keys(G.catalog))for(const level of [1,2,3]){
  let recent=[];
  for(let visit=0;visit<15;visit++){
   const game=G.create(id,{level,seed:7,recent});
   const key=V.signature(game.snapshot().task);assert(!recent.includes(key));recent=[...recent,key].slice(-12);
   const roundKeys=new Set();
   while(!game.snapshot().completed){const s=game.snapshot(),k=V.signature(s.task);assert(!roundKeys.has(k));roundKeys.add(k);if(id==='potions'){for(let i=0;i<2;i++)for(let n=0;n<s.task.solution[i];n++)game.action('add:'+i);game.action('check');}else{for(const action of s.task.solution)game.action(action);if(['garden','railway'].includes(id))game.action('check');}}
  }
 }
});
test('fingerprints ignore shuffled riddle choices and gate positions',()=>{
 const r=C.make(1,1,'nl',2);assert.equal(V.signature(r),V.signature({...r,choices:[...r.choices].reverse()}));
 const g=G.make('rally',1,'nl',2);assert.equal(V.signature(g),V.signature({...g,items:[...g.items].reverse()}));
});


test('expanded vocabulary retains the original compatibility-page illustrations',()=>{
 const content=require('../games/moonlight-hollow/learning-content.js'),expected={maan:'moon',lune:'moon',kat:'cat',chat:'cat',boom:'tree',arbre:'tree',ster:'star','étoile':'star',spook:'ghost','fantôme':'ghost',pompoen:'pumpkin',citrouille:'pumpkin',sleutel:'key','clé':'key',kasteel:'castle','château':'castle',lantaarn:'lantern',lanterne:'lantern'};
 for(const rows of Object.values(content.words).flat())for(const [word,,icon]of rows)assert.equal(icon,expected[word]||'book');
});
