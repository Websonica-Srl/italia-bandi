import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { getAllBandiSlugs, getBandiByCpvGroup } from '@/lib/supabase/queries/bandi';

export const revalidate = 3600;

/**
 * Sitemap: pagine statiche + categorie CPV presenti + schede bando.
 * NON includiamo /bandi con querystring (ricerca/filtro dinamica, noindex).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.baseUrl;
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/bandi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/scadenze`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/glossario`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/iscriviti`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/per-pubbliche-amministrazioni`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/api-pubbliche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/come-trattiamo-i-dati`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/chi-siamo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/termini`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Categorie CPV (gruppi realmente presenti)
  const cpvGroups = await getBandiByCpvGroup();
  const categoriaPages: MetadataRoute.Sitemap = cpvGroups.map((g) => ({
    url: `${baseUrl}/categoria/${g.group}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Schede bando
  const bandi = await getAllBandiSlugs(5000);
  const bandoPages: MetadataRoute.Sitemap = bandi.map((b) => ({
    url: `${baseUrl}/bandi/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...categoriaPages, ...bandoPages];
}
