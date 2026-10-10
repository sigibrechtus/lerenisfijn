/* Shared expanded-world coordinates and gentle, navigable terrain. */
(function(root){'use strict';
const scale=2.4,version=2,bounds={minX:-132,maxX:132,minZ:-108,maxZ:158};
const oldSites={bridge:{x:-21,z:-13},garden:{x:19,z:-13},library:{x:-22,z:20},clock:{x:20,z:21},lights:{x:0,z:43}};
const sites=Object.fromEntries(Object.entries(oldSites).map(([k,p])=>[k,{x:p.x*scale,z:p.z*scale}]));
const distance=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
function makeHeight(rails=[{x:12,z:-5},{x:12,z:34}]){const paths=Object.values(sites).map(p=>[{x:0,z:0},p]),grid=new Map(),cell=24;
 for(let i=1;i<rails.length;i++){const a=rails[i-1],b=rails[i];for(let gx=Math.floor((Math.min(a.x,b.x)-15)/cell);gx<=Math.floor((Math.max(a.x,b.x)+15)/cell);gx++)for(let gz=Math.floor((Math.min(a.z,b.z)-15)/cell);gz<=Math.floor((Math.max(a.z,b.z)+15)/cell);gz++){const key=gx+','+gz;if(!grid.has(key))grid.set(key,[]);grid.get(key).push([a,b]);}}
 return(x,z)=>{
 const raw=2.7*Math.sin(x*.045)*Math.sin(z*.035)+1.2*Math.cos(x*.026+z*.05)-1.2;
 let clearance=Math.hypot(x,z)-12;for(const p of Object.values(sites))clearance=Math.min(clearance,Math.hypot(x-p.x,z-p.z)-14);
 for(const [a,b]of paths)clearance=Math.min(clearance,distance(x,z,a,b)-3.2);
 for(const [a,b]of grid.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[])clearance=Math.min(clearance,distance(x,z,a,b)-5.5);
 return clearance<=0?0:raw*smooth(clearance/9);
};}
function validPosition(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.x>bounds.minX&&p.x<bounds.maxX&&p.z>bounds.minZ&&p.z<bounds.maxZ;}
function restorePosition(p,storedVersion){if(!p)return null;const value=storedVersion===version?{x:p.x,z:p.z}:{x:p.x*scale,z:p.z*scale};return validPosition(value)?value:null;}
const api={scale,version,bounds,oldSites,sites,distance,makeHeight,validPosition,restorePosition};root.MoonLandscape=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
