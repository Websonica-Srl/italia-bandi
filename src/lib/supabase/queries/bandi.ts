/**
 * Query layer per bandi pubblici.
 * Legge SEMPRE e SOLO dalle view safe `bandi_gara_public` e
 * `bando_aggiudicatari_public` (niente partita_iva / codice_fiscale /
 * raw_data / fonte_url / contatti RUP). La view filtra già
 * visibilita_pubblica = true.
 */
import { createServerClient } from '../client';
import { memoTtl } from './memo';

/** Colonne safe esposte da bandi_gara_public. */
const BANDO_COLS =
  'id, slug, cig, cup, numero_bando, tipo_procedura, oggetto, descrizione_completa, importo_base, importo_aggiudicazione, ribasso_percentuale, numero_offerte_ricevute, data_pubblicazione, scadenza_offerte, data_aggiudicazione, stazione_appaltante, comune, provincia, regione, categorie, cpv_principale, cpv_codes, stato, aggiudicatario_ragione_sociale_raw, created_at, updated_at';

export interface Bando {
  id: string;
  slug: string;
  cig: string | null;
  cup: string | null;
  numero_bando: string | null;
  tipo_procedura: string | null;
  oggetto: string;
  descrizione_completa: string | null;
  importo_base: number | null;
  importo_aggiudicazione: number | null;
  /** Ribasso % offerto dall'aggiudicatario (campo ANAC, ora in view). */
  ribasso_percentuale: number | null;
  /** Numero offerte ricevute in gara (campo ANAC, ora in view). */
  numero_offerte_ricevute: number | null;
  data_pubblicazione: string | null;
  scadenza_offerte: string | null;
  data_aggiudicazione: string | null;
  stazione_appaltante: string | null;
  comune: string | null;
  provincia: string | null;
  regione: string | null;
  categorie: string[] | null;
  cpv_principale: string | null;
  cpv_codes: string[] | null;
  stato: string | null;
  aggiudicatario_ragione_sociale_raw: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Aggiudicatario {
  id: string;
  bando_id: string;
  ragione_sociale_raw: string | null;
  ruolo_rti: string | null;
  id_gruppo: string | null;
  importo_aggiudicazione: number | null;
  firm_id: string | null;
}

export interface BandiFilters {
  /** Gruppo CPV (prime 2 cifre, es. "45"). */
  cpvGroup?: string;
  /** Codice CPV completo o prefisso. */
  cpv?: string;
  procedura?: string;
  stato?: string;
  regione?: string;
  provincia?: string;
  importo_min?: number;
  importo_max?: number;
  /** Solo bandi con scadenza ancora futura. */
  soloAperti?: boolean;
  cig?: string;
  /** Match esatto sulla stazione appaltante (piu' efficiente del full-text q). */
  stazioneAppaltante?: string;
  q?: string;
  orderBy?: 'data_pubblicazione' | 'scadenza_offerte' | 'importo_base';
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getBandi(
  filters: BandiFilters = {},
): Promise<{ data: Bando[]; total: number }> {
  const supabase: any = createServerClient();
  const {
    cpvGroup,
    cpv,
    procedura,
    stato,
    regione,
    provincia,
    importo_min,
    importo_max,
    soloAperti,
    cig,
    stazioneAppaltante,
    q,
    orderBy = 'data_pubblicazione',
    orderDirection = 'desc',
    limit = 20,
    offset = 0,
  } = filters;

  // count:'planned' (stima del planner, ~istantanea e accurata su questo dataset)
  // invece di 'exact': l'exact-count via window sul view sanitizzato (50k righe)
  // sfora il statement_timeout di 3s di anon → la query falliva e la lista restava
  // VUOTA (es. /bandi, /scadenze). Il fetch della pagina è ~108ms.
  let query = supabase
    .from('bandi_gara_public')
    .select(BANDO_COLS, { count: 'planned' });

  if (cpvGroup) query = query.like('cpv_principale', `${cpvGroup}%`);
  if (cpv) query = query.like('cpv_principale', `${cpv}%`);
  if (procedura) query = query.eq('tipo_procedura', procedura);
  if (stato) query = query.eq('stato', stato);
  // match ESATTO (canonico) → usa l'indice bandi_regione_pub_idx (ilike = seq-scan 6s → timeout 3s anon)
  if (regione) query = query.eq('regione', regione);
  // provincia = SIGLA (es. "MI") nella view → match esatto (non pattern).
  if (provincia) query = query.eq('provincia', provincia);
  if (importo_min) query = query.gte('importo_base', importo_min);
  if (importo_max) query = query.lte('importo_base', importo_max);
  if (soloAperti) query = query.gte('scadenza_offerte', new Date().toISOString());
  if (cig) query = query.eq('cig', cig);
  if (stazioneAppaltante) query = query.eq('stazione_appaltante', stazioneAppaltante);
  if (q) {
    const safe = q.replace(/[%,()]/g, ' ').trim();
    if (safe)
      query = query.or(
        `oggetto.ilike.%${safe}%,descrizione_completa.ilike.%${safe}%,stazione_appaltante.ilike.%${safe}%,cig.ilike.%${safe}%`,
      );
  }

  query = query.order(orderBy, { ascending: orderDirection === 'asc', nullsFirst: false });
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) {
    console.error('[bandi] getBandi error:', error.message);
    return { data: [], total: 0 };
  }
  return { data: (data as Bando[]) || [], total: count || 0 };
}

export async function getBandoBySlug(slug: string): Promise<Bando | null> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('bandi_gara_public')
    .select(BANDO_COLS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[bandi] getBandoBySlug error:', error.message);
    return null;
  }
  return (data as Bando) || null;
}

/**
 * Fetch di TUTTE le righe di `bandi_gara_public` per le colonne richieste,
 * superando il cap PostgREST di 1000 righe. Usato SOLO dalla sitemap (slug,
 * indicizzabilita') — sempre dietro memo TTL. Gli aggregati regione/CPV/
 * provincia NON passano piu' di qui: leggono stats_cache / landscape_public
 * (1 query).
 */
const PAGE_SIZE = 1000;

/**
 * Enumera l'intero dataset (>50k righe) con KEYSET pagination sulla PK `id` (uuid).
 * NIENTE `.range()` a offset profondo: su 51k righe l'OFFSET 50.000 scansiona 50k
 * righe per pagina → statement_timeout anon → sitemap vuota. Con keyset ogni pagina
 * usa l'indice PK (`id > cursor`) ed è O(PAGE_SIZE). Il `select` include sempre `id`
 * (serve come cursore). L'ordinamento è per `id` (le callback NON devono aggiungere
 * un proprio order: romperebbe il keyset).
 */
async function fetchAllBandiRows(
  select: string,
  applyFilters?: (q: any) => any,
): Promise<any[]> {
  const supabase: any = createServerClient();
  const sel = /(^|,)\s*id(\s|,|$)/.test(select) ? select : `id, ${select}`;
  const out: any[] = [];
  let cursor: string | null = null;
  for (;;) {
    let q = supabase.from('bandi_gara_public').select(sel);
    if (applyFilters) q = applyFilters(q);
    q = q.order('id', { ascending: true }).limit(PAGE_SIZE);
    if (cursor) q = q.gt('id', cursor);
    const { data, error } = await q;
    if (error) {
      // Con keyset l'errore è improbabile; se capita, ritorniamo l'accumulato
      // PARZIALE (meglio di una sitemap vuota) e lo segnaliamo. I conteggi NON
      // dipendono più da questa funzione (usano la stats-cache), quindi il
      // parziale non produce divergenze.
      console.error('[bandi] fetchAllBandiRows error (dataset parziale):', error.message);
      return out;
    }
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE_SIZE) break;
    cursor = data[data.length - 1].id as string;
  }
  return out;
}

export async function getAllBandiSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  // Tutte le schede bando (no cap 1000): keyset sull'intero dataset per la sitemap.
  // NB: nessun .order() qui (l'ordine è per id, richiesto dal keyset).
  return fetchAllBandiRows('slug, updated_at', (q) => q.not('slug', 'is', null));
}

/**
 * Slug dei SOLI bandi INDICIZZABILI (vedi isBandoIndexable in lib/seo/indexable.ts).
 * Usato dalla sitemap: NON deve contenere URL noindex.
 *
 * Il criterio di indicizzabilità NON viene più calcolato qui: vive nella MV
 * `bandi_indicizzabili_mv (slug, updated_at)` (migration del 24/08/2026 su
 * italia-progettisti, `supabase/migrations/20260824160000_bandi_indicizzabili_mv_e_rpc_province_cantieri_settore.sql`),
 * refreshata ogni notte alle 04:45 UTC. Questa funzione fa solo il walk keyset
 * (per `slug`) sulla RPC `get_bandi_indicizzabili`, che ritorna righe già
 * filtrate — NESSUN filtro JS aggiuntivo qui.
 *
 * MANTENERE allineato con isBandoIndexable() in lib/seo/indexable.ts — che
 * resta la fonte di verità per il `robots` della singola pagina bando —
 * ogni cambio di soglia nella MV va replicato lì.
 *
 * Memoizzata (TTL 1h): la chiamano countSitemapChunks (indice + route
 * /sitemap.xml) E ogni chunk bandi della sitemap → senza memo il walk si
 * ripete per ognuna di queste render nella stessa finestra ISR.
 */
export function getIndexableBandiSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  return memoTtl('indexable_bandi_slugs', fetchIndexableBandiSlugs);
}

/**
 * Walk keyset (cursore = ultimo `slug` della pagina precedente) sulla RPC
 * `get_bandi_indicizzabili`, che legge dalla MV `bandi_indicizzabili_mv` già
 * filtrata per indicizzabilità e ordinata per `slug` ASC. Sostituisce il
 * vecchio walk per `id` (uuid) su tutta `bandi_gara_public` con rifinitura
 * JS, che generava ~52 pagine da 1.016 blocchi casuali l'una.
 */
async function fetchIndexableBandiSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase: any = createServerClient();
  const out: { slug: string; updated_at: string }[] = [];
  let cursor: string | null = null;
  for (;;) {
    const { data, error } = await supabase.rpc('get_bandi_indicizzabili', {
      p_after_slug: cursor,
      p_limit: PAGE_SIZE,
    });
    if (error) {
      // Con keyset l'errore è improbabile; se capita, ritorniamo l'accumulato
      // PARZIALE (meglio di una sitemap vuota), stesso comportamento di prima.
      console.error('[bandi] fetchIndexableBandiSlugs error (dataset parziale):', error.message);
      return out;
    }
    if (!data || data.length === 0) break;
    out.push(...(data as { slug: string; updated_at: string }[]));
    if (data.length < PAGE_SIZE) break;
    cursor = data[data.length - 1].slug as string;
  }
  return out;
}

/** Aggiudicatari (solo colonne safe) di un bando — per AggiudicatarioBox. */
export async function getAggiudicatariByBando(
  bandoId: string,
): Promise<Aggiudicatario[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('bando_aggiudicatari_public')
    .select('id, bando_id, ragione_sociale_raw, ruolo_rti, id_gruppo, importo_aggiudicazione, firm_id')
    .eq('bando_id', bandoId)
    .order('importo_aggiudicazione', { ascending: false, nullsFirst: false });
  if (error) {
    console.error('[bandi] getAggiudicatariByBando error:', error.message);
    return [];
  }
  return (data as Aggiudicatario[]) || [];
}

export interface BandiStats {
  totale: number;
  scadFuture: number;
  enti: number;
  importoTotaleBase: number;
}

/** Statistiche reali aggregate per la homepage / blocchi dati. */
export async function getBandiStats(): Promise<BandiStats> {
  const supabase: any = createServerClient();
  // RPC aggregata lato DB (count/sum/count-distinct in una query, ~170ms): rimpiazza
  // i count:'exact' (che andavano in timeout 3s → 0) e il select non limitato che
  // calcolava enti/importo su sole ~1000 righe (cap PostgREST) sotto-contandoli.
  const { data, error } = await supabase.rpc('get_bandi_home_stats');
  const r = (data as any[])?.[0];
  if (error || !r) {
    // Lanciamo (non ritorniamo 0): con ISR Next mantiene l'ultima pagina buona
    // invece di cachearne una che dichiara "0 bandi" (dato falso su un sito la
    // cui proposta di valore E' la copertura dati).
    console.error('[bandi] getBandiStats RPC error:', error?.message);
    throw new Error(`getBandiStats: cache non disponibile (${error?.message ?? 'nessuna riga'})`);
  }
  return {
    totale: Number(r.totale) || 0,
    scadFuture: Number(r.scad_future) || 0,
    enti: Number(r.enti) || 0,
    importoTotaleBase: Number(r.importo_totale_base) || 0,
  };
}

export interface AggStats {
  /** Righe di aggiudicazione (una impresa per gara, RTI = piu' righe). */
  righe: number;
  /** Gare distinte aggiudicate. */
  gare: number;
  /** Imprese distinte che hanno vinto almeno una gara. */
  imprese: number;
  /** Gare aggiudicate in raggruppamento (RTI). */
  gareRti: number;
}

/**
 * Statistiche aggregate sulle aggiudicazioni (cache `bandi_aggiudicazioni`).
 * Alimenta i copy di dominio (numeri reali, non hardcoded) su home e classifiche.
 */
export async function getAggStats(): Promise<AggStats> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase.rpc('get_stats_cache', {
    p_key: 'bandi_aggiudicazioni',
  });
  const r = data as any;
  if (error || !r) {
    // Throw invece di zeri: evita di stampare "0 imprese vincitrici" (anche in
    // JSON-LD) come dato reale; ISR mantiene l'ultima pagina buona.
    console.error('[bandi] getAggStats cache error:', error?.message);
    throw new Error(`getAggStats: cache non disponibile (${error?.message ?? 'payload vuoto'})`);
  }
  return {
    righe: Number(r.righe) || 0,
    gare: Number(r.gare) || 0,
    imprese: Number(r.imprese) || 0,
    gareRti: Number(r.gare_rti) || 0,
  };
}

export interface CpvGroupStat {
  group: string;
  cnt: number;
}

/**
 * Conteggi per gruppo CPV (prime 2 cifre del cpv_principale).
 * SINGLE SOURCE: legge la cache `bandi_cpv_group` (istantanea e coerente), così
 * home, filtro /bandi e pagina categoria mostrano lo STESSO numero. Sostituisce
 * l'enumerazione full-dataset (lenta e soggetta a conteggi parziali/divergenti).
 */
export async function getBandiByCpvGroup(): Promise<CpvGroupStat[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase.rpc('get_stats_cache', {
    p_key: 'bandi_cpv_group',
  });
  if (error || !Array.isArray(data)) {
    // Throw invece di []: le categorie CPV non sono mai legittimamente vuote;
    // un errore cache non deve svuotare silenziosamente filtro e griglia home.
    console.error('[bandi] getBandiByCpvGroup cache error:', error?.message);
    throw new Error(`getBandiByCpvGroup: cache non disponibile (${error?.message ?? 'payload non-array'})`);
  }
  return (data as { group: string | number; cnt: number }[])
    // padStart: robusto verso eventuali divisioni CPV con zero iniziale (es. "03")
    // che una serializzazione numerica ridurrebbe a 1 cifra.
    .map((r) => ({ group: String(r.group).padStart(2, '0'), cnt: Number(r.cnt) || 0 }))
    .filter((r) => r.group.length === 2)
    .sort((a, b) => b.cnt - a.cnt);
}

/**
 * Top regioni per uno specifico gruppo CPV (cross-link categoria↔geo §4.2.3).
 * Legge da `landscape_public` (pre-aggregata cpv2 × regione × fascia, gia'
 * usata dai moduli intelligence): UNA query da <=80 righe, sommando n_gare per
 * regione. Verificato sul DB (10/07): i totali coincidono ESATTAMENTE con il
 * conteggio raw su bandi_gara_public (like 'NN%' + regione not null).
 * Sostituisce il walk keyset dell'intero gruppo (per CPV 45 = ~43 query da
 * 1000 righe A OGNI render della pagina categoria).
 */
export async function getRegioniByCpvGroup(
  group: string,
  limit = 8,
): Promise<RegioneStat[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('landscape_public')
    .select('regione, n_gare')
    .eq('cpv2', group)
    .limit(1000);
  if (error) {
    console.error('[bandi] getRegioniByCpvGroup error:', error.message);
    return [];
  }
  const counts = new Map<string, number>();
  for (const row of (data as { regione: string | null; n_gare: number }[]) || []) {
    const r = (row.regione || '').trim();
    if (r) counts.set(r, (counts.get(r) || 0) + (Number(row.n_gare) || 0));
  }
  return Array.from(counts.entries())
    .map(([regione, cnt]) => ({ regione, cnt }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, limit);
}

/**
 * Conteggio bandi per uno specifico gruppo CPV.
 * Legge dalla STESSA cache di getBandiByCpvGroup: così il totale in
 * generateMetadata e quello mostrato nella hero della pagina categoria coincidono
 * (niente divergenza tra count exact e count planned).
 */
export async function getBandiCountByCpvGroup(group: string): Promise<number> {
  const groups = await getBandiByCpvGroup();
  return groups.find((g) => g.group === group)?.cnt ?? 0;
}

/** Bandi in scadenza (scadenza futura), ordinati per scadenza crescente. */
export async function getBandiInScadenza(
  limit = 50,
): Promise<{ data: Bando[]; total: number }> {
  return getBandi({
    soloAperti: true,
    orderBy: 'scadenza_offerte',
    orderDirection: 'asc',
    limit,
  });
}

// =====================================================================
// GEO — pagine regione (/[regione], /regioni)
// =====================================================================

export interface RegioneStat {
  /** Nome esatto regione, es. "Lombardia". */
  regione: string;
  cnt: number;
}

/**
 * Conteggio bandi per regione (solo righe con `regione` valorizzata).
 * SINGLE SOURCE: legge la cache `bandi_regioni` (refresh via pg_cron), come
 * getBandiByCpvGroup. UNA query invece del walk keyset dell'intero dataset
 * (~52 query da 1000 righe) che veniva ripetuto per OGNI render di /regioni,
 * delle 20 pagine /[regione] e del chunk 2 della sitemap (audit 10/07: era il
 * secondo pattern piu' costoso sul DB, ~49k chiamate).
 */
export async function getBandiByRegione(): Promise<RegioneStat[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase.rpc('get_stats_cache', {
    p_key: 'bandi_regioni',
  });
  if (error || !Array.isArray(data)) {
    // Throw invece di []: le regioni non sono mai legittimamente vuote; un
    // errore cache non deve svuotare silenziosamente /regioni, i cross-link
    // regione e il chunk sitemap (ISR mantiene l'ultima pagina buona).
    console.error('[bandi] getBandiByRegione cache error:', error?.message);
    throw new Error(`getBandiByRegione: cache non disponibile (${error?.message ?? 'payload non-array'})`);
  }
  return (data as { regione: string | null; n: number }[])
    .map((r) => ({ regione: String(r.regione || '').trim(), cnt: Number(r.n) || 0 }))
    .filter((r) => r.regione)
    .sort((a, b) => b.cnt - a.cnt);
}

export interface RegioneStats {
  totale: number;
  aperti: number;
  importoTotaleBase: number;
  enti: number;
  /** Top gruppi CPV (prime 2 cifre) presenti nella regione. */
  topCpv: CpvGroupStat[];
}

/**
 * Statistiche reali aggregate per una singola regione (filtro esatto sul nome).
 * Tutto calcolato sulla view safe `bandi_gara_public`.
 */
export async function getRegioneStats(regione: string): Promise<RegioneStats> {
  const supabase: any = createServerClient();
  // totale/aperti/enti/importo via RPC aggregata (no count:'exact' in timeout → 0).
  // topCpv resta calcolato su un campione (top categorie regione, dato secondario).
  const [statsRes, cpvRowsRes] = await Promise.all([
    supabase.rpc('get_bandi_regione_stats', { p_regione: regione }),
    supabase
      .from('bandi_gara_public')
      .select('cpv_principale')
      .eq('regione', regione)
      .limit(5000),
  ]);

  const s = (statsRes.data as any[])?.[0];
  const rows =
    (cpvRowsRes.data as { cpv_principale: string | null }[]) || [];

  const cpvCounts = new Map<string, number>();
  for (const r of rows) {
    const g = (r.cpv_principale || '').replace(/[^0-9]/g, '').slice(0, 2);
    if (g.length === 2) cpvCounts.set(g, (cpvCounts.get(g) || 0) + 1);
  }
  const topCpv = Array.from(cpvCounts.entries())
    .map(([group, cnt]) => ({ group, cnt }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 6);

  return {
    totale: Number(s?.totale) || 0,
    aperti: Number(s?.aperti) || 0,
    importoTotaleBase: Number(s?.importo_totale_base) || 0,
    enti: Number(s?.enti) || 0,
    topCpv,
  };
}

// =====================================================================
// GEO — pagine provincia (/[regione]/[provincia])
// =====================================================================

export interface ProvinciaStat {
  /** Nome esatto regione, es. "Lombardia". */
  regione: string;
  /** Sigla provincia come salvata in `bandi_gara_public.provincia`, es. "MI". */
  sigla: string;
  cnt: number;
}

/**
 * Conteggio bandi per provincia (chiave = regione|sigla), solo righe
 * geolocalizzate. Usato da sitemap (chunk province) e dal blocco "Province di
 * [Regione]" sulle pagine regione.
 *
 * SINGLE SOURCE: legge la cache `bandi_province` (refresh orario via
 * pg_cron), stesso pattern di getBandiByRegione/getBandiByCpvGroup. Sostituisce
 * il walk keyset dell'intero dataset (memoizzato 1h) che pagava comunque una
 * enumerazione completa per finestra.
 *
 * NB conteggio: la cache conta su `bandi_gara` (non sulla vista
 * `_public`/sanitizzata) — stesso scarto gia' accettato per regioni/CPV in
 * d1d7b8d, coerente con quei conteggi.
 *
 * NB coppie incoerenti: il dataset contiene poche righe con coppia (regione,
 * sigla) incoerente (rumore d'ingestion, es. Sicilia/RM). La whitelist
 * gerarchica derivata da PROVINCE del package (in lib/province.ts) le scarta
 * lato chiamante: una pagina esiste solo se (regioneSlug/provinciaSlug) è una
 * coppia valida del package.
 */
export async function getBandiByProvincia(minCount = 1): Promise<ProvinciaStat[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase.rpc('get_stats_cache', {
    p_key: 'bandi_province',
  });
  if (error || !Array.isArray(data)) {
    // Throw invece di []: come per regioni/CPV, un errore cache non deve
    // svuotare silenziosamente sitemap e blocco "Province di [Regione]".
    console.error('[bandi] getBandiByProvincia cache error:', error?.message);
    throw new Error(`getBandiByProvincia: cache non disponibile (${error?.message ?? 'payload non-array'})`);
  }
  return (data as { regione: string | null; provincia: string | null; n: number }[])
    .map((r) => ({
      regione: String(r.regione || '').trim(),
      sigla: String(r.provincia || '').trim(),
      cnt: Number(r.n) || 0,
    }))
    .filter((p) => p.regione && p.sigla && p.cnt >= minCount)
    .sort((a, b) => b.cnt - a.cnt);
}

/**
 * Conteggio bandi per le province (sigla) di UNA regione. Per il blocco
 * "Province di [Regione]". Derivato dalla cache getBandiByProvincia (1
 * query, RPC read-through): niente enumerazione per-regione ripetuta su
 * ognuna delle 20 pagine /[regione].
 */
export async function getProvinceCountByRegione(
  regione: string,
): Promise<Map<string, number>> {
  const all = await getBandiByProvincia();
  const counts = new Map<string, number>();
  for (const p of all) {
    if (p.regione === regione) counts.set(p.sigla, p.cnt);
  }
  return counts;
}

export interface ProvinciaStats {
  totale: number;
  aperti: number;
  importoTotaleBase: number;
  enti: number;
  topCpv: CpvGroupStat[];
  topComuni: { comune: string; cnt: number }[];
}

/**
 * Statistiche reali aggregate per una singola provincia (filtro per SIGLA).
 * Tutto sulla view safe `bandi_gara_public`.
 */
export async function getProvinciaStats(sigla: string): Promise<ProvinciaStats> {
  const supabase: any = createServerClient();
  const nowIso = new Date().toISOString();
  const [totaleRes, apertiRes, rowsRes] = await Promise.all([
    supabase
      .from('bandi_gara_public')
      .select('id', { count: 'exact', head: true })
      .eq('provincia', sigla),
    supabase
      .from('bandi_gara_public')
      .select('id', { count: 'exact', head: true })
      .eq('provincia', sigla)
      .gte('scadenza_offerte', nowIso),
    supabase
      .from('bandi_gara_public')
      .select('importo_base, stazione_appaltante, cpv_principale, comune')
      .eq('provincia', sigla)
      .limit(5000),
  ]);

  const rows =
    (rowsRes.data as {
      importo_base: number | null;
      stazione_appaltante: string | null;
      cpv_principale: string | null;
      comune: string | null;
    }[]) || [];

  const importoTotaleBase = rows.reduce(
    (s, r) => s + (Number(r.importo_base) || 0),
    0,
  );
  const enti = new Set(
    rows.map((r) => r.stazione_appaltante).filter(Boolean),
  ).size;

  const cpvCounts = new Map<string, number>();
  const comuneCounts = new Map<string, number>();
  for (const r of rows) {
    const g = (r.cpv_principale || '').replace(/[^0-9]/g, '').slice(0, 2);
    if (g.length === 2) cpvCounts.set(g, (cpvCounts.get(g) || 0) + 1);
    const c = (r.comune || '').trim();
    if (c) comuneCounts.set(c, (comuneCounts.get(c) || 0) + 1);
  }
  const topCpv = Array.from(cpvCounts.entries())
    .map(([group, cnt]) => ({ group, cnt }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 6);
  const topComuni = Array.from(comuneCounts.entries())
    .map(([comune, cnt]) => ({ comune, cnt }))
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 12);

  return {
    totale: totaleRes.count || 0,
    aperti: apertiRes.count || 0,
    importoTotaleBase,
    enti,
    topCpv,
    topComuni,
  };
}
