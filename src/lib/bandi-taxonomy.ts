/**
 * Taxonomy bandi — label leggibili per procedura, stato e gruppi CPV.
 *
 * ⚠️ TEMPORANEO: secondo la spec questi simboli dovrebbero arrivare da
 * `@websonica/cantieri-core` v0.2.0 (PROCEDURA_LABELS, BANDO_STATO_LABELS,
 * CPV_GROUP_LABELS, proceduraLabel/statoBandoLabel/cpvGroupLabel + tipi
 * Bando/GaraVinta/BandiFilters). Il git-dep `#v0.2.0` risolve però al
 * contenuto di v0.1.0, che NON espone ancora la bandi-taxonomy.
 * Quando il package esporrà questi simboli, sostituire gli import qui sotto
 * con `import { ... } from '@websonica/cantieri-core'` e rimuovere questo file.
 */

/** Procedura di gara → label leggibile (valori reali enum in bandi_gara). */
export const PROCEDURA_LABELS: Record<string, string> = {
  aperta: 'Procedura aperta',
  ristretta: 'Procedura ristretta',
  negoziata_con_pubblicazione: 'Procedura negoziata con pubblicazione',
  negoziata_senza_pubblicazione: 'Procedura negoziata senza pubblicazione',
  dialogo_competitivo: 'Dialogo competitivo',
  partenariato_innovazione: 'Partenariato per l\'innovazione',
  affidamento_diretto: 'Affidamento diretto',
};

export function proceduraLabel(value: string | null | undefined): string {
  if (!value) return 'Procedura non specificata';
  return PROCEDURA_LABELS[value] || prettify(value);
}

/** Stato del bando → label leggibile. */
export const BANDO_STATO_LABELS: Record<string, string> = {
  aperto: 'Aperto',
  in_scadenza: 'In scadenza',
  scaduto: 'Scaduto',
  aggiudicato: 'Aggiudicato',
  annullato: 'Annullato',
  deserto: 'Andato deserto',
};

export function statoBandoLabel(value: string | null | undefined): string {
  if (!value) return 'Stato non disponibile';
  return BANDO_STATO_LABELS[value] || prettify(value);
}

/**
 * Gruppi CPV (prime 2 cifre) → label di divisione del Vocabolario Comune Appalti.
 * Coprono i gruppi realmente presenti nel dataset + i principali edilizia/servizi.
 */
export const CPV_GROUP_LABELS: Record<string, string> = {
  '03': 'Prodotti agricoli e forestali',
  '09': 'Prodotti petroliferi ed energia',
  '14': 'Prodotti delle miniere e cave',
  '15': 'Prodotti alimentari e bevande',
  '18': 'Indumenti e accessori',
  '22': 'Stampati e prodotti affini',
  '24': 'Prodotti chimici',
  '30': 'Macchine per ufficio e informatica',
  '31': 'Macchine e apparecchi elettrici',
  '32': 'Apparecchiature per radiotrasmissione e TLC',
  '33': 'Apparecchiature mediche e farmaceutiche',
  '34': 'Attrezzature di trasporto',
  '35': 'Attrezzature di sicurezza e difesa',
  '37': 'Strumenti musicali, articoli sportivi e giochi',
  '38': 'Apparecchiature di laboratorio e di precisione',
  '39': 'Mobili, arredi ed elettrodomestici',
  '42': 'Macchinari industriali',
  '44': 'Strutture e materiali da costruzione',
  '45': 'Lavori di costruzione',
  '48': 'Pacchetti software e sistemi informatici',
  '50': 'Servizi di riparazione e manutenzione',
  '51': 'Servizi di installazione',
  '55': 'Servizi alberghieri, di ristorazione e commercio',
  '60': 'Servizi di trasporto',
  '63': 'Servizi di supporto ai trasporti',
  '64': 'Servizi di poste e telecomunicazioni',
  '65': 'Servizi di pubblica utilità',
  '66': 'Servizi finanziari e assicurativi',
  '70': 'Servizi immobiliari',
  '71': 'Servizi di architettura e ingegneria',
  '72': 'Servizi informatici e affini',
  '73': 'Servizi di ricerca e sviluppo',
  '75': 'Servizi della pubblica amministrazione',
  '76': 'Servizi connessi al settore petrolifero',
  '77': 'Servizi agricoli, forestali e di giardinaggio',
  '79': 'Servizi alle imprese e gestionali',
  '80': 'Servizi di istruzione e formazione',
  '85': 'Servizi sanitari e di assistenza sociale',
  '90': 'Servizi ambientali e di smaltimento rifiuti',
  '92': 'Servizi ricreativi, culturali e sportivi',
  '98': 'Altri servizi di comunità, sociali e personali',
};

/** Estrae il gruppo CPV (prime 2 cifre) da un codice CPV. */
export function cpvGroup(cpv: string | null | undefined): string | null {
  if (!cpv) return null;
  const g = cpv.replace(/[^0-9]/g, '').slice(0, 2);
  return g.length === 2 ? g : null;
}

/** Label leggibile della divisione CPV a partire da un codice o gruppo. */
export function cpvGroupLabel(cpv: string | null | undefined): string {
  const g = cpvGroup(cpv) ?? (cpv ? cpv.slice(0, 2) : null);
  if (!g) return 'Categoria non specificata';
  return CPV_GROUP_LABELS[g] || `Categoria CPV ${g}`;
}

/**
 * Descrizione editoriale estesa per la pagina hub di categoria.
 * Contenuto UNICO (non duplica il dato grezzo CPV) per i gruppi più rilevanti.
 */
export const CPV_GROUP_EDITORIAL: Record<
  string,
  { intro: string; cosa: string; chiVince: string }
> = {
  '45': {
    intro:
      'La divisione CPV 45 raccoglie i lavori di costruzione: nuove opere, ristrutturazioni, manutenzioni straordinarie di edifici e infrastrutture pubbliche. È la categoria più consistente del mercato degli appalti edili in Italia.',
    cosa:
      'Comprende la costruzione di edifici civili e industriali, opere stradali e ponti, impianti tecnologici, opere di urbanizzazione e demolizioni. È la categoria di riferimento per imprese edili generali e specializzate qualificate SOA (categorie OG/OS).',
    chiVince:
      'Vincono tipicamente imprese di costruzione strutturate, spesso in raggruppamento temporaneo (RTI) per gli appalti di importo elevato. Il track record di gare aggiudicate è un indicatore chiave di affidabilità della stazione appaltante.',
  },
  '71': {
    intro:
      'La divisione CPV 71 raccoglie i servizi di architettura e ingegneria: progettazione, direzione lavori, collaudi, studi di fattibilità, indagini geologiche e servizi tecnici per la Pubblica Amministrazione.',
    cosa:
      'Include progettazione architettonica e strutturale, ingegneria civile e impiantistica, urbanistica, servizi di consulenza tecnica e supporto al RUP. È il terreno di gara di studi di progettazione, professionisti e società di ingegneria.',
    chiVince:
      'Si aggiudicano questi incarichi studi tecnici, società di ingegneria e raggruppamenti di professionisti. La capacità di vincere gare di progettazione è un segnale forte di solidità professionale di uno studio.',
  },
  '50': {
    intro:
      'La divisione CPV 50 raccoglie i servizi di riparazione e manutenzione: manutenzione di edifici, impianti, mezzi e attrezzature affidata dalla PA tramite appalto.',
    cosa:
      'Comprende manutenzione di impianti tecnologici, riparazione di immobili e infrastrutture, assistenza tecnica continuativa. Spesso bandita con contratti pluriennali a canone.',
    chiVince:
      'Vincono imprese di facility management e manutenzione specializzata, in grado di garantire continuità del servizio sul territorio.',
  },
  '90': {
    intro:
      'La divisione CPV 90 raccoglie i servizi ambientali: raccolta e smaltimento rifiuti, bonifiche, pulizia e igiene urbana affidati dalla PA.',
    cosa:
      'Include gestione rifiuti urbani, bonifica di siti contaminati, servizi di pulizia e disinfestazione, manutenzione del verde ambientale.',
    chiVince:
      'Si aggiudicano questi appalti imprese di igiene ambientale e multiutility, spesso con contratti di lungo periodo.',
  },
};

function prettify(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}
