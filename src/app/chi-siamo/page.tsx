import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, Globe, ShieldCheck, ExternalLink, Target, Users } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import TrustBadges from '@/components/cantieri/TrustBadges';
import FAQ from '@/components/cantieri/FAQ';

export const metadata: Metadata = {
  title: 'Chi siamo — Trasparenza sugli appalti e network ItaliaProgettisti',
  description: `${siteConfig.name} aggrega i bandi e le gare d'appalto pubbliche italiane da fonti ufficiali. Servizio editoriale di AZIENDA 365 SRL, parte del network ItaliaProgettisti.`,
  alternates: { canonical: '/chi-siamo' },
  openGraph: {
    title: 'Chi siamo — BandiGareDappalto',
    description: `${siteConfig.name} aggrega i bandi e le gare d'appalto pubbliche italiane da fonti ufficiali. Servizio editoriale di AZIENDA 365 SRL`,
    url: '/chi-siamo',
    type: 'website',
  },
};

const chiSiamoFaq = [
  {
    q: 'Chi gestisce BandiGareDappalto?',
    a: 'BandiGareDappalto è un servizio editoriale di AZIENDA 365 SRL (P.IVA 02724340746), parte del network ItaliaProgettisti che connette progettisti, studi e imprese edili in tutta Italia.',
  },
  {
    q: 'Perché è nato BandiGareDappalto?',
    a: 'I dati sui bandi e le gare d\'appalto sono pubblici per legge, ma frammentati e illeggibili: PDF, formati diversi, portali eterogenei. Abbiamo creato uno strumento unico che li unifica, normalizza e rende navigabili a imprese, studi, professionisti, ricercatori e cittadini.',
  },
  {
    q: 'BandiGareDappalto vende dati a terzi?',
    a: 'No. I dati pubblici restano accessibili gratuitamente sul sito. Il modello di business si basa sugli abbonamenti professionali al network ItaliaProgettisti, dove gli iscritti pagano per alert, monitoraggio dei concorrenti e documentazione di gara.',
  },
  {
    q: 'Pubblicate dati personali di persone fisiche?',
    a: 'No. Pubblichiamo esclusivamente dati di gara e ragioni sociali di persone giuridiche (imprese aggiudicatarie), che sono dati pubblici per legge e fuori dall\'ambito del GDPR. Non pubblichiamo dati personali di persone fisiche (es. nominativi privati, contatti RUP).',
  },
];

export default function ChiSiamoPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Chi siamo' }]} />
        <h1 className="heading-section mb-4">
          Rendiamo leggibili le gare d&apos;appalto pubbliche.
        </h1>
        <p className="body-large text-muted-foreground mb-10">
          {siteConfig.name} è il portale pubblico dei bandi e delle gare d&apos;appalto italiane: un servizio editoriale di{' '}
          {siteConfig.companyName} che raccoglie, normalizza e rende navigabili dati già di dominio pubblico,
          oggi frammentati e di difficile lettura tra i diversi portali appalti istituzionali.
        </p>

        <div className="mb-12">
          <TrustBadges variant="grid" />
        </div>

        <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
          <Target className="h-6 w-6" /> La nostra missione
        </h2>
        <div className="prose prose-neutral max-w-none mb-12">
          <p>
            Crediamo che la <strong>trasparenza sugli appalti pubblici</strong> sia un diritto. Imprese, studi,
            professionisti, cittadini e giornalisti hanno diritto a un accesso facile alle informazioni che già esistono
            nel dominio pubblico, ma che oggi richiedono ore di lavoro su portali eterogenei e PDF da decifrare.
          </p>
          <p>
            BandiGareDappalto risolve questo problema: <strong>un solo posto, dati normalizzati, ricerca per categoria CPV</strong>,
            importi, scadenze e — quando la gara è aggiudicata — chi se l&apos;è aggiudicata. La consultazione è gratuita.
          </p>
          <p>
            Per chi vuole andare oltre la consultazione, il network <strong>ItaliaProgettisti</strong> offre alert sui
            bandi rilevanti, monitoraggio dei concorrenti, documentazione di gara e la scheda azienda con il track record
            delle gare vinte. Tutto il transazionale avviene sull&apos;HUB del network.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
          <Globe className="h-6 w-6" /> Il network
        </h2>
        <p className="text-muted-foreground mb-6">
          BandiGareDappalto fa parte di un ecosistema di portali verticali specializzati nel settore edilizia,
          architettura e appalti pubblici.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-12">
          {siteConfig.network.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                {s.name} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
          <Users className="h-6 w-6" /> Per chi è BandiGareDappalto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Imprese e uffici gare</h3>
            <p className="text-sm text-secondary-text">
              Intercetta i bandi giusti per la tua categoria SOA e il tuo importo, monitora i concorrenti e analizza
              i ribassi del tuo mercato.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Studi e professionisti</h3>
            <p className="text-sm text-secondary-text">
              Trova le gare di progettazione e direzione lavori (CPV 71), costruisci il tuo track record e fatti
              trovare dalle stazioni appaltanti.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Aziende fornitrici</h3>
            <p className="text-sm text-secondary-text">
              Individua le imprese che vincono le gare nei tuoi territori e settori target, e segui le opportunità
              di subfornitura per tipologia di opera e importo.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Cittadini e giornalisti</h3>
            <p className="text-sm text-secondary-text">
              Consulta in chiaro come la PA spende i soldi pubblici: oggetto, importo, ente e aggiudicatari di ogni
              gara, per ricerca, inchiesta o controllo civico.
            </p>
          </div>
        </div>

        <FAQ title="Domande frequenti su chi siamo" items={chiSiamoFaq} />

        <div className="rounded-2xl border border-border bg-secondary p-6 text-sm">
          <p>
            <strong>{siteConfig.companyName}</strong> · {siteConfig.companyPiva}
            <br />
            Email generica:{' '}
            <a href={`mailto:${siteConfig.email}`} className="underline">
              {siteConfig.email}
            </a>
            <br />
            DPO:{' '}
            <a href={`mailto:${siteConfig.dpoEmail}`} className="underline">
              {siteConfig.dpoEmail}
            </a>
            <br />
            <Link href="/contatti" className="underline">
              Form contatti
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
