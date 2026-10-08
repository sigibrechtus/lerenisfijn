(() => {
  'use strict';
  const game=window.WinkelGame,$=id=>document.getElementById(id);
  let level=1,number=0,score=0,attempts=0,locked=false,timer=null,question,questionId,startedAt;
  function showQuestion(){
    question=game.makeQuestion(level);attempts=0;locked=false;startedAt=Date.now();
    questionId=window.lerenProgress?.questionId();
    $('level-name').textContent='Niveau '+level+' · '+game.levels[level];
    $('progress').textContent='Vraag '+(number+1)+' van 10';$('round-progress').value=number;
    $('question').textContent=level===5?'Hoeveel wisselgeld krijg je terug?':'Hoeveel kost je winkelmand?';
    $('basket').replaceChildren(...question.items.map(item=>{
      const card=document.createElement('article');card.className='item';
      const emoji=document.createElement('span');emoji.className='emoji';emoji.textContent=item.emoji;emoji.setAttribute('aria-hidden','true');
      const name=document.createElement('strong');name.textContent=item.name;
      const price=document.createElement('span');price.textContent=game.money(item.cents);card.append(emoji,name,price);return card;
    }));
    $('payment').textContent=question.paid===null?'':'Je betaalt met '+game.money(question.paid)+'.';
    $('answer').value='';$('answer').disabled=false;$('check').disabled=false;$('check').textContent='Controleer';
    $('feedback').textContent='';$('feedback').className='';$('answer').focus();
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
    const answer=game.parseMoney($('answer').value);
    if(answer===null){$('feedback').textContent='Typ een bedrag zoals 3 of 3,50, zonder euroteken.';$('feedback').className='try';$('answer').focus();return;}
    attempts++;
    if(answer!==question.answer){$('feedback').textContent=level===5?'Nog niet. Tel eerst de prijzen op en trek het totaal af van het bedrag dat je betaalt.':'Nog niet. Kijk nog eens naar de prijzen en tel ze op.';$('feedback').className='try';$('answer').select();return;}
    locked=true;if(attempts===1)score++;$('score').textContent=score;
    $('answer').disabled=true;$('check').disabled=true;$('check').textContent='Volgende vraag…';
    $('feedback').textContent='Juist! '+game.money(question.answer)+'.';$('feedback').className='good';
    if(questionId)window.lerenProgress.recordQuestion({exercise_key:'app-wiskunde-winkelspel',mode:'niveau-'+level,question_id:questionId,attempt_count:attempts,first_try_correct:attempts===1,assisted:false,duration_ms:Date.now()-startedAt});
    timer=setTimeout(()=>{number++;if(number===10)finishRound();else showQuestion();},1400);
  });
  $('settings-button').addEventListener('click',()=>{const hidden=!$('settings').hidden;$('settings').hidden=hidden;$('settings-button').setAttribute('aria-expanded',String(!hidden));});
  $('level').addEventListener('change',startRound);$('restart').addEventListener('click',startRound);$('continue').addEventListener('click',startRound);
  startRound();
})();
