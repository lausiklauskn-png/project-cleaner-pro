# Forschung 2026-10-29 — Befund aus dem Test, Stufe 5, Hereinladen (Claude)

Ergänzt den [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md) (Abschnitte „Befund aus dem Test“, „Stufe 5 · gebaut“,
„Hereinladen und herausladen“). Hier stehen die **Funde und Lehren** der Sitzung. Bilder: [`bilder-stufe-5/`](bilder-stufe-5/).

## Funde am eigenen Werk (alle behoben, jeder mit Probe)

1. **Die Mustermappe verriet „Originalwerte“, die gar keine waren.** Klaus' Bildschirmfoto zeigte „Originalwerte in der Kopie: 6 —
   in MUSTERMAPPE/…mustertabelle“. Nachgestellt: das Beispielprojekt und die Mustertabelle benutzten **dieselbe erfundene Person**
   (`erika.mustermann@beispiel.example`; „erika“ war zugleich Benutzername im Pfad). Die Nachprüfung hatte recht — der String stand
   in der Kopie. **Lehre:** ein „erfundener“ Wert ist nur so lange harmlos, wie ihn niemand sonst erfindet. Die Mappe hat jetzt eigene
   Werte, und vor allem: eine Mappe-Datei, die **zufällig** einen entfernten Wert enthält, geht nicht mit (mit Grund im Bericht) —
   das gilt auch für echte Projekte, in denen „Max Mustermann“ steht.
2. **Die Messung „Schrift über Schrift“ zählte unsichtbaren Text.** Eine Gegenprobe (Vorschau aus) wurde aus dem falschen Grund rot:
   zwei Stellen-Links „überlappten“. Das Bildschirmfoto zeigte nichts — die Links lagen in **zugeklappten** `<details>`. Chromium
   verbirgt deren Inhalt ohne `display: none`; `getClientRects` liefert trotzdem Kästen, `elementFromPoint` trifft das umgebende
   Element. Vorher fiel es nur durch Zufall der Lage nicht auf (einmal schon flüchtig bei 412 px gesehen). Die Probe überspringt jetzt
   Text in zugeklappten Bereichen; die Gegenprobe UEBEREINANDER fängt weiter. **Lehre:** ein „flüchtiger“ roter Lauf ist ein Fund,
   der noch keinen Namen hat.
3. **Ein alter Klick-Handler griff auf neue Reiter.** `document.querySelectorAll(".reiter-knopf")` (Funde/Inventur am Handy) hätte
   auch die Reiter „Datei / Text einfügen“ des neuen Fensters erfasst und beim Tippen die Spalten leer geschaltet. Beim Lesen
   gefunden, bevor es lief; jetzt `#reiter .reiter-knopf`. **Lehre:** eine Klasse ist kein Ort.
4. **`data-zeige` gab es zweimal** (Spalten und der neue „Wert zeigen“-Knopf im Tresor) — die Probe klickte die Spalten an. Umbenannt
   in `data-wert-zeigen`.
5. **Zwei Gegenproben waren blind bzw. brachen ab, statt rot zu werden:** MAPPEZUFALL (nach der Mappe-Korrektur gab es den Zufall im
   Beispiel nicht mehr — jetzt ein eigener Fall mit „Musterdorf“ als selbst eingetragenem Namen) und GETEILT (die Probe wartete auf
   ein Element, das nie kam, und starb mit Zeitüberschreitung — jetzt `.catch`, dann rot). **Lehre:** eine Probe, die abstürzt, sagt
   nicht, *was* fehlt.
6. **Ein Anker traf zweimal** (DUNKELHELL: derselbe Farbsatz steht für „Automatisch dunkel“ und für den Schalter). Ein kleines
   Skript prüft jetzt alle Anker in Sekunden, ohne die Probe zu fahren (69 Fälle, 0 tot).

## Stufe 5: Woher die Teile kommen

- **Schloss:** `schluesseltresor.js` aus dem Sende-Prüfer (SHA `eaed30e8…` = dessen `TRESOR_SHA`, dort gegen kim-hub-company
  `1a4528d` gepinnt). kim-hub-company selbst anzuhängen lehnte die Sitzung ab; der Weg über den Sende-Prüfer ist derselbe Byte-Stand.
- **Gäste-Sperre:** BookLedgerPro ist privat und war nicht lesbar. **BookLedger-Basic** (öffentlich) gelesen: „Jetzt sperren“ =
  `lockVault()` (Sitzungsschlüssel auf `null`) und Neustart auf den Sperrbildschirm; `unlockVault` sagt nur „Falsches Passwort“ —
  **ohne Wartezeit**. Übernommen: Schlüssel weg, Sperrbild, eine Meldung. Neu (Brief verlangt es): wachsende Wartezeit, drei frei.
- **Anders als BookLedger:** hier liegt nichts auf dem Gerät. Die Sperre verschlüsselt das Offene **im Speicher**; neu laden heißt
  alles weg. Das ist sicherer als ein gespeicherter Tresor, aber: ein Gast kann durch Neuladen nichts sehen, er kann aber die Arbeit
  verwerfen. So steht es auch auf der Sperrfläche.

## Hereinladen (Klaus' Vorbild: Auslieferungsprüfer)

- Gelesen: `auslieferungspruefer.html` und `assets/pruefer-ui.js`. Dort: Reiter je Eingang, eine gestrichelte **Ablagefläche** mit
  Dateiwahl, darunter ein Feld „Quelltext einfügen“, dann **„Prüfen“** und **„Leeren“**. Sein Kommentar: *„Hierher ziehen“ war eine
  Anleitung für ein Gerät, das der Nutzer nicht in der Hand hält* — am Android-Tablet gibt es kein Ziehen. Deshalb hier: „Hierher
  ziehen“ steht nur bei Maus, Wählen und Einfügen gehen überall.
- **Einfügen** nimmt Dateien und Bilder aus der Zwischenablage (Bildschirmfoto → `eingefuegt-1.png`), sonst Text; SVG-Text wird
  `.svg`, HTML `.html`, gültiges JSON `.json`. In Eingabefeldern bleibt Einfügen, was es ist.
- **Ablegen im Arbeitsbildschirm** ersetzt nichts mehr still: die Dateien landen im Fenster, „Zum jetzigen Projekt dazunehmen“ ist
  vorgewählt (Entscheidungen bleiben), einzelne Dateien kommen in den Projektordner. Auf der Startfläche prüft Ablegen sofort, wie vorher.

## Grenzen dieser Sitzung

- Nichts am echten Gerät gemessen (Tablet-Befund kam von Klaus für Fassung 7). Ob Einfügen eines Bildes in der Android-WebView und in
  WebView2 ankommt, ist offen — gebaut ist es nach dem Web-Standard (`clipboardData.files`).
- Gegenprobe nicht voll gefahren (dauert hier ~2 h): 32 von 69 Fällen voll (alle neuen und die berührten), 32 gefangen, 0 blind.

## Arbeitszeit

| Datum | von–bis (UTC) | Dauer | Repo | Was |
|---|---|---|---|---|
| 2026-10-29 | 06:31–07:40 | ≈ 1 h 10 min | project-cleaner-pro | Befund (zwei Runden), Mustermappe-Fehler, Stufe 5 (Tresor, Gäste-Sperre), Hereinladen/Herausladen, Proben, Testfassung 9 (#10, #11, #12) |
