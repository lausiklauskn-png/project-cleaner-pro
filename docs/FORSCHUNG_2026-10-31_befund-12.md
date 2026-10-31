# Forschung 2026-10-30/31 — Befund 12: Ablagefeld, Hilfe, Suche mit Treffern (Claude)

Was beim Bau gelernt und gemessen wurde. Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md), Abschnitt „Befund 12“.

## „nullnull“ — `replaceChildren` schreibt `null` als Wort

- `el()` in app.js überspringt `null`-Kinder, **`Element.replaceChildren()` nicht**: Jedes Argument, das kein Knoten ist, wird zu
  Text, also `null` zum Wort „null“. Die Funde-Fläche bekam je leerer Schicht (`SCHICHTEN.map` → `null`) ein „null“. Bei zwei leeren
  Schichten stand „nullnull“ über der Dateien-Karte, und genau das hat Klaus gesehen.
- Regel: Vor `replaceChildren(...)` immer erst `.filter(Boolean)`. Die Probe sucht nach einem Textknoten „null“ direkt in `#befunde`,
  und die Gegenprobe NULLWORT nimmt den Filter wieder heraus.

## Ein Feld, zwei Arten Gerät

- Ziehen gibt es am Tablet nicht. Ein Satz „Hierher ziehen oder einfügen“ verspricht dort etwas Unmögliches. Lösung über CSS-Medienabfrage
  `(hover: hover) and (pointer: fine)`: Mit Maus heißt es „Hierher ziehen oder hier einfügen (Strg+V)“, mit Finger „Hier einfügen
  (lange tippen → Einfügen)“. Vorher stand am Tablet der Rest „hier einfügen (Strg+V)“ klein und ohne Sinn (Klaus' Bild).
- Der Browser lässt im selben Auswahlfenster **nur Dateien oder nur einen Ordner** wählen (`webkitdirectory` schaltet um). Deshalb gibt es
  zwei Knöpfe; das steht auch so im Brief, für die nächste Frage danach.
- Einfügen im Feld: Das `paste`-Ereignis liefert `clipboardData`. Dateien gehen direkt in die Prüfung, Text (oder `image/svg+xml`) wird über
  `textAlsDatei` eine Datei mit erkannter Endung. Getippter Text wartet auf „Text prüfen“ oder Strg+Enter.
- Proben können `paste` und `drop` selbst auslösen (`new ClipboardEvent("paste", { clipboardData })`, `new DragEvent("drop",
  { dataTransfer })`). Beim selbst ausgelösten Einfügen fügt der Browser aber **nichts ins Feld** ein; der Code darf sich also nicht
  darauf verlassen, das Feld danach zu lesen. Erster Entwurf las `textarea.value` nach `setTimeout` und war darum in der Probe blind.

## Suche mit Treffern

- Markiert wird im fertigen DOM der Funde mit einem `TreeWalker` über Textknoten. Ausgelassen werden Eingabefelder, die Werkzeugleiste
  und schon gesetzte `<mark>`. Jeder Treffer wird in `<mark class="treffer">` gelegt, `textContent` bleibt dabei gleich, und alle
  bisherigen Proben, die Text lesen, laufen weiter.
- Ein Ausdruck für alle Suchwörter, längste zuerst, Flags `giu` (Unicode, Groß und klein egal). Damit geht die Suche in jeder Schrift.
  Die Spracheingabe dagegen hört nur `de-DE`.
- Springen: `scrollIntoView({ block: "center" })`. Vorher werden alle umgebenden `<details>` geöffnet, sonst liegt der Treffer in einer
  zugeklappten Gruppe und das Rollen geht ins Leere. Die Gegenprobe TREFFERSPRUNG nimmt das Öffnen heraus.
- Tasten „+“ / „−“ greifen nur außerhalb von Eingabefeldern, sonst könnte man „+49“ nicht mehr tippen.

## Kleines Handwerk

- `node --check assets/app.js` prüft eine `.js`-Datei als CommonJS und hat eine fehlende Klammer **nicht** gemeldet. Als Kopie mit Endung
  `.mjs` meldet es sie. Schneller als ein ganzer Probenlauf (≈ 9 min), der erst am Zeitlimit eines Klicks scheitert.
- Ein unbestimmter `<progress>` (ohne `value`) ist der einfachste Ladebalken. Er braucht keine Gesamtzahl, die der Kern beim Neuzeichnen
  nicht kennt.
- Wellenmuster: sieben `<i>`-Striche mit versetzter CSS-Animation. Bei `prefers-reduced-motion` stehen sie still. Der Ton bleibt in
  `aria-live`, die Striche sind `aria-hidden`.
