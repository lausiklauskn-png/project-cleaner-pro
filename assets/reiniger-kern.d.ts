/* Typen zu reiniger-kern.js (Projekt-Reiniger Pro, Stufen 1–4). Für die Familienakte (TypeScript).
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

/* ── Stufe 2: entscheiden, reinigen, nachprüfen ───────────────────────── */
export type Weg = "auto" | "marke" | "muster" | "eigen" | "behalten" | "zeile";
export type DateiWeg = "neu" | "muster" | "weg" | "original";
export const WEGE: Weg[];
export const WEG_NAME: Record<string, string>;
export const STELLENPLAN_DATEI: string;
export const STELLENPLAN_JSON: string;
export const BERICHT_DATEI: string;
export interface Stelle {
  pfad: string; zeile?: number; stelle?: string; art: string; artName: string; weg: string; ersatz: string;
  /** Stufe 4: Kasten auf einem neu gezeichneten Blatt (Seiteneinheiten bzw. Bildpunkte des Originals). */
  kasten?: { seite: number; x: number; y: number; w: number; h: number };
}
export interface DateiPlanEintrag { pfad: string; grund: string; befunde: number; marken: string[]; wege: DateiWeg[]; vorgabe: DateiWeg; blatt: "bild" | "pdf" | "office" | null; muster: string | null; }
export interface Entscheidungen {
  ergebnis: Ergebnis;
  wahl?: Record<string, { weg: Weg; wert?: string }>;
  /** alt (Stufe 2): Pfade, die unverändert mitgehen — gleich `dateiWahl[pfad] = "original"` */
  uebernehmen?: string[];
  dateiWahl?: Record<string, DateiWeg>;
  mustermappe?: boolean;
}
export interface ReinigenOptionen { werkzeuge?: Werkzeuge & { Zeichner?: Zeichner; WFP?: unknown; PrueferMail?: unknown }; texterkennung?: boolean; begriffe?: string[]; fortschritt?: (nr: number, gesamt: number, pfad: string) => void; }
export interface SaubereDatei { pfad: string; von?: string; bytes: Uint8Array; gereinigt?: number; unveraendert?: boolean; neu?: string; muster?: string; mappe?: boolean; }
export interface Gereinigt {
  sauber: SaubereDatei[]; stellenplan: Stelle[];
  /** NUR im Speicher halten — nie in die Kopie (Tresor: Stufe 5). */
  zuordnung: Record<string, { art: string; werte: string[]; muster: string; eigen?: string }>;
  bericht: Record<string, unknown>;
}
export interface Nachpruefung { offen: Buendel[]; behalten: number; originalTreffer: Array<{ pfad: string; art: string; artName: string }>; ungeprueft: number; ungeprueftListe: Array<{ pfad: string; grund: string }>; }
export function buendelSchluessel(b: Befund | Buendel): string;
export function ersetzbar(b: Buendel): boolean;
export function reinigbar(e: InventurEintrag): boolean;
export function dateiPlan(ergebnis: Ergebnis): DateiPlanEintrag[];
export function reinige(dateien: Datei[], entscheidungen: Entscheidungen, optionen?: ReinigenOptionen): Promise<Gereinigt>;
export function nachpruefe(gereinigt: Gereinigt, optionen?: ReinigenOptionen & { zusatz?: Array<{ pfad: string; bytes: Uint8Array }> }): Promise<Nachpruefung>;
export function saubereKopie(dateien: Datei[], entscheidungen: Entscheidungen, optionen?: ReinigenOptionen): Promise<Gereinigt & { nach: Nachpruefung; beilagen: Array<{ pfad: string; bytes: Uint8Array }>; zip: Uint8Array }>;
export function zipBauen(dateien: Array<{ pfad: string; bytes: Uint8Array }>, opt?: { packen?: boolean }): Promise<Uint8Array>;
export function stellenplanText(stellenplan: Stelle[]): string;

/* ── Stufe 4: neu gezeichnete Blätter, Mustermappe ─────────────────────── */
/** Bildpunkte wie ImageData (RGBA). */
export interface Bildpunkte { width: number; height: number; data: Uint8ClampedArray | Uint8Array; }
/** Ein Stück Text einer PDF-Seite: Seiteneinheiten, y = Grundlinie von oben; `anteile` = Beginn jedes Zeichens (0…1). */
export interface Stueck { s: string; x: number; y: number; w: number; fh: number; anteile?: number[] | null; schraeg?: boolean; kasten?: [number, number, number, number]; }
export interface Seite { bild: Bildpunkte; massstab: number; breite: number; hoehe: number; stuecke?: Stueck[] | null; woerter?: Array<Array<{ s: string; x0: number; y0: number; x1: number; y1: number }>> | null; }
/** Bringt der Aufrufer mit (Browser: Leinwand + pdf.js + Texterkennung). Der Kern kennt kein DOM. */
export interface Zeichner {
  oeffne(bytes: Uint8Array, art: string, opt: { texterkennung: boolean }): Promise<{ anzahl: number; seite(i: number): Promise<Seite>; freigeben?(i: number): void; schliessen?(): unknown }>;
  beschrifte?(seite: Seite, kaesten: Kasten[]): Promise<void> | void;
  kodiere(seite: Seite, art: "png" | "jpeg" | "webp"): Promise<{ bytes: Uint8Array; art: string }>;
}
export interface Kasten { x0: number; y0: number; x1: number; y1: number; etikett: string; p: unknown; alle?: unknown[]; }
export const BLATT_SEITEN_MAX: number;
export const DATEI_WEGE: DateiWeg[];
export const DATEI_WEG_NAME: Record<DateiWeg, string>;
export const MUSTERMAPPE_ORDNER: string;
export function blattArt(e: InventurEintrag): "bild" | "pdf" | "office" | null;
export function blattKaesten(seite: Seite, posten: unknown[], R?: unknown, versteckt?: Record<string, number>): Kasten[];
export function kastenMalen(bild: Bildpunkte, k: { x0: number; y0: number; x1: number; y1: number }): void;
export function rauschen(bild: Bildpunkte): void;
export function blattNeu(bytes: Uint8Array, eintrag: InventurEintrag, posten: unknown[], optionen?: ReinigenOptionen): Promise<{ bytes: Uint8Array; art: string; stellen: Stelle[] } | { fehler: string }>;
export function pdfBauen(seiten: Array<{ breite: number; hoehe: number; bild?: { jpeg: Uint8Array; w: number; h: number }; inhalt?: string }>): Uint8Array;
export function pngBauen(w: number, h: number, rgba: Uint8Array): Promise<Uint8Array>;
export function docxBauen(absaetze: string[]): Array<{ pfad: string; bytes: Uint8Array }>;
export function xlsxBauen(blaetter: Array<{ name: string; zellen: Array<{ r: string; wert: string; zahl: boolean }> }>): Array<{ pfad: string; bytes: Uint8Array }>;
export function pptxBauen(p: { folien: string[][]; cx?: number; cy?: number }): Array<{ pfad: string; bytes: Uint8Array }>;
export function mustermappe(): Promise<Array<{ pfad: string; bytes: Uint8Array }>>;
export function musterFuer(pfad: string): string | null;
