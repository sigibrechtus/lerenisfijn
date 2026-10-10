/* Exploration gestures. Puzzle pointer events retain their own object interactions. */
(function(root){'use strict';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function stickVector(dx,dy,radius,deadZone=.12){
  const distance=Math.hypot(dx,dy),amount=clamp(distance/Math.max(1,radius),0,1);
  const strength=amount<=deadZone?0:(amount-deadZone)/(1-deadZone);
  return {x:distance?dx/distance*strength:0,y:distance?dy/distance*strength:0,
    knobX:distance?dx/distance*amount*radius:0,knobY:distance?dy/distance*amount*radius:0};
}
function create(options){
  const {canvas,joystick,knob}=options,pointers=new Map(),listeners=[];
  let stickId=null,pinch=0,multiTouch=false;
  const enabled=()=>options.enabled(),consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
  function listen(target,type,fn,capture=false){if(!target?.addEventListener)return;target.addEventListener(type,fn,{capture,passive:false});listeners.push(()=>target.removeEventListener(type,fn,capture));}
  function capture(target,id){try{target.setPointerCapture?.(id);}catch(_){}}
  function release(target,id){try{if(target.hasPointerCapture?.(id))target.releasePointerCapture(id);}catch(_){}}
  function resetStick(){const id=stickId;stickId=null;options.movement(0,0);if(knob)knob.style.transform='';joystick?.classList?.remove('active');if(id!==null)release(joystick,id);}
  function moveStick(e){if(e.pointerId!==stickId)return;const r=joystick.getBoundingClientRect(),radius=Math.max(1,(r.width-(knob?.offsetWidth||46))/2-2),v=stickVector(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2,radius);options.movement(v.x,v.y);if(knob)knob.style.transform=`translate(${v.knobX}px,${v.knobY}px)`;}
  listen(joystick,'pointerdown',e=>{if(!enabled()||e.button!==0)return;consume(e);if(stickId!==null)return;stickId=e.pointerId;capture(joystick,stickId);joystick.classList?.add('active');options.cancelMove?.();moveStick(e);});
  listen(joystick,'pointermove',e=>{if(stickId!==e.pointerId)return;consume(e);if(!enabled())resetStick();else moveStick(e);});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(joystick,type,e=>{if(e.pointerId===stickId)resetStick();});
  const distance=()=>{const [a,b]=pointers.values();return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0;};
  listen(canvas,'pointerdown',e=>{
    if(e.pointerType!=='touch'||!enabled())return;consume(e);
    if(pointers.size>=2)return;
    const stamp=typeof e.timeStamp==='number'?e.timeStamp:Date.now();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,stamp,dragged:false});
    capture(canvas,e.pointerId);options.cancelMove?.();
    if(pointers.size===2){multiTouch=true;pinch=distance();for(const p of pointers.values())p.dragged=true;}
  },true);
  listen(canvas,'pointermove',e=>{
    const p=pointers.get(e.pointerId);if(!p)return;consume(e);
    if(!enabled()){reset();return;}
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(pointers.size===2){const next=distance();if(pinch>4&&next>4)options.zoom(clamp(pinch/next,.75,1.33));pinch=next;return;}
    const travel=Math.hypot(p.x-p.startX,p.y-p.startY),wasDragging=p.dragged;
    if(travel>8)p.dragged=true;
    if(p.dragged){const size=options.viewport?.()||{width:canvas.clientWidth,height:canvas.clientHeight};
      options.orbit((wasDragging?dx:p.x-p.startX)/Math.max(320,size.width),(wasDragging?dy:p.y-p.startY)/Math.max(320,size.height));}
  },true);
  function finish(e,cancelled){const p=pointers.get(e.pointerId);if(!p)return;consume(e);pointers.delete(e.pointerId);release(canvas,e.pointerId);
    const stamp=typeof e.timeStamp==='number'?e.timeStamp:Date.now();
    if(!cancelled&&enabled()&&!p.dragged&&!multiTouch&&stamp-p.stamp<500&&Math.hypot(e.clientX-p.startX,e.clientY-p.startY)<=8)options.tap(e.clientX,e.clientY);
    pinch=0;if(!pointers.size)multiTouch=false;else for(const remaining of pointers.values()){remaining.startX=remaining.x;remaining.startY=remaining.y;remaining.dragged=true;}
  }
  listen(canvas,'pointerup',e=>finish(e,false),true);
  listen(canvas,'pointercancel',e=>finish(e,true),true);
  listen(canvas,'lostpointercapture',e=>finish(e,true),true);
  function reset(){const ids=[...pointers.keys()];pointers.clear();pinch=0;multiTouch=false;for(const id of ids)release(canvas,id);resetStick();options.cancelMove?.();}
  listen(root,'blur',reset);listen(root,'pagehide',reset);listen(root,'resize',reset);
  listen(root.document,'visibilitychange',()=>{if(root.document.hidden)reset();});
  return {reset,dispose(){reset();listeners.forEach(fn=>fn());}};
}
const api={stickVector,create};root.MoonControls=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
