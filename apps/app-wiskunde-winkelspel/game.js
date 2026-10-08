(function(root){
  'use strict';
  const levels=['','Hele euro’s','Twee artikelen','Euro’s en centen','Een volle mand','Wisselgeld'];
  const products=[['🍎','Appel'],['🥖','Brood'],['🥛','Melk'],['🧀','Kaas'],['🍐','Peer'],['🥕','Wortels'],['📒','Schrift'],['✏️','Potlood']];
  const money=cents=>'€ '+Math.floor(cents/100)+','+String(cents%100).padStart(2,'0');
  function parseMoney(text){
    const value=String(text).trim();
    if(!/^\d{1,3}(?:[,.]\d{1,2})?$/.test(value))return null;
    const parts=value.replace('.',',').split(',');
    return Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));
  }
  function makeQuestion(level,rng=Math.random){
    if(!Number.isInteger(level)||level<1||level>5)throw new Error('Ongeldig niveau');
    const int=(min,max)=>min+Math.floor(rng()*(max-min+1));
    const count=level===2?2:level>=4?3:1;
    const choices=[...products],items=[];
    for(let i=0;i<count;i++){
      const product=choices.splice(int(0,choices.length-1),1)[0];
      const cents=level<=2?int(1,9)*100:level===3?int(1,8)*100+int(1,19)*5:int(1,6)*100+int(0,19)*5;
      items.push({emoji:product[0],name:product[1],cents});
    }
    const total=items.reduce((sum,item)=>sum+item.cents,0);
    const paid=level===5?(Math.floor(total/500)+1)*500:null;
    return {items,total,paid,answer:paid===null?total:paid-total};
  }
  const api={levels,money,parseMoney,makeQuestion,nextLevel:(level,score)=>score>=8?Math.min(5,level+1):level};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WinkelGame=api;
})(typeof window==='undefined'?globalThis:window);
