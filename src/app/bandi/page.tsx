import type { Metadata } from 'next';
import Link from 'next/link';
import { Briefcase, Calendar, MapPin, EuroIcon, ArrowRight, Database } from 'lucide-react';
import { getBandi } from '@/lib/supabase/queries/bandi';
import { formatEuro, formatDate, truncate } from '@/lib/utils';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import { ogImageUrl } from '@/lib/seo/structured-data';

export const revalidate = 3600;

const bandiOg = ogImageUrl({
  title: 'Bandi di gara pubblici Italia',
  subtitle: 'Procedure aperte, ristrette, negoziate · ANAC + portali appalti regionali',
  kind: 'bando',
});

export const metadata: Metadata = {
  title: 'Bandi di gara pubblici Italia — Procedure aperte, ristrette, negoziate',
  description:
    'Aggregatore bandi di gara pubblici in Italia: procedure aperte, ristrette, negoziate. Dati open ANAC e portali appalti regionali aggiornati ogni giorno.',
  alternates: { canonical: '/bandi' },
  openGraph: {
    title: 'Bandi di gara pubblici Italia — Italia Cantieri',
    description:
      'Aggregatore bandi di gara pubblici Italia: procedure aperte, ristrette, negoziate. Dati open ANAC + portali appalti.',
    url: '/bandi',
    type: 'website',
    images: [{ url: bandiOg, width: 1200, height: 630, alt: 'Bandi di gara pubblici Italia' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bandi di gara pubblici Italia',
    description:
      'Aggregatore bandi di gara pubblici Italia: procedure aperte, ristrette, negoziate.',
    images: [bandiOg],
  },
};

export default async function BandiPage() {
  const { data: bandi, total } = await getBandi({ limit: 30 });

  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen">
        <BreadcrumbCantiere steps={[{ label: 'Bandi pubblici' }]} />
        <h1 className="heading-section mb-3">Bandi di gara pubblici</h1>
        <p className="body-default text-muted-foreground mb-10 max-w-2xl">
          {total > 0
            ? `${total.toLocaleString('it-IT')} bandi pubblici aggregati da open data ANAC e portali appalti regionali.`
            : 'Sezione in attivazione. I bandi di gara saranno disponibili dalle prossime release, aggregati da open data ANAC e portali appalti regionali.'}
        </p>

        {bandi.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Bandi in arrivo</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              La sezione bandi è in fase di attivazione. Stiamo integrando le pipeline da open data ANAC, SUAP regionali
              e portali appalti istituzionali.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" /> Fonti pianificate: ANAC, MEPA, portali regionali appalti
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bandi.map((b) => (
              <Link
                key={b.id}
                href={`/bando/${b.slug}`}
                className="group block rounded-2xl border border-border bg-white p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary border border-primary/10">
                    <Briefcase className="h-3 w-3" /> {b.tipo_procedura || 'Bando pubblico'}
                  </span>
                  {b.scadenza_offerte && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Scadenza: {formatDate(b.scadenza_offerte)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2">
                  {truncate(b.oggetto || 'Bando di gara', 200)}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {b.stazione_appaltante && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> {truncate(b.stazione_appaltante, 60)}
                    </span>
                  )}
                  {b.comune && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {b.comune} ({b.provincia})
                    </span>
                  )}
                  {b.importo_base && (
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <EuroIcon className="h-3.5 w-3.5" /> {formatEuro(b.importo_base, { compact: true })}
                    </span>
                  )}
                  <span className="ml-auto inline-flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Dettagli <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
