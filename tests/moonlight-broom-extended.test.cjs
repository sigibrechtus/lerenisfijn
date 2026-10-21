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

test('extended outrun adds smooth curves and altitude without changing quiz gates',()=>{
 assert(Course.OUTRUN>=75,'finale offers meaningful free-flight distance');
 for(const level of [1,2,3]){
  const a=Course.center(Course.LENGTH,level),b=Course.center(Course.LENGTH+.01,level);
  assert(Math.abs(a.x-b.x)<.02&&Math.abs(a.rise-b.rise)<.02,'outrun entry has no position jump');
  let previous=a,xmin=a.x,xmax=a.x,ymin=a.rise,ymax=a.rise;
  for(let z=Course.LENGTH+.5;z<=Course.LENGTH+Course.OUTRUN;z+=.5){
   const p=Course.center(z,level);xmin=Math.min(xmin,p.x);xmax=Math.max(xmax,p.x);ymin=Math.min(ymin,p.rise);ymax=Math.max(ymax,p.rise);
   assert(Math.abs(p.x-previous.x)<.5&&Math.abs(p.rise-previous.rise)<.3,'finale is smooth and flyable');previous=p;
  }
  assert(xmax-xmin>.8&&ymax-ymin>.3,'finale contains visible scenery-following bends and elevation');
  for(let stage=0;stage<Course.SECTIONS;stage++)assert(Course.gate(stage,1,level).z<Course.LENGTH,'quiz gates remain before the free outrun');
 }
});
