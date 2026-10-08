const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseText, exportText, MAX_WORDS } = require('../apps/app-taal-spelling/word-lists.js');

test('imports articles, adverbs and phrases with metadata and removes duplicates', () => {
  const parsed = parseText('\uFEFF# titel: Bos\r\n# leerjaar: 2\r\n# thema: Natuur\r\nde tak\r\nhet bos\r\nmorgen\r\naf en toe\r\nMORGEN\r\n');
  assert.deepEqual(parsed.words, [
    { article: 'de', word: 'tak', full: 'de tak' },
    { article: 'het', word: 'bos', full: 'het bos' },
    { article: '', word: 'morgen', full: 'morgen' },
    { article: '', word: 'af en toe', full: 'af en toe' },
  ]);
  assert.deepEqual(parsed.metadata, { titel: 'Bos', leerjaar: '2', thema: 'Natuur' });
});

test('preserves accents, metadata and word order on TXT round-trip', () => {
  const parsed = parseText('# titel: Zomer\n# leerjaar: 3\n# thema: Tijd\n# woordsoort: bijwoorden\n# methode: eigen\nstraks\naf en toe\nhet cafe\u0301\n');
  assert.equal(parsed.words[2].full, 'het café');
  assert.deepEqual(parseText(exportText(parsed.words, parsed.metadata)), parsed);
});

test('rejects empty, markup, overlong and oversized word lists', () => {
  for (const text of ['', '# titel: Leeg', '<script>alert(1)</script>', 'a'.repeat(101), 'a\u0000b']) {
    assert.throws(() => parseText(text));
  }
  assert.throws(() => parseText(Array.from({ length: MAX_WORDS + 1 }, (_, i) => 'woord' + i).join('\n')));
  assert.equal(parseText(Array.from({ length: MAX_WORDS }, (_, i) => 'woord' + i).join('\n')).words.length, MAX_WORDS);
});

test('all six years have valid original sets and method links match their year', () => {
  const library = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps/app-taal-spelling/word-library.json')));
  assert.equal(new Set(library.sets.map(set => set.id)).size, library.sets.length);
  for (let grade = 1; grade <= 6; grade++) {
    const sets = library.sets.filter(set => set.grade === grade);
    assert.equal(sets.length, 3);
    assert.ok(sets.some(set => set.kind === 'bijwoorden'));
    for (const set of sets) {
      assert.equal(parseText(set.words.join('\n')).words.length, set.words.length);
      assert.ok(set.provenance.includes('geen officiële'));
    }
  }
  for (const resource of library.resources) {
    assert.ok(Number.isInteger(resource.grade) && resource.grade >= 1 && resource.grade <= 6);
    assert.ok(resource.title.includes(String(resource.grade)));
    assert.equal(new URL(resource.url).hostname, 'www.klascement.net');
  }
});
