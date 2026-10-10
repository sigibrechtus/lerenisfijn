/* Kinematic rail motion: fixed passenger transforms, smooth station-to-station travel. */
(function(root){'use strict';
const stations=[{z:0,name:{nl:'Dorpsstation',fr:'Gare du village'}},{z:28,name:{nl:'Maantoren',fr:'Tour de la Lune'}}];
const boarding=1.2,travel=12,arrival=1;
function create(){let station=0,target=1,phase='idle',elapsed=0,z=stations[0].z,speed=0;
 function snapshot(){return {station,target,phase,elapsed,z,speed,active:phase!=='idle',direction:stations[target].z>=stations[station].z?1:-1,progress:phase==='boarding'?elapsed/boarding:phase==='travel'?elapsed/travel:phase==='arrival'?elapsed/arrival:0};}
 function begin(){if(phase!=='idle')return false;target=1-station;elapsed=0;speed=0;phase='boarding';return true;}
 function finish(){station=target;z=stations[station].z;phase='idle';elapsed=0;speed=0;return snapshot();}
 function tick(dt){if(!Number.isFinite(dt)||dt<=0||phase==='idle')return snapshot();let remaining=dt;
  while(remaining>0&&phase!=='idle'){
   const duration=phase==='boarding'?boarding:phase==='travel'?travel:arrival,step=Math.min(remaining,duration-elapsed);
   elapsed+=step;remaining-=step;
   if(phase==='travel'){const u=Math.min(1,elapsed/travel),span=stations[target].z-stations[station].z;z=stations[station].z+span*(1-Math.cos(Math.PI*u))/2;speed=Math.abs(span)*Math.PI/(2*travel)*Math.sin(Math.PI*u);}
   if(elapsed>=duration-1e-9){if(phase==='boarding'){phase='travel';elapsed=0;}else if(phase==='travel'){phase='arrival';elapsed=0;z=stations[target].z;speed=0;}else finish();}
  }
  return snapshot();
 }
 function park(index){if(phase!=='idle'||![0,1].includes(index))return false;station=index;target=1-station;z=stations[station].z;speed=0;elapsed=0;return true;}
 return {begin,tick,snapshot,finish,park};
}
const api={create,stations};root.MoonRailway=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
