import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { getCantieriByRegione } from '@/lib/supabase/queries/cantieri';
import { regioneSlug, formatNumber } from '@/lib/utils';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import FAQ from '@/components/cantieri/FAQ';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Cantieri edilizi per regione — Mappa completa Italia',
  description:
    'Esplora i cantieri edilizi attivi regione per regione: permessi di costruire, SCIA, CILA aggregati da albi pretori comunali e open data della PA.',
  alternates: { canonical: '/regioni' },
};

const regioniFaq = [
  {
    q: 'Come e organizzato il database per regione?',
    a: 'Per ogni regione mostriamo il numero totale di cantieri tracciati, la distribuzione per provincia e per Comune, le categorie di lavori piu frequenti e i permessi pubblicati piu di recente. Clicca su una regione per accedere alla pagina dedicata.',
  },
  {
    q: 'Perche alcune regioni hanno piu cantieri di altre?',
    a: 'Il numero di cantieri tracciati dipende da due fattori: il volume reale di attivita edilizia e il livello di apertura dei dati pubblici della PA locale. Stiamo lavorando per portare ogni regione a copertura completa, Comune per Comune.',
  },
  {
    q: 'Posso ricevere alert sui nuovi cantieri della mia regione?',
    a: 'Si. Iscrivendoti gratuitamente al network ItaliaProgettisti puoi attivare notifiche email sui nuovi cantieri pubblicati nella tua regione, provincia o Comune di interesse. Configurabili anche per tipologia di lavoro e fascia di importo.',
  },
];

export default async function RegioniPage() {
  const regioni = await getCantieriByRegione();
  const totale = regioni.reduce((s, r) => s + r.cnt, 0);

  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen">
        <BreadcrumbCantiere steps={[{ label: 'Regioni' }]} />
        <h1 className="heading-section mb-3">Cantieri edilizi per regione</h1>
        <p className="body-default text-muted-foreground mb-10 max-w-2xl">
          {formatNumber(totale)} cantieri attivi tracciati in {regioni.length} regioni italiane. Seleziona la tua
          regione per vedere province, Comuni e ultimi permessi di costruire pubblicati.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regioni.map((r) => (
            <Link
              key={r.regione}
              href={`/${regioneSlug(r.regione)}`}
              aria-label={`Vedi tutti i cantieri in ${r.regione}`}
              className="group rounded-2xl border border-border bg-white p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <MapPin className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-semibold">{r.regione}</h2>
              </div>
              <div className="text-3xl font-extrabold text-foreground">{formatNumber(r.cnt)}</div>
              <div className="text-sm text-muted-foreground mt-1">cantieri attivi tracciati</div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Esplora {r.regione} <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>

        <FAQ
          title="Domande frequenti sulla mappa per regione"
          items={regioniFaq}
        />
      </div>
    </section>
  );
}
