/* Projekt-Reiniger Pro — die Web-Dateien für die App-Hüllen (Android: Capacitor, Windows: Tauri) in `www/` legen.
 * Kopiert wird nur eine feste Liste dessen, was die Seite braucht — nie docs/, tests/, tools/, node_modules/.
 * Der Code bleibt derselbe wie in der PWA (eine Codebasis); was nur im Browser Sinn hat (Installieren, Aktualisieren,
 * Service-Worker), schaltet app.js in der Hülle selbst ab.
 *   node tools/native/prepare-web.mjs [ziel]      (Vorgabe: www) */
import { cpSync, rmSync, mkdirSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ZIEL = join(WURZEL, process.argv[2] || "www");
const LISTE = ["index.html", "manifest.json", "sw.js", "assets", "modules", "vendor", "icons"];

rmSync(ZIEL, { recursive: true, force: true });
mkdirSync(ZIEL, { recursive: true });
let dateien = 0, bytes = 0;
const zaehle = (p) => { const s = statSync(p); if (s.isDirectory()) for (const k of readdirSync(p)) zaehle(join(p, k)); else { dateien++; bytes += s.size; } };
for (const t of LISTE) {
  const von = join(WURZEL, t);
  if (!existsSync(von)) throw new Error("fehlt: " + t);
  cpSync(von, join(ZIEL, t), { recursive: true, dereference: false, filter: (q) => !/(^|[\\/])\.|\.(md|mjs)$/.test(q.slice(WURZEL.length + 1)) || q === von });
  zaehle(join(ZIEL, t));
}
console.log("www: " + dateien + " Dateien, " + (bytes / 1048576).toFixed(1) + " MB → " + ZIEL);
