/**
 * Estensioni locali MINIME alla taxonomy bandi di `@websonica/cantieri-core`.
 *
 * La taxonomy PRINCIPALE (PROCEDURA_LABELS, BANDO_STATO_LABELS, CPV_GROUP_LABELS,
 * proceduraLabel, statoBandoLabel, cpvGroupLabel) vive nel package ed è la fonte
 * di verità. Qui colmiamo SOLO ciò che il package v0.2.0 non espone ancora e che
 * questo sito usa, senza duplicare la taxonomy.
 *
 * TODO: portare in cantieri-core v0.2.x e poi eliminare questo file:
 *   - funzione `cpvGroup(cpv)` (prefisso a 2 cifre del gruppo CPV)
 *   - copertura `CPV_GROUP_LABELS` per i gruppi a 2 cifre (il package mappa solo
 *     44/45/71 + alcuni sotto-prefissi; il sito raggruppa per prime 2 cifre)
 *   - `CPV_GROUP_EDITORIAL` (testo editoriale per le pagine /categoria/[cpv])
 */
import { cpvGroupLabel as cpvGroupLabelPkg } from '@websonica/cantieri-core';

/** Estrae il gruppo CPV (prime 2 cifre) da un codice CPV. */
export function cpvGroup(cpv: string | null | undefined): string | null {
  if (!cpv) return null;
  const g = cpv.replace(/[^0-9]/g, '').slice(0, 2);
  return g.length === 2 ? g : null;
}

/**
 * Label dei gruppi CPV a 2 cifre NON coperti dalla mappa del package.
 * Il package mappa solo 44/45/71 a 2 cifre (più alcuni sotto-prefissi specifici),
 * ma il sito raggruppa i bandi per prime 2 cifre (getBandiByCpvGroup), quindi
 * servono le divisioni CPV restanti per label leggibili, filtri e pagine categoria.
 * TODO: portare in cantieri-core v0.2.x.
 */
export const CPV_GROUP_LABELS_2D: Record<string, string> = {
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

/**
 * Label leggibile di un gruppo CPV. Fonte primaria: package (`cpvGroupLabelPkg`,
 * match per prefisso più lungo). Fallback: mappa a 2 cifre locale, per i gruppi
 * che il package non copre ancora (es. "90", "50", "33"...).
 * Quando il package restituisce il codice grezzo (nessun match) cadiamo sul
 * dizionario a 2 cifre, così le pagine/card categoria restano leggibili.
 */
export function cpvGroupLabel(cpv: string | null | undefined): string {
  if (!cpv) return cpvGroupLabelPkg(cpv);
  const fromPkg = cpvGroupLabelPkg(cpv);
  // Il package torna il codice grezzo quando non c'è match: in quel caso
  // proviamo il dizionario a 2 cifre locale.
  const normalized = cpv.replace(/[^0-9]/g, '');
  const isRawEcho = fromPkg === cpv || fromPkg === normalized;
  if (!isRawEcho) return fromPkg;
  const g = cpvGroup(cpv);
  if (g && CPV_GROUP_LABELS_2D[g]) return CPV_GROUP_LABELS_2D[g];
  return fromPkg;
}

/**
 * Descrizione editoriale estesa per la pagina hub di categoria (contenuto UNICO,
 * non duplica il dato grezzo CPV). Non è taxonomy ma copy SEO del sito.
 * TODO: valutare se vive meglio nel CMS/sito che nel package core.
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
