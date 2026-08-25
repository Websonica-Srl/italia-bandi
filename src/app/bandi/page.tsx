import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { getBandi, getBandiByCpvGroup, BandiFilters } from '@/lib/supabase/queries/bandi';
import { bandoTitolo } from '@/lib/utils';
import { proceduraLabel } from '@websonica/cantieri-core';
import { cpvGroupLabel } from '@websonica/cantieri-core';
import { provinciaFromSigla } from '@/lib/province';
import BandiListPaywall from '@/components/bandi/BandiListPaywall';
import FiltriBandi from '@/components/bandi/FiltriBandi';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';
import { isListaIndexable } from '@/lib/seo/indexable';

export const revalidate = 3600;

const PAGE_SIZE = 24;

const bandiOg = ogImageUrl({
  title: 'Bandi e gare d\'appalto pubbliche in Italia',
  subtitle: 'Procedure aperte, ristrette e negoziate · fonti ufficiali e pubbliche',
  kind: 'bando',
});

interface PageProps {
  searchParams: {
    q?: string;
    cpv?: string;
    procedura?: string;
    provincia?: string;
    regione?: string;
    importo_min?: string;
    importo_max?: string;
    aperti?: string;
    page?: string;
  };
}

/** È una "ricerca/filtro dinamica"? In tal caso noindex (anti-duplicazione SEO). */
function isFiltered(sp: PageProps['searchParams']): boolean {
  return Boolean(
    sp.q || sp.cpv || sp.procedura || sp.provincia || sp.regione || sp.importo_min || sp.importo_max || sp.aperti || sp.page,
  );
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const filtered = isFiltered(searchParams);
  return {
    title: 'Bandi e gare d\'appalto pubbliche in Italia — elenco completo',
    description:
      'Elenco dei bandi e delle gare d\'appalto pubbliche in Italia: filtra per categoria CPV, procedura, importo a base di gara e scadenza. Dati pubblici da fonti ufficiali e pubbliche.',
    alternates: { canonical: '/bandi' },
    // Le pagine di ricerca/filtro dinamiche non vanno indicizzate: la lista
    // base /bandi è la canonica indicizzabile — MA solo se isListaIndexable()
    // è true (decisione 2026-08-26, ondata 0: liste bandi fuori indice).
    robots:
      isListaIndexable() && !filtered
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title: 'Bandi e gare d\'appalto pubbliche in Italia',
      description: 'Elenco dei bandi pubblici italiani: filtra per categoria, procedura, importo e scadenza.',
      url: '/bandi',
      type: 'website',
      images: [{ url: bandiOg, width: 1200, height: 630, alt: 'Bandi e gare d\'appalto pubbliche in Italia' }],
    },
    twitter: { card: 'summary_large_image', title: 'Bandi e gare d\'appalto pubbliche in Italia', images: [bandiOg] },
  };
}

export default async function BandiPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const filters: BandiFilters = {
    q: searchParams.q,
    cpvGroup: searchParams.cpv,
    procedura: searchParams.procedura,
    provincia: searchParams.provincia,
    regione: searchParams.regione,
    importo_min: searchParams.importo_min ? Number(searchParams.importo_min) : undefined,
    importo_max: searchParams.importo_max ? Number(searchParams.importo_max) : undefined,
    soloAperti: searchParams.aperti === '1',
    limit: PAGE_SIZE,
    offset,
  };

  const [{ data: bandi, total }, cpvGroups] = await Promise.all([
    getBandi(filters),
    getBandiByCpvGroup(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = isFiltered(searchParams);

  // descrizione del filtro attivo
  const activeBits: string[] = [];
  if (searchParams.cpv) activeBits.push(cpvGroupLabel(searchParams.cpv));
  if (searchParams.procedura) activeBits.push(proceduraLabel(searchParams.procedura));
  if (searchParams.provincia) {
    const pInfo = provinciaFromSigla(searchParams.provincia);
    activeBits.push(pInfo ? `provincia di ${pInfo.nome}` : `provincia ${searchParams.provincia}`);
  }
  if (searchParams.regione) activeBits.push(searchParams.regione);
  if (searchParams.aperti === '1') activeBits.push('termine aperto');
  if (searchParams.q) activeBits.push(`"${searchParams.q}"`);

  const itemList = itemListLd(
    bandi.map((b) => ({
      name: bandoTitolo(b, cpvGroupLabel(b.cpv_principale)),
      url: `${siteConfig.baseUrl}/bandi/${b.slug}`,
    })),
    'Bandi e gare d\'appalto pubbliche',
  );

  // costruttore querystring per paginazione che preserva i filtri
  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (searchParams.q) qs.set('q', searchParams.q);
    if (searchParams.cpv) qs.set('cpv', searchParams.cpv);
    if (searchParams.procedura) qs.set('procedura', searchParams.procedura);
    if (searchParams.provincia) qs.set('provincia', searchParams.provincia);
    if (searchParams.regione) qs.set('regione', searchParams.regione);
    if (searchParams.importo_min) qs.set('importo_min', searchParams.importo_min);
    if (searchParams.importo_max) qs.set('importo_max', searchParams.importo_max);
    if (searchParams.aperti) qs.set('aperti', searchParams.aperti);
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/bandi?${s}` : '/bandi';
  };

  return (
    <>
      {!filtered && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
      )}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen">
          <BreadcrumbCantiere steps={[{ label: 'Bandi e gare d\'appalto' }]} />
          <h1 className="heading-section mb-3">Bandi e gare d&apos;appalto pubbliche</h1>
          <p className="body-default text-muted-foreground mb-8 max-w-2xl">
            {total > 0
              ? `${total.toLocaleString('it-IT')} bandi pubblici${activeBits.length ? ` — ${activeBits.join(', ')}` : ''}, aggregati da fonti ufficiali e pubbliche.`
              : 'Nessun bando corrisponde ai filtri selezionati.'}
          </p>

          <div className="grid lg:grid-cols-[320px_1fr] gap-6 md:gap-8 items-start">
            <aside className="lg:sticky lg:top-28">
              <FiltriBandi cpvOptions={cpvGroups} />
            </aside>

            <div>
              {bandi.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.25} />
                  <h2 className="text-xl font-semibold mb-2">Nessun risultato</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Prova ad allargare i filtri o a cercare un altro termine.
                  </p>
                  <Link href="/bandi" className="btn-primary inline-flex">Azzera i filtri</Link>
                </div>
              ) : (
                <>
                  {/* Soft-paywall: prime 6 card nitide, resto sfocato + CTA
                      registrazione. Filtri e paginazione restano funzionanti. */}
                  <BandiListPaywall
                    bandi={bandi}
                    total={total}
                    gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
                  />

                  {/* Paginazione */}
                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginazione bandi">
                      {page > 1 && (
                        <Link href={buildPageHref(page - 1)} rel="prev" className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:border-foreground/40 transition-colors">
                          ← Precedente
                        </Link>
                      )}
                      <span className="px-4 py-2 text-sm text-muted-foreground tabular-nums">
                        Pagina {page} di {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link href={buildPageHref(page + 1)} rel="next" className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium hover:border-foreground/40 transition-colors">
                          Successiva →
                        </Link>
                      )}
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
