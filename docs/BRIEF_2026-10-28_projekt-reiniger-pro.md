# Brief: Projekt-Reiniger Pro

Stand 2026-10-28, **Stufe 1 und 2 gebaut** (Abschnitte „Stufe 1 · gebaut“ und „Stufe 2 · gebaut“ unten). Der Brief lebt seitdem **hier**
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
| Code (Knöpfe, Variablen) | ~~ein Musterwert („Musterstadt“)~~ — **seit 2026-10-28 ebenfalls die Marke mit Zahl** (Klaus: *„einfacher durch Zahlenwerte … Doppelklammer“*). Ein Musterwert ist nur noch eine Wahl je Wert, für Stellen, an denen ein Programm das Format prüft |
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
| 2 ✅ | Entscheiden, Marken und Musterwerte, saubere Kopie, Stellenplan, Nachprüfung — gebaut 2026-10-28 |
| 3 | Gefühlte Metadaten (Wortlisten, Eigennamen, Pfade) |
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

## Stufe 2 · gebaut (2026-10-28)

- **Kern** (`reiniger-kern.js`, `KERN_FASSUNG` 2, Typen in `.d.ts`):
  `vorschlag(ergebnis) → entscheidungen` · `reinige(dateien, entscheidungen) → { sauber, stellenplan, zuordnung, weg, hinweise, zahlen }` ·
  `nachpruefe(rein, entscheidungen) → { offen, ergebnis }` · `stellenplanText`, `stellenplanJson`, `bericht` · `zipBauen`, `ausgabe`.
  Abweichung von der Schnittstelle oben: `reinige` bekommt die Entscheidungen aus `vorschlag` (sie tragen die Werte
  und die Dateipläne); `pruefe` ist dafür nicht noch einmal nötig. Weiter kein DOM, keine IndexedDB, kein Netz.
- **Entscheiden einmal je Wert:** ein Wert, der als Verfasser, Copyright und Git-Name vorkommt, ist **eine**
  Entscheidung („gilt auch für: …“). Vorgabe: **Entfernen**. Zur Wahl: Entfernen · Musterwert · Eigener Wert · Behalten.
- **Entfernen sieht je nach Datei anders aus** (Tabelle „Wie eine entfernte Stelle aussieht“): in Texten, Doku,
  HTML eine Marke `⟦NAME-1⟧` (gleicher Wert = gleiche Nummer); in Code **und Konfiguration (JSON, YAML, TOML, .env)**
  ein Musterwert („Max Mustermann“, `muster1@beispiel.example`, `DE00…`, `01.01.2000` in der Form des Originals),
  damit das Programm weiterläuft; in **Datei- und Ordnernamen** ebenfalls ein Musterwert.
- **Ersetzt wird an Wortgrenzen, ohne Rücksicht auf Groß/klein**, der längste Wert zuerst und in einem Durchgang —
  „Anna“ trifft „ANNA“, aber nicht „Annabell“ oder „Hanna“. Dabei werden auch Stellen ersetzt, die die Suche
  nicht einzeln gemeldet hat, wenn dort derselbe Wert steht.
- **Je Datei:** Reinigen (Text) · Unverändert übernehmen · Weglassen. **`.git` kommt nie mit**, auch nicht, wenn
  eine Entscheidung es anders sagt (zweite Sicherung in `reinige`). `node_modules` und Build-Ordner kommen nicht
  mit (nie gelesen; der Bericht sagt: neu installieren). `.env`, Sicherung, Datenbank, Export und Schlüsseldatei
  sind standardmäßig weg. Bilder, PDF, Office und Unbekanntes kommen nur unverändert mit, wenn sie **ohne Funde
  und ohne „ungeprüft“** gelesen wurden — neu gezeichnet werden sie erst in Stufe 4.
- **Ausgabe:** ein ZIP `<projekt>-sauber.zip` (fester Zeitstempel, damit es nichts über den Zeitpunkt verrät), darin
  `_reiniger/STELLENPLAN.txt`, `_reiniger/stellenplan.json` und `_reiniger/BERICHT.txt`. Stellenplan und Bericht
  gibt es auch einzeln. **Keiner von beiden nennt einen alten Wert** (die Probe sucht jeden darin). Ein eigener Wert
  steht im Stellenplan nur als „eigener Wert (war: Name)“.
- **Die Zuordnung** (welche Marke für welchen Wert steht) bleibt nur im Speicher, bis „↺ Neu“. Es gibt bewusst keinen
  Download dafür — sie gehört in den Tresor (Stufe 5).
- **Nachprüfung:** die Kopie wird noch einmal ganz geprüft, dazu wird **jeder alte Wert in den Bytes jeder Datei**
  gesucht (UTF-8 und UTF-16, Groß/klein egal) — so fällt auch ein Wert in einer unverändert übernommenen Binärdatei
  auf. Offen heißt: Rest eines alten Werts, ein neuer Fund, oder eine ungeprüfte Datei in der Kopie. Leer heißt
  „nichts offen gefunden (nicht garantiert alles)“, nie „sauber“.
- **Oberfläche:** an jedem Fund eine Auswahl „In der Kopie“, in der Inventur je Datei „Kopie: …“, darüber die
  Leiste „🧽 Saubere Kopie bauen“ mit ⬇ ZIP · Stellenplan · Bericht. Wer nach dem Bauen etwas ändert, liest
  „seit dem Bauen geändert — bitte neu bauen“. Am Handy (hoch und quer) kurze Beschriftungen.
- **Proben:** `npm test` **133 grün · 0 ROT** (u. a. kein alter Wert in Kopie/Stellenplan/Bericht, Zeilen im
  Stellenplan stimmen, package.json bleibt gültiges JSON, ZIP öffnet Python `zipfile` mit stimmenden Prüfsummen,
  Download im Browser, Vollbild bei 7 Größen auch im Zustand „Ergebnis“). `npm run gegenprobe` **25 gefangen ·
  0 blind** (13 neue Fälle für Stufe 2, erster voller Lauf).
- ⚠ **Nicht gemessen:** ob ein echtes gereinigtes Projekt danach noch baut und läuft (Musterwerte können z. B.
  eine Prüfung im Code stören); Download und Speicher am Tablet; große Projekte (das ZIP entsteht ganz im Speicher).
- ⚠ **Bekannte Lücke bis Stufe 3:** Straße, PLZ, Ort, Firma werden noch nicht gefunden — im Beispiel bleibt
  „Musterweg 1“ im Impressum stehen. Deshalb bleibt der eigene Blick Pflicht.

## Jede Dateiart: Archive auspacken, Bilder ohne Metadaten (2026-10-28, nach Stufe 2)

Klaus: *„Wichtig ist, dass man da auch ZIPs entpacken kann und PNGs laden, SVGs und alle Dateien, Typen.“*

- **Gemessen vorher (echter Browser, Dateifeld):** ein ZIP **im** Projekt wurde nicht ausgepackt — und stand ohne
  Fund auf „unverändert übernehmen“. Eine Mail-Adresse darin wäre ungesehen in die saubere Kopie gegangen. tar.gz
  wurde nur nach Zeichenketten durchsucht, ein PNG mit Metadaten konnte nur weggelassen werden. SVG ging schon.
- **Jetzt:** ZIP, tar, tar.gz/.tgz und .gz werden **in jeder Tiefe** ausgepackt (bis 4 Ebenen, darunter benannt
  und ungeprüft) und jede Datei darin einzeln geprüft und entschieden. Die saubere Kopie packt jedes Archiv
  **von innen nach außen neu**, in seiner Art; ein weggelassenes Archiv nimmt seinen Inhalt mit. Die Nachprüfung
  packt die Kopie wieder aus. Andere Archive (.jar, .apk, .7z, .rar) heißen **ungeprüft** und sind standardmäßig weg.
- **PNG, JPEG (auch progressiv), WebP:** neue Wahl **„Ohne Metadaten übernehmen“** (Vorgabe, solange im Bild keine
  harten Angaben gefunden wurden). Entfernt werden EXIF mit GPS, XMP, Text-Felder, Kommentare, Zeitstempel und
  alles hinter dem Bildende (z. B. ein angehängtes ZIP). Die **Bildpunkte bleiben gleich** — Pillow vergleicht sie.
  ⚠ Sichtbarer Text im Bild und Botschaften in den untersten Bits bleiben; deshalb nennt die Nachprüfung jedes
  Bild „ungeprüft“ (gelb, nicht rot). Das Neuzeichnen mit grauen Kästen bleibt Stufe 4.
- **Jede andere Datei** wird geladen und mindestens nach Zeichenketten durchsucht (Stufe 1). PDF, Office, GIF und
  Unbekanntes: übernehmen (nur ohne Funde) oder weglassen, bis Stufe 4.
- **Proben:** Testdateien in `tests/muster/`, gebaut mit Python und Pillow (`tools/muster-bauen.py`), damit der
  eigene Leser nicht am eigenen Schreiber gemessen wird. Die saubere Kopie liest ein fremder Leser
  (`tests/muster-pruefen.py`: zipfile, tarfile, Pillow). Im Browser über das echte Dateifeld: ZIP + JPEG + WebP
  zusammen, bauen, herunterladen, fremd prüfen. `npm test` **164 grün · 0 ROT**; `npm run gegenprobe`
  **37 gefangen · 0 blind** (12 neue Fälle; erster Lauf 2 blind — kein reines .tar in den Testdateien, und die Probe
  verlangte keinen Rest-Fund im Archiv; beide geschärft).
- **Hineinziehen** (Klaus: *„per Reinziehen, das wäre bei Windows sinnvoll … oder die Dateiordner“*): Dateien,
  ZIPs und ganze Ordner aufs Fenster ziehen, beliebig tief; `node_modules` wird nicht geöffnet. Nachgebessert:
  die Größe wird jetzt vor dem Lesen bestimmt (vorher hätte eine riesige gezogene Datei den Deckel umgangen), und
  die Ablagefläche erscheint nur bei Dateien, nicht beim Ziehen von Text. Geprüft mit einem Loslassen mit echten
  Dateien und einem Ordnerbaum wie aus Chrome (4 Gegenprobe-Fälle). ⚠ Ein echtes Ziehen aus dem
  Windows-Explorer ist nicht gemessen. Der Knopf „📁 Ordner“ geht am Windows-PC; am Android-Handy bieten die
  meisten Browser keine Ordnerwahl — dort ein ZIP nehmen.
- ⚠ **Nicht gemessen:** echte Kamerafotos (Samsung-Bewegungsfoto, HEIC — HEIC wird nur benannt), große Archive
  am Tablet, Archive mit Namen in anderen Zeichensätzen als UTF-8.

## Aussehen: flach, ohne Emojis (Klaus 2026-10-28)

Klaus: *„keine Emojis verwenden, Strichgrafiken und flache Button … nicht so hoch … So praktische
Anwendungs-App … diese typischen Linksschatten … Mach lieber einen 3D-Schatten rein … ganz wenig, nur sehr zart.“*

- **Keine Emojis** in der Oberfläche. Icons sind **Strichgrafiken** (eine kleine SVG-Sammlung in `index.html`,
  `icon()` in `app.js`): Archiv, Ordner, Beispiel, Neu, Bauen, Herunterladen, Warnung, Haken.
- **Knöpfe niedriger:** 36 px (vorher 44), in der Leiste 32 px, im Kopf 32 px; Reiter 36 px.
- **Kein farbiger Streifen links** an den Fund-Karten. Die Schicht zeigt ein kleiner Punkt vor der Art.
- **Ein zarter, erhabener Schatten** an Knöpfen, Karten und der Nachprüfung: oben ein heller Lichtrand, unten ein
  weicher, sehr schwacher Schatten; beim Drücken sinkt der Knopf leicht ein.

## Vorschläge: Text und Dokumente an eine KI und zurück (Klaus 2026-10-28, noch nicht gebaut)

Klaus: *„Ich ziehe den Brief hinein, er wird gecleant und dann kann ich die clean Variante kopieren und direkt in
eine KI einfügen … der Prompt soll gleich mitgeliefert werden … KI schreibt den Brief wieder zurück und dann wieder
einfügen.“* Und: *„Es soll wirklich ein Projektcleaner bleiben … für das andere könnte man dann andere Programme
nehmen. Es geht darum, versteckte Dinge zu cleanen.“* Und zu PDF: *„ein PDF ist noch kein Dokument, was man ändern
kann … ausfüllen können oder notfalls unterschreiben und dann wieder weg … oder weiterleiten an ein anderes Programm.“*

**Grundsatz:** Der Reiniger **reinigt und gibt zurück**. Bearbeiten, Formularfelder ausfüllen und Unterschreiben
gehören in ein anderes Programm (Workflow PDF Pro). Der Reiniger ist die Schleuse davor und danach.

**Vorschlag A · KI-Paket (klein, passt in den Reiniger):**
1. **Hinein:** Text mit Strg+V einfügen, oder eine Datei hineinziehen: Text, Mail (`.eml`), Word, PDF mit Textebene
   (pdf.js ist schon da). Ein **gescanntes PDF oder Foto** braucht Texterkennung (OCR); Tesseract liegt im
   Auslieferungsprüfer und im Sende-Prüfer bereit und käme byte-gleich herüber, **nur auf Knopfdruck**.
2. **Reinigen** wie bei Projekten: Marken `⟦NAME-1⟧`, je Wert einmal entscheiden.
3. **„Mit Anweisung kopieren“:** ein einziger Block für ChatGPT & Co., bestehend aus:
   - der Aufgabe, entweder zum Antippen (Brief an eine Behörde, Bewertung, Zusammenfassung, Antwort entwerfen,
     Widerspruch) oder selbst geschrieben;
   - den festen Regeln: Marken unverändert lassen, nichts erfinden, Fehlendes als `[bitte ergänzen: …]`;
   - dem gereinigten Text.
4. **Zurück:** die Antwort der KI einfügen. Sie wird erst geprüft: Steht eine Anweisung an eine KI darin, oder gibt
   es eine Marke, die nicht von uns stammt? Danach werden die Marken mit den echten Werten gefüllt. Das ist
   `fuelle` aus Stufe 6, für Text ist es einfach. Ergebnis: kopieren, als Datei speichern oder **an ein anderes
   Programm teilen**.
- Die Zuordnung bleibt dabei im Speicher (bis „Neu“). Soll sie einen Neustart überleben, braucht es den Tresor
  (Stufe 5).
- ⚠ **Überschneidung:** Der **Sende-Prüfer** kann genau das schon für Mail-Text: Aufgaben zum Antippen,
  „Anweisung bauen“ und den Rückweg. Vorschlag: nicht doppelt bauen, sondern dieselben Teile nutzen (Modul 25
  ist schon gemeinsam; dazu `anweisung` und die Aufgabenliste). Neu wären hier nur Dokumente, OCR und Archive.

**Vorschlag B · Weiterreichen statt Bearbeiten:**
- Der Reiniger reicht die gereinigte bzw. zurückgefüllte Fassung **weiter**: Teilen-Knopf (Android/Windows) und
  Download. **Workflow PDF Pro** nimmt sie zum Ausfüllen, Unterschreiben und Versenden.
- **PDF-Formulare:** Der Reiniger liest die Feldnamen und den Text, reinigt beides und gibt es der KI. Die KI liefert
  die **Feldwerte mit Marken** (z. B. als Liste „Feld → Wert“). Der Reiniger füllt die Marken zurück, und Workflow
  PDF trägt die Werte ins Formular ein. Ausgefüllt wird also nicht im Reiniger.

**Sprechen statt Tippen:** Die eingebaute Spracherkennung von Chrome schickt den Ton an Google. Das widerspricht
„nichts geht ins Netz“, deshalb wird sie nicht eingebaut. Stattdessen das **Mikrofon der Handy-Tastatur** benutzen.
⚠ Auch die Tastatur kann den Ton ins Netz schicken; bei Gboard lässt sich die Offline-Spracheingabe einschalten.

**Vorgeschlagene Reihenfolge** (Klaus entscheidet): erst Stufe 3 (gefühlte Metadaten), dann **A** als eigener
Eingang „Text oder Dokument an eine KI“ (ohne OCR), dann OCR auf Knopfdruck, dann B zusammen mit Workflow PDF Pro.

## Installieren, Aktualisieren, Rundweg, Fortschritt, Teilansicht (Klaus 2026-10-28)

Klaus: *„einen Aktualisierungsbutton. Und einen Installationsbutton … der Browser braucht einen extra Anstoß“* ·
*„es muss sowohl der Installation, der Importweg wie auch der Neubauweg als auch der Exportweg geklärt sein … wieder
importiert werden können. Und trotzdem muss sich gemerkt werden, was das für eine Datei war“* · *„eine Prüfung immer
zur Zeit … mit Ladebalken … damit ich nicht denke, die ist abgestürzt“* · *„auch in der Teilansicht gut aussehen“* ·
*„einfacher durch Zahlenwerte … Doppelklammer“*.

- **Installieren** (`assets/geraet.js`, Bauart aus dem Sende-Prüfer bzw. Sage #1151–#1153): Die App fängt das Angebot
  des Browsers ab (`beforeinstallprompt`) und ruft es auf Knopfdruck auf; dann öffnet sich **sein** Dialog. Bietet er
  nichts an, nennt der Knopf die Gründe und den Weg über das Menü (Android-Chrome, Windows-Edge/Chrome). Läuft die App
  schon installiert, gibt es keinen Knopf.
- **Aktualisieren:** Der runde Knopf wirft nur den eigenen Vorrat (`reiniger-…`) weg, meldet den Service-Worker ab und
  lädt mit geänderter Adresse neu. Es gehen keine Daten verloren, die App speichert keine.
- **Rundweg: was hineinkommt, geht in derselben Form hinaus**, mit dem Namen `…-sauber`:
  | hinein | hinaus |
  |---|---|
  | eine Datei (Text, SVG, Bild …) | dieselbe Datei; Stellenplan und Bericht als eigene Downloads |
  | ZIP | ZIP, mit `_reiniger/` darin |
  | tar / tar.gz | dasselbe Archiv, mit `_reiniger/` darin |
  | .gz | dieselbe gz-Datei |
  | Ordner oder mehrere Dateien | ZIP; am Windows-PC (Chrome/Edge) zusätzlich **„In Ordner speichern“**, als neuer Ordner `…-sauber` |
- **Was die Datei war, steht im Stellenplan** (`stellenplan.json`, Fassung 2): Herkunft (Form, gereinigter Name,
  Datum, Kern-Fassung) und je Datei, was sie war (z. B. „PNG-Bild“) und was mit ihr geschah (reinigen, ohne
  Metadaten, weg). Werte stehen nicht darin, auch der Name des Ordners wird mit gereinigt.
- **Wieder-Import:** Die eigene Kopie wird erkannt („Gereinigte Kopie erkannt“). Der alte Stellenplan und Bericht
  werden nicht durchsucht und nicht doppelt ausgegeben; der alte Plan steht im neuen unter `frueher`, über beliebig
  viele Läufe. **Die Nummern zählen weiter:** Eine neue Person bekommt nicht noch einmal ⟦NAME-1⟧. Eigene Musterwerte
  früherer Läufe stehen auf „Behalten“, und die eigenen Marken sind keine Funde.
- **Marken überall** (Zahl in Doppelklammer, wie im Sende-Prüfer): Text, Code, Konfiguration und Dateinamen bekommen
  dieselbe Marke, gleicher Wert gleiche Nummer. package.json bleibt gültiges JSON. Der Musterwert ist nur noch eine Wahl.
  Gefunden beim Bauen: Die alten Musterwerte im Code hielt die App beim Wieder-Import für neue Funde. Mit Marken kann
  das nicht passieren.
- **Fortschritt, eine Arbeit zur Zeit:** Oben steht immer der Schritt (Einlesen, Auspacken, Prüfen, Reinigen, Neu
  packen, Nachprüfung, Ausgabe packen), dazu die Datei, „n von N · %“, ein Balken, die Laufzeit in Sekunden und ein
  drehendes Zeichen. Wer währenddessen etwas startet, liest: „Es läuft gerade: … Eine Arbeit zur Zeit.“
- **Teilansicht:** Die Vollbild-Probe misst jetzt zusätzlich halben Desktop (960×1080), Tablet geteilt (600×960)
  und halbes Handy (412×420). Die Kopfleiste lief bei 600 px über; die Knöpfe zeigen bis 700 px nur das Icon.
  Bei wenig Höhe (Handy quer, halber Bildschirm) scrollt der ganze Arbeitsbereich in einem Stück, statt Funde und
  Inventur in einen schmalen Streifen zu pressen. „Neu“ hat ein eigenes Zeichen (neues Blatt), damit es nicht wie
  „Aktualisieren“ aussieht.
- Proben: `npm test` **212 grün · 0 ROT**; `npm run gegenprobe` **55 gefangen · 0 blind** (14 neue Fälle; zwei waren
  zuerst blind, beide in der Probe, geschärft). ⚠ Nicht gemessen: der echte Installations-Dialog (in der Probe
  nachgestellt), das Speichern in einen echten Ordner (Ordner-Dialog nachgestellt), das Tablet.

## Vorschläge: große Dateien, native App, SD-Karte, verschlüsselte Ablage (Klaus 2026-10-28, noch nicht gebaut)

Klaus: *„ZIP-Dateien sind etwas größer. Die Browser-Variante wird wahrscheinlich diese nicht unbedingt alles
verarbeiten können … zu einer nativen App übergehen und dann … zu einer Windows-Web-App … den Ordner für die
Dateiauslagerung auf der SD-Karte … Auch verschlüsselt … Vielleicht hast du bessere Ideen.“*

**Heute (gemessen ist nur Kleines):** Der Browser liest ein eingeworfenes ZIP einmal ganz in den Speicher und baut
die Kopie ebenfalls ganz im Speicher. Am PC tragen das einige hundert MB, am Handy weniger. Die Grenze am Tablet ist
nicht gemessen.

**Bessere Reihenfolge (Vorschlag):**
1. **Erst den Speicher entlasten, in derselben Codebasis:** Das ZIP wird stückweise gelesen (`File.slice`): nur das
   Inhaltsverzeichnis am Ende und jede Datei erst, wenn sie dran ist. Die Kopie wird **stückweise geschrieben**, am
   PC direkt auf die Platte (`showSaveFilePicker` / `showDirectoryPicker`, Chrome und Edge). Dann begrenzt nicht mehr
   der Arbeitsspeicher, sondern der Plattenplatz. Das hilft überall, auch später in der APK.
2. **Windows: die installierte App ist schon die „Windows-Web-App“.** In Edge oder Chrome installiert, darf sie
   Ordner lesen und schreiben, auch auf SD-Karte und USB-Stick („In Ordner speichern“ gibt es schon). Eine eigene
   Windows-Hülle (Tauri/Electron) braucht es erst, wenn das nicht reicht.
3. **Android: APK mit Capacitor**, wie Private Brain Pro und Workflow PDF Pro (eine Codebasis). Nur dort darf die App
   einen **festen Ordner auf der SD-Karte** wählen und behalten (Android-Speicherzugriff), und große Dateien streamen.
   Der Browser am Handy kann das nicht.
4. **Verschlüsselte Ablage = der Tresor aus Stufe 5, als Ordner:** Jede Datei wird einzeln verschlüsselt
   (AES-256-GCM mit dem Schloss `schluesseltresor.js`), dazu ein verschlüsseltes Verzeichnis. Ablage im gewählten
   Ordner (Windows: PWA, Android: APK, auf SD-Karte möglich), sonst als Download. Mit Ablaufdatum wie im Brief.
- ⚠ Die Gäste-Sperre und der Tresor gehören dazu. Erst wenn die App etwas ablegt, braucht sie einen Code.

## Grenzen (vorab benannt)

- Die Suche arbeitet mit Mustern und Listen. Sie findet viel, aber **nicht garantiert alles**.
- Leicht durch fallen versteckte Daten (Base64, verschlüsselt), zusammengepresster Code und
  Datenbank-Dateien. Datenbanken lassen sich nur entfernen, nicht reinigen.
- Klaus' Blick auf die Befundliste bleibt deshalb Pflicht.

## Offen

- Musterwert oder Marke als Vorgabe für JSON/YAML? Jetzt: Musterwert (Konfiguration zählt wie Code).
- Sollen `_reiniger/`-Dateien im ZIP liegen (jetzt ja) oder nur einzeln heruntergeladen werden?
- KI-Paket (Vorschlag A): im Reiniger als eigener Eingang, oder Dokumente/OCR in den Sende-Prüfer? Und wann?
- Große Dateien und Ablage: Reihenfolge 1 (stückweise lesen/schreiben) → 2 (Windows-PWA mit Ordnern) → 3 (APK mit
  SD-Ordner) → 4 (verschlüsselte Ablage)? Oder APK zuerst?
- Eigene Adresse (Unterdomain) oder fürs Erste github.io?
- ✅ Das Repo gibt es: `project-cleaner-pro` (Klaus 2026-10-28). Stufe 1 liegt darin.
- GitHub Pages einschalten (Klaus, Einstellungen des Repos).
- Soll die Anzeige die gefundenen Werte im Klartext zeigen (so jetzt, nur auf dem Gerät) oder erst auf Tipp?
- Was geschieht mit dem Original-Branch in Meine-Familienakte (Fund oben)?
