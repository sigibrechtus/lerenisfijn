'use strict';

const $ = (id) => document.getElementById(id);

/* ---------- Instellingen ---------- */
const STANDAARD = { doel: 30, minuten: 3, max: 10, nul: true };
const GRENZEN = { doel: [5, 100, 5], minuten: [1, 10, 1], max: [5, 20, 1] }; // [min, max, stap]

function laadInstellingen() {
    try { return Object.assign({}, STANDAARD, JSON.parse(localStorage.getItem("splitsInst") || "{}")); }
    catch (_) { return Object.assign({}, STANDAARD); }
}
function bewaarInstellingen() {
    try { localStorage.setItem("splitsInst", JSON.stringify(inst)); } catch (_) {}
}
let inst = laadInstellingen();

function toonInstellingen() {
    Object.keys(GRENZEN).forEach((k) => { $("waarde-" + k).textContent = inst[k]; });
    $("nulToggle").checked = inst.nul;
}

document.querySelectorAll(".stapper button").forEach((b) => {
    b.addEventListener("click", () => {
        const veld = b.dataset.veld;
        const [mn, mx, st] = GRENZEN[veld];
        inst[veld] = Math.min(mx, Math.max(mn, inst[veld] + st * Number(b.dataset.richting)));
        bewaarInstellingen();
        toonInstellingen();
        $("instelMelding").textContent = "Opgeslagen";
    });
});
$("nulToggle").addEventListener("change", () => {
    inst.nul = $("nulToggle").checked;
    bewaarInstellingen();
    $("instelMelding").textContent = "Opgeslagen";
});
$("standaardBtn").addEventListener("click", () => {
    inst = Object.assign({}, STANDAARD);
    bewaarInstellingen();
    toonInstellingen();
    $("instelMelding").textContent = "Standaardwaarden hersteld";
});
$("recordWisBtn").addEventListener("click", () => {
    try {
        Object.keys(localStorage).filter((k) => k.startsWith("splitsRecord")).forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    $("instelMelding").textContent = "Beste scores gewist";
});

/* ---------- Record (per combinatie van instellingen) ---------- */
function recordSleutel() {
    return "splitsRecord-" + inst.doel + "-" + inst.minuten + "-" + inst.max + "-" + (inst.nul ? 1 : 0);
}
function leesRecord() {
    try { return parseInt(localStorage.getItem(recordSleutel()) || "0", 10); } catch (_) { return 0; }
}
function bewaarRecord(w) {
    try { localStorage.setItem(recordSleutel(), String(w)); } catch (_) {}
}

function updateStartscherm() {
    const woordMin = inst.minuten === 1 ? "minuut" : "minuten";
    $("startTitel").textContent = "Splitsen tot " + inst.max;
    $("gameTitel").textContent = "Splitsen tot " + inst.max;
    $("startTekst").innerHTML = "Maak minstens <b>" + inst.doel + " splitsingen</b> juist in <b>" +
        inst.minuten + " " + woordMin + "</b>.<br>Sleep het juiste getal naar het lege bolletje.";
    const r = leesRecord();
    $("record").textContent = r > 0 ? "Beste score tot nu toe: " + r + " juist" : "";
}

/* ---------- Spel ---------- */
let goed = 0, fout = 0, hoofdgetal = 0, gegeven = 0, ontbrekend = 0;
let dropzone = null, vergrendeld = false, bezig = false, eindTijd = 0, timerId = null, vorige = "";
let vraagId = null, vraagStart = 0, vraagPogingen = 0;

function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function toonScherm(id) {
    document.querySelectorAll(".scherm").forEach((s) => s.classList.remove("actief"));
    $(id).classList.add("actief");
    window.scrollTo(0, 0);
}
function melding(t, soort) { $("melding").textContent = t || ""; $("melding").className = soort || ""; }

function bouwPot() {
    const pot = $("pot");
    pot.innerHTML = "";
    for (let i = 0; i <= inst.max; i++) {
        const t = document.createElement("div");
        t.className = "tegel";
        t.dataset.waarde = i;
        t.textContent = i;
        t.addEventListener("pointerdown", dragStart);
        pot.appendChild(t);
    }
}

function nieuweSplitsing() {
    vraagId = window.lerenProgress ? window.lerenProgress.questionId() : null;
    vraagStart = Date.now();
    vraagPogingen = 0;
    let sleutel;
    do {
        if (inst.nul) { hoofdgetal = rand(1, inst.max); gegeven = rand(0, hoofdgetal); }
        else { hoofdgetal = rand(2, inst.max); gegeven = rand(1, hoofdgetal - 1); }
        sleutel = hoofdgetal + "-" + gegeven;
    } while (sleutel === vorige);
    vorige = sleutel;
    ontbrekend = hoofdgetal - gegeven;

    const linksGegeven = Math.random() < 0.5;
    const gegevenBol = linksGegeven ? $("links") : $("rechts");
    dropzone = linksGegeven ? $("rechts") : $("links");

    $("top").textContent = hoofdgetal;
    $("opdracht").textContent = "Splits " + hoofdgetal;
    gegevenBol.className = "bol deel";
    gegevenBol.textContent = gegeven;
    dropzone.className = "bol leeg";
    dropzone.textContent = "?";
    melding("");
    vergrendeld = false;
}

/* ---------- Slepen ---------- */
let kloon = null, bron = null;

function dragStart(e) {
    if (!bezig || vergrendeld || kloon) return;
    e.preventDefault();
    bron = e.currentTarget;
    kloon = bron.cloneNode(true);
    kloon.classList.add("kloon");
    document.body.appendChild(kloon);
    bron.classList.add("weg");
    beweeg(e);
    document.addEventListener("pointermove", beweeg);
    document.addEventListener("pointerup", dragEinde);
    document.addEventListener("pointercancel", stopSlepen);
}
function beweeg(e) {
    if (!kloon) return;
    kloon.style.left = e.clientX + "px";
    kloon.style.top = e.clientY + "px";
}
function stopSlepen() {
    document.removeEventListener("pointermove", beweeg);
    document.removeEventListener("pointerup", dragEinde);
    document.removeEventListener("pointercancel", stopSlepen);
    if (kloon) kloon.remove();
    if (bron) bron.classList.remove("weg");
    kloon = null;
    bron = null;
}
function dragEinde(e) {
    const waarde = bron ? parseInt(bron.dataset.waarde, 10) : null;
    stopSlepen();
    const r = dropzone.getBoundingClientRect();
    const m = 25;
    const raak = e.clientX >= r.left - m && e.clientX <= r.right + m && e.clientY >= r.top - m && e.clientY <= r.bottom + m;
    if (raak && waarde !== null && bezig && !vergrendeld) controleer(waarde);
}
document.addEventListener("touchmove", (e) => { if (kloon) e.preventDefault(); }, { passive: false });

/* ---------- Automatische controle ---------- */
function controleer(waarde) {
    vergrendeld = true;
    vraagPogingen++;
    dropzone.textContent = waarde;
    if (waarde === ontbrekend) {
        goed++;
        if (vraagId && window.lerenProgress) window.lerenProgress.recordQuestion({ exercise_key: "app-wiskunde-splitsingen", question_id: vraagId, attempt_count: vraagPogingen, first_try_correct: vraagPogingen === 1, assisted: false, duration_ms: Math.max(0, Date.now() - vraagStart) });
        updateTeller();
        dropzone.className = "bol juist";
        melding("Goed!", "goed");
        window.lerenEffects?.correct(dropzone);
        setTimeout(() => { if (bezig) nieuweSplitsing(); }, 450);
    } else {
        fout++;
        dropzone.className = "bol fout";
        melding("Probeer opnieuw!", "fout");
        window.lerenEffects?.incorrect(dropzone);
        setTimeout(() => {
            if (!bezig) return;
            dropzone.className = "bol leeg";
            dropzone.textContent = "?";
            melding("");
            vergrendeld = false;
        }, 700);
    }
}

function updateTeller() {
    $("teller").innerHTML = goed + "<small> / " + inst.doel + "</small>";
    $("doelVulling").style.width = Math.min(100, goed / inst.doel * 100) + "%";
    if (goed >= inst.doel) $("doelBereikt").classList.remove("verborgen");
}

/* ---------- Timer ---------- */
function tik() {
    const rest = Math.max(0, eindTijd - Date.now());
    const sec = Math.ceil(rest / 1000);
    $("timer").textContent = Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0");
    $("timerVak").classList.toggle("bijna", sec <= 30);
    if (rest <= 0) eindeSpel();
}

function startSpel() {
    goed = 0; fout = 0; vorige = ""; bezig = true;
    updateTeller();
    $("doelBereikt").classList.add("verborgen");
    bouwPot();
    nieuweSplitsing();
    toonScherm("spel");
    eindTijd = Date.now() + inst.minuten * 60 * 1000;
    clearInterval(timerId);
    tik();
    timerId = setInterval(tik, 200);
}

function stopSpel() {
    clearInterval(timerId);
    bezig = false;
    vergrendeld = true;
    stopSlepen();
}

function eindeSpel() {
    stopSpel();
    const record = leesRecord();
    const nieuwRecord = goed > record;
    if (nieuwRecord) bewaarRecord(goed);

    let tekst;
    if (goed >= inst.doel) {
        $("eindTitel").textContent = "Super gedaan!";
        tekst = "Je maakte <b>" + goed + "</b> splitsingen juist.<br>Het doel van " + inst.doel + " is gehaald!";
    } else {
        $("eindTitel").textContent = "Goed geprobeerd!";
        tekst = "Je maakte <b>" + goed + "</b> splitsingen juist.<br>Nog <b>" + (inst.doel - goed) +
            "</b> tot het doel van " + inst.doel + ". Probeer het nog eens!";
    }
    tekst += "<br>Aantal keer fout: " + fout;
    if (nieuwRecord && goed > 0) tekst += "<br><b>Nieuwe beste score!</b>";
    $("eindTekst").innerHTML = tekst;
    toonScherm("einde");
    window.lerenEffects?.complete($("einde"));
}

/* ---------- Knoppen ---------- */
$("startBtn").addEventListener("click", startSpel);
$("opnieuwBtn").addEventListener("click", startSpel);
$("instelBtn").addEventListener("click", () => {
    toonInstellingen();
    $("instelMelding").textContent = "";
    toonScherm("instellingen");
});
$("terugBtn").addEventListener("click", () => { updateStartscherm(); toonScherm("start"); });
$("menuBtn").addEventListener("click", () => { updateStartscherm(); toonScherm("start"); });
$("stopBtn").addEventListener("click", () => { stopSpel(); updateStartscherm(); toonScherm("start"); });

updateStartscherm();

