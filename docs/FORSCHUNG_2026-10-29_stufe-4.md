# Forschung 2026-10-29 — Stufe 4, Hell/Dunkel, Testfassungen (Claude)

Ergänzt den [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md) (Abschnitte „Stufe 4 · gebaut“ und „Hell und dunkel“).
Hier stehen die **Funde und Lehren** der Sitzung — was schiefging, wie es auffiel und was daraus folgt. Bilder:
[`bilder-stufe-4/`](bilder-stufe-4/) (43 Bildschirmfotos: Hell/Dunkel, Handy hoch/quer, Desktop, alle Zustände).

## Funde am eigenen Werk (alle behoben, jeder mit Probe)

1. **Weiße Schrift auf hellem Grund war messbar, nicht nur gefühlt.** Klaus' Satz „weiße Schrift … hellem Hintergrund, das
   passt nicht“ ließ sich in eine Zahl fassen: eine Kontrast-Probe (WCAG AA, auch über Verläufe und halbdurchsichtige Flächen,
   der schlechteste Ton zählt) fand genau vier Stellen — die Kopf-Knöpfe „Installieren“, „Aktualisieren“, „Neu“ und „Lokal“,
   weiß auf 14 % Weiß über dem Petrol-Ende des Verlaufs: 3,95–4,11 : 1 statt 4,5 : 1. Alles andere stand schon über 4,5.
   **Lehre:** halbdurchsichtiges Weiß unter weißer Schrift hebt den Grund an — es ist genau die Falle, die man nicht sieht,
   weil der Knopf „hell und freundlich“ wirkt.
2. **Die erste Gegenprobe zum Kontrast war blind.** Sabotage „Knopf wieder auf 14 % Weiß“ blieb grün, weil der dunklere
   Verlauf allein schon reichte. Erst „60 % Weiß“ wurde rot. **Lehre:** eine Gegenprobe muss den Fehler wirklich
   herstellen, nicht nur die Zeile zurückdrehen, die ihn einmal verursacht hat.
3. **Die DOM-Wache des Kerns schlug auf ein Wort an.** `word/document.xml` (ein Dateiname in jeder Word-Datei) enthielt
   „document“. Die Probe sucht jetzt Zugriffe (`document.`/`window.` ohne `/`, `.`, `:` davor) — und eine neue Gegenprobe
   „DOM“ zeigt, dass ein echter Zugriff weiter rot wird.
4. **Der Anhang-Prüfer liest Word anders als der Neubau.** Er klebt gelöschten Text (Änderungsverlauf) an den Absatz:
   „anna@beispiel.example**Geheimwort**“ wurde als *eine* Mail gefunden. Der Neubau las den Absatz ohne gelöschten Text —
   der Wert stand dort anders, wurde nicht ersetzt, **die Nachprüfung meldete die Mail**. Abhilfe: beim Neubau wird der
   eigene gelesene Text noch einmal durchsucht (`nachfinden`). **Lehre:** wer zwei Leser hat, hat zwei Wahrheiten; die
   Nachprüfung am Ergebnis ist der einzige Ort, an dem beide zusammenkommen.
5. **Die Straßen-Regel (Stufe 3) griff über einen Zeilenumbruch** („Anna Beispiel⏎Kastanienallee 7“ als Adresse). Fiel erst
   auf, als ein Kasten fehlte — im Text-Reinigen hätte die Ersetzung trotzdem gegriffen. Jetzt nur innerhalb einer Zeile;
   außerdem finden Kästen Werte über Zeilen hinweg (je Zeile ein Kasten).
6. **Gleich breit geschätzte Zeichen lassen einen Buchstaben stehen.** „Mail: a█████“ — das „a“ von „anna@…“ blieb sichtbar,
   weil „Mail: “ schmaler ist als sechs Durchschnittszeichen. Abhilfe: die Breite jedes Zeichens wird mit der Schrift aus
   pdf.js gemessen und auf die Stückbreite geeicht. Die Probe misst im Original-Bild die erste Tinte des Wertes und prüft,
   dass der Kasten dort schon beginnt. **Lehre:** „der Kasten sitzt grau da“ war grün, obwohl er daneben saß — die
   Zusicherung muss die Eigenschaft prüfen (deckt den Wert), nicht das Aussehen (ist grau).
7. **Zwei Funde an einer Stelle gaben Schrift über Schrift** („PLZ und Ort entfernt“ über „Ort entfernt“). Überlappende
   Kästen werden jetzt einer, das Etikett nimmt der breiteste Fund, der Stellenplan nennt jede Art.
8. **Eine kleine PDF ist als Text lesbar** — die Ansicht zeigte das Original als Quelltext statt als Seite. Fiel bei der
   Bildreihe auf, nicht in einer Probe. Jetzt entscheidet die Dateiart; eine Probe prüft es.
9. **Im Browser ist jede PDF ohne Texterkennung „ungeprüft“**, weil der Anhang-Prüfer die Textebene nicht gegen das
   Seitenbild lesen kann. Für das Neuzeichnen ist das kein Hindernis (es beseitigt versteckten Text ohnehin) — die Vorgabe
   „neu zeichnen“ hängt jetzt daran, ob gescannte Seiten ohne Text dabei sind (Hinweis „ohne Textebene“).
10. **Kommentar-Falle:** „drawable-*/splash.png“ in einem `/* … */`-Kommentar beendet den Kommentar.

## Schrift und Satz (Klaus' Hinweis während der Arbeit)

Zwei neue Messungen laufen in **jeder** Größe und **jedem** Zustand mit: sichtbare Textzeilen verschiedener Elemente
überdecken sich nicht (gezählt nur, was an seiner Stelle oben liegt), und kein sichtbarer Text trägt doppelte Leerzeilen. Die
Installier-Meldung nutzte Leerzeilen für Absätze — jetzt echte Absätze. Beide Messungen haben eine Gegenprobe.

## Testfassungen (Android, Windows)

- Gebaut wie Private Brain Pro: **Capacitor 8.5.3** (Debug-APK) und **Tauri 2.12** (NSIS-Setup, unsigniert), auf GitHub.
  Hier im Behälter gibt es kein Android-SDK und kein Windows — gebaut und gemessen wird dort, nicht hier.
- **Android kennt keinen Browser-Download.** Ein kleines eigenes Plugin („Speichern“) öffnet den System-Dialog „Speichern
  unter“; die App schreibt nur dorthin, ohne Speicherberechtigung.
- Icons und Startbild entstehen aus derselben Kristall-Quelle (`tools/icons-bauen.mjs`). Das Bild hat einen eigenen,
  dunkleren Rand — auf Navy sah man ein Quadrat; der Rand läuft jetzt weich aus.

## Grenzen dieser Sitzung

- Nichts am echten Handy, Tablet oder Windows-Rechner gemessen. Ob Texterkennung (WebAssembly-Worker) und pdf.js in der
  Android-WebView und in WebView2 laufen, zeigt erst Klaus' Test.
- Der Stunden-Eintrag (Fahrtenbuch in Kimhub) konnte nicht geschrieben werden: das Anhängen von Kimhub an die Sitzung wurde
  vom Sicherheitsfilter abgelehnt. Der Eintrag steht vorbereitet im Abschlussbrief.
