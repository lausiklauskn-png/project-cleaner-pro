# Projekt-Reiniger Pro

Findet persönliche Daten in einem Projekt (ZIP, Ordner oder einzelne Dateien), **bevor** es in eine
KI-Sitzung oder nach GitHub geht. Alles läuft im Browser auf dem eigenen Gerät: nichts geht ins Netz,
nichts wird ausgeführt, nichts gespeichert.

Adresse (sobald GitHub Pages an ist): https://lausiklauskn-png.github.io/project-cleaner-pro/

**Stand: Stufen 1–7 (Fassung 11).** Einwerfen, Funde finden (harte Angaben, Metadaten, gefühlte Metadaten), je Fund
entscheiden, saubere Kopie als ZIP mit Stellenplan und Bericht, Nachprüfung; PDF und Bilder neu gezeichnet, Office als Text neu
gebaut; Tresor und Gäste-Sperre; Zurückbauen; **Sperrliste** (nur Fingerabdrücke) und **Git-Wächter** gegen fremde Werte in Commits.

**So geht's:** ZIP einwerfen → Funde ansehen → „🧹 Saubere Kopie bauen“ → „⬇ Saubere Kopie (ZIP)“ oder „↗ Teilen“. Plan und Stufen: [`docs/BRIEF_2026-10-28_projekt-reiniger-pro.md`](docs/BRIEF_2026-10-28_projekt-reiniger-pro.md).

```bash
npm install          # playwright-core (nur für die Proben)
npm test             # tests/probe.mjs — Kern, Pins, CSP, Vollbild bei 7 Größen
npm run gegenprobe   # eingebaute Fehler, jeder muss seine rote Zeile werfen
npm run icons        # Icons neu aus icons/kristall-quelle.png bauen
```

Git-Wächter (Stufe 7) in einem eigenen Repo einrichten:

```bash
node tools/git-waechter.mjs --einrichten /pfad/zum/repo          # Hooks: pre-commit, commit-msg, pre-push
cp reiniger-sperrliste.json /pfad/zum/repo/.git/                 # die Liste aus der App (nie ins Repo selbst)
node tools/git-waechter.mjs --alles                               # einmal alles im letzten Stand prüfen
```

Als GitHub-Prüfung in einem anderen Repo: `.github/workflows/waechter.yml` mit
`uses: lausiklauskn-png/project-cleaner-pro/.github/workflows/waechter.yml@main` und `secrets: inherit`;
die Sperrliste als Geheimnis `REINIGER_SPERRLISTE`.
