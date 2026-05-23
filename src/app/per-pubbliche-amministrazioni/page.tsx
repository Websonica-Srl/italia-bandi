import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Database, FileCheck2, Mail, Newspaper, Shield, Sparkles, Users } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl, safeJsonLd } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'Per Pubbliche Amministrazioni — Partnership, embed e press kit',
  description:
    'Italia Cantieri valorizza i dati open dei Comuni italiani. Embed widget, citazioni standardizzate, dataset CSV, partnership PA. Servizio pubblico no-profit gestito da AZIENDA 365 SRL',
  alternates: { canonical: '/per-pubbliche-amministrazioni' },
  openGraph: {
    title: 'Per Pubbliche Amministrazioni — Italia Cantieri',
    description: 'Partnership con Comuni e PA italiane. Embed, dataset CSV, press kit.',
    url: '/per-pubbliche-amministrazioni',
    type: 'website',
    images: [
      {
        url: ogImageUrl({
          title: 'Per Pubbliche Amministrazioni',
          subtitle: 'Partnership, embed, press kit',
          kind: 'generic',
          count: '9.733',
          label: 'cantieri pubblicati',
        }),
        width: 1200,
        height: 630,
      },
    ],
  },
};

const partnerships = [
  {
    icon: Building2,
    title: 'Per Comuni e Citta Metropolitane',
    body: 'Integriamo gratuitamente i vostri Albo Pretorio e Open Data nel database nazionale. Citazione standardizzata della fonte in ogni scheda cantiere. Restate visibili a progettisti, imprese e cittadini.',
  },
  {
    icon: Database,
    title: 'Per Regioni e Agenzie',
    body: 'Dataset aggregati a disposizione per pianificazione territoriale, studi statistici e bandi PNRR. Esportabili in CSV, JSON, GeoJSON con licenza CC BY 4.0.',
  },
  {
    icon: Newspaper,
    title: 'Per Stampa, Ricerca e Universita',
    body: 'Press kit con dati certificati per giornalisti, tesisti e ricercatori. Snapshot statistici per regione/provincia/comune, citabili con DOI permanente (in arrivo).',
  },
];

const pressKit = [
  { label: 'Cantieri totali pubblicati', value: '9.733' },
  { label: 'Soggetti analizzati', value: '56.535' },
  { label: 'Imprese e studi nel network', value: '41.262' },
  { label: 'Comuni integrati', value: '6' },
  { label: 'Regioni coperte', value: '3' },
  { label: 'Fonte primaria Bologna', value: '1.759 cantieri' },
  { label: 'Conformita', value: 'GDPR + k-anon 5' },
  { label: 'Aggiornamento dataset', value: 'Settimanale' },
];

const press = [
  {
    quote:
      'Italia Cantieri unifica i dati di Albo Pretorio e Open Data dei Comuni in un database nazionale ricercabile.',
    context: 'Riassunto editoriale 50 caratteri',
  },
  {
    quote:
      'Dal 2026 sono 9.733 i cantieri edilizi italiani pubblicati su italiacantieri.it, con copertura attuale di sei Comuni in Piemonte, Emilia-Romagna e Lombardia.',
    context: 'Riassunto dati 200 caratteri',
  },
  {
    quote:
      'Italia Cantieri e un servizio editoriale di AZIENDA 365 SRL che aggrega i cantieri edilizi pubblicati ai sensi del D.Lgs. 33/2013 (Trasparenza), gestendo i dati personali secondo GDPR e tecniche di k-anonymity per i cantieri privati.',
    context: 'Profilo lungo 300 caratteri',
  },
];

const apiEndpoints = [
  {
    path: '/api/cantieri?regione=Piemonte&limit=10',
    desc: 'Lista cantieri filtrati per regione',
  },
  {
    path: '/api/cantieri?provincia=TO&categoria=ristrutturazione',
    desc: 'Filtri combinati provincia + categoria',
  },
  {
    path: '/api/comuni/autocomplete?q=ales',
    desc: 'Autocompletamento comuni',
  },
];

export default function PerPubblicheAmministrazioniPage() {
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    'name': `${siteConfig.name} — Programma Partnership Pubblica Amministrazione`,
    'serviceType': 'Open Data Aggregation Service',
    'provider': {
      '@type': 'Organization',
      'name': siteConfig.companyName,
      'url': siteConfig.baseUrl,
    },
    'areaServed': { '@type': 'Country', 'name': 'Italia' },
    'audience': {
      '@type': 'GovernmentOrganization',
      'name': 'Comuni, Regioni, Agenzie e Pubbliche Amministrazioni italiane',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(orgLd) }} />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-4xl">
          <BreadcrumbCantiere steps={[{ label: 'Per Pubbliche Amministrazioni' }]} />

          <span className="eyebrow eyebrow-construction mb-4 inline-block">
            Programma Partnership PA
          </span>

          <h1 className="heading-display mb-6">
            Diamo valore ai vostri{' '}
            <span className="text-construction italic">open data</span>.
          </h1>

          <p className="body-large text-muted-foreground mb-12">
            Italia Cantieri integra gratuitamente i dati di Albo Pretorio e Open Data dei Comuni italiani.
            Ogni scheda cantiere cita la fonte ufficiale, ogni partner pubblico resta visibile a progettisti,
            imprese, cittadini, giornalisti e ricercatori.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {partnerships.map((p) => (
              <div key={p.title} className="card-zen p-6">
                <p.icon className="h-6 w-6 text-construction mb-4" strokeWidth={1.5} />
                <h2 className="font-semibold mb-2">{p.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-4xl">
          <h2 className="heading-section mb-2">Press kit dati certificati</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Aggiornato {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}.
            Usate liberamente questi numeri citando la fonte:{' '}
            <em>italiacantieri.it (AZIENDA 365 SRL)</em>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-12">
            {pressKit.map((k) => (
              <div key={k.label}>
                <div className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter">
                  {k.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-4 text-foreground">Citazioni pronte per articoli e comunicati</h3>
          <div className="space-y-4 mb-12">
            {press.map((p, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-construction pl-4 py-2 italic text-foreground"
              >
                &laquo;{p.quote}&raquo;
                <cite className="block not-italic text-xs text-muted-foreground mt-2 normal-case">
                  {p.context}
                </cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16 bg-secondary">
        <div className="container-zen max-w-4xl">
          <span className="eyebrow mb-3 inline-block">Embed e API pubbliche</span>
          <h2 className="heading-section mb-6">
            Integrate i dati Italia Cantieri sui vostri portali istituzionali.
          </h2>

          <p className="text-muted-foreground mb-6">
            API REST pubblica disponibile gratuitamente (rate limit 60 richieste/minuto, 2.000/giorno).
            Esempi di endpoint:
          </p>

          <div className="space-y-2 mb-8 font-mono text-sm">
            {apiEndpoints.map((e) => (
              <div key={e.path} className="card-zen p-4 flex flex-col md:flex-row md:items-center gap-2">
                <code className="text-construction">{e.path}</code>
                <span className="text-xs text-muted-foreground md:ml-auto">{e.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Per uso istituzionale, accademico o di ricerca senza rate limit: scrivete per chiave API
            dedicata e SLA personalizzato.
          </p>

          <Link
            href="/api-pubbliche"
            className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline"
          >
            <FileCheck2 className="h-4 w-4" />
            Documentazione API completa
          </Link>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-3xl text-center">
          <Mail className="h-8 w-8 text-construction mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="heading-section mb-4">Contatto partnership PA</h2>
          <p className="text-muted-foreground mb-6">
            Scrivete a <a href="mailto:pa@italiacantieri.it" className="underline underline-offset-4">pa@italiacantieri.it</a>{' '}
            indicando ente, ruolo e tipo di collaborazione richiesta (integrazione dati, embed widget,
            dataset CSV, intervista stampa, dato statistico personalizzato).
          </p>
          <p className="text-sm text-muted-foreground">
            Rispondiamo entro 5 giorni lavorativi. Tutte le integrazioni dati con PA italiane sono{' '}
            <strong className="text-foreground">gratuite e perpetue</strong>.
          </p>
        </div>
      </section>
    </>
  );
}
