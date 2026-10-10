const test=require('node:test'),assert=require('node:assert/strict');
const Controls=require('../games/moonlight-hollow/controls.js');
class Target{
  constructor(){this.events={};this.captured=new Set();this.style={};this.clientWidth=800;this.clientHeight=600;this.classList={add(){},remove(){}};}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  removeEventListener(type,fn){this.events[type]=(this.events[type]||[]).filter(v=>v!==fn);}
  setPointerCapture(id){this.captured.add(id);}
  hasPointerCapture(id){return this.captured.has(id);}
  releasePointerCapture(id){this.captured.delete(id);}
  getBoundingClientRect(){return {left:0,top:0,width:128,height:128};}
  emit(type,id,x,y,stamp=0){const e={pointerId:id,clientX:x,clientY:y,pointerType:'touch',button:0,timeStamp:stamp,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};for(const fn of this.events[type]||[])fn(e);return e;}
}
function fixture(){const canvas=new Target(),joystick=new Target(),knob=new Target(),state={enabled:true,moves:[],orbits:[],zooms:[],taps:[],cancelled:0};const controls=Controls.create({canvas,joystick,knob,enabled:()=>state.enabled,movement:(x,y)=>state.moves.push([x,y]),orbit:(x,y)=>state.orbits.push([x,y]),zoom:r=>state.zooms.push(r),tap:(x,y)=>state.taps.push([x,y]),cancelMove:()=>state.cancelled++});return {canvas,joystick,knob,state,controls};}
test('joystick has a dead zone, proportional speed and a circular range',()=>{
  assert.deepEqual(Controls.stickVector(0,0,40),{x:0,y:0,knobX:0,knobY:0});assert.equal(Controls.stickVector(3,0,40).x,0);
  const half=Controls.stickVector(20,0,40);assert(half.x>.4&&half.x<.5);assert.equal(half.y,0);
  const diagonal=Controls.stickVector(100,100,40);assert(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1)<1e-9);assert(Math.abs(Math.hypot(diagonal.knobX,diagonal.knobY)-40)<1e-9);
});
test('a second thumb cannot steal the joystick and capture loss stops walking',()=>{
  const f=fixture();f.joystick.emit('pointerdown',1,84,64);const first=f.state.moves.at(-1);f.joystick.emit('pointerdown',2,0,0);f.joystick.emit('pointermove',2,120,120);assert.deepEqual(f.state.moves.at(-1),first);f.joystick.emit('pointerup',2,0,0);assert.deepEqual(f.state.moves.at(-1),first);f.joystick.emit('lostpointercapture',1,0,0);assert.deepEqual(f.state.moves.at(-1),[0,0]);assert.equal(f.knob.style.transform,'');f.controls.dispose();
});
test('only short stationary taps walk; camera drags do not walk',()=>{
  const f=fixture();f.canvas.emit('pointerdown',1,100,100,100);f.canvas.emit('pointerup',1,104,102,200);assert.deepEqual(f.state.taps,[[104,102]]);
  f.canvas.emit('pointerdown',2,100,100,300);f.canvas.emit('pointermove',2,140,120,340);f.canvas.emit('pointerup',2,140,120,400);assert.equal(f.state.taps.length,1);assert.equal(f.state.orbits.length,1);assert(f.state.orbits[0][0]>0);assert(f.state.orbits[0][1]>0);
  f.canvas.emit('pointerdown',3,100,100,500);f.canvas.emit('pointerup',3,100,100,1100);assert.equal(f.state.taps.length,1);f.controls.dispose();
});
test('pinching zooms proportionally, avoids orbiting and suppresses taps from both fingers',()=>{
  const f=fixture();f.canvas.emit('pointerdown',1,100,100);f.canvas.emit('pointerdown',2,200,100);f.canvas.emit('pointermove',2,220,100);assert(Math.abs(f.state.zooms[0]-100/120)<1e-9);assert.equal(f.state.orbits.length,0);f.canvas.emit('pointerup',2,220,100);f.canvas.emit('pointerup',1,100,100);assert.equal(f.state.taps.length,0);f.controls.dispose();
});
test('movement and camera drag work simultaneously with different pointer owners',()=>{
  const f=fixture();f.joystick.emit('pointerdown',1,64,30);const movement=f.state.moves.at(-1);f.canvas.emit('pointerdown',2,300,200);f.canvas.emit('pointermove',2,340,200);assert.deepEqual(f.state.moves.at(-1),movement);assert.equal(f.state.orbits.length,1);f.canvas.emit('pointerup',2,340,200);assert.deepEqual(f.state.moves.at(-1),movement);f.joystick.emit('pointerup',1,64,30);assert.deepEqual(f.state.moves.at(-1),[0,0]);f.controls.dispose();
});
test('puzzles and dialogs retain their pointer events; entering them cancels existing gestures',()=>{
  const f=fixture();f.state.enabled=false;const e=f.canvas.emit('pointerdown',1,100,100);assert.equal(e.stopped,undefined);f.joystick.emit('pointerdown',2,64,30);assert.equal(f.state.moves.length,0);
  f.state.enabled=true;f.canvas.emit('pointerdown',1,100,100);f.joystick.emit('pointerdown',2,64,30);f.state.enabled=false;f.controls.reset();assert.deepEqual(f.state.moves.at(-1),[0,0]);f.state.enabled=true;f.canvas.emit('pointerup',1,100,100);assert.equal(f.state.taps.length,0);f.controls.dispose();
});
test('pointer cancellation and disposal never generate a walking tap',()=>{
  const f=fixture();f.canvas.emit('pointerdown',1,100,100);f.canvas.emit('pointercancel',1,100,100);assert.equal(f.state.taps.length,0);f.controls.dispose();assert(Object.values(f.canvas.events).every(a=>a.length===0));
});
