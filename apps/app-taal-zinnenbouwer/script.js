(() => {
  'use strict';
  const $=id=>document.getElementById(id);let current,chosen=[],locked=false,drag=null;
  function stopDrag(){if(drag){drag.ghost.remove();drag=null;}$('sentence-tray').classList.remove('drop-active');}
  function insert(id,index){if(locked)return;chosen=chosen.filter(value=>value!==id);chosen.splice(Math.min(index,chosen.length),0,id);renderWords();}
  function remove(id){if(locked)return;chosen=chosen.filter(value=>value!==id);renderWords();}
  function wordButton(id,inSentence){
    const button=document.createElement('button');button.type='button';button.className='word';button.textContent=current.tokens[id];button.dataset.wordId=id;button.disabled=locked;
    button.setAttribute('aria-label',current.tokens[id]+(inSentence?' · terug naar de woorden':' · toevoegen aan de zin'));
    button.addEventListener('click',event=>{if(event.detail===0){if(inSentence)remove(id);else insert(id,chosen.length);}});
    button.addEventListener('pointerdown',event=>{if(locked||drag||event.button!==0)return;event.preventDefault();button.setPointerCapture(event.pointerId);const ghost=document.createElement('div');ghost.className='word-ghost';ghost.textContent=current.tokens[id];ghost.hidden=true;document.body.append(ghost);drag={id,pointer:event.pointerId,x:event.clientX,y:event.clientY,moved:false,ghost,inSentence};});
    button.addEventListener('pointermove',event=>{if(!drag||drag.pointer!==event.pointerId)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;if(!drag.moved)return;drag.ghost.hidden=false;drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';const rect=$('sentence-tray').getBoundingClientRect();$('sentence-tray').classList.toggle('drop-active',event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom);});
    button.addEventListener('pointerup',event=>{
      if(!drag||drag.pointer!==event.pointerId)return;const active=drag,rect=$('sentence-tray').getBoundingClientRect(),bank=$('word-bank').getBoundingClientRect();
      const inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      let index=chosen.filter(value=>value!==id).length;
      if(inside){const remaining=[...$('sentence-tray').querySelectorAll('button')].filter(el=>Number(el.dataset.wordId)!==id);const before=remaining.findIndex(el=>{const r=el.getBoundingClientRect();return event.clientY<r.top||event.clientY<=r.bottom&&event.clientX<(r.left+r.right)/2;});if(before>=0)index=before;}
      stopDrag();
      if(!active.moved){if(inSentence)remove(id);else insert(id,chosen.length);}
      else if(inside)insert(id,index);
      else if(inSentence&&event.clientX>=bank.left&&event.clientX<=bank.right&&event.clientY>=bank.top&&event.clientY<=bank.bottom)remove(id);
    });
    button.addEventListener('pointercancel',stopDrag);button.addEventListener('lostpointercapture',stopDrag);return button;
  }
  function renderWords(){
    $('word-bank').replaceChildren(...current.order.filter(id=>!chosen.includes(id)).map(id=>wordButton(id,false)));
    $('sentence-tray').replaceChildren(...chosen.map(id=>wordButton(id,true)));
    if(!chosen.length){const hint=document.createElement('span');hint.className='placeholder';hint.textContent='Leg hier je zin';$('sentence-tray').append(hint);}
    $('clear-words').disabled=locked||!chosen.length;
  }
  $('clear-words').addEventListener('click',()=>{if(locked)return;stopDrag();chosen=[];renderWords();});
  window.lerenGame={exerciseKey:'app-taal-zinnenbouwer',levels:window.ZinnenGame.levels,maxLevel:3,makeQuestion:window.ZinnenGame.makeQuestion,
    render(question){stopDrag();current=question;chosen=[];locked=false;renderWords();},
    check(question){if(chosen.length<question.tokens.length)return {incomplete:true,message:'Gebruik alle woorden en leestekens om je zin te maken.'};const correct=chosen.map(id=>question.tokens[id]).join(' ')===question.tokens.join(' ');return {correct,message:correct?'Juist! '+question.sentence:'Nog niet. Kijk naar de hoofdletter, de volgorde en het leesteken op het einde.'};},
    lock(){locked=true;stopDrag();renderWords();}
  };
})();
