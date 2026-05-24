/**
 * Registry delle province italiane per le pagine GEO (/[regione]/[provincia]).
 *
 * Fonte di verità: `PROVINCE` da `@websonica/cantieri-core` (stesso package delle
 * regioni). Ogni voce è { sigla, nome, regione } con la regione coerente. La
 * colonna `bandi_gara_public.provincia` contiene la SIGLA (es. "MI"); lo slug
 * URL usa il NOME della provincia (es. "milano"), che è il termine che gli utenti
 * digitano ("bandi gara milano").
 *
 * La whitelist gerarchica (regioneSlug/provinciaSlug) derivata da qui è la fonte
 * di verità del routing: scarta automaticamente le poche righe DB con coppia
 * (regione, sigla) incoerente (rumore d'ingestion). Tutte le 107 province hanno
 * volume ampio (min ~73 bandi, calibrazione 2026-05-24), quindi le pre-renderizziamo
 * tutte; la pagina fa comunque notFound() se total === 0 (safety anti-thin).
 *
 * Mapping slug nome → es. "Forlì-Cesena" -> "forli-cesena", "Reggio Calabria" ->
 * "reggio-calabria". slugify() gestisce accenti e spazi.
 */
import { PROVINCE } from '@websonica/cantieri-core';
import { slugify } from '@/lib/utils';
import { regioneSlug } from '@/lib/regioni';

export interface ProvinciaInfo {
  /** Sigla, es. "MI" (chiave di filtro DB). */
  sigla: string;
  /** Nome provincia, es. "Milano". */
  nome: string;
  /** Slug URL del nome, es. "milano". */
  slug: string;
  /** Nome regione esatto, es. "Lombardia". */
  regione: string;
  /** Slug regione, es. "lombardia". */
  regioneSlug: string;
}

/** Tutte le province italiane dal package (fonte di verità DRY). */
export const PROVINCE_ALL: ProvinciaInfo[] = PROVINCE.map((p) => ({
  sigla: p.sigla,
  nome: p.nome,
  slug: slugify(p.nome),
  regione: p.regione,
  regioneSlug: regioneSlug(p.regione),
}));

const BY_REGIONE_SLUG = new Map<string, ProvinciaInfo[]>();
const BY_REG_PROV_SLUG = new Map<string, ProvinciaInfo>();
const BY_SIGLA = new Map<string, ProvinciaInfo>();
for (const p of PROVINCE_ALL) {
  if (!BY_REGIONE_SLUG.has(p.regioneSlug)) BY_REGIONE_SLUG.set(p.regioneSlug, []);
  BY_REGIONE_SLUG.get(p.regioneSlug)!.push(p);
  BY_REG_PROV_SLUG.set(`${p.regioneSlug}/${p.slug}`, p);
  BY_SIGLA.set(p.sigla, p);
}
// Ordina le province di ogni regione per nome (UX cross-link).
Array.from(BY_REGIONE_SLUG.values()).forEach((list) =>
  list.sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
);

/** Risolve (regioneSlug, provinciaSlug) → ProvinciaInfo, o null (whitelist). */
export function provinciaFromSlugs(
  regioneSlugStr: string,
  provinciaSlug: string,
): ProvinciaInfo | null {
  return BY_REG_PROV_SLUG.get(`${regioneSlugStr}/${provinciaSlug}`) ?? null;
}

/** Provincia dalla sigla (es. "MI"), o null. */
export function provinciaFromSigla(sigla: string): ProvinciaInfo | null {
  return BY_SIGLA.get((sigla || '').trim().toUpperCase()) ?? null;
}

/** Province di una regione (per cross-link e generateStaticParams). Ordinate per nome. */
export function provinceDiRegione(regioneSlugStr: string): ProvinciaInfo[] {
  return BY_REGIONE_SLUG.get(regioneSlugStr) ?? [];
}

/** Path canonico di una pagina provincia, dalla sigla. */
export function provinciaPath(sigla: string): string {
  const p = provinciaFromSigla(sigla);
  if (!p) return '/regioni';
  return `/${p.regioneSlug}/${p.slug}`;
}

/**
 * Intro editoriale UNICA per i capoluoghi/province principali (chiave = sigla).
 * Per le province non elencate, la pagina usa un'intro parametrica generata con
 * dati reali specifici (numero enti, top comune, top categoria, importo totale),
 * così ogni pagina è unica e non boilerplate (anti-duplicazione §3.5).
 */
export const PROVINCIA_INTRO: Record<string, string> = {
  RM: 'La provincia di Roma è il più grande bacino di appalti pubblici d\'Italia: grandi opere della Capitale, edilizia sanitaria e scolastica, mobilità e gli interventi connessi agli eventi giubilari.',
  MI: 'Milano e la sua provincia trainano il mercato lombardo degli appalti: rigenerazione urbana, edilizia sanitaria d\'eccellenza, infrastrutture di mobilità e opere per i grandi eventi.',
  NA: 'Nella provincia di Napoli gli appalti pubblici spaziano da grandi opere infrastrutturali a edilizia scolastica e sanitaria, fino alla riqualificazione dei centri urbani densamente abitati.',
  TO: 'La provincia di Torino unisce grandi opere del capoluogo, infrastrutture di valico alpino e una intensa attività di riqualificazione del patrimonio edilizio pubblico.',
  BO: 'Bologna e la sua provincia esprimono un tessuto solido: opere infrastrutturali, edilizia sanitaria di riferimento ed efficientamento energetico del patrimonio pubblico.',
  FI: 'Nella provincia di Firenze gli appalti coniugano tutela del patrimonio storico-artistico, opere infrastrutturali ed edilizia sanitaria.',
  BA: 'La provincia di Bari concentra opere portuali e infrastrutturali, edilizia sanitaria, interventi sulle reti idriche e rigenerazione urbana dei centri storici.',
  PA: 'Nella provincia di Palermo gli appalti pubblici riguardano grandi opere infrastrutturali, edilizia scolastica e sanitaria e interventi di messa in sicurezza del territorio.',
  GE: 'La provincia di Genova ruota attorno alle opere portuali, alle infrastrutture viarie complesse e alla messa in sicurezza di un territorio fragile e densamente costruito.',
  VE: 'Nella provincia di Venezia gli appalti spaziano dalle opere di salvaguardia della laguna alle grandi infrastrutture di mobilità, fino all\'edilizia sanitaria e scolastica.',
  CT: 'La provincia di Catania concentra opere infrastrutturali, edilizia pubblica e interventi sul rischio sismico e idrogeologico dell\'area etnea.',
  BZ: 'La provincia autonoma di Bolzano gestisce con ampia autonomia opere di montagna, infrastrutture viarie e ferroviarie ed edilizia pubblica ad alta efficienza energetica.',
  TN: 'La provincia autonoma di Trento, con forte autonomia, bandisce opere di montagna, infrastrutture e una diffusa edilizia pubblica ad alta efficienza energetica.',
};
