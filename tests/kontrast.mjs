/* Kontrast messen (Klaus 2026-10-29: „auf weiße Schrift achten und hellen Hintergrund“): jede sichtbare Schrift gegen
   ihren tatsächlichen Grund — auch Verläufe und halbdurchsichtige Flächen; der schlechteste Ton zählt. WCAG AA: 4,5 : 1, große Schrift 3 : 1. */
export function kontrast() {
  const rgb = (s) => (String(s).match(/rgba?\([^)]+\)/g) || []).map((x) => { const v = x.match(/[\d.]+/g).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const mische = (o, u) => ({ r: o.r * o.a + u.r * (1 - o.a), g: o.g * o.a + u.g * (1 - o.a), b: o.b * o.a + u.b * (1 - o.a), a: 1 });
  function gruende(e) {
    // von oben nach unten: alle Schichten bis zum ersten deckenden Grund
    const kette = [];
    for (let x = e; x; x = x.parentElement) kette.push(x);
    let unten = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (let i = kette.length - 1; i >= 0; i--) {
      const s = getComputedStyle(kette[i]);
      const bilder = /gradient/.test(s.backgroundImage) ? rgb(s.backgroundImage) : [];
      if (bilder.length) { unten = bilder.flatMap((b) => unten.map((u) => mische(b, u))); continue; }
      const f = rgb(s.backgroundColor)[0];
      if (f && f.a > 0) unten = unten.map((u) => mische(f, u));
    }
    return unten;
  }
  const fehler = [];
  const w = document.createTreeWalker(document.getElementById("app"), NodeFilter.SHOW_TEXT);
  const gesehen = new Set();
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const e = n.parentElement;
    if (!n.textContent.trim() || gesehen.has(e)) continue;
    gesehen.add(e);
    if (e.closest("[hidden], .ziehen") || e.closest("button:disabled, [disabled]")) continue;
    const s = getComputedStyle(e), r = e.getBoundingClientRect();
    if (s.visibility === "hidden" || r.width === 0 || r.height === 0 || +s.opacity === 0) continue;
    let ausgeblendet = false; for (let x = e; x; x = x.parentElement) if (getComputedStyle(x).display === "none") { ausgeblendet = true; break; }
    if (ausgeblendet) continue;
    const c = rgb(s.color)[0];
    const gross = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    const soll = gross ? 3 : 4.5;
    let schlecht = Infinity;
    for (const g of gruende(e)) { const vorn = c.a < 1 ? mische(c, g) : c; const a = lum(vorn), b = lum(g); schlecht = Math.min(schlecht, (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)); }
    if (schlecht < soll) fehler.push(e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "") + " „" + n.textContent.trim().slice(0, 24) + "“ " + schlecht.toFixed(2) + " < " + soll);
  }
  return fehler;
}
