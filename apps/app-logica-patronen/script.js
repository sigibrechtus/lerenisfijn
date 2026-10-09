(() => {
  'use strict';
  const $=id=>document.getElementById(id),symbolNames={'🔴':'rode cirkel','🔵':'blauwe cirkel','🟡':'gele cirkel','🟢':'groene cirkel','⭐':'ster','🔺':'rode driehoek','🟪':'paars vierkant','🔶':'oranje ruit'};
  let selected=null,locked=false;
  window.lerenGame={exerciseKey:'app-logica-patronen',levels:window.PatroonGame.levels,maxLevel:3,makeQuestion:window.PatroonGame.makeQuestion,
    render(question){
      selected=null;locked=false;
      $('pattern').replaceChildren(...question.sequence.map(value=>{const piece=document.createElement('span');piece.className='pattern-piece'+(value===null?' missing':'');piece.textContent=value===null?'?':value;piece.setAttribute('aria-label',value===null?'Ontbrekend deel':symbolNames[value]||value);return piece;}));
      $('choices').replaceChildren(...question.options.map(value=>{const button=document.createElement('button');button.type='button';button.textContent=value;button.setAttribute('aria-label',symbolNames[value]||value);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{if(locked)return;selected=value;const slot=$('pattern').querySelector('.missing');if(slot){slot.textContent=value;slot.setAttribute('aria-label','Gekozen deel: '+(symbolNames[value]||value));}$('choices').querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});return button;}));
    },
    check(question){if(selected===null)return {incomplete:true,message:'Kies eerst het ontbrekende deel.'};return {correct:selected===question.answer,message:selected===question.answer?'Juist! Het ontbrekende deel is '+(symbolNames[question.answer]||question.answer)+'.':'Nog niet. '+question.hint};},
    lock(){locked=true;$('choices').querySelectorAll('button').forEach(button=>button.disabled=true);}
  };
})();
