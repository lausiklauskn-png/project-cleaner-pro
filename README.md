# Projekt-Reiniger Pro

Findet persönliche Daten in einem Projekt (ZIP, Ordner oder einzelne Dateien), **bevor** es in eine
KI-Sitzung oder nach GitHub geht. Alles läuft im Browser auf dem eigenen Gerät: nichts geht ins Netz,
nichts wird ausgeführt, nichts gespeichert.

Adresse (sobald GitHub Pages an ist): https://lausiklauskn-png.github.io/project-cleaner-pro/

**Stand: Stufen 1–3.** Einwerfen, Funde finden (harte Angaben, Metadaten, gefühlte Metadaten wie Orte,
Firmen, Kennzeichen, Rechnernamen, Ordnerpfade), Stelle antippen und in der Datei sehen, je Fund entscheiden
(Marke, Musterwert, eigener Wert, behalten), saubere Kopie als ZIP mit Stellenplan und Bericht, Nachprüfung.
Bilder, PDF und Office bleiben bis Stufe 4 weg (oder unverändert, wenn angehakt).

**So geht's:** ZIP einwerfen → Funde ansehen → „🧹 Saubere Kopie bauen“ → „⬇ Saubere Kopie (ZIP)“ oder „↗ Teilen“. Plan und Stufen: [`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md).

```bash
npm install          # playwright-core (nur für die Proben)
npm test             # tests/probe.mjs — Kern, Pins, CSP, Vollbild bei 7 Größen
npm run gegenprobe   # eingebaute Fehler, jeder muss seine rote Zeile werfen
npm run icons        # Icons neu aus icons/kristall-quelle.png bauen
```
