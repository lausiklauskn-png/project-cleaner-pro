# Projekt-Reiniger Pro — Sitzungs-Anker

Findet persönliche Daten in fremden Projekten (ZIP, Ordner, einzelne Dateien), bevor sie an eine KI
oder nach GitHub gehen. Kein Build-Schritt. Der Plan steht im Brief:
**[`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md)** —
er ist die Quelle, diese Datei ist nur der Anker. Am Ende jeder Sitzung: Brief nachziehen und einen
Kurzauftrag zum Kopieren ausgeben.

## Stand: Stufen 1–7 + Befund 11 (Basic/Pro, Mikrofon) + Befund 12 (Ablagefeld), Fassung 15 (2026-10-30) · nächster Schritt: Klaus testet Fassung 15 (Basic + Pro-APK), dann Stufe 8 oder 9

| Datei | Rolle |
|---|---|
| `assets/reiniger-kern.js` + `.d.ts` | **Der Kern ohne Oberfläche** (ES-Modul). Kein DOM, keine IndexedDB, kein Netz — die Probe prüft das. Wandert später byte-1:1 in die Familienakte. Heute: `einwerfen`, `zipDateien`, `einordnen`, `pruefe`, `buendeln`, `gefuehlt`, `reinige`, `nachpruefe`, `saubereKopie`, `zipBauen`, `vorschau`; Stufe 5: `verschliesse`, `oeffne`, `tresorKopf`, `istTresor`, `codeGuete`, `sperrWartezeit`, `sperrPaket`/`sperrAuf` (Schloss bringt der Aufrufer: `werkzeuge.WERKSTATT_SCHLUESSEL`); Stufe 6: `stellenplanAus`, `rueckbauPlaetze`, `werteAusZuordnung`, `zurueckbauen`, `rueckbauText`; Stufe 7: `sha256`, `sperrForm`, `sperrlisteBauen`/`Lesen`/`Zusammen`/`Groesse`, `istSperrliste`, `sperrTreffer`, `waechterPruefe`, `waechterText` (`pruefe(…, { sperrliste })` → Fundart `GESPERRT`); Stufe 4: `dateiPlan` (Wege je Datei), `blattNeu`, `blattKaesten`, `kastenMalen`, `rauschen`, `pdfBauen`, `pngBauen`, `docxBauen`/`xlsxBauen`/`pptxBauen`, `mustermappe`, `musterFuer`. Zeichnen bringt der Aufrufer mit (`werkzeuge.Zeichner`, im Browser `app.js`). |
| `assets/reiniger-listen.js` | **Wortlisten** für die gefühlten Metadaten (Städte, Stadtteile, Hochschulen, Firmenformen, Straßenendungen, Kfz-Zeichen, Vornamen). Einziger Import des Kerns — wandert mit ihm. Neue Wörter: erst `npm test` (Fallen-Probe), mehrdeutige Wörter nach `STAEDTE_MEHRDEUTIG`. |
| `assets/app.js`, `assets/app.css`, `index.html`, `assets/thema.js` | Oberfläche. Fremdes nur über `textContent`. `app.js` enthält den **Zeichner** (pdf.js, Leinwand, Texterkennung mit Wortkästen, gemessene Zeichenbreiten). Farben nur als Variablen mit Hell- und Dunkel-Satz; `thema.js` setzt die gemerkte Wahl vor dem ersten Zeichnen. |
| `tools/native/prepare-web.mjs`, `capacitor.config.json`, `android/`, `windows/`, `.github/workflows/testfassungen.yml` | **App-Hüllen** (wie Private Brain Pro): Android über Capacitor 8.5.3 (Plugin `Speichern` für „Speichern unter“), Windows über Tauri 2. Gebaut nur auf GitHub; auf `main` → Vorab-Veröffentlichung `testfassung`. `www/`, `windows/dist`, Build-Ordner nie einchecken. In der Hülle (`HUELLE` in app.js) kein Installieren/Aktualisieren/Service-Worker. |
| `tools/git-waechter.mjs`, `.github/workflows/waechter.yml` | **Git-Wächter (Stufe 7):** Hooks pre-commit/commit-msg/pre-push (`--einrichten <repo>`), `--bereich`, `--alles`, `--ci`, Sperrliste bauen/zusammenlegen. Der Workflow läuft hier bei push/PR und ist per `workflow_call` aus Klaus' anderen Repos aufrufbar (Geheimnis `REINIGER_SPERRLISTE`). |
| `assets/beispiel.js` | Erfundenes Beispielprojekt (Knopf „🧪 Beispielprojekt“ und Proben). |
| `modules/25_pseudonym.js`, `assets/pruefer-anhang.js`, `pruefer-formate.js`, `pruefer-mail.js`, `pruefer.js`, `reinigung.js`, `schluesseltresor.js`, `vendor/pdfjs/`, `vendor/tesseract/` | **byte-1:1** aus Sende-Prüfer (`d8a8c54`) bzw. Sage/Auslieferungsprüfer, `reinigung.js` aus Workflow PDF (`a2cfdf1`), `schluesseltresor.js` (das Schloss) aus kim-hub-company `1a4528d` über den Sende-Prüfer (`TRESOR_SHA`), Tesseract aus Workflow PDF Pro, per SHA-256 in `tests/probe.mjs` gepinnt (`PINS`). **Nie hier abwandeln** — dort pflegen, neu kopieren, Pin nachziehen, `CACHE_VERSION` in `sw.js` erhöhen. |

- **Fassung:** bei jeder Änderung an einer Datei aus `CORE` (sw.js) `CACHE_VERSION` **und** `APP_FASSUNG` (app.js) gleich erhöhen — sonst bleibt am Handy die alte Fassung; die Probe vergleicht beide. Kopf-Knöpfe „Installieren“ und „Aktualisieren“ (leert nur den `reiniger-…`-Vorrat).

- **Archive im Projekt** (ZIP, APK, JAR, TAR, GZ …) werden geöffnet und mitgeprüft (3 Ebenen); RAR/7z nicht (laut „ungeprüft“).
- **Texterkennung** (Tesseract) nur auf Knopfdruck; Worker ohne `blob:` (CSP bleibt `connect-src 'none'`). Kein Virenscanner — nie so nennen.
- **`node_modules` und Build-Ordner** (`UEBERSPRINGEN` im Kern) werden nie gelesen, auch im ZIP nie entpackt
  (jede Datei im ZIP wird erst auf Abruf entpackt). Ein gezogener Ordner wird gar nicht geöffnet.
- **Was nicht gelesen werden konnte, heißt „ungeprüft“**, nie sauber (verschlüsselt im ZIP, Git-Pakete,
  unbekannte Formate = nur Zeichenketten, Text im Bild = Stufe 4).
- **CSP `connect-src 'none'`**. Eine Probe zählt die Anfragen nach außen (0).
- **Bild (Klaus 2026-10-28):** der Kristall (`icons/kristall-quelle.png`) ist App-Icon, Favicon und Logo; auf
  leeren Flächen steht er groß mit **„CLEANER“** in weißer Schrift darunter. Icon A (Kacheln im Kreispfeil) ist
  damit abgelöst. Alle Größen baut `node tools/icons-bauen.mjs` — **nie von Hand**; sonst meldet die Probe „veraltet“.
  Pro (APK/Windows): goldener Kristall aus `icons/kristall-pro-quelle.png`, gleiches Werkzeug.
- **Vollbild:** `100dvh`, keine Höchstbreite, `display: standalone`. Die Probe misst bei 320×640, 360×740,
  412×915, 768×1024, 1280×800, 740×360 (Handy quer) und 1920×1080 in drei Zuständen (Einwurf, Funde, Inventur):
  nichts quer, nichts ragt über seinen Kasten, keine Beschriftung abgeschnitten, kein Knopf bricht um, App füllt das Fenster.
- **Speichert nichts.** Der Service-Worker legt nur den Code ab. Die saubere Kopie geht nur als Download/Teilen hinaus;
  die **Zuordnung** (Marke → Original) geht nie in die Kopie und bleibt nur im Speicher.
- **Nachprüfung ist Pflicht:** jeder entfernte Originalwert wird in jeder Ausgabedatei gesucht (auch Stellenplan/Bericht).
- **Gefühlte Metadaten** sind Hinweise, keine Beweise; Vornamen immer „Vorschlag“. Musterwerte (`Muster…`) zählen nie.
- **Neu gezeichnete Blätter (Stufe 4):** nie schwärzen — PDF-Seiten und Bilder als Bild neu, grauer Kasten mit Etikett (nur die Art,
  nie der Wert), Kastenbreite gerundet, Rauschen über das unterste Bit; Office als reiner Text. Was neu gebaut wird, wird im
  **eigenen** gelesenen Text noch einmal durchsucht (`nachfinden`). Fehlschlag = weggelassen mit Grund, nie still übernommen.
- **Tresor (Stufe 5):** eine Datei `*.rtresor`; ohne Code lesbar nur Kennung und Datum (Ablauf 30 Tage). Zuordnung immer, Originale
  nur auf Wunsch. Geöffnet nur im Speicher; „Schließen“/„Sperren“/„Neu“ werfen ihn weg. Kein zweites Schloss.
- **Gäste-Sperre (Stufe 5):** Knopf im Kopf, immer sichtbar (Handy: nur Symbol). Anzeige sofort weg, alles Offene verschlüsselt nur im
  Speicher, Code vergessen; drei Versuche frei, dann wachsende Wartezeit. Neu laden = alles weg.
- **Auskunft ist kein Knopf (Klaus 2026-10-29):** Zahlen, Stufen, Marken, Größen nur als Text (farbig/fett), keine Pillen und Rahmen.
  Erklärungen hinter **ⓘ** (`info()` in app.js). Beim Wählen je Fund zeigt „Wird zu:“ sofort die Zeile danach (`Kern.vorschau`).
- **Hereinladen (Klaus 2026-10-29, Vorbild Auslieferungsprüfer):** Leiste oben im Arbeitsbildschirm („Dateien hereinladen“ /
  „Saubere Kopie herausladen“), Fenster `#import` mit Ablagefläche, Dateiwahl und Einfügen-Feld; Strg+V überall außer in Feldern.
  Ziehen nie als einziger Weg (Tablet). Im Arbeitsbildschirm ersetzt Ablegen nie still.
- **Erste Seite (Klaus 2026-10-30, Befund 12):** ein sichtbares **Ablagefeld** (`#einwurf-feld`): ziehen, einfügen (Strg+V), darin **„Datei wählen“** und
  **„Ordner wählen“** und **„?“**: alle Erklärtexte (wie es geht, „auf diesem Gerät“, ZIP/Code/PWA/APK, EXE nur Zeichenketten — ehrlich)
  stehen hinter dem „?“, zu Beginn zu, ✕ schließt (Fassung 15). Keine doppelten Wahl-Knöpfe darüber. Alles startet sofort die Prüfung
  (Ergebnisseite). Darunter nur „Tresor öffnen“, „Beispielprojekt“, „So geht's“. **„Neu“** steht
  als erster Knopf **links** in der Arbeitsleiste, nicht im Kopf.
- **Vorführung „So geht's“ (Klaus 2026-10-29):** kein Film — ein Finger bedient die **echte** App (Schritt 1–4, Beispielprojekt), liegt
  über genau dem App-Fenster (Vollbild wie geteilt), **ein Tipp oder Esc beendet sofort**, danach erste Seite. Nichts geht hinaus.
  Musik bringt Klaus später (Dauer ≈ 13 s gemessen, Probe gibt sie aus).
- **Fenster (Datei, Tresor, Zurückbauen) liegen unter dem Kopf** — „Sperren“ bleibt immer greifbar (Probe).
- **Zurückbauen (Stufe 6):** gefüllt wird nur an den Stellen des Stellenplans (Zeile, Wortgrenzen, Datei-/Ordnernamen, Office-Text).
  Mit Originalen heißt das Ergebnis `…-zurueckgebaut.zip` und „NICHT sauber“; `REINIGER-ZURUECKBAU.txt` nennt nie Werte.
  Kästen in neu gezeichneten PDF/Bildern und `.env`-Werte bleiben (benannt).
- **Sperrliste und Git-Wächter (Stufe 7):** die Liste hält **nur Fingerabdrücke** (SHA-256 mit Salz, feste Schreibweise, Wortfolgen bis 12
  Wörter, Vorfilter) — nie einen Wert; sie gehört nie in ein öffentliches Repo (kurze Werte lassen sich durchprobieren), sondern nach
  `.git/reiniger-sperrliste.json` oder ins Geheimnis. Der Wächter hält an: Sperrliste und Tresor-Dateien, immer; sonst nur Hinweise
  (`--streng`: auch Mail/IBAN/Telefon/Schlüssel). **Seine Ausgabe nennt nie einen Wert** (Probe). Eingeworfen wird eine Sperrliste
  geladen, nicht geprüft; gespeichert wird sie nicht.
- **Mustermappe:** ihre erfundenen Werte dürfen nie einem Projektwert gleichen; trifft es zufällig, bleibt die Datei weg (Probe).
- **Basic und Pro (Klaus 2026-10-29, Befund 11):** Browser/PWA = **„Projekt-Reiniger Basic“** (blauer Kristall); APK und Windows = **„Projekt-Reiniger Pro“**
  (Symbol `icons/kristall-pro-icon-quelle.png`, Fläche/Startbild `icons/kristall-pro-quelle.png`; modern: Graphit, helles Blattgold, Lichtschein nur in `::before` — über `data-ausgabe="pro"`). Eine Codebasis — app.js schaltet in der Hülle um.
  Neben dem Namen die **Versionsnummer** `v` + `APP_FASSUNG` (APK `build.gradle` liest sie, Windows `tauri.conf.json` = `N.0.0`, Probe vergleicht);
  in Pro ist sie der Update-Knopf (vorerst Link zur Testfassung, später Klaus' Server).
- **Kopf rechts nur Symbole** (Klaus 2026-10-29): ⓘ Auskunft, Darstellung (Bildschirm/Sonne/Mond), Aktualisieren, großes Schloss; Erklärung als `title`.
- **Mikrofon im Suchfeld** (Technik aus Meine-Familienakte): Browser = Web Speech (Chrome → Google; das steht am Knopf und in der Auskunft — nie
  verschweigen), APK = Androids Sprachfenster (`SprachePlugin`, Plugin-Name `ProSpeech`, offline bevorzugt, kein Mikrofon-Recht), Windows noch keins.
- **Knöpfe erklären sich:** `title` und für das Tablet zusätzlich ⓘ („Was machen diese Knöpfe?“).
- **Kontrast und Schrift (Klaus 2026-10-29):** jede Schrift ≥ 4,5 : 1 in Hell **und** Dunkel (Probe `tests/kontrast.mjs`),
  weiße Schrift nur auf dunklem Grund; keine Schrift über Schrift, keine doppelten Leerzeilen (Probe in `messen`).
  Bildschirmfotos aller Zustände: `docs/bilder-stufe-4/`, `docs/bilder-stufe-5/`, `docs/bilder-stufe-6/`, `docs/bilder-stufe-7/`, `docs/bilder-befund-11/`, `docs/bilder-fassung-15/`.

## Prüfen

```bash
npm test             # 388 grün · 0 ROT (2026-10-30, Befund 12, Fassung 15)
npm run gegenprobe   # 93 Fälle; Stufe 7: 12 neue = 12 gefangen · 0 blind (SPDICHT fand einen echten Fehler); davor 12 + 32 gefangen
                     # (die übrigen 37 nicht neu gefahren; ein voller Lauf dauert hier ~2 h — einzeln: NUR_FALL=NAME)
```

## ⚠ Nicht gemessen

Tablet und Handy (echtes Gerät) — Klaus testete Fassung 7 am Tablet (Befund eingearbeitet), APK/Windows ohne Befund; Tresor/Sperre bei großen Projekten (alles als Base64 im Speicher), große Repos (Hunderte MB), echte Fotos/Office-Dateien, große PDFs beim Neuzeichnen, Dunkelmodus am Gerät, Rauschen der Wortlisten in
echten deutschen Projekten, Ziehen eines Ordners
mit der Maus (nur der Code-Weg ist gebaut; die Probe nutzt Knopf und `starte`). Als Datei geöffnet (`file://`)
läuft die App nicht — der Kern ist ein ES-Modul.

## Netzweit

Freibrief zum Selbst-Mergen · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
