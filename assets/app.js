/* Projekt-Reiniger Pro — die Oberfläche (Stufe 1: einwerfen, Inventur, anzeigen · Stufe 2: entscheiden,
   saubere Kopie bauen, Nachprüfung). Alles Fremde wird nur als Text gesetzt (textContent), nie als HTML.
   Nichts wird gespeichert; die Zuordnung (Marke → alter Wert) lebt nur im Speicher, bis „Neu“. */
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

let ergebnis = null, laeuft = false, laeuftSchritt = "";
let eingeworfen = [], entscheidungen = null, gebaut = null;

/* pdf.js aus dem eigenen Ordner (nicht im Vorrat des Workers). */
window.addEventListener("load", () => {
  if (window.PrueferAnhang) window.PrueferAnhang.pfade({ pdfjs: new URL("vendor/pdfjs/", location.href).href });
  const fehlt = [];
  if (!window.SbkimPseudonym) fehlt.push("Modul 25");
  if (!window.PrueferAnhang) fehlt.push("Anhang-Prüfer");
  if (fehlt.length) { const p = $("#kern-fehlt"); p.hidden = false; p.textContent = "Es fehlt: " + fehlt.join(", ") + ". Was davon abhängt, heißt „ungeprüft“."; }
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

/* Ziehen und Loslassen: einzelne Dateien, ZIPs und ganze Ordner (Windows-Explorer, Finder, Dateimanager).
   Übersprungene Ordner (node_modules …) werden nicht geöffnet. */
let ziehZaehler = 0;
const ziehtDateien = (e) => !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files");
addEventListener("dragenter", (e) => { if (!ziehtDateien(e)) return; e.preventDefault(); if (!laeuft) { ziehZaehler++; $("#ziehen").hidden = false; } });
addEventListener("dragleave", (e) => { if (!ziehtDateien(e)) return; if (--ziehZaehler <= 0) { ziehZaehler = 0; $("#ziehen").hidden = true; } });
addEventListener("dragover", (e) => { if (ziehtDateien(e)) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; } });
addEventListener("drop", async (e) => {
  if (!ziehtDateien(e)) return;
  e.preventDefault(); ziehZaehler = 0; $("#ziehen").hidden = true;
  if (besetzt()) return;
  /* Die Einträge müssen sofort geholt werden — nach dem ersten await ist die Ablage leer. */
  const eintraege = Array.from(e.dataTransfer.items || []).filter((i) => i.kind === "file").map((i) => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  const dateien = Array.from(e.dataTransfer.files || []);
  const liste = eintraege.length ? await ausEintraegen(eintraege) : ausDateiListe(dateien);
  if (liste.length) starte(liste);
});

/** Geht gezogene Einträge durch (Dateien und Ordner, beliebig tief). Größe wird vorher gelesen, Inhalt erst bei Bedarf. */
async function ausEintraegen(eintraege) {
  const liste = [];
  const lies = (ordner) => new Promise((ok) => { const r = ordner.createReader(), alle = []; const weiter = () => r.readEntries((t) => { if (!t.length) ok(alle); else { alle.push(...t); weiter(); } }, () => ok(alle)); weiter(); });
  async function gehe(eintrag, pfad) {
    if (eintrag.isFile) {
      let f = null;
      try { f = await new Promise((ok, nein) => eintrag.file(ok, nein)); } catch { f = null; }
      if (!f) { liste.push({ pfad, groesse: 0, unlesbar: "beim Hineinziehen nicht lesbar — ungeprüft" }); return; }
      liste.push({ pfad, groesse: f.size, lesen: async () => new Uint8Array(await f.arrayBuffer()) });
    } else if (eintrag.isDirectory) {
      if (Kern.UEBERSPRINGEN.includes(eintrag.name)) { liste.push({ pfad: pfad + "/…", nichtGeoeffnet: true }); return; }
      for (const k of await lies(eintrag)) await gehe(k, pfad + "/" + k.name);
    }
  }
  for (const i of eintraege) await gehe(i, i.name);
  return liste;
}

/* ── Prüfen ──────────────────────────────────────────────── */
/* ── Fortschritt: immer eine Arbeit zur Zeit, und man sieht, woran sie gerade ist ── */
let uhr = null, beginn = 0;
function fortschrittAn(schritt) {
  laeuft = true; laeuftSchritt = schritt; beginn = Date.now();
  $("#fortschritt").hidden = false;
  melde(1, 0, "", schritt);
  clearInterval(uhr);
  uhr = setInterval(() => { $("#fortschritt-zeit").textContent = Math.round((Date.now() - beginn) / 1000) + " s"; }, 500);
}
function melde(nr, gesamt, pfad, schritt) {
  laeuftSchritt = schritt || laeuftSchritt;
  $("#fortschritt-schritt").textContent = laeuftSchritt;
  $("#fortschritt-zahl").textContent = gesamt ? nr + " von " + gesamt + " · " + Math.round(nr / gesamt * 100) + " %" : nr ? nr + ". Archiv" : "";
  $("#fortschritt-text").textContent = pfad || "";
  const b = $("#fortschritt-balken");
  if (gesamt) { b.max = gesamt; b.value = nr; } else b.removeAttribute("value");   /* ohne Gesamtzahl: wandernder Balken */
}
function fortschrittAus() {
  laeuft = false; clearInterval(uhr); uhr = null;
  $("#fortschritt").hidden = true; $("#fortschritt-zeit").textContent = "";
  const h = document.querySelector("[data-laeuft-hinweis]"); if (h) h.remove();
}
/* Wer etwas startet, während etwas läuft, bekommt eine Antwort statt Stille. */
function besetzt() {
  if (!laeuft) return false;
  let h = document.querySelector("[data-laeuft-hinweis]");
  if (!h) { h = el("span", { class: "laeuft-hinweis", "data-laeuft-hinweis": "" }); $("#fortschritt").append(h); }
  h.textContent = "Es läuft gerade: " + laeuftSchritt + ". Eine Arbeit zur Zeit — bitte warten, bis sie fertig ist.";
  return true;
}

async function starte(liste) {
  if (besetzt()) return;
  fortschrittAn("Einlesen");
  $("#einwurf").hidden = true; $("#arbeit").hidden = false; $("#neu").hidden = false;
  $("#zahlen").replaceChildren(); $("#hinweise").replaceChildren(); $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
  $("#reinigen").hidden = true;
  try {
    const ein = await Kern.einwerfen(liste, { fortschritt: melde });
    eingeworfen = ein.dateien;
    ergebnis = await Kern.pruefe(ein.dateien, { fortschritt: melde });
    ergebnis.quelle = ein.quelle;
    ergebnis.hinweise.unshift(...ein.hinweise);
  } catch (e) {
    ergebnis = { inventur: [], befunde: [], buendel: [], zahlen: { dateien: 0, gelesen: 0, uebersprungen: 0, markiert: 0, ungeprueft: 0, befunde: 0 },
      hinweise: ["Die Prüfung brach ab (" + (e && e.message || e) + "). Nichts ist geprüft."] };
  }
  fortschrittAus();
  entscheidungen = Kern.vorschlag(ergebnis); gebaut = null;
  zeigen();
}

function zuruecksetzen() {
  ergebnis = null; eingeworfen = []; entscheidungen = null; gebaut = null;
  $("#reinigen").replaceChildren(); $("#reinigen").hidden = true;
  $("#arbeit").hidden = true; $("#einwurf").hidden = false; $("#neu").hidden = true;
  $("#befunde").replaceChildren(); $("#inventur").replaceChildren();
}

/* ── Anzeigen ────────────────────────────────────────────── */
const SCHICHTEN = [
  ["hart", "Harte Angaben", "Namen, Mail, Telefon, IBAN, Datum, Schlüssel und Passwörter (Sage-Modul 25). Namen sind nur Vorschläge aus Anrede und Gruß."],
  ["meta", "Metadaten", "Verfasser, Copyright, Benutzernamen in Pfaden, Git-Namen, Metadaten in Bildern, PDF und Office."],
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
  $("#hinweise").replaceChildren(...ergebnis.hinweise.map((h) => el("p", {}, icon("warn"), el("span", { text: h }))));
  zeigeLeiste();

  const bef = $("#befunde");
  const nach = nachpruefungTeil();
  if (!ergebnis.buendel.length) {
    bef.replaceChildren(nach || "", leerBild(z.ungeprueft
      ? "Keine Funde in dem, was gelesen werden konnte. " + z.ungeprueft + " Datei(en) sind ungeprüft — das heißt nicht sauber."
      : "Keine Funde. Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles — bitte trotzdem selbst hinsehen."));
  } else {
    bef.replaceChildren(nach || "", el("p", { class: "wahl-legende", text: "Je Wert einmal entscheiden, er gilt für alle Stellen. Entfernen: überall steht eine Marke mit Zahl wie ⟦NAME-1⟧ — gleicher Wert, gleiche Nummer. Musterwert: ein erfundener Wert in derselben Form (für Stellen, an denen ein Programm das Format prüft)." }),
      ...SCHICHTEN.map(([s, titel, satz]) => {
      const liste = ergebnis.buendel.filter((b) => b.schicht === s);
      if (!liste.length) return null;
      return el("section", { class: "gruppe", "data-gruppe": s },
        el("h2", { text: titel + " (" + liste.reduce((n, b) => n + b.anzahl, 0) + ")" }),
        el("p", { text: satz }),
        ...liste.map(buendelKarte));
    }).filter(Boolean));
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
    wahlTeil(b),
    el("details", { class: "stellen" }, el("summary", { text: "Stellen zeigen" }), el("ol", {}, ...stellen)));
}

/* ── Entscheiden ─────────────────────────────────────────── */
function wahlTeil(b) {
  if (b.nurDatei || !entscheidungen) return el("p", { class: "wahl-datei", text: "Betrifft die ganze Datei — ob sie mitkommt, steht in der Inventur." });
  const w = entscheidungen.werte.find((x) => x.schluessel === Kern.wertSchluessel(b.wert));
  if (!w) return null;
  const sel = el("select", { "data-entscheid": w.schluessel, "aria-label": "Was mit diesem Wert geschieht" },
    ...Object.entries(Kern.WIE_NAME).map(([k, name]) => el("option", { value: k, text: name })));
  sel.value = w.wie;
  const eigen = el("input", { type: "text", "data-eigen": w.schluessel, placeholder: "eigener Wert", "aria-label": "Eigener Wert", autocomplete: "off", spellcheck: "false" });
  eigen.value = w.eigen || ""; eigen.hidden = w.wie !== "eigen";
  sel.addEventListener("change", () => {
    w.wie = sel.value; veraltet();
    for (const x of document.querySelectorAll("[data-entscheid]")) if (x.dataset.entscheid === w.schluessel) x.value = w.wie;
    for (const x of document.querySelectorAll("[data-eigen]")) if (x.dataset.eigen === w.schluessel) x.hidden = w.wie !== "eigen";
    zeigeLeiste();
  });
  eigen.addEventListener("input", () => {
    w.eigen = eigen.value; veraltet();
    for (const x of document.querySelectorAll("[data-eigen]")) if (x.dataset.eigen === w.schluessel && x !== eigen) x.value = w.eigen;
  });
  const frueher = w.frueherErsatz ? el("span", { class: "wahl-auch", text: "Musterwert aus einem früheren Reinigungslauf — steht deshalb auf „Behalten“." }) : null;
  const mehr = w.arten.length > 1 ? el("span", { class: "wahl-auch", text: "gilt auch für: " + w.arten.filter((a) => a !== b.art).map((a) => Kern.ART_NAME[a] || a).join(", ") }) : null;
  return el("div", { class: "wahl" }, el("label", {}, el("span", { text: "In der Kopie:" }), sel), eigen, mehr, frueher);
}

function dateiWahl(e) {
  const plan = entscheidungen && entscheidungen.dateien[e.pfad];
  if (!plan) return null;
  if (plan.moeglich.length === 1) return el("span", { class: "chip weg", "data-datei-fest": "", title: plan.grund, text: "kommt nicht mit" });
  const sel = el("select", { "data-datei": e.pfad, "aria-label": "In der Kopie" },
    ...plan.moeglich.map((k) => el("option", { value: k, text: e.art === "archiv" && k === "reinigen" ? "Neu packen" : Kern.DATEI_WIE_NAME[k] })));
  sel.value = plan.wie;
  sel.title = plan.grund;
  sel.addEventListener("change", () => { plan.wie = sel.value; veraltet(); zeigeLeiste(); });
  return el("label", { class: "datei-wahl" }, el("span", { text: "Kopie:" }), sel);
}

/* Strich-Icon aus der Sammlung in index.html (keine Emojis). */
function icon(name) {
  const ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg"), u = document.createElementNS(ns, "use");
  s.setAttribute("class", "ic"); s.setAttribute("aria-hidden", "true"); u.setAttribute("href", "#i-" + name); s.append(u);
  return s;
}

/* Lange Beschriftung, am Handy eine kurze (CSS wählt). */
function beschriftung(lang, kurz) { return [el("span", { class: "b-lang", text: lang }), el("span", { class: "b-kurz", text: kurz })]; }

/* Wer nach dem Bauen etwas ändert, bekommt einen Hinweis: die Kopie passt nicht mehr. */
function veraltet() { if (gebaut) gebaut.veraltet = true; }

/* ── Saubere Kopie bauen ─────────────────────────────────── */
function zeigeLeiste() {
  const l = $("#reinigen");
  if (!ergebnis || !entscheidungen || !ergebnis.inventur.length) { l.hidden = true; return; }
  l.hidden = false;
  const w = entscheidungen.werte, d = Object.values(entscheidungen.dateien);
  const n = (f) => w.filter(f).length;
  const satz = n((x) => x.wie !== "behalten") + " Wert(e) ersetzen, " + n((x) => x.wie === "behalten") + " behalten · " +
    d.filter((x) => x.wie !== "weglassen").length + " Datei(en) in die Kopie, " + d.filter((x) => x.wie === "weglassen").length + " weg (ohne .git)";
  const knopf = el("button", { type: "button", class: "knopf haupt-knopf", id: "bauen" }, icon("bauen"), gebaut ? "Neu bauen" : beschriftung("Saubere Kopie bauen", "Kopie bauen"));
  knopf.addEventListener("click", bauen);
  const teile = [el("p", { class: "leiste-satz", text: satz }), knopf];
  if (gebaut) {
    const { o, u } = offenZahlen();
    teile.push(el("p", { class: "leiste-satz " + (o ? "rot" : u ? "warn" : "gut"), "data-nachpruefung": o ? "offen" : u ? "ungeprueft" : "leer" },
      icon(gebaut.veraltet || o || u ? "warn" : "haken"),
      el("span", { text: gebaut.veraltet ? "Seit dem Bauen geändert — bitte neu bauen." : o ? "Nachprüfung: " + o + " offen" + (u ? ", " + u + " ungeprüft" : "") + " — siehe Funde"
        : u ? "Nachprüfung: nichts offen gefunden · " + u + " ungeprüft — siehe Funde" : "Nachprüfung: nichts offen gefunden (nicht garantiert alles)" })));
    /* Die Kopie geht in der Form hinaus, in der sie kam: Datei → Datei, ZIP → ZIP, tar.gz → tar.gz, Ordner → ZIP */
    const a = gebaut.aus, endung = (/(\.tar\.gz|\.[A-Za-z0-9]+)$/.exec(a.name) || [""])[0];
    const zip = el("button", { type: "button", class: "knopf", id: "laden-zip", title: a.name }, icon("laden"), beschriftung("Saubere Kopie (" + (endung || "Datei") + ")", "Kopie"));
    zip.addEventListener("click", () => laden(a.name, a.bytes, a.typ));
    const plan = el("button", { type: "button", class: "knopf", id: "laden-plan" }, icon("laden"), beschriftung("Stellenplan", "Plan"));
    plan.addEventListener("click", () => laden("STELLENPLAN.txt", gebaut.aus.beilagen[0].bytes, "text/plain"));
    const ber = el("button", { type: "button", class: "knopf", id: "laden-bericht" }, icon("laden"), "Bericht");
    ber.addEventListener("click", () => laden("BERICHT.txt", gebaut.aus.beilagen[2].bytes, "text/plain"));
    teile.push(zip, plan, ber);
    if (typeof window.showDirectoryPicker === "function" && /^zip-aus-(ordner|dateien)$/.test(a.form)) {
      const ord = el("button", { type: "button", class: "knopf", id: "in-ordner", title: "Als Ordner auf dieser Festplatte speichern (Windows, Chrome/Edge)" }, icon("ordner"), beschriftung("In Ordner speichern", "Ordner"));
      ord.addEventListener("click", () => inOrdnerSpeichern(ord));
      teile.push(ord);
    }
  }
  l.replaceChildren(...teile);
}

async function bauen() {
  if (!entscheidungen || besetzt()) return;
  fortschrittAn("Reinigen");
  const k = $("#bauen"); if (k) { k.disabled = true; k.replaceChildren(icon("bauen"), "Baue …"); }
  try {
    const rein = await Kern.reinige(eingeworfen, entscheidungen, { fortschritt: melde });
    const nach = await Kern.nachpruefe(rein, entscheidungen, { fortschritt: melde });
    melde(0, 0, "", "Ausgabe packen");
    const aus = await Kern.ausgabe(rein, nach);
    gebaut = { rein, nach, aus, veraltet: false };
  } catch (e) {
    gebaut = null;
    $("#hinweise").append(el("p", { text: "Bauen brach ab (" + (e && e.message || e) + "). Es gibt keine saubere Kopie." }));
  }
  fortschrittAus();
  zeigen();
}

function offenZahlen() {
  const alle = gebaut ? gebaut.nach.offen : [];
  return { o: alle.filter((x) => x.grund !== "ungeprueft").length, u: alle.filter((x) => x.grund === "ungeprueft").length };
}

function nachpruefungTeil() {
  if (!gebaut) return null;
  const r = gebaut.rein, o = gebaut.nach.offen, z = offenZahlen();
  const zeilen = o.map((x) => el("li", { "data-offen": x.grund, text: (x.pfad ? x.pfad + " — " : "") +
    (x.grund === "fund" && !x.nurDatei ? x.satz + " " + Array.from(new Set(x.stellen.map((s) => s.pfad + (s.zeile ? " · Zeile " + s.zeile : "")))).slice(0, 6).join(", ") : x.satz) }));
  return el("section", { class: "nachpruefung" + (z.o ? " rot" : z.u ? " warn" : ""), id: "nachpruefung" },
    el("h2", { text: z.o ? "Nachprüfung: " + z.o + " offen" + (z.u ? ", " + z.u + " ungeprüft" : "") : "Nachprüfung: nichts offen gefunden" + (z.u ? " · " + z.u + " ungeprüft" : "") }),
    el("p", { text: r.zahlen.dateien + " Datei(en) in der Kopie, " + r.zahlen.stellen + " Stelle(n) ersetzt, " + r.zahlen.weg + " weggelassen, .git nicht dabei" +
      (r.zahlen.archive ? ", " + r.zahlen.archive + " Archiv(e) neu gepackt" : "") + (r.zahlen.bilder ? ", " + r.zahlen.bilder + " Bild(er) ohne Metadaten" : "") + ". " +
      (z.o ? "Bitte die offenen Stellen entscheiden oder die Datei weglassen, dann neu bauen."
        : z.u ? "„Ungeprüft“ heißt nicht sauber: bitte selbst hinsehen oder die Datei weglassen. Text in Bildern prüft erst Stufe 4."
        : "Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles — bitte trotzdem selbst hinsehen.") }),
    o.length ? el("ul", {}, ...zeilen) : null,
    el("p", { class: "klein", text: "Die Zuordnung (welche Marke für welchen Wert steht) bleibt nur bis „Neu“ im Speicher. Aufbewahren kann sie erst der Tresor (Stufe 5)." }));
}

/* Ordner hinein → Ordner hinaus (nur wo der Browser Ordner schreiben darf: Chrome/Edge am PC).
   Es entsteht ein NEUER Unterordner „<name>-sauber“; nichts Vorhandenes wird überschrieben. */
async function inOrdnerSpeichern(knopf) {
  let ziel;
  try { ziel = await window.showDirectoryPicker({ mode: "readwrite" }); } catch { return; }
  knopf.disabled = true;
  try {
    const r = gebaut.rein, wurzeln = new Set(r.sauber.map((s) => s.pfad.split("/")[0]));
    const ein = wurzeln.size === 1 && r.sauber.every((s) => s.pfad.includes("/")) ? Array.from(wurzeln)[0] : "";
    let name = gebaut.aus.name.replace(/\.zip$/, ""), n = 1;
    for (;;) { try { await ziel.getDirectoryHandle(n === 1 ? name : name + " (" + n + ")"); n++; } catch { break; } }
    if (n > 1) name += " (" + n + ")";
    const wurzel = await ziel.getDirectoryHandle(name, { create: true });
    const dateien = [...r.sauber.map((s) => ({ pfad: ein ? s.pfad.slice(ein.length + 1) : s.pfad, bytes: s.bytes })), ...gebaut.aus.beilagen];
    for (const d of dateien) {
      const teile = d.pfad.split("/"); let o = wurzel;
      for (const t of teile.slice(0, -1)) o = await o.getDirectoryHandle(t, { create: true });
      const w = await (await o.getFileHandle(teile[teile.length - 1], { create: true })).createWritable();
      await w.write(d.bytes); await w.close();
    }
    $("#hinweise").append(el("p", {}, icon("haken"), el("span", { text: dateien.length + " Datei(en) in den Ordner „" + name + "“ geschrieben." })));
  } catch (e) {
    $("#hinweise").append(el("p", {}, icon("warn"), el("span", { text: "In den Ordner schreiben ging nicht (" + (e && e.message || e) + "). Die ZIP-Kopie geht weiter." })));
  }
  knopf.disabled = false;
}

function laden(name, bytes, typ) {
  const url = URL.createObjectURL(new Blob([bytes], { type: typ }));
  const a = el("a", { href: url, download: name, hidden: true });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
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
    if (e.art !== "ordner") { const w = dateiWahl(e); if (w) chips.push(w); }
    else chips.push(el("span", { class: "chip weg", text: "kommt nicht mit" }));
    return el("li", { "data-pfad": e.pfad },
      el("span", { class: "pfad", text: e.pfad }),
      el("div", { class: "zeile2" }, ...chips),
      e.ungeprueft ? el("span", { class: "offen" }, icon("warn"), el("span", { text: e.ungeprueft })) : null);
  });
  $("#inventur").replaceChildren(
    el("div", { class: "inventur-kopf" }, el("h2", { text: "Inventur (" + ergebnis.inventur.length + ")" }),
      el("label", {}, box, "nur Auffälliges")),
    el("p", { class: "stufen-legende", text: "Stufe 1 voll reinigen · Stufe 2 neu bauen · Stufe 3 nur prüfen (entfernen oder ersetzen). Text und SVG werden Stelle für Stelle gereinigt, ausgepackte Archive (ZIP, tar, tar.gz, gz) neu gepackt, PNG/JPEG/WebP ohne Metadaten übernommen. PDF und Office kommen nur unverändert mit, wenn sie ohne Funde gelesen wurden (neu gezeichnet wird ab Stufe 4 des Projekts)." }),
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
window.__reiniger = { starte, ausEintraegen, ergebnis: () => ergebnis, beispielProjekt, entscheidungen: () => entscheidungen, gebaut: () => gebaut, bauen };
