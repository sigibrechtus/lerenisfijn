/* Semantic exercise identity and bounded repeat avoidance. Presentation order is excluded. */
(function(root){'use strict';
function signature(q){
 let data;const type=q.type||q.id;
 if(type==='groups')data=[q.targets,q.initial];
 else if(type==='fraction')data=[q.num,q.den,q.total];
 else if(type==='word')data=[q.word];
 else if(type==='time')data=[q.kind,q.start,q.duration];
 else if(type==='pattern')data=[q.sequence,q.missing];
 else if(type==='mirror')data=[q.source||{x:-1,y:1},q.mirrors,q.targets||[q.exit]];
 else if(type==='sequence')data=[q.values,q.missing];
 else if(type==='riddle')data=[q.clue,q.answer];
 else if(type==='deduction')data=[q.clue];
 else if(type==='route')data=[q.target,q.moves];
 else if(type==='potions')data=[q.solution,q.ingredients];
 else if(type==='mansion')data=[q.items.map(v=>v.label).sort(),q.items.find(v=>v.id===q.solution[0])?.label];
 else if(type==='garden'||type==='railway')data=[q.items.map(v=>v.value).sort((a,b)=>a-b),q.direction||'ascending'];
 else if(type==='broom'||type==='rally')data=[q.question];
 else data=[q.question];
 return JSON.stringify([type,...data]);
}
function fresh(make,seed=0,recent=[]){const history=new Set(Array.isArray(recent)?recent.filter(v=>typeof v==='string').slice(-12):[]);let task,key;for(let n=0;n<256;n++){task=make(Number(seed)+n);key=signature(task);if(!history.has(key))return{task,seed:Number(seed)+n,key};}return{task,seed:Number(seed)+255,key};}
const api={signature,fresh};root.MoonVariety=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
