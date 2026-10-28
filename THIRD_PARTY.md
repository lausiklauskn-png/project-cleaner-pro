# Mitgelieferte Fremd-Bibliotheken

| Datei | Was | Lizenz | Herkunft |
|---|---|---|---|
| `vendor/pdfjs/pdf.min.js`, `vendor/pdfjs/pdf.worker.min.js` | PDF.js 3.11.174, Mozilla Foundation | Apache License 2.0 | byte-gleich aus dem Sende-Prüfer (`vendor/pdfjs/`), dort aus Workflow PDF |

Die Lizenzköpfe in den Dateien bleiben erhalten. Lizenztext: <https://www.apache.org/licenses/LICENSE-2.0>

⚠ pdf.js 3.x konnte mit einer präparierten Schrift eigenen Code ausführen (CVE-2024-4367). Der
Anhang-Prüfer (`assets/pruefer-anhang.js`, byte-1:1, SHA-gepinnt) betreibt es mit `isEvalSupported: false`,
und die Seite verbietet `unsafe-eval` in ihrer CSP.
