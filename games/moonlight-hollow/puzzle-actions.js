/* Shared accessible exercise actions. Rendering and DOM use the same route rules. */
(function(root){'use strict';
function routePosition(answer){let x=0,y=0;for(const c of answer){if(c==='E')x++;if(c==='N')y++;}return{x,y};}
function routeStep(q,answer,direction){if(typeof answer!=='string'||!['E','N'].includes(direction))return answer;const p=routePosition(answer);if(answer.length>=q.moves||(direction==='E'?p.x>=2:p.y>=2))return answer;return answer+direction;}
function actions(q,a,selected=0,lang='nl'){const fr=lang==='fr',list=[],add=(label,next,disabled=false)=>list.push({label,next,disabled}),choose=tool=>({tool});
 if(q.type==='route'){const p=routePosition(a);add(fr?'→ Droite':'→ Rechts',routeStep(q,a,'E'),a.length>=q.moves||p.x>=2);add(fr?'↑ Haut':'↑ Omhoog',routeStep(q,a,'N'),a.length>=q.moves||p.y>=2);add(fr?'↶ Annuler le pas':'↶ Stap terug',a.slice(0,-1),!a.length);add(fr?'Vider':'Maak leeg','',!a.length);}
 if(q.type==='groups')q.targets.forEach((n,i)=>{const more=[...a],less=[...a];more[i]++;less[i]--;add((fr?'Panier ':'Mand ')+(i+1)+' +',more,a.reduce((s,n)=>s+n,0)>=q.total);add((fr?'Panier ':'Mand ')+(i+1)+' −',less,a[i]<=(i===0?q.initial:0));});
 if(q.type==='fraction'){add(fr?'Bleu':'Blauw',choose(0));add(fr?'Rouge':'Rood',choose(1));}
 if(q.type==='word'){q.tiles.forEach(t=>add(t.letter,[...a,t.id],a.includes(t.id)||a.length>=Array.from(q.word).length));add(fr?'↶ Retirer la dernière lettre':'↶ Laatste letter weg',a.slice(0,-1),!a.length);}
 if(q.type==='time')for(const [label,d]of [[fr?'Heure −':'Uur −',-60],[fr?'Heure +':'Uur +',60],[fr?'Minute −':'Minuut −',-5],[fr?'Minute +':'Minuut +',5]])add(label,(a+d+1440)%1440);
 if(q.type==='sequence')q.choices.forEach(v=>add(String(v),v));
 if(q.type==='riddle')q.choices.forEach(v=>add(v.label,v.value));
 if(q.type==='deduction')q.choices.forEach((v,i)=>add(v,i));
 if(q.type==='pattern')[0,1].forEach(v=>add(v===0?'☾':'★',v));
 if(q.type==='mirror'){if(q.optics){const stock=root.MoonEngine.remaining(q,a);add((fr?'Miroir':'Spiegel')+' · '+stock.mirror,choose(0));add((fr?'Prisme séparateur':'Splitsprisma')+' · '+stock.splitter,choose(1));add(fr?'Remettre en réserve':'Terug in de voorraad',choose(2));}else a.forEach((v,i)=>{const next=[...a];next[i]=1-v;add((fr?'Tourner le miroir ':'Draai spiegel ')+(i+1),next);});}
 return list;
}
const api={actions,routePosition,routeStep};root.MoonPuzzleActions=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
