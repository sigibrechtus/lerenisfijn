(function(root) {
  'use strict';
  const levels = ['', 'Kleur en splits', 'Splits zonder hokjes', 'Reken vlot'];
  const pairs = [];
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a + b > 10) pairs.push([a, b]);
    }
  }
  function makeQuestion(level, rng = Math.random) {
    if (![1, 2, 3].includes(level)) throw new RangeError('Onbekend niveau');
    const [a, b] = pairs[Math.floor(rng() * pairs.length)];
    return {a, b, fill: 10 - a, rest: a + b - 10, answer: a + b, level, sequence: [a, b]};
  }
  function readNumber(value) {
    const text = String(value).trim();
    return /^\d{1,2}$/.test(text) ? Number(text) : null;
  }
  function check(question, values) {
    const answer = readNumber(values.answer);
    const fill = readNumber(values.fill), rest = readNumber(values.rest);
    if (answer === null || (question.level < 3 && (fill === null || rest === null))) {
      return {incomplete: true, message: question.level < 3 ? 'Vul beide splitshokjes en de uitkomst in.' : 'Vul de uitkomst in.'};
    }
    if (question.level === 1 && values.colored !== question.b) {
      return {correct: false, message: 'Kleur precies ' + question.b + ' oranje hokjes erbij. De blauwe hokjes staan al klaar.'};
    }
    if (question.level < 3 && fill + rest !== question.b) {
      return {correct: false, message: 'De twee delen moeten samen ' + question.b + ' zijn. Kijk nog eens naar je splitsing.'};
    }
    if (question.level < 3 && fill !== question.fill) {
      return {correct: false, message: 'Maak eerst 10. Hoeveel moet er bij ' + question.a + ' om 10 te krijgen?'};
    }
    if (answer !== question.answer) {
      return {correct: false, message: question.level < 3 ? 'Je splitsing klopt! Tel het tweede deel bij 10.' : 'Nog niet. Denk aan de brug naar 10: vul eerst aan tot 10.'};
    }
    return {correct: true, message: 'Juist! ' + question.a + ' + ' + question.fill + ' = 10, en 10 + ' + question.rest + ' = ' + question.answer + '.'};
  }
  const api = {levels, pairs, makeQuestion, check};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BrugTienGame = api;
})(typeof window === 'undefined' ? globalThis : window);
