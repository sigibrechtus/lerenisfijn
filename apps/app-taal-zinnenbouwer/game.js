(function(root){
  'use strict';
  const sentences=[[],
    ['De kat slaapt.','De hond blaft.','De zon schijnt.','De vogel zingt.','Het kind lacht.','De baby huilt.','De klok tikt.','Het paard rent.','De koe loeit.','De wind waait.','De vis zwemt.','De juf leest.','De jongen tekent.','Het meisje danst.','De poes spint.'],
    ['De hond eet een koekje.','Mijn broer leest een boek.','De juf schrijft op het bord.','De kat drinkt uit de kom.','Mijn zus draagt een rode jas.','Het meisje tekent een bloem.','De jongen maakt een puzzel.','Een vogel bouwt een nest.','De bakker bakt een brood.','De kinderen spelen in de tuin.','Mijn vader kookt lekkere soep.','De vis zwemt in het water.','De boer voert de dieren.','De baby slaapt in het bed.','Een eend zwemt naar de kant.'],
    ['Als het regent, neem ik mijn paraplu mee.','Na school speelt Noor met haar kleine broer.','In de lente groeien bloemen in onze tuin.','Mijn hond kwispelt wanneer hij mij ziet.','Op zaterdag bakken we samen een lekkere taart.','De kinderen lezen rustig een boek in de klas.','Omdat het koud is, trek ik mijn jas aan.','Eerst was ik mijn handen, daarna eet ik.','Kun jij de rode bal naar mij gooien?','Hoera, onze klas heeft de wedstrijd gewonnen!','De vogel vliegt hoog boven de groene bomen.','Mijn zus zet haar fiets naast het huis.','Wanneer de bel gaat, lopen we naar buiten.','De bakker verkoopt elke ochtend vers brood.','Ik drink een glas water na het sporten.']
  ];
  const levels=['','Korte zinnen','Langere zinnen','Zinnen en leestekens'];
  function shuffle(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function makeQuestion(level,rng=Math.random){
    const sentence=sentences[level][Math.floor(rng()*sentences[level].length)];
    const tokens=level===3?sentence.match(/[\p{L}]+|[.,?!]/gu):sentence.split(' ');
    let order=shuffle(tokens.map((_,id)=>id),rng);if(order.every((id,i)=>id===i))order=order.slice(1).concat(order[0]);
    return {sentence,tokens,order};
  }
  const api={levels,sentences,makeQuestion,shuffle};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ZinnenGame=api;
})(typeof window==='undefined'?globalThis:window);
