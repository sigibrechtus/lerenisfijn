(function(root){
  'use strict';
  const levels=['','Vormen en kleuren','Getallenreeksen','Slimme patronen'];
  const symbols=['🔴','🔵','🟡','🟢','⭐','🔺','🟪','🔶'];
  function shuffle(values,rng){const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function makeQuestion(level,rng=Math.random){
    const int=(a,b)=>a+Math.floor(rng()*(b-a+1));let sequence,options,hint;
    if(level===1){const palette=shuffle(symbols,rng),period=int(2,3);sequence=Array.from({length:7},(_,i)=>palette[i%period]);options=palette.slice(0,4);hint='Kijk welk groepje vormen zich steeds herhaalt.';}
    else if(level===2){const step=int(1,5),down=rng()<.35,start=down?int(30,60):int(0,20);sequence=Array.from({length:6},(_,i)=>String(start+(down?-step:step)*i));hint='Tel hoeveel erbij komt of eraf gaat tussen twee getallen.';}
    else {const type=int(0,2),start=int(1,5),step=int(3,10);sequence=Array.from({length:6},(_,i)=>String(type===0?start+step*i:type===1?start*2**i:start+i*(i+1)/2));hint=type===0?'Zoek de vaste sprong tussen de getallen.':type===1?'Kijk of elk getal wordt verdubbeld.':'De sprongen worden telkens één groter.';}
    const missing=int(3,sequence.length-1),answer=sequence[missing];
    if(level!==1){const target=Number(answer),unique=new Set([answer]);for(const offset of shuffle([-stepSafe(level),-2,-1,1,2,3,5,10],rng)){const value=target+offset;if(value>=0)unique.add(String(value));if(unique.size===4)break;}options=[...unique];}
    sequence[missing]=null;
    return {sequence,answer,options:shuffle(options,rng),hint};
  }
  function stepSafe(level){return level===3?7:4;}
  const api={levels,symbols,makeQuestion};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PatroonGame=api;
})(typeof window==='undefined'?globalThis:window);
