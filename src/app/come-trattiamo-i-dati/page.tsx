import type { Metadata } from 'next';
import { ShieldCheck, Database, Eye, UserX, Scale, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { faqLd, safeJsonLd, ogImageUrl } from '@/lib/seo/structured-data';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

const trasparenzaOg = ogImageUrl({
  title: 'Come trattiamo i dati',
  subtitle: 'Trasparenza GDPR · Fonti ufficiali e pubbliche · solo persone giuridiche · Opt-out 30 giorni',
  kind: 'generic',
});

export const metadata: Metadata = {
  title: 'Come trattiamo i dati — Trasparenza GDPR su fonti, base legale e diritti',
  description:
    'Tutto quello che serve sapere sul trattamento dati di BandiGareDappalto: fonti ufficiali e pubbliche, base legale GDPR, regime persone giuridiche/fisiche e modulo opt-out. Risposte chiare entro 30 giorni.',
  alternates: { canonical: '/come-trattiamo-i-dati' },
  openGraph: {
    title: 'Come trattiamo i dati — BandiGareDappalto',
    description:
      'Trasparenza GDPR su BandiGareDappalto: fonti ufficiali e pubbliche, base legale, regime PG/PF, modulo opt-out.',
    url: '/come-trattiamo-i-dati',
    type: 'website',
    images: [{ url: trasparenzaOg, width: 1200, height: 630, alt: 'Come trattiamo i dati' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Come trattiamo i dati — BandiGareDappalto',
    description: 'Trasparenza GDPR: fonti ufficiali e pubbliche, base legale, regime PG/PF, opt-out.',
    images: [trasparenzaOg],
  },
};

const faqs = [
  {
    q: 'Da dove provengono i dati pubblicati su BandiGareDappalto?',
    a: 'Esclusivamente da fonti ufficiali e pubbliche: i portali istituzionali degli appalti italiani ed europei (inclusa la Gazzetta Ufficiale UE). I dati delle gare d\'appalto sono pubblici per legge (D.Lgs. 36/2023). Non raccogliamo dati da fonti private né da soggetti non autorizzati.',
  },
  {
    q: 'Qual è la base legale del trattamento?',
    a: 'Per i dati di gara e le imprese aggiudicatarie (persone giuridiche) il trattamento è fuori dall\'ambito del GDPR (Considerando 14). Ove fossero presenti dati di persone fisiche, la base legale è l\'Art. 6, par. 1, lett. f) GDPR (legittimo interesse all\'informazione e alla trasparenza del mercato), rafforzato dalla natura pubblica della fonte, con informativa ex Art. 14 GDPR (dati raccolti da terzi).',
  },
  {
    q: 'Pubblicate dati personali di persone fisiche?',
    a: 'No. Pubblichiamo le ragioni sociali delle imprese aggiudicatarie (persone giuridiche), che sono dati pubblici. Non pubblichiamo dati personali di persone fisiche: né nominativi privati, né contatti del RUP, né partita IVA o codice fiscale. Le nostre viste pubbliche escludono a monte queste informazioni.',
  },
  {
    q: 'Per quanto tempo restano online i dati?',
    a: 'I dati delle gare aggiudicate da imprese (persone giuridiche) restano consultabili come archivio storico. Eventuali dati riferibili a persone fisiche sono soggetti a minimizzazione e a un periodo di conservazione limitato (24-36 mesi), trascorso il quale il nominativo viene de-indicizzato o anonimizzato.',
  },
  {
    q: 'Posso richiedere la rimozione di un dato che mi riguarda?',
    a: 'Sì. Ai sensi degli Art. 15-22 GDPR puoi esercitare i diritti di accesso, rettifica, cancellazione, limitazione e opposizione. Scrivi al nostro DPO con allegato documento d\'identità: la richiesta viene valutata individualmente e presa in carico entro 30 giorni.',
  },
  {
    q: 'Come vengono protetti i miei dati di navigazione sul sito?',
    a: 'Utilizziamo solo cookie tecnici necessari + cookie analitici opt-in (Google Analytics con IP anonimizzato). Nessun cookie di marketing attivato di default. Cookie banner attivo sulla prima visita, sempre revocabile.',
  },
  {
    q: 'I dati di BandiGareDappalto sono utilizzabili in ambito commerciale?',
    a: 'I dati pubblicati sono accessibili gratuitamente per consultazione. Per utilizzi commerciali strutturati (export massivi, integrazioni API, redistribuzione) è necessario un accordo dedicato: scrivici a info@bandigaredappalto.it.',
  },
];

export default function ComeTrattiamoIDatiPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd(faqs)) }} />
      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-4xl">
          <BreadcrumbCantiere steps={[{ label: 'Trasparenza dati' }]} />

          <h1 className="heading-section mb-4">Come trattiamo i dati</h1>
          <p className="body-large text-muted-foreground mb-10">
            BandiGareDappalto pubblica esclusivamente dati provenienti da fonti pubbliche ufficiali. Questa pagina spiega
            in modo trasparente l&apos;origine dei dati, la base legale del trattamento, il diverso regime tra persone
            giuridiche e fisiche e i diritti che puoi esercitare in qualsiasi momento.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="rounded-2xl border border-border bg-white p-5">
              <Database className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Fonti pubbliche ufficiali</h3>
              <p className="text-sm text-secondary-text">
                Portali istituzionali degli appalti italiani ed europei (inclusa la Gazzetta Ufficiale UE). Ogni bando dichiara la propria fonte.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <Scale className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Base legale GDPR</h3>
              <p className="text-sm text-secondary-text">
                Imprese (PG) fuori GDPR (Cons. 14). Per dati di persone fisiche: Art. 6, par. 1, lett. f) + informativa Art. 14.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <Eye className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Trasparenza totale</h3>
              <p className="text-sm text-secondary-text">
                Ogni scheda bando dichiara la fonte di provenienza e la data di pubblicazione originale.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <UserX className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Nessun dato di persone fisiche</h3>
              <p className="text-sm text-secondary-text">
                Le viste pubbliche escludono partita IVA, codice fiscale, contatti RUP e ogni dato personale.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Cos&apos;è BandiGareDappalto</h2>
          <div className="prose prose-neutral max-w-none mb-12">
            <p>
              BandiGareDappalto è un portale pubblico che aggrega informazioni sui bandi e le gare d&apos;appalto in Italia.
              Raccogliamo, normalizziamo e pubblichiamo dati provenienti esclusivamente da fonti pubbliche ufficiali, con
              l&apos;obiettivo di rendere accessibili e navigabili informazioni che sono già di dominio pubblico ma
              frammentate e di difficile lettura.
            </p>
            <p>
              Distinguiamo due regimi: i dati delle <strong>imprese aggiudicatarie (persone giuridiche)</strong> sono
              fuori dall&apos;ambito del GDPR e liberamente consultabili; gli eventuali dati riferibili a
              <strong> persone fisiche</strong> sono trattati con minimizzazione, base giuridica del legittimo interesse
              e periodo di conservazione limitato.
            </p>
            <p>
              Il servizio è gestito da <strong>{siteConfig.companyName}</strong> ({siteConfig.companyPiva}) e fa parte
              del network ItaliaProgettisti, che adotta una <strong>privacy unica di rete</strong> con titolare unico e
              consent logging centralizzato sull&apos;HUB.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6">I tuoi diritti GDPR</h2>
          <div className="prose prose-neutral max-w-none mb-12">
            <p>Ai sensi degli Art. 15-22 GDPR, in qualsiasi momento puoi richiedere:</p>
            <ul>
              <li><strong>Accesso</strong> (Art. 15): copia dei dati che ti riguardano.</li>
              <li><strong>Rettifica</strong> (Art. 16): correzione di dati inesatti o incompleti.</li>
              <li><strong>Cancellazione</strong> (Art. 17 — diritto all&apos;oblio).</li>
              <li><strong>Limitazione</strong> (Art. 18): sospensione temporanea del trattamento.</li>
              <li><strong>Portabilita</strong> (Art. 20): ricezione dei dati in formato strutturato.</li>
              <li><strong>Opposizione</strong> (Art. 21): contestazione del legittimo interesse.</li>
            </ul>
            <p>
              Per esercitare uno o piu diritti, contatta il nostro DPO con allegato documento d&apos;identita. Risposta
              garantita entro 30 giorni dalla ricezione.
            </p>
          </div>

          <div id="opt-out" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 mb-12 scroll-mt-24">
            <Mail className="h-6 w-6 text-amber-700 mb-3" />
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Richiedi opt-out o rimozione</h2>
            <p className="text-amber-900/80 mb-5 leading-relaxed">
              Se un dato pubblicato ti riguarda come persona fisica e ritieni che il legittimo interesse di
              BandiGareDappalto non prevalga sui tuoi diritti, scrivi al nostro DPO. Ogni richiesta viene valutata
              individualmente entro 30 giorni.
            </p>
            <a
              href={`mailto:${siteConfig.dpoEmail}?subject=Opt-out%20%2F%20rimozione%20dati%20BandiGareDappalto`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-900 text-amber-50 px-5 py-2.5 text-sm font-medium hover:bg-amber-900/90 transition-colors"
            >
              <Mail className="h-4 w-4" /> Contatta il DPO ({siteConfig.dpoEmail})
            </a>
          </div>

          <h2 className="text-2xl font-bold mb-6">Domande frequenti GDPR</h2>
          <div className="space-y-4 mb-12">
            {faqs.map((f, i) => (
              <details key={i} className="rounded-2xl border border-border bg-white p-5 group">
                <summary className="font-semibold cursor-pointer list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                </summary>
                <p className="mt-3 text-sm text-secondary-text leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-secondary p-6 text-sm">
            <ShieldCheck className="h-5 w-5 mb-2" />
            <p>
              <strong>Titolare del trattamento:</strong> {siteConfig.companyName} ({siteConfig.companyPiva})
              <br />
              <strong>DPO / Responsabile della protezione dati:</strong>{' '}
              <a href={`mailto:${siteConfig.dpoEmail}`} className="underline">
                {siteConfig.dpoEmail}
              </a>
              <br />
              <strong>Autorita di controllo:</strong> Garante per la Protezione dei Dati Personali (Piazza Venezia 11,
              Roma).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
