/* Baut alle Icons und Bilder aus EINER Quelle: icons/kristall-quelle.png (Klaus 2026-10-28).
 * Nie von Hand ändern — Quelle tauschen, dann `node tools/icons-bauen.mjs`.
 * Die Probe vergleicht icons/quelle.sha256 mit der Quelle und meldet sonst „veraltet“.
 *
 * Ganzes Bild:   icon-512, icon-192, apple-touch-icon (180), maskable-512 (auf 80 % verkleinert)
 * Ausschnitt:    favicon-32, favicon-48, logo-96 — nur der Kristall, damit er klein erkennbar bleibt
 * Leere Flächen: kristall.webp (640), kristall-gross.webp (1254)
 * App-Hüllen (2026-10-29): Android-Icons (mipmap-*), Android-Startbild (drawable-…/splash.png, Kristall mit „CLEANER“),
 *                Windows-Icon (windows/src-tauri/icons/icon.ico, PNG-Einträge 16–256) — nur, wenn die Ordner da sind.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
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
/* Android: Dichte → Kantenlänge (Icon 48 dp, Vordergrund 108 dp), Startbild hoch/quer. */
const DICHTE = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const RES = join(WURZEL, "android", "app", "src", "main", "res");
if (existsSync(RES)) for (const [d, f] of Object.entries(DICHTE)) {
  AUFTRAEGE.push(["android:mipmap-" + d + "/ic_launcher.png", Math.round(48 * f), "ganz", "image/png"]);
  AUFTRAEGE.push(["android:mipmap-" + d + "/ic_launcher_round.png", Math.round(48 * f), "rund", "image/png"]);
  AUFTRAEGE.push(["android:mipmap-" + d + "/ic_launcher_foreground.png", Math.round(108 * f), "vordergrund", "image/png"]);
  AUFTRAEGE.push(["android:drawable-port-" + d + "/splash.png", [Math.round(320 * f), Math.round(480 * f)], "start", "image/png"]);
  AUFTRAEGE.push(["android:drawable-land-" + d + "/splash.png", [Math.round(480 * f), Math.round(320 * f)], "start", "image/png"]);
}
if (existsSync(RES)) AUFTRAEGE.push(["android:drawable/splash.png", [480, 320], "start", "image/png"]);
const ICO = [16, 24, 32, 48, 64, 128, 256];
if (existsSync(join(WURZEL, "windows", "src-tauri"))) for (const n of ICO) AUFTRAEGE.push(["ico:" + n, n, n <= 48 ? "kristall" : "ganz", "image/png"]);
const aus = await seite.evaluate(async ({ b64, auftraege, a, grund }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const ergebnis = {};
  /* Der Kristall mit weich auslaufendem Rand (das Bild hat einen eigenen, dunkleren Grund — sonst sähe man ein Quadrat). */
  const weich = (() => { const n = img.naturalWidth, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d");
    g.drawImage(img, 0, 0); g.globalCompositeOperation = "destination-in";
    const r = g.createRadialGradient(n / 2, n / 2, n * 0.3, n / 2, n / 2, n * 0.5); r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, n, n); return c; })();
  for (const [name, n, art, typ] of auftraege) {
    const [w, h] = Array.isArray(n) ? n : [n, n];
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high";
    if (art === "ganz") g.drawImage(img, 0, 0, n, n);
    else if (art === "rund") { g.beginPath(); g.arc(n / 2, n / 2, n / 2, 0, Math.PI * 2); g.clip(); g.drawImage(img, 0, 0, n, n); }
    else if (art === "vordergrund") { g.fillStyle = grund; g.fillRect(0, 0, n, n); g.drawImage(weich, n * 0.12, n * 0.12, n * 0.76, n * 0.76); }
    else if (art === "start") {
      g.fillStyle = grund; g.fillRect(0, 0, w, h);
      const k = Math.min(w, h) * 0.6, x = (w - k) / 2, y = h * 0.5 - k * 0.62;
      g.drawImage(weich, x, y, k, k);
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "top";
      g.font = "800 " + Math.round(k * 0.2) + "px system-ui, sans-serif";
      if ("letterSpacing" in g) g.letterSpacing = Math.round(k * 0.025) + "px";
      g.fillText("CLEANER", w / 2, y + k * 0.97);
    }
    else if (art === "maskable") { g.fillStyle = grund; g.fillRect(0, 0, n, n); g.drawImage(img, n * 0.1, n * 0.1, n * 0.8, n * 0.8); }
    else g.drawImage(img, a.x, a.y, a.seite, a.seite, 0, 0, n, n);
    ergebnis[name] = c.toDataURL(typ, 0.86).split(",")[1];
  }
  return ergebnis;
}, { b64: roh.toString("base64"), auftraege: AUFTRAEGE, a: AUSSCHNITT, grund: GRUND });
await browser.close();
const icoTeile = [];
for (const [name, b64] of Object.entries(aus)) {
  const b = Buffer.from(b64, "base64");
  if (name.startsWith("android:")) { const p = join(RES, name.slice(8)); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b); }
  else if (name.startsWith("ico:")) icoTeile.push([+name.slice(4), b]);
  else writeFileSync(join(WURZEL, "icons", name), b);
}
/* ICO mit PNG-Einträgen (seit Windows Vista erlaubt): Kopf, Verzeichnis, dann die PNGs. */
if (icoTeile.length) {
  const kopf = Buffer.alloc(6 + 16 * icoTeile.length); kopf.writeUInt16LE(0, 0); kopf.writeUInt16LE(1, 2); kopf.writeUInt16LE(icoTeile.length, 4);
  let off = kopf.length;
  icoTeile.forEach(([n, b], i) => { const o = 6 + 16 * i; kopf[o] = n >= 256 ? 0 : n; kopf[o + 1] = n >= 256 ? 0 : n; kopf.writeUInt16LE(1, o + 4); kopf.writeUInt16LE(32, o + 6); kopf.writeUInt32LE(b.length, o + 8); kopf.writeUInt32LE(off, o + 12); off += b.length; });
  const ziel = join(WURZEL, "windows", "src-tauri", "icons"); mkdirSync(ziel, { recursive: true });
  writeFileSync(join(ziel, "icon.ico"), Buffer.concat([kopf, ...icoTeile.map(([, b]) => b)]));
}
writeFileSync(join(WURZEL, "icons", "quelle.sha256"), createHash("sha256").update(roh).digest("hex") + "\n");
console.log("gebaut:", Object.keys(aus).join(", "));
