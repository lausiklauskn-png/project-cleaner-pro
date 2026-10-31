# Abschluss 2026-10-29 (Morgen) — Befund aus dem Test, Stufe 5, Hereinladen (Claude)

Auf Klaus' Kurzauftrag: Befund zu den Testfassungen einarbeiten, danach Stufe 5. Klaus schickte den Befund während der Arbeit
(Bildschirmfotos vom Tablet), danach den Wunsch nach Hereinladen/Herausladen („Auslieferungsprüfer zum Vorbild“). Plan und Stand:
[Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md). Funde und Lehren: [Forschung](https://github.com/lausiklauskn-png/Kimhub/blob/main/forschung/messungen/projekt-reiniger-pro-2026-10-29-stufe-5.md).
Bilder: [`bilder-stufe-5/`](bilder-stufe-5/) (hell, dunkel, Handy).

## Veröffentlicht (Fassung 9)

| Fassung | Wo | Stand |
|---|---|---|
| PWA, Fassung 9 | https://lausiklauskn-png.github.io/project-cleaner-pro/ — „Aktualisieren“ im Kopf tippen | main `f53fef1` |
| Android-Testfassung | [Projekt-Reiniger-Pro-Test-9.apk](https://github.com/lausiklauskn-png/project-cleaner-pro/releases/download/testfassung/Projekt-Reiniger-Pro-Test-9.apk) · 21.902.230 B | `f53fef1` |
| Windows-Testfassung | [Projekt-Reiniger-Pro-Test-9-Windows-Setup.exe](https://github.com/lausiklauskn-png/project-cleaner-pro/releases/download/testfassung/Projekt-Reiniger-Pro-Test-9-Windows-Setup.exe) · 13.066.477 B | `f53fef1` |

Release-Seite: https://github.com/lausiklauskn-png/project-cleaner-pro/releases/tag/testfassung (veröffentlicht 07:34 UTC; jede neue Fassung auf main ersetzt sie). SHA-256 laut GitHub:
APK `9c74b8e17e46c5e16a090b0f2154fbe396917bcb541e98069603a765cffd46fd`,
Setup `7ba3103f4ad1c5c8585ca5e39002af6f1df2cd368592c2bf1394fbcfd24015f7` (die `.sha256`-Dateien liegen daneben).
Vor der APK die alte Testfassung deinstallieren (Debug-Schlüssel); Windows: „Weitere Informationen → Trotzdem ausführen“ (unsigniert).
⚠ Die Downloads wurden von hier aus nicht nachgeladen und nicht am Gerät gestartet; Bau auf GitHub grün (beide Teile).

## Was neu ist

- **Befund:** Erklärungen hinter ⓘ · Zählzeile und Inventur nur als Text (farbig/fett, keine Kästchen) · Vorher/nachher
  **geteilt** oder einzeln · Cursor springt bei „Eigener Wert“ ins Feld · **Vorschau „Wird zu:“** beim Wählen · Dunkel heller.
- **Fehler aus Klaus' Bildschirmfoto behoben:** „Originalwerte in der Kopie: 6 — in MUSTERMAPPE/…“ — die Mustertabelle hatte
  dieselben erfundenen Werte wie das Beispielprojekt. Jetzt eigene Werte; ein zufälliger Treffer bleibt weg.
- **Stufe 5:** Tresor (eine verschlüsselte `.rtresor`-Datei mit Zuordnung und auf Wunsch den Originalen, Ablauf 30 Tage) und
  Gäste-Sperre (Schloss-Knopf im Kopf; sofort weg, nur mit Code zurück, wachsende Wartezeit). Schloss byte-1:1, gepinnt.
- **Hereinladen / Herausladen:** Leiste oben im Arbeitsbildschirm; Fenster mit Ablagefläche, „Dateien wählen“, „Ordner wählen“ und
  „Text einfügen“ (auch SVG); Strg+V und Ablegen überall; „Zum jetzigen Projekt dazunehmen“.

## PRs (nach grünen Proben selbst gemergt, Freibrief NETZWEIT § 1)

- #10 Befund und Stufe 5 (Fassung 8) — `npm test` 266 grün, Gegenprobe 28 gefangen · 0 blind.
- #11 Hereinladen/Herausladen, Briefe, Forschung (Fassung 9) — `npm test` 281 grün, Gegenprobe 32 gefangen · 0 blind (von 69, Anker 0 tot).

## So testet Klaus

1. „Aktualisieren“ tippen (Fassung 9). Beispielprojekt → oben **„Dateien hereinladen“** → eine Datei wählen oder Text/SVG
   einfügen → „Prüfen“. Oben steht dann „Geprüft: musterapp + 1 Datei“.
2. Bei „Hamburg“ „Eigener Wert …“ → Cursor steht im Feld → tippen → „Wird zu:“ ändert sich.
3. **„Saubere Kopie herausladen“** → ZIP. „Vorher / nachher ansehen“ → oben „Geteilt“.
4. Unter der Kopie „Tresor (auf Wunsch)“: Code zweimal → „Verschließen und speichern“. „Neu“ → „Tresor öffnen“ → Code.
5. Schloss-Knopf oben rechts: Code festlegen → alles weg. Dreimal falsch → Wartezeit. Richtig → alles wieder da.
6. APK und Windows: dasselbe (am Tablet ohne Ziehen; Wählen und Einfügen gehen).

## Grenzen, ehrlich

- BookLedgerPro (privat) war nicht lesbar; die Sperre folgt **BookLedger-Basic**. Die wachsende Wartezeit gibt es dort nicht —
  sie ist hier nach dem Brief neu gebaut.
- `schluesseltresor.js` kam über den Sende-Prüfer (dort gegen kim-hub-company gepinnt); kim-hub-company selbst ließ sich nicht anhängen.
- Tresor und Sperre halten alles als Base64 im Speicher — bei sehr großen Projekten am Tablet nicht gemessen. Kein Ersatzschlüssel
  (3 aus 5) bisher. APK/Windows nicht am Gerät gemessen; Bild-Einfügen in den Hüllen offen.
- Gegenprobe nicht voll gefahren (~2 h hier): 32 von 69 Fällen.

## Stunden (zum Eintragen ins Fahrtenbuch)

| Datum | von–bis (UTC) | Dauer | Repo | Was |
|---|---|---|---|---|
| 2026-10-29 | 06:31–07:40 | ≈ 1 h 10 min | project-cleaner-pro | Befund (zwei Runden), Mustermappe-Fehler, Stufe 5 (Tresor, Gäste-Sperre), Hereinladen/Herausladen, Proben, Testfassung 9 (#10, #11, #12) |

Nicht ins Fahrtenbuch eingetragen: es liegt in Kimhub, das an diese Sitzung nicht angehängt ist.

## Nächste Sitzung

```
Repo lausiklauskn-png/project-cleaner-pro. Lies docs/BRIEF_2026-10-28_projekt-reiniger-pro.md
(und die CLAUDE.md) und setze den nächsten offenen Schritt um: Klaus' Befund zu Fassung 9 (Tresor,
Gäste-Sperre, geteilte Ansicht, Hereinladen) einarbeiten, danach Stufe 6 (Zurückbauen, mit eigenen
Werten füllen).
Am Ende: Brief nachziehen und wieder so einen Kurzauftrag ausgeben.
```
