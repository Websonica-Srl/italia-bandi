import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Building2, Briefcase, Hash, FileText, EuroIcon, Database, Tag, MapPin } from 'lucide-react';
import { getBandoBySlug, getAggiudicatariByBando } from '@/lib/supabase/queries/bandi';
import { formatDate, formatEuro, bandoTitolo, truncate } from '@/lib/utils';
import { proceduraLabel } from '@websonica/cantieri-core';
import { cpvGroupLabel, cpvGroup } from '@/lib/bandi-taxonomy-extra';
import { bandoLd, faqLd, safeJsonLd } from '@/lib/seo/structured-data';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import BandoScadenzaBadge from '@/components/bandi/BandoScadenzaBadge';
import AggiudicatarioBox from '@/components/bandi/AggiudicatarioBox';
import DatiPremiumLocked from '@/components/bandi/DatiPremiumLocked';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const b = await getBandoBySlug(params.slug);
  if (!b) return { title: 'Bando non trovato' };
  const cpvLabel = cpvGroupLabel(b.cpv_principale);
  const titolo = bandoTitolo(b, cpvLabel);
  const desc =
    (b.descrizione_completa && b.descrizione_completa.length > 30
      ? b.descrizione_completa
      : `${titolo}. Stazione appaltante: ${b.stazione_appaltante || 'n.d.'}. Importo a base di gara: ${formatEuro(b.importo_base)}. ${proceduraLabel(b.tipo_procedura)}.`
    ).slice(0, 160);
  return {
    title: `${truncate(titolo, 70)} — Bando di gara`,
    description: desc,
    alternates: { canonical: `/bandi/${b.slug}` },
    openGraph: {
      title: truncate(titolo, 90),
      description: desc,
      url: `/bandi/${b.slug}`,
      type: 'article',
    },
  };
}

const bandoFaq = (titolo: string, ente: string, cpvLabel: string) => [
  {
    q: 'Chi è la stazione appaltante di questo bando?',
    a: `La stazione appaltante è ${ente}. È l'amministrazione pubblica che ha avviato la procedura di affidamento.`,
  },
  {
    q: 'A quale categoria appartiene questa gara?',
    a: `La gara rientra nella categoria CPV "${cpvLabel}". Il CPV (Common Procurement Vocabulary) è la classificazione europea dell'oggetto dell'appalto.`,
  },
  {
    q: 'Come faccio a partecipare a questo bando?',
    a: 'La partecipazione avviene tramite la piattaforma telematica della stazione appaltante entro il termine indicato. La documentazione di gara completa è disponibile registrandosi al network ItaliaProgettisti.',
  },
];

export default async function BandoPage({ params }: PageProps) {
  const b = await getBandoBySlug(params.slug);
  if (!b) notFound();

  const aggiudicatari = await getAggiudicatariByBando(b.id);

  const cpvLabel = cpvGroupLabel(b.cpv_principale);
  const titolo = bandoTitolo(b, cpvLabel);
  const grp = cpvGroup(b.cpv_principale);
  const descrizione =
    b.descrizione_completa && b.descrizione_completa.length > 30
      ? b.descrizione_completa
      : `${titolo}. ${proceduraLabel(b.tipo_procedura)}. Stazione appaltante: ${b.stazione_appaltante || 'n.d.'}.`;
  const hasAggiudicazione = !!b.aggiudicatario_ragione_sociale_raw || aggiudicatari.length > 0;
  const faqs = bandoFaq(titolo, b.stazione_appaltante || 'n.d.', cpvLabel);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(bandoLd(b, titolo, descrizione)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd(faqs)) }} />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-5xl">
          <BreadcrumbCantiere
            steps={[
              { label: 'Bandi', href: '/bandi' },
              ...(grp ? [{ label: cpvLabel, href: `/categoria/${grp}` }] : []),
              { label: b.cig || truncate(titolo, 40) },
            ]}
          />

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground border border-border">
                <Briefcase className="h-3 w-3" strokeWidth={2} /> {proceduraLabel(b.tipo_procedura)}
              </span>
              {grp && (
                <Link
                  href={`/categoria/${grp}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground border border-border hover:border-foreground/40 transition-colors"
                >
                  <Tag className="h-3 w-3" strokeWidth={2} /> {cpvLabel}
                </Link>
              )}
              <BandoScadenzaBadge scadenza={b.scadenza_offerte} />
            </div>
            <h1 className="heading-section mb-3">{titolo}</h1>
            {b.stazione_appaltante && (
              <p className="text-muted-foreground inline-flex items-center gap-1.5">
                <Building2 className="h-4 w-4" strokeWidth={1.75} /> Stazione appaltante:{' '}
                <strong className="text-foreground">{b.stazione_appaltante}</strong>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
                <FileText className="h-4 w-4" strokeWidth={2} /> Identificativi
              </h2>
              <dl className="space-y-3 text-sm">
                {b.cig && <Row label={<><Hash className="h-3 w-3 inline" /> CIG</>} value={b.cig} mono />}
                {b.cup && <Row label="CUP" value={b.cup} mono />}
                {b.numero_bando && <Row label="Numero bando" value={b.numero_bando} />}
                {b.cpv_principale && <Row label="CPV principale" value={b.cpv_principale} mono />}
                {b.cpv_codes && b.cpv_codes.length > 1 && (
                  <Row label="Altri CPV" value={b.cpv_codes.slice(1).join(', ')} mono />
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-base font-semibold mb-4 inline-flex items-center gap-2">
                <EuroIcon className="h-4 w-4" strokeWidth={2} /> Dati economici e date
              </h2>
              <dl className="space-y-3 text-sm">
                {b.importo_base != null && (
                  <div className="flex gap-3">
                    <dt className="w-40 flex-shrink-0 text-muted-foreground">Importo base</dt>
                    <dd className="font-semibold text-lg tabular-nums">{formatEuro(b.importo_base)}</dd>
                  </div>
                )}
                {b.importo_aggiudicazione != null && <Row label="Aggiudicazione" value={formatEuro(b.importo_aggiudicazione)} />}
                {b.data_pubblicazione && <Row label={<><Calendar className="h-3 w-3 inline" /> Pubblicato</>} value={formatDate(b.data_pubblicazione)} />}
                {b.scadenza_offerte && <Row label="Scadenza offerte" value={formatDate(b.scadenza_offerte)} />}
                {b.data_aggiudicazione && <Row label="Aggiudicato il" value={formatDate(b.data_aggiudicazione)} />}
              </dl>
            </div>
          </div>

          {b.descrizione_completa && b.descrizione_completa.length > 30 && (
            <div className="rounded-2xl border border-border bg-white p-6 mb-10">
              <h2 className="text-base font-semibold mb-3">Oggetto della gara</h2>
              <p className="text-sm text-secondary-text whitespace-pre-line leading-relaxed">{b.descrizione_completa}</p>
            </div>
          )}

          {/* AGGIUDICATARIO (solo PG) */}
          {hasAggiudicazione && (
            <div className="mb-10">
              <AggiudicatarioBox
                aggiudicatari={aggiudicatari}
                fallbackRaw={b.aggiudicatario_ragione_sociale_raw}
                importoAggiudicazione={b.importo_aggiudicazione}
              />
            </div>
          )}

          {/* DATI PREMIUM (CTA → HUB) */}
          <div className="mb-10">
            <DatiPremiumLocked slug={b.slug} />
          </div>

          {/* Trasparenza fonte */}
          <div className="rounded-2xl border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold mb-2 inline-flex items-center gap-2">
              <Database className="h-4 w-4" strokeWidth={2} /> Trasparenza fonte
            </h2>
            <p className="text-sm text-secondary-text">
              Dati raccolti da fonti pubbliche (TED, ANAC, portali appalti). I bandi di gara sono pubblici per legge
              (D.Lgs. 36/2023). Trattamento conforme al GDPR: pubblichiamo solo dati di persone giuridiche.
              Maggiori dettagli alla pagina <Link href="/legal/privacy" className="underline underline-offset-2">Privacy</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value, mono = false }: { label: React.ReactNode; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt className="w-40 flex-shrink-0 text-muted-foreground inline-flex items-center gap-1">{label}</dt>
      <dd className={`font-medium break-words ${mono ? 'tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}
