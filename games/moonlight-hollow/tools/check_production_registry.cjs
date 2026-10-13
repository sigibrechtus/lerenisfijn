/* Track ALL literal 3D mesh names, not just a hand-picked subset.
   Fails on newly introduced, unregistered scene components.
   This is a coverage gate; it does not claim that pending assets are finished. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const register=JSON.parse(fs.readFileSync(path.join(root,'assets/production-registry.json'),'utf8'));
const sources=register.sources;
const seen=new Set(),registered=new Set(register.sourceMeshRecords.map(r=>r.key));
for(const sourceName of sources){
 const source=fs.readFileSync(path.join(root,sourceName),'utf8');
 const pattern=/\b(?:box|ell|ball|cyl|mesh|child|prop|part)\s*\(\s*(?:'Create\w+'\s*,\s*)?['"]([a-z][a-z0-9-]{1,60})['"]/g;
 for(const match of source.matchAll(pattern))seen.add(sourceName+':'+match[1]);
}
const missing=[...seen].filter(key=>!registered.has(key));
const obsolete=[...registered].filter(key=>!seen.has(key));
assert.equal(missing.length,0,'Mesh names absent from production registry: '+missing.join(', '));
assert.equal(obsolete.length,0,'Unused registered mesh names: '+obsolete.join(', '));
assert.equal(register.families.reduce((n,f)=>n+f.sourceCount,0),register.sourceMeshRecords.length);
assert.equal(register.counts.sourceMeshIdentifiers,register.sourceMeshRecords.length);
for(const item of register.sourceMeshRecords){
 assert.ok(register.families.some(f=>f.id===item.family),'Unknown family: '+item.key);
}
const pending=register.families.filter(f=>f.status.qa!=='live_browser_verified');
console.log('Inventory coverage:',seen.size,'scene mesh names across',sources.length,'scripts');
console.log('Production families:',register.families.length,'pending final WebGL QA:',pending.length);
console.log('Note: inventory coverage is NOT completed visual-model production.');
