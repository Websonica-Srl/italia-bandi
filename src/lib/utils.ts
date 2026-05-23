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
 * I dati TED hanno spesso l'oggetto degradato (es. "I"): in quel caso
 * costruiamo un fallback usando ente + categoria CPV + CIG.
 */
export function bandoTitolo(b: {
  oggetto?: string | null;
  stazione_appaltante?: string | null;
  cpv_principale?: string | null;
  cig?: string | null;
}, cpvLabel?: string): string {
  const oggetto = (b.oggetto || '').trim();
  if (oggetto.length >= 6) return oggetto;
  // Fallback editoriale: "<categoria CPV> — <ente>" o CIG
  const parts: string[] = [];
  if (cpvLabel) parts.push(cpvLabel);
  if (b.stazione_appaltante) parts.push(b.stazione_appaltante);
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
