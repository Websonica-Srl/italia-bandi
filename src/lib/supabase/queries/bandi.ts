/**
 * Query layer per bandi pubblici.
 * Legge SEMPRE e SOLO dalle view safe `bandi_gara_public` e
 * `bando_aggiudicatari_public` (niente partita_iva / codice_fiscale /
 * raw_data / fonte_url / contatti RUP). La view filtra già
 * visibilita_pubblica = true.
 */
import { createServerClient } from '../client';

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
 * superando il cap PostgREST di 1000 righe via paginazione `.range()`.
 * Usato da sitemap + aggregati per-regione/per-CPV (enumerano l'intero dataset).
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
 * Pre-filtro a livello DB (riduce il dataset paginato), poi rifinitura JS con la
 * STESSA logica di isBandoIndexable() per le condizioni composte (oggetto+ente).
 *
 * NB di calibrazione: nella view `aggiudicatario_ragione_sociale_raw` e
 * `importo_aggiudicazione` sono sempre vuoti, quindi NON si possono usare come
 * pre-filtro (darebbero solo i ~261 aperti). Il pre-filtro reale è:
 *   scadenza futura  OR  importo_base > 0
 * che cattura il ~99,8% dei bandi; la fascia "storico ricco" si chiude lato JS.
 *
 * MANTENERE allineato con isBandoIndexable() — ogni cambio di soglia va replicato.
 */
export async function getIndexableBandiSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const nowIso = new Date().toISOString();
  const rows = await fetchAllBandiRows(
    'slug, updated_at, scadenza_offerte, aggiudicatario_ragione_sociale_raw, importo_aggiudicazione, importo_base, oggetto, stazione_appaltante',
    (q) =>
      q
        .not('slug', 'is', null)
        // Pre-filtro DB: aperto OPPURE con importo a base d'asta valorizzato.
        // Esclude già la fascia "senza alcun importo" (thin); la soglia oggetto
        // (>=40) e la presenza ente si chiudono lato JS qui sotto.
        .or([`scadenza_offerte.gte.${nowIso}`, `importo_base.gt.0`].join(',')),
  );
  return rows
    .filter((r: any) => {
      const aperto = !!r.scadenza_offerte && new Date(r.scadenza_offerte) >= new Date();
      if (aperto) return true;
      const haAgg = !!(
        r.aggiudicatario_ragione_sociale_raw &&
        r.aggiudicatario_ragione_sociale_raw.trim().length > 2
      );
      const haImp =
        (r.importo_aggiudicazione != null && r.importo_aggiudicazione > 0) ||
        (r.importo_base != null && r.importo_base > 0);
      if (haAgg && haImp) return true;
      const oggRicco = !!(r.oggetto && r.oggetto.trim().length >= 40);
      const haEnte = !!(r.stazione_appaltante && r.stazione_appaltante.trim().length > 3);
      return oggRicco && haImp && haEnte;
    })
    .map((r: any) => ({ slug: r.slug as string, updated_at: r.updated_at as string }));
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
 * Aggregato lato app sulle righe del gruppo (filtro DB `like cpv%`).
 */
export async function getRegioniByCpvGroup(
  group: string,
  limit = 8,
): Promise<RegioneStat[]> {
  const data = await fetchAllBandiRows('regione', (q) =>
    q.like('cpv_principale', `${group}%`).not('regione', 'is', null),
  );
  if (!data.length) return [];
  const counts = new Map<string, number>();
  for (const row of data as { regione: string }[]) {
    const r = (row.regione || '').trim();
    if (r) counts.set(r, (counts.get(r) || 0) + 1);
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
 * Aggregato lato applicativo sul dataset (~3k righe, no RPC dedicata su view).
 */
export async function getBandiByRegione(): Promise<RegioneStat[]> {
  // Aggregato sull'intero dataset (no cap 1000): conteggi per regione corretti.
  const data = await fetchAllBandiRows('regione', (q) =>
    q.not('regione', 'is', null),
  );
  if (!data.length) return [];
  const counts = new Map<string, number>();
  for (const row of data as { regione: string }[]) {
    const r = (row.regione || '').trim();
    if (r) counts.set(r, (counts.get(r) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([regione, cnt]) => ({ regione, cnt }))
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
 * [Regione]" sulle pagine regione. Aggregato lato app sull'intero dataset.
 *
 * NB: il dataset contiene poche righe con coppia (regione, sigla) incoerente
 * (rumore d'ingestion, es. Sicilia/RM). La whitelist gerarchica derivata da
 * PROVINCE del package (in lib/province.ts) le scarta: una pagina esiste solo
 * se (regioneSlug/provinciaSlug) è una coppia valida del package.
 */
export async function getBandiByProvincia(minCount = 1): Promise<ProvinciaStat[]> {
  const data = await fetchAllBandiRows('regione, provincia', (q) =>
    q.not('provincia', 'is', null).not('regione', 'is', null),
  );
  const counts = new Map<string, ProvinciaStat>();
  for (const r of data as { regione: string; provincia: string }[]) {
    const regione = (r.regione || '').trim();
    const sigla = (r.provincia || '').trim();
    if (!regione || !sigla) continue;
    const key = `${regione}|${sigla}`;
    const cur = counts.get(key) ?? { regione, sigla, cnt: 0 };
    cur.cnt += 1;
    counts.set(key, cur);
  }
  return Array.from(counts.values())
    .filter((p) => p.cnt >= minCount)
    .sort((a, b) => b.cnt - a.cnt);
}

/**
 * Conteggio bandi per le province (sigla) di UNA regione. Per il blocco
 * "Province di [Regione]" — una sola enumerazione filtrata per nome regione.
 */
export async function getProvinceCountByRegione(
  regione: string,
): Promise<Map<string, number>> {
  const data = await fetchAllBandiRows('provincia', (q) =>
    q.eq('regione', regione).not('provincia', 'is', null),
  );
  const counts = new Map<string, number>();
  for (const r of data as { provincia: string }[]) {
    const sigla = (r.provincia || '').trim();
    if (sigla) counts.set(sigla, (counts.get(sigla) || 0) + 1);
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
