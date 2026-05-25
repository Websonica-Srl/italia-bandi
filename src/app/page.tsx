import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Award, FileSearch } from 'lucide-react';
import SearchBandi from '@/components/bandi/SearchBandi';
import BandoCard from '@/components/bandi/BandoCard';
import IntentSplitBandi from '@/components/bandi/IntentSplitBandi';
import FAQ from '@/components/cantieri/FAQ';
import SectionWrapper from '@/components/cantieri/SectionWrapper';
import {
  getBandi,
  getBandiInScadenza,
  getBandiStats,
  getBandiByCpvGroup,
} from '@/lib/supabase/queries/bandi';
import { formatNumber, formatEuro, bandoTitolo } from '@/lib/utils';
import { cpvGroupLabel, cpvGroupToSlug } from '@/lib/bandi-taxonomy-extra';
import { ogImageUrl, howToLd, safeJsonLd, itemListLd } from '@/lib/seo/structured-data';
import { siteConfig, hubUrl } from '@/lib/site-config';

export const revalidate = 3600; // ISR ogni ora

export const metadata: Metadata = {
  title: 'Bandi e gare d\'appalto pubbliche in Italia, in chiaro — BandiGareDappalto',
  description:
    'Tutti i bandi e le gare d\'appalto pubbliche d\'Italia: oggetto, stazione appaltante, importo a base di gara, scadenze, CIG, CUP, categoria CPV e chi vince le gare. Dati pubblici, consultazione gratuita.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Bandi e gare d\'appalto pubbliche in Italia, in chiaro',
    description:
      'Il portale pubblico dei bandi e delle gare d\'appalto in Italia. Importi, scadenze, CIG/CPV e aggiudicatari. Curato e aggiornato.',
    url: '/',
    type: 'website',
    images: [
      {
        url: ogImageUrl({
          title: 'Bandi e gare d\'appalto pubbliche d\'Italia',
          subtitle: 'Importi, scadenze, CIG/CPV e chi vince le gare',
          kind: 'bando',
          label: 'in chiaro',
        }),
        width: 1200,
        height: 630,
        alt: 'BandiGareDappalto — bandi e gare d\'appalto pubbliche italiane',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bandi e gare d\'appalto pubbliche in Italia, in chiaro',
    description: 'Il portale pubblico dei bandi e delle gare d\'appalto in Italia.',
    images: [ogImageUrl({ title: 'Bandi e gare d\'appalto pubbliche d\'Italia', kind: 'bando' })],
  },
};

const homeHowTo = howToLd(
  'Come funziona BandiGareDappalto',
  'Tre passi per consultare i bandi e le gare d\'appalto pubbliche italiane.',
  [
    {
      name: 'Cerca il bando giusto',
      text: 'Filtra le gare per categoria CPV, procedura, importo a base di gara e scadenza. Trova subito ciò che interessa alla tua impresa o al tuo studio.',
    },
    {
      name: 'Analizza la gara',
      text: 'Per ogni bando vedi oggetto, stazione appaltante, importo, scadenza offerte, CIG/CUP, procedura e — quando disponibile — chi se l\'è aggiudicata.',
    },
    {
      name: 'Sblocca e monitora',
      text: 'Iscriviti gratis su ItaliaProgettisti per documenti di gara, monitoraggio dei concorrenti e alert sui nuovi bandi rilevanti.',
    },
  ],
);

const homepageFaq = [
  {
    q: 'Da dove provengono i dati pubblicati su BandiGareDappalto?',
    a: 'Esclusivamente da fonti ufficiali e pubbliche: i portali istituzionali degli appalti italiani ed europei. I dati delle gare d\'appalto sono pubblici per legge (D.Lgs. 36/2023, Codice dei Contratti Pubblici).',
  },
  {
    q: 'La consultazione dei bandi è gratuita?',
    a: 'Sì. La consultazione di oggetto, stazione appaltante, importo a base di gara, scadenze, CIG/CUP, categoria CPV e aggiudicatari è completamente gratuita. I documenti di gara, lo storico dei ribassi e gli strumenti di monitoraggio sono inclusi nei piani del network ItaliaProgettisti.',
  },
  {
    q: 'Cosa significano CIG, CUP e CPV?',
    a: 'Il CIG (Codice Identificativo Gara) identifica univocamente ogni procedura di affidamento. Il CUP (Codice Unico di Progetto) identifica il progetto di investimento pubblico. Il CPV (Common Procurement Vocabulary) è il codice europeo che classifica l\'oggetto dell\'appalto. Trovi tutte le definizioni nel nostro glossario.',
  },
  {
    q: 'Posso vedere chi ha vinto una gara?',
    a: 'Sì, quando la gara è stata aggiudicata mostriamo la ragione sociale dell\'aggiudicatario (impresa o raggruppamento). Pubblichiamo solo dati di persone giuridiche: nessun dato personale di persone fisiche, in conformità al GDPR.',
  },
  {
    q: 'Posso ricevere alert sui nuovi bandi della mia categoria?',
    a: 'Sì. Iscrivendoti gratuitamente al network ItaliaProgettisti puoi attivare notifiche email sui nuovi bandi filtrati per categoria CPV, importo e stazione appaltante.',
  },
];

export default async function HomePage() {
  const [stats, recentiRes, scadenzeRes, cpvGroups] = await Promise.all([
    getBandiStats(),
    getBandi({ limit: 6, orderBy: 'data_pubblicazione', orderDirection: 'desc' }),
    getBandiInScadenza(6),
    getBandiByCpvGroup(),
  ]);

  const recenti = recentiRes.data;
  const scadenze = scadenzeRes.data;
  const topCpv = cpvGroups.slice(0, 6);

  const itemList = itemListLd(
    recenti.map((b) => ({
      name: bandoTitolo(b, cpvGroupLabel(b.cpv_principale)),
      url: `${siteConfig.baseUrl}/bandi/${b.slug}`,
    })),
    'Ultimi bandi pubblicati',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(homeHowTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      {/* Featured-snippet answer box, indicizzato */}
      <p className="sr-only">
        BandiGareDappalto è il portale pubblico dei bandi e delle gare d&apos;appalto in Italia: raccoglie {formatNumber(stats.totale)} bandi
        pubblici da {formatNumber(stats.enti)} stazioni appaltanti, per un valore complessivo di {formatEuro(stats.importoTotaleBase, { compact: true })} a base
        di gara. Per ogni gara mostriamo oggetto, ente, importo, scadenza, CIG, CUP, categoria CPV e aggiudicatario. Dati provenienti da fonti
        ufficiali e pubbliche, consultabili gratuitamente e trattati nel rispetto del GDPR.
      </p>

      {/* HERO minimal HUB-aligned */}
      <section className="relative bg-background pt-32 pb-20 md:pt-44 md:pb-32" aria-labelledby="hero-heading">
        <div className="container-zen">
          <div className="max-w-5xl mx-auto text-center">
            <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Gare d&apos;appalto pubbliche · Fonti ufficiali e pubbliche · Solo persone giuridiche</span>
            </p>

            <h1
              id="hero-heading"
              className="font-black tracking-[-0.055em] leading-[0.88] text-foreground text-balance"
              style={{ fontSize: 'clamp(2.5rem, 7.5vw + 0.5rem, 7rem)' }}
            >
              Gli altri ti dicono quali bandi escono.<br />
              Noi chi li{' '}
              <em className="italic font-black text-construction">vince</em>.
            </h1>

            <p className="mt-10 md:mt-14 text-lg md:text-2xl font-light leading-relaxed text-secondary-text max-w-3xl mx-auto text-pretty">
              Chi si aggiudica le gare, con quale raggruppamento e a che ribasso. L&apos;intelligence
              su 50.882 bandi e 11.901 imprese vincitrici. La consultazione è gratuita.
            </p>

            <div className="mt-12 md:mt-16 max-w-2xl mx-auto">
              <SearchBandi placeholder="Cerca per oggetto, ente o CIG…" />
              <p className="mt-5 text-sm text-muted-foreground">
                Sfoglia per categoria:{' '}
                <Link href="/categoria/lavori-di-costruzione" className="text-foreground underline-offset-4 hover:underline transition-colors">Lavori di costruzione</Link>
                {' · '}
                <Link href="/categoria/servizi-di-architettura-e-ingegneria" className="text-foreground underline-offset-4 hover:underline transition-colors">Architettura e ingegneria</Link>
                {' · '}
                <Link href="/scadenze" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors">in scadenza</Link>
              </p>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/bandi"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Esplora tutti i bandi
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/chi-siamo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Come funziona
              </Link>
            </div>

            {/* KPI inline editoriali */}
            <div className="mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 md:gap-x-12 max-w-5xl mx-auto pt-12 border-t border-border">
              {[
                { value: formatNumber(stats.totale), label: 'Bandi pubblici' },
                { value: formatNumber(stats.scadFuture), label: 'Con termine aperto' },
                { value: formatEuro(stats.importoTotaleBase, { compact: true }), label: 'Valore a base di gara' },
                { value: formatNumber(stats.enti), label: 'Stazioni appaltanti' },
              ].map((k) => (
                <div key={k.label} className="text-center">
                  <div
                    className="font-black tracking-[-0.05em] leading-none tabular-nums text-foreground"
                    style={{ fontSize: 'clamp(1.5rem, 2.8vw + 0.5rem, 3.25rem)' }}
                  >
                    {k.value}
                  </div>
                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {k.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <IntentSplitBandi />

      {/* CATEGORIE CPV — la dimensione di navigazione forte (geo non sempre disponibile sui dati grezzi) */}
      <SectionWrapper
        spacing="default"
        tone="muted"
        eyebrow="Sfoglia per categoria"
        title="Bandi per categoria di appalto (CPV)"
        subtitle="Le divisioni del Vocabolario Comune per gli Appalti (CPV) raggruppano le gare per oggetto. Esplora le categorie con più bandi pubblicati."
        action={
          <Link
            href="/bandi"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white pl-5 pr-2 py-1.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Tutti i bandi
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {topCpv.map((c) => (
            <Link
              key={c.group}
              href={`/categoria/${cpvGroupToSlug(c.group)}`}
              className="group relative bg-white border border-border rounded-3xl p-7 md:p-8 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_18px_40px_-18px_rgba(17,17,17,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Bandi della categoria ${cpvGroupLabel(c.group)}`}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-foreground" strokeWidth={2} />
              </div>
              <div className="font-black tracking-[-0.05em] leading-none tabular-nums text-foreground mb-3" style={{ fontSize: 'clamp(2.25rem, 3vw + 1rem, 3.5rem)' }}>
                {formatNumber(c.cnt)}
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">bandi · CPV {c.group}</div>
              <div className="font-bold text-lg md:text-xl tracking-[-0.02em] text-foreground">{cpvGroupLabel(c.group)}</div>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/* IN SCADENZA */}
      {scadenze.length > 0 && (
        <SectionWrapper
          spacing="default"
          eyebrow="Non perdere il termine"
          title="Bandi in scadenza"
          subtitle="Le gare con termine di presentazione delle offerte ancora aperto, ordinate per scadenza più vicina."
          action={
            <Link
              href="/scadenze"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white pl-5 pr-2 py-1.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Tutte le scadenze
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {scadenze.map((b) => (
              <BandoCard key={b.id} bando={b} />
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* VALORE: curatela + chi vince */}
      <SectionWrapper
        spacing="default"
        align="center"
        tone="muted"
        eyebrow="Quello che il bando nudo non dice"
        title="Sul bando leggi le regole. Da noi leggi la partita."
        subtitle="Le fonti ufficiali e pubbliche dicono cosa esiste. Noi aggiungiamo le tre cose che decidono se vale la pena correre."
        headerMaxW="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-border">
          {[
            { icon: Award, title: 'Chi vince da quell\'ente', body: 'Quando una gara è aggiudicata, mostriamo la ragione sociale del vincitore, singolo o in raggruppamento. È il track record che il bando da solo non racconta.' },
            { icon: FileSearch, title: 'Quanto è affollata', body: 'Su una stessa gara sono arrivate fino a 575 offerte. Sapere dove c\'è la ressa ti dice su cosa non sprecare giorni di lavoro.' },
            { icon: ShieldCheck, title: 'Con chi si vince (RTI)', body: 'Metà delle gare si aggiudica in raggruppamento: 25.495 su tutto il mercato. Vedere chi si allea con chi vale quanto vedere chi compete da solo.' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className={['p-8 md:p-10', i > 0 ? 'md:border-l border-t md:border-t-0 border-border' : ''].join(' ')}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background mb-6">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="font-black mb-3 text-xl tracking-[-0.025em]">{s.title}</h3>
                <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">{s.body}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* RECENTI */}
      {recenti.length > 0 && (
        <SectionWrapper
          spacing="default"
          eyebrow="Aggiornamenti recenti"
          title="Ultimi bandi pubblicati"
          subtitle={`${recenti.length} gare pubblicate di recente dalle stazioni appaltanti italiane.`}
          action={
            <Link
              href="/bandi"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white pl-5 pr-2 py-1.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Vedi tutti i bandi
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </Link>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {recenti.map((b) => (
              <BandoCard key={b.id} bando={b} />
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-zen max-w-4xl">
          <FAQ
            title="Domande frequenti su bandi e gare d'appalto"
            subtitle="Fonti, costi, definizioni e accesso ai dati."
            items={homepageFaq}
          />
        </div>
      </section>

      {/* CTA FINALE → HUB */}
      <section className="py-24 md:py-32 bg-secondary/30 border-t border-border">
        <div className="container-zen">
          <div className="max-w-4xl mx-auto text-center">
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
              <span>Network ItaliaProgettisti</span>
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
            </p>
            <h2 className="font-black tracking-[-0.04em] leading-[0.95] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2rem, 4vw + 0.5rem, 4.5rem)' }}>
              Tu vedi il tuo bando.<br className="hidden md:block" /> Noi vediamo tutto il mercato.
            </h2>
            <p className="text-base md:text-lg text-secondary-text leading-relaxed max-w-2xl mx-auto mb-12">
              Crea un account gratuito sulla rete: alert sulle gare della tua categoria, affinità
              bando-azienda e dossier sui concorrenti. Gratis per iniziare.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={hubUrl('/register', 'home_cta_final', { intent: 'impresa' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Registra la tua impresa
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href={hubUrl('/register', 'home_cta_final', { intent: 'studio' })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Registra il tuo studio
              </a>
            </div>
            <p className="mt-10 text-xs text-muted-foreground max-w-xl mx-auto">
              Dati provenienti da fonti ufficiali e pubbliche, trattati nel rispetto del GDPR. Solo persone giuridiche, nessun dato personale di persone fisiche.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
