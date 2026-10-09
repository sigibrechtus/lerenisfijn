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

test('Plantyn catalogue contains every published theme, grouped by grade, without claiming official word lists', () => {
  const library = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps/app-taal-spelling/word-library.json')));
  assert.equal(library.plantynThemes.length, 48);
  for (let grade = 1; grade <= 6; grade++) {
    assert.equal(library.plantynThemes.filter(item => item.grade === grade).length, 8);
  }
  assert.equal(new Set(library.plantynThemes.map(item => `${item.grade}:${item.theme}`)).size, 48);
  assert.deepEqual(library.plantynPreviews.map(item => `${item.grade}:${item.kind}`).sort(), [
    '2:handleiding', '2:leerwerkboek', '3:handleiding', '3:leerwerkboek'
  ]);
  for (const preview of library.plantynPreviews) assert.equal(new URL(preview.url).hostname, 'view.publitas.com');
  assert.match(library.plantynThemeSource, /plantyn\.com/);
});

test('Plantyn themes contain original valid practice lists, with lesson-specific sets checked against preview context', () => {
  const library = JSON.parse(fs.readFileSync(path.join(__dirname, '../apps/app-taal-spelling/word-library.json')));
  assert.equal(library.plantynPracticeSets.length, 68);
  assert.equal(new Set(library.plantynPracticeSets.map(set => set.id)).size, 68);
  for (let grade = 1; grade <= 6; grade++) {
    const sets = library.plantynPracticeSets.filter(set => set.grade === grade);
    assert.equal(sets.length, grade === 2 || grade === 3 ? 18 : 8);
    assert.deepEqual(new Set(sets.map(set => set.theme)), new Set(library.plantynThemes.filter(theme => theme.grade === grade).map(theme => theme.theme)));
    for (const set of sets) {
      assert.equal(set.words.length, 8);
      assert.equal(parseText(set.words.join('\n')).words.length, set.words.length);
      assert.ok(set.provenance.toLocaleLowerCase('nl').includes('eigen'));
    }
  }
  const expected = [
    [2, 'Op stap in onze gemeente', 'Op stap in onze gemeente', 'de gemeente', 6],
    [2, 'Het bos, mijn vriend', 'Beest en bos', 'dieren en het bos', 6],
    [3, 'Op reis door België', 'Op reis door België', 'reizen door België', 6],
    [3, 'Eet je goed? Beweeg je goed?', 'Eet je goed? Beweeg je goed?', 'gezond eten en bewegen', 6],
  ];
  for (const [grade, theme, previewTheme, context, count] of expected) {
    const sets = library.plantynPracticeSets.filter(item => item.grade === grade && item.theme === theme && item.previewLesson);
    assert.equal(sets.length, count);
    assert.ok(sets.every(set => set.previewTheme === previewTheme && set.context === context));
    assert.ok(sets.every(set => set.source === `https://view.publitas.com/plantyn-lo/taalkanjers-spelling-${grade}-lwb/page/2-3`));
    assert.ok(sets.every(set => set.provenance.includes('inhoudsopgave') && set.provenance.includes('nieuw')));
    assert.deepEqual(sets.map(set => set.previewLesson).sort(), Array.from({ length: count }, (_, i) => i + 1));
  }
  const setBy = (grade, theme, focus) => library.plantynPracticeSets.find(set => set.grade === grade && set.theme === theme && set.focus === focus);
  const stripArticle = value => value.replace(/^(de|het)\s+/i, '');
  const allMatch = (set, pattern) => set.words.every(word => pattern.test(stripArticle(word)));
  assert.ok(allMatch(setBy(2, 'Het bos, mijn vriend', 'aai, oei en ooi'), /aai|oei|ooi/i));
  assert.ok(allMatch(setBy(2, 'Het bos, mijn vriend', 'eeuw en ieuw'), /eeuw|ieuw/i));
  assert.ok(allMatch(setBy(2, 'Het bos, mijn vriend', 'Woorden met -ng'), /ng$/i));
  assert.ok(allMatch(setBy(2, 'Het bos, mijn vriend', 'Woorden met -nk'), /nk$/i));
  assert.ok(allMatch(setBy(3, 'Op reis door België', 'ei en ij'), /ei|ij/i));
  assert.ok(allMatch(setBy(3, 'Op reis door België', 'au en ou'), /au|ou/i));
  assert.ok(allMatch(setBy(3, 'Op reis door België', 'Woorden met -ng'), /ng$/i));
  assert.ok(allMatch(setBy(3, 'Op reis door België', 'Woorden met -nk'), /nk/i));
  assert.ok(allMatch(setBy(3, 'Eet je goed? Beweeg je goed?', 'aai, ooi, oei, eeuw, ieuw en uw'), /aai|ooi|oei|eeuw|ieuw|uw/i));
  assert.ok(allMatch(setBy(3, 'Eet je goed? Beweeg je goed?', 'Voorvoegsels be-, ge- en ver-'), /^(be|ge|ver)/i));
  assert.equal(setBy(2, 'Het bos, mijn vriend', 'Alfabet · boswoorden').previewLesson, 6);
  assert.equal(setBy(3, 'Eet je goed? Beweeg je goed?', 'Alfabetisch rangschikken · voeding en beweging').previewLesson, 6);
  for (const [grade, theme] of [[2, 'Op stap in onze gemeente'], [2, 'Het bos, mijn vriend'], [3, 'Op reis door België'], [3, 'Eet je goed? Beweeg je goed?']]) {
    const lessons = library.plantynPracticeSets.filter(set => set.grade === grade && set.theme === theme && set.previewLesson).map(set => set.previewLesson).sort((a, b) => a - b);
    assert.deepEqual(lessons, [1, 2, 3, 4, 5, 6]);
  }
  for (const set of library.plantynPracticeSets.filter(item => !item.previewLesson)) {
    assert.ok(set.provenance.includes('inschatting'));
  }
});
