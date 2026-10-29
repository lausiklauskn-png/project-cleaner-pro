# Mitgelieferte Fremd-Bibliotheken

| Datei | Was | Lizenz | Herkunft |
|---|---|---|---|
| `vendor/pdfjs/pdf.min.js`, `vendor/pdfjs/pdf.worker.min.js` | PDF.js 3.11.174, Mozilla Foundation | Apache License 2.0 | byte-gleich aus dem Sende-Prüfer (`vendor/pdfjs/`), dort aus Workflow PDF |
| `vendor/tesseract/tesseract.min.js`, `worker.min.js` | Tesseract.js 7.0.0 (naptha) | Apache-2.0, Lizenztext in `vendor/tesseract/LICENSE-Apache-2.0.txt`; gebündelte Hilfsbibliotheken in den `*.LICENSE.txt` daneben | byte-gleich aus Workflow PDF Pro (`upstream/workflow-pdf/vendor/tesseract/`), dort npm `tesseract.js@7.0.0`, `dist/`, unverändert |
| `vendor/tesseract/tesseract-core-*-lstm.wasm.js` | tesseract.js-core 7.0.0 (Tesseract OCR als WebAssembly) | Apache-2.0 | byte-gleich aus Workflow PDF Pro, dort npm `tesseract.js-core@7.0.0`, unverändert |
| `vendor/tesseract/lang/{deu,eng,rus}.traineddata` | tessdata_fast (Tesseract OCR) | Apache-2.0 | byte-gleich aus Workflow PDF Pro, dort `tesseract-ocr/tessdata_fast`, unverändert |

Die Lizenzköpfe in den Dateien bleiben erhalten. Lizenztext: <https://www.apache.org/licenses/LICENSE-2.0>

⚠ pdf.js 3.x konnte mit einer präparierten Schrift eigenen Code ausführen (CVE-2024-4367). Der
Anhang-Prüfer (`assets/pruefer-anhang.js`, byte-1:1, SHA-gepinnt) betreibt es mit `isEvalSupported: false`,
und die Seite verbietet `unsafe-eval` in ihrer CSP.

## Eigene Kerne aus Klaus' Repos (byte-1:1, SHA-gepinnt in `tests/probe.mjs`)

| Datei | Herkunft |
|---|---|
| `assets/reinigung.js` | Workflow PDF (`assets/reinigung.js`, Commit `a2cfdf1`): versteckten PDF-Text erkennen und zudecken, JPEG ohne Metadaten. Dort pflegen, hier neu kopieren. |
