# Forschung 2026-10-29 (Abend) — Befund zu Fassung 9, Vorführung, Stufe 6 (Claude)

Ergänzt den [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md) (Abschnitte „Befund zu Fassung 9“, „Stufe 6 · gebaut“). Hier stehen die
**Funde und Lehren** der Sitzung. Bilder: [`bilder-stufe-6/`](bilder-stufe-6/).

## Funde am eigenen Werk (alle behoben, jeder mit Probe)

1. **„Sperren“ war hinter jedem Fenster verschwunden.** Datei-Ansicht und Tresor lagen mit `position: absolute; inset: 0` über der
   ganzen App — auch über dem Kopf. Aufgefallen erst, als die neue Probe im Zurückbau-Fenster auf „Sperren“ tippen wollte (Playwright:
   „subtree intercepts pointer events“). Die Regel „Knopf im Kopf, immer sichtbar“ stand in der CLAUDE.md, gemessen hatte sie keine
   Probe. Jetzt liegen die Fenster in der Rasterzeile unter dem Kopf; die Probe prüft mit `elementFromPoint`, dass „Sperren“ oben liegt.
   **Lehre:** eine Regel, die keine Probe misst, gilt nur bis zum nächsten Fenster.
2. **Ein ausklingender Durchlauf beendete den nächsten.** Die Vorführung wartet zwischen den Schritten; wird sie per Tipp beendet und
   sofort neu gestartet, lief der alte Durchlauf noch in seine Pause und rief beim Aufwachen „Ende“ — für den **neuen**. Jetzt steuert
   jeder Durchlauf nur sich selbst (eigenes Objekt, `ende` nur, wenn er noch der laufende ist).
3. **Der Finger blieb stehen, wenn die Seite unter ihm rutschte.** „Wird zu:“ lädt nach, das Ergebnis der Kopie schiebt alles; der
   Finger zeigte dann daneben. Er folgt jetzt seinem Ziel Bild für Bild (`requestAnimationFrame`, gleitet per CSS).
4. **Eine Gegenprobe blieb blind, weil die Probe zu geduldig war.** „Ein Tipp beendet“ wartete bis zu 30 s — da endet die Vorführung
   (≈ 13 s) ohnehin von selbst. Jetzt muss sie 150 ms nach dem Tipp weg sein und noch bei Schritt 2–3 stehen. **Lehre:** eine Wartezeit
   in der Probe ist eine Lücke, durch die das Verhalten „von selbst“ schlüpfen kann.
5. **Musterwerte sind nicht eindeutig.** „Max Mustermann“ ist der erste Musterwert für Name, Copyright, Git-Name und Verfasser — vier
   Posten, die verschiedene Originale haben können. Ein Platz ist darum **Art + Musterwert**, eine Marke `⟦NAME-1⟧` allein.
6. **„muster“ steckt in „musterapp“.** Der Musterwert für den Benutzernamen im Pfad ist „muster“; beim Füllen der Zeile
   `C:\Users\muster\Projekte\musterapp` wurde daraus „…erika…erikaapp“. Gefüllt wird jetzt nur an Wortgrenzen — mit derselben Regel
   wie beim Reinigen. Gemessen: mit den Originalen ist danach jede Textdatei des Beispielprojekts Byte für Byte das Original.
7. **„MUSTER-SCHLUESSEL-1“ sah aus wie eine Marke im Dateinamen** („NAME-1“ ohne Klammern). Ausgenommen: was mit `MUSTER-` beginnt.
8. **Office teilt Sätze in Abschnitte** (`<w:r>`): „Klaus & Co aus Konstanz“ steht nie am Stück im XML. Ersetzt wird je Platzhalter
   (der immer in einem eigenen Abschnitt steht), geprüft wird am Text ohne Auszeichnung.
9. **Gegenproben liefen in halbfertigen Code.** Die Gegenprobe kopiert das Arbeitsverzeichnis bei jedem Fall neu — wer währenddessen
   den Kern ändert, bekommt Fälle „aus falschem Grund“ (hier: ein doppelter Name im Kern). Die betroffenen Fälle wurden neu gefahren.
   **Lehre:** Gegenproben erst starten, wenn nichts mehr geändert wird, oder auf einer Kopie arbeiten.

## Entscheidungen

- **Vorführung = die App selbst, kein Film:** sie bedient die echte Oberfläche mit dem erfundenen Beispielprojekt. Dadurch passt sie
  sich jeder Fenstergröße an (Vollbild, geteilt, Handy quer) und veraltet nicht, wenn sich Knöpfe ändern. Preis: am Tablet dauert sie
  so lange, wie Prüfen und Reinigen dort dauern — die Musik muss das abfangen (Klaus' Plan: Dauer messen, dann Musik).
- **Eine saubere Kopie wird beim Einwerfen nicht noch einmal geprüft,** sondern zum Füllen geöffnet. „Doch prüfen“ steht daneben —
  die Nachprüfung von Hand bleibt möglich.
- **Originale zurückholen heißt laut „NICHT sauber“** (Dateiname `…-zurueckgebaut.zip`, gelbe Warnung, Satz in der Zurückbau-Datei).

## Nicht gemessen

Am Tablet (Vorführung in der geteilten Ansicht, Tipp zum Beenden mit dem Finger), APK und Windows, große Projekte beim Zurückbauen,
Office-Dateien aus echten Projekten, eine nach dem Reinigen von Hand geänderte Kopie.
