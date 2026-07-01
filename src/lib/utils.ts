import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function truncate(str: string, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Decodifica le entita' HTML piu' comuni presenti nei dati grezzi ANAC
 * (entita' numeriche decimali/esadecimali + entita' nominali basilari).
 * Es: "attivit&#224;" -> "attività" · "Sant&#039;Arsenio" -> "Sant'Arsenio".
 */
export function decodeEntities(input?: string | null): string {
  if (!input) return '';
  const fromCp = (cp: number, original: string): string => {
    // Evita RangeError su entità malformate (codepoint fuori range o surrogati):
    // un singolo record sporco non deve far crashare l'intera pagina di listing.
    if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return original;
    try {
      return String.fromCodePoint(cp);
    } catch {
      return original;
    }
  };
  return input
    .replace(/&#(\d+);/g, (m, n) => fromCp(Number(n), m))
    .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => fromCp(parseInt(h, 16), m))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/**
 * Formatta importo EUR con separatore migliaia italiano e simbolo €.
 * Es: 12345.67 -> "12.345,67 €"
 */
export function formatEuro(value: number | null | undefined, opts: { decimals?: number; compact?: boolean } = {}): string {
  if (value === null || value === undefined) return '—';
  const { decimals = 0, compact = false } = opts;
  if (compact && value >= 1_000_000) {
    return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 }).format(value / 1_000_000) + ' mln €';
  }
  if (compact && value >= 1_000) {
    return new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(value / 1_000) + ' mila €';
  }
  return new Intl.NumberFormat('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value) + ' €';
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('it-IT').format(value);
}

/**
 * Formatta una quota/percentuale per la UI.
 * Accetta sia una frazione [0,1] (es. 0,47) sia un valore già in punti
 * percentuali (es. 14,1) tramite il flag `fraction`.
 * Es: formatPct(0.47) -> "47%" · formatPct(14.1, { fraction: false }) -> "14,1%"
 */
export function formatPct(
  value: number | null | undefined,
  opts: { fraction?: boolean; decimals?: number } = {},
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { fraction = true, decimals } = opts;
  const pct = fraction ? value * 100 : value;
  const dec = decimals ?? (Number.isInteger(pct) ? 0 : 1);
  return (
    new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec,
    }).format(pct) + '%'
  );
}

/**
 * Slugify standard italiano: lowercase, accenti rimossi, spazi -> -.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Titolo leggibile di un bando.
 * I dati grezzi hanno spesso l'oggetto degradato (es. "I"): in quel caso
 * costruiamo un fallback usando ente + categoria CPV + CIG.
 */
export function bandoTitolo(b: {
  oggetto?: string | null;
  stazione_appaltante?: string | null;
  cpv_principale?: string | null;
  cig?: string | null;
}, cpvLabel?: string): string {
  const oggetto = decodeEntities(b.oggetto).trim();
  if (oggetto.length >= 6) return oggetto;
  // Fallback editoriale: "<categoria CPV> — <ente>" o CIG
  const parts: string[] = [];
  if (cpvLabel) parts.push(cpvLabel);
  if (b.stazione_appaltante) parts.push(decodeEntities(b.stazione_appaltante));
  if (parts.length > 0) return parts.join(' — ');
  return b.cig ? `Bando di gara ${b.cig}` : 'Bando di gara pubblico';
}

/**
 * Giorni rimanenti alla scadenza (negativo se scaduto, null se assente).
 */
export function giorniAllaScadenza(scadenza: string | null | undefined): number | null {
  if (!scadenza) return null;
  const ms = new Date(scadenza).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
