/**
 * Helper per le pagine "stazione appaltante" (M6 — /ente/[slug]).
 *
 * La view `buyer_public` NON espone uno slug: la chiave è il nome esatto della
 * stazione appaltante (`stazione_appaltante`). Per avere URL puliti e stabili
 * costruiamo lo slug da `slugify(nome)`. Poiche' nomi diversi possono produrre
 * lo stesso slug (≈279 collisioni su 8.157), risolviamo SEMPRE lo slug al nome
 * canonico con una regola deterministica: tra i nomi che collidono vince quello
 * con piu' bandi (e, a parita', l'ordine alfabetico). Questo evita che la stessa
 * URL mostri enti diversi tra build successive.
 *
 * Lo slug NON contiene dati sensibili: il nome della stazione appaltante e' un
 * ente pubblico (persona giuridica), dato di gara pubblico per legge.
 */
import { slugify, truncate, decodeEntities } from '@/lib/utils';

/** Slug stabile per una stazione appaltante. */
export function buyerSlug(stazioneAppaltante: string): string {
  return slugify(stazioneAppaltante);
}

/**
 * Le ragioni sociali grezze in `top_vincitori`/`aggiudicatario` possono essere
 * sporche (descrizioni lunghe di RTI annidati dall'import ANAС). Le ripuliamo
 * per la UI: una sola riga, lunghezza limitata, niente persone fisiche
 * (la view espone solo PG, ma il testo grezzo va comunque accorciato).
 */
export function cleanRagioneSociale(raw: string | null | undefined): string {
  if (!raw) return 'Operatore economico';
  const oneLine = decodeEntities(raw).replace(/\s+/g, ' ').trim();
  return truncate(oneLine, 90);
}

/**
 * Etichetta leggibile della fascia importo del landscape (1..4).
 * Coerente con la migration FASE 0: 1=<150k · 2=150k-1M · 3=1M-5M · 4=>5M.
 */
export const FASCIA_IMPORTO_LABEL: Record<number, string> = {
  1: 'fino a 150 mila €',
  2: 'da 150 mila a 1 mln €',
  3: 'da 1 a 5 mln €',
  4: 'oltre 5 mln €',
};

export function fasciaImportoLabel(f: number | null | undefined): string {
  if (f == null) return '';
  return FASCIA_IMPORTO_LABEL[f] || '';
}

/**
 * Traduce una quota di concentrazione (quota_top3 in [0,1]) in un livello
 * leggibile per la SEO. Statistica DESCRITTIVA: non e' un consiglio, fotografa
 * quanto un segmento e' presidiato da pochi operatori.
 *   - alta:  i 3 maggiori vincitori prendono >= 60% delle gare → mercato presidiato
 *   - media: tra 35% e 60% → contendibile ma con leader chiari
 *   - bassa: < 35% → mercato aperto/frammentato
 */
export type ContendibilitaLivello = 'aperto' | 'contendibile' | 'presidiato';

export function contendibilita(quotaTop3: number | null | undefined): {
  livello: ContendibilitaLivello;
  label: string;
} {
  if (quotaTop3 == null) return { livello: 'contendibile', label: 'Dato non disponibile' };
  if (quotaTop3 >= 0.6) return { livello: 'presidiato', label: 'Mercato presidiato' };
  if (quotaTop3 >= 0.35) return { livello: 'contendibile', label: 'Contendibile' };
  return { livello: 'aperto', label: 'Mercato aperto' };
}
