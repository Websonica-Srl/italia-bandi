import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Building2,
  FileText,
  CheckCircle2,
  CalendarClock,
  Tag,
  TrendingDown,
  Users2,
  MapPin,
  EuroIcon,
} from 'lucide-react';
import {
  getBuyer,
  resolveBuyerSlug,
  getAllBuyersForParams,
} from '@/lib/supabase/queries/intelligence';
import { getBandi } from '@/lib/supabase/queries/bandi';
import { buyerSlug, fasciaImportoLabel } from '@/lib/buyer';
import { cpvGroupLabel, cpvGroup } from '@/lib/bandi-taxonomy-extra';
import { provinciaFromSigla } from '@/lib/province';
import { regioneSlug } from '@/lib/regioni';
import { formatNumber, formatEuro, formatPct } from '@/lib/utils';
import {
  breadcrumbLd,
  ogImageUrl,
  safeJsonLd,
} from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import BuyerTopVincitori from '@/components/bandi/BuyerTopVincitori';
import BandoCard from '@/components/bandi/BandoCard';
import DatiPremiumLocked from '@/components/bandi/DatiPremiumLocked';
import FAQ from '@/components/cantieri/FAQ';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: { slug: string };
}

/**
 * Pre-render dei 300 enti piu' attivi (per n_bandi) con almeno un'aggiudicazione;
 * gli altri sono ISR on-demand (dynamicParams = true). Dedup per slug.
 */
export async function generateStaticParams() {
  try {
    const buyers = await getAllBuyersForParams();
    const seen = new Set<string>();
    const params: { slug: string }[] = [];
    for (const b of buyers
      .filter((x) => (Number(x.n_aggiudicati) || 0) > 0)
      .sort((a, b2) => (Number(b2.n_bandi) || 0) - (Number(a.n_bandi) || 0))) {
      const slug = buyerSlug(b.stazione_appaltante);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      params.push({ slug });
      if (params.length >= 300) break;
    }
    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ente = await resolveBuyerSlug(params.slug, buyerSlug);
  if (!ente) return { title: 'Stazione appaltante non trovata' };
  const buyer = await getBuyer(ente);
  if (!buyer) return { title: 'Stazione appaltante non trovata' };
  const title = `${ente} — bandi e gare d'appalto`;
  const description = `${formatNumber(buyer.n_bandi)} bandi pubblicati da ${ente}: cosa appalta, a chi aggiudica, ribasso mediano e offerte medie. Dati pubblici da TED e ANAC.`;
  const ogImage = ogImageUrl({
    title: ente,
    subtitle: 'Stazione appaltante · gare d\'appalto pubbliche',
    kind: 'pa',
    count: formatNumber(buyer.n_bandi),
    label: 'bandi pubblicati',
  });
  return {
    title,
    description,
    alternates: { canonical: `/ente/${params.slug}` },
    openGraph: { title, description, url: `/ente/${params.slug}`, type: 'website', images: [{ url: ogImage, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function EntePage({ params }: PageProps) {
  const ente = await resolveBuyerSlug(params.slug, buyerSlug);
  if (!ente) notFound();

  const buyer = await getBuyer(ente);
  if (!buyer) notFound();

  // Ultimi bandi dell'ente (cerca per nome esatto della stazione appaltante).
  const { data: bandi } = await getBandi({
    q: ente,
    limit: 6,
    orderBy: 'data_pubblicazione',
    orderDirection: 'desc',
  });
  // Filtra ai soli bandi davvero di questo ente (q e' full-text, puo' allargare).
  const bandiEnte = bandi.filter((b) => b.stazione_appaltante === ente).slice(0, 6);

  const grp = buyer.top_cpv2;
  const cpvLabel = grp ? cpvGroupLabel(grp) : null;
  const prov = buyer.provincia ? provinciaFromSigla(buyer.provincia) : null;
  const regNome = (buyer.regione || '').trim();
  const provCoerente = prov && (!regNome || prov.regione === regNome) ? prov : null;
  const regSlug = provCoerente
    ? provCoerente.regioneSlug
    : regNome
      ? regioneSlug(regNome)
      : null;

  const breadcrumb = breadcrumbLd([
    ...(regSlug ? [{ name: regNome || (provCoerente?.regione ?? ''), path: `/${regSlug}` }] : []),
    { name: ente },
  ]);

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: ente,
    url: `${siteConfig.baseUrl}/ente/${params.slug}`,
    ...(regNome ? { areaServed: { '@type': 'AdministrativeArea', name: regNome } } : {}),
    description: `Stazione appaltante con ${buyer.n_bandi} bandi di gara pubblici tracciati su ${siteConfig.name}.`,
  };

  const faqs = [
    {
      q: `Quanti bandi ha pubblicato ${ente}?`,
      a: `${ente} ha pubblicato ${formatNumber(buyer.n_bandi)} bandi di gara nel nostro dataset, di cui ${formatNumber(buyer.n_aggiudicati)} gia' aggiudicati${buyer.n_aperti > 0 ? ` e ${formatNumber(buyer.n_aperti)} con termine ancora aperto` : ''}. L'elenco si aggiorna dalle fonti pubbliche (TED, ANAC).`,
    },
    {
      q: `Chi vince le gare di ${ente}?`,
      a: buyer.top_vincitori && buyer.top_vincitori.length > 0
        ? `Tra le imprese che si aggiudicano piu' spesso le gare di ${ente} compaiono ${buyer.top_vincitori.slice(0, 3).map((v) => v.nome.replace(/\s+/g, ' ').trim().slice(0, 60)).join(', ')}. Mostriamo solo ragioni sociali di persone giuridiche, nel rispetto del GDPR.`
        : `Quando una gara di ${ente} viene aggiudicata, mostriamo la ragione sociale del vincitore (solo persone giuridiche, GDPR).`,
    },
    ...(buyer.ribasso_mediano != null
      ? [{
          q: `Qual e' il ribasso mediano delle gare di ${ente}?`,
          a: `Sulle gare aggiudicate da ${ente} il ribasso mediano storico e' ${formatPct(buyer.ribasso_mediano, { fraction: false })}. E' una statistica descrittiva sullo storico dell'ente, non una previsione sulle gare future.`,
        }]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(orgLd) }} />

      {/* HERO */}
      <section className="relative bg-background pt-32 pb-10 md:pt-40 md:pb-12" aria-labelledby="ente-hero">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere
              steps={[
                ...(regSlug ? [{ label: regNome || (provCoerente?.regione ?? ''), href: `/${regSlug}` }] : []),
                { label: ente },
              ]}
            />
            <p className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Stazione appaltante</span>
            </p>
            <h1 id="ente-hero" className="font-black tracking-[-0.04em] leading-[0.98] text-foreground text-balance mb-6" style={{ fontSize: 'clamp(1.75rem, 3.5vw + 0.5rem, 3.25rem)' }}>
              {ente}
            </h1>
            <p className="text-lg font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl mr-1.5 tracking-tight">{formatNumber(buyer.n_bandi)}</span>
              bandi di gara pubblicati
              {cpvLabel ? <> , prevalentemente nella categoria <strong className="text-foreground font-medium">{cpvLabel.toLowerCase()}</strong></> : null}
              {regNome ? <> , in {regNome}</> : null}. Cosa appalta, a chi aggiudica e con quale ribasso.
            </p>
          </div>
        </div>
      </section>

      {/* STAT CARDS */}
      <section className="pb-8 md:pb-12">
        <div className="container-zen">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<FileText className="h-4 w-4" strokeWidth={2} />} label="Bandi pubblicati" value={formatNumber(buyer.n_bandi)} />
            <StatCard icon={<CheckCircle2 className="h-4 w-4" strokeWidth={2} />} label="Gare aggiudicate" value={formatNumber(buyer.n_aggiudicati)} />
            <StatCard icon={<CalendarClock className="h-4 w-4" strokeWidth={2} />} label="Con termine aperto" value={formatNumber(buyer.n_aperti)} />
            <StatCard
              icon={<TrendingDown className="h-4 w-4" strokeWidth={2} />}
              label="Ribasso mediano storico"
              value={buyer.ribasso_mediano != null ? formatPct(buyer.ribasso_mediano, { fraction: false }) : '—'}
            />
          </div>
          {/* riga secondaria: offerte medie / valore base / categoria / zona */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <StatCard
              icon={<Users2 className="h-4 w-4" strokeWidth={2} />}
              label="Offerte medie per gara"
              value={buyer.offerte_medie != null ? formatNumber(Math.round(Number(buyer.offerte_medie) * 10) / 10) : '—'}
            />
            <StatCard
              icon={<EuroIcon className="h-4 w-4" strokeWidth={2} />}
              label="Valore a base di gara"
              value={formatEuro(buyer.importo_base_totale, { compact: true })}
            />
            <StatCard
              icon={<Tag className="h-4 w-4" strokeWidth={2} />}
              label="Categorie distinte"
              value={formatNumber(buyer.cpv_distinti)}
            />
            <StatCard
              icon={<MapPin className="h-4 w-4" strokeWidth={2} />}
              label="Ambito"
              value={regNome || '—'}
            />
          </div>
        </div>
      </section>

      {/* A CHI AGGIUDICA */}
      {buyer.top_vincitori && buyer.top_vincitori.length > 0 && (
        <section className="pb-8 md:pb-12">
          <div className="container-zen max-w-5xl">
            <BuyerTopVincitori vincitori={buyer.top_vincitori} ente={ente} />
          </div>
        </section>
      )}

      {/* ULTIMI BANDI DELL'ENTE */}
      {bandiEnte.length > 0 && (
        <section className="pb-10 md:pb-12">
          <div className="container-zen">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Ultimi bandi di {ente}</h2>
            <p className="text-sm text-muted-foreground mb-6">Le gare pubblicate piu' di recente da questa stazione appaltante.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {bandiEnte.map((b) => (
                <BandoCard key={b.id} bando={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DATI PREMIUM → HUB */}
      <section className="pb-10 md:pb-12">
        <div className="container-zen max-w-5xl">
          <DatiPremiumLocked slug={params.slug} />
        </div>
      </section>

      {/* CROSS-LINK silo: categoria + regione */}
      {(cpvLabel || regSlug) && (
        <section className="pb-8">
          <div className="container-zen max-w-5xl">
            <nav aria-label="Esplora correlati" className="flex flex-wrap gap-2.5">
              {grp && cpvLabel && (
                <Link href={`/categoria/${grp}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Tag className="h-3 w-3" strokeWidth={2} /> Bandi {cpvLabel.toLowerCase()}
                </Link>
              )}
              {grp && (
                <Link href={`/classifiche/cpv-${cpvGroup(grp)}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Tag className="h-3 w-3" strokeWidth={2} /> Chi vince in questa categoria
                </Link>
              )}
              {regSlug && (
                <Link href={`/${regSlug}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <MapPin className="h-3 w-3" strokeWidth={2} /> Bandi in {regNome || (provCoerente?.regione ?? '')}
                </Link>
              )}
            </nav>
          </div>
        </section>
      )}

      {/* Trasparenza fonte */}
      <section className="pb-4">
        <div className="container-zen max-w-5xl">
          <div className="rounded-2xl border border-border bg-secondary/50 p-5">
            <p className="text-sm text-secondary-text">
              Dati raccolti da fonti pubbliche (TED, ANAC, portali appalti). I bandi
              di gara sono pubblici per legge (D.Lgs. 36/2023). Pubblichiamo solo dati
              di persone giuridiche, nessun dato personale di persone fisiche.
              Dettagli alla pagina <Link href="/legal/privacy" className="underline underline-offset-2">Privacy</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title={`Domande frequenti su ${ente}`} items={faqs} />
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
      <p className="text-xs text-muted-foreground mt-1 leading-tight">{label}</p>
    </div>
  );
}
