import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Briefcase, Hash, FileText, EuroIcon, Database } from 'lucide-react';
import { getBandoBySlug } from '@/lib/supabase/queries/bandi';
import { formatDate, formatEuro } from '@/lib/utils';
import { bandoLd, safeJsonLd } from '@/lib/seo/structured-data';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const b = await getBandoBySlug(params.slug);
  if (!b) return { title: 'Bando non trovato' };
  return {
    title: `${b.oggetto?.slice(0, 80) || 'Bando di gara'} — Italia Cantieri`,
    description: (b.descrizione_completa || b.oggetto || '').slice(0, 160),
    alternates: { canonical: `/bando/${b.slug}` },
  };
}

export default async function BandoPage({ params }: PageProps) {
  const b = await getBandoBySlug(params.slug);
  if (!b) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(bandoLd(b)) }}
      />
      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-5xl">
          <BreadcrumbCantiere steps={[{ label: 'Bandi', href: '/bandi' }, { label: b.cig || b.slug }]} />

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                <Briefcase className="h-3 w-3" /> {b.tipo_procedura || 'Bando di gara'}
              </span>
              {b.stato && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground px-3 py-1 text-xs font-medium border border-border">
                  Stato: {b.stato}
                </span>
              )}
            </div>
            <h1 className="heading-section mb-3">{b.oggetto}</h1>
            {b.stazione_appaltante && (
              <p className="text-muted-foreground">Stazione appaltante: <strong>{b.stazione_appaltante}</strong></p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
                <FileText className="h-4 w-4" /> Identificativi
              </h2>
              <dl className="space-y-3 text-sm">
                {b.cig && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground inline-flex items-center gap-1"><Hash className="h-3 w-3" />CIG</dt><dd className="font-medium">{b.cig}</dd></div>
                )}
                {b.cup && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">CUP</dt><dd className="font-medium">{b.cup}</dd></div>
                )}
                {b.numero_bando && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Numero bando</dt><dd className="font-medium">{b.numero_bando}</dd></div>
                )}
                {b.cpv_principale && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">CPV principale</dt><dd className="font-medium">{b.cpv_principale}</dd></div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
                <EuroIcon className="h-4 w-4" /> Dati economici
              </h2>
              <dl className="space-y-3 text-sm">
                {b.importo_base && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Importo base</dt><dd className="font-semibold text-lg">{formatEuro(b.importo_base)}</dd></div>
                )}
                {b.importo_aggiudicazione && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Aggiudicazione</dt><dd className="font-medium">{formatEuro(b.importo_aggiudicazione)}</dd></div>
                )}
                {b.data_pubblicazione && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Pubblicato</dt><dd className="font-medium">{formatDate(b.data_pubblicazione)}</dd></div>
                )}
                {b.scadenza_offerte && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Scadenza</dt><dd className="font-medium">{formatDate(b.scadenza_offerte)}</dd></div>
                )}
                {b.data_aggiudicazione && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Aggiudicato il</dt><dd className="font-medium">{formatDate(b.data_aggiudicazione)}</dd></div>
                )}
              </dl>
            </div>
          </div>

          {b.descrizione_completa && (
            <div className="rounded-2xl border border-border bg-white p-6 mb-10">
              <h2 className="text-base font-semibold mb-3">Descrizione completa</h2>
              <p className="text-sm text-secondary-text whitespace-pre-line leading-relaxed">{b.descrizione_completa}</p>
            </div>
          )}

          {(b.comune || b.aggiudicatario_ragione_sociale_raw) && (
            <div className="rounded-2xl border border-border bg-white p-6 mb-10">
              {b.comune && (
                <p className="text-sm mb-2 inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" /> {b.comune} ({b.provincia}), {b.regione}
                </p>
              )}
              {b.aggiudicatario_ragione_sociale_raw && (
                <p className="text-sm text-muted-foreground">
                  Aggiudicatario: <strong className="text-foreground">{b.aggiudicatario_ragione_sociale_raw}</strong>
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold mb-2 inline-flex items-center gap-2">
              <Database className="h-4 w-4" /> Trasparenza fonte
            </h2>
            <p className="text-sm text-secondary-text">
              Dati raccolti da fonti pubbliche open data. Trattamento conforme ad Art. 6.1.f GDPR (legittimo interesse).
              Maggiori dettagli alla pagina <Link href="/come-trattiamo-i-dati" className="underline">Trasparenza dati</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
