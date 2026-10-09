(() => {
  'use strict';
  const $ = id => document.getElementById(id), game = window.BrugTienGame;
  let current, colored = 0, locked = false;
  function paint() {
    [...$('twenty-frame').children].forEach((cell, index) => {
      const first = index < current.a, added = !first && index < current.a + colored;
      cell.className = 'cell' + (first ? ' first' : added ? ' added' : '');
      cell.textContent = first ? '●' : added ? '+' : '';
      cell.disabled = first || locked;
      cell.setAttribute('aria-pressed', String(first || added));
      cell.setAttribute('aria-label', 'Hokje ' + (index + 1) + ': ' + (first ? 'blauw, eerste getal' : added ? 'oranje, klik om weg te halen' : 'leeg, klik om te kleuren'));
    });
    $('color-count').textContent = colored + ' van ' + current.b + ' oranje hokjes';
  }
  function updateSteps() {
    $('step-fill').textContent = /^\d{1,2}$/.test($('fill').value.trim()) ? $('fill').value.trim() : '?';
    $('step-rest').textContent = /^\d{1,2}$/.test($('rest').value.trim()) ? $('rest').value.trim() : '?';
  }
  $('fill').addEventListener('input', updateSteps);
  $('rest').addEventListener('input', updateSteps);
  $('clear-colors').addEventListener('click', () => { if (!locked) { colored = 0; paint(); } });
  window.lerenGame = {
    exerciseKey: 'app-wiskunde-brug-tien', levels: game.levels, maxLevel: 3, makeQuestion: game.makeQuestion,
    render(question) {
      current = question; colored = 0; locked = false;
      for (const id of ['fill', 'rest', 'answer']) { $(id).value = ''; $(id).disabled = false; }
      $('clear-colors').disabled = false;
      $('coloring').hidden = question.level !== 1;
      $('splitting').hidden = question.level === 3;
      $('instructions').textContent = question.level === 1 ? 'Kleur de hokjes erbij. Splits het tweede getal: maak eerst de bovenste rij vol tot 10, tel daarna verder.' : question.level === 2 ? 'Splits het tweede getal. Vul eerst aan tot 10 en tel daarna wat overblijft erbij.' : 'Reken uit je hoofd. Gebruik de brug naar 10.';
      $('sum').textContent = question.a + ' + ' + question.b + ' = ?';
      $('blue-label').textContent = question.a + ' staan al klaar';
      $('orange-label').textContent = question.b + ' erbij kleuren';
      $('split-number').textContent = question.b;
      $('step-a').textContent = question.a;
      updateSteps();
      $('twenty-frame').replaceChildren(...Array.from({length: 20}, (_, index) => {
        const cell = document.createElement('button'); cell.type = 'button';
        cell.addEventListener('click', () => {
          if (locked || index < current.a) return;
          // Keep the colored part continuous: fill through a tapped empty box,
          // or remove a tapped orange box and everything after it.
          colored = index < current.a + colored ? index - current.a : index - current.a + 1;
          paint();
        });
        return cell;
      }));
      paint();
      // The common round controller focuses Check after rendering. Put the
      // keyboard cursor in the first answer field instead, without scrolling.
      queueMicrotask(() => { if (question.level > 1) $(question.level === 3 ? 'answer' : 'fill').focus({preventScroll: true}); });
    },
    check(question) { return game.check(question, {colored, fill: $('fill').value, rest: $('rest').value, answer: $('answer').value}); },
    lock() {
      locked = true;
      for (const id of ['fill', 'rest', 'answer', 'clear-colors']) $(id).disabled = true;
      paint();
    }
  };
})();
