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
