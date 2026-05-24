import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { getBandiByRegione } from '@/lib/supabase/queries/bandi';
import { REGIONI } from '@/lib/regioni';
import { formatNumber } from '@/lib/utils';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 3600;

const ogImage = ogImageUrl({
  title: 'Bandi e gare d\'appalto per regione',
  subtitle: 'Tutti i bandi pubblici italiani, regione per regione',
  kind: 'regione',
  label: 'regioni',
});

export const metadata: Metadata = {
  title: 'Bandi e gare d\'appalto per regione in Italia',
  description:
    'Esplora i bandi e le gare d\'appalto pubbliche regione per regione: Lombardia, Lazio, Campania, Sicilia e tutte le altre. Importi, scadenze e categorie CPV. Dati pubblici aggiornati.',
  alternates: { canonical: '/regioni' },
  openGraph: {
    title: 'Bandi e gare d\'appalto per regione in Italia',
    description:
      'Tutti i bandi pubblici italiani, regione per regione: importi, scadenze e categorie.',
    url: '/regioni',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Bandi per regione' }],
  },
  twitter: { card: 'summary_large_image', title: 'Bandi e gare d\'appalto per regione', images: [ogImage] },
};

export default async function RegioniPage() {
  const stats = await getBandiByRegione();
  const countByNome = new Map(stats.map((s) => [s.regione, s.cnt]));

  // Regioni con almeno un bando, ordinate per volume; le altre in coda alfabetica.
  const regioniConDati = REGIONI.map((r) => ({
    ...r,
    cnt: countByNome.get(r.nome) || 0,
  }))
    .filter((r) => r.cnt > 0)
    .sort((a, b) => b.cnt - a.cnt);

  const totaleConRegione = regioniConDati.reduce((s, r) => s + r.cnt, 0);

  const itemList = itemListLd(
    regioniConDati.map((r) => ({
      name: `Bandi e gare d'appalto ${r.nome}`,
      url: `${siteConfig.baseUrl}/${r.slug}`,
    })),
    'Bandi e gare d\'appalto per regione',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />

      <section className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16" aria-labelledby="regioni-hero-heading">
        <div className="container-zen">
          <div className="max-w-4xl">
            <BreadcrumbCantiere steps={[{ label: 'Regioni' }]} />
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Bandi pubblici · per regione</span>
            </p>
            <h1 id="regioni-hero-heading" className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.25rem, 5.5vw + 0.5rem, 5rem)' }}>
              Bandi e gare d&apos;appalto<br className="hidden sm:block" />{' '}
              <span className="italic font-black text-construction">regione per regione</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{formatNumber(totaleConRegione)}</span>
              bandi pubblici geolocalizzati in {regioniConDati.length} regioni italiane. Scegli la tua regione per vedere gare,
              importi a base d&apos;asta, scadenze e categorie CPV più frequenti sul territorio.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-8 md:pb-12">
        <div className="container-zen">
          <div className="rounded-3xl border border-border bg-secondary/30 p-7 md:p-8 max-w-3xl">
            <h2 className="text-base font-bold mb-3">Perché esplorare gli appalti per regione</h2>
            <p className="text-[15px] text-secondary-text leading-relaxed text-pretty">
              Il mercato degli appalti pubblici in Italia è fortemente territoriale: ogni regione ha le proprie stazioni
              appaltanti, una diversa intensità di spesa per opere e servizi e categorie merceologiche prevalenti. Aggregando
              i bandi per regione è possibile leggere a colpo d&apos;occhio dove si concentrano le gare, quali enti pubblicano
              di più e in quali ambiti — dai lavori di costruzione (CPV 45) ai servizi di architettura e ingegneria (CPV 71).
              I dati provengono da fonti pubbliche (TED, ANAC) e riguardano esclusivamente persone giuridiche.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container-zen">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-8">Tutte le regioni</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {regioniConDati.map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}`}
                className="group block card-zen card-hover p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground leading-snug">{r.nome}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground tabular-nums">
                      {formatNumber(r.cnt)} bandi pubblici
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground transition-all group-hover:border-foreground/40 group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
