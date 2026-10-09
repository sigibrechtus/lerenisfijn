(() => {
  'use strict';
  const KEY='lerenisfijn-sound';
  let enabled=true,volume=.8,request=0;
  try {enabled=localStorage.getItem(KEY)!=='off';const saved=localStorage.getItem(KEY+'-volume');if(saved!==null)volume=Math.max(.1,Math.min(1,Number(saved)||.8));} catch (_) {}
  const scriptURL=document.currentScript?.src||new URL('app-effects.js',document.baseURI).href;
  const sources=Object.fromEntries(['tap','correct','incorrect','complete','back'].map(kind=>[kind,new URL('sounds/'+kind+'.wav',scriptURL).href]));
  const player=document.createElement('audio');player.id='lf-effects-audio';player.preload='auto';player.src=sources.tap;player.hidden=true;player.setAttribute('aria-hidden','true');player.volume=volume;document.body.append(player);
  const tools=document.createElement('details');tools.className='lf-sound-tools';
  const summary=document.createElement('summary');summary.textContent='Geluid';tools.append(summary);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='lf-sound-toggle';
  toggle.addEventListener('click',()=>{setEnabled(!enabled);if(enabled)play('correct',{test:true});});
  const group=document.createElement('div');group.className='lf-sound-tests';
  const status=document.createElement('p');status.className='lf-sound-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const volumeLabel=document.createElement('label');volumeLabel.textContent='Volume geluidseffecten';
  const slider=document.createElement('input');slider.type='range';slider.min='10';slider.max='100';slider.value=String(Math.round(volume*100));slider.setAttribute('aria-label','Volume geluidseffecten');
  slider.addEventListener('input',()=>{volume=Number(slider.value)/100;player.volume=volume;try{localStorage.setItem(KEY+'-volume',String(volume));}catch(_){}});volumeLabel.append(slider);
  function setEnabled(value){enabled=value;try{localStorage.setItem(KEY,enabled?'on':'off');}catch(_){}if(!enabled){request++;player.pause();player.dataset.playback='muted';}refresh();}
  function play(kind,{test=false}={}){
    if(!enabled)return Promise.resolve(false);
    const current=++request;kind=Object.prototype.hasOwnProperty.call(sources,kind)?kind:'tap';
    player.pause();if(player.src!==sources[kind])player.src=sources[kind];try{player.currentTime=0;}catch(_){}player.muted=false;player.volume=volume;player.dataset.effect=kind;player.dataset.playback='starting';
    let result;try{result=player.play();}catch(error){result=Promise.reject(error);}
    return Promise.resolve(result).then(()=>{if(current===request){player.dataset.playback='playing';if(test)status.textContent='De geluidstest speelt af. Hoor je niets? Controleer het volume van je toestel.';}return true;}).catch(error=>{
      if(current!==request||error.name==='AbortError')return false;
      player.dataset.playback='blocked';tools.open=true;status.textContent=error.name==='NotAllowedError'?'De browser blokkeert geluid. Tik op Test goed om geluid te activeren.':'Het geluid kon niet geladen worden. Vernieuw de pagina en probeer de geluidstest.';return false;
    });
  }
  player.addEventListener('ended',()=>{player.dataset.playback='ended';});
  for(const [kind,label] of [['correct','Test goed'],['incorrect','Test fout'],['back','Test terug']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>{setEnabled(true);play(kind,{test:true});});group.append(button);}
  tools.append(toggle,group,volumeLabel,status);
  const settingsRoot=document.querySelector('#screen-settings .settings, #screen-settings, #instellingen, #app-settings, #exercise-settings, #settings, #options');
  (settingsRoot||document.body).append(tools);
  function feedback(kind,target){
    play(kind);
    const element=typeof target==='string'?document.querySelector(target):target;
    if(element){element.classList.remove('lf-correct','lf-incorrect');void element.offsetWidth;element.classList.add(kind==='incorrect'?'lf-incorrect':'lf-correct');}
    if(kind==='correct'||kind==='complete'){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      const burst=document.createElement('div');burst.className='lf-celebration';burst.setAttribute('aria-hidden','true');
      for(let i=0;i<(kind==='complete'?18:9);i++){const star=document.createElement('span');star.textContent=i%3?'★':'●';star.style.setProperty('--x',Math.round(Math.random()*80-40)+'vw');star.style.setProperty('--turn',Math.round(Math.random()*360)+'deg');star.style.color=['#ff7a45','#4dabf7','#e9ad0b','#49a56a'][i%4];burst.append(star);}
      document.body.append(burst);setTimeout(()=>burst.remove(),1000);
    }
  }
  function refresh(){toggle.textContent=enabled?'🔊 Geluid aan':'🔇 Geluid uit';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'Geluid uitzetten':'Geluid aanzetten');}
  refresh();
  const isBack=control=>control.classList.contains('app-home-link')||/^(←|terug|overzicht|startscherm)/i.test(control.textContent.trim());
  // A click is activated after a touch is released. Starting media on touch
  // pointerdown can be blocked before the browser grants user activation.
  // Capture runs before answer handlers, so their result cue takes precedence.
  document.addEventListener('click',event=>{
    const control=event.target.closest('button,a.app-home-link,a.app-settings-button,summary');
    if(enabled&&control&&!control.closest('.lf-sound-tools')&&!control.classList.contains('app-sound-button')&&!isBack(control))play('tap');
  },{capture:true});
  document.addEventListener('click',event=>{
    const control=event.target.closest('button,a.app-home-link');if(!control||control.closest('.lf-sound-tools')||control.classList.contains('app-sound-button'))return;
    const back=isBack(control);
    if(back){
      if(control.tagName==='A'&&enabled&&event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&control.target!=='_blank'&&new URL(control.href).origin===location.origin){
        event.preventDefault();let navigated=false;const go=()=>{if(navigated)return;navigated=true;location.assign(control.href);};const fallback=setTimeout(go,350);play('back').then(ok=>{if(ok)setTimeout(()=>{clearTimeout(fallback);go();},180);else{clearTimeout(fallback);go();}});
      }else play('back');
    }
  });
  window.addEventListener('storage',event=>{if(event.key===KEY){enabled=event.newValue!=='off';if(!enabled)player.pause();refresh();}else if(event.key===KEY+'-volume'){volume=Math.max(.1,Math.min(1,Number(event.newValue)||.8));slider.value=String(Math.round(volume*100));player.volume=volume;}});
  window.lerenEffects={correct:target=>feedback('correct',target),incorrect:target=>feedback('incorrect',target),complete:target=>feedback('complete',target),tap:()=>play('tap'),back:()=>play('back'),test:kind=>{setEnabled(true);return play(kind,{test:true});}};
})();
