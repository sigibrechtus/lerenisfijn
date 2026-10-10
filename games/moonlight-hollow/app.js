'use strict';
const E=window.MoonEngine,$=id=>document.getElementById(id);
const L={
nl:{
back:'← Spelletjes',village:'Dorp',full:'Volledig scherm',settings:'Instellingen',eyebrow:'Een zacht Halloweenavontuur',welcome:'De lantaarns zijn hun licht kwijt. Help Pip het dorp weer te laten stralen: tel vuurvliegjes, meng toverdrankjes en ontdek geheime paden.',start:'Steek je lantaarn aan →',session:'Speel op jouw tempo · geen tijdslimiet · NL / FR',mapKicker:'Jouw lantaarnavontuur',mapTitle:'Een dorp vol kleine wonderen',mapCopy:'Kies een plek. Elke opgeloste puzzel brengt het licht terug.',bridgeName:'Pompoenpad',gardenName:'Tovertuin',libraryName:'Fluisterbibliotheek',clockName:'Maanklok',lightsName:'Spooklichtjes',bridgeDesc:'Tel, splits en maak groepjes',gardenDesc:'Meng gelijke delen',libraryDesc:'Bouw magische woorden',clockDesc:'Ontdek de tijd',lightsDesc:'Patronen en spiegels',locked:'Ontdek eerst het vorige pad',restored:'Verlicht',level:'Niveau',saved:'Bewaard op dit toestel. Geen accountsynchronisatie.',unsaved:'Opslaan lukt niet op dit toestel. Laat dit venster open om verder te spelen.',pipMap:'Ik heb mijn beste zweefhoed op. Welke lantaarn gaan we helpen?',pipFestival:'Alle vijf lantaarns stralen! Het maanfeest kan beginnen. Je kunt ook verder ontdekken.',progress:'Lantaarnpaspoort',language:'Taal',profile:'Jouw avonturier',music:'Muziek',effects:'Geluidseffecten',motion:'Minder beweging',nickname:'Nieuwe avonturier (bijnaam)',add:'Toevoegen',privacy:'Gebruik alleen een bijnaam. Iedere avonturier heeft eigen lokale voortgang. Geen advertenties, ranglijst of tijdsdruk. Deze game synchroniseert nog niet met een account.',close:'Sluiten',maxProfiles:'Er passen maximaal 8 avonturiers op dit toestel.',newProfile:'Je nieuwe avontuur staat klaar.',hint:'Pip, help mij',reset:'Opnieuw',check:'Laat het licht schijnen',continue:'Volg de vuurvliegjes →',feedback:'Neem je tijd. Pip helpt als je wilt.',retry:'Bijna! Kijk naar de verlichte plekjes en pas je oplossing aan.',good:'Het werkt! Je hebt het pad verlicht.',assist:'Samen ontdekt. Met hulp oefenen telt ook.',hintPrefix:'Pip fluistert:',bridgeGroup:'Vul {g} pompoenen met elk {n} vuurvliegjes.',bridgeSplit:'Er zijn al {initial} lichtjes. Verdeel nog {pool}: vul de eerste pompoen tot 10 en de tweede tot {rest}.',bridgeHow:'Kies een pompoen en tik op een vuurvliegje, of sleep het ernaartoe. Tik op − om er één terug te leggen.',firefly:'Vuurvliegje',remaining:'Nog {n} vuurvliegjes',pumpkin:'Pompoen {n}',remove:'Eén terugleggen',bridgeHint:'Deze pompoenen hebben {targets} lichtjes nodig. Er zijn samen {total} lichtjes. Maak eerst de eerste pompoen vol.',bridgeHint2:'De eerste pompoen mist nog {n}. Tik daarop en voeg deze lichtjes toe.',garden:'Vul {total} vakjes: {num}/{den} maanextract, de rest dauw.',gardenHow:'Kies een flesje. Tik op een vakje, of sleep een druppel erin. Je kunt een gevuld vakje veranderen.',moon:'Maanextract',dew:'Dauw',empty:'Leeg vakje',well:'Vakje {n}',gardenHint:'Verdeel {total} in {den} gelijke groepjes van {size}. Gebruik {num} groepje(s) maanextract.',gardenHint2:'Er horen {moon} maansdruppels en {dew} dauwdruppels in. Alle vakjes moeten gevuld zijn.',library:'Open het toverboek. Welk woord past bij de aanwijzing?',libraryHow:'Tik op letters in de juiste volgorde, of sleep ze naar het boek. Tik op een geplaatste letter om die terug te leggen.',listen:'Luister naar het woord',book:'Toverboek',letter:'Letter {letter}',libraryHint:'Het woord is: {word}.',libraryHint2:'De volgende letter is: {letter}.',clockRead:'Lees de voorbeeldklok en zet jouw klok op dezelfde tijd.',clockElapsed:'Het pad licht op om {time}. Het duurt {duration} minuten. Wanneer is het klaar?',clockSchedule:'Het maanfeest begint om {time}. Het aansteken duurt {duration} minuten. Wanneer begin je?',clockHow:'Sleep de lange wijzer of gebruik de knoppen. De korte wijzer volgt mee. Bij een verhaal gaat het om de avond.',example:'Voorbeeld',yourClock:'Jouw klok',hour:'Uur',minute:'Minuten',clockLabel:'Klok op {time}',clockHint:'{rule} De lange wijzer toont de minuten. De korte wijzer toont het uur.',clockReadRule:'Bekijk waar beide wijzers staan.',clockPlus:'Tel {duration} minuten bij {time}.',clockMinus:'Ga {duration} minuten terug vanaf {time}.',clockHint2:'Het antwoord is {time}. Zet de wijzers op die tijd.',pattern:'Maak de rij lantaarns af. Welk symbool ontbreekt?',patternHow:'Kies een symbool, of sleep het op de lege lantaarn. Hetzelfde groepje herhaalt zich.',patternHint:'Het verlichte groepje herhaalt zich: {unit}.',patternHint2:'Op de lege plek hoort: {symbol}.',mirror:'Draai de spiegels en stuur het licht naar de gouden lantaarn.',mirrorHow:'Tik op een spiegel om hem te draaien. Volg de lichtstraal. Gaat hij omhoog, omlaag, links of rechts?',mirrorLabel:'Spiegel {n}, {direction}',slash:'schuin omhoog',backslash:'schuin omlaag',mirrorHint:'Begin bij het licht links. Draai de eerste spiegel zodat de straal naar beneden gaat.',mirrorHint2:'De spiegels van links naar rechts horen zo: {mirrors}.',light:'Licht',target:'Doellantaarn',symbols:['maan','ster','blad'],travel:'Pip glijdt over het nieuwe pad…',skip:'Sla de reis over',total:'Puzzels',independent:'Zelfstandig',recent:'Laatste 6',early:'Eerste 6',progressNote:'Een zelfstandig resultaat is een juist eerste antwoord zonder hint. Dit zijn oefenmetingen, geen schoolbeoordeling. Moeilijkere varianten volgen na vijf van zes zelfstandige oplossingen.',reward:'Nieuwe lantaarn!',nextTask:'Nog een ontdekking',festival:'Het maanfeest!',resume:'Verder met je puzzel →',choose:'Kies een plek',profileLock:'Ga eerst terug naar het dorp om van avonturier of taal te wisselen.'
},
fr:{
back:'← Jeux',village:'Village',full:'Plein écran',settings:'Réglages',eyebrow:'Une douce aventure d’Halloween',welcome:'Les lanternes ont perdu leur lumière. Aide Pip à illuminer le village : compte les lucioles, mélange des potions et découvre des passages secrets.',start:'Allume ta lanterne →',session:'À ton rythme · sans chrono · NL / FR',mapKicker:'Ton aventure lumineuse',mapTitle:'Un village plein de petits miracles',mapCopy:'Choisis un lieu. Chaque énigme résolue fait revenir la lumière.',bridgeName:'Sentier des citrouilles',gardenName:'Jardin magique',libraryName:'Bibliothèque des murmures',clockName:'Horloge lunaire',lightsName:'Lumières fantômes',bridgeDesc:'Compter, décomposer et grouper',gardenDesc:'Mélanger des parts égales',libraryDesc:'Construire des mots magiques',clockDesc:'Découvrir les heures',lightsDesc:'Motifs et miroirs',locked:'Découvre d’abord le passage précédent',restored:'Illuminé',level:'Niveau',saved:'Enregistré sur cet appareil. Sans synchronisation de compte.',unsaved:'Le stockage est indisponible. Garde cette fenêtre ouverte pour continuer.',pipMap:'J’ai mis mon meilleur chapeau flottant. Quelle lanterne allons-nous aider ?',pipFestival:'Les cinq lanternes brillent ! La fête lunaire peut commencer. Tu peux continuer à explorer.',progress:'Passeport des lanternes',language:'Langue',profile:'Ton aventurier',music:'Musique',effects:'Effets sonores',motion:'Moins de mouvements',nickname:'Nouvel aventurier (surnom)',add:'Ajouter',privacy:'Un surnom suffit. Chaque aventurier a ses propres progrès locaux. Pas de publicité, classement ni chrono. Ce jeu ne synchronise pas encore les progrès avec un compte.',close:'Fermer',maxProfiles:'Tu peux ajouter au maximum 8 aventuriers sur cet appareil.',newProfile:'Ta nouvelle aventure est prête.',hint:'Pip, aide-moi',reset:'Recommencer',check:'Fais briller la lumière',continue:'Suis les lucioles →',feedback:'Prends ton temps. Pip peut t’aider.',retry:'Presque ! Regarde les emplacements et ajuste ta solution.',good:'Ça marche ! Tu as illuminé le passage.',assist:'Une découverte ensemble. Apprendre avec de l’aide compte aussi.',hintPrefix:'Pip murmure :',bridgeGroup:'Remplis {g} citrouilles avec {n} lucioles chacune.',bridgeSplit:'Il y a déjà {initial} lumières. Répartis encore {pool} : remplis la première citrouille jusqu’à 10 et la seconde jusqu’à {rest}.',bridgeHow:'Choisis une citrouille puis touche une luciole, ou glisse-la dedans. Touche − pour en remettre une.',firefly:'Luciole',remaining:'Encore {n} lucioles',pumpkin:'Citrouille {n}',remove:'Remettre une luciole',bridgeHint:'Il faut {targets} lumières dans les citrouilles. Il y en a {total} en tout. Remplis d’abord la première.',bridgeHint2:'Il manque encore {n} lumières dans la première citrouille. Choisis-la et ajoute ces lumières.',garden:'Remplis {total} cases : {num}/{den} d’extrait lunaire, le reste de rosée.',gardenHow:'Choisis un flacon. Touche une case ou glisse une goutte dedans. Tu peux modifier une case remplie.',moon:'Extrait lunaire',dew:'Rosée',empty:'Case vide',well:'Case {n}',gardenHint:'Partage {total} en {den} groupes égaux de {size}. Utilise {num} groupe(s) d’extrait lunaire.',gardenHint2:'Il faut {moon} gouttes lunaires et {dew} gouttes de rosée. Remplis toutes les cases.',library:'Ouvre le livre magique. Quel mot correspond à l’indice ?',libraryHow:'Touche les lettres dans l’ordre, ou glisse-les dans le livre. Touche une lettre posée pour la remettre.',listen:'Écouter le mot',book:'Livre magique',letter:'Lettre {letter}',libraryHint:'Le mot est : {word}.',libraryHint2:'La prochaine lettre est : {letter}.',clockRead:'Lis l’horloge modèle et règle la tienne à la même heure.',clockElapsed:'Le passage s’allume à {time}. Cela prend {duration} minutes. À quelle heure est-ce terminé ?',clockSchedule:'La fête commence à {time}. Allumer le chemin prend {duration} minutes. Quand faut-il commencer ?',clockHow:'Glisse la grande aiguille ou utilise les boutons. La petite suit. Dans les histoires, il s’agit du soir.',example:'Modèle',yourClock:'Ton horloge',hour:'Heures',minute:'Minutes',clockLabel:'Horloge à {time}',clockHint:'{rule} La grande aiguille indique les minutes et la petite les heures.',clockReadRule:'Observe la position des deux aiguilles.',clockPlus:'Ajoute {duration} minutes à {time}.',clockMinus:'Recule de {duration} minutes depuis {time}.',clockHint2:'La réponse est {time}. Place les aiguilles à cette heure.',pattern:'Complète la rangée de lanternes. Quel symbole manque ?',patternHow:'Choisis un symbole ou glisse-le sur la lanterne vide. Le même groupe se répète.',patternHint:'Le groupe illuminé se répète : {unit}.',patternHint2:'À la place vide, il faut : {symbol}.',mirror:'Tourne les miroirs pour envoyer la lumière vers la lanterne dorée.',mirrorHow:'Touche un miroir pour le tourner. Suis le rayon : monte-t-il, descend-il, va-t-il à gauche ou à droite ?',mirrorLabel:'Miroir {n}, {direction}',slash:'diagonale montante',backslash:'diagonale descendante',mirrorHint:'Pars de la lumière à gauche. Tourne le premier miroir pour diriger le rayon vers le bas.',mirrorHint2:'De gauche à droite, les miroirs doivent être : {mirrors}.',light:'Lumière',target:'Lanterne cible',symbols:['lune','étoile','feuille'],travel:'Pip flotte au-dessus du nouveau passage…',skip:'Passer le voyage',total:'Énigmes',independent:'Autonomes',recent:'Dernières 6',early:'Premières 6',progressNote:'Une réussite autonome est une bonne première réponse sans indice. Ce sont des mesures d’entraînement, pas des notes scolaires. Cinq réussites autonomes sur six proposent une variante plus difficile.',reward:'Nouvelle lanterne !',nextTask:'Une autre découverte',festival:'La fête lunaire !',resume:'Reprendre ton énigme →',choose:'Choisis un lieu',profileLock:'Retourne d’abord au village pour changer d’aventurier ou de langue.'
}};
let state={version:1,selected:'first',profiles:[{id:'first',name:'Pip',events:[],draft:null}],prefs:{lang:'nl',music:25,effects:45,motion:matchMedia('(prefers-reduced-motion: reduce)').matches}};
let storageOK=true;
try{const s=JSON.parse(localStorage.getItem('moonlight-hollow-v1')||'null');if(s?.version===1&&Array.isArray(s.profiles)&&s.profiles.length){state={...state,...s,prefs:{...state.prefs,...s.prefs},profiles:s.profiles.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string').map(p=>({...p,events:(p.events||[]).filter(E.validEvent),draft:p.draft||null}))};if(!state.profiles.length)throw Error('Invalid profiles');}}catch(_){}
if(!L[state.prefs.lang])state.prefs.lang='nl';
if(!state.profiles.some(p=>p.id===state.selected))state.selected=state.profiles[0].id;
const t=(key,v={})=>String(L[state.prefs.lang][key]??key).replace(/\{(\w+)\}/g,(_,k)=>String(v[k]??''));
const time=n=>String(Math.floor(n/60)%24).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
const profile=()=>state.profiles.find(p=>p.id===state.selected);
const el=(tag,cls='',text='')=>{const e=document.createElement(tag);e.className=cls;e.textContent=text;return e;};
const button=(text,fn,cls='')=>{const b=el('button',cls,text);b.type='button';b.onclick=fn;return b;};
let q=null,a=null,attempts=0,assisted=false,hints=0,solved=false,selected=0,view='welcome',drag=null,suppressClick=false,travelTimer=null;
function save(){try{localStorage.setItem('moonlight-hollow-v1',JSON.stringify(state));storageOK=true;}catch(_){storageOK=false;}$('save-status').textContent=t(storageOK?'saved':'unsaved');}
function draft(){if(q&&!solved)profile().draft={q,a,attempts,assisted,hints,selected,lang:state.prefs.lang};save();}
function icon(kind){
const paths={
moon:'<path d="M43 7A24 24 0 1 0 56 46 24 24 0 0 1 43 7" fill="#ffe1a1"/>',
star:'<path d="m32 5 8 18 20 2-15 14 5 21-18-11-18 11 5-21L4 25l20-2z" fill="#ffe4a4"/>',
leaf:'<path d="m32 4 5 16 14-6-5 15 13 4-15 8 2 14-14-7-14 7 2-14L5 33l13-4-5-15 14 6z" fill="#eb9e61"/><path d="M32 28v33" stroke="#a46446" stroke-width="3"/>',
ghost:'<path d="M12 34c0-30 40-30 40 0v24l-10-6-10 6-10-6-10 6z" fill="#f0e8ff"/><ellipse cx="25" cy="30" rx="3" ry="4" fill="#292440"/><ellipse cx="39" cy="30" rx="3" ry="4" fill="#292440"/><path d="M28 42q4 6 8 0" fill="none" stroke="#835178" stroke-width="3"/>',
pumpkin:'<path d="M31 14q0-8 7-10" stroke="#8fa878" stroke-width="6" fill="none"/><ellipse cx="32" cy="37" rx="28" ry="22" fill="#edaa4d"/><ellipse cx="32" cy="37" rx="17" ry="22" fill="#dc862f"/><ellipse cx="32" cy="37" rx="7" ry="22" fill="#edaa4d"/><path d="m17 31 8-1-2 6zm22-1 8 1-6 5zM23 43q9 11 18 0" fill="#49313c"/>',
lantern:'<path d="M23 13q9-18 18 0" stroke="#e0ba76" stroke-width="4" fill="none"/><path d="M16 19h32l5 34H11z" fill="#dca955"/><path d="M23 24h18v23H23z" fill="#fff1b3"/><path d="M12 17h40v5H12zM10 51h44v6H10z" fill="#8b6444"/>',
book:'<path d="M6 12q13-5 26 4 13-9 26-4v39q-13-5-26 4-13-9-26-4z" fill="#e9cda4" stroke="#a36579" stroke-width="4"/><path d="M32 17v35" stroke="#ad866e" stroke-width="2"/><path d="m43 23 3 6 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#9871bd"/>',
clock:'<circle cx="32" cy="32" r="27" fill="#fbe9c7" stroke="#bc9058" stroke-width="5"/><path d="M32 13v19l13 8" stroke="#49364e" stroke-width="4" fill="none"/><circle cx="32" cy="32" r="3" fill="#ab679b"/>',
potion:'<path d="M25 7h14v16q20 12 14 30H11q-6-18 14-30z" fill="#afd5f0" stroke="#dcc3ee" stroke-width="3"/><path d="M15 38h34l-1 11H16z" fill="#a389de"/><path d="M24 5h16v7H24z" fill="#bf945c"/>',
dew:'<path d="M32 6c-4 12-21 24-21 36a21 21 0 0 0 42 0C53 30 36 18 32 6" fill="#abebf3"/><path d="M20 37q-5 9 4 15" fill="none" stroke="#fff" stroke-width="4"/>',
firefly:'<ellipse cx="23" cy="25" rx="12" ry="7" transform="rotate(35 23 25)" fill="#d1ecfa"/><ellipse cx="41" cy="25" rx="12" ry="7" transform="rotate(-35 41 25)" fill="#d1ecfa"/><ellipse cx="32" cy="40" rx="10" ry="14" fill="#ffe998"/><circle cx="32" cy="22" r="6" fill="#a38150"/>',
tree:'<path d="M29 33h7v28h-7z" fill="#ac7b54"/><circle cx="32" cy="23" r="21" fill="#bd835e"/><circle cx="18" cy="30" r="13" fill="#db9b6a"/><circle cx="46" cy="30" r="13" fill="#dfaf77"/>',
cat:'<path d="m13 27-3-20 18 11h9L55 7l-3 20q9 31-20 31T13 27" fill="#b3a3cf"/><ellipse cx="23" cy="33" rx="4" ry="6" fill="#ffde98"/><ellipse cx="41" cy="33" rx="4" ry="6" fill="#ffde98"/><path d="m28 43 4 4 4-4" fill="#785673"/>',
key:'<circle cx="23" cy="22" r="13" fill="none" stroke="#f5d489" stroke-width="7"/><path d="m33 32 23 23m-7-5 6-6m-13 0 6-6" stroke="#f5d489" stroke-width="7"/>',
castle:'<path d="M9 24h12v32H9zm34 0h12v32H43zM21 32h22v24H21z" fill="#b8a8c5"/><path d="m6 24 9-18 9 18zm34 0 9-18 9 18z" fill="#80598f"/><path d="M27 56V41q5-7 10 0v15" fill="#ffe3a0"/>',
flower:'<path d="M32 40v22m0-9q-17-14-19-4 3 11 19 4m0-7q17-14 19-4-3 11-19 4" fill="#86b8a4" stroke="#86b8a4" stroke-width="3"/><circle cx="20" cy="26" r="12" fill="#b8a0df"/><circle cx="43" cy="26" r="12" fill="#b8a0df"/><circle cx="32" cy="16" r="12" fill="#c6b8ed"/><circle cx="32" cy="36" r="12" fill="#c6b8ed"/><circle cx="32" cy="26" r="9" fill="#ffe4a2"/>'
};
const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 64 64');s.setAttribute('aria-hidden','true');s.innerHTML=paths[kind]||paths.lantern;return s;
}
const icons={bridge:'pumpkin',garden:'potion',library:'book',clock:'clock',lights:'lantern'};
function show(name){view=name;const music=name==='welcome'?'menu':name==='game'?MoonAudio.AREAS[q?.area]||'village':'village';legacyAudio.setMusic(music);legacyAudio.setAmbience(music);['welcome','map','game'].forEach(id=>$(id).hidden=id!==name);$('village').hidden=name==='welcome';if(name!=='game')document.body.dataset.area='';}
function localize(){
document.documentElement.lang=state.prefs.lang;$('profile-status').textContent='';
const map={back:'back',village:'village',fullscreen:'full','settings-open':'settings','welcome-settings':'settings',eyebrow:'eyebrow','welcome-copy':'welcome','session-note':'session-note','map-kicker':'mapKicker','map-heading':'mapTitle','map-copy':'mapCopy','progress-open':'progress','settings-title':'settings','language-label':'language','profile-label':'profile','music-label':'music','effects-label':'effects','motion-label':'motion','nickname-label':'nickname','profile-add':'add',privacy:'privacy','progress-title':'progress','progress-note':'progressNote',hint:'hint',reset:'reset',check:'check',continue:'continue','travel-copy':'travel',skip:'skip'};
Object.entries(map).forEach(([id,key])=>$(id).textContent=t(key==='session-note'?'session':key));
$('start').textContent=t(profile().draft?'resume':'start');
$('settings-close').setAttribute('aria-label',t('close'));$('progress-close').setAttribute('aria-label',t('close'));
$('language').value=state.prefs.lang;$('profile').replaceChildren(...state.profiles.map(p=>{const o=el('option','',p.name);o.value=p.id;return o;}));$('profile').value=state.selected;
$('music-volume').value=state.prefs.music;$('effects-volume').value=state.prefs.effects;$('motion').checked=state.prefs.motion;
document.body.dataset.motion=state.prefs.motion?'reduced':'normal';
save();renderMap();
}
function renderMap(){
const done=new Set(profile().events.map(x=>x.area));$('locations').replaceChildren();
E.areas.forEach(area=>{
const s=E.stats(profile().events,area),b=button('',()=>enter(area),'location'+(done.has(area)?' restored':''));
b.disabled=!E.unlocked(profile().events,area);b.append(icon(icons[area]),el('strong','',t(area+'Name')),el('small','',t(area+'Desc')),el('small','',b.disabled?t('locked'):t('level')+' '+s.level));
if(done.has(area))b.append(el('span','badge',t('restored')));
$('locations').append(b);
});
$('pip-line').textContent=t(done.size===5?'pipFestival':'pipMap');
$('festival-tree').classList.toggle('lit',done.size===5);
$('map-kicker').textContent=profile().name+' · '+done.size+'/5 '+t('restored');
renderStats();
}
function renderStats(){const target=$('stats');target.replaceChildren();E.areas.forEach(area=>{const s=E.stats(profile().events,area),rate=list=>list.length?Math.round(list.filter(x=>x.attempts===1&&!x.assisted).length/list.length*100)+'%':'—',box=el('div','stat');box.append(el('strong','',t(area+'Name')),el('div','',t('level')+' '+s.level+' · '+t('total')+': '+s.total+' · '+t('independent')+': '+s.independent),el('div','',t('early')+': '+rate(s.early)+' · '+t('recent')+': '+rate(s.recent)));target.append(box);});}
function initial(){if(q.area==='bridge')return q.targets.map((_,i)=>i===0?q.initial:0);if(q.area==='garden')return Array(q.total).fill(null);if(q.area==='library')return[];if(q.area==='clock')return q.answer%720===0?60:12*60;if(q.area==='lights')return q.kind==='pattern'?null:[...q.initial];}
function enter(area,restore=false){
if(!E.unlocked(profile().events,area))return;
const d=profile().draft;
if(d&&d.q?.area===area&&d.lang===state.prefs.lang){q=d.q;a=d.a;attempts=d.attempts;assisted=d.assisted;hints=d.hints;selected=d.selected||0;}else{q=E.make(area,E.stats(profile().events,area).level,state.prefs.lang);a=initial();attempts=0;assisted=false;hints=0;selected=0;}
solved=false;show('game');document.body.dataset.area=area;$('feedback').textContent=t('feedback');$('hint-text').hidden=!hints;if(hints)$('hint-text').textContent=hintText();$('check').hidden=false;$('continue').hidden=true;$('reset').disabled=false;$('hint').disabled=false;
$('language').disabled=true;$('profile').disabled=true;$('profile-add').disabled=true;$('nickname').disabled=true;
renderMission();renderStage();draft();$('mission-title').focus({preventScroll:true});
}
function renderMission(){
$('area-name').textContent=t(q.area+'Name')+' · '+t('level')+' '+q.level;
let key=q.area,args={};
if(q.area==='bridge'){key=q.initial?'bridgeSplit':'bridgeGroup';args={g:q.groups,n:q.size,initial:q.initial,pool:q.pool,rest:q.targets[1]};}
if(q.area==='garden')args={total:q.total,num:q.num,den:q.den};
if(q.area==='clock'){key='clock'+(q.kind==='read'?'Read':q.kind==='elapsed'?'Elapsed':'Schedule');args={time:time(q.start),duration:q.duration};}
if(q.area==='lights')key=q.kind;
$('mission-title').textContent=q.area==='bridge'?(state.prefs.lang==='fr'?'Remplis les paniers de gauche à droite : ':'Vul de manden van links naar rechts: ')+q.targets.join(' · ')+(q.initial?(state.prefs.lang==='fr'?' lumières. Le premier contient déjà ':' lichtjes. De eerste heeft al ')+q.initial:''):t(key,args);$('howto').textContent=t(q.area==='lights'?q.kind+'How':q.area+'How');
}
function change(){if(solved)return;renderStage();draft();}
function token(kind,label,payload,fn,cls=''){
const b=button('',()=>{if(!suppressClick&&!solved){sound('tap');fn();}},'token '+cls);if(kind)b.append(icon(kind));else b.textContent=label;b.setAttribute('aria-label',label);draggable(b,payload);return b;
}
function applyDrop(payload,target){
if(solved)return;
if(q.area==='bridge'&&payload.type==='firefly'&&target.type==='pumpkin'){const total=a.reduce((x,y)=>x+y,0);if(total<q.total){a[target.index]++;selected=target.index;change();sound('tap');}}
if(q.area==='garden'&&payload.type==='drop'&&target.type==='well'){a[target.index]=payload.value;selected=payload.value;change();sound('tap');}
if(q.area==='library'&&payload.type==='letter'&&target.type==='book'&&!a.includes(payload.id)){a.push(payload.id);change();sound('tap');}
if(q.area==='lights'&&q.kind==='pattern'&&payload.type==='symbol'&&target.type==='missing'){a=payload.value;change();sound('tap');}
}
function dropZone(e,data){e.dataset.drop=JSON.stringify(data);}
function renderStage(){
const stage=$('stage'),active=document.activeElement,hadFocus=stage.contains(active),oldLabel=active?.getAttribute('aria-label'),oldText=active?.textContent;stage.replaceChildren();
if(q.area==='bridge'){
const targets=el('div','targets');
a.forEach((count,i)=>{
const bowl=el('div','lantern-bowl'+(selected===i?' active':''));bowl.tabIndex=0;bowl.setAttribute('role','button');bowl.setAttribute('aria-label',t('pumpkin',{n:i+1})+' · '+count+'/'+q.targets[i]);bowl.setAttribute('aria-pressed',String(selected===i));dropZone(bowl,{type:'pumpkin',index:i});
const choose=()=>{if(!solved){selected=i;change();}};bowl.onclick=choose;bowl.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};
bowl.append(el('strong','',count+' / '+q.targets[i]));
const slots=el('div','slots');for(let j=0;j<Math.max(q.targets[i],count);j++)slots.append(el('span','firefly-slot'+(j<count?' on':'')));bowl.append(slots);
const minus=button('−',e=>{},'');minus.setAttribute('aria-label',t('remove'));minus.disabled=solved||count<=(i===0?q.initial:0);minus.onclick=e=>{e.stopPropagation();if(!solved&&a[i]>(i===0?q.initial:0)){a[i]--;change();sound('tap');}};bowl.append(minus);targets.append(bowl);
});
stage.append(targets);
const remaining=q.total-a.reduce((x,y)=>x+y,0),supply=el('div','supply');supply.append(el('span','counter',t('remaining',{n:remaining})));
const add=token('firefly',t('firefly'),{type:'firefly'},()=>applyDrop({type:'firefly'},{type:'pumpkin',index:selected}));add.disabled=solved||remaining===0;supply.append(add);stage.append(supply);
}
if(q.area==='garden'){
const desk=el('div','garden-desk'),tray=el('div','tray');
a.forEach((value,i)=>{const b=button('',()=>{if(!solved&&!suppressClick){a[i]=selected;change();sound('tap');}},'well'+(value===0?' moon':value===1?' dew':''));b.setAttribute('aria-label',t('well',{n:i+1})+' · '+t(value===0?'moon':value===1?'dew':'empty'));if(value!==null)b.append(icon(value===0?'moon':'dew'));dropZone(b,{type:'well',index:i});b.disabled=solved;tray.append(b);});
desk.append(tray);const flower=el('div','bloom'+(solved?' restored':''));flower.append(icon('flower'));desk.append(flower);stage.append(desk);
const supply=el('div','supply');[0,1].forEach(v=>{const b=token(v===0?'potion':'dew',t(v===0?'moon':'dew'),{type:'drop',value:v},()=>{selected=v;change();},selected===v?'selected':'');b.setAttribute('aria-pressed',String(selected===v));b.disabled=solved;supply.append(b,el('span','',t(v===0?'moon':'dew')));});stage.append(supply);
}
if(q.area==='library'){
const book=el('div','book'+(solved?' restored':''));book.setAttribute('aria-label',t('book'));dropZone(book,{type:'book'});book.append(icon(q.icon),el('p','',q.clue));
const slots=el('div','word-slots');
Array.from(q.word).forEach((_,i)=>{const tile=q.tiles.find(x=>x.id===a[i]),b=button(tile?.letter||'·',()=>{if(!solved&&tile){a.splice(i,1);change();}},'word-slot');b.disabled=solved||!tile;b.setAttribute('aria-label',tile?t('letter',{letter:tile.letter}):t('empty'));slots.append(b);});book.append(slots);stage.append(book);
const supply=el('div','supply');q.tiles.filter(x=>!a.includes(x.id)).forEach(tile=>supply.append(token(null,tile.letter,{type:'letter',id:tile.id},()=>applyDrop({type:'letter',id:tile.id},{type:'book'}),'letter')));
stage.append(supply,button(t('listen'),()=>speak(q.word))); 
}
if(q.area==='clock'){
const desk=el('div','clock-desk');
if(q.kind==='read'){const example=el('div','clock-block');example.append(el('p','',t('example')),clock(q.start,false));desk.append(example);}
const player=el('div','clock-block');player.append(el('p','',t('yourClock')),clock(a,true),el('div','digital',time(a)));
desk.append(player);stage.append(desk);
const controls=el('div','clock-controls');[[t('hour')+' −',-60],[t('hour')+' +',60],[t('minute')+' −5',-5],[t('minute')+' +5',5]].forEach(([label,delta])=>{const b=button(label,()=>{if(!solved){a=(a+delta+1440)%1440;change();sound('tap');}});b.disabled=solved;controls.append(b);});stage.append(controls);
}
if(q.area==='lights'&&q.kind==='pattern'){
const row=el('div','pattern');
q.sequence.forEach((v,i)=>{const cell=el('div','pattern-cell'+(i===q.missing?' missing':'')+(hints&&i<q.unit.length?' unit':''));cell.setAttribute('role','img');cell.setAttribute('aria-label',i===q.missing?(a===null?'?':L[state.prefs.lang].symbols[a]):L[state.prefs.lang].symbols[v]);if(i===q.missing){dropZone(cell,{type:'missing'});if(a===null)cell.textContent='?';else cell.append(icon(['moon','star','leaf'][a]));}else cell.append(icon(['moon','star','leaf'][v]));row.append(cell);});stage.append(row);
const supply=el('div','supply');[0,1,2].forEach(v=>{const b=token(['moon','star','leaf'][v],L[state.prefs.lang].symbols[v],{type:'symbol',value:v},()=>applyDrop({type:'symbol',value:v},{type:'missing'}),a===v?'selected':'');b.setAttribute('aria-pressed',String(a===v));b.disabled=solved;supply.append(b);});stage.append(supply);
}
if(q.area==='lights'&&q.kind==='mirror'){
const board=el('div','mirror-stage'),ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 500 500');svg.classList.add('ray');svg.setAttribute('aria-hidden','true');
const result=E.trace(q,a),points=result.points.map(p=>(100+p.x*100)+','+(100+p.y*100)).join(' '),line=document.createElementNS(ns,'polyline');line.setAttribute('points',points);line.setAttribute('fill','none');line.setAttribute('stroke',result.success?'#fff0a4':'#f4c567');line.setAttribute('stroke-width','6');line.setAttribute('stroke-linejoin','round');svg.append(line);board.append(svg);
const source=el('span','source','✦');source.style.top=(15+(q.source?.y??1)*20)+'%';board.append(source);const dest=el('span','destination','✦');dest.style.top=(15+q.exit.y*20)+'%';dest.setAttribute('aria-label',t('target'));board.append(dest);
q.mirrors.forEach((m,i)=>{const b=button(a[i]===0?'/':'\\',()=>{if(!solved){a[i]=1-a[i];change();sound('tap');}},'mirror');b.style.left=(13+m.x*20)+'%';b.style.top=(13+m.y*20)+'%';b.disabled=solved;b.setAttribute('aria-label',t('mirrorLabel',{n:i+1,direction:t(a[i]===0?'slash':'backslash')}));board.append(b);});stage.append(board);
}
if(hadFocus&&!solved){const focusable=[...stage.querySelectorAll('button,[tabindex]')];const match=focusable.find(e=>oldLabel?e.getAttribute('aria-label')===oldLabel:e.textContent===oldText);match?.focus({preventScroll:true});}
}
function clock(minutes,interactive){
const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 220 220');svg.classList.add('clock-svg');svg.setAttribute('role','img');svg.setAttribute('aria-label',t('clockLabel',{time:time(minutes)}));
const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;svg.append(e);return e;};
add('circle',{cx:110,cy:110,r:103,fill:'#f8e5c0',stroke:'#bd985d','stroke-width':7});
for(let n=1;n<=12;n++){const theta=n*Math.PI/6;add('text',{x:110+79*Math.sin(theta),y:116-79*Math.cos(theta),'text-anchor':'middle',fill:'#403043','font-size':16,'font-weight':700},String(n));}
let hour,minute;
function hands(value){const ha=value%720/720*Math.PI*2,ma=value%60/60*Math.PI*2;[[hour,ha,45],[minute,ma,68]].forEach(([e,theta,l])=>{if(e){e.setAttribute('x2',110+Math.sin(theta)*l);e.setAttribute('y2',110-Math.cos(theta)*l);}});}
hour=add('line',{x1:110,y1:110,'stroke-width':7,'stroke-linecap':'round',class:'hour-hand'});
minute=add('line',{x1:110,y1:110,'stroke-width':4,'stroke-linecap':'round',class:'minute-hand'});hands(minutes);add('circle',{cx:110,cy:110,r:7,fill:'#b7709e'});
if(interactive&&!solved){let moving=false,previous=minutes;const update=e=>{const r=svg.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2,m=(Math.round((Math.atan2(x,-y)+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*12)%12)*5;a=Math.floor(a/60)*60+m;hands(a);svg.setAttribute('aria-label',t('clockLabel',{time:time(a)}));svg.parentElement.querySelector('.digital').textContent=time(a);draft();};
svg.onpointerdown=e=>{previous=a;moving=true;svg.setPointerCapture(e.pointerId);update(e);e.preventDefault();};svg.onpointermove=e=>{if(moving)update(e);};svg.onpointerup=()=>{moving=false;};svg.onpointercancel=()=>{moving=false;a=previous;hands(a);svg.parentElement.querySelector('.digital').textContent=time(a);draft();};}
return svg;
}
function actual(){return q.area==='library'?a.map(id=>q.tiles.find(x=>x.id===id)?.letter||'').join(''):a;}
function hintText(){
if(q.area==='bridge')return hints<2?t('bridgeHint',{targets:q.targets.join(' + '),total:q.total}):t('bridgeHint2',{n:Math.max(0,q.targets[0]-a[0])})+' '+t('bridgeHint',{targets:q.targets.join(' + '),total:q.total});
if(q.area==='garden')return hints<2?t('gardenHint',{total:q.total,den:q.den,size:q.total/q.den,num:q.num}):t('gardenHint2',{moon:q.moon,dew:q.total-q.moon});
if(q.area==='library')return hints<2?t('libraryHint',{word:q.word}):t('libraryHint2',{letter:Array.from(q.word)[a.length]||q.word})+' '+t('libraryHint',{word:q.word});
if(q.area==='clock'){const rule=q.kind==='read'?t('clockReadRule'):t(q.kind==='schedule'?'clockMinus':'clockPlus',{duration:q.duration,time:time(q.start)});return hints<2?t('clockHint',{rule}):t('clockHint2',{time:time(q.answer)});}
if(q.kind==='pattern')return hints<2?t('patternHint',{unit:q.unit.map(v=>L[state.prefs.lang].symbols[v]).join(' · ')}):t('patternHint2',{symbol:L[state.prefs.lang].symbols[q.answer]});
return hints<2?t('mirrorHint'):t('mirrorHint2',{mirrors:q.mirrors.map(m=>m.solution===0?'/':'\\').join(' · ')});
}
$('hint').onclick=()=>{if(solved)return;assisted=true;hints++;$('hint-text').hidden=false;$('hint-text').textContent=t('hintPrefix')+' '+hintText();renderStage();draft();sound('tap');};
$('reset').onclick=()=>{if(solved)return;a=initial();selected=0;change();$('feedback').textContent=t('feedback');};
$('check').onclick=()=>{
if(solved)return;attempts++;if(!E.check(q,actual())){$('feedback').textContent=t('retry');draft();sound('soft');return;}
solved=true;profile().events.push({id:crypto.randomUUID(),area:q.area,level:q.level,attempts,assisted,date:new Date().toISOString()});profile().draft=null;save();
$('feedback').textContent=t(assisted?'assist':'good');$('check').hidden=true;$('continue').hidden=false;$('reset').disabled=true;$('hint').disabled=true;
renderStage();sound('good');document.body.classList.add('restoration');setTimeout(()=>document.body.classList.remove('restoration'),1800);$('continue').focus({preventScroll:true});renderMap();
};
function toMap(){if(q&&!solved)draft();q=null;solved=false;$('language').disabled=false;$('profile').disabled=false;$('profile-add').disabled=false;$('nickname').disabled=false;show('map');localize();}
function finishTravel(){if(travelTimer)clearTimeout(travelTimer);travelTimer=null;$('travel').hidden=true;toMap();}
$('continue').onclick=()=>{if(state.prefs.motion){toMap();return;}$('travel').hidden=false;$('skip').focus();travelTimer=setTimeout(finishTravel,2200);};
$('skip').onclick=finishTravel;
$('village').onclick=toMap;
$('start').onclick=()=>{unlockAudio();const d=profile().draft;if(d?.q?.area&&E.areas.includes(d.q.area)&&d.lang===state.prefs.lang){enter(d.q.area,true);}else{show('map');renderMap();}};
function settingsOpen(){unlockAudio();$('settings').showModal();}
$('settings-open').onclick=settingsOpen;$('welcome-settings').onclick=settingsOpen;$('progress-open').onclick=()=>{renderStats();$('progress').showModal();};
$('language').onchange=()=>{state.prefs.lang=$('language').value;profile().draft=null;localize();};
$('profile').onchange=()=>{state.selected=$('profile').value;localize();};
$('profile-form').onsubmit=e=>{e.preventDefault();if(q)return;if(state.profiles.length>=8){$('profile-status').textContent=t('maxProfiles');return;}const name=$('nickname').value.trim();if(!name)return;const p={id:crypto.randomUUID(),name,events:[],draft:null};state.profiles.push(p);state.selected=p.id;$('nickname').value='';localize();$('profile-status').textContent=t('newProfile');};
$('motion').onchange=()=>{state.prefs.motion=$('motion').checked;document.body.dataset.motion=state.prefs.motion?'reduced':'normal';save();};
['music','effects'].forEach(key=>$(key+'-volume').oninput=()=>{state.prefs[key]=Number($(key+'-volume').value);save();unlockAudio();legacyAudio.update();});
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(_){}};
if(!document.documentElement.requestFullscreen)$('fullscreen').hidden=true;
function speak(word){unlockAudio();if(!('speechSynthesis'in window)){assisted=true;hints=Math.max(hints,1);$('hint-text').hidden=false;$('hint-text').textContent=t('libraryHint',{word});draft();return;}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(word);utterance.lang=state.prefs.lang==='nl'?'nl-BE':'fr-BE';utterance.rate=.75;speechSynthesis.speak(utterance);}
function draggable(b,payload){b.onpointerdown=e=>{if(solved||e.button>0)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,payload,source:b,moved:false};};}
document.addEventListener('pointermove',e=>{
if(!drag||drag.id!==e.pointerId)return;
if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>8)drag.moved=true;if(!drag.moved)return;
e.preventDefault();const ghost=$('drag-ghost');if(ghost.hidden){ghost.replaceChildren(...[...drag.source.childNodes].map(n=>n.cloneNode(true)));ghost.hidden=false;}ghost.style.left=(e.clientX+12)+'px';ghost.style.top=(e.clientY-24)+'px';
document.querySelectorAll('.drop-hover').forEach(n=>n.classList.remove('drop-hover'));const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');target?.classList.add('drop-hover');
},{passive:false});
function endDrag(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;$('drag-ghost').hidden=true;document.querySelectorAll('.drop-hover').forEach(n=>n.classList.remove('drop-hover'));if(d.moved){suppressClick=true;setTimeout(()=>suppressClick=false,250);if(!cancel){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop]');if(target)applyDrop(d.payload,JSON.parse(target.dataset.drop));}}}
document.addEventListener('pointerup',e=>endDrag(e));document.addEventListener('pointercancel',e=>endDrag(e,true));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){endDrag({pointerId:drag.id},true);}});
const legacyAudio=MoonAudio.create({prefs:()=>state.prefs});
function unlockAudio(){legacyAudio.unlock();}
function sound(kind){legacyAudio.play(kind==='good'?'solve':kind==='soft'?'retry':q?.area==='garden'?'pour':q?.area==='library'?'letter':q?.area==='clock'?'clock':q?.area==='lights'?'mirror':'place');}
for(const event of ['pointerdown','touchend','click','keydown'])document.addEventListener(event,unlockAudio,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)legacyAudio.suspend();else legacyAudio.resume();});
window.addEventListener('pagehide',()=>{if(q&&!solved)draft();else save();});
for(let i=0;i<18;i++){const s=el('span','spark');s.style.left=(8+Math.random()*84)+'%';s.style.top=(20+Math.random()*70)+'%';s.style.animationDelay=(-Math.random()*5)+'s';$('particles').append(s);}

localize();show('welcome');

