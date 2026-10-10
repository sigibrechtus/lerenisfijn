/* Deterministic session sky/weather clock. No wall-clock timers or allocations of meshes. */
(function(root){'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function sample(seconds){
 const phase=((seconds/600+.46)%1+1)%1,angle=phase*Math.PI*2,day=smooth((Math.sin(angle)+.15)/.55),w=((seconds%180)+180)%180;
 const fog=smooth((w-15)/18)*(1-smooth((w-65)/20)),storm=smooth((w-95)/18)*(1-smooth((w-150)/20));
 return{phase,angle,day,fog,storm,fogDensity:.003+fog*.009+storm*.003,period:day>.7?'day':day<.12?'night':'twilight',weather:storm>.3?'storm':fog>.3?'fog':'clear'};
}
function create(){let elapsed=0,nextBolt=119,thunderAt=null;return{
 tick(dt,{active=true,reduced=false}={}){let bolt=false,thunder=false;if(active&&!reduced){elapsed+=Math.max(0,Math.min(.04,Number(dt)||0));if(elapsed>=nextBolt){bolt=true;thunderAt=elapsed+1.4;nextBolt+=nextBolt%180<140?23:157;}if(thunderAt!==null&&elapsed>=thunderAt){thunder=true;thunderAt=null;}}else thunderAt=null;return{...sample(elapsed),elapsed,bolt,thunder,wisp:!reduced&&active&&elapsed%75>55&&elapsed%75<65};},
 snapshot(){return sample(elapsed);}
};}
const api={sample,create};root.MoonAtmosphere=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
