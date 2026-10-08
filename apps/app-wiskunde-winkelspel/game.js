(function(root){
  'use strict';
  const levels=['','Geld leggen · hele euro’s','Geld leggen · euro’s en centen','Twee artikelen','Een volle mand','Wisselgeld'];
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
    const count=level===3?2:level>=4?3:1;
    const choices=[...products],items=[];
    for(let i=0;i<count;i++){
      const product=choices.splice(int(0,choices.length-1),1)[0];
      const cents=level===1||level===3?int(1,9)*100:level===2?int(1,8)*100+int(1,99):int(1,6)*100+int(0,19)*5;
      items.push({emoji:product[0],name:product[1],cents});
    }
    const total=items.reduce((sum,item)=>sum+item.cents,0);
    const paid=level===5?(Math.floor(total/500)+1)*500:null;
    return {items,total,paid,answer:paid===null?total:paid-total};
  }
  // A complete greedy solution plus random extras for EVERY denomination.
  // All euro denominations divide cleanly; the 1-cent coin covers any remainder.
  function makeWallet(amount,withCents,rng=Math.random){
    const values=withCents?[1000,500,200,100,50,20,10,5,2,1]:[1000,500,200,100];
    let remaining=amount;
    return values.map(value=>{
      const needed=Math.floor(remaining/value);remaining%=value;
      return {value,count:needed+2+Math.floor(rng()*4)};
    });
  }
  const api={levels,money,parseMoney,makeQuestion,makeWallet,nextLevel:(level,score)=>score>=8?Math.min(5,level+1):level};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WinkelGame=api;
})(typeof window==='undefined'?globalThis:window);
