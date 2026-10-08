(() => {
  'use strict';
  const game=window.WinkelGame,$=id=>document.getElementById(id);
  let level=1,number=0,score=0,attempts=0,locked=false,timer=null,question,questionId,startedAt;
  let wallet=[],placed=[],pieceId=0,drag=null;
  const buildsMoney=()=>level===1||level===2;
  const pieceLabel=value=>value>=100?'€ '+value/100:value+' cent';
  function stopDrag(){if(drag){drag.ghost.remove();drag=null;}document.querySelectorAll('.drop-active').forEach(el=>el.classList.remove('drop-active'));}
  function movePiece(value,id){
    if(locked)return;
    const stock=wallet.find(item=>item.value===value);
    if(id!==null){const index=placed.findIndex(item=>item.id===id);if(index<0)return;placed.splice(index,1);stock.count++;}
    else {if(!stock||stock.count===0)return;stock.count--;placed.push({value,id:pieceId++});}
    renderMoney();
  }
  function pieceButton(value,count,id){
    const button=document.createElement('button');button.type='button';
    button.className='money-piece '+(value>=500?'banknote':value>=100?'euro-coin':value>=10?'gold-coin':'copper-coin');
    button.textContent=pieceLabel(value);button.dataset.value=value;
    if(id!==null)button.dataset.pieceId=id;
    if(count!==null){const badge=document.createElement('span');badge.className='stock-count';badge.textContent='× '+count;button.append(badge);}
    button.disabled=locked||count===0;
    button.setAttribute('aria-label',pieceLabel(value)+(id===null?', '+count+' beschikbaar. Leg in het betaalvak.':'. Leg terug in de portemonnee.'));
    button.addEventListener('click',event=>{if(event.detail===0)movePiece(value,id);});
    button.addEventListener('pointerdown',event=>{
      if(locked||drag||event.button!==0)return;
      event.preventDefault();button.setPointerCapture(event.pointerId);
      const ghost=document.createElement('div');ghost.className=button.className+' drag-ghost';ghost.textContent=pieceLabel(value);ghost.hidden=true;document.body.append(ghost);
      drag={pointer:event.pointerId,startX:event.clientX,startY:event.clientY,value,id,ghost,moved:false};
    });
    button.addEventListener('pointermove',event=>{
      if(!drag||drag.pointer!==event.pointerId)return;
      if(Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>6)drag.moved=true;
      if(!drag.moved)return;
      drag.ghost.hidden=false;drag.ghost.style.left=event.clientX+'px';drag.ghost.style.top=event.clientY+'px';
      const destination=$(drag.id===null?'pay-tray':'wallet'),rect=destination.getBoundingClientRect();
      destination.classList.toggle('drop-active',event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom);
    });
    button.addEventListener('pointerup',event=>{
      if(!drag||drag.pointer!==event.pointerId)return;
      const active=drag,destination=$(active.id===null?'pay-tray':'wallet'),rect=destination.getBoundingClientRect();
      const inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      stopDrag();if(!active.moved||inside)movePiece(active.value,active.id);
    });
    button.addEventListener('pointercancel',stopDrag);button.addEventListener('lostpointercapture',stopDrag);
    return button;
  }
  function renderMoney(){
    $('available-money').replaceChildren(...wallet.map(item=>pieceButton(item.value,item.count,null)));
    $('placed-money').replaceChildren(...placed.map(item=>pieceButton(item.value,null,item.id)));
    $('placed-total').textContent='Je legt: '+game.money(placed.reduce((total,item)=>total+item.value,0));
    $('clear-money').disabled=locked||placed.length===0;
  }
  function showQuestion(){
    stopDrag();
    question=game.makeQuestion(level);attempts=0;locked=false;startedAt=Date.now();
    questionId=window.lerenProgress?.questionId();
    $('level-name').textContent='Niveau '+level+' · '+game.levels[level];
    $('progress').textContent='Vraag '+(number+1)+' van 10';$('round-progress').value=number;
    $('question').textContent=buildsMoney()?'Leg het juiste bedrag voor dit artikel.':level===5?'Hoeveel wisselgeld krijg je terug?':'Hoeveel kost je winkelmand?';
    $('basket').replaceChildren(...question.items.map(item=>{
      const card=document.createElement('article');card.className='item';
      const emoji=document.createElement('span');emoji.className='emoji';emoji.textContent=item.emoji;emoji.setAttribute('aria-hidden','true');
      const name=document.createElement('strong');name.textContent=item.name;
      const price=document.createElement('span');price.textContent=game.money(item.cents);card.append(emoji,name,price);return card;
    }));
    $('payment').textContent=question.paid===null?'':'Je betaalt met '+game.money(question.paid)+'.';
    $('answer').value='';$('answer').disabled=false;$('check').disabled=false;$('check').textContent='Controleer';
    $('money-builder').hidden=!buildsMoney();$('keyboard-answer').hidden=buildsMoney();
    $('feedback').textContent='';$('feedback').className='';
    if(buildsMoney()){wallet=game.makeWallet(question.answer,level===2);placed=[];renderMoney();$('check').focus();}else $('answer').focus();
  }
  function startRound(){
    clearTimeout(timer);number=0;score=0;$('score').textContent=0;
    level=Number($('level').value);$('summary').hidden=true;$('quiz').hidden=false;showQuestion();
  }
  function finishRound(){
    $('quiz').hidden=true;$('summary').hidden=false;
    const next=game.nextLevel(level,score);
    $('summary-text').textContent=score+' van de 10 goed in één keer. '+(next>level?'Goed gedaan! Je gaat naar niveau '+next+'.':score>=8?'Je beheerst het hoogste niveau! Blijf oefenen met nieuwe winkelmandjes.':'We oefenen nog een reeks op niveau '+level+'. Neem rustig je tijd.');
    $('level').value=next;$('continue').textContent=next>level?'Naar niveau '+next:'Nog een reeks';$('continue').focus();
  }
  $('answer-form').addEventListener('submit',event=>{
    event.preventDefault();if(locked)return;
    if(buildsMoney()&&!placed.length){$('feedback').textContent='Leg eerst geld in het betaalvak.';$('feedback').className='try';return;}
    const answer=buildsMoney()?placed.reduce((total,item)=>total+item.value,0):game.parseMoney($('answer').value);
    if(answer===null){$('feedback').textContent='Typ een bedrag zoals 3 of 3,50, zonder euroteken.';$('feedback').className='try';$('answer').focus();return;}
    attempts++;
    if(answer!==question.answer){$('feedback').textContent=buildsMoney()?'Nog niet. Kijk naar de prijs en pas je geld in het betaalvak aan.':level===5?'Nog niet. Tel eerst de prijzen op en trek het totaal af van het bedrag dat je betaalt.':'Nog niet. Kijk nog eens naar de prijzen en tel ze op.';$('feedback').className='try';if(!buildsMoney())$('answer').select();return;}
    locked=true;if(attempts===1)score++;$('score').textContent=score;
    $('answer').disabled=true;$('check').disabled=true;$('check').textContent='Volgende vraag…';
    stopDrag();if(buildsMoney())renderMoney();
    $('feedback').textContent='Juist! '+game.money(question.answer)+'.';$('feedback').className='good';
    if(questionId)window.lerenProgress.recordQuestion({exercise_key:'app-wiskunde-winkelspel',mode:'niveau-'+level,question_id:questionId,attempt_count:attempts,first_try_correct:attempts===1,assisted:false,duration_ms:Date.now()-startedAt});
    timer=setTimeout(()=>{number++;if(number===10)finishRound();else showQuestion();},1400);
  });
  $('settings-button').addEventListener('click',()=>{const hidden=!$('settings').hidden;$('settings').hidden=hidden;$('settings-button').setAttribute('aria-expanded',String(!hidden));});
  $('level').addEventListener('change',startRound);$('restart').addEventListener('click',startRound);$('continue').addEventListener('click',startRound);
  $('clear-money').addEventListener('click',()=>{if(locked)return;stopDrag();placed.forEach(item=>wallet.find(stock=>stock.value===item.value).count++);placed=[];renderMoney();});
  startRound();
})();
