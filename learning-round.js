(() => {
  'use strict';
  const game=window.lerenGame,$=id=>document.getElementById(id);
  let level=1,index=0,score=0,attempts=0,question,questionId,startedAt,locked=false,timer=null,seen=new Set();
  function nextQuestion(){
    for(let tries=0;tries<50;tries++){question=game.makeQuestion(level);const key=question.sentence||JSON.stringify(question.sequence);if(!seen.has(key))break;}
    seen.add(question.sentence||JSON.stringify(question.sequence));attempts=0;locked=false;startedAt=Date.now();questionId=window.lerenProgress?.questionId();
    $('level-name').textContent='Niveau '+level+' · '+game.levels[level];$('progress').textContent='Vraag '+(index+1)+' van 10';$('round-progress').value=index;
    $('feedback').textContent='';$('feedback').className='';$('check').disabled=false;$('check').textContent='Controleer';game.render(question,false);$('check').focus({preventScroll:true});
  }
  function start(){clearTimeout(timer);level=Number($('level').value);index=0;score=0;seen=new Set();$('score').textContent='0';$('summary').hidden=true;$('quiz').hidden=false;nextQuestion();}
  function finish(){
    locked=true;const next=score>=8?Math.min(game.maxLevel,level+1):level;
    $('quiz').hidden=true;$('summary').hidden=false;
    $('summary-text').textContent=score+' van de 10 goed in één keer. '+(next>level?'Je gaat naar niveau '+next+'!':score>=8?'Je beheerst het hoogste niveau. Knap gedaan!':'We oefenen nog een reeks op dit niveau.');
    $('level').value=String(next);$('continue').textContent=next>level?'Naar niveau '+next:'Nog een reeks';$('continue').focus();window.lerenEffects?.complete($('summary'));
  }
  $('answer-form').addEventListener('submit',event=>{
    event.preventDefault();if(locked)return;
    const result=game.check(question);
    if(result.incomplete){$('feedback').textContent=result.message;$('feedback').className='try';return;}
    attempts++;
    if(!result.correct){$('feedback').textContent=result.message;$('feedback').className='try';window.lerenEffects?.incorrect($('game-area'));return;}
    locked=true;if(attempts===1)score++;$('score').textContent=String(score);$('check').disabled=true;$('check').textContent='Volgende vraag…';
    $('feedback').textContent=result.message;$('feedback').className='good';game.lock();window.lerenEffects?.correct($('game-area'));
    if(questionId)window.lerenProgress.recordQuestion({exercise_key:game.exerciseKey,mode:'niveau-'+level,question_id:questionId,attempt_count:attempts,first_try_correct:attempts===1,assisted:false,duration_ms:Date.now()-startedAt});
    timer=setTimeout(()=>{index++;if(index===10)finish();else nextQuestion();},1500);
  });
  $('settings-button').addEventListener('click',()=>{const hidden=!$('settings').hidden;$('settings').hidden=hidden;$('settings-button').setAttribute('aria-expanded',String(!hidden));});
  $('level').addEventListener('change',start);$('restart').addEventListener('click',start);$('continue').addEventListener('click',start);
  start();
})();
