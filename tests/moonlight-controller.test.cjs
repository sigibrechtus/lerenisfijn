/* Runs the full shipped DOM controller. This verifies wiring, not browser pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function boot({saved=null,storage=new Map()}={}){const base=path.join(__dirname,'../games/moonlight-hollow'),elements=new Map(),sounds=[],visuals=[],celebrations=[],documentEvents=new Map(),windowEvents=new Map(),contexts=[];let worldApi;
 class Element{constructor(id=''){this.id=id;this.children=[];this.hidden=false;this.style={setProperty(){}};this.dataset={};this.attributes={};this.value='';this.classList={add(){},remove(){},toggle(){}};}replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}setAttribute(k,v){this.attributes[k]=v;}focus(){}querySelector(){return new Element();}querySelectorAll(){return this.children;}getBoundingClientRect(){return {width:390,height:844,bottom:80,top:500};}get options(){return this.children;}showModal(){this.open=true;}close(){this.open=false;}}
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');for(const [,id]of html.matchAll(/id="([^"]+)"/g))elements.set(id,new Element(id));elements.get('transition').hidden=true;for(const v of ['auto','clear','fog','rain','storm']){const o=new Element();o.value=v;elements.get('weather').children.push(o);}const document={documentElement:new Element(),body:new Element(),hidden:false,getElementById:id=>elements.get(id),createElement:()=>new Element(),querySelector:q=>q==='header'?new Element():null,querySelectorAll:()=>[],addEventListener(kind,fn){if(!documentEvents.has(kind))documentEvents.set(kind,[]);documentEvents.get(kind).push(fn);}};
 const audio={unlock:async()=>true,setMusic(){},setContext(next){contexts.push(next);},setAmbience(){},preloadEffects(){},play(kind,options){sounds.push({kind,options});},weather(){},position(){},listener(){},update(){},suspend(){},resume(){},stop(){},narration(){},state:()=>({})};const world={hero:{position:{x:0,z:0}},avatar(){},updateWorld(){},quality(){},start(){},enter(){},leave(){},select(){},refit(){},change(){},resetInput(){},actionEffect(kind){visuals.push(kind);},celebration(area){celebrations.push(area);worldApi.effect('solve');}};
 if(saved)storage.set('moonlight-hollow-v3',typeof saved==='string'?saved:JSON.stringify(saved));let uuid=0;
 const ctx={document,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>({matches:false}),crypto:{randomUUID:()=> 'id-'+(++uuid)},console,navigator:{},addEventListener:(kind,fn)=>windowEvents.set(kind,fn),MoonWorld:{create(canvas,api){worldApi=api;return world;}},MoonAudio:{...require(path.join(base,'audio.js')),create:()=>audio}};ctx.window=ctx;vm.createContext(ctx);for(const file of ['learning-content.js','variety.js','engine.js','campaign.js','camera.js','hints.js','hud.js','landscape.js','railway.js','puzzle-actions.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),ctx);return {ctx,elements,sounds,visuals,celebrations,storage,worldApi,documentEvents,windowEvents,contexts};
}
function solution(q){if(q.type==='groups')return [...q.targets];if(q.type==='fraction')return Array(q.moon).fill(0).concat(Array(q.total-q.moon).fill(1));if(q.type==='word'){const used=new Set();return Array.from(q.word).map(letter=>{const tile=q.tiles.find(tile=>tile.letter===letter&&!used.has(tile.id));used.add(tile.id);return tile.id;});}if(q.type==='time')return q.answer;if(q.type==='mirror')return q.mirrors.map(m=>typeof m.solution==='object'?{...m.solution}:m.solution);return q.answer;}
function solveCurrent(ctx){ctx.testAnswer=solution(vm.runInContext('q',ctx));vm.runInContext('setAnswer(testAnswer);check()',ctx);}
test('shipped controller changes context for boarding, exercises and leaving without idle train callbacks overriding puzzles',()=>{
 const h=boot();vm.runInContext('started=true',h.ctx);h.worldApi.ride(true,true,'boarding',1);assert.equal(h.contexts.at(-1).mode,'train');h.worldApi.ride(true,true,'travel',1);assert.equal(h.contexts.at(-1).mode,'train');h.worldApi.ride(true,false,'idle',1);assert.equal(h.contexts.at(-1).mode,'world');
 vm.runInContext("q=C.make(0,1,'nl');a=C.initial(q);openPuzzle()",h.ctx);assert.equal(h.contexts.at(-1).mode,'exercise');assert.equal(h.contexts.at(-1).area,'bridge');h.worldApi.ride(false,false,'idle',1);assert.equal(h.contexts.at(-1).mode,'exercise');vm.runInContext('leavePuzzle()',h.ctx);assert.equal(h.contexts.at(-1).mode,'world');
});
test('full controller boots, persists theme changes, and opens each bilingual exercise',()=>{const {ctx,elements:e}=boot();assert.equal(ctx.document.documentElement.dataset.theme,'halloween');e.get('theme').value='christmas';e.get('theme').onchange();assert.equal(ctx.document.documentElement.dataset.theme,'christmas');for(const lang of ['nl','fr'])for(let i=0;i<30;i++){vm.runInContext(`state.prefs.lang='${lang}';q=C.make(${i},2,state.prefs.lang);a=C.initial(q);openPuzzle();`,ctx);assert(e.get('puzzle-title').textContent.length);assert(e.get('puzzle-how').textContent.length>50);assert(e.get('object-controls').children.length>0);vm.runInContext('leavePuzzle()',ctx);}});

test('completed campaign practice visits vary while unfinished checkpoints resume their exact saved task',()=>{
 const {ctx}=boot(),recent=[];
 vm.runInContext("state.prefs.difficulty='1'",ctx);
 for(let visit=0;visit<20;visit++){
  vm.runInContext("interact('bridge')",ctx);
  for(let task=0;task<3;task++){const key=vm.runInContext('MoonVariety.signature(q)',ctx);assert(!recent.slice(-12).includes(key));recent.push(key);solveCurrent(ctx);vm.runInContext('next()',ctx);}
 }
 assert.equal(vm.runInContext("P().practiceHistory['0/1/nl'].length",ctx),12);assert.equal(vm.runInContext('P().practiceNonce',ctx),60);assert.equal(recent.length,60);
 vm.runInContext("interact('bridge');setAnswer(q.targets.map((_,i)=>i===0?1:0));leavePuzzle()",ctx);
 const saved=vm.runInContext('JSON.stringify(P().draft)',ctx);vm.runInContext("interact('bridge');draft()",ctx);assert.equal(vm.runInContext('JSON.stringify(P().draft)',ctx),saved);
 vm.runInContext('leavePuzzle();start();draft()',ctx);assert.equal(vm.runInContext('JSON.stringify(P().draft)',ctx),saved);
});


test('vehicle viewport reserves the mission and held-controls rectangles',()=>{
 const {ctx,elements:e}=boot();e.get('world').getBoundingClientRect=()=>({top:0,width:844,height:390});
 e.get('mini-panel').querySelector=()=>({getBoundingClientRect:()=>({bottom:175})});e.get('mini-driving').getBoundingClientRect=()=>({top:320});e.get('mini-driving').hidden=false;
 const frame=vm.runInContext("attractions={active:'broom'};exerciseFrame()",ctx);
 assert.equal(Math.round((1-frame.y-frame.height)*390),185);assert.equal(Math.round((1-frame.y)*390),308);
});

test('every exercise exposes three progressive hints and preserves assisted drafts',()=>{
 const {ctx,elements:e}=boot();
 for(const lang of ['nl','fr'])for(let index=0;index<30;index++){
  vm.runInContext(`state.prefs.lang='${lang}';q=C.make(${index},2,state.prefs.lang,17);a=C.initial(q);hints=0;assisted=false;solved=false;openPuzzle();`,ctx);
  const shown=[];
  for(let stage=1;stage<=3;stage++){
   e.get('hint').onclick();assert.equal(vm.runInContext('hints',ctx),stage);
   assert.equal(e.get('hint-copy').hidden,false);shown.push(e.get('hint-copy').textContent);
   assert.equal(vm.runInContext('P().draft.hints',ctx),stage);assert.equal(vm.runInContext('P().draft.assisted',ctx),true);
  }
  assert.equal(new Set(shown).size,3,`${lang} exercise ${index}: progressive stages`);
  e.get('hint').onclick();assert.equal(vm.runInContext('hints',ctx),3);assert.equal(e.get('hint-copy').textContent,shown[2]);
  vm.runInContext('leavePuzzle()',ctx);
 }
});

test('every bilingual quest at all three levels requires three fresh checkpoints before awarding completion',()=>{
 for(const lang of ['nl','fr'])for(const level of [1,2,3]){
  const h=boot(),{ctx,elements:e}=h;vm.runInContext(`state.prefs.lang='${lang}';state.prefs.difficulty='${level}';start()`,ctx);
  for(let quest=0;quest<30;quest++){
   const area=vm.runInContext(`C.layout[${quest}][0]`,ctx),keys=new Set();vm.runInContext(`interact('${area}')`,ctx);
   for(let task=1;task<=3;task++){
    assert.equal(vm.runInContext('q.index',ctx),quest);assert.equal(vm.runInContext('q.level',ctx),level);assert.equal(vm.runInContext('q.lang',ctx),lang);
    assert.match(e.get('puzzle-region').textContent,new RegExp(`${lang==='fr'?'Étape':'Opdracht'} ${task}/3`));
    const key=vm.runInContext('MoonVariety.signature(q)',ctx);assert(!keys.has(key),'each checkpoint changes the underlying task');keys.add(key);
    assert.equal(vm.runInContext('C.check(q,a)',ctx),false);assert.equal(vm.runInContext('attempts',ctx),0);assert.equal(vm.runInContext('hints',ctx),0);assert.equal(vm.runInContext('assisted',ctx),false);
    e.get('next').onclick();assert.equal(vm.runInContext('MoonVariety.signature(q)',ctx),key,'Continue cannot skip an unsolved task');
    solveCurrent(ctx);assert.equal(vm.runInContext('solved',ctx),true);assert.equal(e.get('next').hidden,false);assert.equal(e.get('hint').disabled,true);assert(e.get('object-controls').children.every(button=>button.disabled));
    assert.equal(vm.runInContext('C.next(P().events)',ctx),task<3?quest:quest+1);assert.equal(vm.runInContext('P().events.length',ctx),task<3?quest:quest+1);assert.equal(h.celebrations.length,task<3?quest:quest+1,'world restoration only happens on the third checkpoint');
    if(task<3){assert.equal(vm.runInContext('C.validateDraft(P().draft)',ctx),true);assert.equal(vm.runInContext('P().draft.solved',ctx),true);assert.equal(vm.runInContext('P().draft.taskResults.length',ctx),task);assert.match(e.get('next').textContent,new RegExp(`${task+1}/3`));}
    else{assert.equal(vm.runInContext('P().draft',ctx),null);assert.equal(vm.runInContext('P().events.at(-1).checkpoints',ctx),3);assert.equal(vm.runInContext('P().events.at(-1).taskResults.length',ctx),3);assert.equal(vm.runInContext('P().events.at(-1).attempts',ctx),1);assert.equal(vm.runInContext('P().events.at(-1).assisted',ctx),false);assert.equal(vm.runInContext('E.validEvent(P().events.at(-1))',ctx),true);}
    const count=vm.runInContext('P().events.length',ctx);e.get('check').onclick();assert.equal(vm.runInContext('P().events.length',ctx),count,'duplicate checks cannot duplicate quest awards');
    e.get('next').onclick();if(task<3){assert.equal(vm.runInContext('checkpoint',ctx),task);assert.equal(vm.runInContext('taskResults.length',ctx),task);assert.equal(e.get('hint-copy').hidden,true);assert.equal(e.get('check').hidden,false);}
   }
   assert.equal(keys.size,3);assert.equal(vm.runInContext('q',ctx),null);if((quest+1)%6===0){assert.equal(e.get('transition').hidden,false);e.get('transition-close').onclick();}
  }
  assert.equal(vm.runInContext('C.completed(P().events).size',ctx),30);assert.equal(vm.runInContext('C.next(P().events)',ctx),30);assert.equal(vm.runInContext('P().practiceNonce',ctx),90);
 }
});

test('reload preserves both solved checkpoint screens and unfinished later tasks, including hint/retry history',()=>{
 let h=boot();vm.runInContext("state.prefs.lang='fr';state.prefs.difficulty='3';start();interact('bridge')",h.ctx);h.elements.get('hint').onclick();h.elements.get('check').onclick();solveCurrent(h.ctx);
 const solvedDraft=vm.runInContext('JSON.stringify(P().draft)',h.ctx);assert.equal(vm.runInContext('P().events.length',h.ctx),0);
 h.windowEvents.get('pagehide')();h=boot({storage:h.storage});vm.runInContext('start();draft()',h.ctx);assert.equal(vm.runInContext('JSON.stringify(P().draft)',h.ctx),solvedDraft);assert.equal(vm.runInContext('solved',h.ctx),true);assert.equal(h.elements.get('check').hidden,true);assert.equal(h.elements.get('next').hidden,false);
 h.elements.get('next').onclick();assert.equal(vm.runInContext('checkpoint',h.ctx),1);assert.equal(vm.runInContext('hints',h.ctx),0);assert.equal(vm.runInContext('assisted',h.ctx),false);assert.equal(vm.runInContext('attempts',h.ctx),0);
 vm.runInContext('setAnswer(q.targets.map((_,i)=>i===0?1:0))',h.ctx);h.ctx.document.hidden=true;h.documentEvents.get('visibilitychange').forEach(fn=>fn());const pendingDraft=vm.runInContext('JSON.stringify(P().draft)',h.ctx);
 h=boot({storage:h.storage});vm.runInContext('start();draft()',h.ctx);assert.equal(vm.runInContext('JSON.stringify(P().draft)',h.ctx),pendingDraft);assert.equal(vm.runInContext('checkpoint',h.ctx),1);assert.equal(vm.runInContext('solved',h.ctx),false);assert.equal(vm.runInContext('taskResults[0].attempts',h.ctx),2);assert.equal(vm.runInContext('taskResults[0].assisted',h.ctx),true);
 solveCurrent(h.ctx);h.elements.get('next').onclick();solveCurrent(h.ctx);assert.equal(vm.runInContext('P().events.length',h.ctx),1);assert.equal(vm.runInContext('P().events[0].attempts',h.ctx),2);assert.equal(vm.runInContext('P().events[0].assisted',h.ctx),true);assert.equal(vm.runInContext('P().events[0].taskResults[2].assisted',h.ctx),false);assert.equal(vm.runInContext('C.skill(P().events,"bridge")',h.ctx),1);assert.equal(vm.runInContext('P().draft',h.ctx),null);
});

test('legacy quest completions and exact old drafts remain valid when loaded into checkpoint play',()=>{
 const original=boot(),oldQ=JSON.parse(vm.runInContext("JSON.stringify(C.make(1,2,'fr',27))",original.ctx)),oldA=vm.runInContext('C.initial('+JSON.stringify(oldQ)+')',original.ctx),oldEvent={id:'legacy',quest:0,area:'bridge',lang:'fr',level:1,attempts:1,assisted:false,date:'2026-10-01T12:00:00.000Z'},oldDraft={q:oldQ,a:oldA,attempts:1,assisted:true,hints:2,selected:0};
 const h=boot({saved:{version:3,selected:'old',prefs:{lang:'fr'},profiles:[{id:'old',name:'Voyageur',events:[oldEvent],draft:oldDraft}]}});assert.equal(vm.runInContext('C.next(P().events)',h.ctx),1);vm.runInContext('start()',h.ctx);assert.equal(vm.runInContext('checkpoint',h.ctx),0);assert.equal(vm.runInContext('JSON.stringify(q)',h.ctx),JSON.stringify(oldQ));assert.equal(vm.runInContext('JSON.stringify(a)',h.ctx),JSON.stringify(oldA));assert.equal(vm.runInContext('hints',h.ctx),2);assert.equal(vm.runInContext('assisted',h.ctx),true);
 for(let task=0;task<3;task++){solveCurrent(h.ctx);if(task<2){assert.equal(vm.runInContext('C.next(P().events)',h.ctx),1);h.elements.get('next').onclick();}}
 assert.equal(vm.runInContext('C.next(P().events)',h.ctx),2);assert.equal(vm.runInContext('P().events[0].checkpoints',h.ctx),undefined);assert.equal(vm.runInContext('P().events[1].taskResults.length',h.ctx),3);assert.equal(vm.runInContext('P().events[1].assisted',h.ctx),true);assert.equal(vm.runInContext('P().events[1].attempts',h.ctx),2);
});

test('practice quests also require three tasks and never advance the campaign twice',()=>{
 const h=boot(),{ctx,elements:e}=h;vm.runInContext("interact('bridge')",ctx);for(let task=0;task<3;task++){solveCurrent(ctx);e.get('next').onclick();}assert.equal(vm.runInContext('C.next(P().events)',ctx),1);
 vm.runInContext("interact('bridge')",ctx);for(let task=0;task<3;task++){assert.equal(vm.runInContext('q.index',ctx),0);solveCurrent(ctx);assert.equal(vm.runInContext('C.next(P().events)',ctx),1);assert.equal(vm.runInContext('P().events.length',ctx),task<2?1:2);e.get('next').onclick();}
 assert.equal(vm.runInContext('C.completed(P().events).size',ctx),1);assert.equal(vm.runInContext('P().events[1].checkpoints',ctx),3);
});

test('checkpoint drafts remain separated across profiles and both languages',()=>{
 const h=boot(),{ctx,elements:e}=h;vm.runInContext("start();interact('bridge')",ctx);solveCurrent(ctx);e.get('next').onclick();vm.runInContext("leavePuzzle();state.profiles.push({id:'two',name:'Pip',events:[],draft:null})",ctx);const firstDraft=vm.runInContext('JSON.stringify(P().draft)',ctx);
 e.get('profile').value='two';e.get('profile').onchange();vm.runInContext("interact('bridge')",ctx);assert.equal(vm.runInContext('checkpoint',ctx),0);assert.equal(vm.runInContext('taskResults.length',ctx),0);vm.runInContext('leavePuzzle()',ctx);
 e.get('profile').value='first';e.get('profile').onchange();assert.equal(vm.runInContext('checkpoint',ctx),1);vm.runInContext('draft()',ctx);assert.equal(vm.runInContext('JSON.stringify(P().draft)',ctx),firstDraft);vm.runInContext('leavePuzzle()',ctx);
 e.get('language').value='fr';e.get('language').onchange();vm.runInContext("interact('bridge')",ctx);assert.equal(vm.runInContext('q.lang',ctx),'fr');assert.equal(vm.runInContext('checkpoint',ctx),0);solveCurrent(ctx);e.get('next').onclick();vm.runInContext('leavePuzzle()',ctx);const frenchDraft=vm.runInContext('JSON.stringify(P().draft)',ctx);
 e.get('language').value='nl';e.get('language').onchange();assert.equal(vm.runInContext('JSON.stringify(P().draft)',ctx),firstDraft);vm.runInContext("interact('bridge')",ctx);assert.equal(vm.runInContext('checkpoint',ctx),1);assert.equal(vm.runInContext('q.lang',ctx),'nl');assert.equal(vm.runInContext('JSON.stringify(P().previousLanguageDraft)',ctx),frenchDraft);
});

test('controller routes every meaningful operation to the same audio and visual event hooks',()=>{
 const h=boot(),{ctx,elements:e}=h;
 function open(index,level=2){vm.runInContext(`leavePuzzle();q=C.make(${index},${level},'nl',7);a=C.initial(q);attempts=0;assisted=false;hints=0;solved=false;openPuzzle()`,ctx);h.sounds.length=0;h.visuals.length=0;}
 function expect(kind){assert.equal(h.sounds.at(-1).kind,kind);assert.equal(h.visuals.at(-1),kind);assert.deepEqual(h.visuals,h.sounds.map(sound=>sound.kind),'all effect events also reach the visual hook');}
 open(0);e.get('object-controls').children[0].onclick();expect('pickup');e.get('object-controls').children[1].onclick();expect('remove');
 open(7);e.get('object-controls').children[0].onclick();expect('letter');e.get('object-controls').children.at(-2).onclick();expect('remove');
 open(2);e.get('object-controls').children[1].onclick();expect('bottle');const colored=vm.runInContext('[...a]',ctx);colored[0]=1;h.worldApi.change(colored);expect('pour');
 open(11,3);e.get('object-controls').children[1].onclick();expect('mirror');vm.runInContext("setAnswer(E.placeOptic(q,a,0,'mirror'))",ctx);expect('place');vm.runInContext("setAnswer(E.placeOptic(q,a,0,'mirror'))",ctx);expect('mirror');vm.runInContext('setAnswer(E.placeOptic(q,a,0,null))',ctx);expect('remove');
 for(const [index,kind]of [[3,'clock'],[5,'stone'],[1,'riddle'],[8,'tile'],[15,'tile'],[4,'pattern']]){open(index);e.get('object-controls').children.find(button=>!button.disabled).onclick();expect(kind);}
 open(15);e.get('object-controls').children[0].onclick();expect('tile');e.get('object-controls').children[4].onclick();expect('remove');
 open(0);e.get('hint').onclick();expect('hint');e.get('check').onclick();expect('retry');e.get('reset').onclick();expect('reset');solveCurrent(ctx);expect('solve');
 const count=h.sounds.length;h.worldApi.change([0,0]);e.get('hint').onclick();e.get('check').onclick();assert.equal(h.sounds.length,count,'completed task guards suppress stale operation effects');
 vm.runInContext("fx('ui',{gain:.4})",ctx);expect('ui');assert.equal(h.sounds.at(-1).options.gain,.4);
});
