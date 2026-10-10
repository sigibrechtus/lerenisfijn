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
// Activity framing keeps a person's eye height; only distance and field of view fit content.
function lowEyeFrame(bounds,aspect,supportY,eyeHeight=2.08,maxDistance=18){
  const position={x:(bounds.min.x+bounds.max.x)/2,y:supportY+eyeHeight,z:0};
  const target={x:position.x,y:clamp((bounds.min.y+bounds.max.y)/2,supportY+.8,supportY+eyeHeight+.6),z:(bounds.min.z+bounds.max.z)/2};
  let result;
  // Cap horizontal FOV as well, so a short landscape viewport does not become a fisheye.
  const horizontalLimit=1.65,maxVertical=2*Math.atan(Math.tan(horizontalLimit/2)/Math.max(.01,aspect));
  for(const preferredFov of [.9,1.05,1.2])for(let distance=3;distance<=maxDistance;distance+=.125){
    const fov=Math.min(preferredFov,maxVertical);
    position.z=bounds.min.z-distance;
    const pitch=Math.atan2(position.y-target.y,target.z-position.z),s=Math.sin(pitch),c=Math.cos(pitch),tanV=Math.tan(fov/2),tanH=tanV*Math.max(.01,aspect);
    let fits=true;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
      const dx=x-position.x,dy=y-position.y,dz=z-position.z,depth=dz*c-dy*s,up=dy*c+dz*s;
      if(depth<=.2||Math.abs(dx)>depth*tanH/1.12||Math.abs(up)>depth*tanV/1.12)fits=false;
    }
    if(fits){const candidate={position:{...position},target:{...target},pitch,fov,horizontalFov:2*Math.atan(tanH),distance};if(!result||distance<result.distance)result=candidate;break;}
  }
  if(!result)throw Error('Activity layout exceeds the low eye camera frame');
  return result;
}
function angleDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
function ease(t){t=clamp(t,0,1);return t*t*(3-2*t);}
const api={followWeight,safeFrame,fit,lowEyeFrame,angleDelta,ease};root.MoonCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
