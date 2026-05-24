/**
 * Generatori JSON-LD schema.org per bandigaredappalto.it.
 * Escape </script> per evitare injection.
 */
import { Bando } from '@/lib/supabase/queries/bandi';
import { siteConfig } from '@/lib/site-config';

/** Escape sicuro per JSON-LD inline in HTML. */
export function safeJsonLd(obj: any): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

/** Organization base — esteso con contactPoint per AEO. */
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    legalName: siteConfig.companyName,
    url: siteConfig.baseUrl,
    description: siteConfig.description,
    foundingDate: '2026',
    areaServed: { '@type': 'Country', name: 'Italia' },
    knowsAbout: [
      'bandi di gara pubblici',
      'gare d\'appalto Italia',
      'appalti pubblici',
      'CIG codice identificativo gara',
      'CPV vocabolario comune appalti',
      'attestazione SOA',
      'stazione appaltante',
      'aggiudicatari gare pubbliche',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: siteConfig.email,
        areaServed: 'IT',
        availableLanguage: ['Italian'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Data Protection Officer',
        email: siteConfig.dpoEmail,
        areaServed: 'IT',
      },
    ],
    sameAs: siteConfig.network.map((n) => n.url),
  };
}

/** WebSite con SearchAction. Target = pagina /bandi (entry-point ricerca bandi). */
export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    inLanguage: 'it-IT',
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.baseUrl}/bandi?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** ItemList per le liste di bandi (home, /bandi, /categoria/[cpv], /scadenze). */
export function itemListLd(
  items: { name: string; url: string }[],
  listName?: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(listName ? { name: listName } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

/** GovernmentService / Bando di gara — route canonica /bandi/[slug]. */
export function bandoLd(b: Bando, titolo: string, descrizione: string) {
  const aperto = !!b.scadenza_offerte && new Date(b.scadenza_offerte) >= new Date();
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: titolo,
    description: descrizione,
    identifier: b.cig || b.numero_bando || b.id,
    url: `${siteConfig.baseUrl}/bandi/${b.slug}`,
    serviceType: b.tipo_procedura || 'Bando di gara pubblico',
    inLanguage: 'it-IT',
    provider: {
      '@type': 'GovernmentOrganization',
      name: b.stazione_appaltante || 'Stazione appaltante',
      areaServed: { '@type': 'Country', name: 'Italia' },
    },
    ...(b.importo_base
      ? {
          offers: {
            '@type': 'Offer',
            price: b.importo_base,
            priceCurrency: 'EUR',
            availability: aperto
              ? 'https://schema.org/InStock'
              : 'https://schema.org/Discontinued',
            ...(b.scadenza_offerte ? { validThrough: b.scadenza_offerte } : {}),
          },
        }
      : {}),
  };
}

/**
 * BreadcrumbList JSON-LD — riflette il silo Home › ... › foglia.
 * Antepone sempre Home (siteConfig.name → "/"). I `path` sono relativi e
 * vengono resi assoluti qui. L'ultimo item può non avere path (pagina corrente).
 *
 * NB: il componente <BreadcrumbCantiere> emette già il proprio BreadcrumbList.
 * Questo generatore serve quando si vuole il JSON-LD senza renderizzare il
 * componente, o per centralizzare la logica (single source per altri usi).
 * Evitare di stampare DUE BreadcrumbList sulla stessa pagina.
 */
export function breadcrumbLd(items: { name: string; path?: string }[]) {
  const full = [{ name: siteConfig.name, path: '/' }, ...items];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: full.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${siteConfig.baseUrl}${it.path}` } : {}),
    })),
  };
}

/** FAQ schema.org */
export function faqLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/**
 * Schema.org Dataset per /statistiche e altre pagine dati.
 * Google Dataset Search lo indicizza esplicitamente.
 */
export interface DatasetLdInput {
  name: string;
  description: string;
  url: string;
  /** Es. "2026-05-19" */
  dateModified?: string;
  /** Es. "2025-01/2026-12" */
  temporalCoverage?: string;
  spatialCoverageRegions?: string[];
  keywords?: string[];
  /** URL endpoint API o CSV download */
  distributions?: { url: string; encodingFormat: string; name?: string }[];
  /** Variabili misurate (campi del dataset) */
  variableMeasured?: { name: string; description?: string }[];
  /** Es. "CC-BY-4.0" o full URL */
  license?: string;
  /** Numero record per "size" */
  recordCount?: number;
}

export function datasetLd(input: DatasetLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: 'it-IT',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Organization',
      name: siteConfig.companyName,
      url: siteConfig.baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.baseUrl,
    },
    license: input.license || 'https://creativecommons.org/licenses/by/4.0/',
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.temporalCoverage ? { temporalCoverage: input.temporalCoverage } : {}),
    ...(input.spatialCoverageRegions && input.spatialCoverageRegions.length > 0
      ? {
          spatialCoverage: {
            '@type': 'Place',
            name: 'Italia',
            geo: {
              '@type': 'GeoShape',
              addressCountry: 'IT',
            },
            containsPlace: input.spatialCoverageRegions.map((r) => ({
              '@type': 'AdministrativeArea',
              name: r,
              addressCountry: 'IT',
            })),
          },
        }
      : {
          spatialCoverage: { '@type': 'Place', name: 'Italia' },
        }),
    ...(input.keywords && input.keywords.length > 0 ? { keywords: input.keywords } : {}),
    ...(input.distributions && input.distributions.length > 0
      ? {
          distribution: input.distributions.map((d) => ({
            '@type': 'DataDownload',
            encodingFormat: d.encodingFormat,
            contentUrl: d.url,
            ...(d.name ? { name: d.name } : {}),
          })),
        }
      : {}),
    ...(input.variableMeasured && input.variableMeasured.length > 0
      ? {
          variableMeasured: input.variableMeasured.map((v) => ({
            '@type': 'PropertyValue',
            name: v.name,
            ...(v.description ? { description: v.description } : {}),
          })),
        }
      : {}),
    ...(input.recordCount ? { size: `${input.recordCount} records` } : {}),
  };
}

/**
 * Schema.org DefinedTermSet + DefinedTerm[] per /glossario.
 * AI engines (Perplexity, ChatGPT, Bing) usano questo schema
 * per citare definizioni accurate.
 */
export interface GlossaryTerm {
  termCode: string; // es. "PDC"
  name: string; // es. "Permesso di Costruire"
  definition: string;
  example?: string;
  /** Path relativo a pagina pertinente, es. /statistiche */
  relatedPath?: string;
}

export function glossaryLd(setName: string, terms: GlossaryTerm[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: setName,
    url: `${siteConfig.baseUrl}/glossario`,
    inLanguage: 'it-IT',
    hasDefinedTerm: terms.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${siteConfig.baseUrl}/glossario#${t.termCode.toLowerCase()}`,
      name: t.name,
      termCode: t.termCode,
      description: t.definition,
      inDefinedTermSet: `${siteConfig.baseUrl}/glossario`,
      ...(t.relatedPath ? { url: `${siteConfig.baseUrl}${t.relatedPath}` } : {}),
    })),
  };
}

/**
 * HowTo schema.org per spiegazione step "Come funziona italiacantieri.it" e simili.
 */
export interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

export function howToLd(title: string, description: string, steps: HowToStep[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    inLanguage: 'it-IT',
    totalTime: 'PT3M',
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
}

/**
 * Helper per costruire l'URL dell'og:image dinamico (/api/og).
 * Tutti i parametri vengono URL-encoded automaticamente.
 *
 * Restituisce sempre URL ASSOLUTO (richiesto da Open Graph crawler).
 */
export interface OgImageParams {
  title: string;
  subtitle?: string;
  kind?:
    | 'regione'
    | 'comune'
    | 'cantiere'
    | 'bando'
    | 'stats'
    | 'glossario'
    | 'generic'
    | 'pa'
    | 'api';
  count?: string;
  label?: string;
}

export function ogImageUrl(params: OgImageParams): string {
  const qs = new URLSearchParams();
  qs.set('title', params.title);
  if (params.subtitle) qs.set('subtitle', params.subtitle);
  if (params.kind) qs.set('kind', params.kind);
  if (params.count) qs.set('count', params.count);
  if (params.label) qs.set('label', params.label);
  return `${siteConfig.baseUrl}/api/og?${qs.toString()}`;
}
