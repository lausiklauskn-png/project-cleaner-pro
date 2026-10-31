/* Projekt-Reiniger Pro — Vorrat für offline. Abgelegt wird nur der Code der App, nie Daten.
   CACHE_VERSION erhöhen, wenn sich eine Datei aus CORE ändert. */
const CACHE_VERSION = "reiniger-v16";
const CORE = [
  "./", "index.html", "manifest.json", "assets/app.css", "assets/app.js", "assets/beispiel.js", "assets/reiniger-kern.js", "assets/reiniger-listen.js",
  "modules/25_pseudonym.js", "assets/pruefer-formate.js", "assets/pruefer-mail.js", "assets/pruefer.js", "assets/pruefer-anhang.js", "assets/reinigung.js", "assets/schluesseltresor.js", "assets/thema.js",
  "icons/logo-96.png", "icons/favicon-32.png", "icons/favicon-48.png", "icons/icon-192.png", "icons/kristall.webp",
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE_VERSION).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((treffer) => treffer || fetch(e.request).then((a) => {
    if (a.status === 200) { const k = a.clone(); caches.open(CACHE_VERSION).then((c) => c.put(e.request, k)); }
    return a;
  })));
});
