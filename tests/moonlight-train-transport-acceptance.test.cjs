'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../games/moonlight-hollow/world.js'),'utf8');
const R=require('../games/moonlight-hollow/railway.js');
test('only one locomotive exists, and its geometry belongs to railway mount',()=>{
 assert.equal((source.match(/new B.TransformNode\('moon-express-locomotive-front',scene\)/g)||[]).length,1);
 assert.match(source,/const locomotiveLead=4\.5/);
 assert.match(source,/const boiler=cyl\('express-hd-boiler',[\s\S]*locomotiveMount\)/);
 assert.match(source,/box\('express-cab-roof',[\s\S]*locomotiveMount\)/);
 assert.match(source,/box\('express-coupler',[\s\S]*locomotiveMount\)/);
 assert.doesNotMatch(source,/placeProduction\(scene,'moon-express-locomotive'/,'no detached HD GLB import may spawn at village origin');
 assert.doesNotMatch(source,/new B\.TransformNode\('moon-production-moon-express-locomotive'/);
});
test('locomotive and wagon follow separate points on the same railway',()=>{
 assert.match(source,/const locomotivePose=R\.track\.pose\(state\.distance\+state\.direction\*locomotiveLead\)/);
 assert.match(source,/locomotiveMount\.position\.set\(locomotivePose\.x/);
 assert.match(source,/train\.position\.set\(state\.x/);
 assert.match(source,/rideCamera\.parent=train/);
 const d=R.stations[0].distance;
 const wagon=R.track.pose(d),loco=R.track.pose(d+4.5);
 assert(Math.hypot(loco.x-wagon.x,loco.z-wagon.z)>3);
 assert.equal(typeof R.track.pose(d+20).heading,'number');
});
test('single locomotive is positioned before first render and railway retains passenger access',()=>{
 assert.match(source,/const initialEnginePose=R\.track\.pose\(railMotion\.snapshot\(\)\.distance\+railMotion\.snapshot\(\)\.direction\*locomotiveLead\)/);
 assert.match(source,/locomotiveMount\.position\.set\(initialEnginePose\.x/);
 assert.match(source,/box\('carriage-floor'[\s\S]*wood,train\)/);
 assert.match(source,/box\('passenger-seat'[\s\S]*trainMat,train\)/);
 assert.match(source,/function boardTrain\(/);
});
