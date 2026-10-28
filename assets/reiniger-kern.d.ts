/* Typen zu reiniger-kern.js (Projekt-Reiniger Pro, Stufe 1 + 2). Für die Familienakte (TypeScript). */

export interface Datei {
  /** Pfad mit „/“, relativ zum Projekt. */
  pfad: string;
  bytes?: Uint8Array;
  /** Wird erst gerufen, wenn die Datei gelesen werden soll (übersprungene nie). */
  lesen?: () => Promise<Uint8Array> | Uint8Array;
  groesse?: number;
  /** Grund, warum die Datei nicht lesbar ist (z. B. verschlüsselt im ZIP). */
  unlesbar?: string;
  /** Platzhalter für einen übersprungenen Ordner, der gar nicht geöffnet wurde. */
  nichtGeoeffnet?: boolean;
  /** Pfad des Archivs, aus dem die Datei ausgepackt wurde (die Kopie packt es neu). */
  archiv?: string;
  /** Nur am Archiv selbst: so viele Einträge wurden ausgepackt. */
  ausgepackt?: number;
  archivArt?: ArchivArt;
}

export type ArchivArt = "zip" | "tar" | "tgz" | "gz";

export type Schicht = "hart" | "meta" | "auffaellig";

export interface Befund {
  schicht: Schicht;
  /** MAIL, TELEFON, IBAN, DATUM, SCHLUESSEL, NAME, VERFASSER, COPYRIGHT, BENUTZERPFAD, GIT-NAME, GIT-ADRESSE oder eine Kennung aus pruefer-anhang.js */
  art: string;
  wert: string;
  pfad: string;
  zeile?: number;
  stelle?: string;
  satz?: string;
  /** Nur ein Vorschlag (Namen aus Anrede/Gruß) — nie sicher. */
  vorschlag?: boolean;
  /** Befund über die ganze Datei (Bild, PDF, Office): kein ersetzbarer Wert. */
  nurDatei?: boolean;
}

export interface Buendel {
  schicht: Schicht; art: string; artName: string; wert: string; vorschlag: boolean; nurDatei: boolean; satz: string;
  anzahl: number; dateien: number;
  stellen: Array<{ pfad: string; zeile?: number; stelle?: string }>;
}

export interface Marke { kennung: "GIT" | "ENV" | "SICHERUNG" | "DATENBANK" | "EXPORT" | "FOTO" | "PDF" | "OFFICE" | "SCHLUESSELDATEI" | "IMPRESSUM" | "ARCHIV" | "PROGRAMM"; satz: string; }

export interface InventurEintrag {
  pfad: string; groesse: number; art: string; artName: string;
  /** 1 voll reinigen · 2 neu bauen · 3 nur prüfen · 0 übersprungener Ordner */
  stufe: 0 | 1 | 2 | 3; stufeName: string;
  marken: Marke[]; gelesen: boolean;
  /** leer = vollständig geprüft; sonst der Grund, warum etwas ungeprüft blieb */
  ungeprueft: string;
  befunde: number;
  uebersprungen?: number; nichtGeoeffnet?: boolean; hinweise?: string[];
  /** als UTF-8-Text gelesen — lässt sich Stelle für Stelle reinigen */
  textlich?: boolean;
}

export interface Ergebnis {
  inventur: InventurEintrag[];
  befunde: Befund[];
  buendel: Buendel[];
  hinweise: string[];
  zahlen: { dateien: number; gelesen: number; uebersprungen: number; markiert: number; ungeprueft: number; befunde: number };
}

export interface Werkzeuge { SbkimPseudonym?: unknown; PrueferAnhang?: unknown; }

export const KERN_FASSUNG: string;
export const UEBERSPRINGEN: string[];
export const GROESSE_MAX: number;
export const TEXT_MAX: number;
export const GIT_OBJEKTE_MAX: number;
export const SORTEN_HART: string[];
export const ART_NAME: Record<string, string>;
export const MARKE_NAME: Record<string, string>;
export const STUFE_NAME: Record<number, string>;

export function pruefe(dateien: Datei[], optionen?: { werkzeuge?: Werkzeuge; fortschritt?: (nr: number, gesamt: number, pfad: string) => void }): Promise<Ergebnis>;
export const ARCHIV_TIEFE_MAX: number;
export const ARCHIV_DATEIEN_MAX: number;
/** Packt ZIP, tar, tar.gz und .gz in jeder Tiefe aus (bis ARCHIV_TIEFE_MAX). */
export function einwerfen(liste: Datei[], optionen?: { wurzelZip?: boolean }): Promise<{ dateien: Datei[]; hinweise: string[] }>;
export function archivArtVon(pfad: string, kopf?: Uint8Array): ArchivArt | null;
export function tarDateien(bytes: Uint8Array, vorsilbe?: string): { dateien: Datei[]; hinweise: string[] };
export function archivBauen(art: ArchivArt, dateien: Array<{ pfad: string; bytes: Uint8Array }>): Promise<Uint8Array>;
/** PNG, JPEG, WebP ohne Metadaten und ohne Daten hinter dem Bildende; null, wenn das Format nicht sicher lesbar ist. */
export function ohneMetadaten(bytes: Uint8Array): { bytes: Uint8Array; entfernt: string } | null;
export function zipDateien(bytes: Uint8Array, vorsilbe?: string): { dateien: Datei[]; hinweise: string[]; kaputt?: boolean };
export function einordnen(pfad: string, art?: string): { stufe: 1 | 2 | 3; stufeName: string; marken: Marke[] };
export function uebersprungen(pfad: string): string | null;
export function zeichenketten(bytes: Uint8Array, min?: number, max?: number): string;
export function entpacke(daten: Uint8Array, format: "deflate" | "deflate-raw" | "gzip", max: number): Promise<Uint8Array>;
export function buendeln(befunde: Befund[]): Buendel[];

/* ── Stufe 2 ── */
export type Wie = "entfernen" | "muster" | "eigen" | "behalten";
export type DateiWie = "reinigen" | "metadaten" | "uebernehmen" | "weglassen";
export type MarkeArt = "NAME" | "MAIL" | "TELEFON" | "IBAN" | "DATUM" | "SCHLUESSEL" | "BENUTZER" | "ADRESSE" | "WERT";

export interface WertEntscheidung {
  /** wertSchluessel(wert): klein geschrieben, ohne Rand */
  schluessel: string; wert: string; arten: string[]; marke: MarkeArt; vorschlag: boolean; anzahl: number;
  wie: Wie; eigen: string;
  /** steht im Stellenplan eines früheren Laufs als Ersatz — unser eigener Musterwert, Vorgabe „behalten“ */
  frueherErsatz?: boolean;
}
export interface Entscheidungen {
  fassung: 1;
  werte: WertEntscheidung[];
  dateien: Record<string, { wie: DateiWie; moeglich: DateiWie[]; grund: string }>;
}
export interface Stelle {
  /** Pfad in der sauberen Kopie */
  pfad: string; zeile?: number; ort?: string;
  /** Marke ⟦ART-n⟧, Musterwert oder eigener Wert — nie der alte Wert */
  ersatz: string; art: MarkeArt; wie: "marke" | "muster" | "eigen";
}
export interface Gereinigt {
  sauber: Array<{ pfad: string; bytes: Uint8Array; gereinigt: boolean; archiv?: string; neuGepackt?: number; ohneMetadaten?: string }>;
  stellenplan: Stelle[];
  /** Marke → alter Wert. NUR im Speicher; abgelegt erst im Tresor (Stufe 5). */
  zuordnung: Array<{ marke: string; code: string; art: MarkeArt; wie: Wie; wert: string }>;
  weg: Array<{ pfad: string; grund: string }>;
  hinweise: string[];
  zahlen: { dateien: number; gereinigt: number; weg: number; git: number; uebersprungen: number; stellen: number; umbenannt: number; bilder: number; archive: number };
}
export interface Offen {
  grund: "rest" | "fund" | "ungeprueft"; pfad?: string; art?: string; artName?: string; wert?: string;
  nurDatei?: boolean; anzahl?: number; stellen?: Buendel["stellen"]; satz: string;
}

export const WIE_NAME: Record<Wie, string>;
export const DATEI_WIE_NAME: Record<DateiWie, string>;
export const MARKE_ART_NAME: Record<MarkeArt, string>;
export function wertSchluessel(wert: string): string;
export function istCode(pfad: string): boolean;
export function musterwert(marke: MarkeArt, n: number, alt?: string): string;
export function vorschlag(ergebnis: Ergebnis): Entscheidungen;
export function reinige(dateien: Datei[], entscheidungen: Entscheidungen): Promise<Gereinigt>;
export function nachpruefe(rein: Gereinigt, entscheidungen: Entscheidungen, optionen?: { werkzeuge?: Werkzeuge }): Promise<{ offen: Offen[]; ergebnis: Ergebnis; hinweise: string[] }>;
export function stellenplanText(rein: Gereinigt, jetzt?: Date): string;
export function stellenplanJson(rein: Gereinigt): string;
export function bericht(rein: Gereinigt, nach: { offen: Offen[] }, jetzt?: Date): string;
export function crc32(bytes: Uint8Array): number;
export function zipBauen(dateien: Array<{ pfad: string; bytes: Uint8Array }>): Promise<Uint8Array>;
export function ausgabe(rein: Gereinigt, nach: { offen: Offen[] }, jetzt?: Date): Promise<{ zip: Uint8Array; name: string; beilagen: Array<{ pfad: string; bytes: Uint8Array }> }>;
