(() => {
  'use strict';

  /* =========================================================
     Instellingen & constanten
     ========================================================= */
  const STORAGE_KEY = 'lerenisfijn-maaltafels-tafels';
  const INPUT_KEY = 'lerenisfijn-maaltafels-schrijfwijze';
  const DEFAULT_TABLES = [2, 5, 10];
  const DEFAULT_INPUT = 'pen';                 // 'pen' = potlood (standaard), 'hand' = vinger
  const LINE_WIDTH = { pen: 6, hand: 10 };
  const PRAISE = ['Goed zo!', 'Super!', 'Knap gedaan!', 'Prima!', 'Top!', 'Heel goed!'];

  const els = {
    tableButtons: document.getElementById('tableButtons'),
    selectAll: document.getElementById('selectAll'),
    selectNone: document.getElementById('selectNone'),
    settingsHint: document.getElementById('settingsHint'),
    exercise: document.getElementById('exercise'),
    factorA: document.getElementById('factorA'),
    factorB: document.getElementById('factorB'),
    answerSlot: document.getElementById('answerSlot'),
    canvasWrap: document.getElementById('canvasWrap'),
    pad: document.getElementById('pad'),
    clearBtn: document.getElementById('clearBtn'),
    undoBtn: document.getElementById('undoBtn'),
    checkBtn: document.getElementById('checkBtn'),
    feedback: document.getElementById('feedback'),
    hint: document.getElementById('hint'),
    score: document.getElementById('score')
  };

  /* =========================================================
     Status
     ========================================================= */
  let selectedTables = loadTables();
  let inputMode = loadInputMode();
  let current = null;          // { table, m, answer }
  let attempts = 0;
  let score = 0;
  let locked = false;

  // Schrijfvak
  const ctx = els.pad.getContext('2d');
  let strokes = [];            // [[{x,y}, ...], ...] in CSS-pixels
  let activeStroke = null;
  let activePointerId = null;
  let penSeen = false;
  let modeHint = null;

  /* =========================================================
     Tafels kiezen
     ========================================================= */
  function loadTables() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) {
        return saved.filter(n => Number.isInteger(n) && n >= 1 && n <= 10);
      }
    } catch (e) { /* negeren */ }
    return DEFAULT_TABLES.slice();
  }

  function saveTables() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedTables)); } catch (e) { /* negeren */ }
  }

  function renderTableButtons() {
    els.tableButtons.innerHTML = '';
    for (let t = 1; t <= 10; t++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'table-btn';
      btn.textContent = '\u00D7 ' + t;
      btn.title = 'Tafel van ' + t;
      btn.dataset.table = t;
      btn.addEventListener('click', () => toggleTable(t));
      els.tableButtons.appendChild(btn);
    }
    updateTableButtons();
  }

  function updateTableButtons() {
    els.tableButtons.querySelectorAll('.table-btn').forEach(btn => {
      const t = Number(btn.dataset.table);
      btn.setAttribute('aria-pressed', selectedTables.includes(t) ? 'true' : 'false');
    });
    els.settingsHint.textContent = selectedTables.length ? '' : 'Kies minstens één tafel.';
  }

  function toggleTable(t) {
    if (selectedTables.includes(t)) {
      selectedTables = selectedTables.filter(x => x !== t);
    } else {
      selectedTables.push(t);
      selectedTables.sort((a, b) => a - b);
    }
    onTablesChanged();
  }

  function onTablesChanged() {
    saveTables();
    updateTableButtons();
    if (!current || !selectedTables.includes(current.table)) {
      newExercise();
    }
  }

  els.selectAll.addEventListener('click', () => {
    selectedTables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    onTablesChanged();
  });
  els.selectNone.addEventListener('click', () => {
    selectedTables = [];
    onTablesChanged();
  });

  /* =========================================================
     Schrijfwijze (potlood of vinger)
     ========================================================= */
  function loadInputMode() {
    try {
      const saved = localStorage.getItem(INPUT_KEY);
      if (saved === 'pen' || saved === 'hand') return saved;
    } catch (e) { /* negeren */ }
    return DEFAULT_INPUT;
  }

  function saveInputMode() {
    try { localStorage.setItem(INPUT_KEY, inputMode); } catch (e) { /* negeren */ }
  }

  function renderInputModeButtons() {
    const panel = els.settingsHint.parentElement || els.tableButtons.parentElement;
    const wrap = document.createElement('div');
    wrap.className = 'input-mode';
    wrap.innerHTML = `
      <h3 class="input-mode-title">Schrijven met</h3>
      <div class="input-mode-buttons" role="group" aria-label="Schrijven met">
        <button type="button" class="table-btn mode-btn" data-mode="pen"
                title="Schrijf met een pen of potlood voor tablet">Potlood</button>
        <button type="button" class="table-btn mode-btn" data-mode="hand"
                title="Schrijf met je vinger">Vinger</button>
      </div>
      <p class="mode-hint"></p>`;
    panel.appendChild(wrap);

    modeHint = wrap.querySelector('.mode-hint');
    wrap.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setInputMode(btn.dataset.mode));
    });
    updateInputModeButtons();
  }

  function updateInputModeButtons() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.mode === inputMode ? 'true' : 'false');
    });
    if (modeHint) {
      modeHint.textContent = inputMode === 'pen'
        ? 'Alleen de pen schrijft. Je hand mag op het scherm rusten.'
        : 'Schrijf met één vinger.';
    }
  }

  function setInputMode(mode) {
    if (mode !== 'pen' && mode !== 'hand') return;
    inputMode = mode;
    saveInputMode();
    updateInputModeButtons();
    activeStroke = null;
    activePointerId = null;
    if (els.feedback.classList.contains('info')) setFeedback('', '');
    redraw();
  }

  // Mag dit type aanraking schrijven in de huidige modus?
  function acceptsPointer(e) {
    if (e.pointerType === 'mouse') return true;          // pc blijft altijd werken
    if (inputMode === 'pen') return e.pointerType === 'pen';
    return e.isPrimary;                                   // vinger: enkel de eerste vinger
  }

  /* =========================================================
     Oefeningen
     ========================================================= */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  function newExercise() {
    clearPad();
    setFeedback('', '');
    hideHint();
    attempts = 0;
    els.answerSlot.textContent = '?';
    els.answerSlot.classList.remove('correct');

    if (!selectedTables.length) {
      current = null;
      els.factorA.textContent = '?';
      els.factorB.textContent = '?';
      setGameEnabled(false);
      return;
    }

    setGameEnabled(true);
    let ex;
    let guard = 0;
    do {
      const table = pick(selectedTables);
      const m = 1 + Math.floor(Math.random() * 10);
      ex = { table, m, answer: table * m };
      guard++;
    } while (current && ex.table === current.table && ex.m === current.m && guard < 25);

    current = ex;
    els.factorA.textContent = ex.m;
    els.factorB.textContent = ex.table;
  }

  function setGameEnabled(enabled) {
    els.checkBtn.disabled = !enabled;
    els.clearBtn.disabled = !enabled;
    els.undoBtn.disabled = !enabled;
    els.canvasWrap.classList.toggle('disabled', !enabled);
  }

  function setFeedback(text, type) {
    els.feedback.textContent = text;
    els.feedback.className = 'feedback' + (type ? ' ' + type : '');
  }

  function showHint() {
    const { m, table } = current;
    const sum = Array(m).fill(table).join(' + ');
    els.hint.textContent = m === 1
      ? `Tip: 1 \u00D7 ${table} betekent 1 keer ${table}.`
      : `Tip: ${m} \u00D7 ${table} betekent ${m} keer ${table}: ${sum}`;
    els.hint.classList.add('visible');
  }

  function hideHint() {
    els.hint.classList.remove('visible');
    els.hint.textContent = '';
  }

  function animate(cls) {
    els.exercise.classList.remove('pop', 'shake');
    void els.exercise.offsetWidth; // herstart animatie
    els.exercise.classList.add(cls);
  }

  function check() {
    if (locked || !current) return;

    if (!strokes.length) {
      setFeedback('Schrijf eerst je antwoord in het vak.', 'info');
      return;
    }

    const read = recognizeNumber(strokes);
    if (!read) {
      setFeedback('Ik kan het niet goed lezen. Schrijf wat groter.', 'info');
      return;
    }

    const value = parseInt(read, 10);

    if (value === current.answer) {
      locked = true;
      score++;
      els.score.textContent = score;
      els.answerSlot.textContent = current.answer;
      els.answerSlot.classList.add('correct');
      setFeedback(`${pick(PRAISE)} ${current.m} \u00D7 ${current.table} = ${current.answer}`, 'good');
      hideHint();
      animate('pop');
      setTimeout(() => {
        locked = false;
        newExercise();
      }, 1400);
    } else {
      attempts++;
      locked = true;
      setFeedback(`Ik lees: ${read}. Dat is niet juist. Probeer opnieuw!`, 'bad');
      animate('shake');
      if (attempts >= 2) showHint();
      setTimeout(() => {
        clearPad();
        locked = false;
      }, 1300);
    }
  }

  els.checkBtn.addEventListener('click', check);
  els.clearBtn.addEventListener('click', () => { if (!locked) clearPad(); });
  els.undoBtn.addEventListener('click', () => { if (!locked) undoStroke(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); check(); }
    if (e.key === 'Backspace' && !locked) { e.preventDefault(); undoStroke(); }
    if (e.key === 'Escape' && !locked) clearPad();
  });

  /* =========================================================
     Schrijfvak (canvas)
     ========================================================= */
  // Geen scrollen/zoomen wanneer de hand op het schrijfvak rust
  els.pad.style.touchAction = 'none';
  els.pad.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  els.pad.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  els.pad.addEventListener('contextmenu', e => e.preventDefault());

  function resizeCanvas() {
    const rect = els.pad.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    els.pad.width = Math.round(rect.width * dpr);
    els.pad.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function setInkStyle() {
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1e3799';
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = LINE_WIDTH[inputMode] || 9;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function redraw() {
    const rect = els.pad.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setInkStyle();
    strokes.forEach(s => {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0].x, s[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(s[0].x, s[0].y);
      for (let i = 1; i < s.length; i++) ctx.lineTo(s[i].x, s[i].y);
      ctx.stroke();
    });
    els.canvasWrap.classList.toggle('has-ink', strokes.length > 0);
  }

  function getPos(e) {
    const rect = els.pad.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  els.pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (locked || !current) return;
    if (e.pointerType === 'pen') penSeen = true;

    if (!acceptsPointer(e)) {
      // Potlood-modus maar met vinger aangeraakt: uitleg tonen zolang er nog geen pen gebruikt is
      if (inputMode === 'pen' && e.pointerType === 'touch' && !penSeen && !strokes.length) {
        setFeedback('Potlood-modus: schrijf met de pen, of kies "Vinger".', 'info');
      }
      return;
    }
    if (activePointerId !== null) return;     // er wordt al geschreven

    activePointerId = e.pointerId;
    els.pad.setPointerCapture(e.pointerId);
    activeStroke = [getPos(e)];
    strokes.push(activeStroke);
    redraw();
  });

  els.pad.addEventListener('pointermove', e => {
    if (!activeStroke || e.pointerId !== activePointerId) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    setInkStyle();
    events.forEach(ev => {
      const p = getPos(ev);
      const last = activeStroke[activeStroke.length - 1];
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      activeStroke.push(p);
    });
  });

  const endStroke = e => {
    if (e.pointerId !== activePointerId) return;
    activeStroke = null;
    activePointerId = null;
  };
  els.pad.addEventListener('pointerup', endStroke);
  els.pad.addEventListener('pointercancel', endStroke);
  els.pad.addEventListener('lostpointercapture', endStroke);

  function clearPad() {
    strokes = [];
    activeStroke = null;
    activePointerId = null;
    redraw();
  }

  function undoStroke() {
    strokes.pop();
    activeStroke = null;
    activePointerId = null;
    redraw();
  }

  window.addEventListener('resize', resizeCanvas);

  /* =========================================================
     Cijferherkenning ($P point-cloud recognizer)
     ========================================================= */
  const NUM_POINTS = 32;

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function pathLength(pts) {
    let d = 0;
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].id === pts[i - 1].id) d += dist(pts[i - 1], pts[i]);
    }
    return d;
  }

  function resample(points, n) {
    const I = pathLength(points) / (n - 1);
    const src = points.slice();
    const out = [src[0]];
    let D = 0;
    for (let i = 1; i < src.length; i++) {
      if (src[i].id !== src[i - 1].id) continue;
      const d = dist(src[i - 1], src[i]);
      if (D + d >= I) {
        const t = (I - D) / d;
        const q = {
          x: src[i - 1].x + t * (src[i].x - src[i - 1].x),
          y: src[i - 1].y + t * (src[i].y - src[i - 1].y),
          id: src[i].id
        };
        out.push(q);
        src.splice(i, 0, q);
        D = 0;
      } else {
        D += d;
      }
    }
    const last = src[src.length - 1];
    while (out.length < n) out.push({ x: last.x, y: last.y, id: last.id });
    return out.slice(0, n);
  }

  function scale(pts) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    pts.forEach(p => {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    });
    const size = Math.max(maxX - minX, maxY - minY) || 1;
    return pts.map(p => ({ x: (p.x - minX) / size, y: (p.y - minY) / size, id: p.id }));
  }

  function translateToOrigin(pts) {
    let cx = 0, cy = 0;
    pts.forEach(p => { cx += p.x; cy += p.y; });
    cx /= pts.length; cy /= pts.length;
    return pts.map(p => ({ x: p.x - cx, y: p.y - cy, id: p.id }));
  }

  function normalize(points) {
    if (points.length < 2 || pathLength(points) <= 0) return null;
    return translateToOrigin(scale(resample(points, NUM_POINTS)));
  }

  function cloudDistance(a, b, start) {
    const n = a.length;
    const matched = new Array(n).fill(false);
    let sum = 0;
    let i = start;
    do {
      let index = -1, min = Infinity;
      for (let j = 0; j < n; j++) {
        if (!matched[j]) {
          const d = dist(a[i], b[j]);
          if (d < min) { min = d; index = j; }
        }
      }
      matched[index] = true;
      const weight = 1 - ((i - start + n) % n) / n;
      sum += weight * min;
      i = (i + 1) % n;
    } while (i !== start);
    return sum;
  }

  function greedyCloudMatch(pts, tpl) {
    const step = Math.floor(Math.pow(pts.length, 0.5));
    let min = Infinity;
    for (let i = 0; i < pts.length; i += step) {
      min = Math.min(min, cloudDistance(pts, tpl, i), cloudDistance(tpl, pts, i));
    }
    return min;
  }

  /* ---------- Sjablonen voor cijfers 0–9 ---------- */
  function line(x1, y1, x2, y2, steps = 10) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      pts.push([x1 + (x2 - x1) * i / steps, y1 + (y2 - y1) * i / steps]);
    }
    return pts;
  }

  // Hoeken in graden, y-as naar beneden: -90 = boven, 0 = rechts, 90 = onder, 180 = links
  function arc(cx, cy, rx, ry, a0, a1, steps = 28) {
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = (a0 + (a1 - a0) * i / steps) * Math.PI / 180;
      pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
    }
    return pts;
  }

  const path = (...parts) => parts.flat();

  const RAW_TEMPLATES = {
    '0': [
      [arc(30, 50, 25, 45, -90, 270)],
      [arc(30, 50, 25, 45, -90, -450)]
    ],
    '1': [
      [line(30, 5, 30, 95)],
      [path(line(15, 22, 30, 5), line(30, 5, 30, 95))],
      [path(line(15, 22, 30, 5), line(30, 5, 30, 95)), line(15, 95, 45, 95)]
    ],
    '2': [
      [path(arc(30, 28, 22, 23, 200, 400), line(47, 43, 8, 95), line(8, 95, 55, 95))],
      [path(arc(30, 30, 22, 25, 180, 360), line(52, 30, 8, 95), line(8, 95, 55, 95))]
    ],
    '3': [
      [path(arc(28, 27, 22, 22, 200, 450), arc(28, 72, 24, 23, 270, 520))],
      [path(line(8, 5, 50, 5), line(50, 5, 25, 42), arc(28, 68, 24, 26, 240, 520))]
    ],
    '4': [
      [path(line(40, 5, 5, 65), line(5, 65, 58, 65)), line(40, 20, 40, 95)],
      [path(line(12, 5, 8, 60), line(8, 60, 58, 60)), line(44, 25, 44, 95)],
      [path(line(40, 95, 40, 5), line(40, 5, 5, 65), line(5, 65, 58, 65))]
    ],
    '5': [
      [path(line(50, 5, 14, 5), line(14, 5, 12, 45), arc(30, 68, 22, 25, 225, 520))],
      [path(line(14, 5, 12, 45), arc(30, 68, 22, 25, 225, 520)), line(14, 5, 50, 5)]
    ],
    '6': [
      [path(line(46, 5, 14, 55), arc(32, 72, 20, 22, 180, -180))],
      [path(arc(45, 55, 33, 50, 250, 180), arc(32, 72, 20, 22, 180, -180))]
    ],
    '7': [
      [path(line(5, 5, 55, 5), line(55, 5, 22, 95))],
      [path(line(5, 5, 55, 5), line(55, 5, 22, 95)), line(20, 50, 48, 50)]
    ],
    '8': [
      [path(arc(30, 27, 17, 22, 90, 450), arc(30, 72, 22, 23, -90, 270))],
      [arc(30, 27, 17, 22, 90, 450), arc(30, 72, 22, 23, -90, 270)]
    ],
    '9': [
      [path(arc(30, 28, 20, 22, 0, -360), line(50, 28, 46, 95))],
      [arc(30, 28, 20, 22, 0, 360), line(50, 15, 48, 95)],
      [path(arc(30, 28, 20, 22, 0, -360), line(50, 28, 48, 70), arc(35, 70, 13, 20, 0, 150))]
    ]
  };

  const TEMPLATES = [];
  Object.entries(RAW_TEMPLATES).forEach(([digit, variants]) => {
    variants.forEach(strokeList => {
      const pts = [];
      strokeList.forEach((stroke, id) => stroke.forEach(([x, y]) => pts.push({ x, y, id })));
      TEMPLATES.push({ digit, cloud: normalize(pts) });
    });
  });

  /* ---------- Opsplitsen in losse cijfers ---------- */
  function bbox(stroke) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    stroke.forEach(p => {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    });
    return { minX, minY, maxX, maxY };
  }

  function overlaps(a, b) {
    const ca = (a.minX + a.maxX) / 2;
    const cb = (b.minX + b.maxX) / 2;
    return (cb >= a.minX && cb <= a.maxX) || (ca >= b.minX && ca <= b.maxX);
  }

  function segment(allStrokes) {
    const items = allStrokes
      .map(s => ({ strokes: [s], ...bbox(s) }))
      .filter(it => Math.max(it.maxX - it.minX, it.maxY - it.minY) >= 6);

    items.sort((a, b) => a.minX - b.minX);

    let groups = [];
    items.forEach(it => {
      const g = groups.find(gr => overlaps(gr, it));
      if (g) {
        g.strokes.push(...it.strokes);
        g.minX = Math.min(g.minX, it.minX); g.maxX = Math.max(g.maxX, it.maxX);
        g.minY = Math.min(g.minY, it.minY); g.maxY = Math.max(g.maxY, it.maxY);
      } else {
        groups.push({ ...it, strokes: [...it.strokes] });
      }
    });

    // Groepen die na samenvoegen overlappen alsnog samenvoegen
    let merged = true;
    while (merged) {
      merged = false;
      outer:
      for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          if (overlaps(groups[i], groups[j])) {
            const a = groups[i], b = groups[j];
            a.strokes.push(...b.strokes);
            a.minX = Math.min(a.minX, b.minX); a.maxX = Math.max(a.maxX, b.maxX);
            a.minY = Math.min(a.minY, b.minY); a.maxY = Math.max(a.maxY, b.maxY);
            groups.splice(j, 1);
            merged = true;
            break outer;
          }
        }
      }
    }

    // Kleine vlekjes negeren
    const maxH = Math.max(...groups.map(g => g.maxY - g.minY), 0);
    groups = groups.filter(g => Math.max(g.maxX - g.minX, g.maxY - g.minY) >= maxH * 0.25);

    return groups.sort((a, b) => a.minX - b.minX);
  }

  function recognizeDigit(group) {
    const w = group.maxX - group.minX;
    const h = group.maxY - group.minY;
    if (h > 0 && w < h * 0.22) return '1';

    const pts = [];
    group.strokes.forEach((s, id) => s.forEach(p => pts.push({ x: p.x, y: p.y, id })));
    const cloud = normalize(pts);
    if (!cloud) return null;

    let best = null, bestScore = Infinity;
    TEMPLATES.forEach(t => {
      const d = greedyCloudMatch(cloud, t.cloud);
      if (d < bestScore) { bestScore = d; best = t.digit; }
    });
    return best;
  }

  function recognizeNumber(allStrokes) {
    const groups = segment(allStrokes);
    if (!groups.length || groups.length > 3) return null;
    let result = '';
    for (const g of groups) {
      const d = recognizeDigit(g);
      if (d === null) return null;
      result += d;
    }
    return result;
  }

  /* =========================================================
     Start
     ========================================================= */
  renderTableButtons();
  renderInputModeButtons();
  resizeCanvas();
  newExercise();
})();
