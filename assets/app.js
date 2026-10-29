/* Projekt-Reiniger Pro — die Oberfläche (Stufen 1–4: einwerfen, Inventur, anzeigen, entscheiden, reinigen, neu zeichnen).
   Alles Fremde wird nur als Text gesetzt (textContent), nie als HTML. Nichts wird gespeichert;
   die saubere Kopie geht nur als Download hinaus. Das Original wird nie verändert. */
import * as Kern from "./reiniger-kern.js";
import { beispielProjekt } from "./beispiel.js";

const $ = (s) => document.querySelector(s);
function el(tag, attr, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attr || {})) {
    if (v == null || v === false) continue;
    if (k === "text") e.textContent = v; else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kinder.flat()) if (k != null) e.append(k);
  return e;
}
/* Strich-Symbole statt Emoji (Klaus 2026-10-28). Eigene Pfade, 24er-Raster, Farbe = Schrift. */
const IKONEN = {
  archiv: "M3 7h18v13H3z M3 7l2-4h14l2 4 M10 11h4",
  ordner: "M3 6h6l2 2h10v11H3z",
  datei: "M6 3h8l4 4v14H6z M14 3v4h4",
  probe: "M9 3h6 M10 3v6l-5 9a1 1 0 0 0 1 2h12a1 1 0 0 0 1-2l-5-9V3 M7.5 14h9",
  neu: "M6 3h8l4 4v14H6z M14 3v4h4 M12 11v6 M9 14h6",
  lesen: "M4 7V4h3 M17 4h3v3 M20 17v3h-3 M7 20H4v-3 M8 9h8 M8 12h8 M8 15h5",
  reinigen: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z",
  laden: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  teilen: "M12 15V4 M7 9l5-5 5 5 M5 14v6h14v-6",
  plus: "M12 5v14 M5 12h14",
  haken: "M5 12l5 5 9-10",
  warn: "M12 4l9 16H3z M12 10v4 M12 17v.5",
  auf: "M6 9l6 6 6-6",
  zu: "M9 6l6 6-6 6",
  weg: "M6 6l12 12 M18 6L6 18",
  zurueck: "M15 6l-6 6 6 6",
  weiter: "M9 6l6 6-6 6",
  hell: "M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  dunkel: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  auto: "M12 3a9 9 0 1 0 0 18z M12 3a9 9 0 0 1 0 18",
};
function ikon(name) {
  const NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg"), p = document.createElementNS(NS, "path");
  s.setAttribute("class", "ikon"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
  p.setAttribute("d", IKONEN[name]); s.append(p);
  return s;
}
/* Knopf mit Symbol und Wort */
function knopfMit(attr, name, wort) { return el("button", Object.assign({ type: "button" }, attr), ikon(name), wort); }
const warnZeile = (attr, satz) => el(attr.tag || "p", Object.assign({}, attr, { tag: null }), ikon("warn"), el("span", { text: satz }));
const anzahl = (n, eins, viele) => n + " " + (n === 1 ? eins : viele);
const gross = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(1).replace(".", ",") + " KB" : (n / 1048576).toFixed(1).replace(".", ",") + " MB";

let ergebnis = null, laeuft = false, eingeworfen = [], gereinigt = null, quelle = "", texterkennung = false;
const wahl = {};                 // buendelSchluessel → { weg, wert }
const dateiWahl = {};            // Pfad → neu | muster | weg | original (Dateien, die nicht Stelle für Stelle gereinigt werden)
let mappeBeilegen = false;       // Mustermappe in die saubere Kopie legen
const begriffe = [];             // selbst eingetragene Namen, die die Suche nicht erkannt hat

/* pdf.js aus dem eigenen Ordner (nicht im Vorrat des Workers). */
window.addEventListener("load", () => {
  if (window.PrueferAnhang) window.PrueferAnhang.pfade({ pdfjs: new URL("vendor/pdfjs/", location.href).href });
  const fehlt = [];
  if (!window.SbkimPseudonym) fehlt.push("Modul 25");
  if (!window.PrueferAnhang) fehlt.push("Anhang-Prüfer");
  if (fehlt.length) { const p = $("#kern-fehlt"); p.hidden = false; p.replaceChildren(ikon("warn"), " Es fehlt: " + fehlt.join(", ") + ". Was davon abhängt, heißt „ungeprüft“."); }
});

/* ── Einwerfen ───────────────────────────────────────────── */
function ausDateiListe(files) {
  return Array.from(files).map((f) => ({
    pfad: f.webkitRelativePath || f.name, groesse: f.size,
    lesen: async () => new Uint8Array(await f.arrayBuffer()),
  }));
}
$("#wahl-dateien").addEventListener("change", (e) => { const l = ausDateiListe(e.target.files); e.target.value = ""; if (l.length) starte(l); });
$("#wahl-ordner").addEventListener("change", (e) => { const l = ausDateiListe(e.target.files); e.target.value = ""; if (l.length) starte(l); });
$("#beispiel").addEventListener("click", async () => starte(await beispielProjekt()));
$("#neu").addEventListener("click", zuruecksetzen);

/* Ziehen und Loslassen, auch ganze Ordner. Übersprungene Ordner werden nicht geöffnet. */
let ziehZaehler = 0;
addEventListener("dragenter", (e) => { e.preventDefault(); if (!laeuft) { ziehZaehler++; $("#ziehen").hidden = false; } });
addEventListener("dragleave", () => { if (--ziehZaehler <= 0) { ziehZaehler = 0; $("#ziehen").hidden = true; } });
addEventListener("dragover", (e) => e.preventDefault());
addEventListener("drop", async (e) => {
  e.preventDefault(); ziehZaehler = 0; $("#ziehen").hidden = true;
  if (laeuft) return;
  const items = Array.from(e.dataTransfer.items || []).map((i) => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  if (!items.length) { const l = ausDateiListe(e.dataTransfer.files || []); if (l.length) starte(l); return; }
  const liste = [];
  const lies = (ordner) => new Promise((ok) => { const r = ordner.createReader(), alle = []; const weiter = () => r.readEntries((t) => { if (!t.length) ok(alle); else { alle.push(...t); weiter(); } }, () => ok(alle)); weiter(); });
  async function gehe(eintrag, pfad) {
    if (eintrag.isFile) {
      liste.push({ pfad, lesen: () => new Promise((ok, nein) => eintrag.file(async (f) => ok(new Uint8Array(await f.arrayBuffer())), nein)) });
    } else if (eintrag.isDirectory) {
      if (Kern.UEBERSPRINGEN.includes(eintrag.name)) { liste.push({ pfad: pfad + "/…", nichtGeoeffnet: true }); return; }
      for (const k of await lies(eintrag)) await gehe(k, pfad + "/" + k.name);
    }
  }
  for (const i of items) await gehe(i, i.name);
  if (liste.length) starte(liste);
});

/* ── Prüfen ──────────────────────────────────────────────── */
function quelleVon(liste) {
  if (liste.length === 1) return { ikon: /\.zip$/i.test(liste[0].pfad) ? "archiv" : "datei", name: liste[0].pfad.split("/").pop() };
  const ordner = new Set(liste.map((d) => String(d.pfad).split("/")[0]));
  return ordner.size === 1 && String(liste[0].pfad).includes("/") ? { ikon: "ordner", name: [...ordner][0] } : { ikon: "datei", name: liste.length + " Dateien" };
}

async function starte(liste) {
  if (laeuft) return;
  laeuft = true;
  quelle = quelleVon(liste);
  $("#einwurf").hidden = true; $("#arbeit").hidden = false; $("#neu").hidden = false;
  $("#zahlen").replaceChildren(); $("#hinweise").replaceChildren(); $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
  const fs = $("#fortschritt"); fs.hidden = false;
  try {
    const ein = await Kern.einwerfen(liste);
    eingeworfen = ein.dateien; gereinigt = null;
    for (const k of Object.keys(wahl)) delete wahl[k];
    for (const k of Object.keys(dateiWahl)) delete dateiWahl[k];
    mappeBeilegen = false; begriffe.length = 0; textCache.clear(); texterkennung = false;
    if (window.PrueferAnhang) window.PrueferAnhang.pfade({ tesseract: null });
    ergebnis = await Kern.pruefe(ein.dateien, {
      fortschritt: (nr, gesamt, pfad) => { $("#fortschritt-text").textContent = "Lese " + nr + " von " + gesamt + ": " + pfad; const b = $("#fortschritt-balken"); b.max = gesamt; b.value = nr; },
    });
    ergebnis.hinweise.unshift(...ein.hinweise);
  } catch (e) {
    ergebnis = { inventur: [], befunde: [], buendel: [], zahlen: { dateien: 0, gelesen: 0, uebersprungen: 0, markiert: 0, ungeprueft: 0, befunde: 0 },
      hinweise: ["Die Prüfung brach ab (" + (e && e.message || e) + "). Nichts ist geprüft."] };
  }
  fs.hidden = true; laeuft = false;
  zeigen();
}

/* Neu prüfen mit denselben Dateien (nach einem selbst eingetragenen Namen). Entscheidungen bleiben. */
async function nochmal() {
  if (laeuft) return;
  laeuft = true; gereinigt = null;
  const fs = $("#fortschritt"); fs.hidden = false;
  try { ergebnis = await Kern.pruefe(eingeworfen, { begriffe, texterkennung, fortschritt: (nr, g, p) => { $("#fortschritt-text").textContent = "Lese " + nr + " von " + g + ": " + p; } }); }
  finally { fs.hidden = true; laeuft = false; }
  zeigen();
}

function zuruecksetzen() {
  ergebnis = null; eingeworfen = []; gereinigt = null; textCache.clear(); schliesseAnsicht();
  $("#arbeit").hidden = true; $("#einwurf").hidden = false; $("#neu").hidden = true;
  $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
}

/* ── Anzeigen ────────────────────────────────────────────── */
const SCHICHTEN = [
  ["hart", "Personenbezogene Angaben", "Was direkt eine Person nennt oder Zugang gibt: Namen, Mail, Telefon, IBAN, Datum, Schlüssel und Passwörter, dazu selbst eingetragene Namen. Namen aus Anrede und Gruß sind nur Vorschläge. Tippe auf eine Stelle, um sie in der Datei zu sehen."],
  ["meta", "Metadaten", "Verfasser, Copyright, Benutzernamen in Pfaden, Git-Namen, Metadaten in Bildern, PDF und Office."],
  ["gefuehlt", "Gefühlte Metadaten", "Angaben, die erst zusammen verraten, wer es ist: Orte, Hochschulen und Schulen, Firmen, Straße und PLZ, Kfz-Kennzeichen, Vornamen (auch in Datei- und Ordnernamen), Rechnernamen und feste Ordnerpfade. Gefunden über Wortlisten — Hinweise, keine Beweise."],
  ["auffaellig", "Auffälliges", "Anweisungen an eine KI (auch in Text, Code, PDF und in den Bildpunkten eines Bildes), unsichtbare Zeichen, versteckter Text, Programme, Makros, PDF-Befehle und fremde Adressen in HTML. Geprüft mit denselben Kernen wie Sende-Prüfer, Auslieferungsprüfer und Workflow PDF. Kein Virenscanner. In Textdateien lässt sich die Zeile entfernen."],
];

function leerBild(satz) {
  return el("div", { class: "leer", "data-leer": "" },
    el("img", { src: "icons/kristall.webp", width: "640", height: "640", alt: "" }),
    el("p", { class: "wort", "aria-hidden": "true", text: "CLEANER" }),
    el("p", { text: satz }));
}

function zeigen() {
  const z = ergebnis.zahlen;
  const chip = (zahl, wort, warn) => el("li", { class: warn ? "warn" : null }, el("b", { text: String(zahl) }), el("span", { text: wort }));
  $("#zahlen").replaceChildren(
    el("li", { class: "quelle", "data-quelle": "", title: "Das wurde geprüft. Das Original bleibt unverändert." }, el("span", { text: "Geprüft:" }), ikon(quelle.ikon), el("span", { "data-quelle-name": "", text: quelle.name })),
    chip(z.dateien, "Dateien"), chip(z.befunde, "Funde"), chip(z.markiert, "markiert", z.markiert > 0),
    chip(z.uebersprungen, "nicht gelesen"), chip(z.ungeprueft, "ungeprüft", z.ungeprueft > 0));
  $("#hinweise").replaceChildren(...ergebnis.hinweise.map((h) => warnZeile({}, h)));

  const bef = $("#befunde");
  const ersetzbare = ergebnis.buendel.filter(Kern.ersetzbar).length;
  const plan = Kern.dateiPlan(ergebnis);
  const leiste = ergebnis.zahlen.dateien ? reinigenLeiste(ersetzbare, plan) : null;
  if (!ergebnis.buendel.length) {
    bef.replaceChildren(leerBild(z.ungeprueft
      ? "Keine Funde in dem, was gelesen werden konnte. " + z.ungeprueft + " Datei(en) sind ungeprüft — das heißt nicht sauber."
      : "Keine Funde. Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles — bitte trotzdem selbst hinsehen."),
      werkzeugLeiste(), plan.length ? dateiPlanKarte(plan) : null, leiste);
  } else {
    bef.replaceChildren(leiste, werkzeugLeiste(), ...SCHICHTEN.map(([s, titel, satz]) => {
      const liste = ergebnis.buendel.filter((b) => b.schicht === s);
      if (!liste.length) return null;
      return el("details", { class: "gruppe", "data-gruppe": s, open: true },
        el("summary", {}, el("h2", { text: titel + " (" + liste.reduce((n, b) => n + b.anzahl, 0) + ")" })),
        el("p", { text: satz }),
        ...liste.map(buendelKarte));
    }), plan.length ? dateiPlanKarte(plan) : null);
  }
  zeigeInventur();
}

function buendelKarte(b) {
  const werte = ergebnis.befunde.filter((x) => Kern.buendelSchluessel(x) === Kern.buendelSchluessel(b)).map((x) => String(x.wert));
  const stellen = b.stellen.slice(0, 200).map((s) => {
    const k = el("button", { type: "button", class: "stelle-knopf", "data-pfad": s.pfad, "data-zeile": s.zeile ? String(s.zeile) : null,
      text: s.pfad + (s.zeile ? " · Zeile " + s.zeile : "") + (s.stelle ? " · " + s.stelle : "") });
    k.addEventListener("click", () => oeffneAnsicht(s.pfad, s.zeile, werte));
    return el("li", {}, k, s.zeile ? el("code", { class: "auszug", "data-auszug": s.pfad + ":" + s.zeile }) : null);
  });
  if (b.stellen.length > 200) stellen.push(el("li", { text: "… und " + (b.stellen.length - 200) + " weitere" }));
  const det = el("details", { class: "stellen" }, el("summary", { text: "Stellen zeigen (" + b.stellen.length + ")" }), el("ol", {}, ...stellen));
  det.addEventListener("toggle", () => { if (det.open) auszuegeFuellen(det, werte); });
  const wertZeigen = b.schicht !== "auffaellig" || b.wert !== b.satz;
  return el("article", { class: "buendel", "data-schicht": b.schicht, "data-art": b.art },
    el("div", { class: "buendel-kopf" },
      el("span", { class: "art", text: b.artName }),
      b.vorschlag ? el("span", { class: "vorschlag", text: "Vorschlag" }) : null,
      el("span", { class: "anzahl", text: b.anzahl + "× in " + b.dateien + (b.dateien === 1 ? " Datei" : " Dateien") })),
    wertZeigen ? el("span", { class: "wert", "data-wert": "", text: b.wert }) : null,
    b.satz ? el("p", { class: "satz", text: b.satz }) : null,
    Kern.ersetzbar(b) ? wegWahl(b) : Kern.zeileEntfernbar(b) ? zeileWahl(b) : null,
    det);
}

/* ── Auf- und zuklappen, eigene Namen ─────────────────────────── */
function werkzeugLeiste() {
  const auf = knopfMit({ class: "knopf klein-knopf", id: "alle-auf" }, "auf", "Alle auf");
  const zu = knopfMit({ class: "knopf klein-knopf", id: "alle-zu" }, "zu", "Alle zu");
  const klappe = (offen) => { for (const d of document.querySelectorAll("#befunde details")) { if (d.open !== offen) d.open = offen; } };
  auf.addEventListener("click", () => klappe(true));
  zu.addEventListener("click", () => klappe(false));
  const feld = el("input", { type: "text", id: "begriff", placeholder: "Fehlender Name …", "aria-label": "Eigenen Namen oder Begriff eintragen" });
  const dazu = knopfMit({ class: "knopf klein-knopf", id: "begriff-dazu" }, "plus", "Suchen");
  const nimm = () => { const w = feld.value.trim(); if (w.length < 2 || begriffe.some((x) => x.toLowerCase() === w.toLowerCase())) return; begriffe.push(w); nochmal(); };
  dazu.addEventListener("click", nimm);
  feld.addEventListener("keydown", (e) => { if (e.key === "Enter") nimm(); });
  const chips = begriffe.map((w) => {
    const x = el("button", { type: "button", class: "chip begriff", "data-begriff": w, title: "nicht mehr suchen" }, w, ikon("weg"));
    x.addEventListener("click", () => { begriffe.splice(begriffe.indexOf(w), 1); nochmal(); });
    return x;
  });
  /* Texterkennung (Tesseract, 21 MB im eigenen Ordner) nur auf Knopfdruck — sie dauert je Bild bis zu 90 s. */
  const bilder = ergebnis.inventur.filter((e) => e.marken.some((m) => m.kennung === "FOTO" || m.kennung === "PDF")).length;
  let ocr = null;
  if (bilder && !texterkennung) {
    ocr = knopfMit({ class: "knopf klein-knopf", id: "texterkennung", title: "Liest sichtbaren Text in Bildern und gescannten PDF-Seiten (auf dem Gerät, langsam)" }, "lesen", "Text in Bildern lesen (" + bilder + ")");
    ocr.addEventListener("click", texterkennungAn);
  }
  return el("div", { class: "werkzeuge" },
    el("div", { class: "knoepfe" }, auf, zu, ocr),
    el("div", { class: "begriff-zeile" }, feld, dazu),
    chips.length ? el("div", { class: "zeile2" }, el("span", { class: "satz", text: "Selbst eingetragen:" }), ...chips) : null);
}

/* Texterkennung anschalten: Tesseract aus vendor/tesseract/ (byte-1:1 aus Workflow PDF Pro). Der Worker wird
   aus seiner Datei gestartet, nicht als blob: (die CSP erlaubt das nicht); er holt seine Sprachdaten selbst,
   nur vom eigenen Server. */
function skriptLaden(src) {
  return new Promise((ok, nein) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => nein(new Error(src + " kam nicht an")); document.head.append(s); });
}
async function texterkennungAn() {
  if (laeuft || !window.PrueferAnhang) return;
  const k = $("#texterkennung"); if (k) { k.disabled = true; k.lastChild.textContent = "Lade Texterkennung …"; }
  try {
    if (!window.Tesseract) await skriptLaden("vendor/tesseract/tesseract.min.js");
    const T = window.Tesseract;
    if (!T.__ohneBlob) {
      const roh = T.createWorker.bind(T);
      T.createWorker = (sprachen, oem, opt, cfg) => roh(sprachen, oem, Object.assign({}, opt, { workerBlobURL: false }), cfg);
      T.__ohneBlob = true;
    }
    window.PrueferAnhang.pfade({ tesseract: new URL("vendor/tesseract/", location.href).href });
    texterkennung = true;
  } catch (e) { melde("Die Texterkennung ließ sich nicht laden (" + (e && e.message || e) + "). Text in Bildern bleibt ungeprüft."); if (k) k.disabled = false; return; }
  await nochmal();
}

/* ── Datei ansehen: Original oder saubere Kopie, zur Stelle springen ─────── */
const textCache = new Map();
async function textVon(pfad) {
  if (textCache.has(pfad)) return textCache.get(pfad);
  const d = eingeworfen.find((x) => x.pfad === pfad);
  let t = null;
  try { const b = d && (d.bytes || (d.lesen ? await d.lesen() : null)); if (b) t = new TextDecoder("utf-8", { fatal: true }).decode(b.subarray(0, 2 * 1024 * 1024)); } catch { t = null; }
  textCache.set(pfad, t);
  return t;
}
function markiert(text, werte) {
  const w = Array.from(new Set(werte.filter((x) => x && x.length >= 2))).sort((a, b) => b.length - a.length);
  if (!w.length) return [document.createTextNode(text)];
  const re = new RegExp(w.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
  const aus = []; let i = 0, m;
  while ((m = re.exec(text))) { if (m.index > i) aus.push(document.createTextNode(text.slice(i, m.index))); aus.push(el("mark", { text: m[0] })); i = m.index + m[0].length; if (!m[0].length) re.lastIndex++; }
  if (i < text.length) aus.push(document.createTextNode(text.slice(i)));
  return aus;
}
async function auszuegeFuellen(det, werte) {
  for (const c of det.querySelectorAll("code[data-auszug]:empty")) {
    const [pfad, z] = [c.dataset.auszug.slice(0, c.dataset.auszug.lastIndexOf(":")), +c.dataset.auszug.slice(c.dataset.auszug.lastIndexOf(":") + 1)];
    const t = await textVon(pfad);
    if (t == null) { c.remove(); continue; }
    let zeile = (t.split("\n")[z - 1] || "").replace(/\t/g, "  ").trim();
    if (zeile.length > 240) zeile = zeile.slice(0, 240) + " …";
    c.replaceChildren(...markiert(zeile, werte));
  }
}

let ansichtZustand = null;
function schliesseAnsicht() { const a = $("#ansicht"); if (a) a.hidden = true; ansichtZustand = null; }
async function oeffneAnsicht(pfad, zeile, werte, fassung) {
  const a = $("#ansicht");
  if (!werte) werte = ergebnis.befunde.filter((x) => x.pfad === pfad && x.wert !== x.satz).map((x) => String(x.wert));
  const sauber = gereinigt && gereinigt.sauber.find((d) => d.von === pfad);
  fassung = fassung || (ansichtZustand && ansichtZustand.pfad === pfad ? ansichtZustand.fassung : "original");
  if (fassung === "sauber" && !sauber) fassung = "original";
  ansichtZustand = { pfad, zeile, werte, fassung };
  let text, marken, vorschau = null;
  if (fassung === "sauber") {
    if (sauber.neu || sauber.muster) vorschau = { bytes: sauber.bytes, pfad: sauber.pfad };
    else text = new TextDecoder().decode(sauber.bytes);
    marken = gereinigt.stellenplan.filter((s) => s.pfad === sauber.pfad).map((s) => s.ersatz);
  } else {
    text = await textVon(pfad); marken = werte;
    /* PDF und Bilder als Seite/Bild zeigen — auch wenn sich ihre Bytes als Text lesen ließen (kleine PDFs). */
    const e = ergebnis.inventur.find((x) => x.pfad === pfad);
    if (text == null || (e && /^(pdf|png|jpeg|webp|gif)$/.test(e.art))) {
      const d = eingeworfen.find((x) => x.pfad === pfad); const bb = d && (d.bytes || (d.lesen ? await d.lesen().catch(() => null) : null));
      if (bb && window.PrueferAnhang && /^(pdf|png|jpeg|webp|gif)$/.test(window.PrueferAnhang.artVon(bb))) { vorschau = { bytes: bb, pfad }; text = null; }
      else if (bb && text == null) vorschau = { bytes: bb, pfad };
    }
  }
  const reiter = (f, wort) => { const k = el("button", { type: "button", class: "reiter-knopf", "data-fassung": f, "aria-pressed": String(f === fassung), text: wort, disabled: f === "sauber" && !sauber });
    k.addEventListener("click", () => oeffneAnsicht(pfad, zeile, werte, f)); return k; };
  const zu = knopfMit({ class: "knopf", id: "ansicht-zu" }, "zurueck", "Zurück");
  zu.addEventListener("click", schliesseAnsicht);
  const kopf = el("div", { class: "ansicht-kopf" }, zu, el("span", { class: "pfad", text: fassung === "sauber" ? sauber.pfad : pfad }),
    el("div", { class: "ansicht-reiter" }, reiter("original", "Original"), reiter("sauber", gereinigt ? "Saubere Kopie" : "Saubere Kopie (erst reinigen)")));
  let koerper;
  const bildArt = vorschau && window.PrueferAnhang ? window.PrueferAnhang.artVon(vorschau.bytes) : "";
  if (vorschau && /^(png|jpeg|webp|gif|pdf)$/.test(bildArt)) {
    koerper = el("div", { class: "vorschau", "data-vorschau": fassung });
    if (fassung === "sauber") koerper.append(el("p", { class: "satz", text: sauber.muster ? "Ersetzt durch die Vorlage " + sauber.muster + " aus der Mustermappe." :
      "Neu gezeichnet: ohne Metadaten, graue Kästen an den Fundstellen (" + marken.length + "), Rauschen über die untersten Bits." }));
    vorschauFuellen(koerper, vorschau.bytes, bildArt);
  } else if (fassung === "sauber" && vorschau) {
    koerper = el("div", { class: "ansicht-leer" }, el("p", { text: sauber.muster ? "Ersetzt durch die Vorlage " + sauber.muster + " aus der Mustermappe." : "Neu gebaut als reiner Text (ohne Bilder, Formatierung, Kommentare). Ersetzte Stellen:" }),
      el("ul", {}, ...gereinigt.stellenplan.filter((s) => s.pfad === sauber.pfad).slice(0, 300).map((s) => el("li", { text: (s.stelle || "") + ": " + (s.weg === "eigen" ? "eigener Wert" : s.ersatz) + " (" + s.artName + ")" }))));
  } else if (text == null) {
    koerper = el("div", { class: "ansicht-leer" }, el("p", { text: "Diese Datei ist kein lesbarer Text (Bild, PDF, Office oder Binärdatei). Funde darin:" }),
      el("ul", {}, ...ergebnis.befunde.filter((x) => x.pfad === pfad).map((x) => el("li", { text: (Kern.ART_NAME[x.art] || x.art) + ": " + x.wert }))));
  } else {
    const zeilen = text.split("\n");
    const von = Math.max(0, (zeile || 1) - 1500), bis = Math.min(zeilen.length, von + 3000);
    koerper = el("ol", { class: "quelltext", start: String(von + 1) }, ...zeilen.slice(von, bis).map((z, i) =>
      el("li", { "data-nr": String(von + i + 1), class: von + i + 1 === zeile ? "ziel" : null }, ...markiert(z, marken))));
  }
  a.replaceChildren(kopf, el("div", { class: "ansicht-koerper" }, koerper));
  a.hidden = false;
  const ziel = a.querySelector("li.ziel") || a.querySelector("mark");
  if (ziel) ziel.scrollIntoView({ block: "center" });
}
addEventListener("keydown", (e) => { if (e.key === "Escape") schliesseAnsicht(); });

/* Vorschau eines Bildes oder einer PDF (bis 5 Seiten) — nur Bildpunkte, nichts wird ausgeführt. */
async function vorschauFuellen(ziel, bytes, art) {
  try {
    if (art !== "pdf") {
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/" + art }));
      const img = el("img", { src: url, alt: "Vorschau", class: "vorschau-bild" });
      img.addEventListener("load", () => setTimeout(() => URL.revokeObjectURL(url), 1000));
      ziel.append(img); return;
    }
    const L = await pdfjsBereit();
    const doc = await L.getDocument({ data: bytes.slice(0), isEvalSupported: false }).promise;
    for (let i = 1; i <= Math.min(5, doc.numPages); i++) {
      const pg = await doc.getPage(i), v1 = pg.getViewport({ scale: 1 }), vp = pg.getViewport({ scale: Math.min(2, 1400 / v1.width) });
      const c = el("canvas", { class: "vorschau-bild", width: String(Math.round(vp.width)), height: String(Math.round(vp.height)), "data-seite": String(i) });
      const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: g, viewport: vp }).promise;
      ziel.append(c);
    }
    if (doc.numPages > 5) ziel.append(el("p", { class: "satz", text: "… und " + (doc.numPages - 5) + " weitere Seite(n)" }));
    doc.destroy();
  } catch (e) { ziel.append(warnZeile({ class: "offen" }, "Vorschau ging nicht (" + (e && e.message || e) + ").")); }
}

/* ── Zeichner (Stufe 4): öffnet Seiten und Bilder, schreibt Etiketten, kodiert — der Kern entscheidet den Rest.
   Nur hier gibt es eine Leinwand; der Kern (reiniger-kern.js) kennt kein DOM. */
const BLATT_KANTE = 2400;          // lange Kante einer neu gezeichneten PDF-Seite in Bildpunkten (höchstens, ≈ 200 dpi bei A4)
const BILD_KANTE = 8000;           // größere Bilder werden verkleinert neu gezeichnet
async function pdfjsBereit() {
  if (!window.pdfjsLib) await skriptLaden("vendor/pdfjs/pdf.min.js");
  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs/pdf.worker.min.js", location.href).href;
  return window.pdfjsLib;
}
let ocrArbeiter = null;
function ocrBeenden() { if (ocrArbeiter) { ocrArbeiter.then((w) => w.terminate()).catch(() => {}); ocrArbeiter = null; } }
/* Wörter mit Kästen aus der Texterkennung (nur wenn sie eingeschaltet ist). */
async function woerterLesen(leinwand) {
  if (!texterkennung || !window.Tesseract) return null;
  const basis = new URL("vendor/tesseract/", location.href).href;
  if (!ocrArbeiter) ocrArbeiter = window.Tesseract.createWorker(["deu", "eng", "rus"], 1, { workerPath: basis + "worker.min.js", corePath: basis, langPath: basis + "lang", gzip: false, cacheMethod: "none" });
  const w = await ocrArbeiter;
  const f = Math.min(1, 3000 / Math.max(leinwand.width, leinwand.height));
  let q = leinwand;
  if (f < 1) { q = el("canvas", { width: String(Math.round(leinwand.width * f)), height: String(Math.round(leinwand.height * f)) }); q.getContext("2d").drawImage(leinwand, 0, 0, q.width, q.height); }
  const r = await w.recognize(q, {}, { blocks: true, text: false });
  const zeilen = [];
  for (const bl of (r.data && r.data.blocks) || []) for (const pa of bl.paragraphs || []) for (const li of pa.lines || []) {
    const z = (li.words || []).filter((x) => x.text && x.text.trim()).map((x) => ({ s: x.text, x0: x.bbox.x0 / f, y0: x.bbox.y0 / f, x1: x.bbox.x1 / f, y1: x.bbox.y1 / f }));
    if (z.length) zeilen.push(z);
  }
  return zeilen;
}
const Zeichner = {
  async oeffne(bytes, art) {
    if (art === "pdf") {
      const L = await pdfjsBereit();
      const doc = await L.getDocument({ data: bytes.slice(0), isEvalSupported: false }).promise;
      let letzte = null;
      return {
        anzahl: doc.numPages,
        async seite(i) {
          const pg = await doc.getPage(i + 1), v1 = pg.getViewport({ scale: 1 });
          const m = Math.min(2, BLATT_KANTE / Math.max(v1.width, v1.height)), vp = pg.getViewport({ scale: m });
          const c = el("canvas", { width: String(Math.round(vp.width)), height: String(Math.round(vp.height)) });
          const g = c.getContext("2d", { willReadFrequently: true }); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
          await pg.render({ canvasContext: g, viewport: vp }).promise;
          const tc = await pg.getTextContent(), stuecke = [];
          /* Wo beginnt jedes Zeichen? Mit der Schrift aus pdf.js gemessen und auf die Breite des Stücks geeicht —
             gleich breit geschätzt läge ein Kasten in „Mail: anna@…“ um ein Zeichen daneben. */
          const mess = el("canvas", { width: "8", height: "8" }).getContext("2d");
          const anteileVon = (it) => {
            const st = tc.styles && tc.styles[it.fontName], fam = (st && st.fontFamily) || "sans-serif", s = it.str;
            mess.font = "100px " + fam;
            const a = [0]; for (let i = 1; i <= s.length; i++) a.push(mess.measureText(s.slice(0, i)).width);
            const ges = a[a.length - 1];
            return ges > 0 ? a.map((x) => x / ges) : null;
          };
          for (const it of tc.items) {
            if (!it.str || !it.transform) continue;
            const T = it.transform, t = L.Util.transform(v1.transform, T), l = Math.hypot(T[0], T[1]) || 1;
            const ex = T[0] / l * it.width, ey = T[1] / l * it.width;
            const ecken = [[T[4], T[5]], [T[4] + ex, T[5] + ey], [T[4] + T[2], T[5] + T[3]], [T[4] + ex + T[2], T[5] + ey + T[3]]].map(([x, y]) => vp.convertToViewportPoint(x, y));
            const xs = ecken.map((e) => e[0]), ys = ecken.map((e) => e[1]), unter = Math.hypot(T[2], T[3]) * 0.25 * m;
            stuecke.push({ s: it.str, x: t[4], y: t[5], w: it.width, fh: Math.hypot(t[2], t[3]), anteile: anteileVon(it), schraeg: Math.abs(t[1]) > Math.abs(t[0]) * 0.02 || t[0] <= 0,
              kasten: [Math.min(...xs) - unter, Math.min(...ys) - unter, Math.max(...xs) + unter, Math.max(...ys) + unter] });
          }
          const mitText = stuecke.some((x) => x.s.trim());
          letzte = c;
          return { bild: g.getImageData(0, 0, c.width, c.height), massstab: m, breite: v1.width, hoehe: v1.height, stuecke, woerter: mitText ? null : await woerterLesen(c), leinwand: c };
        },
        freigeben() { if (letzte) { letzte.width = 0; letzte.height = 0; letzte = null; } },
        schliessen: () => doc.destroy(),
      };
    }
    const bm = await createImageBitmap(new Blob([bytes], { type: "image/" + art }));
    const f = Math.min(1, BILD_KANTE / Math.max(bm.width, bm.height));
    const c = el("canvas", { width: String(Math.max(1, Math.round(bm.width * f))), height: String(Math.max(1, Math.round(bm.height * f))) });
    const g = c.getContext("2d", { willReadFrequently: true });
    if (art === "jpeg") { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); }
    g.drawImage(bm, 0, 0, c.width, c.height); if (bm.close) bm.close();
    return {
      anzahl: 1,
      async seite() { return { bild: g.getImageData(0, 0, c.width, c.height), massstab: f, breite: c.width, hoehe: c.height, stuecke: null, woerter: await woerterLesen(c), leinwand: c }; },
      freigeben() { c.width = 0; c.height = 0; },
    };
  },
  /* Etikett in jeden Kasten (der Kern hat ihn schon grau gemalt). */
  async beschrifte(s, kaesten) {
    const c = s.leinwand, g = c.getContext("2d", { willReadFrequently: true });
    g.putImageData(s.bild, 0, 0);
    for (const k of kaesten) {
      const h = k.y1 - k.y0, w = k.x1 - k.x0, rand = h * 0.18;
      let gr = Math.max(5, h * 0.52);
      g.font = "600 " + gr + "px system-ui, sans-serif";
      const b = g.measureText(k.etikett).width;
      if (b > w - 2 * rand) { gr = Math.max(4, gr * (w - 2 * rand) / b); g.font = "600 " + gr + "px system-ui, sans-serif"; }
      g.save(); g.beginPath(); g.rect(k.x0, k.y0, w, h); g.clip();
      g.fillStyle = "#1e1e1e"; g.textBaseline = "middle"; g.fillText(k.etikett, k.x0 + rand, k.y0 + h / 2);
      g.restore();
    }
    s.bild = g.getImageData(0, 0, c.width, c.height);
  },
  async kodiere(s, art) {
    const c = s.leinwand; c.getContext("2d").putImageData(s.bild, 0, 0);
    const typ = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" }[art] || "image/png";
    const blob = await new Promise((ok) => c.toBlob(ok, typ, 0.9));
    const b = new Uint8Array(await blob.arrayBuffer());
    return { bytes: b, art: b[0] === 0x89 ? "png" : b[0] === 0xFF && b[1] === 0xD8 ? "jpeg" : b[8] === 0x57 && b[9] === 0x45 ? "webp" : art };
  },
};
window.Zeichner = Zeichner;

/* ── Entscheiden (Stufe 2): einmal für alle Stellen eines Bündels ─────── */
const WEG_TEXT = {
  auto: "Automatisch",
  marke: "Entfernen (Marke)",
  muster: "Musterwert",
  eigen: "Eigener Wert …",
  behalten: "Bewusst behalten",
};
function wegWahl(b) {
  const k = Kern.buendelSchluessel(b), jetzt = wahl[k] || { weg: "auto" };
  const sel = el("select", { class: "weg", "data-schluessel": k, "aria-label": "Was mit diesem Wert geschieht" },
    ...Kern.WEGE.map((w) => { const o = el("option", { value: w, text: WEG_TEXT[w] }); if (w === jetzt.weg) o.selected = true; return o; }));
  const eigen = el("input", { type: "text", class: "eigen", placeholder: "eigener Wert", "aria-label": "Eigener Wert", hidden: jetzt.weg !== "eigen" });
  eigen.value = jetzt.wert || "";
  const merke = () => { wahl[k] = { weg: sel.value, wert: eigen.value }; eigen.hidden = sel.value !== "eigen"; gereinigt = null; const e = $("#kopie-ergebnis"); if (e) e.replaceChildren(); };
  sel.addEventListener("change", merke); eigen.addEventListener("input", merke);
  return el("div", { class: "weg-zeile" }, sel, eigen);
}

function zeileWahl(b) {
  const k = Kern.buendelSchluessel(b), jetzt = (wahl[k] || { weg: "behalten" }).weg;
  const sel = el("select", { class: "weg", "data-schluessel": k, "data-zeile-wahl": "", "aria-label": "Was mit dieser Stelle geschieht" },
    ...[["behalten", "Nur melden (bleibt stehen)"], ["zeile", "Zeile entfernen"]].map(([w, t]) => { const o = el("option", { value: w, text: t }); if (w === jetzt) o.selected = true; return o; }));
  sel.addEventListener("change", () => { wahl[k] = { weg: sel.value }; gereinigt = null; const e = $("#kopie-ergebnis"); if (e) e.replaceChildren(); });
  return el("div", { class: "weg-zeile" }, sel);
}

const DATEI_WEG_TEXT = { neu: "Neu zeichnen", muster: "Durch Muster ersetzen", weg: "Weglassen", original: "Unverändert (NICHT gereinigt)" };
function dateiPlanKarte(plan) {
  const geaendert = () => { gereinigt = null; const e = $("#kopie-ergebnis"); if (e) e.replaceChildren(); };
  const zeilen = plan.map((p) => {
    const jetzt = dateiWahl[p.pfad] || p.vorgabe;
    const sel = el("select", { class: "weg", "data-datei-weg": p.pfad, "aria-label": "Was mit " + p.pfad.split("/").pop() + " geschieht" },
      ...p.wege.map((w) => { const o = el("option", { value: w, text: DATEI_WEG_TEXT[w] }); if (w === jetzt) o.selected = true; return o; }));
    sel.addEventListener("change", () => { if (sel.value === p.vorgabe) delete dateiWahl[p.pfad]; else dateiWahl[p.pfad] = sel.value; li.dataset.weg = sel.value; geaendert(); });
    const li = el("li", { "data-weg": jetzt }, el("span", { class: "pfad", text: p.pfad }), el("span", { class: "satz", text: p.grund }), el("div", { class: "weg-zeile" }, sel));
    return li;
  });
  const alle = el("select", { class: "weg", id: "alle-dateien", "aria-label": "Für alle Dateien wählen" },
    el("option", { value: "", text: "Für alle wählen …" }), ...["neu", "muster", "weg", "original"].map((w) => el("option", { value: w, text: DATEI_WEG_TEXT[w] + " (wo möglich)" })));
  alle.addEventListener("change", () => {
    if (!alle.value) return;
    for (const x of document.querySelectorAll("[data-datei-weg]")) { if ([...x.options].some((o) => o.value === alle.value)) { x.value = alle.value; x.dispatchEvent(new Event("change")); } }
    alle.value = "";
  });
  const neu = plan.filter((p) => p.vorgabe === "neu").length;
  return el("section", { class: "gruppe", "data-gruppe": "dateien" },
    el("h2", { text: "Dateien, die nicht Stelle für Stelle gereinigt werden (" + plan.length + ")" }),
    el("p", { text: "PDF und Bilder werden neu gezeichnet: gleiche Größe, gleicher Name, ohne Metadaten; wo ein Fund stand, sitzt ein grauer Kasten mit Etikett. Word, Excel und PowerPoint kommen als reiner Text neu (ohne Bilder und Formatierung). " +
      "Was sich nicht neu bauen lässt, bleibt weg oder bekommt eine leere Vorlage aus der Mustermappe. „Unverändert“ geht ungereinigt mit und steht so im Bericht." +
      (neu ? " Vorgabe: " + neu + "× neu zeichnen." : "") }),
    el("div", { class: "weg-zeile" }, alle),
    el("ul", { class: "datei-plan" }, ...zeilen));
}

function reinigenLeiste(ersetzbare, plan) {
  const knopf = knopfMit({ class: "knopf haupt-knopf", id: "reinigen" }, "reinigen", "Saubere Kopie bauen");
  knopf.addEventListener("click", reinigen);
  const mappe = el("input", { type: "checkbox", id: "mustermappe" });
  mappe.checked = mappeBeilegen;
  mappe.addEventListener("change", () => { mappeBeilegen = mappe.checked; gereinigt = null; const e = $("#kopie-ergebnis"); if (e) e.replaceChildren(); });
  const neu = plan.filter((p) => (dateiWahl[p.pfad] || p.vorgabe) === "neu").length, weg = plan.filter((p) => (dateiWahl[p.pfad] || p.vorgabe) === "weg").length;
  return el("section", { class: "reinigen", "data-reinigen": "" },
    el("p", { text: ersetzbare + " Werte werden ersetzt. Je Fund wählbar: „Automatisch“ setzt in Texten eine Marke (⟦NAME-1⟧) und im Code einen Musterwert, damit das Programm weiterläuft. .git geht nie mit. " +
      (neu ? anzahl(neu, "Datei wird", "Dateien werden") + " neu gezeichnet. " : "") + (weg ? anzahl(weg, "Datei bleibt", "Dateien bleiben") + " weg. " : "") + "Danach wird die Kopie noch einmal ganz durchsucht. Das Original bleibt unverändert." }),
    el("label", { class: "wahl" }, mappe, el("span", { text: "Mustermappe beilegen (leere Vorlagen und erfundene Beispiele, Ordner MUSTERMAPPE/)" })),
    knopf, el("div", { id: "kopie-ergebnis", "aria-live": "polite" }));
}

async function reinigen() {
  const knopf = $("#reinigen"), aus = $("#kopie-ergebnis");
  knopf.disabled = true; aus.replaceChildren(el("p", { text: "Reinige und prüfe nach …" }));
  try {
    gereinigt = await Kern.saubereKopie(eingeworfen, { ergebnis, wahl, dateiWahl: Object.assign({}, dateiWahl), mustermappe: mappeBeilegen },
      { begriffe, texterkennung, fortschritt: (nr, _g, pfad) => { aus.replaceChildren(el("p", { text: "Zeichne neu (" + nr + "): " + pfad })); } });
  } catch (e) {
    aus.replaceChildren(warnZeile({ class: "offen" }, "Reinigen brach ab (" + (e && e.message || e) + "). Es gibt keine saubere Kopie."));
    knopf.disabled = false; return;
  } finally { ocrBeenden(); }
  knopf.disabled = false;
  const n = gereinigt.nach, gut = !n.originalTreffer.length && !n.offen.length;
  const name = (eingeworfen[0] && eingeworfen[0].pfad.includes("/") ? eingeworfen[0].pfad.split("/")[0] : "projekt").replace(/[^\w.-]+/g, "_") || "projekt";
  const laden = (text, datei, bytes, typ) => {
    const k = knopfMit({ class: "knopf", "data-laden": datei }, "laden", text);
    k.addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([bytes], { type: typ }));
      const a = el("a", { href: url, download: datei }); document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });
    return k;
  };
  const beilage = (p) => gereinigt.beilagen.find((b) => b.pfad === p).bytes;
  const zipName = name + "-sauber.zip";
  let teilen = null;
  try {
    const f = new File([gereinigt.zip], zipName, { type: "application/zip" });
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      teilen = knopfMit({ class: "knopf", id: "teilen" }, "teilen", "Teilen");
      teilen.addEventListener("click", () => navigator.share({ files: [f], title: zipName }).catch(() => {}));
    }
  } catch { teilen = null; }
  aus.replaceChildren(el("div", { class: "kopie " + (gut ? "gut" : "warn"), "data-kopie": gut ? "sauber" : "offen" },
    el("h3", {}, ikon(gut ? "haken" : "warn"), el("span", { text: gut ? "Saubere Kopie fertig" : "Kopie fertig — die Nachprüfung meldet noch etwas" })),
    el("ul", {},
      el("li", { text: anzahl(gereinigt.bericht.stellen, "Stelle", "Stellen") + " ersetzt in " + anzahl(gereinigt.bericht.dateien, "Datei", "Dateien") }),
      gereinigt.bericht.neuGezeichnet.length ? el("li", { "data-neu-gezeichnet": String(gereinigt.bericht.neuGezeichnet.length), text: "Neu gebaut: " + anzahl(gereinigt.bericht.neuGezeichnet.length, "Datei", "Dateien") + " — " +
        gereinigt.bericht.neuGezeichnet.map((n) => n.pfad.split("/").pop() + " (" + (/^(docx|xlsx|pptx)$/.test(n.art) ? anzahl(n.kaesten, "Stelle", "Stellen") : anzahl(n.kaesten, "Kasten", "Kästen")) + (Object.keys(n.versteckt).length ? ", versteckter Text weg" : "") + ")").join(", ") }) : null,
      gereinigt.bericht.musterErsetzt.length ? el("li", { text: "Durch Muster ersetzt: " + gereinigt.bericht.musterErsetzt.length }) : null,
      n.ungeprueft ? el("li", { "data-nach-ungeprueft": String(n.ungeprueft), text: "Ungeprüft bei der Nachprüfung: " + n.ungeprueft + " (" + n.ungeprueftListe.map((u) => u.pfad.split("/").pop()).slice(0, 5).join(", ") + ") — meist Text im Bild ohne Texterkennung" }) : null,
      el("li", { "data-original": String(n.originalTreffer.length), text: "Originalwerte in der Kopie: " + n.originalTreffer.length + (n.originalTreffer.length ? " — in " + Array.from(new Set(n.originalTreffer.map((t) => t.pfad))).join(", ") : "") }),
      el("li", { "data-offen": String(n.offen.length), text: "Neue Funde bei der Nachprüfung: " + n.offen.length }),
      el("li", {}, (() => { const k = el("button", { type: "button", class: "stelle-knopf", id: "vorher-nachher", text: "Vorher / nachher ansehen" }); k.append(ikon("weiter"));
        k.addEventListener("click", () => { const d = gereinigt.sauber.find((x) => x.gereinigt && x.neu) || gereinigt.sauber.find((x) => x.gereinigt); if (d) oeffneAnsicht(d.von, (gereinigt.stellenplan.find((s) => s.pfad === d.pfad) || {}).zeile, null, "sauber"); }); return k; })()),
      el("li", { text: "Bewusst behalten: " + n.behalten + " · weggelassen: " + gereinigt.bericht.weggelassen.length + " · .git entfernt: " + gereinigt.bericht.gitDateien + " Dateien" })),
    n.offen.length ? el("ol", { class: "offen-liste" }, ...n.offen.slice(0, 50).map((b) => el("li", { text: b.artName + ": " + (b.wert !== b.satz ? b.wert : b.satz) + " (" + b.stellen.map((s) => s.pfad).slice(0, 3).join(", ") + ")" }))) : null,
    el("div", { class: "knoepfe" },
      laden("Saubere Kopie (ZIP)", zipName, gereinigt.zip, "application/zip"), teilen,
      laden("Stellenplan", Kern.STELLENPLAN_DATEI, beilage(Kern.STELLENPLAN_DATEI), "text/plain"),
      laden("Bericht", Kern.BERICHT_DATEI, beilage(Kern.BERICHT_DATEI), "text/plain")),
    el("p", { class: "klein", text: "Stellenplan und Bericht liegen auch im ZIP (dort stehen die Kästen der neu gezeichneten Blätter mit Seite und Lage). Sie nennen keine Werte. Die Zuordnung (welche Marke für welchen Wert steht) bleibt nur hier im Speicher — sie verschwindet mit „Neu“ (Tresor: Stufe 5)." })));
}

function zeigeInventur() {
  const nurMarkiert = $("#nur-markiert") ? $("#nur-markiert").checked : false;
  const box = el("input", { type: "checkbox", id: "nur-markiert" });
  box.checked = nurMarkiert;
  box.addEventListener("change", zeigeInventur);
  const zeilen = ergebnis.inventur.filter((e) => !nurMarkiert || e.marken.length || e.ungeprueft || e.befunde).map((e) => {
    const chips = [];
    if (e.art === "ordner") chips.push(el("span", { class: "chip", text: e.nichtGeoeffnet ? "nicht geöffnet" : e.uebersprungen + " Dateien nicht gelesen" }));
    else {
      chips.push(el("span", { class: "chip", text: gross(e.groesse) }));
      if (e.artName) chips.push(el("span", { class: "chip", text: e.artName }));
      chips.push(el("span", { class: "chip stufe" + e.stufe, "data-stufe": String(e.stufe), text: "Stufe " + e.stufe + " · " + e.stufeName }));
    }
    for (const m of e.marken) chips.push(el("span", { class: "chip marke", "data-marke": m.kennung, title: m.satz, text: Kern.MARKE_NAME[m.kennung] || m.kennung }));
    if (e.befunde) chips.push(el("span", { class: "chip funde", text: e.befunde + " Funde" }));
    let name;
    if (e.art !== "ordner") { name = el("button", { type: "button", class: "pfad pfad-knopf", text: e.pfad }); name.addEventListener("click", () => oeffneAnsicht(e.pfad)); }
    else name = el("span", { class: "pfad", text: e.pfad });
    return el("li", { "data-pfad": e.pfad },
      name,
      el("div", { class: "zeile2" }, ...chips),
      e.ungeprueft ? warnZeile({ tag: "span", class: "offen" }, e.ungeprueft) : null);
  });
  $("#inventur").replaceChildren(
    el("div", { class: "inventur-kopf" }, el("h2", { text: "Inventur (" + ergebnis.inventur.length + ")" }),
      el("label", {}, box, "nur Auffälliges")),
    el("p", { class: "stufen-legende", text: "Stufe 1 voll reinigen · Stufe 2 neu bauen (PDF und Bilder neu gezeichnet, Office als reiner Text) · Stufe 3 nur prüfen (weglassen, durch ein Muster ersetzen oder unverändert übernehmen)." }),
    el("ul", { class: "datei" }, ...zeilen));
}

for (const k of document.querySelectorAll(".reiter-knopf")) k.addEventListener("click", () => {
  $("#spalten").dataset.zeige = k.dataset.reiter;
  for (const x of document.querySelectorAll(".reiter-knopf")) x.setAttribute("aria-pressed", String(x === k));
});

/* ── Installieren und Aktualisieren (Klaus 2026-10-28) ─────────────────────
   Ablauf und Texte übernommen aus dem Auslieferungsprüfer (assets/installieren.js, dort seit 2026-09-30
   am Tablet getragen), hier mit Strich-Symbolen und ohne Inline-Stile (CSP). */
export const APP_FASSUNG = "6";   // = Nummer in CACHE_VERSION von sw.js (die Probe vergleicht)
let installEreignis = null;
function alsApp() {
  try { return matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: window-controls-overlay)").matches || matchMedia("(display-mode: minimal-ui)").matches || navigator.standalone === true; }
  catch { return false; }
}
/* Meldung in Absätzen (Leerzeile im Text = neuer Absatz), nie als Text mit doppelten Zeilenumbrüchen. */
function melde(text) { $("#meldung-text").replaceChildren(...String(text).split(/\n\s*\n/).map((t) => el("p", { text: t.trim() }))); $("#meldung").hidden = false; }
$("#meldung-zu").addEventListener("click", () => { $("#meldung").hidden = true; });
function installKnopf() { const k = $("#installieren"); k.hidden = alsApp(); k.dataset.lage = alsApp() ? "app" : installEreignis ? "angeboten" : "nicht-angeboten"; }
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEreignis = e; installKnopf(); });
addEventListener("appinstalled", () => { installEreignis = null; installKnopf(); melde("Installiert. Die App liegt jetzt auf dem Startbildschirm bzw. in der App-Liste."); });
try { matchMedia("(display-mode: standalone)").addEventListener("change", installKnopf); } catch { /* alt */ }
$("#installieren").addEventListener("click", () => {
  if (installEreignis) {
    const e = installEreignis; installEreignis = null;
    e.prompt();
    e.userChoice.then((w) => { melde(w && w.outcome === "accepted" ? "Installiert. Die App liegt jetzt auf dem Startbildschirm bzw. in der App-Liste." : "Nicht installiert — abgebrochen."); installKnopf(); }).catch(installKnopf);
    return;
  }
  melde("Der Browser bietet die Installation gerade nicht an.\n\n" +
    "Häufigster Grund: Chrome hält die App schon für installiert. Trägt das Symbol auf dem Startbildschirm ein kleines Chrome-Zeichen, ist es nur eine VERKNÜPFUNG (öffnet in Chrome), keine App.\n\n" +
    "So wird es eine App: Symbol lange drücken → Entfernen bzw. Deinstallieren, diese Seite neu laden, dann hier „Installieren“ tippen.\n\n" +
    "Sonst von Hand: Chrome ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“. Am Windows-PC: in der Adressleiste rechts das Symbol „App installieren“.\n\n" +
    "Bitte NICHT „Websitedaten löschen“: alle Apps unter dieser Adresse teilen sich einen Speicher.");
});
installKnopf();

/* Aktualisieren: neue Fassung beim Server erfragen, den Vorrat des Service-Workers leeren, neu laden.
   Es wird nur der Code-Vorrat gelöscht (Namen „reiniger-…“), nie Daten anderer Apps unter derselben Adresse. */
async function aktualisieren() {
  if (ergebnis && !confirm("Neu laden? Die laufende Prüfung und nicht heruntergeladene Ergebnisse gehen dabei verloren.")) return;
  const k = $("#aktualisieren"); k.disabled = true;
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) await reg.update().catch(() => {});
    if (typeof caches !== "undefined") { const n = await caches.keys(); await Promise.all(n.filter((x) => x.startsWith("reiniger-")).map((x) => caches.delete(x))); }
  } catch { /* trotzdem neu laden */ }
  location.reload();
}
$("#aktualisieren").addEventListener("click", aktualisieren);
$("#aktualisieren").title = "Neue Fassung holen (jetzt: Fassung " + APP_FASSUNG + ")";
/* Liegt eine neue Fassung bereit, wird der Knopf hervorgehoben. */
if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("controllerchange", () => { const k = $("#aktualisieren"); k.dataset.neu = ""; k.title = "Neue Fassung da — tippen zum Laden"; });

/* Hell oder dunkel (Klaus 2026-10-29): Automatisch (wie das Gerät) → Hell → Dunkel. Gemerkt wird nur diese Wahl. */
const THEMEN = [["", "auto", "Automatisch"], ["hell", "hell", "Hell"], ["dunkel", "dunkel", "Dunkel"]];
function themaZeigen() {
  const jetzt = document.documentElement.dataset.thema || "", [, sym, wort] = THEMEN.find((t) => t[0] === jetzt) || THEMEN[0];
  const k = $("#thema"); k.replaceChildren(ikon(sym), el("span", { class: "t", text: wort }));
  k.title = "Darstellung: " + wort + " — tippen zum Wechseln"; k.setAttribute("aria-label", "Darstellung: " + wort + ", wechseln"); k.dataset.thema = jetzt || "auto";
}
$("#thema").addEventListener("click", () => {
  const jetzt = document.documentElement.dataset.thema || "", neu = THEMEN[(THEMEN.findIndex((t) => t[0] === jetzt) + 1) % THEMEN.length][0];
  if (neu) document.documentElement.dataset.thema = neu; else delete document.documentElement.dataset.thema;
  try { if (neu) localStorage.setItem("reiniger-thema", neu); else localStorage.removeItem("reiniger-thema"); } catch { /* privates Fenster: gilt nur jetzt */ }
  themaZeigen();
});
themaZeigen();

/* Offline-Fähigkeit: nur der Code wird abgelegt, nie Daten. */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !new URLSearchParams(location.search).has("ohne-sw"))
  navigator.serviceWorker.register("sw.js").then((reg) => reg.update().catch(() => {})).catch(() => {});

/* nur für die Proben */
window.__reiniger = { oeffneAnsicht, APP_FASSUNG, starte, ergebnis: () => ergebnis, gereinigt: () => gereinigt, eingeworfen: () => eingeworfen, beispielProjekt, dateiWahl, Kern };
