(() => {
  "use strict";

  const QUESTION_COUNT = 10;
  const INPUT_KEY = "lerenisfijn-plusmin-input-mode";
  const OPERATION_KEY = "lerenisfijn-plusmin-operation";
  const limitSelect = document.getElementById("limit");
  const newRoundButton = document.getElementById("new-round");
  const answerForm = document.getElementById("answer-form");
  const answerInput = document.getElementById("answer");
  const submitButton = document.getElementById("submit-button");
  const questionTitle = document.getElementById("question-title");
  const progress = document.getElementById("progress");
  const scoreLabel = document.getElementById("score");
  const feedback = document.getElementById("feedback");
  const quiz = document.getElementById("quiz");
  const summary = document.getElementById("summary");
  const summaryTitle = document.getElementById("summary-title");
  const summaryScore = document.getElementById("summary-score");
  const againButton = document.getElementById("again-button");
  const modeHint = document.getElementById("mode-hint");
  const canvasWrap = document.getElementById("canvasWrap");
  const pad = document.getElementById("pad");
  const keyboardWrap = document.getElementById("keyboardWrap");
  const undoButton = document.getElementById("undo-button");
  const clearButton = document.getElementById("clear-button");
  const ctx = pad.getContext("2d");
  const operationButtons = document.querySelectorAll("[data-operation]");
  const inputModeButtons = document.querySelectorAll("[data-input-mode]");
  const LINE_WIDTH = { pen: 6, hand: 10 };
  const els = { pad, canvasWrap };

  let questionNumber = 0;
  let correctAnswers = 0;
  let currentAnswer = 0;
  let currentQuestionText = "";
  let answered = false;
  let questionId = null;
  let questionStartedAt = 0;
  let operation = localStorage.getItem(OPERATION_KEY) || "mix";
  if (!["plus", "minus", "mix"].includes(operation)) operation = "mix";
  let inputMode = localStorage.getItem(INPUT_KEY) || "keyboard";
  if (!["pen", "hand", "keyboard"].includes(inputMode)) inputMode = "keyboard";
  let locked = false;
  let strokes = [];
  let activeStroke = null;
  let activePointerId = null;
  let activePointerType = null;
  let penSeen = false;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function makeQuestion(limit) {
    const chosen = operation === "mix" ? (Math.random() < 0.5 ? "plus" : "minus") : operation;
    if (chosen === "plus") {
      const first = randomInt(0, limit);
      const second = randomInt(0, limit - first);
      return { text: first + " + " + second + " = ?", answer: first + second };
    }
    const first = randomInt(0, limit);
    const second = randomInt(0, first);
    return { text: first + " − " + second + " = ?", answer: first - second };
  }

  function updateScore() {
    scoreLabel.textContent = "Goed: " + correctAnswers;
  }

  function updateOperationButtons() {
    operationButtons.forEach(button => {
      button.setAttribute("aria-pressed", button.dataset.operation === operation ? "true" : "false");
    });
  }

  function setOperation(value) {
    if (!["plus", "minus", "mix"].includes(value) || answered) return;
    operation = value;
    localStorage.setItem(OPERATION_KEY, operation);
    updateOperationButtons();
    questionNumber = 0;
    correctAnswers = 0;
    showQuestion();
  }

  function updateInputModeButtons() {
    inputModeButtons.forEach(button => button.setAttribute("aria-pressed", button.dataset.inputMode === inputMode ? "true" : "false"));
    const keyboard = inputMode === "keyboard";
    keyboardWrap.hidden = !keyboard;
    canvasWrap.classList.toggle("keyboard-mode", keyboard);
    undoButton.hidden = keyboard;
    clearButton.hidden = keyboard;
    modeHint.textContent = keyboard ? "Typ je antwoord met het toetsenbord." :
      (inputMode === "pen" ? (penSeen ? "Pen herkend: schrijf met de pen." : "Schrijf met je pen of potlood.") : "Schrijf met één vinger.");
  }

  function setInputMode(value) {
    if (!["pen", "hand", "keyboard"].includes(value)) return;
    inputMode = value;
    localStorage.setItem(INPUT_KEY, value);
    activeStroke = null;
    activePointerId = null;
    activePointerType = null;
    updateInputModeButtons();
    redraw();
    if (value === "keyboard") answerInput.focus();
    else resizeCanvas();
  }

  operationButtons.forEach(button => button.addEventListener("click", () => setOperation(button.dataset.operation)));
  inputModeButtons.forEach(button => button.addEventListener("click", () => setInputMode(button.dataset.inputMode)));

  function acceptsPointer(event) {
    if (event.pointerType === "mouse" || event.pointerType === "pen") return true;
    if (inputMode === "hand") return event.isPrimary;
    return !penSeen;
  }

  function showQuestion() {
    const limit = Number(limitSelect.value);
    const question = makeQuestion(limit);
    currentAnswer = question.answer;
    questionId = window.lerenProgress ? window.lerenProgress.questionId() : null;
    questionStartedAt = Date.now();
    currentQuestionText = question.text;
    answered = false;
    locked = false;

    questionTitle.textContent = currentQuestionText;
    progress.textContent = "Vraag " + (questionNumber + 1) + " van " + QUESTION_COUNT;
    updateScore();
    feedback.textContent = "Vul je antwoord in en druk op Controleer.";
    feedback.className = "feedback";
    answerInput.value = "";
    answerInput.disabled = false;
    submitButton.textContent = "Controleer";
    submitButton.disabled = false;
    clearPad();
    updateInputModeButtons();
    if (inputMode === "keyboard") answerInput.focus();
  }

  function startRound() {
    questionNumber = 0;
    correctAnswers = 0;
    summary.hidden = true;
    quiz.hidden = false;
    showQuestion();
  }

  function showSummary() {
    quiz.hidden = true;
    summary.hidden = false;
    summaryTitle.textContent = correctAnswers === QUESTION_COUNT ? "Perfect gedaan!" : "Reeks klaar!";
    summaryScore.textContent = "Je had " + correctAnswers + " van de " + QUESTION_COUNT + " vragen goed.";
    againButton.focus();
  }

  function handleAnswer(event) {
    event.preventDefault();
    if (answered) {
      if (questionNumber + 1 >= QUESTION_COUNT) showSummary();
      else {
        questionNumber += 1;
        showQuestion();
      }
      return;
    }

    let read = "";
    let userAnswer;
    if (inputMode === "keyboard") {
      read = answerInput.value.trim();
      if (!read.length || read.length > 3 || Array.from(read).some(char => char < "0" || char > "9")) {
        feedback.textContent = "Typ eerst een antwoord van maximaal drie cijfers.";
        feedback.className = "feedback feedback--try";
        answerInput.focus();
        return;
      }
      userAnswer = Number(read);
    } else {
      if (!strokes.length) {
        feedback.textContent = "Schrijf eerst je antwoord in het vak.";
        feedback.className = "feedback feedback--try";
        return;
      }
      read = recognizeNumber(strokes);
      if (!read) {
        feedback.textContent = "Ik kan het niet goed lezen. Schrijf de cijfers wat groter.";
        feedback.className = "feedback feedback--try";
        return;
      }
      userAnswer = Number(read);
    }

    answered = true;
    locked = true;
    answerInput.disabled = true;
    const correct = userAnswer === currentAnswer;
    if (questionId && window.lerenProgress) window.lerenProgress.recordQuestion({
      exercise_key: "app-wiskunde-plus-min",
      mode: operation + "-" + String(limitSelect.value),
      question_id: questionId,
      attempt_count: 1,
      first_try_correct: correct,
      assisted: false,
      duration_ms: Math.max(0, Date.now() - questionStartedAt)
    });
    if (correct) {
      correctAnswers += 1;
      feedback.textContent = "Juist! " + currentQuestionText.replace(" = ?", "") + " = " + currentAnswer + ".";
      feedback.className = "feedback feedback--good";
    } else {
      feedback.textContent = "Nog niet. Het juiste antwoord is " + currentAnswer + ".";
      feedback.className = "feedback feedback--try";
    }
    updateScore();
    submitButton.disabled = true;
    submitButton.textContent = questionNumber + 1 >= QUESTION_COUNT ? "Reeks afronden…" : "Volgende vraag…";
    window.setTimeout(() => {
      if (!answered) return;
      if (questionNumber + 1 >= QUESTION_COUNT) showSummary();
      else {
        questionNumber += 1;
        showQuestion();
      }
    }, 1400);
  }

  answerInput.addEventListener("input", () => {
    if (answerInput.value.trim() && feedback.classList.contains("feedback--try")) {
      feedback.textContent = "Druk op Controleer om je antwoord na te kijken.";
      feedback.className = "feedback";
    }
  });
  answerInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      answerForm.requestSubmit();
    }
  });
  answerForm.addEventListener("submit", handleAnswer);
  newRoundButton.addEventListener("click", startRound);
  againButton.addEventListener("click", startRound);
  limitSelect.addEventListener("change", startRound);

  /* =========================================================
     Schrijfvak (canvas)
     ========================================================= */
  pad.style.touchAction = 'none';
  pad.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  pad.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  pad.addEventListener('contextmenu', e => e.preventDefault());

  function resizeCanvas() {
    const rect = pad.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    pad.width = Math.round(rect.width * dpr);
    pad.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function setInkStyle() {
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1e3799';
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = LINE_WIDTH[inputMode] || 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function redraw() {
    const rect = pad.getBoundingClientRect();
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
    canvasWrap.classList.toggle('has-ink', strokes.length > 0);
  }

  function getPos(e) {
    const rect = pad.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function dropActiveStroke() {
    if (activeStroke) strokes = strokes.filter(s => s !== activeStroke);
    activeStroke = null;
    activePointerId = null;
    activePointerType = null;
    redraw();
  }

  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (locked || !current) return;

    if (e.pointerType === 'pen') {
      if (!penSeen) {
        penSeen = true;
        updateInputModeButtons();
      }
      // Handpalm die net vóór de pen het scherm raakte: die lijn weghalen
      if (inputMode === 'pen' && activePointerType === 'touch') dropActiveStroke();
    }

    if (!acceptsPointer(e)) return;
    if (activePointerId !== null) return;     // er wordt al geschreven

    activePointerId = e.pointerId;
    activePointerType = e.pointerType;
    try { pad.setPointerCapture(e.pointerId); } catch (err) { /* negeren */ }
    activeStroke = [getPos(e)];
    strokes.push(activeStroke);
    redraw();
  });

  pad.addEventListener('pointermove', e => {
    if (!activeStroke || e.pointerId !== activePointerId) return;
    e.preventDefault();
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    setInkStyle();
    (events.length ? events : [e]).forEach(ev => {
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
    activePointerType = null;
  };
  pad.addEventListener('pointerup', endStroke);
  pad.addEventListener('pointercancel', endStroke);
  pad.addEventListener('lostpointercapture', endStroke);

  function clearPad() {
    strokes = [];
    activeStroke = null;
    activePointerId = null;
    activePointerType = null;
    redraw();
  }

  function undoStroke() {
    strokes.pop();
    activeStroke = null;
    activePointerId = null;
    activePointerType = null;
    redraw();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resizeCanvas).observe(canvasWrap);
  } else {
    window.addEventListener('resize', resizeCanvas);
  }


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



  if ("ResizeObserver" in window) new ResizeObserver(resizeCanvas).observe(canvasWrap);
  else window.addEventListener("resize", resizeCanvas);
  updateOperationButtons();
  updateInputModeButtons();
  resizeCanvas();
  startRound();
})();
