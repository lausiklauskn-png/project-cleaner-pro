/* Gegenprobe: jeder eingebaute Fehler muss in tests/probe.mjs SEINE rote Zeile werfen.
 * Läuft in einer Kopie (das Depot bleibt unberührt).  NUR_FALL="BREIT" node tests/gegenprobe.mjs
 * „blind“ = Probe blieb grün · „falscher Grund“ = rot, aber nicht mit der erwarteten Zeile · „toter Anker“ = Sabotage griff nicht. */
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const FAELLE = [
  ["BREIT", "assets/app.css", ".zahlen { list-style: none;", ".zahlen { min-width: 600px; list-style: none;", /läuft quer/],
  ["KNOPF", "assets/app.css", "  font: inherit; font-weight: 600; white-space: nowrap;", "  font: inherit; font-weight: 600; white-space: nowrap; max-width: 70px; overflow: hidden;", /Beschriftung passt nicht|abgeschnitten/],
  ["UMBRUCH", "assets/app.css", "  font: inherit; font-weight: 600; white-space: nowrap;", "  font: inherit; font-weight: 600; white-space: normal; max-width: 90px;", /bricht um/],
  ["HOEHE", "assets/app.css", "height: 100vh; height: 100dvh;", "height: 80vh;", /füllt das Fenster nicht/],
  ["PIN", "modules/25_pseudonym.js", "\"use strict\";", "\"use strict\"; ", /Pin modules\/25_pseudonym\.js/],
  ["NODEMOD", "assets/reiniger-kern.js", "    if (ue) {", "    if (false) {", /node_modules wird gar nicht/],
  ["GIT", "assets/reiniger-kern.js", "marke(\"GIT\",", "marke(\"XGIT\",", /\.git ist markiert/],
  ["CSP", "index.html", "connect-src 'none'", "connect-src *", /connect-src 'none'/],
  ["ICON", "icons/quelle.sha256", "", "0", /Icons sind aus der aktuellen Quelle/],
  ["CLEANER", "assets/app.css", "margin: 14px 0 0; color: #fff;", "margin: 14px 0 0; color: #888;", /„CLEANER“ stehen da/],
  ["UNGEPRUEFT", "assets/reiniger-kern.js", "    hinweise.push(\"Modul 25 (harte Angaben) fehlt", "    if (0) hinweise.push(\"Modul 25 (harte Angaben) fehlt", /ohne Modul 25/],
  ["LISTE", "assets/reiniger-listen.js", "Berlin|Hamburg|München|", "Berlin|München|", /Ort gebündelt/],
  ["ZEITZONE", "assets/reiniger-kern.js", "if (ZEITZONE_DAVOR.test(davor(m.index, 12))) continue;", "if (false) continue;", /Zeitzone|Fallen/],
  ["ESSEN", "assets/reiniger-kern.js", "if (!ORT_ZUSAMMENHANG.test(davor(m.index, 30))) continue;", "", /Fallen/],
  ["PFAD", "assets/reiniger-kern.js", "    neu(\"ORDNERPFAD\", m[1].toUpperCase()", "    if (0) neu(\"ORDNERPFAD\", m[1].toUpperCase()", /Windows-Ordnerpfad/],
  ["ORDNERNAME", "assets/reiniger-kern.js", "if (!imGit) gefuehltImPfad(", "if (false) gefuehltImPfad(", /Ordnernamen/],
  ["DOPPELT", "assets/reiniger-kern.js", "if (b.art === \"EIGENNAME\" && namen.has(", "if (false && namen.has(", /nicht doppelt/],
  ["GRUPPE", "assets/app.js", "[\"gefuehlt\", \"Gefühlte Metadaten\",", "[\"xgefuehlt\", \"Gefühlte Metadaten\",", /Gefühlte Metadaten/],
  ["ERSETZEN", "assets/reiniger-kern.js", "  const neu = text.replace(re, (treffer, pos) => {", "  const neu = text; text.replace(re, (treffer, pos) => {", /kein Originalwert mehr|Originalwerte/],
  ["GITMIT", "assets/reiniger-kern.js", "if (/(^|\\/)\\.git(\\/|$)/.test(pfad)) { gitDateien++; continue; }", "if (false) { gitDateien++; continue; }", /\.git geht nie mit/],
  ["ENVREST", "assets/reiniger-kern.js", "if (e.marken.some((m) => m.kennung === \"ENV\"))", "if (false)", /\.env — jeder Wert/],
  ["BEHALTEN", "assets/reiniger-kern.js", "  if (p.weg === \"behalten\") return null;", "", /behalten/],
  ["PLANWERT", "assets/reiniger-kern.js", "weg: s.weg, ersatz: s.ersatz });\n      sauber.push", "weg: s.weg, ersatz: s.ersatz + \" war: \" + s.schluessel });\n      sauber.push", /Originalwert|ohne Werte/],
  ["NACHPRUEF", "assets/reiniger-kern.js", "        if (re.test(text)) originalTreffer.push(", "        if (false) originalTreffer.push(", /laut genannt/],
  ["SPRUNG", "assets/app.js", "el(\"li\", { \"data-nr\": String(von + i + 1), class: von + i + 1 === zeile ? \"ziel\" : null }", "el(\"li\", { \"data-nr\": String(von + i + 1), class: null }", /Stelle antippen/],
  ["BEGRIFF", "assets/reiniger-kern.js", "  for (const f of begriffeIn(text, begriffe)) melde(", "  for (const f of []) melde(", /eigener Name/],
  ["FASSUNG", "sw.js", "const CACHE_VERSION = \"reiniger-v", "const CACHE_VERSION = \"reiniger-v9", /Fassung: APP_FASSUNG/],
  ["AKTUALISIEREN", "assets/app.js", "  location.reload();\n}", "}", /Aktualisieren: Seite lädt neu/],
  ["KITEXT", "assets/reiniger-kern.js", "  for (const st of PM.pruefeMail(\"\\n\" + t).stellen) {", "  for (const st of []) {", /KI-Anweisung in Markdown/],
  ["PIXEL", "assets/reiniger-kern.js", "if (/^(png|webp)$/.test(r.art) && typeof PA.verdachtPruefen === \"function\")", "if (false)", /Pixelprüfung/],
  ["ARCHIV", "assets/reiniger-kern.js", "      try { auf = await archivOeffnen(d.pfad, bytes); }", "      try { auf = null; }", /APK: geöffnet/],
  ["OCR", "assets/app.js", "T.createWorker = (sprachen, oem, opt, cfg) => roh(sprachen, oem, Object.assign({}, opt, { workerBlobURL: false }), cfg);", "T.createWorker = roh;", /Texterkennung: Mail im Bild/],
  ["ZEILEWEG", "assets/reiniger-kern.js", "          zeilen[nr - 1] = istDoku(pfad)", "          if (0) zeilen[nr - 1] = istDoku(pfad)", /Zeile entfernen/],
  /* Stufe 4 und Hell/Dunkel (2026-10-29) */
  ["REINIGUNGPIN", "assets/reinigung.js", "'use strict';", "'use strict'; ", /Pin assets\/reinigung\.js/],
  ["DOM", "assets/reiniger-kern.js", "export const KERN_FASSUNG = \"3\";", "export const KERN_FASSUNG = \"3\"; export function x() { return document.title; }", /kein DOM/],
  ["KASTEN", "assets/reiniger-kern.js", "      for (const k of ks) kastenMalen(s.bild, k);", "      for (const k of ks) void k;", /grauer Kasten/],
  ["RAUSCHEN", "assets/reiniger-kern.js", "      rauschen(s.bild);\n", "\n", /untersten Bits ist weg/],
  ["VERSTECKT", "assets/reiniger-kern.js", "        if (g) { versteckt[g] = (versteckt[g] || 0) + 1; R.zudecken(bild, st, m); continue; }", "        if (false) { continue; }", /Versteckter/],
  ["KOMMENTAR", "assets/reiniger-kern.js", "(footer\\d*|footnotes|endnotes)", "(footer\\d*|footnotes|endnotes|comments)", /Word neu gebaut/],
  ["NACHFINDEN", "assets/reiniger-kern.js", "    await nachfinden(abs.join(\"\\n\"), posten, optionen);\n", "", /nachgefunden|Nachprüfung 0/],
  ["ZEILENUEBER", "assets/reiniger-kern.js", "  zeilen.forEach((z, i) => { if (alle.length) alle.push({ c: \" \" }); for (const c of z) alle.push(Object.assign(c, { zeile: i })); });\n  const roh = trefferInZeile(alle, posten);", "  const roh = zeilen.flatMap((z, i) => trefferInZeile(z.map((c) => Object.assign(c, { zeile: i })), posten));", /Zeilenumbruch/],
  ["BREITE", "assets/app.js", "anteile: anteileVon(it), ", "", /deckt die Mail ganz/],
  ["MUSTERWEG", "assets/reiniger-kern.js", "export function musterFuer(pfad) { return MUSTER_JE_ENDUNG[endungVon(pfad)] || null; }", "export function musterFuer() { return null; }", /Muster/],
  ["KONTRAST", "assets/app.css", ".knopf.hell { min-height: 38px; background: rgb(0 20 40 / .35);", ".knopf.hell { min-height: 38px; background: rgb(255 255 255 / .6);", /Kontrast/],
  ["DUNKEL", "assets/app.css", ":root[data-thema=\"dunkel\"] {", ":root[data-thema=\"xdunkel\"] {", /wirklich dunkel/],
  ["UEBEREINANDER", "assets/app.css", ".wert { display: block; margin: 4px 0;", ".wert { display: block; margin: -16px 0 4px;", /Schrift über Schrift/],
  ["LEERZEILE", "assets/app.js", "function melde(text) { $(\"#meldung-text\").replaceChildren(", "function melde(text) { $(\"#meldung-text\").style.whiteSpace = \"pre-line\"; $(\"#meldung-text\").textContent = text; $(\"#meldung\").hidden = false; return; $(\"#meldung-text\").replaceChildren(", /doppelte Leerzeile/],
  ["NETZ", "assets/app.js", "/* nur für die Proben */", "fetch(\"https://beispiel.example/\").catch(() => {});\n/* nur für die Proben */", /Kein Netz|Konsole/],
  /* Befund Klaus 2026-10-29 */
  ["AUSKUNFT", "assets/app.css", ".zahlen li { display: inline; white-space: nowrap; }", ".zahlen li { display: inline; white-space: nowrap; border: 1px solid var(--linie); border-radius: 99px; }", /ist Auskunft/],
  ["ERKLAERUNG", "assets/app.js", "const p = el(\"p\", { class: \"erklaerung\", id, hidden: true,", "const p = el(\"p\", { class: \"erklaerung\", id, hidden: false,", /hinter ⓘ/],
];
const nur = process.env.NUR_FALL;
let gefangen = 0, schlecht = 0;
for (const [name, datei, alt, neu, erwartet] of FAELLE) {
  if (nur && !name.startsWith(nur.replace(/:$/, ""))) continue;
  const kopie = mkdtempSync(join(tmpdir(), "gegenprobe-"));
  cpSync(WURZEL, kopie, { recursive: true, filter: (q) => !/[\\/](\.git|node_modules)$/.test(q) });
  const p = join(kopie, datei), s = readFileSync(p, "utf8");
  const n = alt === "" ? 1 : s.split(alt).length - 1;
  if (n !== 1) { console.log("  ✗ " + name + ": toter Anker (" + n + "× gefunden)"); schlecht++; rmSync(kopie, { recursive: true }); continue; }
  writeFileSync(p, alt === "" ? neu + s : s.replace(alt, neu));
  const r = spawnSync(process.execPath, [join(kopie, "tests/probe.mjs")], { encoding: "utf8", timeout: 600000 });
  const rote = (r.stdout || "").split("\n").filter((z) => z.includes("ROT:"));
  if (r.status === 0) { console.log("  ✗ " + name + ": BLIND (Probe blieb grün)"); schlecht++; }
  else if (!rote.some((z) => erwartet.test(z))) { console.log("  ✗ " + name + ": aus falschem Grund (Rückgabe " + r.status + "): " + (rote[0] || (r.stdout || "").slice(-200))); schlecht++; }
  else { console.log("  ✓ " + name + ": gefangen — " + rote.find((z) => erwartet.test(z)).trim().slice(0, 110)); gefangen++; }
  rmSync(kopie, { recursive: true });
}
console.log("\n" + gefangen + " gefangen · " + schlecht + " blind/falsch/tot");
process.exit(schlecht ? 1 : 0);
