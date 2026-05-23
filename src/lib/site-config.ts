/**
 * Site config per bandigaredappalto.it — satellite SEO della rete ItaliaProgettisti.
 * Vetrina pubblica (anon, sola lettura): tutto il transazionale (registrazione,
 * sblocco, abbonamento, alert) avviene sull'HUB www.italiaprogettisti.com.
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bandigaredappalto.it';

export const siteConfig: SiteConfig = {
  name: 'Bandi Gare d\'Appalto',
  domain: 'bandigaredappalto.it',
  baseUrl: siteUrl,
  tagline: 'Tutti i bandi e le gare d\'appalto pubbliche d\'Italia, in chiaro',
  description:
    'BandiGareDappalto è il portale pubblico dei bandi e delle gare d\'appalto in Italia: oggetto, stazione appaltante, importo a base di gara, scadenze, CIG/CUP, categoria CPV e chi vince le gare. Dati pubblici trattati nel rispetto del GDPR.',
  email: 'info@bandigaredappalto.it',
  dpoEmail: 'privacy@italiaprogettisti.com',
  companyName: 'AZIENDA 365 SRL',
  companyPiva: 'P.IVA 02724340746',
  network: [
    { name: 'Italia Progettisti', url: 'https://www.italiaprogettisti.com' },
    { name: 'Italia Cantieri', url: 'https://www.italiacantieri.it' },
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
      'Bandi e gare d\'appalto pubbliche in Italia — BandiGareDappalto',
    titleSuffix: 'BandiGareDappalto',
    defaultDescription:
      'Portale pubblico dei bandi e delle gare d\'appalto in Italia: procedure aperte, ristrette e negoziate, importo a base di gara, scadenze, CIG, CUP, categoria CPV e aggiudicatari. Dati pubblici, piena trasparenza GDPR.',
    keywords: [
      'bandi di gara',
      'gare d\'appalto pubbliche',
      'appalti pubblici Italia',
      'CIG CUP CPV',
      'stazione appaltante',
      'procedura aperta appalto',
      'categoria SOA',
      'importo a base di gara',
      'aggiudicatari gare',
    ],
  },
};

export function getSiteConfig(): SiteConfig {
  return siteConfig;
}

/** Costruisce un URL HUB con UTM coerenti per le CTA transazionali. */
export function hubUrl(
  path: string,
  campaign: string,
  extraParams: Record<string, string> = {},
): string {
  const base = 'https://www.italiaprogettisti.com';
  const qs = new URLSearchParams({
    utm_source: 'bandigaredappalto',
    utm_medium: 'referral',
    utm_campaign: campaign,
    ...extraParams,
  });
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}?${qs.toString()}`;
}
