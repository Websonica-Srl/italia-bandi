import type { Metadata } from 'next';
import { ShieldCheck, Database, Eye, UserX, Scale, Mail } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { faqLd, safeJsonLd, ogImageUrl } from '@/lib/seo/structured-data';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

const trasparenzaOg = ogImageUrl({
  title: 'Come trattiamo i dati',
  subtitle: 'Trasparenza GDPR · Fonti pubbliche · k-anonymity 5 · Opt-out 30 giorni',
  kind: 'generic',
});

export const metadata: Metadata = {
  title: 'Come trattiamo i dati — Trasparenza GDPR su fonti, base legale e diritti',
  description:
    'Tutto quello che serve sapere sul trattamento dati di Italia Cantieri: fonti pubbliche, base legale GDPR, k-anonymity 5 e modulo opt-out. Risposte chiare entro 30 giorni.',
  alternates: { canonical: '/come-trattiamo-i-dati' },
  openGraph: {
    title: 'Come trattiamo i dati — Italia Cantieri',
    description:
      'Trasparenza GDPR su Italia Cantieri: fonti pubbliche, base legale, k-anonymity 5, modulo opt-out.',
    url: '/come-trattiamo-i-dati',
    type: 'website',
    images: [{ url: trasparenzaOg, width: 1200, height: 630, alt: 'Come trattiamo i dati' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Come trattiamo i dati — Italia Cantieri',
    description: 'Trasparenza GDPR: fonti pubbliche, base legale, k-anonymity 5, opt-out.',
    images: [trasparenzaOg],
  },
};

const faqs = [
  {
    q: 'Da dove provengono i dati pubblicati su Italia Cantieri?',
    a: "Esclusivamente da fonti pubbliche e aperte: albo pretorio dei Comuni italiani, open data della Pubblica Amministrazione (es. open data Comune di Bologna, MEPA, portali ANAC), portali appalti regionali. Non raccogliamo dati da fonti private ne da soggetti non autorizzati.",
  },
  {
    q: 'Qual e la base legale del trattamento?',
    a: 'Art. 6.1.f GDPR (legittimo interesse alla trasparenza pubblica e liberta di informazione su dati di rilevanza pubblicistica) + Art. 14 GDPR (informativa per dati raccolti da terzi). Il trattamento e bilanciato con la tutela dei diritti dei titolari, valutati caso per caso.',
  },
  {
    q: "Cos'e la k-anonymity 5 che applicate ai cantieri privati?",
    a: 'Per cantieri privati (es. ristrutturazioni residenziali), aggreghiamo statisticamente i dati garantendo che ogni gruppo visualizzato contenga almeno 5 cantieri con caratteristiche simili (Comune + categoria + mese). Questo impedisce di risalire al singolo cantiere o committente: vedi solo statistiche aggregate, mai schede personali.',
  },
  {
    q: 'Posso richiedere la rimozione di un cantiere che mi riguarda?',
    a: "Si. Ai sensi degli Art. 15-22 GDPR puoi esercitare i diritti di accesso, rettifica, cancellazione, limitazione e opposizione. Scrivi al nostro DPO con allegato documento d'identita: la richiesta viene presa in carico entro 30 giorni. Trovi il modulo direttamente in ogni scheda cantiere.",
  },
  {
    q: 'Pubblicate i nomi dei committenti privati?',
    a: "No, mai. Pubblichiamo solo dati LAYER 1 ufficiali (riferimenti protocollo, indirizzo, tipologia titolo, importo) per cantieri con visibilita pubblica gia presenti nell'albo pretorio. I cantieri privati appaiono solo in forma aggregata anonima (k-anonymity 5).",
  },
  {
    q: 'Come vengono protetti i miei dati di navigazione sul sito?',
    a: 'Utilizziamo solo cookie tecnici necessari + cookie analitici opt-in (Google Analytics con IP anonimizzato). Nessun cookie di marketing attivato di default. Cookie banner attivo sulla prima visita, sempre revocabile.',
  },
  {
    q: 'I dati di Italia Cantieri sono utilizzabili in ambito commerciale?',
    a: 'I dati pubblicati su questa piattaforma sono accessibili gratuitamente per consultazione. Per utilizzi commerciali strutturati (export massivi, integrazioni API, redistribuzione) e necessario un accordo dedicato: scrivici a info@italiacantieri.it.',
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
            Italia Cantieri pubblica esclusivamente dati provenienti da fonti pubbliche. Questa pagina spiega in modo
            trasparente origine dei dati, base legale del trattamento, tecniche di anonimizzazione e diritti che puoi
            esercitare in qualsiasi momento.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="rounded-2xl border border-border bg-white p-5">
              <Database className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Fonti pubbliche verificate</h3>
              <p className="text-sm text-secondary-text">
                Albi pretori comunali, open data PA, portali appalti regionali, ANAC. Ogni fonte e dichiarata in scheda.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <Scale className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Base legale GDPR</h3>
              <p className="text-sm text-secondary-text">
                Art. 6.1.f (legittimo interesse alla trasparenza) + Art. 14 (informativa terzi).
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <Eye className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">Trasparenza totale</h3>
              <p className="text-sm text-secondary-text">
                Ogni scheda cantiere dichiara la fonte di provenienza e la data di pubblicazione originale.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <UserX className="h-6 w-6 text-foreground mb-2" />
              <h3 className="font-semibold mb-1">k-anonymity 5</h3>
              <p className="text-sm text-secondary-text">
                I cantieri privati appaiono solo in aggregati con almeno 5 record per gruppo. Mai dati individuali.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Cos&apos;e Italia Cantieri</h2>
          <div className="prose prose-neutral max-w-none mb-12">
            <p>
              Italia Cantieri e un aggregatore pubblico di informazioni sui cantieri edilizi italiani. Raccogliamo,
              normalizziamo e pubblichiamo dati provenienti esclusivamente da fonti pubbliche, con l&apos;obiettivo di
              rendere accessibili e navigabili informazioni che sono gia di dominio pubblico ma frammentate fra
              centinaia di portali comunali e regionali.
            </p>
            <p>
              Il servizio e gestito da <strong>{siteConfig.companyName}</strong> ({siteConfig.companyPiva}) e fa parte
              del network ItaliaProgettisti.
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
              Se sei il titolare di un cantiere pubblicato e ritieni che il legittimo interesse di Italia Cantieri non
              prevalga sui tuoi diritti, scrivi al nostro DPO. Ogni richiesta viene valutata individualmente entro 30
              giorni.
            </p>
            <a
              href={`mailto:${siteConfig.dpoEmail}?subject=Opt-out%20%2F%20rimozione%20dati%20Italia%20Cantieri`}
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
