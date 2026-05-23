import Link from 'next/link';
import { HardHat, DraftingCompass, Eye, ArrowRight, BellRing, MapPinned, FileSearch } from 'lucide-react';

const CARDS = [
  {
    number: '01',
    icon: HardHat,
    title: 'Imprese edili',
    pitch:
      'Intercetta subappalti e nuovi cantieri vicino a casa. Ricevi alert quando viene aperto un permesso a meno di 20 km.',
    bullets: [
      { icon: BellRing, label: 'Alert email su nuove SCIA / PDC' },
      { icon: MapPinned, label: 'Mappa lavori entro 20 km' },
    ],
    href: '/iscriviti?intent=impresa',
    cta: 'Soluzioni per imprese',
  },
  {
    number: '02',
    icon: DraftingCompass,
    title: 'Studi & professionisti',
    pitch:
      'Trova committenti nel momento piu caldo: quando il permesso e appena stato rilasciato e il cantiere sta per partire.',
    bullets: [
      { icon: FileSearch, label: '6.500+ cantieri tracciati' },
      { icon: BellRing, label: 'Profilo studio + portfolio digitale' },
    ],
    href: '/iscriviti?intent=studio',
    cta: 'Soluzioni per studi',
  },
  {
    number: '03',
    icon: Eye,
    title: 'Cittadini & curiosi',
    pitch:
      'Scopri cosa si costruisce nel tuo quartiere. Cantieri, importi, categorie e geolocalizzazione consultabili gratis.',
    bullets: [
      { icon: MapPinned, label: 'Consultazione 100% gratuita' },
      { icon: FileSearch, label: 'Dati ufficiali della PA' },
    ],
    href: '/regioni',
    cta: 'Esplora i cantieri',
  },
];

/**
 * Intent-splitter editorial: 3 percorsi linea-arte, no foto stock confused.
 * Pattern HUB italiaprogettisti.com card design.
 * Skill: high-end-visual-design (Editorial Luxury archetype),
 *        impeccable (visual hierarchy + spacing rhythm),
 *        redesign-existing-projects (rimuove "generic AI stock photos" pattern).
 */
export default function IntentSplitCards() {
  return (
    <section className="py-24 md:py-36" aria-labelledby="intent-cards-heading">
      <div className="container-zen">
        <div className="max-w-3xl mb-16 md:mb-20">
          <p className="eyebrow eyebrow-dark mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-construction animate-pulse-soft" />
            <span>Tre percorsi · Un solo database</span>
          </p>
          <h2
            id="intent-cards-heading"
            className="font-black tracking-[-0.04em] leading-[0.92] text-[2.5rem] md:text-[4rem] mb-6 text-balance"
          >
            Per chi e<br className="hidden sm:block" /> Italia Cantieri?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
            Scegli il tuo punto di partenza. Chiunque lavora nell&apos;edilizia trova
            qui un percorso pensato apposta.
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
                {/* Top row: ghost number + icona discreta */}
                <div className="flex items-start justify-between mb-10 md:mb-12">
                  <span className="ghost-number text-[4.5rem] md:text-[6rem]">
                    {c.number}
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background transition-all duration-500 group-hover:border-foreground/30 group-hover:bg-foreground group-hover:text-background"
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                </div>

                {/* Title + pitch */}
                <h3 className="font-black text-2xl md:text-[1.75rem] tracking-[-0.035em] leading-tight mb-4 text-foreground">
                  {c.title}
                </h3>
                <p className="text-[15px] md:text-base text-secondary-text leading-relaxed mb-8 flex-grow text-pretty">
                  {c.pitch}
                </p>

                {/* Bullets line-art */}
                <ul className="space-y-3 mb-10">
                  {c.bullets.map((b) => {
                    const BIcon = b.icon;
                    return (
                      <li
                        key={b.label}
                        className="flex items-center gap-3 text-[13px] text-foreground/70"
                      >
                        <BIcon
                          className="h-3.5 w-3.5 flex-shrink-0 text-foreground/50"
                          strokeWidth={1.75}
                        />
                        <span>{b.label}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA inline editorial */}
                <span className="inline-flex items-center gap-2.5 text-sm font-bold text-foreground mt-auto">
                  {c.cta}
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/8 transition-all duration-300 group-hover:bg-construction group-hover:text-foreground group-hover:translate-x-1">
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </span>

                {/* Line accent bottom — pasta editorial */}
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
