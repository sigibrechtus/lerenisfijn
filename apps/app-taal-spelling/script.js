<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>OLV SGR L2 - Taal - Spelling - Themadictee 1 – Leren is fijn</title>
  <link rel="stylesheet" href="styles.css?v=2">
  <link rel="stylesheet" href="../../app-theme.css?v=14">
<script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.2/dist/umd/supabase.js"></script>
<script defer src="../../supabase-client.js"></script>
<script defer src="../../app-effects.js?v=3"></script>
<script defer src="word-lists.js?v=1"></script>
<script defer src="script.js?v=24"></script>
</head>
<body>

  <!-- ============ START ============ -->
  <section id="screen-start" class="screen">
    <header class="topbar app-header-layout">
      <a class="app-home-link" href="../../index.html">← Overzicht</a>
      <div class="app-header-title"><h1 id="app-title">OLV SGR L2 - Taal - Spelling - Themadictee 1 – Leren is fijn</h1></div>
      <button id="btn-open-settings" class="app-settings-button" type="button">Instellingen</button>
    </header>

    <p class="subtitle">Kies een oefening.</p>
    <div class="word-library-summary"><p id="active-word-list" aria-live="polite"></p><button id="btn-choose-words" class="btn" type="button">Woorden kiezen of TXT laden</button></div>

    <div class="mode-grid">
      <button class="mode-card" data-mode="1" type="button">
        <span class="mode-num">1</span>
        <strong>Overschrijven</strong>
        <span>Je ziet en hoort het woord. Schrijf het over.</span>
      </button>
      <button class="mode-card" data-mode="2" type="button">
        <span class="mode-num">2</span>
        <strong>Kijken en schrijven</strong>
        <span>Je ziet het woord even. Daarna schrijf je het uit je hoofd.</span>
      </button>
      <button class="mode-card" data-mode="3" type="button">
        <span class="mode-num">3</span>
        <strong>Dictee</strong>
        <span>Je hoort het woord, met het lidwoord als dat erbij hoort. Schrijf alles op.</span>
      </button>
      <button class="mode-card" data-mode="4" type="button">
        <span class="mode-num">4</span>
        <strong>Dictee met lidwoord</strong>
        <span>Je hoort alleen het woord. Denk zelf aan “de” of “het” en schrijf alles op.</span>
      </button>
    </div>

    <p class="hint">
      Schrijf met de Apple Pencil en laat een duidelijke spatie tussen het lidwoord en het woord.
      Tik daarna op <strong>Klaar</strong>: de app leest je schrift en verbetert het automatisch.
      Hiervoor is internet nodig.
    </p>
  </section>

  <!-- ============ INSTELLINGEN ============ -->
  <section id="screen-settings" class="screen" hidden>
    <h2>Instellingen</h2>

    <div class="settings">
      <div class="setting-row">
        <div><strong>Spreeksnelheid</strong><small>Lager = trager (1 is normaal)</small></div>
        <div class="stepper" data-key="rate">
          <button type="button" data-step="-1" aria-label="Minder">−</button>
          <output></output>
          <button type="button" data-step="1" aria-label="Meer">+</button>
        </div>
      </div>

      <label class="setting-row">
        <div><strong>Lidwoord en woord apart</strong><small>“de” … pauze … “tak”</small></div>
        <input type="checkbox" id="set-separate">
      </label>

      <label class="setting-row">
        <div><strong>Woord twee keer zeggen</strong></div>
        <input type="checkbox" id="set-twice">
      </label>

      <div class="setting-row">
        <div><strong>Kijktijd</strong><small>Seconden zichtbaar bij oefening 2</small></div>
        <div class="stepper" data-key="lookTime">
          <button type="button" data-step="-1" aria-label="Minder">−</button>
          <output></output>
          <button type="button" data-step="1" aria-label="Meer">+</button>
        </div>
      </div>

      <div class="setting-row">
        <div><strong>Strengheid verbetering</strong><small>Streng = spelfouten vallen sneller op</small></div>
        <div class="stepper" data-key="strict">
          <button type="button" data-step="-1" aria-label="Minder">−</button>
          <output></output>
          <button type="button" data-step="1" aria-label="Meer">+</button>
        </div>
      </div>

      <button id="btn-test-voice" class="btn" type="button">Test de stem</button>

      <section class="word-library" aria-labelledby="word-library-heading">
        <h3 id="word-library-heading">Woordenbibliotheek</h3>
        <p>Eigen voorbeeldreeksen per leerjaar en thema, ook met bijwoorden. Dit zijn geen officiële woordenlijsten van Plantyn of VAN IN.</p>
        <div class="library-filters">
          <label>Lesmethode voor bronlinks<select id="library-method"><option value="eigen">Eigen oefensets</option><option value="plantyn">Plantyn · De Taalkanjers</option><option value="vanin">VAN IN · Tijd voor Taal accent</option><option value="talent">VAN IN · TALENT</option></select></label>
          <label>Leerjaar<select id="library-grade"><option value="1">1e leerjaar</option><option value="2">2e leerjaar</option><option value="3">3e leerjaar</option><option value="4">4e leerjaar</option><option value="5">5e leerjaar</option><option value="6">6e leerjaar</option></select></label>
          <label>Woordsoort<select id="library-kind"><option value="all">Alle woorden</option><option value="woordenschat">Woorden met lidwoorden</option><option value="bijwoorden">Bijwoorden en uitdrukkingen</option></select></label>
          <label>Thema<select id="library-theme" disabled><option>Bibliotheek laden…</option></select></label>
        </div>
        <button id="btn-load-word-set" class="btn" type="button" disabled>Laad deze oefenset</button>
        <div id="library-sources" class="library-sources"></div>
        <p id="library-status" class="library-status" role="status" aria-live="polite"></p>
      </section>
      <section id="plantyn-theme-catalogue" class="word-library" aria-labelledby="plantyn-theme-heading" hidden>
        <h3 id="plantyn-theme-heading">Plantyn-thema's per leerjaar</h3>
        <p>Dit zijn de officiële thema's uit het openbare thema-overzicht. Plantyn publiceert daar geen spellingwoordlijsten. De oefenreeksen in de bibliotheek hierboven zijn eigen voorbeelden; gebruik TXT import voor een woordenlijst uit je klas.</p>
        <label>Thema voor dit leerjaar<select id="plantyn-theme" disabled><option>Thema's laden…</option></select></label>
        <p id="plantyn-theme-domain" class="library-status" aria-live="polite"></p>
        <div id="plantyn-preview-links" class="library-sources"></div>
      </section>
      <section class="word-library" aria-labelledby="txt-heading">
        <h3 id="txt-heading">Je eigen TXT-woordenlijst</h3>
        <label class="field">TXT-bestand laden<input id="word-file" type="file" accept=".txt,text/plain"></label>
        <p>Eén woord of uitdrukking per regel: bijvoorbeeld <em>de tak</em>, <em>het raam</em>, <em>morgen</em> of <em>af en toe</em>. Maximaal 200 woorden. Dubbele woorden worden verwijderd.</p>
        <button id="btn-download-words" class="btn" type="button">Download woordenlijst als TXT</button>
        <p id="word-file-status" class="library-status" role="status" aria-live="polite"></p>
      </section>
      <label class="field">
        <strong>Titel</strong>
        <input id="set-title" type="text" autocomplete="off">
      </label>

      <label class="field">
        <strong>Woordenlijst</strong>
        <small>Eén woord per regel. Lidwoorden, bijwoorden en korte uitdrukkingen mogen in dezelfde lijst staan.</small>
        <textarea id="set-words" rows="10" autocapitalize="off" autocorrect="off" spellcheck="false"></textarea>
      </label>
    </div>

    <div class="actions">
      <button id="btn-settings-done" class="btn btn-primary" type="button">Klaar</button>
      <button id="btn-settings-reset" class="btn" type="button">Standaardwaarden</button>
    </div>
  </section>

  <!-- ============ OEFENEN ============ -->
  <section id="screen-practice" class="screen" hidden>
    <header class="topbar app-header-layout">
      <button id="btn-stop" class="app-home-link" type="button">← Startscherm</button>
      <h2 id="practice-title" class="app-header-title">Themadictee</h2>
      <div class="app-header-metrics" aria-label="Voortgang en score">
        <span id="progress" class="app-header-metric">Woord 1 van 1</span>
        <span id="stars" class="stars app-header-metric">Score: ★ 0</span>
      </div>
    </header>

    <div class="prompt">
      <div id="word-display" class="word-display"></div>
      <button id="btn-listen" class="btn" type="button">Luister opnieuw</button>
    </div>

    <div id="pad-wrap" class="canvas-wrap">
      <canvas id="pad"></canvas>
    </div>

    <div id="write-actions" class="actions">
      <button id="btn-undo" class="btn" type="button">Ongedaan maken</button>
      <button id="btn-clear" class="btn" type="button">Wis alles</button>
      <button id="btn-check" class="btn btn-primary" type="button">Klaar</button>
    </div>

    <div id="result" class="result" hidden>
      <div id="result-auto">
        <p class="result-line"><small>Ik lees:</small><span id="read-text"></span></p>
        <p class="result-line"><small>Zo schrijf je het:</small><span id="target-text"></span></p>
        <div class="actions">
          <button id="btn-retry" class="btn" type="button">Opnieuw schrijven</button>
          <button id="btn-next" class="btn" type="button">Verder</button>
        </div>
        <button id="btn-override" class="link-btn" type="button">Mijn schrift werd verkeerd gelezen, het was juist</button>
      </div>

      <div id="result-manual" hidden>
        <p>Vergelijk zelf: heb je het goed geschreven?</p>
        <p class="result-line"><small>Zo schrijf je het:</small><span id="manual-target"></span></p>
        <div class="actions">
          <button id="btn-self-ok" class="btn btn-ok" type="button">✓ Goed</button>
          <button id="btn-self-bad" class="btn btn-bad" type="button">✗ Nog oefenen</button>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ EINDE ============ -->
  <section id="screen-end" class="screen" hidden>
    <h1>Klaar!</h1>
    <p id="end-summary" class="subtitle"></p>

    <div id="end-difficult-wrap" class="difficult" hidden>
      <p>Deze woorden oefen je best nog eens:</p>
      <ul id="end-difficult"></ul>
    </div>

    <div class="actions">
      <button id="btn-practice-difficult" class="btn btn-primary" type="button">Oefen moeilijke woorden</button>
      <button id="btn-restart" class="btn" type="button">Alles opnieuw</button>
      <button id="btn-home" class="btn" type="button">Startscherm</button>
    </div>
  </section>

  
</body>
</html>

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
  grade: 2,
  libraryGrade: 2,
  method: 'eigen',
  wordKind: 'all',
  wordSet: '',
  wordTheme: '',
  wordMethod: 'eigen',
  wordType: '',
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
  if(!text.trim()) return [];
  return window.DicteeWordLists.parseText(text).words;
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
let speechPrimed = false; // Flag to ensure the "warm-up" happens only once.

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const lang = (v) => v.lang.replace('_', '-').toLowerCase();
  voice =
    voices.find((v) => lang(v) === 'nl-be') ||
    voices.find((v) => lang(v).startsWith('nl')) ||
    null;
}

if (hasSpeech) {
  pickVoice();
  // This event is crucial for browsers that load voices asynchronously.
  speechSynthesis.onvoiceschanged = pickVoice;
}

function say(text) {
  return new Promise((resolve) => {
    if (!hasSpeech) return resolve();

    // ** THE FIX FOR EDGE STARTS HERE **
    // This is a workaround for browsers that may not initialize the speech engine
    // until an explicit action, or that suspend the audio context.
    if (!speechPrimed) {
      speechSynthesis.resume(); // Ensure the audio context is not suspended.
      const u = new SpeechSynthesisUtterance(''); // Speak an empty string to "wake up" the engine.
      speechSynthesis.speak(u);
      speechPrimed = true;
    }
    // ** THE FIX ENDS HERE **

    // Re-check for voices, as the list might have populated since the initial load.
    if (!voice) {
      pickVoice();
    }

    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
    }
    u.lang = voice ? voice.lang : 'nl-NL';
    u.rate = settings.rate;
    u.onend = u.onerror = (e) => {
      if (e.type === 'error') console.error('SpeechSynthesis Error:', e.error);
      resolve();
    };
    
    // Cancel any previous speech and speak the new utterance.
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function stopSpeech() {
  if (hasSpeech) speechSynthesis.cancel();
}

async function speakItem(item, withArticle) {
  if (!hasSpeech) return;
  stopSpeech();
  
  const sayOnce = async () => {
    if (withArticle && item.article) {
      if (settings.separate) {
        await say(item.article);
        await wait(600);
        await say(item.word);
      } else {
        await say(item.full);
      }
    } else {
      await say(item.word);
    }
  };

  await sayOnce();
  if (settings.twice) {
    await wait(900);
    await sayOnce();
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
  questionId: null,
  questionStartedAt: 0,
  assisted: false,
  lastOutcome: false,
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
  $('practice-title').textContent = $('app-title').textContent;
  showScreen('practice');
  showWord();
}

function updateStars() {
  $('stars').textContent = `Score: ★ ${session.stars}`;
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
  session.questionId = window.lerenProgress ? window.lerenProgress.questionId() : null;
  session.questionStartedAt = Date.now();
  session.assisted = false;
  session.lastOutcome = false;

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
  session.lastOutcome = ok;
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
  window.lerenEffects?.[ok ? 'correct' : 'incorrect'](box);

  $('read-text').textContent = read || '(niets herkend)';
  $('target-text').textContent = item.full;
  $('btn-override').hidden = ok;
  $('btn-next').classList.toggle('btn-primary', ok);
  $('btn-retry').classList.toggle('btn-primary', !ok);
}

function showManualResult(item) {
  session.assisted = true;
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
  if (session.questionId && window.lerenProgress) {
    window.lerenProgress.recordQuestion({ exercise_key: 'app-taal-spelling', mode: String(session.mode), question_id: session.questionId, attempt_count: Math.max(1, session.attempts), first_try_correct: session.lastOutcome && session.attempts === 1 && !session.assisted, assisted: session.assisted, duration_ms: Math.max(0, Date.now() - session.questionStartedAt) });
  }
  session.index++;
  if (session.index >= session.queue.length) finish();
  else {
      showWord();
      resetWriting();
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
  window.lerenEffects?.complete($('screen-end')); 
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
  $('library-grade').value=String(settings.libraryGrade||settings.grade);
  $('library-method').value=settings.method;
  $('library-kind').value=settings.wordKind;
  refreshLibraryChoices();
}

function openSettings() {
  renderSettings();
  showScreen('settings');
}

function closeSettings() {
  try {window.DicteeWordLists.parseText($('set-words').value);} catch(error) {$('word-file-status').textContent=error.message;return;}
  settings.title = $('set-title').value.trim() || DEFAULTS.title;
  settings.words = $('set-words').value.trim();
  saveSettings();
  applyTitle();
  showScreen('start');
}

function applyTitle() {
  $('app-title').textContent = settings.title;
  document.title = settings.title;
  let count=0;try{count=parseWords(settings.words).length;}catch(_){}
  $('active-word-list').textContent=settings.title+' · '+count+' woorden · leerjaar '+settings.grade;
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

/* ================= Woordenbibliotheek en TXT ================= */
let wordLibrary=[],wordResources=[],plantynThemes=[],plantynPreviews=[],plantynThemeSource='https://www.plantyn.com/lager-onderwijs/taal/taalkanjers-taal/thema-overzicht',importVersion=0;
function sourceLink(label,url){const link=document.createElement('a');link.textContent=label;link.href=url;link.target='_blank';link.rel='noopener noreferrer';return link;}
function refreshSources(){
  const method=$('library-method').value,grade=$('library-grade').value,links=[];
  if(method==='plantyn'){
    links.push(sourceLink('Plantyn: De Taalkanjers en spelling','https://www.plantyn.com/lager-onderwijs/taal/taalkanjers-spelling'));
    links.push(sourceLink('KlasCement: woordlijsten voor dit leerjaar','https://www.klascement.net/lesmateriaal/?q='+encodeURIComponent('De Taalkanjers '+grade+'e leerjaar woordenlijsten')));
  }else if(method==='vanin'){
    links.push(sourceLink('VAN IN: Tijd voor Taal accent','https://www.vanin.be/methodes/lager-onderwijs/nederlands/tijd-voor-taal-accent/'));
    links.push(sourceLink('KlasCement: woordpakketten voor dit leerjaar','https://www.klascement.net/lesmateriaal/?q='+encodeURIComponent('Tijd voor Taal accent '+grade+'e leerjaar woordenlijsten')));
  }else if(method==='talent'){
    links.push(sourceLink('VAN IN: TALENT, voorbeeldlessen per leerjaar','https://www.vanin.be/methodes/lager-onderwijs/nederlands/talent/'));
    links.push(sourceLink('KlasCement: TALENT voor dit leerjaar','https://www.klascement.net/lesmateriaal/?q='+encodeURIComponent('TALENT '+grade+'e leerjaar woordenlijsten')));
  }else links.push(sourceLink('Zoek woordenlijsten op KlasCement','https://www.klascement.net/lesmateriaal/?q='+encodeURIComponent('woordenlijsten '+grade+'e leerjaar spelling')));
  for(const resource of wordResources.filter(item=>item.method===method&&item.grade===Number(grade))){
    links.push(sourceLink('KlasCement: '+resource.title,resource.url));
  }
  $('library-sources').replaceChildren(...links);
  const note=document.createElement('small');note.textContent='KlasCement bevat door leraren gedeelde lijsten. Aanmelden kan nodig zijn. Controleer de editie en het thema van je klas en bewaar de gewenste woorden als TXT. De voorbeeldreeksen hierboven blijven eigen oefensets.';$('library-sources').append(note);
  refreshPlantynThemes();
}
function refreshPlantynThemes(){
  const panel=$('plantyn-theme-catalogue'),grade=Number($('library-grade').value),picker=$('plantyn-theme');
  panel.hidden=$('library-method').value!=='plantyn';
  const themes=plantynThemes.filter(item=>item.grade===grade),previous=picker.value;
  picker.replaceChildren(...themes.map((item,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=item.domain+' · '+item.theme;return option;}));
  picker.disabled=!themes.length;
  if(themes.length){const selected=themes.findIndex(item=>item.theme===previous);picker.value=String(selected>=0?selected:0);showPlantynTheme();}
  else{$('plantyn-theme-domain').textContent='Voor dit leerjaar zijn geen thema’s geladen.';$('plantyn-preview-links').replaceChildren();}
}
function showPlantynTheme(){
  const grade=Number($('library-grade').value),item=plantynThemes.filter(entry=>entry.grade===grade)[Number($('plantyn-theme').value)];
  if(!item)return;
  $('plantyn-theme-domain').textContent='Leerjaar '+grade+' · '+item.domain+' · '+item.theme;
  const links=[sourceLink('Officieel thema-overzicht',plantynThemeSource)];
  const previews=plantynPreviews.filter(preview=>preview.grade===grade);
  if(previews.length){
    for(const preview of previews){const label=preview.kind==='leerwerkboek'?'Bekijk voorbeeldles · leerwerkboek':'Bekijk voorbeeldles · handleiding';links.push(sourceLink(label,preview.url));}
    const note=document.createElement('small');note.textContent='De openbare voorbeeldlessen tonen één lesweek, geen complete woordenlijsten voor alle thema’s.';links.push(note);
  }else{
    const note=document.createElement('small');note.textContent='Plantyn vermeldt voor dit leerjaar thema’s, maar publiceert hier geen woordpakketten of voorbeeldles.';links.push(note);
  }
  $('plantyn-preview-links').replaceChildren(...links);
}
function refreshLibraryChoices(){
  const grade=Number($('library-grade').value),kind=$('library-kind').value,previous=$('library-theme').value;
  const filtered=wordLibrary.filter(set=>set.grade===grade&&(kind==='all'||set.kind===kind));
  $('library-theme').replaceChildren(...filtered.map(set=>{const option=document.createElement('option');option.value=set.id;option.textContent=set.theme+' · '+set.words.length+' woorden';return option;}));
  if(filtered.some(set=>set.id===previous))$('library-theme').value=previous;else if(filtered.some(set=>set.id===settings.wordSet))$('library-theme').value=settings.wordSet;
  $('library-theme').disabled=!filtered.length;$('btn-load-word-set').disabled=!filtered.length;refreshSources();
}
function applyWordList(text,title,metadata={}){
  const parsed=window.DicteeWordLists.parseText(text);
  settings.words=parsed.words.map(item=>item.full).join('\n');settings.title=parsed.metadata.titel||title||'Eigen woordenlijst';
  settings.wordTheme=parsed.metadata.thema||metadata.theme||'';
  settings.wordMethod=parsed.metadata.methode||metadata.method||'eigen';
  settings.wordType=parsed.metadata.woordsoort||metadata.kind||'';
  const grade=Number(parsed.metadata.leerjaar||metadata.grade||$('library-grade').value);if(Number.isInteger(grade)&&grade>=1&&grade<=6){settings.grade=grade;settings.libraryGrade=grade;}
  $('set-words').value=settings.words;$('set-title').value=settings.title;$('library-grade').value=String(settings.grade);
  saveSettings();applyTitle();refreshLibraryChoices();return parsed.words.length;
}
for(const id of ['library-grade','library-kind','library-method'])$(id).addEventListener('change',()=>{
  settings.libraryGrade=Number($('library-grade').value);settings.wordKind=$('library-kind').value;settings.method=$('library-method').value;saveSettings();refreshLibraryChoices();
});
$('btn-load-word-set').addEventListener('click',()=>{
  const set=wordLibrary.find(item=>item.id===$('library-theme').value);if(!set)return;
  settings.wordSet=set.id;const count=applyWordList(set.words.join('\n'),set.title,{grade:set.grade,theme:set.theme,kind:set.kind,method:'eigen'});$('library-status').textContent=count+' voorbeeldwoorden geladen. Kies Klaar en start een oefening.';
});
$('plantyn-theme').addEventListener('change',showPlantynTheme);
$('word-file').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;const version=++importVersion;$('word-file-status').textContent='Woordenlijst lezen…';
  try {
    if(!/\.txt$/i.test(file.name))throw new Error('Kies een TXT-bestand.');if(file.size>128*1024)throw new Error('Het bestand is te groot. Gebruik maximaal 128 KB.');
    const text=await file.text();if(version!==importVersion)return;if(text.includes('\uFFFD'))throw new Error('Bewaar je TXT-bestand als UTF-8 en probeer opnieuw.');
    const parsed=window.DicteeWordLists.parseText(text);settings.wordSet='';const count=applyWordList(text,file.name.replace(/\.txt$/i,''));
    $('word-file-status').textContent=count+' woorden geladen en op dit toestel bewaard. '+(parsed.metadata.thema?'Thema: '+parsed.metadata.thema+'. ':'')+'Kies Klaar om te oefenen.';
  } catch(error){if(version===importVersion)$('word-file-status').textContent=error.message;}
  finally{if(version===importVersion)event.target.value='';}
});
$('btn-download-words').addEventListener('click',()=>{
  try {
    const parsed=window.DicteeWordLists.parseText($('set-words').value);
    const metadata={titel:$('set-title').value||'Themadictee',leerjaar:settings.grade};
    if(settings.wordTheme)metadata.thema=settings.wordTheme;
    if(settings.wordType)metadata.woordsoort=settings.wordType;
    if(settings.wordMethod)metadata.methode=settings.wordMethod;
    const text=window.DicteeWordLists.exportText(parsed.words,metadata);
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='woorden-leerjaar-'+settings.grade+'.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('word-file-status').textContent='TXT-bestand gedownload.';
  }catch(error){$('word-file-status').textContent=error.message;}
});
$('set-words').addEventListener('input',()=>{settings.words=$('set-words').value;settings.wordSet='';});
$('set-title').addEventListener('input',()=>{settings.title=$('set-title').value;});
$('btn-choose-words').addEventListener('click',openSettings);
async function loadWordLibrary(){
  try {const response=await fetch('word-library.json?v=3');if(!response.ok)throw new Error();const data=await response.json();wordLibrary=data.sets;wordResources=data.resources||[];plantynThemes=data.plantynThemes||[];plantynPreviews=data.plantynPreviews||[];plantynThemeSource=data.plantynThemeSource||'https://www.plantyn.com/lager-onderwijs/taal/taalkanjers-taal/thema-overzicht';refreshLibraryChoices();}
  catch(_){$('library-status').textContent='De voorbeeldbibliotheek kon niet worden geladen. Je kunt wel een TXT-bestand laden of woorden typen.';}
}
loadWordLibrary();

/* ================= Koppelingen ================= */
document.querySelectorAll('.mode-card').forEach((b) => {
  b.addEventListener('click', () => {try{startSession(Number(b.dataset.mode), parseWords(settings.words));}catch(error){openSettings();$('word-file-status').textContent=error.message;}});
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
$('btn-self-ok').addEventListener('click', () => { window.lerenEffects?.correct($('result')); registerOutcome(true); next(); });
$('btn-self-bad').addEventListener('click', () => { window.lerenEffects?.incorrect($('result')); registerOutcome(false); next(); });

$('btn-practice-difficult').addEventListener('click', () => startSession(session.mode, [...session.difficult.values()]));
$('btn-restart').addEventListener('click', () => startSession(session.mode, parseWords(settings.words)));
$('btn-home').addEventListener('click', () => showScreen('start'));

/* ================= Start ================= */
applyTitle();
