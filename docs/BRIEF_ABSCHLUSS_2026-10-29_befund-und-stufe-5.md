# Abschluss 2026-10-29 (Abend) — Befund aus dem Test, Stufe 5 (Claude)

Auf Klaus' Kurzauftrag: Befund zu den Testfassungen einarbeiten, danach Stufe 5. Klaus schickte den Befund während der Arbeit
(zwei Nachrichten, Bildschirmfotos vom Tablet). Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md), Abschnitte
„Befund aus dem Test“ und „Stufe 5 · gebaut“. Bilder: [`bilder-stufe-5/`](bilder-stufe-5/) (hell, dunkel, Handy).

## Was neu ist (Fassung 8)

- **Befund:** Erklärungen hinter ⓘ · Zählzeile und Inventur nur als Text (farbig/fett, keine Kästchen) · Vorher/nachher
  **geteilt** oder einzeln · Cursor springt bei „Eigener Wert“ ins Feld · **Vorschau „Wird zu:“** beim Wählen · Dunkel heller.
- **Fehler aus Klaus' Bildschirmfoto behoben:** „Originalwerte in der Kopie: 6 — in MUSTERMAPPE/…mustertabelle“ — die Mustertabelle
  hatte dieselben erfundenen Werte wie das Beispielprojekt. Jetzt eigene Werte, und ein zufälliger Treffer bleibt weg.
- **Stufe 5:** Tresor (eine verschlüsselte `.rtresor`-Datei mit Zuordnung und auf Wunsch den Originalen, Ablauf 30 Tage) und
  Gäste-Sperre (Knopf mit Schloss im Kopf; sofort weg, nur mit Code zurück, wachsende Wartezeit). Schloss `schluesseltresor.js`
  byte-1:1, gepinnt.

## So testet Klaus

1. „Aktualisieren“ tippen (Fassung 8). Beispielprojekt → bei „Hamburg“ „Eigener Wert …“ wählen → Cursor steht im Feld, tippen →
   darunter ändert sich „Wird zu:“.
2. „Saubere Kopie bauen“ → „Vorher / nachher ansehen“ → oben „Geteilt“.
3. Unter der Kopie „Tresor (auf Wunsch)“: Code zweimal, „Verschließen und speichern“. Dann „Neu“ → „Tresor öffnen“ → die Datei → Code.
4. Schloss-Knopf oben rechts: Code festlegen → alles weg. Falschen Code dreimal → Wartezeit. Richtigen Code → alles wieder da.

## Grenzen, ehrlich

- BookLedgerPro (privat) war nicht lesbar; die Sperre folgt **BookLedger-Basic** (Schlüssel aus dem Speicher, Sperrbild). Die
  wachsende Wartezeit gibt es dort nicht — sie ist hier nach dem Brief neu gebaut.
- `schluesseltresor.js` kam über den Sende-Prüfer (dort gegen kim-hub-company gepinnt); kim-hub-company selbst anzuhängen wurde
  in dieser Sitzung abgelehnt.
- Tresor und Sperre halten alles als Base64 im Speicher — bei sehr großen Projekten am Tablet nicht gemessen. Kein Ersatzschlüssel
  (3 aus 5) bisher. APK/Windows: kein Befund, nicht am Gerät gemessen.
- Stunden nicht eingetragen (Fahrtenbuch in Kimhub, hier nicht angehängt).

## Nächste Sitzung

```
Repo lausiklauskn-png/project-cleaner-pro. Lies docs/BRIEF_2026-10-28_projekt-reiniger-pro.md
(und die CLAUDE.md) und setze den nächsten offenen Schritt um: Klaus' Befund zu Fassung 8 (Tresor,
Gäste-Sperre, geteilte Ansicht) einarbeiten, danach Stufe 6 (Zurückbauen, mit eigenen Werten füllen).
Am Ende: Brief nachziehen und wieder so einen Kurzauftrag ausgeben.
```
