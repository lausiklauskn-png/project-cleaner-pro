/* Projekt-Reiniger Pro — der Kern ohne Oberfläche (Stufen 1 und 3: nur lesen).
 *
 * Brief: docs/BRIEF_2026-10-28_projekt-reiniger-pro.md. Dieser Kern soll später
 * byte-1:1 in die Familienakte (Vite + React + TypeScript) wandern und dort per
 * SHA-256 gepinnt werden. Deshalb gilt hier:
 *   - reines JavaScript, ein ES-Modul, Typen in reiniger-kern.d.ts;
 *   - KEIN DOM, KEINE IndexedDB, KEIN Netz. Nichts wird ausgeführt;
 *   - die Wortlisten stehen in reiniger-listen.js und wandern mit (beide pinnen);
 *   - die Prüfkerne (Sage-Modul 25, pruefer-anhang.js …) bringt der Aufrufer mit
 *     (`optionen.werkzeuge`), sonst liest der Kern sie von globalThis.
 *
 * Stufe 1 = Einwerfen, Inventur, harte Angaben und Metadaten. Stufe 3 = gefühlte
 * Metadaten (Orte, Hochschulen, Firmen, Adressen, Kennzeichen, Vornamen, Rechner,
 * Ordnerpfade) über Wortlisten. Entscheiden,
 * Reinigen, Stellenplan, Tresor kommen in späteren Stufen. `pruefe` ändert
 * keine Datei.
 *
 * Grundsatz: was nicht gelesen werden konnte, heißt „ungeprüft“, nie „sauber“.
 */

import * as L from "./reiniger-listen.js";

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
  ORT: "Ort", HOCHSCHULE: "Hochschule / Schule", FIRMA: "Firma", ADRESSE: "Straße und Hausnummer", "PLZ-ORT": "PLZ und Ort",
  KFZ: "Kfz-Kennzeichen", EIGENNAME: "Vorname (Vorschlag)", RECHNER: "Rechnername", ORDNERPFAD: "Ordnerpfad",
};

/* Gefühlte Metadaten (Stufe 3): verraten erst zusammen etwas. */
export const SORTEN_GEFUEHLT = ["ORT", "HOCHSCHULE", "FIRMA", "ADRESSE", "PLZ-ORT", "KFZ", "EIGENNAME", "RECHNER", "ORDNERPFAD"];

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

/**
 * Einwerfen: Liste aus `{ pfad, bytes }` oder `{ pfad, groesse, lesen }`.
 * Ein ZIP wird entpackt — liegt nur eines da, wird es selbst zum Projekt;
 * sonst landet sein Inhalt unter „name.zip/…“. Ein ZIP im Projekt bleibt
 * eine Datei (Stufe 1: nicht weiter ausgepackt).
 */
export async function einwerfen(liste) {
  const aus = [], hinweise = [];
  const eine = liste.length === 1;
  for (const d of liste) {
    const pfad = normPfad(d.pfad);
    if (/\.zip$/i.test(pfad) && !pfad.includes("/")) {
      const bytes = d.bytes || (d.lesen ? await d.lesen() : null);
      if (bytes && bytes[0] === 0x50 && bytes[1] === 0x4B) {
        const z = zipDateien(bytes, eine ? "" : pfad + "/");
        if (!z.kaputt) {
          hinweise.push(...z.hinweise.map((h) => pfad + ": " + h));
          aus.push(...z.dateien);
          continue;
        }
      }
      aus.push({ pfad, bytes, groesse: bytes ? bytes.length : d.groesse });
      continue;
    }
    aus.push({ pfad, bytes: d.bytes, lesen: d.lesen, nichtGeoeffnet: d.nichtGeoeffnet, groesse: d.groesse != null ? d.groesse : d.bytes ? d.bytes.length : 0, unlesbar: d.unlesbar });
  }
  return { dateien: aus, hinweise };
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
    marke("ARCHIV", "Archiv im Projekt — sein Inhalt wird in Stufe 1 nicht einzeln ausgepackt.");
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

/* ── Gefühlte Metadaten (Stufe 3): Angaben, die erst zusammen etwas verraten ──
 * Gefunden über Wortlisten (reiniger-listen.js) und wenige Muster. Jeder Fund ist
 * ein Hinweis, kein Beweis — Klaus entscheidet. Musterwerte („Musterstadt“) zählen nicht. */

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const WZ = "A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9_";                     // Zeichen, die zu einem Wort gehören
const VOR = "(?<![" + WZ + "])", NACH = "(?![" + WZ + "])";
const oder = (liste) => Array.from(new Set(liste)).sort((a, b) => b.length - a.length).map(esc).join("|");
const gross1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const istMuster = (s) => /(^|[\s\-/\\])muster/i.test(s);

const RE_ORT = new RegExp(VOR + "(" + oder([...L.STAEDTE_SICHER, ...L.STADTTEILE]) + ")" + NACH, "g");
const RE_ORT_MEHRDEUTIG = new RegExp(VOR + "(" + oder(L.STAEDTE_MEHRDEUTIG) + ")" + NACH, "g");
const ORT_ZUSAMMENHANG = /(?:(?:^|[^A-Za-zäöüß])(?:in|aus|nach|bei|nahe|Raum|Großraum|Standort|Wohnort|Sitz|Stadt|Ort|Uni|Universität|Hochschule|FH|TU)\s+|\b\d{4,5}\s+)$/;
const ZEITZONE_DAVOR = /(?:Europe|America|Asia|Africa|Atlantic|Pacific|Australia|Indian|Antarctica|Etc)\/$/;
const ALLE_ORTE = new Set([...L.STAEDTE_SICHER, ...L.STADTTEILE, ...L.STAEDTE_MEHRDEUTIG]);

const RE_HS_KUERZEL = new RegExp(VOR + "(" + oder(L.HOCHSCHUL_KUERZEL) + ")" + NACH, "g");
const KURZ_HS = new Set(["FH", "TU", "TH", "HS", "PH", "Uni"]);
const HS_NAME = "[A-ZÄÖÜ][A-Za-zÄÖÜäöüß.'-]+";
const HS_VERBINDER = "(?:der |des |für |of |de |di |am |an der |in |im |auf der |zu |und )";
const RE_HS_WORT = new RegExp(VOR + "(" + oder(L.HOCHSCHUL_WORT) + ")\\s+(" + HS_VERBINDER + "?" + HS_NAME + "(?:\\s+" + HS_VERBINDER + "?" + HS_NAME + "){0,3})", "g");
const RE_HS_DOMAIN = /(?<![A-Za-z0-9.-])((?:[a-z0-9-]+\.)*(?:uni|tu|th|fh|hs|haw|htw|ph|hfg|hdm|hfm|udk|ethz|epfl|tum|lmu|rwth-aachen|kit)(?:-[a-z]+)*\.(?:de|at|ch|edu))(?![A-Za-z0-9-])/g;

const FIRMA_WORT = "[A-ZÄÖÜ0-9][A-Za-zÄÖÜäöüß0-9&'+.-]*";
const RE_FIRMA = new RegExp(VOR + "((?:" + FIRMA_WORT + "[ \\t]+){0,3}" + FIRMA_WORT + ")[ \\t]*,?[ \\t]+(" + oder(L.FIRMENFORMEN) + ")(?![A-Za-zÄÖÜäöüß0-9_])", "g");
const STOPP_VORN = new Set("copyright © (c) by von bei für mit die der das the a an and und oder or at in im am zur zum für from".split(" "));

const ENDUNG = oder([...L.STRASSEN_ENDUNG, ...L.STRASSEN_ENDUNG.map(gross1)]);
const RE_STRASSE = new RegExp(VOR + "((?:[A-ZÄÖÜ][a-zäöüß.-]+\\s){0,2}[A-ZÄÖÜ][a-zäöüß-]*(?:" + ENDUNG + "))\\s+(\\d{1,4}(?:\\s?[a-zA-Z])?(?:\\s?[-–/]\\s?\\d{1,4}[a-z]?)?)(?![A-Za-z0-9_])", "g");
const STRASSE_STOPP = new Set("Die Der Das In Im Bei Nach Aus Von Und Oder Wohnt Adresse Anschrift Wohnhaft An Auf Zur Zum".split(" "));
const RE_PLZ = /(?<![A-Za-z0-9_.,-])(?:(D|DE|A|AT|CH)-)?(\d{4,5})\s+([A-ZÄÖÜ][a-zäöüß]+(?:[- ](?:an der |am |im |in |bei |ob der )?[A-ZÄÖÜ(][A-Za-zäöüß().]+)?)/g;

const RE_KFZ = /(?<![A-Za-z0-9_\/.#-])([A-ZÄÖÜ]{1,3})([- ])([A-Z]{1,2})([- ]?)(\d{1,4})([EH]?)(?![\w-])/g;

const RE_VORNAME = new RegExp(VOR + "(" + oder([...L.VORNAMEN]) + ")(?:\\s+((?:von der |van der |von |van |de |zu )?[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?))?" + NACH, "g");

const RE_RECHNER = [
  [/(?<![A-Za-z0-9-])((?:DESKTOP|LAPTOP|PC|WIN|NB|WS)-[A-Z0-9]{5,15})(?![A-Za-z0-9-])/g, "Windows-Rechnername"],
  [/(?<![A-Za-z0-9-])((?:[A-ZÄÖÜ][a-zäöü]+s-(?:MacBook|iMac|Mac|iPhone|iPad|PC|Laptop|Computer|Rechner)(?:-[A-Za-z0-9]+)*)|(?:(?:MacBook|iMac|Mac|iPhone|iPad|PC|Laptop)(?:-[A-Za-z0-9]+)*-(?:von|de|di|from)-[A-Za-zäöü0-9]+))(?:\.local|\.fritz\.box|\.lan|\.home)?(?![A-Za-z0-9-])/g, "Gerätename mit Besitzer"],
  [/(?<![A-Za-z0-9.-])([A-Za-z0-9][A-Za-z0-9-]{1,62}\.(?:fritz\.box|speedport\.ip))(?![A-Za-z0-9.-])/g, "Name im Heimnetz"],
  [/(?<![A-Za-z0-9.-])([A-Za-z0-9]*[-0-9][A-Za-z0-9-]*\.(?:local|lan|home|internal|intranet))(?![A-Za-z0-9.-])/g, "Name im Heim- oder Firmennetz"],
  [/(?<![A-Za-z0-9_.-])([a-z_][a-z0-9_-]{1,31}@[A-Za-z0-9][A-Za-z0-9-]{1,62}):[~\/]/g, "Eingabezeile mit Benutzer und Rechner"],
  [/(?:^|["'`\s(=])(?:\\{2}([A-Za-z0-9][A-Za-z0-9._-]{2,62})\\(?!\\)|\\{4}([A-Za-z0-9][A-Za-z0-9._-]{2,62})\\{2}(?!\\))[A-Za-z0-9$]/gm, "Netzlaufwerk"],
  [/\b(?:COMPUTERNAME|HOSTNAME|HOST_NAME|MACHINE_NAME|RECHNERNAME)\s*[=:]\s*["']?([A-Za-z0-9][A-Za-z0-9._-]{1,62})/g, "Rechnername in einer Einstellung"],
];
const RECHNER_ALLGEMEIN = /^(localhost|win32|win64|https?|ssh|git|file|ftp|0\.0\.0\.0|127\.0\.0\.1|example|host|server|hostname|myhost|machine|computer|test|dev|my-?pc|your-?host|\$.*|%.*)(\..*)?$/i;

const RE_WINPFAD = /(?<![A-Za-z0-9_])([A-Za-z]):(\\{1,2}|\/)(?![\\\/\s"'`])([^"'`<>|*?\r\n]{2,240})/g;
const WINPFAD_ALLGEMEIN = /^(?:windows|program files|programme|programdata|program files \(x86\)|temp|tmp|users|benutzer|dokumente und einstellungen|documents and settings|path|pfad|foo|bar|baz|blah|any|some|my|your|dir|folder|parentfolder|x|y|example|beispiel|\.\.\.|…)(?:[\\\/]|$)/i;
const RE_UNIXPFAD = /(?:^|["'`\s(=:])(\/(?:Volumes|media|run\/media)\/[^\/"'`<>|*?\r\n]{1,60}(?:\/[^\s"'`<>|*?]*)?|\/mnt\/[a-z]\/(?!Program|Windows)[^\s"'`<>|*?]{2,200})/gm;
const RE_WOLKE = /(OneDrive - [^\\\/"'`\r\n<>|]{2,80}|Dropbox \([^)\r\n]{2,60}\)|Google Drive|Meine Ablage|My Drive|iCloud Drive|Nextcloud|ownCloud)(?=[\\\/])/g;

/**
 * Sucht gefühlte Metadaten in einem Text. Liefert Funde, ändert nichts.
 * `modus: "pfad"` — der Text ist ein Datei- oder Ordnername (dort darf ein Vorname allein stehen).
 * @returns {Array<{art: string, wert: string, index: number, satz: string, vorschlag?: boolean}>}
 */
export function gefuehlt(text, optionen = {}) {
  const pfadModus = optionen.modus === "pfad";
  const aus = [], belegt = new Map();
  const neu = (art, wert, index, satz, mehr) => {
    wert = String(wert).replace(/\s+/g, " ").trim();
    if (!wert || istMuster(wert)) return;
    const b = belegt.get(art) || []; belegt.set(art, b);
    const ende = index + wert.length;
    if (b.some(([a, e]) => index < e && ende > a)) return;      // dieselbe Stelle nur einmal je Art
    b.push([index, ende]);
    aus.push(Object.assign({ art, wert, index, satz }, mehr));
  };
  const davor = (i, n = 40) => text.slice(Math.max(0, i - n), i);
  let m;

  /* Orte */
  RE_ORT.lastIndex = 0;
  while ((m = RE_ORT.exec(text))) {
    if (ZEITZONE_DAVOR.test(davor(m.index, 12))) continue;      // „Europe/Berlin“ ist eine Zeitzone
    neu("ORT", m[1], m.index, L.STADTTEILE.includes(m[1]) ? "Stadtteil — verrät die Gegend." : "Ort — verrät zusammen mit anderem, wer es ist.");
  }
  RE_ORT_MEHRDEUTIG.lastIndex = 0;
  while ((m = RE_ORT_MEHRDEUTIG.exec(text))) {
    if (!ORT_ZUSAMMENHANG.test(davor(m.index, 30))) continue;   // „Essen“ allein ist Essen
    neu("ORT", m[1], m.index, "Ort (mit „in/aus/nach …“ oder PLZ davor).");
  }

  /* Hochschulen und Schulen */
  RE_HS_KUERZEL.lastIndex = 0;
  while ((m = RE_HS_KUERZEL.exec(text))) neu("HOCHSCHULE", m[1], m.index, "Hochschule — verrät Studium oder Arbeit.");
  RE_HS_WORT.lastIndex = 0;
  while ((m = RE_HS_WORT.exec(text))) {
    const name = m[2].trim().replace(/[.,;:]+$/, "");
    const erstes = name.replace(/^(?:der |des |für |of |de |di |am |an der |in |im |auf der |zu |und )/, "").split(/\s+/)[0];
    if (KURZ_HS.has(m[1]) && !ALLE_ORTE.has(erstes)) continue;   // „TU“, „FH“ … nur mit Ort danach
    neu("HOCHSCHULE", m[1] + " " + name, m.index, /schule|Kita|Kindergarten|Gymnasium|Berufskolleg/i.test(m[1]) && !/Hochschule/.test(m[1])
      ? "Schule oder Kita — verrät Wohnort und Kinder." : "Hochschule — verrät Studium oder Arbeit.");
  }
  RE_HS_DOMAIN.lastIndex = 0;
  while ((m = RE_HS_DOMAIN.exec(text))) neu("HOCHSCHULE", m[1], m.index, "Adresse einer Hochschule.");

  /* Firmen (Arbeitgeber, Kunden) */
  RE_FIRMA.lastIndex = 0;
  while ((m = RE_FIRMA.exec(text))) {
    const teile = m[1].split(/[ \t]+/);
    while (teile.length && (STOPP_VORN.has(teile[0].toLowerCase()) || /^[\d.,:–-]+$/.test(teile[0]))) teile.shift();
    if (!teile.length) continue;
    const name = teile.join(" "), form = m[2];
    if (L.FIRMEN_BEKANNT.has(name.toLowerCase().replace(/[,.]+$/, "")) || L.FIRMEN_BEKANNT.has((name + " " + form).toLowerCase().replace(/[,.]+$/, ""))) continue;
    if (/^[A-Z]$/.test(name)) continue;
    neu("FIRMA", name + " " + form, m.index + m[0].indexOf(teile[0]), "Firma — oft der Arbeitgeber oder ein Kunde.");
  }

  /* Straße mit Hausnummer, PLZ mit Ort */
  RE_STRASSE.lastIndex = 0;
  const strassen = [];
  while ((m = RE_STRASSE.exec(text))) {
    const teile = m[1].split(/\s+/);
    while (teile.length > 1 && STRASSE_STOPP.has(teile[0])) teile.shift();
    const wert = teile.join(" ") + " " + m[2];
    const i = m.index + m[0].indexOf(teile[0]);
    strassen.push(i);
    neu("ADRESSE", wert, i, "Straße und Hausnummer.");
  }
  RE_PLZ.lastIndex = 0;
  while ((m = RE_PLZ.exec(text))) {
    const vorsilbe = m[1], plz = m[2], ort = m[3];
    if (plz.length === 4 && !vorsilbe && (/^(19|20)\d\d$/.test(plz) || !ALLE_ORTE.has(ort.split(/[- ]/)[0]))) continue;   // „2024 Berlin“ ist ein Jahr
    if (plz.length === 5 && /^00/.test(plz)) continue;
    const bekannt = ALLE_ORTE.has(ort) || ALLE_ORTE.has(ort.split(/[- ]/)[0]);
    const strasseNah = strassen.some((s) => s < m.index && m.index - s < 160);
    if (!bekannt && !strasseNah && !vorsilbe) continue;          // „20000 Zeilen“ ist keine Adresse
    neu("PLZ-ORT", (vorsilbe ? vorsilbe + "-" : "") + plz + " " + ort, m.index, "Postleitzahl und Ort.");
  }

  /* Kfz-Kennzeichen */
  RE_KFZ.lastIndex = 0;
  while ((m = RE_KFZ.exec(text))) {
    if (!L.KFZ_KENNUNG.has(m[1])) continue;
    if (m[4] !== " " || (m[2] === " " && m[3].length !== 2)) continue;   // „F-T1“, „M AB12“, „KS X 1001“ sind keine Kennzeichen
    neu("KFZ", m[0], m.index, "Kfz-Kennzeichen — verrät Wohnort und Fahrzeug.");
  }

  /* Vornamen: als Paar mit Nachnamen oder allein auf einem Knopf / in Testdaten */
  RE_VORNAME.lastIndex = 0;
  while ((m = RE_VORNAME.exec(text))) {
    const vor = m[1], nach = m[2];
    if (nach && !L.KEIN_NACHNAME.has(nach) && !ALLE_ORTE.has(nach) && !istMuster(nach)) {
      neu("EIGENNAME", vor + " " + nach, m.index, "Vor- und Nachname aus der Namensliste.", { vorschlag: true });
      continue;
    }
    if (L.VORNAMEN_NUR_PAAR.has(vor)) continue;
    const a = text[m.index - 1], z = text[m.index + vor.length];
    const imText = (a === '"' && z === '"') || (a === "'" && z === "'") || (a === "`" && z === "`") || (a === ">" && z === "<");
    if (imText || pfadModus) neu("EIGENNAME", vor, m.index, pfadModus ? "Vorname im Datei- oder Ordnernamen." : "Vorname allein in einem Text (Knopf, Testdaten).", { vorschlag: true });
  }

  /* Rechnernamen */
  for (const [re, satz] of RE_RECHNER) {
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      const wert = m[1] || m[2];
      if (RECHNER_ALLGEMEIN.test(wert.split("@").pop()) || /^(?:x[0-9a-f]{2}|u[0-9a-f]{4})/i.test(wert)) continue;   // „\\x00“ ist ein Escape
      neu("RECHNER", wert, m.index + m[0].indexOf(wert), satz + " — verrät den Rechner.");
    }
  }

  /* Ordnerpfade, die Rechner und Arbeitsweise verraten */
  RE_WINPFAD.lastIndex = 0;
  while ((m = RE_WINPFAD.exec(text))) {
    if (m[2] === "\\" && /^(?:[ntr0](?:\\|$|[^A-Za-z])|x[0-9a-f]{2}|u[0-9a-f]{4})/i.test(m[3])) continue;   // „S:\n“ ist ein Escape
    let rest = m[3].split(/\s(?![A-ZÄÖÜ0-9(])|\s{2,}|[,;=](?=\s)/)[0].replace(/\\\\/g, "\\").replace(/[\s.,;:)\]}]+$/, "");
    if (WINPFAD_ALLGEMEIN.test(rest) || !/^[A-Za-z0-9ÄÖÜäöüß_][^\\\/]+/.test(rest) || /[\[\]%^$]|\\[ntr](?:\\|$)/.test(rest)) continue;
    neu("ORDNERPFAD", m[1].toUpperCase() + ":\\" + rest.replace(/\//g, "\\"), m.index, "Fester Ordnerpfad — verrät Laufwerk, Ordner und Arbeitsweise.");
  }
  RE_UNIXPFAD.lastIndex = 0;
  while ((m = RE_UNIXPFAD.exec(text))) neu("ORDNERPFAD", m[1].replace(/[.,;:)\]}]+$/, ""), m.index + m[0].indexOf(m[1]), "Fester Ordnerpfad (Laufwerk oder Speicherkarte).");
  RE_WOLKE.lastIndex = 0;
  while ((m = RE_WOLKE.exec(text))) neu("ORDNERPFAD", m[1], m.index, /OneDrive - |Dropbox \(/.test(m[1]) ? "Cloud-Ordner mit Firmenname." : "Cloud-Ordner im Pfad — verrät den Speicherdienst.");

  return aus.sort((a, b) => a.index - b.index);
}

function gefuehltInText(pfad, text, melde, quelle) {
  for (const f of gefuehlt(text)) {
    melde({ schicht: "gefuehlt", art: f.art, wert: f.wert, pfad, zeile: quelle ? undefined : zeileVon(text, f.index), stelle: quelle, satz: f.satz, vorschlag: f.vorschlag });
  }
}

/* Datei- und Ordnernamen: „fotos/Hamburg-2019/Lena.jpg“ verrät auch etwas. Jeder Ordner nur einmal. */
function gefuehltImPfad(pfad, gesehen, melde) {
  const teile = pfad.split("/");
  for (let i = 0; i < teile.length; i++) {
    const ordner = teile.slice(0, i + 1).join("/");
    if (gesehen.has(ordner)) continue;
    gesehen.add(ordner);
    const ohneEndung = i === teile.length - 1 ? teile[i].replace(/\.[A-Za-z0-9]{1,10}$/, "") : teile[i];
    const lesbar = ohneEndung.replace(/[_]+/g, " ");
    for (const f of gefuehlt(lesbar, { modus: "pfad" })) {
      if (f.art === "ORDNERPFAD") continue;
      melde({ schicht: "gefuehlt", art: f.art, wert: f.wert, pfad, stelle: i === teile.length - 1 ? "im Dateinamen" : "im Ordnernamen „" + ordner + "/“",
        satz: f.satz, vorschlag: f.vorschlag });
    }
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
  let gitPakete = 0, gitObjekte = 0, gitObjekteZuviel = 0;
  const pfadeGesehen = new Set();   // Ordnernamen werden nur einmal geprüft
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
    fortschritt(nr, liste.length, d.pfad);
    if (nr % 25 === 0) await new Promise((ok) => setTimeout(ok, 0));
    const eintrag = { pfad: d.pfad, groesse: d.groesse || 0, art: "", artName: "", stufe: 3, stufeName: STUFE_NAME[3], marken: [], gelesen: false, ungeprueft: "", befunde: 0 };
    inventur.push(eintrag);
    const melde = (b) => { befunde.push(b); eintrag.befunde++; };
    const imGit = /(^|\/)\.git\//.test(d.pfad);
    if (!imGit) gefuehltImPfad(d.pfad, pfadeGesehen, melde);
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
        gefuehltInText(d.pfad, t.text, melde, "alter Stand in .git");
      } else if (/^tree /.test(kopf)) { /* Dateinamen, keine Personen */ }
      else eintrag.ungeprueft = "Binärinhalt in .git — nur Zeichenketten geprüft";
      continue;
    }

    const ord = einordnen(d.pfad, art);
    Object.assign(eintrag, ord, { art });
    const end = endungVon(d.pfad);

    if (art === "text" || art === "html" || (art === "svg" && !PA)) {
      eintrag.artName = art === "html" ? "HTML-Seite" : "Text";
      const t = textAus(bytes);
      if (!t) { eintrag.ungeprueft = "nicht als UTF-8 lesbar — ungeprüft"; continue; }
      if (bytes.length > TEXT_MAX) eintrag.ungeprueft = "nur die ersten " + (TEXT_MAX >> 20) + " MB durchsucht, der Rest ist ungeprüft";
      if (M25) hartInText(M25, d.pfad, t.text, melde); else eintrag.ungeprueft = "harte Angaben ungeprüft (Modul 25 fehlt)";
      metaInText(d.pfad, t.text, melde);
      gefuehltInText(d.pfad, t.text, melde);
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
      for (const x of r.befunde) {
        melde({ schicht: SCHICHT_VON_KENNUNG(x.kennung), art: x.kennung, wert: x.satz, pfad: d.pfad, satz: x.satz });
      }
      if (r.text && M25) hartInText(M25, d.pfad, r.text, melde, r.textQuelle === "bild" ? "Text im Bild" : r.seiten ? "Seitentext" : "Dokumenttext");
      if (r.text) metaInText(d.pfad, r.text, melde);
      if (r.text) gefuehltInText(d.pfad, r.text, melde, r.textQuelle === "bild" ? "Text im Bild" : r.seiten ? "Seitentext" : "Dokumenttext");
      const offen = [];
      if (r.textUngeprueft || r.ungeprueftSatz) offen.push(r.ungeprueftSatz || "Text ungeprüft");
      if (r.bildUngeprueft) offen.push("Text im Bild ungeprüft (Texterkennung kommt auf Knopfdruck, Stufe 4)");
      eintrag.ungeprueft = Array.from(new Set(offen)).join(" · ");
      eintrag.hinweise = r.hinweise || [];
      continue;
    }

    /* unbekannt oder Programm: lesbare Zeichenketten herausziehen. Nichts wird ausgeführt. */
    eintrag.artName = art === "programm" ? "Programm" : "unbekannte Art";
    const s = zeichenketten(bytes);
    if (M25 && s) hartInText(M25, d.pfad, s, melde, "Zeichenkette in der Datei");
    if (s) metaInText(d.pfad, s, melde);
    if (s) gefuehltInText(d.pfad, s, melde, "Zeichenkette in der Datei");
    if (imGit) gitInText(d.pfad, s, melde);
    eintrag.ungeprueft = "nur lesbare Zeichenketten geprüft" + (end ? " (." + end + ")" : "") + " — der Rest ist ungeprüft";
  }

  for (const [ordner, s] of sprung) {
    inventur.push({ pfad: ordner + "/", groesse: s.groesse, art: "ordner", artName: "Ordner", stufe: 0, stufeName: "übersprungen",
      marken: [], gelesen: false, uebersprungen: s.anzahl, nichtGeoeffnet: s.nichtGeoeffnet, ungeprueft: "", befunde: 0 });
  }
  inventur.sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);

  /* Ein Vorname, der schon als Name, Verfasser oder Git-Name dasteht, nicht doppelt zeigen. */
  const namen = new Set(befunde.filter((b) => b.schicht !== "gefuehlt").map((b) => String(b.wert).toLowerCase()));
  for (let i = befunde.length - 1; i >= 0; i--) {
    const b = befunde[i];
    if (b.art === "EIGENNAME" && namen.has(String(b.wert).toLowerCase())) {
      befunde.splice(i, 1);
      const e = inventur.find((x) => x.pfad === b.pfad); if (e) e.befunde--;
    }
  }
  if (gitPakete) hinweise.push(gitPakete + " Git-Paket-Datei(en) nicht ausgepackt — die Geschichte darin ist ungeprüft. Die saubere Kopie bekommt ohnehin kein .git.");
  if (gitObjekteZuviel) hinweise.push(gitObjekteZuviel + " Git-Objekte über dem Deckel (" + GIT_OBJEKTE_MAX + ") nicht geöffnet — ungeprüft.");

  const zahlen = {
    dateien: inventur.filter((e) => e.art !== "ordner").length,
    gelesen: inventur.filter((e) => e.gelesen).length,
    uebersprungen: Array.from(sprung.values()).reduce((n, s) => n + s.anzahl, 0),
    markiert: inventur.filter((e) => e.marken.length).length,
    ungeprueft: inventur.filter((e) => e.ungeprueft).length,
    befunde: befunde.length,
  };
  return { inventur, befunde, buendel: buendeln(befunde), hinweise, zahlen };
}

/** Gleiche Funde bündeln: „Hamburg, 14×“. */
export function buendeln(befunde) {
  const karte = new Map();
  for (const b of befunde) {
    const k = b.schicht + "|" + b.art + "|" + String(b.wert).toLowerCase();
    let x = karte.get(k);
    if (!x) { x = { schicht: b.schicht, art: b.art, artName: ART_NAME[b.art] || b.art, wert: b.wert, vorschlag: !!b.vorschlag, satz: b.satz || "", anzahl: 0, dateien: 0, stellen: [] }; karte.set(k, x); }
    x.anzahl++;
    x.stellen.push({ pfad: b.pfad, zeile: b.zeile, stelle: b.stelle });
  }
  const reihe = { hart: 0, meta: 1, gefuehlt: 2, auffaellig: 3 };
  return Array.from(karte.values()).map((x) => { x.dateien = new Set(x.stellen.map((s) => s.pfad)).size; return x; })
    .sort((a, b) => reihe[a.schicht] - reihe[b.schicht] || b.anzahl - a.anzahl || (a.art < b.art ? -1 : a.art > b.art ? 1 : 0));
}
