/**
 * Query layer per i moduli "Bandi Intelligence" (FASE 0).
 *
 * Legge SEMPRE e SOLO dalle view safe `_public` costruite sopra le viste
 * materializzate del feature store (mv_bandi_*). MAI dalle tabelle base,
 * MAI dalle MV direttamente. Le view espongono solo aggregati anonimi:
 * niente partita_iva / codice_fiscale / raw_data / fonte_url / firm_id.
 *
 *   leaderboard_public  → M8 "chi vince di piu'"
 *   rti_public          → M5 partnership / co-aggiudicazione
 *   buyer_public        → M6 buyer intelligence (stazione appaltante)
 *   landscape_public    → M7 landscape competitivo per segmento
 *
 * Tutte pre-aggregate: niente enumerazione full-dataset (a differenza di
 * getBandiByCpvGroup in bandi.ts, che non scala per questi moduli).
 */
import { createServerClient } from '../client';
import { memoTtl } from './memo';

// =====================================================================
// M8 — Leaderboard "chi vince di piu'"
// =====================================================================

export interface LeaderboardRow {
  firm_name: string;
  firm_slug: string;
  firm_region: string | null;
  firm_province: string | null;
  gare_vinte: number;
  gare_in_rti: number;
  /** Gruppo CPV a 2 cifre piu' frequente per l'azienda (es. "45"). */
  top_cpv2: string | null;
  top_regione: string | null;
  cpv_distinti: number;
  regioni_distinte: number;
  ultima_vittoria: string | null;
  prima_vittoria: string | null;
}

export interface LeaderboardFilters {
  /** Gruppo CPV a 2 cifre (es. "45"). Filtra su top_cpv2. */
  cpvGroup?: string;
  /** Nome regione (match esatto su top_regione). */
  regione?: string;
  /** Sigla provincia (match esatto su firm_province). */
  provincia?: string;
  limit?: number;
}

/**
 * Top vincitori per segmento (CPV/zona), ordinati per gare vinte.
 * M8 — pagine classifiche SEO. Legge da `leaderboard_public`.
 */
export async function getLeaderboard(
  filters: LeaderboardFilters = {},
): Promise<LeaderboardRow[]> {
  const supabase: any = createServerClient();
  const { cpvGroup, regione, provincia, limit = 50 } = filters;

  let query = supabase
    .from('leaderboard_public')
    .select(
      'firm_name, firm_slug, firm_region, firm_province, gare_vinte, gare_in_rti, top_cpv2, top_regione, cpv_distinti, regioni_distinte, ultima_vittoria, prima_vittoria',
    );

  if (cpvGroup) query = query.eq('top_cpv2', cpvGroup);
  if (regione) query = query.ilike('top_regione', regione);
  if (provincia) query = query.eq('firm_province', provincia);

  query = query.order('gare_vinte', { ascending: false, nullsFirst: false });
  // Tie-breaker stabile: a pari gare_vinte l'ordine deve essere deterministico
  // tra i render (firm_slug e' univoco in leaderboard_public).
  query = query.order('firm_slug', { ascending: true });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[intelligence] getLeaderboard error:', error.message);
    return [];
  }
  return (data as LeaderboardRow[]) || [];
}

// =====================================================================
// M5 — RTI / co-aggiudicazione
// =====================================================================

export interface RtiPartnerRow {
  firm_a_name: string;
  firm_a_slug: string;
  firm_b_name: string;
  firm_b_slug: string;
  gare_condivise: number;
  top_cpv2: string | null;
  top_regione: string | null;
  ultima_collaborazione: string | null;
}

export interface RtiFilters {
  /** Slug di una firm: ritorna le sue coppie (su entrambi i lati). */
  firmSlug?: string;
  /** Gruppo CPV a 2 cifre. */
  cpvGroup?: string;
  /** Nome regione (match esatto su top_regione). */
  regione?: string;
  limit?: number;
}

/**
 * Coppie di aziende che si aggiudicano insieme (chi-con-chi + frequenza).
 * M5 — grafo partnership pubblico. Legge da `rti_public`.
 *
 * Se `firmSlug` e' passato, ritorna le coppie che coinvolgono quella firm
 * (su lato A o lato B). Altrimenti i top hub RTI per segmento.
 */
export async function getRtiPartners(
  filters: RtiFilters = {},
): Promise<RtiPartnerRow[]> {
  const supabase: any = createServerClient();
  const { firmSlug, cpvGroup, regione, limit = 50 } = filters;

  let query = supabase
    .from('rti_public')
    .select(
      'firm_a_name, firm_a_slug, firm_b_name, firm_b_slug, gare_condivise, top_cpv2, top_regione, ultima_collaborazione',
    );

  if (firmSlug) {
    query = query.or(`firm_a_slug.eq.${firmSlug},firm_b_slug.eq.${firmSlug}`);
  }
  if (cpvGroup) query = query.eq('top_cpv2', cpvGroup);
  if (regione) query = query.ilike('top_regione', regione);

  query = query.order('gare_condivise', { ascending: false, nullsFirst: false });
  // Tie-breaker stabile su chiavi univoche della coppia.
  query = query.order('firm_a_slug', { ascending: true });
  query = query.order('firm_b_slug', { ascending: true });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[intelligence] getRtiPartners error:', error.message);
    return [];
  }
  return (data as RtiPartnerRow[]) || [];
}

// =====================================================================
// M6 — Buyer intelligence (stazione appaltante)
// =====================================================================

export interface BuyerVincitore {
  nome: string;
  gare: number;
}

export interface BuyerRow {
  stazione_appaltante: string;
  regione: string | null;
  provincia: string | null;
  n_bandi: number;
  n_aggiudicati: number;
  n_aperti: number;
  top_cpv2: string | null;
  cpv_distinti: number;
  importo_base_totale: number | null;
  ribasso_mediano: number | null;
  offerte_medie: number | null;
  ultima_aggiudicazione: string | null;
  top_vincitori: BuyerVincitore[];
}

/**
 * Profilo di una singola stazione appaltante (cosa pubblica, a chi
 * aggiudica, ribasso mediano, offerte medie). M6. Legge da `buyer_public`.
 */
export async function getBuyer(
  stazioneAppaltante: string,
): Promise<BuyerRow | null> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('buyer_public')
    .select(
      'stazione_appaltante, regione, provincia, n_bandi, n_aggiudicati, n_aperti, top_cpv2, cpv_distinti, importo_base_totale, ribasso_mediano, offerte_medie, ultima_aggiudicazione, top_vincitori',
    )
    .eq('stazione_appaltante', stazioneAppaltante)
    .maybeSingle();
  if (error) {
    console.error('[intelligence] getBuyer error:', error.message);
    return null;
  }
  return (data as BuyerRow) || null;
}

/**
 * Risolve uno slug stazione appaltante al nome canonico, gestendo le collisioni
 * (nomi diversi → stesso slug) in modo deterministico: vince il nome con piu'
 * bandi (poi alfabetico). Poiche' `buyer_public` non ha lo slug, scarichiamo
 * solo (stazione_appaltante, n_bandi) e risolviamo lato app — il dataset enti e'
 * piccolo (8.157) e paginabile.
 *
 * NB: usiamo importazione locale di slugify dentro la funzione per non creare
 * dipendenze circolari nel layer query (intelligence non importa da lib/buyer).
 */
export interface BuyerKey {
  stazione_appaltante: string;
  n_bandi: number;
  n_aggiudicati: number;
}

/**
 * Memoizzata (TTL 1h): chiamata da OGNI render di /ente/[slug]
 * (resolveBuyerSlug) e dal chunk 5 della sitemap — senza memo ogni render
 * ripagava il walk paginato completo di buyer_public (~9 query da 1000 righe).
 */
function fetchAllBuyerKeys(): Promise<BuyerKey[]> {
  return memoTtl('buyer_keys', fetchAllBuyerKeysUncached);
}

async function fetchAllBuyerKeysUncached(): Promise<BuyerKey[]> {
  const supabase: any = createServerClient();
  const PAGE = 1000;
  const out: BuyerKey[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('buyer_public')
      .select('stazione_appaltante, n_bandi, n_aggiudicati')
      .order('stazione_appaltante', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error('[intelligence] fetchAllBuyerKeys error:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

/**
 * Slug → nome canonico stazione appaltante. La funzione di slugify e' passata
 * dal chiamante (lib/buyer.buyerSlug) per restare DRY senza dipendenza circolare.
 */
export async function resolveBuyerSlug(
  slug: string,
  slugFn: (s: string) => string,
): Promise<string | null> {
  const keys = await fetchAllBuyerKeys();
  let best: { nome: string; n: number } | null = null;
  for (const k of keys) {
    if (slugFn(k.stazione_appaltante) !== slug) continue;
    const n = Number(k.n_bandi) || 0;
    if (
      !best ||
      n > best.n ||
      (n === best.n && k.stazione_appaltante.localeCompare(best.nome, 'it') < 0)
    ) {
      best = { nome: k.stazione_appaltante, n };
    }
  }
  return best ? best.nome : null;
}

/**
 * Tutte le coppie (nome, n_bandi) delle stazioni appaltanti — per generare i
 * params statici di /ente/[slug] e l'indice. Slug calcolato dal chiamante.
 */
export async function getAllBuyersForParams(): Promise<BuyerKey[]> {
  return fetchAllBuyerKeys();
}

export interface TopBuyersFilters {
  /** Nome regione (match esatto). */
  regione?: string;
  /** Gruppo CPV a 2 cifre. */
  cpvGroup?: string;
  limit?: number;
}

/**
 * Top stazioni appaltanti per numero di bandi (indice pagine buyer).
 * M6. Legge da `buyer_public`.
 */
export async function getTopBuyers(
  filters: TopBuyersFilters = {},
): Promise<BuyerRow[]> {
  const supabase: any = createServerClient();
  const { regione, cpvGroup, limit = 50 } = filters;

  let query = supabase
    .from('buyer_public')
    .select(
      'stazione_appaltante, regione, provincia, n_bandi, n_aggiudicati, n_aperti, top_cpv2, cpv_distinti, importo_base_totale, ribasso_mediano, offerte_medie, ultima_aggiudicazione, top_vincitori',
    );

  if (regione) query = query.ilike('regione', regione);
  if (cpvGroup) query = query.eq('top_cpv2', cpvGroup);

  query = query.order('n_bandi', { ascending: false, nullsFirst: false });
  // Tie-breaker stabile: a pari n_bandi ordina per nome ente (univoco nella view).
  query = query.order('stazione_appaltante', { ascending: true });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[intelligence] getTopBuyers error:', error.message);
    return [];
  }
  return (data as BuyerRow[]) || [];
}

// =====================================================================
// M7 — Landscape competitivo (cpv2 × regione × fascia importo)
// =====================================================================

export interface LandscapeRow {
  cpv2: string;
  regione: string;
  /** 1=<150k · 2=150k-1M · 3=1M-5M · 4=>5M (vedi migration FASE 0). */
  fascia_importo: number;
  n_gare: number;
  n_aggiudicate: number;
  n_aperte: number;
  vincitori_distinti: number;
  /** Indice Herfindahl-Hirschman in [0,1] (concentrazione del mercato). */
  hhi: number | null;
  /** Quota di gare assegnate ai 3 maggiori vincitori, in [0,1]. */
  quota_top3: number | null;
  ribasso_mediano: number | null;
  offerte_medie: number | null;
  /** Percentuale gare aggiudicate in RTI, in [0,1]. */
  pct_rti: number | null;
}

export interface LandscapeFilters {
  /** Gruppo CPV a 2 cifre (obbligatorio per pagina categoria). */
  cpvGroup: string;
  /** Nome regione (match esatto). */
  regione?: string;
  /** Fascia importo 1..4. */
  fascia?: number;
  limit?: number;
}

/**
 * Landscape competitivo per segmento: concentrazione (HHI / quota top-3),
 * affollamento, ribasso mediano, offerte medie, %RTI. M7.
 * Legge da `landscape_public`.
 */
export async function getLandscape(
  filters: LandscapeFilters,
): Promise<LandscapeRow[]> {
  const supabase: any = createServerClient();
  const { cpvGroup, regione, fascia, limit = 100 } = filters;

  let query = supabase
    .from('landscape_public')
    .select(
      'cpv2, regione, fascia_importo, n_gare, n_aggiudicate, n_aperte, vincitori_distinti, hhi, quota_top3, ribasso_mediano, offerte_medie, pct_rti',
    )
    .eq('cpv2', cpvGroup);

  if (regione) query = query.ilike('regione', regione);
  if (fascia) query = query.eq('fascia_importo', fascia);

  query = query.order('n_gare', { ascending: false, nullsFirst: false });
  // Tie-breaker stabile: a pari n_gare ordina per regione e fascia importo.
  query = query.order('regione', { ascending: true });
  query = query.order('fascia_importo', { ascending: true });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('[intelligence] getLandscape error:', error.message);
    return [];
  }
  return (data as LandscapeRow[]) || [];
}

/**
 * Landscape SINTETICO di un gruppo CPV (M7), aggregato sulle righe per regione ×
 * fascia in un'unica fotografia leggibile in SEO. Pondera i ribassi/offerte/HHI/
 * RTI/quota_top3 per numero di gare (media pesata) e somma i conteggi. Usato dai
 * blocchi "quanto e' contendibile" sulle pagine /categoria/[slug] e /[regione].
 */
export interface LandscapeSummary {
  /** Numero righe di segmento aggregate (regione × fascia). */
  segmenti: number;
  n_gare: number;
  n_aggiudicate: number;
  n_aperte: number;
  /** Somma dei vincitori distinti per segmento (proxy di affollamento, non deduplica cross-segmento). */
  vincitori_distinti_tot: number;
  /** Media pesata per n_gare. */
  quota_top3: number | null;
  hhi: number | null;
  ribasso_mediano: number | null;
  offerte_medie: number | null;
  pct_rti: number | null;
}

export async function getLandscapeSummary(
  cpvGroup: string,
  regione?: string,
): Promise<LandscapeSummary | null> {
  const rows = await getLandscape({ cpvGroup, regione, limit: 500 });
  if (rows.length === 0) return null;
  return aggregateLandscape(rows);
}

/**
 * Landscape sintetico di una REGIONE (M7), aggregando tutte le righe
 * cpv2 × fascia di quella regione in `landscape_public`. Per il blocco "quanto
 * e' contendibile" sulle pagine /[regione]. Stessa logica di media pesata di
 * getLandscapeSummary, ma il filtro primario e' la regione (non il CPV).
 */
export async function getLandscapeByRegione(
  regione: string,
): Promise<LandscapeSummary | null> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('landscape_public')
    .select(
      'n_gare, n_aggiudicate, n_aperte, vincitori_distinti, hhi, quota_top3, ribasso_mediano, offerte_medie, pct_rti',
    )
    .ilike('regione', regione)
    .limit(2000);
  if (error) {
    console.error('[intelligence] getLandscapeByRegione error:', error.message);
    return null;
  }
  const rows = (data as LandscapeRow[]) || [];
  if (rows.length === 0) return null;
  return aggregateLandscape(rows);
}

/** Media pesata per n_gare di un insieme di righe landscape (DRY). */
function aggregateLandscape(rows: Partial<LandscapeRow>[]): LandscapeSummary {
  let nGare = 0,
    nAgg = 0,
    nAperte = 0,
    vincTot = 0;
  let wQuota = 0,
    wQuotaTot = 0,
    wHhi = 0,
    wHhiTot = 0,
    wRib = 0,
    wRibTot = 0,
    wOff = 0,
    wOffTot = 0,
    wRti = 0,
    wRtiTot = 0;
  for (const r of rows) {
    const g = Number(r.n_gare) || 0;
    nGare += g;
    nAgg += Number(r.n_aggiudicate) || 0;
    nAperte += Number(r.n_aperte) || 0;
    vincTot += Number(r.vincitori_distinti) || 0;
    if (r.quota_top3 != null) {
      wQuota += r.quota_top3 * g;
      wQuotaTot += g;
    }
    if (r.hhi != null) {
      wHhi += r.hhi * g;
      wHhiTot += g;
    }
    if (r.ribasso_mediano != null) {
      wRib += r.ribasso_mediano * g;
      wRibTot += g;
    }
    if (r.offerte_medie != null) {
      wOff += Number(r.offerte_medie) * g;
      wOffTot += g;
    }
    if (r.pct_rti != null) {
      wRti += r.pct_rti * g;
      wRtiTot += g;
    }
  }
  return {
    segmenti: rows.length,
    n_gare: nGare,
    n_aggiudicate: nAgg,
    n_aperte: nAperte,
    vincitori_distinti_tot: vincTot,
    quota_top3: wQuotaTot > 0 ? wQuota / wQuotaTot : null,
    hhi: wHhiTot > 0 ? wHhi / wHhiTot : null,
    ribasso_mediano: wRibTot > 0 ? wRib / wRibTot : null,
    offerte_medie: wOffTot > 0 ? wOff / wOffTot : null,
    pct_rti: wRtiTot > 0 ? wRti / wRtiTot : null,
  };
}

// =====================================================================
// M8 — segmenti leaderboard (indice /classifiche)
// =====================================================================

export interface SegmentCount {
  key: string;
  cnt: number;
}

/**
 * Gruppi CPV2 presenti in leaderboard con numero di aziende che vincono.
 * Per l'indice /classifiche (sezione "per categoria"). Aggregato lato app
 * sull'intero set (11.880 righe, paginato).
 */
function fetchAllLeaderboardDims(): Promise<
  { top_cpv2: string | null; top_regione: string | null }[]
> {
  // Memo TTL 1h: riusata tra sitemap chunk 4 e /classifiche nella stessa
  // finestra ISR (walk paginato ~12 query da 1000 righe pagato una volta).
  return memoTtl('leaderboard_dims', fetchAllLeaderboardDimsUncached);
}

async function fetchAllLeaderboardDimsUncached(): Promise<
  { top_cpv2: string | null; top_regione: string | null }[]
> {
  const supabase: any = createServerClient();
  const PAGE = 1000;
  const out: { top_cpv2: string | null; top_regione: string | null }[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('leaderboard_public')
      .select('top_cpv2, top_regione')
      .order('firm_slug', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) {
      console.error('[intelligence] fetchAllLeaderboardDims error:', error.message);
      break;
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

export interface LeaderboardSegments {
  cpv: SegmentCount[];
  regioni: SegmentCount[];
}

export async function getLeaderboardSegments(): Promise<LeaderboardSegments> {
  const rows = await fetchAllLeaderboardDims();
  const cpv = new Map<string, number>();
  const reg = new Map<string, number>();
  for (const r of rows) {
    if (r.top_cpv2) cpv.set(r.top_cpv2, (cpv.get(r.top_cpv2) || 0) + 1);
    if (r.top_regione) reg.set(r.top_regione, (reg.get(r.top_regione) || 0) + 1);
  }
  const toSorted = (m: Map<string, number>): SegmentCount[] =>
    Array.from(m.entries())
      .map(([key, cnt]) => ({ key, cnt }))
      .sort((a, b) => b.cnt - a.cnt);
  return { cpv: toSorted(cpv), regioni: toSorted(reg) };
}
