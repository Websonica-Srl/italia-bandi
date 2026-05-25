import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import {
  getBandi,
  getBandiByCpvGroup,
  getBandiCountByCpvGroup,
  getRegioniByCpvGroup,
} from '@/lib/supabase/queries/bandi';
import {
  getLandscapeSummary,
  getRtiPartners,
  getLeaderboard,
} from '@/lib/supabase/queries/intelligence';
import { regioneSlug } from '@/lib/regioni';
import { MapPin, Trophy } from 'lucide-react';
import { formatNumber, formatEuro, formatPct, bandoTitolo } from '@/lib/utils';
import {
  cpvGroupLabel,
  cpvGroupToSlug,
  slugToCpvGroup,
  CPV_GROUP_EDITORIAL,
} from '@/lib/bandi-taxonomy-extra';
import BandoCard from '@/components/bandi/BandoCard';
import LandscapeBlock from '@/components/bandi/LandscapeBlock';
import RtiCoppie from '@/components/bandi/RtiCoppie';
import LeaderboardTable from '@/components/bandi/LeaderboardTable';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

/**
 * Pre-render le pagine categoria dei gruppi CPV realmente presenti, usando gli
 * SLUG parlanti (URL SEO) e non più i codici numerici.
 */
export async function generateStaticParams() {
  try {
    const groups = await getBandiByCpvGroup();
    return groups.map((g) => ({ slug: cpvGroupToSlug(g.group) }));
  } catch {
    // Se l'env Supabase non è disponibile a build time, renderizza on-demand.
    return [];
  }
}

/**
 * Risolve lo slug di rotta nel gruppo CPV a 2 cifre.
 * - slug parlante noto → gruppo
 * - vecchio URL numerico (/^\d+$/) → ritorna { group, redirectTo } per 308
 * - altrimenti null → notFound
 */
function resolveSlug(
  slug: string,
): { group: string; redirectTo: string | null } | null {
  // Vecchio URL numerico: 301/308 permanente verso lo slug parlante.
  if (/^\d+$/.test(slug)) {
    const group = slug.padStart(2, '0').slice(0, 2);
    if (cpvGroupLabel(group) === group) return null; // gruppo ignoto → 404
    return { group, redirectTo: `/categoria/${cpvGroupToSlug(group)}` };
  }
  const group = slugToCpvGroup(slug);
  if (!group) return null;
  return { group, redirectTo: null };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = resolveSlug(params.slug);
  if (!resolved) return { title: 'Categoria non trovata' };
  const cpv = resolved.group;
  const slug = cpvGroupToSlug(cpv);
  const label = cpvGroupLabel(cpv);
  const count = await getBandiCountByCpvGroup(cpv);
  const title = `Bandi di gara ${label} (CPV ${cpv}) in Italia`;
  const description = `${count} bandi e gare d'appalto per la categoria "${label}" (CPV ${cpv}): importi, scadenze e aggiudicatari. Dati pubblici aggiornati.`;
  const ogImage = ogImageUrl({
    title: `Bandi ${label}`,
    subtitle: `Categoria CPV ${cpv} · gare d'appalto pubbliche`,
    kind: 'bando',
    count: formatNumber(count),
    label: 'bandi pubblici',
  });
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${slug}` },
    openGraph: { title, description, url: `/categoria/${slug}`, type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const resolved = resolveSlug(params.slug);
  if (!resolved) notFound();
  // Vecchio URL numerico → 308 permanente verso lo slug parlante.
  if (resolved.redirectTo) permanentRedirect(resolved.redirectTo);

  const cpv = resolved.group;
  const label = cpvGroupLabel(cpv);
  const editorial = CPV_GROUP_EDITORIAL[cpv];

  const [{ data: bandi, total }, allGroups, regioniCpv, landscape, rti, topVincitori] =
    await Promise.all([
      getBandi({ cpvGroup: cpv, limit: 12, orderBy: 'data_pubblicazione', orderDirection: 'desc' }),
      getBandiByCpvGroup(),
      getRegioniByCpvGroup(cpv, 8),
      getLandscapeSummary(cpv),
      getRtiPartners({ cpvGroup: cpv, limit: 6 }),
      getLeaderboard({ cpvGroup: cpv, limit: 10 }),
    ]);

  if (total === 0) notFound();

  const importoTot = bandi.reduce((s, b) => s + (Number(b.importo_base) || 0), 0);
  const otherGroups = allGroups.filter((g) => g.group !== cpv).slice(0, 6);

  const itemList = itemListLd(
    bandi.map((b) => ({ name: bandoTitolo(b, label), url: `${siteConfig.baseUrl}/bandi/${b.slug}` })),
    `Bandi categoria ${label}`,
  );

  const faqs = [
    {
      q: `Cosa comprende la categoria CPV ${cpv} (${label})?`,
      a: editorial?.cosa || `La categoria CPV ${cpv} "${label}" raggruppa le gare d'appalto pubbliche il cui oggetto rientra in questa divisione del Vocabolario Comune per gli Appalti europeo.`,
    },
    {
      q: `Quanti bandi sono disponibili per la categoria ${label}?`,
      a: `Attualmente abbiamo ${formatNumber(total)} bandi pubblici tracciati nella categoria CPV ${cpv}. L'elenco si aggiorna automaticamente dalle fonti pubbliche.`,
    },
    {
      q: `Chi vince le gare della categoria ${label}?`,
      a: editorial?.chiVince || 'Quando una gara viene aggiudicata, mostriamo la ragione sociale dell\'impresa o del raggruppamento vincitore (solo persone giuridiche, in conformità al GDPR).',
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      {/* HERO categoria */}
      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="cat-hero-heading">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere steps={[{ label: 'Bandi', href: '/bandi' }, { label }]} />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Categoria CPV {cpv} · Gare d&apos;appalto</span>
            </p>
            <h1 id="cat-hero-heading" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Bandi di gara<br className="hidden sm:block" />{' '}
              <span className="italic font-black text-construction">{label}</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{formatNumber(total)}</span>
              bandi pubblici nella categoria CPV {cpv}. {editorial?.intro || `Gare d'appalto il cui oggetto rientra nella divisione "${label}" del Vocabolario Comune per gli Appalti europeo.`}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENUTO EDITORIALE UNICO + CHI SI AGGIUDICA (conteggi reali, copy 1.4) */}
      <section className="pb-8 md:pb-12">
        <div className="container-zen">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-secondary/30 p-7 md:p-8">
              <h2 className="text-base font-bold mb-3">Cosa comprende</h2>
              <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">
                {editorial?.cosa ||
                  `La categoria CPV ${cpv} "${label}" raggruppa le gare d'appalto pubbliche il cui oggetto rientra in questa divisione del Vocabolario Comune per gli Appalti europeo.`}
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-secondary/30 p-7 md:p-8">
              <h2 className="text-base font-bold mb-3">Chi si aggiudica queste gare</h2>
              <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">
                {landscape && landscape.vincitori_distinti_tot > 0 && landscape.pct_rti != null ? (
                  <>
                    In questa categoria hanno vinto{' '}
                    <strong className="text-foreground">{formatNumber(landscape.vincitori_distinti_tot)}</strong>{' '}
                    imprese distinte, e{' '}
                    <strong className="text-foreground">{formatPct(landscape.pct_rti)}</strong>{' '}
                    delle gare e&apos; andato a un raggruppamento. Pochi nomi ricorrono
                    spesso: e&apos; il segnale che ti dice se c&apos;e&apos; spazio per te o un
                    presidio consolidato.
                  </>
                ) : (
                  editorial?.chiVince ||
                  'In questa categoria contano due cose: quanti nomi diversi vincono davvero e quante gare vanno a un raggruppamento. E\' la differenza tra una categoria aperta e una presidiata. Lo vedi gratis, scheda per scheda.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* M7 LANDSCAPE competitivo della categoria */}
      {landscape && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <LandscapeBlock summary={landscape} segmentoLabel={`la categoria ${label.toLowerCase()}`} />
          </div>
        </section>
      )}

      {/* M8 TEASER leaderboard: chi vince di piu' in questa categoria */}
      {topVincitori.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Trophy className="h-5 w-5 text-construction" strokeWidth={2} />
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Chi vince di piu&apos; {label.toLowerCase()}
                </h2>
              </div>
              <Link
                href={`/classifiche/cpv-${cpv}`}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Classifica completa
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>
            </div>
            <LeaderboardTable rows={topVincitori} showZona ctaCampaign="categoria_leaderboard" />
          </div>
        </section>
      )}

      {/* M5 RTI alleanze tipiche della categoria */}
      {rti.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <RtiCoppie
              coppie={rti}
              title={`Alleanze tipiche ${label.toLowerCase()}`}
              subtitle="Le coppie di imprese che si aggiudicano piu' spesso insieme le gare di questa categoria."
              ctaCampaign="categoria_rti"
            />
          </div>
        </section>
      )}

      {/* ULTIMI BANDI DELLA CATEGORIA */}
      <section className="py-12 md:py-16">
        <div className="container-zen">
          <div className="flex items-end justify-between gap-3 mb-8 flex-wrap">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Ultimi bandi {label.toLowerCase()}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                {bandi.length} gare recenti per un valore complessivo di {formatEuro(importoTot, { compact: true })} a base di gara.
              </p>
            </div>
            <Link href={`/bandi?cpv=${cpv}`} className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Tutti i bandi di questa categoria
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

      {/* BANDI DELLA CATEGORIA PER REGIONE (cross-link categoria↔geo) */}
      {regioniCpv.length > 0 && (
        <section className="pb-4 md:pb-8">
          <div className="container-zen">
            <h2 className="text-base font-bold mb-4">Bandi {label.toLowerCase()} per regione</h2>
            <div className="flex flex-wrap gap-2.5">
              {regioniCpv.map((r) => (
                <Link
                  key={r.regione}
                  href={`/${regioneSlug(r.regione)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {r.regione}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(r.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALTRE CATEGORIE */}
      {otherGroups.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30 border-t border-border">
          <div className="container-zen">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8">Altre categorie di appalto</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherGroups.map((g) => (
                <Link
                  key={g.group}
                  href={`/categoria/${cpvGroupToSlug(g.group)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {cpvGroupLabel(g.group)}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(g.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA pagina + smarco (copy 1.4) */}
      <section className="py-12 md:py-16">
        <div className="container-zen max-w-3xl text-center">
          <p className="text-lg md:text-xl font-light text-secondary-text mb-2 text-pretty">
            Una lista per CPV ce l&apos;hanno tutti. La classifica di chi vince per CPV, no.
          </p>
          <a
            href={`https://www.italiaprogettisti.com/register?utm_source=bandigaredappalto&utm_medium=referral&utm_campaign=categoria_cpv&intent=bidder-landscape`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Scopri quanto e&apos; &quot;tua&quot; una gara di questa categoria
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title={`Domande frequenti sui bandi ${label.toLowerCase()}`} items={faqs} />
        </div>
      </section>
    </>
  );
}
