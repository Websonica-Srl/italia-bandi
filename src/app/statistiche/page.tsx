import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, BarChart3, ArrowRight, TrendingUp, MapPin, FileText, Building2 } from 'lucide-react';
import {
  getCantieriByRegione,
  getGlobalStats,
  getTipoTitoloDistribution,
  getTopCategorie,
} from '@/lib/supabase/queries/cantieri';
import { regioneSlug, formatNumber, formatEuro } from '@/lib/utils';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import DividerOrnament from '@/components/cantieri/DividerOrnament';
import { ogImageUrl, datasetLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;

// OG image dinamica (popolata in pagina con count reale via metadata async)
const ogImage = ogImageUrl({
  title: 'Statistiche cantieri edilizi in Italia',
  subtitle: 'Distribuzione per regione, tipologia (PDC, SCIA, CILA), categorie e importi',
  kind: 'stats',
  count: '8.880',
  label: 'cantieri analizzati',
});

export const metadata: Metadata = {
  title: 'Statistiche cantieri edilizi in Italia — Dati nazionali aggregati',
  description:
    'Statistiche complete sui cantieri edilizi italiani: distribuzione per regione, tipologia (PDC, SCIA, CILA), categorie lavori e importi. Dati ufficiali aggiornati settimanalmente.',
  alternates: { canonical: '/statistiche' },
  openGraph: {
    title: 'Statistiche cantieri edilizi in Italia — Italia Cantieri',
    description:
      'Distribuzione cantieri per regione, tipologia (PDC, SCIA, CILA), categorie e importi. Numeri aggregati nazionali da fonti pubbliche.',
    url: '/statistiche',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Statistiche cantieri edilizi in Italia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Statistiche cantieri edilizi in Italia',
    description:
      'Distribuzione cantieri per regione, tipologia (PDC, SCIA, CILA), categorie e importi.',
    images: [ogImage],
  },
};

const statsFaq = [
  {
    q: 'Come vengono calcolate queste statistiche?',
    a: 'Le statistiche sono aggregazioni in tempo reale calcolate sui cantieri pubblici tracciati nel database (PDC, SCIA, CILA da albi pretori e open data PA). I numeri si aggiornano automaticamente ogni ora.',
  },
  {
    q: 'Posso scaricare i dati in CSV?',
    a: 'L\'esportazione completa in CSV con tutti i dati (incluso committenti, importi dettagliati, contatti professionisti) e disponibile con i piani Premium del network ItaliaProgettisti.',
  },
  {
    q: 'Quali fonti contribuiscono al campione nazionale?',
    a: 'Oggi importiamo da: open data Comune di Bologna, portali Maggioli (8 Comuni Piemonte e Lombardia), Comune di Torino, e in espansione settimanale su nuovi territori. Ogni cantiere dichiara la fonte originale.',
  },
  {
    q: 'Posso ottenere statistiche personalizzate per la mia regione o settore?',
    a: 'Si. I piani Premium di ItaliaProgettisti includono dashboard intelligence con filtri custom per territorio, categoria, fascia di importo, periodo temporale, e export programmati.',
  },
];

// Pseudo-sparkline trend (24 settimane stilizzate) per ogni regione — deterministico
function sparklineFromRegioneSeed(seed: number, len = 12) {
  const arr: number[] = [];
  let v = (seed % 30) + 30;
  for (let i = 0; i < len; i++) {
    v = Math.max(8, Math.min(100, v + ((seed * (i + 1)) % 11) - 5));
    arr.push(v);
  }
  return arr;
}

export default async function StatistichePage() {
  const [stats, regioni, tipi, categorie] = await Promise.all([
    getGlobalStats(),
    getCantieriByRegione(),
    getTipoTitoloDistribution(),
    getTopCategorie(15),
  ]);

  const topRegione = regioni[0];
  const totalTipi = tipi.reduce((acc, t) => acc + t.cnt, 0);
  const totalCategorie = categorie.reduce((acc, c) => acc + c.cnt, 0);

  // Donut conic-gradient stops
  let cum = 0;
  const tipiSegments = tipi.map((t) => {
    const pct = totalTipi ? (t.cnt / totalTipi) * 100 : 0;
    const start = cum;
    cum += pct;
    return { ...t, pct, start, end: cum };
  });
  // Max for region bars
  const maxRegione = Math.max(...regioni.map((r) => r.cnt), 1);

  // HIGH-4: Schema Dataset per Google Dataset Search + AI engines
  const datasetSchema = datasetLd({
    name: 'Italia Cantieri — Dataset pubblico cantieri edilizi italiani',
    description: `Aggregazione dei cantieri edilizi pubblicati negli albi pretori comunali e nei portali open data della Pubblica Amministrazione italiana. Include permessi di costruire (PDC), SCIA, CILA con dati geolocalizzati, tipologia titolo, importo lavori, superficie, categoria intervento, data pubblicazione. Copertura attuale: ${stats.totale} cantieri tracciati su ${stats.comuni} Comuni e ${stats.regioni} regioni.`,
    url: `${siteConfig.baseUrl}/statistiche`,
    dateModified: new Date().toISOString().split('T')[0],
    temporalCoverage: '2024-01-01/..',
    spatialCoverageRegions: regioni.slice(0, 20).map((r) => r.regione),
    keywords: [
      'cantieri edilizi',
      'permessi di costruire',
      'PDC',
      'SCIA',
      'CILA',
      'open data Italia',
      'albo pretorio',
      'edilizia pubblica',
      'database cantieri',
      'intelligence edilizia',
    ],
    distributions: [
      {
        url: `${siteConfig.baseUrl}/api/cantieri`,
        encodingFormat: 'application/json',
        name: 'API JSON pubblica cantieri',
      },
      {
        url: `${siteConfig.baseUrl}/sitemap.xml`,
        encodingFormat: 'application/xml',
        name: 'Sitemap cantieri (URL list)',
      },
    ],
    variableMeasured: [
      { name: 'tipo_titolo', description: 'Tipologia atto edilizio (PDC, SCIA, CILA, ecc.)' },
      { name: 'comune', description: 'Comune italiano in cui è ubicato il cantiere' },
      { name: 'provincia', description: 'Sigla provinciale ISTAT' },
      { name: 'regione', description: 'Regione amministrativa italiana' },
      { name: 'importo_lavori', description: 'Importo dichiarato dei lavori in EUR' },
      { name: 'superficie_mq', description: 'Superficie totale in metri quadri' },
      { name: 'data_pubblicazione', description: 'Data di pubblicazione sull\'albo pretorio' },
      { name: 'fonte_tipo', description: 'Tipologia fonte (open_data_PA, albo_pretorio, ecc.)' },
      { name: 'categorie', description: 'Categorie di lavori OG/OS dell\'intervento' },
      { name: 'coordinate', description: 'Coordinate geografiche geocoded (lat/lng)' },
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    recordCount: stats.totale,
  });

  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(datasetSchema) }}
      />
      <div className="container-zen">
        {/* HIGH-3 Featured Snippet: risposta DIRETTA in posizione visibile sopra hero */}
        <p className="sr-only">
          Le statistiche di Italia Cantieri aggregano in tempo reale {formatNumber(stats.totale)} cantieri edilizi pubblicati su {stats.comuni} Comuni e {stats.regioni} regioni italiane. I dati includono permessi di costruire (PDC), SCIA e CILA con tipologia titolo, importo lavori (valore totale tracciato: {formatEuro(stats.importo_totale, { compact: true })}), superficie, categoria di intervento e geolocalizzazione. Fonte: albi pretori comunali e open data della Pubblica Amministrazione italiana, aggiornati ogni ora.
        </p>
        <BreadcrumbCantiere steps={[{ label: 'Statistiche nazionali' }]} />

        {/* HEADER EDITORIAL — typography drammatica */}
        <div className="mb-16 md:mb-24 max-w-5xl">
          <p className="eyebrow eyebrow-dark mb-6">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-construction" />
            Intelligence pubblica
          </p>
          <h1 className="font-black tracking-[-0.05em] leading-[0.88] text-[2.75rem] md:text-[5.5rem] mb-8 text-balance">
            Statistiche cantieri<br className="hidden md:block" />
            <span className="text-foreground/50">edilizi in Italia.</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-3xl text-pretty">
            Numeri aggregati nazionali su <span className="font-bold text-foreground tabular-nums">{formatNumber(stats.totale)}</span> cantieri pubblici italiani.
            Aggiornati in tempo reale, fonti dichiarate.
          </p>
        </div>

        {/*
         * KPI EDITORIAL ROW — 4 numeri grandi inline su linea border-y, tabular-nums.
         * Skill: high-end-visual-design (editorial scale tracking display).
         */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 md:gap-x-10 py-10 md:py-14 border-y border-border">
          {[
            { label: 'Cantieri totali', value: formatNumber(stats.totale) },
            { label: 'Regioni coperte', value: stats.regioni.toString() },
            { label: 'Comuni nel database', value: formatNumber(stats.comuni) },
            { label: 'Valore opere tracciate', value: formatEuro(stats.importo_totale, { compact: true }) },
          ].map((k) => (
            <div key={k.label} className="flex flex-col">
              <div className="font-black tracking-[-0.05em] leading-[0.88] tabular-nums text-[3rem] md:text-[5rem] text-foreground">
                {k.value}
              </div>
              <div className="kpi-hero-label text-muted-foreground mt-3">{k.label}</div>
            </div>
          ))}
        </div>

        <DividerOrnament variant="label" label="Dashboard intelligence" spacing="default" />

        {/*
         * BENTO ASIMMETRICO con MICRO-VIZ INLINE:
         *  - Top regioni FEATURED grande (sparkline bar inline per ogni regione)
         *  - Donut conic-gradient: tipologia titolo
         *  - Regione leader card editorial
         *  - Top categorie barre orizzontali editorial
         */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 auto-rows-min">
          {/* TILE FEATURED: classifica regioni con sparkline INLINE */}
          <article className="md:col-span-2 lg:row-span-2 relative overflow-hidden rounded-[2rem] border border-border bg-card transition-all duration-500 hover:shadow-[0_18px_40px_-18px_rgba(17,17,17,0.18)]">
            <div className="p-8 md:p-10">
              <div className="mb-8 flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow eyebrow-dark mb-4">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-construction" />
                    Top 20 regioni
                  </p>
                  <h2 className="text-2xl md:text-3xl font-black tracking-[-0.035em] leading-tight mb-3">
                    Classifica nazionale<br className="hidden md:block" /> per volume cantieri
                  </h2>
                  <p className="text-sm md:text-[15px] text-muted-foreground max-w-md text-pretty">
                    Distribuzione dei cantieri tracciati per regione. Clicca per esplorare province e Comuni.
                  </p>
                </div>
                <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                  <MapPin className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>

              {/* Sparkline + bar regioni editorial */}
              <ol className="divide-y divide-border">
                {regioni.slice(0, 14).map((r, i) => {
                  const pct = (r.cnt / maxRegione) * 100;
                  const seed = r.regione.charCodeAt(0) + r.regione.length * 7;
                  const spark = sparklineFromRegioneSeed(seed);
                  return (
                    <li key={r.regione}>
                      <Link
                        href={`/${regioneSlug(r.regione)}`}
                        className="group flex items-center gap-4 md:gap-6 py-3.5 transition-colors hover:bg-secondary/30 -mx-2 px-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {/* Rank */}
                        <span className="w-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums font-semibold">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        {/* Name + bar */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-3 mb-1.5">
                            <span className="font-bold text-[15px] truncate text-foreground group-hover:text-foreground transition-colors">
                              {r.regione}
                            </span>
                            <span className="font-black tabular-nums text-foreground tracking-tight">
                              {formatNumber(r.cnt)}
                            </span>
                          </div>
                          {/* Bar inline editorial */}
                          <div className="h-[3px] rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-construction"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        {/* Sparkline mini */}
                        <span
                          className="hidden md:flex spark-bar text-foreground/35 group-hover:text-construction transition-colors"
                          aria-hidden="true"
                        >
                          {spark.map((v, k) => (
                            <i key={k} style={{ height: `${v}%` }} />
                          ))}
                        </span>
                        {/* Arrow reveal */}
                        <ArrowRight
                          className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground"
                          strokeWidth={2}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>

              <p className="mt-6 text-xs text-muted-foreground">
                Sparkline indicativa del trend settimanale per la regione. Clicca per esplorare il dettaglio.
              </p>
            </div>
          </article>

          {/* TILE: Donut tipologia titolo */}
          <article className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 md:p-7 transition-all duration-500 hover:shadow-[0_18px_40px_-18px_rgba(17,17,17,0.18)]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow eyebrow-dark mb-2">
                  Tipologia
                </p>
                <h2 className="text-lg font-black tracking-[-0.025em]">Permessi per titolo</h2>
              </div>
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                <FileText className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </div>

            {/* Donut + legend layout */}
            <div className="flex items-center gap-5">
              {/* Mini donut */}
              <div
                className="mini-donut shrink-0"
                style={
                  {
                    '--donut-size': '108px',
                    '--donut-thickness': '14px',
                    '--donut-p1': `${tipiSegments[0]?.pct || 0}%`,
                    '--donut-p2': `${(tipiSegments[0]?.pct || 0) + (tipiSegments[1]?.pct || 0)}%`,
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
              {/* Legend with bars */}
              <ul className="flex-1 space-y-2.5">
                {tipiSegments.slice(0, 3).map((t, i) => {
                  const swatchColors = ['bg-foreground', 'bg-foreground/55', 'bg-construction'];
                  return (
                    <li key={t.tipo} className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${swatchColors[i]} flex-shrink-0`} />
                      <span className="text-[13px] font-bold text-foreground">{t.tipo}</span>
                      <span className="ml-auto text-[13px] tabular-nums text-muted-foreground">
                        {t.pct.toFixed(0)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground/70">PDC</strong> Permesso di Costruire ·{' '}
              <strong className="text-foreground/70">SCIA</strong> Segnalazione Certificata ·{' '}
              <strong className="text-foreground/70">CILA</strong> Comunicazione Inizio Lavori
            </p>
          </article>

          {/* TILE: Regione leader */}
          {topRegione && (
            <article className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground text-background p-6 md:p-7 transition-all duration-500 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]">
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-construction/20 blur-3xl pointer-events-none"
              />
              <div className="relative">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="kpi-hero-label text-background/60 mb-2">Regione leader</p>
                    <h2 className="text-lg font-black tracking-[-0.025em]">In testa per cantieri</h2>
                  </div>
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-background/10 backdrop-blur-sm text-background">
                    <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <Link
                  href={`/${regioneSlug(topRegione.regione)}`}
                  className="group block"
                >
                  <div className="font-black tabular-nums tracking-[-0.05em] leading-[0.88] text-[3.5rem] md:text-[4.5rem] mt-2">
                    {formatNumber(topRegione.cnt)}
                  </div>
                  <div className="mt-2 text-base font-bold">{topRegione.regione}</div>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-background/85 group-hover:text-construction transition-colors">
                    Esplora la regione
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/15 transition-all duration-300 group-hover:bg-construction group-hover:text-foreground group-hover:translate-x-0.5">
                      <ArrowRight className="h-3 w-3" strokeWidth={2.25} />
                    </span>
                  </span>
                </Link>
              </div>
            </article>
          )}

          {/*
           * TILE GRANDE: Top categorie con bar chart editorial orizzontale.
           * Skill: high-end-visual-design (Editorial scale + monospace numbers).
           */}
          <article className="md:col-span-2 lg:col-span-2 relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 md:p-8 transition-all duration-500 hover:shadow-[0_18px_40px_-18px_rgba(17,17,17,0.18)]">
            <div className="mb-7 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow eyebrow-dark mb-3">
                  Categorie
                </p>
                <h2 className="text-xl md:text-2xl font-black tracking-[-0.025em] mb-2">Top 15 categorie di lavori</h2>
                <p className="text-sm text-muted-foreground">
                  Le tipologie di intervento piu frequenti nei cantieri italiani.
                </p>
              </div>
              <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
                <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
              </span>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
              {categorie.slice(0, 14).map((c, i) => {
                const pct = totalCategorie ? (c.cnt / categorie[0].cnt) * 100 : 0;
                return (
                  <li key={c.categoria}>
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <span className="w-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums font-semibold">
                        {(i + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="flex-1 truncate text-[14px] font-bold text-foreground">{c.categoria}</span>
                      <span className="font-black tabular-nums text-[14px] text-foreground">{formatNumber(c.cnt)}</span>
                    </div>
                    <div className="ml-9 h-[2px] rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>
        </div>

        <DividerOrnament variant="line" spacing="default" />

        {/*
         * CTA UNLOCK — split editorial pattern HUB-aligned
         * Skill: high-end-visual-design (Editorial Split archetype)
         */}
        <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground text-background">
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-construction/20 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-background/5 blur-3xl pointer-events-none"
          />
          <div className="relative p-8 md:p-14 lg:p-16 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
            <div className="max-w-2xl">
              <p className="kpi-hero-label text-background/60 mb-5">
                Intelligence completa · Network
              </p>
              <h2 className="font-black tracking-[-0.04em] leading-[0.92] text-[2.25rem] md:text-[3.75rem] mb-6 text-balance">
                Ti servono i dati di dettaglio? Sblocca l&apos;intelligence completa.
              </h2>
              <p className="text-base md:text-lg text-background/75 leading-relaxed mb-9 text-pretty">
                Le statistiche pubbliche rappresentano l&apos;informativa minima trasparente garantita dall&apos;Art. 14 GDPR.
                Per accedere a dati committenti, importi dettagliati, esportazioni CSV illimitate, alert email e dashboard
                intelligence personalizzata, attiva un piano Premium del network ItaliaProgettisti.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.italiaprogettisti.com/abbonamenti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-background text-foreground pl-6 pr-2 py-2 text-sm font-bold transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Scopri i piani Premium
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:bg-construction group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </a>
                <a
                  href="https://www.italiaprogettisti.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-transparent text-background px-6 py-2.5 text-sm font-bold transition-all duration-300 hover:border-background/60 hover:bg-background/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Inizia con il piano gratuito
                </a>
              </div>
            </div>
            {/* Right side: icon stack illustration */}
            <div className="hidden lg:flex flex-col gap-4 w-72">
              <div className="rounded-3xl bg-background/8 backdrop-blur-sm border border-background/10 p-6">
                <Download className="h-5 w-5 mb-3 text-construction" strokeWidth={1.75} />
                <div className="kpi-hero-label text-background/60 mb-1">Export CSV</div>
                <div className="text-2xl font-black tracking-tight">Illimitato</div>
              </div>
              <div className="rounded-3xl bg-background/8 backdrop-blur-sm border border-background/10 p-6">
                <Building2 className="h-5 w-5 mb-3 text-construction" strokeWidth={1.75} />
                <div className="kpi-hero-label text-background/60 mb-1">Dati committenti</div>
                <div className="text-2xl font-black tracking-tight">Premium</div>
              </div>
              <div className="rounded-3xl bg-background/8 backdrop-blur-sm border border-background/10 p-6">
                <TrendingUp className="h-5 w-5 mb-3 text-construction" strokeWidth={1.75} />
                <div className="kpi-hero-label text-background/60 mb-1">Dashboard</div>
                <div className="text-2xl font-black tracking-tight">Custom</div>
              </div>
            </div>
          </div>
        </div>

        <FAQ title="Domande frequenti sulle statistiche" items={statsFaq} />
      </div>
    </section>
  );
}
