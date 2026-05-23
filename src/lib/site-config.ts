/**
 * Site config per italiacantieri.it (HUB unico, no multi-tenant come satelliti).
 * Espone valori statici + funzioni helper per layout/metadata.
 */

export interface SiteConfig {
  name: string;
  domain: string;
  baseUrl: string;
  tagline: string;
  description: string;
  email: string;
  dpoEmail: string;
  companyName: string;
  companyPiva: string;
  network: {
    name: string;
    url: string;
  }[];
  tracking: {
    gaId: string | null;
    metaPixelId: string | null;
    searchConsoleId: string | null;
  };
  seo: {
    defaultTitle: string;
    titleSuffix: string;
    defaultDescription: string;
    keywords: string[];
  };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.italiacantieri.it';

export const siteConfig: SiteConfig = {
  name: 'Italia Cantieri',
  domain: 'italiacantieri.it',
  baseUrl: siteUrl,
  tagline: 'Aggregatore pubblico cantieri edilizi e bandi di gara in Italia',
  description:
    'Italia Cantieri è il database pubblico dei cantieri edilizi italiani: permessi di costruire, SCIA, CILA, bandi pubblici. Dati open data PA aggregati con piena trasparenza GDPR.',
  email: 'info@italiacantieri.it',
  dpoEmail: 'privacy@italiaprogettisti.com',
  companyName: 'AZIENDA 365 SRL',
  companyPiva: 'P.IVA 02724340746',
  network: [
    { name: 'Italia Progettisti', url: 'https://www.italiaprogettisti.com' },
    { name: 'Italia Domus', url: 'https://www.italiadomus.it' },
    { name: 'Italia Serramenti', url: 'https://www.italiaserramenti.com' },
    { name: 'Italia Blindati', url: 'https://www.italiablindati.com' },
    { name: 'Italia Piscine', url: 'https://www.italiapiscine.com' },
    { name: 'Italia SPA & Hammam', url: 'https://www.italiaspaehammam.com' },
    { name: 'Bagno24', url: 'https://www.bagno24.it' },
  ],
  tracking: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || null,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
    searchConsoleId: process.env.NEXT_PUBLIC_SEARCH_CONSOLE_ID || null,
  },
  seo: {
    defaultTitle:
      'Italia Cantieri — Database cantieri edilizi pubblici e bandi di gara Italia',
    titleSuffix: 'Italia Cantieri',
    defaultDescription:
      'Aggregatore pubblico di cantieri edilizi italiani: permessi di costruire (PDC), SCIA, CILA, bandi pubblici. Dati open data PA con piena trasparenza GDPR.',
    keywords: [
      'cantieri edilizi italia',
      'permessi di costruire',
      'PDC SCIA CILA',
      'bandi di gara pubblici',
      'open data PA',
      'database cantieri',
      'edilizia pubblica',
    ],
  },
};

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}
