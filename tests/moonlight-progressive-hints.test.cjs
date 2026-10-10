const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../games/moonlight-hollow/engine.js'),C=require('../games/moonlight-hollow/campaign.js'),G=require('../games/moonlight-hollow/mini-games.js'),Content=require('../games/moonlight-hollow/learning-content.js'),H=require('../games/moonlight-hollow/hints.js');
const families=['groups','fraction','word','time','sequence','riddle','deduction','route','pattern','mirror'];
const miniIds=['mansion','potions','garden','railway','broom','rally'];
function frozen(value){if(value&&typeof value==='object'){Object.values(value).forEach(frozen);Object.freeze(value);}return value;}
function three(make,label){const rows=[1,2,3].map(make);rows.forEach(row=>{assert.equal(typeof row,'string',label);assert(row.length>=25&&row.length<=380,`${label}: useful, concise hint: ${row}`);assert.doesNotMatch(row,/undefined|NaN|\[object Object\]/,label);});assert.equal(new Set(rows).size,3,`${label}: each stage must add different help`);return rows;}
function literalWord(value){return new RegExp(`(?<![\\p{L}\\p{N}-])${value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\p{L}\\p{N}-])`,'iu');}
function routeCanFinish(x,y,steps,target,memo=new Map()){
 if(x<0||x>2||y<0||y>2||steps<0)return false;if(steps===0)return x===target[0]&&y===target[1];
 const key=`${x},${y},${steps}`;if(memo.has(key))return memo.get(key);
 const possible=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>routeCanFinish(x+dx,y+dy,steps-1,target,memo));memo.set(key,possible);return possible;
}
function position(path){const p={x:0,y:0};for(const c of path){if(c==='E')p.x++;if(c==='W')p.x--;if(c==='N')p.y++;if(c==='S')p.y--;}return p;}

test('all 30 real campaign exercises have three different localized hints at every level',()=>{
 const seen=new Set();let count=0;
 for(const lang of ['nl','fr'])for(let level=1;level<=3;level++)for(let index=0;index<30;index++)for(let seed=0;seed<12;seed++){
  const q=frozen(C.make(index,level,lang,seed)),a=frozen(C.initial(q)),before=JSON.stringify([q,a]);seen.add(q.type);
  const rows=three(stage=>H.exercise(q,a,stage,lang),`${q.type}/${lang}/${level}/${seed}`);
  rows.forEach((row,i)=>assert.notEqual(row,H.exercise(q,a,i+1,lang==='nl'?'fr':'nl'),'requested language changes hint text'));
  if(q.type==='word')rows.forEach(row=>assert.doesNotMatch(row,literalWord(q.word),'never reveal the complete word'));
  if(q.type==='riddle'){const correct=q.choices.find(item=>item.value===q.answer);rows.forEach(row=>assert.doesNotMatch(row,literalWord(correct.label),'never name the riddle answer'));}
  if(q.type==='deduction')rows.forEach(row=>assert.doesNotMatch(row,literalWord(q.choices[q.answer]),'eliminate one option, never name the correct animal'));
  if(q.type==='mirror'){assert.doesNotMatch(rows[0],/« [\\/] »/);assert.doesNotMatch(rows[1],/« [\\/] »/);assert.equal((rows[2].match(/« [\\/] »/g)||[]).length,1,'only one optic orientation is revealed');}
  if(q.type==='time'&&q.kind!=='read'){const final=`${String(Math.floor(q.answer/60)).padStart(2,'0')}:${String(q.answer%60).padStart(2,'0')}`;assert(!rows[2].includes(final),'worked clock step stops before the final time');}
  assert.equal(JSON.stringify([q,a]),before,'hint generation must not change the exercise or answer');count++;
 }
 assert.deepEqual([...seen].sort(),families.sort());assert.equal(count,2160);
});

test('all six real mini-games provide three localized stages across levels and rounds',()=>{
 let count=0;
 for(const id of miniIds)for(const lang of ['nl','fr'])for(let level=1;level<=3;level++)for(let seed=1;seed<=12;seed++)for(let round=0;round<5;round++){
  const task=frozen(G.make(id,level,lang,seed,round)),state=frozen({amounts:[0,0],selected:[],history:[]}),before=JSON.stringify([task,state]);
  const rows=three(stage=>H.mini(task,state,stage),`${id}/${lang}/${level}/${seed}/${round}`);
  if(id==='mansion'){const correct=task.items.find(item=>item.id===task.solution[0]);rows.forEach(row=>assert(!row.includes(correct.label),'only the color, never the complete key, is revealed'));const color=correct.label.split(' · ')[0];assert(rows[2].includes(`« ${color} »`));assert.equal(task.items.filter(item=>item.label.startsWith(color+' · ')).length,3,'stage 3 still leaves three symbols to compare');}
  if(id==='garden'||id==='railway'){const named=task.items.filter(item=>rows[2].includes(`« ${item.label} »`));assert.equal(named.length,1,'only the first placement is revealed');assert.equal(named[0].id,task.solution[0]);}
  assert.equal(JSON.stringify([task,state]),before,'mini hints must preserve task and state');count++;
 }
 assert.equal(count,2160);
});

test('every bilingual word and riddle in the real content pool stays concealed',()=>{
 for(const lang of ['nl','fr']){
  for(const level of Content.words[lang])for(const [word,clue]of level){const q={type:'word',lang,word,clue,tiles:Array.from(word,(letter,id)=>({letter,id}))};three(stage=>H.exercise(q,[],stage),word).forEach(row=>assert.doesNotMatch(row,literalWord(word)));assert(H.exercise(q,[],3).includes(`« ${Array.from(word)[0]} »`),'stage 3 reveals exactly the first letter');}
  for(const [clue,label,value]of Content.riddles[lang]){const q={type:'riddle',lang,clue,answer:value,choices:[{label,value}]};three(stage=>H.exercise(q,null,stage),label).forEach(row=>assert.doesNotMatch(row,literalWord(label)));assert(H.exercise(q,null,3).includes(`« ${Array.from(label)[0]} »`));}
 }
});

test('guided route hints suggest at most one legal step that preserves an exact-length solution',()=>{
 let guided=0,single=0,detours=0;
 const delta={'→':[1,0],'↑':[0,1],'←':[-1,0],'↓':[0,-1]};
 for(const lang of ['nl','fr'])for(let level=1;level<=3;level++)for(let seed=0;seed<100;seed++){
  const q=C.make(15,level,lang,seed);if(q.moves>q.target[0]+q.target[1])detours++;
  for(let n=0;n<q.answer.length;n++){
   const path=q.answer.slice(0,n),row=H.exercise(q,path,3),arrows=row.match(/[→↑←↓]/g)||[],p=position(path);assert(arrows.length<=1,'do not print a complete route');
   if(q.moves-n===1){assert.equal(arrows.length,0,'a one-step problem must still leave the direction for the learner');single++;}
   if(arrows.length){const [dx,dy]=delta[arrows[0]];assert(routeCanFinish(p.x+dx,p.y+dy,q.moves-n-1,q.target),`${row}: suggested step must permit a full exact route`);guided++;}
  }
  assert.doesNotMatch(H.exercise(q,q.answer+'NESW',3),/[→↑←↓]/,'an overlong attempt gets undo guidance');
 }
 assert(guided>500&&single===600&&detours>100,'cover simple routes, partial routes and detours');
});

test('one-step guidance reacts to current counts and wrong first placements',()=>{
 const groups=C.make(0,2,'nl',3),counts=C.initial(groups);assert.match(H.exercise(groups,counts,3),/mand 1/);counts[0]=groups.targets[0];assert.match(H.exercise(groups,counts,3),/mand 2/);counts[1]=groups.targets[1]+1;assert.match(H.exercise(groups,counts,3),/Neem er eerst één uit/);
 for(const lang of ['nl','fr']){
  const potion=G.make('potions',3,lang,17);assert.match(H.mini(potion,{amounts:[0,0]},3),lang==='fr'?/Ajoute d’abord une cuillère/:/Voeg eerst één lepel toe/);assert.match(H.mini(potion,{amounts:[potion.solution[0]+1,0]},3),lang==='fr'?/Retire d’abord une cuillère/:/Neem eerst één lepel terug/);assert(H.mini(potion,{amounts:[potion.solution[0],0]},3).includes(potion.ingredients[1]));
  for(const id of ['garden','railway']){const task=G.make(id,3,lang,6),wrong=task.items.find(item=>item.id!==task.solution[0]);assert.match(H.mini(task,{selected:[wrong.id]},3),lang==='fr'?/Annule tes choix/:/Neem je keuzes terug/);}
 }
 const word=C.make(7,3,'fr',2),wrong=word.tiles.find(tile=>tile.letter!==word.word[0]);assert.match(H.exercise(word,[wrong.id],3),/Annule ta première lettre/);
});

test('garden strategy honors ascending and descending, and arithmetic handles every operation',()=>{
 const directions=new Set(),modes=new Set();
 for(const lang of ['nl','fr'])for(let seed=1;seed<=30;seed++){
  const task=G.make('garden',3,lang,seed);directions.add(task.direction);const hint=H.mini(task,{},2);assert.match(hint,task.direction==='descending'?(lang==='fr'?/plus grande/:/grootste/):(lang==='fr'?/plus petite/:/kleinste/));
  for(const id of ['broom','rally'])for(const level of [1,2,3])for(let round=0;round<5;round++){const task=G.make(id,level,lang,seed,round);modes.add(`${level}/${task.operation}`);const rows=three(stage=>H.mini(task,{},stage),task.expression);if(level===3&&task.operation>=3)assert.match(rows[2],lang==='fr'?/hors des parenthèses pour la fin/:/buiten de haakjes tot het einde/);}
 }
 assert.deepEqual([...directions].sort(),['ascending','descending']);assert.equal(modes.size,15);
 // Tiny arithmetic tasks must ask the learner to make the last step, not calculate it in the hint.
 for(const id of ['broom','rally'])for(let seed=1;seed<=100;seed++){const task=G.make(id,1,'nl',seed),numbers=task.expression.match(/\d+/g).map(Number);if([0,1,4].includes(task.operation)&&numbers[1]===1)assert.doesNotMatch(H.mini(task,{},3),/ = /);}
});

test('stages clamp safely, defaults use task language, and legacy engine tasks are supported',()=>{
 const q=C.make(7,2,'fr',1),task=G.make('mansion',2,'fr',1);
 for(const stage of [undefined,null,0,-1,-Infinity,'bad']){assert.equal(H.exercise(q,[],stage),H.exercise(q,[],1));assert.equal(H.mini(task,{},stage),H.mini(task,{},1));}
 for(const stage of [3,4,99,Infinity]){assert.equal(H.exercise(q,[],stage),H.exercise(q,[],3));assert.equal(H.mini(task,{},stage),H.mini(task,{},3));}
 assert.equal(H.exercise(q,[],2.9),H.exercise(q,[],2));assert.equal(H.progressLabel(99,'nl'),'Tip 3 van 3');assert.equal(H.progressLabel(2,'fr'),'Indice 2 sur 3');
 for(const area of E.areas)for(const lang of ['nl','fr'])for(let level=1;level<=3;level++){const q=E.make(area,level,lang,C.rngFor(area+level+lang));three(stage=>H.exercise(q,null,stage,lang),`legacy ${area}`);}
});

test('hints expose the same browser API without a DOM or module loader',()=>{
 const window={},context=vm.createContext({window});vm.runInContext(fs.readFileSync(require.resolve('../games/moonlight-hollow/hints.js'),'utf8'),context);
 assert.deepEqual(Object.keys(window.MoonHints).sort(),['exercise','mini','progressLabel']);assert.equal(window.MoonHints.progressLabel(1,'fr'),'Indice 1 sur 3');assert.equal(window.MoonHints.exercise(C.make(0,1,'nl'),[0,0],2,'nl'),H.exercise(C.make(0,1,'nl'),[0,0],2,'nl'));
});
