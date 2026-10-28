# Projekt-Reiniger Pro — Sitzungs-Anker

Findet persönliche Daten in fremden Projekten (ZIP, Ordner, einzelne Dateien), bevor sie an eine KI
oder nach GitHub gehen. Kein Build-Schritt. Der Plan steht im Brief:
**[`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md)** —
er ist die Quelle, diese Datei ist nur der Anker. Am Ende jeder Sitzung: Brief nachziehen und einen
Kurzauftrag zum Kopieren ausgeben.

## Stand: Stufe 2 (2026-10-28) — entscheiden, saubere Kopie, Stellenplan, Nachprüfung

| Datei | Rolle |
|---|---|
| `assets/reiniger-kern.js` + `.d.ts` | **Der Kern ohne Oberfläche** (ES-Modul). Kein DOM, keine IndexedDB, kein Netz — die Probe prüft das. Wandert später byte-1:1 in die Familienakte. Stufe 1: `einwerfen`, `zipDateien`, `einordnen`, `pruefe`, `buendeln`. Stufe 2: `vorschlag`, `reinige`, `nachpruefe`, `stellenplanText`/`-Json`, `bericht`, `zipBauen`, `ausgabe`. |
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
  412×915, 768×1024, 1280×800, 740×360 (Handy quer) und 1920×1080 in fünf Zuständen (Einwurf, Funde, Ergebnis, Inventur, Gemischt):
  nichts quer, nichts ragt über seinen Kasten, keine Beschriftung abgeschnitten, kein Knopf bricht um, App füllt das Fenster.
- **Speichert nichts.** Der Service-Worker legt nur den Code ab (`CACHE_VERSION` `reiniger-v2`).
- **Stufe 2 · Entscheiden je Wert** (ein Wert über alle Arten = eine Entscheidung, `wertSchluessel`):
  Entfernen = Marke `⟦ART-n⟧` in Text/Doku, **Musterwert in Code, Konfiguration (`CODE_ENDUNG`, auch JSON/YAML)
  und Dateinamen**; Musterwert; eigener Wert; behalten. Gleicher Wert → gleiche Nummer. Ersetzt wird ohne
  Rücksicht auf Groß/klein, aber nur an Wortgrenzen, längster Wert zuerst, in einem Durchgang.
- **Je Datei:** Text reinigen · unverändert übernehmen · weglassen. `.git` kommt **nie** mit (zweimal gesichert:
  im Vorschlag fest und in `reinige` selbst); `.env`, Sicherung, Datenbank, Export, Schlüsseldatei standardmäßig
  weg; Bild/PDF/Office/Unbekanntes nur, wenn ohne Funde und ohne „ungeprüft“ gelesen (Neu zeichnen: Stufe 4).
- **Stellenplan und Bericht nennen nie einen alten Wert.** Die Zuordnung (Marke → Wert) bleibt nur im Speicher,
  bis „↺ Neu“ — abgelegt wird sie erst im Tresor (Stufe 5).
- **Nachprüfung** = `pruefe` auf der Kopie + Byte-Suche jedes alten Werts (UTF-8/UTF-16, Groß/klein) in jeder
  Datei + jede ungeprüfte Datei der Kopie. Leer heißt „nichts offen gefunden“, nie „sauber“.
- **ZIP** mit festem Zeitstempel (1.1.1980), UTF-8-Namen, `_reiniger/` (Stellenplan als Text und JSON, Bericht)
  liegt darin. Die Probe öffnet es mit Python `zipfile` (Prüfsummen).
- **Jede Dateiart (Klaus 2026-10-28: „ZIPs entpacken … PNGs laden, SVGs und alle Dateien, Typen“):**
  `einwerfen` packt **ZIP, tar, tar.gz/.tgz und .gz in jeder Tiefe** aus (bis `ARCHIV_TIEFE_MAX` 4, Deckel
  `ARCHIV_DATEIEN_MAX`); jede Datei trägt `archiv`, das Archiv selbst steht als `ausgepackt` in der Inventur.
  `reinige` packt jedes Archiv **von innen nach außen neu** (gleiche Art), `nachpruefe` packt die Kopie wieder aus.
  Andere Archive (.jar, .apk, .7z, .rar) heißen „Archiv nicht ausgepackt — ungeprüft“ und sind standardmäßig weg.
  **PNG, JPEG, WebP:** „Ohne Metadaten übernehmen“ (`ohneMetadaten`, Byte für Byte, Bildpunkte unverändert —
  Pillow misst es): EXIF/GPS, XMP, Text, Kommentar, Zeitstempel und alles hinter dem Bildende fallen weg.
  ⚠ Sichtbarer Text im Bild und Botschaften in den untersten Bits bleiben (Neuzeichnen: Stufe 4) — die
  Nachprüfung nennt jedes Bild deshalb „ungeprüft“. SVG wird als Text gereinigt. GIF, PDF, Office: nur
  übernehmen oder weglassen (Stufe 4).
- **Hineinziehen (Windows-Explorer u. a.):** Dateien, ZIPs und ganze Ordner aufs Fenster ziehen (`ausEintraegen` in
  `app.js`, beliebig tief, `node_modules` nie geöffnet, Größe vorher gelesen). Die Ablagefläche erscheint nur,
  wenn Dateien gezogen werden. Die Probe stellt das Loslassen mit echten Dateien und einen Ordnerbaum wie aus
  Chrome nach; ⚠ ein echtes Ziehen aus dem Explorer ist nicht gemessen. Strg+V gibt es noch nicht.
- **Testdateien** `tests/muster/` baut `python3 -I tools/muster-bauen.py` mit Python `zipfile`/`tarfile` und
  **Pillow** (fremde Werkzeuge, nicht der eigene Schreiber); `tests/muster-pruefen.py` liest die saubere Kopie
  fremd. Fehlen python3 oder Pillow, sagt die Probe „⊘ nicht gemessen“ statt grün.

## Prüfen

```bash
npm test             # 170 grün · 0 ROT (2026-10-28, Stufe 2 + alle Dateiarten + Hineinziehen)
npm run gegenprobe   # 41 gefangen · 0 blind · 0 falsch · 0 tot (2026-10-28)
```

## ⚠ Nicht gemessen

Tablet und Handy (echtes Gerät), große Repos (Hunderte MB), echte Fotos/Office-Dateien, Ziehen eines Ordners
mit der Maus (nur der Code-Weg ist gebaut; die Probe nutzt Knopf und `starte`). Stufe 2: Download am Tablet,
ob ein gereinigtes echtes Projekt danach noch baut/läuft, große Kopien (das ZIP liegt ganz im Speicher). Als Datei geöffnet (`file://`)
läuft die App nicht — der Kern ist ein ES-Modul.

## Netzweit

Freibrief zum Selbst-Mergen · frisch von `origin/main` · Ton · kein PII · Ehrlichkeit:
[Sage-Protokol/docs/NETZWEIT.md](https://github.com/lausiklauskn-png/Sage-Protokol/blob/main/docs/NETZWEIT.md)
