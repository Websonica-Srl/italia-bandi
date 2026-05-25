import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import {
  getIndexableBandiSlugs,
  getBandiByCpvGroup,
  getBandiByRegione,
  getBandiByProvincia,
} from '@/lib/supabase/queries/bandi';
import {
  getLeaderboardSegments,
  getAllBuyersForParams,
} from '@/lib/supabase/queries/intelligence';
import { regioneSlug } from '@/lib/regioni';
import { provinciaFromSigla } from '@/lib/province';
import { buyerSlug } from '@/lib/buyer';
import { cpvGroupToSlug } from '@/lib/bandi-taxonomy-extra';

export const revalidate = 3600;

/** < 45k = margine di sicurezza sotto il limite Google di 50.000 URL/file. */
export const CHUNK = 40_000;
/**
 * Chunk non-bando: id 0 statiche, 1 categorie, 2 regioni, 3 province,
 * 4 classifiche (M8), 5 stazioni appaltanti / enti (M6).
 */
export const NON_BANDO_CHUNKS = 6;

/** Soglia minima imprese per segmento leaderboard (allineata alle pagine). */
const LEADERBOARD_MIN = 5;
/** Solo gli enti con almeno un'aggiudicazione hanno una pagina /ente utile (M6). */
const ENTE_MIN_AGGIUDICATI = 1;

/**
 * Numero TOTALE di chunk sitemap (non-bando + chunk bandi indicizzabili).
 * Usato sia da generateSitemaps() (qui) sia dall'indice manuale
 * (app/sitemap.xml/route.ts) per restare coerenti.
 *
 * NB Next 14.1.0: generateSitemaps() espone i chunk a /sitemap/[id].xml ma NON
 * serve l'indice a /sitemap.xml (bug noto, fixato in 14.2+). Per questo l'indice
 * è emesso manualmente da app/sitemap.xml/route.ts, che riusa questa funzione.
 */
export async function countSitemapChunks(): Promise<number> {
  let bandoChunks = 1;
  try {
    const slugs = await getIndexableBandiSlugs();
    bandoChunks = Math.max(1, Math.ceil(slugs.length / CHUNK));
  } catch {
    // Env Supabase assente a build time: almeno 1 chunk (resta ISR).
    bandoChunks = 1;
  }
  return NON_BANDO_CHUNKS + bandoChunks;
}

/**
 * Chunk sitemap via Next `generateSitemaps()` → /sitemap/[id].xml.
 * Segmentazione per tipo (debug Search Console + priority per tipo). I chunk
 * bandi contengono SOLO URL indicizzabili (isBandoIndexable === true): inserire
 * noindex in sitemap è un segnale contraddittorio e spreca crawl budget.
 */
export async function generateSitemaps() {
  const total = await countSitemapChunks();
  return Array.from({ length: total }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.baseUrl;
  const now = new Date();

  // id 0 — statiche + hub
  if (id === 0) {
    return [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/bandi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/classifiche`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/regioni`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/scadenze`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/glossario`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${baseUrl}/iscriviti`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      // /per-pubbliche-amministrazioni e' noindex (fuori indice + fuori menu):
      // non va in sitemap per non dare segnali contraddittori a Google.
      { url: `${baseUrl}/api-pubbliche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/come-trattiamo-i-dati`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/chi-siamo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${baseUrl}/legal/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${baseUrl}/legal/termini`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];
  }

  // id 1 — categorie CPV (gruppi realmente presenti)
  if (id === 1) {
    const groups = await getBandiByCpvGroup();
    return groups.map((g) => ({
      url: `${baseUrl}/categoria/${cpvGroupToSlug(g.group)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  }

  // id 2 — regioni (solo quelle con almeno un bando geolocalizzato)
  if (id === 2) {
    const regioni = await getBandiByRegione();
    return regioni.map((r) => ({
      url: `${baseUrl}/${regioneSlug(r.regione)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  }

  // id 3 — province (whitelist package, solo sigle valide con bandi)
  if (id === 3) {
    const province = await getBandiByProvincia();
    const seen = new Set<string>();
    const out: MetadataRoute.Sitemap = [];
    for (const p of province) {
      const info = provinciaFromSigla(p.sigla);
      // Scarta coppie (regione, sigla) incoerenti: la pagina esiste solo se la
      // sigla appartiene alla regione secondo il package (stessa whitelist del
      // routing). Dedup per path (più righe DB possono mappare alla stessa sigla).
      if (!info || info.regione !== p.regione) continue;
      const path = `/${info.regioneSlug}/${info.slug}`;
      if (seen.has(path)) continue;
      seen.add(path);
      out.push({
        url: `${baseUrl}${path}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      });
    }
    return out;
  }

  // id 4 — classifiche (indice + segmenti CPV/regione con >= LEADERBOARD_MIN imprese)
  if (id === 4) {
    const segments = await getLeaderboardSegments();
    const out: MetadataRoute.Sitemap = [
      { url: `${baseUrl}/classifiche`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.85 },
    ];
    for (const s of segments.cpv) {
      if (s.cnt < LEADERBOARD_MIN) continue;
      out.push({ url: `${baseUrl}/classifiche/cpv-${s.key}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 });
    }
    for (const s of segments.regioni) {
      if (s.cnt < LEADERBOARD_MIN) continue;
      out.push({ url: `${baseUrl}/classifiche/regione-${regioneSlug(s.key)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 });
    }
    return out;
  }

  // id 5 — stazioni appaltanti / enti (solo con aggiudicazioni; dedup per slug)
  if (id === 5) {
    const buyers = await getAllBuyersForParams();
    const seen = new Set<string>();
    const out: MetadataRoute.Sitemap = [];
    for (const b of buyers) {
      if ((Number(b.n_aggiudicati) || 0) < ENTE_MIN_AGGIUDICATI) continue;
      const slug = buyerSlug(b.stazione_appaltante);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      out.push({ url: `${baseUrl}/ente/${slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 });
    }
    return out;
  }

  // id >= 6 — bandi INDICIZZABILI, chunked da 40k
  const slugs = await getIndexableBandiSlugs();
  const chunkIdx = id - NON_BANDO_CHUNKS;
  const slice = slugs.slice(chunkIdx * CHUNK, (chunkIdx + 1) * CHUNK);
  return slice.map((b) => ({
    url: `${baseUrl}/bandi/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
}
