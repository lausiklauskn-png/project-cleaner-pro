/* Projekt-Reiniger Pro — der Kern ohne Oberfläche (Stufe 1 lesen, Stufe 2 reinigen).
 *
 * Brief: docs/BRIEF_2026-10-28_projekt-reiniger-pro.md. Dieser Kern soll später
 * byte-1:1 in die Familienakte (Vite + React + TypeScript) wandern und dort per
 * SHA-256 gepinnt werden. Deshalb gilt hier:
 *   - reines JavaScript, ein ES-Modul, Typen in reiniger-kern.d.ts;
 *   - KEIN DOM, KEINE IndexedDB, KEIN Netz. Nichts wird ausgeführt;
 *   - die Prüfkerne (Sage-Modul 25, pruefer-anhang.js …) bringt der Aufrufer mit
 *     (`optionen.werkzeuge`), sonst liest der Kern sie von globalThis.
 *
 * Stufe 1 = Einwerfen, Inventur, harte Angaben und Metadaten (`pruefe` ändert
 * keine Datei). Stufe 2 = Entscheiden (`vorschlag`), Reinigen (`reinige`: Marken
 * und Musterwerte, saubere Kopie ohne .git, Stellenplan), Nachprüfung
 * (`nachpruefe`), Bericht und ZIP (`zipBauen`). Tresor kommt in Stufe 5.
 *
 * Grundsatz: was nicht gelesen werden konnte, heißt „ungeprüft“, nie „sauber“.
 */

export const KERN_FASSUNG = "2";

/* Ordner, die gar nicht erst gelesen werden (Abhängigkeiten, Build-Ergebnisse). */
export const UEBERSPRINGEN = [
  "node_modules", "bower_components", "jspm_packages", "dist", "build", "out", ".next", ".nuxt",
  ".svelte-kit", ".parcel-cache", ".cache", ".turbo", ".vercel", ".output", ".angular",
  "coverage", "target", "__pycache__", ".venv", "venv", ".gradle", ".tox", ".mypy_cache", ".pytest_cache",
];

export const GROESSE_MAX = 64 * 1024 * 1024;      // größer: nicht gelesen, ungeprüft
export const TEXT_MAX = 8 * 1024 * 1024;          // so viel Text wird je Datei durchsucht
export const GIT_OBJEKTE_MAX = 5000;              // lose Git-Objekte, die entpackt werden

/* Harte Angaben aus Modul 25 (Brief: Namen, Mail, Telefon, IBAN, Datum, Schlüssel). */
export const SORTEN_HART = ["SCHLUESSEL", "MAIL", "IBAN", "TELEFON", "DATUM"];

export const ART_NAME = {
  NAME: "Name (Vorschlag)", MAIL: "E-Mail", TELEFON: "Telefon", IBAN: "IBAN", DATUM: "Datum",
  SCHLUESSEL: "Schlüssel / Passwort", VERFASSER: "Verfasser", COPYRIGHT: "Copyright",
  BENUTZERPFAD: "Benutzername im Pfad", "GIT-NAME": "Git-Name", "GIT-ADRESSE": "Git-Adresse",
};

export const MARKE_NAME = {
  GIT: "Git-Geschichte", ENV: "Umgebung / Geheimnisse", SICHERUNG: "Sicherung", DATENBANK: "Datenbank",
  EXPORT: "Datenexport", FOTO: "Foto / Bild", PDF: "PDF", OFFICE: "Office-Dokument",
  SCHLUESSELDATEI: "Schlüsseldatei", IMPRESSUM: "Impressum", ARCHIV: "Archiv", PROGRAMM: "Programm",
};

export const STUFE_NAME = { 1: "voll reinigen", 2: "neu bauen", 3: "nur prüfen" };

const TEXT_ENDUNG = new Set(("txt md markdown rst adoc json jsonc json5 geojson csv tsv html htm xhtml xml svg eml mbox vcf ics " +
  "js mjs cjs ts tsx jsx mts cts css scss sass less styl vue svelte astro py pyi rb php java kt kts scala go rs c h cc cpp hpp " +
  "cs fs swift m mm dart lua pl r jl ex exs erl hs clj sh bash zsh fish ps1 psm1 bat cmd yml yaml toml ini cfg conf " +
  "env properties gradle sql log lock gitignore gitattributes gitmodules editorconfig npmrc nvmrc dockerignore " +
  "prettierrc eslintrc babelrc browserslistrc htaccess tex bib srt vtt").split(" "));
const BILD_ENDUNG = new Set("png jpg jpeg webp gif heic heif tif tiff bmp avif raw dng cr2 nef arw".split(" "));
const OFFICE_ENDUNG = new Set("doc docx docm xls xlsx xlsm ppt pptx pptm odt ods odp rtf pages numbers key".split(" "));
const STUFE2_ENDUNG = new Set("png jpg jpeg webp gif pdf doc docx docm xls xlsx xlsm ppt pptx pptm odt ods odp".split(" "));
const DB_ENDUNG = new Set("db sqlite sqlite3 db3 mdb accdb sdf realm mdf ldf frm ibd dump".split(" "));
const EXPORT_ENDUNG = new Set("csv tsv vcf ics mbox pst ost xlsx xls ods ndjson".split(" "));
const ARCHIV_ENDUNG = new Set("zip 7z rar tar gz tgz bz2 xz zst jar war apk ipa".split(" "));
const PROGRAMM_ENDUNG = new Set("exe dll msi com scr so dylib bin app dmg deb rpm".split(" "));
const SCHLUESSEL_ENDUNG = new Set("pem key p12 pfx jks keystore kdbx asc gpg pgp ovpn ppk".split(" "));

/* ── kleine Werkzeuge ─────────────────────────────────────────────────── */

function endungVon(pfad) {
  const n = String(pfad).split("/").pop().toLowerCase();
  if (/^\.[^.]+$/.test(n)) return n.slice(1);           // ".gitignore", ".env"
  const m = /\.([a-z0-9]{1,10})$/.exec(n);
  return m ? m[1] : "";
}
function dateiName(pfad) { return String(pfad).split("/").pop(); }
function normPfad(p) {
  return String(p || "").replace(/\\/g, "/").replace(/^\/+/, "").split("/")
    .filter((t) => t && t !== ".").join("/");
}
function zeileVon(text, pos) {
  let n = 1;
  for (let i = text.indexOf("\n"); i !== -1 && i < pos; i = text.indexOf("\n", i + 1)) n++;
  return n;
}
function zusammen(teile, n) {
  const aus = new Uint8Array(n); let p = 0;
  for (const t of teile) { aus.set(t, p); p += t.length; }
  return aus;
}
const u16 = (b, i) => b[i] | (b[i + 1] << 8);
const u32 = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;
const u64 = (b, i) => u32(b, i) + u32(b, i + 4) * 4294967296;

/* Entpacken mit Deckel: ein Archiv, das mehr ausgibt als angekündigt, wird abgebrochen. */
export async function entpacke(daten, format, max) {
  if (typeof DecompressionStream !== "function") throw new Error("Entpacken ist hier nicht möglich (DecompressionStream fehlt)");
  const ds = new DecompressionStream(format);
  const w = ds.writable.getWriter();
  w.write(daten).catch(() => {}); w.close().catch(() => {});
  const r = ds.readable.getReader(); const teile = []; let n = 0;
  for (;;) {
    const { done, value } = await r.read();
    if (done) break;
    n += value.length;
    if (n > max) { r.cancel().catch(() => {}); throw new Error("entpackt größer als angekündigt"); }
    teile.push(value);
  }
  return zusammen(teile, n);
}

/** Welcher Ordner im Pfad wird übersprungen? Gibt den Pfad bis dorthin zurück oder null. */
export function uebersprungen(pfad) {
  const t = normPfad(pfad).split("/");
  for (let i = 0; i < t.length - 1; i++) if (UEBERSPRINGEN.includes(t[i])) return t.slice(0, i + 1).join("/");
  return null;
}

/* ── ZIP lesen: nur das Inhaltsverzeichnis, jede Datei erst auf Abruf ───── */

/**
 * Liest das Inhaltsverzeichnis eines ZIP-Archivs. Entpackt wird eine Datei erst,
 * wenn ihr `lesen()` gerufen wird — Übersprungenes wird also nie entpackt.
 */
export function zipDateien(bytes, vorsilbe = "") {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const hinweise = [];
  let e = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (u32(b, i) === 0x06054b50) { e = i; break; }
  if (e < 0) return { dateien: [], hinweise: ["Das ist kein lesbares ZIP-Archiv (Inhaltsverzeichnis fehlt)."], kaputt: true };
  let anzahl = u16(b, e + 10), p = u32(b, e + 16);
  if (e >= 20 && u32(b, e - 20) === 0x07064b50) {               // ZIP64
    const z = u64(b, e - 12);
    if (u32(b, z) === 0x06064b50) { anzahl = u64(b, z + 32); p = u64(b, z + 48); }
  }
  const dateien = [];
  for (let k = 0; k < anzahl && p + 46 <= b.length; k++) {
    if (u32(b, p) !== 0x02014b50) { hinweise.push("Das Inhaltsverzeichnis bricht nach " + k + " Einträgen ab — der Rest ist ungeprüft."); break; }
    const flags = u16(b, p + 8), methode = u16(b, p + 10);
    let gepackt = u32(b, p + 20), roh = u32(b, p + 24), lokal = u32(b, p + 42);
    const nl = u16(b, p + 28), xl = u16(b, p + 30), cl = u16(b, p + 32);
    const nameB = b.subarray(p + 46, p + 46 + nl);
    let name;
    if (flags & 0x800) name = new TextDecoder("utf-8").decode(nameB);
    else { try { name = new TextDecoder("utf-8", { fatal: true }).decode(nameB); } catch { name = String.fromCharCode(...nameB); } }
    let x = p + 46 + nl; const xe = x + xl;                     // ZIP64-Zusatz
    while (x + 4 <= xe) {
      const id = u16(b, x), len = u16(b, x + 2); let q = x + 4;
      if (id === 1) {
        if (roh === 0xFFFFFFFF) { roh = u64(b, q); q += 8; }
        if (gepackt === 0xFFFFFFFF) { gepackt = u64(b, q); q += 8; }
        if (lokal === 0xFFFFFFFF) { lokal = u64(b, q); }
      }
      x += 4 + len;
    }
    p += 46 + nl + xl + cl;
    if (name.endsWith("/")) continue;
    const pfad = normPfad(vorsilbe + name);
    const eintrag = { pfad, groesse: roh };
    if (flags & 1) eintrag.unlesbar = "verschlüsselt im Archiv — nicht lesbar, ungeprüft";
    else if (methode !== 0 && methode !== 8) eintrag.unlesbar = "Packverfahren " + methode + " wird nicht gelesen — ungeprüft";
    else eintrag.lesen = async () => {
      if (u32(b, lokal) !== 0x04034b50) throw new Error("Eintrag im Archiv nicht gefunden");
      const start = lokal + 30 + u16(b, lokal + 26) + u16(b, lokal + 28);
      const daten = b.subarray(start, start + gepackt);
      if (methode === 0) return daten;
      return entpacke(daten, "deflate-raw", roh + 1);
    };
    dateien.push(eintrag);
  }
  return { dateien, hinweise };
}

/* ── Archive: ZIP, tar, tar.gz/.tgz, .gz — in jeder Tiefe ausgepackt ─────── */

export const ARCHIV_TIEFE_MAX = 4;                // so tief wird Archiv in Archiv ausgepackt
export const ARCHIV_DATEIEN_MAX = 50000;          // Deckel für alle ausgepackten Einträge zusammen

/** Welche Archivart wird ausgepackt? (ein Office-Dokument, jar, apk … ist zwar ein ZIP, wird aber nicht ausgepackt) */
export function archivArtVon(pfad, kopf) {
  const n = dateiName(pfad).toLowerCase();
  const pk = kopf && kopf[0] === 0x50 && kopf[1] === 0x4B;
  const gz = kopf && kopf[0] === 0x1F && kopf[1] === 0x8B;
  if (/\.zip$/.test(n)) return !kopf || pk ? "zip" : null;
  if (/\.(tar\.gz|tgz)$/.test(n)) return !kopf || gz ? "tgz" : null;
  if (/\.tar$/.test(n)) return "tar";
  if (/\.gz$/.test(n)) return !kopf || gz ? "gz" : null;
  return null;
}

function oktal(b, i, len) {
  let s = ""; for (let k = i; k < i + len && b[k]; k++) s += String.fromCharCode(b[k]);
  s = s.trim(); return s ? parseInt(s, 8) : 0;
}
function cstr(b, i, len) { let e = i; while (e < i + len && b[e]) e++; return new TextDecoder("utf-8").decode(b.subarray(i, e)); }

/** Liest ein tar (ustar, GNU-Langnamen, pax-Pfade). Nur Dateien; Verweise werden benannt, nicht verfolgt. */
export function tarDateien(bytes, vorsilbe = "") {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dateien = [], hinweise = [];
  let p = 0, langName = null, paxPfad = null, verweise = 0;
  while (p + 512 <= b.length) {
    if (b.subarray(p, p + 512).every((x) => x === 0)) break;
    const typ = String.fromCharCode(b[p + 156] || 48), groesse = oktal(b, p + 124, 12);
    let name = cstr(b, p, 100);
    const praefix = cstr(b, p + 257, 6) === "ustar" ? cstr(b, p + 345, 155) : "";
    if (praefix) name = praefix + "/" + name;
    const start = p + 512, ende = start + groesse;
    if (ende > b.length) { hinweise.push("Das tar-Archiv bricht mitten in „" + name + "“ ab — der Rest ist ungeprüft."); break; }
    const daten = b.subarray(start, ende);
    if (typ === "L") langName = cstr(daten, 0, daten.length);
    else if (typ === "x") { const m = /(?:^|\n)\d+ path=([^\n]*)\n/.exec(new TextDecoder().decode(daten)); paxPfad = m ? m[1] : null; }
    else if (typ === "0" || typ === "\0" || typ === "7") {
      const pfad = normPfad(vorsilbe + (paxPfad || langName || name));
      dateien.push({ pfad, groesse, bytes: daten });
      langName = paxPfad = null;
    } else { if (typ === "1" || typ === "2") verweise++; langName = paxPfad = null; }
    p = start + Math.ceil(groesse / 512) * 512;
  }
  if (verweise) hinweise.push(verweise + " Verweis(e) im tar-Archiv nicht verfolgt — sie kommen nicht mit.");
  return { dateien, hinweise };
}

/**
 * Einwerfen: Liste aus `{ pfad, bytes }` oder `{ pfad, groesse, lesen }`.
 * Archive (ZIP, tar, tar.gz, .gz) werden in jeder Tiefe ausgepackt — bis
 * ARCHIV_TIEFE_MAX. Liegt nur ein einziges ZIP da, wird es selbst zum Projekt
 * (`wurzelZip: false` schaltet das ab). Jede ausgepackte Datei trägt `archiv`
 * (den Pfad ihres Archivs), damit die saubere Kopie das Archiv neu packen kann;
 * das Archiv selbst steht als `{ pfad, ausgepackt, archivArt }` in der Liste.
 * Nichts in übersprungenen Ordnern und nichts in .git wird ausgepackt.
 */
export async function einwerfen(liste, optionen = {}) {
  const aus = [], hinweise = [];
  const quelle = quelleVon(liste);
  let zaehler = 0, zuviel = 0;
  const eine = liste.length === 1 && optionen.wurzelZip !== false;
  const melden = optionen.fortschritt || (() => {});
  let gemeldet = 0;
  async function auspacken(d, tiefe, archiv) {
    const pfad = normPfad(d.pfad);
    const art0 = !d.unlesbar && !d.nichtGeoeffnet && !uebersprungen(pfad) && !/(^|\/)\.git\//.test(pfad) ? archivArtVon(pfad) : null;
    if (!art0 || (d.groesse || 0) > GROESSE_MAX) { aus.push(Object.assign({}, d, { pfad, archiv: archiv || d.archiv, groesse: d.groesse != null ? d.groesse : d.bytes ? d.bytes.length : 0 })); return; }
    let bytes;
    try { bytes = d.bytes || (d.lesen ? await d.lesen() : null); } catch (e) { bytes = null; }
    if (!bytes) { aus.push(Object.assign({}, d, { pfad, archiv })); return; }
    bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    melden(++gemeldet, null, pfad, optionen.schritt || "Auspacken");
    await new Promise((ok) => setTimeout(ok, 0));
    const art = archivArtVon(pfad, bytes);
    const alsDatei = (grund) => { if (grund) hinweise.push(pfad + ": " + grund); aus.push({ pfad, bytes, groesse: bytes.length, archiv }); };
    if (!art) return alsDatei("");
    if (tiefe >= ARCHIV_TIEFE_MAX) return alsDatei("Archiv tiefer als " + ARCHIV_TIEFE_MAX + " Ebenen — nicht ausgepackt, ungeprüft.");
    const wurzel = tiefe === 0 && eine && art === "zip";
    const vorsilbe = wurzel ? "" : pfad + "/";
    let kinder = [], ihre = [];
    try {
      if (art === "zip") { const z = zipDateien(bytes, vorsilbe); if (z.kaputt) return alsDatei(z.hinweise[0]); kinder = z.dateien; ihre = z.hinweise; }
      else if (art === "tar") { const t = tarDateien(bytes, vorsilbe); kinder = t.dateien; ihre = t.hinweise; }
      else {
        const roh = await entpacke(bytes, "gzip", GROESSE_MAX);
        const innen = dateiName(pfad).replace(/\.(tgz)$/i, ".tar").replace(/\.gz$/i, "");
        if (art === "tgz" || /\.tar$/i.test(innen)) { const t = tarDateien(roh, vorsilbe); kinder = t.dateien; ihre = t.hinweise; }
        else kinder = [{ pfad: normPfad(vorsilbe + innen), groesse: roh.length, bytes: roh }];
      }
    } catch (e) { return alsDatei("nicht auspackbar (" + (e && e.message || e) + ") — ungeprüft."); }
    hinweise.push(...ihre.map((h) => pfad + ": " + h));
    if (!wurzel) aus.push({ pfad, ausgepackt: kinder.length, archivArt: art, groesse: bytes.length, archiv });
    for (const k of kinder) {
      if (++zaehler > ARCHIV_DATEIEN_MAX) { zuviel++; continue; }
      await auspacken(k, tiefe + 1, wurzel ? archiv : pfad);
    }
  }
  for (const d of liste) await auspacken(d, 0, d.archiv || null);
  if (zuviel) hinweise.push(zuviel + " Einträge über dem Deckel (" + ARCHIV_DATEIEN_MAX + ") nicht ausgepackt — ungeprüft.");
  return { dateien: aus, hinweise, quelle };
}

/**
 * Was kam herein? Danach richtet sich, in welcher Form die saubere Kopie hinausgeht:
 * eine Datei → dieselbe Datei · ZIP → ZIP · tar/tar.gz/gz → dieselbe Art · Ordner oder mehrere → ZIP.
 */
export function quelleVon(liste) {
  const pfade = liste.map((d) => normPfad(d.pfad));
  if (pfade.length === 1 && !pfade[0].includes("/")) return { form: archivArtVon(pfade[0]) || "datei", name: pfade[0] };
  const wurzeln = new Set(pfade.map((p) => p.split("/")[0]));
  if (wurzeln.size === 1 && pfade.every((p) => p.includes("/"))) return { form: "ordner", name: Array.from(wurzeln)[0] };
  return { form: "dateien", name: "projekt" };
}

/* ── Inventur: was ist das für eine Datei? ─────────────────────────────── */

/** Ordnet eine Datei ein: Art, Reinigungsstufe (1/2/3) und Marken. `art` = Dateikopf, wenn gelesen. */
export function einordnen(pfad, art) {
  pfad = normPfad(pfad);
  const name = dateiName(pfad).toLowerCase(), end = endungVon(pfad), teile = pfad.split("/");
  const marken = [];
  const marke = (k, satz) => { if (!marken.some((m) => m.kennung === k)) marken.push({ kennung: k, satz }); };
  if (teile.slice(0, -1).includes(".git") || name === ".git")
    marke("GIT", "Teil von .git — dort steckt die ganze Geschichte des Projekts, mit Namen und alten Ständen.");
  if (/^\.env(\..+)?$/.test(name) || end === "env" || /^(secrets?|credentials?)(\.|$)/.test(name) || name === ".npmrc" || name === ".netrc" || name === ".pypirc")
    marke("ENV", "Umgebungsdatei — hier stehen oft Schlüssel und Passwörter.");
  if (/\.(bak|old|orig|backup|bkp|sav|swp|swo|tmp)$/.test(name) || name.endsWith("~") || /(^|[-_. ])(backup|sicherung|kopie|copy)([-_. ]|$)/.test(name))
    marke("SICHERUNG", "Sicherung oder Kopie — oft ein alter Stand mit alten Daten.");
  if (DB_ENDUNG.has(end) || /\.sql$/.test(name) && /dump|backup|export|daten/.test(name))
    marke("DATENBANK", "Datenbank oder Datenbank-Auszug — lässt sich nur entfernen, nicht reinigen.");
  if (EXPORT_ENDUNG.has(end) || /(^|[-_.])(export|dump|kunden|customers|users|contacts|kontakte)([-_.]|$)/.test(name))
    marke("EXPORT", "Möglicher Datenexport (Tabelle, Kontakte, Termine, Postfach).");
  if (BILD_ENDUNG.has(end) || art === "png" || art === "jpeg" || art === "webp" || art === "gif")
    marke("FOTO", "Bild — kann Ort (GPS), Gerät, Zeitpunkt und sichtbaren Text tragen.");
  if (end === "pdf" || art === "pdf") marke("PDF", "PDF — Verfasser, Programm und Text stecken darin.");
  if (OFFICE_ENDUNG.has(end) || art === "docx" || art === "xlsx" || art === "pptx" || art === "odt")
    marke("OFFICE", "Office-Dokument — Verfasser, Änderungen und Kommentare stecken darin.");
  if (SCHLUESSEL_ENDUNG.has(end) || /^id_(rsa|dsa|ecdsa|ed25519)$/.test(name))
    marke("SCHLUESSELDATEI", "Schlüssel- oder Zertifikatsdatei.");
  if (/impressum|imprint|legal[-_]?notice|datenschutz|privacy/.test(name))
    marke("IMPRESSUM", "Impressum oder Datenschutz — hier stehen Name und Anschrift.");
  if (ARCHIV_ENDUNG.has(end) || art === "zip" && !OFFICE_ENDUNG.has(end))
    marke("ARCHIV", "Archiv im Projekt — ZIP, tar, tar.gz und .gz werden ausgepackt und einzeln geprüft; andere Archive nicht.");
  if (PROGRAMM_ENDUNG.has(end) || art === "programm") marke("PROGRAMM", "Programm — wird nie ausgeführt, nur benannt.");

  let stufe = 3;
  if (STUFE2_ENDUNG.has(end) || /^(png|jpeg|webp|gif|pdf|docx|xlsx|pptx|odt)$/.test(art || "")) stufe = 2;
  else if (TEXT_ENDUNG.has(end) || /^(text|svg|html)$/.test(art || "") || /^(dockerfile|makefile|license|readme|changelog|procfile|gemfile|rakefile|cname)$/i.test(name)) stufe = 1;
  if (marken.some((m) => m.kennung === "DATENBANK" && !/\.sql$/.test(name))) stufe = 3;
  return { stufe, stufeName: STUFE_NAME[stufe], marken };
}

/* ── Suchen ─────────────────────────────────────────────────────────────── */

function textAus(bytes) {
  const b = bytes.subarray(0, TEXT_MAX);
  try { return { text: new TextDecoder("utf-8", { fatal: true }).decode(b).replace(/^﻿/, ""), sicher: true }; }
  catch { return null; }
}
function istTextBytes(bytes) {
  if (!bytes.length) return true;
  const t = textAus(bytes.subarray(0, 65536));
  if (!t) return false;
  return !/[\x00-\x08\x0E-\x1A\x1C-\x1F]/.test(t.text.slice(0, 65536));
}

/** Lesbare Zeichenketten aus einer unbekannten Datei (UTF-8 und UTF-16LE), ab 6 Zeichen. */
export function zeichenketten(bytes, min = 6, max = 2 * 1024 * 1024) {
  const aus = []; let n = 0;
  let lauf = [];
  const druckbar = (c) => (c >= 0x20 && c < 0x7F) || c === 0x09 || c >= 0xC0;
  const fertig = (s) => { if (s.length >= min && n < max) { aus.push(s); n += s.length; } };
  for (let i = 0; i <= bytes.length; i++) {
    const c = bytes[i];
    if (i < bytes.length && (druckbar(c) || (c >= 0x80 && c < 0xC0 && lauf.length))) lauf.push(c);
    else { if (lauf.length >= min) { try { fertig(new TextDecoder("utf-8").decode(Uint8Array.from(lauf))); } catch { /* still */ } } lauf = []; }
  }
  let s = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const c = bytes[i] | (bytes[i + 1] << 8);
    if (c >= 0x20 && c < 0xD800 && c !== 0xFFFE && c !== 0xFFFF && (c < 0x7F || c >= 0xA0)) s += String.fromCharCode(c);
    else { fertig(s); s = ""; }
  }
  fertig(s);
  return aus.join("\n");
}

/* Metadaten, die der Kern selbst sucht (die übrigen liefert pruefer-anhang.js). */
const RE_BENUTZERPFAD = [
  /\b[A-Za-z]:[\\/]+(?:Users|Benutzer|Dokumente und Einstellungen|Documents and Settings)[\\/]+([^\\/\s"'<>|:*?]{2,64})/g,
  /(?:^|[\s"'`(=:])\/home\/([a-z_][a-z0-9_.-]{1,31})(?=[\/\s"'`)]|$)/gm,
  /(?:^|[\s"'`(=:])\/Users\/([^\/\s"'`<>]{2,64})(?=\/)/gm,
];
const BENUTZER_ALLGEMEIN = new Set(["user", "username", "benutzer", "public", "default", "all users", "runner", "node", "root", "admin", "administrator", "me", "you", "name", "%username%", "$user", "${user}", "<user>", "<name>", "ubuntu", "vagrant", "app"]);
const RE_COPYRIGHT = /(?:©|\(c\)|copyright)\s*(?:\(c\)\s*)?(?:\d{4}(?:\s*[-–]\s*(?:\d{4}|present|heute))?[,\s]*)?(?:by\s+)?([A-ZÄÖÜ][^\n<>{}"*|]{1,70}?)\s*(?:\.\s|\.?$|<|-->|\*\/|"|,\s*all rights|all rights|alle rechte|$)/gim;

function metaInText(pfad, text, melde) {
  for (const re of RE_BENUTZERPFAD) {
    re.lastIndex = 0; let m;
    while ((m = re.exec(text))) {
      const wer = m[1];
      if (BENUTZER_ALLGEMEIN.has(wer.toLowerCase()) || /^[%$<{]/.test(wer)) continue;
      melde({ schicht: "meta", art: "BENUTZERPFAD", wert: wer, pfad, zeile: zeileVon(text, m.index), satz: "Benutzername in einem Ordnerpfad — verrät den Rechner." });
    }
  }
  RE_COPYRIGHT.lastIndex = 0; let m;
  while ((m = RE_COPYRIGHT.exec(text))) {
    const wer = m[1].trim().replace(/[\s.,;:]+$/, "");
    if (wer.length < 2 || /^(the|der|die|das|holder|owner|notice|statement|year|jahr|\d+)\b/i.test(wer) || /\$\{|\{\{/.test(wer)) continue;
    melde({ schicht: "meta", art: "COPYRIGHT", wert: wer, pfad, zeile: zeileVon(text, m.index), satz: "Copyright-Vermerk mit Name." });
  }
}

function personAus(x) {
  if (!x) return [];
  if (typeof x === "string") {
    const m = /^\s*([^<(]+?)?\s*(?:<([^>]+)>)?\s*(?:\(([^)]+)\))?\s*$/.exec(x);
    return m ? [{ name: (m[1] || "").trim(), mail: m[2] || "", url: m[3] || "" }] : [{ name: x }];
  }
  if (Array.isArray(x)) return x.flatMap(personAus);
  if (typeof x === "object") return [{ name: x.name || "", mail: x.email || "", url: x.url || "" }];
  return [];
}
function packageJson(pfad, text, melde) {
  if (dateiName(pfad) !== "package.json" && dateiName(pfad) !== "composer.json") return;
  let j; try { j = JSON.parse(text); } catch { return; }
  const zeile = (s) => { const i = s ? text.indexOf(s) : -1; return i < 0 ? undefined : zeileVon(text, i); };
  for (const feld of ["author", "authors", "contributors", "maintainers"]) {
    for (const p of personAus(j[feld])) {
      if (p.name) melde({ schicht: "meta", art: "VERFASSER", wert: p.name, pfad, zeile: zeile(p.name), satz: "Feld „" + feld + "“ in " + dateiName(pfad) + "." });
    }
  }
}

/* Git: Namen aus config, logs, packed-refs, COMMIT_EDITMSG und losen Objekten. */
const RE_GIT_PERSON = /^(?:author|committer|tagger)\s+(.+?)\s+<([^>]*)>/gm;
const RE_GIT_LOG = /^[0-9a-f]{40}\s+[0-9a-f]{40}\s+(.+?)\s+<([^>]*)>\s+\d+/gm;
function gitInText(pfad, text, melde) {
  const p = (name, mail, idx) => {
    if (name) melde({ schicht: "meta", art: "GIT-NAME", wert: name.trim(), pfad, zeile: zeileVon(text, idx), satz: "Name aus der Git-Geschichte." });
    if (mail) melde({ schicht: "meta", art: "GIT-ADRESSE", wert: mail.trim(), pfad, zeile: zeileVon(text, idx), satz: "Mail-Adresse aus der Git-Geschichte." });
  };
  for (const re of [RE_GIT_PERSON, RE_GIT_LOG]) { re.lastIndex = 0; let m; while ((m = re.exec(text))) p(m[1], m[2], m.index); }
  if (/(^|\/)\.git\/config$/.test(pfad)) {
    const re = /^\s*(name|email)\s*=\s*(.+)$/gm; let m;
    while ((m = re.exec(text))) p(m[1] === "name" ? m[2] : "", m[1] === "email" ? m[2] : "", m.index);
    const ru = /^\s*url\s*=\s*(.+)$/gm;
    while ((m = ru.exec(text))) melde({ schicht: "meta", art: "GIT-ADRESSE", wert: m[1].trim(), pfad, zeile: zeileVon(text, m.index), satz: "Adresse des Git-Servers (verrät Konto oder Firma)." });
  }
}

function hartInText(M25, pfad, text, melde, quelle) {
  for (const f of M25.find(text, { types: SORTEN_HART })) {
    melde({ schicht: "hart", art: f.type, wert: f.value, pfad, zeile: quelle ? undefined : f.line, stelle: quelle, satz: "" });
  }
  for (const v of M25.suggestNames(text)) {
    melde({ schicht: "hart", art: "NAME", wert: v.name, pfad, zeile: quelle ? undefined : v.line, stelle: quelle, vorschlag: true,
      satz: v.grund === "anrede" ? "nach Herr/Frau" : v.grund === "grussformel" ? "aus der Grußformel" : "aus der Begrüßung" });
  }
}

const SCHICHT_VON_KENNUNG = (k) => /METADATEN(?!-KI)|HERKUNFT|ALTFASSUNG/.test(k) ? "meta" : "auffaellig";

/**
 * Prüft eine Liste von Dateien. Liest nur, ändert nichts.
 * @returns {Promise<{inventur, befunde, buendel, hinweise, zahlen}>}
 */
export async function pruefe(dateien, optionen = {}) {
  const w = optionen.werkzeuge || globalThis;
  const M25 = w.SbkimPseudonym, PA = w.PrueferAnhang;
  const fortschritt = optionen.fortschritt || (() => {});
  const inventur = [], befunde = [], hinweise = [];
  if (!M25 || typeof M25.find !== "function")
    hinweise.push("Modul 25 (harte Angaben) fehlt — Namen, Mail, Telefon, IBAN, Datum und Schlüssel sind UNGEPRÜFT, nicht sauber.");
  if (!PA || typeof PA.pruefe !== "function")
    hinweise.push("Der Anhang-Prüfer (pruefer-anhang.js) fehlt — Bilder, PDF und Office-Dateien sind UNGEPRÜFT, nicht sauber.");

  const liste = dateien.map((d) => Object.assign({}, d, { pfad: normPfad(d.pfad) })).sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);
  const sprung = new Map();          // übersprungener Ordner → { anzahl, groesse }
  let frueher = null;                // Stellenplan eines früheren Laufs (eine wieder eingeworfene Kopie)
  const markenMax = {};              // höchste Nummer je Marken-Art, die schon in der Eingabe steht
  const markenZaehlen = (text) => { const re = /⟦([A-Z][A-Z0-9_]*)-(\d+)⟧/g; let m; while ((m = re.exec(text))) markenMax[m[1]] = Math.max(markenMax[m[1]] || 0, +m[2]); };
  let gitPakete = 0, gitObjekte = 0, gitObjekteZuviel = 0;
  let nr = 0;
  for (const d of liste) {
    nr++;
    const ue = uebersprungen(d.pfad);
    if (ue) {
      const s = sprung.get(ue) || { anzahl: 0, groesse: 0, nichtGeoeffnet: false };
      if (d.nichtGeoeffnet) s.nichtGeoeffnet = true; else { s.anzahl++; s.groesse += d.groesse || 0; }
      sprung.set(ue, s);
      continue;
    }
    fortschritt(nr, liste.length, d.pfad, optionen.schritt || "Prüfen");
    if (nr % 25 === 0) await new Promise((ok) => setTimeout(ok, 0));
    const eintrag = { pfad: d.pfad, groesse: d.groesse || 0, art: "", artName: "", stufe: 3, stufeName: STUFE_NAME[3], marken: [], gelesen: false, ungeprueft: "", befunde: 0 };
    if (d.archiv) eintrag.archiv = d.archiv;
    inventur.push(eintrag);
    if (d.ausgepackt != null) {
      Object.assign(eintrag, einordnen(d.pfad, ""), { art: "archiv", archivArt: d.archivArt, artName: ({ zip: "ZIP", tar: "tar", tgz: "tar.gz", gz: "gz" }[d.archivArt] || "") + "-Archiv, ausgepackt (" + d.ausgepackt + " Datei" + (d.ausgepackt === 1 ? "" : "en") + ")", gelesen: true, ausgepackt: d.ausgepackt, stufe: 1, stufeName: "neu packen" });
      continue;
    }
    const melde = (b) => {
      if (!b.nurDatei && NUR_MARKEN.test(String(b.wert).trim())) return;   /* unsere eigene Marke ist kein Fund */
      befunde.push(b); eintrag.befunde++;
    };
    const imGit = /(^|\/)\.git\//.test(d.pfad);
    if (BEILAGE.test(d.pfad)) {                    /* Stellenplan/Bericht eines früheren Laufs: erkannt, nicht durchsucht */
      Object.assign(eintrag, { art: "beilage", artName: "Beilage eines früheren Reinigungslaufs", stufe: 0, stufeName: "wird ersetzt", gelesen: true });
      if (/stellenplan\.json$/.test(d.pfad)) {
        try {
          const b = d.bytes || (d.lesen ? await d.lesen() : null);
          const j = JSON.parse(new TextDecoder().decode(b));
          if (j && j.art === "projekt-reiniger-stellenplan") frueher = j;
        } catch { /* kein gültiger Stellenplan */ }
      }
      continue;
    }
    if (d.unlesbar) { eintrag.ungeprueft = d.unlesbar; Object.assign(eintrag, einordnen(d.pfad, "")); continue; }
    if ((d.groesse || 0) > GROESSE_MAX) { eintrag.ungeprueft = "zu groß zum Lesen — ungeprüft"; Object.assign(eintrag, einordnen(d.pfad, "")); continue; }
    let bytes;
    try { bytes = d.bytes || (d.lesen ? await d.lesen() : null); }
    catch (e) { eintrag.ungeprueft = "nicht lesbar (" + (e && e.message || e) + ") — ungeprüft"; Object.assign(eintrag, einordnen(d.pfad, "")); continue; }
    if (!bytes) { eintrag.ungeprueft = "kein Inhalt übergeben — ungeprüft"; Object.assign(eintrag, einordnen(d.pfad, "")); continue; }
    bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    eintrag.groesse = bytes.length; eintrag.gelesen = true;

    let art = PA ? PA.artVon(bytes) : (istTextBytes(bytes) ? "text" : "unbekannt");
    if (art === "unbekannt" && istTextBytes(bytes)) art = "text";

    /* .git: Pakete benennen, lose Objekte entpacken (dort steht die Geschichte). */
    if (imGit && /\/objects\/pack\/.+\.(pack|idx)$/.test(d.pfad)) {
      gitPakete++;
      Object.assign(eintrag, einordnen(d.pfad, ""), { art: "git-paket", artName: "Git-Paket" });
      eintrag.ungeprueft = "Git-Paket — in Stufe 1 nicht ausgepackt, ungeprüft";
      continue;
    }
    if (imGit && /\/objects\/[0-9a-f]{2}\/[0-9a-f]{38}$/.test(d.pfad)) {
      Object.assign(eintrag, einordnen(d.pfad, ""), { art: "git-objekt", artName: "Git-Objekt" });
      if (gitObjekte >= GIT_OBJEKTE_MAX) { gitObjekteZuviel++; eintrag.ungeprueft = "über dem Deckel für Git-Objekte — ungeprüft"; continue; }
      gitObjekte++;
      let roh;
      try { roh = await entpacke(bytes, "deflate", TEXT_MAX); } catch { eintrag.ungeprueft = "Git-Objekt nicht entpackbar — ungeprüft"; continue; }
      const nul = roh.indexOf(0), kopf = new TextDecoder().decode(roh.subarray(0, nul < 0 ? 0 : nul));
      const inhalt = roh.subarray(nul + 1), t = textAus(inhalt);
      eintrag.artName = "Git-Objekt (" + (kopf.split(" ")[0] || "?") + ")";
      if (t && istTextBytes(inhalt)) {
        if (M25) hartInText(M25, d.pfad, t.text, melde, "alter Stand in .git");
        gitInText(d.pfad, t.text, melde);
        metaInText(d.pfad, t.text, melde);
      } else if (/^tree /.test(kopf)) { /* Dateinamen, keine Personen */ }
      else eintrag.ungeprueft = "Binärinhalt in .git — nur Zeichenketten geprüft";
      continue;
    }

    const ord = einordnen(d.pfad, art);
    Object.assign(eintrag, ord, { art });
    const end = endungVon(d.pfad);
    const archivZu = ord.marken.some((m) => m.kennung === "ARCHIV") && !/^(docx|xlsx|pptx|odt)$/.test(art)
      ? "Archiv nicht ausgepackt (" + (end ? "." + end : "unbekannte Art") + ") — sein Inhalt ist ungeprüft" : "";

    if (art === "text" || art === "html" || (art === "svg" && !PA)) {
      eintrag.artName = art === "html" ? "HTML-Seite" : "Text";
      const t = textAus(bytes);
      if (!t) { eintrag.ungeprueft = "nicht als UTF-8 lesbar — ungeprüft"; continue; }
      eintrag.textlich = true;
      if (bytes.length > TEXT_MAX) eintrag.ungeprueft = "nur die ersten " + (TEXT_MAX >> 20) + " MB durchsucht, der Rest ist ungeprüft";
      markenZaehlen(t.text);
      if (M25) hartInText(M25, d.pfad, t.text, melde); else eintrag.ungeprueft = "harte Angaben ungeprüft (Modul 25 fehlt)";
      metaInText(d.pfad, t.text, melde);
      packageJson(d.pfad, t.text, melde);
      if (imGit || /(^|\/)\.git(config)?$/.test(d.pfad)) gitInText(d.pfad, t.text, melde);
      if (eintrag.stufe === 3) { eintrag.stufe = 1; eintrag.stufeName = STUFE_NAME[1]; }
      continue;
    }

    if (PA && art !== "unbekannt" && art !== "programm") {
      let r;
      try { r = await PA.pruefe(d.pfad, bytes); }
      catch (e) { eintrag.ungeprueft = "Prüfer stolperte (" + (e && e.message || e) + ") — ungeprüft"; continue; }
      eintrag.art = r.art; eintrag.artName = r.artName;
      Object.assign(eintrag, einordnen(d.pfad, r.art));
      if (r.art === "svg" && textAus(bytes)) eintrag.textlich = true;
      for (const x of r.befunde) {
        melde({ schicht: SCHICHT_VON_KENNUNG(x.kennung), art: x.kennung, wert: x.satz, pfad: d.pfad, satz: x.satz, nurDatei: true });
      }
      if (r.text) markenZaehlen(r.text);
      if (r.text && M25) hartInText(M25, d.pfad, r.text, melde, r.textQuelle === "bild" ? "Text im Bild" : r.seiten ? "Seitentext" : "Dokumenttext");
      if (r.text) metaInText(d.pfad, r.text, melde);
      const offen = [];
      if (r.textUngeprueft || r.ungeprueftSatz) offen.push(r.ungeprueftSatz || "Text ungeprüft");
      if (r.bildUngeprueft) offen.push("Text im Bild ungeprüft (Texterkennung kommt auf Knopfdruck, Stufe 4)");
      if (archivZu) offen.push(archivZu);
      eintrag.ungeprueft = Array.from(new Set(offen)).join(" · ");
      eintrag.hinweise = r.hinweise || [];
      continue;
    }

    /* unbekannt oder Programm: lesbare Zeichenketten herausziehen. Nichts wird ausgeführt. */
    eintrag.artName = art === "programm" ? "Programm" : "unbekannte Art";
    const s = zeichenketten(bytes);
    if (M25 && s) hartInText(M25, d.pfad, s, melde, "Zeichenkette in der Datei");
    if (s) metaInText(d.pfad, s, melde);
    if (imGit) gitInText(d.pfad, s, melde);
    eintrag.ungeprueft = archivZu || "nur lesbare Zeichenketten geprüft" + (end ? " (." + end + ")" : "") + " — der Rest ist ungeprüft";
  }

  for (const [ordner, s] of sprung) {
    inventur.push({ pfad: ordner + "/", groesse: s.groesse, art: "ordner", artName: "Ordner", stufe: 0, stufeName: "übersprungen",
      marken: [], gelesen: false, uebersprungen: s.anzahl, nichtGeoeffnet: s.nichtGeoeffnet, ungeprueft: "", befunde: 0 });
  }
  inventur.sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);
  if (gitPakete) hinweise.push(gitPakete + " Git-Paket-Datei(en) nicht ausgepackt — die Geschichte darin ist ungeprüft. Die saubere Kopie bekommt ohnehin kein .git.");
  if (gitObjekteZuviel) hinweise.push(gitObjekteZuviel + " Git-Objekte über dem Deckel (" + GIT_OBJEKTE_MAX + ") nicht geöffnet — ungeprüft.");

  const zahlen = {
    dateien: inventur.filter((e) => e.art !== "ordner" && e.art !== "archiv").length,
    gelesen: inventur.filter((e) => e.gelesen).length,
    uebersprungen: Array.from(sprung.values()).reduce((n, s) => n + s.anzahl, 0),
    markiert: inventur.filter((e) => e.marken.length).length,
    ungeprueft: inventur.filter((e) => e.ungeprueft).length,
    befunde: befunde.length,
  };
  if (frueher) {
    const h = frueher.herkunft || {};
    hinweise.push("Gereinigte Kopie erkannt: schon einmal gereinigt" + (h.erstellt ? " am " + String(h.erstellt).slice(0, 10) : "") +
      (h.form ? " (kam als " + (FORM_NAME[h.form] || h.form) + (h.name ? " „" + h.name + "“" : "") + ")" : "") + ", " + ((frueher.stellen || []).length) +
      " Stelle(n). Der alte Stellenplan wird in den neuen übernommen.");
  }
  for (const s of (frueher && frueher.stellen) || []) { const m = /^⟦([A-Z][A-Z0-9_]*)-(\d+)⟧$/.exec(s.ersatz || ""); if (m) markenMax[m[1]] = Math.max(markenMax[m[1]] || 0, +m[2]); }
  return { inventur, befunde, buendel: buendeln(befunde), hinweise, zahlen, frueher, markenMax };
}

const NUR_MARKEN = /^(?:⟦[A-Z][A-Z0-9_]*-\d+⟧[\s,;:<>()"']*)+$/;
const BEILAGE = /(^|\/)_reiniger\/(STELLENPLAN\.txt|stellenplan\.json|BERICHT\.txt)$/;
export const FORM_NAME = { datei: "einzelne Datei", zip: "ZIP", tar: "tar-Archiv", tgz: "tar.gz-Archiv", gz: "gz-Datei", ordner: "Ordner", dateien: "mehrere Dateien" };

/** Gleiche Funde bündeln: „Hamburg, 14×“. */
export function buendeln(befunde) {
  const karte = new Map();
  for (const b of befunde) {
    const k = b.schicht + "|" + b.art + "|" + String(b.wert).toLowerCase();
    let x = karte.get(k);
    if (!x) { x = { schicht: b.schicht, art: b.art, artName: ART_NAME[b.art] || b.art, wert: b.wert, vorschlag: !!b.vorschlag, nurDatei: !!b.nurDatei, satz: b.satz || "", anzahl: 0, dateien: 0, stellen: [] }; karte.set(k, x); }
    x.anzahl++;
    x.stellen.push({ pfad: b.pfad, zeile: b.zeile, stelle: b.stelle });
  }
  const reihe = { hart: 0, meta: 1, auffaellig: 2 };
  return Array.from(karte.values()).map((x) => { x.dateien = new Set(x.stellen.map((s) => s.pfad)).size; return x; })
    .sort((a, b) => reihe[a.schicht] - reihe[b.schicht] || b.anzahl - a.anzahl || (a.art < b.art ? -1 : a.art > b.art ? 1 : 0));
}

/* ══ Stufe 2 · Entscheiden, Reinigen, Stellenplan, Nachprüfung ══════════════════
 *
 * Entschieden wird je WERT, einmal für alle Stellen (ein Wert, der als Verfasser,
 * Copyright und Git-Name auftaucht, ist EINE Entscheidung):
 *   entfernen  überall eine Marke mit Zahl ⟦ART-n⟧ — in Text, Code, Konfiguration und
 *              Dateinamen (Klaus 2026-10-28: „einfacher durch Zahlenwerte … Doppelklammer“)
 *   muster     überall ein Musterwert (für Stellen, an denen ein Programm das Format prüft)
 *   eigen      überall ein eigener Wert
 *   behalten   bleibt stehen (bewusst)
 * Und je DATEI: reinigen (Text; ein ausgepacktes Archiv wird aus seinen gereinigten
 * Dateien neu gepackt), ohne Metadaten übernehmen (PNG, JPEG, WebP), unverändert
 * übernehmen oder weglassen. .git kommt nie mit; übersprungene Ordner auch nicht.
 *
 * Der Stellenplan nennt Datei, Zeile, Marke/Ersatz und Art — NIE den alten Wert.
 * Die Zuordnung (Marke → alter Wert) bleibt im Speicher; abgelegt wird sie erst
 * im Tresor (Stufe 5).
 */

export const WIE_NAME = { entfernen: "Entfernen", muster: "Musterwert", eigen: "Eigener Wert", behalten: "Behalten" };
export const DATEI_WIE_NAME = { reinigen: "Reinigen", metadaten: "Ohne Metadaten übernehmen", uebernehmen: "Unverändert übernehmen", weglassen: "Weglassen" };
export const MARKE_ART_NAME = { NAME: "Name", MAIL: "E-Mail", TELEFON: "Telefon", IBAN: "IBAN", DATUM: "Datum", SCHLUESSEL: "Schlüssel / Passwort",
  BENUTZER: "Benutzername", ADRESSE: "Adresse (Server)", WERT: "Wert" };

/* Dateien, in denen eine Marke das Programm brechen könnte: hier steht ein Musterwert. */
const CODE_ENDUNG = new Set(("js mjs cjs ts tsx jsx mts cts vue svelte astro py pyi rb php java kt kts scala go rs c h cc cpp hpp " +
  "cs fs swift m mm dart lua pl r jl ex exs erl hs clj sh bash zsh fish ps1 psm1 bat cmd css scss sass less styl sql gradle " +
  "json jsonc json5 yml yaml toml ini cfg conf env properties lock npmrc").split(" "));
/* Dateimarken, die standardmäßig nicht mitkommen (Klaus entscheidet anders, wenn er will). */
const WEG_MARKEN = new Set(["ENV", "SICHERUNG", "DATENBANK", "EXPORT", "SCHLUESSELDATEI"]);
const MARKE_REIHE = ["SCHLUESSEL", "MAIL", "IBAN", "TELEFON", "DATUM", "ADRESSE", "NAME", "BENUTZER", "WERT"];

export function wertSchluessel(wert) { return String(wert).trim().toLowerCase(); }
export function istCode(pfad) { return CODE_ENDUNG.has(endungVon(pfad)); }

function markeArtVon(art, wert) {
  if (art === "NAME" || art === "VERFASSER" || art === "COPYRIGHT" || art === "GIT-NAME") return "NAME";
  if (art === "BENUTZERPFAD") return "BENUTZER";
  if (art === "GIT-ADRESSE") return /@/.test(wert) && !/:\/\//.test(wert) ? "MAIL" : "ADRESSE";
  if (MARKE_REIHE.includes(art)) return art;
  return "WERT";
}

/** Musterwerte: unverfänglich, gleiche Form wie das Original, wo es geht. */
export function musterwert(marke, n, alt) {
  alt = String(alt || "");
  switch (marke) {
    case "NAME": return ["Max Mustermann", "Erika Musterfrau", "Jonas Beispiel", "Lea Muster"][n - 1] || "Person Muster " + n;
    case "MAIL": return "muster" + n + "@beispiel.example";
    case "TELEFON": return "+49 000 " + String(1000000 + n);
    case "IBAN": { const roh = "DE00" + String(n).padStart(18, "0"); return /\s/.test(alt) ? roh.replace(/(.{4})(?=.)/g, "$1 ") : roh; }
    case "DATUM":
      if (/^\d{4}-\d{2}-\d{2}/.test(alt)) return "2000-01-01";
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(alt)) return "01/01/2000";
      if (/^\d{1,2}\.\d{1,2}\.\d{2,4}$/.test(alt)) return "01.01.2000";
      return "1. Januar 2000";
    case "SCHLUESSEL": return "MUSTER-SCHLUESSEL-" + n;
    case "BENUTZER": return n === 1 ? "benutzer" : "benutzer" + n;
    case "ADRESSE": return "https://git.beispiel.example/muster/projekt" + (n > 1 ? n : "") + ".git";
    default: return "Musterwert " + n;
  }
}

/**
 * Vorschlag für die Entscheidungen aus dem Prüfergebnis. Werte: entfernen;
 * Dateien: Text reinigen, Riskantes weglassen, Unbedenkliches übernehmen.
 * Die Oberfläche ändert nur `wie` (und `eigen`).
 */
export function vorschlag(ergebnis) {
  const werte = [], karte = new Map();
  /* Ersatzwerte früherer Läufe (eine wieder eingeworfene Kopie): das sind unsere Musterwerte, keine Funde. */
  const frueherErsatz = new Set();
  const sammle = (f) => { if (!f) return; for (const s of f.stellen || []) if (s.ersatz) frueherErsatz.add(wertSchluessel(s.ersatz)); for (const g of f.frueher || []) sammle(g); };
  sammle(ergebnis.frueher);
  for (const b of ergebnis.buendel) {
    if (b.nurDatei || !b.wert || String(b.wert).trim().length < 2) continue;
    const k = wertSchluessel(b.wert);
    let w = karte.get(k);
    if (!w) { w = { schluessel: k, wert: String(b.wert).trim(), arten: [], marke: "WERT", vorschlag: true, anzahl: 0, wie: frueherErsatz.has(k) ? "behalten" : "entfernen", eigen: "" }; if (frueherErsatz.has(k)) w.frueherErsatz = true; karte.set(k, w); werte.push(w); }
    if (!w.arten.includes(b.art)) w.arten.push(b.art);
    if (!b.vorschlag) w.vorschlag = false;
    w.anzahl += b.anzahl;
    const m = markeArtVon(b.art, b.wert);
    if (MARKE_REIHE.indexOf(m) < MARKE_REIHE.indexOf(w.marke)) w.marke = m;
  }
  const dateien = {};
  const hartIn = new Set(ergebnis.befunde.filter((b) => b.schicht === "hart").map((b) => b.pfad));
  for (const e of ergebnis.inventur) {
    if (e.art === "ordner") continue;
    if (e.art === "beilage") { dateien[e.pfad] = { wie: "weglassen", moeglich: ["weglassen"], art: e.artName, grund: "Stellenplan oder Bericht eines früheren Laufs — wird durch den neuen ersetzt (der alte Stellenplan wird übernommen)." }; continue; }
    if (e.art === "archiv") { dateien[e.pfad] = { wie: "reinigen", moeglich: ["reinigen", "weglassen"], grund: "ausgepacktes Archiv — wird aus den gereinigten Dateien darin neu gepackt." }; continue; }
    const kennungen = e.marken.map((m) => m.kennung);
    if (kennungen.includes("GIT") || /(^|\/)\.git\//.test(e.pfad)) { dateien[e.pfad] = { wie: "weglassen", moeglich: ["weglassen"], grund: "Git-Geschichte — die saubere Kopie beginnt ohne .git." }; continue; }
    const riskant = kennungen.filter((k) => WEG_MARKEN.has(k));
    const grundRiskant = riskant.length ? riskant.map((k) => MARKE_NAME[k]).join(", ") + " — kommt standardmäßig nicht mit." : "";
    if (/^(png|jpeg|webp)$/.test(e.art) && e.gelesen && !riskant.length) {
      const hart = hartIn.has(e.pfad);
      dateien[e.pfad] = { wie: hart ? "weglassen" : "metadaten", moeglich: ["metadaten", "weglassen"].concat(e.befunde || e.ungeprueft ? [] : ["uebernehmen"]),
        grund: hart ? "im Bild stehen harte Angaben — kommt standardmäßig nicht mit." : "Bild — Metadaten und Daten hinter dem Bildende werden entfernt. Sichtbarer Text im Bild bleibt (Neuzeichnen: Stufe 4)." };
      continue;
    }
    if (e.textlich) {
      dateien[e.pfad] = { wie: riskant.length ? "weglassen" : "reinigen", moeglich: ["reinigen", "weglassen"], grund: grundRiskant || (e.befunde ? "Text — die Stellen werden ersetzt." : "Text ohne Funde.") };
    } else {
      const unbedenklich = e.gelesen && !e.befunde && !e.ungeprueft && !riskant.length;
      dateien[e.pfad] = { wie: unbedenklich ? "uebernehmen" : "weglassen", moeglich: ["uebernehmen", "weglassen"],
        grund: unbedenklich ? "ohne Funde gelesen — kommt unverändert mit." : grundRiskant || (e.befunde ? "trägt Funde und lässt sich hier nicht Stelle für Stelle reinigen (neu bauen: Stufe 4)." : "ungeprüft — kommt standardmäßig nicht mit.") };
    }
  }
  for (const e of ergebnis.inventur) if (dateien[e.pfad] && !dateien[e.pfad].art) dateien[e.pfad].art = e.artName || e.art || "";
  return { fassung: 1, werte, dateien, quelle: ergebnis.quelle || null, frueher: ergebnis.frueher || null, markenMax: ergebnis.markenMax || {} };
}

function regexQuelle(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
const WORT = /[\p{L}\p{N}_]/u;

/** Baut aus den Entscheidungen die Ersatz-Tabelle (gleicher Wert → gleiche Nummer). */
function ersatzTabelle(entscheidungen, hinweise) {
  /* Nummern zählen weiter, wo die Eingabe schon Marken trägt (eine wieder eingeworfene Kopie) —
     sonst bekäme eine neue Person dieselbe Nummer wie eine alte. */
  const zaehler = Object.assign({}, entscheidungen.markenMax || {}), musterZaehler = {}, tabelle = new Map();
  for (const w of entscheidungen.werte) {
    let wie = w.wie;
    if (wie === "behalten") continue;
    if (wie === "eigen" && !String(w.eigen || "").trim()) { hinweise.push("Ein „eigener Wert“ war leer — dort steht jetzt die Marke bzw. ein Musterwert."); wie = "entfernen"; }
    const m = w.marke || "WERT";
    const muster = () => { musterZaehler[m] = (musterZaehler[m] || 0) + 1; return musterwert(m, musterZaehler[m], w.wert); };
    let text, code;
    if (wie === "entfernen") { zaehler[m] = (zaehler[m] || 0) + 1; text = code = "⟦" + m + "-" + zaehler[m] + "⟧"; }
    else if (wie === "muster") text = code = muster();
    else text = code = String(w.eigen).trim();
    tabelle.set(w.schluessel, { wert: w.wert, marke: m, wie, text, code });
  }
  return tabelle;
}

function ersetzer(tabelle) {
  const werte = Array.from(tabelle.values()).sort((a, b) => b.wert.length - a.wert.length);
  if (!werte.length) return null;
  const teile = werte.map((t) => (WORT.test(t.wert[0]) ? "(?<![\\p{L}\\p{N}_])" : "") + regexQuelle(t.wert) + (WORT.test(t.wert[t.wert.length - 1]) ? "(?![\\p{L}\\p{N}_])" : ""));
  return new RegExp(teile.join("|"), "giu");
}

/**
 * Reinigt: baut die saubere Kopie (ohne .git, ohne Übersprungenes), den
 * Stellenplan und die Zuordnung. Ändert die Eingabe nicht.
 * @returns {Promise<{sauber, stellenplan, zuordnung, weg, hinweise, zahlen}>}
 */
export async function reinige(dateien, entscheidungen, optionen = {}) {
  const melden = optionen.fortschritt || (() => {});
  const hinweise = [], stellenplan = [], weg = [], sauber = [];
  const tabelle = ersatzTabelle(entscheidungen, hinweise);
  const re = ersetzer(tabelle);
  const ersetze = (text, alsCode, pfadNeu, art) => {
    if (!re) return text;
    let zeile = 1, letzte = 0;
    return text.replace(re, (treffer, ...rest) => {
      const pos = rest[rest.length - 2];
      if (art !== "pfad") { for (let i = text.indexOf("\n", letzte); i !== -1 && i < pos; i = text.indexOf("\n", i + 1)) zeile++; letzte = pos; }
      const t = tabelle.get(wertSchluessel(treffer));
      if (!t) return treffer;
      const ersatz = alsCode ? t.code : t.text;
      if (art === "still") return ersatz;
      stellenplan.push({ pfad: pfadNeu, zeile: art === "pfad" ? undefined : zeile, ort: art === "pfad" ? "Datei- oder Ordnername" : undefined,
        ersatz, art: t.marke, wie: ersatz.startsWith("⟦") ? "marke" : t.wie === "eigen" ? "eigen" : "muster" });
      return ersatz;
    });
  };
  const sauberPfad = (pfad, still) => normPfad(pfad).split("/").map((teil) => ersetze(teil, true, null, still ? "still" : "pfad")).join("/");
  const liste = dateien.map((d) => Object.assign({}, d, { pfad: normPfad(d.pfad) })).sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);
  let ersetzt = 0, gitWeg = 0, uebersprungenWeg = 0, bilder = 0;
  const behaelter = [];
  let nr = 0;
  for (const d of liste) {
    melden(++nr, liste.length, d.pfad, "Reinigen");
    if (nr % 25 === 0) await new Promise((ok) => setTimeout(ok, 0));
    if (uebersprungen(d.pfad) || d.nichtGeoeffnet) { uebersprungenWeg++; continue; }
    if (/(^|\/)\.git(\/|$)/.test(d.pfad)) { gitWeg++; continue; }
    if (BEILAGE.test(d.pfad)) continue;          /* alter Stellenplan/Bericht: der neue ersetzt ihn */
    const plan = entscheidungen.dateien[d.pfad];
    const wie = plan ? plan.wie : "weglassen";
    const vorher = stellenplan.length;
    const neu = sauberPfad(d.pfad);
    if (d.ausgepackt != null) {
      for (let i = vorher; i < stellenplan.length; i++) stellenplan[i].pfad = neu;
      behaelter.push({ alt: d.pfad, neu, art: d.archivArt, archiv: d.archiv, wie, grund: plan ? plan.grund : "", vorher });
      continue;
    }
    if (wie === "weglassen") { stellenplan.length = vorher; weg.push({ pfad: neu, grund: plan ? plan.grund : "nicht geprüft — kommt nicht mit." }); continue; }
    for (let i = vorher; i < stellenplan.length; i++) stellenplan[i].pfad = neu;
    let bytes;
    try { bytes = d.bytes || (d.lesen ? await d.lesen() : null); } catch { bytes = null; }
    if (!bytes) { stellenplan.length = vorher; weg.push({ pfad: neu, grund: "nicht lesbar — kommt nicht mit." }); continue; }
    bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (wie === "metadaten") {
      const m = ohneMetadaten(bytes);
      if (!m) { stellenplan.length = vorher; weg.push({ pfad: neu, grund: "Metadaten ließen sich nicht sicher entfernen — kommt nicht mit." }); continue; }
      bilder++;
      sauber.push({ pfad: neu, bytes: m.bytes, gereinigt: true, archiv: d.archiv, ohneMetadaten: m.entfernt || "nichts zu entfernen" });
      continue;
    }
    if (wie === "reinigen") {
      let text;
      try { text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); }
      catch { stellenplan.length = vorher; weg.push({ pfad: neu, grund: "nicht als UTF-8 lesbar — kommt nicht mit." }); continue; }
      const vorText = stellenplan.length;
      const rein = ersetze(text, istCode(d.pfad), neu, "text");
      ersetzt += stellenplan.length - vorText;
      const bom = bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF;
      sauber.push({ pfad: neu, bytes: rein === text ? bytes : new TextEncoder().encode(rein), gereinigt: true, archiv: d.archiv });
      if (bom && rein !== text) { const x = sauber[sauber.length - 1]; if (!(x.bytes[0] === 0xEF && x.bytes[1] === 0xBB)) x.bytes = zusammen([new Uint8Array([0xEF, 0xBB, 0xBF]), x.bytes], x.bytes.length + 3); }
    } else sauber.push({ pfad: neu, bytes, gereinigt: false, archiv: d.archiv });
  }
  /* Archive von innen nach außen neu packen; ein weggelassenes nimmt seinen Inhalt mit. */
  behaelter.sort((a, b) => b.alt.split("/").length - a.alt.split("/").length);
  const geschrieben = new Set(sauber);                         // Dateien (keine Archive) in der Kopie
  let gepackt = 0, packNr = 0;
  for (const c of behaelter) {
    melden(++packNr, behaelter.length, c.neu, "Neu packen");
    await new Promise((ok) => setTimeout(ok, 0));
    const kinder = sauber.filter((x) => x.archiv === c.alt);
    for (let i = sauber.length - 1; i >= 0; i--) if (sauber[i].archiv === c.alt) sauber.splice(i, 1);
    if (c.wie === "weglassen") { const raus = (x) => { geschrieben.delete(x); for (const k of x.kinder || []) raus(k); }; kinder.forEach(raus); }
    const drin = (x) => x.pfad.startsWith(c.neu + "/");
    if (c.wie === "weglassen") {
      for (let i = stellenplan.length - 1; i >= 0; i--) if (drin(stellenplan[i]) || stellenplan[i].pfad === c.neu) stellenplan.splice(i, 1);
      for (let i = weg.length - 1; i >= 0; i--) if (drin(weg[i])) weg.splice(i, 1);
      weg.push({ pfad: c.neu, grund: (c.grund && !/neu gepackt/.test(c.grund) ? c.grund : "Archiv weggelassen") + " (" + kinder.length + " Datei(en) darin)" });
      continue;
    }
    const innen = kinder.map((k) => ({ pfad: drin(k) ? k.pfad.slice(c.neu.length + 1) : dateiName(k.pfad), bytes: k.bytes }));
    sauber.push({ pfad: c.neu, bytes: await archivBauen(c.art, innen), gereinigt: true, archiv: c.archiv, neuGepackt: innen.length, kinder });
    gepackt++;
  }
  sauber.sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);
  const dateienDrin = geschrieben.size;
  if (gepackt) hinweise.push(gepackt + " Archiv(e) aus den gereinigten Dateien neu gepackt (ZIP, tar, tar.gz, gz).");
  if (bilder) hinweise.push(bilder + " Bild(er) ohne Metadaten übernommen. Sichtbarer Text im Bild ist damit NICHT entfernt (Neuzeichnen: Stufe 4).");
  if (gitWeg) hinweise.push(gitWeg + " Datei(en) aus .git kommen nicht mit — die eigene Geschichte beginnt bei null (git init).");
  if (uebersprungenWeg) hinweise.push(uebersprungenWeg + " nicht gelesene Datei(en) (node_modules, Build-Ordner) kommen nicht mit — nach dem Auspacken neu installieren bzw. neu bauen.");
  const zuordnung = Array.from(tabelle.values()).map((t) => ({ marke: t.text, code: t.code, art: t.marke, wie: t.wie, wert: t.wert }));
  const q = entscheidungen.quelle || { form: "dateien", name: "projekt" };
  const quelle = { form: q.form, name: sauberPfad(q.name, true) };
  /* Was jede Datei war und was mit ihr geschah — damit die Kopie weiß, woher sie kommt (ohne Werte). */
  const dateiliste = [];
  for (const d of liste) {
    if (uebersprungen(d.pfad) || d.nichtGeoeffnet || /(^|\/)\.git(\/|$)/.test(d.pfad) || BEILAGE.test(d.pfad)) continue;
    const plan = entscheidungen.dateien[d.pfad] || {};
    dateiliste.push({ pfad: sauberPfad(d.pfad, true), art: plan.art || "", wie: plan.wie || "weglassen", archiv: d.archiv ? sauberPfad(d.archiv, true) : undefined });
  }
  return { sauber, stellenplan, zuordnung, weg, hinweise, quelle, dateiliste, frueher: entscheidungen.frueher || null,
    zahlen: { dateien: dateienDrin, gereinigt: [...geschrieben].filter((s) => s.gereinigt).length, weg: weg.length, git: gitWeg, uebersprungen: uebersprungenWeg,
      stellen: stellenplan.filter((s) => !s.ort).length, umbenannt: stellenplan.filter((s) => s.ort).length, bilder, archive: gepackt } };
}

function bytesFinden(heu, nadel) {
  if (!nadel.length || nadel.length > heu.length) return -1;
  const erst = nadel[0];
  outer: for (let i = heu.indexOf(erst); i !== -1 && i <= heu.length - nadel.length; i = heu.indexOf(erst, i + 1)) {
    for (let j = 1; j < nadel.length; j++) if (heu[i + j] !== nadel[j]) continue outer;
    return i;
  }
  return -1;
}
function kleinAscii(b) { const k = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) { const c = b[i]; k[i] = c >= 65 && c <= 90 ? c + 32 : c; } return k; }
function utf16le(s) { const b = new Uint8Array(s.length * 2); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[2 * i] = c & 255; b[2 * i + 1] = c >> 8; } return b; }

/**
 * Nachprüfung: die saubere Kopie wird noch einmal ganz durchsucht. Laut genannt
 * wird (1) jeder alte Wert, der noch in den Bytes einer Datei steckt, (2) jeder
 * neue Fund, der weder Marke noch Ersatz noch bewusst behalten ist, (3) jede
 * Datei der Kopie, die ungeprüft blieb. Leer heißt NICHT „garantiert sauber“.
 */
export async function nachpruefe(rein, entscheidungen, optionen = {}) {
  const ein = await einwerfen(rein.sauber.map((x) => ({ pfad: x.pfad, bytes: x.bytes })), { wurzelZip: false, fortschritt: optionen.fortschritt, schritt: "Nachprüfung: auspacken" });
  const r = await pruefe(ein.dateien, Object.assign({}, optionen, { schritt: "Nachprüfung" }));
  const flach = [];
  for (const d of ein.dateien) {
    if (d.ausgepackt != null || d.unlesbar) continue;
    let b = null; try { b = d.bytes || (d.lesen ? await d.lesen() : null); } catch { b = null; }
    if (b) flach.push({ pfad: d.pfad, bytes: b instanceof Uint8Array ? b : new Uint8Array(b) });
  }
  const unveraendert = new Set(rein.sauber.filter((x) => !x.gereinigt).map((x) => x.pfad));
  const bekannt = new Set();
  for (const z of rein.zuordnung) { bekannt.add(wertSchluessel(z.marke)); bekannt.add(wertSchluessel(z.code)); }
  for (const w of entscheidungen.werte) if (w.wie === "behalten") bekannt.add(w.schluessel);
  const istMarke = (v) => /^(?:⟦[A-Z][A-Z0-9_]*-\d+⟧\s*)+$/.test(String(v).trim());
  const offen = [];
  /* 1 · alte Werte in den Bytes (UTF-8 und UTF-16, Groß/klein bei ASCII egal) */
  /* ein Wert, der durch sich selbst ersetzt wurde (z. B. ein Musterwert, der schon dastand), ist kein Rest */
  const alte = rein.zuordnung.filter((z) => z.wert.length >= 2 && wertSchluessel(z.wert) !== wertSchluessel(z.code) && wertSchluessel(z.wert) !== wertSchluessel(z.marke));
  for (const s of flach) {
    const klein = kleinAscii(s.bytes);
    for (const z of alte) {
      const w = z.wert.toLowerCase();
      if (bytesFinden(klein, new TextEncoder().encode(w)) !== -1 || bytesFinden(klein, utf16le(w)) !== -1)
        offen.push({ grund: "rest", pfad: s.pfad, art: z.art, satz: "Ein entfernter Wert (" + (MARKE_ART_NAME[z.art] || z.art) + ") steckt noch in dieser Datei." + (unveraendert.has(s.pfad) ? " Sie wurde unverändert übernommen." : "") });
    }
  }
  /* 2 · neue Funde */
  for (const b of r.buendel) {
    if (!b.nurDatei && (bekannt.has(wertSchluessel(b.wert)) || istMarke(b.wert))) continue;
    if (b.art === "NAME" && b.vorschlag && istMarke(b.wert)) continue;
    offen.push({ grund: "fund", art: b.art, artName: b.artName, wert: b.wert, nurDatei: b.nurDatei, anzahl: b.anzahl, stellen: b.stellen,
      satz: b.nurDatei ? b.satz : "Noch gefunden: " + b.artName + ", " + b.anzahl + "×." });
  }
  /* 3 · ungeprüft in der Kopie */
  for (const e of r.inventur) if (e.ungeprueft && e.art !== "ordner") offen.push({ grund: "ungeprueft", pfad: e.pfad, satz: "Ungeprüft in der Kopie: " + e.ungeprueft });
  return { offen, ergebnis: r, hinweise: ein.hinweise.concat(r.hinweise) };
}

/** Der Stellenplan als Text (wie im Brief) und als JSON. Er enthält keinen alten Wert. */
export function stellenplanText(rein, jetzt = new Date()) {
  const zeilen = rein.stellenplan.map((s) => {
    const wo = s.ort ? s.ort : "Zeile " + s.zeile;
    const was = s.wie === "marke" ? s.ersatz + "   Art: " + (MARKE_ART_NAME[s.art] || s.art)
      : s.wie === "eigen" ? "eigener Wert (war: " + (MARKE_ART_NAME[s.art] || s.art) + ")"
      : s.ersatz + " (war: " + (MARKE_ART_NAME[s.art] || s.art) + ")";
    return [s.pfad, wo, was];
  });
  const b0 = Math.max(4, ...zeilen.map((z) => z[0].length)), b1 = Math.max(5, ...zeilen.map((z) => z[1].length));
  return "Stellenplan — Projekt-Reiniger Pro, " + jetzt.toISOString().slice(0, 10) + "\n" +
    "Er nennt nur, WO eine Angabe stand und WAS jetzt dort steht. Die entfernten Werte stehen nicht darin.\n" +
    "Marken ⟦ART-n⟧: gleicher Wert = gleiche Nummer, auch in Code und Dateinamen. Musterwerte nur dort, wo sie gewählt wurden.\n" +
    (rein.quelle ? "Herkunft: kam als " + (FORM_NAME[rein.quelle.form] || rein.quelle.form) + " „" + rein.quelle.name + "“ und geht in derselben Form zurück.\n" : "") +
    (rein.frueher ? "Schon einmal gereinigt" + (rein.frueher.herkunft && rein.frueher.herkunft.erstellt ? " am " + String(rein.frueher.herkunft.erstellt).slice(0, 10) : "") + " — die früheren Stellen stehen in stellenplan.json unter „frueher“.\n" : "") + "\n" +
    (zeilen.length ? zeilen.map((z) => z[0].padEnd(b0) + "   " + z[1].padEnd(b1) + "   " + z[2]).join("\n") : "(keine Stelle ersetzt)") + "\n";
}
export function stellenplanJson(rein, jetzt = new Date()) {
  const f = rein.frueher;
  const frueher = f ? [{ herkunft: f.herkunft || null, stellen: f.stellen || [] }].concat(f.frueher || []) : undefined;
  return JSON.stringify({ art: "projekt-reiniger-stellenplan", fassung: 2,
    herkunft: rein.quelle ? { form: rein.quelle.form, name: rein.quelle.name, erstellt: jetzt.toISOString(), kern: KERN_FASSUNG, dateien: (rein.dateiliste || []).length } : undefined,
    dateien: rein.dateiliste,
    stellen: rein.stellenplan.map((s) => ({ pfad: s.pfad, zeile: s.zeile, ort: s.ort, ersatz: s.wie === "eigen" ? undefined : s.ersatz, wie: s.wie, art: s.art })),
    frueher }, null, 2) + "\n";
}

/** Der Bericht: WAS entfernt wurde und was offen bleibt — ohne Werte. */
export function bericht(rein, nach, jetzt = new Date()) {
  const proArt = {};
  for (const s of rein.stellenplan) { const k = (MARKE_ART_NAME[s.art] || s.art) + " → " + (s.wie === "marke" ? "Marke" : s.wie === "eigen" ? "eigener Wert" : "Musterwert"); proArt[k] = (proArt[k] || 0) + 1; }
  const z = rein.zahlen, aus = [];
  aus.push("Bericht — Projekt-Reiniger Pro, " + jetzt.toISOString().slice(0, 10), "Er nennt keine entfernten Werte.", "");
  aus.push("In der Kopie: " + z.dateien + " Datei(en), davon " + z.gereinigt + " gereinigt. Weggelassen: " + z.weg + ". Aus .git: " + z.git + " (nie dabei). Nicht gelesen: " + z.uebersprungen + ".");
  aus.push("Ersetzt: " + z.stellen + " Stelle(n) im Text" + (z.umbenannt ? ", " + z.umbenannt + " Datei- oder Ordnername(n)" : "") + ".", "");
  if (Object.keys(proArt).length) { aus.push("Was ersetzt wurde:"); for (const [k, n] of Object.entries(proArt)) aus.push("  " + k + ": " + n + "×"); aus.push(""); }
  if (rein.weg.length) { aus.push("Weggelassen:"); for (const w of rein.weg) aus.push("  " + w.pfad + " — " + w.grund); aus.push(""); }
  for (const h of rein.hinweise) aus.push("Hinweis: " + h);
  aus.push("", "Nachprüfung (die Kopie wurde noch einmal ganz durchsucht):");
  if (!nach.offen.length) aus.push("  Nichts offen gefunden. Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles.");
  else for (const o of nach.offen) aus.push("  OFFEN: " + (o.pfad ? o.pfad + " — " : "") + (o.grund === "fund" && !o.nurDatei ? (o.artName || o.art) + ", " + o.anzahl + "× (" + Array.from(new Set(o.stellen.map((s) => s.pfad))).join(", ") + ")" : o.satz));
  return aus.join("\n") + "\n";
}

/* ── ZIP schreiben (gespeichert oder deflate), UTF-8-Namen ─────────────── */
let CRC_TAFEL = null;
export function crc32(b) {
  if (!CRC_TAFEL) { CRC_TAFEL = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_TAFEL[n] = c >>> 0; } }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC_TAFEL[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
async function packe(b) {
  if (typeof CompressionStream !== "function" || b.length < 64) return null;
  const cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter();
  w.write(b).catch(() => {}); w.close().catch(() => {});
  const r = cs.readable.getReader(), teile = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; teile.push(value); n += value.length; }
  return n < b.length ? zusammen(teile, n) : null;
}
/** Baut ein ZIP aus `{ pfad, bytes }`. Zeitstempel fest (1.1.1980), damit nichts über den Zeitpunkt verrät. */
export async function zipBauen(dateien) {
  const T = new TextEncoder(), teile = [], zentral = []; let off = 0;
  for (const d of dateien) {
    const name = T.encode(normPfad(d.pfad)), roh = d.bytes, crc = crc32(roh);
    const gepackt = await packe(roh), methode = gepackt ? 8 : 0, daten = gepackt || roh;
    const lh = new Uint8Array(30 + name.length), v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true); v.setUint16(8, methode, true);
    v.setUint16(10, 0, true); v.setUint16(12, 0x21, true); v.setUint32(14, crc, true);
    v.setUint32(18, daten.length, true); v.setUint32(22, roh.length, true); v.setUint16(26, name.length, true); lh.set(name, 30);
    const ch = new Uint8Array(46 + name.length), c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(10, methode, true);
    c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true);
    c.setUint32(20, daten.length, true); c.setUint32(24, roh.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true); ch.set(name, 46);
    teile.push(lh, daten); zentral.push(ch); off += lh.length + daten.length;
  }
  const zl = zentral.reduce((n, x) => n + x.length, 0), ende = new Uint8Array(22), e = new DataView(ende.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, dateien.length, true); e.setUint16(10, dateien.length, true); e.setUint32(12, zl, true); e.setUint32(16, off, true);
  return zusammen([...teile, ...zentral, ende], off + zl + 22);
}

/** „brief.txt“ → „brief-sauber.txt“, „x.tar.gz“ → „x-sauber.tar.gz“; schon „-sauber“ bleibt, wie es ist. */
export function sauberName(name) {
  const n = dateiName(name || "projekt");
  const m = /^(.*?)((?:\.tar)?\.[A-Za-z0-9]{1,10})?$/.exec(n);
  const stamm = m[1] || n, endung = m[2] || "";
  return (/-sauber$/.test(stamm) ? stamm : stamm + "-sauber") + endung;
}
const TYP = { zip: "application/zip", tar: "application/x-tar", tgz: "application/gzip", gz: "application/gzip" };

/**
 * Die saubere Kopie in DERSELBEN Form, in der sie hereinkam:
 *   eine Datei → dieselbe Datei (Stellenplan und Bericht liegen daneben, als eigene Downloads)
 *   ZIP / tar / tar.gz → dasselbe Archiv, mit _reiniger/ darin · gz → dieselbe gz-Datei
 *   Ordner oder mehrere Dateien → ein ZIP mit _reiniger/
 * Wird die Kopie wieder eingeworfen, erkennt der Reiniger sie an _reiniger/stellenplan.json.
 */
export async function ausgabe(rein, nach, jetzt = new Date()) {
  const T = new TextEncoder();
  const beilagen = [
    { pfad: "_reiniger/STELLENPLAN.txt", bytes: T.encode(stellenplanText(rein, jetzt)) },
    { pfad: "_reiniger/stellenplan.json", bytes: T.encode(stellenplanJson(rein, jetzt)) },
    { pfad: "_reiniger/BERICHT.txt", bytes: T.encode(bericht(rein, nach, jetzt)) },
  ];
  const q = rein.quelle || { form: "dateien", name: "projekt" };
  const einzeln = rein.sauber.length === 1 ? rein.sauber[0] : null;
  if (q.form === "datei" && einzeln && einzeln.neuGepackt == null)
    return { bytes: einzeln.bytes, name: sauberName(einzeln.pfad), typ: "application/octet-stream", form: "datei", beilagen, beilagenDrin: false };
  if (q.form === "gz" && einzeln)
    return { bytes: einzeln.bytes, name: sauberName(einzeln.pfad), typ: TYP.gz, form: "gz", beilagen, beilagenDrin: false };
  if ((q.form === "tar" || q.form === "tgz") && einzeln && einzeln.kinder) {
    const innen = einzeln.kinder.map((k) => ({ pfad: k.pfad.startsWith(einzeln.pfad + "/") ? k.pfad.slice(einzeln.pfad.length + 1) : dateiName(k.pfad), bytes: k.bytes }));
    const w = new Set(innen.map((k) => k.pfad.split("/")[0])), ein = w.size === 1 && innen.every((k) => k.pfad.includes("/")) ? Array.from(w)[0] + "/" : "";
    return { bytes: await archivBauen(q.form, [...innen, ...beilagen.map((b) => ({ pfad: ein + b.pfad, bytes: b.bytes }))]), name: sauberName(einzeln.pfad), typ: TYP[q.form], form: q.form, beilagen, beilagenDrin: true };
  }
  const wurzeln = new Set(rein.sauber.map((s) => s.pfad.split("/")[0]));
  const ein = wurzeln.size === 1 && rein.sauber.every((s) => s.pfad.includes("/")) ? Array.from(wurzeln)[0] : "";
  const beilagenPfad = beilagen.map((b) => ({ pfad: (ein ? ein + "/" : "") + b.pfad, bytes: b.bytes }));
  const name = q.form === "zip" ? sauberName(q.name) : sauberName((ein || q.name || "projekt") + ".zip");
  return { bytes: await zipBauen([...rein.sauber, ...beilagenPfad]), name, typ: TYP.zip, form: q.form === "zip" ? "zip" : "zip-aus-" + q.form, beilagen, beilagenDrin: true };
}

/* ── Bilder ohne Metadaten (ohne Leinwand, Byte für Byte) ─────────────────
 * PNG: nur die Bild-Teile bleiben (IHDR, PLTE, IDAT, IEND, Transparenz, Farbraum,
 * Auflösung, Animation); Text, EXIF, Zeitstempel und alles hinter IEND fällt weg.
 * JPEG: APP1–APP15 (EXIF, XMP, Photoshop …) außer ICC-Farbprofil und Adobe-Marke,
 * Kommentare und alles hinter dem Bildende fallen weg. WebP: EXIF- und XMP-Teile
 * und alles hinter dem RIFF-Ende fallen weg.
 * ⚠ Sichtbarer Text im Bild und Botschaften in den untersten Bits bleiben — das
 * leistet erst das Neuzeichnen (Stufe 4). */
const PNG_BLEIBT = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "sBIT", "bKGD", "pHYs", "hIST", "acTL", "fcTL", "fdAT"]);
const u32be = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const latin = (b, i, n) => String.fromCharCode(...b.subarray(i, i + n));

export function ohneMetadaten(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length > 8 && b[0] === 0x89 && latin(b, 1, 3) === "PNG") {
    const teile = [b.subarray(0, 8)], weg = new Set(); let p = 8, ende = false;
    while (p + 12 <= b.length) {
      const len = u32be(b, p), typ = latin(b, p + 4, 4), stop = p + 12 + len;
      if (stop > b.length) return null;
      if (PNG_BLEIBT.has(typ)) teile.push(b.subarray(p, stop)); else weg.add(typ);
      p = stop;
      if (typ === "IEND") { ende = true; break; }
    }
    if (!ende) return null;
    const rest = b.length - p;
    return { bytes: zusammen(teile, teile.reduce((n, t) => n + t.length, 0)), entfernt: [...weg].join(", ") + (rest ? (weg.size ? ", " : "") + rest + " Bytes hinter dem Bildende" : "") };
  }
  if (b.length > 4 && b[0] === 0xFF && b[1] === 0xD8) {
    const teile = [b.subarray(0, 2)], weg = []; let p = 2;
    while (p + 2 <= b.length) {
      if (b[p] !== 0xFF) return null;
      const m = b[p + 1];
      if (m === 0xFF) { p++; continue; }
      if (m === 0xD9) { teile.push(b.subarray(p, p + 2)); p += 2; break; }
      if (m >= 0xD0 && m <= 0xD7 || m === 0x01) { teile.push(b.subarray(p, p + 2)); p += 2; continue; }
      if (p + 4 > b.length) return null;
      const len = (b[p + 2] << 8) | b[p + 3], stop = p + 2 + len;
      if (len < 2 || stop > b.length) return null;
      const kennung = latin(b, p + 4, Math.min(12, len - 2));
      const app = m >= 0xE0 && m <= 0xEF;
      const behalten = !app && m !== 0xFE || m === 0xE0 && /^JFIF\0/.test(kennung) || m === 0xE2 && /^ICC_PROFILE/.test(kennung) || m === 0xEE && /^Adobe/.test(kennung);
      if (behalten) teile.push(b.subarray(p, stop)); else weg.push(m === 0xFE ? "Kommentar" : "APP" + (m - 0xE0) + (/^Exif/.test(kennung) ? " (EXIF)" : /^http/.test(kennung) ? " (XMP)" : ""));
      p = stop;
      if (m === 0xDA) {                                        // Bilddaten bis zum nächsten echten Marker
        let q = p;
        while (q + 1 < b.length && !(b[q] === 0xFF && b[q + 1] !== 0x00 && !(b[q + 1] >= 0xD0 && b[q + 1] <= 0xD7) && b[q + 1] !== 0xFF)) q++;
        teile.push(b.subarray(p, q)); p = q;
      }
    }
    if (teile[teile.length - 1][1] !== 0xD9) return null;
    const rest = b.length - p;
    return { bytes: zusammen(teile, teile.reduce((n, t) => n + t.length, 0)), entfernt: Array.from(new Set(weg)).join(", ") + (rest ? (weg.length ? ", " : "") + rest + " Bytes hinter dem Bildende" : "") };
  }
  if (b.length > 20 && latin(b, 0, 4) === "RIFF" && latin(b, 8, 4) === "WEBP") {
    const riffEnde = Math.min(b.length, 8 + u32(b, 4));
    const teile = [], weg = []; let p = 12, vp8x = -1;
    while (p + 8 <= riffEnde) {
      const typ = latin(b, p, 4), len = u32(b, p + 4), stop = p + 8 + len + (len & 1);
      if (p + 8 + len > riffEnde) return null;
      if (typ === "EXIF" || typ === "XMP ") weg.push(typ.trim());
      else { if (typ === "VP8X") vp8x = teile.reduce((n, t) => n + t.length, 0); teile.push(b.subarray(p, Math.min(stop, riffEnde))); }
      p = stop;
    }
    let koerper = zusammen(teile, teile.reduce((n, t) => n + t.length, 0));
    if (vp8x >= 0) { koerper = koerper.slice(); koerper[vp8x + 8] &= ~0x0C; }
    const kopf = new Uint8Array(12); kopf.set(b.subarray(0, 12)); new DataView(kopf.buffer).setUint32(4, koerper.length + 4, true);
    const rest = b.length - riffEnde;
    return { bytes: zusammen([kopf, koerper], 12 + koerper.length), entfernt: weg.join(", ") + (rest ? (weg.length ? ", " : "") + rest + " Bytes hinter dem Bildende" : "") };
  }
  return null;
}

/* ── Archive neu packen ─────────────────────────────────────────────────── */
function tarBauen(dateien) {
  const T = new TextEncoder(), teile = []; let n = 0;
  const feld = (k, i, s, len) => { const x = T.encode(s); k.set(x.subarray(0, len), i); };
  for (const d of dateien) {
    let name = d.pfad;
    if (T.encode(name).length > 100) {                         // GNU-Langname
      const nb = T.encode(name + "\0"), k = new Uint8Array(512);
      feld(k, 0, "././@LongLink", 100); feld(k, 100, "0000644\0", 8); feld(k, 108, "0000000\0", 8); feld(k, 116, "0000000\0", 8);
      feld(k, 124, nb.length.toString(8).padStart(11, "0") + "\0", 12); feld(k, 136, "00000000000\0", 12); k[156] = 76; feld(k, 257, "ustar  \0", 8);
      pruefsumme(k); teile.push(k, polstern(nb)); n += 512 + Math.ceil(nb.length / 512) * 512;
      name = name.slice(0, 99);
    }
    const k = new Uint8Array(512);
    feld(k, 0, name, 100); feld(k, 100, "0000644\0", 8); feld(k, 108, "0000000\0", 8); feld(k, 116, "0000000\0", 8);
    feld(k, 124, d.bytes.length.toString(8).padStart(11, "0") + "\0", 12); feld(k, 136, "00000000000\0", 12); k[156] = 48; feld(k, 257, "ustar\0" + "00", 8);
    pruefsumme(k); const daten = polstern(d.bytes); teile.push(k, daten); n += 512 + daten.length;
  }
  teile.push(new Uint8Array(1024)); n += 1024;
  return zusammen(teile, n);
  function polstern(x) { const p = new Uint8Array(Math.ceil(x.length / 512) * 512); p.set(x); return p; }
  function pruefsumme(k) { for (let i = 148; i < 156; i++) k[i] = 32; let s = 0; for (const x of k) s += x; feld(k, 148, s.toString(8).padStart(6, "0") + "\0 ", 8); }
}
async function gzipBauen(b) {
  const cs = new CompressionStream("gzip"), w = cs.writable.getWriter();
  w.write(b).catch(() => {}); w.close().catch(() => {});
  const r = cs.readable.getReader(), teile = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; teile.push(value); n += value.length; }
  const g = zusammen(teile, n); g[4] = g[5] = g[6] = g[7] = 0;    // kein Zeitstempel
  return g;
}
export async function archivBauen(art, dateien) {
  if (art === "zip") return zipBauen(dateien);
  if (art === "tar") return tarBauen(dateien);
  if (art === "tgz") return gzipBauen(tarBauen(dateien));
  if (art === "gz") return gzipBauen(dateien.length ? dateien[0].bytes : new Uint8Array(0));
  throw new Error("unbekannte Archivart " + art);
}
