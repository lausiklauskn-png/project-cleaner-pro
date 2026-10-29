# Abschluss 2026-10-29 (Morgen) — Befund aus dem Test, Stufe 5, Hereinladen (Claude)

Auf Klaus' Kurzauftrag: Befund zu den Testfassungen einarbeiten, danach Stufe 5. Klaus schickte den Befund während der Arbeit
(Bildschirmfotos vom Tablet), danach den Wunsch nach Hereinladen/Herausladen („Auslieferungsprüfer zum Vorbild“). Plan und Stand:
[Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md). Funde und Lehren: [Forschung](FORSCHUNG_2026-10-29_stufe-5.md).
Bilder: [`bilder-stufe-5/`](bilder-stufe-5/) (hell, dunkel, Handy).

## Veröffentlicht (Fassung 9)

DOWNLOADS

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

ARBEITSZEIT

## Nächste Sitzung

```
Repo lausiklauskn-png/project-cleaner-pro. Lies docs/BRIEF_2026-10-28_projekt-reiniger-pro.md
(und die CLAUDE.md) und setze den nächsten offenen Schritt um: Klaus' Befund zu Fassung 9 (Tresor,
Gäste-Sperre, geteilte Ansicht, Hereinladen) einarbeiten, danach Stufe 6 (Zurückbauen, mit eigenen
Werten füllen).
Am Ende: Brief nachziehen und wieder so einen Kurzauftrag ausgeben.
```
