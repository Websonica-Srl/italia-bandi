/**
 * Pagina /glossario — definizioni tecniche edilizia italiana.
 *
 * Target keyword Tier 1 (PDC, SCIA, CILA, PAS, DIA, Albo Pretorio, ITP, OG, OS, ecc.).
 * Stack AEO:
 *   - DefinedTermSet + DefinedTerm[] schema.org (Google + Perplexity/ChatGPT citations)
 *   - HTML semantico <dl><dt><dd> per ogni termine
 *   - Anchor link per cross-link interno
 *   - Risposta DIRETTA nei primi 60 caratteri di ogni definizione (featured snippet)
 *
 * Linked dal Header e dal Footer.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import {
  glossaryLd,
  safeJsonLd,
  ogImageUrl,
  type GlossaryTerm,
} from '@/lib/seo/structured-data';

export const revalidate = 86400; // glossario cambia raramente

const ogImage = ogImageUrl({
  title: 'Glossario edilizia italiana',
  subtitle: 'PDC, SCIA, CILA, OG, OS e tutti i termini tecnici dei cantieri',
  kind: 'glossario',
  count: '28',
  label: 'termini definiti',
});

export const metadata: Metadata = {
  title: 'Glossario edilizia italiana — PDC, SCIA, CILA, OG, OS e termini tecnici',
  description:
    'Glossario completo dei termini tecnici dell\'edilizia italiana: Permesso di Costruire (PDC), SCIA, CILA, PAS, DIA, OG, OS, albo pretorio, ITP, sanatoria, agibilità. Definizioni accurate e riferimenti normativi.',
  alternates: { canonical: '/glossario' },
  keywords: [
    'glossario edilizia',
    'PDC SCIA CILA differenze',
    'cosa significa PDC',
    'permesso di costruire definizione',
    'categorie OG OS',
    'albo pretorio',
    'glossario cantieri',
  ],
  openGraph: {
    title: 'Glossario edilizia italiana — Italia Cantieri',
    description:
      'PDC, SCIA, CILA, OG, OS, albo pretorio e tutti i termini tecnici dei cantieri italiani spiegati con definizioni accurate.',
    url: '/glossario',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Glossario edilizia italiana' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glossario edilizia italiana',
    description: 'PDC, SCIA, CILA, OG, OS e tutti i termini tecnici dei cantieri italiani.',
    images: [ogImage],
  },
};

/**
 * 28 termini ad alta intenzione di ricerca informazionale.
 * Ogni definizione: 50-100 parole, prima frase factual diretta.
 */
const TERMS: GlossaryTerm[] = [
  {
    termCode: 'PDC',
    name: 'Permesso di Costruire',
    definition:
      'Il Permesso di Costruire (PDC) è l\'autorizzazione preventiva rilasciata dal Comune per interventi edilizi rilevanti: nuove costruzioni, ampliamenti volumetrici, ristrutturazioni che modificano la sagoma o il volume dell\'edificio. È disciplinato dagli artt. 10-20 del DPR 380/2001 (Testo Unico Edilizia). Tempo medio di rilascio: 90 giorni dalla presentazione della domanda completa. Senza PDC i lavori sono abusivi e soggetti a sanzioni amministrative e penali.',
    example:
      'Per costruire una villa unifamiliare di nuova edificazione su un terreno edificabile serve il PDC, presentato presso lo Sportello Unico Edilizia (SUE) del Comune competente.',
    relatedPath: '/statistiche',
  },
  {
    termCode: 'SCIA',
    name: 'Segnalazione Certificata di Inizio Attività',
    definition:
      'La SCIA (Segnalazione Certificata di Inizio Attività) è una comunicazione asseverata da tecnico abilitato che consente di iniziare i lavori immediatamente, senza attendere autorizzazione preventiva. Si applica a manutenzione straordinaria, restauro, risanamento conservativo, ristrutturazione "leggera" (non comportante modifica di sagoma o volume). Disciplinata dall\'art. 22 DPR 380/2001 e dall\'art. 19 L. 241/1990. Il Comune ha 60 giorni per controlli successivi.',
    example:
      'Per rifare l\'impianto idraulico e ristrutturare i bagni di un appartamento (senza spostare i muri portanti) basta una SCIA.',
    relatedPath: '/statistiche',
  },
  {
    termCode: 'CILA',
    name: 'Comunicazione di Inizio Lavori Asseverata',
    definition:
      'La CILA (Comunicazione di Inizio Lavori Asseverata) è il titolo più leggero del Testo Unico Edilizia: comunica al Comune l\'inizio di lavori di manutenzione straordinaria che non incidono sulle parti strutturali. Richiede asseverazione del tecnico ma NON è soggetta a verifica preventiva. Disciplinata dall\'art. 6-bis DPR 380/2001. Lavori iniziabili immediatamente dopo la presentazione.',
    example:
      'Spostare un tramezzo non portante, rifare la pavimentazione interna o sostituire gli infissi richiede una CILA.',
    relatedPath: '/statistiche',
  },
  {
    termCode: 'PAS',
    name: 'Procedura Abilitativa Semplificata',
    definition:
      'La PAS (Procedura Abilitativa Semplificata) è il titolo edilizio utilizzato per installare impianti di produzione di energia da fonti rinnovabili (fotovoltaico, eolico, biomasse) di piccola e media taglia. Disciplinata dal D.Lgs. 28/2011 art. 6. È intermedia tra autorizzazione unica e comunicazione: silenzio-assenso dopo 30 giorni dalla presentazione.',
    example:
      'Installare un impianto fotovoltaico da 60 kWp su tetto industriale richiede la PAS al Comune.',
  },
  {
    termCode: 'DIA',
    name: 'Denuncia di Inizio Attività',
    definition:
      'La DIA (Denuncia di Inizio Attività) era il titolo edilizio precursore della SCIA, abrogato dal D.L. 138/2011 per le procedure ordinarie. Oggi sopravvive solo come "Super DIA" alternativa al PDC in casi specifici (art. 23 DPR 380/2001). Non confonderla con la SCIA: la DIA prevedeva attesa di 30 giorni prima dell\'inizio lavori.',
  },
  {
    termCode: 'AlboPretorio',
    name: 'Albo Pretorio comunale',
    definition:
      'L\'Albo Pretorio è la sezione del sito web comunale in cui per obbligo di legge (L. 69/2009 art. 32) vengono pubblicati tutti gli atti amministrativi del Comune: delibere, permessi di costruire, SCIA, CILA, ordinanze, bandi di gara. La pubblicazione è obbligatoria per 15 giorni consecutivi e conferisce efficacia giuridica agli atti. Italia Cantieri legge sistematicamente gli Albi Pretori dei Comuni italiani.',
    example:
      'I PDC rilasciati dal Comune di Bologna sono consultabili online sull\'Albo Pretorio comunale per 15 giorni dalla data di rilascio.',
    relatedPath: '/come-trattiamo-i-dati',
  },
  {
    termCode: 'Catasto',
    name: 'Catasto edilizio urbano',
    definition:
      'Il Catasto è l\'inventario di tutti gli immobili italiani gestito dall\'Agenzia delle Entrate. Ogni unità immobiliare ha identificativi univoci: foglio, particella, subalterno. La visura catastale riporta intestatari, categoria (es. A/3 abitazione civile), classe, rendita catastale. Il Catasto non costituisce prova di proprietà ma è essenziale per ogni pratica edilizia.',
    example:
      'Prima di iniziare un cantiere, il progettista verifica la conformità catastale dell\'immobile (es. nessuna variazione non dichiarata).',
  },
  {
    termCode: 'Cantiere',
    name: 'Cantiere edilizio',
    definition:
      'Il cantiere edilizio è il luogo fisico in cui si svolgono attività di costruzione, ampliamento, demolizione, manutenzione o ristrutturazione di un\'opera edile o di ingegneria civile. Disciplinato dal D.Lgs. 81/2008 (Testo Unico Sicurezza) e dal DPR 380/2001 (Testo Unico Edilizia). Ogni cantiere deve avere un titolo edilizio valido (PDC, SCIA, CILA) e un Coordinatore della Sicurezza in caso di più imprese.',
    example:
      'Un cantiere di ristrutturazione di un condominio in centro a Torino con 4 imprese affidatarie richiede il Piano di Sicurezza e Coordinamento (PSC).',
    relatedPath: '/regioni',
  },
  {
    termCode: 'Concessione',
    name: 'Concessione edilizia',
    definition:
      'La Concessione edilizia era il titolo abilitativo edilizio in vigore fino al 2003, sostituita dal Permesso di Costruire con il DPR 380/2001. Disciplinata originariamente dalla L. 10/1977 (Legge Bucalossi). Oggi il termine sopravvive nel linguaggio comune ma normativamente è scorretto: si usa "Permesso di Costruire" (PDC).',
  },
  {
    termCode: 'Bando',
    name: 'Bando di gara pubblico',
    definition:
      'Il Bando di gara pubblico è l\'atto formale con cui un\'amministrazione pubblica (Comune, Provincia, Regione, ASL, ecc.) avvia una procedura per affidare un appalto di lavori, servizi o forniture. Disciplinato dal D.Lgs. 36/2023 (Nuovo Codice degli Appalti). Tipologie principali: procedura aperta, ristretta, competitiva con negoziazione, dialogo competitivo. Pubblicato su ANAC e sui portali appalti regionali.',
    example:
      'Un Comune che vuole ristrutturare una scuola pubblica con importo > 150K € deve pubblicare un bando di gara aperto e selezionare l\'impresa tramite procedura competitiva.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'Appalto',
    name: 'Appalto pubblico',
    definition:
      'L\'Appalto pubblico è il contratto a titolo oneroso stipulato tra una stazione appaltante (PA) e un operatore economico (impresa) per l\'esecuzione di lavori, fornitura di prodotti o prestazione di servizi. Disciplinato dal D.Lgs. 36/2023. Si distingue per soglia di importo: sotto-soglia (< €5,3M lavori) o sopra-soglia (> €5,3M lavori, comunitario).',
    relatedPath: '/bandi',
  },
  {
    termCode: 'ITP',
    name: 'Importo a base d\'asta',
    definition:
      'L\'ITP (Importo a base d\'asta) o "importo a base di gara" è il valore massimo dell\'appalto fissato dalla stazione appaltante nel bando, sul quale le imprese formulano ribassi percentuali nella loro offerta. Comprende l\'importo dei lavori più gli oneri della sicurezza non soggetti a ribasso. È uno dei parametri chiave per valutare l\'opportunità commerciale di un bando.',
    example:
      'Bando con ITP €450.000: l\'impresa offre uno sconto del 18% e si aggiudica i lavori a €369.000.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'CIG',
    name: 'Codice Identificativo Gara',
    definition:
      'Il CIG (Codice Identificativo Gara) è un codice univoco alfanumerico rilasciato da ANAC per ogni procedura di affidamento pubblico, indipendentemente dall\'importo. Obbligatorio dal 2010 per la tracciabilità dei flussi finanziari (L. 136/2010). Senza CIG il contratto è nullo e l\'impresa non può fatturare alla PA.',
  },
  {
    termCode: 'CUP',
    name: 'Codice Unico di Progetto',
    definition:
      'Il CUP (Codice Unico di Progetto) è il codice che identifica univocamente ogni progetto di investimento pubblico finanziato con risorse statali. Obbligatorio per investimenti, lavori pubblici e incentivi (PNRR incluso). Diverso dal CIG: il CUP segue il progetto in tutte le sue fasi, il CIG identifica la singola gara.',
  },
  {
    termCode: 'OG',
    name: 'Categorie OG (Opere Generali)',
    definition:
      'Le categorie OG (Opere Generali) sono le 13 classificazioni SOA per opere edili e civili generali: OG1 edifici civili e industriali, OG2 restauro beni tutelati, OG3 strade autostrade ponti, OG4 opere d\'arte sotterranee, OG5 dighe, OG6 acquedotti gasdotti, OG7 opere marittime, OG8 opere fluviali, OG9 impianti energia, OG10 impianti trasporto energia, OG11 impianti tecnologici, OG12 bonifica beni inquinati, OG13 opere ambientali. Necessarie per gare pubbliche sopra €150K.',
    example:
      'Un\'impresa che vuole partecipare a gare per costruire scuole pubbliche deve possedere la qualificazione SOA OG1 classifica III o superiore.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'OS',
    name: 'Categorie OS (Opere Specializzate)',
    definition:
      'Le categorie OS (Opere Specializzate) sono le classificazioni SOA per lavori specialistici, attualmente 35 categorie (OS1-OS35). Esempi: OS2 superfici decorate beni storici, OS6 finiture opere generali edili, OS8 opere strutturali in cemento armato, OS18 componenti strutturali in acciaio, OS28 impianti termici e condizionamento, OS30 impianti elettrici. Spesso a "qualificazione obbligatoria" (le imprese devono possederle direttamente o subappaltare).',
    relatedPath: '/bandi',
  },
  {
    termCode: 'OSA',
    name: 'Operatore economico singolo / aggregato',
    definition:
      'L\'OSA (Operatore Singolo o Aggregato) è la denominazione tecnica usata in ambito appalti pubblici per indicare la parte contrattuale dal lato impresa. Può essere un\'impresa individuale, una società, un consorzio, un RTI (Raggruppamento Temporaneo di Imprese), un GEIE.',
  },
  {
    termCode: 'Subappalto',
    name: 'Subappalto',
    definition:
      'Il Subappalto è il contratto con cui l\'impresa aggiudicataria di un appalto pubblico affida l\'esecuzione di una parte dei lavori a un\'altra impresa. Disciplinato dall\'art. 119 D.Lgs. 36/2023. Limite massimo: 49% del valore complessivo dell\'appalto (con eccezioni). Soggetto ad autorizzazione preventiva della stazione appaltante e verifiche antimafia.',
    example:
      'L\'impresa generale aggiudicataria di una scuola appalta gli impianti elettrici a un\'impresa specializzata in OS30: questo è un subappalto.',
  },
  {
    termCode: 'Visura',
    name: 'Visura catastale ed edilizia',
    definition:
      'La Visura è il documento ufficiale che attesta lo stato giuridico-amministrativo di un immobile. La visura catastale (Agenzia delle Entrate) riporta intestatari, categoria, rendita; la visura edilizia (Comune) riporta tutti i titoli edilizi rilasciati (PDC, SCIA, CILA, condoni). Indispensabile per ogni compravendita o nuova pratica edilizia.',
  },
  {
    termCode: 'Pratica',
    name: 'Pratica edilizia',
    definition:
      'La Pratica edilizia è l\'insieme dei documenti tecnici e amministrativi presentati al Comune (Sportello Unico Edilizia, SUE) per richiedere un titolo abilitativo edilizio (PDC, SCIA, CILA) o per comunicare l\'avvenuto inizio o fine lavori. Comprende relazione tecnica, elaborati grafici, calcoli strutturali, asseverazioni, autocertificazioni.',
  },
  {
    termCode: 'Variante',
    name: 'Variante in corso d\'opera',
    definition:
      'La Variante in corso d\'opera è la modifica del progetto edilizio approvato, presentata al Comune durante l\'esecuzione dei lavori. Disciplinata dall\'art. 22 e 23 DPR 380/2001. Si distingue in: varianti essenziali (richiedono nuovo PDC), varianti minori (basta SCIA), varianti non sostanziali (basta CILA o comunicazione finale).',
    example:
      'Durante la costruzione si decide di aggiungere un balcone: serve presentare una variante (SCIA in variante o nuovo PDC a seconda dell\'incidenza).',
  },
  {
    termCode: 'Sanatoria',
    name: 'Sanatoria edilizia',
    definition:
      'La Sanatoria edilizia (o accertamento di conformità) è la procedura per regolarizzare opere edili realizzate senza titolo o in difformità (art. 36-37 DPR 380/2001). Si applica solo se l\'opera è conforme alla disciplina urbanistica vigente sia al momento della realizzazione sia al momento della richiesta ("doppia conformità"). Sanzione: oblazione pari al doppio del costo di costruzione.',
  },
  {
    termCode: 'Agibilita',
    name: 'Agibilità',
    definition:
      'L\'Agibilità è la certificazione tecnica obbligatoria che attesta la sicurezza, igiene, salubrità e risparmio energetico di un edificio nuovo o ristrutturato. Disciplinata dagli artt. 24-26 DPR 380/2001. Dal 2016 si presenta come SCIA agibilità (autocertificazione). Necessaria per occupare/affittare/vendere l\'immobile.',
  },
  {
    termCode: 'Abitabilita',
    name: 'Abitabilità',
    definition:
      'L\'Abitabilità è il termine storicamente usato per certificare l\'idoneità abitativa di un immobile residenziale, oggi confluito nell\'unico concetto di Agibilità (art. 24 DPR 380/2001). Riguarda altezza minima dei locali, superficie minima, requisiti igienico-sanitari, isolamento termico.',
  },
  {
    termCode: 'Condono',
    name: 'Condono edilizio',
    definition:
      'Il Condono edilizio è la sanatoria straordinaria di opere abusive, concessa in passato con leggi ad hoc (L. 47/1985, L. 724/1994, L. 326/2003). A differenza della sanatoria ordinaria, il condono regolarizza anche opere NON conformi alla disciplina urbanistica vigente. Oggi non sono attivi nuovi condoni: le ultime domande sono ancora in fase di smaltimento amministrativo.',
  },
  {
    termCode: 'SUE',
    name: 'Sportello Unico Edilizia',
    definition:
      'Lo SUE (Sportello Unico Edilizia) è l\'ufficio comunale dedicato alla ricezione e gestione di tutte le pratiche edilizie (PDC, SCIA, CILA, varianti, agibilità). Disciplinato dall\'art. 5 DPR 380/2001. Funziona come "front-office unico" per cittadini, tecnici e imprese, raccordandosi con ASL, VVF, Soprintendenza, altri enti.',
  },
  {
    termCode: 'SOA',
    name: 'Attestazione SOA',
    definition:
      'L\'attestazione SOA (Società Organismi di Attestazione) è il documento obbligatorio per partecipare a gare pubbliche di lavori sopra €150.000. Certifica la capacità tecnico-economica dell\'impresa nelle categorie OG e OS. Rilasciata da organismi privati autorizzati da ANAC, ha validità di 5 anni con verifica triennale.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'PSC',
    name: 'Piano di Sicurezza e Coordinamento',
    definition:
      'Il PSC (Piano di Sicurezza e Coordinamento) è il documento obbligatorio per cantieri con più di un\'impresa, redatto dal Coordinatore della Sicurezza in Fase di Progettazione (CSP). Disciplinato dal D.Lgs. 81/2008 (Allegato XV). Contiene analisi rischi, misure preventive, layout cantiere, procedure di emergenza. Senza PSC i lavori non possono iniziare.',
  },
];

export default function GlossarioPage() {
  // Ordina alfabeticamente per name
  const sorted = [...TERMS].sort((a, b) => a.name.localeCompare(b.name, 'it'));

  return (
    <>
      {/* DefinedTermSet JSON-LD per AI engines + Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(glossaryLd('Glossario edilizia italiana — Italia Cantieri', sorted)),
        }}
      />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-5xl">
          <BreadcrumbCantiere steps={[{ label: 'Glossario' }]} />

          {/* HEADER EDITORIAL */}
          <div className="mb-16 md:mb-20 max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Riferimento tecnico · Edilizia italiana</span>
            </p>
            <h1
              className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8"
              style={{ fontSize: 'clamp(2.5rem, 6vw + 0.5rem, 5.5rem)' }}
            >
              Glossario<br className="hidden sm:block" />
              <span className="italic font-black text-construction">edilizia italiana</span>.
            </h1>
            {/*
              HIGH-3 FEATURED SNIPPET: risposta DIRETTA fattuale nei primi 60 caratteri.
              AI Overview e Google snippet preferiscono frase iniziale corta + dato numerico.
            */}
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">
                {sorted.length}
              </span>
              termini tecnici dell\'edilizia italiana definiti con accuratezza: dai titoli edilizi (PDC, SCIA, CILA, PAS, DIA)
              alle categorie SOA (OG, OS), dagli appalti pubblici (CIG, CUP, ITP) ai documenti catastali. Definizioni allineate
              al DPR 380/2001 e al D.Lgs. 36/2023.
            </p>
          </div>

          {/* INDICE ALFABETICO compatto */}
          <nav
            aria-label="Indice del glossario"
            className="mb-12 rounded-3xl border border-border bg-secondary/30 p-5 md:p-7"
          >
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Search className="h-3.5 w-3.5" strokeWidth={2} />
              Indice rapido
            </p>
            <ul className="flex flex-wrap gap-2 md:gap-2.5">
              {sorted.map((t) => (
                <li key={t.termCode}>
                  <a
                    href={`#${t.termCode.toLowerCase()}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {t.termCode}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* LISTA DEFINIZIONI */}
          <dl className="space-y-10 md:space-y-14">
            {sorted.map((term) => (
              <article
                key={term.termCode}
                id={term.termCode.toLowerCase()}
                className="scroll-mt-32 border-l-2 border-foreground/15 hover:border-construction transition-colors pl-6 md:pl-8 py-2"
              >
                <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                  <span className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-black tracking-wider uppercase">
                    {term.termCode}
                  </span>
                  <dt className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-foreground leading-tight">
                    {term.name}
                  </dt>
                </div>
                <dd className="space-y-3 max-w-3xl">
                  <p className="text-base md:text-lg leading-relaxed text-secondary-text text-pretty">
                    {term.definition}
                  </p>
                  {term.example && (
                    <p className="text-sm md:text-base italic text-muted-foreground leading-relaxed border-l-2 border-construction pl-4 py-1">
                      <span className="font-bold not-italic text-foreground">Esempio:</span> {term.example}
                    </p>
                  )}
                  {term.relatedPath && (
                    <p className="text-sm pt-2">
                      <Link
                        href={term.relatedPath}
                        className="inline-flex items-center gap-1.5 text-foreground font-semibold underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors"
                      >
                        Approfondisci →
                      </Link>
                    </p>
                  )}
                </dd>
              </article>
            ))}
          </dl>

          {/* CTA finale */}
          <div className="mt-20 md:mt-24 rounded-[2rem] border border-border bg-secondary/30 p-8 md:p-12 text-center">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
              <span>Continua a esplorare</span>
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
            </p>
            <h2 className="text-2xl md:text-4xl font-black tracking-[-0.035em] mb-4 text-foreground">
              Vuoi vedere i cantieri pubblicati in Italia?
            </h2>
            <p className="text-secondary-text max-w-2xl mx-auto mb-8 leading-relaxed">
              Cerca cantieri per regione, provincia o Comune. Ogni scheda riporta il titolo edilizio,
              l\'importo lavori, la categoria di intervento e la fonte ufficiale di pubblicazione.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/regioni"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                Esplora i cantieri per regione
              </Link>
              <Link
                href="/bandi"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-secondary/40"
              >
                Vedi i bandi di gara
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
