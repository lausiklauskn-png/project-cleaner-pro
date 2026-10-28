# Projekt-Reiniger Pro — Sitzungs-Anker

Findet persönliche Daten in fremden Projekten (ZIP, Ordner, einzelne Dateien), bevor sie an eine KI
oder nach GitHub gehen. Kein Build-Schritt. Der Plan steht im Brief:
**[`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md)** —
er ist die Quelle, diese Datei ist nur der Anker. Am Ende jeder Sitzung: Brief nachziehen und einen
Kurzauftrag zum Kopieren ausgeben.

## Stand: Stufen 1–3 (2026-10-28) — prüfen, entscheiden, saubere Kopie · Stufe 4 ist der nächste Schritt

| Datei | Rolle |
|---|---|
| `assets/reiniger-kern.js` + `.d.ts` | **Der Kern ohne Oberfläche** (ES-Modul). Kein DOM, keine IndexedDB, kein Netz — die Probe prüft das. Wandert später byte-1:1 in die Familienakte. Heute: `einwerfen`, `zipDateien`, `einordnen`, `pruefe`, `buendeln`, `gefuehlt`, `reinige`, `nachpruefe`, `saubereKopie`, `zipBauen`. |
| `assets/reiniger-listen.js` | **Wortlisten** für die gefühlten Metadaten (Städte, Stadtteile, Hochschulen, Firmenformen, Straßenendungen, Kfz-Zeichen, Vornamen). Einziger Import des Kerns — wandert mit ihm. Neue Wörter: erst `npm test` (Fallen-Probe), mehrdeutige Wörter nach `STAEDTE_MEHRDEUTIG`. |
| `assets/app.js`, `assets/app.css`, `index.html` | Oberfläche. Fremdes nur über `textContent`. |
| `assets/beispiel.js` | Erfundenes Beispielprojekt (Knopf „🧪 Beispielprojekt“ und Proben). |
| `modules/25_pseudonym.js`, `assets/pruefer-anhang.js`, `pruefer-formate.js`, `pruefer-mail.js`, `pruefer.js`, `vendor/pdfjs/` | **byte-1:1** aus Sende-Prüfer (`d8a8c54`) bzw. Sage/Auslieferungsprüfer, per SHA-256 in `tests/probe.mjs` gepinnt (`PINS`). **Nie hier abwandeln** — dort pflegen, neu kopieren, Pin nachziehen, `CACHE_VERSION` in `sw.js` erhöhen. |

- **`node_modules` und Build-Ordner** (`UEBERSPRINGEN` im Kern) werden nie gelesen, auch im ZIP nie entpackt
  (jede Datei im ZIP wird erst auf Abruf entpackt). Ein gezogener Ordner wird gar nicht geöffnet.
- **Was nicht gelesen werden konnte, heißt „ungeprüft“**, nie sauber (verschlüsselt im ZIP, Git-Pakete,
  unbekannte Formate = nur Zeichenketten, Text im Bild = Stufe 4).
- **CSP `connect-src 'none'`**. Eine Probe zählt die Anfragen nach außen (0).
- **Bild (Klaus 2026-10-28):** der Kristall (`icons/kristall-quelle.png`) ist App-Icon, Favicon und Logo; auf
  leeren Flächen steht er groß mit **„CLEANER“** in weißer Schrift darunter. Icon A (Kacheln im Kreispfeil) ist
  damit abgelöst. Alle Größen baut `node tools/icons-bauen.mjs` — **nie von Hand**; sonst meldet die Probe „veraltet“.
- **Vollbild:** `100dvh`, keine Höchstbreite, `display: standalone`. Die Probe misst bei 320×640, 360×740,
  412×915, 768×1024, 1280×800, 740×360 (Handy quer) und 1920×1080 in drei Zuständen (Einwurf, Funde, Inventur):
  nichts quer, nichts ragt über seinen Kasten, keine Beschriftung abgeschnitten, kein Knopf bricht um, App füllt das Fenster.
- **Speichert nichts.** Der Service-Worker legt nur den Code ab. Die saubere Kopie geht nur als Download/Teilen hinaus;
  die **Zuordnung** (Marke → Original) geht nie in die Kopie und bleibt nur im Speicher.
- **Nachprüfung ist Pflicht:** jeder entfernte Originalwert wird in jeder Ausgabedatei gesucht (auch Stellenplan/Bericht).
- **Gefühlte Metadaten** sind Hinweise, keine Beweise; Vornamen immer „Vorschlag“. Musterwerte (`Muster…`) zählen nie.

## Prüfen

```bash
npm test             # 149 grün · 0 ROT (2026-10-28, Stufe 2)
npm run gegenprobe   # 27 gefangen · 0 blind · 0 falsch · 0 tot (2026-10-28, Stufe 2)
```

## ⚠ Nicht gemessen

Tablet und Handy (echtes Gerät), große Repos (Hunderte MB), echte Fotos/Office-Dateien, Rauschen der Wortlisten in
echten deutschen Projekten, Ziehen eines Ordners
mit der Maus (nur der Code-Weg ist gebaut; die Probe nutzt Knopf und `starte`). Als Datei geöffnet (`file://`)
läuft die App nicht — der Kern ist ein ES-Modul.

## Netzweit

Freibrief zum Selbst-Mergen · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
