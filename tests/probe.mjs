/* Projekt-Reiniger Pro — die Probe (Stufen 1 und 3).
 *
 *   node tests/probe.mjs            alles
 *   BILDER=<ordner> node tests/…    legt Bildschirmfotos ab
 *
 * Teil A läuft ohne Browser (Kern, Pins), Teil B im echten Chromium.
 * Rückgabe: 0 grün · 1 rot · 2 nicht lauffähig (kein Browser) — „nicht lauffähig“ ist kein Grün.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, extname, normalize } from "node:path";
import { findeChromium } from "./chromium-finden.mjs";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
let gruen = 0, rot = 0;
function ok(satz, wahr, mehr) {
  if (wahr) { gruen++; console.log("  ✓ " + satz); }
  else { rot++; console.log("  ✗ ROT: " + satz + (mehr ? "  — " + mehr : "")); }
}
const sha = (p) => createHash("sha256").update(readFileSync(join(WURZEL, p))).digest("hex");
const lies = (p) => readFileSync(join(WURZEL, p), "utf8");

/* ── Pins: byte-1:1 aus Sende-Prüfer / Auslieferungsprüfer / Sage. Dort pflegen, hier neu kopieren. ── */
export const PINS = {
  "modules/25_pseudonym.js": "8c3092babee80b8fce2c6607cc4c8ced4bbef4addf31a5f0f3de6ba5c92c2ad7",   // Sage-Modul 25 (MODUL25_SHA)
  "assets/pruefer-anhang.js": "c31ddb5cebc293b542e781a5d1f3bca6d558da227db997822c73b2b8a4c1ea17",  // ANHANG_SHA
  "assets/pruefer-formate.js": "c7206f163521fd3cf1b09845a7e547e912564838ff1bf899c2575366764d15cd", // FORMATE_SHA
  "assets/pruefer-mail.js": "cdf3ca7881bfa68763a2c0be7436d35a65bea4dbd03f606e02eaec5c613632d7",    // MAIL_SHA
  "assets/pruefer.js": "9b004f0c76bf8d79b75d361b5b8d4cae87d2b2becd229f2d37391e93566300fd",         // HTML_SHA
  "vendor/pdfjs/pdf.min.js": "978fd1b2d134a98e98966186a97777bebf87d8e770dadab1ece3687e21a5aa6c",
  "vendor/pdfjs/pdf.worker.min.js": "38cde5311957b86bc3669f93e7d2566de333a90055ed6635bef60d9bf00e96f2",
};

console.log("A · ohne Browser");
for (const [p, s] of Object.entries(PINS)) ok("Pin " + p, existsSync(join(WURZEL, p)) && sha(p) === s, "neu kopieren, nicht abwandeln");

ok("Icons sind aus der aktuellen Quelle gebaut (sonst: node tools/icons-bauen.mjs)",
  lies("icons/quelle.sha256").trim() === sha("icons/kristall-quelle.png"), "veraltet");
for (const p of ["icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png", "favicon-32.png", "favicon-48.png", "logo-96.png", "kristall.webp"])
  ok("Icon da: " + p, existsSync(join(WURZEL, "icons", p)));
function pngGroesse(p) { const b = readFileSync(join(WURZEL, p)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
ok("icon-512 ist 512×512", pngGroesse("icons/icon-512.png").join() === "512,512");
ok("favicon-32 ist 32×32", pngGroesse("icons/favicon-32.png").join() === "32,32");

const html = lies("index.html");
const csp = (/http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html) || [])[1] || "";
ok("CSP: connect-src 'none' (kein Netz, auch nicht aus Versehen)", /connect-src 'none'/.test(csp));
ok("CSP: kein unsafe-eval, kein unsafe-inline bei Skripten", !/unsafe-eval/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp));
const mani = JSON.parse(lies("manifest.json"));
ok("manifest: display standalone (Fensterknöpfe bleiben), nicht fullscreen", mani.display === "standalone");
ok("manifest: theme_color #0b3154", mani.theme_color === "#0b3154");
const kernQuelle = lies("assets/reiniger-kern.js") + "\n" + lies("assets/reiniger-listen.js");
ok("Kern und Wortlisten kennen kein DOM, keine IndexedDB, kein Netz",
  !/\bdocument\b|\bwindow\b|indexedDB|\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|navigator\./.test(kernQuelle.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "")));
ok("Kern importiert nur die Wortlisten (sonst nichts von außen)",
  (lies("assets/reiniger-kern.js").match(/^import .*$/gm) || []).join() === 'import * as L from "./reiniger-listen.js";');
ok("Kern hat seine Typen (reiniger-kern.d.ts)", existsSync(join(WURZEL, "assets/reiniger-kern.d.ts")));
const sw = lies("sw.js");
ok("Vorrat: pdf.js steht nicht darin (wird erst bei Bedarf geholt)", !/pdfjs/.test(sw));
ok("Vorrat: die Wortlisten stehen darin (sonst offline kein Kern)", /"assets\/reiniger-listen\.js"/.test(sw));

const req = createRequire(import.meta.url);
for (const f of ["modules/25_pseudonym.js", "assets/pruefer-formate.js", "assets/pruefer-mail.js", "assets/pruefer.js", "assets/pruefer-anhang.js"]) req(join(WURZEL, f));
const Kern = await import(pathToFileURL(join(WURZEL, "assets/reiniger-kern.js")).href);
const { beispielProjekt } = await import(pathToFileURL(join(WURZEL, "assets/beispiel.js")).href);
{
  const r = await Kern.pruefe(await beispielProjekt());
  const art = (a, w) => r.buendel.some((b) => b.art === a && (!w || b.wert === w));
  const inv = (p) => r.inventur.find((e) => e.pfad === p);
  ok("node_modules wird gar nicht erst gelesen (übersprungen, nicht geöffnet)",
    !!inv("musterapp/node_modules/") && !r.inventur.some((e) => /node_modules\/paket/.test(e.pfad)) && r.zahlen.uebersprungen === 1);
  ok(".git ist markiert", (inv("musterapp/.git/config") || { marken: [] }).marken.some((m) => m.kennung === "GIT"));
  ok(".env ist markiert", (inv("musterapp/.env") || { marken: [] }).marken.some((m) => m.kennung === "ENV"));
  ok("Sicherung (.bak) ist markiert", (inv("musterapp/src/alt.js.bak") || { marken: [] }).marken.some((m) => m.kennung === "SICHERUNG"));
  ok("Export (.csv) ist markiert", (inv("musterapp/daten/kunden-export.csv") || { marken: [] }).marken.some((m) => m.kennung === "EXPORT"));
  ok("Impressum ist markiert", (inv("musterapp/impressum.html") || { marken: [] }).marken.some((m) => m.kennung === "IMPRESSUM"));
  ok("hart: Mail gebündelt", r.buendel.some((b) => b.art === "MAIL" && b.wert === "erika.mustermann@beispiel.example" && b.anzahl >= 3));
  ok("hart: IBAN", art("IBAN", "DE02120300000000202051"));
  ok("hart: Telefon", art("TELEFON"));
  ok("hart: Datum", art("DATUM", "12.03.1985"));
  ok("hart: Schlüssel aus .env", art("SCHLUESSEL"));
  ok("hart: Name als Vorschlag", r.buendel.some((b) => b.art === "NAME" && b.vorschlag && b.wert === "Max Beispiel"));
  ok("meta: Verfasser aus package.json", art("VERFASSER", "Erika Mustermann"));
  ok("meta: Copyright", art("COPYRIGHT", "Erika Mustermann"));
  ok("meta: Benutzername im Pfad", art("BENUTZERPFAD", "erika"));
  ok("meta: Git-Name aus config UND aus dem losen Objekt", r.buendel.some((b) => b.art === "GIT-NAME" && b.stellen.some((s) => /objects/.test(s.pfad)) && b.stellen.some((s) => /config$/.test(s.pfad))));
  /* Stufe 3: gefühlte Metadaten */
  const gef = (a, w) => r.buendel.find((b) => b.schicht === "gefuehlt" && b.art === a && (!w || b.wert === w));
  ok("gefühlt: Ort gebündelt, auch aus dem Ordnernamen", (gef("ORT", "Hamburg") || { stellen: [] }).stellen.some((s) => /Ordnernamen/.test(s.stelle || "")) && gef("ORT", "Hamburg").anzahl >= 3);
  ok("gefühlt: Stadtteil", !!gef("ORT", "Altona"));
  ok("gefühlt: Zeitzone „Europe/Berlin“ ist kein Ort", !r.befunde.some((b) => b.art === "ORT" && /knoepfe/.test(b.pfad)));
  ok("gefühlt: Hochschule", !!gef("HOCHSCHULE", "Universität Hamburg"));
  ok("gefühlt: Firma mit Rechtsform", !!gef("FIRMA", "Beispiel Software GmbH"));
  ok("gefühlt: Straße und Hausnummer, PLZ und Ort", !!gef("ADRESSE", "Kastanienallee 7") && !!gef("PLZ-ORT", "22767 Hamburg"));
  ok("gefühlt: Kfz-Kennzeichen", !!gef("KFZ", "HH-XY 1234"));
  ok("gefühlt: Kindername auf einem Knopf (Vorschlag)", !!gef("EIGENNAME", "Lena") && gef("EIGENNAME", "Lena").vorschlag);
  ok("gefühlt: Rechnername", !!gef("RECHNER", "DESKTOP-7QK2M9X"));
  ok("gefühlt: fester Windows-Ordnerpfad mit Leerzeichen", !!gef("ORDNERPFAD", "G:\\02BEISPIEL-SOFTWARE\\Kunde\\SOFTWARE TESTORDNER"));
  ok("gefühlt: ein Name, der schon als Name dasteht, kommt nicht doppelt", !gef("EIGENNAME", "Max Beispiel") && art("NAME", "Max Beispiel"));
  ok("gefühlt: Musterwerte zählen nicht (Musterweg 1)", !r.befunde.some((b) => /Muster/.test(b.wert) && b.schicht === "gefuehlt"));
  ok("Stufen: .js = 1, .csv = 1", inv("musterapp/src/start.js").stufe === 1 && inv("musterapp/daten/kunden-export.csv").stufe === 1);
  ok("Funde werden gebündelt: Zahl der Bündel < Zahl der Funde", r.buendel.length < r.befunde.length);
}
{
  /* ZIP: selbst gebaut (gespeichert + deflate), node_modules darin wird nie entpackt. */
  const T = new TextEncoder();
  async function deflateRaw(b) { const cs = new CompressionStream("deflate-raw"), w = cs.writable.getWriter(); w.write(b); w.close(); return new Uint8Array(await new Response(cs.readable).arrayBuffer()); }
  const eintraege = [["p/a.txt", T.encode("Mail: anna@beispiel.example\n"), 8], ["p/node_modules/x.js", T.encode("GEHEIM"), 99], ["p/b.txt", T.encode("nichts"), 0]];
  const teile = [], zentral = []; let off = 0;
  for (const [n, roh, m] of eintraege) {
    const name = T.encode(n), daten = m === 8 ? await deflateRaw(roh) : roh;
    const lh = new Uint8Array(30 + name.length), v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(8, m, true); v.setUint32(18, daten.length, true); v.setUint32(22, roh.length, true); v.setUint16(26, name.length, true); lh.set(name, 30);
    const ch = new Uint8Array(46 + name.length), c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(10, m, true); c.setUint32(20, daten.length, true); c.setUint32(24, roh.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true); ch.set(name, 46);
    teile.push(lh, daten); zentral.push(ch); off += lh.length + daten.length;
  }
  const zl = zentral.reduce((n, x) => n + x.length, 0), ende = new Uint8Array(22), e = new DataView(ende.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, 3, true); e.setUint16(10, 3, true); e.setUint32(12, zl, true); e.setUint32(16, off, true);
  const zip = new Uint8Array(off + zl + 22); let p = 0; for (const x of [...teile, ...zentral, ende]) { zip.set(x, p); p += x.length; }
  const ein = await Kern.einwerfen([{ pfad: "projekt.zip", bytes: zip }]);
  ok("ZIP: drei Einträge im Inhaltsverzeichnis", ein.dateien.length === 3);
  ok("ZIP: Packverfahren 99 heißt ungeprüft, nie sauber", /ungeprüft/.test(ein.dateien.find((d) => /node_modules/.test(d.pfad)).unlesbar || ""));
  let entpackt = 0; ein.dateien.forEach((d) => { if (d.lesen) { const l = d.lesen; d.lesen = () => { entpackt++; return l(); }; } });
  const r = await Kern.pruefe(ein.dateien);
  ok("ZIP: deflate gelesen, Mail gefunden", r.buendel.some((b) => b.art === "MAIL" && b.wert === "anna@beispiel.example"));
  ok("ZIP: genau zwei Einträge entpackt (node_modules nie)", entpackt === 2, "entpackt " + entpackt);
}
{
  /* Rauschen: nichts davon ist eine gefühlte Angabe. Jede Zeile ist eine Falle, in die eine Wortliste tappen könnte. */
  const fallen = [
    "nach dem Essen gehen wir los; Halle 3 ist offen; wir siegen; der Zug fährt",
    'const tz = "Europe/Berlin"; const tz2 = "Europe/Zurich";',
    "Java SE 17, UIKit, WebKit, Math.max(a, b), Rate Limited, Plan AB",
    "Zeichen A-Z 0-9, UTF-8, ISO-8859-1, KS X 1001, F-T1, M AB12",
    "20000 Zeilen, 10000 Einträge, 2024 Neue Funktionen, 4000 Punkte",
    "Musterstraße 1, 12345 Musterstadt, Musterfirma GmbH",
    'C:\\Windows\\System32, "C:\\Program Files\\App", printf("S:\\n%s\\n")',
    "git@github.com:org/repo.git, user@localhost, this.home, config.local",
    'const monate = ["Jan", "Feb"]; label = "Max"; Max Width; Max Age',
    "Lizenz: Google LLC, Microsoft Corporation, Facebook Inc.",
    "TU es einfach; FH ist gut; HS Code",
  ].join("\n");
  const f = Kern.gefuehlt(fallen);
  ok("gefühlt: keine Fehlfunde in den Fallen (Zeitzone, Essen, Java SE, A-Z 0-9, Jan …)", f.length === 0, f.map((x) => x.art + "=" + x.wert).join(" | "));
}
{
  const r = await Kern.pruefe([{ pfad: "a.txt", bytes: new TextEncoder().encode("x@beispiel.example") }], { werkzeuge: {} });
  ok("ohne Modul 25: laut „UNGEPRÜFT“, nicht sauber", r.hinweise.some((h) => /Modul 25.*UNGEPRÜFT/.test(h)) && /ungeprüft/.test(r.inventur[0].ungeprueft));
}

/* ── B · im Browser ─────────────────────────────────────────────── */
console.log("B · im Browser");
let pw; try { pw = req("playwright-core"); } catch { try { pw = req("playwright"); } catch { pw = null; } }
const chrome = findeChromium();
if (!pw) { console.log("  ⊘ nicht lauffähig: playwright fehlt (npm install)"); ende(2); }

const TYPEN = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
const server = createServer((q, a) => {
  let p = decodeURIComponent(new URL(q.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const datei = normalize(join(WURZEL, p));
  if (!datei.startsWith(WURZEL) || !existsSync(datei) || statSync(datei).isDirectory() || /[\\/](tests|tools|node_modules|\.git)[\\/]/.test(datei.slice(WURZEL.length))) { a.writeHead(404); a.end(); return; }
  a.writeHead(200, { "content-type": TYPEN[extname(datei)] || "application/octet-stream" });
  a.end(readFileSync(datei));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const BASIS = "http://127.0.0.1:" + server.address().port + "/";
let browser;
try { browser = await pw.chromium.launch({ executablePath: chrome || undefined }); }
catch (e) { console.log("  ⊘ nicht lauffähig: Chromium startet nicht (" + e.message.split("\n")[0] + ")"); server.close(); ende(2); }

/* Das Maß für „Vollbild, nichts läuft quer, nichts abgeschnitten“ — läuft in der Seite. */
function messen() {
  const fehler = [], W = innerWidth, H = innerHeight;
  const sichtbar = (e) => { const s = getComputedStyle(e); if (s.display === "none" || s.visibility === "hidden") return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const name = (e) => e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "");
  if (document.documentElement.scrollWidth > W + 1) fehler.push("läuft quer: Seite " + document.documentElement.scrollWidth + " px bei " + W + " px Fenster");
  const app = document.getElementById("app").getBoundingClientRect();
  if (Math.abs(app.height - H) > 1 || Math.abs(app.width - W) > 1) fehler.push("füllt das Fenster nicht: App " + Math.round(app.width) + "×" + Math.round(app.height) + " bei " + W + "×" + H);
  for (const e of document.querySelectorAll("#app *")) {
    if (!sichtbar(e) || e.closest(".ziehen")) continue;
    const r = e.getBoundingClientRect();
    /* waagerecht: nichts ragt über das Fenster oder über seinen Kasten hinaus */
    if (r.right > W + 1 || r.left < -1) { fehler.push("läuft quer: " + name(e) + " " + Math.round(r.left) + "…" + Math.round(r.right)); continue; }
    const v = e.parentElement;
    if (v && v.id !== "app" && sichtbar(v)) {
      const pr = v.getBoundingClientRect();
      if (r.right > pr.right + 1.5 || r.left < pr.left - 1.5) fehler.push("ragt über seinen Kasten: " + name(e) + " in " + name(v));
    }
    const s = getComputedStyle(e);
    if (s.textOverflow === "ellipsis" && e.scrollWidth > e.clientWidth + 1) fehler.push("abgeschnitten (…): " + name(e));
    if (/^(BUTTON|LABEL|SPAN|A|H1|H2|P|LI|SUMMARY|B)$/.test(e.tagName) && s.display !== "inline" && e.scrollWidth > e.clientWidth + 1 && s.overflowX !== "visible")
      fehler.push("abgeschnitten: " + name(e) + " (" + e.scrollWidth + " > " + e.clientWidth + ")");
    if (/^(BUTTON|LABEL)$/.test(e.tagName) && e.scrollWidth > e.clientWidth + 1) fehler.push("Beschriftung passt nicht: " + name(e) + " „" + e.textContent.trim() + "“");
    /* ein Knopf, dessen Wort mitten im Wort umbricht: mehr Zeilen als Wörter */
    if (/^(BUTTON|LABEL)$/.test(e.tagName) && e.classList.contains("knopf")) {
      const zeilen = Math.round((r.height - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom)) / parseFloat(s.lineHeight || 20));
      if (zeilen > 1) fehler.push("Knopf bricht um: „" + e.textContent.trim() + "“");
    }
  }
  return fehler;
}

const GROESSEN = [[320, 640], [360, 740], [412, 915], [768, 1024], [1280, 800], [740, 360], [1920, 1080]];
const netz = [];
const ctx = await browser.newContext({ serviceWorkers: "block" });
const seite = await ctx.newPage();
const konsole = [];
seite.on("console", (m) => { if (m.type() === "error") konsole.push(m.text()); });
seite.on("pageerror", (e) => konsole.push(String(e)));
seite.on("request", (q) => { if (!q.url().startsWith(BASIS) && !q.url().startsWith("data:") && !q.url().startsWith("blob:")) netz.push(q.url()); });

await seite.goto(BASIS + "?ohne-sw", { waitUntil: "load" });
ok("Prüfkerne geladen (Modul 25, Anhang-Prüfer)", await seite.evaluate(() => !!(window.SbkimPseudonym && window.PrueferAnhang)));
ok("Leere Fläche: Kristall und „CLEANER“ stehen da", await seite.evaluate(() => {
  const w = document.querySelector(".einwurf .wort"), i = document.querySelector(".einwurf .kristall");
  return !!w && w.textContent === "CLEANER" && getComputedStyle(w).color === "rgb(255, 255, 255)" && i.complete && i.naturalWidth > 0;
}));
ok("Favicon und Logo zeigen den Kristall", /favicon-32\.png/.test(html) && /logo-96\.png/.test(html));

async function alleGroessen(zustand) {
  for (const [w, h] of GROESSEN) {
    await seite.setViewportSize({ width: w, height: h });
    await seite.waitForTimeout(60);
    const f = await seite.evaluate(messen);
    ok(zustand + " " + w + "×" + h + ": Vollbild, nichts quer, nichts abgeschnitten", f.length === 0, f.slice(0, 4).join(" | "));
    if (process.env.BILDER) await seite.screenshot({ path: join(process.env.BILDER, zustand.replace(/\W+/g, "-") + "-" + w + "x" + h + ".png") });
  }
}
await alleGroessen("Einwurf");

await seite.setViewportSize({ width: 1280, height: 800 });
await seite.click("#beispiel");
await seite.waitForFunction(() => window.__reiniger.ergebnis() && document.querySelector("#fortschritt").hidden, null, { timeout: 30000 });
ok("Beispielprojekt: Funde gebündelt angezeigt", await seite.evaluate(() => document.querySelectorAll(".buendel").length > 5 && !!document.querySelector('.buendel[data-art="MAIL"] [data-wert]')));
ok("Beispielprojekt: Inventur zeigt Marken und Stufen", await seite.evaluate(() => !!document.querySelector('[data-marke="GIT"]') && !!document.querySelector('[data-marke="ENV"]') && !!document.querySelector('[data-stufe="1"]')));
ok("Beispielprojekt: node_modules steht als „nicht gelesen“ da", await seite.evaluate(() => /nicht gelesen/.test((document.querySelector('[data-pfad="musterapp/node_modules/"]') || {}).textContent || "")));
ok("Beispielprojekt: Gruppe „Gefühlte Metadaten“ mit Kennzeichen und Ordnerpfad", await seite.evaluate(() => {
  const g = document.querySelector('.gruppe[data-gruppe="gefuehlt"]');
  return !!g && /Gefühlte Metadaten/.test(g.querySelector("h2").textContent) && !!g.querySelector('.buendel[data-art="KFZ"]') && !!g.querySelector('.buendel[data-art="ORDNERPFAD"]');
}));
ok("Fremde Werte nur als Text (kein HTML aus dem Projekt in der Seite)", await seite.evaluate(() => !document.querySelector("#befunde h1, #inventur h1, #befunde br")));
await alleGroessen("Funde");
await seite.setViewportSize({ width: 360, height: 740 });
await seite.click('[data-reiter="inventur"]');
ok("Handy: Reiter wechselt zur Inventur", await seite.evaluate(() => getComputedStyle(document.querySelector("#inventur")).display !== "none" && getComputedStyle(document.querySelector("#befunde")).display === "none"));
await alleGroessen("Inventur");

/* Eine leere Prüfung: auch dort die leere Fläche mit Kristall. */
await seite.setViewportSize({ width: 1280, height: 800 });
await seite.evaluate(() => window.__reiniger.starte([{ pfad: "leer.txt", bytes: new TextEncoder().encode("nichts Besonderes\n") }]));
ok("Keine Funde: leere Fläche mit „CLEANER“ und dem Satz „nicht garantiert alles“", await seite.evaluate(() => {
  const l = document.querySelector("#befunde [data-leer]"); return !!l && /CLEANER/.test(l.textContent) && /nicht garantiert alles/.test(l.textContent);
}));
await seite.setViewportSize({ width: 320, height: 640 });
{ const f = await seite.evaluate(messen); ok("Keine Funde 320×640: nichts quer", f.length === 0, f.slice(0, 3).join(" | ")); }

/* PDF über pdf.js aus dem eigenen Ordner — ein kleines, selbst gebautes PDF mit Verfasser. */
const pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 52>>stream\nBT /F1 12 Tf 10 100 Td (Mail anna@beispiel.example) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n6 0 obj<</Author(Anna Beispiel)/Producer(Probe)>>endobj\ntrailer<</Root 1 0 R/Info 6 0 R>>\n%%EOF\n";
await seite.evaluate((s) => window.__reiniger.starte([{ pfad: "brief.pdf", bytes: new TextEncoder().encode(s) }]), pdf);
await seite.waitForFunction(() => document.querySelector("#fortschritt").hidden, null, { timeout: 30000 });
const pdfR = await seite.evaluate(() => { const r = window.__reiniger.ergebnis(); return { b: r.buendel.map((b) => b.art + "=" + b.wert), i: r.inventur[0] }; });
ok("PDF: Stufe 2, als PDF markiert", pdfR.i.stufe === 2 && pdfR.i.marken.some((m) => m.kennung === "PDF"), JSON.stringify(pdfR.i));
ok("PDF: Metadaten (Verfasser) gefunden", pdfR.b.some((x) => /^PDF-METADATEN=/.test(x) && /Anna Beispiel/.test(x)), pdfR.b.join(" | "));
ok("PDF: Seitentext über pdf.js gelesen, Mail gefunden", pdfR.b.includes("MAIL=anna@beispiel.example"), pdfR.b.join(" | "));

ok("Kein Netz: keine einzige Anfrage nach außen", netz.length === 0, netz.join(", "));
ok("Keine Fehler in der Konsole", konsole.length === 0, konsole.slice(0, 3).join(" | "));
await browser.close(); server.close();
ende(rot ? 1 : 0);

function ende(code) {
  console.log("\n" + gruen + " grün · " + rot + " ROT" + (code === 2 ? " · NICHT LAUFFÄHIG" : ""));
  process.exit(code);
}
