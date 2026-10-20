const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const G=require('../games/moonlight-hollow/graphics.js');
const base=path.join(__dirname,'../games/moonlight-hollow');

test('Sharp mode produces a UHD framebuffer from a desktop 1080p viewport',()=>{
 const p=G.profile('sharp',1920,1080,1);
 assert.equal(p.ratio,2);
 assert.equal(1920*p.ratio,3840);
 assert.equal(1080*p.ratio,2160);
 assert.equal(p.pixels,3840*2160);
 assert.equal(p.shadow,1024);
 assert.equal(p.glow,false);
 assert.equal(p.fxaa,false);
 assert(G.profile('high',1920,1080,1).pixels<p.pixels);
});

test('Sharp mode respects phone native pixels and caps all framebuffers at 4K',()=>{
 const phone=G.profile('sharp',390,844,3);
 assert.equal(phone.ratio,3);
 assert.equal(390*phone.ratio,1170);
 assert.equal(844*phone.ratio,2532);
 for(const [w,h,dpr] of [[390,844,3],[844,390,3],[1024,768,2],[1920,1080,1],[3840,2160,1],[5120,2880,2]]){
  const p=G.profile('sharp',w,h,dpr);
  assert(w*h*p.ratio*p.ratio<=3840*2160+1);
  assert(p.ratio<=Math.max(2,Math.min(3,dpr))+1e-9);
 }
});

test('Sharp separates screen resolution from device-safe material detail',()=>{
 assert.equal(G.textureTier('sharp',false),'high');
 assert.equal(G.textureTier('sharp',true),'balanced');
 assert.equal(G.textureTier('low',false),'low');
});

test('Sharp selector remains wired to scene quality and optional mini-game geometry',()=>{
 const read=file=>fs.readFileSync(path.join(base,file),'utf8');
 const html=read('index.html'),world=read('world.js'),app=read('adventure.js'),mini=read('attraction-ui.js'),sw=read('sw.js');
 assert.match(html,/<option value="sharp">/);
 assert.match(html,/id="quality-help"/);
 assert.match(app,/'close',applyGraphicsSettings/);
 assert.match(world,/\['auto','high','low','sharp'\]/);
 assert.match(world,/G\.textureTier\(tier,mobileSafari\)/);
 assert.match(mini,/\['low','sharp'\]/);
 assert.match(mini,/value==='auto'\?'balanced':value/);
 for(const asset of ['graphics.js','world.js','adventure.js','attraction-ui.js']){
  const script=html.match(new RegExp(asset.replace('.','\\.')+'\\?v=\\d+'));
  assert(script,'missing script version for '+asset);
  assert(sw.includes('./'+script[0]),'offline cache missing '+script[0]);
 }
});
