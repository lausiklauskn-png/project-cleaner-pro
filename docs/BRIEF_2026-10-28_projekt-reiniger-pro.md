# Brief: Projekt-Reiniger Pro

Stand 2026-10-28, **Stufe 1 und Stufe 3 gebaut** (Abschnitte „Stufe 1 · gebaut“ und „Stufe 3 · gebaut“ unten).
Stufe 2 (Entscheiden, Reinigen) ist noch offen — Stufe 3 wurde vorgezogen, weil sie nur liest. Der Brief lebt seitdem **hier**
im Repo `project-cleaner-pro`; die Fassung im Sende-Prüfer ist eingefroren und zeigt hierher.

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
| 2 | Entscheiden, Marken und Musterwerte, saubere Kopie, Stellenplan, Nachprüfung |
| 3 ✅ | Gefühlte Metadaten (Wortlisten, Eigennamen, Pfade) — gebaut 2026-10-28 (vor Stufe 2, nur lesen) |
| 4 | Neu gezeichnete Blätter, Mustermappe |
| 5 | Tresor und Gäste-Sperre |
| 6 | Zurückbauen, mit eigenen Werten füllen |
| 7 | Git-Wächter und Sperrliste |
| 8 | APK, danach Windows |
| 9 | Einbau in die Familienakte |

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
  Ordner (Auswahl oder Ziehen), einzelne Dateien, Beispielprojekt. Ein ZIP im Projekt bleibt eine Datei.
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

## Grenzen (vorab benannt)

- Die Suche arbeitet mit Mustern und Listen. Sie findet viel, aber **nicht garantiert alles**.
- Leicht durch fallen versteckte Daten (Base64, verschlüsselt), zusammengepresster Code und
  Datenbank-Dateien. Datenbanken lassen sich nur entfernen, nicht reinigen.
- Klaus' Blick auf die Befundliste bleibt deshalb Pflicht.

## Offen

- Eigene Adresse (Unterdomain) oder fürs Erste github.io?
- ✅ Das Repo gibt es: `project-cleaner-pro` (Klaus 2026-10-28). Stufe 1 liegt darin.
- GitHub Pages einschalten (Klaus, Einstellungen des Repos).
- Soll die Anzeige die gefundenen Werte im Klartext zeigen (so jetzt, nur auf dem Gerät) oder erst auf Tipp?
- Was geschieht mit dem Original-Branch in Meine-Familienakte (Fund oben)?
