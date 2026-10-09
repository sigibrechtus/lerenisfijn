const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('../apps/app-wiskunde-brug-tien/game.js');

test('covers every single-digit addition that crosses ten, including all worksheet examples', () => {
  const expected = [];
  for (let a = 1; a < 10; a++) for (let b = 1; b < 10; b++) if (a + b > 10) expected.push([a, b]);
  assert.deepEqual(game.pairs, expected);
  for (const pair of [[7,8],[5,6],[9,4],[6,9],[8,3],[4,7],[7,5],[5,8],[9,2],[6,7]]) {
    assert.ok(game.pairs.some(([a,b]) => a === pair[0] && b === pair[1]));
  }
});

test('each pair has the correct bridge decomposition and valid solution at all three levels', () => {
  for (const level of [1,2,3]) game.pairs.forEach(([a,b], index) => {
    const q = game.makeQuestion(level, () => (index + .5) / game.pairs.length);
    assert.equal(q.a, a); assert.equal(q.b, b);
    assert.equal(q.a + q.fill, 10);
    assert.equal(q.fill + q.rest, b);
    assert.equal(10 + q.rest, q.answer);
    assert.ok(q.answer > 10 && q.answer < 20);
    assert.equal(game.check(q, {colored:b, fill:String(q.fill), rest:String(q.rest), answer:String(a+b)}).correct, true);
  });
});

test('rejects correct totals with an incorrect split or incorrectly colored frame', () => {
  const q = {a:7,b:8,fill:3,rest:5,answer:15,level:1};
  assert.equal(game.check(q,{colored:7,fill:'3',rest:'5',answer:'15'}).correct,false);
  assert.equal(game.check(q,{colored:8,fill:'5',rest:'3',answer:'15'}).correct,false);
  assert.equal(game.check(q,{colored:8,fill:'3',rest:'6',answer:'15'}).correct,false);
  assert.equal(game.check(q,{colored:8,fill:'3',rest:'5',answer:'14'}).correct,false);
});

test('missing or malformed input is incomplete, not a scored wrong answer', () => {
  const q = {a:7,b:8,fill:3,rest:5,answer:15,level:2};
  for (const value of ['', ' ', '15x', '1.5', '-1', '1e1', '100']) {
    assert.equal(game.check(q,{fill:'3',rest:'5',answer:value}).incomplete,true);
  }
  assert.equal(game.check(q,{fill:'',rest:'5',answer:'15'}).incomplete,true);
  assert.equal(game.check(q,{fill:'3',rest:'',answer:'15'}).incomplete,true);
});

test('mental calculation does not require hidden coloring or split fields', () => {
  const q = {a:7,b:8,fill:3,rest:5,answer:15,level:3};
  assert.equal(game.check(q,{answer:'15'}).correct,true);
  assert.equal(game.check(q,{answer:'14'}).correct,false);
  assert.throws(() => game.makeQuestion(4), RangeError);
});
