# Projekt-Reiniger Pro

Findet persönliche Daten in einem Projekt (ZIP, Ordner oder einzelne Dateien), **bevor** es in eine
KI-Sitzung oder nach GitHub geht. Alles läuft im Browser auf dem eigenen Gerät: nichts geht ins Netz,
nichts wird ausgeführt, nichts gespeichert.

Adresse (sobald GitHub Pages an ist): https://lausiklauskn-png.github.io/project-cleaner-pro/

**Stand: Stufe 1 — nur lesen.** Einwerfen, Inventur, harte Angaben und Metadaten finden, gebündelt
anzeigen. Gereinigt wird noch nichts. Plan und Stufen: [`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md).

```bash
npm install          # playwright-core (nur für die Proben)
npm test             # tests/probe.mjs — Kern, Pins, CSP, Vollbild bei 7 Größen
npm run gegenprobe   # 12 eingebaute Fehler, jeder muss seine rote Zeile werfen
npm run icons        # Icons neu aus icons/kristall-quelle.png bauen
```
