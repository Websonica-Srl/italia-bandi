import type { Metadata } from 'next';
import Link from 'next/link';
import { Code2, Key, Mail, Zap, Lock, FileJson2 } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl, safeJsonLd } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'API e accesso dati — Developer BandiGareDappalto',
  description:
    'Accesso programmatico ai dati dei bandi e delle gare d\'appalto pubbliche italiane: stato dell\'API, formati, licenza dati e canale per richieste istituzionali e di ricerca.',
  alternates: { canonical: '/api-pubbliche' },
  openGraph: {
    title: 'API e accesso dati — BandiGareDappalto',
    description: 'Accesso programmatico ai dati dei bandi pubblici. API in pubblicazione.',
    url: '/api-pubbliche',
    type: 'website',
    images: [{ url: ogImageUrl({ title: 'API e accesso dati', subtitle: 'Bandi e gare d\'appalto · dati aperti', kind: 'api' }), width: 1200, height: 630 }],
  },
};

const license = [
  { label: 'Natura dei dati', value: 'Pubblici per legge (D.Lgs. 36/2023)' },
  { label: 'Attribuzione', value: 'bandigaredappalto.it (AZIENDA 365 SRL)' },
  { label: 'Soggetti', value: 'Solo persone giuridiche' },
  { label: 'Fonti', value: 'Ufficiali e pubbliche' },
];

export default function ApiPubblichePage() {
  const apiLd = {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    name: `API ${siteConfig.name}`,
    description: 'Accesso programmatico ai dati dei bandi e delle gare d\'appalto pubbliche italiane aggregati da fonti ufficiali e pubbliche.',
    documentation: `${siteConfig.baseUrl}/api-pubbliche`,
    provider: { '@type': 'Organization', name: siteConfig.companyName, url: siteConfig.baseUrl },
    isAccessibleForFree: true,
    audience: { '@type': 'Audience', audienceType: 'Developers, Researchers, PA' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(apiLd) }} />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-4xl">
          <BreadcrumbCantiere steps={[{ label: 'API e accesso dati' }]} />
          <span className="eyebrow eyebrow-construction mb-4 inline-block">Developer</span>
          <h1 className="heading-display mb-6">
            API e accesso dati{' '}
            <span className="text-construction italic">bandi e gare</span>.
          </h1>
          <p className="body-large text-muted-foreground mb-8">
            Stiamo lavorando a un&apos;API REST pubblica per accedere programmaticamente al database dei bandi e delle
            gare d&apos;appalto. La documentazione tecnica sarà pubblicata qui. Nel frattempo, l&apos;accesso ai dati per
            usi istituzionali, accademici o di ricerca è disponibile su richiesta.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <div className="card-zen p-4">
              <Zap className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">In pubblicazione</div>
              <div className="text-xs text-muted-foreground mt-1">Endpoint REST in arrivo</div>
            </div>
            <div className="card-zen p-4">
              <FileJson2 className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">JSON REST</div>
              <div className="text-xs text-muted-foreground mt-1">UTF-8, dati strutturati</div>
            </div>
            <div className="card-zen p-4">
              <Lock className="h-5 w-5 text-construction mb-2" strokeWidth={1.5} />
              <div className="text-sm font-semibold">HTTPS only</div>
              <div className="text-xs text-muted-foreground mt-1">Solo dati di persone giuridiche</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-4xl">
          <h2 className="heading-section mb-6 inline-flex items-center gap-2">
            <Code2 className="h-6 w-6" /> Cosa esporremo
          </h2>
          <p className="text-muted-foreground mb-6">
            L&apos;API esporrà i dati pubblici dei bandi così come già visibili sul sito: oggetto, stazione appaltante,
            importo a base di gara, scadenza, CIG, CUP, categoria CPV, procedura, stato e — quando disponibile — la
            ragione sociale dell&apos;aggiudicatario. <strong>Non</strong> verranno mai esposti partita IVA, codice fiscale,
            contatti del RUP o altri dati personali di persone fisiche.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-secondary-text">
            <li className="card-zen p-3">Lista bandi con filtri (categoria, procedura, importo, scadenza)</li>
            <li className="card-zen p-3">Dettaglio singolo bando per slug o CIG</li>
            <li className="card-zen p-3">Aggiudicatari di una gara (solo persone giuridiche)</li>
            <li className="card-zen p-3">Aggregati per categoria CPV</li>
          </ul>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16 bg-secondary">
        <div className="container-zen max-w-3xl">
          <span className="eyebrow mb-3 inline-block">Licenza e attribuzione</span>
          <h2 className="heading-section mb-6">Dati pubblici, attribuzione richiesta</h2>
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
              Dati: bandigaredappalto.it (AZIENDA 365 SRL)
            </code>
          </p>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-3xl text-center">
          <Key className="h-8 w-8 text-construction mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="heading-section mb-4">Ti serve l&apos;accesso ai dati ora?</h2>
          <p className="text-muted-foreground mb-6">
            Per uso istituzionale (PA, università, ricerca) o integrazioni dedicate, scrivici a{' '}
            <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-4">{siteConfig.email}</a>{' '}
            indicando l&apos;ambito di utilizzo.
          </p>
          <Link href="/per-pubbliche-amministrazioni" className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline text-sm">
            <Mail className="h-4 w-4" /> Programma partnership PA
          </Link>
        </div>
      </section>
    </>
  );
}
