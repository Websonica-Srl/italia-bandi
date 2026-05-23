import Link from 'next/link';
import { Building2, DraftingCompass, Newspaper, ArrowRight, BellRing, Award, FileSearch, TrendingDown } from 'lucide-react';

const CARDS = [
  {
    number: '01',
    icon: Building2,
    title: 'Imprese & uffici gare',
    pitch:
      'Intercetta i bandi giusti per la tua categoria SOA e il tuo importo. Monitora le gare e scopri chi le sta vincendo nel tuo mercato.',
    bullets: [
      { icon: BellRing, label: 'Alert su nuovi bandi per CPV e importo' },
      { icon: TrendingDown, label: 'Storico ribassi e monitoraggio concorrenti' },
    ],
    href: '/iscriviti?intent=impresa',
    cta: 'Soluzioni per imprese',
  },
  {
    number: '02',
    icon: DraftingCompass,
    title: 'Studi & professionisti',
    pitch:
      'Trova gare di progettazione e direzione lavori (CPV 71). Costruisci il tuo track record e fatti trovare dalle stazioni appaltanti.',
    bullets: [
      { icon: FileSearch, label: 'Gare di architettura e ingegneria' },
      { icon: Award, label: 'Scheda azienda con gare vinte' },
    ],
    href: '/iscriviti?intent=studio',
    cta: 'Soluzioni per studi',
  },
  {
    number: '03',
    icon: Newspaper,
    title: 'Cittadini & giornalisti',
    pitch:
      'Consulta in chiaro come la PA spende i soldi pubblici: oggetto, importo, ente e aggiudicatari di ogni gara. Dati ufficiali, gratis.',
    bullets: [
      { icon: FileSearch, label: 'Consultazione 100% gratuita' },
      { icon: Award, label: 'Chi vince le gare pubbliche' },
    ],
    href: '/bandi',
    cta: 'Esplora i bandi',
  },
];

/**
 * Intent-splitter editorial per i bandi: 3 percorsi line-art.
 * Pattern HUB italiaprogettisti.com, riuso del design system di rete.
 */
export default function IntentSplitBandi() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="intent-cards-heading">
      <div className="container-zen">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="eyebrow eyebrow-dark mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-construction animate-pulse-soft" />
            <span>Tre percorsi · Un solo portale</span>
          </p>
          <h2
            id="intent-cards-heading"
            className="font-black tracking-[-0.04em] leading-[0.92] text-[2.5rem] md:text-[4rem] mb-6 text-balance"
          >
            Per chi è<br className="hidden sm:block" /> BandiGareDappalto?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
            Che tu partecipi alle gare, le progetti o voglia solo capire come la PA
            spende, qui trovi un percorso pensato apposta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-border">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                className={[
                  'group relative flex flex-col p-8 md:p-10 lg:p-12 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] border-b md:border-b-0 border-border',
                  i > 0 ? 'md:border-l border-border' : '',
                  'hover:bg-secondary/40 focus-visible:outline-none focus-visible:bg-secondary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                ].join(' ')}
                aria-label={`${c.cta}: ${c.pitch.substring(0, 80)}`}
              >
                <div className="flex items-start justify-between mb-10 md:mb-12">
                  <span className="ghost-number text-[4.5rem] md:text-[6rem]">{c.number}</span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background transition-all duration-500 group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                </div>

                <h3 className="font-black text-2xl md:text-[1.75rem] tracking-[-0.035em] leading-tight mb-4 text-foreground">
                  {c.title}
                </h3>
                <p className="text-[15px] md:text-base text-secondary-text leading-relaxed mb-8 flex-grow text-pretty">
                  {c.pitch}
                </p>

                <ul className="space-y-3 mb-10">
                  {c.bullets.map((b) => {
                    const BIcon = b.icon;
                    return (
                      <li key={b.label} className="flex items-center gap-3 text-[13px] text-foreground/70">
                        <BIcon className="h-3.5 w-3.5 flex-shrink-0 text-foreground/50" strokeWidth={1.75} />
                        <span>{b.label}</span>
                      </li>
                    );
                  })}
                </ul>

                <span className="inline-flex items-center gap-2.5 text-sm font-bold text-foreground mt-auto">
                  {c.cta}
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/8 transition-all duration-300 group-hover:bg-construction group-hover:text-foreground group-hover:translate-x-1">
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="absolute left-8 md:left-10 lg:left-12 right-8 md:right-10 lg:right-12 bottom-0 h-px bg-foreground origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
