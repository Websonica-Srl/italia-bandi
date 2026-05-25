import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Database, FileCheck2, Mail, Newspaper } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { getBandiStats } from '@/lib/supabase/queries/bandi';
import { formatNumber, formatEuro } from '@/lib/utils';
import { ogImageUrl, safeJsonLd } from '@/lib/seo/structured-data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Per Pubbliche Amministrazioni — Trasparenza appalti, dati e press kit',
  description:
    'BandiGareDappalto valorizza la trasparenza degli appalti pubblici. Citazione standardizzata della fonte, dataset, press kit per stampa e ricerca. Servizio editoriale di AZIENDA 365 SRL.',
  alternates: { canonical: '/per-pubbliche-amministrazioni' },
  // Pagina fuori indice e fuori menu: raggiungibile solo via URL diretto.
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Per Pubbliche Amministrazioni — BandiGareDappalto',
    description: 'Trasparenza appalti, dataset, press kit per stampa e ricerca.',
    url: '/per-pubbliche-amministrazioni',
    type: 'website',
    images: [{ url: ogImageUrl({ title: 'Per Pubbliche Amministrazioni', subtitle: 'Trasparenza appalti, dataset, press kit', kind: 'pa' }), width: 1200, height: 630 }],
  },
};

const partnerships = [
  {
    icon: Building2,
    title: 'Per stazioni appaltanti',
    body: 'Integriamo i dati dei vostri bandi e gare nel portale nazionale, con citazione standardizzata della fonte. Aumentate la visibilità e la concorrenza alle vostre procedure.',
  },
  {
    icon: Database,
    title: 'Per Regioni e Agenzie',
    body: 'Aggregati a disposizione per analisi del mercato degli appalti, monitoraggio della spesa pubblica e studi statistici per categoria CPV, importo e procedura.',
  },
  {
    icon: Newspaper,
    title: 'Per Stampa, Ricerca e Università',
    body: 'Press kit con dati pubblici per giornalisti, tesisti e ricercatori che indagano la spesa pubblica e l\'aggiudicazione degli appalti in Italia.',
  },
];

export default async function PerPubblicheAmministrazioniPage() {
  const stats = await getBandiStats();

  const pressKit = [
    { label: 'Bandi pubblici tracciati', value: formatNumber(stats.totale) },
    { label: 'Con termine ancora aperto', value: formatNumber(stats.scadFuture) },
    { label: 'Stazioni appaltanti', value: formatNumber(stats.enti) },
    { label: 'Valore a base di gara', value: formatEuro(stats.importoTotaleBase, { compact: true }) },
    { label: 'Fonti', value: 'Ufficiali e pubbliche' },
    { label: 'Conformità', value: 'GDPR (solo PG)' },
    { label: 'Aggiornamento dati', value: 'Continuo' },
    { label: 'Consultazione', value: 'Gratuita' },
  ];

  const press = [
    {
      quote: 'BandiGareDappalto unifica i dati dei bandi e delle gare d\'appalto pubbliche italiane in un portale nazionale ricercabile.',
      context: 'Riassunto editoriale',
    },
    {
      quote: `Su BandiGareDappalto sono consultabili ${formatNumber(stats.totale)} bandi pubblici da ${formatNumber(stats.enti)} stazioni appaltanti, per un valore di ${formatEuro(stats.importoTotaleBase, { compact: true })} a base di gara.`,
      context: 'Riassunto dati',
    },
    {
      quote: 'BandiGareDappalto è un servizio editoriale di AZIENDA 365 SRL che aggrega i bandi e le gare d\'appalto pubblicati per legge (D.Lgs. 36/2023), trattando esclusivamente dati di persone giuridiche in conformità al GDPR.',
      context: 'Profilo lungo',
    },
  ];

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: `${siteConfig.name} — Programma trasparenza appalti`,
    serviceType: 'Public Procurement Data Aggregation Service',
    provider: { '@type': 'Organization', name: siteConfig.companyName, url: siteConfig.baseUrl },
    areaServed: { '@type': 'Country', name: 'Italia' },
    audience: { '@type': 'GovernmentOrganization', name: 'Stazioni appaltanti, Regioni, Agenzie e Pubbliche Amministrazioni italiane' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(orgLd) }} />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-4xl">
          <BreadcrumbCantiere steps={[{ label: 'Per Pubbliche Amministrazioni' }]} />
          <span className="eyebrow eyebrow-construction mb-4 inline-block">Trasparenza appalti</span>
          <h1 className="heading-display mb-6">
            Più visibilità e concorrenza alle{' '}
            <span className="text-construction italic">vostre gare</span>.
          </h1>
          <p className="body-large text-muted-foreground mb-12">
            BandiGareDappalto rende leggibili i bandi e le gare d&apos;appalto pubblicati per legge. Ogni scheda cita la
            fonte ufficiale, ogni stazione appaltante guadagna visibilità presso imprese, studi, cittadini e giornalisti.
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
          <h2 className="heading-section mb-2">Press kit dati</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Aggiornato {new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}.
            Usate liberamente questi numeri citando la fonte: <em>bandigaredappalto.it (AZIENDA 365 SRL)</em>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 mb-12">
            {pressKit.map((k) => (
              <div key={k.label}>
                <div className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter">{k.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          <h3 className="font-semibold mb-4 text-foreground">Citazioni pronte per articoli e comunicati</h3>
          <div className="space-y-4 mb-12">
            {press.map((p, i) => (
              <blockquote key={i} className="border-l-2 border-construction pl-4 py-2 italic text-foreground">
                &laquo;{p.quote}&raquo;
                <cite className="block not-italic text-xs text-muted-foreground mt-2 normal-case">{p.context}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16 bg-secondary">
        <div className="container-zen max-w-4xl">
          <span className="eyebrow mb-3 inline-block">Dati e API</span>
          <h2 className="heading-section mb-6">Integrazione dati per usi istituzionali e di ricerca.</h2>
          <p className="text-muted-foreground mb-6">
            Per accordi di accesso ai dati (dataset, integrazioni, redistribuzione) ad uso istituzionale, accademico o
            di ricerca, è disponibile un canale dedicato. La documentazione tecnica è in pubblicazione.
          </p>
          <Link href="/api-pubbliche" className="inline-flex items-center gap-2 underline underline-offset-4 hover:no-underline">
            <FileCheck2 className="h-4 w-4" /> Documentazione API
          </Link>
        </div>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <div className="container-zen max-w-3xl text-center">
          <Mail className="h-8 w-8 text-construction mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="heading-section mb-4">Contatto partnership PA</h2>
          <p className="text-muted-foreground mb-6">
            Scrivete a <a href={`mailto:${siteConfig.email}`} className="underline underline-offset-4">{siteConfig.email}</a>{' '}
            indicando ente, ruolo e tipo di collaborazione (integrazione dati, dataset, intervista stampa, dato statistico personalizzato).
          </p>
          <p className="text-sm text-muted-foreground">Rispondiamo entro 5 giorni lavorativi.</p>
        </div>
      </section>
    </>
  );
}
