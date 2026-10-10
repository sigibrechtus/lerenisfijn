const test=require('node:test'),assert=require('node:assert/strict');
const G=require('../games/moonlight-hollow/graphics.js');
test('new script dependencies exist and are included in the offline release',()=>{
  const fs=require('node:fs'),path=require('node:path'),base=path.join(__dirname,'../games/moonlight-hollow');
  const html=fs.readFileSync(path.join(base,'index.html'),'utf8'),sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
  const scripts=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(m=>m[1]);
  const cachedScripts=[...scripts,...[...fs.readFileSync(path.join(base,'legacy.html'),'utf8').matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1])];
  for(const name of cachedScripts){assert(fs.existsSync(path.join(base,name.split('?')[0])),name);assert(sw.includes("'./"+name+"'"),name+' must be cached');}
  for(const dependency of ['controls.js?v=8','graphics.js?v=9','railway.js?v=11','atmosphere.js?v=13'])assert(scripts.indexOf(dependency)<scripts.indexOf('world.js?v=13'));
});
test('graphics budgets keep phones sharp and bound framebuffer cost on large screens',()=>{
  const phone=G.profile('balanced',390,844,3);assert.equal(phone.ratio,1.5);assert.equal(phone.scaling,2/3);assert.equal(phone.glow,true);
  for(const [width,height,dpr]of [[1920,1080,1],[3840,2160,2],[390,844,3],[844,390,3]])for(const tier of ['low','balanced','high']){
    const p=G.profile(tier,width,height,dpr);assert(width*height*p.ratio*p.ratio<=p.pixels+1);assert(Number.isFinite(p.scaling)&&p.scaling>0);
  }
  assert.equal(G.profile('high',1920,1080,1).shadow,2048);assert.equal(G.profile('low',390,844,3).glow,false);
});
test('auto quality starts balanced, responds to sustained slowness and can recover',()=>{
  const a=G.adaptive();assert.equal(a.tier(),'balanced');let changes=[];
  for(let i=0;i<240;i++){const changed=a.sample(1/25);if(changed)changes.push(changed);}
  assert.deepEqual(changes,['low']);
  for(let i=0;i<2400;i++){const changed=a.sample(1/60);if(changed)changes.push(changed);}
  assert.deepEqual(changes,['low','balanced','high']);a.reset();assert.equal(a.tier(),'balanced');
});
test('background gaps and isolated stutters do not trigger a quality reduction',()=>{
  const a=G.adaptive();for(let i=0;i<180;i++)a.sample(1/60);assert.equal(a.sample(4),null);for(let i=0;i<120;i++){assert.equal(a.sample(i===60?.2:1/60),null);}assert.equal(a.tier(),'balanced');
});

test('auto quality reduces under sustained slow frames and repeated active stalls',()=>{
  for(const cadence of [[.3],[1/60,1/60,1/60,1/60,.3],[1/60,1/60,1/60,1/60,1.2],[3]]){
    const a=G.adaptive(),changes=[];
    for(let i=0;i<300;i++){const changed=a.sample(cadence[i%cadence.length]);if(changed)changes.push(changed);}
    assert.deepEqual(changes,['low'],JSON.stringify(cadence));
    a.reset();assert.equal(a.sample(4),null);assert.equal(a.tier(),'balanced');
  }
  const a=G.adaptive();for(let i=0;i<180;i++)a.sample(1/60);
  for(let i=0;i<100;i++)a.sample(.3);assert.equal(a.tier(),'low');
  for(let i=0;i<2400;i++)a.sample(1/60);assert.equal(a.tier(),'high');
});
