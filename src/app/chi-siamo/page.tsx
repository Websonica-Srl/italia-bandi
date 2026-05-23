import type { Metadata } from 'next';
import Link from 'next/link';
import { Database, Globe, ShieldCheck, ExternalLink, Target, Users } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import TrustBadges from '@/components/cantieri/TrustBadges';
import FAQ from '@/components/cantieri/FAQ';

export const metadata: Metadata = {
  title: 'Chi siamo — Trasparenza, open data e network ItaliaProgettisti',
  description: `${siteConfig.name} aggrega i cantieri edilizi pubblici italiani da fonti ufficiali. Servizio editoriale di AZIENDA 365 SRL, parte del network ItaliaProgettisti.`,
  alternates: { canonical: '/chi-siamo' },
  openGraph: {
    title: 'Chi siamo — Italia Cantieri',
    description: `${siteConfig.name} aggrega i cantieri edilizi pubblici italiani da fonti ufficiali. Servizio editoriale di AZIENDA 365 SRL`,
    url: '/chi-siamo',
    type: 'website',
  },
};

const chiSiamoFaq = [
  {
    q: 'Chi gestisce Italia Cantieri?',
    a: 'Italia Cantieri e un servizio editoriale di AZIENDA 365 SRL (P.IVA 02724340746), parte del network ItaliaProgettisti che dal 2024 connette progettisti, studi e imprese edili in tutta Italia.',
  },
  {
    q: 'Perche e nato Italia Cantieri?',
    a: 'I dati sui cantieri sono pubblici per legge, ma frammentati su centinaia di portali comunali con formati diversi. Abbiamo creato uno strumento unico che li unifica, normalizza e rende navigabili a tutti: progettisti, imprese, committenti, ricercatori e cittadini.',
  },
  {
    q: 'Italia Cantieri vende dati a terzi?',
    a: 'No. I dati pubblici restano accessibili gratuitamente sul sito. Il modello di business e basato sulla rete di abbonamenti professionali al network ItaliaProgettisti, dove i professionisti pagano per visibilita, alert e dashboard avanzate.',
  },
  {
    q: 'Posso collaborare o segnalare un Comune da aggiungere?',
    a: 'Si. Scrivici a info@italiacantieri.it: integriamo nuovi Comuni quando i dati sono accessibili tramite API o albo pretorio digitale. Ogni nuova fonte importata e gratuita per gli utenti.',
  },
];

export default function ChiSiamoPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Chi siamo' }]} />
        <h1 className="heading-section mb-4">
          Rendiamo trasparente l&apos;edilizia italiana.
        </h1>
        <p className="body-large text-muted-foreground mb-10">
          {siteConfig.name} e l&apos;aggregatore pubblico dei cantieri edilizi italiani: un servizio editoriale di{' '}
          {siteConfig.companyName} che raccoglie, normalizza e rende navigabili i dati gia di dominio pubblico,
          frammentati fra centinaia di Comuni e portali regionali.
        </p>

        <div className="mb-12">
          <TrustBadges variant="grid" />
        </div>

        <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
          <Target className="h-6 w-6" /> La nostra missione
        </h2>
        <div className="prose prose-neutral max-w-none mb-12">
          <p>
            Crediamo che la <strong>trasparenza pubblica</strong> sia un pilastro del settore edilizio. Progettisti,
            imprese, committenti e cittadini hanno diritto a un accesso facile alle informazioni che gia esistono nel
            dominio pubblico, ma che oggi richiedono ore di navigazione su decine di portali comunali eterogenei.
          </p>
          <p>
            Italia Cantieri risolve questo problema: <strong>un solo posto, dati normalizzati, ricerca per Comune</strong>,
            mappe interattive e schede dettagliate. Tutto gratuito, sempre.
          </p>
          <p>
            Per chi vuole andare oltre la consultazione e trasformare l&apos;informazione in opportunita di business,
            il network <strong>ItaliaProgettisti</strong> offre alert email, contatti diretti dei professionisti
            collegati ai cantieri, esportazioni CSV e dashboard intelligence.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-4 inline-flex items-center gap-2">
          <Globe className="h-6 w-6" /> Il network
        </h2>
        <p className="text-muted-foreground mb-6">
          Italia Cantieri fa parte di un ecosistema di portali verticali specializzati nel settore edilizia,
          architettura e design.
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
          <Users className="h-6 w-6" /> Per chi e Italia Cantieri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Progettisti e studi</h3>
            <p className="text-sm text-secondary-text">
              Intercetta i cantieri prima dei competitor, individua opportunita di collaborazione tecnica e farti
              trovare dai committenti.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Imprese edili</h3>
            <p className="text-sm text-secondary-text">
              Identifica nuovi appalti privati e pubblici, analizza la concorrenza locale e pianifica strategie
              commerciali data-driven.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Aziende fornitrici</h3>
            <p className="text-sm text-secondary-text">
              Trova progettisti e imprese attivi nei tuoi territori e settori target. Segmenta lead per tipologia di
              opera e importo.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h3 className="font-semibold mb-2">Cittadini e ricercatori</h3>
            <p className="text-sm text-secondary-text">
              Consulta i lavori in corso nel tuo quartiere, monitora la trasformazione urbana e accedi alle statistiche
              aggregate per ricerca o giornalismo.
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
