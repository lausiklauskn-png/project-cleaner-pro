# Abschluss 2026-10-30/31 — Befund 12: Ablagefeld, Hilfe hinter „?“, Suche mit Treffern, „Nicht ersetzen“ (Claude)

Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md), Abschnitt „Befund 12“. Funde und Lehren:
[Forschung](FORSCHUNG_2026-10-31_befund-12.md). Bilder: [`bilder-fassung-16/`](bilder-fassung-16/).

## Was neu ist

- **Fassung 14 (PR #17):** Auf der ersten Seite steht ein sichtbares **Ablagefeld**: ziehen, einfügen (Strg+V), darin „Datei wählen“ und
  „Ordner wählen“. Die doppelten Knöpfe sind weg, und jeder Weg öffnet sofort die Ergebnisseite.
- **Fassung 15 (PR #17):** Alle Erklärtexte der ersten Seite stehen hinter einem **„?“** im Feld. Der Kasten heißt „Hilfe“, ist zu Beginn
  zu und lässt sich mit „?“ oder ✕ schließen. Ehrlich steht darin: EXE und MSI werden nicht in Code zurückverwandelt.
- **Fassung 16 (dieser PR):** Klaus' Gegenprobe zu Fassung 15 ist eingearbeitet.
  - „nullnull“ in den Funden ist weg.
  - **Suchen** ist jetzt eine **Lupe**. Gesuchte Wörter werden in den Funden markiert, darüber steht „Treffer N von M“. Mit **„+“ / „−“**
    (Taste oder Knopf) springt man weiter, und zugeklappte Gruppen gehen dabei auf.
  - Beim Zuhören zeigt ein **Wellenmuster**, dass das Mikrofon läuft. Der Hinweis ist kürzer, Google bleibt genannt.
  - Beim Bauen der sauberen Kopie steht ein **Ladebalken** da.
  - Am Tablet heißt der Satz im Feld jetzt „Hier einfügen (lange tippen → Einfügen)“ statt klein „hier einfügen“.

- **Fassung 17 (PR #19):** Ein eingetragener **Name** trifft im Text nur noch das ganze Wort, der Bindestrich gehört dazu: „Müller“ trifft
  also nicht mehr „Müller-Thurgau“. Neues Feld **„Nicht ersetzen“** unter der Suche: Was dort steht, wird nie gefunden, nie ersetzt, und die
  Nachprüfung lässt es stehen. Findet Modul 25 den Namen selbst, wird streng ersetzt, bis die Ausnahme eingetragen ist.
- **Geschenk-Seite** jetzt kurz: nur Fassung und die drei Downloads (Klaus: *„ohne so viel Text … will nur noch die Updates“*).

## Klaus' Haken (Gegenprobe Fassung 15, Tablet)

| Nr | Was | Stand |
|---|---|---|
| 1 | v15 oben | ✓ |
| 2 | Feld mit „Datei wählen“ / „Ordner wählen“ / „?“, kein Erklärtext | ✓ |
| 3 | „?“ auf, ✕ / „?“ zu | ✓ |
| 4 | Datei wählen → Ergebnisseite | ✓ |
| 5 | Ordner wählen → Ergebnisseite | ✓ |
| 6 | Text mit Mail einfügen | offen (Klaus überlegt den Mail-Import) |
| 7 | Ziehen mit der Maus am PC | offen (beim Freund) |
| 8–9 | Pro-APK v15 | offen: auf dem Tablet lief noch **v13**, die neue APK war geladen, aber nicht installiert |
| 10 | Windows-Setup | offen |
| 11 | Geschenk-Seite | Downloads liefen (APK, EXE im Download-Verlauf) |

## Proben

- `npm test` **393 grün · 0 ROT**. Neu: Ladebalken beim Bauen, Lupe, Treffer markiert, „+“ springt und öffnet Gruppen, kein „null“,
  Wellenmuster beim Zuhören. Dazu aus Fassung 14/15: Ablagefeld, Einfügen und Ziehen → Ergebnisseite, „?“ auf/zu.
- Gegenproben NAMEN, FELDEINFUEGEN (Fassung 14), NULLWORT, TREFFERSPRUNG (Fassung 16): **4 gefangen · 0 blind**.
- Die Codex-Prüfung auf GitHub lief nicht (Kontingent erschöpft). Sie hat also nichts gemeldet, das heißt aber nicht „geprüft“.

## Nicht gemessen / offen

- Die Spracheingabe hört nur **Deutsch** (`de-DE`). „In verschiedenen Sprachen“ ist nicht gebaut; der Vorschlag wäre eine Sprachwahl am
  Mikrofon (Klaus entscheidet). Getippte Suche geht in jeder Schrift (Unicode), Groß- und Kleinschreibung egal.
- Die Treffer markieren nur Text in den Funden. In der Dateiansicht markiert die App weiter die Funde selbst, nicht die Suchwörter.
- Nicht am echten Gerät geprüft: Ziehen mit der Maus, Einfügen einer kopierten Datei, Wellenmuster mit echtem Mikrofon. Die Probe löst diese
  Schritte selbst aus.
- Mail-Import (Klaus' Idee, noch offen).

## Nächste Sitzung — zum Kopieren

```
Repo lausiklauskn-png/project-cleaner-pro. Lies CLAUDE.md, docs/BRIEF_2026-10-28_projekt-reiniger-pro.md
und docs/BRIEF_ABSCHLUSS_2026-10-31_befund-12.md. Klaus testet Fassung 17 (Haken 6–11 der Liste im
Abschluss: Text/Mail einfügen, Ziehen am PC, Pro-APK v17, Windows-Setup, Suche mit Lupe/Treffern/„+“,
Ladebalken, Wellenmuster, „Müller“ / „Müller-Thurgau“ mit „Nicht ersetzen“). Seinen Befund einarbeiten; offen sind ausserdem: Mail-Import (Klaus' Idee),
Spracheingabe in mehreren Sprachen (Sprachwahl am Mikrofon?). Danach Stufe 8 (APK/Windows fertig:
eigener Schlüssel, Update über Klaus' Server, Mikrofon unter Windows) oder Stufe 9 (Familienakte).
Am Ende: Brief nachziehen, Abschluss mit Stunden schreiben, Geschenk-HTML mit den neuen Dateien bauen.
```

## Stunden (zum Eintragen ins Fahrtenbuch)

Das Fahrtenbuch liegt in Kimhub; das Repo ist an diese Sitzung nicht angehängt, deshalb stehen die Zeilen hier zum Übertragen.
Uhrzeiten sind UTC (Berlin = UTC+1). Grundlage sind die Commit- und PR-Zeiten im Repo. Wartezeiten auf Probenläufe sind nicht abgezogen,
und Klaus' eigene Zeit (Diktat, Test am Gerät) liegt außerhalb.

**Nachgetragen** (in früheren Abschlüssen fehlend oder nur als Satz; aus den Commit-Zeiten geschätzt):

| Datum | von–bis (UTC) | Dauer | Repo | Was | Grundlage |
|---|---|---|---|---|---|
| 2026-10-28 | 18:16–23:15 | ≈ 5 h | project-cleaner-pro | Stufe 1–3, Archive/Apps öffnen, Prüfungen aus Workflow PDF (#1–#6) | erster bis letzter Commit; Pausen unbekannt |
| 2026-10-29 | 16:37–17:24 | ≈ 50 min | project-cleaner-pro | Befund 9, Vorführung „So geht's“, Stufe 6 Zurückbauen (#13) | Abschluss Befund 9 (Satz) + Merge #13 |
| 2026-10-29 | ≈ 20:15–21:27 | ≈ 1 h 10 min | project-cleaner-pro | Stufe 7 Sperrliste und Git-Wächter (#14) | Beginn geschätzt (nicht festgehalten), Commits 21:11–21:27 |
| 2026-10-29 | 21:59–22:55 | ≈ 1 h | project-cleaner-pro | Befund 11: Basic/Pro, Versionsnummer, Kopf mit Symbolen, Mikrofon (#15) | Merge #14 bis Merge #15 |
| 2026-10-29/30 | 22:55–00:07 | ≈ 1 h 10 min | project-cleaner-pro | Pro: neues Symbol, Graphit mit Blattgold (Fassung 13, #16) | Merge #15 bis Merge #16 |

**Diese Sitzung:**

| Datum | von–bis (UTC) | Dauer | Repo | Was |
|---|---|---|---|---|
| 2026-10-30 | ≈ 12:30–13:46 | ≈ 1 h 15 min | project-cleaner-pro | Befund 12: Ablagefeld, Knöpfe aufgeräumt, Proben, PR #17 (Fassung 14) |
| 2026-10-30/31 | ≈ 23:00–00:30 | ≈ 1 h 30 min | project-cleaner-pro | Hilfe hinter „?“ (Fassung 15), Merge #17, Testfassung 15, Geschenk-HTML, Abhakliste, Klaus' Gegenprobe → Fassung 16 (Suche mit Treffern, Ladebalken, Wellenmuster, „nullnull“), Abschluss |

| 2026-10-31 | ≈ 10:50–12:00 | ≈ 1 h 10 min | project-cleaner-pro | Prüfsumme aus der Geschenk-Seite, Müller/Müller-Thurgau geprüft, Fassung 17 („Nicht ersetzen“), kurze Geschenk-Seite |

Bereits in früheren Abschlüssen eingetragen (nicht doppelt zählen): 2026-10-28/29 23:37–00:55 (Stufe 4, Testfassungen) und
2026-10-29 06:31–07:40 (Stufe 5, Hereinladen).
