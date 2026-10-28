/* Projekt-Reiniger Pro — Installieren und Aktualisieren (Klaus 2026-10-28).
 *
 * Bauart aus dem Sende-Prüfer (installieren.js, neuladen.js; dort Sage-Protokol #1151–#1153), hier
 * angepasst: keine Emojis, Strich-Icons, und kein CSS aus dem Skript (die CSP erlaubt nur app.css).
 *
 * Installieren: der Browser bietet die Installation erst an, wenn die Seite sie anstößt. Die App
 * fängt sein Angebot (beforeinstallprompt) ab und ruft es auf Knopfdruck auf — dann öffnet sich
 * SEIN Dialog. Bietet er nichts an, nennt der Knopf die Gründe und den Weg über das Menü.
 * Läuft die Seite schon als App, gibt es keinen Knopf.
 *
 * Aktualisieren: wirft nur den EIGENEN Vorrat weg (Präfix „reiniger-“; github.io teilen sich viele
 * Apps), meldet den Service-Worker ab und lädt mit geänderter Adresse neu — erst eine andere Adresse
 * umgeht auch den HTTP-Cache. Es gehen keine Daten verloren: die App speichert keine.
 * Texte nur über textContent. */
(function () {
  "use strict";
  var ereignis = null;
  var EIGEN = /^reiniger-/;

  function alsApp() {
    try {
      return (window.matchMedia && (matchMedia("(display-mode: standalone)").matches ||
        matchMedia("(display-mode: window-controls-overlay)").matches ||
        matchMedia("(display-mode: minimal-ui)").matches)) || navigator.standalone === true;
    } catch (_e) { return false; }
  }

  function melde(text) {
    var m = document.getElementById("geraet-meldung");
    if (!m) {
      m = document.createElement("div");
      m.id = "geraet-meldung"; m.className = "geraet-meldung"; m.setAttribute("role", "status");
      var zu = document.createElement("button");
      zu.type = "button"; zu.className = "knopf klein-knopf"; zu.textContent = "Schließen";
      zu.addEventListener("click", function () { m.hidden = true; });
      var t = document.createElement("p"); t.id = "geraet-meldung-text";
      m.appendChild(t); m.appendChild(zu);
      document.body.appendChild(m);
    }
    document.getElementById("geraet-meldung-text").textContent = text;
    m.hidden = false;
  }

  function zeichnen() {
    var k = document.getElementById("installieren");
    if (!k) return;
    var app = alsApp();
    k.hidden = app;
    k.dataset.lage = app ? "app" : (ereignis ? "angeboten" : "nicht-angeboten");
    k.title = ereignis ? "Als App installieren" : "Installieren — der Browser bietet es gerade nicht an, ein Tipp sagt warum";
  }

  function installieren() {
    if (alsApp()) return;
    if (ereignis) {
      var e = ereignis; ereignis = null;
      e.prompt();
      Promise.resolve(e.userChoice).then(function (w) {
        melde(w && w.outcome === "accepted"
          ? "Installiert. Die App liegt jetzt auf dem Startbildschirm bzw. im Startmenü."
          : "Nicht installiert — abgebrochen.");
        zeichnen();
      }).catch(zeichnen);
      return;
    }
    melde("Der Browser bietet die Installation gerade nicht an.\n\n" +
      "Häufigster Grund: er hält die App schon für installiert. Trägt das Symbol auf dem Startbildschirm " +
      "ein kleines Chrome-Zeichen, ist es nur eine Verknüpfung, keine App. Dann: Symbol lange drücken, " +
      "entfernen, diese Seite neu laden und hier noch einmal „Installieren“ tippen.\n\n" +
      "Von Hand: Chrome-Menü (drei Punkte) → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“. " +
      "Unter Windows in Edge oder Chrome: das Installieren-Zeichen rechts in der Adresszeile.\n\n" +
      "Bitte NICHT „Websitedaten löschen“: alle Apps unter dieser Adresse teilen sich einen Speicher.");
  }

  async function aktualisieren() {
    var k = document.getElementById("aktualisieren");
    if (k) { k.disabled = true; k.dataset.laedt = "1"; }
    try {
      if (window.caches && caches.keys) {
        var namen = await caches.keys();
        await Promise.all(namen.filter(function (n) { return EIGEN.test(n); }).map(function (n) { return caches.delete(n); }));
      }
    } catch (_e) {}
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
        var regs = await navigator.serviceWorker.getRegistrations(), hier = new URL("./", location.href).href;
        await Promise.all(regs.filter(function (r) { return r.scope === hier; }).map(function (r) { return r.unregister(); }));
      }
    } catch (_e) {}
    location.replace(location.pathname + "?frisch=" + Date.now() + location.hash);
  }

  function einhaengen() {
    try {
      if (/[?&]frisch=/.test(location.search) && history.replaceState) {
        var rest = location.search.replace(/[?&]frisch=\d+/, "").replace(/^&/, "?");
        history.replaceState(null, "", location.pathname + rest + location.hash);
      }
    } catch (_e) {}
    var i = document.getElementById("installieren"), a = document.getElementById("aktualisieren");
    if (i) i.addEventListener("click", installieren);
    if (a) a.addEventListener("click", aktualisieren);
    zeichnen();
  }

  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); ereignis = e; zeichnen(); });
  window.addEventListener("appinstalled", function () { ereignis = null; zeichnen(); melde("Installiert."); });
  try { matchMedia("(display-mode: standalone)").addEventListener("change", zeichnen); } catch (_e) {}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", einhaengen); else einhaengen();
  window.ReinigerGeraet = { alsApp: alsApp, lage: function () { var k = document.getElementById("installieren"); return k ? k.dataset.lage : null; } };
})();
