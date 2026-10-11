const test=require('node:test'),assert=require('node:assert/strict'),B=require('../games/moonlight-hollow/vendor/babylon.js'),E=require('../games/moonlight-hollow/exercise-effects.js');
test('campaign feedback moves around actual action objects, pauses, and reuses a bounded pool',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),fx=E.create({B,scene}),object=B.MeshBuilder.CreateBox('chosen-object',{},scene),base=object.scaling.clone(),count=scene.meshes.length;
 for(const kind of ['pickup','pour','letter','clock','stone','riddle','tile','pattern','mirror','reset','hint','retry','solve','remove']){
  assert(fx.play(kind,{point:{x:9,y:2,z:-5},from:{x:7,y:3,z:-5},meshes:[object]}));assert.equal(fx.snapshot().active,kind);fx.tick(.1);const mote=scene.getMeshByName('exercise-action-mote'),before=mote.position.clone();assert(mote.position.x>=6&&mote.position.x<=10);assert.notEqual(object.scaling.x,base.x);fx.tick(.1,{paused:true});assert(mote.position.equals(before));for(let i=0;i<12;i++)fx.tick(.1);assert.equal(fx.snapshot().active,null);assert(object.scaling.equals(base));assert.equal(scene.meshes.length,count);
 }
 fx.dispose();fx.dispose();assert.equal(scene.meshes.length,1);assert.equal(scene.materials.length,0);scene.dispose();engine.dispose();
});
test('reduced motion gives brief visible feedback without moving the learning objects',()=>{
 const engine=new B.NullEngine(),scene=new B.Scene(engine),fx=E.create({B,scene}),object=B.MeshBuilder.CreateBox('test',{},scene);fx.play('pour',{point:{x:0,y:1,z:0},meshes:[object],reducedMotion:true});fx.tick(.05);assert.equal(object.scaling.x,1);assert(scene.getMeshByName('exercise-action-ring').isEnabled());assert(!scene.getMeshByName('exercise-action-mote').isEnabled());fx.clear();assert(!scene.getMeshByName('exercise-action-ring').isEnabled());fx.dispose();scene.dispose();engine.dispose();
});
