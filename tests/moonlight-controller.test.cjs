/* Runs the full shipped DOM controller. This verifies wiring, not browser pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function boot(){const base=path.join(__dirname,'../games/moonlight-hollow'),elements=new Map();
 class Element{constructor(id=''){this.id=id;this.children=[];this.hidden=false;this.style={setProperty(){}};this.dataset={};this.attributes={};this.value='';this.classList={add(){},remove(){},toggle(){}};}replaceChildren(...c){this.children=c;}append(...c){this.children.push(...c);}setAttribute(k,v){this.attributes[k]=v;}focus(){}querySelector(){return new Element();}querySelectorAll(){return this.children;}getBoundingClientRect(){return {width:390,height:844,bottom:80,top:500};}get options(){return this.children;}showModal(){this.open=true;}close(){this.open=false;}}
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');for(const [,id]of html.matchAll(/id="([^"]+)"/g))elements.set(id,new Element(id));elements.get('transition').hidden=true;for(const v of ['auto','clear','fog','rain','storm']){const o=new Element();o.value=v;elements.get('weather').children.push(o);}const document={documentElement:new Element(),body:new Element(),hidden:false,getElementById:id=>elements.get(id),createElement:()=>new Element(),querySelector:q=>q==='header'?new Element():null,querySelectorAll:()=>[],addEventListener(){}};
 const audio={unlock:async()=>true,setMusic(){},setAmbience(){},preloadEffects(){},play(){},weather(){},position(){},listener(){},update(){},state:()=>({})};const world={avatar(){},updateWorld(){},quality(){},start(){},enter(){},leave(){},select(){},refit(){},change(){}};
 const ctx={document,localStorage:{getItem:()=>null,setItem(){}},matchMedia:()=>({matches:false}),crypto:{randomUUID:()=> 'id'},console,navigator:{},addEventListener(){},MoonWorld:{create:()=>world},MoonAudio:{TRACKS:['menu','village','woods','garden','library','tower','castle','festival'],EFFECTS:['ui'],create:()=>audio}};ctx.window=ctx;vm.createContext(ctx);for(const file of ['learning-content.js','variety.js','engine.js','campaign.js','camera.js','hud.js','landscape.js','railway.js','puzzle-actions.js','adventure.js'])vm.runInContext(fs.readFileSync(path.join(base,file),'utf8'),ctx);return {ctx,elements};
}
test('full controller boots, persists theme changes, and opens each bilingual exercise',()=>{const {ctx,elements:e}=boot();assert.equal(ctx.document.documentElement.dataset.theme,'halloween');e.get('theme').value='christmas';e.get('theme').onchange();assert.equal(ctx.document.documentElement.dataset.theme,'christmas');for(const lang of ['nl','fr'])for(let i=0;i<30;i++){vm.runInContext(`state.prefs.lang='${lang}';q=C.make(${i},2,state.prefs.lang);a=C.initial(q);openPuzzle();`,ctx);assert(e.get('puzzle-title').textContent.length);assert(e.get('puzzle-how').textContent.length>50);assert(e.get('object-controls').children.length>0);vm.runInContext('leavePuzzle()',ctx);}});

test('campaign revisits vary at the same level while resuming retains the saved question and answer',()=>{
 const {ctx}=boot(),recent=[];
 for(let visit=0;visit<20;visit++){
  vm.runInContext("interact('bridge')",ctx);const key=vm.runInContext('MoonVariety.signature(q)',ctx);assert(!recent.slice(-12).includes(key));recent.push(key);
  vm.runInContext('setAnswer(q.targets.map((_,i)=>i===0?1:0));leavePuzzle()',ctx);
 }
 assert.equal(vm.runInContext("P().practiceHistory['0/1/nl'].length",ctx),12);assert.equal(vm.runInContext('P().practiceNonce',ctx),20);
 const saved=vm.runInContext('JSON.stringify(P().draft)',ctx);vm.runInContext('start()',ctx);assert.equal(vm.runInContext('JSON.stringify({q,a,attempts,assisted,hints,selected})',ctx),saved);
});


test('vehicle viewport reserves the mission and held-controls rectangles',()=>{
 const {ctx,elements:e}=boot();e.get('world').getBoundingClientRect=()=>({top:0,width:844,height:390});
 e.get('mini-panel').querySelector=()=>({getBoundingClientRect:()=>({bottom:175})});e.get('mini-driving').getBoundingClientRect=()=>({top:320});e.get('mini-driving').hidden=false;
 const frame=vm.runInContext("attractions={active:'broom'};exerciseFrame()",ctx);
 assert.equal(Math.round((1-frame.y-frame.height)*390),185);assert.equal(Math.round((1-frame.y)*390),308);
});
