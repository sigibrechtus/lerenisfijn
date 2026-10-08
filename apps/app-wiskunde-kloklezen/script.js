(() => {
  'use strict';

  /* =========================================================
     Constanten
     ========================================================= */
  const PRAISE = ['Goed zo!', 'Super!', 'Knap gedaan!', 'Prima!', 'Top!', 'Heel goed!'];
  const QUARTERS = [0, 15, 30, 45];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CENTER = 100;
  const FACE_R = 90;

  // Leuke activiteiten voor de "Rekenen met tijd"-oefening
  const DELTA_EVENTS = [
    { icon: '🎬', text: 'Een film kijken', minutes: 90, duration: '1,5 uur' },
    { icon: '🍕', text: 'Een pizza bakken', minutes: 15, duration: '15 minuten' },
    { icon: '🚗', text: 'Een autorit maken', minutes: 30, duration: '30 minuten' },
    { icon: '😴', text: 'Een dutje doen', minutes: 45, duration: '45 minuten' },
    { icon: '⚽', text: 'Een voetbalmatch spelen', minutes: 60, duration: '1 uur' },
    { icon: '📚', text: 'Een les volgen', minutes: 60, duration: '1 uur' },
    { icon: '🏊', text: 'Gaan zwemmen', minutes: 90, duration: '1,5 uur' },
    { icon: '🎮', text: 'Een spelletje spelen', minutes: 45, duration: '45 minuten' },
    { icon: '🚲', text: 'Een fietstocht maken', minutes: 120, duration: '2 uur' },
    { icon: '🍽️', text: 'Eten klaarmaken', minutes: 30, duration: '30 minuten' }
  ];

  const els = {
    score: document.getElementById('score'),
    modeCards: document.getElementById('modeCards'),
    leftLabel: document.getElementById('leftLabel'),
    rightLabel: document.getElementById('rightLabel'),
    leftClockWrap: document.getElementById('leftClockWrap'),
    phraseDisplay: document.getElementById('phraseDisplay'),
    deltaCard: document.getElementById('deltaCard'),
    deltaIcon: document.getElementById('deltaIcon'),
    deltaSentence: document.getElementById('deltaSentence'),
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

  /* =========================================================
     Status
     ========================================================= */
  let mode = 'read';          // 'read' | 'set' | 'calc'
  let current = null;         // oefening-gegevens
  let score = 0;
  let attempts = 0;
  let locked = false;
  let questionId = null;
  let questionStartedAt = 0;

  // Antwoord via spinners (enkel modus 'read')
  let answerHour = 12;
  let answerMinute = 0;

  // Antwoord via sleepbare wijzers (modus 'set' en 'calc')
  let dragHour = 12;
  let dragMinute = 0;

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const pad2 = n => String(n).padStart(2, '0');

  /* =========================================================
     Modus wisselen
     ========================================================= */
  els.modeCards.querySelectorAll('.mode-card').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  function setMode(newMode) {
    if (locked) return;
    mode = newMode;

    els.modeCards.querySelectorAll('.mode-card').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.mode === mode ? 'true' : 'false');
    });

    // Linkerkant: klok, tekst of delta-kaart
    els.leftClockWrap.hidden = (mode === 'set');
    els.phraseDisplay.hidden = (mode !== 'set');
    els.deltaCard.hidden = (mode !== 'calc');

    // Rechterkant: spinners (enkel 'read') of sleepbare klok ('set' / 'calc')
    els.digitalInput.hidden = (mode !== 'read');
    els.answerClockWrap.hidden = (mode === 'read');

    // Extra zekerheid: spinners volledig uitschakelen buiten modus 'read'
    document.querySelectorAll('.spin-btn').forEach(btn => {
      btn.disabled = (mode !== 'read');
    });

    if (mode === 'read') {
      els.leftLabel.textContent = 'Hoe laat is het?';
      els.rightLabel.textContent = 'Zet de tijd';
    } else if (mode === 'set') {
      els.leftLabel.textContent = 'Welke tijd staat hier?';
      els.rightLabel.textContent = 'Zet de wijzers';
    } else {
      els.leftLabel.textContent = 'Starttijd';
      els.rightLabel.textContent = 'Wat is de nieuwe tijd?';
    }

    newExercise();
  }

  /* =========================================================
     Tijd-hulpfuncties
     ========================================================= */
  function randomTime() {
    return { hour: 1 + Math.floor(Math.random() * 12), minute: pick(QUARTERS) };
  }

  function addMinutes(hour, minute, delta) {
    const h0 = hour % 12; // 0-11
    let total = (h0 * 60 + minute + delta) % (12 * 60);
    if (total < 0) total += 12 * 60;
    const resultHour0 = Math.floor(total / 60) % 12;
    const resultMinute = total % 60;
    return { hour: resultHour0 === 0 ? 12 : resultHour0, minute: resultMinute };
  }

  // Nederlandse tijdsaanduiding: kwart over/voor, half, of heel uur
  function toDutchPhrase(hour, minute) {
    const next = hour === 12 ? 1 : hour + 1;
    if (minute === 0) return `${hour} uur`;
    if (minute === 15) return `kwart over ${hour}`;
    if (minute === 30) return `half ${next}`;
    if (minute === 45) return `kwart voor ${next}`;
    return `${hour} uur`;
  }

  /* =========================================================
     Oefeningen genereren
     ========================================================= */
  function newExercise() {
    setFeedback('', '');
    hideHint();
    attempts = 0;
    questionId = window.lerenProgress ? window.lerenProgress.questionId() : null;
    questionStartedAt = Date.now();
    locked = false;
    els.checkBtn.disabled = false;

    if (mode === 'read') {
      const t = randomTime();
      current = t;
      drawClock(els.clockLeft, t.hour, t.minute, { interactive: false });
      answerHour = 12;
      answerMinute = 0;
      updateSpinnerDisplay();

    } else if (mode === 'set') {
      const t = randomTime();
      current = t;
      els.phraseDisplay.textContent = toDutchPhrase(t.hour, t.minute);
      dragHour = 12;
      dragMinute = 0;
      drawClock(els.clockRight, dragHour, dragMinute, { interactive: true, onChange: onDragChange });

    } else { // calc
      const start = randomTime();
      const event = pick(DELTA_EVENTS);
      const sign = pick([1, -1]);
      const deltaMinutes = sign * event.minutes;
      const result = addMinutes(start.hour, start.minute, deltaMinutes);

      current = {
        startHour: start.hour, startMinute: start.minute,
        event, sign, deltaMinutes,
        hour: result.hour, minute: result.minute
      };

      drawClock(els.clockLeft, start.hour, start.minute, { interactive: false });

      els.deltaIcon.textContent = event.icon;
      els.deltaSentence.textContent = sign > 0
        ? `${event.text} duurt ${event.duration}. Hoe laat is het als dit voorbij is?`
        : `${event.text} duurt ${event.duration} en is net voorbij. Hoe laat was het toen het begon?`;

      dragHour = 12;
      dragMinute = 0;
      drawClock(els.clockRight, dragHour, dragMinute, { interactive: true, onChange: onDragChange });
    }
  }

  function onDragChange(h, m) {
    dragHour = h;
    dragMinute = m;
  }

  /* =========================================================
     Digitale spinner (enkel modus 'read')
     ========================================================= */
  function updateSpinnerDisplay() {
    els.hourValue.textContent = answerHour;
    els.minuteValue.textContent = pad2(answerMinute);
  }

  document.querySelectorAll('.spin-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (locked || mode !== 'read') return;
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

  /* =========================================================
     Klok tekenen (SVG)
     ========================================================= */
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

  /* ---------- Sleepbare wijzers ---------- */
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
        let idx = Math.round(deg / 90) % 4; // 90° per kwartier
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

  /* =========================================================
     Controleren
     ========================================================= */
  function animate(cls) {
    els.exercise.classList.remove('pop', 'shake');
    void els.exercise.offsetWidth; // herstart animatie
    els.exercise.classList.add(cls);
  }

  function setFeedback(text, type) {
    els.feedback.textContent = text;
    els.feedback.className = 'feedback' + (type ? ' ' + type : '');
  }

  function showHint() {
    if (mode === 'read') {
      els.hint.textContent = 'Tip: de grote wijzer wijst de minuten aan, de kleine het uur.';

    } else if (mode === 'set') {
      if (current.minute === 30) {
        els.hint.textContent = `Tip: "half" betekent dat de kleine wijzer al halverwege het volgende uur staat.`;
      } else if (current.minute === 45) {
        els.hint.textContent = `Tip: "kwart voor" betekent nog 15 minuten tot het volgende uur.`;
      } else if (current.minute === 15) {
        els.hint.textContent = `Tip: "kwart over" betekent 15 minuten na het hele uur.`;
      } else {
        els.hint.textContent = `Tip: dit is een heel uur, de grote wijzer staat op 12.`;
      }

    } else { // calc
      const startText = `${current.startHour}:${pad2(current.startMinute)}`;
      const endText = `${current.hour}:${pad2(current.minute)}`;
      els.hint.textContent = current.sign > 0
        ? `Tip: ${startText} + ${current.event.duration} = ${endText}`
        : `Tip: ${endText} + ${current.event.duration} = ${startText}, reken dus terug.`;
    }
    els.hint.classList.add('visible');
  }

  function hideHint() {
    els.hint.classList.remove('visible');
    els.hint.textContent = '';
  }

  function check() {
    if (locked || !current) return;

    // Enkel in modus 'read' tellen de spinners; anders enkel de sleepbare klok
    const readHour = (mode === 'read') ? answerHour : dragHour;
    const readMinute = (mode === 'read') ? answerMinute : dragMinute;
    const correct = (readHour === current.hour) && (readMinute === current.minute);

    if (correct) {
      if (questionId && window.lerenProgress) window.lerenProgress.recordQuestion({ exercise_key: "app-wiskunde-kloklezen", mode, question_id: questionId, attempt_count: attempts + 1, first_try_correct: attempts === 0, assisted: false, duration_ms: Math.max(0, Date.now() - questionStartedAt) });
      locked = true;
      score++;
      els.score.textContent = score;
      setFeedback(`${pick(PRAISE)} Het is ${current.hour}:${pad2(current.minute)}`, 'good');
      hideHint();
      animate('pop');
      window.lerenEffects?.correct(els.feedback);
      setTimeout(() => {
        locked = false;
        newExercise();
      }, 1400);
    } else {
      attempts++;
      locked = true;
      setFeedback(`Je antwoord is ${readHour}:${pad2(readMinute)}. Dat is niet juist. Probeer opnieuw!`, 'bad');
      animate('shake');
      window.lerenEffects?.incorrect(els.feedback);
      if (attempts >= 2) showHint();
      setTimeout(() => { locked = false; }, 1200);
    }
  }

  els.checkBtn.addEventListener('click', check);

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); check(); }
  });

  /* =========================================================
     Start
     ========================================================= */
  setMode('read');
})();

