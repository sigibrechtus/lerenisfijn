'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../games/moonlight-hollow');
const worldSource=fs.readFileSync(path.join(base,'world.js'),'utf8');
test('HD model cannot spawn independently in village: no asynchronous production locomotive import',()=>{
 assert.doesNotMatch(worldSource,/placeProduction\(scene,'moon-express-locomotive'/);
 assert.match(worldSource,/new B\.TransformNode\('moon-express-locomotive-front',scene\)/);
 assert.match(worldSource,/const boiler=cyl\('express-hd-boiler'/);
});
test('single locomotive is parented directly to moving railway node',()=>{
 assert.match(worldSource,/const locomotivePose=R\.track\.pose\(state\.distance\+state\.direction\*locomotiveLead\)/);
 assert.match(worldSource,/box\('express-cab-roof',[^\n]*locomotiveMount\)/);
 assert.match(worldSource,/locomotiveMount\.position\.set\(initialEnginePose\.x/);
});
test('HTML and service worker publish the same versioned train scripts',()=>{
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 for(const name of ['asset-library.js','world.js','adventure.js']){
  const version=html.match(new RegExp('src="'+name.replace('.','\\.')+'\\?v=\\d+"'));
  assert.ok(version,name+' must have versioned HTML script');
  assert.ok(sw.includes('./'+version[0].slice(5,-1)),name+' service-worker version must match');
 }
 assert.match(sw,/moonlight-hollow-3d-v\d+/);
});
test('service worker precaches only the HTML campaign version',()=>{
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 const version=html.match(/src="campaign[.]js[?]v=([0-9]+)"/);
 assert.ok(version,'HTML must load a versioned campaign');
 const cached=sw.split('"./campaign.js?v=').slice(1).map(fragment=>fragment.split('"')[0]);
 assert.deepEqual(cached,[version[1]],'cache must not retain an outdated campaign URL');
});
test('boarding and moving never hide the production locomotive; ride camera is inside hero cabin',()=>{
 const src=fs.readFileSync(path.join(base,'world.js'),'utf8');
 const board=src.slice(src.indexOf('function boardTrain('),src.indexOf('function tickRide(',src.indexOf('function boardTrain(')));
 const tick=src.slice(src.indexOf('function tickRide('),src.indexOf('function interactable(',src.indexOf('function tickRide(')));
 const finish=src.slice(src.indexOf('function finishRide('),src.indexOf('function nearbyStation('));
 assert.doesNotMatch(board,/productionTrain\?\.setEnabled\(false\)/);
 assert.doesNotMatch(tick,/productionTrain\?\.setEnabled\(false\)/);
 assert.doesNotMatch(finish,/productionTrain\?\.setEnabled\(true\)/);
 assert.match(board,/hero\.parent=train/);
 assert.match(board,/rideCamera\.position\.set\(-4\*railMotion\.snapshot\(\)\.direction,1\.82,-1\.7\)/);
 assert.match(tick,/rideCamera\.position\.set\(-4\*state\.direction\*\(1-t\),1\.82,-1\.7\)/);
 assert.match(src,/function moveTrain\(state,rollDistance=0\)\{train\.position\.set\(state\.x,typeof terrainHeight==='function'\?terrainHeight\(state\.x,state\.z\):0,state\.z\)/,'moving train follows the same terrain elevation as the rails');
});


test('Broom panorama imagery, scene module and cache versions ship together',()=>{
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 for(const name of ['broom-course.js?v=3','broom-atmosphere.js?v=3','mini-game-world.js?v=80']){
  assert(html.includes(name),'HTML missing '+name);assert(sw.includes(name),'service worker missing '+name);
 }
 const module=fs.readFileSync(path.join(base,'broom-atmosphere.js'),'utf8');
 for(const name of ['sky-moonlit.svg','forest-horizon.svg','castle-horizon.svg']){
  const file=path.join(base,'assets/broom',name);const content=fs.readFileSync(file,'utf8');
  assert(content.startsWith('<svg')&&content.length<7000,'lightweight original SVG image required: '+name);
  assert(module.includes('assets/broom/'+name),'texture must be mapped into Babylon scene');
  assert(sw.includes('./assets/broom/'+name),'precache must include background '+name);
 }
});

test('Broom Flight sky dome follows the flyer inside the far clipping plane',()=>{
 const atmosphere=fs.readFileSync(path.join(base,'broom-atmosphere.js'),'utf8');
 const runtime=fs.readFileSync(path.join(base,'mini-game-world.js'),'utf8');
 const sky=atmosphere.match(/const SKY_DIAMETER=(\d+);/);
 assert(sky,'sky dome must have an explicit bounded diameter');
 assert(Number(sky[1])/2<220,'sky dome radius must fit the flight camera far clipping distance');
 assert(atmosphere.includes('if(sky&&viewer)sky.position.copyFrom(viewer)'),'dome must follow the flying camera');
 assert(runtime.includes('camera.maxZ=220'),'test must track the flight camera far-plane contract');
});

test('Broom Flight horizon planes have upright texture UVs and flank both sides',()=>{
 const source=fs.readFileSync(path.join(base,'broom-atmosphere.js'),'utf8');
 const sky=fs.readFileSync(path.join(base,'assets/broom/sky-moonlit.svg'),'utf8');
 const sw=fs.readFileSync(path.join(base,'sw.js'),'utf8');
 assert(source.includes('new B.Texture(url,scene,false,alpha,'),'transparent horizon texture must flip its SVG Y axis');
 assert(source.includes('for(const side of [-1,1])'),'both sides of the flight path must have panorama layers');
 assert(source.includes('panoramaSide:side,panoramaUpright:true'),'side-facing art must carry orientation metadata');
 assert(source.includes('panel.rotation.y=side>0?-.55:.55'),'flanking billboards must face the flight corridor');
 assert(source.includes('const sideLayers=mobile?2:rich?4:3'),'panorama count must obey mobile-quality budget');
 assert(sky.includes('cx="760" cy="126" r="26"'),'moon must not dominate the iPhone sky');
 assert(sw.includes('sky-moonlit.svg?v=2'),'changed moon image must have a fresh URL in precache');
});
