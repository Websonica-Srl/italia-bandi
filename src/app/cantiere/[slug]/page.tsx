import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, FileText, Hash, Tag, Database, Building2 } from 'lucide-react';
import { getCantiereBySlug, countFirmsByComune } from '@/lib/supabase/queries/cantieri';
import { formatDate, formatEuro, formatNumber, regioneSlug, slugify } from '@/lib/utils';
import { provinciaSlugFromCode, provinciaNameFromCode } from '@/lib/province';
import { cantiereLd, safeJsonLd, ogImageUrl } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import MappaCantiereSingolo from '@/components/cantieri/MappaCantiereSingolo';
import RichiediRimozioneCTA from '@/components/cantieri/RichiediRimozioneCTA';
import CrossLinkCorrelati from '@/components/cantieri/CrossLinkCorrelati';
import FAQ from '@/components/cantieri/FAQ';
import UnlockPremiumCTA from '@/components/cantieri/UnlockPremiumCTA';
import DatiPremiumLocked from '@/components/cantieri/DatiPremiumLocked';
import CantieriSimiliVicini from '@/components/cantieri/CantieriSimiliVicini';
import ScrollProgress from '@/components/cantieri/ScrollProgress';
import DividerOrnament from '@/components/cantieri/DividerOrnament';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const c = await getCantiereBySlug(params.slug);
  if (!c) return { title: 'Cantiere non trovato' };
  const tipoTitolo = c.tipo_titolo || 'Cantiere edilizio';
  const title = `${tipoTitolo} a ${c.comune} (${c.provincia})${c.protocollo ? ` — Prot. ${c.protocollo}` : ''}`;
  const importo = c.importo_lavori ? ` Importo lavori ${formatEuro(c.importo_lavori, { compact: true })}.` : '';
  // Description policy: descrizione (se diversa dal tipo_titolo) ha priorità,
  // altrimenti compone descrittiva con comune, regione, importo.
  const hasMeaningfulDesc =
    c.descrizione && c.descrizione.trim().toLowerCase() !== tipoTitolo.trim().toLowerCase();
  const description = (
    hasMeaningfulDesc
      ? `${c.descrizione} — ${tipoTitolo} a ${c.comune} (${c.provincia}, ${c.regione}).${importo} Dati ufficiali dall'albo pretorio comunale.`
      : `${tipoTitolo} pubblicato a ${c.comune} (${c.provincia}, ${c.regione}).${importo} Dati ufficiali dall'albo pretorio. Scopri dettagli, mappa, fonti e contatti professionisti collegati.`
  ).slice(0, 160);
  const ogImage = ogImageUrl({
    title: `${tipoTitolo} a ${c.comune}`,
    subtitle: c.protocollo
      ? `Prot. ${c.protocollo} · ${c.provincia}, ${c.regione}`
      : `${c.provincia}, ${c.regione}`,
    kind: 'cantiere',
    ...(c.importo_lavori
      ? { count: formatEuro(c.importo_lavori, { compact: true }), label: 'importo lavori' }
      : {}),
  });
  return {
    title,
    description,
    alternates: { canonical: `/cantiere/${c.slug}` },
    openGraph: {
      title,
      description,
      url: `/cantiere/${c.slug}`,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function CantierePage({ params }: PageProps) {
  const c = await getCantiereBySlug(params.slug);
  if (!c) notFound();

  const indirizzoCompleto = [c.indirizzo, c.civico].filter(Boolean).join(' ');
  const firmCount = await countFirmsByComune(c.comune);

  const cantiereFaq = [
    {
      q: 'Chi e il progettista o l\'impresa che lavora su questo cantiere?',
      a: `I dati di progettisti, studi e imprese collegati ai cantieri di ${c.comune} sono disponibili nel network ItaliaProgettisti. Iscriviti gratis per consultare i profili professionali della zona e attivare il contatto diretto.`,
    },
    {
      q: 'Cosa significa "tipo titolo" PDC, SCIA, CILA?',
      a: 'PDC = Permesso di Costruire (interventi rilevanti, autorizzazione preventiva). SCIA = Segnalazione Certificata di Inizio Attivita (interventi minori, comunicazione asseverata). CILA = Comunicazione Inizio Lavori Asseverata (manutenzione straordinaria con asseverazione tecnica).',
    },
    {
      q: 'I dati di questo cantiere sono verificati?',
      a: `Si. I dati provengono direttamente dall'albo pretorio del Comune di ${c.comune} o dal portale open data della Pubblica Amministrazione locale. La fonte e la data di pubblicazione originale sono dichiarate piu sopra nella scheda.`,
    },
    {
      q: 'Sono il titolare del cantiere. Come posso chiedere modifiche o rimozione?',
      a: 'Usa il pulsante "Richiedi rettifica o rimozione" qui sotto, oppure scrivi al nostro DPO. Le richieste vengono valutate entro 30 giorni come previsto dal GDPR (Art. 15-22).',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(cantiereLd(c)) }}
      />
      <ScrollProgress />
      <section className="pt-32 md:pt-40 pb-10 md:pb-14 relative isolate">
        {/* Soft gradient backdrop hero */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[420px] -z-10 bg-gradient-to-b from-secondary/60 via-background to-background"
        />
        <div
          aria-hidden="true"
          className="absolute right-[-10%] top-12 h-[320px] w-[520px] -z-10 rounded-full bg-construction/[0.05] blur-3xl pointer-events-none"
        />

        <div className="container-zen max-w-5xl">
          <BreadcrumbCantiere
            steps={[
              { label: 'Regioni', href: '/regioni' },
              { label: c.regione, href: `/${regioneSlug(c.regione)}` },
              { label: `Provincia di ${provinciaNameFromCode(c.provincia)}`, href: `/${regioneSlug(c.regione)}/${provinciaSlugFromCode(c.provincia)}` },
              { label: c.comune, href: `/comune/${slugify(c.comune)}` },
              { label: c.protocollo || c.slug },
            ]}
          />

          {/* HEADER premium */}
          <div className="mb-8 md:mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm">
                <FileText className="h-3 w-3" strokeWidth={2.5} /> {c.tipo_titolo || 'Cantiere edilizio'}
              </span>
              {c.stato && (
                <span className="eyebrow eyebrow-construction">
                  <span>Stato · {c.stato}</span>
                </span>
              )}
              {c.categorie?.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full bg-background text-foreground/80 px-3 py-1 text-xs border border-border"
                >
                  <Tag className="h-3 w-3" /> {cat}
                </span>
              ))}
            </div>
            <h1
              className="font-black tracking-[-0.035em] leading-[1.05] mb-5 text-foreground text-balance break-words"
              style={{ fontSize: 'clamp(1.65rem, 2.6vw + 0.8rem, 2.75rem)' }}
            >
              {c.descrizione || `${c.tipo_titolo || 'Cantiere edilizio'} a ${c.comune}`}
            </h1>
            <p className="body-default text-muted-foreground inline-flex items-center gap-2 flex-wrap">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              {indirizzoCompleto ? `${indirizzoCompleto}, ` : ''}
              <Link
                href={`/comune/${slugify(c.comune)}`}
                className="text-foreground hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm font-semibold"
              >
                {c.comune}
              </Link>{' '}
              <span className="text-muted-foreground/80">({c.provincia}, {c.regione})</span>
            </p>
          </div>

          {/* R1 HIGH: CTA SBLOCCA - ABOVE-THE-FOLD */}
          <div className="mb-8 md:mb-10">
            <UnlockPremiumCTA slug={c.slug} comune={c.comune} />
          </div>

          {/* MAPPA */}
          <div className="mb-10">
            <MappaCantiereSingolo coordinate={c.coordinate} indirizzo={indirizzoCompleto} comune={c.comune} />
          </div>

          {/* GRID DATI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-10">
            <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-diffusion transition-all duration-300 hover:border-foreground/20">
              <h2 className="text-base font-bold mb-4 inline-flex items-center gap-2 tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-foreground/5">
                  <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                Dati amministrativi
              </h2>
              <dl className="space-y-3 text-sm">
                {c.protocollo && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground inline-flex items-center gap-1"><Hash className="h-3 w-3" />Protocollo</dt><dd className="font-medium">{c.protocollo}</dd></div>
                )}
                {c.tipo_titolo && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Tipo titolo</dt><dd className="font-medium">{c.tipo_titolo}</dd></div>
                )}
                {c.data_pubblicazione && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Pubblicazione</dt><dd className="font-medium">{formatDate(c.data_pubblicazione)}</dd></div>
                )}
                {c.data_rilascio && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Rilascio</dt><dd className="font-medium">{formatDate(c.data_rilascio)}</dd></div>
                )}
                {c.data_inizio_lavori && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Inizio lavori</dt><dd className="font-medium">{formatDate(c.data_inizio_lavori)}</dd></div>
                )}
                {c.data_fine_lavori_prevista && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Fine prevista</dt><dd className="font-medium">{formatDate(c.data_fine_lavori_prevista)}</dd></div>
                )}
                {c.cap && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">CAP</dt><dd className="font-medium">{c.cap}</dd></div>
                )}
                {c.codice_istat && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Codice ISTAT</dt><dd className="font-medium">{c.codice_istat}</dd></div>
                )}
              </dl>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 md:p-7 shadow-diffusion transition-all duration-300 hover:border-foreground/20">
              <h2 className="text-base font-bold mb-4 inline-flex items-center gap-2 tracking-tight">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-construction/15 text-construction">
                  <Building2 className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                Dati tecnici ed economici
              </h2>
              <dl className="space-y-3 text-sm">
                {c.importo_lavori ? (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Importo lavori</dt><dd className="font-semibold text-lg tabular-nums">{formatEuro(c.importo_lavori)}</dd></div>
                ) : (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Importo lavori</dt><dd className="text-muted-foreground">non dichiarato</dd></div>
                )}
                {c.superficie_mq && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Superficie</dt><dd className="font-medium tabular-nums">{formatNumber(c.superficie_mq)} m²</dd></div>
                )}
                {c.cubatura_mc && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Cubatura</dt><dd className="font-medium tabular-nums">{formatNumber(c.cubatura_mc)} m³</dd></div>
                )}
                {c.unita_abitative !== null && c.unita_abitative !== undefined && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Unita abitative</dt><dd className="font-medium">{c.unita_abitative}</dd></div>
                )}
                {c.quartiere && (
                  <div className="flex gap-3"><dt className="w-40 flex-shrink-0 text-muted-foreground">Quartiere</dt><dd className="font-medium">{c.quartiere}</dd></div>
                )}
              </dl>
            </div>
          </div>

          <DividerOrnament variant="line" spacing="tight" />

          {/* R2 HIGH: DATI PREMIUM LOCKED PREVIEW */}
          <div className="mb-10">
            <DatiPremiumLocked slug={c.slug} comune={c.comune} />
          </div>

          {/* CANTIERI SIMILI VICINI (engagement + crosslink SEO) */}
          <div className="mb-10">
            <CantieriSimiliVicini currentSlug={c.slug} comune={c.comune} />
          </div>

          {/* TRASPARENZA + OPT-OUT — un'unica card discreta (fonte minima + diritti) */}
          <div className="mb-10">
            <p className="text-xs text-secondary-text mb-3">
              Fonte: {c.fonte_tipo || 'open data PA'}
              {c.fonte_pubblicazione_data ? ` · pubblicato il ${formatDate(c.fonte_pubblicazione_data)}` : ''}
              {' · '}dati pubblici trattati nel rispetto del GDPR.
            </p>
            <RichiediRimozioneCTA cantiereId={c.id} protocollo={c.protocollo || undefined} comune={c.comune} />
          </div>

          {/* CROSS LINK (R9 potenziato) */}
          <CrossLinkCorrelati comune={c.comune} countImprese={firmCount} cantiereSlug={c.slug} />

          <FAQ
            title="Domande frequenti su questo cantiere"
            items={cantiereFaq}
          />
        </div>
      </section>
    </>
  );
}
