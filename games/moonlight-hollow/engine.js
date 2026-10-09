/* Pure learning logic: no DOM, audio or storage dependencies. */
(function(root){
'use strict';
const areas=['bridge','garden','library','clock','lights'];
const words={
nl:[['maan','De ronde lamp aan de nachtelijke hemel.','moon'],['kat','Een dier dat miauw zegt.','cat'],['boom','Heeft een stam, takken en bladeren.','tree'],['ster','Een klein lichtpunt aan de hemel.','star'],['spook','Pip is een vriendelijk …','ghost'],['pompoen','Een grote oranje vrucht.','pumpkin'],['sleutel','Hiermee open je een slot.','key'],['kasteel','Een groot gebouw met torens.','castle'],['lantaarn','Een lamp die je kunt dragen.','lantern']],
fr:[['lune','Le grand disque lumineux dans le ciel nocturne.','moon'],['chat','Un animal qui dit miaou.','cat'],['arbre','Il a un tronc, des branches et des feuilles.','tree'],['étoile','Un petit point lumineux dans le ciel.','star'],['fantôme','Pip est un gentil …','ghost'],['citrouille','Un gros fruit orange.','pumpkin'],['clé','Elle ouvre une serrure.','key'],['château','Un grand bâtiment avec des tours.','castle'],['lanterne','Une lampe que tu peux porter.','lantern']]
};
function shuffle(a,rng){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function make(area,level=1,lang='nl',rng=Math.random){
if(!areas.includes(area))throw Error('Unknown area');
level=Math.max(1,Math.min(3,level));
const pick=a=>a[Math.floor(rng()*a.length)],q={area,level};
if(area==='bridge'){
q.groups=level===1?2:level===2?2:pick([3,4]);q.size=level===1?pick([2,3,4]):level===2?10:pick([2,3,4]);
q.initial=level===2?pick([6,7,8,9]):0;
q.targets=Array(q.groups).fill(q.size);
if(level===2)q.targets[1]=pick([3,4,5,6]);
q.total=q.targets.reduce((a,b)=>a+b,0);q.pool=q.total-q.initial;
}
if(area==='garden'){
q.den=level===1?2:level===2?4:pick([3,4]);
q.total=q.den*pick(level===1?[2,3]:[2,3,4]);q.num=level===3?pick([1,q.den-1]):1;
q.moon=q.total/q.den*q.num;
}
if(area==='library'){
const pool=words[lang==='fr'?'fr':'nl'].slice(level===1?0:level===2?3:6,level===1?3:level===2?6:9);
[q.word,q.clue,q.icon]=pick(pool);
q.tiles=shuffle(Array.from(q.word,(letter,id)=>({letter,id})),rng);
}
if(area==='clock'){
q.kind=level===1?'read':level===2?'elapsed':'schedule';
q.start=pick([15,16,17,18])*60+pick(level===1?[0,30]:[0,10,20,30,40,50]);
q.duration=level===1?0:pick([10,15,20,25,30]);
q.answer=q.kind==='schedule'?q.start-q.duration:q.start+q.duration;
}
if(area==='lights'){
q.kind=level===1?'pattern':'mirror';
if(q.kind==='pattern'){
q.unit=pick([[0,1],[0,0,1],[0,1,1],[0,0,0,1]]);
q.sequence=Array.from({length:q.unit.length*3},(_,i)=>q.unit[i%q.unit.length]);q.missing=q.unit.length*2+Math.floor(rng()*q.unit.length);q.answer=q.sequence[q.missing];
}else{
q.mirrors=level===2?[{x:1,y:1,solution:1},{x:1,y:3,solution:1}]:[{x:1,y:1,solution:1},{x:1,y:3,solution:1},{x:3,y:3,solution:0},{x:3,y:0,solution:0}];
q.exit={x:4,y:level===2?3:0};
q.initial=q.mirrors.map(()=>Math.floor(rng()*2));
if(trace(q,q.initial).success)q.initial[0]=1-q.initial[0];
}
}
return q;
}
function trace(q,orientations){
let x=-1,y=1,d=0,steps=0;const points=[{x,y}],seen=new Set(),delta=[[1,0],[0,1],[-1,0],[0,-1]];
while(steps++<80){
x+=delta[d][0];y+=delta[d][1];points.push({x,y});
if(x<0||x>=4||y<0||y>=4)return{points,success:x===q.exit.x&&y===q.exit.y};
const state=x+','+y+','+d;if(seen.has(state))return{points,success:false};seen.add(state);
const i=q.mirrors.findIndex(m=>m.x===x&&m.y===y);
if(i>=0)d=orientations[i]===0?[3,2,1,0][d]:[1,0,3,2][d];
}
return{points,success:false};
}
function check(q,a){
if(q.area==='bridge')return Array.isArray(a)&&a.length===q.targets.length&&a.every((v,i)=>v===q.targets[i]);
if(q.area==='garden')return Array.isArray(a)&&a.length===q.total&&a.every(x=>x===0||x===1)&&a.filter(x=>x===0).length===q.moon;
if(q.area==='library')return a===q.word;
if(q.area==='clock')return Number.isInteger(a)&&a>=0&&a<1440&&(q.kind==='read'?a%720===q.answer%720:a===q.answer);
if(q.area==='lights')return q.kind==='pattern'?a===q.answer:Array.isArray(a)&&a.length===q.mirrors.length&&a.every(x=>x===0||x===1)&&trace(q,a).success;
return false;
}
function stats(events,area){
const rows=events.filter(x=>x.area===area);let level=1,batch=[];
for(const e of rows){if(e.level!==level){batch=[];continue;}batch.push(e);if(batch.length===6){if(batch.filter(x=>x.attempts===1&&!x.assisted).length>=5)level=Math.min(3,level+1);batch=[];}}
return{level,total:rows.length,independent:rows.filter(x=>x.attempts===1&&!x.assisted).length,recent:rows.slice(-6),early:rows.slice(0,6)};
}
function unlocked(events,area){const done=new Set(events.map(x=>x.area));return area==='bridge'||(area==='garden'||area==='library'?done.has('bridge'):area==='clock'?done.has('garden')||done.has('library'):done.has('clock'));}
function validEvent(e){return e&&areas.includes(e.area)&&[1,2,3].includes(e.level)&&Number.isInteger(e.attempts)&&e.attempts>0&&typeof e.assisted==='boolean'&&typeof e.id==='string'&&typeof e.date==='string';}
const api={areas,make,trace,check,stats,unlocked,validEvent};if(typeof module!=='undefined')module.exports=api;root.MoonEngine=api;
})(typeof window!=='undefined'?window:globalThis);

