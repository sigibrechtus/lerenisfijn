'use strict';

/* ================= Configuratie ================= */
const STORAGE_KEY = 'themadictee.settings.v1';
const HW_URL = 'https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8';
const HW_TIMEOUT_MS = 8000;

const DEFAULTS = {
  rate: 0.9,
  separate: true,
  twice: false,
  lookTime: 3,
  strict: 2,
  title: 'Themadictee',
  words: ['de tak', 'het net', 'de bal', 'het dak', 'de vis', 'het bos', 'de maan', 'niet'].join('\n'),
};

const LIMITS = {
  rate:     { min: 0.5, max: 1.5, step: 0.1, fmt: (v) => v.toFixed(1) },
  lookTime: { min: 1,   max: 10,  step: 1,   fmt: (v) => `${v} s` },
  strict:   { min: 1,   max: 3,   step: 1,   fmt: (v) => ['', 'Mild', 'Normaal', 'Streng'][v] },
};

const $ = (id) => document.getElementById(id);
let settings = loadSettings();

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/* ================= Schermen ================= */
function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => {
    s.hidden = s.id !== `screen-${name}`;
  });
  if (name === 'practice') requestAnimationFrame(resizePad);
  window.scrollTo(0, 0);
}

/* ================= Woordenlijst ================= */
function parseWords(text) {
  return text
    .split('\n')
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(de|het)\s+(.+)$/i);
      return m
        ? { article: m[1].toLowerCase(), word: m[2], full: `${m[1].toLowerCase()} ${m[2]}` }
        : { article: '', word: line, full: line };
    });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ================= Spraak ================= */
const hasSpeech = 'speechSynthesis' in window;
let voice = null;
let speakToken = 0;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  const lang = (v) => v.lang.replace('_', '-').toLowerCase();
  voice =
    voices.find((v) => lang(v) === 'nl-be') ||
    voices.find((v) => lang(v).startsWith('nl')) ||
    null;
}

if (hasSpeech) {
  // Try to pick a voice immediately.
  pickVoice();
  // If voices load later, the 'onvoiceschanged' event will fire and we can re-pick.
  speechSynthesis.onvoiceschanged = pickVoice;
}

function say(text) {
  return new Promise((resolve) => {
    if (!hasSpeech) return resolve();

    // If a specific voice hasn't been picked, try again now that we're in an event handler.
    // This is a robust way to handle browsers that populate the voice list late.
    if (!voice && speechSynthesis.getVoices().length) {
      pickVoice();
    }

    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      // If no specific Dutch voice was found, fall back to the language code.
      u.lang = 'nl-NL';
    }
    u.rate = settings.rate;
    // Resolve the promise when speech ends or if an error occurs.
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function stopSpeech() {
  speakToken++;
  if (hasSpeech) speechSynthesis.cancel();
}

async function speakItem(item, withArticle) {
  if (!hasSpeech) return;
  stopSpeech();
  const token = speakToken;
  const alive = () => token === speakToken;

  const sayOnce = async () => {
    if (withArticle && item.article) {
      if (settings.separate) {
        await say(item.article);
        if (!alive()) return;
        await wait(600);
        if (!alive()) return;
        await say(item.word);
      } else {
        await say(item.full);
      }
    } else {
      await say(item.word);
    }
  };

  await sayOnce();
  if (settings.twice && alive()) {
    await wait(900);
    if (alive()) await sayOnce();
  }
}

/* ================= Tekenvlak ================= */
const pad = $('pad');
const padWrap = $('pad-wrap');
const ctx = pad.getContext('2d');

let strokes = [];
let activeStroke = null;
let inkStart = 0;
let penSeen = false;
let padEnabled = true;

const padSize = () => ({ w: pad.clientWidth, h: pad.clientHeight });

function resizePad() {
  const dpr = window.devicePixelRatio || 1;
  const { w, h } = padSize();
  pad.width = Math.round(w * dpr);
  pad.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

window.addEventListener('resize', () => {
  if (!$('screen-practice').hidden) resizePad();
});

function setInkStyle() {
  ctx.strokeStyle = '#1d2b53';
  ctx.fillStyle = '#1d2b53';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function drawGuide(w, h) {
  const topY = h * 0.18;
  const middleY = h * 0.40;
  const baseY = h * 0.64;
  const bottomY = h * 0.86;

  ctx.fillStyle = '#eaf4ff';
  ctx.fillRect(0, middleY, w, baseY - middleY);

  const line = (y, color, thickness) => {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  };

  line(topY, '#d2dde8', 1);
  line(middleY, '#a9c1d9', 1);
  line(baseY, '#5d7a99', 2);
  line(bottomY, '#d2dde8', 1);
}

function drawDot(s) {
  ctx.beginPath();
  ctx.arc(s.x[0], s.y[0], s.w[0] / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawSegment(s, i) {
  ctx.lineWidth = s.w[i];
  ctx.beginPath();
  ctx.moveTo(s.x[i - 1], s.y[i - 1]);
  ctx.lineTo(s.x[i], s.y[i]);
  ctx.stroke();
}

function redraw() {
  const { w, h } = padSize();
  ctx.clearRect(0, 0, w, h);
  drawGuide(w, h);
  setInkStyle();
  strokes.forEach((s) => {
    drawDot(s);
    for (let i = 1; i < s.x.length; i++) drawSegment(s, i);
  });
}

function pointFrom(e) {
  const r = pad.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    t: Math.round(performance.now() - inkStart),
    w: e.pointerType === 'pen' && e.pressure > 0 ? 1.5 + e.pressure * 4.5 : 4,
  };
}

function addPoint(s, p) {
  s.x.push(p.x);
  s.y.push(p.y);
  s.t.push(p.t);
  s.w.push(p.w);
}

pad.addEventListener('pointerdown', (e) => {
  if (!padEnabled) return;
  if (e.pointerType === 'pen') penSeen = true;
  if (penSeen && e.pointerType === 'touch') return;
  e.preventDefault();
  pad.setPointerCapture(e.pointerId);
  if (!strokes.length) inkStart = performance.now();
  activeStroke = { id: e.pointerId, x: [], y: [], t: [], w: [] };
  addPoint(activeStroke, pointFrom(e));
  strokes.push(activeStroke);
  setInkStyle();
  drawDot(activeStroke);
});

pad.addEventListener('pointermove', (e) => {
  if (!activeStroke || e.pointerId !== activeStroke.id) return;
  e.preventDefault();
  const coalesced = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
  const events = coalesced.length ? coalesced : [e];
  setInkStyle();
  for (const ev of events) {
    addPoint(activeStroke, pointFrom(ev));
    drawSegment(activeStroke, activeStroke.x.length - 1);
  }
});

const endStroke = (e) => {
  if (activeStroke && e.pointerId === activeStroke.id) activeStroke = null;
};
pad.addEventListener('pointerup', endStroke);
pad.addEventListener('pointercancel', endStroke);

function setWriting(enabled) {
  padEnabled = enabled;
  padWrap.classList.toggle('locked', !enabled);
}

function shakePad() {
  padWrap.classList.add('shake');
  setTimeout(() => padWrap.classList.remove('shake'), 400);
}

/* ================= Herkenning & beoordeling ================= */
async function recognize() {
  const { w, h } = padSize();
  const body = {
    options: 'enable_pre_space',
    requests: [{
      writing_guide: { writing_area_width: Math.round(w), writing_area_height: Math.round(h) },
      ink: strokes.map((s) => [s.x.map(Math.round), s.y.map(Math.round), s.t]),
      language: 'nl',
    }],
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HW_TIMEOUT_MS);
  try {
    const res = await fetch(HW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json();
    if (data[0] !== 'SUCCESS') throw new Error('Herkenning mislukt');
    return (data[1] && data[1][0] && data[1][0][1]) || [];
  } finally {
    clearTimeout(timer);
  }
}

function normalize(s) {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[.,!?;:"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function evaluate(candidates, target) {
  const t = normalize(target);
  const c = candidates.map(normalize).filter(Boolean);
  if (!c.length) return { ok: false, read: '' };

  if (settings.strict === 3) return { ok: c[0] === t, read: c[0] };

  const top = c.slice(0, 5);
  const exact = top.find((x) => x === t);
  if (exact) return { ok: true, read: exact };

  if (settings.strict === 1) {
    const near = top.find((x) => levenshtein(x, t) <= 1);
    if (near) return { ok: true, read: near };
  }
  return { ok: false, read: c[0] };
}

/* ================= Oefensessie ================= */
const session = {
  mode: 1,
  queue: [],
  index: 0,
  stars: 0,
  attempts: 0,
  lastRead: '',
  difficult: new Map(),
  lookTimer: null,
};

const currentItem = () => session.queue[session.index];

function startSession(mode, items) {
  if (!items.length) {
    alert('De woordenlijst is leeg. Voeg woorden toe via Instellingen.');
    return;
  }
  Object.assign(session, {
    mode,
    queue: shuffle([...items]),
    index: 0,
    stars: 0,
    difficult: new Map(),
  });
  showScreen('practice');
  showWord();
}

function updateStars() {
  $('stars').textContent = `★ ${session.stars}`;
}

function setPromptText(text) {
  const d = $('word-display');
  d.textContent = text;
  d.classList.add('muted');
}

function resetWriting() {
  strokes = [];
  activeStroke = null;
  redraw();
  $('result').hidden = true;
  $('write-actions').hidden = false;
  setWriting(true);
}

function showWord() {
  clearTimeout(session.lookTimer);
  const item = currentItem();
  session.attempts = 0;

  $('progress').textContent = `Woord ${session.index + 1} van ${session.queue.length}`;
  updateStars();
  resetWriting();

  const disp = $('word-display');
  disp.classList.remove('muted');
  $('btn-listen').hidden = session.mode === 2;

  switch (session.mode) {
    case 1:
      disp.textContent = item.full;
      speakItem(item, true);
      break;
    case 2:
      disp.textContent = item.full;
      setWriting(false);
      session.lookTimer = setTimeout(() => {
        setPromptText('Schrijf het nu uit je hoofd.');
        setWriting(true);
      }, settings.lookTime * 1000);
      break;
    case 3:
      setPromptText('Luister goed en schrijf.');
      speakItem(item, true);
      break;
    case 4:
      setPromptText(item.article ? 'Luister goed. Denk aan “de” of “het”.' : 'Luister goed en schrijf.');
      speakItem(item, false);
      break;
  }
}

function registerOutcome(ok) {
  const item = currentItem();
  if (ok) {
    if (session.attempts === 1) session.stars++;
  } else {
    session.difficult.set(item.full, item);
  }
  updateStars();
}

function showAutoResult(ok, read, item) {
  const box = $('result');
  $('write-actions').hidden = true;
  $('result-auto').hidden = false;
  $('result-manual').hidden = true;
  box.hidden = false;
  box.classList.toggle('ok', ok);
  box.classList.toggle('bad', !ok);

  $('read-text').textContent = read || '(niets herkend)';
  $('target-text').textContent = item.full;
  $('btn-override').hidden = ok;
  $('btn-next').classList.toggle('btn-primary', ok);
  $('btn-retry').classList.toggle('btn-primary', !ok);
}

function showManualResult(item) {
  const box = $('result');
  $('write-actions').hidden = true;
  $('result-auto').hidden = true;
  $('result-manual').hidden = false;
  box.classList.remove('ok', 'bad');
  box.hidden = false;
  $('manual-target').textContent = item.full;
}

async function check() {
  if (!strokes.length) {
    shakePad();
    return;
  }
  clearTimeout(session.lookTimer);
  const item = currentItem();
  session.attempts++;
  setWriting(false);

  const btn = $('btn-check');
  btn.disabled = true;
  btn.textContent = 'Even lezen…';

  try {
    const candidates = await recognize();
    const res = evaluate(candidates, item.full);
    session.lastRead = res.read;
    registerOutcome(res.ok);
    showAutoResult(res.ok, res.read, item);
  } catch (err) {
    console.warn('Handschriftherkenning niet beschikbaar:', err);
    showManualResult(item);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Klaar';
  }
}

function overrideAsCorrect() {
  const item = currentItem();
  if (session.attempts === 1) session.difficult.delete(item.full);
  registerOutcome(true);
  showAutoResult(true, session.lastRead, item);
  resetWriting();
}

function next() {
  stopSpeech();
  session.index++;
  if (session.index >= session.queue.length) finish();
  else {
    resetWriting();
    showWord();
  }
}

function finish() {
  const n = session.queue.length;
  $('end-summary').textContent = `Je schreef ${session.stars} van de ${n} woorden in één keer goed.`;

  const list = $('end-difficult');
  list.innerHTML = '';
  session.difficult.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item.full;
    list.appendChild(li);
  });

  const hasDifficult = session.difficult.size > 0;
  $('end-difficult-wrap').hidden = !hasDifficult;
  $('btn-practice-difficult').hidden = !hasDifficult;
  showScreen('end');
}

function stopSession() {
  clearTimeout(session.lookTimer);
  stopSpeech();
  showScreen('start');
}

/* ================= Instellingen ================= */
function renderSettings() {
  document.querySelectorAll('.stepper').forEach((st) => {
    const key = st.dataset.key;
    st.querySelector('output').textContent = LIMITS[key].fmt(settings[key]);
  });
  $('set-separate').checked = settings.separate;
  $('set-twice').checked = settings.twice;
  $('set-title').value = settings.title;
  $('set-words').value = settings.words;
}

function openSettings() {
  renderSettings();
  showScreen('settings');
}

function closeSettings() {
  settings.title = $('set-title').value.trim() || DEFAULTS.title;
  settings.words = $('set-words').value.trim();
  saveSettings();
  applyTitle();
  showScreen('start');
}

function applyTitle() {
  $('app-title').textContent = settings.title;
  document.title = settings.title;
}

document.querySelectorAll('.stepper').forEach((st) => {
  st.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const key = st.dataset.key;
    const L = LIMITS[key];
    let v = settings[key] + Number(btn.dataset.step) * L.step;
    v = Math.min(L.max, Math.max(L.min, Math.round(v * 10) / 10));
    settings[key] = v;
    saveSettings();
    renderSettings();
  });
});

$('set-separate').addEventListener('change', (e) => { settings.separate = e.target.checked; saveSettings(); });
$('set-twice').addEventListener('change', (e) => { settings.twice = e.target.checked; saveSettings(); });

$('btn-test-voice').addEventListener('click', () => {
  const sample = parseWords($('set-words').value)[0] || { article: 'de', word: 'tak', full: 'de tak' };
  speakItem(sample, true);
});

$('btn-settings-reset').addEventListener('click', () => {
  settings = { ...DEFAULTS };
  saveSettings();
  renderSettings();
});

/* ================= Koppelingen ================= */
document.querySelectorAll('.mode-card').forEach((b) => {
  b.addEventListener('click', () => startSession(Number(b.dataset.mode), parseWords(settings.words)));
});

$('btn-open-settings').addEventListener('click', openSettings);
$('btn-settings-done').addEventListener('click', closeSettings);

$('btn-stop').addEventListener('click', stopSession);
$('btn-listen').addEventListener('click', () => speakItem(currentItem(), session.mode !== 4));
$('btn-undo').addEventListener('click', () => { strokes.pop(); redraw(); });
$('btn-clear').addEventListener('click', () => { strokes = []; redraw(); });
$('btn-check').addEventListener('click', check);

$('btn-retry').addEventListener('click', resetWriting);
$('btn-next').addEventListener('click', next);
$('btn-override').addEventListener('click', overrideAsCorrect);
$('btn-self-ok').addEventListener('click', () => { registerOutcome(true); next(); });
$('btn-self-bad').addEventListener('click', () => { registerOutcome(false); next(); });

$('btn-practice-difficult').addEventListener('click', () => startSession(session.mode, [...session.difficult.values()]));
$('btn-restart').addEventListener('click', () => startSession(session.mode, parseWords(settings.words)));
$('btn-home').addEventListener('click', () => showScreen('start'));

/* ================= Start ================= */
applyTitle();
