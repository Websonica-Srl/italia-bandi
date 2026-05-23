/**
 * Centralized Unsplash image registry — CURATION EDITORIAL-GRADE.
 *
 * Selezione fotografica curata (10 immagini) sostitutiva delle stock
 * mediocri precedenti. Riferimenti estetici: Dezeen, ArchDaily, editorial
 * architecture photography. Predominano cantieri astratti, geometrie
 * architettoniche, modelli e dettagli macro — niente "operai sorridenti"
 * o cartoline turistiche.
 *
 * IMPORTANTE: ogni foto è soggetta a Unsplash License (free for commercial use).
 * Le attribution sono renderizzate dove appropriato (es. cantiere dettaglio).
 *
 * Tutte le URL puntano direttamente al CDN `images.unsplash.com` (già whitelistato
 * in `next.config.js`), così Next.js può ottimizzarle via `next/image` senza
 * dover bundlerizzare i binari nel repo.
 */

type UnsplashImage = {
  id: string;
  src: string;
  blurDataURL?: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
};

const cdn = (photoId: string, w = 2400, h = 1350) =>
  `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&q=85&fm=webp&auto=format`;

// =====================================================================
// HERO PRINCIPALE — homepage
// =====================================================================
// "Construction cranes tower over illuminated city buildings at night"
// Tsuyoshi Kozu. Palette dark teal/blu profondo, gru notturne illuminate.
// Editorial cinematico: comunica "cantieri attivi" senza essere stock.
export const HERO_CONSTRUCTION: UnsplashImage = {
  id: '9CiTaMRARhY',
  src: cdn('photo-1770773757866-207b879ef2a0', 2400, 1350),
  alt:
    'Gru di cantiere notturne contro skyline urbano illuminato, vista cinematografica editorial',
  photographer: 'Tsuyoshi Kozu',
  photographerUrl: 'https://unsplash.com/@tsuyoshikozu',
  photoUrl: 'https://unsplash.com/photos/9CiTaMRARhY',
};

// =====================================================================
// HERO REGIONI — varianti contestuali (sostitutive del vecchio set Milano/Liguria)
// =====================================================================

// "Bosco Verticale Milano vertical garden tower" — Samuele Vigano.
// Architettura italiana contemporanea iconica, blu/grigio elegante.
export const HERO_MILAN_SKYLINE: UnsplashImage = {
  id: 'lY80N-0VcVc',
  src: cdn('photo-1717665084332-347165ce5dbc', 2400, 1350),
  alt: 'Bosco Verticale e architettura contemporanea di Milano in luce drammatica',
  photographer: 'Samuele Vigano',
  photographerUrl: 'https://unsplash.com/@samuvigano',
  photoUrl: 'https://unsplash.com/photos/lY80N-0VcVc',
};

// "Aerial photography of crane overlooking city buildings at night" — Ori Song.
// Crane aerial night, blu drammatico cinematico — alternativa per Piemonte/Lazio.
export const URBAN_CRANE: UnsplashImage = {
  id: 'K_bBJdilFz0',
  src: cdn('photo-1552568165-02cfdb51bc7d', 2400, 1350),
  alt: 'Vista aerea cinematografica di gru di cantiere sopra edifici urbani notturni',
  photographer: 'Ori Song',
  photographerUrl: 'https://unsplash.com/@ori_foto',
  photoUrl: 'https://unsplash.com/photos/K_bBJdilFz0',
};

// "Aerial view of European city with terracotta roofs" — Dimitris Iosifidis.
// Skyline aereo geometrico tetti italiani, panoramico — Emilia/Toscana.
export const URBAN_RENOVATION: UnsplashImage = {
  id: 'GLVxsSdV25w',
  src: cdn('photo-1765191739520-be9e96d58eeb', 2400, 1350),
  alt: 'Vista aerea di citta italiana con tetti in cotto e geometria urbana ricorrente',
  photographer: 'Dimitris Iosifidis',
  photographerUrl: 'https://unsplash.com/@dimjoseph',
  photoUrl: 'https://unsplash.com/photos/GLVxsSdV25w',
};

// "Worm's eye view of gray concrete building" — Vincent NICOLAS.
// Geometria forte, brutalist concrete, b/w editorial — Liguria/Veneto.
export const COASTAL_CONSTRUCTION: UnsplashImage = {
  id: 'Iwyl9dDLAA0',
  src: cdn('photo-1612128961739-2551681a0575', 2400, 1350),
  alt: 'Edificio in calcestruzzo a vista visto dal basso con geometria brutalist e cielo nuvoloso',
  photographer: 'Vincent NICOLAS',
  photographerUrl: 'https://unsplash.com/@vince67',
  photoUrl: 'https://unsplash.com/photos/Iwyl9dDLAA0',
};

// =====================================================================
// INTENT-SPLIT CARDS — homepage + iscriviti
// =====================================================================

// IMPRESA EDILE: "Complex metal framework in black and white" — Andrés Silva.
// Struttura metallica complessa b/n, comunica edilizia/struttura/ingegneria.
export const ARCHITECT_BLUEPRINT: UnsplashImage = {
  id: 'fteR0e2BzKo',
  src: cdn('photo-1542621334-a254cf47733d', 1600, 1000),
  alt: 'Macro fotografia di matita e carta tecnica architettonica con dettaglio editoriale',
  photographer: 'Sven Mieke',
  photographerUrl: 'https://unsplash.com/@sxoxm',
  photoUrl: 'https://unsplash.com/photos/fteR0e2BzKo',
};

// Steel beam / industrial framework B/W per slot "Impresa edile"
export const INDUSTRIAL_GEOMETRY: UnsplashImage = {
  id: 'Ijhk9CAkPeQ',
  src: cdn('photo-1750989873854-b93d1bf2d3ea', 1600, 1000),
  alt: 'Struttura metallica industriale complessa in bianco e nero, geometria editorial',
  photographer: 'Andres Silva',
  photographerUrl: 'https://unsplash.com/@andrew07',
  photoUrl: 'https://unsplash.com/photos/Ijhk9CAkPeQ',
};

// STUDIO/PROGETTISTA: "Wooden architectural model" — Ksenia Obukhova.
// Modello architettonico in legno, fotografia minimal premium, NO "architetto sorridente".
export const ARCHITECT_MODEL: UnsplashImage = {
  id: 'opxKbif4028',
  src: cdn('photo-1728245020647-44a56971b830', 1600, 1000),
  alt: 'Modello architettonico in legno su tavolo, fotografia di studio minimal e premium',
  photographer: 'Ksenia Obukhova',
  photographerUrl: 'https://unsplash.com/@fez_wee',
  photoUrl: 'https://unsplash.com/photos/opxKbif4028',
};

// CITTADINO: facciata italiana ritmica con balconi — Riccardo Tuninato.
// Geometria architettonica italiana, "il mio quartiere" — NO cartolina turistica.
export const ITALIAN_FACADE: UnsplashImage = {
  id: 'XenJi9tdnuE',
  src: cdn('photo-1727167776641-af99ecc36595', 1600, 1000),
  alt: 'Facciata di palazzo italiano con balconi e finestre ricorrenti in luce diffusa',
  photographer: 'Riccardo Tuninato',
  photographerUrl: 'https://unsplash.com/@tuna96',
  photoUrl: 'https://unsplash.com/photos/XenJi9tdnuE',
};

// =====================================================================
// EDITORIAL DETAIL — riserva per future sezioni / scheda cantiere
// =====================================================================
// "Grayscale Leica 28mm skyscraper analog" — Markus Spiske. B/N editorial puro.
export const FACADE_RHYTHMIC: UnsplashImage = {
  id: 'c489JFF96VU',
  src: cdn('photo-1628011350407-cbbabe149453', 2400, 1350),
  alt: 'Grattacielo geometrico in grayscale fotografato con pellicola analogica, ritmo verticale',
  photographer: 'Markus Spiske',
  photographerUrl: 'https://unsplash.com/@markusspiske',
  photoUrl: 'https://unsplash.com/photos/c489JFF96VU',
};

/**
 * Mappa regione italiana -> immagine hero contestuale.
 * Fallback: HERO_CONSTRUCTION (gru notturne cinematic).
 *
 * Logica curata: regioni industriali del nord = vista urbana/gru notturne;
 * regioni storiche centro = vista aerea con tetti in cotto; regioni con
 * patrimonio brutalist = concrete geometry.
 */
export function getRegionHero(regione: string): UnsplashImage {
  const key = regione.toLowerCase().trim();
  if (key.includes('lombard')) return HERO_MILAN_SKYLINE;
  if (key.includes('piemont')) return URBAN_CRANE;
  if (key.includes('emilia')) return URBAN_RENOVATION;
  if (key.includes('liguri')) return COASTAL_CONSTRUCTION;
  if (key.includes('veneto')) return COASTAL_CONSTRUCTION;
  if (key.includes('lazio')) return URBAN_CRANE;
  if (key.includes('toscana')) return URBAN_RENOVATION;
  if (key.includes('campan')) return URBAN_RENOVATION;
  if (key.includes('sicil')) return URBAN_RENOVATION;
  if (key.includes('sardegn')) return COASTAL_CONSTRUCTION;
  return HERO_CONSTRUCTION;
}

/**
 * HTML attribution per pagina (footer/aside legale).
 * Conforme alle linee guida Unsplash API.
 */
export function unsplashAttributionHtml(img: UnsplashImage): string {
  return `Foto di <a href="${img.photographerUrl}?utm_source=italiacantieri&utm_medium=referral" rel="noopener noreferrer" target="_blank">${img.photographer}</a> su <a href="https://unsplash.com/?utm_source=italiacantieri&utm_medium=referral" rel="noopener noreferrer" target="_blank">Unsplash</a>`;
}
