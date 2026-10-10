const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup({ enabled = true, withContext = true, play } = {}) {
  const prefs = { music: enabled, musicVolume: 35, sound: false };
  const listeners = {}, nodes = [], tracks = [];
  const document = { hidden: false, addEventListener: (name, fn) => { listeners[name] = fn; } };
  class Audio {
    constructor(url) { this.url = url; this.paused = true; this.plays = 0; this.listeners = {}; tracks.push(this); }
    setAttribute() {}
    addEventListener(name, fn) { this.listeners[name] = fn; }
    play() { this.plays++; this.paused = false; return play ? play(this) : Promise.resolve(); }
    pause() { this.paused = true; }
  }
  class Context {
    constructor() { this.state = 'suspended'; this.currentTime = 0; this.destination = {}; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    addEventListener() {}
    createGain() { const node = { connect() {}, gain: { value: 0, cancelScheduledValues() {}, setTargetAtTime(value) { this.value = value; } } }; nodes.push(node); return node; }
    createMediaElementSource() { return { connect() {} }; }
  }
  const window = { addEventListener: (name, fn) => { listeners[name] = fn; } };
  if (withContext) window.AudioContext = Context;
  vm.runInNewContext(fs.readFileSync('games/frit-academy/music.js', 'utf8'), { window, document, Audio });
  const player = window.FritMusic.create({ getPrefs: () => prefs });
  return { prefs, player, tracks, nodes, document, listeners };
}
test('no autoplay, then one looping track after a gesture even with sound effects off', async () => {
  const s = setup(); s.player.update(); assert.equal(s.tracks.length, 0);
  s.player.gesture(); await flush();
  assert.equal(s.player.getState(), 'playing'); assert.equal(s.tracks[0].loop, true);
  s.player.gesture(); await flush(); assert.equal(s.tracks[0].plays, 1);
});
test('pointer press on the header toggle leaves the explicit click action in charge', () => {
  const s = setup(); s.listeners.pointerdown({ target: { closest: () => ({}) } });
  assert.equal(s.tracks.length, 0); assert.equal(s.player.getState(), 'ready');
});
test('saved music preference prevents playback; music and effects are independent', async () => {
  const s = setup({ enabled: false }); s.player.gesture(); assert.equal(s.tracks.length, 0);
  s.prefs.music = true; s.player.gesture(); await flush(); assert.equal(s.player.getState(), 'playing');
  s.prefs.music = false; s.player.update(); assert(s.tracks[0].paused); assert.equal(s.nodes[0].gain.value, 0);
});
test('muting while play is pending cannot restart music when the promise settles', async () => {
  let resolve; const s = setup({ play: () => new Promise(r => { resolve = r; }) });
  s.player.gesture(); s.prefs.music = false; s.player.update(); resolve(); await flush();
  assert(s.tracks[0].paused); assert.equal(s.player.getState(), 'off');
});
test('hidden tabs pause; visibility and back-forward restoration resume the same track', async () => {
  const s = setup(); s.player.gesture(); await flush();
  s.document.hidden = true; s.listeners.visibilitychange(); assert(s.tracks[0].paused);
  s.document.hidden = false; s.listeners.visibilitychange(); await flush(); assert(!s.tracks[0].paused);
  s.listeners.pagehide(); assert(s.tracks[0].paused);
  s.listeners.pageshow(); await flush(); assert.equal(s.tracks.length, 1); assert.equal(s.player.getState(), 'playing');
});
test('exercise and speech ducking restore the saved level through Web Audio gain', async () => {
  const s = setup(); s.player.gesture(); await flush(); const gain = s.nodes[0].gain;
  assert.equal(gain.value, .35); s.player.setExercise(true); assert.equal(gain.value, .35 * .7);
  s.player.setDucked(true); assert.equal(gain.value, .35 * .15);
  s.player.setDucked(false); assert.equal(gain.value, .35 * .7);
  s.player.setExercise(false); assert.equal(gain.value, .35);
});
test('zero volume pauses; raising volume resumes without constructing another track', async () => {
  const s = setup(); s.player.gesture(); await flush(); s.prefs.musicVolume = 0; s.player.update();
  assert(s.tracks[0].paused); assert.equal(s.player.getState(), 'silent');
  s.prefs.musicVolume = 80; s.player.update(); await flush(); assert.equal(s.tracks.length, 1); assert.equal(s.nodes[0].gain.value, .8);
});
test('browser rejection exposes retry; successful next gesture recovers', async () => {
  let fail = true; const s = setup({ play: track => { if (fail) { track.paused = true; return Promise.reject({ name: 'NotAllowedError' }); } return Promise.resolve(); } });
  s.player.gesture(); await flush(); assert.equal(s.player.getState(), 'blocked');
  fail = false; s.player.gesture(); await flush(); assert.equal(s.player.getState(), 'playing');
});
test('missing media exposes an error without breaking game code', async () => {
  const s = setup({ play: track => { track.paused = true; return Promise.reject({ name: 'NotSupportedError' }); } });
  s.player.gesture(); await flush(); assert.equal(s.player.getState(), 'error');
});
test('HTML media fallback applies volume and ducking without Web Audio', async () => {
  const s = setup({ withContext: false }); s.player.gesture(); await flush(); assert.equal(s.tracks[0].volume, .35);
  s.player.setDucked(true); assert.equal(s.tracks[0].volume, .35 * .15);
});
test('packaged audio matches its provenance digest and offline cache entry', () => {
  const manifest = JSON.parse(fs.readFileSync('games/frit-academy/audio/manifest.json'));
  const bytes = fs.readFileSync('games/frit-academy/audio/' + manifest.file);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), manifest.sha256);
  assert(manifest.durationSeconds > 60); assert.equal(manifest.vocals, false);
  assert(fs.readFileSync('games/frit-academy/sw.js', 'utf8').includes('./audio/' + manifest.file));
});
test('offline media ranges return valid 206 slices, suffixes and 416 responses', async () => {
  const sandbox = { self: { addEventListener() {} }, Response };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('games/frit-academy/sw.js', 'utf8'), sandbox);
  const cache = { match: async () => new Response(new Uint8Array([0, 1, 2, 3, 4, 5]), { headers: { 'Content-Type': 'audio/mpeg' } }) };
  const request = range => ({ url: 'https://example.test/audio/frituur-swing.mp3', headers: { get: () => range } });
  for (const [range, values] of [['bytes=1-3', [1, 2, 3]], ['bytes=4-', [4, 5]], ['bytes=-2', [4, 5]]]) {
    const response = await sandbox.cachedAudioRange(request(range), cache);
    assert.equal(response.status, 206); assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], values);
  }
  assert.equal((await sandbox.cachedAudioRange(request('bytes=9-'), cache)).status, 416);
});
