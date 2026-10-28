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
  ["KNOPF", "assets/app.css", "  font: inherit; font-size: .95rem; font-weight: 600; white-space: nowrap;", "  font: inherit; font-size: .95rem; font-weight: 600; white-space: nowrap; max-width: 70px; overflow: hidden;", /Beschriftung passt nicht|abgeschnitten/],
  ["UMBRUCH", "assets/app.css", "  font: inherit; font-size: .95rem; font-weight: 600; white-space: nowrap;", "  font: inherit; font-size: .95rem; font-weight: 600; white-space: normal; max-width: 90px;", /bricht um/],
  ["HOEHE", "assets/app.css", "height: 100vh; height: 100dvh;", "height: 80vh;", /füllt das Fenster nicht/],
  ["PIN", "modules/25_pseudonym.js", "\"use strict\";", "\"use strict\"; ", /Pin modules\/25_pseudonym\.js/],
  ["NODEMOD", "assets/reiniger-kern.js", "    if (ue) {", "    if (false) {", /node_modules wird gar nicht/],
  ["GIT", "assets/reiniger-kern.js", "marke(\"GIT\",", "marke(\"XGIT\",", /\.git ist markiert/],
  ["CSP", "index.html", "connect-src 'none'", "connect-src *", /connect-src 'none'/],
  ["ICON", "icons/quelle.sha256", "", "0", /Icons sind aus der aktuellen Quelle/],
  ["CLEANER", "assets/app.css", "margin: 14px 0 0; color: #fff;", "margin: 14px 0 0; color: #888;", /„CLEANER“ stehen da/],
  ["UNGEPRUEFT", "assets/reiniger-kern.js", "    hinweise.push(\"Modul 25 (harte Angaben) fehlt", "    if (0) hinweise.push(\"Modul 25 (harte Angaben) fehlt", /ohne Modul 25/],
  /* Stufe 2 */
  ["ERSETZEN", "assets/reiniger-kern.js", "const ersatz = alsCode ? t.code : t.text;", "const ersatz = treffer;", /kein entfernter Wert steckt noch/],
  ["GITMIT", "assets/reiniger-kern.js", "if (/(^|\\/)\\.git(\\/|$)/.test(d.pfad)) { gitWeg++; continue; }", "if (false) { gitWeg++; continue; }", /\.git auf „reinigen“ setzt/],
  ["GITWAHL", "assets/reiniger-kern.js", "dateien[e.pfad] = { wie: \"weglassen\", moeglich: [\"weglassen\"]", "dateien[e.pfad] = { wie: \"weglassen\", moeglich: [\"weglassen\", \"reinigen\"]", /\.git fest weg/],
  ["PLANWERT", "assets/reiniger-kern.js", "ersatz, art: t.marke,", "ersatz: ersatz + \" \" + t.wert, art: t.marke,", /nennen keinen alten Wert/],
  ["NUMMER", "assets/reiniger-kern.js", "text = \"⟦\" + m + \"-\" + zaehler[m] + \"⟧\";", "text = \"⟦\" + m + \"-1⟧\";", /anderer Wert = andere Nummer/],
  ["GRENZE", "assets/reiniger-kern.js", "(WORT.test(t.wert[0]) ? \"(?<![\\\\p{L}\\\\p{N}_])\" : \"\")", "\"\"", /Wortgrenzen/],
  ["CODE", "assets/reiniger-kern.js", "const rein = ersetze(text, istCode(d.pfad), neu, \"text\");", "const rein = ersetze(text, false, neu, \"text\");", /Musterwert statt Marke|gültiges JSON/],
  ["NACHREST", "assets/reiniger-kern.js", "      if (bytesFinden(klein, new TextEncoder().encode(w)) !== -1 ||", "      if (0 && bytesFinden(klein, new TextEncoder().encode(w)) !== -1 ||", /alter Wert steckt noch in einer unverändert/],
  ["BEHALTEN", "assets/reiniger-kern.js", "    if (wie === \"behalten\") continue;", "    if (wie === \"behalten\") wie = \"entfernen\";", /behalten: der Wert bleibt/],
  ["ENVWEG", "assets/reiniger-kern.js", "const WEG_MARKEN = new Set([\"ENV\", ", "const WEG_MARKEN = new Set([", /\.env, Sicherung, Export/],
  ["BAUEN", "assets/app.js", "knopf.addEventListener(\"click\", bauen);", "", /Bauen: der Knopf baut/],
  ["ZIPCRC", "assets/reiniger-kern.js", "for (let i = 0; i < b.length; i++) c = CRC_TAFEL[(c ^ b[i]) & 255] ^ (c >>> 8);", "for (let i = 1; i < b.length; i++) c = CRC_TAFEL[(c ^ b[i]) & 255] ^ (c >>> 8);", /crc32|fremder Leser/],
  ["LEISTE", "assets/app.css", ".reinigen .knopf { min-height: 32px; padding: 3px 12px; font-size: .9rem; }", ".reinigen .knopf { min-height: 32px; padding: 3px 12px; font-size: .9rem; }\n.reinigen { flex-wrap: nowrap; }", /Ergebnis .*(läuft quer|ragt über|abgeschnitten|passt nicht)/],
  /* alle Dateiarten: Archive in jeder Tiefe, Bilder ohne Metadaten */
  ["INNENZIP", "assets/reiniger-kern.js", "      await auspacken(k, tiefe + 1, wurzel ? archiv : pfad);", "      aus.push(Object.assign({}, k, { archiv: wurzel ? archiv : pfad }));", /ZIP in ZIP, tar, tar\.gz und \.gz werden ausgepackt/],
  ["TAR", "assets/reiniger-kern.js", "  if (/\\.tar$/.test(n)) return \"tar\";", "  if (/\\.tar$/.test(n)) return null;", /ausgepackt|tar/],
  ["TIEFE", "assets/reiniger-kern.js", "export const ARCHIV_TIEFE_MAX = 4;", "export const ARCHIV_TIEFE_MAX = 99;", /bis Tiefe/],
  ["NEUPACKEN", "assets/reiniger-kern.js", "    sauber.push({ pfad: c.neu, bytes: await archivBauen(c.art, innen),", "    sauber.push({ pfad: c.neu, bytes: new Uint8Array(0),", /Fremder Leser|Archive neu gepackt|kein Rest/],
  ["ARCHIVZU", "assets/reiniger-kern.js", "      ? \"Archiv nicht ausgepackt (\" + (end ? \".\" + end : \"unbekannte Art\") + \") — sein Inhalt ist ungeprüft\" : \"\";", "      ? \"\" : \"\";", /\.jar\), heißt ungeprüft/],
  ["ARCHIVWEG", "assets/reiniger-kern.js", "if (c.wie === \"weglassen\") {\n      for", "if (false) {\n      for", /Archiv weglassen/],
  ["PNGTEXT", "assets/reiniger-kern.js", "const PNG_BLEIBT = new Set([\"IHDR\",", "const PNG_BLEIBT = new Set([\"tEXt\", \"IHDR\",", /PNG öffnet sich, ohne Text|kein alter Wert/],
  ["JPEGEXIF", "assets/reiniger-kern.js", "const behalten = !app && m !== 0xFE ||", "const behalten = app || m === 0xFE ||", /Ohne Metadaten \(foto\.jpg\)/],
  ["WEBPXMP", "assets/reiniger-kern.js", "if (typ === \"EXIF\" || typ === \"XMP \") weg.push(typ.trim());\n      else {", "if (false) weg.push(typ.trim());\n      else {", /Ohne Metadaten \(bild\.webp\)/],
  ["ANHAENGSEL", "assets/reiniger-kern.js", "      if (typ === \"IEND\") { ende = true; break; }", "      if (typ === \"IEND\") { ende = true; teile.push(b.subarray(p)); break; }", /kein alter Wert|kein Rest/],
  ["NACHAUSPACKEN", "assets/reiniger-kern.js", "  const ein = await einwerfen(rein.sauber.map((x) => ({ pfad: x.pfad, bytes: x.bytes })), { wurzelZip: false });", "  const ein = { dateien: rein.sauber.map((x) => ({ pfad: x.pfad, bytes: x.bytes })), hinweise: [] };", /Nachprüfung packt die Kopie wieder aus/],
  ["BILDWAHL", "assets/reiniger-kern.js", "dateien[e.pfad] = { wie: hart ? \"weglassen\" : \"metadaten\",", "dateien[e.pfad] = { wie: \"weglassen\",", /PNG ohne Metadaten|Ohne Metadaten übernehmen/],
  /* Hineinziehen: Dateien und Ordner */
  ["ZIEHEN", "assets/app.js", "  if (liste.length) starte(liste);\n});", "});", /Hineinziehen von Dateien/],
  ["ZIEHNM", "assets/app.js", "      if (Kern.UEBERSPRINGEN.includes(eintrag.name)) { liste.push(", "      if (false) { liste.push(", /node_modules wird nicht geöffnet/],
  ["ZIEHTEXT", "assets/app.js", "const ziehtDateien = (e) => !!e.dataTransfer && Array.from(e.dataTransfer.types || []).includes(\"Files\");", "const ziehtDateien = (e) => !!e.dataTransfer;", /Text ziehen/],
  ["ZIEHGROESSE", "assets/app.js", "liste.push({ pfad, groesse: f.size, lesen:", "liste.push({ pfad, lesen:", /Größe vorher bekannt/],
  ["NETZ", "assets/app.js", "/* nur für die Proben */", "fetch(\"https://beispiel.example/\").catch(() => {});\n/* nur für die Proben */", /Kein Netz|Konsole/],
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
