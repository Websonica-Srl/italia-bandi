import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { getBandiInScadenza } from '@/lib/supabase/queries/bandi';
import { bandoTitolo } from '@/lib/utils';
import { cpvGroupLabel } from '@/lib/bandi-taxonomy-extra';
import BandoCard from '@/components/bandi/BandoCard';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';
import { ogImageUrl, itemListLd, safeJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 1800; // mezz'ora: pagina time-sensitive

const og = ogImageUrl({
  title: 'Bandi di gara in scadenza',
  subtitle: 'Le gare d\'appalto con termine offerte ancora aperto',
  kind: 'bando',
});

export const metadata: Metadata = {
  title: 'Bandi di gara in scadenza — termini offerte ancora aperti',
  description:
    'I bandi e le gare d\'appalto pubbliche con termine di presentazione delle offerte ancora aperto, ordinati per scadenza più vicina. Non perdere le opportunità.',
  alternates: { canonical: '/scadenze' },
  openGraph: { title: 'Bandi di gara in scadenza', description: 'Le gare d\'appalto con termine offerte ancora aperto.', url: '/scadenze', type: 'website', images: [{ url: og, width: 1200, height: 630, alt: 'Bandi di gara in scadenza' }] },
  twitter: { card: 'summary_large_image', title: 'Bandi di gara in scadenza', images: [og] },
};

const faqs = [
  {
    q: 'Cosa significa "bando in scadenza"?',
    a: 'È una gara d\'appalto il cui termine per la presentazione delle offerte non è ancora trascorso. Una volta scaduto il termine, le offerte non sono più ammesse.',
  },
  {
    q: 'Con quale frequenza viene aggiornata questa pagina?',
    a: 'L\'elenco si aggiorna automaticamente dalle fonti pubbliche e ricalcola le scadenze in tempo reale rispetto alla data odierna.',
  },
  {
    q: 'Come ricevo un avviso prima della scadenza di un bando?',
    a: 'Iscrivendoti gratuitamente al network ItaliaProgettisti puoi attivare alert email sui bandi rilevanti per categoria e importo, con promemoria sulle scadenze.',
  },
];

export default async function ScadenzePage() {
  const { data: bandi, total } = await getBandiInScadenza(60);

  const itemList = itemListLd(
    bandi.map((b) => ({ name: bandoTitolo(b, cpvGroupLabel(b.cpv_principale)), url: `${siteConfig.baseUrl}/bandi/${b.slug}` })),
    'Bandi di gara in scadenza',
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemList) }} />
      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen">
          <BreadcrumbCantiere steps={[{ label: 'In scadenza' }]} />
          <p className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Termini ancora aperti</span>
          </p>
          <h1 className="heading-section mb-3">Bandi di gara in scadenza</h1>
          <p className="body-default text-muted-foreground mb-10 max-w-2xl">
            {total > 0
              ? `${total.toLocaleString('it-IT')} bandi con termine di presentazione delle offerte ancora aperto, ordinati per scadenza più vicina.`
              : 'Al momento non risultano bandi con termine ancora aperto. Torna a trovarci: l\'elenco si aggiorna di continuo.'}
          </p>

          {bandi.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {bandi.map((b) => (
                <BandoCard key={b.id} bando={b} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" strokeWidth={1.25} />
              <h2 className="text-xl font-semibold mb-2">Nessun bando in scadenza</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Esplora comunque tutti i bandi pubblicati o sfoglia per categoria.
              </p>
              <Link href="/bandi" className="btn-primary inline-flex">Vedi tutti i bandi</Link>
            </div>
          )}

          <div className="mt-12 max-w-4xl">
            <FAQ title="Domande frequenti sulle scadenze dei bandi" items={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
