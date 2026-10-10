/* Deterministic session sky/weather clock. No wall-clock timers or allocations of meshes. */
(function(root){'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function sample(seconds,setting='auto'){
 const phase=((seconds/600+.46)%1+1)%1,angle=phase*Math.PI*2,day=smooth((Math.sin(angle)+.15)/.55),w=((seconds%180)+180)%180;
 let fog=smooth((w-15)/18)*(1-smooth((w-65)/20)),storm=smooth((w-95)/18)*(1-smooth((w-150)/20)),rain=smooth((w-78)/18)*(1-smooth((w-162)/18));
 if(setting!=='auto'&&['clear','fog','rain','storm'].includes(setting)){fog=setting==='fog'?1:0;storm=setting==='storm'?1:0;rain=['rain','storm'].includes(setting)?1:0;}
 const wind=.2+storm*.55+rain*.15,haze=(1-day)*.15+fog*.6;
 return{phase,angle,day,fog,storm,rain,wind,haze,cloud:Math.max(fog*.25,rain*.7,storm),fogDensity:.003+fog*.009+storm*.003,period:day>.7?'day':day<.12?'night':'twilight',weather:storm>.3?'storm':rain>.3?'rain':fog>.3?'fog':'clear'};
}
function create(){let elapsed=0,nextBolt=119,thunderAt=null,setting='auto';return{
 tick(dt,{active=true,reduced=false,weather='auto'}={}){let bolt=false,thunder=false;const changed=weather!==setting;setting=weather;if(changed){thunderAt=null;nextBolt=setting==='storm'?elapsed+8:Math.floor(elapsed/180)*180+119;if(nextBolt<=elapsed)nextBolt+=180;}
 if(active&&!reduced){elapsed+=Math.max(0,Math.min(.04,Number(dt)||0));if(elapsed>=nextBolt){if(sample(elapsed,setting).storm>.3){bolt=true;thunderAt=elapsed+1.4;}nextBolt+=setting==='storm'?23:nextBolt%180<140?23:157;}if(thunderAt!==null&&elapsed>=thunderAt){thunder=sample(elapsed,setting).storm>.3;thunderAt=null;}}else thunderAt=null;return{...sample(elapsed,setting),elapsed,bolt,thunder,wisp:!reduced&&active&&elapsed%75>55&&elapsed%75<65};},
 snapshot(){return sample(elapsed,setting);}
};}
const api={sample,create};root.MoonAtmosphere=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
