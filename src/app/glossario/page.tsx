/**
 * Pagina /glossario — definizioni dei termini di bandi e gare d'appalto.
 *
 * Target keyword informazionali (CIG, CUP, CPV, SOA, RTI, stazione appaltante,
 * procedura aperta/negoziata, aggiudicazione, RUP, MEPA, ecc.).
 * Stack AEO: DefinedTermSet schema.org + HTML semantico <dl><dt><dd>.
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

export const revalidate = 86400;

const ogImage = ogImageUrl({
  title: 'Glossario degli appalti pubblici',
  subtitle: 'CIG, CUP, CPV, SOA, RTI e tutti i termini delle gare d\'appalto',
  kind: 'glossario',
  label: 'termini definiti',
});

export const metadata: Metadata = {
  title: 'Glossario appalti pubblici — CIG, CUP, CPV, SOA, RTI e termini delle gare',
  description:
    'Glossario completo dei termini di bandi e gare d\'appalto pubbliche: CIG, CUP, CPV, SOA, RTI, stazione appaltante, procedura aperta, negoziata, aggiudicazione, RUP, MEPA. Definizioni allineate al D.Lgs. 36/2023.',
  alternates: { canonical: '/glossario' },
  keywords: [
    'glossario appalti',
    'cosa significa CIG',
    'CPV codice appalto',
    'attestazione SOA',
    'cos\'è un RTI',
    'stazione appaltante definizione',
    'procedura aperta appalto',
  ],
  openGraph: {
    title: 'Glossario appalti pubblici — BandiGareDappalto',
    description: 'CIG, CUP, CPV, SOA, RTI, stazione appaltante e tutti i termini delle gare d\'appalto spiegati con definizioni accurate.',
    url: '/glossario',
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630, alt: 'Glossario appalti pubblici' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glossario appalti pubblici',
    description: 'CIG, CUP, CPV, SOA, RTI e tutti i termini delle gare d\'appalto.',
    images: [ogImage],
  },
};

const TERMS: GlossaryTerm[] = [
  {
    termCode: 'CIG',
    name: 'Codice Identificativo Gara',
    definition:
      'Il CIG (Codice Identificativo Gara) è un codice alfanumerico univoco rilasciato dall\'autorità di vigilanza sui contratti pubblici per ogni procedura di affidamento pubblico, a prescindere dall\'importo. Obbligatorio dal 2010 per la tracciabilità dei flussi finanziari (L. 136/2010). Senza CIG il contratto è nullo e l\'impresa non può fatturare alla Pubblica Amministrazione.',
    example: 'Ogni bando di gara riporta il proprio CIG: è il codice da indicare in fattura e in tutti i pagamenti collegati all\'appalto.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'CUP',
    name: 'Codice Unico di Progetto',
    definition:
      'Il CUP (Codice Unico di Progetto) identifica univocamente ogni progetto di investimento pubblico finanziato con risorse statali, comunitarie o PNRR. A differenza del CIG, che identifica la singola gara, il CUP segue il progetto in tutte le sue fasi, dalla programmazione alla realizzazione.',
    example: 'Un\'opera finanziata dal PNRR avrà un CUP che resta invariato anche se l\'opera è divisa in più appalti, ciascuno con il proprio CIG.',
  },
  {
    termCode: 'CPV',
    name: 'Common Procurement Vocabulary',
    definition:
      'Il CPV (Vocabolario Comune per gli Appalti) è la classificazione europea standard che identifica l\'oggetto di un appalto pubblico tramite un codice numerico. Le prime due cifre indicano la divisione (es. 45 = lavori di costruzione, 71 = servizi di architettura e ingegneria). Permette di cercare le gare per tipologia in tutta l\'Unione Europea.',
    example: 'Una gara per la progettazione di una scuola avrà un CPV che inizia per 71 (servizi di architettura e ingegneria).',
    relatedPath: '/categoria/lavori-di-costruzione',
  },
  {
    termCode: 'SOA',
    name: 'Attestazione SOA',
    definition:
      'L\'attestazione SOA (Società Organismi di Attestazione) è il documento obbligatorio per partecipare a gare pubbliche di lavori di importo superiore a 150.000 €. Certifica la capacità tecnico-economica dell\'impresa nelle categorie OG (opere generali) e OS (opere specializzate). Rilasciata da organismi privati autorizzati dall\'autorità di vigilanza sui contratti pubblici, ha validità di 5 anni con verifica triennale.',
    example: 'Un\'impresa che vuole partecipare alla gara per costruire una scuola deve possedere la SOA OG1 nella classifica adeguata all\'importo.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'StazioneAppaltante',
    name: 'Stazione appaltante',
    definition:
      'La stazione appaltante è l\'amministrazione o l\'ente pubblico che avvia e gestisce una procedura di gara per affidare lavori, servizi o forniture. Può essere un Comune, una Provincia, una Regione, una ASL, una centrale unica di committenza (CUC) o una stazione unica appaltante (SUA). È il soggetto che pubblica il bando e aggiudica il contratto.',
    example: 'Una Centrale Unica di Committenza gestisce le gare per conto di più Comuni associati, riducendo i costi e aumentando la trasparenza.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'RUP',
    name: 'Responsabile Unico del Progetto',
    definition:
      'Il RUP (Responsabile Unico del Progetto, già "del Procedimento") è il funzionario della stazione appaltante che sovrintende a tutte le fasi dell\'appalto: programmazione, progettazione, affidamento ed esecuzione. Disciplinato dall\'art. 15 del D.Lgs. 36/2023. È il punto di riferimento istituzionale della gara.',
  },
  {
    termCode: 'Bando',
    name: 'Bando di gara',
    definition:
      'Il bando di gara è l\'atto formale con cui una stazione appaltante avvia una procedura per affidare un appalto di lavori, servizi o forniture. Disciplinato dal D.Lgs. 36/2023 (Codice dei Contratti Pubblici). Indica oggetto, importo a base di gara, requisiti di partecipazione, criterio di aggiudicazione e termine per le offerte.',
    example: 'Un Comune che vuole ristrutturare una scuola con importo superiore alla soglia pubblica un bando di gara aperto.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'Appalto',
    name: 'Appalto pubblico',
    definition:
      'L\'appalto pubblico è il contratto a titolo oneroso tra una stazione appaltante e un operatore economico per l\'esecuzione di lavori, la fornitura di beni o la prestazione di servizi. Disciplinato dal D.Lgs. 36/2023. Si distingue per soglia di importo in sotto-soglia e sopra-soglia (di rilevanza comunitaria).',
    relatedPath: '/bandi',
  },
  {
    termCode: 'ProceduraAperta',
    name: 'Procedura aperta',
    definition:
      'La procedura aperta è la modalità di gara in cui qualsiasi operatore economico in possesso dei requisiti può presentare un\'offerta. È la procedura più trasparente e concorrenziale, disciplinata dall\'art. 71 del D.Lgs. 36/2023. È la più diffusa per gli appalti di importo rilevante.',
    example: 'Per un appalto di lavori sopra-soglia la stazione appaltante sceglie tipicamente la procedura aperta, garantendo la massima concorrenza.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'ProceduraRistretta',
    name: 'Procedura ristretta',
    definition:
      'Nella procedura ristretta possono presentare offerta solo gli operatori invitati dalla stazione appaltante a seguito di una fase di prequalifica. Disciplinata dall\'art. 72 del D.Lgs. 36/2023. Si usa quando serve selezionare preventivamente i concorrenti in base a requisiti specifici.',
  },
  {
    termCode: 'ProceduraNegoziata',
    name: 'Procedura negoziata',
    definition:
      'La procedura negoziata consente alla stazione appaltante di consultare e negoziare le condizioni del contratto con gli operatori selezionati. Può essere con o senza previa pubblicazione del bando. Disciplinata dagli artt. 73-76 del D.Lgs. 36/2023. È ammessa solo nei casi previsti dalla legge.',
  },
  {
    termCode: 'Aggiudicazione',
    name: 'Aggiudicazione',
    definition:
      'L\'aggiudicazione è il provvedimento con cui la stazione appaltante individua il vincitore della gara, ossia l\'operatore economico che ha presentato l\'offerta migliore secondo il criterio prestabilito (prezzo più basso o offerta economicamente più vantaggiosa). Diventa efficace dopo la verifica dei requisiti.',
    example: 'Dopo l\'aggiudicazione, la stazione appaltante stipula il contratto con l\'impresa vincitrice e l\'opera può partire.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'Aggiudicatario',
    name: 'Aggiudicatario',
    definition:
      'L\'aggiudicatario è l\'operatore economico (impresa, società o raggruppamento) che si è aggiudicato la gara e con cui la stazione appaltante stipula il contratto. Sul portale mostriamo la ragione sociale dell\'aggiudicatario quando la gara è stata aggiudicata: è un dato pubblico relativo a persone giuridiche.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'RTI',
    name: 'Raggruppamento Temporaneo di Imprese',
    definition:
      'Il RTI (Raggruppamento Temporaneo di Imprese), o ATI, è un\'aggregazione tra più operatori economici che partecipano insieme a una gara per sommare i requisiti e le capacità. È composto da una mandataria (capogruppo) e da una o più mandanti. Disciplinato dall\'art. 68 del D.Lgs. 36/2023.',
    example: 'Per un grande appalto di lavori, tre imprese si uniscono in RTI: la mandataria coordina, le mandanti eseguono parti specifiche.',
  },
  {
    termCode: 'OG',
    name: 'Categorie OG (Opere Generali)',
    definition:
      'Le categorie OG (Opere Generali) sono le classificazioni SOA per opere edili e civili generali (OG1 edifici civili e industriali, OG2 restauro beni tutelati, OG3 strade e ponti, e così via fino a OG13). Indicano l\'ambito di lavori per cui un\'impresa è qualificata a partecipare alle gare pubbliche sopra 150.000 €.',
    relatedPath: '/categoria/lavori-di-costruzione',
  },
  {
    termCode: 'OS',
    name: 'Categorie OS (Opere Specializzate)',
    definition:
      'Le categorie OS (Opere Specializzate) sono le classificazioni SOA per lavori specialistici (OS1-OS35): ad esempio OS6 finiture, OS8 strutture in cemento armato, OS28 impianti termici, OS30 impianti elettrici. Alcune sono a qualificazione obbligatoria: l\'impresa deve possederle o subappaltarle a una specializzata.',
    relatedPath: '/categoria/lavori-di-costruzione',
  },
  {
    termCode: 'OEPV',
    name: 'Offerta economicamente più vantaggiosa',
    definition:
      'L\'OEPV (Offerta Economicamente Più Vantaggiosa) è il criterio di aggiudicazione che valuta l\'offerta non solo sul prezzo ma su un mix di prezzo e qualità (tecnica, ambientale, tempi). Disciplinata dall\'art. 108 del D.Lgs. 36/2023, è il criterio preferenziale per appalti complessi e ad alto contenuto tecnico.',
  },
  {
    termCode: 'Ribasso',
    name: 'Ribasso d\'asta',
    definition:
      'Il ribasso d\'asta è la percentuale di sconto che l\'operatore economico offre rispetto all\'importo a base di gara. Nelle gare al prezzo più basso vince chi offre il ribasso maggiore (salvo verifica delle offerte anomale). È un indicatore chiave dell\'andamento del mercato degli appalti.',
    example: 'Bando con base di gara 450.000 €: l\'impresa offre un ribasso del 18% e si aggiudica i lavori a 369.000 €.',
  },
  {
    termCode: 'BaseDiGara',
    name: 'Importo a base di gara',
    definition:
      'L\'importo a base di gara (o base d\'asta) è il valore massimo dell\'appalto fissato dalla stazione appaltante, su cui gli operatori formulano i propri ribassi. Comprende l\'importo dei lavori o servizi più gli oneri della sicurezza non soggetti a ribasso. È il primo parametro per valutare l\'opportunità commerciale di un bando.',
    relatedPath: '/bandi',
  },
  {
    termCode: 'Subappalto',
    name: 'Subappalto',
    definition:
      'Il subappalto è il contratto con cui l\'impresa aggiudicataria affida l\'esecuzione di una parte dei lavori a un\'altra impresa. Disciplinato dall\'art. 119 del D.Lgs. 36/2023. È soggetto ad autorizzazione della stazione appaltante e a verifiche antimafia.',
  },
  {
    termCode: 'MEPA',
    name: 'Mercato Elettronico della PA',
    definition:
      'Il MEPA (Mercato Elettronico della Pubblica Amministrazione) è la piattaforma di e-procurement gestita da Consip su cui le amministrazioni acquistano beni e servizi sotto-soglia direttamente dai cataloghi delle imprese abilitate. Riduce tempi e costi degli affidamenti di importo contenuto.',
  },
  {
    termCode: 'BDNCP',
    name: 'Banca Dati Nazionale dei Contratti Pubblici',
    definition:
      'La Banca Dati Nazionale dei Contratti Pubblici è il registro istituzionale che raccoglie le informazioni sulle procedure di affidamento pubblico in Italia, dalla pubblicazione del bando all\'aggiudicazione. È, insieme ai portali appalti istituzionali italiani ed europei, una delle fonti ufficiali e pubbliche da cui BandiGareDappalto aggrega i dati delle gare.',
    relatedPath: '/come-trattiamo-i-dati',
  },
  {
    termCode: 'PNRR',
    name: 'Piano Nazionale di Ripresa e Resilienza',
    definition:
      'Il PNRR è il programma di investimenti finanziato dall\'Unione Europea (Next Generation EU) per la ripresa post-pandemia. Una parte rilevante delle gare d\'appalto pubbliche italiane è finanziata dal PNRR, riconoscibile dal CUP e da specifici obblighi di rendicontazione e tempistiche.',
  },
  {
    termCode: 'SottoSoglia',
    name: 'Appalto sotto-soglia',
    definition:
      'Un appalto è sotto-soglia quando il suo importo è inferiore alle soglie di rilevanza comunitaria fissate periodicamente dall\'UE. Per questi appalti il D.Lgs. 36/2023 prevede procedure semplificate (affidamento diretto, procedura negoziata) per ridurre tempi e oneri.',
  },
  {
    termCode: 'SopraSoglia',
    name: 'Appalto sopra-soglia',
    definition:
      'Un appalto è sopra-soglia quando il suo importo supera le soglie comunitarie. In questo caso è obbligatoria la pubblicazione anche a livello europeo (Gazzetta Ufficiale UE) e si applicano le procedure ordinarie (aperta o ristretta) con tempi e garanzie maggiori.',
    relatedPath: '/bandi',
  },
];

export default function GlossarioPage() {
  const sorted = [...TERMS].sort((a, b) => a.name.localeCompare(b.name, 'it'));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(glossaryLd('Glossario degli appalti pubblici — BandiGareDappalto', sorted)),
        }}
      />

      <section className="pt-32 md:pt-40 pb-12 md:pb-16">
        <div className="container-zen max-w-5xl">
          <BreadcrumbCantiere steps={[{ label: 'Glossario' }]} />

          <div className="mb-16 md:mb-20 max-w-4xl">
            <p className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Riferimento · Appalti pubblici</span>
            </p>
            <h1 className="font-black tracking-[-0.05em] leading-[0.92] text-foreground text-balance mb-8" style={{ fontSize: 'clamp(2.5rem, 6vw + 0.5rem, 5.5rem)' }}>
              Glossario degli<br className="hidden sm:block" />
              <span className="italic font-black text-construction">appalti pubblici</span>.
            </h1>
            <p className="text-lg md:text-xl font-light leading-relaxed text-secondary-text max-w-3xl text-pretty">
              <span className="font-black tabular-nums text-foreground text-2xl md:text-3xl mr-1.5 tracking-tight">{sorted.length}</span>
              termini delle gare d&apos;appalto definiti con accuratezza: dai codici (CIG, CUP, CPV) alle qualificazioni
              (SOA, OG, OS), dalle procedure (aperta, ristretta, negoziata) agli attori (stazione appaltante, RUP, RTI).
              Definizioni allineate al D.Lgs. 36/2023, il Codice dei Contratti Pubblici.
            </p>
          </div>

          <nav aria-label="Indice del glossario" className="mb-12 rounded-3xl border border-border bg-secondary/30 p-5 md:p-7">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Search className="h-3.5 w-3.5" strokeWidth={2} /> Indice rapido
            </p>
            <ul className="flex flex-wrap gap-2 md:gap-2.5">
              {sorted.map((t) => (
                <li key={t.termCode}>
                  <a href={`#${t.termCode.toLowerCase()}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-foreground transition-all hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {t.name.length > 22 ? t.termCode : t.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <dl className="space-y-10 md:space-y-14">
            {sorted.map((term) => (
              <article key={term.termCode} id={term.termCode.toLowerCase()} className="scroll-mt-32 border-l-2 border-foreground/15 hover:border-construction transition-colors pl-6 md:pl-8 py-2">
                <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                  <dt className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-foreground leading-tight">{term.name}</dt>
                </div>
                <dd className="space-y-3 max-w-3xl">
                  <p className="text-base md:text-lg leading-relaxed text-secondary-text text-pretty">{term.definition}</p>
                  {term.example && (
                    <p className="text-sm md:text-base italic text-muted-foreground leading-relaxed border-l-2 border-construction pl-4 py-1">
                      <span className="font-bold not-italic text-foreground">Esempio:</span> {term.example}
                    </p>
                  )}
                  {term.relatedPath && (
                    <p className="text-sm pt-2">
                      <Link href={term.relatedPath} className="inline-flex items-center gap-1.5 text-foreground font-semibold underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors">
                        Approfondisci →
                      </Link>
                    </p>
                  )}
                </dd>
              </article>
            ))}
          </dl>

          <div className="mt-20 md:mt-24 rounded-[2rem] border border-border bg-secondary/30 p-8 md:p-12 text-center">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
              <span>Continua a esplorare</span>
              <span aria-hidden="true" className="h-px w-8 bg-foreground/30" />
            </p>
            <h2 className="text-2xl md:text-4xl font-black tracking-[-0.035em] mb-4 text-foreground">
              Vuoi vedere i bandi pubblicati in Italia?
            </h2>
            <p className="text-secondary-text max-w-2xl mx-auto mb-8 leading-relaxed">
              Sfoglia le gare d&apos;appalto per categoria CPV, importo e scadenza. Ogni scheda riporta
              l&apos;ente, l&apos;importo a base di gara, il CIG e — quando disponibile — chi se l&apos;è aggiudicata.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/bandi" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                Esplora tutti i bandi
              </Link>
              <Link href="/scadenze" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-foreground/40 hover:bg-secondary/40">
                Bandi in scadenza
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
