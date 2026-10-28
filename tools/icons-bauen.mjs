/* Baut alle Icons und Bilder aus EINER Quelle: icons/kristall-quelle.png (Klaus 2026-10-28).
 * Nie von Hand ändern — Quelle tauschen, dann `node tools/icons-bauen.mjs`.
 * Die Probe vergleicht icons/quelle.sha256 mit der Quelle und meldet sonst „veraltet“.
 *
 * Ganzes Bild:   icon-512, icon-192, apple-touch-icon (180), maskable-512 (auf 80 % verkleinert)
 * Ausschnitt:    favicon-32, favicon-48, logo-96 — nur der Kristall, damit er klein erkennbar bleibt
 * Leere Flächen: kristall.webp (640), kristall-gross.webp (1254)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUELLE = join(WURZEL, "icons", "kristall-quelle.png");
const req = createRequire(import.meta.url);
let pw; try { pw = req("playwright-core"); } catch { pw = req("playwright"); }
const { findeChromium } = await import("../tests/chromium-finden.mjs");

/* Ausschnitt um den Kristall (in Pixeln der 1254er Quelle), gemessen am Bild. */
export const AUSSCHNITT = { x: 330, y: 150, seite: 880 };
const GRUND = "#0a2e52";   // Rand des Bildes, für die Maskable-Fassung

const roh = readFileSync(QUELLE);
const browser = await pw.chromium.launch({ executablePath: findeChromium() || undefined });
const seite = await browser.newPage();
await seite.setContent("<body></body>");
const AUFTRAEGE = [
  ["icon-512.png", 512, "ganz", "image/png"], ["icon-192.png", 192, "ganz", "image/png"],
  ["apple-touch-icon.png", 180, "ganz", "image/png"], ["maskable-512.png", 512, "maskable", "image/png"],
  ["favicon-32.png", 32, "kristall", "image/png"], ["favicon-48.png", 48, "kristall", "image/png"],
  ["logo-96.png", 96, "kristall", "image/png"],
  ["kristall.webp", 640, "ganz", "image/webp"], ["kristall-gross.webp", 1254, "ganz", "image/webp"],
];
const aus = await seite.evaluate(async ({ b64, auftraege, a, grund }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const ergebnis = {};
  for (const [name, n, art, typ] of auftraege) {
    const c = document.createElement("canvas"); c.width = c.height = n;
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
    if (art === "ganz") g.drawImage(img, 0, 0, n, n);
    else if (art === "maskable") { g.fillStyle = grund; g.fillRect(0, 0, n, n); g.drawImage(img, n * 0.1, n * 0.1, n * 0.8, n * 0.8); }
    else g.drawImage(img, a.x, a.y, a.seite, a.seite, 0, 0, n, n);
    ergebnis[name] = c.toDataURL(typ, 0.86).split(",")[1];
  }
  return ergebnis;
}, { b64: roh.toString("base64"), auftraege: AUFTRAEGE, a: AUSSCHNITT, grund: GRUND });
await browser.close();
for (const [name, b64] of Object.entries(aus)) writeFileSync(join(WURZEL, "icons", name), Buffer.from(b64, "base64"));
writeFileSync(join(WURZEL, "icons", "quelle.sha256"), createHash("sha256").update(roh).digest("hex") + "\n");
console.log("gebaut:", Object.keys(aus).join(", "));
