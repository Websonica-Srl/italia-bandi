import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react';
import SearchComune from '@/components/cantieri/SearchComune';
import CantiereCard from '@/components/cantieri/CantiereCard';
import FAQ from '@/components/cantieri/FAQ';
import IntentSplitCards from '@/components/cantieri/IntentSplitCards';
import SectionWrapper from '@/components/cantieri/SectionWrapper';
import {
  getCantieri,
  getCantieriByRegione,
  getGlobalStats,
  getKpiStats,
} from '@/lib/supabase/queries/cantieri';
import { regioneSlug, formatNumber } from '@/lib/utils';
import { ogImageUrl, howToLd, safeJsonLd } from '@/lib/seo/structured-data';

export const revalidate = 3600; // ISR ogni ora

export const metadata: Metadata = {
  title: 'Italia Cantieri — Sai prima dove si lavora in Italia | Cantieri edilizi e bandi pubblici',
  description:
    'Database cantieri italiano in espansione: oltre 6.500 cantieri tracciati, 38.000 soggetti analizzati e 37.000 imprese e studi nel network. Permessi di costruire, SCIA, CILA e bandi pubblici aggregati settimanalmente da fonti pubbliche.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Italia Cantieri — Sai prima dove si lavora in Italia',
    description:
      'Database pubblico di cantieri edilizi, permessi di costruire (PDC, SCIA, CILA) e bandi di gara italiani. Aggiornato ogni giorno da albi pretori e open data PA.',
    url: '/',
    type: 'website',
    images: [
      {
        url: ogImageUrl({
          title: 'Sai prima dove si lavora in Italia',
          subtitle: 'Database pubblico di cantieri edilizi, PDC, SCIA, CILA e bandi di gara',
          kind: 'generic',
          count: '8.880',
          label: 'cantieri tracciati',
        }),
        width: 1200,
        height: 630,
        alt: 'Italia Cantieri — database pubblico cantieri edilizi italiani',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Italia Cantieri — Sai prima dove si lavora in Italia',
    description:
      'Database pubblico di cantieri edilizi italiani: PDC, SCIA, CILA e bandi pubblici aggiornati ogni giorno.',
    images: [
      ogImageUrl({
        title: 'Sai prima dove si lavora in Italia',
        subtitle: 'Database pubblico di cantieri edilizi e bandi di gara',
        kind: 'generic',
        count: '8.880',
        label: 'cantieri tracciati',
      }),
    ],
  },
};

// HowTo schema (HIGH-3 featured snippet) per "Come funziona Italia Cantieri"
const homeHowTo = howToLd(
  'Come funziona Italia Cantieri',
  'Tre passi per consultare cantieri pubblici italiani e attivare il contatto con i progettisti.',
  [
    {
      name: 'Cerca il tuo territorio',
      text: 'Filtra cantieri e bandi per Comune, provincia o regione. Esplora i lavori in corso nella tua zona di interesse.',
    },
    {
      name: 'Analizza il cantiere',
      text: 'Visualizza tipologia di titolo (PDC, SCIA, CILA), importo lavori, superficie, categoria e geolocalizzazione su mappa.',
    },
    {
      name: 'Sblocca i contatti',
      text: 'Iscriviti gratis su ItaliaProgettisti per accedere ai profili di progettisti, studi e imprese collegati al cantiere.',
    },
  ],
);

const homepageFaq = [
  {
    q: 'Da dove provengono i dati pubblicati su Italia Cantieri?',
    a: 'Esclusivamente da fonti pubbliche italiane: albi pretori dei Comuni, open data della Pubblica Amministrazione (es. Comune di Bologna), portali appalti regionali e ANAC. Non utilizziamo dati privati ne fonti non autorizzate.',
  },
  {
    q: 'Quanto spesso vengono aggiornati i cantieri?',
    a: 'I dati vengono aggiornati settimanalmente dalle fonti pubbliche (albi pretori comunali, portali Maggioli, open data PA). In media importiamo circa +200 nuovi cantieri al mese da Comuni gia coperti e siamo in continua espansione su nuovi territori.',
  },
  {
    q: 'Come posso ottenere i contatti del progettista di un cantiere?',
    a: 'I contatti diretti di progettisti, studi e imprese sono disponibili agli iscritti del network ItaliaProgettisti. La registrazione base e gratuita: ti permette di consultare i profili professionali collegati ai cantieri di tuo interesse.',
  },
  {
    q: 'Italia Cantieri e a pagamento?',
    a: 'La consultazione del database pubblico cantieri e dei bandi e completamente gratuita. Le funzioni avanzate (alert via email, esportazioni CSV, accesso dati committenti, dashboard intelligence) sono incluse nei piani Premium del network ItaliaProgettisti.',
  },
  {
    q: 'Sono il titolare di un cantiere pubblicato. Posso chiedere la rimozione?',
    a: 'Si. In qualsiasi momento puoi richiedere opt-out o rettifica scrivendo al nostro DPO. La valutiamo individualmente entro 30 giorni come previsto dal GDPR (Art. 15-22). Trovi il modulo direttamente nella pagina di ogni cantiere.',
  },
  {
    q: 'Italia Cantieri copre tutta Italia?',
    a: 'Stiamo costruendo la copertura nazionale Comune per Comune. Oggi siamo presenti in piu regioni, con copertura completa di alcune citta chiave (Bologna, Torino) e in espansione settimanale su Piemonte, Lombardia ed Emilia-Romagna.',
  },
];

export default async function HomePage() {
  const [stats, kpi, recenti, regioni] = await Promise.all([
    getGlobalStats(),
    getKpiStats(),
    getCantieri({ limit: 6, orderBy: 'data_pubblicazione', orderDirection: 'desc' }),
    getCantieriByRegione(),
  ]);

  // Solo regioni con cantieri reali: filtro placeholder "Italia" + count > 0.
  // Niente card "in arrivo": mostriamo solo quello che esiste davvero.
  const regioniReali = regioni.filter(
    (r) => r.regione && r.regione.toLowerCase() !== 'italia' && r.cnt > 0,
  );

  return (
    <>
      {/* HowTo schema per featured snippet "Come funziona Italia Cantieri" */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(homeHowTo) }}
      />
      {/*
        FEATURED SNIPPET ANSWER BOX (HIGH-3): risposta DIRETTA in posizione SR-only ma indicizzata.
        AI Overview / Google snippet preferiscono frase fattuale all'inizio del DOM.
      */}
      <p className="sr-only">
        Italia Cantieri è il database pubblico dei cantieri edilizi italiani: raccoglie {formatNumber(stats.totale)} cantieri da {stats.comuni} Comuni e {stats.regioni} regioni, aggiornati ogni giorno da albi pretori e open data della Pubblica Amministrazione. Permessi di costruire (PDC), SCIA, CILA e bandi di gara consultabili gratuitamente, con fonte dichiarata su ogni scheda e base legale GDPR esplicita (Art. 6.1.f).
      </p>
      {/*
        HERO MINIMAL HUB-ALIGNED — sfondo cream, NO immagine background,
        tipografia GIGANTE centrata su chiaro, KPI inline, due CTA pill.
        Coerente con italiaprogettisti.com.
      */}
      <section
        className="relative bg-background pt-32 pb-20 md:pt-44 md:pb-32"
        aria-labelledby="hero-heading"
      >
        <div className="container-zen">
          <div className="max-w-5xl mx-auto text-center">
            {/* Eyebrow editorial discreto */}
            <p className="mb-10 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Database cantieri Italia · Fonti pubbliche · GDPR</span>
            </p>

            {/* Display headline GIGANTE su cream */}
            <h1
              id="hero-heading"
              className="font-black tracking-[-0.055em] leading-[0.88] text-foreground text-balance"
              style={{ fontSize: 'clamp(2.75rem, 8vw + 0.5rem, 7.5rem)' }}
            >
              Sai{' '}
              <em className="italic font-black text-construction">prima</em>
              <br />
              dove si lavora<br className="md:hidden" /> in Italia.
            </h1>

            {/* Sub-headline misurato */}
            <p
              className="mt-10 md:mt-14 text-lg md:text-2xl font-light leading-relaxed text-secondary-text max-w-3xl mx-auto text-pretty"
            >
              Permessi di costruire, SCIA e bandi pubblici aggregati settimanalmente
              da albi pretori e open data della PA. Intercetta le opere prima dei competitor.
            </p>

            {/* Search pill su sfondo chiaro */}
            <div className="mt-12 md:mt-16 max-w-2xl mx-auto">
              <SearchComune placeholder="Cerca il tuo Comune (es. Alessandria, Bologna, Moncalieri)..." />
              <p className="mt-5 text-sm text-muted-foreground">
                Citta popolari:{' '}
                <Link href="/comune/alessandria" className="text-foreground underline-offset-4 hover:underline transition-colors">Alessandria</Link>
                {' · '}
                <Link href="/comune/moncalieri" className="text-foreground underline-offset-4 hover:underline transition-colors">Moncalieri</Link>
                {' · '}
                <Link href="/comune/bologna" className="text-foreground underline-offset-4 hover:underline transition-colors">Bologna</Link>
                {' · '}
                <Link href="/regioni" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors">tutte le regioni</Link>
              </p>
            </div>

            {/* CTA pair */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/regioni"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Esplora le regioni
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                href="/chi-siamo"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Come funziona
              </Link>
            </div>

            {/* KPI inline editoriali — linee divider sottili */}
            <div className="mt-20 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 md:gap-x-12 max-w-5xl mx-auto pt-12 border-t border-border">
              {[
                { value: formatNumber(stats.totale), label: 'Cantieri tracciati' },
                { value: formatNumber(kpi.soggetti), label: 'Soggetti analizzati' },
                { value: stats.regioni.toString(), label: 'Regioni coperte' },
                { value: 'GDPR', label: 'Trasparenza piena' },
              ].map((k) => (
                <div key={k.label} className="text-center">
                  <div
                    className="font-black tracking-[-0.05em] leading-none tabular-nums text-foreground"
                    style={{ fontSize: 'clamp(2rem, 3.5vw + 0.5rem, 3.75rem)' }}
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

      {/* INTENT-SPLIT CARDS — line-art editorial, no foto stock */}
      <IntentSplitCards />

      {/*
        REGIONI - SOLO regioni con count > 0.
        Layout editoriale lineare: 1 colonna mobile, 3 colonne desktop.
        Card pulite con numero grande + nome regione. No foto, no placeholder.
      */}
      <SectionWrapper
        spacing="default"
        tone="muted"
        eyebrow="Esplora il territorio"
        title="Cantieri edilizi per regione"
        subtitle={`Oggi tracciamo cantieri in ${regioniReali.length} regioni. La copertura cresce ogni settimana con nuovi Comuni.`}
        action={
          <Link
            href="/regioni"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white pl-5 pr-2 py-1.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Vedi tutte le regioni
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {regioniReali.map((r) => (
            <Link
              key={r.regione}
              href={`/${regioneSlug(r.regione)}`}
              className="group relative bg-white border border-border rounded-3xl p-7 md:p-8 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_18px_40px_-18px_rgba(17,17,17,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Vedi tutti i cantieri in ${r.regione}`}
            >
              <div className="flex items-start justify-between gap-3 mb-6">
                <MapPin
                  className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                  strokeWidth={1.5}
                />
                <ArrowRight
                  className="h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-foreground"
                  strokeWidth={2}
                />
              </div>
              <div
                className="font-black tracking-[-0.05em] leading-none tabular-nums text-foreground mb-3"
                style={{ fontSize: 'clamp(2.5rem, 3vw + 1rem, 3.75rem)' }}
              >
                {formatNumber(r.cnt)}
              </div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
                cantieri tracciati
              </div>
              <div className="font-bold text-lg md:text-xl tracking-[-0.02em] text-foreground">
                {r.regione}
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>

      {/*
        COME FUNZIONA — editorial pattern: numerazione 01/02/03 grande ghost +
        linea verticale divider tra step (visual rhythm). Skill: impeccable.
      */}
      <SectionWrapper
        spacing="default"
        align="center"
        eyebrow="Come funziona"
        title="Tre passi per trasformare i dati pubblici in opportunita"
        subtitle="Dalla ricerca territoriale all'attivazione del contatto diretto. Tutto in un flusso lineare."
        headerMaxW="lg"
      >
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0">
          {[
            {
              step: '01',
              title: 'Cerca il tuo territorio',
              body:
                'Filtra cantieri e bandi per Comune, provincia o regione. Esplora i lavori in corso esattamente dove operi.',
            },
            {
              step: '02',
              title: 'Analizza il cantiere',
              body:
                'Visualizza tipologia di titolo (PDC, SCIA, CILA), importo lavori, superficie, categoria e geolocalizzazione su mappa.',
            },
            {
              step: '03',
              title: 'Sblocca i contatti',
              body:
                'Iscriviti gratis su ItaliaProgettisti per accedere ai profili di progettisti, studi e imprese collegati al cantiere.',
            },
          ].map((s, i) => (
            <div
              key={s.step}
              className={[
                'group relative p-8 md:p-12 transition-colors duration-500',
                i > 0 ? 'md:border-l border-t md:border-t-0 border-border' : '',
              ].join(' ')}
            >
              <div className="flex items-baseline gap-5 mb-8">
                <span className="ghost-number text-[5rem] md:text-[6.5rem]">{s.step}</span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-border group-hover:bg-foreground/30 transition-colors duration-500"
                />
              </div>
              <h3 className="font-black mb-4 text-xl md:text-2xl tracking-[-0.025em]">{s.title}</h3>
              <p className="text-[15px] text-secondary-text leading-relaxed text-pretty max-w-sm">{s.body}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* RECENTI - tabella editoriale pulita, sfondo muted */}
      <SectionWrapper
        spacing="default"
        tone="muted"
        eyebrow="Aggiornamenti recenti"
        title="Ultimi cantieri pubblicati"
        subtitle={`${recenti.data.length} permessi e SCIA arrivati di recente dai Comuni italiani.`}
        action={
          <Link
            href="/statistiche"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white pl-5 pr-2 py-1.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Vedi tutte le statistiche
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5 transition-all duration-300 group-hover:bg-foreground group-hover:text-background group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {recenti.data.map((c) => (
            <CantiereCard key={c.id} cantiere={c} />
          ))}
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="container-zen max-w-4xl">
          <FAQ
            title="Domande frequenti su Italia Cantieri"
            subtitle="Tutto quello che ti serve sapere su dati, fonti, costi e accesso ai contatti."
            items={homepageFaq}
          />
        </div>
      </section>

      {/*
        CTA FINALE MINIMAL — pattern HUB italiaprogettisti.com:
        sfondo cream pulito, headline grande + 2 CTA pill (impresa / studio).
        Nessun background dark full-bleed, nessuna foto.
      */}
      <section className="py-24 md:py-32 bg-secondary/30 border-t border-border">
        <div className="container-zen">
          <div className="max-w-4xl mx-auto text-center">
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
              <span>Network ItaliaProgettisti</span>
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
            </p>
            <h2
              className="font-black tracking-[-0.04em] leading-[0.95] text-foreground text-balance mb-8"
              style={{ fontSize: 'clamp(2rem, 4vw + 0.5rem, 4.5rem)' }}
            >
              Trasforma i cantieri pubblici<br className="hidden md:block" /> in clienti reali.
            </h2>
            <p className="text-base md:text-lg text-secondary-text leading-relaxed max-w-2xl mx-auto mb-12">
              Iscriviti gratis al network. Niente carta di credito, niente impegno.
              Sblocca i contatti dei progettisti e ricevi alert sui nuovi cantieri della tua zona.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="https://www.italiaprogettisti.com/register?utm_source=italiacantieri&utm_medium=home_cta_final&intent=impresa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Registra la tua impresa
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </a>
              <a
                href="https://www.italiaprogettisti.com/register?utm_source=italiacantieri&utm_medium=home_cta_final&intent=studio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Registra il tuo studio
              </a>
            </div>
            <p className="mt-10 text-xs text-muted-foreground max-w-xl mx-auto">
              Dati provenienti da fonti pubbliche italiane, trattati nel rispetto del GDPR (Art. 6.1.f legittimo interesse).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
