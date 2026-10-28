/* Projekt-Reiniger Pro — die Probe (Stufe 1 + 2).
 *
 *   node tests/probe.mjs            alles
 *   BILDER=<ordner> node tests/…    legt Bildschirmfotos ab
 *
 * Teil A läuft ohne Browser (Kern, Pins), Teil B im echten Chromium.
 * Rückgabe: 0 grün · 1 rot · 2 nicht lauffähig (kein Browser) — „nicht lauffähig“ ist kein Grün.
 */
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { crc32 as zlibCrc32 } from "node:zlib";
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
const kernQuelle = lies("assets/reiniger-kern.js");
ok("Kern kennt kein DOM, keine IndexedDB, kein Netz",
  !/\bdocument\b|\bwindow\b|indexedDB|\bfetch\s*\(|XMLHttpRequest|WebSocket|localStorage|navigator\./.test(kernQuelle.replace(/^\s*(\/\/|\*|\/\*).*$/gm, "")));
ok("Kern hat seine Typen (reiniger-kern.d.ts)", existsSync(join(WURZEL, "assets/reiniger-kern.d.ts")));
const sw = lies("sw.js");
ok("Vorrat: pdf.js steht nicht darin (wird erst bei Bedarf geholt)", !/pdfjs/.test(sw));

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
  const r = await Kern.pruefe([{ pfad: "a.txt", bytes: new TextEncoder().encode("x@beispiel.example") }], { werkzeuge: {} });
  ok("ohne Modul 25: laut „UNGEPRÜFT“, nicht sauber", r.hinweise.some((h) => /Modul 25.*UNGEPRÜFT/.test(h)) && /ungeprüft/.test(r.inventur[0].ungeprueft));
}


/* ── A2 · Stufe 2: entscheiden, reinigen, Stellenplan, Nachprüfung, ZIP ── */
console.log("A2 · Stufe 2 ohne Browser");
const T8 = (s) => new TextEncoder().encode(s), D8 = (b) => new TextDecoder().decode(b);
{
  const dateien = await beispielProjekt();
  const r = await Kern.pruefe(dateien);
  const e = Kern.vorschlag(r);
  const erika = e.werte.filter((x) => x.schluessel === "erika mustermann");
  ok("Vorschlag: ein Wert über alle Arten ist EINE Entscheidung (Verfasser, Copyright, Git-Name)", erika.length === 1 && erika[0].arten.length >= 3 && erika[0].marke === "NAME", JSON.stringify(erika));
  ok("Vorschlag: jeder Wert steht auf „entfernen“", e.werte.length >= 8 && e.werte.every((w) => w.wie === "entfernen"));
  ok("Vorschlag: .git fest weg (keine andere Wahl)", e.dateien["musterapp/.git/config"].moeglich.join() === "weglassen");
  ok("Vorschlag: .env, Sicherung, Export standardmäßig weg; README, Impressum, Code reinigen",
    ["musterapp/.env", "musterapp/src/alt.js.bak", "musterapp/daten/kunden-export.csv"].every((p) => e.dateien[p].wie === "weglassen") &&
    ["musterapp/README.md", "musterapp/impressum.html", "musterapp/src/start.js"].every((p) => e.dateien[p].wie === "reinigen"));
  const rein = await Kern.reinige(dateien, e);
  const pfade = rein.sauber.map((x) => x.pfad);
  const text = (p) => D8(rein.sauber.find((x) => x.pfad === p).bytes);
  ok("Saubere Kopie ohne .git", pfade.length > 0 && !pfade.some((p) => /(^|\/)\.git(\/|$)/.test(p)), pfade.join(", "));
  ok("Saubere Kopie ohne node_modules", !pfade.some((p) => /node_modules/.test(p)));
  ok("Saubere Kopie ohne .env, Sicherung, Export (Vorgabe)", !pfade.some((p) => /\.env$|\.bak$|kunden-export/.test(p)));
  const alle = rein.zuordnung.map((z) => z.wert);
  const rest = [];
  for (const x of rein.sauber) { const t = D8(x.bytes).toLowerCase(); for (const w of alle) if (t.includes(w.toLowerCase())) rest.push(x.pfad + ": " + w); }
  ok("kein entfernter Wert steckt noch in der Kopie", alle.length >= 8 && rest.length === 0, rest.slice(0, 3).join(" | "));
  ok("Text: Marke statt Wert (README: ⟦NAME-1⟧, ⟦MAIL-1⟧)", /Gebaut von ⟦NAME-1⟧\./.test(text("musterapp/README.md")) && /an ⟦MAIL-1⟧ oder ⟦TELEFON-1⟧/.test(text("musterapp/README.md")), text("musterapp/README.md"));
  ok("gleicher Wert = gleiche Nummer, anderer Wert = andere Nummer",
    /⟦NAME-1⟧<br>/.test(text("musterapp/impressum.html")) && /Mail: ⟦MAIL-1⟧/.test(text("musterapp/impressum.html")) &&
    /Frau ⟦NAME-1⟧,/.test(text("musterapp/brief.txt")) && /Grüße\n⟦NAME-2⟧/.test(text("musterapp/brief.txt")), text("musterapp/brief.txt"));
  ok("Code: Musterwert statt Marke, das Programm läuft weiter (start.js)",
    !/⟦/.test(text("musterapp/src/start.js")) && /konto = "DE00000000000000000001"/.test(text("musterapp/src/start.js")) && /geburtstag = "01\.01\.2000"/.test(text("musterapp/src/start.js")) && /Users\\\\benutzer\\\\/.test(text("musterapp/src/start.js")), text("musterapp/src/start.js"));
  let pj = null; try { pj = JSON.parse(text("musterapp/package.json")); } catch { /* rot unten */ }
  ok("Code: package.json bleibt gültiges JSON, mit Musterwert", !!pj && pj.author === "Max Mustermann <muster1@beispiel.example>", text("musterapp/package.json"));
  const nach = await Kern.nachpruefe(rein, e);
  const planT = Kern.stellenplanText(rein), planJ = Kern.stellenplanJson(rein), ber = Kern.bericht(rein, nach);
  ok("Stellenplan und Bericht nennen keinen alten Wert (Text, JSON, Bericht)", alle.every((w) => ![planT, planJ, ber].some((x) => x.toLowerCase().includes(w.toLowerCase()))));
  ok("Stellenplan: jede Stelle zeigt auf eine Datei der Kopie, mit Zeile", rein.stellenplan.length >= 10 && rein.stellenplan.every((x) => pfade.includes(x.pfad) && (x.zeile > 0 || x.ort)));
  ok("Stellenplan: in der genannten Zeile steht der Ersatz", rein.stellenplan.every((x) => x.ort || text(x.pfad).split("\n")[x.zeile - 1].includes(x.ersatz)));
  ok("Stellenplan im Format des Briefs", /musterapp\/impressum\.html\s+Zeile 1\s+⟦NAME-1⟧\s+Art: Name/.test(planT) && /musterapp\/src\/start\.js\s+Zeile 1\s+Max Mustermann \(war: Name\)/.test(planT), planT.slice(0, 400));
  ok("Nachprüfung: mit den Vorgaben nichts offen", nach.offen.length === 0, JSON.stringify(nach.offen).slice(0, 300));
  ok("Bericht: zählt, was ersetzt und weggelassen wurde", /Name → Marke: \d+×/.test(ber) && /musterapp\/\.env — /.test(ber) && /Nichts offen gefunden/.test(ber) && /nicht garantiert alles/.test(ber));

  /* behalten, eigener Wert, .env doch reinigen, .git per Entscheidung „reinigen“ */
  const e2 = Kern.vorschlag(r);
  e2.werte.find((x) => x.wert === "Max Beispiel").wie = "behalten";
  Object.assign(e2.werte.find((x) => x.schluessel === "erika mustermann"), { wie: "eigen", eigen: "Klaus Eigen" });
  e2.dateien["musterapp/.env"].wie = "reinigen";
  e2.dateien["musterapp/.git/config"].wie = "reinigen";
  const r2 = await Kern.reinige(dateien, e2);
  const t2 = (p) => { const x = r2.sauber.find((y) => y.pfad === p); return x ? D8(x.bytes) : ""; };
  ok("behalten: der Wert bleibt stehen", /Grüße\nMax Beispiel/.test(t2("musterapp/brief.txt")));
  ok("eigener Wert: steht überall, in Text und Code", /Gebaut von Klaus Eigen\./.test(t2("musterapp/README.md")) && /Copyright 2025 Klaus Eigen/.test(t2("musterapp/src/start.js")));
  ok(".env auf „reinigen“: kommt mit, Schlüssel durch Musterwert ersetzt", /API_KEY=MUSTER-SCHLUESSEL-1/.test(t2("musterapp/.env")), t2("musterapp/.env"));
  ok("auch wenn eine Entscheidung .git auf „reinigen“ setzt: .git kommt nicht mit", !r2.sauber.some((x) => /\.git\//.test(x.pfad)));
  const n2 = await Kern.nachpruefe(r2, e2);
  ok("Nachprüfung: bewusst Behaltenes und eigene Werte sind nicht „offen“", !n2.offen.some((o) => /Max Beispiel|Klaus Eigen/.test(o.wert || "")), JSON.stringify(n2.offen).slice(0, 300));
}
{
  /* Nachprüfung muss laut werden: eine Binärdatei mit Mail, bewusst unverändert übernommen. */
  const bin = new Uint8Array([0, 1, 2, 3, 0xff, 0xfe, ...T8("kontakt anna@beispiel.example"), 0, 0, 7]);
  const d3 = [{ pfad: "p/daten.bin", bytes: bin }, { pfad: "p/a.txt", bytes: T8("Mail an anna@beispiel.example\n") }];
  const r3 = await Kern.pruefe(d3), e3 = Kern.vorschlag(r3);
  ok("Vorschlag: Binärdatei mit Funden standardmäßig weg", e3.dateien["p/daten.bin"].wie === "weglassen");
  e3.dateien["p/daten.bin"].wie = "uebernehmen";
  const rr3 = await Kern.reinige(d3, e3), n3 = await Kern.nachpruefe(rr3, e3);
  ok("Nachprüfung nennt laut: ein alter Wert steckt noch in einer unverändert übernommenen Datei", n3.offen.some((o) => o.grund === "rest" && o.pfad === "p/daten.bin"), JSON.stringify(n3.offen).slice(0, 300));
  ok("Nachprüfung nennt die ungeprüfte Datei in der Kopie", n3.offen.some((o) => o.grund === "ungeprueft" && o.pfad === "p/daten.bin"));
  const b3 = Kern.bericht(rr3, n3);
  ok("Bericht nennt OFFEN, ohne den Wert", /OFFEN: p\/daten\.bin/.test(b3) && !/anna@/.test(b3));
}
{
  /* Wortgrenzen, Groß/klein, Dateinamen */
  const e4 = { fassung: 1, werte: [{ schluessel: "anna", wert: "Anna", arten: ["NAME"], marke: "NAME", wie: "entfernen", eigen: "" },
    { schluessel: "erika", wert: "erika", arten: ["BENUTZERPFAD"], marke: "BENUTZER", wie: "entfernen", eigen: "" }],
    dateien: { "q/erika/x.md": { wie: "reinigen", moeglich: ["reinigen", "weglassen"], grund: "" } } };
  const r4 = await Kern.reinige([{ pfad: "q/erika/x.md", bytes: T8("Anna Muster, Annabell, Hanna, ANNA, Amerika\n") }], e4);
  ok("Ersetzen achtet auf Wortgrenzen und auf Groß/klein", r4.sauber.length === 1 && D8(r4.sauber[0].bytes) === "⟦NAME-1⟧ Muster, Annabell, Hanna, ⟦NAME-1⟧, Amerika\n", r4.sauber[0] && D8(r4.sauber[0].bytes));
  ok("Dateinamen: ein Wert im Pfad wird zum Musterwert, im Stellenplan als „Datei- oder Ordnername“", r4.sauber[0].pfad === "q/benutzer/x.md" && r4.stellenplan.some((x) => x.ort && x.pfad === "q/benutzer/x.md"), r4.sauber[0].pfad);
}
{
  /* ZIP: ein fremder Leser muss es öffnen können, Prüfsummen stimmen */
  const dateien = await beispielProjekt();
  const r = await Kern.pruefe(dateien), e = Kern.vorschlag(r), rein = await Kern.reinige(dateien, e), nach = await Kern.nachpruefe(rein, e);
  const aus = await Kern.ausgabe(rein, nach);
  ok("ZIP: Name aus dem Projektordner", aus.name === "musterapp-sauber.zip", aus.name);
  const z = Kern.zipDateien(aus.zip);
  const namen = z.dateien.map((d) => d.pfad);
  ok("ZIP: Kopie plus _reiniger/ (Stellenplan, Bericht)", namen.length === rein.sauber.length + 3 && namen.includes("musterapp/_reiniger/STELLENPLAN.txt") && namen.includes("musterapp/_reiniger/BERICHT.txt"), namen.join(", "));
  let gleich = true; for (const s of rein.sauber) { const d = z.dateien.find((x) => x.pfad === s.pfad); if (!d || Buffer.compare(Buffer.from(await d.lesen()), Buffer.from(s.bytes)) !== 0) gleich = false; }
  ok("ZIP: jede Datei kommt Byte für Byte zurück", gleich);
  const probe = T8("Prüfsumme ⟦NAME-1⟧ ".repeat(50));
  ok("crc32 stimmt mit node:zlib überein", Kern.crc32(probe) === zlibCrc32(probe));
  const ord = mkdtempSync(join(tmpdir(), "reiniger-zip-")); writeFileSync(join(ord, "k.zip"), aus.zip);
  const py = spawnSync("python3", ["-I", "-c", "import zipfile,sys\nz=zipfile.ZipFile(sys.argv[1])\nprint(z.testzip(), len(z.namelist()))", join(ord, "k.zip")], { encoding: "utf8" });
  rmSync(ord, { recursive: true });
  if (py.error) console.log("  ⊘ fremder ZIP-Leser nicht da (python3 fehlt) — nicht gemessen");
  else ok("ZIP: fremder Leser (Python zipfile) öffnet es, Prüfsummen stimmen", py.status === 0 && py.stdout.trim() === "None " + namen.length, (py.stdout + py.stderr).trim().slice(0, 200));
}

/* ── A3 · alle Dateiarten: Archive in jeder Tiefe, Bilder ohne Metadaten ── */
console.log("A3 · Archive und Bilder ohne Browser");
const MUSTER = join(WURZEL, "tests/muster");
const muster = (n) => new Uint8Array(readFileSync(join(MUSTER, n)));
function fremdPruefen(zipBytes) {
  const ord = mkdtempSync(join(tmpdir(), "reiniger-fremd-")); writeFileSync(join(ord, "s.zip"), zipBytes);
  const py = spawnSync("python3", ["-I", join(WURZEL, "tests/muster-pruefen.py"), join(ord, "s.zip")], { encoding: "utf8" });
  rmSync(ord, { recursive: true });
  if (py.error) return null;
  try { return JSON.parse(py.stdout); } catch { return { kaputt: (py.stdout + py.stderr).slice(0, 300) }; }
}
{
  const ein = await Kern.einwerfen([{ pfad: "mix.zip", bytes: muster("mix.zip") }]);
  const p = ein.dateien.map((d) => d.pfad);
  ok("Auspacken: ZIP in ZIP, tar, tar.gz und .gz werden ausgepackt (von Python gebaut)",
    p.includes("app/vorlagen.zip/notiz.txt") && p.includes("app/alt.tar.gz/alt/info.txt") && p.includes("app/notiz.txt.gz/notiz.txt") && p.includes("app/daten.tar/kontakt.txt") &&
    p.some((x) => /^app\/alt\.tar\.gz\/alt\/(langer-ordnername-){6}\/x\.txt$/.test(x)), p.join(", "));
  ok("Auspacken: jede ausgepackte Datei kennt ihr Archiv", ein.dateien.find((d) => d.pfad === "app/vorlagen.zip/notiz.txt").archiv === "app/vorlagen.zip");
  const r = await Kern.pruefe(ein.dateien);
  const inv = (x) => r.inventur.find((e) => e.pfad === x) || {};
  ok("Prüfen: Funde in Dateien im inneren ZIP und im tar.gz", r.buendel.some((b) => b.art === "MAIL" && b.stellen.some((s) => s.pfad === "app/vorlagen.zip/notiz.txt")) &&
    r.buendel.some((b) => b.art === "TELEFON" && b.stellen.some((s) => s.pfad === "app/alt.tar.gz/alt/info.txt")) &&
    r.buendel.some((b) => b.art === "IBAN" && b.stellen.some((s) => /langer-ordnername/.test(s.pfad))));
  ok("Inventur: das Archiv steht als „ausgepackt“ da", inv("app/vorlagen.zip").art === "archiv" && inv("app/vorlagen.zip").ausgepackt === 2 && inv("app/alt.tar.gz").ausgepackt === 2);
  ok("Ein Archiv, das nicht ausgepackt wird (.jar), heißt ungeprüft", /Archiv nicht ausgepackt/.test(inv("app/werkzeug.jar").ungeprueft || ""), JSON.stringify(inv("app/werkzeug.jar")));
  const e = Kern.vorschlag(r);
  ok("Vorschlag: Archive neu packen, PNG ohne Metadaten, .jar weg",
    e.dateien["app/vorlagen.zip"].wie === "reinigen" && e.dateien["app/bild.png"].wie === "metadaten" && e.dateien["app/werkzeug.jar"].wie === "weglassen");
  const rein = await Kern.reinige(ein.dateien, e), nach = await Kern.nachpruefe(rein, e);
  ok("Saubere Kopie: Archive neu gepackt, ihr Inhalt steht nicht lose daneben",
    rein.sauber.some((x) => x.pfad === "app/vorlagen.zip" && x.neuGepackt === 2) && rein.sauber.some((x) => x.pfad === "app/alt.tar.gz" && x.neuGepackt === 2) &&
    !rein.sauber.some((x) => /\.(zip|gz)\//.test(x.pfad)), rein.sauber.map((x) => x.pfad).join(", "));
  ok("Zählung: Dateien in Archiven zählen mit (9 Dateien, 4 Archive neu gepackt, .jar weg)", rein.zahlen.dateien === 9 && rein.zahlen.archive === 4 && rein.weg.length === 1, JSON.stringify(rein.zahlen));
  ok("Stellenplan: Stellen im Archiv mit Pfad „archiv.zip/datei“", rein.stellenplan.some((x) => x.pfad === "app/vorlagen.zip/notiz.txt" && x.zeile === 1));
  ok("Nachprüfung packt die Kopie wieder aus: kein Rest, nur „Text im Bild ungeprüft“",
    nach.offen.length === 1 && nach.offen[0].grund === "ungeprueft" && nach.offen[0].pfad === "app/bild.png", JSON.stringify(nach.offen).slice(0, 300));
  const e3 = Kern.vorschlag(r); e3.dateien["app/vorlagen.zip/notiz.txt"].wie = "uebernehmen";
  const r3 = await Kern.reinige(ein.dateien, e3), n3 = await Kern.nachpruefe(r3, e3);
  ok("Nachprüfung findet einen Rest auch in einem neu gepackten Archiv", n3.offen.some((o) => o.grund === "rest" && o.pfad === "app/vorlagen.zip/notiz.txt"), JSON.stringify(n3.offen).slice(0, 300));
  const f = fremdPruefen((await Kern.ausgabe(rein, nach)).zip);
  if (!f) console.log("  ⊘ fremder Leser nicht da (python3 fehlt) — nicht gemessen");
  else {
    ok("Fremder Leser (Python): ZIP, inneres ZIP, tar.gz und .gz öffnen sich", f.testzip === null && f.dateien.includes("app/vorlagen.zip/notiz.txt") && f.dateien.includes("app/alt.tar.gz/alt/info.txt") && f.dateien.includes("app/notiz.txt.gz/"), JSON.stringify(f).slice(0, 300));
    ok("Fremder Leser: kein alter Wert in irgendeiner Datei, auch nicht im Archiv oder im Bild", f.rest.length === 0, f.rest.join(", "));
    if (f.bilder) ok("Fremder Leser (Pillow): das PNG öffnet sich, ohne Text-Metadaten", f.bilder["app/bild.png"] && f.bilder["app/bild.png"].format === "PNG" && f.bilder["app/bild.png"].info.length === 0, JSON.stringify(f.bilder));
  }
  const e2 = Kern.vorschlag(r); e2.dateien["app/vorlagen.zip"].wie = "weglassen";
  const r2 = await Kern.reinige(ein.dateien, e2);
  ok("Archiv weglassen: sein Inhalt kommt auch nicht mit, der Stellenplan nennt ihn nicht",
    !r2.sauber.some((x) => /vorlagen/.test(x.pfad)) && !r2.stellenplan.some((x) => /vorlagen/.test(x.pfad)) && r2.weg.some((w) => w.pfad === "app/vorlagen.zip"));
}
{
  const ein = await Kern.einwerfen([{ pfad: "tief.zip", bytes: muster("tief.zip") }]);
  ok("Archiv in Archiv: bis Tiefe " + Kern.ARCHIV_TIEFE_MAX + " ausgepackt, darunter benannt und ungeprüft",
    ein.dateien.some((d) => /ebene\d\.zip$/.test(d.pfad) && d.bytes && !d.ausgepackt) && ein.hinweise.some((h) => /tiefer als 4 Ebenen/.test(h)), ein.dateien.map((d) => d.pfad).join(", "));
}
{
  for (const [n, art] of [["foto.jpg", "JPEG"], ["progressiv.jpg", "JPEG"], ["bild.webp", "WebP"]]) {
    const vor = muster(n), m = Kern.ohneMetadaten(vor);
    const t = m ? D8(m.bytes).toLowerCase() : "";
    ok("Ohne Metadaten (" + n + "): EXIF, Kommentar, XMP und Anhängsel weg", !!m && m.bytes.length < vor.length && !/erika|anna@|kamera/.test(t) && /EXIF/.test(m.entfernt), m && m.entfernt);
  }
  const ord = mkdtempSync(join(tmpdir(), "reiniger-bild-"));
  for (const n of ["foto.jpg", "progressiv.jpg", "bild.webp"]) writeFileSync(join(ord, n), Kern.ohneMetadaten(muster(n)).bytes);
  const py = spawnSync("python3", ["-I", "-W", "ignore", "-c", "import sys,json\nfrom PIL import Image\nd=sys.argv[1]; m=sys.argv[2]\nout={}\nfor n in ['foto.jpg','progressiv.jpg','bild.webp']:\n a=Image.open(d+'/'+n); a.load(); b=Image.open(m+'/'+n).convert('RGB')\n out[n]=[len(a.getexif()), list(a.convert('RGB').getdata())==list(b.getdata())]\nprint(json.dumps(out))", ord, MUSTER], { encoding: "utf8" });
  rmSync(ord, { recursive: true });
  if (py.error || /No module named/.test(py.stderr)) console.log("  ⊘ Pillow fehlt — Pixelvergleich nicht gemessen");
  else ok("Pillow: die Bilder öffnen sich, ohne EXIF, mit denselben Bildpunkten", py.status === 0 && Object.values(JSON.parse(py.stdout)).every(([ex, gleich]) => ex === 0 && gleich), (py.stdout + py.stderr).slice(0, 300));
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
ok("Fremde Werte nur als Text (kein HTML aus dem Projekt in der Seite)", await seite.evaluate(() => !document.querySelector("#befunde h1, #inventur h1, #befunde br")));
/* Stufe 2 im Browser: entscheiden, bauen, herunterladen */
ok("Entscheiden: jeder ersetzbare Fund hat eine Auswahl, „Entfernen“ vorgewählt", await seite.evaluate(() => {
  const s = Array.from(document.querySelectorAll("select[data-entscheid]")); return s.length >= 8 && s.every((x) => x.value === "entfernen");
}));
ok("Inventur: .git „kommt nicht mit“, .env steht auf „Weglassen“", await seite.evaluate(() =>
  /kommt nicht mit/.test(document.querySelector('[data-pfad="musterapp/.git/config"]').textContent) &&
  document.querySelector('select[data-datei="musterapp/.env"]').value === "weglassen"));
ok("Leiste „Saubere Kopie bauen“ steht da", await seite.evaluate(() => !!document.querySelector("#bauen") && !document.querySelector("#reinigen").hidden));
await alleGroessen("Funde");

await seite.setViewportSize({ width: 1280, height: 800 });
let fertig = true;
try {
  await seite.click("#bauen");
  await seite.waitForFunction(() => window.__reiniger.gebaut() && document.querySelector("[data-nachpruefung]"), null, { timeout: 30000 });
} catch { fertig = false; }
ok("Bauen: der Knopf baut die saubere Kopie, die Nachprüfung steht da", fertig && await seite.evaluate(() =>
  document.querySelector("[data-nachpruefung]").dataset.nachpruefung === "leer" && /nichts offen/.test(document.querySelector("#nachpruefung h2").textContent)));
if (fertig) {
  const [dl] = await Promise.all([seite.waitForEvent("download", { timeout: 10000 }), seite.click("#laden-zip")]);
  const z = Kern.zipDateien(new Uint8Array(readFileSync(await dl.path())));
  const inhalt = []; for (const d of z.dateien) inhalt.push([d.pfad, D8(await d.lesen())]);
  ok("Download: ZIP ohne .git, mit Stellenplan, ohne die alte Mail", dl.suggestedFilename() === "musterapp-sauber.zip" && inhalt.length > 4 &&
    !inhalt.some(([p]) => /\.git\//.test(p)) && inhalt.some(([p]) => /_reiniger\/STELLENPLAN\.txt$/.test(p)) && !inhalt.some(([, t]) => /erika\.mustermann@/i.test(t)), inhalt.map(([p]) => p).join(", "));
  const [dl2] = await Promise.all([seite.waitForEvent("download", { timeout: 10000 }), seite.click("#laden-plan")]);
  ok("Download: Stellenplan einzeln", dl2.suggestedFilename() === "STELLENPLAN.txt" && /⟦NAME-1⟧/.test(readFileSync(await dl2.path(), "utf8")));
  await seite.locator('select[data-entscheid="max beispiel"]').first().selectOption("eigen");
  ok("Eigener Wert: das Feld erscheint, die Leiste sagt „neu bauen“", await seite.evaluate(() =>
    !document.querySelector('input[data-eigen="max beispiel"]').hidden && /neu bauen/.test(document.querySelector("#reinigen").textContent)));
  await seite.locator('input[data-eigen="max beispiel"]').first().fill("Paul Eigen");
  await seite.click("#bauen");
  await seite.waitForFunction(() => window.__reiniger.gebaut() && !window.__reiniger.gebaut().veraltet && !document.querySelector("#bauen").disabled, null, { timeout: 30000 });
  ok("Neu bauen: der eigene Wert steht in der Kopie", await seite.evaluate(() => {
    const s = window.__reiniger.gebaut().rein.sauber.find((x) => /brief\.txt$/.test(x.pfad)); return /Grüße\nPaul Eigen/.test(new TextDecoder().decode(s.bytes));
  }));
}
await alleGroessen("Ergebnis");
/* Alle Dateiarten über das echte Dateifeld: ZIP mit Archiven und Bildern, dazu JPEG und WebP einzeln */
await seite.setViewportSize({ width: 1280, height: 800 });
await seite.click("#neu");
await seite.setInputFiles("#wahl-dateien", ["mix.zip", "foto.jpg", "bild.webp"].map((n) => join(WURZEL, "tests/muster", n)));
let gemischt = true;
try { await seite.waitForFunction(() => window.__reiniger.ergebnis() && document.querySelector("#fortschritt").hidden && document.querySelector("#bauen"), null, { timeout: 60000 }); } catch { gemischt = false; }
ok("Dateifeld: ZIP, JPEG und WebP zusammen geladen, Archive darin ausgepackt", gemischt && await seite.evaluate(() => {
  const p = window.__reiniger.ergebnis().inventur.map((e) => e.pfad);
  return p.includes("mix.zip/app/vorlagen.zip/notiz.txt") && p.includes("mix.zip/app/alt.tar.gz/alt/info.txt") && p.includes("foto.jpg") && p.includes("bild.webp");
}));
ok("Inventur: Bilder stehen auf „Ohne Metadaten übernehmen“", gemischt && await seite.evaluate(() =>
  ["foto.jpg", "bild.webp", "mix.zip/app/bild.png"].every((p) => (document.querySelector('select[data-datei="' + p + '"]') || {}).value === "metadaten")));
if (gemischt) {
  await seite.click("#bauen");
  await seite.waitForFunction(() => window.__reiniger.gebaut() && document.querySelector("[data-nachpruefung]"), null, { timeout: 60000 });
  ok("Nachprüfung: nichts offen, Bilder als „ungeprüft“ (Text im Bild) benannt", await seite.evaluate(() =>
    document.querySelector("[data-nachpruefung]").dataset.nachpruefung === "ungeprueft" && /ungeprüft/.test(document.querySelector("#nachpruefung h2").textContent)));
  const [dl] = await Promise.all([seite.waitForEvent("download", { timeout: 10000 }), seite.click("#laden-zip")]);
  const f = fremdPruefen(new Uint8Array(readFileSync(await dl.path())));
  if (!f) console.log("  ⊘ fremder Leser nicht da — nicht gemessen");
  else ok("Download, fremd geprüft: alles öffnet sich, kein alter Wert, Bilder ohne EXIF",
    f.testzip === null && f.rest.length === 0 && f.dateien.includes("mix.zip/app/vorlagen.zip/notiz.txt") &&
    (!f.bilder || ["foto.jpg", "bild.webp", "mix.zip/app/bild.png"].every((k) => f.bilder[k] && f.bilder[k].exif === 0)), JSON.stringify(f).slice(0, 400));
  await alleGroessen("Gemischt");
}
/* Hineinziehen (Drag & Drop): Dateien und ganze Ordner */
await seite.setViewportSize({ width: 1280, height: 800 });
await seite.click("#neu");
const mixBytes = Array.from(readFileSync(join(WURZEL, "tests/muster/mix.zip")));
const zug = await seite.evaluate(async (mix) => {
  const dt = new DataTransfer();
  dt.items.add(new File([new Uint8Array(mix)], "mix.zip", { type: "application/zip" }));
  dt.items.add(new File(["Mail: lena@beispiel.example\n"], "notiz.txt", { type: "text/plain" }));
  const ev = (typ) => new DragEvent(typ, { dataTransfer: dt, bubbles: true, cancelable: true });
  document.body.dispatchEvent(ev("dragenter"));
  const sichtbar = !document.querySelector("#ziehen").hidden;
  const d = ev("drop"); document.body.dispatchEvent(d);
  const t = new DataTransfer(); t.setData("text/plain", "nur Text");
  const nurText = new DragEvent("dragenter", { dataTransfer: t, bubbles: true, cancelable: true });
  return { sichtbar, verhindert: d.defaultPrevented, wegNach: document.querySelector("#ziehen").hidden };
}, mixBytes);
let gezogen = true;
try { await seite.waitForFunction(() => window.__reiniger.ergebnis() && document.querySelector("#fortschritt").hidden && window.__reiniger.ergebnis().inventur.some((e) => e.pfad === "notiz.txt"), null, { timeout: 30000 }); } catch { gezogen = false; }
ok("Hineinziehen: „Loslassen zum Prüfen“ erscheint und verschwindet beim Loslassen", zug.sichtbar && zug.verhindert && zug.wegNach, JSON.stringify(zug));
ok("Hineinziehen von Dateien: ZIP (ausgepackt) und Textdatei zusammen geprüft", gezogen && await seite.evaluate(() => {
  const r = window.__reiniger.ergebnis(), p = r.inventur.map((e) => e.pfad);
  return p.includes("mix.zip/app/vorlagen.zip/notiz.txt") && r.buendel.some((b) => b.wert === "lena@beispiel.example");
}));
ok("Text ziehen (keine Datei) zeigt keine Ablagefläche", await seite.evaluate(() => {
  const t = new DataTransfer(); t.setData("text/plain", "nur Text");
  document.body.dispatchEvent(new DragEvent("dragenter", { dataTransfer: t, bubbles: true, cancelable: true }));
  const h = document.querySelector("#ziehen").hidden;
  document.body.dispatchEvent(new DragEvent("dragleave", { dataTransfer: t, bubbles: true, cancelable: true }));
  return h;
}));
/* Ein ganzer Ordner: derselbe Baum, den Chrome beim Ziehen eines Ordners liefert (FileSystemEntry). */
const ordner = await seite.evaluate(async () => {
  let nmGeoeffnet = false;
  const datei = (name, inhalt) => ({ isFile: true, isDirectory: false, name, file: (ok) => setTimeout(() => ok(new File([inhalt], name)), 0) });
  const kaputt = (name) => ({ isFile: true, isDirectory: false, name, file: (ok, nein) => setTimeout(() => nein(new DOMException("NotReadableError")), 0) });
  const verz = (name, kinder) => ({ isFile: false, isDirectory: true, name, createReader: () => {
    if (name === "node_modules") nmGeoeffnet = true;
    let rest = kinder.slice();   // wie Chrome: später, in Häppchen, am Ende eine leere Liste
    return { readEntries: (ok) => setTimeout(() => ok(rest.splice(0, 1)), 0) };
  } });
  const baum = verz("meinprojekt", [
    datei("README.md", "Gebaut von erika.mustermann@beispiel.example\n"),
    verz("src", [datei("start.js", "export const konto = \"DE02120300000000202051\";\n"), verz("tief", [verz("tiefer", [datei("x.txt", "+49 30 1234567\n")])])]),
    verz("node_modules", [datei("paket.js", "GEHEIM")]),
    verz(".git", [datei("config", "[user]\n\tname = Erika Mustermann\n")]),
    kaputt("gesperrt.docx"),
  ]);
  const liste = await window.__reiniger.ausEintraegen([baum, datei("einzeln.txt", "hallo")]);
  window.__reiniger.starte(liste);
  return { pfade: liste.map((d) => d.pfad), groessen: liste.filter((d) => d.groesse > 0).length, nmGeoeffnet };
});
try { await seite.waitForFunction(() => window.__reiniger.ergebnis() && document.querySelector("#fortschritt").hidden && window.__reiniger.ergebnis().inventur.some((e) => e.pfad === "einzeln.txt"), null, { timeout: 30000 }); } catch { /* rot unten */ }
ok("Ordner hineinziehen: alle Unterordner gelesen, Ordner und Datei zusammen", ["meinprojekt/README.md", "meinprojekt/src/start.js", "meinprojekt/src/tief/tiefer/x.txt", "meinprojekt/.git/config", "einzeln.txt"].every((p) => ordner.pfade.includes(p)), ordner.pfade.join(", "));
ok("Ordner hineinziehen: node_modules wird nicht geöffnet", !ordner.nmGeoeffnet && ordner.pfade.includes("meinprojekt/node_modules/…") && !ordner.pfade.some((p) => /paket\.js/.test(p)));
ok("Ordner hineinziehen: Größe vorher bekannt (Deckel greift), unlesbare Datei heißt ungeprüft", ordner.groessen >= 5 && await seite.evaluate(() => {
  const r = window.__reiniger.ergebnis(), g = r.inventur.find((e) => e.pfad === "meinprojekt/gesperrt.docx");
  return !!g && /ungeprüft/.test(g.ungeprueft) && r.buendel.some((b) => b.art === "IBAN") && r.buendel.some((b) => b.art === "TELEFON") && r.inventur.some((e) => e.pfad === "meinprojekt/.git/config" && e.marken.some((m) => m.kennung === "GIT"));
}));



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
