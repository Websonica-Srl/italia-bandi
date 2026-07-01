import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trophy, Tag, MapPin, ArrowLeft } from 'lucide-react';
import {
  getLeaderboard,
  getLeaderboardSegments,
  getRtiPartners,
  getLandscapeSummary,
} from '@/lib/supabase/queries/intelligence';
import { getAggStats } from '@/lib/supabase/queries/bandi';
import { cpvGroupLabel } from '@websonica/cantieri-core';
import { regioneSlug, regioneNomeFromSlug } from '@/lib/regioni';
import { formatNumber } from '@/lib/utils';
import {
  itemListLd,
  ogImageUrl,
  safeJsonLd,
} from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import LeaderboardTable from '@/components/bandi/LeaderboardTable';
import LandscapeBlock from '@/components/bandi/LandscapeBlock';
import RtiCoppie from '@/components/bandi/RtiCoppie';
import FAQ from '@/components/cantieri/FAQ';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: { segmento: string };
}

type Segmento =
  | { kind: 'cpv'; code: string; label: string }
  | { kind: 'regione'; nome: string; label: string };

/** Parsa lo slug "cpv-45" / "regione-lombardia" → segmento valido o null. */
function parseSegmento(slug: string): Segmento | null {
  if (slug.startsWith('cpv-')) {
    const code = slug.slice(4);
    if (!/^\d{2}$/.test(code)) return null;
    const label = cpvGroupLabel(code);
    if (label === code) return null; // gruppo non noto
    return { kind: 'cpv', code, label };
  }
  if (slug.startsWith('regione-')) {
    const regSlug = slug.slice(8);
    const nome = regioneNomeFromSlug(regSlug);
    if (!nome) return null;
    return { kind: 'regione', nome, label: nome };
  }
  return null;
}

export async function generateStaticParams() {
  try {
    const segments = await getLeaderboardSegments();
    const cpv = segments.cpv
      .filter((s) => s.cnt >= 5)
      .map((s) => ({ segmento: `cpv-${s.key}` }));
    const reg = segments.regioni
      .filter((s) => s.cnt >= 5)
      .map((s) => ({ segmento: `regione-${regioneSlug(s.key)}` }));
    return [...cpv, ...reg];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const seg = parseSegmento(params.segmento);
  if (!seg) return { title: 'Classifica non trovata' };
  const title =
    seg.kind === 'cpv'
      ? `Chi vince le gare d'appalto ${seg.label} (CPV ${seg.code})`
      : `Chi vince le gare d'appalto in ${seg.label}`;
  const description =
    seg.kind === 'cpv'
      ? `Le imprese che vincono di piu' le gare d'appalto della categoria "${seg.label}" (CPV ${seg.code}) in Italia: classifica per gare aggiudicate e raggruppamenti. Dati da fonti ufficiali e pubbliche.`
      : `Le imprese che vincono di piu' le gare d'appalto pubbliche in ${seg.label}: classifica per gare aggiudicate, categoria prevalente e raggruppamenti. Dati da fonti ufficiali e pubbliche.`;
  const ogImage = ogImageUrl({
    title: seg.kind === 'cpv' ? `Classifica ${seg.label}` : `Classifica ${seg.label}`,
    subtitle: 'Chi vince di più le gare d\'appalto',
    kind: 'stats',
    label: 'gare vinte',
  });
  return {
    title,
    description,
    alternates: { canonical: `/classifiche/${params.segmento}` },
    openGraph: { title, description, url: `/classifiche/${params.segmento}`, type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function ClassificaSegmentoPage({ params }: PageProps) {
  const seg = parseSegmento(params.segmento);
  if (!seg) notFound();

  const lbFilter =
    seg.kind === 'cpv' ? { cpvGroup: seg.code, limit: 50 } : { regione: seg.nome, limit: 50 };
  const rtiFilter =
    seg.kind === 'cpv' ? { cpvGroup: seg.code, limit: 8 } : { regione: seg.nome, limit: 8 };

  const [rows, rti, landscape, agg] = await Promise.all([
    getLeaderboard(lbFilter),
    getRtiPartners(rtiFilter),
    seg.kind === 'cpv' ? getLandscapeSummary(seg.code) : Promise.resolve(null),
    getAggStats(),
  ]);

  if (rows.length === 0) notFound();

  const itemList = itemListLd(
    rows.slice(0, 25).map((r) => ({
      name: `${r.firm_name} — ${formatNumber(r.gare_vinte)} gare vinte`,
      url: `${siteConfig.baseUrl}/classifiche/${params.segmento}`,
    })),
    seg.kind === 'cpv'
      ? `Classifica vincitori categoria ${seg.label}`
      : `Classifica vincitori in ${seg.label}`,
  );

  const faqs = [
    {
      q:
        seg.kind === 'cpv'
          ? `Chi vince di più le gare ${seg.label.toLowerCase()}?`
          : `Chi vince di più le gare d'appalto in ${seg.label}?`,
      a: `La classifica sopra elenca le imprese con più gare d'appalto aggiudicate ${
        seg.kind === 'cpv' ? `nella categoria CPV ${seg.code} (${seg.label})` : `in ${seg.label}`
      }, su un dataset di ${formatNumber(agg.gare)} gare aggiudicate da fonti ufficiali e pubbliche. Mostriamo solo ragioni sociali di persone giuridiche.`,
    },
    {
      q: 'Questi numeri sono una garanzia di vittoria?',
      a: 'No. Sono il track record storico di chi ha già vinto in questo segmento. Servono a capire se un mercato è presidiato da pochi operatori radicati o aperto a nuovi entranti, prima di decidere se partecipare.',
    },
  ];

  return (
    <>
      {/* BreadcrumbList JSON-LD emesso da <BreadcrumbCantiere> (no doppioni). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="cls-seg-hero">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere steps={[{ label: 'Classifiche', href: '/classifiche' }, { label: seg.label }]} />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {seg.kind === 'cpv' ? <Tag className="h-3.5 w-3.5" strokeWidth={2} /> : <MapPin className="h-3.5 w-3.5" strokeWidth={2} />}
              <span>
                {seg.kind === 'cpv' ? `Categoria CPV ${seg.code}` : 'Regione'} · Classifica vincitori
              </span>
            </p>
            <h1 id="cls-seg-hero" className="font-black tracking-[-0.05em] leading-[0.95] text-foreground text-balance mb-6" style={{ fontSize: 'clamp(2rem, 4.5vw + 0.5rem, 4rem)' }}>
              Chi vince le gare{' '}
              {seg.kind === 'cpv' ? (
                <>
                  <span className="italic font-black text-construction">{seg.label.toLowerCase()}</span>
                </>
              ) : (
                <>
                  in <span className="italic font-black text-construction">{seg.label}</span>
                </>
              )}
              .
            </h1>
            <p className="text-lg font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl mr-1.5 tracking-tight">{formatNumber(rows.length)}</span>
              imprese in classifica{seg.kind === 'cpv' ? ' in questa categoria' : ` in ${seg.label}`}. I nomi che ricorrono di più sono il segnale competitivo del segmento.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10 md:pb-12">
        <div className="container-zen max-w-5xl">
          <LeaderboardTable
            rows={rows}
            showCpv={seg.kind === 'regione'}
            showZona={seg.kind === 'cpv'}
            ctaCampaign="leaderboard_segmento"
          />
        </div>
      </section>

      {/* M7 landscape (solo per CPV: granularita' cpv2 × regione × fascia) */}
      {landscape && (
        <section className="pb-10 md:pb-12">
          <div className="container-zen max-w-5xl">
            <LandscapeBlock summary={landscape} segmentoLabel={seg.label.toLowerCase()} />
          </div>
        </section>
      )}

      {/* M5 RTI alleanze tipiche del segmento */}
      {rti.length > 0 && (
        <section className="pb-10 md:pb-12">
          <div className="container-zen max-w-5xl">
            <RtiCoppie
              coppie={rti}
              title={
                seg.kind === 'cpv'
                  ? `Alleanze tipiche ${seg.label.toLowerCase()}`
                  : `Alleanze tipiche in ${seg.label}`
              }
              subtitle="Le coppie di imprese che si aggiudicano piu' spesso le gare insieme, in raggruppamento."
              ctaCampaign="leaderboard_rti"
            />
          </div>
        </section>
      )}

      <section className="pb-4">
        <div className="container-zen max-w-5xl">
          <Link href="/classifiche" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Tutte le classifiche
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ
            title={
              seg.kind === 'cpv'
                ? `Domande frequenti — vincitori ${seg.label.toLowerCase()}`
                : `Domande frequenti — vincitori in ${seg.label}`
            }
            items={faqs}
          />
        </div>
      </section>
    </>
  );
}
