/* Closed, arc-length parameterized railway. Passengers inherit one carriage transform. */
(function(root){'use strict';
const L=root.MoonLandscape||(typeof require==='function'?require('./landscape.js'):null),S=L.sites;
// Keep historical IDs 0 (village) and 1 (clock) valid in saved profiles.
const stations=[
 {id:'centre',x:12,z:0,heading:Math.PI/4,name:{nl:'Dorpsstation',fr:'Gare du village'}},
 {id:'clock',x:S.clock.x+14,z:S.clock.z,heading:0,name:{nl:'Maantoren',fr:'Tour de la Lune'}},
 {id:'lights',x:S.lights.x,z:S.lights.z+15,heading:-Math.PI/2,name:{nl:'Spooklichtkasteel',fr:'Château des lumières'}},
 {id:'library',x:S.library.x-14,z:S.library.z,heading:Math.PI,name:{nl:'Fluisterbibliotheek',fr:'Bibliothèque des murmures'}},
 {id:'bridge',x:S.bridge.x-14,z:S.bridge.z,heading:Math.PI,name:{nl:'Pompoenpad',fr:'Sentier des citrouilles'}},
 {id:'garden',x:S.garden.x+14,z:S.garden.z,heading:-Math.PI/4,name:{nl:'Tovertuin',fr:'Jardin magique'}}
];
const samples=[],distances=[];let length=0;
function bezier(a,b,t){const reach=Math.min(30,Math.hypot(b.x-a.x,b.z-a.z)*.36),p={x:a.x+Math.sin(a.heading)*reach,z:a.z+Math.cos(a.heading)*reach},q={x:b.x-Math.sin(b.heading)*reach,z:b.z-Math.cos(b.heading)*reach},u=1-t;return{x:u*u*u*a.x+3*u*u*t*p.x+3*u*t*t*q.x+t*t*t*b.x,z:u*u*u*a.z+3*u*u*t*p.z+3*u*t*t*q.z+t*t*t*b.z,heading:Math.atan2(3*u*u*(p.x-a.x)+6*u*t*(q.x-p.x)+3*t*t*(b.x-q.x),3*u*u*(p.z-a.z)+6*u*t*(q.z-p.z)+3*t*t*(b.z-q.z))};}
for(let j=0;j<stations.length;j++){const a=stations[j],b=stations[(j+1)%stations.length];a.distance=length;const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z));for(let i=0;i<=n;i++){if(j&&i===0)continue;const p=bezier(a,b,i/n),last=samples.at(-1);if(last)length+=Math.hypot(p.x-last.x,p.z-last.z);samples.push(p);distances.push(length);}}
function pose(distance){const d=((distance%length)+length)%length;let low=0,high=distances.length-1;while(low+1<high){const mid=(low+high)>>1;if(distances[mid]<=d)low=mid;else high=mid;}const a=samples[low],b=samples[high],t=(d-distances[low])/(distances[high]-distances[low]||1),turn=Math.atan2(Math.sin(b.heading-a.heading),Math.cos(b.heading-a.heading));return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,heading:a.heading+turn*t,distance:d};}
function platform(index){const s=stations[index];return{x:s.x-4*Math.cos(s.heading),z:s.z+4*Math.sin(s.heading),heading:s.heading};}
const track={samples,length,pose};
function create(){let station=0,target=1,phase='idle',elapsed=0,distance=stations[0].distance,speed=0,summoned=false,direction=1,span=0,duration=8,travelled=0;
 function snapshot(){const p=pose(distance);return{station,target,phase,elapsed,...p,heading:p.heading+(direction<0?Math.PI:0),speed,summoned,direction,travelled,duration,active:phase!=='idle',progress:phase==='boarding'?elapsed/1.2:phase==='travel'?elapsed/duration:phase==='arrival'?elapsed:0};}
 function launch(index,empty){if(phase!=='idle'||!Number.isInteger(index)||!stations[index]||index===station)return false;target=index;const forward=(stations[target].distance-stations[station].distance+length)%length;span=forward<=length/2?forward:forward-length;direction=span>=0?1:-1;duration=Math.max(8,Math.abs(span)/6);elapsed=0;travelled=0;speed=0;summoned=empty;phase=empty?'travel':'boarding';return true;}
 function begin(index=(station+1)%stations.length){return launch(index,false);}
 function call(index){return launch(index,true);}
 function finish(){station=target;distance=stations[station].distance;phase='idle';elapsed=0;speed=0;summoned=false;return snapshot();}
 function tick(dt){if(!Number.isFinite(dt)||dt<=0||phase==='idle')return snapshot();let remaining=dt;while(remaining>0&&phase!=='idle'){const limit=phase==='boarding'?1.2:phase==='travel'?duration:1,step=Math.min(remaining,limit-elapsed);elapsed+=step;remaining-=step;if(phase==='travel'){const u=Math.min(1,elapsed/duration),offset=span*(1-Math.cos(Math.PI*u))/2;distance=stations[station].distance+offset;travelled=Math.abs(offset);speed=Math.abs(span)*Math.PI/(2*duration)*Math.sin(Math.PI*u);}if(elapsed>=limit-1e-9){if(phase==='boarding'){phase='travel';elapsed=0;}else if(phase==='travel'){phase='arrival';elapsed=0;distance=stations[target].distance;travelled=Math.abs(span);speed=0;}else finish();}}return snapshot();}
 function park(index){if(phase!=='idle'||!Number.isInteger(index)||!stations[index])return false;station=index;target=(index+1)%stations.length;distance=stations[index].distance;speed=0;elapsed=0;travelled=0;direction=1;return true;}
 return{begin,call,tick,snapshot,finish,park};
}
const api={create,stations,platform,track};root.MoonRailway=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
