'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'../games/moonlight-hollow/attractions.css'),'utf8');
const latest=css.slice(css.indexOf('/* Broom Flight: reserve a stable question area'));
test('flight mission grows with feedback and question instead of clipping',()=>{
 assert.match(latest,/\.mini-mission\s*\{[^}]*height:auto!important;[^}]*max-height:none!important;[^}]*overflow:visible!important/s);
 assert.match(latest,/#mini-feedback:not\(:empty\)\s*\{[^}]*white-space:normal!important;[^}]*overflow:visible!important/s);
 assert.match(latest,/#mini-question\s*\{[^}]*max-height:none!important;[^}]*white-space:pre!important;[^}]*overflow:visible!important/s);
});
test('portrait flight HUD reserves full-width mission below corner controls',()=>{
 assert.match(latest,/@media\(max-width:680px\)\s*\{[\s\S]*?\.mini-mission\s*\{[^}]*top:116px!important;[^}]*width:calc\(100vw - 20px\)!important/s);
});
