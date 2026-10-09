/* Deterministic, dependency-free follow and perspective framing calculations. */
(function(root){'use strict';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function followWeight(dt){return 1-Math.exp(-24*Math.max(0,dt));}
function safeFrame(width,height,headerBottom=0,panelTop=height){
  width=Math.max(1,width);height=Math.max(1,height);
  const margin=Math.min(12,width*.025),top=clamp(headerBottom+10,0,height-1);
  const bottom=clamp(panelTop-12,top+1,height);
  return{x:margin/width,y:(height-bottom)/height,width:Math.max(.01,(width-2*margin)/width),height:Math.max(1/height,(bottom-top)/height)};
}
function fit(bounds,aspect,fov=.8,beta=.62,alpha=-Math.PI/2){
  const target={x:(bounds.min.x+bounds.max.x)/2,y:(bounds.min.y+bounds.max.y)/2,z:(bounds.min.z+bounds.max.z)/2};
  const sinA=Math.sin(alpha),cosA=Math.cos(alpha),sinB=Math.sin(beta),cosB=Math.cos(beta);
  const offset={x:cosA*sinB,y:cosB,z:sinA*sinB},right={x:-sinA,y:0,z:cosA},up={x:-cosA*cosB,y:sinB,z:-sinA*cosB};
  const tanV=Math.tan(fov/2),tanH=tanV*Math.max(.01,aspect);let radius=2;
  // Fit every bounding-box corner, including perspective depth, with a 12% framing margin.
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const d={x:x-target.x,y:y-target.y,z:z-target.z};const dot=v=>d.x*v.x+d.y*v.y+d.z*v.z;
    radius=Math.max(radius,dot(offset)+1.12*Math.max(Math.abs(dot(right))/tanH,Math.abs(dot(up))/tanV),dot(offset)+.5);
  }
  return{target,alpha,beta,radius};
}
function angleDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
const api={followWeight,safeFrame,fit,angleDelta,ease};root.MoonCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
