#!/usr/bin/env node
/* Projekt-Reiniger Pro — der Git-Wächter (Stufe 7).
 *
 * Derselbe Suchkern wie in der App läuft vor jedem Commit, vor jedem Push und als GitHub-Prüfung.
 * Er hält an, wenn ein Wert von der Sperrliste auftaucht oder eine Tresor-Datei (.rtresor) mitgehen soll.
 * Alles andere, was die Suche findet, meldet er als Hinweis (mit --streng halten Mail, IBAN, Telefon, Schlüssel).
 * Die Ausgabe nennt nie einen Wert — sie landet in Protokollen, die andere lesen.
 *
 *   node tools/git-waechter.mjs --einrichten [ordner]      Hooks in ein Repo legen (pre-commit, commit-msg, pre-push)
 *   node tools/git-waechter.mjs --vor-commit               was gerade vorgemerkt ist (git add)
 *   node tools/git-waechter.mjs --nachricht <datei>        eine Commit-Nachricht
 *   node tools/git-waechter.mjs --vor-push                 liest die Zeilen, die git an pre-push gibt
 *   node tools/git-waechter.mjs --bereich A..B             jeden Commit im Bereich: Dateien, Nachricht, Autor
 *   node tools/git-waechter.mjs --alles                    alle Dateien im letzten Stand (HEAD)
 *   node tools/git-waechter.mjs --ci                       GitHub: VORHER/NACHHER aus der Umgebung
 *   node tools/git-waechter.mjs --sperrliste-bauen <werte.txt> [--aus <ziel.json>]
 *   node tools/git-waechter.mjs --sperrliste-zusammen <a.json> <b.json> … --aus <ziel.json>
 *
 * Sperrliste: --sperrliste <datei> (mehrfach), sonst REINIGER_SPERRLISTE (Inhalt oder Pfad), dazu
 * <repo>/.git/reiniger-sperrliste.json und ~/.config/projekt-reiniger/sperrliste.json, wenn es sie gibt.
 * Rückgabe: 0 frei · 1 angehalten · 2 nicht lauffähig.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { homedir } from "node:os";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const KENNZEICHEN = "projekt-reiniger-git-waechter";
const args = process.argv.slice(2);
const hat = (a) => args.includes(a);
const wert = (a) => { const i = args.indexOf(a); return i >= 0 ? args[i + 1] : undefined; };
const alleWerte = (a) => args.flatMap((x, i) => x === a && args[i + 1] ? [args[i + 1]] : []);
const sag = (t) => process.stderr.write(t + "\n");

/* Die Prüfkerne (byte-1:1 gepinnt) hängen sich an globalThis — wie in der Probe. Leise laden. */
async function kernLaden() {
  const req = createRequire(import.meta.url);
  const log = console.log, info = console.info; console.log = () => {}; console.info = () => {};
  /* Node warnt, weil package.json keinen Modultyp nennt — für den Wächter nur Lärm. */
  const warnen = process.emitWarning;
  process.emitWarning = (w, ...rest) => { if (/MODULE_TYPELESS|module syntax was detected/i.test(String(w && w.message || w) + rest.join(" "))) return; return warnen.call(process, w, ...rest); };
  try {
    for (const f of ["modules/25_pseudonym.js", "assets/pruefer-formate.js", "assets/pruefer-mail.js", "assets/pruefer.js", "assets/pruefer-anhang.js"]) {
      try { req(join(WURZEL, f)); } catch { /* fehlt → der Kern sagt „ungeprüft“ */ }
    }
    return await import(pathToFileURL(join(WURZEL, "assets/reiniger-kern.js")).href);
  } finally { console.log = log; console.info = info; process.emitWarning = warnen; }
}

function git(argv, opt = {}) {
  return execFileSync("git", argv, { cwd: opt.cwd || process.cwd(), maxBuffer: 1024 * 1024 * 1024, input: opt.input, encoding: opt.text ? "utf8" : undefined, stdio: ["pipe", "pipe", "pipe"] });
}
const gitText = (argv, opt = {}) => git(argv, Object.assign({}, opt, { text: true }));
const NULL_SHA = /^0+$/;

function sperrlisteSammeln(K) {
  const listen = [], quellen = [];
  const nimm = (roh, wo) => {
    const l = K.sperrlisteLesen(roh);
    if (!l) { sag("Git-Wächter: Sperrliste " + wo + " ist nicht lesbar — NICHT benutzt."); return; }
    listen.push(l); quellen.push(wo);
  };
  for (const p of alleWerte("--sperrliste")) { if (existsSync(p)) nimm(readFileSync(p, "utf8"), p); else sag("Git-Wächter: Sperrliste " + p + " fehlt."); }
  const env = process.env.REINIGER_SPERRLISTE;
  if (env && env.trim()) { if (env.trim().startsWith("{")) nimm(env, "aus REINIGER_SPERRLISTE"); else if (existsSync(env.trim())) nimm(readFileSync(env.trim(), "utf8"), env.trim()); else sag("Git-Wächter: REINIGER_SPERRLISTE zeigt auf nichts."); }
  try {
    const gd = gitText(["rev-parse", "--absolute-git-dir"]).trim(), p = join(gd, "reiniger-sperrliste.json");
    if (existsSync(p)) nimm(readFileSync(p, "utf8"), ".git/reiniger-sperrliste.json");
  } catch { /* kein Repo */ }
  const heim = join(homedir(), ".config", "projekt-reiniger", "sperrliste.json");
  if (existsSync(heim)) nimm(readFileSync(heim, "utf8"), "~/.config/projekt-reiniger/sperrliste.json");
  return { liste: listen.length ? K.sperrlisteZusammen(...listen) : null, quellen };
}

/* Dateien eines Commits (nur hinzugekommene und geänderte Blobs), eines Bereichs, des Vormerkbereichs, von HEAD. */
function blob(sha) { return new Uint8Array(git(["cat-file", "blob", sha])); }
function commitDateien(c, gesehen) {
  const aus = [];
  const roh = git(["diff-tree", "--no-commit-id", "-r", "-z", "--root", "--diff-filter=ACMRT", "-M", c]).toString("utf8").split("\0");
  for (let i = 0; i < roh.length - 1;) {
    const kopf = roh[i++];
    if (!kopf.startsWith(":")) continue;
    const [, , , neu, status] = kopf.slice(1).split(" ");
    const pfad = /^[RC]/.test(status) ? (i++, roh[i++]) : roh[i++];
    if (/^0+$/.test(neu) || gesehen.has(neu + " " + pfad)) continue;
    gesehen.add(neu + " " + pfad);
    if (gitText(["cat-file", "-t", neu]).trim() !== "blob") continue;      // Untermodul
    aus.push({ pfad, bytes: blob(neu), commit: c });
  }
  return aus;
}
function commitTexte(c) {
  const f = gitText(["log", "-1", "--format=%an%n%ae%n%cn%n%ce%n%B", c]).split("\n");
  const kurz = c.slice(0, 8);
  return [
    { wo: "Commit " + kurz + " · Autor", text: f[0] + " " + f[1] }, { wo: "Commit " + kurz + " · Committer", text: f[2] + " " + f[3] },
    { wo: "Commit " + kurz + " · Nachricht", text: f.slice(4).join("\n") },
  ];
}
function bereich(spanne) {
  const commits = gitText(["rev-list", "--reverse", ...spanne]).split("\n").filter(Boolean);
  const gesehen = new Set(), dateien = [], texte = [];
  for (const c of commits) { dateien.push(...commitDateien(c, gesehen)); texte.push(...commitTexte(c)); }
  return { dateien, texte, commits: commits.length };
}
function headDateien(stand = "HEAD") {
  const roh = git(["ls-tree", "-r", "-z", stand]).toString("utf8").split("\0").filter(Boolean);
  return roh.map((z) => { const [kopf, pfad] = z.split("\t"); const [, typ, sha] = kopf.split(" "); return typ === "blob" ? { pfad, bytes: blob(sha) } : null; }).filter(Boolean);
}
function vorgemerkt() {
  const namen = git(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMRT"]).toString("utf8").split("\0").filter(Boolean);
  const aus = [];
  for (const pfad of namen) {
    const z = gitText(["ls-files", "-s", "-z", "--", pfad]).split("\0").filter(Boolean)[0];
    if (!z) continue;
    const [modus, sha] = z.split(" ");
    if (modus === "160000") continue;                        // Untermodul
    aus.push({ pfad, bytes: blob(sha) });
  }
  return aus;
}
function autorJetzt() {
  const t = [];
  for (const v of ["GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"]) { try { t.push({ wo: v === "GIT_AUTHOR_IDENT" ? "Autor (git config)" : "Committer (git config)", text: gitText(["var", v]).replace(/\s+\d+\s+[+-]\d{4}\s*$/, "") }); } catch { /* nicht gesetzt */ } }
  return t;
}

/* Hooks einrichten: ein kleines Skript je Hook, das dieses Werkzeug aufruft. Fremde Hooks werden nicht überschrieben. */
function einrichten(ziel) {
  const ordner = resolve(ziel || ".");
  let hooks;
  try { hooks = resolve(ordner, gitText(["rev-parse", "--git-path", "hooks"], { cwd: ordner }).trim()); }
  catch { sag("Git-Wächter: " + ordner + " ist kein Git-Repo."); return 2; }
  mkdirSync(hooks, { recursive: true });
  const werkzeug = join(WURZEL, "tools", "git-waechter.mjs");
  const je = { "pre-commit": "--vor-commit", "commit-msg": "--nachricht \"$1\"", "pre-push": "--vor-push" };
  let n = 0;
  for (const [hook, auftrag] of Object.entries(je)) {
    const p = join(hooks, hook);
    if (existsSync(p) && !readFileSync(p, "utf8").includes(KENNZEICHEN) && !hat("--ersetzen")) { sag("  übersprungen: " + hook + " (dort liegt schon ein fremder Hook; --ersetzen überschreibt ihn)"); continue; }
    writeFileSync(p, "#!/bin/sh\n# " + KENNZEICHEN + " (Projekt-Reiniger Pro, Stufe 7) — angelegt mit --einrichten\n" +
      "exec node " + JSON.stringify(werkzeug) + " " + auftrag + (hat("--streng") ? " --streng" : "") + "\n");
    chmodSync(p, 0o755); n++;
    sag("  eingerichtet: " + hook);
  }
  sag("Git-Wächter: " + n + " Hook(s) in " + hooks + ". Die Sperrliste legst du nach " + join(ordner, ".git", "reiniger-sperrliste.json") +
    " oder nach ~/.config/projekt-reiniger/sperrliste.json — nie ins Repo selbst.");
  return 0;
}

async function main() {
  if (hat("--einrichten")) return einrichten(wert("--einrichten") && !wert("--einrichten").startsWith("--") ? wert("--einrichten") : ".");
  let K;
  try { K = await kernLaden(); } catch (e) { sag("Git-Wächter: der Kern ließ sich nicht laden (" + (e && e.message || e) + ") — NICHTS geprüft."); return 2; }

  if (hat("--sperrliste-bauen")) {
    const quelle = wert("--sperrliste-bauen");
    if (!quelle || !existsSync(quelle)) { sag("Git-Wächter: Datei mit Werten fehlt (eine Zeile je Wert)."); return 2; }
    const werte = readFileSync(quelle, "utf8").split(/\r?\n/).map((z) => z.trim()).filter((z) => z && !z.startsWith("#"));
    const r = K.sperrlisteBauen(werte);
    const ziel = wert("--aus") || K.SPERRLISTE_DATEI;
    writeFileSync(ziel, JSON.stringify(r.liste, null, 1) + "\n");
    sag("Sperrliste: " + r.aufgenommen + " Wert(e) als Fingerabdruck in " + ziel + (r.zuKurz ? " · " + r.zuKurz + " zu kurz (unter " + K.SPERR_ZEICHEN_MIN + " Zeichen)" : "") +
      (r.zuLang ? " · " + r.zuLang + " zu lang (über " + K.SPERR_WOERTER_MAX + " Wörter)" : "") + ". Die Datei mit den Werten jetzt löschen.");
    return 0;
  }
  if (hat("--sperrliste-zusammen")) {
    const i = args.indexOf("--sperrliste-zusammen"), quellen = [];
    for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) quellen.push(args[j]);
    const listen = quellen.map((p) => K.sperrlisteLesen(readFileSync(p, "utf8")));
    if (listen.some((l) => !l)) { sag("Git-Wächter: eine der Listen ist keine Sperrliste."); return 2; }
    const ziel = wert("--aus") || K.SPERRLISTE_DATEI, l = K.sperrlisteZusammen(...listen);
    writeFileSync(ziel, JSON.stringify(l, null, 1) + "\n");
    sag("Sperrliste: " + K.sperrlisteGroesse(l) + " Fingerabdrücke in " + ziel + ".");
    return 0;
  }

  const { liste, quellen } = sperrlisteSammeln(K);
  let dateien = [], texte = [], was = "";
  try {
    if (hat("--vor-commit")) { dateien = vorgemerkt(); texte = autorJetzt(); was = "vorgemerkte Dateien"; }
    else if (hat("--nachricht")) { const p = wert("--nachricht"); texte = [{ wo: "Commit-Nachricht", text: readFileSync(p, "utf8").split("\n").filter((z) => !z.startsWith("#")).join("\n") }]; was = "Commit-Nachricht"; }
    else if (hat("--vor-push")) {
      const zeilen = readFileSync(0, "utf8").split("\n").filter(Boolean);
      let n = 0;
      for (const z of zeilen) {
        const [, lokal, , fern] = z.split(" ");
        if (!lokal || NULL_SHA.test(lokal)) continue;                      // Löschen eines Zweigs
        const spanne = !fern || NULL_SHA.test(fern) ? [lokal, "--not", "--remotes"] : [fern + ".." + lokal];
        const b = bereich(spanne); dateien.push(...b.dateien); texte.push(...b.texte); n += b.commits;
      }
      was = n + " Commit(s) vor dem Push";
    }
    else if (hat("--bereich")) { const b = bereich([wert("--bereich")]); dateien = b.dateien; texte = b.texte; was = b.commits + " Commit(s) in " + wert("--bereich"); }
    else if (hat("--alles")) { dateien = headDateien(); was = "alle Dateien in HEAD"; }
    else if (hat("--ci")) {
      const vorher = (process.env.VORHER || "").trim(), nachher = (process.env.NACHHER || "HEAD").trim();
      let bekannt = false;
      if (vorher && !NULL_SHA.test(vorher)) { try { gitText(["cat-file", "-e", vorher + "^{commit}"]); bekannt = true; } catch { bekannt = false; } }
      if (bekannt) { const b = bereich([vorher + ".." + nachher]); dateien = b.dateien; texte = b.texte; was = b.commits + " neue(r) Commit(s)"; }
      else {
        /* Neuer Zweig oder erster Push: alle Commits, die der Hauptzweig noch nicht hat — sonst die ganze Geschichte (höchstens 2000). */
        const basis = (process.env.BASIS || "").trim();
        let spanne = [nachher, "--max-count=2000"], wo = "ganze Geschichte";
        if (basis) { try { gitText(["rev-parse", "--verify", "origin/" + basis]); let drin = false; try { gitText(["merge-base", "--is-ancestor", nachher, "origin/" + basis]); drin = true; } catch { drin = false; }
          if (!drin) { spanne = [nachher, "--not", "origin/" + basis]; wo = "neu gegenüber " + basis; } } catch { /* kein Hauptzweig da */ } }
        const b = bereich(spanne); dateien = b.dateien; texte = b.texte; was = b.commits + " Commit(s), " + wo;
      }
    }
    else { sag(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 26).map((z) => z.replace(/^ \*\/? ?/, "")).join("\n")); return 0; }
  } catch (e) { sag("Git-Wächter: git lief nicht (" + String(e && e.stderr || e && e.message || e).trim().split("\n")[0] + ") — NICHTS geprüft."); return 2; }

  const r = await K.waechterPruefe(dateien, { sperrliste: liste, streng: hat("--streng"), texte });
  const text = K.waechterText(r, { sperrliste: liste, streng: hat("--streng"), alleHinweise: hat("--alle-hinweise") });
  sag(text.replace(/^(Git-Wächter \(Projekt-Reiniger Pro\): [^\n]*)/, "$1 [" + was + "]") + (liste ? "" : "\nOhne Sperrliste prüft der Wächter nur auf Tresor-Dateien (und zeigt Hinweise).") +
    (quellen.length > 1 ? "\nSperrlisten: " + quellen.join(", ") : ""));
  if (process.env.GITHUB_ACTIONS === "true") for (const h of r.halt) sag("::error" + (h.pfad && !/^Commit /.test(h.pfad) ? " file=" + h.pfad + (h.zeile ? ",line=" + h.zeile : "") : "") + "::" + h.grund);
  if (r.halt.length && (hat("--vor-commit") || hat("--nachricht") || hat("--vor-push"))) sag("Nur wenn du sicher bist, dass es kein fremder Wert ist: git " + (hat("--vor-push") ? "push" : "commit") + " --no-verify");
  return r.halt.length ? 1 : 0;
}

main().then((code) => process.exit(code), (e) => { sag("Git-Wächter: Fehler (" + (e && e.message || e) + ") — NICHTS geprüft."); process.exit(2); });
