/**
 * Query layer per bandi pubblici (bandi_gara table).
 * Filtra sempre per visibilita_pubblica=true.
 */
import { createServerClient } from '../client';

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
  data_pubblicazione: string | null;
  scadenza_offerte: string | null;
  data_aggiudicazione: string | null;
  stazione_appaltante: string | null;
  comune: string | null;
  provincia: string | null;
  regione: string | null;
  categorie: string[] | null;
  cpv_principale: string | null;
  stato: string | null;
  aggiudicatario_ragione_sociale_raw: string | null;
}

export interface BandiFilters {
  regione?: string;
  cig?: string;
  importo_min?: number;
  q?: string;
  limit?: number;
  offset?: number;
}

export async function getBandi(filters: BandiFilters = {}): Promise<{ data: Bando[]; total: number }> {
  const supabase: any = createServerClient();
  const { regione, cig, importo_min, q, limit = 20, offset = 0 } = filters;
  // SAFE COLUMNS: escludiamo raw_data, fonte_url, crediti_costo (LAYER 1 trasparenza).
  let query = supabase
    .from('bandi_gara_public')
    .select(
      'id, slug, cig, cup, numero_bando, tipo_procedura, oggetto, descrizione_completa, importo_base, importo_aggiudicazione, data_pubblicazione, scadenza_offerte, data_aggiudicazione, stazione_appaltante, comune, provincia, regione, categorie, cpv_principale, stato, aggiudicatario_ragione_sociale_raw',
      { count: 'exact' },
    );
  // NB: bandi_gara_public filtra già visibilita_pubblica + espone solo colonne safe (no piva/raw_data).

  if (regione) query = query.ilike('regione', regione);
  if (cig) query = query.eq('cig', cig);
  if (importo_min) query = query.gte('importo_base', importo_min);
  if (q) query = query.or(`oggetto.ilike.%${q}%,descrizione_completa.ilike.%${q}%,stazione_appaltante.ilike.%${q}%`);

  query = query.order('data_pubblicazione', { ascending: false, nullsFirst: false });
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
    .select(
      'id, slug, cig, cup, numero_bando, tipo_procedura, oggetto, descrizione_completa, importo_base, importo_aggiudicazione, data_pubblicazione, scadenza_offerte, data_aggiudicazione, stazione_appaltante, comune, provincia, regione, categorie, cpv_principale, stato, aggiudicatario_ragione_sociale_raw',
    )
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('[bandi] getBandoBySlug error:', error.message);
    return null;
  }
  return (data as Bando) || null;
}

export async function getAllBandiSlugs(limit = 2000): Promise<{ slug: string; updated_at: string }[]> {
  const supabase: any = createServerClient();
  const { data, error } = await supabase
    .from('bandi_gara_public')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data as any[]) || [];
}
