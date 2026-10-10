require('../games/moonlight-hollow/engine.js');
const C=require('../games/moonlight-hollow/campaign.js'),G=require('../games/moonlight-hollow/mini-games.js'),V=require('../games/moonlight-hollow/variety.js'),baseline=require('./fixtures/moonlight-variety-v20.json');
function counts(seeds=baseline.seeds){
 const languages={};
 for(const lang of ['nl','fr']){
  const result=languages[lang]={};
  for(const key of Object.keys(baseline.languages[lang])){
   const [kind,type,level]=key.split('/'),index=C.layout.findIndex(row=>row[1]===type),seen=new Set();
   for(let seed=0;seed<seeds;seed++)seen.add(V.signature(kind==='campaign'?C.make(index,Number(level),lang,seed):G.make(type,Number(level),lang,seed)));
   result[key]=seen.size;
  }
 }
 return languages;
}
module.exports={counts};
if(require.main===module)console.log(JSON.stringify({version:'v21',seeds:baseline.seeds,languages:counts()},null,2));
