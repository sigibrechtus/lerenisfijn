/* Broom Flight continuous-course contract. Pure geometry shared by meshes, input and gate checks. */
(function(root){'use strict';
 const SECTION=48,SECTIONS=6,LENGTH=SECTION*SECTIONS,OUTRUN=82;
 const levelOf=level=>Math.max(1,Math.min(3,Number(level)||1));
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 // The longitudinal distance is always increasing: a child-friendly Halloween
 // slalom, not an inverted roller-coaster or inaccessible self-intersection.
 function center(z,level=1){
  const d=clamp(Number(z)||0,-8,LENGTH+OUTRUN+10),tier=levelOf(level);
  const bend=[0,.95,2.8,4.1][tier],h=[0,.2,.55,1.05][tier];
  const t=clamp((d-LENGTH)/OUTRUN,0,1),wave=Math.sin(Math.PI*t),envelope=wave*wave;
  // The free outrun opens into a gentle sweeping curve and moonlit climb.
  // The squared envelope keeps the last quiz gate and finish endpoints smooth.
  const x=bend*(.70*Math.sin(d/27)+.30*Math.sin(d/13))+2.6*envelope*Math.sin(t*5);
  const dx=bend*(.70*Math.cos(d/27)/27+.30*Math.cos(d/13)/13)+2.6/OUTRUN*(2*Math.PI*wave*Math.cos(Math.PI*t)*Math.sin(t*5)+5*envelope*Math.cos(t*5));
  const rise=.28+h*(.5+.45*Math.sin(d/25)+.05*Math.sin(d/11))+.85*envelope*(.5+.5*Math.sin(t*2*Math.PI));
  return {x,rise,heading:Math.atan2(dx,1)};
 }
 function gate(stage,lane,level=1){
  const tier=levelOf(level),n=clamp(Math.floor(Number(stage)||0),0,SECTIONS-1),i=clamp(Math.floor(Number(lane)||0),0,2);
  const stagger=tier===1?0:(tier===2?.75:1.25)*(i-1)*((n%2)?-1:1);
  const z=n*SECTION+38+stagger,c=center(z,tier),spacing=tier===1?6.8:tier===2?6.3:5.9;
  const x=c.x+(i-1)*spacing;
  const y=3+c.rise+(i-1)*(tier===3?.8:.55)+Math.sin(n*1.8+i)*.25;
  const radius=clamp((tier===1?2.35:tier===2?2.15:1.98)+.18*Math.sin(n+i*2),1.85,2.55);
  const styles=['moon-halo','spider-octagon','pumpkin-ring','witch-window','ghost-halo','star-portal'];
  return {stage:n+1,lane:i,x,y,z,radius,diameter:radius*2,sides:[36,8,20,12,32,5][n],style:styles[n],heading:c.heading};
 }
 function travel(stage,level=1){
  const n=clamp(Math.floor(stage||0),0,SECTIONS-1),start=n*SECTION;
  return {index:n,start,end:start+SECTION,center:center(start,level),gates:[0,1,2].map(i=>gate(n,i,level))};
 }
 const api={SECTION,SECTIONS,LENGTH,OUTRUN,levelOf,center,gate,travel};
 root.MoonBroomCourse=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
