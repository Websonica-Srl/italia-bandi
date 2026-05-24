import { siteConfig } from '@/lib/site-config';
import { countSitemapChunks } from '@/app/sitemap';

export const revalidate = 3600;
export const dynamic = 'force-static';

/**
 * Sitemap INDEX manuale.
 *
 * Next 14.1.0 con `generateSitemaps()` espone i chunk a /sitemap/[id].xml ma NON
 * serve automaticamente l'indice a /sitemap.xml (bug vercel/next.js #61108,
 * risolto in 14.2+). robots.txt punta a /sitemap.xml: senza questo handler
 * Google riceverebbe un 404. Qui emettiamo a mano l'<sitemapindex> che elenca
 * tutti i chunk, riusando lo stesso conteggio di generateSitemaps()
 * (countSitemapChunks) per restare coerenti al variare degli indicizzabili.
 */
export async function GET() {
  const baseUrl = siteConfig.baseUrl;
  const lastmod = new Date().toISOString();
  const total = await countSitemapChunks();

  const entries = Array.from({ length: total }, (_, id) =>
    `  <sitemap>\n    <loc>${baseUrl}/sitemap/${id}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
