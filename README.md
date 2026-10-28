# Projekt-Reiniger Pro

Findet persönliche Daten in einem Projekt (ZIP, Ordner oder einzelne Dateien), **bevor** es in eine
KI-Sitzung oder nach GitHub geht. Alles läuft im Browser auf dem eigenen Gerät: nichts geht ins Netz,
nichts wird ausgeführt, nichts gespeichert.

Adresse (sobald GitHub Pages an ist): https://lausiklauskn-png.github.io/project-cleaner-pro/

**Stand: Stufe 2.** Einwerfen, Inventur, harte Angaben und Metadaten finden, gebündelt anzeigen
(Stufe 1). Je Wert entscheiden (entfernen, Musterwert, eigener Wert, behalten), eine saubere Kopie
ohne `.git` als ZIP bauen, mit Stellenplan, Bericht und Nachprüfung (Stufe 2). Jede Dateiart wird geladen;
ZIP, tar, tar.gz und .gz werden in jeder Tiefe ausgepackt und in der Kopie neu gepackt, PNG/JPEG/WebP ohne
Metadaten übernommen, SVG als Text gereinigt. Plan und Stufen: [`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md).

```bash
npm install          # playwright-core (nur für die Proben)
npm test             # tests/probe.mjs — Kern, Reinigen, Pins, CSP, Vollbild bei 7 Größen
npm run gegenprobe   # 37 eingebaute Fehler, jeder muss seine rote Zeile werfen
python3 -I tools/muster-bauen.py   # Testdateien neu bauen (braucht Pillow)
npm run icons        # Icons neu aus icons/kristall-quelle.png bauen
```
