import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import {
  getCantieriByRegione,
  getAllProvince,
  getAllComuni,
  getAllCantieriSlugs,
} from '@/lib/supabase/queries/cantieri';
import { getAllBandiSlugs } from '@/lib/supabase/queries/bandi';
import { regioneSlug, slugify } from '@/lib/utils';
import { provinciaSlugFromCode } from '@/lib/province';

export const revalidate = 3600;

/**
 * Sitemap unica fino a ~5000 cantieri + 2000 bandi + 500 comuni + province + regioni + static.
 * Per scale superiori, Next.js suggerisce sitemap-split via generateSitemaps().
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.baseUrl;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/regioni`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/statistiche`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/bandi`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/iscriviti`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/glossario`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/per-pubbliche-amministrazioni`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/api-pubbliche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/come-trattiamo-i-dati`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/chi-siamo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/termini`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Regioni
  const regioni = await getCantieriByRegione();
  const regionPages: MetadataRoute.Sitemap = regioni.map((r) => ({
    url: `${baseUrl}/${regioneSlug(r.regione)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Province (per ogni regione)
  const province = await getAllProvince();
  const provinciaPages: MetadataRoute.Sitemap = province.slice(0, 200).map((p) => ({
    url: `${baseUrl}/${regioneSlug(p.regione)}/${provinciaSlugFromCode(p.provincia)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.75,
  }));

  // Comuni (max 500 dedup)
  const comuni = await getAllComuni(500);
  const comunePages: MetadataRoute.Sitemap = comuni.map((c) => ({
    url: `${baseUrl}/comune/${slugify(c.comune)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Cantieri (max 5000)
  const cantieri = await getAllCantieriSlugs(5000);
  const cantierePages: MetadataRoute.Sitemap = cantieri.map((c) => ({
    url: `${baseUrl}/cantiere/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // Bandi (max 2000)
  const bandi = await getAllBandiSlugs(2000);
  const bandoPages: MetadataRoute.Sitemap = bandi.map((b) => ({
    url: `${baseUrl}/bando/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...regionPages, ...provinciaPages, ...comunePages, ...cantierePages, ...bandoPages];
}
