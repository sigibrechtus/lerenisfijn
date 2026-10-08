(() => {
  'use strict';
  const KEY='lerenisfijn-sound';
  let enabled=true,context=null;
  try {enabled=localStorage.getItem(KEY)!=='off';} catch (_) {}
  const buttons=[];
  function unlock(){
    if(!enabled)return;
    try {const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;context ||= new Audio();if(context.state==='suspended')context.resume().catch(()=>{});} catch (_) {}
  }
  function play(kind){
    if(!enabled)return;unlock();if(!context||context.state!=='running')return;
    const tones={tap:[520],correct:[523,659,784],incorrect:[330,262],complete:[523,659,784,1047]};
    const notes=tones[kind]||tones.tap,step=kind==='tap'?.055:.115;
    try {notes.forEach((frequency,index)=>{
      const oscillator=context.createOscillator(),gain=context.createGain(),at=context.currentTime+index*step;
      oscillator.type='sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(kind==='tap'?.025:.065,at+.012);gain.gain.exponentialRampToValueAtTime(.001,at+step);
      oscillator.connect(gain);gain.connect(context.destination);oscillator.start(at);oscillator.stop(at+step+.02);
    });} catch (_) {}
  }
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
  function refresh(){buttons.forEach(button=>{button.textContent=enabled?'🔊':'🔇';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Geluid uitzetten':'Geluid aanzetten');button.title=enabled?'Geluid aan':'Geluid uit';});}
  document.querySelectorAll('.app-header-layout').forEach(header=>{
    let actions=header.querySelector(':scope > .app-header-actions, :scope > .app-header-metrics');
    if(!actions){actions=document.createElement('div');actions.className='app-header-actions';const existing=header.querySelector(':scope > .app-settings-button, :scope > .score-badge, :scope > .score-box');if(existing)actions.append(existing);header.append(actions);}
    const button=document.createElement('button');button.type='button';button.className='app-settings-button app-sound-button';
    button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem(KEY,enabled?'on':'off');}catch(_){}refresh();if(enabled){unlock();play('tap');}});
    button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' ')event.stopPropagation();});
    actions.append(button);buttons.push(button);
  });
  refresh();
  document.addEventListener('pointerdown',unlock,{capture:true});document.addEventListener('keydown',unlock,{capture:true});
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(button&&!button.classList.contains('app-sound-button')&&button.type!=='submit'&&!/check|controleer/i.test(button.id))play('tap');});
  window.addEventListener('storage',event=>{if(event.key===KEY){enabled=event.newValue!=='off';refresh();}});
  window.lerenEffects={correct:target=>feedback('correct',target),incorrect:target=>feedback('incorrect',target),complete:target=>feedback('complete',target),tap:()=>play('tap')};
})();
