import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import {
  getBandi,
  getBandiByCpvGroup,
  getBandiCountByCpvGroup,
} from '@/lib/supabase/queries/bandi';
import { formatNumber, formatEuro, bandoTitolo } from '@/lib/utils';
import {
  cpvGroupLabel,
  CPV_GROUP_LABELS,
  CPV_GROUP_EDITORIAL,
} from '@/lib/bandi-taxonomy';
import BandoCard from '@/components/bandi/BandoCard';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;

interface PageProps {
  params: { cpv: string };
}

/** Pre-render le pagine categoria dei gruppi CPV realmente presenti. */
export async function generateStaticParams() {
  try {
    const groups = await getBandiByCpvGroup();
    return groups.map((g) => ({ cpv: g.group }));
  } catch {
    // Se l'env Supabase non è disponibile a build time, renderizza on-demand.
    return [];
  }
}

function isValidGroup(cpv: string): boolean {
  return /^\d{2}$/.test(cpv) && !!CPV_GROUP_LABELS[cpv];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (!isValidGroup(params.cpv)) return { title: 'Categoria non trovata' };
  const label = cpvGroupLabel(params.cpv);
  const count = await getBandiCountByCpvGroup(params.cpv);
  const title = `Bandi di gara ${label} (CPV ${params.cpv}) in Italia`;
  const description = `${count} bandi e gare d'appalto per la categoria "${label}" (CPV ${params.cpv}): importi, scadenze e aggiudicatari. Dati pubblici aggiornati.`;
  const ogImage = ogImageUrl({
    title: `Bandi ${label}`,
    subtitle: `Categoria CPV ${params.cpv} · gare d'appalto pubbliche`,
    kind: 'bando',
    count: formatNumber(count),
    label: 'bandi pubblici',
  });
  return {
    title,
    description,
    alternates: { canonical: `/categoria/${params.cpv}` },
    openGraph: { title, description, url: `/categoria/${params.cpv}`, type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  if (!isValidGroup(params.cpv)) notFound();

  const label = cpvGroupLabel(params.cpv);
  const editorial = CPV_GROUP_EDITORIAL[params.cpv];

  const [{ data: bandi, total }, allGroups] = await Promise.all([
    getBandi({ cpvGroup: params.cpv, limit: 12, orderBy: 'data_pubblicazione', orderDirection: 'desc' }),
    getBandiByCpvGroup(),
  ]);

  if (total === 0) notFound();

  const importoTot = bandi.reduce((s, b) => s + (Number(b.importo_base) || 0), 0);
  const otherGroups = allGroups.filter((g) => g.group !== params.cpv).slice(0, 6);

  const itemList = itemListLd(
    bandi.map((b) => ({ name: bandoTitolo(b, label), url: `${siteConfig.baseUrl}/bandi/${b.slug}` })),
    `Bandi categoria ${label}`,
  );

  const faqs = [
    {
      q: `Cosa comprende la categoria CPV ${params.cpv} (${label})?`,
      a: editorial?.cosa || `La categoria CPV ${params.cpv} "${label}" raggruppa le gare d'appalto pubbliche il cui oggetto rientra in questa divisione del Vocabolario Comune per gli Appalti europeo.`,
    },
    {
      q: `Quanti bandi sono disponibili per la categoria ${label}?`,
      a: `Attualmente abbiamo ${formatNumber(total)} bandi pubblici tracciati nella categoria CPV ${params.cpv}. L'elenco si aggiorna automaticamente dalle fonti pubbliche.`,
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
              <span>Categoria CPV {params.cpv} · Gare d&apos;appalto</span>
            </p>
            <h1 id="cat-hero-heading" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Bandi di gara<br className="hidden sm:block" />{' '}
              <span className="italic font-black text-construction">{label}</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{formatNumber(total)}</span>
              bandi pubblici nella categoria CPV {params.cpv}. {editorial?.intro || `Gare d'appalto il cui oggetto rientra nella divisione "${label}" del Vocabolario Comune per gli Appalti europeo.`}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENUTO EDITORIALE UNICO */}
      {editorial && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-border bg-secondary/30 p-7 md:p-8">
                <h2 className="text-base font-bold mb-3">Cosa comprende</h2>
                <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">{editorial.cosa}</p>
              </div>
              <div className="rounded-3xl border border-border bg-secondary/30 p-7 md:p-8">
                <h2 className="text-base font-bold mb-3">Chi si aggiudica queste gare</h2>
                <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">{editorial.chiVince}</p>
              </div>
            </div>
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
            <Link href={`/bandi?cpv=${params.cpv}`} className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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

      {/* ALTRE CATEGORIE */}
      {otherGroups.length > 0 && (
        <section className="py-12 md:py-16 bg-secondary/30 border-t border-border">
          <div className="container-zen">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8">Altre categorie di appalto</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherGroups.map((g) => (
                <Link
                  key={g.group}
                  href={`/categoria/${g.group}`}
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

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title={`Domande frequenti sui bandi ${label.toLowerCase()}`} items={faqs} />
        </div>
      </section>
    </>
  );
}
