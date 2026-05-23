import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Key, Mail, Zap, Lock, FileJson2 } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl, safeJsonLd } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'API pubbliche — Documentazione developer Italia Cantieri',
  description:
    'API REST pubblica per accedere ai dati cantieri italiani: endpoint, parametri, formati JSON, rate limit, esempi cURL e linee guida per integrazione developer.',
  alternates: { canonical: '/api-pubbliche' },
  openGraph: {
    title: 'API pubbliche — Italia Cantieri',
    description: 'Documentazione REST API per developer e PA.',
    url: '/api-pubbliche',
    type: 'website',
    images: [
      {
        url: ogImageUrl({
          title: 'API pubbliche Italia Cantieri',
          subtitle: 'REST JSON · rate limit · developer-friendly',
          kind: 'generic',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
};

const endpoints = [
  {
    name: 'GET /api/cantieri',
    desc: 'Lista cantieri paginata con filtri',
    params: [
      { name: 'regione', type: 'string', desc: 'Es. "Piemonte"' },
      { name: 'provincia', type: 'string', desc: 'Sigla 2 lettere, es. "TO"' },
      { name: 'comune', type: 'string', desc: 'Nome comune' },
      { name: 'categoria', type: 'string', desc: 'Es. "ristrutturazione"' },
      { name: 'tipo_titolo', type: 'string', desc: '"PDC", "SCIA", "CILA", "PAS", "DIA", "CONCESSIONE"' },
      { name: 'limit', type: 'number', desc: 'Default 50, max 200' },
      { name: 'offset', type: 'number', desc: 'Paginazione' },
    ],
    example: `curl "https://www.italiacantieri.it/api/cantieri?regione=Piemonte&limit=5"`,
  },
  {
    name: 'GET /api/comuni/autocomplete',
    desc: 'Autocompletamento comuni',
    params: [{ name: 'q', type: 'string', desc: 'Query, minimo 2 caratteri' }],
    example: `curl "https://www.italiacantieri.it/api/comuni/autocomplete?q=ales"`,
  },
];

const sampleResponse = `{
  "data": [
    {
      "id": "...",
      "slug": "2025-bologna-2025-966474-pdc",
      "tipo_titolo": "PDC",
      "comune": "Bologna",
      "provincia": "BO",
      "regione": "Emilia-Romagna",
      "indirizzo": "Via XX Settembre",
      "civico": "12",
      "data_pubblicazione": "2025-03-14",
      "importo_lavori": 450000,
      "categorie": ["ristrutturazione", "facciate"],
      "fonte_tipo": "open_data_PA",
      "url_fonte": "https://opendata.comune.bologna.it/..."
    }
  ],
  "total": 1759,
  "page": 1,
  "limit": 5
}`;

const license = [
  { label: 'Dati', value: 'CC BY 4.0' },
  { label: 'Attribuzione', value: 'italiacantieri.it (AZIENDA 365 SRL)' },
  { label: 'Uso commerciale', value: 'Permesso con attribuzione' },
  { label: 'Modifiche', value: 'Permesse con menzione fonte' },
];

export default function ApiPubblichePage() {
  const apiLd = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    'name': `API ${siteConfig.name}`,
    'description': 'REST API pubblica per accedere ai dati dei cantieri edilizi italiani aggregati da fonti pubbliche.',
    'documentation': `${siteConfig.baseUrl}/api-pubbliche`,
    'provider': {
      '@type': 'Organization',
      'name': siteConfig.companyName,
      'url': siteConfig.baseUrl,
    },
    'license': 'https://creativecommons.org/licenses/by/4.0/',
    'isAccessibleForFree': true,
    'audience': { '@type': 'Audience', 'audienceType': 'Developers, Researchers, PA' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(apiLd) }} />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-4xl">
          <BreadcrumbCantiere steps={[{ label: 'API pubbliche' }]} />

          <span className="eyebrow eyebrow-construction mb-4 inline-block">
            Developer Documentation
          </span>

          <h1 className="heading-display mb-6">
            API pubbliche{' '}
            <span className="text-construction italic">cantieri italiani</span>.
          </h1>

          <p className="body-large text-muted-foreground mb-8">
            REST JSON API per accedere programmaticamente al database cantieri Italia Cantieri.
            Gratuita, senza autenticazione per uso pubblico, conforme open data CC BY 4.0.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <div className="card-zen p-4">
              <Zap className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">60 req/min</div>
              <div className="text-xs text-muted-foreground mt-1">2.000/giorno per IP</div>
            </div>
            <div className="card-zen p-4">
              <FileJson2 className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">JSON REST</div>
              <div className="text-xs text-muted-foreground mt-1">UTF-8, RFC 7159</div>
            </div>
            <div className="card-zen p-4">
              <Lock className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">HTTPS only</div>
              <div className="text-xs text-muted-foreground mt-1">TLS 1.3</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-4xl">
          <h2 className="heading-section mb-8">Endpoints</h2>

          {endpoints.map((e) => (
            <div key={e.name} className="mb-12">
              <h3 className="font-mono text-base font-semibold text-construction mb-2">{e.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{e.desc}</p>

              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Parametri</h4>
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4 font-semibold">Nome</th>
                    <th className="py-2 pr-4 font-semibold">Tipo</th>
                    <th className="py-2 font-semibold">Descrizione</th>
                  </tr>
                </thead>
                <tbody>
                  {e.params.map((p) => (
                    <tr key={p.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 font-mono text-xs">{p.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground text-xs">{p.type}</td>
                      <td className="py-2 text-xs text-muted-foreground">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Esempio cURL</h4>
              <pre className="card-zen p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
                {e.example}
              </pre>
            </div>
          ))}

          <h3 className="font-semibold mb-3">Esempio risposta JSON</h3>
          <pre className="card-zen p-4 overflow-x-auto text-xs font-mono whitespace-pre">
            {sampleResponse}
          </pre>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16 bg-secondary">
        <div className="container-zen max-w-3xl">
          <span className="eyebrow mb-3 inline-block">Licenza e attribuzione</span>
          <h2 className="heading-section mb-6">CC BY 4.0 — dati aperti, attribuzione richiesta</h2>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-8">
            {license.map((l) => (
              <div key={l.label}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{l.label}</div>
                <div className="font-semibold mt-1">{l.value}</div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Esempio di attribuzione richiesta:{' '}
            <code className="text-xs px-2 py-1 bg-background rounded">
              Dati: italiacantieri.it (AZIENDA 365 SRL), CC BY 4.0
            </code>
          </p>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-3xl text-center">
          <Key className="h-8 w-8 text-construction mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="heading-section mb-4">Serve una chiave API dedicata?</h2>
          <p className="text-muted-foreground mb-6">
            Per uso istituzionale (PA, universita, ricerca) con rate limit personalizzato, SLA e dataset
            aggiuntivi (CSV/GeoJSON export, webhook nuovi cantieri):{' '}
            <a href="mailto:api@italiacantieri.it" className="underline underline-offset-4">
              api@italiacantieri.it
            </a>
            .
          </p>
          <Link
            href="/per-pubbliche-amministrazioni"
            className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline text-sm"
          >
            <Mail className="h-4 w-4" />
            Programma partnership PA
          </Link>
        </div>
      </section>
    </>
  );
}
