'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Course=require('../games/moonlight-hollow/broom-course.js');

test('Broom Flight uses six extended sections with a free outrun',()=>{
 assert.equal(Course.SECTIONS,6);
 assert.equal(Course.SECTION,48);
 assert(Course.OUTRUN>=40);
 assert.equal(Course.LENGTH,Course.SECTIONS*Course.SECTION);
 for(let stage=0;stage<Course.SECTIONS;stage++){
  const section=Course.travel(stage,1);
  assert.equal(section.start,stage*Course.SECTION);
  assert.equal(section.end,(stage+1)*Course.SECTION);
  for(const gate of section.gates){
   assert(gate.z>section.start+30&&gate.z<section.end-7);
  }
 }
 const last=Course.gate(Course.SECTIONS-1,1,1);
 assert(Course.LENGTH+Course.OUTRUN-last.z>=40,'finish provides substantial flight after final gate');
});

test('extended course centreline remains defined throughout the outrun',()=>{
 for(let z=-4;z<=Course.LENGTH+Course.OUTRUN;z+=4){
  for(const level of [1,2,3]){
   const center=Course.center(z,level);
   assert(Number.isFinite(center.x)&&Number.isFinite(center.rise)&&Number.isFinite(center.heading));
  }
 }
});
