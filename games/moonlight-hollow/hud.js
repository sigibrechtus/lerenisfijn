/* Seasonal presentation and exercise guidance, independent of the 3D renderer. */
(function(root){'use strict';
const themes={
 halloween:{icon:'🎃',label:{nl:'Halloween',fr:'Halloween'},tokens:{accent:'#ffc477',accentStrong:'#d88749',panel:'#211c35',panelEnd:'#172735',border:'#bd9bdb66',paper:'#fff3df',muted:'#dacfe0'},decoration:'☾'},
 christmas:{icon:'❄',label:{nl:'Kerstmis',fr:'Noël'},tokens:{accent:'#f5dca1',accentStrong:'#c19b56',panel:'#152e31',panelEnd:'#19253a',border:'#b6ded366',paper:'#f6faf3',muted:'#c8dedb'},decoration:'✦'}
};
const guides={
 groups:{icon:'✨',name:['Lichtjes verdelen','Partager les lumières'],how:['Tik op een mand of gebruik de + en − knoppen. Verdeel de lichtjes zoals de vraag aangeeft.','Touche un panier ou utilise ses boutons + et −. Répartis les lumières comme demandé.']},
 fraction:{icon:'🧪',name:['Toverdrank mengen','Mélanger la potion'],how:['Kies Blauw of Rood en tik op de vakjes om ze te vullen. Tik opnieuw met de andere kleur om te veranderen.','Choisis Bleu ou Rouge, puis touche les cases à remplir. Touche une case avec l’autre couleur pour la changer.']},
 word:{icon:'📖',name:['Een woord bouwen','Construire un mot'],how:['Luister naar het woord. Tik op de letters in de juiste volgorde. Met ↶ haal je de laatste letter weg.','Écoute le mot. Touche les lettres dans le bon ordre. Le bouton ↶ retire la dernière lettre.']},
 time:{icon:'🕰',name:['De maanklok','L’horloge lunaire'],how:['Verplaats de wijzers met Uur +/− en Minuut +/−. Je kunt ook op de klok tikken om de minuten te kiezen.','Déplace les aiguilles avec Heure +/− et Minute +/−. Tu peux aussi toucher le cadran pour choisir les minutes.']},
 sequence:{icon:'🪨',name:['Stapstenen','Les pierres du chemin'],how:['Bekijk de getallen op de stenen. Tik op het getal dat op de lege steen hoort.','Observe les nombres sur les pierres. Touche celui qui complète la pierre vide.']},
 riddle:{icon:'🔎',name:['Een raadsel oplossen','Résoudre une énigme'],how:['Lees de aanwijzingen en kies het bijpassende voorwerp. Je kunt je keuze veranderen voordat je controleert.','Lis les indices et choisis l’objet correspondant. Tu peux changer ton choix avant de vérifier.']},
 deduction:{icon:'🔎',name:['Speurwerk','Une enquête'],how:['Lees alle aanwijzingen. Kies het dier dat aan alle aanwijzingen voldoet.','Lis tous les indices. Choisis l’animal qui correspond à chacun d’eux.']},
 route:{icon:'⭐',name:['De weg naar de ster','Le chemin de l’étoile'],how:['Gebruik ↑ ↓ ← → om over het rooster te lopen. ↶ doet één stap terug; Maak leeg wist het pad. Bereik de ster met precies het gevraagde aantal stappen.','Utilise ↑ ↓ ← → pour parcourir la grille. ↶ annule un pas et Vider efface le chemin. Atteins l’étoile avec exactement le nombre de pas demandé.']},
 pattern:{icon:'🏮',name:['Lantaarnpatronen','Les motifs des lanternes'],how:['Zoek het herhalende patroon. Kies de maan of de ster voor de lege lantaarn.','Repère le motif qui se répète. Choisis la lune ou l’étoile pour la lanterne vide.']},
 mirror:{icon:'🪞',name:['Spelen met licht','Jouer avec la lumière'],how:['Gebruik de knoppen om de spiegels te draaien. Volg de lichtstraal tot aan de gouden lantaarn.','Utilise les boutons pour tourner les miroirs. Suis le rayon jusqu’à la lanterne dorée.']}
};
function exercise(q,a,lang='nl',selected=0){const i=lang==='fr'?1:0,g=guides[q.type]||guides.riddle,fr=!!i;let progress='';
 if(q.type==='route')progress=a.length+' / '+q.moves+(fr?' pas':' stappen');
 if(q.type==='groups')progress=a.reduce((s,n)=>s+n,0)+' / '+q.total+(fr?' lumières placées':' lichtjes geplaatst');
 if(q.type==='fraction')progress=a.filter(v=>v!==null).length+' / '+q.total+(fr?' cases · couleur : ':' vakjes · kleur: ')+(selected===0?(fr?'bleu':'blauw'):(fr?'rouge':'rood'));
 if(q.type==='word')progress=a.length+' / '+Array.from(q.word).length+(fr?' lettres':' letters');
 if(['sequence','riddle','deduction','pattern'].includes(q.type))progress=a===null?(fr?'Choisis une réponse':'Kies een antwoord'):(fr?'Réponse choisie':'Antwoord gekozen');
 if(q.type==='time')progress=(fr?'Heure choisie : ':'Gekozen tijd: ')+String(Math.floor(a/60)%24).padStart(2,'0')+':'+String(a%60).padStart(2,'0');
 if(q.type==='mirror'&&root.MoonEngine){const r=root.MoonEngine.trace(q,a);progress=r.lit.length+' / '+(q.targets||[q.exit]).length+(fr?' lanternes éclairées':' verlichte lantaarns');}
 return{icon:g.icon,title:g.name[i],how:g.how[i],progress,question:fr?'Ta mission':'Jouw opdracht',controls:fr?'Tes commandes':'Jouw knoppen'};
}
function apply(name,doc=root.document){const theme=themes[name]||themes.halloween;doc.documentElement.dataset.theme=themes[name]?name:'halloween';for(const [key,value]of Object.entries(theme.tokens))doc.documentElement.style.setProperty('--hud-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value);return theme;}
const api={themes,guides,exercise,apply};root.MoonHUD=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
