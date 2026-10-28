/* Typen zu reiniger-kern.js (Projekt-Reiniger Pro, Stufen 1 und 3). Für die Familienakte (TypeScript).
   Der Kern importiert reiniger-listen.js (Wortlisten) — beide Dateien wandern zusammen. */

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
}

/** hart · meta · gefuehlt (Stufe 3: verrät erst zusammen etwas) · auffaellig */
export type Schicht = "hart" | "meta" | "gefuehlt" | "auffaellig";

export interface Befund {
  schicht: Schicht;
  /** MAIL, TELEFON, IBAN, DATUM, SCHLUESSEL, NAME, VERFASSER, COPYRIGHT, BENUTZERPFAD, GIT-NAME, GIT-ADRESSE,
   *  gefühlt: ORT, HOCHSCHULE, FIRMA, ADRESSE, PLZ-ORT, KFZ, EIGENNAME, RECHNER, ORDNERPFAD,
   *  oder eine Kennung aus pruefer-anhang.js */
  art: string;
  wert: string;
  pfad: string;
  zeile?: number;
  stelle?: string;
  satz?: string;
  /** Nur ein Vorschlag (Namen aus Anrede/Gruß, Vornamen aus der Liste) — nie sicher. */
  vorschlag?: boolean;
}

export interface Buendel {
  schicht: Schicht; art: string; artName: string; wert: string; vorschlag: boolean; satz: string;
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
export const SORTEN_GEFUEHLT: string[];
export const ART_NAME: Record<string, string>;
export const MARKE_NAME: Record<string, string>;
export const STUFE_NAME: Record<number, string>;

export function pruefe(dateien: Datei[], optionen?: { werkzeuge?: Werkzeuge; fortschritt?: (nr: number, gesamt: number, pfad: string) => void }): Promise<Ergebnis>;
export function einwerfen(liste: Datei[]): Promise<{ dateien: Datei[]; hinweise: string[] }>;
export function zipDateien(bytes: Uint8Array, vorsilbe?: string): { dateien: Datei[]; hinweise: string[]; kaputt?: boolean };
export function einordnen(pfad: string, art?: string): { stufe: 1 | 2 | 3; stufeName: string; marken: Marke[] };
export function uebersprungen(pfad: string): string | null;
export function zeichenketten(bytes: Uint8Array, min?: number, max?: number): string;
export function entpacke(daten: Uint8Array, format: "deflate" | "deflate-raw" | "gzip", max: number): Promise<Uint8Array>;
export function buendeln(befunde: Befund[]): Buendel[];

export interface GefuehltFund { art: string; wert: string; index: number; satz: string; vorschlag?: boolean; }
/** Gefühlte Metadaten in einem Text. `modus: "pfad"` für Datei- und Ordnernamen. Ändert nichts. */
export function gefuehlt(text: string, optionen?: { modus?: "text" | "pfad" }): GefuehltFund[];
