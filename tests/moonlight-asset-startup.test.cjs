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
 const version=html.match(/src="campaign\\.js\\?v=(\\d+)"/);
 assert.ok(version,'HTML must load a versioned campaign');
 const cached=[...sw.matchAll(/"\\.\\/campaign\\.js\\?v=(\\d+)"/g)].map(m=>m[1]);
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

