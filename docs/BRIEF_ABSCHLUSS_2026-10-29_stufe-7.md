# Abschluss 2026-10-29 (spät) — Stufe 7: Sperrliste und Git-Wächter (Claude)

Auftrag: Klaus' Befund zu Fassung 10 einarbeiten, danach Stufe 7. **Ein Befund zu Fassung 10 lag nicht vor** — nicht im Auftrag, kein
Issue, kein PR-Kommentar, nichts im Brief. Er ist im Brief als offen vermerkt; gebaut wurde Stufe 7. Plan und Stand:
[Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md), Abschnitt „Stufe 7 · gebaut“. Funde und Lehren: [Forschung](https://github.com/lausiklauskn-png/Kimhub/blob/main/forschung/messungen/projekt-reiniger-pro-2026-10-29-stufe-7.md).
Bilder: [`bilder-stufe-7/`](bilder-stufe-7/).

## Was neu ist (Fassung 11)

- **Sperrliste herausladen** (nach dem Reinigen, oder im geöffneten Tresor): je Marke ein Haken; heraus geht `reiniger-sperrliste.json`
  mit Fingerabdrücken — kein Wert steht darin. Eine eingeworfene Sperrliste wird **geladen, nicht geprüft** und sucht danach bei jeder
  Prüfung mit („Auf der Sperrliste“).
- **Git-Wächter** (`tools/git-waechter.mjs`): Hooks vor Commit, Nachricht und Push. Hält an bei Werten der Sperrliste und Tresor-Dateien,
  auch in der Geschichte. Nennt nie einen Wert.
- **GitHub-Prüfung** (`.github/workflows/waechter.yml`), aus Klaus' anderen Repos aufrufbar. Lief auf PR #14 grün.

## PR

- #14 — `npm test` **360 grün · 0 ROT** (+38).

## Gegenproben (je Fall die ganze Probe auf einer sabotierten Kopie)

SPDICHT, SPSALZ, SPKLAR, SPPRUEFE, SPAPPLADEN, SPAPPSPERRE, SPAPPVORWAHL, WTRESOR, WWERT, WGESCHICHTE, WNACHRICHT, WHOOK —
**12 gefangen · 0 blind** (Endstand). Unterwegs zwei blind:
- **SPDICHT** fand einen **echten Fehler**: eine Telefonnummer, die im Text feiner zerteilt war als in der Liste („+49 30 1234 5678“ ↔
  „+4930 12345678“), wurde nicht erkannt. Behoben im Kern, die Probe prüft genau diesen Fall.
- **WNACHRICHT**: die Sabotage selbst griff nicht (`[] && x` ergibt `x`) — Sabotage berichtigt, jetzt gefangen.
Nebenbei mitgefahren (Filter „SP“/„W“): SPRUNG, SPERREDOM, SPERRECODE, SPERREWIEDER, WARTEZEIT — gefangen. Die übrigen Fälle nicht neu gefahren.

## So testet Klaus (Fassung 11)

1. „Aktualisieren“ tippen. Dazu, was zu Fassung 10 offen ist: „So geht's“, „Neu“ oben links, Zurückbauen (siehe Abschluss Befund 9).
2. Beispielprojekt → „Saubere Kopie bauen“ → **„Sperrliste herausladen …“** → Haken ansehen (Ort, Datum nicht gewählt) → herausladen.
3. „Neu“ → die Datei `reiniger-sperrliste.json` einwerfen → erste Seite sagt „Sperrliste geladen“. Dann eine Textdatei mit
   „desktop 7qk2m9x“ einwerfen → Fund „Auf der Sperrliste“.
4. Am Rechner, in einem eigenen Test-Repo: `node tools/git-waechter.mjs --einrichten .`, die Liste nach `.git/reiniger-sperrliste.json`,
   einen Commit mit „Erika Mustermann“ versuchen → angehalten, ohne dass der Name in der Ausgabe steht.

## Nicht gemessen / offen

- Befund zu Fassung 10 (bitte in den nächsten Auftrag schreiben).
- Nichts am Gerät; Hooks unter Windows; in Klaus' echten Repos nicht eingerichtet (Klaus entscheidet je Repo).
- Grenze: wer die Liste hat, kann kurze Werte durchprobieren — nie in ein öffentliches Repo. `--no-verify` umgeht die Hooks.

## Stundennachweis

Beginn nicht festgehalten (vor dem ersten Commit, kein Zeitstempel). PR #14 um 21:12 UTC, letzte Gegenprobe 21:27 UTC. Uhrzeiten aus dem Behälter
(Zeitstempel von PR und Benachrichtigungen); Wartezeiten auf Probenläufe sind nicht abgezogen. Klaus' eigene Zeit liegt außerhalb.
