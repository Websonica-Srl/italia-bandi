/**
 * Registry delle regioni italiane per le pagine GEO (/[regione], /regioni).
 *
 * La fonte di verità dei NOMI regione è `@websonica/cantieri-core` (PROVINCE),
 * che coincide esattamente con come la colonna `regione` è salvata nella view
 * `bandi_gara_public` ("Lombardia", "Emilia-Romagna", "Friuli-Venezia Giulia",
 * "Valle d'Aosta", ...). Da qui deriviamo gli slug, così la whitelist resta DRY
 * e coerente con il resto del network.
 *
 * Mapping slug:
 *   "Lombardia"            -> "lombardia"
 *   "Emilia-Romagna"       -> "emilia-romagna"
 *   "Trentino-Alto Adige"  -> "trentino-alto-adige"
 *   "Friuli-Venezia Giulia"-> "friuli-venezia-giulia"
 *   "Valle d'Aosta"        -> "valle-d-aosta"
 */
import { PROVINCE } from '@websonica/cantieri-core';
import { slugify } from '@/lib/utils';

export interface RegioneInfo {
  /** Slug URL, es. "emilia-romagna". */
  slug: string;
  /** Nome esatto come salvato in `bandi_gara_public.regione`, es. "Emilia-Romagna". */
  nome: string;
}

/** Le 20 regioni italiane (nomi canonici dal package geo). */
const REGIONI_NOMI: string[] = Array.from(
  new Set(PROVINCE.map((p) => p.regione)),
).sort((a, b) => a.localeCompare(b, 'it'));

/** Lista ordinata alfabeticamente di tutte le regioni con slug. */
export const REGIONI: RegioneInfo[] = REGIONI_NOMI.map((nome) => ({
  slug: slugify(nome),
  nome,
}));

/** Mappa slug -> nome esatto regione (per il filtro DB). */
const SLUG_TO_NOME = new Map<string, string>(
  REGIONI.map((r) => [r.slug, r.nome]),
);

/** Risolve uno slug regione al nome esatto, o null se non valido (whitelist). */
export function regioneNomeFromSlug(slug: string): string | null {
  return SLUG_TO_NOME.get(slug) ?? null;
}

/** Slug regione dal nome (per costruire i link). */
export function regioneSlug(nome: string): string {
  return slugify(nome);
}

/**
 * Intro editoriale UNICA per regione (copy SEO, non duplica dati grezzi).
 * Una frase di contesto sul mercato degli appalti pubblici nella regione.
 */
export const REGIONE_INTRO: Record<string, string> = {
  Abruzzo:
    'In Abruzzo gli appalti pubblici intrecciano la ricostruzione post-sisma, le opere infrastrutturali tra costa e aree interne e gli interventi di messa in sicurezza del territorio montano.',
  Basilicata:
    'In Basilicata le gare d\'appalto pubbliche si concentrano su infrastrutture, dissesto idrogeologico e valorizzazione dei centri storici, dai Sassi di Matera ai borghi dell\'entroterra.',
  Calabria:
    'In Calabria gli appalti pubblici riguardano in larga parte opere stradali, interventi sul rischio idrogeologico e riqualificazione di edifici pubblici e scolastici.',
  Campania:
    'La Campania è una delle regioni più dinamiche per gli appalti pubblici: grandi opere a Napoli e provincia, edilizia scolastica e sanitaria, rigenerazione urbana e infrastrutture di mobilità.',
  'Emilia-Romagna':
    'In Emilia-Romagna gli appalti pubblici esprimono un tessuto produttivo solido: opere infrastrutturali, edilizia sanitaria d\'eccellenza e interventi di efficientamento energetico del patrimonio pubblico.',
  'Friuli-Venezia Giulia':
    'In Friuli-Venezia Giulia le gare pubbliche spaziano dalle opere portuali e logistiche di Trieste agli interventi infrastrutturali transfrontalieri e alla manutenzione del territorio alpino.',
  Lazio:
    'Il Lazio, trainato da Roma Capitale, è tra i mercati più ampi per gli appalti pubblici: grandi opere, edilizia pubblica, sanità, mobilità e i numerosi interventi legati agli eventi giubilari.',
  Liguria:
    'In Liguria gli appalti pubblici ruotano attorno alle opere portuali di Genova e La Spezia, alle infrastrutture viarie complesse e alla messa in sicurezza di un territorio fragile e densamente costruito.',
  Lombardia:
    'La Lombardia è il primo mercato italiano per volume di appalti pubblici: grandi opere infrastrutturali, edilizia sanitaria e scolastica, rigenerazione urbana a Milano e nelle città capoluogo.',
  Marche:
    'Nelle Marche gli appalti pubblici si concentrano su ricostruzione post-sisma, opere viarie tra costa e Appennino e riqualificazione del patrimonio edilizio storico.',
  Molise:
    'In Molise le gare d\'appalto pubbliche riguardano soprattutto infrastrutture stradali, manutenzione del territorio e interventi di adeguamento di edifici pubblici e scolastici.',
  Piemonte:
    'In Piemonte gli appalti pubblici uniscono grandi opere a Torino, infrastrutture di valico alpino e un\'intensa attività di riqualificazione del patrimonio edilizio pubblico.',
  Puglia:
    'In Puglia gli appalti pubblici comprendono opere portuali e infrastrutturali, edilizia sanitaria, interventi sulle reti idriche e rigenerazione urbana dei centri storici.',
  Sardegna:
    'In Sardegna le gare pubbliche riguardano infrastrutture viarie e portuali, opere di approvvigionamento idrico, edilizia pubblica e interventi di tutela ambientale del territorio.',
  Sicilia:
    'La Sicilia è un mercato rilevante per gli appalti pubblici: grandi opere infrastrutturali, edilizia scolastica e sanitaria, interventi sul rischio sismico e idrogeologico in tutta l\'isola.',
  Toscana:
    'In Toscana gli appalti pubblici coniugano tutela del patrimonio storico-artistico, opere infrastrutturali, edilizia sanitaria e interventi di riqualificazione energetica.',
  'Trentino-Alto Adige':
    'In Trentino-Alto Adige le gare pubbliche sono caratterizzate da forte autonomia provinciale: opere di montagna, infrastrutture viarie e ferroviarie, edilizia pubblica ad alta efficienza energetica.',
  Umbria:
    'In Umbria gli appalti pubblici riguardano ricostruzione post-sisma, opere viarie, tutela del patrimonio storico e interventi di efficientamento del costruito pubblico.',
  "Valle d'Aosta":
    'In Valle d\'Aosta le gare d\'appalto pubbliche, gestite con ampia autonomia regionale, riguardano opere di montagna, infrastrutture viarie alpine ed edilizia pubblica.',
  Veneto:
    'In Veneto gli appalti pubblici spaziano dalle opere di salvaguardia di Venezia e della laguna alle grandi infrastrutture di mobilità, fino all\'edilizia sanitaria e scolastica diffusa.',
};
