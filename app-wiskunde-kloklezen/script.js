'use strict';

const klok = document.getElementById('klok');
const grote = document.getElementById('grote-wijzer');
const kleine = document.getElementById('kleine-wijzer');
const opdrachtEl = document.getElementById('opdracht');
const feedbackEl = document.getElementById('feedback');

// Cijfers op de klok plaatsen
const radius = 135;
for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x = 160 + radius * Math.cos(angle);
    const y = 160 + radius * Math.sin(angle);
    const cijfer = document.createElement('div');
    cijfer.className = 'cijfer';
    cijfer.style.left = x + 'px';
    cijfer.style.top = y + 'px';
    cijfer.textContent = i;
    klok.appendChild(cijfer);
}

let doelUur = 3;
let doelMinuut = 0;
let grotehoek = 0;
let kleinehoek = 90; // startpositie

// ---- Sleepfunctionaliteit ----
let actieveWijzer = null;

function getHoekVanMuis(e) {
    const rect = document.getElementById('klok-container').getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
}

function startDrag(wijzer) {
    return function(e) {
        e.preventDefault();
        actieveWijzer = wijzer;
    };
}

function tijdensDrag(e) {
    if (!actieveWijzer) return;
    const hoek = getHoekVanMuis(e);
    if (actieveWijzer === grote) {
        // klik-op-5-minuten grid (elke 30 graden = 5 minuten)
        const gesnapt = Math.round(hoek / 30) * 30;
        grotehoek = gesnapt % 360;
        grote.style.transform = `translate(-50%, -100%) rotate(${grotehoek}deg)`;
    } else if (actieveWijzer === kleine) {
        const gesnapt = Math.round(hoek / 15) * 15; // elke 15 graden = half uur op de kleine wijzer
        kleinehoek = gesnapt % 360;
        kleine.style.transform = `translate(-50%, -100%) rotate(${kleinehoek}deg)`;
    }
}

function stopDrag() {
    actieveWijzer = null;
}

grote.addEventListener('mousedown', startDrag(grote));
kleine.addEventListener('mousedown', startDrag(kleine));
grote.addEventListener('touchstart', startDrag(grote));
kleine.addEventListener('touchstart', startDrag(kleine));

window.addEventListener('mousemove', tijdensDrag);
window.addEventListener('touchmove', tijdensDrag, { passive: true });
window.addEventListener('mouseup', stopDrag);
window.addEventListener('touchend', stopDrag);

// ---- Oefening genereren ----
const mogelijkeMinuten = [0, 15, 30, 45]; // heel uur, kwartier, half uur, kwart voor

function genereerOefening() {
    doelUur = Math.floor(Math.random() * 12) + 1;
    doelMinuut = mogelijkeMinuten[Math.floor(Math.random() * mogelijkeMinuten.length)];

    let tekst = '';
    if (doelMinuut === 0) {
        tekst = `Zet de klok op ${doelUur} uur`;
    } else if (doelMinuut === 15) {
        tekst = `Zet de klok op kwart na ${doelUur}`;
    } else if (doelMinuut === 30) {
        tekst = `Zet de klok op half ${doelUur === 12 ? 1 : doelUur + 1}`;
    } else if (doelMinuut === 45) {
        const volgendUur = doelUur === 12 ? 1 : doelUur + 1;
        tekst = `Zet de klok op kwart voor ${volgendUur}`;
    }

    opdrachtEl.textContent = tekst;
    feedbackEl.textContent = '';
    feedbackEl.className = '';

    // Reset wijzers naar een neutrale, willekeurige startpositie (niet de oplossing!)
    grotehoek = 0;
    kleinehoek = 0;
    grote.style.transform = `translate(-50%, -100%) rotate(0deg)`;
    kleine.style.transform = `translate(-50%, -100%) rotate(0deg)`;
}

// ---- Controleren ----
function controleer() {
    // Correcte hoeken berekenen
    const correcteGroteHoek = (doelMinuut / 60) * 360;
    const correcteKleineHoek = ((doelUur % 12) * 30) + (doelMinuut / 60) * 30;

    const toleratie = 8; // graden speling

    const groteOk = hoekVerschil(grotehoek, correcteGroteHoek) < toleratie;
    const kleineOk = hoekVerschil(kleinehoek, correcteKleineHoek) < toleratie;

    if (groteOk && kleineOk) {
        feedbackEl.textContent = '✅ Goed zo!';
        feedbackEl.className = 'correct';
    } else {
        feedbackEl.textContent = '❌ Nog niet juist, probeer opnieuw!';
        feedbackEl.className = 'fout';
    }
}

function hoekVerschil(a, b) {
    let diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
}

document.getElementById('controleer-btn').addEventListener('click', controleer);
document.getElementById('nieuwe-opdracht-btn').addEventListener('click', genereerOefening);

// Start met eerste oefening
genereerOefening();
