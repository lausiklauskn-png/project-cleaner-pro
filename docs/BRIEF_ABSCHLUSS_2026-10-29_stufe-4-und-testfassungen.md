# Abschluss 2026-10-29 — Stufe 4, Hell/Dunkel, Testfassungen (Claude)

Eine Claude-Sitzung hat auf Klaus' Kurzauftrag Stufe 4 gebaut, auf seine Hinweise während der Arbeit den Hell/Dunkel-Modus
und die Schrift-Proben ergänzt und auf sein Wort („die Zwischenstufe schon mal veröffentlichen … die PWA-App, die APK und
die Windows-Version zum Testen“) veröffentlicht. Plan und Stand: [Brief](BRIEF_2026-10-28_projekt-reiniger-pro.md).
Funde und Lehren: [Forschung](FORSCHUNG_2026-10-29_stufe-4.md). Bilder: [`bilder-stufe-4/`](bilder-stufe-4/).

## Veröffentlicht

| Fassung | Wo | Stand |
|---|---|---|
| PWA, Fassung 7 | https://lausiklauskn-png.github.io/project-cleaner-pro/ — „Aktualisieren“ im Kopf tippen | main |
| Android-Testfassung | Release **testfassung**: `Projekt-Reiniger-Pro-Test-7.apk` | __APK__ |
| Windows-Testfassung | Release **testfassung**: `Projekt-Reiniger-Pro-Test-7-Windows-Setup.exe` | __EXE__ |

Release-Seite: https://github.com/lausiklauskn-png/project-cleaner-pro/releases/tag/testfassung (jede neue Fassung auf
main ersetzt sie; Prüfsummen liegen daneben).

## PRs (nach grünen Proben selbst gemergt, Freibrief NETZWEIT § 1)

- #7 Stufe 4: neu gezeichnete Blätter, Mustermappe, Hell/Dunkel — `npm test` 222 grün, Gegenprobe 48 gefangen · 0 blind.
- #8 Testfassungen: Android-APK (Capacitor 8.5.3) und Windows-Setup (Tauri 2) — `npm test` 225 grün, Bau auf GitHub grün.

## So testet Klaus (im Groben: funktioniert das Vorhaben?)

1. **PWA am Handy:** Seite öffnen, „Aktualisieren“ tippen, „Beispielprojekt“ → Funde → „Saubere Kopie bauen“ → ZIP laden.
   Hell/Dunkel: Halbkreis-Knopf oben.
2. **Eine echte PDF und ein Foto** einwerfen → bei der PDF steht „Neu zeichnen“; „Saubere Kopie bauen“ → „Vorher / nachher
   ansehen“: graue Kästen an den Stellen, kein Text mehr darunter.
3. **APK:** laden, öffnen, Installation aus dieser Quelle erlauben. Beim Speichern öffnet sich „Speichern unter“.
4. **Windows:** Setup laden, „Weitere Informationen → Trotzdem ausführen“ (unsigniert), dann wie die PWA.

## Grenzen, ehrlich

- Nichts am echten Handy, Tablet oder Windows-Rechner gemessen. Ob Texterkennung (WebAssembly) und pdf.js in der
  Android-WebView und in WebView2 laufen, ist **nicht gemessen** — die PWA-Proben laufen in Chromium.
- APK mit Debug-Schlüssel (jede Testfassung hat einen anderen: vor der nächsten die alte deinstallieren); Windows unsigniert.
- Kein Pinsel zum Abdecken von Hand; ODT und alte .doc/.xls werden nicht neu gebaut; große PDFs/Fotos am Gerät nicht gemessen.
- **Stunden nicht eingetragen:** das Fahrtenbuch liegt in Kimhub; das Anhängen von Kimhub an diese Sitzung lehnte der
  Sicherheitsfilter ab. Eintrag zum Übernehmen unten.

## Stunden (zum Eintragen ins Fahrtenbuch)

| Datum | von–bis (UTC) | Dauer | Repo | Was |
|---|---|---|---|---|
| 2026-10-28/29 | __ZEIT__ | __DAUER__ | project-cleaner-pro | Stufe 4 (Blätter, Mustermappe), Hell/Dunkel + Kontrast, Schrift-Proben, Testfassungen APK/Windows, Veröffentlichung (#7, #8) |

## Nächste Sitzung

```
Repo lausiklauskn-png/project-cleaner-pro. Lies docs/BRIEF_2026-10-28_projekt-reiniger-pro.md
(und die CLAUDE.md) und setze den nächsten offenen Schritt um: Klaus' Befund zu den Testfassungen
(PWA, APK, Windows) einarbeiten, danach Stufe 5 (Tresor und Gäste-Sperre).
Am Ende: Brief nachziehen und wieder so einen Kurzauftrag ausgeben.
```
