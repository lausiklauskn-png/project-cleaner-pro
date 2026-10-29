/* Hell oder dunkel (Klaus 2026-10-29). Läuft vor dem ersten Zeichnen, damit nichts aufblitzt.
   Gemerkt wird nur diese eine Wahl („reiniger-thema“: hell, dunkel oder leer = wie das Gerät) — nie Inhalte. */
(function () {
  try { var t = localStorage.getItem("reiniger-thema"); if (t === "hell" || t === "dunkel") document.documentElement.dataset.thema = t; } catch (e) { /* privates Fenster */ }
})();
