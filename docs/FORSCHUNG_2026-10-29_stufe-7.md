# Forschung 2026-10-29 — Stufe 7: Sperrliste und Git-Wächter (Claude)

Was beim Bau gelernt und gemessen wurde. Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md), Abschnitt „Stufe 7 · gebaut“.

## Fingerabdruck statt Wert

- Ein Fingerabdruck allein (SHA-256 eines Namens) ist **kein Geheimnis**: wer die Liste hat, rechnet Vornamen-, Orts- und
  Datumslisten durch und findet Treffer in Sekunden. Das **Salz** (16 Zufallsbytes je Liste) verhindert nur vorbereitete Tabellen,
  nicht das Durchprobieren. Ein langsamer Schlüssel (PBKDF2 wie im Tresor) ginge nicht: der Wächter rechnet für **jede Wortfolge**
  eines Repos einen Fingerabdruck. Folge: die Liste gehört in `.git/` oder ein GitHub-Geheimnis, nie ins Repo; Datum, Ort, Vorname,
  Hochschule sind beim Herausladen nicht vorgewählt.
- **Feste Schreibweise:** nur Buchstaben- und Ziffernfolgen (`\p{L}\p{N}`), klein, NFC, mit einem Leerzeichen verbunden. Damit sind
  Mail (`erika.mustermann@beispiel.example` → 4 Wörter), Name in Großbuchstaben, doppelte Leerzeichen und Zeilenumbrüche dasselbe.
  IBAN und Telefon stehen mal mit, mal ohne Leerzeichen: sind **alle** Wörter mit Ziffern, zählt zusätzlich die Form ohne Leerzeichen
  (in der Liste und im Text). Wörter ohne Ziffern werden nie zusammengeschoben — sonst wäre „an na“ = „Anna“.
- An jeder Stelle gewinnt die **längste** Wortfolge, danach geht die Suche hinter ihr weiter (kein doppelter Treffer im Treffer).

## Tempo

- Erst ohne Vorfilter: 1,2 MB Text = **5,9 s** (rund 180 000 Wörter × bis zu 6 Wortfolgen × 1–2 SHA-256 in reinem JavaScript).
- Mit Vorfilter: ein Bitfeld (2^16 Bit, 8 KB, Base64 in der Liste) über FNV-1a von Salz + Schreibweise. FNV lässt sich Zeichen für
  Zeichen fortsetzen, also kostet die nächste Wortfolge nur die neuen Zeichen. SHA-256 rechnet der Kern nur, wenn das Bit gesetzt ist:
  1,2 MB in **0,4 s**, 1 MB in **0,2–0,3 s** (Prüfrechner). Der Vorfilter verrät nichts, was die Fingerabdrücke nicht schon verraten.
- Der ganze Wächter über dieses Repo (`--alles`, 206 Dateien samt 21 MB Tesseract): **14 s**.
- SHA-256 steht selbst im Kern (synchron, ohne `crypto.subtle`), damit er ohne Hilfe von außen in Browser, Node und später der
  Familienakte gleich rechnet; die Probe vergleicht ihn mit `node:crypto` an den Blockgrenzen.

## Git

- **pre-commit** sieht nur, was vorgemerkt ist (`git ls-files -s` → Blob), nicht den Arbeitsordner — sonst prüfte er Dinge, die gar
  nicht in den Commit gehen.
- **pre-push** ist die eigentliche Wache für die Geschichte: ein Wert, der mit `--no-verify` hineinkam und im nächsten Commit wieder
  gelöscht wurde, steht im **Blob des ersten Commits** — der letzte Stand ist sauber, der Push nicht. Geprüft wird darum jeder Blob,
  den ein Commit im Bereich hinzufügt oder ändert (`git diff-tree -r --root`), samt Nachricht, Autor und Committer.
- Neuer Zweig (`remote sha = 0000…`): `rev-list <lokal> --not --remotes`. In GitHub Actions ist das nicht zu gebrauchen (dort steht
  der Zweig selbst schon unter `origin/`), deshalb `--ci`: Vorgänger bekannt → `vorher..nachher`; sonst alles, was der Hauptzweig nicht
  hat; sonst die ganze Geschichte (höchstens 2000 Commits).
- Node warnt bei `assets/reiniger-kern.js` („module type not specified“), weil `package.json` keinen Modultyp nennt. `"type": "module"`
  würde die Prüfkerne (CommonJS, byte-1:1 gepinnt) brechen; der Wächter blendet nur genau diese Warnung aus.

## Offen

- Merge-Commits: eine Konfliktlösung im Merge selbst wird nicht als eigener Blob geprüft (`diff-tree` ohne `-m`).
- Ein Hook braucht `node` im Pfad; unter Windows (Git Bash) nicht gemessen.
- Klaus' echte Repos: nicht eingerichtet, nicht gemessen.
