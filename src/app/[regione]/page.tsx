import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ArrowRight, Bell, ShieldCheck } from 'lucide-react';
import {
  getCantieri,
  getCantieriByProvincia,
  getCantieriByRegione,
  getRegioneStats,
} from '@/lib/supabase/queries/cantieri';
import { regioneSlug, formatNumber } from '@/lib/utils';
import { provinciaSlugFromCode, provinciaNameFromCode } from '@/lib/province';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import StatsBox from '@/components/cantieri/StatsBox';
import CantiereCard from '@/components/cantieri/CantiereCard';
import BarChart from '@/components/cantieri/BarChart';
import FAQ from '@/components/cantieri/FAQ';
import DividerOrnament from '@/components/cantieri/DividerOrnament';
import { ogImageUrl } from '@/lib/seo/structured-data';

export const revalidate = 3600;

interface PageProps {
  params: { regione: string };
}

/** Pre-render top 20 regioni a build time, le altre on-demand. */
export async function generateStaticParams() {
  const list = await getCantieriByRegione();
  return list.slice(0, 20).map((r) => ({ regione: regioneSlug(r.regione) }));
}

async function resolveRegione(slug: string): Promise<string | null> {
  const all = await getCantieriByRegione();
  const target = slug.toLowerCase();
  const hit = all.find((r) => regioneSlug(r.regione) === target);
  return hit ? hit.regione : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const reg = await resolveRegione(params.regione);
  if (!reg) return { title: 'Regione non trovata' };
  // Carica stats per popolare l'OG image
  const stats = await getRegioneStats(reg);
  const title = `Cantieri edilizi in ${reg} — Permessi PDC, SCIA e CILA`;
  const description = `Tutti i cantieri attivi in ${reg}: permessi di costruire, SCIA, CILA e bandi pubblici aggiornati. Aggregati da albi pretori e open data PA.`;
  const ogImage = ogImageUrl({
    title: `Cantieri edilizi in ${reg}`,
    subtitle: `${stats.province} province · ${stats.comuni} Comuni · Aggiornati ogni giorno`,
    kind: 'regione',
    count: formatNumber(stats.totale),
    label: 'cantieri tracciati',
  });
  return {
    title,
    description,
    alternates: { canonical: `/${params.regione}` },
    openGraph: {
      title: `Cantieri edilizi in ${reg} — Italia Cantieri`,
      description,
      url: `/${params.regione}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Cantieri edilizi in ${reg}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Cantieri edilizi in ${reg}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function RegionePage({ params }: PageProps) {
  const regioneNome = await resolveRegione(params.regione);
  if (!regioneNome) notFound();

  const [stats, province, recenti] = await Promise.all([
    getRegioneStats(regioneNome),
    getCantieriByProvincia(regioneNome),
    getCantieri({ regione: regioneNome, limit: 20, orderBy: 'data_pubblicazione' }),
  ]);

  const regioneFaq = [
    {
      q: `Quanti cantieri sono tracciati in ${regioneNome}?`,
      a: `Attualmente abbiamo ${formatNumber(stats.totale)} cantieri attivi tracciati in ${regioneNome}, distribuiti su ${stats.province} province e ${stats.comuni} Comuni. Il numero cresce ogni settimana con l'importazione automatica dai portali ufficiali.`,
    },
    {
      q: `Come posso intercettare i nuovi cantieri in ${regioneNome}?`,
      a: `Iscrivendoti gratis al network ItaliaProgettisti puoi attivare alert email personalizzati: ricevi notifiche immediate quando viene pubblicato un nuovo permesso di costruire o una SCIA in ${regioneNome}, filtrabili per provincia, Comune, tipologia e importo.`,
    },
    {
      q: `I dati di ${regioneNome} sono completi?`,
      a: `Stiamo costruendo la copertura Comune per Comune: oggi importiamo dai portali con open data attivo e dagli albi pretori digitali. Se il tuo Comune non e ancora coperto, segnalalo: lo aggiungiamo entro 30 giorni quando i dati sono accessibili.`,
    },
    {
      q: `Posso esportare i cantieri di ${regioneNome} in CSV?`,
      a: `L'esportazione CSV completa con dati committenti, importi dettagliati e contatti professionisti e disponibile con i piani Premium di ItaliaProgettisti, a partire da pochi euro al mese.`,
    },
  ];

  return (
    <>
      {/* HERO regione — minimal HUB-aligned, sfondo cream, NO immagine */}
      <section
        className="relative bg-background pt-32 pb-12 md:pt-40 md:pb-16"
        aria-labelledby="regione-hero-heading"
      >
        <div className="container-zen">
          <div className="max-w-4xl">
            <div className="mb-6">
              <BreadcrumbCantiere
                steps={[{ label: 'Regioni', href: '/regioni' }, { label: regioneNome }]}
              />
            </div>
            <p className="mb-8 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Dati pubblici · Aggiornati ogni giorno</span>
            </p>
            <h1
              id="regione-hero-heading"
              className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8"
              style={{ fontSize: 'clamp(2.5rem, 6vw + 0.5rem, 5.5rem)' }}
            >
              Cantieri edilizi
              <br className="hidden sm:block" />
              in <span className="italic font-black text-construction">{regioneNome}</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-2xl">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">
                {formatNumber(stats.totale)}
              </span>
              cantieri attivi in {regioneNome}, distribuiti su {stats.province} province
              e {stats.comuni} Comuni. Permessi PDC, SCIA e CILA aggiornati da fonti pubbliche.
            </p>
          </div>
        </div>
      </section>

    <section className="pb-20 md:pb-28">
      <div className="container-zen">
        <StatsBox
          items={[
            { label: 'Cantieri attivi', value: stats.totale, format: 'number' },
            { label: 'Province coperte', value: stats.province, format: 'number' },
            { label: 'Comuni tracciati', value: stats.comuni, format: 'number' },
            { label: 'Valore opere tracciate', value: stats.importo_totale, format: 'euro' },
          ]}
        />

        {/* TOP CATEGORIE */}
        {stats.top_categorie.length > 0 && (
          <div className="mt-16 md:mt-20 rounded-[2rem] border border-border bg-white p-6 md:p-8">
            <div className="mb-6 max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span aria-hidden="true" className="h-px w-6 bg-foreground/30" />
                Distribuzione
              </p>
              <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">Categorie di lavori piu frequenti in {regioneNome}</h2>
              <p className="text-sm text-muted-foreground">
                Distribuzione per tipologia di intervento sui cantieri tracciati.
              </p>
            </div>
            <BarChart data={stats.top_categorie.map((c) => ({ label: c.categoria, value: c.cnt }))} />
          </div>
        )}

        <DividerOrnament variant="dots" spacing="default" />

        {/* PROVINCE - card con arrow reveal on hover */}
        <div>
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span aria-hidden="true" className="h-px w-6 bg-foreground/30" />
              Esplora province
            </p>
            <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">Cantieri per provincia in {regioneNome}</h2>
            <p className="text-sm text-muted-foreground">
              Seleziona una provincia per esplorare i Comuni e i singoli cantieri pubblicati.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {province.map((p) => {
              const provName = provinciaNameFromCode(p.provincia);
              return (
                <Link
                  key={p.provincia}
                  href={`/${params.regione}/${provinciaSlugFromCode(p.provincia)}`}
                  aria-label={`Vedi i cantieri in provincia di ${provName}`}
                  className="group rounded-2xl border border-border bg-white p-4 md:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_12px_30px_-12px_rgba(17,17,17,0.14)]"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                      <span className="font-semibold text-sm truncate tracking-tight">{provName}</span>
                    </div>
                    <ArrowRight
                      className="h-3 w-3 flex-shrink-0 text-muted-foreground/50 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-foreground"
                      strokeWidth={2}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums">{formatNumber(p.cnt)} cantieri · {p.provincia}</div>
                </Link>
              );
            })}
          </div>
        </div>

        <DividerOrnament variant="dots" spacing="default" />

        {/* CANTIERI RECENTI */}
        <div>
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span aria-hidden="true" className="h-px w-6 bg-foreground/30" />
                Ultimi pubblicati
              </p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Ultimi cantieri pubblicati in {regioneNome}</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Permessi e SCIA arrivati di recente dagli albi pretori comunali.
              </p>
            </div>
            <Link
              href="/regioni"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Cambia regione
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {recenti.data.map((c) => (
              <CantiereCard key={c.id} cantiere={c} />
            ))}
          </div>
        </div>

        <DividerOrnament variant="line" spacing="default" />

        {/* CTA ALERT - tinted radial backdrop */}
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground text-background p-8 md:p-12">
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-background/[0.06] blur-3xl pointer-events-none"
          />
          <div className="relative flex items-start gap-5">
            <span className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-background/10 border border-background/15">
              <Bell className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="flex-1 max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-background/60">
                <span aria-hidden="true" className="h-px w-6 bg-background/30" />
                Alert personalizzati
              </p>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight leading-tight">
                Vuoi ricevere ogni nuovo cantiere in {regioneNome}?
              </h2>
              <p className="text-sm md:text-base opacity-80 mb-7 leading-relaxed">
                Attiva gli alert email gratuiti: ricevi una notifica appena viene pubblicato un nuovo permesso di
                costruire, SCIA o bando di gara in {regioneNome}. Filtrabili per provincia, importo e categoria.
              </p>
              <a
                href="https://www.italiaprogettisti.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
              >
                Iscriviti gratis e attiva gli alert
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>

        <FAQ
          title={`Domande frequenti sui cantieri in ${regioneNome}`}
          items={regioneFaq}
        />
      </div>
    </section>
    </>
  );
}
