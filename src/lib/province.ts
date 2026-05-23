/**
 * Mapping bidirezionale tra slug URL (es. "torino") e sigla provincia (es. "TO").
 *
 * Il DB cantieri_pubblici memorizza la provincia come sigla 2-lettere.
 * Le URL del sito usano il nome esteso slugificato (Torino → torino).
 *
 * Coperte tutte le 110 province italiane (post-soppressione 2015,
 * include citta metropolitane e province autonome).
 */

export const PROVINCIA_SLUG_TO_CODE: Record<string, string> = {
  // Piemonte
  alessandria: 'AL',
  asti: 'AT',
  biella: 'BI',
  cuneo: 'CN',
  novara: 'NO',
  torino: 'TO',
  'verbano-cusio-ossola': 'VB',
  vercelli: 'VC',
  // Valle d'Aosta
  aosta: 'AO',
  // Lombardia
  bergamo: 'BG',
  brescia: 'BS',
  como: 'CO',
  cremona: 'CR',
  lecco: 'LC',
  lodi: 'LO',
  mantova: 'MN',
  milano: 'MI',
  'monza-e-della-brianza': 'MB',
  pavia: 'PV',
  sondrio: 'SO',
  varese: 'VA',
  // Trentino-Alto Adige
  bolzano: 'BZ',
  trento: 'TN',
  // Veneto
  belluno: 'BL',
  padova: 'PD',
  rovigo: 'RO',
  treviso: 'TV',
  venezia: 'VE',
  verona: 'VR',
  vicenza: 'VI',
  // Friuli-Venezia Giulia
  gorizia: 'GO',
  pordenone: 'PN',
  trieste: 'TS',
  udine: 'UD',
  // Liguria
  genova: 'GE',
  imperia: 'IM',
  'la-spezia': 'SP',
  savona: 'SV',
  // Emilia-Romagna
  bologna: 'BO',
  'forli-cesena': 'FC',
  ferrara: 'FE',
  modena: 'MO',
  parma: 'PR',
  piacenza: 'PC',
  ravenna: 'RA',
  'reggio-emilia': 'RE',
  rimini: 'RN',
  // Toscana
  arezzo: 'AR',
  firenze: 'FI',
  grosseto: 'GR',
  livorno: 'LI',
  lucca: 'LU',
  'massa-carrara': 'MS',
  pisa: 'PI',
  pistoia: 'PT',
  prato: 'PO',
  siena: 'SI',
  // Umbria
  perugia: 'PG',
  terni: 'TR',
  // Marche
  ancona: 'AN',
  'ascoli-piceno': 'AP',
  fermo: 'FM',
  macerata: 'MC',
  'pesaro-e-urbino': 'PU',
  // Lazio
  frosinone: 'FR',
  latina: 'LT',
  rieti: 'RI',
  roma: 'RM',
  viterbo: 'VT',
  // Abruzzo
  chieti: 'CH',
  'l-aquila': 'AQ',
  pescara: 'PE',
  teramo: 'TE',
  // Molise
  campobasso: 'CB',
  isernia: 'IS',
  // Campania
  avellino: 'AV',
  benevento: 'BN',
  caserta: 'CE',
  napoli: 'NA',
  salerno: 'SA',
  // Puglia
  bari: 'BA',
  'barletta-andria-trani': 'BT',
  brindisi: 'BR',
  foggia: 'FG',
  lecce: 'LE',
  taranto: 'TA',
  // Basilicata
  matera: 'MT',
  potenza: 'PZ',
  // Calabria
  catanzaro: 'CZ',
  cosenza: 'CS',
  crotone: 'KR',
  'reggio-calabria': 'RC',
  'vibo-valentia': 'VV',
  // Sicilia
  agrigento: 'AG',
  caltanissetta: 'CL',
  catania: 'CT',
  enna: 'EN',
  messina: 'ME',
  palermo: 'PA',
  ragusa: 'RG',
  siracusa: 'SR',
  trapani: 'TP',
  // Sardegna
  cagliari: 'CA',
  nuoro: 'NU',
  oristano: 'OR',
  sassari: 'SS',
  'sud-sardegna': 'SU',
};

/**
 * Mapping inverso: sigla → nome esteso (per generare slug nelle URL).
 * Es. "TO" → "Torino", "BO" → "Bologna".
 */
export const PROVINCIA_CODE_TO_NAME: Record<string, string> = {
  // Piemonte
  AL: 'Alessandria',
  AT: 'Asti',
  BI: 'Biella',
  CN: 'Cuneo',
  NO: 'Novara',
  TO: 'Torino',
  VB: 'Verbano-Cusio-Ossola',
  VC: 'Vercelli',
  // Valle d'Aosta
  AO: 'Aosta',
  // Lombardia
  BG: 'Bergamo',
  BS: 'Brescia',
  CO: 'Como',
  CR: 'Cremona',
  LC: 'Lecco',
  LO: 'Lodi',
  MN: 'Mantova',
  MI: 'Milano',
  MB: 'Monza e della Brianza',
  PV: 'Pavia',
  SO: 'Sondrio',
  VA: 'Varese',
  // Trentino-Alto Adige
  BZ: 'Bolzano',
  TN: 'Trento',
  // Veneto
  BL: 'Belluno',
  PD: 'Padova',
  RO: 'Rovigo',
  TV: 'Treviso',
  VE: 'Venezia',
  VR: 'Verona',
  VI: 'Vicenza',
  // Friuli-Venezia Giulia
  GO: 'Gorizia',
  PN: 'Pordenone',
  TS: 'Trieste',
  UD: 'Udine',
  // Liguria
  GE: 'Genova',
  IM: 'Imperia',
  SP: 'La Spezia',
  SV: 'Savona',
  // Emilia-Romagna
  BO: 'Bologna',
  FC: 'Forli-Cesena',
  FE: 'Ferrara',
  MO: 'Modena',
  PR: 'Parma',
  PC: 'Piacenza',
  RA: 'Ravenna',
  RE: 'Reggio Emilia',
  RN: 'Rimini',
  // Toscana
  AR: 'Arezzo',
  FI: 'Firenze',
  GR: 'Grosseto',
  LI: 'Livorno',
  LU: 'Lucca',
  MS: 'Massa-Carrara',
  PI: 'Pisa',
  PT: 'Pistoia',
  PO: 'Prato',
  SI: 'Siena',
  // Umbria
  PG: 'Perugia',
  TR: 'Terni',
  // Marche
  AN: 'Ancona',
  AP: 'Ascoli Piceno',
  FM: 'Fermo',
  MC: 'Macerata',
  PU: 'Pesaro e Urbino',
  // Lazio
  FR: 'Frosinone',
  LT: 'Latina',
  RI: 'Rieti',
  RM: 'Roma',
  VT: 'Viterbo',
  // Abruzzo
  CH: 'Chieti',
  AQ: "L'Aquila",
  PE: 'Pescara',
  TE: 'Teramo',
  // Molise
  CB: 'Campobasso',
  IS: 'Isernia',
  // Campania
  AV: 'Avellino',
  BN: 'Benevento',
  CE: 'Caserta',
  NA: 'Napoli',
  SA: 'Salerno',
  // Puglia
  BA: 'Bari',
  BT: 'Barletta-Andria-Trani',
  BR: 'Brindisi',
  FG: 'Foggia',
  LE: 'Lecce',
  TA: 'Taranto',
  // Basilicata
  MT: 'Matera',
  PZ: 'Potenza',
  // Calabria
  CZ: 'Catanzaro',
  CS: 'Cosenza',
  KR: 'Crotone',
  RC: 'Reggio Calabria',
  VV: 'Vibo Valentia',
  // Sicilia
  AG: 'Agrigento',
  CL: 'Caltanissetta',
  CT: 'Catania',
  EN: 'Enna',
  ME: 'Messina',
  PA: 'Palermo',
  RG: 'Ragusa',
  SR: 'Siracusa',
  TP: 'Trapani',
  // Sardegna
  CA: 'Cagliari',
  NU: 'Nuoro',
  OR: 'Oristano',
  SS: 'Sassari',
  SU: 'Sud Sardegna',
};

/**
 * Risolve uno slug URL provincia (es. "torino") nella sigla 2-lettere usata nel DB (es. "TO").
 * Ritorna null se non valido.
 */
export function provinciaCodeFromSlug(slug: string): string | null {
  const key = slug.toLowerCase().trim();
  return PROVINCIA_SLUG_TO_CODE[key] ?? null;
}

/**
 * Ritorna lo slug URL canonico per una sigla provincia.
 * Es. "TO" -> "torino", "BO" -> "bologna".
 * Fallback: lowercase della sigla se non mappata.
 */
export function provinciaSlugFromCode(sigla: string): string {
  const code = sigla.toUpperCase().trim();
  const name = PROVINCIA_CODE_TO_NAME[code];
  if (!name) return code.toLowerCase();
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['']/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Restituisce il nome esteso (es. "Torino") da una sigla (es. "TO"),
 * con fallback alla sigla stessa se non mappata.
 */
export function provinciaNameFromCode(sigla: string): string {
  const code = sigla.toUpperCase().trim();
  return PROVINCIA_CODE_TO_NAME[code] ?? sigla;
}
