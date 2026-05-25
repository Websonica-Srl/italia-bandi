import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Trophy, Tag, MapPin } from 'lucide-react';
import {
  getLeaderboard,
  getLeaderboardSegments,
} from '@/lib/supabase/queries/intelligence';
import { cpvGroupLabel } from '@/lib/bandi-taxonomy-extra';
import { regioneSlug } from '@/lib/regioni';
import { formatNumber } from '@/lib/utils';
import {
  itemListLd,
  ogImageUrl,
  safeJsonLd,
} from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import LeaderboardTable from '@/components/bandi/LeaderboardTable';
import FAQ from '@/components/cantieri/FAQ';

export const revalidate = 3600;

const TITLE = 'Classifiche dei vincitori delle gare d\'appalto in Italia';
const DESCRIPTION =
  'Chi vince di piu\' le gare d\'appalto pubbliche in Italia: le classifiche delle imprese vincitrici ricorrenti, per categoria CPV e per regione. Dati pubblici da TED e ANAC.';

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = ogImageUrl({
    title: 'Classifiche vincitori',
    subtitle: 'Chi vince di piu\' le gare d\'appalto in Italia',
    kind: 'stats',
    label: 'gare vinte',
  });
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: '/classifiche' },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: '/classifiche',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: TITLE }],
    },
    twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImage] },
  };
}

const faqs = [
  {
    q: 'Come sono calcolate queste classifiche?',
    a: 'Contiamo, per ogni impresa, il numero di gare d\'appalto pubbliche aggiudicate sul nostro dataset (oltre 36.000 aggiudicazioni da fonti TED e ANAC). Le classifiche raggruppano i vincitori per categoria CPV e per regione prevalente. Mostriamo solo ragioni sociali di persone giuridiche, nel rispetto del GDPR.',
  },
  {
    q: 'Cosa significa "in RTI" nelle classifiche?',
    a: 'Indica la quota di gare che un\'impresa ha vinto in raggruppamento temporaneo, cioe\' insieme ad altre imprese con un\'unica offerta. Sul nostro dataset meta\' delle gare si aggiudica in raggruppamento.',
  },
  {
    q: 'Posso vedere il dettaglio delle gare vinte da un\'impresa?',
    a: 'Il track record completo di un\'impresa e gli strumenti per confrontarti con i concorrenti sono disponibili sul network ItaliaProgettisti. La registrazione di base e\' gratuita.',
  },
];

export default async function ClassifichePage() {
  const [topGlobale, segments] = await Promise.all([
    getLeaderboard({ limit: 20 }),
    getLeaderboardSegments(),
  ]);

  // Segmenti con almeno 5 imprese (anti-thin): generano una pagina sensata.
  const cpvSegments = segments.cpv.filter((s) => s.cnt >= 5).slice(0, 24);
  const regSegments = segments.regioni.filter((s) => s.cnt >= 5);

  const itemList = itemListLd(
    topGlobale.map((r) => ({
      name: `${r.firm_name} — ${formatNumber(r.gare_vinte)} gare vinte`,
      url: `${siteConfig.baseUrl}/classifiche`,
    })),
    'Classifica imprese per gare d\'appalto vinte in Italia',
  );

  return (
    <>
      {/* BreadcrumbList JSON-LD emesso da <BreadcrumbCantiere> (no doppioni). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      {/* HERO — copy 1.7 */}
      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="cls-hero">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere steps={[{ label: 'Classifiche' }]} />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <Trophy className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Il dato di rete, in chiaro</span>
            </p>
            <h1 id="cls-hero" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Chi vince di piu&apos; le gare d&apos;appalto in{' '}
              <span className="italic font-black text-construction">Italia</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              Le classifiche dei vincitori ricorrenti, per categoria e per zona. Un
              assaggio gratuito del nostro mestiere: leggere 36.254 aggiudicazioni
              come una partita, non come un elenco.
            </p>
            <p className="mt-5 text-base text-secondary-text max-w-3xl leading-relaxed">
              Su 11.901 imprese che hanno vinto almeno una gara, 200 ne hanno vinte
              piu&apos; di venti. La piu&apos; presente ne ha vinte 238. Questi sono i nomi con
              cui, prima o poi, ti troverai a competere.
            </p>
          </div>
        </div>
      </section>

      {/* CLASSIFICA GLOBALE */}
      <section className="pb-12 md:pb-16">
        <div className="container-zen max-w-5xl">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            Le imprese che vincono di piu&apos; in Italia
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Classifica generale per numero di gare d&apos;appalto pubbliche aggiudicate.
          </p>
          <LeaderboardTable rows={topGlobale} ctaCampaign="leaderboard_index" unlockNoun="imprese in classifica" />
        </div>
      </section>

      {/* PER CATEGORIA */}
      {cpvSegments.length > 0 && (
        <section className="pb-12 md:pb-16">
          <div className="container-zen max-w-5xl">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Classifiche per categoria di appalto
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Chi domina ogni categoria CPV: i vincitori ricorrenti per oggetto di gara.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {cpvSegments.map((s) => (
                <Link
                  key={s.key}
                  href={`/classifiche/cpv-${s.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Tag className="h-3 w-3" strokeWidth={2} />
                  {cpvGroupLabel(s.key)}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(s.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PER REGIONE */}
      {regSegments.length > 0 && (
        <section className="pb-12 md:pb-16">
          <div className="container-zen max-w-5xl">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
              Classifiche per regione
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Le imprese che vincono di piu&apos; nella tua regione, prima di sfidarle o di allearti.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {regSegments.map((s) => (
                <Link
                  key={s.key}
                  href={`/classifiche/regione-${regioneSlug(s.key)}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <MapPin className="h-3 w-3" strokeWidth={2} />
                  {s.key}
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(s.cnt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SMARCO + CTA */}
      <section className="py-12 md:py-16 bg-secondary/30 border-t border-border">
        <div className="container-zen max-w-3xl text-center">
          <p className="text-lg md:text-xl font-light text-secondary-text mb-6 text-pretty">
            Nessun elenco di bandi ti dice chi sta vincendo. Questa classifica si&apos;.
          </p>
          <a
            href="https://www.italiaprogettisti.com/register?utm_source=bandigaredappalto&utm_medium=referral&utm_campaign=leaderboard&intent=bidder-leaderboard"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Crea il tuo profilo e confrontati con i leader
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-zen max-w-4xl">
          <FAQ title="Domande frequenti sulle classifiche" items={faqs} />
        </div>
      </section>
    </>
  );
}
