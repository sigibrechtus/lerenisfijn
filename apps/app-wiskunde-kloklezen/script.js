(() => {
  'use strict';

  const PRAISE = ['Goed zo!', 'Super!', 'Knap gedaan!', 'Prima!', 'Top!', 'Heel goed!'];
  const QUARTERS = [0, 15, 30, 45];
  const DELTAS = [-60, -45, -30, -15, 15, 30, 45, 60];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CENTER = 100;
  const FACE_R = 90;

  const els = {
    score: document.getElementById('score'),
    modeCards: document.getElementById('modeCards'),
    leftLabel: document.getElementById('leftLabel'),
    rightLabel: document.getElementById('rightLabel'),
    deltaText: document.getElementById('deltaText'),
    clockLeft: document.getElementById('clockLeft'),
    clockRight: document.getElementById('clockRight'),
    digitalInput: document.getElementById('digitalInput'),
    answerClockWrap: document.getElementById('answerClockWrap'),
    hourValue: document.getElementById('hourValue'),
    minuteValue: document.getElementById('minuteValue'),
    checkBtn: document.getElementById('checkBtn'),
    feedback: document.getElementById('feedback'),
    hint: document.getElementById('hint'),
    exercise: document.getElementById('exercise')
  };

  let mode = 'read';
  let current = null;
  let score = 0;
  let attempts = 0;
  let locked = false;
  let answerHour = 12;
  let answerMinute = 0;
  let dragHour = 12;
  let dragMinute = 0;

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  els.modeCards.querySelectorAll('.mode-card').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  function setMode(newMode) {
    if (locked) return;
    mode = newMode;
    els.modeCards.querySelectorAll('.mode-card').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.mode === mode ? 'true' : 'false');
    });
    els.digitalInput.hidden = mode !== 'read';
    els.answerClockWrap.hidden = mode !== 'calc';
    els.deltaText.hidden = mode !== 'calc';
    els.leftLabel.textContent = mode === 'read' ? 'Hoe laat is het?' : 'Starttijd';
    els.rightLabel.textContent = mode === 'read' ? 'Zet de tijd' : 'Wat is de nieuwe tijd?';
    newExercise();
  }

  function randomTime(excl) {
    let h, m;
    do {
      h = 1 + Math.floor(Math.random() * 12);
      m = pick(QUARTERS);
    } while (excl && h === excl.hour && m === excl.minute);
    return { hour: h, minute: m };
  }

  function addMinutes(hour, minute, delta) {
    const h0 = hour % 12;
    let total = (h0 * 60 + minute + delta) % (12 * 60);
    if (total < 0) total += 12 * 60;
    const resultHour0 = Math.floor(total / 60) % 12;
    const resultMinute = total % 60;
    return { hour: resultHour0 === 0 ? 12 : resultHour0, minute: resultMinute };
  }

  function deltaLabel(delta) {
    const sign = delta > 0 ? 'erbij' : 'eraf';
    const abs = Math.abs(delta);
    const text = abs % 60 === 0 ? `${abs / 60} uur` : `${abs} minuten`;
    return `${text} ${sign}`;
  }

  function newExercise() {
    setFeedback('', '');
    hideHint();
    attempts = 0;
    locked = false;
    els.checkBtn.disabled = false;

    if (mode === 'read') {
      const t = randomTime(current);
      current = t;
      drawClock(els.clockLeft, t.hour, t.minute, { interactive: false });
      answerHour = 12;
      answerMinute = 0;
      updateSpinnerDisplay();
    } else {
      const start = randomTime();
      const delta = pick(DELTAS);
      const result = addMinutes(start.hour, start.minute, delta);
      current = {
        startHour: start.hour, startMinute: start.minute,
        delta, hour: result.hour, minute: result.minute
      };
      drawClock(els.clockLeft, start.hour, start.minute, { interactive: false });
      els.deltaText.textContent = deltaLabel(delta);
      dragHour = 12;
      dragMinute = 0;
      drawClock(els.clockRight, dragHour, dragMinute, { interactive: true, onChange: onDragChange });
    }
  }

  function onDragChange(h, m) {
    dragHour = h;
    dragMinute = m;
  }

  function updateSpinnerDisplay() {
    els.hourValue.textContent = answerHour;
    els.minuteValue.textContent = String(answerMinute).padStart(2, '0');
  }

  document.querySelectorAll('.spin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (locked) return;
      const target = btn.dataset.target;
      const dir = Number(btn.dataset.dir);
      if (target === 'hour') {
        answerHour = ((answerHour - 1 + dir + 12) % 12) + 1;
      } else {
        const idx = QUARTERS.indexOf(answerMinute);
        answerMinute = QUARTERS[(idx + dir + QUARTERS.length) % QUARTERS.length];
      }
      updateSpinnerDisplay();
    });
  });

  function el(tag, attrs) {
    const n = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }

  function handAngle(hour, minute) {
    const hourAngle = (hour % 12) * 30 + minute * 0.5;
    const minuteAngle = minute * 6;
    return { hourAngle, minuteAngle };
  }

  function drawClock(svg, hour, minute, opts = {}) {
    svg.innerHTML = '';
    svg.classList.remove('dragging');

    svg.appendChild(el('circle', { class: 'face', cx: CENTER, cy: CENTER, r: FACE_R }));

    for (let i = 0; i < 60; i++) {
      const major = i % 5 === 0;
      const a = (i * 6) * Math.PI / 180;
      const r1 = major ? FACE_R - 12 : FACE_R - 6;
      const r2 = FACE_R - 2;
      const x1 = CENTER + r1 * Math.sin(a), y1 = CENTER - r1 * Math.cos(a);
      const x2 = CENTER + r2 * Math.sin(a), y2 = CENTER - r2 * Math.cos(a);
      svg.appendChild(el('line', { class: 'tick' + (major ? ' major' : ''), x1, y1, x2, y2 }));
    }

    for (let n = 1; n <= 12; n++) {
      const a = (n * 30) * Math.PI / 180;
      const r = FACE_R - 24;
      const x = CENTER + r * Math.sin(a);
      const y = CENTER - r * Math.cos(a);
      const t = el('text', { class: 'number', x, y: y + 4 });
      t.textContent = n;
      svg.appendChild(t);
    }

    const { hourAngle, minuteAngle } = handAngle(hour, minute);

    const hourHand = el('line', {
      class: 'hour-hand', x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER - 45,
      transform: `rotate(${hourAngle} ${CENTER} ${CENTER})`
    });
    const minuteHand = el('line', {
      class: 'minute-hand', x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER - 70,
      transform: `rotate(${minuteAngle} ${CENTER} ${CENTER})`
    });

    svg.appendChild(hourHand);
    svg.appendChild(minuteHand);

    if (opts.interactive) {
      const hourHit = el('line', {
        class: 'hand-hit', x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER - 45,
        transform: `rotate(${hourAngle} ${CENTER} ${CENTER})`, 'data-hand': 'hour'
      });
      const minuteHit = el('line', {
        class: 'hand-hit', x1: CENTER, y1: CENTER, x2: CENTER, y2: CENTER - 70,
        transform: `rotate(${minuteAngle} ${CENTER} ${CENTER})`, 'data-hand': 'minute'
      });
      svg.appendChild(hourHit);
      svg.appendChild(minuteHit);
      svg.appendChild(el('circle', { class: 'center-dot', cx: CENTER, cy: CENTER, r: 5 }));
      makeDraggable(svg, hourHand, minuteHand, hourHit, minuteHit, hour, minute, opts.onChange);
    } else {
      svg.appendChild(el('circle', { class: 'center-dot', cx: CENTER, cy: CENTER, r: 5 }));
    }
  }

  function setHandTransforms(hourHand, minuteHand, hourHit, minuteHit, hour, minute) {
    const { hourAngle, minuteAngle } = handAngle(hour, minute);
    const hRot = `rotate(${hourAngle} ${CENTER} ${CENTER})`;
    const mRot = `rotate(${minuteAngle} ${CENTER} ${CENTER})`;
    hourHand.setAttribute('transform', hRot);
    hourHit.setAttribute('transform', hRot);
    minuteHand.setAttribute('transform', mRot);
    minuteHit.setAttribute('transform', mRot);
  }

  function makeDraggable(svg, hourHand, minuteHand, hourHit, minuteHit, initHour, initMinute, onChange) {
    let hour = initHour % 12 || 12;
    let minute = initMinute;
    let draggingHand = null;
    let activePointerId = null;

    function clientToAngle(clientX, clientY) {
      const rect = svg.getBoundingClientRect();
      const scaleX = 200 / rect.width;
      const scaleY = 200 / rect.height;
      const x = (clientX - rect.left) * scaleX - CENTER;
      const y = (clientY - rect.top) * scaleY - CENTER;
      let deg = Math.atan2(x, -y) * 180 / Math.PI;
      if (deg < 0) deg += 360;
      return deg;
    }

    function startDrag(hand, pointerId) {
      draggingHand = hand;
      activePointerId = pointerId;
      svg.classList.add('dragging');
      svg.setPointerCapture(pointerId);
    }

    function updateFromAngle(deg) {
      if (draggingHand === 'hour') {
        let idx = Math.round(deg / 30) % 12;
        hour = idx === 0 ? 12 : idx;
      } else if (draggingHand === 'minute') {
        let idx = Math.round(deg / 90) % 4;
        minute = QUARTERS[idx];
      }
      setHandTransforms(hourHand, minuteHand, hourHit, minuteHit, hour, minute);
      if (onChange) onChange(hour, minute);
    }

    function onPointerDown(e) {
      if (locked) return;
      e.preventDefault();
      const hand = e.target.dataset.hand;
      if (!hand) return;
      startDrag(hand, e.pointerId);
      updateFromAngle(clientToAngle(e.clientX, e.clientY));
    }

    function onPointerMove(e) {
      if (draggingHand === null || e.pointerId !== activePointerId) return;
      e.preventDefault();
      updateFromAngle(clientToAngle(e.clientX, e.clientY));
    }

    function onPointerUp(e) {
      if (e.pointerId !== activePointerId) return;
      draggingHand = null;
      activePointerId = null;
      svg.classList.remove('dragging');
    }

    hourHit.addEventListener('pointerdown', onPointerDown);
    minuteHit.addEventListener('pointerdown', onPointerDown);
    svg.addEventListener('pointermove', onPointerMove);
    svg.addEventListener('pointerup', onPointerUp);
    svg.addEventListener('pointercancel', onPointerUp);
  }

  function animate(cls) {
    els.exercise.classList.remove('pop', 'shake');
    void els.exercise.offsetWidth;
    els.exercise.classList.add(cls);
  }

  function setFeedback(text, type) {
    els.feedback.textContent = text;
    els.feedback.className = 'feedback' + (type ? ' ' + type : '');
  }

  function showHint() {
    if (mode === 'read') {
      els.hint.textContent = `Tip: de grote wijzer wijst de minuten aan, de kleine het uur.`;
    } else {
      const { startHour, startMinute, delta } = current;
      const startText = `${startHour}:${String(startMinute).padStart(2, '0')}`;
      els.hint.textContent = `Tip: ${startText} + (${deltaLabel(delta)}) = ${current.hour}:${String(current.minute).padStart(2, '0')}`;
    }
    els.hint.classList.add('visible');
  }

  function hideHint() {
    els.hint.classList.remove('visible');
    els.hint.textContent = '';
  }

  function check() {
    if (locked || !current) return;

    let correct;
    let readHour, readMinute;

    if (mode === 'read') {
      readHour = answerHour;
      readMinute = answerMinute;
      correct = (readHour === current.hour) && (readMinute === current.minute);
    } else {
      readHour = dragHour;
      readMinute = dragMinute;
      correct = (readHour === current.hour) && (readMinute === current.minute);
    }

    if (correct) {
      locked = true;
      score++;
      els.score.textContent = score;
      setFeedback(`${pick(PRAISE)} Het is ${current.hour}:${String(current.minute).padStart(2, '0')}`, 'good');
      hideHint();
      animate('pop');
      setTimeout(() => {
        locked = false;
        newExercise();
      }, 1400);
    } else {
      attempts++;
      locked = true;
      setFeedback(`Je antwoord is ${readHour}:${String(readMinute).padStart(2, '0')}. Dat is niet juist. Probeer opnieuw!`, 'bad');
      animate('shake');
      if (attempts >= 2) showHint();
      setTimeout(() => { locked = false; }, 1200);
    }
  }

  els.checkBtn.addEventListener('click', check);

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); check(); }
  });

  setMode('read');
})();
