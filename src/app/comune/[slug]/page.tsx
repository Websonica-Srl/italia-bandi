import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lock, Info, Bell } from 'lucide-react';
import {
  getCantieri,
  getAggregatiAnonimiByComune,
  countFirmsByComune,
  getAllComuni,
} from '@/lib/supabase/queries/cantieri';
import { slugify, formatNumber, formatEuro, regioneSlug } from '@/lib/utils';
import { provinciaSlugFromCode, provinciaNameFromCode } from '@/lib/province';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import StatsBox from '@/components/cantieri/StatsBox';
import CantiereCard from '@/components/cantieri/CantiereCard';
import CrossLinkCorrelati from '@/components/cantieri/CrossLinkCorrelati';
import BarChart from '@/components/cantieri/BarChart';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl } from '@/lib/seo/structured-data';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

async function resolveComune(slug: string): Promise<{ comune: string; provincia: string; regione: string } | null> {
  const all = await getAllComuni();
  const target = slug.toLowerCase();
  const hit = all.find((c) => slugify(c.comune) === target);
  return hit || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const comune = await resolveComune(params.slug);
  if (!comune) return { title: 'Comune non trovato' };
  const { total } = await getCantieri({ comune: comune.comune, limit: 1 });
  const title = `Cantieri edilizi a ${comune.comune} (${comune.provincia}) — Permessi PDC, SCIA e CILA`;
  const description = `Tutti i cantieri attivi a ${comune.comune} (${comune.provincia}, ${comune.regione}): permessi di costruire, SCIA, CILA e bandi pubblici. Dati ufficiali aggiornati ogni giorno dall'albo pretorio comunale.`;
  const ogImage = ogImageUrl({
    title: `Cantieri edilizi a ${comune.comune}`,
    subtitle: `${comune.provincia}, ${comune.regione} · Dati dall'albo pretorio`,
    kind: 'comune',
    count: formatNumber(total),
    label: 'cantieri pubblicati',
  });
  return {
    title,
    description,
    alternates: { canonical: `/comune/${params.slug}` },
    openGraph: {
      title: `Cantieri edilizi a ${comune.comune} — Italia Cantieri`,
      description,
      url: `/comune/${params.slug}`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Cantieri edilizi a ${comune.comune}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Cantieri edilizi a ${comune.comune}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function ComunePage({ params }: PageProps) {
  const meta = await resolveComune(params.slug);
  if (!meta) notFound();

  const [{ data: cantieriPubblici, total }, aggregati, firmCount] = await Promise.all([
    getCantieri({ comune: meta.comune, limit: 30, orderBy: 'data_pubblicazione' }),
    getAggregatiAnonimiByComune(meta.comune),
    countFirmsByComune(meta.comune),
  ]);

  const importoTotaleCampione = cantieriPubblici.reduce((s, c) => s + (Number(c.importo_lavori) || 0), 0);

  const comuneFaq = [
    {
      q: `Quanti cantieri sono attivi a ${meta.comune}?`,
      a: `Al momento tracciamo ${formatNumber(total)} cantieri pubblici a ${meta.comune}, piu un campione di ${formatNumber(aggregati.totale_aggregato)} cantieri privati visualizzati solo in forma aggregata anonima (k-anonymity 5) a tutela della privacy dei committenti.`,
    },
    {
      q: `Come faccio a sapere CHI sta progettando un cantiere a ${meta.comune}?`,
      a: `Sblocca i contatti del progettista, dello studio o dell'impresa direttamente dalla scheda del cantiere. Iscriviti gratis al network ItaliaProgettisti per accedere ai profili professionali collegati.`,
    },
    {
      q: `Posso ricevere alert sui nuovi cantieri a ${meta.comune}?`,
      a: `Si. Con la registrazione gratuita su ItaliaProgettisti puoi attivare notifiche email per ogni nuovo permesso pubblicato a ${meta.comune}, filtrabili per tipologia (PDC, SCIA, CILA) e fascia di importo.`,
    },
    {
      q: `Da dove arrivano i dati dei cantieri di ${meta.comune}?`,
      a: `Da fonti pubbliche ufficiali: albo pretorio del Comune di ${meta.comune}, portale open data della Pubblica Amministrazione e archivi regionali appalti. Ogni scheda dichiara la fonte e la data di pubblicazione originale.`,
    },
    {
      q: `Sono il proprietario di un cantiere e non voglio comparire. Cosa faccio?`,
      a: `Hai diritto di richiedere opt-out: scrivi al nostro DPO (privacy@italiaprogettisti.com) o usa il pulsante "Richiedi rimozione" presente in ogni scheda. Valutiamo la richiesta entro 30 giorni come previsto dal GDPR.`,
    },
  ];

  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen">
        <BreadcrumbCantiere
          steps={[
            { label: 'Regioni', href: '/regioni' },
            { label: meta.regione, href: `/${regioneSlug(meta.regione)}` },
            { label: `Provincia di ${provinciaNameFromCode(meta.provincia)}`, href: `/${regioneSlug(meta.regione)}/${provinciaSlugFromCode(meta.provincia)}` },
            { label: meta.comune },
          ]}
        />
        <h1 className="heading-section mb-3">Cantieri edilizi a {meta.comune}</h1>
        <p className="body-default text-muted-foreground mb-10 max-w-2xl">
          Tutti i permessi di costruire (PDC), SCIA e CILA tracciati a {meta.comune} ({meta.provincia}, {meta.regione}).
          Dati ufficiali aggregati da albo pretorio e open data della Pubblica Amministrazione.
        </p>

        <StatsBox
          items={[
            { label: 'Cantieri pubblici tracciati', value: total, format: 'number' },
            {
              label: 'Cantieri privati (statistica anonima)',
              value: aggregati.totale_aggregato,
              format: 'number',
              helper: 'aggregati con k-anonymity 5',
            },
            {
              label: 'Valore campione recente',
              value: importoTotaleCampione,
              format: 'euro',
              helper: 'somma importi cantieri mostrati',
            },
          ]}
          columns={3}
        />

        {/* SEZIONE PUBBLICA (LAYER 1) */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-1">Permessi e SCIA pubblicati a {meta.comune}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Schede dettagliate dei cantieri con visibilita pubblica: PDC, SCIA e CILA dichiarati nell&apos;albo pretorio
            comunale.
          </p>
          {cantieriPubblici.length === 0 ? (
            <p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-6 text-center">
              Nessun cantiere pubblico attualmente disponibile per {meta.comune}. Stiamo lavorando per estendere la
              copertura: torna a trovarci presto.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cantieriPubblici.map((c) => (
                <CantiereCard key={c.id} cantiere={c} />
              ))}
            </div>
          )}
        </div>

        {/* SEZIONE AGGREGATI ANONIMI (LAYER 2) */}
        {aggregati.categorie.length > 0 && (
          <div className="mt-16">
            <div className="flex items-start gap-3 mb-6 rounded-2xl border border-border bg-secondary p-5">
              <Lock className="h-5 w-5 text-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Cantieri privati a {meta.comune} — statistiche anonime
                </h2>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Aggregati con tecnica di <strong>k-anonymity 5</strong>: mostriamo solo gruppi con almeno 5 cantieri
                  privati simili per proteggere l&apos;identita dei committenti. Per accesso ai dati di dettaglio,
                  importi committenti e contatti professionisti,{' '}
                  <a
                    href="https://www.italiaprogettisti.com/abbonamenti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    attiva un piano Premium
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="font-semibold mb-4">Distribuzione cantieri privati per categoria</h3>
              <BarChart
                data={aggregati.categorie.map((c) => ({
                  label: c.categoria,
                  value: c.totale,
                }))}
              />
              <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1">
                <Info className="h-3 w-3" /> Valore complessivo opere stimato:{' '}
                {formatEuro(aggregati.categorie.reduce((s, c) => s + (c.importo_totale || 0), 0), { compact: true })}
              </p>
            </div>
          </div>
        )}

        {/* CTA ALERT */}
        <div className="mt-12 rounded-2xl bg-foreground text-background p-8">
          <div className="flex items-start gap-4">
            <Bell className="h-6 w-6 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Sii il primo a sapere quando si apre un cantiere a {meta.comune}.
              </h2>
              <p className="text-sm md:text-base opacity-80 mb-5 leading-relaxed">
                Attiva gli alert email gratuiti: ti notifichiamo ogni nuovo permesso di costruire o SCIA pubblicato a{' '}
                {meta.comune}. Una mail, zero spam, opportunita reali.
              </p>
              <a
                href="https://www.italiaprogettisti.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Iscriviti gratis e attiva gli alert
              </a>
            </div>
          </div>
        </div>

        {/* CROSS LINK */}
        <div className="mt-12">
          <CrossLinkCorrelati comune={meta.comune} countImprese={firmCount} />
        </div>

        <FAQ
          title={`Domande frequenti sui cantieri a ${meta.comune}`}
          items={comuneFaq}
        />
      </div>
    </section>
  );
}
