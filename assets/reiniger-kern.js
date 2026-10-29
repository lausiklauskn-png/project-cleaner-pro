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
 * Ordnerpfade) über Wortlisten. Stufe 2 = Entscheiden, Reinigen, Stellenplan,
 * Nachprüfung. Stufe 4 = neu gezeichnete Blätter (PDF, Bild, Office) und Mustermappe
 * — das Zeichnen selbst bringt der Aufrufer mit (`werkzeuge.Zeichner`). Stufe 5 = Tresor und Gäste-Sperre
 * (das Schloss `schluesseltresor.js` bringt der Aufrufer mit: `werkzeuge.WERKSTATT_SCHLUESSEL`).
 * `pruefe` ändert keine Datei; `reinige` ändert nur die Kopie.
 *
 * Grundsatz: was nicht gelesen werden konnte, heißt „ungeprüft“, nie „sauber“.
 */

import * as L from "./reiniger-listen.js";

export const KERN_FASSUNG = "3";

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
  BEGRIFF: "Selbst eingetragen", GESPERRT: "Auf der Sperrliste",
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

/* ── Archive im Projekt öffnen (ZIP, APK, JAR, IPA, TAR, TGZ, GZ — bis 3 Ebenen) ─────────────
 * Klaus 2026-10-28: „… auch Apps … APK-App zum Beispiel.“ Eine APK ist innen ein ZIP. Geöffnet wird nur
 * gelesen, nie ausgeführt. RAR und 7z kann die App nicht öffnen (kein freier Entpacker ohne Netz):
 * dort nur Zeichenketten, laut „ungeprüft“. */
export const ARCHIV_TIEFE_MAX = 3;
export const ARCHIV_DATEIEN_MAX = 20000;
export const ARCHIV_SUMME_MAX = 1024 * 1024 * 1024;
const ARCHIV_NAME = { zip: "ZIP-Archiv", apk: "Android-App (APK)", aab: "Android-App-Bündel", aar: "Android-Bibliothek", jar: "Java-Archiv",
  war: "Java-Webarchiv", ipa: "iOS-App", xpi: "Browser-Erweiterung", crx: "Chrome-Erweiterung", epub: "E-Book (EPUB)", cdr: "Corel-Datei (innen ZIP)",
  nupkg: "NuGet-Paket", whl: "Python-Paket", vsix: "VS-Code-Erweiterung", appx: "Windows-App", msix: "Windows-App", tar: "TAR-Archiv", tgz: "TAR-Archiv (gepackt)", gz: "gepackte Datei" };
const OFFICE_ZIP = new Set("docx docm xlsx xlsm pptx pptm odt ods odp dotx xltx potx".split(" "));

/** Liest ein TAR-Archiv (ustar, GNU-Langnamen). Jede Datei erst auf Abruf. */
export function tarDateien(b, vorsilbe = "") {
  const dateien = [], hinweise = [], D = new TextDecoder("utf-8");
  const kette = (o, n) => { let e = o; while (e < o + n && b[e]) e++; return D.decode(b.subarray(o, e)); };
  let p = 0, langName = null;
  while (p + 512 <= b.length) {
    if (b[p] === 0 && b[p + 1] === 0) break;                     // Ende (Nullblock)
    const groesse = parseInt(kette(p + 124, 12).trim() || "0", 8) || 0, typ = String.fromCharCode(b[p + 156] || 48);
    const vorne = kette(p + 257, 6) === "ustar" ? kette(p + 345, 155) : "";
    let name = langName || ((vorne ? vorne + "/" : "") + kette(p, 100));
    langName = null;
    const start = p + 512;
    if (start + groesse > b.length) { hinweise.push("Das TAR-Archiv bricht mitten in „" + name + "“ ab — der Rest ist ungeprüft."); break; }
    if (typ === "L") langName = kette(start, groesse);
    else if ((typ === "0" || typ === "7") && !name.endsWith("/")) {
      const von = start, bis = start + groesse;
      dateien.push({ pfad: normPfad(vorsilbe + name), groesse, lesen: () => b.subarray(von, bis) });
    }
    p = start + Math.ceil(groesse / 512) * 512;
  }
  return { dateien, hinweise };
}

async function archivOeffnen(pfad, b) {
  const end = endungVon(pfad), vor = pfad + "/";
  if (b[0] === 0x50 && b[1] === 0x4B && (b[2] === 3 || b[2] === 5) && !OFFICE_ZIP.has(end)) {
    const z = zipDateien(b, vor);
    if (z.kaputt) return null;
    return { name: ARCHIV_NAME[end] || "ZIP-Archiv", dateien: z.dateien, hinweise: z.hinweise };
  }
  const istTar = (x) => x.length > 262 && String.fromCharCode(...x.subarray(257, 262)) === "ustar";
  if (b[0] === 0x1f && b[1] === 0x8b) {
    const roh = await entpacke(b, "gzip", GROESSE_MAX);
    if (istTar(roh)) { const t = tarDateien(roh, vor); return { name: ARCHIV_NAME[end] || "TAR-Archiv (gepackt)", dateien: t.dateien, hinweise: t.hinweise }; }
    const innen = dateiName(pfad).replace(/\.t?gz$/i, (m) => m.toLowerCase() === ".tgz" ? ".tar" : "") || "inhalt";
    return { name: "gepackte Datei", dateien: [{ pfad: normPfad(vor + innen), groesse: roh.length, bytes: roh }], hinweise: [] };
  }
  if (istTar(b)) { const t = tarDateien(b, vor); return { name: "TAR-Archiv", dateien: t.dateien, hinweise: t.hinweise }; }
  return null;
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
    marke("ARCHIV", "Archiv im Projekt — ZIP, APK, JAR, TAR und GZ werden geöffnet und mitgeprüft; RAR und 7z nicht.");
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
const RE_STRASSE = new RegExp(VOR + "((?:[A-ZÄÖÜ][a-zäöüß.-]+[ \\t]){0,2}[A-ZÄÖÜ][a-zäöüß-]*(?:" + ENDUNG + "))\\s+(\\d{1,4}(?:\\s?[a-zA-Z])?(?:\\s?[-–/]\\s?\\d{1,4}[a-z]?)?)(?![A-Za-z0-9_])", "g");
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

/* Selbst eingetragene Namen und Begriffe (was die Suche nicht erkennt): überall, ohne Groß/klein. */
function begriffeIn(text, begriffe) {
  const aus = [];
  for (const b of begriffe || []) {
    const w = String(b).trim();
    if (w.length < 2) continue;
    const re = new RegExp((/[A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9_]/.test(w[0]) ? VOR : "") + esc(w).replace(/\s+/g, "\\s+") + (/[A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9_]/.test(w[w.length - 1]) ? NACH : ""), "giu");
    let m; while ((m = re.exec(text))) aus.push({ art: "BEGRIFF", wert: m[0], index: m.index, satz: "Selbst eingetragen — die Suche hatte es nicht erkannt." });
  }
  return aus;
}

function gefuehltInTextMit(pfad, text, melde, quelle, begriffe) {
  for (const f of begriffeIn(text, begriffe)) melde({ schicht: "hart", art: "BEGRIFF", wert: f.wert, pfad, zeile: quelle ? undefined : zeileVon(text, f.index), stelle: quelle, satz: f.satz });
  for (const f of gefuehlt(text)) {
    melde({ schicht: "gefuehlt", art: f.art, wert: f.wert, pfad, zeile: quelle ? undefined : zeileVon(text, f.index), stelle: quelle, satz: f.satz, vorschlag: f.vorschlag });
  }
}

/* Datei- und Ordnernamen: „fotos/Hamburg-2019/Lena.jpg“ verrät auch etwas. Jeder Ordner nur einmal. */
function gefuehltImPfad(pfad, gesehen, melde, begriffe) {
  const teile = pfad.split("/");
  for (let i = 0; i < teile.length; i++) {
    const ordner = teile.slice(0, i + 1).join("/");
    if (gesehen.has(ordner)) continue;
    gesehen.add(ordner);
    const ohneEndung = i === teile.length - 1 ? teile[i].replace(/\.[A-Za-z0-9]{1,10}$/, "") : teile[i];
    const lesbar = ohneEndung.replace(/[_]+/g, " ");
    for (const f of [...begriffeIn(lesbar, begriffe), ...gefuehlt(lesbar, { modus: "pfad" })]) {
      if (f.art === "ORDNERPFAD") continue;
      melde({ schicht: f.art === "BEGRIFF" ? "hart" : "gefuehlt", art: f.art, wert: f.wert, pfad, stelle: i === teile.length - 1 ? "im Dateinamen" : "im Ordnernamen „" + ordner + "/“",
        satz: f.satz, vorschlag: f.vorschlag });
    }
  }
}

/* Anweisungen an eine KI in Text und Code (Klaus 2026-10-28: „mindestens so eine Prüfung wie bei Workflow PDF“).
 * Dieselbe Liste wie im Anhang-Prüfer (pruefer-mail.js, DATEI_KI_ARTEN dort) — aber direkt, mit echter Zeile:
 * der ganze Anhang-Prüfer hielte jede .js-Datei für „getarnt“ (innen Text, Endung .js). */
const KI_ARTEN = ["KI-ANWEISUNG", "KI-BEGRIFF", "UNSICHTBARE-ZEICHEN", "VERSTECKTER-TEXT"];
const KI_TEXT_MAX = 2 * 1024 * 1024;
function kiInText(PM, pfad, text, melde, quelle) {
  const t = text.length > KI_TEXT_MAX ? text.slice(0, KI_TEXT_MAX) : text;
  for (const st of PM.pruefeMail("\n" + t).stellen) {
    if (!KI_ARTEN.includes(st.kennung)) continue;
    const zeile = Math.max(1, st.zeile - 1);
    melde({ schicht: "auffaellig", art: st.kennung, wert: st.satz, pfad, zeile: quelle ? undefined : zeile, stelle: quelle, satz: st.satz });
  }
  return text.length > KI_TEXT_MAX;
}

const SCHICHT_VON_KENNUNG = (k) => /METADATEN(?!-KI)|HERKUNFT|ALTFASSUNG/.test(k) ? "meta" : "auffaellig";

/**
 * Prüft eine Liste von Dateien. Liest nur, ändert nichts.
 * @returns {Promise<{inventur, befunde, buendel, hinweise, zahlen}>}
 */
export async function pruefe(dateien, optionen = {}) {
  const w = optionen.werkzeuge || globalThis;
  const M25 = w.SbkimPseudonym, PA = w.PrueferAnhang, PM = w.PrueferMail;
  const fortschritt = optionen.fortschritt || (() => {});
  const begriffe = (optionen.begriffe || []).map(String).filter((b) => b.trim().length >= 2);
  /* Stufe 7: die Sperrliste sucht überall mit, wo die gefühlten Metadaten suchen (Text, PDF, Office, .git, Zeichenketten). */
  const sperr = optionen.sperrliste ? sperrlisteLesen(optionen.sperrliste) : null;
  const sperrInText = (pfad, text, melde, quelle) => {
    if (!sperr) return;
    const zeile = quelle ? null : zeilenFinder(text);
    for (const tr of sperrTreffer(text, sperr)) melde({ schicht: "hart", art: "GESPERRT", wert: tr.wert, pfad, zeile: zeile ? zeile(tr.index) : undefined, stelle: quelle,
      satz: "Steht auf deiner Sperrliste (der Fingerabdruck stimmt) — ein bekannter fremder Wert." });
  };
  const gefuehltInText = (pfad, text, melde, quelle) => { gefuehltInTextMit(pfad, text, melde, quelle, begriffe); sperrInText(pfad, text, melde, quelle); };
  const inventur = [], befunde = [], hinweise = [];
  if (optionen.sperrliste && !sperr) hinweise.push("Die Sperrliste ist beschädigt oder aus einer neueren Fassung — sie wurde NICHT benutzt.");
  if (!M25 || typeof M25.find !== "function")
    hinweise.push("Modul 25 (harte Angaben) fehlt — Namen, Mail, Telefon, IBAN, Datum und Schlüssel sind UNGEPRÜFT, nicht sauber.");
  if (!PM || typeof PM.pruefeMail !== "function")
    hinweise.push("Die Liste der KI-Anweisungen (pruefer-mail.js) fehlt — Texte und Code sind auf Anweisungen an eine KI UNGEPRÜFT, nicht sauber.");
  if (!PA || typeof PA.pruefe !== "function")
    hinweise.push("Der Anhang-Prüfer (pruefer-anhang.js) fehlt — Bilder, PDF und Office-Dateien sind UNGEPRÜFT, nicht sauber.");

  const liste = dateien.map((d) => Object.assign({}, d, { pfad: normPfad(d.pfad) })).sort((a, b) => a.pfad < b.pfad ? -1 : a.pfad > b.pfad ? 1 : 0);
  const sprung = new Map();          // übersprungener Ordner → { anzahl, groesse }
  let gitPakete = 0, gitObjekte = 0, gitObjekteZuviel = 0;
  const pfadeGesehen = new Set();   // Ordnernamen werden nur einmal geprüft
  let archivZahl = 0, archivSumme = 0, archivZuviel = 0;
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
    if (d.imArchiv) eintrag.imArchiv = d.imArchiv;
    const melde = (b) => { befunde.push(b); eintrag.befunde++; };
    const imGit = /(^|\/)\.git\//.test(d.pfad);
    if (!imGit) gefuehltImPfad(d.pfad, pfadeGesehen, melde, begriffe);
    if (!imGit && sperr) for (const tr of sperrTreffer(d.pfad.replace(/_/g, " "), sperr)) melde({ schicht: "hart", art: "GESPERRT", wert: d.pfad.slice(tr.index, tr.ende), pfad: d.pfad, stelle: "im Datei- oder Ordnernamen",
      satz: "Steht auf deiner Sperrliste (der Fingerabdruck stimmt) — ein bekannter fremder Wert." });
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
        if (PM) kiInText(PM, d.pfad, t.text, melde, "alter Stand in .git");
      } else if (/^tree /.test(kopf)) { /* Dateinamen, keine Personen */ }
      else eintrag.ungeprueft = "Binärinhalt in .git — nur Zeichenketten geprüft";
      continue;
    }

    /* Archiv im Projekt: öffnen und seinen Inhalt mitprüfen. Nichts wird ausgeführt. */
    if ((d.tiefe || 0) < ARCHIV_TIEFE_MAX && (art === "zip" || bytes[0] === 0x1f && bytes[1] === 0x8b || bytes.length > 262 && bytes[257] === 0x75 && bytes[258] === 0x73)) {
      let auf = null;
      try { auf = await archivOeffnen(d.pfad, bytes); } catch (e) { eintrag.ungeprueft = "Archiv nicht zu öffnen (" + (e && e.message || e) + ") — ungeprüft"; }
      if (auf) {
        Object.assign(eintrag, einordnen(d.pfad, ""), { art: "archiv", artName: auf.name + " · geöffnet, " + auf.dateien.length + " Dateien", archiv: auf.dateien.length });
        eintrag.stufe = 3; eintrag.stufeName = STUFE_NAME[3];
        if (!eintrag.marken.some((m) => m.kennung === "ARCHIV")) eintrag.marken.push({ kennung: "ARCHIV", satz: "Archiv — sein Inhalt wurde geöffnet und mitgeprüft." });
        for (const h of auf.hinweise) hinweise.push(d.pfad + ": " + h);
        for (const x of auf.dateien) {
          if (archivZahl >= ARCHIV_DATEIEN_MAX || archivSumme + (x.groesse || 0) > ARCHIV_SUMME_MAX) { archivZuviel++; continue; }
          archivZahl++; archivSumme += x.groesse || 0;
          liste.push(Object.assign(x, { tiefe: (d.tiefe || 0) + 1, imArchiv: d.pfad }));
        }
        continue;
      }
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
      if (PM) { if (kiInText(PM, d.pfad, t.text, melde)) eintrag.ungeprueft = (eintrag.ungeprueft ? eintrag.ungeprueft + " · " : "") + "auf KI-Anweisungen nur die ersten 2 MB geprüft"; }
      else eintrag.ungeprueft = (eintrag.ungeprueft ? eintrag.ungeprueft + " · " : "") + "auf KI-Anweisungen ungeprüft (pruefer-mail.js fehlt)";
      /* HTML zusätzlich durch den HTML-Prüfer des Auslieferungsprüfers (versteckter Text per CSS, fremde Adressen …). */
      if (art === "html" && PA && /\.(html?|xhtml)$/i.test(d.pfad)) {
        try {
          const r = await PA.pruefe(d.pfad, bytes);
          for (const x of r.befunde) if (!KI_ARTEN.includes(x.kennung)) melde({ schicht: SCHICHT_VON_KENNUNG(x.kennung), art: x.kennung, wert: x.satz, pfad: d.pfad, satz: x.satz });
        } catch { /* der Text ist oben schon geprüft */ }
      }
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
      /* Bildpunkte: versteckter Text in den untersten Bits (PNG, verlustfreies WebP). Nur im Browser. */
      let pixelOffen = "";
      if (/^(png|webp)$/.test(r.art) && typeof PA.verdachtPruefen === "function") {
        try {
          const v = await PA.verdachtPruefen(d.pfad, bytes);
          for (const x of v.befunde) melde({ schicht: "auffaellig", art: x.kennung, wert: x.satz, pfad: d.pfad, satz: x.satz });
          if (!v.geprueft && /^(png|webp)$/.test(v.art)) pixelOffen = v.grund;
        } catch (e) { pixelOffen = "Bildpunkte nicht geprüft (" + (e && e.message || e) + ")"; }
      }
      const offen = [];
      if (r.textUngeprueft || r.ungeprueftSatz) offen.push(r.ungeprueftSatz || "Text ungeprüft");
      if (r.bildUngeprueft) offen.push(optionen.texterkennung ? "Text im Bild ungeprüft (" + (r.ungeprueftSatz || "Texterkennung lief nicht") + ")" : "Text im Bild ungeprüft — Knopf „Text in Bildern lesen“");
      if (pixelOffen) offen.push(pixelOffen);
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
    if (s && PM) kiInText(PM, d.pfad, s, melde, "Zeichenkette in der Datei");
    if (imGit) gitInText(d.pfad, s, melde);
    eintrag.ungeprueft = "nur lesbare Zeichenketten geprüft" + (end ? " (." + end + ")" : "") + " — der Rest ist ungeprüft" +
      (/^(rar|7z)$/.test(end) || bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 || bytes[0] === 0x37 && bytes[1] === 0x7A ? ". RAR und 7z kann die App nicht öffnen: bitte als ZIP packen und neu einwerfen" : "");
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
  /* Ein Wert, den die Suche ohnehin gefunden hat (Mail, Name …), kommt nicht doppelt: er trägt nur das Zeichen „gesperrt“. */
  if (sperr) {
    const andere = new Map();
    for (const b of befunde) if (b.art !== "GESPERRT") { const k = String(b.wert).toLowerCase(); if (!andere.has(k)) andere.set(k, []); andere.get(k).push(b); }
    for (let i = befunde.length - 1; i >= 0; i--) {
      const b = befunde[i];
      if (b.art !== "GESPERRT" || !andere.has(String(b.wert).toLowerCase())) continue;
      for (const x of andere.get(String(b.wert).toLowerCase())) { x.gesperrt = true; if (!/Sperrliste/.test(x.satz || "")) x.satz = (x.satz ? x.satz + " · " : "") + "steht auf deiner Sperrliste"; }
      befunde.splice(i, 1);
      const e = inventur.find((x) => x.pfad === b.pfad); if (e) e.befunde--;
    }
  }
  if (gitPakete) hinweise.push(gitPakete + " Git-Paket-Datei(en) nicht ausgepackt — die Geschichte darin ist ungeprüft. Die saubere Kopie bekommt ohnehin kein .git.");
  if (archivZuviel) hinweise.push(archivZuviel + " Datei(en) in Archiven über dem Deckel (" + ARCHIV_DATEIEN_MAX + " Dateien / " + (ARCHIV_SUMME_MAX >> 20) + " MB) nicht geöffnet — ungeprüft.");
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
    if (b.gesperrt) x.gesperrt = true;
    x.stellen.push({ pfad: b.pfad, zeile: b.zeile, stelle: b.stelle });
  }
  const reihe = { hart: 0, meta: 1, gefuehlt: 2, auffaellig: 3 };
  return Array.from(karte.values()).map((x) => { x.dateien = new Set(x.stellen.map((s) => s.pfad)).size; return x; })
    .sort((a, b) => reihe[a.schicht] - reihe[b.schicht] || b.anzahl - a.anzahl || (a.art < b.art ? -1 : a.art > b.art ? 1 : 0));
}

/* ══ Stufe 2: Entscheiden, Reinigen, saubere Kopie, Stellenplan, Nachprüfung ══
 * Die Zuordnung (welche Marke für welchen Wert steht) bleibt im Speicher und geht
 * NIE in die saubere Kopie — sie gehört später in den Tresor (Stufe 5). */

export const WEGE = ["auto", "marke", "muster", "eigen", "behalten"];
/* Auffälliges in Textdateien (Anweisung an eine KI, unsichtbare Zeichen …): nur melden oder die Zeile entfernen. */
export const WEGE_ZEILE = ["behalten", "zeile"];
/** Lässt sich ein auffälliger Fund durch Entfernen seiner Zeile(n) loswerden? (Nur Textdateien mit Zeilennummer.) */
export function zeileEntfernbar(b) { return b.schicht === "auffaellig" && b.stellen.length > 0 && b.stellen.every((s) => s.zeile && !s.stelle); }
export const WEG_NAME = { auto: "Automatisch", marke: "Marke", muster: "Musterwert", eigen: "Eigener Wert", behalten: "Behalten", zeile: "Zeile entfernen" };
export const STELLENPLAN_DATEI = "REINIGER-STELLENPLAN.txt";
export const STELLENPLAN_JSON = "REINIGER-STELLENPLAN.json";
export const BERICHT_DATEI = "REINIGER-BERICHT.txt";

/* Marken-Kürzel: gleiche Sorte, gleiche Reihe (⟦NAME-1⟧, ⟦ORT-2⟧). */
const KUERZEL = {
  NAME: "NAME", EIGENNAME: "NAME", VERFASSER: "NAME", COPYRIGHT: "NAME", "GIT-NAME": "NAME",
  MAIL: "MAIL", "GIT-ADRESSE": "ADRESSE-GIT", TELEFON: "TELEFON", IBAN: "IBAN", DATUM: "DATUM", SCHLUESSEL: "SCHLUESSEL",
  BENUTZERPFAD: "BENUTZER", BEGRIFF: "NAME", ORT: "ORT", "PLZ-ORT": "ORT", ADRESSE: "ADRESSE", HOCHSCHULE: "HOCHSCHULE", FIRMA: "FIRMA",
  KFZ: "KFZ", RECHNER: "RECHNER", ORDNERPFAD: "PFAD", GESPERRT: "GESPERRT",
};
/* Doku bekommt Marken, Code bekommt Musterwerte (damit das Programm weiterläuft). */
const DOKU_ENDUNG = new Set("md markdown txt rst adoc tex eml mbox log".split(" "));
export function istDoku(pfad) { return DOKU_ENDUNG.has(endungVon(pfad)) || /^(readme|license|changelog|authors|contributors)$/i.test(dateiName(pfad)); }

function musterWert(art, n, original) {
  const z = n > 1 ? " " + n : "";
  switch (art) {
    case "NAME": case "VERFASSER": case "COPYRIGHT": case "GIT-NAME":
      return n === 1 ? "Max Mustermann" : n === 2 ? "Erika Mustermann" : "Muster Person " + n;
    case "BEGRIFF":
    case "EIGENNAME": return /\s/.test(original) ? (n === 1 ? "Max Mustermann" : "Muster Person " + n) : "Mustername" + (n > 1 ? n : "");
    case "MAIL": return "muster" + n + "@beispiel.example";
    case "GIT-ADRESSE": return /@/.test(original) && !/\//.test(original) ? "muster" + n + "@beispiel.example" : "https://git.beispiel.example/muster/projekt" + n + ".git";
    case "TELEFON": return "+49 30 " + String(1000000 + n).slice(-7);
    case "IBAN": return "DE89370400440532013000";
    case "DATUM": return "01.01.2000";
    case "SCHLUESSEL": return "MUSTER-SCHLUESSEL-" + n;
    case "BENUTZERPFAD": return "muster" + (n > 1 ? n : "");
    case "ORT": return "Musterstadt" + z;
    case "PLZ-ORT": return "12345 Musterstadt" + z;
    case "ADRESSE": return "Musterstraße " + n;
    case "HOCHSCHULE": return "Musterhochschule" + z;
    case "FIRMA": return "Musterfirma" + z + " GmbH";
    case "KFZ": return "XX-MU " + n;
    case "RECHNER": return "MUSTER-PC-" + n;
    case "ORDNERPFAD": return /^\//.test(original) ? "/Volumes/Musterordner" + n : "C:\\Musterordner" + n;
    case "GESPERRT": return "Musterwert-gesperrt-" + n;
    default: return "Musterwert " + n;
  }
}
const ERSETZBAR = new Set(Object.keys(KUERZEL));
/** Lässt sich dieses Bündel Stelle für Stelle ersetzen? (Auffälliges und Metadaten in PDF/Bildern nicht — die gehen mit dem Neubau weg, Stufe 4.) */
export function ersetzbar(b) { return ERSETZBAR.has(b.art) && b.schicht !== "auffaellig"; }

/* Umgebungsdateien (.env): JEDER Wert wird ersetzt, nicht nur die erkannten — dort steht fast nur Geheimes. */
const RE_ENV_ZEILE = /^([ \t]*(?:export[ \t]+)?[A-Za-z_][A-Za-z0-9_.-]*[ \t]*[=:][ \t]*)(\S.*?)[ \t]*$/gm;
function envLeeren(text) {
  const zeile = zeilenFinder(text), stellen = [];
  const neu = text.replace(RE_ENV_ZEILE, (alles, kopf, wert, pos) => {
    if (/^(muster|⟦|#)/i.test(wert) || /^["']?["']?$/.test(wert)) return alles;
    stellen.push({ zeile: zeile(pos), art: "SCHLUESSEL", artName: "Wert in Umgebungsdatei", weg: "muster", ersatz: "MUSTER-WERT" });
    return kopf + "MUSTER-WERT";
  });
  return { text: neu, stellen };
}

/** Der Schlüssel eines Bündels — damit hängt eine Entscheidung an „Hamburg, 14×“. */
export function buendelSchluessel(b) { return b.schicht + "|" + b.art + "|" + String(b.wert).toLowerCase(); }

/** Kann diese Datei Stelle für Stelle gereinigt werden (Stufe 1, ganz gelesen)? */
export function reinigbar(e) {
  return !!e && e.gelesen && !e.ungeprueft && e.stufe === 1 && /^(text|html|svg|)$/.test(e.art || "") && !/(^|\/)\.git\//.test(e.pfad);
}

/** Was mit einer Datei geschieht, die nicht Stelle für Stelle gereinigt werden kann.
    Jede bekommt ihre möglichen Wege (`wege`) und eine Vorgabe: neu zeichnen, wenn das geht und die
    Datei ganz gelesen wurde; sonst weglassen. „Unverändert“ gibt es immer, aber nie als Vorgabe. */
export function dateiPlan(ergebnis) {
  const aus = [];
  for (const e of ergebnis.inventur) {
    if (e.art === "ordner" || e.imArchiv || reinigbar(e)) continue;
    if (/(^|\/)\.git(\/|$)/.test(e.pfad)) continue;                     // .git geht nie mit
    const blatt = blattArt(e), muster = musterFuer(e.pfad), wege = [];
    if (blatt) wege.push("neu");
    if (muster && e.art !== "archiv") wege.push("muster");
    wege.push("weg", "original");
    let grund, vorgabe = "weg";
    /* Eine PDF mit Textebene darf neu gezeichnet werden, auch wenn ihr Text nicht gegen das Seitenbild gelesen
       wurde (das Neuzeichnen beseitigt versteckten Text ohnehin). Gescannte Seiten ohne Texterkennung nicht. */
    const scanOffen = (e.hinweise || []).some((h) => /ohne Textebene/.test(h) && !/Text im Bild gelesen/.test(h));
    if (blatt === "pdf" && e.ungeprueft && !scanOffen) { vorgabe = "neu"; grund = (e.artName || "PDF") + " — wird neu gezeichnet: ohne Metadaten und ohne Textebene (versteckter Text ist danach weg), graue Kästen an den gefundenen Stellen"; }
    else if (e.art === "archiv") grund = (e.artName || "Archiv") + " — Inhalt geprüft; zum Reinigen auspacken und den Ordner einwerfen";
    else if (blatt && !e.ungeprueft) { vorgabe = "neu"; grund = (e.artName || "Datei") + (blatt === "office" ? " — wird als reiner Text neu gebaut (ohne Bilder und Formatierung)" : " — wird neu gezeichnet: ohne Metadaten, graue Kästen an den gefundenen Stellen"); }
    else if (blatt) grund = e.ungeprueft + " — neu zeichnen geht trotzdem, dann bleibt sichtbarer Text ungeprüft";
    else if (e.ungeprueft) grund = e.ungeprueft;
    else grund = (e.artName || "Datei") + " — lässt sich nur weglassen" + (muster ? ", durch ein Muster ersetzen" : "") + " oder unverändert übernehmen";
    aus.push({ pfad: e.pfad, grund, befunde: e.befunde, marken: e.marken.map((m) => m.kennung), wege, vorgabe, blatt, muster });
  }
  return aus;
}

function zeilenFinder(text) {
  const starts = [0];
  for (let i = text.indexOf("\n"); i !== -1; i = text.indexOf("\n", i + 1)) starts.push(i + 1);
  return (pos) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= pos) lo = m; else hi = m - 1; } return lo + 1; };
}

/* Baut die Ersetzungstabelle: Originalwert (und seine Schreibweise mit \\) → Ersatz je Weg. */
function ersetzungen(ergebnis, wahl) {
  const varianten = new Map();                       // schluessel → Set exakter Werte
  for (const b of ergebnis.befunde) {
    if (!ERSETZBAR.has(b.art) || b.schicht === "auffaellig") continue;
    const k = buendelSchluessel(b);
    if (!varianten.has(k)) varianten.set(k, new Set());
    varianten.get(k).add(String(b.wert));
  }
  const zaehler = {}, zaehlerMuster = {}, posten = [];
  for (const b of ergebnis.buendel) {
    const k = buendelSchluessel(b);
    if (!varianten.has(k)) continue;
    const w = Object.assign({ weg: "auto" }, wahl && wahl[k]);
    if (w.weg === "eigen" && !String(w.wert || "").trim()) w.weg = "auto";   // leerer eigener Wert: nicht stehen lassen
    const kz = KUERZEL[b.art];
    zaehler[kz] = (zaehler[kz] || 0) + 1;
    zaehlerMuster[b.art] = (zaehlerMuster[b.art] || 0) + 1;
    posten.push({
      schluessel: k, art: b.art, artName: b.artName, weg: w.weg, eigen: w.wert,
      marke: "⟦" + kz + "-" + zaehler[kz] + "⟧", markePfad: kz + "-" + zaehler[kz],
      muster: musterWert(b.art, zaehlerMuster[b.art], b.wert),
      werte: Array.from(varianten.get(k)).filter((v) => v.trim().length >= 2),
    });
  }
  return posten;
}

/* Beim Neubau (Office, PDF-Seiten, Texterkennung) wird der EIGENE gelesene Text noch einmal durchsucht:
   der Anhang-Prüfer liest manches anders (z. B. klebt er gelöschten Word-Text an den Absatz), dann hieße
   der gefundene Wert anders als im Neubau. Was zusätzlich auftaucht, wird mit ersetzt und steht im Bericht. */
async function nachfinden(text, posten, optionen) {
  if (!String(text).trim()) return 0;
  const r = await pruefe([{ pfad: "neubau.txt", bytes: new TextEncoder().encode(text) }], { werkzeuge: optionen.werkzeuge, begriffe: optionen.begriffe });
  const bekannt = new Set(posten.flatMap((p) => p.werte)), neu = new Map();
  for (const b of r.befunde) {
    if (!ERSETZBAR.has(b.art) || b.schicht === "auffaellig") continue;
    const v = String(b.wert);
    if (v.trim().length < 2 || bekannt.has(v) || /^(⟦|muster)/i.test(v)) continue;
    bekannt.add(v);
    const k = buendelSchluessel(b), da = posten.find((p) => p.schluessel === k);
    if (da) { da.werte.push(v); continue; }
    if (!neu.has(k)) neu.set(k, { b, werte: [] });
    neu.get(k).werte.push(v);
  }
  for (const [k, { b, werte }] of neu) {
    const w = Object.assign({ weg: "auto" }, optionen.wahl && optionen.wahl[k]);
    if (w.weg === "eigen" && !String(w.wert || "").trim()) w.weg = "auto";
    const kz = KUERZEL[b.art], n = posten.filter((p) => KUERZEL[p.art] === kz).length + 1, nm = posten.filter((p) => p.art === b.art).length + 1;
    posten.push({ schluessel: k, art: b.art, artName: ART_NAME[b.art] || b.art, weg: w.weg, eigen: w.wert, marke: "⟦" + kz + "-" + n + "⟧", markePfad: kz + "-" + n,
      muster: musterWert(b.art, nm, werte[0]), werte, nachgefunden: true });
  }
  return neu.size;
}

/**
 * Vorschau einer Wahl (Klaus 2026-10-29: „die Änderung gleich sehen, während ich das anklicke“): eine Zeile so,
 * wie sie nach dem Reinigen aussähe — nur dieses Bündel ersetzt, dieselbe Regel und dieselbe Nummer wie in `reinige`.
 * @returns {{ text: string, ersatz: string | null }}
 */
export function vorschau(ergebnis, wahl, schluessel, pfad, zeile) {
  const p = ersetzungen(ergebnis, wahl).find((x) => x.schluessel === schluessel);
  if (!p) return { text: String(zeile), ersatz: null };
  return { text: ersetzeAlles(String(zeile), [p], pfad).text, ersatz: ersatzFuer(p, pfad) };
}

function ersatzFuer(p, pfad, imPfad, doku) {
  if (p.weg === "behalten") return null;
  if (p.weg === "eigen") return String(p.eigen);
  if (imPfad) return p.weg === "marke" ? p.markePfad : p.muster;
  if (p.weg === "marke") return p.marke;
  if (p.weg === "muster") return p.muster;
  return (doku != null ? doku : istDoku(pfad)) ? p.marke : p.muster;
}

/* Ein Suchmuster über alle Werte, längste zuerst; Wortgrenzen nur dort, wo der Wert mit einem Wortzeichen beginnt/endet. */
function ersetzeAlles(text, posten, pfad, imPfad, doku) {
  const wz = imPfad ? "A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9" : WZ;
  const tabelle = new Map();
  for (const p of posten) {
    const ersatz = ersatzFuer(p, pfad, imPfad, doku);
    if (ersatz == null) continue;
    for (const v of p.werte) {
      if (!tabelle.has(v)) tabelle.set(v, { p, ersatz });
      if (v.includes("\\")) { const d = v.replace(/\\/g, "\\\\"); if (!tabelle.has(d)) tabelle.set(d, { p, ersatz: ersatz.replace(/\\/g, "\\\\") }); }
    }
  }
  if (!tabelle.size) return { text, stellen: [] };
  const wortZ = new RegExp("[" + wz + "]");
  const teile = Array.from(tabelle.keys()).sort((a, b) => b.length - a.length).map((v) =>
    (wortZ.test(v[0]) ? "(?<![" + wz + "])" : "") + esc(v) + (wortZ.test(v[v.length - 1]) ? "(?![" + wz + "])" : ""));
  const re = new RegExp(teile.join("|"), "g");
  const zeile = imPfad ? null : zeilenFinder(text);
  const stellen = [];
  const neu = text.replace(re, (treffer, pos) => {
    const t = tabelle.get(treffer);
    stellen.push({ zeile: zeile ? zeile(pos) : undefined, art: t.p.art, artName: t.p.artName, weg: t.p.weg, ersatz: t.ersatz, schluessel: t.p.schluessel });
    return t.ersatz;
  });
  return { text: neu, stellen };
}

/**
 * Reinigt: Jede Datei der Stufe 1 bekommt an jeder gefundenen Stelle (und an jeder
 * weiteren Stelle mit demselben Wert) Marke, Musterwert oder eigenen Wert. .git geht
 * nie mit, übersprungene Ordner auch nicht; was sich nicht reinigen lässt, wird
 * weggelassen, außer es steht in `uebernehmen`.
 * @param dateien   dieselbe Liste wie für `pruefe`
 * @param entscheidungen { ergebnis, wahl?: { [buendelSchluessel]: { weg, wert? } }, uebernehmen?: string[],
 *        dateiWahl?: { [pfad]: "neu" | "muster" | "weg" | "original" }, mustermappe?: boolean }
 * @param optionen  { werkzeuge?, texterkennung?, fortschritt? } — für neu gezeichnete Blätter (Zeichner)
 * @returns {Promise<{ sauber, stellenplan, zuordnung, bericht }>}
 */
export async function reinige(dateien, entscheidungen, optionen = {}) {
  const { ergebnis, wahl = {}, uebernehmen = [], dateiWahl = {} } = entscheidungen;
  const fortschritt = optionen.fortschritt || (() => {});
  const plan = new Map(dateiPlan(ergebnis).map((p) => [p.pfad, p]));
  const neuGezeichnet = [], musterErsetzt = [];
  const belegt = new Set();
  const posten = ersetzungen(ergebnis, wahl);
  /* Zeilen, die ganz weg sollen (auffällige Funde mit Wahl „zeile“): Pfad → Map(Zeile → Art) */
  const zeilenWeg = new Map();
  for (const b of ergebnis.buendel) {
    if (!zeileEntfernbar(b) || !wahl[buendelSchluessel(b)] || wahl[buendelSchluessel(b)].weg !== "zeile") continue;
    for (const s of b.stellen) { if (!zeilenWeg.has(s.pfad)) zeilenWeg.set(s.pfad, new Map()); zeilenWeg.get(s.pfad).set(s.zeile, b); }
  }
  const inv = new Map(ergebnis.inventur.map((e) => [e.pfad, e]));
  const mitnehmen = new Set(uebernehmen.map(normPfad));
  const sauber = [], stellenplan = [], weggelassen = [], unveraendert = [];
  const T = new TextEncoder();
  let gitDateien = 0;
  const imArchiv = ergebnis.inventur.filter((x) => x.imArchiv).length;
  const neuerPfad = (pfad) => pfad.split("/").map((seg) => ersetzeAlles(seg, posten, pfad, true).text).join("/");
  for (const d of dateien) {
    const pfad = normPfad(d.pfad);
    if (uebersprungen(pfad)) continue;
    if (/(^|\/)\.git(\/|$)/.test(pfad)) { gitDateien++; continue; }
    const e = inv.get(pfad);
    if (e && e.imArchiv) continue;       // Inhalt eines Archivs: geprüft, geht aber nicht einzeln mit
    const ziel = neuerPfad(pfad);
    const pfadStellen = ziel !== pfad ? ersetzeAlles(pfad, posten, pfad, true).stellen : [];
    for (const s of pfadStellen) stellenplan.push({ pfad: ziel, stelle: "Datei- oder Ordnername", art: s.art, artName: s.artName, weg: s.weg, ersatz: s.ersatz });
    if (reinigbar(e)) {
      const bytes = d.bytes || await d.lesen();
      const t = textAus(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
      if (!t) { weggelassen.push({ pfad, grund: "nicht als Text lesbar" }); continue; }
      const r = ersetzeAlles(t.text, posten, pfad, false);
      if (e.marken.some((m) => m.kennung === "ENV")) { const x = envLeeren(r.text); r.text = x.text; r.stellen.push(...x.stellen); }
      if (zeilenWeg.has(pfad)) {
        const weg = zeilenWeg.get(pfad), zeilen = r.text.split("\n");
        for (const [nr, b] of weg) if (nr >= 1 && nr <= zeilen.length) {
          zeilen[nr - 1] = istDoku(pfad) ? "⟦ENTFERNT: " + b.artName + "⟧" : "";        // Zeilenzahl bleibt gleich, Stellenplan stimmt
          r.stellen.push({ zeile: nr, art: b.art, artName: b.artName, weg: "zeile", ersatz: zeilen[nr - 1] || "(leere Zeile)" });
        }
        r.text = zeilen.join("\n");
      }
      for (const s of r.stellen) stellenplan.push({ pfad: ziel, zeile: s.zeile, art: s.art, artName: s.artName, weg: s.weg, ersatz: s.ersatz });
      sauber.push({ pfad: ziel, von: pfad, bytes: T.encode(r.text), gereinigt: r.stellen.length });
      continue;
    }
    const pp = plan.get(pfad);
    let weg = dateiWahl[pfad] || (mitnehmen.has(pfad) ? "original" : pp ? pp.vorgabe : "weg");
    if (pp && !pp.wege.includes(weg)) weg = "weg";
    if (weg === "neu" && (d.bytes || d.lesen)) {
      fortschritt(neuGezeichnet.length + 1, 0, pfad);
      const bytes = d.bytes || await d.lesen();
      const r = await blattNeu(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), e, posten, Object.assign({}, optionen, { wahl }));
      if (r.fehler) { weggelassen.push({ pfad: ziel, grund: "neu zeichnen ging nicht (" + r.fehler + ") — weggelassen" }); continue; }
      let zielNeu = ziel;
      const alt = endungVon(ziel), soll = { jpeg: ["jpg", "jpeg", "jpe"], png: ["png"], webp: ["webp"], pdf: ["pdf"], docx: ["docx"], xlsx: ["xlsx"], pptx: ["pptx"] }[r.art] || [];
      if (!soll.includes(alt)) {
        zielNeu = ziel.replace(/(\.[^./]*)?$/, "." + (r.art === "jpeg" ? "jpg" : r.art));
        while (belegt.has(zielNeu) || dateien.some((x) => normPfad(x.pfad) === zielNeu)) zielNeu = zielNeu.replace(/(\.[^./]*)$/, "-neu$1");
        stellenplan.push({ pfad: zielNeu, stelle: "Datei- oder Ordnername", art: "DATEIART", artName: "Dateiart", weg: "muster", ersatz: "neu als " + r.art.toUpperCase() + " (war ." + (alt || "?") + ")" });
      }
      belegt.add(zielNeu);
      for (const s of r.stellen) stellenplan.push(Object.assign({ pfad: zielNeu }, s));
      sauber.push({ pfad: zielNeu, von: pfad, bytes: r.bytes, neu: r.art, gereinigt: r.stellen.length });
      neuGezeichnet.push({ pfad: zielNeu, art: r.art, seiten: r.seiten || 0, kaesten: r.stellen.length, versteckt: r.versteckt || {}, hinweise: r.hinweise || [], ohneText: r.ohneText || 0 });
      continue;
    }
    if (weg === "muster" && pp && pp.muster) {
      const mappe = await mustermappe(), m = mappe.find((x) => x.pfad === pp.muster);
      sauber.push({ pfad: ziel, von: pfad, bytes: m.bytes, muster: pp.muster });
      musterErsetzt.push({ pfad: ziel, vorlage: pp.muster });
      continue;
    }
    if (weg === "original" && (d.bytes || d.lesen)) {
      const bytes = d.bytes || await d.lesen();
      sauber.push({ pfad: ziel, von: pfad, bytes: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), unveraendert: true });
      unveraendert.push(ziel);
      continue;
    }
    weggelassen.push({ pfad: ziel, grund: e ? (pp && pp.blatt ? (e.artName || "Datei") + " — bewusst weggelassen (neu zeichnen war möglich)" : e.ungeprueft || (e.artName || "Datei") + " lässt sich nicht Stelle für Stelle reinigen") : "nicht geprüft" });
  }
  /* Mustermappe: alles erfunden. Steht ein entfernter Wert zufällig auch darin (Klaus' Test 2026-10-29: das Beispielprojekt
     nutzte dieselbe erfundene Mail wie die Mustertabelle), geht die Datei nicht mit — sonst stünde der Wert wieder in der Kopie. */
  if (entscheidungen.mustermappe) {
    const weg = posten.filter((p) => p.weg !== "behalten").flatMap((p) => p.werte).map((w) => String(w).toLowerCase()).filter((w) => w.length >= 3);
    for (const m of await mustermappe()) {
      const ziel = MUSTERMAPPE_ORDNER + "/" + m.pfad, t = new TextDecoder().decode(m.bytes).toLowerCase();
      if (weg.some((w) => t.includes(w))) { weggelassen.push({ pfad: ziel, grund: "Mustermappe — enthält zufällig einen entfernten Wert aus dem Projekt, deshalb weggelassen" }); continue; }
      sauber.push({ pfad: ziel, bytes: m.bytes, mappe: true });
    }
  }
  const zuordnung = {};                                  // NUR im Speicher, nie in der Kopie
  for (const p of posten) if (p.weg !== "behalten") zuordnung[p.marke] = { art: p.art, werte: p.werte.slice(), muster: p.muster, eigen: p.weg === "eigen" ? p.eigen : undefined };
  const uebersprungenOrdner = ergebnis.inventur.filter((e) => e.art === "ordner").map((e) => e.pfad);
  for (const d of dateien) { const e = inv.get(normPfad(d.pfad)); if (e && e.art === "archiv") { const w = weggelassen.find((x) => x.pfad === neuerPfad(e.pfad)); if (w) w.grund = "Archiv — sein Inhalt wurde geprüft; um ihn zu reinigen, das Archiv auspacken und den Ordner einwerfen"; } }
  const bericht = { posten: posten.map((p) => ({ art: p.art, artName: p.artName, weg: p.weg, marke: p.marke, nachgefunden: !!p.nachgefunden })), weggelassen, unveraendert, gitDateien, uebersprungenOrdner, imArchiv,
    stellen: stellenplan.length, dateien: sauber.filter((d) => !d.mappe).length, neuGezeichnet, musterErsetzt, mustermappe: sauber.filter((d) => d.mappe).length };
  /* Auffälliges, das bewusst stehen bleiben soll (Wahl „behalten“ ausdrücklich gesetzt): zählt bei der Nachprüfung als behalten. */
  const behaltenAuffaellig = new Set(ergebnis.buendel.filter((b) => b.schicht === "auffaellig" && wahl[buendelSchluessel(b)] && wahl[buendelSchluessel(b)].weg === "behalten").map((b) => b.art + "|" + b.wert));
  bericht.zeilenEntfernt = stellenplan.filter((s) => s.weg === "zeile").length;
  return { sauber, stellenplan, zuordnung, bericht, posten, behaltenAuffaellig };
}

/* Stellenplan als Text: Theater-Sitzplan — wo ein Platz belegt war, nicht von wem. */
export function stellenplanText(stellenplan) {
  const breit = Math.min(60, Math.max(10, ...stellenplan.map((s) => s.pfad.length)));
  const kopf = "Stellenplan — Projekt-Reiniger Pro\n" +
    "Jede Zeile ist eine Stelle, an der eine Angabe ersetzt wurde. Der Plan nennt keine Originalwerte.\n" +
    "Mit ihm lassen sich später die EIGENEN Angaben genau an diese Stellen setzen.\n\n";
  return kopf + stellenplan.map((s) => s.pfad.padEnd(breit) + "  " + (s.zeile ? ("Zeile " + s.zeile).padEnd(11) : (s.stelle || "").padEnd(11)) + "  " +
    (s.weg === "eigen" ? "eigener Wert" : s.ersatz) + "   Art: " + s.artName + (s.weg !== "marke" && s.weg !== "eigen" && !/^⟦/.test(s.ersatz) ? " (Musterwert)" : "")).join("\n") + "\n";
}

/* Gründe für versteckten Text (wie reinigung.js aus Workflow PDF sie nennt). */
const GRUND_VERSTECKT = { winzig: "winzige Schrift", aussen: "außerhalb der Seite", unsichtbar: "unsichtbar (Farbe wie der Grund)" };

/* Bericht: sagt nur, WAS entfernt wurde — keine Werte. */
export function berichtText(bericht, nach) {
  const proArt = new Map();
  for (const p of bericht.posten) {
    const x = proArt.get(p.artName) || { gesamt: 0, behalten: 0 }; x.gesamt++; if (p.weg === "behalten") x.behalten++; proArt.set(p.artName, x);
  }
  const z = [];
  z.push("Bericht — Projekt-Reiniger Pro", "Dieser Bericht nennt keine Werte, nur was ersetzt oder weggelassen wurde.", "");
  z.push("Ersetzt: " + bericht.stellen + " Stellen in " + bericht.dateien + " Dateien.");
  for (const [art, x] of proArt) z.push("  · " + art + ": " + (x.gesamt - x.behalten) + " Wert(e) ersetzt" + (x.behalten ? ", " + x.behalten + " bewusst behalten" : ""));
  const nachgefunden = bericht.posten.filter((p) => p.nachgefunden).length;
  if (nachgefunden) z.push("  · davon beim Neubau zusätzlich gefunden und ersetzt: " + nachgefunden + " Wert(e) (der neu gelesene Text wurde noch einmal durchsucht)");
  if (bericht.gitDateien) z.push("", ".git entfernt (" + bericht.gitDateien + " Dateien) — die eigene Geschichte beginnt bei null.");
  if (bericht.zeilenEntfernt) z.push("Zeilen entfernt (Anweisungen an eine KI, unsichtbare Zeichen …): " + bericht.zeilenEntfernt + ".");
  if (bericht.imArchiv) z.push("Inhalt von Archiven im Projekt: " + bericht.imArchiv + " Dateien geprüft, gehen aber nicht einzeln mit (das Archiv selbst steht unten bei „Weggelassen“).");
  if (bericht.uebersprungenOrdner.length) z.push("Nicht mitgenommen (nie gelesen): " + bericht.uebersprungenOrdner.join(", ") + " — nach dem Auspacken neu installieren (z. B. npm install).");
  if (bericht.weggelassen.length) { z.push("", "Weggelassen (" + bericht.weggelassen.length + "):"); for (const w of bericht.weggelassen) z.push("  · " + w.pfad + " — " + w.grund); }
  if (bericht.neuGezeichnet && bericht.neuGezeichnet.length) {
    z.push("", "Neu gebaut (" + bericht.neuGezeichnet.length + ") — ohne Metadaten. PDF und Bilder: neu gezeichnet, graue Kästen an den gefundenen Stellen, Rauschen über die untersten Bits. Office: nur der Text, Marken mit grauem Grund:");
    for (const n of bericht.neuGezeichnet) {
      const v = Object.entries(n.versteckt).map(([g, k]) => k + "× " + (GRUND_VERSTECKT[g] || g)).join(", ");
      const office = /^(docx|xlsx|pptx)$/.test(n.art);
      z.push("  · " + n.pfad + " — " + (n.seiten > 1 ? n.seiten + " Seiten, " : "") + n.kaesten + (office ? " Stelle(n) ersetzt" : " Kasten/Kästen") + (v ? "; versteckter Text entfernt: " + v : "") + (n.hinweise.length ? "; " + n.hinweise.join("; ") : ""));
    }
  }
  if (bericht.musterErsetzt && bericht.musterErsetzt.length) { z.push("", "Durch ein Muster ersetzt (" + bericht.musterErsetzt.length + "):"); for (const m of bericht.musterErsetzt) z.push("  · " + m.pfad + " — Vorlage " + MUSTERMAPPE_ORDNER + "/" + m.vorlage); }
  if (bericht.mustermappe) z.push("", "Mustermappe beigelegt: " + MUSTERMAPPE_ORDNER + "/ (" + bericht.mustermappe + " Dateien, alles erfunden).");
  if (bericht.unveraendert.length) { z.push("", "Unverändert übernommen, NICHT gereinigt (" + bericht.unveraendert.length + "):"); for (const p of bericht.unveraendert) z.push("  · " + p); }
  if (nach) {
    z.push("", "Nachprüfung: die saubere Kopie wurde noch einmal ganz durchsucht.");
    z.push("  · Originalwerte in der Kopie: " + nach.originalTreffer.length + (nach.originalTreffer.length ? " — NICHT sauber" : ""));
    z.push("  · neue Funde: " + nach.offen.length + (nach.offen.length ? " — bitte ansehen" : ""));
    z.push("  · bewusst behalten: " + nach.behalten);
    if (nach.ungeprueft) z.push("  · ungeprüft: " + nach.ungeprueft + " Datei(en)" + (nach.ungeprueftListe ? ": " + nach.ungeprueftListe.map((u) => u.pfad).join(", ") : ""));
  }
  z.push("", "Die Suche arbeitet mit Mustern und Listen und findet nicht garantiert alles.");
  return z.join("\n") + "\n";
}

/**
 * Nachprüfung: die saubere Kopie wird noch einmal ganz durchsucht. Was offen bleibt,
 * wird laut genannt. Außerdem wird jeder entfernte Originalwert in jeder Datei (auch
 * Stellenplan und Bericht) gesucht — er darf nirgends mehr stehen.
 */
export async function nachpruefe(gereinigt, optionen = {}) {
  const { sauber, posten } = gereinigt;
  const mappe = new Set(sauber.filter((d) => d.mappe).map((d) => d.pfad));
  const r = await pruefe(sauber.map((d) => ({ pfad: d.pfad, bytes: d.bytes })), optionen);
  const ersatz = new Set(), behaltenWerte = new Set();
  for (const p of posten) {
    ersatz.add(p.marke.toLowerCase()); ersatz.add(p.muster.toLowerCase()); ersatz.add(p.markePfad.toLowerCase());
    if (p.weg === "eigen") ersatz.add(String(p.eigen).toLowerCase());
    if (p.weg === "behalten") for (const v of p.werte) behaltenWerte.add(v.toLowerCase());
  }
  const eigen = (w) => { const l = String(w).toLowerCase(); return ersatz.has(l) || /⟦|muster/i.test(l) || [...ersatz].some((e) => e.length > 3 && l.includes(e)); };
  let behalten = 0;
  const offen = [];
  for (const b of r.buendel) {
    if (b.schicht === "auffaellig") { if (gereinigt.behaltenAuffaellig && gereinigt.behaltenAuffaellig.has(b.art + "|" + b.wert)) { behalten++; continue; } offen.push(b); continue; }
    if (behaltenWerte.has(String(b.wert).toLowerCase())) { behalten++; continue; }
    if (eigen(b.wert)) continue;
    offen.push(b);
  }
  /* Harte Gegenprobe: jeder entfernte Originalwert, Byte für Byte in jeder Datei gesucht. */
  const D = new TextDecoder("utf-8");
  const originalTreffer = [];
  const alle = [...sauber];
  if (optionen.zusatz) alle.push(...optionen.zusatz);
  for (const d of alle) {
    const text = D.decode(d.bytes) + "\n" + d.pfad;
    for (const p of posten) {
      if (p.weg === "behalten") continue;
      for (const v of p.werte) {
        if (p.weg === "eigen" && String(p.eigen).includes(v)) continue;
        if (ersatz.has(v.toLowerCase())) continue;
        const wortZ = /[A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9_]/;
        const re = new RegExp((wortZ.test(v[0]) ? "(?<![" + WZ + "])" : "") + esc(v) + (wortZ.test(v[v.length - 1]) ? "(?![" + WZ + "])" : ""));
        if (re.test(text)) originalTreffer.push({ pfad: d.pfad, art: p.art, artName: p.artName });
      }
    }
  }
  const ungeprueftListe = r.inventur.filter((e) => e.ungeprueft && !mappe.has(e.pfad)).map((e) => ({ pfad: e.pfad, grund: e.ungeprueft }));
  return { offen, behalten, originalTreffer, ungeprueft: ungeprueftListe.length, ungeprueftListe, ergebnis: r };
}

/* ── ZIP schreiben (für die saubere Kopie) ─────────────────────────────── */
let CRC_TAFEL;
function crc32(b) {
  if (!CRC_TAFEL) { CRC_TAFEL = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_TAFEL[n] = c >>> 0; } }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < b.length; i++) c = CRC_TAFEL[(c ^ b[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
async function packe(bytes) {
  if (typeof CompressionStream !== "function") return null;
  const cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter();
  w.write(bytes).catch(() => {}); w.close().catch(() => {});
  const r = cs.readable.getReader(), teile = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; teile.push(value); n += value.length; }
  return zusammen(teile, n);
}

/** Baut ein ZIP aus `{ pfad, bytes }` (UTF-8-Namen, deflate wo es sich lohnt; `packen: false` = gespeichert). Fester Zeitstempel: verrät nichts. */
export async function zipBauen(dateien, opt = {}) {
  const T = new TextEncoder(), teile = [], zentral = []; let off = 0;
  const DOS_ZEIT = 0, DOS_DATUM = (20 << 9) | (1 << 5) | 1;      // 01.01.2000 00:00
  for (const d of dateien) {
    const name = T.encode(normPfad(d.pfad)), roh = d.bytes, crc = crc32(roh);
    let daten = roh, methode = 0;
    if (opt.packen !== false && roh.length > 64) { const g = await packe(roh); if (g && g.length < roh.length) { daten = g; methode = 8; } }
    const lh = new Uint8Array(30 + name.length), v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x800, true); v.setUint16(8, methode, true);
    v.setUint16(10, DOS_ZEIT, true); v.setUint16(12, DOS_DATUM, true); v.setUint32(14, crc, true);
    v.setUint32(18, daten.length, true); v.setUint32(22, roh.length, true); v.setUint16(26, name.length, true); lh.set(name, 30);
    const ch = new Uint8Array(46 + name.length), c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(10, methode, true);
    c.setUint16(12, DOS_ZEIT, true); c.setUint16(14, DOS_DATUM, true); c.setUint32(16, crc, true);
    c.setUint32(20, daten.length, true); c.setUint32(24, roh.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true); ch.set(name, 46);
    teile.push(lh, daten); zentral.push(ch); off += lh.length + daten.length;
  }
  const zl = zentral.reduce((n, x) => n + x.length, 0), ende = new Uint8Array(22), e = new DataView(ende.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, dateien.length, true); e.setUint16(10, dateien.length, true); e.setUint32(12, zl, true); e.setUint32(16, off, true);
  return zusammen([...teile, ...zentral, ende], off + zl + 22);
}

/**
 * Alles in einem Schritt für die Oberfläche: reinigen, nachprüfen, Stellenplan und
 * Bericht beilegen, ZIP bauen. Die Zuordnung kommt zurück, aber nicht in das ZIP.
 */
export async function saubereKopie(dateien, entscheidungen, optionen = {}) {
  const g = await reinige(dateien, entscheidungen, optionen);
  const T = new TextEncoder();
  const planT = T.encode(stellenplanText(g.stellenplan));
  const planJ = T.encode(JSON.stringify({ fassung: KERN_FASSUNG, stellen: g.stellenplan.map(({ pfad, zeile, stelle, art, weg, ersatz, kasten }) => ({ pfad, zeile, stelle, art, weg, ersatz: weg === "eigen" ? undefined : ersatz, kasten })) }, null, 1));
  const vorab = [{ pfad: STELLENPLAN_DATEI, bytes: planT }, { pfad: STELLENPLAN_JSON, bytes: planJ }];
  const nach = await nachpruefe(g, Object.assign({}, optionen, { zusatz: vorab }));
  const berichtB = T.encode(berichtText(g.bericht, nach));
  const beilagen = [...vorab, { pfad: BERICHT_DATEI, bytes: berichtB }];
  const zip = await zipBauen([...g.sauber, ...beilagen]);
  return Object.assign(g, { nach, beilagen, zip });
}

/* ── Stufe 4: neu gezeichnete Blätter, Mustermappe ─────────────────────────
 *
 * Fremde PDFs, Bilder und Office-Dateien werden nicht übernommen. An ihre Stelle kommt
 * ein NEU GEZEICHNETES Blatt: gleiche Größe, gleicher Name, keine Metadaten. Wo ein
 * gefundener Wert stand, sitzt ein grauer Kasten mit Etikett („E-Mail entfernt“).
 * Nicht schwärzen: ein Balken verrät die Länge und lässt in einer PDF den Text darunter
 * stehen. Deshalb wird die Seite als Bild neu gezeichnet; der alte Text ist nicht mehr da.
 *
 * Teilung der Arbeit (der Kern bleibt ohne DOM):
 *   - der Aufrufer bringt einen ZEICHNER mit (`werkzeuge.Zeichner`, im Browser app.js):
 *     Seite/Bild öffnen → Bildpunkte, Etiketten schreiben, Bildpunkte als PNG/JPEG kodieren;
 *   - der Kern entscheidet: wo Kästen hin, welcher Text versteckt ist (reinigung.js aus
 *     Workflow PDF, byte-1:1: `werkzeuge.WFP.Reinigung`), Rauschen über die untersten Bits,
 *     die PDF-Datei selbst, Word/Excel/PowerPoint (reiner Text, neu gebaut), Mustermappe.
 *
 * ⚠ Grenzen, benannt: Office wird als TEXT neu gebaut (Bilder, Formatierung, Formeln,
 *   Kommentare und Änderungsverlauf gehen verloren). Ein Bild ohne Texterkennung bekommt
 *   keine Kästen (sichtbarer Text bleibt — der Bericht sagt das). Gesichter und Schrift,
 *   die die Texterkennung nicht liest, findet niemand. Gedrehter PDF-Text bekommt einen
 *   Kasten um das ganze Stück. */

export const BLATT_SEITEN_MAX = 100;                 // mehr Seiten zeichnet die App nicht neu
export const DATEI_WEGE = ["neu", "muster", "weg", "original"];
export const DATEI_WEG_NAME = { neu: "Neu zeichnen", muster: "Durch Muster ersetzen", weg: "Weglassen", original: "Unverändert übernehmen (NICHT gereinigt)" };
export const MUSTERMAPPE_ORDNER = "MUSTERMAPPE";

/** Lässt sich diese Datei als Blatt neu bauen? "bild" | "pdf" | "office" | null */
export function blattArt(e) {
  if (!e || !e.gelesen || e.imArchiv || /(^|\/)\.git\//.test(e.pfad)) return null;
  if (e.art === "pdf") return "pdf";
  if (/^(png|jpeg|webp|gif)$/.test(e.art)) return "bild";
  if (/^(docx|xlsx|pptx)$/.test(e.art)) return "office";
  return null;
}

/* Etikett eines Kastens: nie der Wert, nur die Art — oder der gewählte Muster-/eigene Wert. */
function etikettVon(p) {
  if (p.weg === "eigen") return String(p.eigen);
  if (p.weg === "muster") return p.muster;
  if (/^(NAME|EIGENNAME|BEGRIFF|VERFASSER|COPYRIGHT|GIT-NAME)$/.test(p.art)) return "Name entfernt";
  return String(ART_NAME[p.art] || p.artName || "Angabe").replace(/\s*\(Vorschlag\)$/, "") + " entfernt";
}

/* Zeichen einer Seite in Zeilen, jedes Zeichen mit seinem Kasten in Bildpunkten.
   PDF: aus den Stücken der Textebene (Seiteneinheiten, massstab = Bildpunkte je Einheit);
   Texterkennung: aus den Wörtern (schon in Bildpunkten). */
function zeilenAusStuecken(stuecke, m) {
  const gerade = stuecke.filter((s) => !s.schraeg).sort((a, b) => a.y - b.y || a.x - b.x);
  const zeilen = [];
  for (const st of gerade) {
    let z = zeilen.find((x) => Math.abs(x.y - st.y) < Math.max(1, Math.min(x.fh, st.fh) * 0.5));
    if (!z) { z = { y: st.y, fh: st.fh, teile: [] }; zeilen.push(z); }
    z.teile.push(st);
  }
  const aus = [];
  for (const z of zeilen) {
    z.teile.sort((a, b) => a.x - b.x);
    const zeichen = [];
    let ende = -Infinity;
    for (const st of z.teile) {
      const s = String(st.s);
      if (zeichen.length && st.x - ende > st.fh * 0.2) zeichen.push({ c: " " });
      const y0 = (st.y - st.fh * 0.95) * m, y1 = (st.y + st.fh * 0.28) * m;
      /* `anteile`: wo jedes Zeichen beginnt (0…1 der Breite), gemessen vom Zeichner; sonst gleich breit geschätzt. */
      const an = Array.isArray(st.anteile) && st.anteile.length === s.length + 1 ? st.anteile : null;
      for (let i = 0; i < s.length; i++)
        zeichen.push({ c: s[i], x0: (st.x + st.w * (an ? an[i] : i / s.length)) * m, x1: (st.x + st.w * (an ? an[i + 1] : (i + 1) / s.length)) * m, y0, y1, fh: st.fh * m });
      ende = st.x + st.w;
    }
    aus.push(zeichen);
  }
  for (const st of stuecke.filter((s) => s.schraeg && s.kasten)) {
    const [x0, y0, x1, y1] = st.kasten;                 // gedreht: das ganze Stück
    aus.push(Array.from(String(st.s), (c) => ({ c, x0, y0, x1, y1 })));
  }
  return aus;
}
function zeilenAusWoertern(zeilen) {
  return zeilen.map((z) => {
    const zeichen = [];
    for (const w of z) {
      const s = String(w.s || "");
      if (!s) continue;
      if (zeichen.length) zeichen.push({ c: " " });
      for (let i = 0; i < s.length; i++) zeichen.push({ c: s[i], x0: w.x0 + (w.x1 - w.x0) * i / s.length, x1: w.x0 + (w.x1 - w.x0) * (i + 1) / s.length, y0: w.y0, y1: w.y1 });
    }
    return zeichen;
  });
}

/* Wo steht ein Wert in einer Zeile? Verglichen werden Folgen von Wortstücken (nur Buchstaben und
   Ziffern, ohne Groß/klein): „anna@beispiel.example“ = anna·beispiel·example. So findet sich
   „Hamburg“ in „Hamburg-Altona“, aber „Lena“ nicht in „Helena“. Auch wenn die Texterkennung ein
   Wort zerlegt („Muster mann“), passt die Folge. */
const RE_STUECK = /[\p{L}\p{N}]+/gu;
const norm = (s) => (String(s).toLowerCase().match(RE_STUECK) || []).join("");
function trefferInZeile(zeichen, posten) {
  const text = zeichen.map((z) => z.c).join("");
  const stuecke = [];
  for (const m of text.matchAll(RE_STUECK)) stuecke.push({ n: m[0].toLowerCase(), von: m.index, bis: m.index + m[0].length });
  const aus = [];
  for (const p of posten) {
    if (p.weg === "behalten") continue;
    for (const v of p.werte) {
      const nv = norm(v);
      if (nv.length < 2) continue;
      for (let i = 0; i < stuecke.length; i++) {
        if (!nv.startsWith(stuecke[i].n)) continue;
        let acc = "";
        for (let j = i; j < stuecke.length && acc.length < nv.length; j++) {
          acc += stuecke[j].n;
          if (!nv.startsWith(acc)) break;
          if (acc === nv) { aus.push({ p, von: stuecke[i].von, bis: stuecke[j].bis }); break; }
        }
      }
    }
  }
  const kaesten = [];
  for (const t of aus) {
    const jeZeile = new Map();                         // ein Wert über zwei Zeilen: je Zeile ein Kasten
    for (let k = t.von; k < t.bis; k++) {
      const z = zeichen[k];
      if (z.x0 == null) continue;
      const b = jeZeile.get(z.zeile) || { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      b.x0 = Math.min(b.x0, z.x0); b.x1 = Math.max(b.x1, z.x1); b.y0 = Math.min(b.y0, z.y0); b.y1 = Math.max(b.y1, z.y1);
      jeZeile.set(z.zeile, b);
    }
    for (const b of jeZeile.values()) if (b.x1 > b.x0 && b.y1 > b.y0) kaesten.push(Object.assign({ p: t.p }, b));
  }
  return kaesten;
}

/* Ein Kasten bekommt Rand und eine gerundete Breite (mindestens Platz fürs Etikett): so verrät
   er die Länge des Wortes nicht. Er darf Nachbarn mit zudecken — lieber zu viel als zu wenig. */
function kastenFormen(k, breite, hoehe) {
  const h0 = k.y1 - k.y0, pad = Math.max(1, h0 * 0.12), seite = Math.max(2, h0 * 0.22);     // seitlich mehr: Zeichenbreiten sind genähert
  let y0 = k.y0 - pad, y1 = k.y1 + pad;
  const h = y1 - y0, einheit = Math.max(4, h * 1.6);
  let w = Math.ceil(Math.max(k.x1 - k.x0 + 2 * seite, h * 5) / einheit) * einheit;
  let x0 = k.x0 - seite;
  if (x0 + w > breite) x0 = Math.max(0, breite - w);
  w = Math.min(w, breite - x0);
  y0 = Math.max(0, y0); y1 = Math.min(hoehe, y1);
  return { p: k.p, x0: Math.round(x0), y0: Math.round(y0), x1: Math.round(x0 + w), y1: Math.round(y1), etikett: etikettVon(k.p) };
}
function ueberlappt(a, b) { return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1; }

/** Die Kästen einer Seite. Versteckter Text (reinigung.js) wird zugedeckt und gezählt, nicht umrahmt. */
export function blattKaesten(seite, posten, R, versteckt = {}) {
  const m = seite.massstab || 1, bild = seite.bild, zeilen = [];
  if (seite.stuecke && seite.stuecke.length) {
    const sicht = [];
    for (const st of seite.stuecke) {
      if (!String(st.s || "").trim()) continue;
      if (R && !st.schraeg) {
        const g = R.versteckt(st, bild, m);
        if (g) { versteckt[g] = (versteckt[g] || 0) + 1; R.zudecken(bild, st, m); continue; }
      }
      sicht.push(st);
    }
    zeilen.push(...zeilenAusStuecken(sicht, m));
  }
  if (seite.woerter && seite.woerter.length) zeilen.push(...zeilenAusWoertern(seite.woerter));
  /* Alle Zeilen in Lesefolge hintereinander (mit Leerzeichen dazwischen): so findet sich auch ein Wert, der über
     einen Zeilenumbruch läuft. Jedes Zeichen behält seine Zeile. */
  const alle = [];
  zeilen.forEach((z, i) => { if (alle.length) alle.push({ c: " " }); for (const c of z) alle.push(Object.assign(c, { zeile: i })); });
  const roh = trefferInZeile(alle, posten);
  const kaesten = [];
  for (const k of roh.map((x) => kastenFormen(x, bild.width, bild.height))) {
    if (k.x1 <= k.x0 || k.y1 <= k.y0) continue;
    kaesten.push(Object.assign(k, { alle: [k.p] }));
  }
  /* Überlappende Kästen (auch verschiedener Funde, z. B. „Hamburg“ in „22767 Hamburg“) werden einer:
     ein Etikett, keine doppelte Schrift. Das Etikett nimmt der breiteste Fund; der Stellenplan nennt jeden. */
  for (let i = 0; i < kaesten.length; i++) for (let j = i + 1; j < kaesten.length; j++) {
    const a = kaesten[i], b = kaesten[j];
    if (!ueberlappt(a, b)) continue;
    const breiter = (b.x1 - b.x0) > (a.x1 - a.x0) ? b : a;
    Object.assign(a, { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), p: breiter.p, etikett: breiter.etikett,
      alle: [...a.alle, ...b.alle.filter((p) => !a.alle.includes(p))] });
    kaesten.splice(j, 1); j = i;
  }
  return kaesten;
}

/** Grauer Kasten mit dunklerem Rand, direkt in die Bildpunkte (das Etikett schreibt der Zeichner). */
export function kastenMalen(bild, k) {
  const D = bild.data, W = bild.width;
  const x0 = Math.max(0, k.x0), y0 = Math.max(0, k.y0), x1 = Math.min(W, k.x1), y1 = Math.min(bild.height, k.y1);
  const rand = Math.max(1, Math.round((y1 - y0) / 24));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * 4, r = x - x0 < rand || x1 - 1 - x < rand || y - y0 < rand || y1 - 1 - y < rand;
    const v = r ? 128 : 205;
    D[i] = v; D[i + 1] = v; D[i + 2] = v; D[i + 3] = 255;
  }
}

/** Rauschen über das unterste Bit jeder Farbe: eine Botschaft in den untersten Bits überlebt
    ein Neuzeichnen als PNG (gemessen im Sende-Prüfer) — danach nicht mehr. */
export function rauschen(bild) {
  const D = bild.data;
  let s = (Math.random() * 0xFFFFFFFF) >>> 0 || 0x9E3779B9;
  for (let i = 0; i < D.length; i += 4) {
    s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
    D[i] = (D[i] & 0xFE) | (s & 1); D[i + 1] = (D[i + 1] & 0xFE) | ((s >>> 1) & 1); D[i + 2] = (D[i + 2] & 0xFE) | ((s >>> 2) & 1);
  }
}

function lageVon(k, W, H) {
  const cx = (k.x0 + k.x1) / 2 / W, cy = (k.y0 + k.y1) / 2 / H;
  const v = cy < 1 / 3 ? "oben" : cy > 2 / 3 ? "unten" : "Mitte", h = cx < 1 / 3 ? "links" : cx > 2 / 3 ? "rechts" : "Mitte";
  return v === "Mitte" && h === "Mitte" ? "Mitte" : v === "Mitte" ? "Mitte " + h : v + (h === "Mitte" ? " Mitte" : " " + h);
}

/* Bild oder PDF neu zeichnen (braucht den Zeichner des Aufrufers). */
async function blattZeichnen(bytes, art, posten, optionen) {
  const w = optionen.werkzeuge || globalThis, Z = w.Zeichner, R = w.WFP && w.WFP.Reinigung;
  if (!Z || typeof Z.oeffne !== "function") return { fehler: "neu zeichnen geht nur im Browser (kein Zeichner)" };
  const dok = await Z.oeffne(bytes, art, { texterkennung: !!optionen.texterkennung });
  if (!dok || !(dok.anzahl >= 1)) return { fehler: "keine Seite lesbar" };
  if (dok.anzahl > BLATT_SEITEN_MAX) { if (dok.schliessen) await dok.schliessen(); return { fehler: dok.anzahl + " Seiten — mehr als " + BLATT_SEITEN_MAX + " zeichnet die App nicht neu" }; }
  const stellen = [], versteckt = {}, seiten = [], hinweise = [];
  let ohneText = 0, kaestenZahl = 0, ergebnisArt = art === "pdf" ? "pdf" : null, ausBytes = null;
  try {
    for (let i = 0; i < dok.anzahl; i++) {
      const s = await dok.seite(i);
      await nachfinden([...(s.stuecke || []).map((x) => x.s), ...(s.woerter || []).map((z) => z.map((x) => x.s).join(" "))].join("\n"), posten, optionen);
      const ks = blattKaesten(s, posten, R, versteckt);
      for (const k of ks) kastenMalen(s.bild, k);
      if (ks.length && typeof Z.beschrifte === "function") await Z.beschrifte(s, ks);
      rauschen(s.bild);
      if (!(s.stuecke && s.stuecke.length) && !s.woerter) ohneText++;
      kaestenZahl += ks.length;   // gezeichnete Kästen (zusammengelegte zählen einmal)
      const m = s.massstab || 1;
      for (const k of ks) for (const p of k.alle || [k.p]) stellen.push({
        stelle: (art === "pdf" ? "Seite " + (i + 1) + " · " : "") + "Kasten " + lageVon(k, s.bild.width, s.bild.height),
        art: p.art, artName: p.artName, weg: p.weg === "auto" ? "marke" : p.weg,
        ersatz: p.weg === "eigen" || p.weg === "muster" ? etikettVon(p) : "grauer Kasten „" + k.etikett + "“ " + p.marke,
        kasten: { seite: i + 1, x: +(k.x0 / m).toFixed(1), y: +(k.y0 / m).toFixed(1), w: +((k.x1 - k.x0) / m).toFixed(1), h: +((k.y1 - k.y0) / m).toFixed(1) },
      });
      if (art === "pdf") {
        const k = await Z.kodiere(s, "jpeg");
        const jpeg = R ? R.jpegOhneMeta(k.bytes).bytes : k.bytes;
        seiten.push({ breite: s.breite, hoehe: s.hoehe, bild: { jpeg, w: s.bild.width, h: s.bild.height } });
      } else {
        const ziel = art === "jpeg" ? "jpeg" : art === "webp" ? "webp" : "png";
        const k = await Z.kodiere(s, ziel);
        ergebnisArt = k.art || ziel;
        ausBytes = ergebnisArt === "jpeg" && R ? R.jpegOhneMeta(k.bytes).bytes : k.bytes;
      }
      if (dok.freigeben) dok.freigeben(i);
    }
  } finally { if (dok.schliessen) await dok.schliessen(); }
  if (art === "pdf") ausBytes = pdfBauen(seiten);
  if (!R && art === "pdf") hinweise.push("reinigung.js fehlt — versteckter Text wurde nicht gezählt (er ist mit dem Neuzeichnen trotzdem weg)");
  if (ohneText) hinweise.push(art === "pdf" ? ohneText + " Seite(n) ohne Textebene und ohne Texterkennung — dort sitzen keine Kästen, sichtbarer Text ist UNGEPRÜFT"
    : "Text im Bild ungeprüft (Texterkennung aus) — keine Kästen, sichtbarer Text bleibt sichtbar");
  return { bytes: ausBytes, art: ergebnisArt, stellen, versteckt, seiten: dok.anzahl, kaesten: kaestenZahl, hinweise, ohneText };
}

/* ── Office: als reiner Text neu gebaut ─────────────────────────────────── */
const XML_WEG = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;
const xmlEsc = (s) => String(s).replace(XML_WEG, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function xmlText(s) {
  return String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_a, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_a, d) => String.fromCodePoint(+d)).replace(/&amp;/g, "&");
}
async function zipLeser(bytes) {
  const z = zipDateien(bytes);
  if (z.kaputt) throw new Error("Inhaltsverzeichnis nicht lesbar");
  const karte = new Map(z.dateien.map((d) => [d.pfad, d]));
  const D = new TextDecoder("utf-8");
  return { namen: [...karte.keys()], async xml(n) { const d = karte.get(n); if (!d || d.unlesbar) return null; return D.decode(await d.lesen()); } };
}
const nummer = (n) => +(/(\d+)\.xml$/.exec(n) || [0, 0])[1];
const tLesen = (xml, tag) => { let t = ""; for (const x of xml.matchAll(new RegExp("<" + tag + "(?:\\s[^>]*)?>([^<]*)</" + tag + ">|<" + tag + "\\s*/>|<(?:w|a):(tab|br|cr)\\b[^>]*/>", "g"))) t += x[1] != null ? xmlText(x[1]) : x[2] === "tab" ? "\t" : x[2] ? "\n" : ""; return t; };

/* Word: Absätze aus Kopfzeilen, Text, Fußzeilen und Fußnoten (Kommentare und gelöschter Text nicht). */
async function docxLesen(z) {
  const teile = [...z.namen.filter((n) => /^word\/header\d*\.xml$/.test(n)).sort(), "word/document.xml",
    ...z.namen.filter((n) => /^word\/(footer\d*|footnotes|endnotes)\.xml$/.test(n)).sort()];
  const absaetze = [];
  for (const n of teile) {
    const xml = await z.xml(n);
    if (!xml) continue;
    for (const m of xml.matchAll(/<w:p\b[^>]*\/>|<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)) absaetze.push(tLesen(m[0], "w:t"));
  }
  return absaetze;
}
/* Excel: Blätter mit Zellen (Text und zuletzt berechnete Werte; Formeln nicht). */
async function xlsxLesen(z) {
  const geteilt = [];
  const ss = await z.xml("xl/sharedStrings.xml");
  if (ss) for (const m of ss.matchAll(/<si>([\s\S]*?)<\/si>/g)) geteilt.push(tLesen(m[1].replace(/<rPh\b[\s\S]*?<\/rPh>/g, ""), "t"));
  const wb = (await z.xml("xl/workbook.xml")) || "", rels = (await z.xml("xl/_rels/workbook.xml.rels")) || "";
  const ziel = {};
  for (const m of rels.matchAll(/<Relationship\b[^>]*>/g)) { const id = (/Id="([^"]*)"/.exec(m[0]) || [])[1], t = (/Target="([^"]*)"/.exec(m[0]) || [])[1]; if (id && t) ziel[id] = "xl/" + t.replace(/^\/?xl\//, "").replace(/^\//, ""); }
  const blaetter = [];
  for (const m of wb.matchAll(/<sheet\b[^>]*>/g)) {
    const name = xmlText((/name="([^"]*)"/.exec(m[0]) || [])[1] || "Blatt"), id = (/r:id="([^"]*)"/.exec(m[0]) || [])[1];
    blaetter.push({ name, pfad: ziel[id] });
  }
  if (!blaetter.length) for (const n of z.namen.filter((x) => /^xl\/worksheets\/sheet\d+\.xml$/.test(x)).sort((a, b) => nummer(a) - nummer(b))) blaetter.push({ name: "Blatt" + nummer(n), pfad: n });
  for (const b of blaetter) {
    b.zellen = [];
    const xml = b.pfad ? await z.xml(b.pfad) : null;
    if (!xml) continue;
    for (const m of xml.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const r = (/\br="([A-Z]+\d+)"/.exec(m[1]) || [])[1], t = (/\bt="([^"]*)"/.exec(m[1]) || [])[1] || "", innen = m[2] || "";
      if (!r) continue;
      const v = (/<v>([^<]*)<\/v>/.exec(innen) || [])[1];
      let wert = null, zahl = false;
      if (t === "s") wert = v != null ? geteilt[+v] : null;
      else if (t === "inlineStr") wert = tLesen(innen, "t");
      else if (v != null) { wert = xmlText(v); zahl = (t === "" || t === "n") && /^-?\d+(\.\d+)?(E[-+]?\d+)?$/i.test(wert); }
      if (wert != null && wert !== "") b.zellen.push({ r, wert, zahl });
    }
  }
  return blaetter;
}
/* PowerPoint: Folien in ihrer Reihenfolge, je Folie die Absätze (Notizen nicht). */
async function pptxLesen(z) {
  const pres = (await z.xml("ppt/presentation.xml")) || "";
  const sz = /<p:sldSz\b[^>]*cx="(\d+)"[^>]*cy="(\d+)"/.exec(pres);
  const folien = [];
  for (const n of z.namen.filter((x) => /^ppt\/slides\/slide\d+\.xml$/.test(x)).sort((a, b) => nummer(a) - nummer(b))) {
    const xml = await z.xml(n);
    folien.push(xml ? [...xml.matchAll(/<a:p\b[^>]*\/>|<a:p\b[^>]*>[\s\S]*?<\/a:p>/g)].map((m) => tLesen(m[0], "a:t")).filter((x) => x.trim()) : []);
  }
  return { folien, cx: sz ? +sz[1] : 12192000, cy: sz ? +sz[2] : 6858000 };
}

/* Eine Marke im neuen Text bekommt einen grauen Grund. */
const RE_MARKE = /(⟦[A-ZÄÖÜ-]+-\d+⟧)/;
function wordLauf(text, grau) {
  const teile = String(text).replace(XML_WEG, "").split(/(\t|\n)/);
  const rpr = grau ? '<w:rPr><w:shd w:val="clear" w:color="auto" w:fill="C8C8C8"/></w:rPr>' : "";
  return teile.map((t) => t === "\t" ? "<w:r>" + rpr + "<w:tab/></w:r>" : t === "\n" ? "<w:r><w:br/></w:r>" : t ? '<w:r>' + rpr + '<w:t xml:space="preserve">' + xmlEsc(t) + "</w:t></w:r>" : "").join("");
}
const wordAbsatz = (text) => "<w:p>" + String(text).split(RE_MARKE).map((t, i) => wordLauf(t, i % 2 === 1)).join("") + "</w:p>";
const ooxmlKopf = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const REL_DOK = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

export function docxBauen(absaetze) {
  const T = new TextEncoder();
  return [
    { pfad: "[Content_Types].xml", bytes: T.encode(ooxmlKopf + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>') },
    { pfad: "_rels/.rels", bytes: T.encode(ooxmlKopf + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL_DOK + '/officeDocument" Target="word/document.xml"/></Relationships>') },
    { pfad: "word/document.xml", bytes: T.encode(ooxmlKopf + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      (absaetze.length ? absaetze : [""]).map(wordAbsatz).join("") + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1134" w:left="1417" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>') },
  ];
}
const spalteZahl = (s) => { let n = 0; for (const c of s) n = n * 26 + c.charCodeAt(0) - 64; return n; };
export function xlsxBauen(blaetter) {
  const T = new TextEncoder(), liste = blaetter.length ? blaetter : [{ name: "Blatt1", zellen: [] }];
  const namen = new Set();
  const blattName = (n, i) => { let x = String(n).replace(/[\[\]:*?\/\\]/g, " ").replace(XML_WEG, "").trim().slice(0, 31) || "Blatt" + (i + 1); while (namen.has(x.toLowerCase())) x = x.slice(0, 28) + " " + (i + 1); namen.add(x.toLowerCase()); return x; };
  const dateien = [
    { pfad: "[Content_Types].xml", bytes: T.encode(ooxmlKopf + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      liste.map((_b, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("") + "</Types>") },
    { pfad: "_rels/.rels", bytes: T.encode(ooxmlKopf + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL_DOK + '/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
    { pfad: "xl/workbook.xml", bytes: T.encode(ooxmlKopf + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + REL_DOK + '"><sheets>' +
      liste.map((b, i) => '<sheet name="' + xmlEsc(blattName(b.name, i)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join("") + "</sheets></workbook>") },
    { pfad: "xl/_rels/workbook.xml.rels", bytes: T.encode(ooxmlKopf + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      liste.map((_b, i) => '<Relationship Id="rId' + (i + 1) + '" Type="' + REL_DOK + '/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join("") +
      '<Relationship Id="rId' + (liste.length + 1) + '" Type="' + REL_DOK + '/styles" Target="styles.xml"/></Relationships>') },
    { pfad: "xl/styles.xml", bytes: T.encode(ooxmlKopf + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFC8C8C8"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="2" borderId="0" xfId="0" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>') },
  ];
  liste.forEach((b, i) => {
    const reihen = new Map();
    for (const c of b.zellen) { const n = +/\d+$/.exec(c.r)[0]; if (!reihen.has(n)) reihen.set(n, []); reihen.get(n).push(c); }
    const xml = [...reihen.keys()].sort((x, y) => x - y).map((n) => '<row r="' + n + '">' + reihen.get(n).sort((x, y) => spalteZahl(/^[A-Z]+/.exec(x.r)[0]) - spalteZahl(/^[A-Z]+/.exec(y.r)[0])).map((c) =>
      c.zahl ? '<c r="' + c.r + '"><v>' + c.wert + "</v></c>"
        : '<c r="' + c.r + '" t="inlineStr"' + (RE_MARKE.test(c.wert) ? ' s="1"' : "") + '><is><t xml:space="preserve">' + xmlEsc(c.wert) + "</t></is></c>").join("") + "</row>").join("");
    dateien.push({ pfad: "xl/worksheets/sheet" + (i + 1) + ".xml", bytes: T.encode(ooxmlKopf + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + xml + "</sheetData></worksheet>") });
  });
  return dateien;
}
const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="' + REL_DOK + '" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const PPTX_THEMA = '<a:theme ' + A.split(" ").slice(0, 1).join(" ") + ' name="Muster"><a:themeElements><a:clrScheme name="Muster"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0B3154"/></a:dk2><a:lt2><a:srgbClr val="F2F7FA"/></a:lt2>' +
  '<a:accent1><a:srgbClr val="0C79D8"/></a:accent1><a:accent2><a:srgbClr val="087F7A"/></a:accent2><a:accent3><a:srgbClr val="2E9EFF"/></a:accent3><a:accent4><a:srgbClr val="68C4FF"/></a:accent4><a:accent5><a:srgbClr val="164F7D"/></a:accent5><a:accent6><a:srgbClr val="8A4B00"/></a:accent6>' +
  '<a:hlink><a:srgbClr val="0C79D8"/></a:hlink><a:folHlink><a:srgbClr val="164F7D"/></a:folHlink></a:clrScheme><a:fontScheme name="Muster"><a:majorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>' +
  '<a:fmtScheme name="Muster"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>' +
  '<a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>' +
  '<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>' +
  '<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';
const leererBaum = '<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
function pptAbsatz(text) {
  return "<a:p>" + String(text).split(RE_MARKE).map((t, i) => t ? '<a:r><a:rPr lang="de-DE" sz="1800" dirty="0">' + (i % 2 ? '<a:highlight><a:srgbClr val="C8C8C8"/></a:highlight>' : "") + '</a:rPr><a:t>' + xmlEsc(t.replace(/[\t\n]/g, " ")) + "</a:t></a:r>" : "").join("") + '<a:endParaRPr lang="de-DE" sz="1800"/></a:p>';
}
export function pptxBauen(p) {
  const T = new TextEncoder(), folien = p.folien.length ? p.folien : [[]], cx = p.cx || 12192000, cy = p.cy || 6858000;
  const rel = (liste) => ooxmlKopf + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + liste.map(([id, typ, ziel]) => '<Relationship Id="' + id + '" Type="' + REL_DOK + "/" + typ + '" Target="' + ziel + '"/>').join("") + "</Relationships>";
  const d = [
    ["[Content_Types].xml", ooxmlKopf + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>' +
      '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' +
      folien.map((_f, i) => '<Override PartName="/ppt/slides/slide' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>').join("") + "</Types>"],
    ["_rels/.rels", rel([["rId1", "officeDocument", "ppt/presentation.xml"]])],
    ["ppt/presentation.xml", ooxmlKopf + "<p:presentation " + A + '><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>' +
      folien.map((_f, i) => '<p:sldId id="' + (256 + i) + '" r:id="rId' + (i + 2) + '"/>').join("") + '</p:sldIdLst><p:sldSz cx="' + cx + '" cy="' + cy + '"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>'],
    ["ppt/_rels/presentation.xml.rels", rel([["rId1", "slideMaster", "slideMasters/slideMaster1.xml"], ...folien.map((_f, i) => ["rId" + (i + 2), "slide", "slides/slide" + (i + 1) + ".xml"]), ["rId" + (folien.length + 2), "theme", "theme/theme1.xml"]])],
    ["ppt/slideMasters/slideMaster1.xml", ooxmlKopf + "<p:sldMaster " + A + ">" + leererBaum + '</p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>'],
    ["ppt/slideMasters/_rels/slideMaster1.xml.rels", rel([["rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"], ["rId2", "theme", "../theme/theme1.xml"]])],
    ["ppt/slideLayouts/slideLayout1.xml", ooxmlKopf + "<p:sldLayout " + A + ' type="blank" preserve="1">' + leererBaum + "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>"],
    ["ppt/slideLayouts/_rels/slideLayout1.xml.rels", rel([["rId1", "slideMaster", "../slideMasters/slideMaster1.xml"]])],
    ["ppt/theme/theme1.xml", ooxmlKopf + PPTX_THEMA],
  ];
  const rand = Math.round(Math.min(cx, cy) * 0.06);
  folien.forEach((abs, i) => {
    d.push(["ppt/slides/slide" + (i + 1) + ".xml", ooxmlKopf + "<p:sld " + A + ">" + leererBaum +
      '<p:sp><p:nvSpPr><p:cNvPr id="2" name="Text"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + rand + '" y="' + rand + '"/><a:ext cx="' + (cx - 2 * rand) + '" cy="' + (cy - 2 * rand) + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>' +
      '<p:txBody><a:bodyPr wrap="square"><a:normAutofit/></a:bodyPr><a:lstStyle/>' + (abs.length ? abs : [""]).map(pptAbsatz).join("") + "</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>"]);
    d.push(["ppt/slides/_rels/slide" + (i + 1) + ".xml.rels", rel([["rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"]])]);
  });
  return d.map(([pfad, s]) => ({ pfad, bytes: T.encode(s) }));
}

/* Office neu bauen: Text lesen, ersetzen (Dokumente bekommen Marken mit grauem Grund), neu schreiben.
   Ungepackt gespeichert, damit die Nachprüfung jeden Originalwert Byte für Byte suchen kann. */
async function officeNeu(bytes, art, posten, pfad, optionen) {
  const z = await zipLeser(bytes);
  const stellen = [];
  const ersetze = (text, stelle) => { const r = ersetzeAlles(text, posten, pfad, false, true); for (const s of r.stellen) stellen.push({ stelle, art: s.art, artName: s.artName, weg: s.weg, ersatz: s.ersatz }); return r.text; };
  let dateien;
  if (art === "docx") {
    const abs = await docxLesen(z);
    await nachfinden(abs.join("\n"), posten, optionen);
    dateien = docxBauen(abs.map((t, i) => ersetze(t, "Absatz " + (i + 1))));
  } else if (art === "xlsx") {
    const bl = await xlsxLesen(z);
    await nachfinden(bl.map((b) => b.name + "\n" + b.zellen.map((c) => c.wert).join("\n")).join("\n"), posten, optionen);
    bl.forEach((b, i) => { b.name = ersetze(b.name, "Name von Blatt " + (i + 1)); for (const c of b.zellen) if (!c.zahl) c.wert = ersetze(c.wert, "Blatt " + (i + 1) + " · Zelle " + c.r); else { const n = ersetze(c.wert, "Blatt " + (i + 1) + " · Zelle " + c.r); if (n !== c.wert) { c.wert = n; c.zahl = false; } } });
    dateien = xlsxBauen(bl);
  } else {
    const p = await pptxLesen(z);
    await nachfinden(p.folien.map((f) => f.join("\n")).join("\n"), posten, optionen);
    p.folien = p.folien.map((f, i) => f.map((t, k) => ersetze(t, "Folie " + (i + 1) + " · Absatz " + (k + 1))));
    dateien = pptxBauen(p);
  }
  return { bytes: await zipBauen(dateien, { packen: false }), art, stellen, hinweise: ["nur der Text kam mit — Bilder, Formatierung, Formeln, Kommentare, Notizen und Änderungsverlauf sind weg"] };
}

/** Ein Blatt neu bauen. @returns {bytes, art, stellen, …} oder {fehler} */
export async function blattNeu(bytes, eintrag, posten, optionen = {}) {
  const b = blattArt(eintrag);
  if (!b) return { fehler: "diese Datei lässt sich nicht neu zeichnen" };
  try {
    if (b === "office") return await officeNeu(bytes, eintrag.art, posten, eintrag.pfad, optionen);
    return await blattZeichnen(bytes, eintrag.art, posten, optionen);
  } catch (e) { return { fehler: String(e && e.message || e) }; }
}

/* ── PDF und PNG schreiben (ohne Bibliothek) ─────────────────────────────── */
function latin1(s) { const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); b[i] = c < 256 ? c : 63; } return b; }
const pdfText = (s) => "(" + String(s).replace(/[\\()]/g, "\\$&").replace(/[\r\n\t]/g, " ") + ")";
/**
 * Baut eine PDF ohne Verfasser, ohne Programm, ohne Datum.
 * @param seiten [{ breite, hoehe (Punkte), bild?: { jpeg, w, h }, inhalt?: string (Zeichenbefehle mit /F1 = Helvetica) }]
 */
export function pdfBauen(seiten) {
  const teile = [], offs = []; let n = 0;
  const schreibe = (x) => { const b = typeof x === "string" ? latin1(x) : x; teile.push(b); n += b.length; };
  const obj = (nr, kopf, strom) => {
    offs[nr] = n; schreibe(nr + " 0 obj\n" + kopf + (strom ? "" : "\n") );
    if (strom) { schreibe("\nstream\n"); schreibe(strom); schreibe("\nendstream\n"); }
    schreibe("endobj\n");
  };
  schreibe("%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n");
  const nrSeite = (i) => 4 + i * 3;
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [" + seiten.map((_s, i) => nrSeite(i) + " 0 R").join(" ") + "] /Count " + seiten.length + " >>");
  obj(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  seiten.forEach((s, i) => {
    const p = nrSeite(i), b = s.breite.toFixed(2), h = s.hoehe.toFixed(2);
    let befehle = s.bild ? "q " + b + " 0 0 " + h + " 0 0 cm /Im0 Do Q\n" : "";
    if (s.inhalt) befehle += s.inhalt;
    obj(p, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + b + " " + h + "] /Contents " + (p + 1) + " 0 R /Resources << /Font << /F1 3 0 R >>" +
      (s.bild ? " /XObject << /Im0 " + (p + 2) + " 0 R >>" : "") + " >> >>");
    const inhalt = latin1(befehle);
    obj(p + 1, "<< /Length " + inhalt.length + " >>", inhalt);
    if (s.bild) obj(p + 2, "<< /Type /XObject /Subtype /Image /Width " + s.bild.w + " /Height " + s.bild.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + s.bild.jpeg.length + " >>", s.bild.jpeg);
    else obj(p + 2, "<< >>");
  });
  const xref = n, anzahl = 4 + seiten.length * 3;
  let x = "xref\n0 " + anzahl + "\n0000000000 65535 f \n";
  for (let i = 1; i < anzahl; i++) x += String(offs[i]).padStart(10, "0") + " 00000 n \n";
  schreibe(x + "trailer\n<< /Size " + anzahl + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n");
  return zusammen(teile, n);
}
/* Text und graue Kästen für Musterblätter (y von oben gemessen). */
function pdfZeilen(hoehe, zeilen) {
  let s = "";
  for (const z of zeilen) {
    if (z.kasten) { const [x, y, w, hh] = z.kasten; s += "0.8 g " + x + " " + (hoehe - y - hh) + " " + w + " " + hh + " re f 0.5 G 1 w " + x + " " + (hoehe - y - hh) + " " + w + " " + hh + " re S\n"; }
    if (z.text != null) s += "0.12 g BT /F1 " + (z.groesse || 11) + " Tf " + z.x + " " + (hoehe - z.y) + " Td " + pdfText(z.text) + " Tj ET\n";
  }
  return s;
}

async function zlibPacke(bytes) {
  const cs = new CompressionStream("deflate"), w = cs.writable.getWriter();
  w.write(bytes).catch(() => {}); w.close().catch(() => {});
  const r = cs.readable.getReader(), teile = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; teile.push(value); n += value.length; }
  return zusammen(teile, n);
}
/** PNG aus RGBA-Bildpunkten (ohne Textfelder, ohne Zeitstempel). */
export async function pngBauen(w, h, rgba) {
  const roh = new Uint8Array(h * (1 + w * 4));
  for (let y = 0; y < h; y++) { roh[y * (1 + w * 4)] = 0; roh.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (1 + w * 4) + 1); }
  const idat = await zlibPacke(roh);
  const stueck = (typ, daten) => {
    const b = new Uint8Array(12 + daten.length), v = new DataView(b.buffer);
    v.setUint32(0, daten.length); for (let i = 0; i < 4; i++) b[4 + i] = typ.charCodeAt(i); b.set(daten, 8);
    v.setUint32(8 + daten.length, crc32(b.subarray(4, 8 + daten.length)));
    return b;
  };
  const kopf = new Uint8Array(13), kv = new DataView(kopf.buffer); kv.setUint32(0, w); kv.setUint32(4, h); kopf[8] = 8; kopf[9] = 6;
  const sig = Uint8Array.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const t = [sig, stueck("IHDR", kopf), stueck("IDAT", idat), stueck("IEND", new Uint8Array(0))];
  return zusammen(t, t.reduce((s, x) => s + x.length, 0));
}

/* ── Mustermappe: leere Vorlagen und erfundene Beispiele ─────────────────
   Alles erfunden; jeder Wert trägt „Muster“, damit die Nachprüfung ihn nie meldet. Keine Daten,
   Telefonnummern oder Kontonummern (die zählen auch als Muster sonst als Fund). */
const LEER_JPG = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgsKCA0LCgsODg0PEyAVExISEyccHhcgLikxMC4pLSwzOko+MzZGNywtQFdBRkxOUlNSMj5aYVpQYEpRUk//2wBDAQ4ODhMREyYVFSZPNS01T09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0//wAARCAB4AKADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD06iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9k=";
function ausB64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
const BRIEF = ["Max Mustermann", "Musterstraße 1", "12345 Musterstadt", "", "An Mia Musterfrau", "Musterfirma GmbH", "",
  "Betreff: Musterprojekt", "", "Hallo Mia Musterfrau,", "dies ist ein erfundener Musterbrief. Er zeigt, wie ein Dokument aussieht,",
  "nachdem der Projekt-Reiniger es neu gezeichnet hat.", "", "Viele Grüße", "Max Mustermann", "max.mustermann@muster.example"];
let MAPPE = null;
/** Die Mustermappe als Liste { pfad (relativ), bytes }. */
export async function mustermappe() {
  if (MAPPE) return MAPPE;
  const T = new TextEncoder(), packe = async (d) => zipBauen(d, { packen: false });
  const weiss = (w, h) => { const b = new Uint8Array(w * h * 4); b.fill(255); return b; };
  const bild = (() => {
    const w = 640, h = 400, b = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, t = y / h;
      b[i] = Math.round(11 + 93 * t); b[i + 1] = Math.round(49 + 147 * t); b[i + 2] = Math.round(84 + 171 * t); b[i + 3] = 255;
      if (x > 180 && x < 460 && y > 160 && y < 220) { b[i] = 205; b[i + 1] = 205; b[i + 2] = 205; }
    }
    return { w, h, b };
  })();
  const briefPdf = pdfBauen([{ breite: 595.28, hoehe: 841.89, inhalt: pdfZeilen(841.89, [
    ...BRIEF.map((t, i) => ({ x: 72, y: 90 + i * 17, text: t })),
    { x: 72, y: 90 + BRIEF.length * 17 + 30, text: "So sieht eine entfernte Stelle aus:", groesse: 10 },
    { kasten: [72, 90 + BRIEF.length * 17 + 40, 160, 22] }, { x: 80, y: 90 + BRIEF.length * 17 + 55, text: "Name entfernt", groesse: 10 },
  ]) }]);
  const tabelle = [["Name", "Ort", "E-Mail"], ["Max Mustermann", "Musterstadt", "max.mustermann@muster.example"], ["Mia Musterfrau", "Musterdorf", "mia.musterfrau@muster.example"]];
  const zellen = (z) => z.flatMap((r, i) => r.map((wert, k) => ({ r: String.fromCharCode(65 + k) + (i + 1), wert, zahl: false })));
  MAPPE = [
    { pfad: "LIESMICH.txt", bytes: T.encode("Mustermappe — Projekt-Reiniger Pro\n\nvorlagen/   leere Dateien je Art (PDF, Word, Excel, PowerPoint, Bild, Tabelle, JSON, Datenbank).\n" +
      "beispiele/  erfundene Beispiele (Musterbrief, Mustertabelle, Musterfolien, Musterbild).\n\nAlle Angaben sind ausgedacht. Eine Datei, die sich nicht reinigen lässt, kann in der App\n" +
      "„durch Muster ersetzen“ — sie bekommt dann die passende leere Vorlage unter ihrem Namen.\n") },
    { pfad: "vorlagen/leer.pdf", bytes: pdfBauen([{ breite: 595.28, hoehe: 841.89, inhalt: "" }]) },
    { pfad: "vorlagen/leer.docx", bytes: await packe(docxBauen([""])) },
    { pfad: "vorlagen/leer.xlsx", bytes: await packe(xlsxBauen([{ name: "Blatt1", zellen: [] }])) },
    { pfad: "vorlagen/leer.pptx", bytes: await packe(pptxBauen({ folien: [[]] })) },
    { pfad: "vorlagen/leer.png", bytes: await pngBauen(160, 120, weiss(160, 120)) },
    { pfad: "vorlagen/leer.jpg", bytes: ausB64(LEER_JPG) },
    { pfad: "vorlagen/leer.csv", bytes: T.encode("Spalte1;Spalte2\n") },
    { pfad: "vorlagen/leer.json", bytes: T.encode("{}\n") },
    { pfad: "vorlagen/leer.sqlite", bytes: new Uint8Array(0) },
    { pfad: "beispiele/musterbrief.pdf", bytes: briefPdf },
    { pfad: "beispiele/musterbrief.docx", bytes: await packe(docxBauen([...BRIEF, "", "So sieht eine entfernte Stelle aus: ⟦NAME-1⟧"])) },
    { pfad: "beispiele/mustertabelle.xlsx", bytes: await packe(xlsxBauen([{ name: "Muster", zellen: zellen(tabelle) }])) },
    { pfad: "beispiele/mustertabelle.csv", bytes: T.encode(tabelle.map((r) => r.join(";")).join("\n") + "\n") },
    { pfad: "beispiele/musterfolien.pptx", bytes: await packe(pptxBauen({ folien: [["Musterprojekt", "Erfundene Folie von Max Mustermann"], ["Zweite Musterfolie", "Musterstadt, Musterfirma GmbH"]] })) },
    { pfad: "beispiele/musterbild.png", bytes: await pngBauen(bild.w, bild.h, bild.b) },
  ];
  return MAPPE;
}
const MUSTER_JE_ENDUNG = { pdf: "vorlagen/leer.pdf", docx: "vorlagen/leer.docx", docm: "vorlagen/leer.docx", dotx: "vorlagen/leer.docx",
  xlsx: "vorlagen/leer.xlsx", xlsm: "vorlagen/leer.xlsx", pptx: "vorlagen/leer.pptx", pptm: "vorlagen/leer.pptx",
  png: "vorlagen/leer.png", jpg: "vorlagen/leer.jpg", jpeg: "vorlagen/leer.jpg", csv: "vorlagen/leer.csv", tsv: "vorlagen/leer.csv",
  json: "vorlagen/leer.json", db: "vorlagen/leer.sqlite", sqlite: "vorlagen/leer.sqlite", sqlite3: "vorlagen/leer.sqlite", db3: "vorlagen/leer.sqlite" };
/** Welche Vorlage der Mustermappe passt zu dieser Datei? (Pfad in der Mappe oder null) */
export function musterFuer(pfad) { return MUSTER_JE_ENDUNG[endungVon(pfad)] || null; }

/* ══ Stufe 5 · Tresor und Gäste-Sperre ═══════════════════════════════════════════════════════════════════
 *
 * Das Schloss ist `schluesseltresor.js`, byte-1:1 aus kim-hub-company (über den Sende-Prüfer, dort
 * TRESOR_SHA), AES-256-GCM mit PBKDF2-SHA256 600 000 Runden. Der Kern lädt es nicht selbst: der Aufrufer
 * bringt es mit (`werkzeuge.WERKSTATT_SCHLUESSEL`), sonst liest der Kern es von globalThis — wie die
 * anderen Prüfkerne. Kein zweites Schloss (Brief: Familienakte nutzt dasselbe).
 *
 * Eine Tresor-Datei ist EINE Datei (UTF-8, JSON). Lesbar ohne Code stehen nur Kennung, Fassung,
 * Erstell- und Ablaufdatum — damit die App erinnern kann, ohne aufzuschließen. Alles andere (Zuordnung,
 * Originale, Name der Quelle) liegt im verschlüsselten Paket. Der Git-Wächter (Stufe 7) hält jede Datei
 * mit der Kennung an.
 */
export const TRESOR_KENNUNG = "PROJEKT-REINIGER-TRESOR";
export const TRESOR_FASSUNG = 1;
export const TRESOR_ENDUNG = ".rtresor";
export const TRESOR_TAGE = 30;                          // Vorschlag aus dem Brief
export const TRESOR_ORIGINALE_MAX = 256 * 1024 * 1024;   // mehr Originale passen nicht sicher in den Speicher
export const CODE_MIN = 4;

function schloss(optionen) {
  const S = (optionen && optionen.werkzeuge || globalThis).WERKSTATT_SCHLUESSEL;
  if (!S || typeof S.zu !== "function" || typeof S.auf !== "function") throw new Error("schloss-fehlt");
  return S;
}
function tag(d) { return new Date(d).toISOString().slice(0, 10); }
function alsB64(bytes) { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }

/** Wie gut ist der Code? Nur eine Auskunft — ein kurzer Code lässt sich durchprobieren, wenn jemand die Datei hat. */
export function codeGuete(code) {
  const c = String(code || "");
  if (c.length < CODE_MIN) return { ok: false, stufe: "zu-kurz", satz: "Der Code braucht mindestens " + CODE_MIN + " Zeichen." };
  if (c.length < 12) return { ok: true, stufe: "schwach", satz: "Kurz: lässt sich durchprobieren, wenn jemand die Datei bekommt. Besser 12 Zeichen oder mehr." };
  return { ok: true, stufe: "gut", satz: "Lang genug." };
}

/**
 * Zuordnung und (auf Wunsch) Originale verschließen → eine Tresor-Datei.
 * @param zuordnung  Marke → { art, werte, muster, eigen? } (aus `reinige`)
 * @param originale  Datei[] (mit bytes oder lesen) oder null — nur auf Wunsch
 * @param code       Code (mindestens CODE_MIN Zeichen)
 * @param optionen   { werkzeuge?, ablaufTage?, jetzt?, quelle? }
 */
export async function verschliesse(zuordnung, originale, code, optionen = {}) {
  const S = schloss(optionen);
  if (!codeGuete(code).ok) throw new Error("code-zu-kurz");
  const jetzt = optionen.jetzt ? new Date(optionen.jetzt) : new Date();
  const tage = Math.max(1, Math.min(365, Math.round(optionen.ablaufTage || TRESOR_TAGE)));
  const ablauf = new Date(jetzt.getTime() + tage * 86400000);
  const liste = [];
  let summe = 0;
  for (const d of originale || []) {
    if (!d || d.nichtGeoeffnet || uebersprungen(d.pfad)) continue;
    const bytes = d.bytes || (d.lesen ? await d.lesen() : null);
    if (!bytes) continue;
    summe += bytes.length;
    if (summe > TRESOR_ORIGINALE_MAX) throw new Error("zu-gross");
    liste.push({ pfad: d.pfad, b64: alsB64(bytes) });
  }
  const inhalt = JSON.stringify({ zuordnung: zuordnung || {}, originale: liste, quelle: optionen.quelle || "" });
  const paket = await S.zu(code, inhalt);
  const kopf = { kennung: TRESOR_KENNUNG, fassung: TRESOR_FASSUNG, erstellt: tag(jetzt), ablauf: tag(ablauf), paket };
  return new TextEncoder().encode(JSON.stringify(kopf));
}

/** Was ohne Code lesbar ist: Kennung, Erstell- und Ablaufdatum. null = keine Tresor-Datei. */
export function tresorKopf(bytes, jetzt) {
  let k;
  try {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (b.length < 30 || b.length > 1024 * 1024 * 1024) return null;
    const anfang = new TextDecoder().decode(b.subarray(0, 64));
    if (!anfang.includes('"kennung":"' + TRESOR_KENNUNG + '"')) return null;
    k = JSON.parse(new TextDecoder().decode(b));
  } catch { return null; }
  if (!k || k.kennung !== TRESOR_KENNUNG) return null;
  const heute = tag(jetzt ? new Date(jetzt) : new Date());
  return { kennung: k.kennung, fassung: k.fassung, erstellt: k.erstellt, ablauf: k.ablauf, abgelaufen: !!k.ablauf && heute > k.ablauf, paket: k.paket };
}

/**
 * Tresor-Datei mit dem Code öffnen → { zuordnung, originale: [{ pfad, bytes }], quelle, erstellt, ablauf, abgelaufen }.
 * Fehler (Error.message): „kein-tresor“, „fassung“ (neuer als diese App), „code“ (passt nicht), „schloss-fehlt“.
 * Das Ergebnis liegt nur im Speicher; der Aufrufer legt es nie offen ab.
 */
export async function oeffne(tresorDatei, code, optionen = {}) {
  const S = schloss(optionen);
  const k = tresorKopf(tresorDatei, optionen.jetzt);
  if (!k) throw new Error("kein-tresor");
  if (k.fassung !== TRESOR_FASSUNG || !S.istPaketForm(k.paket)) throw new Error("fassung");
  if (k.paket.v !== S.FASSUNG) throw new Error("fassung");
  let klar;
  try { klar = await S.auf(String(code || ""), k.paket); } catch { throw new Error("code"); }
  const i = JSON.parse(klar);
  return { zuordnung: i.zuordnung || {}, originale: (i.originale || []).map((o) => ({ pfad: o.pfad, bytes: ausB64(o.b64) })), quelle: i.quelle || "",
    erstellt: k.erstellt, ablauf: k.ablauf, abgelaufen: k.abgelaufen };
}

/** Ist das eine Tresor-Datei? (Name oder Inhalt) — für Einwurf und Git-Wächter. */
export function istTresor(pfad, bytes) { return (pfad && String(pfad).toLowerCase().endsWith(TRESOR_ENDUNG)) || (!!bytes && !!tresorKopf(bytes)); }

/**
 * Gäste-Sperre: Wartezeit nach falschen Versuchen, wächst mit jedem weiteren.
 * Drei Versuche frei, dann 30 s, 1, 2, 4, 8 … Minuten, höchstens 30 Minuten. Zählt nur im Speicher —
 * neu laden setzt sie zurück, aber dann ist auch alles Offene weg (es liegt nirgends sonst).
 */
export const SPERRE_FREI = 3;
export function sperrWartezeit(fehlversuche) {
  const n = Math.max(0, Math.floor(fehlversuche || 0)) - SPERRE_FREI;
  if (n < 0) return 0;
  return Math.min(30 * 60 * 1000, 30 * 1000 * Math.pow(2, n));
}

/** Gäste-Sperre: alles Offene mit dem Code in ein Paket (nur im Speicher), und wieder heraus. Dasselbe Schloss. */
export async function sperrPaket(zustand, code, optionen = {}) {
  const S = schloss(optionen);
  const dateien = [];
  for (const d of zustand.dateien || []) {
    if (d.nichtGeoeffnet) { dateien.push({ pfad: d.pfad, nichtGeoeffnet: true }); continue; }
    let bytes = d.bytes || null;
    if (!bytes && d.lesen) { try { bytes = await d.lesen(); } catch { bytes = null; } }
    dateien.push(bytes ? { pfad: d.pfad, b64: alsB64(bytes), groesse: d.groesse } : { pfad: d.pfad, unlesbar: d.unlesbar || "nicht lesbar" });
  }
  const rest = Object.assign({}, zustand, { dateien });
  return S.zu(String(code), JSON.stringify(rest));
}
export async function sperrAuf(paket, code, optionen = {}) {
  const S = schloss(optionen);
  let klar;
  try { klar = await S.auf(String(code || ""), paket); } catch (e) { throw new Error(e && e.message === "fassung" ? "fassung" : "code"); }
  const z = JSON.parse(klar);
  z.dateien = (z.dateien || []).map((d) => d.b64 != null ? Object.assign({}, d, { b64: undefined, bytes: ausB64(d.b64) }) : d);
  return z;
}

/* ── Stufe 6: Zurückbauen, mit eigenen Werten füllen ─────────────────────────
 *
 * Der Stellenplan (REINIGER-STELLENPLAN.json in der sauberen Kopie) sagt, WO eine Angabe ersetzt wurde
 * und WOMIT (Marke ⟦NAME-1⟧ oder Musterwert) — nie, was dort stand. Damit lassen sich die Platzhalter
 * wieder füllen:
 *   - mit EIGENEN Werten (eigene Angaben statt der fremden; die Daten des Absenders braucht man nicht);
 *   - mit den ORIGINALEN aus dem Tresor (einzelne Stellen zurückholen, z. B. das Impressum) — dann ist die
 *     Kopie nicht mehr sauber und heißt auch so.
 * Gefüllt wird nur an den Stellen, die der Plan nennt (Datei, Zeile), damit ein Musterwert, der zufällig
 * anderswo steht, stehen bleibt. Datei- und Ordnernamen werden mit gefüllt. Office-Dateien (als Text neu
 * gebaut) werden in ihren Textteilen gefüllt. Graue Kästen in neu gezeichneten PDF-Seiten und Bildern
 * bleiben (dort gibt es keinen Text mehr) — der Bericht nennt sie.
 */
export const RUECKBAU_DATEI = "REINIGER-ZURUECKBAU.txt";
const RUECKBAU_OFFICE = new Set(["docx", "xlsx", "pptx"]);

/** Liegt in diesen Dateien eine saubere Kopie mit Stellenplan? → { plan, wurzel } oder null. */
export async function stellenplanAus(dateien) {
  const d = (dateien || []).find((x) => { const p = normPfad(x.pfad); return p === STELLENPLAN_JSON || (p.endsWith("/" + STELLENPLAN_JSON) && p.split("/").length === 2); });
  if (!d) return null;
  try {
    const bytes = d.bytes || await d.lesen();
    const plan = JSON.parse(new TextDecoder().decode(bytes));
    if (!plan || !Array.isArray(plan.stellen)) return null;
    const p = normPfad(d.pfad);
    return { plan, wurzel: p.includes("/") ? p.slice(0, p.lastIndexOf("/") + 1) : "" };
  } catch { return null; }
}

/* Ein Platzhalter: die Marke oder der Musterwert. „MUSTER-WERT“ (Umgebungsdatei) steht für viele verschiedene
   Werte — dort ist jede Stelle ein eigener Platz. */
function platzVon(s) {
  if (s.ersatz == null || s.weg === "zeile" || s.art === "DATEIART") return null;
  const e = String(s.ersatz);
  if (e === "MUSTER-WERT") return e + "@" + s.pfad + ":" + (s.zeile || "");
  /* Eine Marke ist eindeutig; ein Musterwert nur zusammen mit der Art („Max Mustermann“ steht für Name, Copyright, Verfasser …). */
  return istMarke(e) ? e : s.art + "|" + e;
}
/* Marke im Text ⟦NAME-1⟧, im Datei- oder Ordnernamen NAME-1 (Musterwerte wie MUSTER-SCHLUESSEL-1 sind keine). */
const istMarke = (e) => /^⟦.*⟧$/.test(e) || (/^[A-Z]+(-[A-Z]+)*-\d+$/.test(e) && !/^MUSTER-/.test(e));
function fuellArt(s) {
  if (s.kasten) return "kasten";
  if (s.stelle === "Datei- oder Ordnername") return "name";
  if (s.zeile) return "zeile";
  if (RUECKBAU_OFFICE.has(endungVon(s.pfad))) return "office";
  return "kasten";                                     // Seite/Bild ohne Kasten-Maße: nicht füllbar
}

/**
 * Die Plätze zum Füllen, gebündelt wie in der Anzeige: „⟦NAME-1⟧, 4× in 2 Dateien“.
 * @returns {Array<{ platz, zeigt, art, artName, marke: boolean, anzahl, dateien, fuellbar, kaesten }>}
 */
export function rueckbauPlaetze(plan) {
  const m = new Map();
  for (const s of (plan && plan.stellen) || []) {
    const platz = platzVon(s);
    if (!platz) continue;
    const zeigt = String(s.ersatz);
    if (!m.has(platz)) m.set(platz, { platz, zeigt, art: s.art, artName: ART_NAME[s.art] || s.art, marke: istMarke(zeigt), anzahl: 0, dateien: new Set(), fuellbar: 0, kaesten: 0 });
    const x = m.get(platz);
    x.anzahl++; x.dateien.add(s.pfad);
    if (fuellArt(s) === "kasten") x.kaesten++; else x.fuellbar++;
  }
  return Array.from(m.values()).map((x) => Object.assign(x, { dateien: x.dateien.size }));
}

/** Originale aus der Zuordnung des Tresors (Marke → { werte, muster }) den Plätzen zuordnen. */
export function werteAusZuordnung(zuordnung, plaetze) {
  const aus = {};
  const eintraege = Object.entries(zuordnung || {});
  for (const p of plaetze) {
    const z = p.marke ? eintraege.find(([marke]) => marke === p.zeigt || marke === "⟦" + p.zeigt + "⟧")
      : eintraege.find(([, e]) => e.art === p.art && e.muster && (e.muster === p.zeigt || (e.muster.includes("\\") && e.muster.replace(/\\/g, "\\\\") === p.zeigt)));
    if (!z || !(z[1].werte || []).length) continue;
    let w = String(z[1].werte[0]);
    if (z[1].muster && z[1].muster.includes("\\") && z[1].muster.replace(/\\/g, "\\\\") === p.zeigt) w = w.replace(/\\/g, "\\\\");
    aus[p.platz] = w;
  }
  return aus;
}

/* In einem Text die genannten Platzhalter ersetzen — längere zuerst („Musterstadt 2“ vor „Musterstadt“), nur an
   Wortgrenzen wie beim Reinigen („muster“ in „musterapp“ bleibt). */
function fuelleText(text, paare, imPfad) {
  const wz = imPfad ? "A-Za-zÀ-ÖØ-öø-ÿĀ-ž0-9" : WZ, wortZ = new RegExp("[" + wz + "]");
  const tabelle = new Map(paare);
  if (!tabelle.size) return { text, n: 0 };
  const re = new RegExp(Array.from(tabelle.keys()).sort((a, b) => b.length - a.length).map((v) =>
    (wortZ.test(v[0]) ? "(?<![" + wz + "])" : "") + esc(v) + (wortZ.test(v[v.length - 1]) ? "(?![" + wz + "])" : "")).join("|"), "g");
  let n = 0;
  const neu = text.replace(re, (t) => { n++; return tabelle.get(t); });
  return { text: neu, n };
}

/**
 * Füllt eine saubere Kopie. `werte`: Platz → Wert (leer oder fehlend = Platzhalter bleibt).
 * `optionen.originale`: true, wenn Werte aus dem Tresor stammen (dann heißt das Ergebnis „zurückgebaut“, nicht sauber).
 * @returns {Promise<{ dateien, bericht, zip }>}  bericht: { stellen, gefuellt, leer, kaesten, nichtGefunden, dateienGeaendert, originale }
 */
export async function zurueckbauen(dateien, werte, optionen = {}) {
  const sp = await stellenplanAus(dateien);
  if (!sp) throw new Error("kein-stellenplan");
  const w = {};
  for (const [k, v] of Object.entries(werte || {})) if (v != null && String(v) !== "") w[k] = String(v);
  const proDatei = new Map();
  for (const s of sp.plan.stellen) {
    const platz = platzVon(s);
    if (!platz) continue;
    const pfad = sp.wurzel + normPfad(s.pfad);
    if (!proDatei.has(pfad)) proDatei.set(pfad, []);
    proDatei.get(pfad).push(Object.assign({}, s, { platz, art2: fuellArt(s) }));
  }
  const T = new TextEncoder(), D = new TextDecoder();
  const aus = [], nichtGefunden = [];
  let gefuellt = 0, kaesten = 0, leer = 0, geaendert = 0;
  for (const d of dateien) {
    let pfad = normPfad(d.pfad);
    let bytes = d.bytes || (d.lesen ? await d.lesen() : new Uint8Array(0));
    bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const stellen = proDatei.get(pfad) || [];
    let anders = false;
    /* Text Zeile für Zeile, nur an den genannten Zeilen */
    const zeilenStellen = stellen.filter((s) => s.art2 === "zeile");
    if (zeilenStellen.length) {
      const zeilen = D.decode(bytes).split("\n");
      const proZeile = new Map();
      for (const s of zeilenStellen) { if (!proZeile.has(s.zeile)) proZeile.set(s.zeile, new Map()); proZeile.get(s.zeile).set(s.platz, s); }
      for (const [nr, plaetze] of proZeile) {
        const paare = [];
        for (const [platz, s] of plaetze) { if (w[platz] == null) { leer++; continue; } paare.push([String(s.ersatz), w[platz]]); }
        if (!paare.length || nr < 1 || nr > zeilen.length) { if (paare.length) nichtGefunden.push(pfad + " Zeile " + nr); continue; }
        const r = fuelleText(zeilen[nr - 1], paare);
        if (!r.n) { nichtGefunden.push(pfad + " Zeile " + nr); continue; }
        zeilen[nr - 1] = r.text; gefuellt += r.n; anders = true;
      }
      if (anders) bytes = T.encode(zeilen.join("\n"));
    }
    /* Office: die Textteile (XML) im Paket */
    const officeStellen = stellen.filter((s) => s.art2 === "office");
    if (officeStellen.length) {
      const paare = [];
      for (const p of new Set(officeStellen.map((s) => s.platz))) { const s = officeStellen.find((x) => x.platz === p); if (w[p] == null) { leer += officeStellen.filter((x) => x.platz === p).length; continue; } paare.push([xmlEsc(s.ersatz), xmlEsc(w[p])]); }
      if (paare.length) {
        const z = zipDateien(bytes);
        const teile = [];
        let n = 0;
        for (const t of z.dateien) {
          let b = t.bytes || await t.lesen();
          if (/\.xml$/i.test(t.pfad)) { const r = fuelleText(D.decode(b), paare); if (r.n) { b = T.encode(r.text); n += r.n; } }
          teile.push({ pfad: t.pfad, bytes: b });
        }
        if (n) { bytes = await zipBauen(teile, { packen: false }); gefuellt += n; anders = true; }
        else nichtGefunden.push(pfad);
      }
    }
    kaesten += stellen.filter((s) => s.art2 === "kasten").length;
    /* Datei- und Ordnername */
    const namen = stellen.filter((s) => s.art2 === "name");
    if (namen.length) {
      const paare = [];
      for (const s of namen) { if (w[s.platz] == null) { leer++; continue; } paare.push([String(s.ersatz), w[s.platz].replace(/[\\/:*?"<>|]+/g, "_")]); }
      if (paare.length) {
        const neu = pfad.split("/").map((seg) => fuelleText(seg, paare, true).text).join("/");
        if (neu !== pfad) { pfad = neu; gefuellt += paare.length; anders = true; }
      }
    }
    if (anders) geaendert++;
    aus.push({ pfad, bytes });
  }
  const bericht = { stellen: sp.plan.stellen.length, gefuellt, leer, kaesten, nichtGefunden, dateienGeaendert: geaendert, originale: !!optionen.originale,
    plaetze: rueckbauPlaetze(sp.plan).map((p) => ({ zeigt: p.zeigt, artName: p.artName, gefuellt: w[p.platz] != null })) };
  aus.push({ pfad: sp.wurzel + RUECKBAU_DATEI, bytes: T.encode(rueckbauText(bericht)) });
  return { dateien: aus, bericht, zip: await zipBauen(aus) };
}

/** Bericht zum Zurückbauen — nennt Platzhalter und Arten, nie die eingesetzten Werte. */
export function rueckbauText(b) {
  const z = ["Zurückbauen — Projekt-Reiniger Pro", ""];
  if (b.originale) z.push("ACHTUNG: In diese Kopie wurden Originalwerte aus dem Tresor zurückgeholt. Sie ist NICHT sauber.", "");
  else z.push("Die Platzhalter wurden mit eigenen Werten gefüllt. Diese Datei nennt die Werte nicht.", "");
  z.push("Gefüllt: " + b.gefuellt + " Stelle(n) in " + b.dateienGeaendert + " Datei(en).");
  if (b.leer) z.push("Leer gelassen (Platzhalter bleibt): " + b.leer + " Stelle(n).");
  if (b.kaesten) z.push("Graue Kästen in neu gezeichneten PDF-Seiten und Bildern: " + b.kaesten + " — dort gibt es keinen Text mehr; sie bleiben.");
  if (b.nichtGefunden.length) z.push("Nicht gefunden (die Datei wurde nach dem Reinigen geändert?): " + b.nichtGefunden.join(", "));
  z.push("", "Plätze:");
  for (const p of b.plaetze) z.push("  · " + p.zeigt + " (" + p.artName + ") — " + (p.gefuellt ? "gefüllt" : "leer gelassen"));
  return z.join("\n") + "\n";
}

/* ══ Stufe 7: Sperrliste und Git-Wächter ══════════════════════════════════════════════════════════════
 * Die Sperrliste hält bekannte fremde Werte (z. B. die aus dem Projekt eines Freundes) nur als Fingerabdruck:
 * SHA-256 über Salz + Wert in einer festen Schreibweise (klein, nur Buchstaben und Ziffern, Wörter mit einem
 * Leerzeichen). Im Klartext steht kein Wert darin. Gesucht wird Wortfolge für Wortfolge: jede Folge von 1 bis
 * `woerterMax` Wörtern im Text bekommt denselben Fingerabdruck und wird verglichen.
 *   „Erika Mustermann“, „erika.mustermann@…“ und „ERIKA  MUSTERMANN“ geben dieselbe Schreibweise; IBAN und
 *   Telefon (alle Wörter mit Ziffern) zusätzlich ohne Leerzeichen („DE02 1203 …“ = „DE021203…“).
 * Grenze, ehrlich: wer die Liste hat, kann kurze Werte (Vornamen, Orte) durchprobieren — das Salz verhindert nur
 * vorbereitete Tabellen. Deshalb gehört die Liste nicht in ein öffentliches Repo, sondern in ein Geheimnis.
 * Der Git-Wächter (`waechterPruefe`) hält an: Werte von der Sperrliste und Tresor-Dateien — immer. Alles andere,
 * was die Suche findet, meldet er als Hinweis (mit `streng` hält er auch bei Mail, IBAN, Telefon, Schlüssel). Seine
 * Ausgabe nennt nie einen Wert: sie landet in Protokollen (GitHub), die andere lesen. */
export const SPERRLISTE_KENNUNG = "PROJEKT-REINIGER-SPERRLISTE";
export const SPERRLISTE_FASSUNG = 1;
export const SPERRLISTE_DATEI = "reiniger-sperrliste.json";
export const SPERR_WOERTER_MAX = 12;      // längere Werte (mehr Wörter) nimmt die Liste nicht auf
export const SPERR_ZEICHEN_MIN = 4;       // kürzere Werte auch nicht (zu viele Zufallstreffer)
/* Arten, die beim Bauen aus einer Zuordnung NICHT vorgewählt sind: zu allgemein, um jeden Commit anzuhalten. */
export const SPERR_NICHT_VORGEWAEHLT = ["DATUM", "ORT", "PLZ-ORT", "EIGENNAME", "HOCHSCHULE"];

/* SHA-256 ohne Hilfe von außen (der Kern braucht sie synchron und in jeder Umgebung). */
const SHA_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
const SHA_W = new Uint32Array(64);
/** SHA-256 einer Bytefolge → 64 Hex-Zeichen. */
export function sha256(bytes) {
  const n = bytes.length, bloecke = ((n + 9 + 63) >> 6), m = new Uint8Array(bloecke * 64);
  m.set(bytes); m[n] = 0x80;
  const bits = n * 8, dv = new DataView(m.buffer);
  dv.setUint32(m.length - 8, Math.floor(bits / 4294967296)); dv.setUint32(m.length - 4, bits >>> 0);
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const W = SHA_W;
  for (let o = 0; o < m.length; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = W[i - 15], b = W[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3), s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7)), ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA_K[i] + W[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10)), maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
}

const RE_SPERR_WORT = /[\p{L}\p{N}]+/gu;
const T8 = new TextEncoder();
const sperrKlein = (w) => w.normalize("NFC").toLowerCase();
const mitZiffer = (w) => /\p{N}/u.test(w);
/** Die feste Schreibweise eines Werts: { raum, dicht|null, woerter } oder null (zu kurz / zu lang). */
export function sperrForm(wert) {
  const w = (String(wert).normalize("NFC").match(RE_SPERR_WORT) || []).map(sperrKlein);
  const raum = w.join(" ");
  if (!w.length || raum.replace(/ /g, "").length < SPERR_ZEICHEN_MIN || w.length > SPERR_WOERTER_MAX) return null;
  return { raum, dicht: w.length > 1 && w.every(mitZiffer) ? w.join("") : null, woerter: w.length };
}
const abdruck = (salz, form) => sha256(T8.encode(salz + "\n" + form));
/* Vorfilter: ein Bitfeld (2^16 Bit) über FNV-1a von Salz + Schreibweise. Er sagt nur „vielleicht“; erst dann rechnet
   der Kern SHA-256. Er verrät nichts, was die Fingerabdrücke nicht schon verraten. FNV läuft Zeichen für Zeichen weiter. */
const VORFILTER_BITS = 16;
const fnvWeiter = (h, s) => { for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h; };
const fnvStart = (salz) => fnvWeiter(0x811c9dc5 | 0, salz + "\n");
const fnvFach = (h) => (h ^ (h >>> 16)) & ((1 << VORFILTER_BITS) - 1);
function zufallsSalz() {
  const b = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === "function") globalThis.crypto.getRandomValues(b);
  else throw new Error("kein-zufall");
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

/**
 * Baut eine Sperrliste aus Klartext-Werten. Die Werte selbst stehen danach nirgends darin.
 * @returns {{ liste, aufgenommen: number, zuKurz: number, zuLang: number }}
 */
export function sperrlisteBauen(werte, optionen = {}) {
  const salz = optionen.salz || zufallsSalz();
  const set = new Set(), filter = new Uint8Array(1 << (VORFILTER_BITS - 3)), start = fnvStart(salz);
  const merke = (form) => { set.add(abdruck(salz, form)); const f = fnvFach(fnvWeiter(start, form)); filter[f >> 3] |= 1 << (f & 7); };
  let aufgenommen = 0, zuKurz = 0, zuLang = 0, woerterMax = 1;
  const gesehen = new Set();
  for (const roh of werte || []) {
    const f = sperrForm(roh);
    if (!f) { if ((String(roh).match(RE_SPERR_WORT) || []).length > SPERR_WOERTER_MAX) zuLang++; else if (String(roh).trim()) zuKurz++; continue; }
    if (gesehen.has(f.raum)) continue;
    gesehen.add(f.raum); aufgenommen++;
    merke(f.raum);
    if (f.dicht) merke(f.dicht);
    /* Nur Ziffern-Wörter (IBAN, Telefon): im Text oft anders zerteilt („+4930 12345678“ ↔ „+49 30 1234 5678“) — dort bis zur Höchstzahl suchen. */
    woerterMax = Math.max(woerterMax, f.raum.split(" ").every(mitZiffer) ? SPERR_WOERTER_MAX : f.woerter);
  }
  const liste = { kennung: SPERRLISTE_KENNUNG, fassung: SPERRLISTE_FASSUNG, erstellt: optionen.datum || new Date().toISOString().slice(0, 10),
    hinweis: "Nur Fingerabdrücke (SHA-256 mit Salz), keine Werte. Nicht in ein öffentliches Repo legen: kurze Werte lassen sich durchprobieren.",
    gruppen: aufgenommen ? [{ salz, woerterMax, abdruecke: Array.from(set).sort(), vorfilter: alsB64(filter) }] : [] };
  return { liste, aufgenommen, zuKurz, zuLang };
}

/** Liest eine Sperrliste (Bytes, Text oder Objekt) und prüft ihre Form. → Liste oder null. */
export function sperrlisteLesen(roh) {
  let o = roh;
  try {
    if (roh instanceof Uint8Array) o = JSON.parse(new TextDecoder().decode(roh));
    else if (typeof roh === "string") o = JSON.parse(roh);
  } catch { return null; }
  if (!o || o.kennung !== SPERRLISTE_KENNUNG || !Array.isArray(o.gruppen)) return null;
  if (o.fassung > SPERRLISTE_FASSUNG) return null;
  for (const g of o.gruppen) {
    if (!g || typeof g.salz !== "string" || !/^[0-9a-f]{16,128}$/.test(g.salz) || !Array.isArray(g.abdruecke)) return null;
    if (!Number.isInteger(g.woerterMax) || g.woerterMax < 1 || g.woerterMax > SPERR_WOERTER_MAX) return null;
    if (!g.abdruecke.every((h) => typeof h === "string" && /^[0-9a-f]{64}$/.test(h))) return null;
    if (g.vorfilter != null) { try { if (typeof g.vorfilter !== "string" || ausB64(g.vorfilter).length !== 1 << (VORFILTER_BITS - 3)) return null; } catch { return null; } }
  }
  return o;
}
/** Ist das eine Sperrliste? (für das Einwerfen: wird geladen, nicht geprüft) */
export function istSperrliste(pfad, bytes) {
  if (!bytes || bytes.length > 64 * 1024 * 1024 || !/\.json$/i.test(String(pfad || ""))) return false;
  const anfang = new TextDecoder().decode(bytes.subarray(0, 400));
  return anfang.includes(SPERRLISTE_KENNUNG) && !!sperrlisteLesen(bytes);
}
/** Mehrere Sperrlisten zu einer (gleiches Salz → eine Gruppe). */
export function sperrlisteZusammen(...listen) {
  const gruppen = new Map();
  for (const l of listen.flat()) {
    if (!l) continue;
    for (const g of l.gruppen) {
      const x = gruppen.get(g.salz) || { salz: g.salz, woerterMax: 1, abdruecke: new Set(), filter: new Uint8Array(1 << (VORFILTER_BITS - 3)), ohneFilter: false };
      x.woerterMax = Math.max(x.woerterMax, g.woerterMax);
      if (g.vorfilter) { const f = ausB64(g.vorfilter); for (let i = 0; i < f.length; i++) x.filter[i] |= f[i]; } else x.ohneFilter = true;
      for (const h of g.abdruecke) x.abdruecke.add(h);
      gruppen.set(g.salz, x);
    }
  }
  return { kennung: SPERRLISTE_KENNUNG, fassung: SPERRLISTE_FASSUNG, erstellt: new Date().toISOString().slice(0, 10),
    hinweis: "Nur Fingerabdrücke (SHA-256 mit Salz), keine Werte. Nicht in ein öffentliches Repo legen: kurze Werte lassen sich durchprobieren.",
    gruppen: Array.from(gruppen.values()).map((g) => Object.assign({ salz: g.salz, woerterMax: g.woerterMax, abdruecke: Array.from(g.abdruecke).sort() }, g.ohneFilter ? {} : { vorfilter: alsB64(g.filter) })) };
}
/** Wie viele Fingerabdrücke trägt die Liste? */
export function sperrlisteGroesse(liste) { return liste ? liste.gruppen.reduce((n, g) => n + g.abdruecke.length, 0) : 0; }

const sperrBereit = new WeakMap();
function sperrVorbereiten(liste) {
  if (sperrBereit.has(liste)) return sperrBereit.get(liste);
  const x = liste.gruppen.map((g) => ({ salz: g.salz, n: g.woerterMax, set: new Set(g.abdruecke), start: fnvStart(g.salz), filter: g.vorfilter ? ausB64(g.vorfilter) : null }));
  sperrBereit.set(liste, x);
  return x;
}

/**
 * Sucht die Werte der Sperrliste in einem Text. Gibt die Stellen zurück (der Wert steht nur im eigenen Text —
 * wer ihn zeigt, entscheidet der Aufrufer). An jeder Stelle gewinnt die längste Wortfolge.
 * @returns {Array<{ wert: string, index: number, ende: number }>}
 */
export function sperrTreffer(text, liste) {
  if (!liste || !text) return [];
  const gruppen = sperrVorbereiten(liste);
  if (!gruppen.length) return [];
  const t = String(text), woerter = [];
  RE_SPERR_WORT.lastIndex = 0;
  for (let m; (m = RE_SPERR_WORT.exec(t));) woerter.push({ w: sperrKlein(m[0]), i: m.index, e: m.index + m[0].length, z: mitZiffer(m[0]) });
  const nMax = Math.max(...gruppen.map((g) => g.n));
  const aus = [];
  for (let s = 0; s < woerter.length;) {
    let bester = 0, raum = "", dicht = "", alleZ = true;
    const hR = gruppen.map((g) => g.start), hD = gruppen.map((g) => g.start);
    for (let n = 1; n <= nMax && s + n <= woerter.length; n++) {
      const w = woerter[s + n - 1];
      raum = n === 1 ? w.w : raum + " " + w.w; dicht += w.w; alleZ = alleZ && w.z;
      for (let k = 0; k < gruppen.length; k++) { hR[k] = fnvWeiter(hR[k], n === 1 ? w.w : " " + w.w); hD[k] = fnvWeiter(hD[k], w.w); }
      if (dicht.length < SPERR_ZEICHEN_MIN) continue;
      for (let k = 0; k < gruppen.length; k++) {
        const g = gruppen[k];
        if (n > g.n && !alleZ) continue;
        const vielleicht = (h) => { if (!g.filter) return true; const f = fnvFach(h); return (g.filter[f >> 3] >> (f & 7)) & 1; };
        if ((n <= g.n && vielleicht(hR[k]) && g.set.has(abdruck(g.salz, raum))) || (n > 1 && alleZ && vielleicht(hD[k]) && g.set.has(abdruck(g.salz, dicht)))) { bester = n; break; }
      }
    }
    if (bester) { const a = woerter[s].i, e = woerter[s + bester - 1].e; aus.push({ wert: t.slice(a, e), index: a, ende: e }); s += bester; }
    else s++;
  }
  return aus;
}

/* Wert in der Wächter-Ausgabe: nie der Wert selbst. */
const WAECHTER_HALT_STRENG = new Set(["MAIL", "IBAN", "TELEFON", "SCHLUESSEL"]);
const waechterMuster = (w) => /muster|⟦|beispiel\.example|example\.(com|org|net)|@example\b|\.(example|test|invalid)\b/i.test(String(w));

/**
 * Der Git-Wächter: prüft Dateien (z. B. die eines Commits) und sagt, ob der Commit angehalten wird.
 * `dateien`: [{ pfad, bytes }]. `texte`: weitere Texte ohne Datei (Commit-Nachricht, Name und Mail des Autors) als
 * [{ wo, text }]. Optionen: `sperrliste`, `streng`, `werkzeuge`, `fortschritt`.
 * @returns {Promise<{ halt: Array<{ pfad, zeile?, grund }>, hinweise: Array<{ pfad, zeile?, art, artName }>, ungeprueft: Array<{ pfad, grund }>, dateien: number }>}
 */
export async function waechterPruefe(dateien, optionen = {}) {
  const liste = optionen.sperrliste || null;
  const halt = [], hinweise = [], gesehen = new Set();
  const halte = (pfad, zeile, grund) => { const k = pfad + ":" + (zeile || "") + ":" + grund; if (!gesehen.has(k)) { gesehen.add(k); halt.push({ pfad, zeile, grund }); } };
  const SPERR_GRUND = "Wert von der Sperrliste";
  const nurPruefen = [];
  for (const d of dateien || []) {
    const pfad = normPfad(d.pfad);
    const bytes = d.bytes instanceof Uint8Array ? d.bytes : new Uint8Array(d.bytes || 0);
    if (istTresor(pfad, bytes)) { halte(pfad, 0, "Tresor-Datei (" + TRESOR_ENDUNG + ") — gehört nie in ein Repo"); continue; }
    if (liste) {
      /* Sperrliste: jede Datei, auch in node_modules und Build-Ordnern; Text direkt, sonst lesbare Zeichenketten. */
      for (const tr of sperrTreffer(pfad, liste)) halte(pfad, 0, SPERR_GRUND + " im Datei- oder Ordnernamen");
      const t = istTextBytes(bytes) ? textAus(bytes) : null;
      const text = t ? t.text : zeichenketten(bytes);
      if (text) { const zeile = zeilenFinder(text); for (const tr of sperrTreffer(text, liste)) halte(pfad, t ? zeile(tr.index) : 0, SPERR_GRUND + (t ? "" : " (Zeichenkette in der Datei)")); }
    }
    nurPruefen.push({ pfad, bytes });
  }
  for (const x of optionen.texte || []) for (const _ of sperrTreffer(x.text, liste)) halte(x.wo, 0, SPERR_GRUND);
  /* Der ganze Suchkern: findet in PDF, Office, Archiven mehr Text (dort auch die Sperrliste) und liefert die Hinweise. */
  const r = nurPruefen.length ? await pruefe(nurPruefen, { werkzeuge: optionen.werkzeuge, sperrliste: liste, fortschritt: optionen.fortschritt }) : { befunde: [], inventur: [] };
  for (const b of r.befunde) {
    if (b.art === "GESPERRT" || b.gesperrt) { halte(b.pfad, b.zeile || 0, SPERR_GRUND + (b.stelle ? " (" + b.stelle + ")" : "")); continue; }
    if (b.schicht !== "hart" && b.schicht !== "meta") continue;
    if (b.vorschlag || b.art === "DATUM" || waechterMuster(b.wert)) continue;      // ein Datum allein nennt niemanden
    if (optionen.streng && WAECHTER_HALT_STRENG.has(b.art)) { halte(b.pfad, b.zeile || 0, (ART_NAME[b.art] || b.art) + " (streng)"); continue; }
    hinweise.push({ pfad: b.pfad, zeile: b.zeile, art: b.art, artName: ART_NAME[b.art] || b.art });
  }
  const ungeprueft = r.inventur.filter((e) => e.ungeprueft && e.art !== "ordner").map((e) => ({ pfad: e.pfad, grund: e.ungeprueft }));
  return { halt, hinweise, ungeprueft, dateien: nurPruefen.length + halt.filter((h) => /Tresor/.test(h.grund)).length, texte: (optionen.texte || []).length };
}

/** Die Wächter-Ausgabe als Text (nennt Dateien, Zeilen und Arten — nie Werte). */
export function waechterText(r, optionen = {}) {
  const z = [];
  const ort = (x) => x.pfad + (x.zeile ? ":" + x.zeile : "");
  if (r.halt.length) {
    z.push("Git-Wächter (Projekt-Reiniger Pro): ANGEHALTEN — " + r.halt.length + " Stelle(n).");
    for (const h of r.halt.slice(0, 50)) z.push("  ✗ " + ort(h) + " — " + h.grund);
    if (r.halt.length > 50) z.push("  … und " + (r.halt.length - 50) + " weitere");
    z.push("", "Was tun: die Stellen entfernen (Projekt-Reiniger: einwerfen, reinigen), neu hinzufügen, neu committen.",
      "Der Wert wird hier nie gezeigt — die Ausgabe landet in Protokollen, die andere lesen.");
  } else z.push("Git-Wächter (Projekt-Reiniger Pro): frei — " + r.dateien + " Datei(en)" + (r.texte ? " und " + r.texte + " Text(e) (Nachricht, Autor)" : "") + " geprüft" + (optionen.sperrliste ? ", Sperrliste mit " + sperrlisteGroesse(optionen.sperrliste) + " Fingerabdrücken" : ", ohne Sperrliste") + ".");
  if (r.hinweise.length) {
    const je = new Map();
    for (const h of r.hinweise) je.set(h.artName, (je.get(h.artName) || 0) + 1);
    z.push("Hinweise (halten nicht an" + (optionen.streng ? "" : "; mit --streng halten Mail, IBAN, Telefon und Schlüssel an") + "): " + Array.from(je, ([a, n]) => a + " " + n + "×").join(", ") + ".");
    for (const h of r.hinweise.slice(0, optionen.alleHinweise ? 1e9 : 10)) z.push("  · " + ort(h) + " — " + h.artName);
    if (!optionen.alleHinweise && r.hinweise.length > 10) z.push("  … und " + (r.hinweise.length - 10) + " weitere");
  }
  return z.join("\n");
}
