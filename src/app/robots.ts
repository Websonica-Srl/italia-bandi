import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Le pagine di ricerca/filtro dinamiche (querystring su /bandi) sono già
        // noindex via metadata; qui evitiamo lo spreco di crawl budget sui parametri.
        disallow: ['/api/', '/bandi?'],
      },
    ],
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
    host: siteConfig.baseUrl,
  };
}
