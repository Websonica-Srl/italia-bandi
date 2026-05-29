import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  MapPin,
  Building2,
  EuroIcon,
  CalendarClock,
  Tag,
  Landmark,
} from 'lucide-react';
import {
  getBandi,
  getProvinciaStats,
} from '@/lib/supabase/queries/bandi';
import { regioneNomeFromSlug } from '@/lib/regioni';
import {
  PROVINCE_ALL,
  provinciaFromSlugs,
  provinceDiRegione,
} from '@/lib/province';
import { PROVINCIA_INTRO } from '@/lib/province';
import { formatNumber, formatEuro, bandoTitolo } from '@/lib/utils';
import { cpvGroupLabel, cpvGroupToSlug } from '@websonica/cantieri-core';
import BandiListPaywall from '@/components/bandi/BandiListPaywall';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;
// Solo coppie (regione/provincia) in whitelist → 404 per il resto. Le route
// statiche di primo livello (/bandi, /categoria, /legal, ...) NON sono regioni
// whitelisted, quindi non collidono con questo segmento annidato.
export const dynamicParams = false;

interface PageProps {
  params: { regione: string; provincia: string };
}

/** Pre-render tutte le coppie regione/provincia dalla whitelist del package. */
export async function generateStaticParams() {
  return PROVINCE_ALL.map((p) => ({
    regione: p.regioneSlug,
    provincia: p.slug,
  }));
}

/**
 * Intro editoriale provincia: dedicata (PROVINCIA_INTRO) per i capoluoghi
 * principali, altrimenti parametrica con dati REALI specifici → ogni pagina è
 * unica e non boilerplate (anti-duplicazione regione↔provincia §3.5).
 */
function buildIntro(
  prov: { nome: string; regione: string },
  stats: { totale: number; enti: number; topComuni: { comune: string; cnt: number }[]; topCpv: { group: string; cnt: number }[] },
): string {
  const sigla = PROVINCE_ALL.find((p) => p.nome === prov.nome)?.sigla;
  if (sigla && PROVINCIA_INTRO[sigla]) return PROVINCIA_INTRO[sigla];
  const topComune = stats.topComuni[0]?.comune;
  const topCat = stats.topCpv[0] ? cpvGroupLabel(stats.topCpv[0].group) : null;
  const parts: string[] = [
    `Nella provincia di ${prov.nome} (${prov.regione}) gli appalti pubblici sono banditi da ${formatNumber(stats.enti)} stazioni appaltanti diverse`,
  ];
  if (topCat) parts.push(`con una forte presenza di gare nella categoria ${topCat.toLowerCase()}`);
  if (topComune) parts.push(`e con ${topComune} tra i comuni più attivi del territorio`);
  return parts.join(', ') + '.';
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const prov = provinciaFromSlugs(params.regione, params.provincia);
  if (!prov) return { title: 'Provincia non trovata' };
  const { totale } = await getProvinciaStats(prov.sigla);
  const title = `Bandi e gare d'appalto ${prov.nome} (provincia)`;
  const description = `${formatNumber(totale)} bandi e gare d'appalto pubbliche nella provincia di ${prov.nome} (${prov.regione}): importi, scadenze, stazioni appaltanti, comuni e chi vince le gare. Dati da fonti ufficiali e pubbliche.`;
  const ogImage = ogImageUrl({
    title: `Bandi ${prov.nome}`,
    subtitle: `Provincia · ${prov.regione} · gare d'appalto pubbliche`,
    kind: 'comune',
    count: formatNumber(totale),
    label: 'bandi pubblici',
  });
  return {
    title,
    description,
    alternates: { canonical: `/${params.regione}/${params.provincia}` },
    openGraph: {
      title,
      description,
      url: `/${params.regione}/${params.provincia}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function ProvinciaPage({ params }: PageProps) {
  const prov = provinciaFromSlugs(params.regione, params.provincia);
  if (!prov) notFound();
  const regioneNome = regioneNomeFromSlug(params.regione);

  const [{ data: bandi, total }, stats] = await Promise.all([
    getBandi({
      provincia: prov.sigla,
      limit: 12,
      orderBy: 'data_pubblicazione',
      orderDirection: 'desc',
    }),
    getProvinciaStats(prov.sigla),
  ]);

  // Provincia senza bandi → 404 (niente pagina thin).
  if (total === 0) notFound();

  const intro = buildIntro(prov, stats);

  // Altre province della stessa regione (cross-link laterale), escludendo la corrente.
  const altreProvince = provinceDiRegione(prov.regioneSlug).filter(
    (p) => p.sigla !== prov.sigla,
  );

  const itemList = itemListLd(
    bandi.map((b) => ({
      name: bandoTitolo(b, cpvGroupLabel(b.cpv_principale)),
      url: `${siteConfig.baseUrl}/bandi/${b.slug}`,
    })),
    `Bandi e gare d'appalto nella provincia di ${prov.nome}`,
  );

  const topCpvLabels = stats.topCpv
    .map((c) => cpvGroupLabel(c.group))
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');

  const faqs = [
    {
      q: `Quanti bandi di gara ci sono nella provincia di ${prov.nome}?`,
      a: `Nella provincia di ${prov.nome} tracciamo ${formatNumber(stats.totale)} bandi e gare d'appalto pubbliche, di cui ${formatNumber(stats.aperti)} con termine di presentazione delle offerte ancora aperto. L'elenco si aggiorna automaticamente dalle fonti ufficiali e pubbliche.`,
    },
    {
      q: `Quali stazioni appaltanti bandiscono gare nella provincia di ${prov.nome}?`,
      a: `Le gare nella provincia di ${prov.nome} sono pubblicate da circa ${formatNumber(stats.enti)} stazioni appaltanti — Comuni, ASL, centrali di committenza ed enti pubblici del territorio${stats.topComuni[0] ? `, con ${stats.topComuni[0].comune} tra i centri più attivi` : ''}.`,
    },
    {
      q: `Quali sono le categorie di appalto più frequenti in provincia di ${prov.nome}?`,
      a: topCpvLabels
        ? `Nella provincia di ${prov.nome} le gare più frequenti riguardano: ${topCpvLabels}. Ogni categoria è classificata secondo il Vocabolario Comune per gli Appalti europeo (CPV).`
        : `Le gare nella provincia di ${prov.nome} coprono diverse categorie merceologiche classificate secondo il Vocabolario Comune per gli Appalti europeo (CPV).`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      {/* HERO provincia */}
      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="prov-hero-heading">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere
              steps={[
                { label: 'Regioni', href: '/regioni' },
                { label: prov.regione, href: `/${prov.regioneSlug}` },
                { label: prov.nome },
              ]}
            />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Provincia · {prov.regione} · Gare d&apos;appalto</span>
            </p>
            <h1 id="prov-hero-heading" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Bandi di gara<br className="hidden sm:block" />{' '}
              <span className="italic font-black text-construction">provincia di {prov.nome}</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{formatNumber(stats.totale)}</span>
              bandi pubblici nella provincia di {prov.nome}. {intro}
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICHE PROVINCIA */}
      <section className="pb-8 md:pb-12">
        <div className="container-zen">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Building2 className="h-4 w-4" strokeWidth={2} />}
              label="Bandi pubblici"
              value={formatNumber(stats.totale)}
            />
            <StatCard
              icon={<CalendarClock className="h-4 w-4" strokeWidth={2} />}
              label="Con termine aperto"
              value={formatNumber(stats.aperti)}
            />
            <StatCard
              icon={<EuroIcon className="h-4 w-4" strokeWidth={2} />}
              label="Valore a base d'asta"
              value={formatEuro(stats.importoTotaleBase, { compact: true })}
            />
            <StatCard
              icon={<Landmark className="h-4 w-4" strokeWidth={2} />}
              label="Stazioni appaltanti"
              value={formatNumber(stats.enti)}
            />
          </div>
        </div>
      </section>

      {/* TOP COMUNI DELLA PROVINCIA (focus territoriale, distingue dalla regione) */}
      {stats.topComuni.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <h2 className="text-base font-bold mb-4">Comuni più attivi nella provincia di {prov.nome}</h2>
            <div className="flex flex-wrap gap-2.5">
              {stats.topComuni.map((c) => (
                <span
                  key={c.comune}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {c.comune}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(c.cnt)}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOP CATEGORIE CPV (cross-link categoria↔geo) */}
      {stats.topCpv.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <h2 className="text-base font-bold mb-4">Categorie di appalto più frequenti in provincia di {prov.nome}</h2>
            <div className="flex flex-wrap gap-2.5">
              {stats.topCpv.map((c) => (
                <Link
                  key={c.group}
                  href={`/categoria/${cpvGroupToSlug(c.group)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Tag className="h-3 w-3" strokeWidth={2} />
                  {cpvGroupLabel(c.group)}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(c.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ULTIMI BANDI DELLA PROVINCIA */}
      <section className="py-12 md:py-16">
        <div className="container-zen">
          <div className="flex items-end justify-between gap-3 mb-8 flex-wrap">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Ultimi bandi nella provincia di {prov.nome}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {bandi.length} gare recenti tra le {formatNumber(stats.totale)} pubblicate in provincia.
              </p>
            </div>
            <Link
              href={`/bandi?provincia=${prov.sigla}`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Tutti i bandi della provincia
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
          <BandiListPaywall bandi={bandi} total={stats.totale} />
        </div>
      </section>

      {/* ALTRE PROVINCE DELLA REGIONE + risalita alla regione (silo) */}
      {altreProvince.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30 border-t border-border">
          <div className="container-zen">
            <div className="flex items-end justify-between gap-3 mb-8 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Altre province {regioneNome ? `in ${regioneNome}` : 'della regione'}
              </h2>
              <Link href={`/${prov.regioneSlug}`} className="text-sm font-medium text-foreground hover:underline">
                Tutti i bandi {regioneNome ? `in ${regioneNome}` : 'della regione'} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {altreProvince.map((p) => (
                <Link
                  key={p.sigla}
                  href={`/${p.regioneSlug}/${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {p.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title={`Domande frequenti sui bandi di gara in provincia di ${prov.nome}`} items={faqs} />
        </div>
      </section>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground mb-3">
        {icon}
      </div>
      <p className="text-2xl font-black tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
