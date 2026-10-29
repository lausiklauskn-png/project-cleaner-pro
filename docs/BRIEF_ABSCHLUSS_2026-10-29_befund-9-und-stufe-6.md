# Abschluss 2026-10-29 (Abend) — Befund zu Fassung 9, Vorführung, Stufe 6 (Claude)

Die Sitzung begann mit dem Startauftrag „Pro-Umbau 8“ (BookLedgerPro, Basic, Workflow PDF Pro, Private Brain Pro). Die vier Repos wurden
angehängt und gelesen, **dort wurde nichts geändert**. Klaus' Befunde betrafen dann den Projekt-Reiniger, und sein Kurzauftrag bestätigte
das: Befund zu Fassung 9 einarbeiten, danach Stufe 6. Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md). Funde und
Lehren: [Forschung](FORSCHUNG_2026-10-29_stufe-6.md). Bilder: [`bilder-stufe-6/`](bilder-stufe-6/).

## Was neu ist (Fassung 10)

- **Befund 9:** „ZIP oder Dateien einfügen“ / „Ordner einfügen“ · **„Neu“ links** in der Arbeitsleiste · **„So geht's“**: ein Finger
  bedient die echte App, Schritt 1–4, ein Tipp oder Esc beendet, Vollbild wie geteilte Ansicht. Ohne Musik, ≈ 13 s (Prüfrechner).
- **Stufe 6 · Zurückbauen:** Platzhalter mit eigenen Werten füllen oder einzelne Stellen mit dem Original zurückholen — nach dem Reinigen,
  beim Einwerfen einer sauberen Kopie oder aus dem geöffneten Tresor.
- **Gefunden und behoben:** Fenster lagen über dem Kopf, „Sperren“ war dann nicht greifbar.

## PR

- #13 — `npm test` 321 grün · 0 ROT (+40). Gegenproben: siehe unten.

## Gegenproben (je Fall die ganze Probe auf einer sabotierten Kopie)

NAMEN, NEULINKS, VFTIPP, VFDECKT, EINFUEGEN (Anker nachgezogen), RBWORTGRENZE, RBMUSTERART, RBOFFICE, RBSPERRE, RBKOPF, RBEINWURF, VFFOLGEN —
Ergebnis steht im PR. Zwei Proben waren beim ersten Lauf **blind** und wurden geschärft: „ein Tipp beendet“ wartete zu lange (VFTIPP),
und „der Finger folgt“ wurde nie herausgefordert (VFFOLGEN: jetzt verschiebt die Probe das Ziel absichtlich). Anker aller 81 Fälle leben.

## So testet Klaus (Fassung 10, am Tablet)

1. „Aktualisieren“ tippen. Erste Seite: „ZIP oder Dateien einfügen“, „Ordner einfügen“.
2. **„So geht's“** tippen — im Vollbild und in der geteilten Ansicht. Läuft der Finger über die App? Mitten drin tippen: ist sie sofort weg?
   Dauer bis zum Ende für die Musik stoppen (am Tablet länger als 13 s).
3. Beispielprojekt → oben links **„Neu“** → die erste Seite ist wieder da.
4. Beispielprojekt → „Saubere Kopie bauen“ → **„Eigene Werte einsetzen …“** → bei `⟦ORT-1⟧` „Konstanz“ eintragen → „Gefüllte Kopie
   herausladen“. Dann „Alle Originale zurückholen“ → gelbe Warnung, Datei `…-zurueckgebaut.zip`.
5. Die saubere ZIP auf der ersten Seite einwerfen → „Zurückbauen“ öffnet sich (ohne „Original“); „Doch prüfen“ prüft sie.
6. Während ein Fenster offen ist: „Sperren“ oben rechts ist zu sehen und greift.

## Nicht gemessen / offen

- Nichts am Gerät (Tablet, APK, Windows). Testfassungen baut GitHub nach dem Merge auf main von selbst (Vorab-Veröffentlichung
  `testfassung`, Fassung 10) — von hier aus nicht geladen und nicht gestartet.
- Kästen in neu gezeichneten PDF/Bildern mit eigenen Werten füllen; grauer Grund an eigenen Werten in Office; Musik zur Vorführung (Klaus).
- Pro-Umbau 8 (BookLedgerPro 0.1.3 / Workflow PDF Pro 1.0.9, Tablet-Befunde) ist **nicht begonnen** — die Befunde dazu fehlen noch.

## Stundennachweis

Erste Spur 16:37 UTC (17:37 Berlin: vier Repos angehängt und geklont), Klaus' Befund zum Reiniger kurz danach, Bau und Proben in einem
Block, PR #13 gegen 17:05 UTC, Gegenproben und Abschluss danach. Uhrzeiten aus dem Behälter (Zeitstempel der Klone, `date`); Wartezeiten
auf Probenläufe sind nicht abgezogen. Klaus' eigene Zeit (Diktat, Test am Tablet) liegt außerhalb dieser Messung; seine Angabe geht vor.
