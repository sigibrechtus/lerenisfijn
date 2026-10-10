/* Optional adventures share the explorer's scene and save independently of the lantern campaign. */
(function(root){'use strict';
function attach(options){
 const {$,world,prefs,profile,save,blocked,frame,leaveCampaign,soundtrack,effect}=options;
 let begun=false,near=null,active=null,runtime=null,finished=false,oldLocation=null,roundKey='',lastSnapshot=null,travel=null,axis={x:0,z:0,y:0},padPointers=new Map(),lastMotion=null;
 const destinations=root.MoonDestinations.create(world,{lang:()=>prefs().lang});
 const catalog=root.MoonMiniGames.catalog,fr=()=>prefs().lang==='fr',say=(nl,french)=>fr()?french:nl;
 const editIds=['language','profile','nickname','add','difficulty','coat','skin'];
 function gameProgress(id){const value=profile().attractions?.[id];return value&&Number.isInteger(value.sessions)&&value.sessions>0?{...value,bestLevel:Number.isInteger(value.bestLevel)?Math.max(0,Math.min(3,value.bestLevel)):0}:{sessions:0,bestLevel:0};}
 function resetMovement(){axis={x:0,z:0,y:0};padPointers.clear();runtime?.input(0,0,0);for(const b of $('mini-driving').querySelectorAll('button'))b.classList.remove('held');}
 function updateInput(){const input={x:0,z:0,y:0};for(const value of padPointers.values())input[value.axis]+=value.value;axis={x:Math.max(-1,Math.min(1,input.x)),z:Math.max(-1,Math.min(1,input.z)),y:Math.max(-1,Math.min(1,input.y))};runtime?.input(axis.x,axis.z,axis.y);}
 function localize(){
  const mode=world.viewMode();$('view-label').textContent=say('Camera tijdens verkennen','Caméra pendant l’exploration');$('view').value=mode;
  $('view').options[0].textContent=say('Derde persoon — zie je personage','Troisième personne — voir le personnage');$('view').options[1].textContent=say('Eerste persoon — door je ogen','Première personne — à travers tes yeux');
  $('view-toggle').textContent=mode==='first'?say('👤 Derde persoon','👤 Troisième personne'):say('👁 Eerste persoon','👁 Première personne');$('view-toggle').setAttribute('aria-pressed',String(mode==='first'));$('view-toggle').title=say('V: wissel de verkennende camera','V : changer la caméra d’exploration');
  $('view-toggle').disabled=!!active||document.body.classList.contains('puzzle-mode')||document.body.classList.contains('train-mode');$('view').disabled=!!active;
  $('view-help').textContent=say('V wisselt de camera. Veeg of sleep rechts om rond te kijken. Oefeningen gebruiken hun eigen duidelijke camerabeeld.','V change la caméra. Glisse ou maintiens le bouton droit pour regarder. Les activités utilisent leur propre cadrage.');
  $('attraction-map-title').textContent=say('Zes extra avonturen','Six aventures supplémentaires');$('attraction-map-help').textContent=say('Vrij te bezoeken. Hun beloningen worden apart van het lantaarnverhaal bewaard.','Accès libre. Leurs récompenses sont enregistrées séparément du récit des lanternes.');
  $('attraction-enter').textContent=say('Binnenkomen en spelen · E','Entrer et jouer · E');$('mini-leave').textContent=say('Terug naar de wereld','Retour au monde');$('mini-replay').textContent=say('Nog een avontuur','Rejouer');$('mini-question-label').textContent=say('Je opdracht','Ta mission');$('mini-hint-label').textContent=say('Zo speel je','Comment jouer');
  const controls={left:say('← Links','← Gauche'),right:say('Rechts →','Droite →'),forward:say('↑ Vooruit','↑ Avancer'),back:say('↓ Achteruit / rem','↓ Reculer / freiner'),up:say('⇧ Stijgen','⇧ Monter'),down:say('⇩ Dalen','⇩ Descendre')};for(const [key,label]of Object.entries(controls))$('mini-'+key).textContent=label;
  destinations.language(prefs().lang);renderMap();updateOffer();if(lastSnapshot)render(lastSnapshot);
 }
 function updateOffer(){const visible=begun&&!!near&&!active&&!document.body.classList.contains('puzzle-mode')&&!document.body.classList.contains('train-mode')&&!blocked();$('attraction-offer').hidden=!visible;if(!visible)return;$('attraction-name').textContent=catalog[near].name[prefs().lang];$('attraction-description').textContent=catalog[near].description[prefs().lang];$('attraction-rewards').textContent=gameProgress(near).sessions?say('★ Voltooide avonturen: ','★ Aventures terminées : ')+gameProgress(near).sessions:say('Drie rondes · geen tijdsdruk','Trois manches · sans limite de temps');}
 function renderMap(){const target=$('attraction-map');target.replaceChildren();for(const [id,item]of Object.entries(catalog)){const b=document.createElement('button');b.type='button';b.disabled=!begun;b.textContent=root.MoonDestinations.sites[id].icon+' '+item.name[prefs().lang];const small=document.createElement('small'),p=gameProgress(id);small.textContent=begun?(p.sessions?'★ '+p.sessions+' · '+say('beste niveau ','meilleur niveau ')+p.bestLevel:say('Nieuw avontuur','Nouvelle aventure')):say('Begin eerst je reis','Commence d’abord ton voyage');b.append(small);b.onclick=()=>{leaveCampaign();leave();$('journal').close();const p=root.MoonDestinations.sites[id].entry;world.start(p,world.railState().station);world.resetInput();near=id;updateOffer();$('world').focus();};target.append(b);}}
 function seedFor(id){let hash=2166136261;for(const c of profile().id+':'+id+':'+gameProgress(id).sessions)hash=Math.imul(hash^c.charCodeAt(0),16777619);return hash>>>0;}
 function enter(id=near){
  if(!begun||!catalog[id]||active||blocked())return false;
  leaveCampaign();world.resetInput();oldLocation={x:world.hero.position.x,z:world.hero.position.z};active=id;finished=false;roundKey='';lastSnapshot=null;resetMovement();
  document.body.classList.add('mini-game-mode');$('attraction-offer').hidden=true;$('mini-panel').hidden=false;$('interact').hidden=true;$('mini-replay').hidden=true;
  for(const key of editIds)$(key).disabled=true;
  world.externalActivity(true);
  const p=gameProgress(id),level=prefs().difficulty==='auto'?Math.min(3,p.bestLevel+1):Number(prefs().difficulty)||1;
  try{runtime=root.MoonMiniGameWorld.create({B:root.BABYLON,scene:world.scene,quality:prefs().quality==='low'?'low':'balanced',reducedMotion:!!prefs().motion,paused:blocked,frame,onUpdate:render,onComplete:complete,effect:k=>effect(k==='success'?'solve':k)});
  runtime.start(id,{level,lang:prefs().lang,seed:seedFor(id)});}catch(error){leave();console.error(error);$('lumi-line').textContent=say('Dit avontuur kon niet starten. Probeer opnieuw.','Cette aventure n’a pas pu démarrer. Réessaie.');return false;}
  soundtrack.weather({rain:0,wind:0});soundtrack.setMusic(root.MoonDestinations.sites[id].music,{lock:true});effect('ui');localize();$('mini-title').focus({preventScroll:true});return true;
 }
 function render(snapshot){if(!snapshot)return;lastSnapshot=snapshot;$('mini-title').textContent=snapshot.name;$('mini-question').textContent=snapshot.question;$('mini-how').textContent=snapshot.how;$('mini-progress').textContent=snapshot.completed?say('★ Drie rondes gelukt','★ Trois manches réussies'):say('Ronde ','Manche ')+snapshot.round+'/3 · '+say('niveau ','niveau ')+snapshot.level;
  $('mini-feedback').textContent=snapshot.feedback||say('Je kunt rustig proberen en aanpassen.','Prends ton temps pour essayer et ajuster.');$('mini-feedback').setAttribute('aria-live',snapshot.feedback?'polite':'off');
  const key=snapshot.round+'|'+snapshot.completed+'|'+snapshot.choices.map(c=>c.id+':'+c.label+':'+c.disabled).join('|');if(key!==roundKey){roundKey=key;const controls=$('mini-choices');const focus=document.activeElement?.dataset?.miniAction;controls.replaceChildren(...snapshot.choices.map(c=>{const b=document.createElement('button');b.type='button';b.textContent=c.label;b.disabled=c.disabled;b.dataset.miniAction=c.id;b.onclick=()=>runtime?.action(c.id);return b;}));if(focus){const next=[...controls.children].find(b=>b.dataset.miniAction===focus&&!b.disabled);next?.focus({preventScroll:true});}}
  $('mini-driving').hidden=!['broom','rally'].includes(snapshot.id)||snapshot.completed;for(const id of ['mini-up','mini-down'])$(id).hidden=snapshot.id!=='broom';$('mini-replay').hidden=!snapshot.completed;$('mini-panel').dataset.vehicle=String(['broom','rally'].includes(snapshot.id));runtime?.refit();
 }
 function complete(snapshot){if(finished||!active)return;finished=true;resetMovement();const previous=gameProgress(active);profile().attractions={...profile().attractions,[active]:{sessions:previous.sessions+1,bestLevel:Math.max(previous.bestLevel,snapshot.level),lastPlayed:new Date().toISOString()}};save();renderMap();$('mini-replay').hidden=false;}
 function leave(){if(!active)return;resetMovement();runtime?.dispose();runtime=null;active=null;finished=false;lastSnapshot=null;roundKey='';document.body.classList.remove('mini-game-mode');$('mini-panel').hidden=true;for(const key of editIds)$(key).disabled=false;world.externalActivity(false);soundtrack.setMusic('village',{lock:false});soundtrack.position(world.hero.position.x,world.hero.position.z);localize();updateOffer();$('world').focus();oldLocation=null;}
 function tick(dt,status){
  if(!begun)return;
  localizeViewAvailability();
  if(active){if(status.blocked){if(lastMotion!==true)resetMovement();lastMotion=true;return;}lastMotion=false;runtime?.tick(dt);const camera=world.scene.activeCamera;if(camera){camera.computeWorldMatrix();const B=root.BABYLON;options.listener?.(camera.globalPosition,camera.getForwardRay().direction,B.Vector3.TransformNormal(B.Vector3.Up(),camera.getWorldMatrix()).normalize());}return;}
  if(status.blocked||status.mode!=='world'){if(near){near=null;updateOffer();}return;}
  destinations.tick(dt,!!prefs().motion);const next=destinations.nearest(world.hero.position.x,world.hero.position.z);if(next!==near){near=next;updateOffer();}else if(near&&$('attraction-offer').hidden)updateOffer();
 }
 function localizeViewAvailability(){$('view-toggle').disabled=!!active||document.body.classList.contains('puzzle-mode')||document.body.classList.contains('train-mode');}
 $('view-toggle').onclick=()=>{if(!$('view-toggle').disabled)world.view(world.viewMode()==='first'?'third':'first');localize();};$('view').onchange=()=>{world.view($('view').value);localize();};$('attraction-enter').onclick=()=>enter();$('mini-leave').onclick=leave;$('mini-replay').onclick=()=>{const id=active;leave();enter(id);};
 for(const b of $('mini-driving').querySelectorAll('[data-axis]')){
  b.onpointerdown=e=>{if(!active||blocked()||e.button!==0)return;e.preventDefault();padPointers.set(e.pointerId,{axis:b.dataset.axis,value:Number(b.dataset.value)});b.setPointerCapture?.(e.pointerId);b.classList.add('held');updateInput();};
  const release=e=>{if(!padPointers.delete(e.pointerId))return;b.classList.remove('held');updateInput();};for(const kind of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(kind,release);
  b.onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();padPointers.set('keyboard:'+b.id,{axis:b.dataset.axis,value:Number(b.dataset.value)});b.classList.add('held');updateInput();}};
  b.onkeyup=e=>{if(e.key===' '||e.key==='Enter'){padPointers.delete('keyboard:'+b.id);b.classList.remove('held');updateInput();}};b.onblur=()=>{padPointers.delete('keyboard:'+b.id);b.classList.remove('held');updateInput();};
 }
 root.addEventListener('blur',resetMovement);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetMovement();});
 root.addEventListener('keydown',e=>{if(e.repeat||e.key.toLowerCase()!=='e'||active||!near||blocked()||/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target?.tagName)||e.target?.isContentEditable)return;e.preventDefault();enter();});
 localize();return{start(){begun=true;renderMap();},localize,renderMap,frame:tick,enter,leave,refit(){runtime?.refit();},get active(){return active;},get near(){return near;},destinations};
}
root.MoonAttractions={attach};
})(window);
