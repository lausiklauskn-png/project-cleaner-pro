/* Projekt-Reiniger Pro — die Oberfläche (Stufen 1 und 3: einwerfen, Inventur, anzeigen; nur lesen).
   Alles Fremde wird nur als Text gesetzt (textContent), nie als HTML. Nichts wird gespeichert. */
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
const gross = (n) => n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(1).replace(".", ",") + " KB" : (n / 1048576).toFixed(1).replace(".", ",") + " MB";

let ergebnis = null, laeuft = false;

/* pdf.js aus dem eigenen Ordner (nicht im Vorrat des Workers). */
window.addEventListener("load", () => {
  if (window.PrueferAnhang) window.PrueferAnhang.pfade({ pdfjs: new URL("vendor/pdfjs/", location.href).href });
  const fehlt = [];
  if (!window.SbkimPseudonym) fehlt.push("Modul 25");
  if (!window.PrueferAnhang) fehlt.push("Anhang-Prüfer");
  if (fehlt.length) { const p = $("#kern-fehlt"); p.hidden = false; p.textContent = "⚠ Es fehlt: " + fehlt.join(", ") + ". Was davon abhängt, heißt „ungeprüft“."; }
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
async function starte(liste) {
  if (laeuft) return;
  laeuft = true;
  $("#einwurf").hidden = true; $("#arbeit").hidden = false; $("#neu").hidden = false;
  $("#zahlen").replaceChildren(); $("#hinweise").replaceChildren(); $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
  const fs = $("#fortschritt"); fs.hidden = false;
  try {
    const ein = await Kern.einwerfen(liste);
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

function zuruecksetzen() {
  ergebnis = null;
  $("#arbeit").hidden = true; $("#einwurf").hidden = false; $("#neu").hidden = true;
  $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
}

/* ── Anzeigen ────────────────────────────────────────────── */
const SCHICHTEN = [
  ["hart", "Harte Angaben", "Namen, Mail, Telefon, IBAN, Datum, Schlüssel und Passwörter (Sage-Modul 25). Namen sind nur Vorschläge aus Anrede und Gruß."],
  ["meta", "Metadaten", "Verfasser, Copyright, Benutzernamen in Pfaden, Git-Namen, Metadaten in Bildern, PDF und Office."],
  ["gefuehlt", "Gefühlte Metadaten", "Angaben, die erst zusammen verraten, wer es ist: Orte, Hochschulen und Schulen, Firmen, Straße und PLZ, Kfz-Kennzeichen, Vornamen (auch in Datei- und Ordnernamen), Rechnernamen und feste Ordnerpfade. Gefunden über Wortlisten — Hinweise, keine Beweise."],
  ["auffaellig", "Auffälliges", "Programme, Makros, Verweise, versteckter Text und Anweisungen an eine KI."],
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
    chip(z.dateien, "Dateien"), chip(z.befunde, "Funde"), chip(z.markiert, "markiert", z.markiert > 0),
    chip(z.uebersprungen, "nicht gelesen"), chip(z.ungeprueft, "ungeprüft", z.ungeprueft > 0));
  $("#hinweise").replaceChildren(...ergebnis.hinweise.map((h) => el("p", { text: "⚠ " + h })));

  const bef = $("#befunde");
  if (!ergebnis.buendel.length) {
    bef.replaceChildren(leerBild(z.ungeprueft
      ? "Keine Funde in dem, was gelesen werden konnte. " + z.ungeprueft + " Datei(en) sind ungeprüft — das heißt nicht sauber."
      : "Keine Funde. Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles — bitte trotzdem selbst hinsehen."));
  } else {
    bef.replaceChildren(...SCHICHTEN.map(([s, titel, satz]) => {
      const liste = ergebnis.buendel.filter((b) => b.schicht === s);
      if (!liste.length) return null;
      return el("section", { class: "gruppe", "data-gruppe": s },
        el("h2", { text: titel + " (" + liste.reduce((n, b) => n + b.anzahl, 0) + ")" }),
        el("p", { text: satz }),
        ...liste.map(buendelKarte));
    }));
  }
  zeigeInventur();
}

function buendelKarte(b) {
  const stellen = b.stellen.slice(0, 200).map((s) => el("li", { text: s.pfad + (s.zeile ? " · Zeile " + s.zeile : "") + (s.stelle ? " · " + s.stelle : "") }));
  if (b.stellen.length > 200) stellen.push(el("li", { text: "… und " + (b.stellen.length - 200) + " weitere" }));
  const wertZeigen = b.schicht !== "auffaellig" || b.wert !== b.satz;
  return el("article", { class: "buendel", "data-schicht": b.schicht, "data-art": b.art },
    el("div", { class: "buendel-kopf" },
      el("span", { class: "art", text: b.artName }),
      b.vorschlag ? el("span", { class: "vorschlag", text: "Vorschlag" }) : null,
      el("span", { class: "anzahl", text: b.anzahl + "× in " + b.dateien + (b.dateien === 1 ? " Datei" : " Dateien") })),
    wertZeigen ? el("span", { class: "wert", "data-wert": "", text: b.wert }) : null,
    b.satz ? el("p", { class: "satz", text: b.satz }) : null,
    el("details", { class: "stellen" }, el("summary", { text: "Stellen zeigen" }), el("ol", {}, ...stellen)));
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
    return el("li", { "data-pfad": e.pfad },
      el("span", { class: "pfad", text: e.pfad }),
      el("div", { class: "zeile2" }, ...chips),
      e.ungeprueft ? el("span", { class: "offen", text: "⚠ " + e.ungeprueft }) : null);
  });
  $("#inventur").replaceChildren(
    el("div", { class: "inventur-kopf" }, el("h2", { text: "Inventur (" + ergebnis.inventur.length + ")" }),
      el("label", {}, box, "nur Auffälliges")),
    el("p", { class: "stufen-legende", text: "Stufe 1 voll reinigen · Stufe 2 neu bauen · Stufe 3 nur prüfen (entfernen oder ersetzen). Gereinigt wird ab Stufe 2 des Projekts — jetzt wird nur gelesen." }),
    el("ul", { class: "datei" }, ...zeilen));
}

for (const k of document.querySelectorAll(".reiter-knopf")) k.addEventListener("click", () => {
  $("#spalten").dataset.zeige = k.dataset.reiter;
  for (const x of document.querySelectorAll(".reiter-knopf")) x.setAttribute("aria-pressed", String(x === k));
});

/* Offline-Fähigkeit: nur der Code wird abgelegt, nie Daten. */
if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !new URLSearchParams(location.search).has("ohne-sw"))
  navigator.serviceWorker.register("sw.js").catch(() => {});

/* nur für die Proben */
window.__reiniger = { starte, ergebnis: () => ergebnis, beispielProjekt };
