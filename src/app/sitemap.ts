import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getBandiByRegione, getBandiByProvincia } from '@/lib/supabase/queries/bandi';
import { getLeaderboardSegments } from '@/lib/supabase/queries/intelligence';
import { regioneSlug } from '@/lib/regioni';
import { provinciaFromSigla } from '@/lib/province';

export const revalidate = 3600;

/**
 * Sitemap ridotta al solo contenuto indicizzabile (decisione 26/08/2026):
 * schede bando, liste categoria, /bandi, /scadenze ed ente sono `noindex,
 * follow` (corsia B1), quindi escono dalla sitemap. Restano SOLO 4 chunk fissi
 * (nessuna query per contarli): 0 statiche, 1 regioni, 2 province,
 * 3 classifiche.
 */
export const TOTAL_CHUNKS = 4;

/** Soglia minima imprese per segmento leaderboard (allineata alle pagine). */
const LEADERBOARD_MIN = 5;

/**
 * Numero TOTALE di chunk sitemap. Usato sia da generateSitemaps() (qui) sia
 * dall'indice manuale (app/sitemap.xml/route.ts) per restare coerenti.
 *
 * NB Next 14.1.0: generateSitemaps() espone i chunk a /sitemap/[id].xml ma NON
 * serve l'indice a /sitemap.xml (bug noto, fixato in 14.2+). Per questo l'indice
 * è emesso manualmente da app/sitemap.xml/route.ts, che riusa questa funzione.
 * Resta async (nessuna query dentro) per non cambiare la firma usata dall'indice.
 */
export async function countSitemapChunks(): Promise<number> {
  return TOTAL_CHUNKS;
}

/**
 * Chunk sitemap via Next `generateSitemaps()` → /sitemap/[id].xml.
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

  // id 0 — statiche + hub (/bandi e /scadenze sono noindex: fuori sitemap)
  if (id === 0) {
    return [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/classifiche`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/regioni`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
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

  // id 1 — regioni (solo quelle con almeno un bando geolocalizzato)
  if (id === 1) {
    const regioni = await getBandiByRegione();
    return regioni.map((r) => ({
      url: `${baseUrl}/${regioneSlug(r.regione)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  }

  // id 2 — province (whitelist package, solo sigle valide con bandi)
  if (id === 2) {
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

  // id 3 — classifiche (indice + segmenti CPV/regione con >= LEADERBOARD_MIN imprese)
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
