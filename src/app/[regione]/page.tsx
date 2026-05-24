import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, Building2, EuroIcon, CalendarClock, Tag } from 'lucide-react';
import {
  getBandi,
  getRegioneStats,
  getBandiByRegione,
  getProvinceCountByRegione,
} from '@/lib/supabase/queries/bandi';
import { REGIONI, regioneNomeFromSlug, regioneSlug, REGIONE_INTRO } from '@/lib/regioni';
import { provinceDiRegione } from '@/lib/province';
import { formatNumber, formatEuro, bandoTitolo } from '@/lib/utils';
import { cpvGroupLabel } from '@/lib/bandi-taxonomy-extra';
import BandoCard from '@/components/bandi/BandoCard';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;
// Slug non in whitelist -> 404 (non genera pagine al volo per route arbitrarie).
export const dynamicParams = false;

interface PageProps {
  params: { regione: string };
}

/**
 * Whitelist: pre-render SOLO le 20 regioni note. Con `dynamicParams = false`,
 * qualsiasi altro slug top-level (che NON sia già una route statica come
 * /bandi, /categoria, /scadenze, /glossario, /chi-siamo, /contatti, /iscriviti,
 * /legal, /per-pubbliche-amministrazioni, /api-pubbliche, /come-trattiamo-i-dati,
 * /regioni) restituisce 404. Le route statiche hanno priorità sul dynamic
 * segment, quindi non c'è collisione.
 */
export async function generateStaticParams() {
  return REGIONI.map((r) => ({ regione: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const nome = regioneNomeFromSlug(params.regione);
  if (!nome) return { title: 'Regione non trovata' };
  const { totale } = await getRegioneStats(nome);
  const title = `Bandi e gare d'appalto ${nome}`;
  const description = `${formatNumber(totale)} bandi e gare d'appalto pubbliche in ${nome}: importi a base d'asta, scadenze, stazioni appaltanti e categorie CPV. Dati pubblici aggiornati da TED e ANAC.`;
  const ogImage = ogImageUrl({
    title: `Bandi ${nome}`,
    subtitle: 'Gare d\'appalto pubbliche · fonti TED e ANAC',
    kind: 'regione',
    count: formatNumber(totale),
    label: 'bandi pubblici',
  });
  return {
    title,
    description,
    alternates: { canonical: `/${params.regione}` },
    openGraph: {
      title,
      description,
      url: `/${params.regione}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function RegionePage({ params }: PageProps) {
  const nome = regioneNomeFromSlug(params.regione);
  if (!nome) notFound();

  const [{ data: bandi, total }, stats, allRegioni, provCounts] = await Promise.all([
    getBandi({
      regione: nome,
      limit: 12,
      orderBy: 'data_pubblicazione',
      orderDirection: 'desc',
    }),
    getRegioneStats(nome),
    getBandiByRegione(),
    getProvinceCountByRegione(nome),
  ]);

  if (total === 0) notFound();

  const intro = REGIONE_INTRO[nome];

  // Province della regione con almeno un bando (link regione → provincia: silo).
  const province = provinceDiRegione(params.regione)
    .map((p) => ({ ...p, cnt: provCounts.get(p.sigla) || 0 }))
    .filter((p) => p.cnt > 0)
    .sort((a, b) => b.cnt - a.cnt);

  // Altre regioni (cross-link interno), escludendo quella corrente.
  const otherRegioni = allRegioni
    .filter((r) => r.regione !== nome)
    .map((r) => ({ nome: r.regione, slug: regioneSlug(r.regione), cnt: r.cnt }))
    .slice(0, 8);

  const itemList = itemListLd(
    bandi.map((b) => ({
      name: bandoTitolo(b, cpvGroupLabel(b.cpv_principale)),
      url: `${siteConfig.baseUrl}/bandi/${b.slug}`,
    })),
    `Bandi e gare d'appalto in ${nome}`,
  );

  const topCpvLabels = stats.topCpv
    .map((c) => cpvGroupLabel(c.group))
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');

  const faqs = [
    {
      q: `Quanti bandi di gara ci sono in ${nome}?`,
      a: `Attualmente tracciamo ${formatNumber(stats.totale)} bandi e gare d'appalto pubbliche in ${nome}, di cui ${formatNumber(stats.aperti)} con termine di presentazione delle offerte ancora aperto. L'elenco si aggiorna automaticamente dalle fonti pubbliche (TED, ANAC).`,
    },
    {
      q: `Quali sono le categorie di appalto più frequenti in ${nome}?`,
      a: topCpvLabels
        ? `In ${nome} le gare più frequenti riguardano: ${topCpvLabels}. Ogni categoria è classificata secondo il Vocabolario Comune per gli Appalti europeo (CPV).`
        : `Le gare in ${nome} coprono diverse categorie merceologiche classificate secondo il Vocabolario Comune per gli Appalti europeo (CPV), dai lavori di costruzione ai servizi tecnici.`,
    },
    {
      q: `Chi pubblica i bandi di gara in ${nome}?`,
      a: `I bandi in ${nome} sono pubblicati da circa ${formatNumber(stats.enti)} stazioni appaltanti diverse — Comuni, Province, ASL, centrali di committenza ed enti pubblici. Per ogni gara mostriamo l'ente che la bandisce e, ad aggiudicazione avvenuta, l'impresa o il raggruppamento vincitore (solo persone giuridiche, nel rispetto del GDPR).`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      {/* HERO regione */}
      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="reg-hero-heading">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere steps={[{ label: 'Regioni', href: '/regioni' }, { label: nome }]} />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Regione · Gare d&apos;appalto pubbliche</span>
            </p>
            <h1 id="reg-hero-heading" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Bandi di gara<br className="hidden sm:block" />{' '}
              <span className="italic font-black text-construction">{nome}</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{formatNumber(stats.totale)}</span>
              bandi pubblici in {nome}. {intro || `Tutte le gare d'appalto pubbliche con sede o ambito di esecuzione in ${nome}: importi, scadenze e categorie.`}
            </p>
          </div>
        </div>
      </section>

      {/* STATISTICHE REGIONE */}
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
              icon={<MapPin className="h-4 w-4" strokeWidth={2} />}
              label="Stazioni appaltanti"
              value={formatNumber(stats.enti)}
            />
          </div>
        </div>
      </section>

      {/* PROVINCE DELLA REGIONE (link regione → provincia, silo GEO) */}
      {province.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <h2 className="text-base font-bold mb-4">Bandi di gara per provincia in {nome}</h2>
            <div className="flex flex-wrap gap-2.5">
              {province.map((p) => (
                <Link
                  key={p.sigla}
                  href={`/${p.regioneSlug}/${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {p.nome}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(p.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TOP CATEGORIE CPV NELLA REGIONE */}
      {stats.topCpv.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <h2 className="text-base font-bold mb-4">Categorie di appalto più frequenti in {nome}</h2>
            <div className="flex flex-wrap gap-2.5">
              {stats.topCpv.map((c) => (
                <Link
                  key={c.group}
                  href={`/bandi?cpv=${c.group}`}
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

      {/* ULTIMI BANDI DELLA REGIONE */}
      <section className="py-12 md:py-16">
        <div className="container-zen">
          <div className="flex items-end justify-between gap-3 mb-8 flex-wrap">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Ultimi bandi in {nome}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {bandi.length} gare recenti tra le {formatNumber(stats.totale)} pubblicate in regione.
              </p>
            </div>
            <Link
              href={`/bandi?q=${encodeURIComponent(nome)}`}
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cerca altri bandi in {nome}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {bandi.map((b) => (
              <BandoCard key={b.id} bando={b} />
            ))}
          </div>
        </div>
      </section>

      {/* ALTRE REGIONI */}
      {otherRegioni.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30 border-t border-border">
          <div className="container-zen">
            <div className="flex items-end justify-between gap-3 mb-8 flex-wrap">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Bandi in altre regioni</h2>
              <Link href="/regioni" className="text-sm font-medium text-foreground hover:underline">
                Tutte le regioni →
              </Link>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {otherRegioni.map((r) => (
                <Link
                  key={r.slug}
                  href={`/${r.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {r.nome}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(r.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title={`Domande frequenti sui bandi di gara in ${nome}`} items={faqs} />
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
