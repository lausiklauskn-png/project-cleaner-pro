# Brief: Projekt-Reiniger Pro

Stand 2026-10-29 (Nacht), **Stufen 1–7 gebaut**, Fassung 12, **Befund 11 eingearbeitet** (Abschnitte „Stufe 1/2/3/4/5/6/7 · gebaut“ unten). Die App reinigt:
einwerfen oder **hereinladen** (Fenster: wählen, ablegen, einfügen) → Funde ansehen (antippen = Datei an der Stelle) → je Fund
entscheiden (mit **Vorschau**, was aus der Zeile wird) → saubere Kopie als ZIP mit Stellenplan und Bericht → Nachprüfung →
**herausladen** → auf Wunsch **Tresor** (verschlüsselte Datei mit Zuordnung und Originalen) → **Zurückbauen** (Stufe 6: die
Platzhalter mit eigenen Werten füllen oder einzelne Stellen mit dem Original zurückholen). Die **Gäste-Sperre** im Kopf schließt
die App sofort. PDF und Bilder werden neu gezeichnet, Word/Excel/PowerPoint als reiner Text neu gebaut, dazu die Mustermappe.
Neu auf der ersten Seite: **„So geht's“** — eine Vorführung, in der ein Finger die echte App bedient (Schritt 1–4).
Neu in Stufe 7: aus der Zuordnung eine **Sperrliste** herausladen (nur Fingerabdrücke, keine Werte) und den **Git-Wächter**
einrichten, der jeden Commit und Push mit einem dieser Werte oder einer Tresor-Datei anhält — auch als GitHub-Prüfung.
Klaus' Befunde zu Fassung 9 und 11 sind eingearbeitet (Fassung 10: „funktioniert gut“). **Basic** = Browser/PWA (blauer Kristall),
**Pro** = APK und Windows (goldener Kristall, Gold auf Dunkel). Nächster Schritt: Klaus testet Fassung 12 (Basic im Browser, Pro als
APK aus der Testfassung) und gibt den Befund in den Auftrag; danach Stufe 8 (APK/Windows fertig: eigener Schlüssel, Update über
Klaus' Server, Mikrofon unter Windows) oder Stufe 9 (Familienakte). Der Brief lebt **hier** im Repo
`project-cleaner-pro`; die Fassung im Sende-Prüfer ist eingefroren und zeigt hierher.

## Anlass

Ein Freund hat Klaus seine selbst gebaute App als ZIP geschickt. Darin steckten aus Versehen
seine persönlichen Daten. Er hatte dieselbe ZIP schon in KI-Sitzungen im Internet eingefügt.
Klaus hat das Projekt in einer Sitzung gereinigt, die heute „Meine-Familienakte“ ist.

Klaus: *„Ich möchte für das nächste Mal ein Programm haben … bevor ich es in eine KI-Sitzung
einfüge … bevor irgendein Commit oder eine History in GitHub geschrieben wird.“*

Das Fremde kann Klaus nicht mehr ändern. Er kann aber verhindern, dass es bei ihm noch einmal
passiert.

## Entschieden (Klaus 2026-10-28)

| | |
|---|---|
| Name | **Projekt-Reiniger Pro** (Repo `project-cleaner-pro`, Adresse https://lausiklauskn-png.github.io/project-cleaner-pro/) |
| Plattformen | zuerst **PWA**, gleich danach **APK** (Android), dann **Windows**, gebaut wie Private Brain Pro und Workflow PDF Pro (eine Codebasis) |
| Standard | **Stellenplan**, ohne die entfernten Werte (Erklärung unten) |
| Tresor | eingebaut. Die Originale werden darin nur **auf Wunsch** aufbewahrt, verschlüsselt |
| Gäste-Sperre | ein Knopf schließt die App sofort, wie in BookLedgerPro. Wieder öffnen geht nur mit dem Code |
| Familienakte | Der Reiniger soll **später in die Familienakte** eingebunden werden. Er ist der Weg, auf dem Dokumente gereinigt an eine KI gehen. Diese Voraussetzung gilt von Anfang an |

## Was die App tut

1. **Einwerfen:** Ein ZIP oder ein Ordner kommt hinein und wird im Speicher entpackt. Nichts
   wird ausgeführt.
2. **Inventur:** Jede Datei wird aufgelistet. Sofort markiert werden `.git` (dort steckt die
   ganze Geschichte), `.env`, Sicherungen, Datenbanken und Datenexporte, Fotos, PDFs und
   Office-Dateien. `node_modules` und Build-Ordner werden gar nicht erst gelesen.
3. **Suchen, in drei Schichten:**
   - **Harte Angaben:** Namen, Mail, Telefon, IBAN, Datum, Schlüssel und Passwörter.
     Vorhanden sind dafür Modul 25 und `suggestNames`.
   - **Metadaten:** GPS in Fotos, Verfasser in PDF und Office, `author` in package.json,
     Copyright, Impressum, Benutzernamen in Pfaden, Git-Namen. Vorhanden in `pruefer-anhang.js`
     und `pruefer-formate.js`.
   - **Gefühlte Metadaten** (das ist neu): Angaben, die nur zusammen etwas verraten. Gemeint
     sind Orte („Hamburg“), Uni, Arbeitgeber, Straße und PLZ, Kfz-Kennzeichen, Namen der Kinder,
     Namen auf Knöpfen, in Testdaten und in Kommentaren, Rechnernamen und Ordnerpfade. Gefunden
     werden sie über Wortlisten (Städte, Hochschulen, Firmenformen) und über seltene Eigennamen.
     Ein echtes Beispiel aus der Familienakte, Datei `app/local-vault.ts`, Zeile 160: ein fester
     Windows-Pfad `G:\01GPT-SOFTWARE\…\SOFTWARE TESTORDNER`. Er verrät den Rechner und die
     Arbeitsweise des Freundes.
4. **Anzeigen und entscheiden:** Gleiche Funde stehen gebündelt da, etwa „Hamburg, 14×“.
   Klaus entscheidet einmal für alle diese Stellen:
   - **Entfernen** (Marke statt Wert)
   - **Musterwert**
   - **eigener Wert**
   - **bewusst behalten**
5. **Dokumente ersetzen:** Fremde PDFs, Fotos und Office-Dateien werden nicht übernommen. An
   ihre Stelle kommt ein **neu gezeichnetes Blatt** in gleicher Größe und mit gleichem Namen.
   Wo vorher ein Name stand, sitzt ein grauer Kasten mit Etikett, etwa „Name entfernt“. Dazu
   kommt eine **Mustermappe** mit leeren Vorlagen und erfundenen Beispielen.
6. **Ausgabe:**
   - die **saubere Kopie ohne `.git`**, damit die eigene Geschichte bei null beginnt;
   - der **Stellenplan**;
   - ein Bericht, der nur sagt, *was* entfernt wurde, und keine Werte nennt;
   - eine **Nachprüfung**: das Ergebnis wird noch einmal ganz durchsucht, und was offen bleibt,
     wird laut genannt.

### Wie eine entfernte Stelle aussieht

| Wo | Darstellung |
|---|---|
| Texte, Doku, Impressum | Marke mit Art und Nummer: `⟦NAME-1⟧`, `⟦ORT-2⟧`. Ein gleicher Wert bekommt eine gleiche Nummer |
| Code (Knöpfe, Variablen) | ein Musterwert („Musterstadt“), damit das Programm weiterläuft. Die Stelle steht im Stellenplan |
| PDF, Foto, Office | ein neu gezeichnetes Blatt mit grauem Kasten und Etikett |

**Nicht schwärzen.** Ein schwarzer Balken verrät die Länge des Wortes, und in einer PDF bleibt
der Text unter dem Balken oft lesbar. Deshalb wird das Blatt neu gezeichnet, wie die „Sichere
Fassung“ im Sende-Prüfer.

### Was der Stellenplan ist

Man kann ihn sich vorstellen wie einen **Sitzplan im Theater, auf dem nur steht, dass ein Platz
belegt war, aber nicht, von wem**. Er ist eine Liste:

```
impressum.html          Zeile 8    ⟦NAME-1⟧   Art: Name
impressum.html          Zeile 9    ⟦ORT-1⟧    Art: Adresse
app/start.tsx           Zeile 40   Musterstadt (war: Ort)
dokumente/vertrag.pdf   Seite 1    Kasten oben links   Art: Name
```

Mit diesem Plan können Klaus oder eine lokale KI später **die eigenen Angaben** an genau diese
Stellen setzen. Die Daten des Freundes braucht man dafür nicht. Der Stellenplan enthält keine
Werte und darf deshalb mit der sauberen Kopie gehen.

### Der Tresor

- Er ist **eine verschlüsselte Datei** und sieht in der App wie ein Ordner aus.
- Darin liegen auf Wunsch die Originaldateien und die Zuordnung, also welche Marke für welchen
  Wert steht.
- Das Schloss ist `assets/schluesseltresor.js`, byte-1:1 aus kim-hub-company (AES-256-GCM,
  PBKDF2 600 000 Runden), dasselbe wie im Sende-Prüfer. Fürs Erste reicht ein einfaches
  Passwort. Später kommt ein Ersatzschlüssel dazu, aufgeteilt in 5 Teile, von denen 3 genügen,
  wie in Private Brain Pro.
- Der Tresor wird sofort nach dem Lesen verschlossen. Eine offene Kopie wird nie abgelegt.
- Er hat ein **Ablaufdatum**, Vorschlag 30 Tage. Danach erinnert die App: löschen oder an den
  Absender zurückgeben. Es sind fremde Daten.
- Zum **Zurückbauen** gibt es drei Wege: ein Original nur ansehen, einzelne Stellen
  zurückholen (z. B. das Impressum) oder alle Marken mit **eigenen** Werten füllen.
- ⚠ Ein kurzes Passwort lässt sich durchprobieren, wenn jemand die Datei bekommt. Das steht
  sichtbar am Feld.

### Gäste-Sperre

Ein Knopf, immer sichtbar, schließt die App sofort:

- Anzeige weg, alles Offene aus dem Speicher.
- Wieder öffnen nur mit dem Code, über dasselbe Schloss.
- Bei falschen Versuchen wächst die Wartezeit.
- Beim Bau prüfen, wie BookLedgerPro das macht, und es von dort übernehmen. Nichts neu
  erfinden.

## Darstellung: immer Vollbild (Klaus 2026-10-28)

Klaus: *„Achte bitte darauf, immer Vollbild zu machen. Auch beim Handy gedreht, keine
abgeschnittenen Texte oder Zeilenumbrüche … gesamter Browser, Desktop oder Desktop-Ansicht.“*

- **Die App füllt jedes Fenster ganz aus:** Browser, installierte App, Desktop, Handy hoch und
  quer, Tablet. `100dvh`, keine Höchstbreite, auch keine Lesebreite (wie der Sende-Prüfer,
  Klaus 2026-09-29). `manifest.json` bekommt `display: standalone`, nicht `fullscreen`, damit
  die Fensterknöpfe bleiben.
- **Nichts abgeschnitten, nichts läuft quer:** kein Text mit `…`, der seinen Inhalt verschluckt.
  Kein Knopf, dessen Wort mitten im Wort umbricht. Kein waagerechtes Scrollen der Seite.
- **Gemessen, nicht angenommen.** Eine Probe im echten Browser prüft das bei 320, 360, 412,
  768 und 1280 px Breite, dazu das Handy quer (z. B. 740 × 360) und Desktop 1920 × 1080:
  - die Seite ist nicht breiter als das Fenster;
  - kein Element ragt über seinen Kasten hinaus;
  - keine Beschriftung ist abgeschnitten (`scrollWidth > clientWidth`);
  - die App füllt die Höhe.
  Dazu kommt eine Gegenprobe: eine eingebaute zu breite Zeile muss rot werden.
- Das gilt für **jede** Stufe, nicht erst am Ende.

## Auch einzelne Dateien (Klaus 2026-10-28)

Nicht nur ZIP und Ordner: Auch **einzelne Dateien** lassen sich prüfen und reinigen, zum
Beispiel PDF, Word, Excel, Foto, Text oder eine `.eml`. Dafür gibt es denselben Weg mit
Inventur, Befunden, Entscheiden, sauberer Fassung und Stellenplan. Die Prüfkerne dafür gibt es
schon im Auslieferungsprüfer (Eingang „Foto · Datei prüfen“).

## Jeder Dateityp (Klaus 2026-10-28)

Klaus: *„Es soll jeder Dateityp gereinigt werden können. Auch eine Corel-Datei … auch SVG, auch
PNG … da werden aus den Bilddaten Sachen rausgereinigt. Ich weiß nicht, ob das funktioniert.“*

**Prüfen geht bei jeder Datei. Wie weit Reinigen geht, hängt von der Dateiart ab.** Jede
Datei bekommt eine der drei Stufen, und die App sagt sichtbar, welche:

| Stufe | Dateiarten | was geht |
|---|---|---|
| **1 · voll reinigen** | Text, Code, HTML, JSON, CSV, Markdown, SVG, `.eml` | jede Stelle einzeln ersetzen oder entfernen |
| **2 · neu bauen** | PNG, JPEG, WebP, GIF, PDF, Word, Excel, PowerPoint, ODT | die Datei wird neu erzeugt, ohne Metadaten, und mit grauen Kästen an den gefundenen Stellen |
| **3 · nur prüfen** | Corel (`.cdr`), Photoshop, Datenbanken, Programme und alle unbekannten Formate | Texte und Metadaten werden gefunden und angezeigt; reinigen heißt hier: **entfernen** oder durch eine Datei aus der Mustermappe **ersetzen** |

**PNG und andere Bilder:**
- ✅ **Metadaten** (EXIF, GPS, Textfelder, Herkunftsnachweis) gehen beim Neuzeichnen weg.
- ✅ **Sichtbarer Text im Bild** (z. B. ein Name auf einem Foto) wird mit der Texterkennung auf
  dem Gerät gefunden und mit einem grauen Kasten zugedeckt. Das ist Tesseract, das schon im
  Auslieferungsprüfer steckt.
- ✅ **Versteckte Botschaften in den untersten Bits** überleben ein Neuzeichnen als PNG
  (gemessen im Sende-Prüfer). Dagegen hilft ein leichtes Rauschen über die untersten Bits oder
  das Speichern als JPEG. Die App macht das beim Neubau immer.
- ⚠ Gesichter, Hausnummern oder Kennzeichen **ohne Schrift** findet die Texterkennung nicht.
  Dafür gibt es einen Pinsel zum Abdecken von Hand.

**Corel (`.cdr`):** Neuere CDR-Dateien sind innen ein ZIP-Archiv. Darin lassen sich Texte,
Vorschaubild und Metadaten lesen. Zurückschreiben in Corels eigenes Format ist nicht
zuverlässig möglich. Deshalb gilt Stufe 3: anzeigen, was drin ist, dann entfernen oder
ersetzen. Der saubere Weg ist, die Grafik in Corel als SVG oder PDF zu speichern; die werden
dann voll gereinigt.

**Unbekannte Formate:** Die App liest lesbare Zeichenketten heraus (UTF-8 und UTF-16) und
prüft sie wie Text. Reinigen heißt hier immer entfernen oder ersetzen. Ein Wort einfach in den
Bytes zu überschreiben, kann die Datei zerstören.

## Aussehen: Familie (Klaus 2026-10-28)

Klaus: *„Die Farbe soll angepasst sein an … Familienakte, damit man weiß, es ist eine Familie.
Und das Icon so einfach wie das Familien-Icon, aber mit einem Cleaner-Zeichen.“*

- **Farben aus der Familienakte** (`app/globals.css` dort):
  - Navy `#0b3154` und `#164f7d`
  - Schrift `#15283a`
  - Grund `#f2f7fa`, Papier `#ffffff`
  - Petrol `#087f7a`
  - die Kacheln des Icons `#0C79D8`, `#2E9EFF`, `#68C4FF`
  - `theme_color` `#0b3154`
  - Kopfbereich als Verlauf Navy → `#124e7f` → `#0d7775`
- **Icon:** dieselben vier abgerundeten Kacheln wie im Familien-Icon, dazu ein Zeichen fürs
  Reinigen. Klaus' Richtung: der Grund halb dunkelblau, halb weiß, oder ein Verlauf von dunkel
  nach hell. Drei grobe Entwürfe wurden Klaus am 2026-10-28 gezeigt:
  - **A:** Kacheln in einem Kreispfeil, Grund halb Navy, halb Weiß
  - **B:** Kacheln in einem weißen Kreispfeil, Grund im Verlauf von Navy nach Hell
  - **C:** Verlauf, eine Kachel wird weiß mit Haken („ein Feld wird sauber“)

  ⚠ **Abgelöst am selben Abend (Klaus 2026-10-28):** *„Den hier kannst du verwenden … besser für das
  Favicon und für das Logo. Für das Icon.“* — ein **Kristall**, durch den Licht fällt (Splitter fliegen ab,
  heraus kommt ein klarer Strahl), Grund dunkelblau. Er ist jetzt App-Icon, Favicon und Logo; auf **leeren
  Flächen** steht er groß mit **„CLEANER“ in großer weißer Schrift** darunter (Klaus: *„in großen weißen
  Schriften drunter Cleaner“*). Quelle `icons/kristall-quelle.png`, alle Größen baut `tools/icons-bauen.mjs`.
  Das Favicon zeigt einen Ausschnitt (nur der Kristall), damit er klein erkennbar bleibt. Die Probe misst,
  dass die Icons aus der aktuellen Quelle gebaut sind. Der Rest dieses Abschnitts ist Geschichte.

  Klaus wählte zuerst A (2026-10-28), mit größerem Innenteil, damit es auch als Favicon und auf kleinen
  Bildschirmen erkennbar bleibt. Der Entwurf liegt unter `docs/projekt-reiniger/icon-entwurf-a.svg`,
  die Vorschau in fünf Größen unter `icon-entwurf-a-groessen.png`:
  - Der Kreispfeil ist dick, fast bis zum Rand.
  - Er ist zweifarbig: hellblau auf der dunklen Hälfte, navy auf der weißen.
  - Die Pfeilspitze ist gefüllt.
  - Die Kacheln sind groß.

  Als Favicon und am Handy prüfen. Die Größen für App, Android und Windows werden aus der SVG
  gebaut, nie von Hand.

## Sicherheit und Plattform

- **Browser-App ist tragbar.** Fremder Inhalt wird nur gelesen und nie ausgeführt. Der Browser
  ist ein geschlossener Kasten.
- **Kein Netz.** Die Seite trägt `connect-src 'none'`. Ins Netz geht nichts, auch nicht aus
  Versehen.
- **Nichts offen gespeichert.** Die Daten liegen nur im Arbeitsspeicher. Im Gerät gespeichert
  wird höchstens der verschlüsselte Tresor.
- **Eigene Adresse empfohlen**, z. B. eine Unterdomain von family-projekt.de. Auf
  `lausiklauskn-png.github.io` teilen sich alle Apps einen Speicher. Bis das steht, speichert
  die App nichts, und der Tresor geht nur als Download hinaus.
- **Größe:** Ein normales Repo (einige MB bis ein paar hundert MB) schafft der Browser.
  Entpackt wird Datei für Datei. Die Texterkennung in Bildern läuft nur auf Knopfdruck.
  ⚠ Die Grenze am Tablet ist nicht gemessen.
- APK und Windows nutzen denselben Code in einer Hülle, wie bei Private Brain Pro.

## Git-Wächter

(Plan von 2026-10-28; gebaut: Abschnitt „Stufe 7 · gebaut“ unten.)

Derselbe Suchkern läuft auch **vor jedem Commit** und als GitHub-Prüfung in Klaus' Repos.

- Dazu gehört eine **Sperrliste** mit bekannten fremden Werten. Sie wird nur als Fingerabdruck
  (SHA-256) gespeichert, nie im Klartext. Taucht einer davon auf, wird der Commit angehalten.
- Eine Tresor-Datei wird immer angehalten.
- GitHub selbst hält nur Schlüssel auf, keine Namen und keine Orte.

## Voraussetzung für die Familienakte (gilt ab dem ersten Bau)

Damit der Reiniger später ohne Umbau in die Familienakte passt:

1. **Ein Kern ohne Oberfläche:** `reiniger-kern.js`, ein ES-Modul in reinem JavaScript, mit
   `reiniger-kern.d.ts` für TypeScript. Die Familienakte ist Vite + React + TypeScript. Der
   Kern wird byte-1:1 hinüberkopiert und per SHA-256 gepinnt, wie die anderen Prüfkerne.
2. **Feste Schnittstelle** (vorläufig, Namen beim Bau festlegen):
   ```
   pruefe(dateien)                    → { befunde, inventur }
   reinige(dateien, entscheidungen)   → { sauber, stellenplan, zuordnung }
   verschliesse(zuordnung, originale, code) → tresorDatei
   oeffne(tresorDatei, code)          → { zuordnung, originale }
   fuelle(sauber, stellenplan, werte) → dateien
   sperrlisteBauen(werte)             → { liste }        (Stufe 7, gebaut)
   waechterPruefe(dateien, { sperrliste }) → { halt, hinweise }
   ```
   `dateien` ist eine Liste aus `{ pfad, bytes }`. Der Kern kennt weder das DOM noch IndexedDB
   noch das Netz.
3. **Datenfluss in der Familienakte** (passt zu Paket C in deren `docs/ANALYSE_AUFTRAG.md`):
   Dokument → `pruefe`/`reinige` → KI (nur die saubere Fassung) → Prüfung der Antwort →
   `fuelle` mit der Zuordnung → Datentresor der Familienakte.
4. **Kein zweites Schloss:** Die Familienakte nutzt für Reiniger-Tresor und Gäste-Sperre
   dasselbe `schluesseltresor.js`.

## ⚠ Fund in Meine-Familienakte (2026-10-28, nur gelesen, nichts geändert)

`docs/ANALYSE_AUFTRAG.md` sagt: Die **ursprüngliche App des Freundes liegt unverändert auf dem
Branch `claude/analyze-zip-app-overview-v09o9j`**. Derselbe Stand ist der Kopf von PR #1
(`refs/pull/1/head`).

Der Inhalt dieses Branches ist in dieser Sitzung **nicht** gelesen worden. Steckt darin noch die
ungereinigte ZIP, gilt:

- Die fremden Daten liegen in Klaus' GitHub. Das Repo ist privat, die Daten sind trotzdem dort.
- Den Branch zu löschen reicht nicht. `refs/pull/1/head` bleibt bestehen, solange PR #1
  existiert. Ganz weg bekommt man solche Stände nur über den GitHub-Support.
- Das ist der **erste echte Prüffall** für den Projekt-Reiniger.

**Stand (Klaus 2026-10-28):**
- Klaus prüft den Branch selbst und löscht die ZIP selbst, falls sie dort liegt.
- Der Antrag bei GitHub, die betroffenen Commits vollständig zu löschen, ist gestellt.
- Diese und künftige Sitzungen öffnen, lesen und veröffentlichen den Inhalt **nicht**. Er wird
  auch nicht in eine Sitzung geholt.
- Zum Schluss wird gemeinsam getestet, ob nichts mehr da ist. Das macht der Projekt-Reiniger,
  nicht ein Mensch, der hineinschaut.

## Stufen

| Stufe | Inhalt |
|---|---|
| 1 ✅ | Einwerfen, Inventur, harte Angaben und Metadaten, Anzeige (nur lesen) — gebaut 2026-10-28 |
| 2 ✅ | Entscheiden, Marken und Musterwerte, saubere Kopie, Stellenplan, Nachprüfung — gebaut 2026-10-28 |
| 3 ✅ | Gefühlte Metadaten (Wortlisten, Eigennamen, Pfade) — gebaut 2026-10-28 (vor Stufe 2, nur lesen) |
| 4 ✅ | Neu gezeichnete Blätter, Mustermappe — gebaut 2026-10-29 |
| 5 ✅ | Tresor und Gäste-Sperre — gebaut 2026-10-29 (Ersatzschlüssel 3 aus 5 noch offen) |
| 6 ✅ | Zurückbauen, mit eigenen Werten füllen — gebaut 2026-10-29 (Kästen in neu gezeichneten PDF/Bildern noch nicht füllbar) |
| 7 ✅ | Git-Wächter und Sperrliste — gebaut 2026-10-29 (eingerichtet in Klaus' Repos: noch nicht; Klaus entscheidet je Repo) |
| 8 (Test) | APK, danach Windows — **Testfassungen** gebaut 2026-10-29 (Debug-APK, Windows unsigniert); eigener Schlüssel, Signatur, Updates offen |
| 9 | Einbau in die Familienakte |

Abschlussbriefe: [Stufe 4 und Testfassungen](BRIEF_ABSCHLUSS_2026-10-29_stufe-4-und-testfassungen.md) ·
[Befund und Stufe 5](BRIEF_ABSCHLUSS_2026-10-29_befund-und-stufe-5.md) · [Befund 9 und Stufe 6](BRIEF_ABSCHLUSS_2026-10-29_befund-9-und-stufe-6.md) ·
[Stufe 7](BRIEF_ABSCHLUSS_2026-10-29_stufe-7.md) ·
Forschung: [Stufe 4](FORSCHUNG_2026-10-29_stufe-4.md) · [Stufe 5](FORSCHUNG_2026-10-29_stufe-5.md) · [Stufe 6](FORSCHUNG_2026-10-29_stufe-6.md) · [Stufe 7](FORSCHUNG_2026-10-29_stufe-7.md).

## Am Ende jeder Sitzung: Kurzauftrag zum Kopieren (Klaus 2026-10-28)

Jede Sitzung gibt **zum Schluss** einen kurzen Auftrag für die nächste Sitzung aus, als
Copy-Paste-Block, damit er wenig Tokens kostet. Er nennt nur das Repo, den Branch, den Pfad des
Briefs und den nächsten Schritt; alles andere steht im Brief. Muster:

```
Repo lausiklauskn-png/<repo>. Lies <pfad/zum/BRIEF>.md
(und die CLAUDE.md) und setze den nächsten offenen Schritt um: <Stufe/Schritt>.
Am Ende: Brief nachziehen und wieder so einen Kurzauftrag ausgeben.
```

## Stufe 1 · gebaut (2026-10-28)

- **Kern** `assets/reiniger-kern.js` + `reiniger-kern.d.ts`: `einwerfen(liste)`, `zipDateien(bytes)`,
  `einordnen(pfad, art)`, `pruefe(dateien) → { inventur, befunde, buendel, hinweise, zahlen }`, `buendeln`.
  Die übrigen Funktionen der Schnittstelle (`reinige`, `verschliesse`, `oeffne`, `fuelle`) kommen mit ihren Stufen.
  Kein DOM, keine IndexedDB, kein Netz — eine Probe liest den Quelltext darauf.
- **Einwerfen:** ZIP (eigener Leser, ZIP64, jede Datei erst auf Abruf entpackt, Deckel gegen Zip-Bomben),
  Ordner (Auswahl oder Ziehen), einzelne Dateien, Beispielprojekt. Ein ZIP im Projekt blieb in Stufe 1 eine Datei (seit 2026-10-28 geöffnet, siehe unten).
- **Inventur:** jede Datei mit Größe, Art (am Dateikopf), Reinigungsstufe 1/2/3 und Marken: Git, Umgebung,
  Sicherung, Datenbank, Export, Foto, PDF, Office, Schlüsseldatei, Impressum, Archiv, Programm.
  `node_modules`, `dist`, `build`, `.next` … stehen als „nicht gelesen“ da und werden nie entpackt.
- **Harte Angaben** über Modul 25: Schlüssel/Passwort, Mail, IBAN, Telefon, Datum; Namen nur als
  **Vorschlag** (`suggestNames`). Beträge und Rechnungsnummern bewusst nicht (nicht im Brief, viel Rauschen in Code).
- **Metadaten:** `author`/`contributors` in package.json, Copyright-Vermerke, Benutzernamen in Pfaden
  (`C:\Users\…`, `/home/…`, `/Users/…`), Git-Namen und -Adressen aus `.git/config`, Logs und **losen
  Git-Objekten** (die werden entpackt — dort steht die alte Geschichte, auch alte Dateiinhalte). Bilder,
  PDF (Seitentext über pdf.js) und Office über `pruefer-anhang.js`. Git-Pakete (`.pack`) heißen ungeprüft.
- **Unbekannte Formate:** lesbare Zeichenketten (UTF-8, UTF-16LE) werden herausgezogen und geprüft; die
  Datei heißt trotzdem „ungeprüft“ für den Rest.
- **Anzeige:** Funde gebündelt („6× in 5 Dateien“), in drei Gruppen (harte Angaben, Metadaten, Auffälliges),
  Stellen aufklappbar. Inventur mit Schalter „nur Auffälliges“. Am Handy zwei Reiter.
- **Proben:** `npm test` 84 grün · 0 ROT, darunter Vollbild bei 7 Größen × 3 Zuständen, 0 Anfragen nach außen,
  ein PDF mit Verfasser und Mail. `npm run gegenprobe` 12 gefangen · 0 blind (erster Lauf).
- ⚠ **Nicht gemessen:** echtes Handy/Tablet, große Repos, echte Fotos und Office-Dateien, Ziehen mit der Maus.
  `file://` geht nicht (der Kern ist ein ES-Modul) — die App braucht eine Adresse (GitHub Pages).
- ⚠ **GitHub Pages ist noch nicht eingeschaltet** (Einstellungen → Pages → Branch `main`, Ordner `/`).

## Stufe 3 · gebaut (2026-10-28)

- **Wortlisten** in `assets/reiniger-listen.js` (reine Daten, ES-Modul). Der Kern importiert sie; **beide Dateien
  wandern zusammen** in die Familienakte und werden dort beide gepinnt. Neu im Kern: `gefuehlt(text, { modus })`,
  `SORTEN_GEFUEHLT`, eine vierte Schicht `gefuehlt` (in der Anzeige „Gefühlte Metadaten“, blau, zwischen Metadaten
  und Auffälligem).
- **Was gefunden wird** (jeder Fund ist ein Hinweis, kein Beweis):
  | Art | wie |
  |---|---|
  | `ORT` | ~250 Städte (D ab ~40 000 Einw., A, CH, L, Südtirol) und ~80 Stadtteile. Wörter mit zweiter Bedeutung („Essen“, „Halle“, „Siegen“, „Zug“, „Worms“) nur mit „in/aus/nach/bei …“ oder PLZ davor. Zeitzonen (`Europe/Berlin`) zählen nicht |
  | `HOCHSCHULE` | Kürzel (RWTH, LMU, TUM, ETH Zürich …), „Universität/Hochschule/Uni/… + Name“, auch Schulen und Kitas („Grundschule am …“), Hochschul-Adressen (`uni-hamburg.de`). „TU/FH/HS/PH“ nur mit Ort danach |
  | `FIRMA` | Name + Rechtsform (GmbH, GmbH & Co. KG, UG, AG, e.V., Ltd., Inc., LLC …). Große bekannte Firmen aus Lizenzen (Google LLC, Microsoft …) zählen nicht |
  | `ADRESSE`, `PLZ-ORT` | Straße mit eindeutiger Endung (-straße, -weg, -allee, -platz …) + Hausnummer; PLZ + Ort nur, wenn der Ort in der Liste steht, eine Straße kurz davor steht oder `D-`/`A-`/`CH-` davor |
  | `KFZ` | `HH-AB 1234` / `HH AB 1234` mit einem Unterscheidungszeichen aus der Liste (~350) |
  | `EIGENNAME` | Vornamen aus einer Liste (~290): als Paar mit Nachnamen überall, allein nur auf einem Knopf / in Testdaten (`"Lena"`, `>Lena<`) oder im Dateinamen. Immer **Vorschlag**. „Jan“, „Max“, „Leo“ … nur als Paar. Was schon als Name/Verfasser/Git-Name dasteht, kommt nicht doppelt |
  | `RECHNER` | `DESKTOP-…`/`LAPTOP-…`, „Erikas-MacBook-Pro“, `*.fritz.box`, `nutzer@rechner:~$`, Netzlaufwerke `\\server\freigabe`, `COMPUTERNAME=` |
  | `ORDNERPFAD` | feste Windows-Pfade (`G:\…\SOFTWARE TESTORDNER`, auch mit Leerzeichen und als `\\` im Code), `/Volumes/…`, `/media/…`, `/mnt/c/…`, Cloud-Ordner (`OneDrive - Firma`, `Dropbox (Firma)`). `C:\Windows`, `C:\Program Files` und `C:\Users\…` (das ist schon „Benutzername im Pfad“) nicht |
- **Datei- und Ordnernamen** werden mit geprüft („fotos/Hamburg-2019/“, „Lena.jpg“), jeder Ordner nur einmal.
- Gesucht wird in Text und Code, im Text aus PDF/Office, in losen Git-Objekten und in den Zeichenketten unbekannter Dateien.
- **Musterwerte** („Musterstraße 1“, „Musterstadt“) zählen nie — sonst meldet die Nachprüfung in Stufe 2 die eigenen Ersatzwerte.
- **Rauschen gemessen:** über 112 MB fremden JavaScript-Code (npm, yarn, TypeScript, Prettier …) bleiben außer echten
  Namen aus Lizenzen/CHANGELOGs nur ~10 Funde; im eigenen Code 0. Eine Probe mit elf Fallen-Zeilen (Zeitzone, „nach dem
  Essen“, Java SE, `A-Z 0-9`, `["Jan", …]`, `C:\Windows`, `git@github.com:` …) muss leer bleiben.
- **Proben:** `npm test` 100 grün · 0 ROT; `npm run gegenprobe` 19 gefangen · 0 blind (7 neue Fälle: Liste, Zeitzone,
  „Essen“-Regel, Ordnerpfad, Ordnernamen, Doppelte, Gruppe in der Anzeige).
- ⚠ **Nicht gemessen:** echte fremde Projekte mit deutschem Text (Rauschen dort unbekannt; deutsche Hauptwörter nach einem
  Vornamen ergeben falsche Paare wie „Lena Geburtstag“ — deshalb nur Vorschlag). **Die Listen sind nicht vollständig:**
  kleine Orte, seltene Vornamen, Nachnamen ohne Vornamen, Firmen ohne Rechtsform, Kennzeichen kleiner Kreise, Österreich-
  und Schweiz-Kennzeichen werden nicht gefunden. Klaus' Blick bleibt Pflicht.

## Stufe 2 · gebaut (2026-10-28)

Klaus (2026-10-28, nach dem ersten Test mit der Stufe-1-Fassung): *„Ich kann noch nichts anklicken … nirgendwo hinspringen
… nichts ändern … alles ausklappen und wieder einklappen … Originaldatei anzeigen und an die Stelle springen … Namen separat
benennen, wenn welche nicht erkannt werden … so klein wie möglich: klicken, auslesen, Ergebnisse melden, ersetzen oder
löschen, und wieder zurück.“* Vorbild: der Auslieferungsprüfer (Zeile unter jeder Stelle). Dessen `pruefer-ui.js` hängt an
seiner eigenen Seite und wurde **nicht** kopiert; übernommen ist die Idee.

- **Kern** (neu): `reinige(dateien, { ergebnis, wahl, uebernehmen })`, `nachpruefe(gereinigt)`, `saubereKopie(…)` (alles in
  einem: reinigen, nachprüfen, Stellenplan + Bericht beilegen, ZIP bauen), `zipBauen`, `stellenplanText`, `berichtText`,
  `dateiPlan`, `reinigbar`, `ersetzbar`, `buendelSchluessel`, `istDoku`, `WEGE`. `pruefe(…, { begriffe })` für selbst
  eingetragene Namen (Art `BEGRIFF`, Schicht hart, ohne Groß/klein, auch in Datei- und Ordnernamen).
- **Entscheiden** je Bündel, einmal für alle Stellen: Automatisch (Vorgabe) · Entfernen (Marke) · Musterwert · Eigener
  Wert · Behalten. *Automatisch* = Marke `⟦ORT-1⟧` in Doku (`.md`, `.txt`, README …), Musterwert im Code (damit das
  Programm weiterläuft). Gleicher Wert = gleiche Nummer. Ersetzt wird **jede** Stelle mit dem Wert in allen Textdateien,
  nicht nur die gefundenen; Wortgrenzen beachtet; `\\` in Code-Zeichenketten mitbedacht. Datei- und Ordnernamen werden
  mit umbenannt (dort Musterwert bzw. `ORT-1` ohne Klammern).
- **`.env`**: dort wird **jeder** Wert ersetzt (`MUSTER-WERT`), auch der, den die Suche nicht erkannt hat (Fund bei der
  Probe: `DB_PASSWORD=…` blieb sonst stehen).
- **Saubere Kopie**: ZIP ohne `.git`, ohne `node_modules`/Build-Ordner (Bericht sagt „neu installieren“), fester
  Zeitstempel 01.01.2000 (verrät nichts). Bilder, PDF, Office, Datenbanken, Ungeprüftes bleiben **weg** (Stufe 4 zeichnet
  sie neu); einzeln oder alle anhakbar „unverändert übernehmen“ — dann steht im Bericht „NICHT gereinigt“.
- **Stellenplan** (`REINIGER-STELLENPLAN.txt` + `.json`) und **Bericht** (`REINIGER-BERICHT.txt`) liegen im ZIP und
  nennen keine Werte. Die **Zuordnung** (Marke → Original) bleibt nur im Speicher und verschwindet mit „↺ Neu“ (Tresor: Stufe 5).
- **Nachprüfung**: die Kopie wird noch einmal ganz mit `pruefe` durchsucht (eigene Ersatzwerte zählen nicht), und
  **jeder entfernte Originalwert wird in jeder Datei gesucht**, auch in Stellenplan und Bericht. Ergebnis steht laut da:
  „Originalwerte in der Kopie: 0 · neue Funde: 0“ oder gelb mit Dateien.
- **Oberfläche**: oben „Geprüft: 📦 name.zip“; Gruppen auf-/zuklappbar, „▾ Alle auf / ▸ Alle zu“; unter jeder Stelle die
  Zeile mit dem Fund gelb; **Stelle oder Datei antippen** → Datei im ganzen Fenster, an der Zeile, umschaltbar
  **Original / Saubere Kopie**, „← Zurück“ (auch Esc); Feld „Fehlender Name … ＋ Suchen“; nach dem Reinigen
  „⬇ Saubere Kopie (ZIP)“, „↗ Teilen“ (wo das Gerät Dateien teilen kann, z. B. Android), „⬇ Stellenplan“, „⬇ Bericht“.
  Kopf-Plakette jetzt „Lokal“ statt „Nur lesen“.
- **Benennung (Klaus 2026-10-28):** die Gruppe „Harte Angaben“ heißt in der Oberfläche **„Personenbezogene Angaben“**
  (intern weiter `hart`). Knöpfe flach wie in Private Brain Pro: sichtbar ~28 px, normale Schrift, Tippfläche unsichtbar
  7 px größer.
- **Symbole (Klaus 2026-10-28):** keine Emoji mehr in der Oberfläche, nur Strich-Symbole (eigene SVG-Pfade im 24er-Raster,
  Farbe = Schrift). Eine Probe sucht Emoji im sichtbaren Text (fremde Werte und Dateiinhalte ausgenommen).
- **Proben:** `npm test` 149 grün · 0 ROT, darunter: kein Originalwert des Beispielprojekts in ZIP/Plan/Bericht, Download im
  Browser öffnet sich wieder, Ansicht springt auf Zeile 5 und zeigt nach dem Umschalten `⟦KFZ-1⟧`, Vollbild auch für
  „Kopie“ und „Ansicht“ in allen 7 Größen. `npm run gegenprobe` 27 gefangen · 0 blind (8 neue Fälle: Ersetzen, .git, .env-Rest, Behalten, Wert im Stellenplan, Nachprüfung, Sprung, eigener Name).
- ⚠ **Nicht gemessen:** große Repos beim Reinigen (alles liegt im Speicher, das ZIP auch), echtes Handy beim Teilen,
  ein echtes fremdes ZIP. Ersetzt wird nur, was gefunden **oder selbst eingetragen** wurde — die Nachprüfung kann nur
  bekannte Werte suchen. Datum-Funde sind in Doku sehr häufig (Klaus' Test: 59 harte Angaben, fast alles Datum) —
  dort ggf. „Behalten“ wählen.

## Prüfungen aus Workflow PDF / Auslieferungsprüfer, Archive, Apps (2026-10-28)

Klaus: *„… mindestens so eine Prüfung wie bei Workflow PDF … schädliche Anweisungen … Bilderkennung … PDF-Befehlerkennung
… Virenscanner … alles, was nützlich ist, aus dem Auslieferungsprüfer … ZIP, HTML, RAR, auch Apps … APK … ohne weitere
Gegenfragen.“*

- **Befund Workflow PDF Pro:** dessen Prüfkerne sind **dieselben Dateien** wie hier (`pruefer-anhang.js`, `-formate.js`,
  `-mail.js`, `vendor/pdfjs`, SHA gleich). Einen **Virenscanner gibt es dort nicht** (im Code: „KEIN VIRENSCANNER“) — hier
  auch nicht; die App sagt das in der Gruppe „Auffälliges“.
- **Neu angeschlossen:**
  - **Anweisungen an eine KI in Text und Code** (`.md`, `.txt`, `.js` … — vorher nur in PDF/Bild/Office): dieselbe Liste
    (`PrueferMail.pruefeMail`, Arten KI-ANWEISUNG, KI-BEGRIFF, UNSICHTBARE-ZEICHEN, VERSTECKTER-TEXT), mit **echter Zeile**,
    auch im alten Stand in `.git` und in Zeichenketten unbekannter Dateien. Direkt, nicht über `PrueferAnhang.pruefe` — der
    hielte jede `.js` für „getarnt“. Erste 2 MB je Datei.
  - **HTML** zusätzlich durch den HTML-Prüfer des Auslieferungsprüfers (`pruefer.js` über `PrueferAnhang`): fremde Adressen.
  - **Pixelprüfung** (`verdachtPruefen`): Text in den untersten Bits von PNG/verlustfreiem WebP, auch als KI-Anweisung. Nur im Browser.
  - **Texterkennung** (Tesseract.js 7.0.0 + deu/eng/rus, `vendor/tesseract/`, 21 MB, **byte-1:1 aus Workflow PDF Pro**,
    SHA-gepinnt): **nur auf Knopfdruck** „Text in Bildern lesen (n)“. Liest Text in Bildern und gescannten PDF-Seiten und
    liest den PDF-Text gegen das Seitenbild (findet weiße/unsichtbare Schrift: PDF-VERSTECKTER-TEXT). **CSP bleibt
    `connect-src 'none'`**: der Worker startet aus seiner Datei (`workerBlobURL: false`, Hülle um `Tesseract.createWorker`
    in `app.js`) und holt seine Sprachdaten selbst vom eigenen Server. Nicht im Offline-Vorrat (zu groß).
  - **„Zeile entfernen“** für auffällige Funde in Textdateien (Vorgabe: nur melden). Zeilenzahl bleibt; Doku bekommt
    `⟦ENTFERNT: …⟧`, Code eine leere Zeile.
- **Archive im Projekt** werden geöffnet und mitgeprüft, bis 3 Ebenen, Deckel 20 000 Dateien / 1 GB: ZIP, **APK**, AAB, AAR,
  JAR, WAR, IPA, XPI, CRX, EPUB, CDR (Corel, innen ZIP), NUPKG, WHL, VSIX, APPX/MSIX, **TAR, TGZ, GZ**. `node_modules` darin
  wird nicht gelesen. Ihr Inhalt geht nicht einzeln in die saubere Kopie; das Archiv selbst bleibt weg (Grund im Bericht:
  auspacken und den Ordner einwerfen). **RAR und 7z: nicht machbar** (kein freier Entpacker ohne Netz; unrar hat eine
  eigene Lizenz) — nur Zeichenketten, laut „ungeprüft … bitte als ZIP packen“.
- **Internetseite:** eine Adresse abrufen geht nicht (kein Netz, mit Absicht). Im Browser „Seite speichern unter …“ und die
  HTML-Datei samt Ordner einwerfen.
- **`reinigung.js`** aus Workflow PDF (versteckten PDF-Text finden und zudecken, JPEG ohne Metadaten) gehört zu **Stufe 4**
  (neu gezeichnete Blätter) und wird dort byte-1:1 übernommen.
- **Gemessen:** das Repo selbst als ZIP (48 Dateien, 21 MB) — prüfen 8,6 s, reinigen 13 s (Node), 0 Originalwerte in der
  Kopie. Texterkennung eines Bildes im Browser < 1 s nach dem Laden. Proben: `npm test` 175 grün, `npm run gegenprobe` 34
  gefangen · 0 blind. ⚠ Nicht gemessen: echte APK, große Fotos am Handy.

## Installieren und Aktualisieren (2026-10-28)

Klaus: *„… einen Installieren-Button … und einen Aktualisierungs-Button, weil installieren funktioniert so nicht. Wir
müssen den Browser anstoßen … für Handys, damit ich nicht eine Kompi machen muss.“*

- **Installieren** (Kopf): öffnet den Installationsdialog des Browsers (`beforeinstallprompt`). Bietet der Browser ihn
  nicht an, sagt eine Meldung warum (meist: nur eine Verknüpfung mit Chrome-Zeichen) und wie es von Hand geht. Ablauf und
  Texte übernommen aus dem Auslieferungsprüfer (`assets/installieren.js`); **nicht** byte-1:1, weil jene Datei Emoji
  zeichnet und Inline-Stile setzt (hier CSP `style-src 'self'`). Als installierte App ist der Knopf weg.
- **Aktualisieren** (Kopf): fragt beim Server nach einem neuen Service-Worker, löscht den Code-Vorrat (nur Namen
  `reiniger-…`, nie Daten anderer Apps unter github.io) und lädt neu. Läuft eine Prüfung, wird vorher gefragt. Liegt
  eine neue Fassung bereit, wird der Knopf petrol. Beim Start fragt die App ohnehin einmal nach (`reg.update()`).
- **Fassung**: `APP_FASSUNG` in `app.js` muss gleich der Nummer in `CACHE_VERSION` (`sw.js`) sein — die Probe prüft das.
  Beide bei jeder Änderung an einer Datei aus `CORE` erhöhen. Heute: 5. Proben: `npm test` 154 grün, `npm run gegenprobe` 29 gefangen · 0 blind.
- Am Handy (< 640 px) nur Symbole; „Neu“ hat ein eigenes Symbol (Blatt mit Plus), damit es nicht wie „Aktualisieren“ aussieht.

## Stufe 4 · gebaut (2026-10-29)

- **`assets/reinigung.js`** byte-1:1 aus Workflow PDF (`a2cfdf1`), SHA-gepinnt: erkennt versteckten PDF-Text (`versteckt`:
  winzig, außerhalb der Seite, ohne Tinte an seiner Stelle) und deckt ihn zu (`zudecken`), nimmt JPEG-Metadaten heraus
  (`jpegOhneMeta`). Der Kern liest es über `werkzeuge.WFP.Reinigung` (wie die anderen Prüfkerne).
- **Teilung der Arbeit, damit der Kern ohne DOM bleibt:** die App bringt einen **Zeichner** mit (`window.Zeichner` in
  `app.js`: Seite/Bild öffnen → Bildpunkte, Etiketten schreiben, als PNG/JPEG kodieren). Der Kern entscheidet alles andere:
  `blattKaesten` (wo Kästen hin), `kastenMalen`, `rauschen`, `pdfBauen` (eigene PDF ohne Verfasser/Programm/Datum),
  `docxBauen`/`xlsxBauen`/`pptxBauen`, `pngBauen`, `mustermappe`, `musterFuer`. Typen in `reiniger-kern.d.ts` (jetzt auch Stufe 2).
- **PDF:** jede Seite wird als Bild neu gezeichnet (bis 2400 px lange Kante, ≈ 200 dpi bei A4), gleiche Seitengröße, **keine
  Textebene** mehr. Wo ein Fund stand: grauer Kasten mit dunklem Rand und Etikett („E-Mail entfernt“, „Name entfernt“ —
  nie der Wert; bei „Musterwert“/„Eigener Wert“ steht dieser darin). Kastenbreite **gerundet** (verrät die Länge nicht).
  Zeichenbreiten **gemessen** (Schrift aus pdf.js, `measureText`, auf die Stückbreite geeicht) — geschätzt lag der Kasten
  in „Mail: anna@…“ um ein Zeichen daneben (Probe misst ab dem ersten Bildpunkt). Ein Wert über einen Zeilenumbruch
  bekommt je Zeile einen Kasten; überlappende Funde werden **ein** Kasten mit **einem** Etikett (keine Schrift über Schrift).
  Gedrehter Text: Kasten um das ganze Stück. Seiten ohne Textebene bekommen Kästen nur mit Texterkennung.
- **Bilder** (PNG, JPEG, WebP, GIF): gleiche Größe, ohne Metadaten, Kästen aus der Texterkennung (Wörter mit Kästen),
  **Rauschen über das unterste Bit** (gemessen: eine Botschaft darin ist danach weg). JPEG bleibt JPEG, PNG bleibt PNG; GIF
  wird PNG (neuer Name steht im Stellenplan). Ohne Texterkennung: Vorgabe „Weglassen“, „Neu zeichnen“ wählbar — dann sagt
  der Bericht „sichtbarer Text ungeprüft“.
- **Office** (Word, Excel, PowerPoint): als **reiner Text** neu gebaut — Kopf-/Fußzeilen, Tabellen, Fußnoten, Zellen
  (Zahlen bleiben Zahlen, Formeln nur mit letztem Wert), Folien in Reihenfolge. **Weg:** Verfasser, Kommentare, gelöschter
  Text (Änderungsverlauf), Notizen, Bilder, Formatierung. Marken mit **grauem Grund**. Ungepackt gespeichert, damit die
  Nachprüfung jeden Originalwert Byte für Byte findet. Geprüft mit LibreOffice, python-docx/openpyxl/python-pptx.
- **Nachfinden (Fund bei der Probe):** der Anhang-Prüfer klebt gelöschten Word-Text an den Absatz („…example**Geheimwort**“) —
  der gefundene Wert hieß anders als der Text im Neubau, die Mail blieb stehen (die Nachprüfung meldete es). Jetzt wird beim
  Neubau der **eigene** gelesene Text (Office, PDF-Seite, Texterkennung) noch einmal durchsucht; Zusätzliches wird mit
  ersetzt, der Bericht sagt „beim Neubau zusätzlich gefunden“. Dabei auch: die Straßen-Regel (Stufe 3) griff über einen
  Zeilenumbruch („Anna Beispiel⏎Kastanienallee 7“) — jetzt nur innerhalb einer Zeile.
- **Je Datei wählbar:** Neu zeichnen · Durch Muster ersetzen · Weglassen · Unverändert (NICHT gereinigt); „Für alle wählen“.
  Vorgabe „neu“ für PDF mit Textebene (auch ohne Gegenlesen — das Neuzeichnen beseitigt versteckten Text ohnehin), Bilder
  mit gelesenem Text und Office. Fehlschlag = weggelassen mit Grund, nie still übernommen.
- **Mustermappe** (`MUSTERMAPPE/`, ankreuzbar): Vorlagen leer.pdf/.docx/.xlsx/.pptx/.png/.jpg/.csv/.json/.sqlite und Beispiele
  (Musterbrief PDF/Word, Mustertabelle Excel/CSV, Musterfolien, Musterbild). Alles trägt „Muster“, nichts davon meldet die
  Nachprüfung. „Durch Muster ersetzen“ legt die passende Vorlage unter den alten Namen (z. B. eine Datenbank → leere SQLite).
- **Stellenplan:** „rechnung.pdf · Seite 1 · Kasten oben links · grauer Kasten „E-Mail entfernt“ ⟦MAIL-1⟧“, im JSON mit
  `kasten: {seite, x, y, w, h}` (Seiteneinheiten) — damit kann Stufe 6 eigene Werte an genau diese Stelle setzen.
- **Vorher / nachher:** die neu gezeichnete Seite bzw. das Bild wird in der Ansicht gezeigt (pdf.js, bis 5 Seiten).
- **Proben:** `npm test` 222 grün · 0 ROT; `npm run gegenprobe` 48 gefangen · 0 blind (14 neue Fälle: Pin, DOM, Kasten, Rauschen,
  versteckter Text, Kommentar, Nachfinden, Zeilenumbruch, Zeichenbreite, Muster, Kontrast, Dunkel, Schrift über Schrift,
  Leerzeile).
- ⚠ **Nicht gemessen:** große PDFs (Hunderte Seiten; Deckel 100) und große Fotos am Handy (Speicher), echte fremde
  Office-Dateien mit Textfeldern/SmartArt (Text darin kann fehlen — lieber zu wenig als zu viel), ODT/ODS/ODP und alte
  .doc/.xls (nicht neu gebaut: weglassen oder Muster), HEIC/TIFF (der Browser zeichnet sie nicht). Gesichter und Schrift,
  die die Texterkennung nicht liest, findet niemand — der **Pinsel zum Abdecken von Hand** fehlt noch.

## Hell und dunkel, Kontrast (Klaus 2026-10-29)

Klaus: *„… der Hell-Dunkel-Modus, dass es besser zu sehen ist, dabei auf weiße Schrift achten und hellem Hintergrund. Das
passt nicht.“* · *„… immer Zeilenumbrüche und vernünftige Spationierung … keine doppelten Zeilenumbrüche oder Schrift über
Schrift.“*

- **Gemessen statt geraten:** eine Kontrast-Probe (`tests/kontrast.mjs`, WCAG AA 4,5 : 1, große Schrift 3 : 1, auch über
  Verläufe und halbdurchsichtige Flächen — der schlechteste Ton zählt) fand genau die weiße Schrift auf hellem Grund: die
  Kopf-Knöpfe „Installieren“, „Aktualisieren“, „Neu“ und „Lokal“ (weiß auf halbdurchsichtigem Weiß über dem Petrol-Ende des
  Verlaufs, 3,95–4,11 : 1). Jetzt: dunkler Grund unter den Kopf-Knöpfen, Verlaufsende `#0a6664` statt `#0d7775`.
- **Schalter im Kopf** (Halbkreis-Symbol): Automatisch (wie das Gerät) → Hell → Dunkel. Gemerkt wird **nur diese Wahl**
  (`localStorage` „reiniger-thema“, keine Inhalte), gesetzt vor dem ersten Zeichnen (`assets/thema.js`, kein Aufblitzen).
  `<meta name="color-scheme" content="light dark">`: Browser, die Seiten selbst abdunkeln, lassen sie in Ruhe.
- Alle Farben als Variablen mit Hell- und Dunkel-Satz; die Kristall-Flächen bleiben dunkelblau (Bild von Klaus).
- **Schrift-Probe** in jeder Größe und jedem Zustand: keine sichtbaren Textzeilen übereinander, keine doppelten Leerzeilen
  (die Installier-Meldung ist jetzt in Absätzen statt mit Leerzeilen).
- ⚠ Nicht gemessen: am echten Handy im Dunkelmodus (Samsung Internet dunkelt Seiten teils selbst ab).

## Testfassungen Android und Windows (2026-10-29)

- **Gebaut wie Private Brain Pro, eine Codebasis:** `tools/native/prepare-web.mjs` legt die Seite (feste Liste: index.html,
  manifest, sw.js, assets, modules, vendor, icons) nach `www/` bzw. `windows/dist`. **Android:** Capacitor 8.5.3, `android/`
  eingecheckt (erzeugt mit `npx cap add android`), App-Kennung `de.familyprojekt.projektreiniger.pro`, Seite unter
  `https://localhost`. **Windows:** Tauri 2.12 (WebView2), NSIS-Setup nur für den eigenen Benutzer, keine Befehle für die Seite.
- **Bau auf GitHub** (`.github/workflows/testfassungen.yml`): bei jedem Push auf `main` und `claude/**`; auf `main` ersetzt der
  Lauf die Vorab-Veröffentlichung **testfassung** (APK und Setup mit SHA-256). Erster Lauf grün: APK in 1,5 min, Windows in 5 min.
  Hier im Behälter gibt es kein Android-SDK und kein Windows.
- **Android kennt keinen Browser-Download:** Plugin `Speichern` (`android/…/SpeichernPlugin.java`) öffnet „Speichern unter“
  (Storage Access Framework), ohne Speicherberechtigung. Die Probe stellt die Brücke nach und prüft, dass die übergebene ZIP gültig ist.
- **In den Hüllen** keine Knöpfe „Installieren“/„Aktualisieren“, kein Service-Worker (eine neue Fassung kommt als neue App;
  Pro-Leitfaden: je Fassung nur die Knöpfe, die dort funktionieren).
- Icons, Android-Startbild (Kristall mit „CLEANER“) und Windows-Icon baut `tools/icons-bauen.mjs` aus derselben Quelle.
- ⚠ **Testfassungen, nicht das Produkt:** APK mit Debug-Schlüssel (vor einer neueren die alte deinstallieren), Windows
  unsigniert (SmartScreen: „Weitere Informationen → Trotzdem ausführen“). Offen für Stufe 8: eigener Schlüssel (verschlüsselt,
  wie `signing/` in Private Brain Pro), Updates über die alte App, Windows-Signatur.
- ⚠ **Nicht gemessen:** echtes Android-Gerät und echter Windows-Rechner; ob Texterkennung (WebAssembly-Worker) und pdf.js in
  der Android-WebView und in WebView2 laufen; ob WebView2 den Download der sauberen Kopie ohne Rückfrage ablegt.

## Befund aus dem Test (Klaus 2026-10-29, Tablet)

Klaus hat die PWA am Tablet getestet (geteilter Bildschirm, hell). Seine Punkte und was daraus wurde:

| Klaus | umgesetzt |
|---|---|
| *„Erklärungen hinter einem i-Button verstecken“* | Die Sätze unter den Gruppen, beim Dateiplan, bei „Saubere Kopie bauen“, bei der Mustermappe, der Inventur-Legende, auf der Startfläche und unter der Kopie stehen jetzt hinter einem **ⓘ-Knopf** (zu, bis jemand tippt; der Tipp klappt nur die Erklärung, nicht die Gruppe). „Lokal“ im Kopf ist ein echter Knopf mit Erklärung. |
| *„Geprüft … 13 Dateien, Funde … nicht in einem Button-Container … kleiner schreiben … verleitet zum Draufklicken“* | Die Zählzeile ist eine **schlichte, kleine Textzeile** mit „·“ dazwischen, ohne Kästchen. |
| *„Bei Inventur das Gleiche … nur in der entsprechenden Farbe, fett … keinen Container“* | Stufe, Marke und Funde stehen nur **farbig und fett**; Größe und Art als bloßer Text. „Vorschlag“ an Namen ebenso. „1 Fund“ statt „1 Funde“. |
| *„Vorher-Nachher … geteilter Bildschirm … einstellen, Einzelansicht und geteilte Ansicht“* | Knopf **„Geteilt“ / „Einzeln“** in der Datei-Ansicht: Original links, saubere Kopie rechts (am schmalen Hochformat übereinander), jede Seite scrollt für sich. Gemerkt wird nur diese Wahl (`localStorage` „reiniger-ansicht“). |
| *„Sobald ich eigener Wert anklicke … Cursor sofort in das Eingabefeld“* | Bei „Eigener Wert …“ steht der Cursor sofort im Feld. |
| *„Das dunkle Design darf gern leicht heller sein … dezenter“* | Dunkel-Satz heller: Grund `#1a2b3d` statt `#0a1724`, Papier `#233a52`, Linien und getönte Flächen mit. Kontrast-Probe in beiden Modi grün. |
| *„Entfernen (Marke) … Musterwert … eigener Wert lalala … die Änderung gleich sehen, während ich das anklicke“* | Unter jeder Wahl steht **„Wird zu:“** mit der echten Zeile aus der Datei, der Ersatz grün hervorgehoben — ändert sich sofort beim Wählen und beim Tippen. Der Kern rechnet es (`vorschau`), dieselbe Regel und Nummer wie beim Reinigen. |
| (Bildschirmfoto) „Originalwerte in der Kopie: 6 — in MUSTERMAPPE/…mustertabelle“ | **Fehler gefunden:** die erfundenen Werte der Mustertabelle (`erika.mustermann@beispiel.example`) waren dieselben wie im Beispielprojekt — die Nachprüfung hatte recht. Jetzt: eigene Musterwerte (`mia.musterfrau@muster.example`), und eine Mustermappe-Datei, die **zufällig einen entfernten Wert** enthält, geht nicht mit (Grund im Bericht). |

Kopf am Handy: unter 900 px nur Symbole, unter 420 px kein Schriftzug neben dem Logo, unter 380 px kein „Lokal“ (derselbe
Satz steht auf der Startfläche) — damit der Sperr-Knopf immer Platz hat. ⚠ Zu APK und Windows kam noch kein Befund.

## Stufe 5 · gebaut (2026-10-29)

- **Das Schloss** `assets/schluesseltresor.js` ist **byte-1:1** aus dem Sende-Prüfer übernommen (dort aus kim-hub-company `1a4528d`,
  `TRESOR_SHA` `eaed30e8…`), hier in `PINS` gepinnt: AES-256-GCM, PBKDF2-SHA256 600 000 Runden. ⚠ Direkt aus kim-hub-company zu
  holen wurde in dieser Sitzung abgelehnt (Zugriff); der SHA ist derselbe, den der Sende-Prüfer gegen kim-hub-company pinnt.
  Der Kern lädt es nicht selbst: `werkzeuge.WERKSTATT_SCHLUESSEL` bzw. globalThis — kein zweites Schloss.
- **Kern** (ohne DOM, Typen in `.d.ts`): `verschliesse(zuordnung, originale, code, { ablaufTage, quelle })` → Tresor-Datei,
  `oeffne(datei, code)` → `{ zuordnung, originale, quelle, erstellt, ablauf, abgelaufen }`, `tresorKopf` (ohne Code lesbar),
  `istTresor`, `codeGuete`, `sperrWartezeit`, `sperrPaket`/`sperrAuf`, `vorschau`. Fehler heißen „code“, „fassung“, „kein-tresor“,
  „zu-gross“, „schloss-fehlt“ — nie „falscher Code“, wenn es eine andere Fassung ist.
- **Tresor-Datei** `<projekt>-tresor-JJJJ-MM-TT.rtresor`: eine JSON-Datei. Lesbar ohne Code nur Kennung
  `PROJEKT-REINIGER-TRESOR`, Fassung, Erstell- und **Ablaufdatum** (Vorgabe 30 Tage, wählbar 7/30/90). Zuordnung, Originale und der
  Name der Quelle liegen im verschlüsselten Paket. Originale höchstens 256 MB; `node_modules` und Build-Ordner nie.
- **Oberfläche:** nach dem Reinigen die Karte **„Tresor (auf Wunsch)“**: Zuordnung immer, „Originaldateien mitnehmen“ angehakt nur
  auf Wunsch, Code zweimal, Hinweis sichtbar am Feld („Ein kurzer Code lässt sich durchprobieren …“, ab 12 Zeichen grün),
  „Verschließen und speichern“ (Download bzw. Android „Speichern unter“). Die Felder sind danach leer.
  Auf der Startfläche **„Tresor öffnen“** (oder eine `.rtresor` einwerfen): erst Ablauf ohne Code; abgelaufen → gelb „Es sind fremde
  Daten: löschen oder an den Absender zurückgeben“ (die App kann die Datei nicht selbst löschen). Mit Code: die Zuordnung (Wert erst
  auf „zeigen“) und die Originale als Ordner (ansehen wie in der Datei-Ansicht). „Schließen“, „Sperren“ und „Neu“ werfen den Inhalt
  aus dem Speicher.
- **Gäste-Sperre** (Knopf mit Schloss, immer im Kopf): der erste Tipp fragt einen Code (zweimal, mindestens 4 Zeichen; gilt bis die
  Seite zu ist, gespeichert nirgends). Danach schließt jeder Tipp **sofort**: die Sperrfläche deckt alles, Funde, Inventur, Ansicht,
  Tresor und Meldung werden aus der Seite genommen, alles dahinter ist `inert`; Dateien und Entscheidungen werden mit dem Code
  verschlüsselt (**nur im Speicher**, dasselbe Schloss), der Klartext und der Code selbst werden vergessen. Mit dem Code: dieselben
  Dateien und Entscheidungen, neu geprüft (und die Kopie neu gebaut, wenn es eine gab). **Falsche Versuche:** drei frei, dann 30 s,
  1, 2, 4 … Minuten, höchstens 30 min. „Code vergessen: alles verwerfen“ leert die App; neu laden ebenso — es liegt nirgends sonst.
- **BookLedger:** BookLedgerPro ist privat und war in dieser Sitzung nicht lesbar; gelesen wurde **BookLedger-Basic** (öffentlich,
  `src/core/vault.js`, `src/ui/shell.js`): „Jetzt sperren“ = Sitzungsschlüssel aus dem Speicher (`lockVault`), dann Neustart auf den
  Sperrbildschirm. Dieselbe Idee hier; eine wachsende Wartezeit hat BookLedger-Basic **nicht** — sie ist hier neu (Brief verlangt sie).
  ⚠ Ob BookLedgerPro eine hat, ist ungeprüft.
- **Proben:** `npm test` 266 grün · 0 ROT (darunter: Tresor ohne Code ohne Wert, Originale Byte für Byte, falscher Code, Ablauf,
  Sperre leert Seite und Speicher, Code vergessen, Wartezeit nach drei Fehlversuchen, Wiederherstellen mit Entscheidung, Vollbild in
  Sperre/Tresor/geteilter Ansicht). `npm run gegenprobe`: 17 neue Fälle (Befund und Stufe 5) und 11 berührte alte voll gefahren,
  28 gefangen · 0 blind; alle 65 Anker leben. Dabei gefunden: die Schrift-über-Schrift-Messung zählte Text in **zugeklappten**
  Bereichen mit (Chromium verbirgt ihn ohne `display: none`) — die Probe ist nachgebessert.
- ⚠ **Nicht gemessen:** große Projekte im Tresor/in der Sperre (alles als Base64 im Speicher — bei Hunderten MB am Tablet kann es
  knapp werden), echte Geräte (APK, Windows: ob „Speichern unter“ die `.rtresor` sauber ablegt), Sperre während einer laufenden
  Prüfung (dann sagt die App „erst abwarten“). **Offen für später:** Ersatzschlüssel in 5 Teilen (3 genügen) wie Private Brain Pro;
  Zurückbauen (Stufe 6).

## Hereinladen und herausladen (Klaus 2026-10-29)

Klaus: *„… von der Bedienansicht die Möglichkeit, einen Dateiimport zu machen und einen Export … leicht zu finden … per Drag and
Drop oder per Copy Paste … Datei ablegen und dann scannen … da kann es ruhig ein Fenster geben.“* · *„Nimm dir Auslieferungsprüfer
zum Vorbild.“*

- **Leiste oben im Arbeitsbildschirm**, immer sichtbar, auch am Handy mit Wort: **„Dateien hereinladen“** (petrol) und
  **„Saubere Kopie herausladen“** (baut die Kopie mit Nachprüfung, falls noch nicht geschehen, und lädt das ZIP; Android: „Speichern unter“).
- **Fenster „Dateien hereinladen“** (Vorbild Auslieferungsprüfer): Reiter **Datei** (gestrichelte Ablagefläche, „Dateien wählen“,
  „Ordner wählen“) und **Text einfügen** (Feld für Text, Code, HTML, SVG; Dateiname frei oder erkannt). Darunter die Liste „Bereit zum
  Prüfen“ (einzeln wieder herausnehmbar), „Zum jetzigen Projekt dazunehmen“ (vorgewählt; sonst neu prüfen), **Prüfen** und **Leeren**.
  Esc oder „Schließen“ schließt.
- **Ablegen** (Maus): auf der Startfläche sofort prüfen (wie bisher); im Arbeitsbildschirm ins Fenster — nichts wird still ersetzt.
  **Einfügen** (Strg+V bzw. „Einfügen“ am Tablet): Dateien und Bilder aus der Zwischenablage, sonst Text als Datei. Auf der Startfläche
  neu: „Text einfügen“.
- Dazugenommen: Entscheidungen, eigene Namen und Texterkennung bleiben; einzelne Dateien landen im Projektordner; oben steht
  „Geprüft: musterapp + 1 Datei“.
- **APK und Windows** nutzen denselben Code (eine Codebasis); dort gibt es kein Ziehen am Tablet — Wählen und Einfügen gehen.
- **Proben:** `npm test` 281 grün · 0 ROT (15 neue: Fenster, Vollbild 320/740/1280, Dateiwahl, Dazunehmen in den Ordner, SVG- und
  Bild-Einfügen, Text-Feld, Neu prüfen, Ablegen ins Fenster, Leeren, Esc, Herausladen). Gegenproben IMPORTFENSTER, EINFUEGEN, ABLEGEN,
  DAZU gefangen.
- ⚠ Nicht gemessen: Einfügen eines Bildes in Android-WebView und WebView2.

## Befund zu Fassung 9 (Klaus 2026-10-29, Abend)

| Klaus | umgesetzt |
|---|---|
| *„Die erste Seite … ZIP oder Datei, Ordner. Da ist die Frage, Ordner anlegen oder Ordner einfügen … Text einfügen, da steht es.“* | Die Knöpfe sagen, was sie tun: **„ZIP oder Dateien einfügen“**, **„Ordner einfügen“**, „Tresor öffnen“, „Text einfügen“. |
| *„Oben rechts … steht Neu … sollte nicht rechts oben sein, sondern greifbar … links, wie bei einer E-Mail … in der Nähe der anderen Leisten.“* | **„Neu“** ist aus dem Kopf in die Arbeitsleiste gewandert, als **erster Knopf links** vor „Dateien hereinladen“ (mit Wort, auch am Handy). Ein Tipp öffnet wieder die erste Seite. |
| *„Ein kleines Mini-Video mit der Hand oder dem Finger … Schritt 1, 2, 3, 4 … legt sich auf die Oberfläche der App … soll so aussehen, als wenn die App bedient wird … wenn ich draufklicke, verschwindet das … Vollbild im Vollbild, geteilter Bildschirm im geteilten.“* (erst als Plan gedacht, dann „wenn du Zugriff hast, mach das“) | **„So geht's“** auf der ersten Seite. Kein Film: ein **Finger** fährt über die **echte App** und tippt — 1 Projekt einwerfen (Beispielprojekt), 2 Funde ansehen, 3 je Fund wählen („Wird zu:“), 4 saubere Kopie bauen und herausladen (nur gezeigt, nichts geht hinaus). Unten ein Satz „Schritt x von 4“. **Ein Tipp irgendwo oder Esc beendet sofort**, danach steht wieder die erste Seite da. Die Vorführung liegt über genau dem Fenster der App — im Vollbild wie in der geteilten Ansicht. Ohne Musik; gemessen **≈ 13 s** bis zum Ende (Prüfrechner; am Tablet länger, weil Prüfen und Reinigen echt laufen). |

**Dabei gefunden:** Fenster (Datei-Ansicht, Tresor, jetzt Zurückbauen) lagen über der **ganzen** App, auch über dem Kopf — „Sperren“ war
dann nicht erreichbar, obwohl die CLAUDE.md „immer sichtbar“ verlangt. Jetzt liegen sie unter dem Kopf (Probe misst es).

## Stufe 6 · gebaut (2026-10-29)

- **Kern** (ohne DOM, Typen in `.d.ts`): `stellenplanAus(dateien)` findet `REINIGER-STELLENPLAN.json` in einer sauberen Kopie;
  `rueckbauPlaetze(plan)` bündelt die Stellen zu **Plätzen** (eine Marke `⟦ORT-1⟧` — oder Art + Musterwert, weil „Max Mustermann“
  für Name, Copyright und Verfasser mit verschiedenen Originalen stehen kann); `werteAusZuordnung(zuordnung, plaetze)` holt die
  Originale aus der Zuordnung (gleich nach dem Reinigen im Speicher oder aus dem Tresor); `zurueckbauen(dateien, werte, { originale })`
  füllt und baut eine neue ZIP mit `REINIGER-ZURUECKBAU.txt` (nennt Plätze und Zahlen, **nie die Werte**).
- **Gefüllt wird nur, wo der Stellenplan es sagt:** Text **Zeile für Zeile** an der genannten Zeile, nur an **Wortgrenzen** wie beim
  Reinigen („muster“ in „musterapp“ bleibt), längere Platzhalter zuerst („Musterstadt 2“ vor „Musterstadt“); **Datei- und
  Ordnernamen** (Musterstadt-2019 → Hamburg-2019); **Word/Excel/PowerPoint** in den Textteilen (XML-sicher, „&“ → `&amp;`,
  auch Blattnamen). Leer gelassen bleibt der Platzhalter.
- **Nicht füllbar, benannt:** graue Kästen in neu gezeichneten PDF-Seiten und Bildern (dort gibt es keinen Text mehr);
  Werte aus `.env` („MUSTER-WERT“) — sie stehen bewusst in **keiner** Zuordnung, auch nicht im Tresor.
- **Gemessen:** mit den Originalen zurückgebaut ist jede Textdatei des Beispielprojekts wieder **Byte für Byte** das Original
  (außer `.env`), samt Ordnernamen.
- **Oberfläche:** Fenster „Zurückbauen“ (wie der Tresor, unter dem Kopf). Je Platz: Platzhalter, Art, „3× in 2 Dateien“, ein Feld
  „eigener Wert“ und — wenn die Zuordnung da ist — „Original“; „Alle Originale zurückholen“; ein farbiger Knopf **„Gefüllte Kopie
  herausladen“** → `…-gefuellt.zip` (grün) bzw. mit Originalen `…-zurueckgebaut.zip` (gelb: **„NICHT sauber“**). Drei Wege hinein:
  (1) nach dem Reinigen „Eigene Werte einsetzen …“, (2) eine saubere Kopie (ZIP mit Stellenplan) auf der ersten Seite einwerfen —
  dann öffnet sich „Zurückbauen“ statt der Prüfung, „Doch prüfen“ geht, (3) im geöffneten Tresor „Saubere Kopie zurückbauen …“.
  Gespeichert wird nichts; „Schließen“, „Neu“ und die Gäste-Sperre werfen alles weg.
- **Proben:** `npm test` 322 grün · 0 ROT (Stufe 6: 7 im Kern, 15 in der Oberfläche; Befund 9: 19). Gegenproben 12 gefangen · 0 blind.
- ⚠ **Nicht gemessen / offen:** Kästen in PDF-Seiten und Bildern mit eigenen Werten neu zeichnen (die Lage steht schon im Stellenplan,
  `kasten`); eigene Werte in Office tragen noch den grauen Grund der Marke; eine Kopie, die nach dem Reinigen von Hand geändert
  wurde (Zeilen verschoben) — dann meldet „Nicht gefunden“ die Stellen, gefüllt wird dort nichts; große Projekte; echte Geräte.

## Stufe 7 · gebaut (2026-10-29)

- **Sperrliste** (`reiniger-sperrliste.json`): je Wert ein Fingerabdruck — SHA-256 über ein zufälliges **Salz** und eine feste
  Schreibweise (klein, nur Buchstaben und Ziffern, Wörter mit einem Leerzeichen). „Erika Mustermann“, „ERIKA  MUSTERMANN“ und
  „erika.mustermann@…“ geben dieselben Wörter; IBAN und Telefon (alle Wörter mit Ziffern) zählen auch ohne Leerzeichen. Gesucht wird
  **Wortfolge für Wortfolge** (1 bis 12 Wörter), nur ganze Wörter („Hamburger“ ist nicht „Hamburg“). Werte unter 4 Zeichen oder über
  12 Wörter nimmt die Liste nicht auf (gezählt, nicht still). Ein **Vorfilter** (Bitfeld über einen schnellen Hash) spart das
  SHA-256 für fast alle Wortfolgen: 1 MB Text in ≈ 0,2–0,4 s statt 6 s. Mehrere Listen lassen sich zusammenlegen.
- **In der App:** nach dem Reinigen „**Sperrliste herausladen …**“ (auch im geöffneten Tresor: „Sperrliste daraus …“) — Fenster unter
  dem Kopf, je Marke ein Haken mit dem Wert; Datum, Ort, PLZ-Ort, Vorname und Hochschule sind **nicht vorgewählt** (zu allgemein, um
  jeden Commit anzuhalten). „Hier laden“ nimmt sie gleich in Gebrauch. **Eingeworfen** wird eine Sperrliste geladen, nicht geprüft:
  erste Seite „Sperrliste geladen: N Fingerabdrücke — sucht beim Prüfen mit“ (entfernen geht). Jede Prüfung findet dann ihre Werte
  als „**Auf der Sperrliste**“ — auch ohne Muster (ein Name ohne Anrede, ein Rechnername in anderer Schreibweise), auch in Datei- und
  Ordnernamen; schon Gefundenes trägt nur den Satz „steht auf deiner Sperrliste“. Reinigen ersetzt sie wie jeden Fund, die
  Nachprüfung sucht mit. Gespeichert wird nichts — nach dem Neuladen ist die Liste weg.
- **Git-Wächter** (`tools/git-waechter.mjs`, Node, derselbe Kern): `--einrichten <repo>` legt **pre-commit** (vorgemerkte Dateien und
  Autor), **commit-msg** (Nachricht) und **pre-push** (jeder Commit, der hinausgeht — auch ein Wert, der mit `--no-verify` hineinkam und
  wieder gelöscht wurde) an; fremde Hooks bleiben (nur mit `--ersetzen`). Dazu `--bereich A..B`, `--alles`, `--ci`,
  `--sperrliste-bauen werte.txt`, `--sperrliste-zusammen`. Er **hält an** bei Werten der Sperrliste (in jeder Datei, auch
  `node_modules`, Binärdateien über ihre Zeichenketten, PDF/Office über den Kern) und bei **Tresor-Dateien** (auch umbenannt);
  `--streng` hält auch bei Mail, IBAN, Telefon, Schlüssel. Alles andere ist **Hinweis** (Datum, Muster- und Beispielwerte nicht).
  **Die Ausgabe nennt nie einen Wert** — nur Datei, Zeile, Art. Liste: `--sperrliste`, `REINIGER_SPERRLISTE` (Inhalt oder Pfad),
  `<repo>/.git/reiniger-sperrliste.json`, `~/.config/projekt-reiniger/sperrliste.json`.
- **GitHub-Prüfung** (`.github/workflows/waechter.yml`): bei push und pull_request jeden neuen Commit (neuer Zweig: alles, was der
  Hauptzweig nicht hat; erster Push: ganze Geschichte), Anmerkungen `::error` ohne Wert, nur Leserechte. **Aufrufbar aus Klaus' anderen
  Repos** (`uses: lausiklauskn-png/project-cleaner-pro/.github/workflows/waechter.yml@main`, `secrets: inherit`); die Sperrliste als
  Geheimnis `REINIGER_SPERRLISTE`. In diesem Repo selbst läuft sie ohne Liste (nur Tresor-Dateien und Hinweise).
- **Kern** (ohne DOM, Typen in `.d.ts`): `sha256`, `sperrForm`, `sperrlisteBauen`, `sperrlisteLesen`, `istSperrliste`, `sperrlisteZusammen`,
  `sperrlisteGroesse`, `sperrTreffer`, `waechterPruefe`, `waechterText`; `pruefe(…, { sperrliste })` → Fundart `GESPERRT`.
- **Proben:** `npm test` 360 grün · 0 ROT (+38: 14 Kern, 7 Werkzeug im echten Git mit Wegwerf-Repo und Wegwerf-Fernrepo, 1 Workflow,
  16 Oberfläche). Gegenproben: 12 neue Fälle, 12 gefangen · 0 blind (SPDICHT fand einen echten Fehler, siehe Abschlussbrief).
- ⚠ **Grenzen, ehrlich:** Wer die Sperrliste hat, kann kurze Werte (Vornamen, Orte, Geburtsdaten) **durchprobieren** — das Salz
  verhindert nur vorbereitete Tabellen. Darum gehört sie nicht in ein öffentliches Repo, sondern in `.git/` oder ein GitHub-Geheimnis.
  `--no-verify` umgeht die Hooks (der Wächter sagt das offen) — dann fängt erst pre-push bzw. die GitHub-Prüfung, und die läuft **nach**
  dem Push (der Wert liegt dann schon bei GitHub). Merge-Commits: nur was ihre Eltern-Commits bringen, nicht eine Konfliktlösung im
  Merge selbst. Werte, die zerteilt oder verschlüsselt sind (Base64), findet die Liste nicht. Nicht gemessen: an Klaus' echten Repos,
  unter Windows (Hooks brauchen `node` im Pfad), große Repos in der GitHub-Prüfung.

## Befund zu Fassung 11 (Klaus 2026-10-29, Nacht) · Fassung 12

Fassung 10/11: *„Funktioniert gut.“*

| Klaus | umgesetzt |
|---|---|
| *„Ein Mikrofon ins Suchfeld … nicht so groß, auf die Reihe, wo das Suchfeld ist … Technik von meiner Familienakte.“* | Mikrofon-Symbol in der Zeile „Fehlender Name …“. Technik aus Meine-Familienakte (`lib/browser-dictation.ts`, `FamilienakteSpeechPlugin`): im **Browser** die Spracherkennung des Browsers; in der **APK** Androids Sprachfenster (Plugin `ProSpeech`, `SprachePlugin.java`, Erkennung auf dem Gerät bevorzugt, kein Mikrofon-Recht). Tippen startet, noch einmal tippen beendet, das Gehörte steht im Feld, dann „Suchen“. ⚠ **Ehrlich:** im Browser schickt Chrome die Sprache an Google — das ist der einzige Weg, auf dem hier etwas das Gerät verlässt; es steht am Knopf, beim Start und in der Auskunft ⓘ. **Windows:** noch kein Mikrofon (die Familienakte nutzt dort die Windows-Spracherkennung über einen eigenen Befehl — noch nicht übernommen). |
| *„Die Versionsnummer oben … die APK-App wird Pro genannt. Diese hier … Projektreiniger Basic.“* | Browser/PWA: **„Projekt-Reiniger Basic“** + **v12**. APK und Windows: **„Projekt-Reiniger Pro“** + **v12** als Knopf. Die Nummer ist überall `APP_FASSUNG` (APK: `build.gradle` liest sie, Windows: `tauri.conf.json` 12.0.0 — Probe vergleicht). |
| *„… die Versionsnummer, die dann ein Aktualisierungsbutton wird bei der Pro-Variante … vorerst über einen Download-Link.“* | Pro: Tipp auf **v12** → Meldung mit Fassung und Knopf „Testfassung-Seite öffnen“ (GitHub, Vorab-Veröffentlichung `testfassung`; Android öffnet den Browser, Windows über einen festen Befehl der Hülle). Die App selbst lädt nichts. Das automatische Update über Klaus' Server kommt später. ⚠ Testfassungen ohne eigenen Schlüssel: vor dem Installieren der neuen APK die alte deinstallieren (die Meldung sagt es). |
| *„Tooltips für die Knöpfe … ich weiß nicht, was Stellenplan bedeutet … Sperrliste herausladen.“* | Jeder Knopf nach dem Reinigen trägt eine Erklärung beim Darüberfahren; weil es am Tablet kein Darüberfahren gibt, zusätzlich **„Was machen diese Knöpfe?“ ⓘ** mit allen fünf Erklärungen (Saubere Kopie, Stellenplan, Bericht, Eigene Werte einsetzen, Sperrliste). |
| *„Lokal … als Informationsbutton nach rechts, nicht ‚Lokal‘ draufschreiben.“* | ⓘ rechts im Kopf, ohne Wort; die Auskunft nennt Ausgabe und Fassung. |
| *„Aktualisieren: nur das Zeichen. Sperren: nur das Schloss, groß genug. Farbmodi: Sonne und Mond.“* | Kopf rechts nur Symbole: ⓘ, Darstellung (Bildschirm = wie das Gerät, Sonne = hell, Mond = dunkel), Aktualisieren (Pfeile), **großes offenes Schloss** (28 px). Erklärung jeweils beim Darüberfahren. „Installieren“ behält sein Wort (nicht genannt). |
| Bild: goldener Kristall — *„das soll auch die Hauptfarbgebung für das Pro-Programm werden, ab APK aufwärts, Windows.“* | `icons/kristall-pro-quelle.png`; `tools/icons-bauen.mjs` baut daraus Android-Symbole, Startbild und Windows-Symbol, dazu `logo-pro-96.png` und `kristall-pro*.webp`. In der Hülle: `data-ausgabe="pro"` → Kopf und erste Seite Gold auf Dunkel, Hauptknöpfe und Titel goldbraun; Kontrast hell/dunkel gemessen. Basic bleibt blau. |

- **Proben:** `npm test` 384 grün · 0 ROT (+24: Basic/Pro-Namen, Versionsnummer in APK/Windows/Seite, Windows-Befehl, Android-Mikrofon ohne Mikrofon-Recht,
  Kopf nur Symbole, Schlossgröße, Mikrofon im Browser (Start, Text, Stopp, verweigert), Knopf-Erklärungen, Pro-Hülle: Name, Gold, Kontrast, Versions-Knopf, Sprachfenster).
  Bilder: `docs/bilder-befund-11/`. Gegenproben B11PRO, B11GOOGLE, B11KNOPF: 3 gefangen · 0 blind.
- ⚠ Nicht gemessen: Mikrofon am echten Tablet (Browser und APK), das Sprachfenster auf Klaus' Gerät (offline?), der Link aus der APK,
  der Windows-Befehl (nur gebaut auf GitHub, nicht gestartet).

## Grenzen (vorab benannt)

- Die Suche arbeitet mit Mustern und Listen. Sie findet viel, aber **nicht garantiert alles**.
- Leicht durch fallen versteckte Daten (Base64, verschlüsselt), zusammengepresster Code und
  Datenbank-Dateien. Datenbanken lassen sich nur entfernen, nicht reinigen.
- Klaus' Blick auf die Befundliste bleibt deshalb Pflicht.

## Offen

- Pro: Update über Klaus' eigenen Server (wie Familienakte: unterschrieben, geprüft) statt Link; eigener Schlüssel für die APK, Signatur für Windows.
- Mikrofon unter Windows (Windows-Spracherkennung wie in der Familienakte).
- ✅ Befund zu Fassung 10: „funktioniert gut“ (Klaus 2026-10-29, Nacht).
- Git-Wächter in Klaus' Repos einrichten (je Repo: `--einrichten` am Rechner, Workflow-Datei, Geheimnis `REINIGER_SPERRLISTE`) — Klaus entscheidet, welche.

- Eigene Adresse (Unterdomain) oder fürs Erste github.io?
- ✅ Das Repo gibt es: `project-cleaner-pro` (Klaus 2026-10-28). Stufe 1 liegt darin.
- ✅ GitHub Pages ist an (Klaus testete am 2026-10-28 auf lausiklauskn-png.github.io).
- Soll „Datum“ in Doku-Dateien standardmäßig „Behalten“ sein (sehr viele Funde, selten persönlich)?
- Soll die Anzeige die gefundenen Werte im Klartext zeigen (so jetzt, nur auf dem Gerät) oder erst auf Tipp? (Im Tresor: erst auf Tipp.)
- Ersatzschlüssel für den Tresor (5 Teile, 3 genügen), wie Private Brain Pro — Stufe 5 hat nur den Code.
- Was geschieht mit dem Original-Branch in Meine-Familienakte (Fund oben)?
- Pinsel zum Abdecken von Hand (Gesichter, Kennzeichen ohne lesbare Schrift) — in Stufe 4 nicht gebaut.
- ODT/ODS/ODP und alte .doc/.xls neu bauen — bisher nur weglassen oder Muster.
