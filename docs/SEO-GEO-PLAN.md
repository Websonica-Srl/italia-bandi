# Piano SEO/GEO — bandigaredappalto.it

> Documento implementation-ready per Senior Developer. Satellite SEO/GEO della rete
> ItaliaProgettisti. Vetrina pura: nessun transazionale sul satellite, tutte le CTA
> → HUB `https://www.italiaprogettisti.com` con UTM `utm_source=bandigaredappalto`.
>
> **Contesto dati (post-ingestion ANAC 2025):**
> - 50.882 bandi nella view `bandi_gara_public` (1.502 TED + 49.380 ANAC)
> - `regione` popolata 99% (50.424/50.882), 20 regioni
> - `provincia` (SIGLA) popolata: ANAC ~99%, TED ~924/1.502 → **leva GEO nuova**
> - `comune` popolato ~99%
> - `stato`: ~261 **aperti**, resto **aggiudicato** (con `aggiudicatario_ragione_sociale_raw`) o **scaduto_no_aggiud**
> - `cpv_sector_map`: 4 settori (1 Architettura/Edilizia ~maggioranza, 2 Serramenti, 3 Sicurezza, 4 Piscine)
> - `oggetto` pulito (bug "I" risolto)
>
> **Vincoli non negoziabili (vedi §8):** solo `bandi_gara_public` / `bando_aggiudicatari_public`;
> MAI `partita_iva`/`codice_fiscale`/RUP/`raw_data`/`fonte_url`; design system "zen" esistente;
> missione "serio e pulito, zero clutter".

---

## 0. TL;DR delle decisioni (per chi implementa)

| # | Decisione | Sintesi |
|---|-----------|---------|
| D1 | **Indicizzazione selettiva** | NON indicizzare 50k schede. Indicizza solo bandi "ricchi": **aperti** OR **aggiudicati con aggiudicatario+importo**. `noindex,follow` sul resto. Stima indicizzabili: ~30-40k (da confermare con query §1.4). |
| D2 | **Sitemap index** | Migrare a `generateSitemaps()`. Chunk **per tipo** + sub-chunk bandi da 40.000 URL. Solo URL **indicizzabili**. `robots.txt` → `/sitemap.xml` (l'indice). |
| D3 | **GEO provincia** | Nuovo schema URL `/[regione]/[provincia-slug]` (es. `/lombardia/milano`). Whitelist da `PROVINCE` del package. Intro editoriale unica per evitare duplicati. |
| D4 | **GEO comune** | Pagine comune SOLO per i top ~150 capoluoghi/grandi città con volume ≥ soglia. NO 8.000 comuni (index bloat). Schema `/[regione]/[provincia]/[comune-slug]`. |
| D5 | **Silo & internal linking** | Home → Regioni → Province → (Comuni) → Bandi, con cross-link Categoria↔Regione↔Provincia. Breadcrumb coerenti. |
| D6 | **Helper indicizzabilità centralizzato** | `isBandoIndexable(b)` unico, usato da pagina dettaglio (robots), sitemap, e link interni. Single source of truth. |

---

## 1. Strategia di indicizzazione dei 50k bandi (DECISIONE SEO CHIAVE)

### 1.1 Il problema

Indicizzare tutte le ~50.882 schede sarebbe un errore SEO grave per tre motivi:

1. **Thin content / index bloat.** La grande maggioranza dei bandi è **storica/chiusa** (solo ~261 aperti). Molte schede hanno pochi dati utili: oggetto breve, niente descrizione completa, niente importo, niente aggiudicatario. Pagine "vuote" e quasi identiche tra loro sono il caso da manuale di index bloat e thin content che Google penalizza (Panda legacy + Helpful Content System). Fonti: [Search Engine Land — Index bloat](https://searchengineland.com/guide/index-bloat), [Botify — Expired content & SEO](https://www.botify.com/blog/expired-content-seo).
2. **Crawl budget.** 50k URL su un dominio nuovo (autorità ancora bassa) diluiscono il crawl budget: Googlebot spende tempo su schede inutili invece che sulle pagine di valore (hub regione/provincia/categoria, bandi aperti, aggiudicazioni ricche).
3. **Missione del brand.** "Serio e pulito, zero clutter" → coerente NON spammare 50k pagine sottili. Curare l'indicizzazione È il posizionamento.

### 1.2 L'angolo unico (perché NON cancelliamo le schede storiche)

Le gare **aggiudicate** sono l'asset differenziante: mostrano **chi ha vinto** (ragione sociale del vincitore, solo persone giuridiche) e a **quanto**. È un "archivio storico delle aggiudicazioni pubbliche" — contenuto unico, citabile, con valore informazionale reale ("chi ha vinto la gara X", "appalti vinti da [impresa]"). Quindi: le teniamo, le linkiamo, ma le indicizziamo **solo se ricche**.

### 1.3 La regola precisa (single source of truth)

Crea un helper centralizzato in `src/lib/seo/indexable.ts`:

```ts
import { Bando } from '@/lib/supabase/queries/bandi';

/**
 * Un bando è INDICIZZABILE se porta valore informazionale reale.
 * Usato da: pagina /bandi/[slug] (robots meta), sitemap, link interni.
 * Single source of truth — non duplicare questa logica altrove.
 */
export function isBandoIndexable(b: Bando): boolean {
  const aperto =
    !!b.scadenza_offerte && new Date(b.scadenza_offerte) >= new Date();

  // 1) APERTO → sempre indicizzabile (max valore: l'utente può ancora partecipare)
  if (aperto) return true;

  // 2) AGGIUDICATO RICCO → indicizzabile (angolo unico: chi ha vinto + quanto)
  const haAggiudicatario = !!(b.aggiudicatario_ragione_sociale_raw &&
    b.aggiudicatario_ragione_sociale_raw.trim().length > 2);
  const haImporto =
    (b.importo_aggiudicazione != null && b.importo_aggiudicazione > 0) ||
    (b.importo_base != null && b.importo_base > 0);
  if (haAggiudicatario && haImporto) return true;

  // 3) STORICO RICCO senza aggiudicatario ma con dati sostanziali
  //    (oggetto descrittivo + importo + ente) → indicizzabile borderline.
  const haOggettoRicco = !!(b.oggetto && b.oggetto.trim().length >= 40);
  const haEnte = !!(b.stazione_appaltante && b.stazione_appaltante.trim().length > 3);
  if (haOggettoRicco && haImporto && haEnte) return true;

  // 4) tutto il resto (scaduto, senza aggiudicatario, senza importo, oggetto thin)
  //    → NOINDEX (resta crawlabile via follow, partecipa al silo, ma fuori dall'indice)
  return false;
}
```

> **Nota implementativa:** soglie (`40` char oggetto, importo > 0) sono parametri. Vanno calibrate
> con una query reale prima del deploy (vedi §1.4). Obiettivo realistico: indicizzare ~30-40k
> bandi (gli aggiudicati ricchi sono tanti), non solo i 261 aperti.

### 1.4 Query di calibrazione (eseguire PRIMA del deploy)

Da lanciare via MCP Supabase / SQL editor sulla view `bandi_gara_public` per dimensionare la
whitelist e tarare le soglie:

```sql
-- Quanti bandi rientrano in ciascuna fascia di indicizzabilità?
SELECT
  CASE
    WHEN scadenza_offerte >= now() THEN 'aperto'
    WHEN COALESCE(aggiudicatario_ragione_sociale_raw,'') <> ''
         AND (COALESCE(importo_aggiudicazione,0) > 0 OR COALESCE(importo_base,0) > 0)
      THEN 'aggiudicato_ricco'
    WHEN length(COALESCE(oggetto,'')) >= 40
         AND COALESCE(importo_base,0) > 0
         AND length(COALESCE(stazione_appaltante,'')) > 3
      THEN 'storico_ricco'
    ELSE 'thin_noindex'
  END AS fascia,
  count(*) AS n
FROM bandi_gara_public
GROUP BY 1
ORDER BY n DESC;
```

```sql
-- Distribuzione per provincia (per la whitelist GEO §3) — solo righe geolocalizzate
SELECT regione, provincia, count(*) AS n,
       count(*) FILTER (WHERE COALESCE(aggiudicatario_ragione_sociale_raw,'') <> '') AS aggiudicati
FROM bandi_gara_public
WHERE provincia IS NOT NULL AND regione IS NOT NULL
GROUP BY regione, provincia
ORDER BY n DESC;
```

```sql
-- Top comuni (per decidere quali pagine comune generare §3.6) — soglia minima
SELECT regione, provincia, comune, count(*) AS n
FROM bandi_gara_public
WHERE comune IS NOT NULL
GROUP BY regione, provincia, comune
HAVING count(*) >= 50          -- soglia da tarare
ORDER BY n DESC
LIMIT 300;
```

### 1.5 Implementazione su `/bandi/[slug]`

In `generateMetadata` aggiungi il blocco `robots`:

```ts
import { isBandoIndexable } from '@/lib/seo/indexable';
// ...
const indexable = isBandoIndexable(b);
return {
  title: `${truncate(titolo, 70)} — Bando di gara`,
  description: desc,
  alternates: { canonical: `/bandi/${b.slug}` }, // self-canonical sempre
  robots: indexable
    ? { index: true, follow: true }
    : { index: false, follow: true }, // noindex,follow: fuori indice ma silo intatto
  openGraph: { /* invariato */ },
};
```

- **Canonical**: sempre self-referencing (`/bandi/[slug]`), anche sui noindex. NON canonicalizzare
  un noindex verso un'altra pagina (segnale contraddittorio: noindex + canonical altrove confonde Google).
- **`follow`** sui noindex: i link interni della scheda (categoria, regione, provincia, aggiudicatario)
  continuano a passare equity e a far scoprire pagine. Il bando resta nel silo, solo fuori dall'indice.
- **`unavailable_after`** (opzionale, fase 2): per i bandi aperti aggiungi
  `<meta name="robots" content="unavailable_after: [scadenza_offerte in RFC-850]">` così Google
  li deindicizza automaticamente alla scadenza, riducendo manutenzione. Solo per gli **aperti**.

### 1.6 Implementazione su `/bandi` (lista) — già OK, una rifinitura

La logica `isFiltered()` → `noindex,follow` su querystring è già corretta. Aggiungi solo:
`<link rel="canonical" href="/bandi">` (senza querystring) su tutte le varianti filtrate
(già implicito via `alternates.canonical: '/bandi'` — verificare resti tale anche con `?page=2`,
NON auto-canonicalizzare le pagine paginate verso pagina 1 se vuoi che Google segua i `rel=next/prev`,
ma essendo già `noindex` la paginazione è ininfluente).

---

## 2. Sitemap index (PROBLEMA TECNICO BLOCCANTE)

### 2.1 Decisione

Migrare da sitemap singola a **sitemap index** via Next.js `generateSitemaps()`. Limiti Google:
50.000 URL / 50 MB per file ([Google Search Central — Large sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)).
Best practice: **segmentare per tipo di contenuto** (facilita il debug in Search Console e il controllo
`changefreq`/`priority` per tipo) ([linkbot — sitemap limits](https://library.linkbot.com/what-are-the-url-and-file-size-limits-for-sitemaps-and-how-can-large-sites-adapt/)).

> **Regola d'oro:** la sitemap contiene SOLO URL indicizzabili (`isBandoIndexable === true`).
> Inserire URL `noindex` in sitemap è un segnale contraddittorio e spreca crawl budget.

### 2.2 Struttura dei chunk

Con Next.js App Router, `app/sitemap.ts` che esporta `generateSitemaps()` produce:
- `/sitemap.xml` → **sitemap index** generato automaticamente da Next, che elenca i chunk
- `/sitemap/[id].xml` → i singoli chunk

Schema dei chunk (id numerici contigui):

| id | Contenuto | URL stimati | changefreq | priority |
|----|-----------|-------------|------------|----------|
| 0 | **Statiche + hub** (home, /bandi, /regioni, /scadenze, /glossario, legal, ecc.) | ~14 | daily/monthly/yearly | 1.0 → 0.3 |
| 1 | **Categorie CPV** (gruppi presenti) | ~10-15 | daily | 0.8 |
| 2 | **Regioni** (20) | 20 | daily | 0.85 |
| 3 | **Province** (whitelist, vedi §3) | ~80-107 | daily | 0.8 |
| 4 | **Comuni** (top whitelist, vedi §3.6) | ~150 | weekly | 0.7 |
| 5..N | **Bandi indicizzabili**, chunk da 40.000 | ~30-40k → 1 o 2 chunk | weekly | 0.6 |

40.000 < 45.000 = margine di sicurezza sotto i 50k (assorbe crescita tra due rigenerazioni ISR).
Se gli indicizzabili crescono > 40k, i chunk bandi diventano 2 automaticamente (vedi codice).

### 2.3 Codice `src/app/sitemap.ts`

```ts
import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import {
  getIndexableBandiSlugs,   // NUOVA query §2.4
  getBandiByCpvGroup,
  getBandiByRegione,
  getBandiByProvincia,       // NUOVA query §3.3
  getIndexableComuni,        // NUOVA query §3.6
} from '@/lib/supabase/queries/bandi';
import { regioneSlug } from '@/lib/regioni';
import { provinciaPath } from '@/lib/province';
import { comunePath } from '@/lib/comuni';

export const revalidate = 3600;

const CHUNK = 40_000;            // < 45k margine sotto il limite Google di 50k
const NON_BANDO_CHUNKS = 5;      // id 0..4 (statiche, cpv, regioni, province, comuni)

/**
 * Next chiama generateSitemaps a build/ISR per sapere quanti chunk esistono.
 * /sitemap.xml diventa l'INDICE; /sitemap/[id].xml i singoli file.
 */
export async function generateSitemaps() {
  const slugs = await getIndexableBandiSlugs(); // solo indicizzabili!
  const bandoChunks = Math.max(1, Math.ceil(slugs.length / CHUNK));
  const total = NON_BANDO_CHUNKS + bandoChunks;
  return Array.from({ length: total }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.baseUrl;
  const now = new Date();

  // id 0 — statiche + hub
  if (id === 0) {
    return [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/bandi`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/regioni`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/scadenze`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
      { url: `${baseUrl}/glossario`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${baseUrl}/iscriviti`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
      { url: `${baseUrl}/per-pubbliche-amministrazioni`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/api-pubbliche`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/come-trattiamo-i-dati`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${baseUrl}/chi-siamo`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/contatti`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
      { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${baseUrl}/legal/cookie`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
      { url: `${baseUrl}/legal/termini`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ];
  }

  // id 1 — categorie CPV
  if (id === 1) {
    const groups = await getBandiByCpvGroup();
    return groups.map((g) => ({
      url: `${baseUrl}/categoria/${g.group}`,
      lastModified: now, changeFrequency: 'daily' as const, priority: 0.8,
    }));
  }

  // id 2 — regioni
  if (id === 2) {
    const regioni = await getBandiByRegione();
    return regioni.map((r) => ({
      url: `${baseUrl}/${regioneSlug(r.regione)}`,
      lastModified: now, changeFrequency: 'daily' as const, priority: 0.85,
    }));
  }

  // id 3 — province (whitelist con almeno N bandi)
  if (id === 3) {
    const province = await getBandiByProvincia();
    return province.map((p) => ({
      url: `${baseUrl}${provinciaPath(p.regione, p.sigla)}`,
      lastModified: now, changeFrequency: 'daily' as const, priority: 0.8,
    }));
  }

  // id 4 — comuni (top whitelist)
  if (id === 4) {
    const comuni = await getIndexableComuni();
    return comuni.map((c) => ({
      url: `${baseUrl}${comunePath(c.regione, c.sigla, c.comune)}`,
      lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
    }));
  }

  // id >= 5 — bandi indicizzabili, chunked
  const slugs = await getIndexableBandiSlugs();
  const chunkIdx = id - NON_BANDO_CHUNKS;
  const slice = slugs.slice(chunkIdx * CHUNK, (chunkIdx + 1) * CHUNK);
  return slice.map((b) => ({
    url: `${baseUrl}/bandi/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
}
```

### 2.4 Nuova query `getIndexableBandiSlugs`

Sostituisce `getAllBandiSlugs` per la sitemap. Filtra a livello DB (più efficiente del filtro JS su 50k righe).
Replica la logica di `isBandoIndexable` in SQL — **attenzione a mantenerle allineate** (commentare in entrambi i file):

```ts
/**
 * Slug dei SOLI bandi indicizzabili (vedi isBandoIndexable in lib/seo/indexable.ts).
 * Filtro a livello DB: aperto OR (aggiudicatario + importo) OR (oggetto ricco + importo + ente).
 * MANTENERE allineato con isBandoIndexable() — qualunque cambio di soglia va replicato.
 */
export async function getIndexableBandiSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const nowIso = new Date().toISOString();
  return fetchAllBandiRows(
    'slug, updated_at, scadenza_offerte, aggiudicatario_ragione_sociale_raw, importo_aggiudicazione, importo_base, oggetto, stazione_appaltante',
    (q) =>
      q
        .not('slug', 'is', null)
        .or(
          [
            `scadenza_offerte.gte.${nowIso}`,
            // aggiudicato ricco: aggiudicatario valorizzato (importo filtrato lato JS sotto)
            `aggiudicatario_ragione_sociale_raw.not.is.null`,
          ].join(','),
        ),
  ).then((rows: any[]) =>
    rows
      // rifinitura lato JS per le condizioni composte (importo/oggetto/ente) che
      // PostgREST .or() non esprime in modo compatto. Dataset già ridotto dal pre-filtro.
      .filter((r) => {
        const aperto = !!r.scadenza_offerte && new Date(r.scadenza_offerte) >= new Date();
        if (aperto) return true;
        const haAgg = !!(r.aggiudicatario_ragione_sociale_raw && r.aggiudicatario_ragione_sociale_raw.trim().length > 2);
        const haImp = (r.importo_aggiudicazione > 0) || (r.importo_base > 0);
        if (haAgg && haImp) return true;
        const oggRicco = !!(r.oggetto && r.oggetto.trim().length >= 40);
        const haEnte = !!(r.stazione_appaltante && r.stazione_appaltante.trim().length > 3);
        return oggRicco && haImp && haEnte;
      })
      .map((r) => ({ slug: r.slug, updated_at: r.updated_at })),
  );
}
```

> Se le query SQL devono restare più semplici, in alternativa si può materializzare una colonna/flag
> `indexable boolean` nella pipeline di ingestion e filtrare `eq('indexable', true)`. È l'opzione più
> performante per la sitemap (consigliata in fase 2 se i tempi di rigenerazione ISR diventano alti).

### 2.5 robots.txt

Nessuna modifica strutturale: `robots.ts` punta già a `${baseUrl}/sitemap.xml`, che con
`generateSitemaps()` diventa l'**indice**. Verificare solo che resti così. Aggiungere `Disallow`
per eventuali parametri di provincia/comune se introdurrai filtri querystring lì (mantenere il
pattern `/bandi?` già presente). Aggiungere anche `/sitemap/` NON va disallowato (deve essere crawlabile).

---

## 3. Architettura GEO (il punto FONDAMENTALE)

### 3.1 Decisione schema URL

**Scelto: gerarchico `/[regione]/[provincia-slug]`** (es. `/lombardia/milano`, `/lazio/roma`).

Motivazione (vs. `/bandi/provincia/[sigla]`):
- **Silo semantico forte**: l'URL stesso esprime la gerarchia regione → provincia, che Google usa
  come segnale di struttura. Coerente con le pagine regione `/[regione]` già esistenti.
- **Match con le query reali**: gli italiani cercano "bandi di gara milano", "gare appalto roma",
  "appalti pubblici provincia di napoli". La provincia col nome (non la sigla) nell'URL è più
  leggibile e match-friendly. Usiamo lo **slug del capoluogo/nome provincia** (es. `milano`,
  non `mi`) perché è il termine che le persone digitano.
- **Breadcrumb naturale**: Home › Regioni › Lombardia › Milano.
- **Niente segmento ridondante** `/bandi/provincia/`: più pulito, coerente con la missione.

> **Collisione di routing — attenzione.** Il segmento `/[regione]` ha `dynamicParams = false` con
> whitelist 20 regioni: ogni slug non-regione → 404, e le route statiche (`/bandi`, `/categoria`,
> `/scadenze`, `/glossario`, `/chi-siamo`, ecc.) hanno priorità. Il nuovo `/[regione]/[provincia]`
> è un **secondo segmento dinamico annidato** sotto `app/[regione]/[provincia]/page.tsx`. Anch'esso
> con `dynamicParams = false` e whitelist province valide PER QUELLA regione → qualsiasi combinazione
> errata = 404. Nessuna collisione con le route statiche di primo livello.

### 3.2 Whitelist province — `src/lib/province.ts` (NUOVO)

Fonte di verità: `PROVINCE` da `@websonica/cantieri-core` (stesso package usato per le regioni).
Mappa `sigla → { nome, slug, regione }`. Generiamo le pagine SOLO per le province che hanno
**almeno N bandi** (da query §1.4), non tutte le 107 a prescindere (evita pagine vuote = thin).

```ts
import { PROVINCE } from '@websonica/cantieri-core';
import { slugify } from '@/lib/utils';
import { regioneSlug } from '@/lib/regioni';

export interface ProvinciaInfo {
  sigla: string;       // "MI"
  nome: string;        // "Milano"
  slug: string;        // "milano"
  regione: string;     // "Lombardia"
  regioneSlug: string; // "lombardia"
}

/** Tutte le province italiane dal package (fonte di verità DRY). */
export const PROVINCE_ALL: ProvinciaInfo[] = PROVINCE.map((p) => ({
  sigla: p.sigla,
  nome: p.nome,
  slug: slugify(p.nome),
  regione: p.regione,
  regioneSlug: regioneSlug(p.regione),
}));

const BY_REGIONE_SLUG = new Map<string, ProvinciaInfo[]>();
const BY_REG_PROV_SLUG = new Map<string, ProvinciaInfo>();
for (const p of PROVINCE_ALL) {
  if (!BY_REGIONE_SLUG.has(p.regioneSlug)) BY_REGIONE_SLUG.set(p.regioneSlug, []);
  BY_REGIONE_SLUG.get(p.regioneSlug)!.push(p);
  BY_REG_PROV_SLUG.set(`${p.regioneSlug}/${p.slug}`, p);
}

/** Risolve (regioneSlug, provinciaSlug) → ProvinciaInfo, o null (whitelist). */
export function provinciaFromSlugs(regioneSlug: string, provinciaSlug: string): ProvinciaInfo | null {
  return BY_REG_PROV_SLUG.get(`${regioneSlug}/${provinciaSlug}`) ?? null;
}

/** Province di una regione (per cross-link e generateStaticParams). */
export function provinceDiRegione(regioneSlug: string): ProvinciaInfo[] {
  return BY_REGIONE_SLUG.get(regioneSlug) ?? [];
}

/** Path canonico di una pagina provincia. */
export function provinciaPath(regione: string, sigla: string): string {
  const p = PROVINCE_ALL.find((x) => x.sigla === sigla);
  if (!p) return '/regioni';
  return `/${p.regioneSlug}/${p.slug}`;
}
```

> **Mapping dato DB → provincia.** La colonna `bandi_gara_public.provincia` contiene la **SIGLA**
> (es. "MI"). Il filtro query usa la sigla; lo slug URL usa il nome. Il join avviene via `PROVINCE_ALL`.

### 3.3 Nuove query in `bandi.ts`

```ts
export interface ProvinciaStat { regione: string; sigla: string; cnt: number; }

/** Conteggio bandi per provincia (sigla), solo righe geolocalizzate. Per sitemap + /regioni. */
export async function getBandiByProvincia(minCount = 1): Promise<ProvinciaStat[]> {
  const data = await fetchAllBandiRows('regione, provincia', (q) =>
    q.not('provincia', 'is', null).not('regione', 'is', null),
  );
  const counts = new Map<string, ProvinciaStat>();
  for (const r of data as { regione: string; provincia: string }[]) {
    const key = `${r.regione}|${r.provincia}`;
    const cur = counts.get(key) ?? { regione: r.regione, sigla: r.provincia, cnt: 0 };
    cur.cnt += 1;
    counts.set(key, cur);
  }
  return Array.from(counts.values()).filter((p) => p.cnt >= minCount).sort((a, b) => b.cnt - a.cnt);
}

export interface ProvinciaStats {
  totale: number; aperti: number; importoTotaleBase: number; enti: number;
  topCpv: CpvGroupStat[]; topComuni: { comune: string; cnt: number }[];
}

/** Statistiche di una singola provincia (filtro per sigla). */
export async function getProvinciaStats(sigla: string): Promise<ProvinciaStats> {
  const supabase: any = createServerClient();
  const [totaleRes, apertiRes, rowsRes] = await Promise.all([
    supabase.from('bandi_gara_public').select('id', { count: 'exact', head: true }).eq('provincia', sigla),
    supabase.from('bandi_gara_public').select('id', { count: 'exact', head: true })
      .eq('provincia', sigla).gte('scadenza_offerte', new Date().toISOString()),
    supabase.from('bandi_gara_public')
      .select('importo_base, stazione_appaltante, cpv_principale, comune')
      .eq('provincia', sigla).limit(5000),
  ]);
  const rows = (rowsRes.data as any[]) || [];
  const importoTotaleBase = rows.reduce((s, r) => s + (Number(r.importo_base) || 0), 0);
  const enti = new Set(rows.map((r) => r.stazione_appaltante).filter(Boolean)).size;
  const cpv = new Map<string, number>();
  const com = new Map<string, number>();
  for (const r of rows) {
    const g = (r.cpv_principale || '').replace(/[^0-9]/g, '').slice(0, 2);
    if (g.length === 2) cpv.set(g, (cpv.get(g) || 0) + 1);
    if (r.comune) com.set(r.comune, (com.get(r.comune) || 0) + 1);
  }
  return {
    totale: totaleRes.count || 0,
    aperti: apertiRes.count || 0,
    importoTotaleBase, enti,
    topCpv: Array.from(cpv, ([group, cnt]) => ({ group, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 6),
    topComuni: Array.from(com, ([comune, cnt]) => ({ comune, cnt })).sort((a, b) => b.cnt - a.cnt).slice(0, 12),
  };
}

// getBandi() già supporta `provincia` (ilike) — passare la SIGLA. Verificare: la colonna
// è la sigla, quindi sostituire `ilike` con `eq` su provincia per match esatto (più preciso).
```

### 3.4 Pagina `src/app/[regione]/[provincia]/page.tsx` (NUOVO)

Pattern identico a `/[regione]/page.tsx`, adattato. Punti chiave:

```ts
export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  // genera tutte le coppie regione/provincia dalla whitelist package
  return PROVINCE_ALL.map((p) => ({ regione: p.regioneSlug, provincia: p.slug }));
}

export async function generateMetadata({ params }) {
  const prov = provinciaFromSlugs(params.regione, params.provincia);
  if (!prov) return { title: 'Provincia non trovata' };
  const { totale } = await getProvinciaStats(prov.sigla);
  const title = `Bandi e gare d'appalto ${prov.nome} (provincia)`;
  const description = `${formatNumber(totale)} bandi e gare d'appalto pubbliche nella provincia di ${prov.nome} (${prov.regione}): importi, scadenze, stazioni appaltanti e aggiudicatari. Dati pubblici da TED e ANAC.`;
  return {
    title, description,
    alternates: { canonical: `/${params.regione}/${params.provincia}` },
    openGraph: { /* og dinamico kind 'comune' o 'regione' */ },
  };
}

export default async function ProvinciaPage({ params }) {
  const prov = provinciaFromSlugs(params.regione, params.provincia);
  if (!prov) notFound();
  const [{ data: bandi, total }, stats] = await Promise.all([
    getBandi({ provincia: prov.sigla, limit: 12, orderBy: 'data_pubblicazione', orderDirection: 'desc' }),
    getProvinciaStats(prov.sigla),
  ]);
  if (total === 0) notFound(); // provincia senza bandi → 404 (no thin page)
  // ... render: hero, stat card, top CPV (link /categoria), top comuni (link comune),
  //     lista ultimi bandi, cross-link altre province della regione + link su alla regione,
  //     FAQ provincia, ItemList + BreadcrumbList JSON-LD
}
```

### 3.5 Anti-duplicazione regione↔provincia (CRITICO)

Le pagine regione e provincia rischiano contenuti gemelli. Per evitarlo:

1. **Intro editoriale provincia unica.** Aggiungi `PROVINCIA_INTRO: Record<string, string>` in
   `src/lib/province.ts` per i ~50-80 capoluoghi principali (chiave = sigla). Per le province minori,
   intro generata da template **parametrico** che usa dati reali specifici della provincia (numero
   enti, top comune, top categoria, importo totale) → ogni pagina ha numeri diversi e un comune/categoria
   diversi, quindi non è boilerplate. Best practice local SEO IT: personalizzazione + unicità per
   località ([Outranking — Local SEO Italy 2025](https://www.outranking.io/blog/guide-to-local-seo-in-italy/)).
2. **Angolazione diversa.** Regione = panoramica + lista regioni + top categorie regionali.
   Provincia = focus su **comuni** + stazioni appaltanti locali + aggiudicatari del territorio.
   Sono blocchi di contenuto diversi, non lo stesso layout con un nome cambiato.
3. **H1 e title distinti** (vedi §6): regione "Bandi di gara [Regione]"; provincia "Bandi e gare
   d'appalto [Provincia] (provincia)".
4. **Canonical self-referencing** su entrambe. NESSUN canonical incrociato provincia→regione.

### 3.6 Pagine comune — SOLO top città (evita 8.000 thin pages)

**Decisione:** generare pagine comune SOLO per i comuni con **≥ 50 bandi** (soglia da §1.4 query),
verosimilmente ~100-150 città (capoluoghi + grandi comuni). NO una pagina per ogni comune (sarebbe
index bloat puro: migliaia di comuni con 1-2 bandi).

- Schema URL: `/[regione]/[provincia]/[comune]` (es. `/lombardia/milano/milano`, `/veneto/venezia/venezia`).
  Mantiene il silo. Il segmento comune è il **terzo** dinamico annidato.
- Whitelist runtime: `src/lib/comuni.ts` esporta `getIndexableComuni()` (wrap della query §1.4 con
  soglia) usato sia da `generateStaticParams` sia dalla sitemap (id 4). I comuni fuori whitelist NON
  hanno pagina (`dynamicParams = false` → 404), e i bandi di quei comuni restano accessibili via
  provincia/regione/categoria.
- Contenuto: hero comune, stat (bandi, aperti, importo, enti del comune), lista bandi del comune,
  link su alla provincia e alla regione, FAQ comune.
- Anti-duplicazione: stesse regole §3.5, intro parametrica con dati reali del comune.

> Implementare le pagine comune in **FASE 2** (P1), dopo provincia. Province prima: coprono già le
> query ad alto volume ("bandi gara [città capoluogo]" spesso = nome provincia).

---

## 4. Internal linking & struttura a silo

### 4.1 Il silo

```
Home (/)
 ├─ /regioni (hub regioni)
 │   └─ /[regione] (es. /lombardia)
 │        └─ /[regione]/[provincia] (es. /lombardia/milano)
 │             └─ /[regione]/[provincia]/[comune] (top città)   ← FASE 2
 ├─ /bandi (hub lista, hub categorie via filtri)
 │   └─ /categoria/[cpv] (es. /categoria/45)
 └─ /bandi/[slug] (foglia: scheda bando)
```

Ogni livello linka **giù** (figli) e **su** (breadcrumb), più **cross-link laterali** mirati:

| Da | Link verso | Scopo |
|----|-----------|-------|
| Home | /regioni, top categorie, bandi in scadenza | distribuzione equity ai 3 silo |
| /[regione] | sue province (NUOVO blocco), top CPV regionali → /categoria, altre regioni | giù + laterale |
| /[regione]/[provincia] | suoi top comuni, su alla regione, altre province della regione, top CPV → /categoria | giù + su + laterale |
| /categoria/[cpv] | altre categorie, **+ NUOVO: "bandi [categoria] per regione"** → /[regione] | cross-silo categoria↔geo |
| /bandi/[slug] | breadcrumb (categoria + ente), **+ NUOVO: "altri bandi in [provincia]" + "bandi [categoria] in [regione]"** | foglia → hub (risale equity) |

### 4.2 Link contestuali da implementare

1. **Su `/[regione]`**: nuovo blocco "Province di [Regione]" con le province che hanno bandi
   (chip con conteggio, link a `/[regione]/[provincia]`). È il link mancante regione→provincia.
2. **Su `/bandi/[slug]`** (chiave per far risalire equity dalle 30-40k foglie):
   - "Altri bandi nella provincia di [Nome]" → `/[regione]/[provincia]` (se `b.provincia` whitelisted)
   - "Bandi [categoria CPV] in [Regione]" → `/[regione]` o un link filtrato (vedi nota sotto)
   - Già presente: breadcrumb con categoria + link ente. Aggiungere link luogo nel breadcrumb:
     Home › Bandi › [Categoria] › [Provincia] › [CIG]. Migliora il silo e i rich result breadcrumb.
3. **Su `/categoria/[cpv]`**: nuovo blocco "Bandi [categoria] per regione" — top 8 regioni per
   conteggio in quella categoria, link a `/[regione]`. Crea i cross-link categoria↔geo che oggi mancano.

> **Nota sui link filtrati:** i link che puntano a `/bandi?cpv=..&regione=..` sono `noindex` (querystring)
> ma `follow`: vanno bene per UX e crawl-path, NON come destinazione SEO. Le destinazioni SEO sono
> sempre le pagine pulite (`/[regione]`, `/[regione]/[provincia]`, `/categoria/[cpv]`).

### 4.3 Breadcrumb

Estendere `BreadcrumbCantiere` (già usato) e il `BreadcrumbList` JSON-LD (§5) per riflettere il silo
completo su ogni pagina. Esempio bando aggiudicato a Milano, edilizia:
`Home › Bandi › Lavori di costruzione › Lombardia › Milano › [CIG]`.

---

## 5. Structured data (per tipo pagina)

Coerente con `src/lib/seo/structured-data.ts` esistente. Aggiunte minime.

| Pagina | Schema | Stato |
|--------|--------|-------|
| `/` (home) | `Organization` + `WebSite`(SearchAction) | già presente |
| `/bandi` (lista non filtrata) | `ItemList` + `BreadcrumbList` | ItemList già presente; **aggiungere BreadcrumbList** |
| `/categoria/[cpv]` | `ItemList` + `FAQPage` + `BreadcrumbList` | ItemList+FAQ presenti; **aggiungere BreadcrumbList** |
| `/[regione]` | `ItemList` + `FAQPage` + `BreadcrumbList` | ItemList+FAQ presenti; **aggiungere BreadcrumbList** |
| `/[regione]/[provincia]` (NUOVO) | `ItemList` + `FAQPage` + `BreadcrumbList` | da creare (riusa helper) |
| `/[regione]/[provincia]/[comune]` (NUOVO) | `ItemList` + `BreadcrumbList` | da creare |
| `/bandi/[slug]` | `GovernmentService` + `FAQPage` + `BreadcrumbList` | GovernmentService+FAQ presenti; **aggiungere BreadcrumbList** |
| `/glossario` | `DefinedTermSet` | già presente |

### 5.1 Aggiungere `breadcrumbLd` in `structured-data.ts`

Manca un generatore `BreadcrumbList`. Aggiungerlo e usarlo ovunque ci sia `BreadcrumbCantiere`:

```ts
/** BreadcrumbList JSON-LD — riflette il silo. Path già relativi → URL assoluti qui. */
export function breadcrumbLd(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: `${siteConfig.baseUrl}${it.path}` } : {}),
    })),
  };
}
```

Renderizzarlo nello stesso punto in cui oggi si stampa `BreadcrumbCantiere`, con gli stessi step.

### 5.2 GovernmentService — rifinitura per AEO

Lo schema `bandoLd` è buono. Migliorie (in `structured-data.ts`):
- `areaServed`: passare `AdministrativeArea` con nome provincia/comune quando disponibile (ancora
  l'entità geografica per AI e local). Es. `{ '@type': 'AdministrativeArea', name: 'Milano', containedInPlace: { '@type': 'AdministrativeArea', name: 'Lombardia' } }`.
- Per i **aggiudicati**, aggiungere il vincitore come entità (solo persona giuridica, GDPR-safe):
  campo custom non standard non aiuta; meglio lasciarlo nel testo `description` + nel body. Non forzare
  schemi non validi. Mantenere `availability: Discontinued` per gli scaduti/aggiudicati (già fatto).

---

## 6. On-page (title / meta / H1 template)

Ottimizzati per le query reali italiane. Variabili in `{...}`. Lunghezze: title ≤ 60 char effettivi
dopo suffix, meta 150-160 char.

### 6.1 Regione (`/[regione]`) — già buono, conferma

- **Title**: `Bandi e gare d'appalto {Regione} — {suffix}`
- **H1**: `Bandi di gara {Regione}.` (già presente)
- **Meta**: `{N} bandi e gare d'appalto pubbliche in {Regione}: importi a base d'asta, scadenze, stazioni appaltanti e categorie CPV. Dati pubblici aggiornati da TED e ANAC.` (già presente)
- Query target: "bandi gara [regione]", "gare appalto [regione]", "appalti pubblici [regione]".

### 6.2 Provincia (`/[regione]/[provincia]`) — NUOVO, distinto dalla regione

- **Title**: `Bandi e gare d'appalto {Provincia} (provincia) — {suffix}`
- **H1**: `Bandi di gara provincia di {Provincia}.`
- **Meta**: `{N} bandi e gare d'appalto pubbliche nella provincia di {Provincia} ({Regione}): importi, scadenze, stazioni appaltanti, comuni e chi vince le gare. Dati pubblici TED e ANAC.`
- Query target: "bandi gara [città/provincia]", "gare appalto provincia di [x]", "[comune capoluogo] appalti".
- **Differenziazione dalla regione**: la parola "provincia", il focus su comuni e aggiudicatari nel
  body, numeri diversi → niente cannibalizzazione né duplicate content.

### 6.3 Comune (`/[regione]/[provincia]/[comune]`) — FASE 2

- **Title**: `Bandi e gare d'appalto {Comune} — {suffix}`
- **H1**: `Bandi di gara {Comune}.`
- **Meta**: `{N} bandi e gare d'appalto pubbliche del Comune di {Comune} ({sigla}): importi, scadenze, ente appaltante e aggiudicatari. Dati pubblici TED e ANAC.`
- Query target: "bandi comune di [x]", "gare appalto [città]".

### 6.4 Categoria (`/categoria/[cpv]`) — già buono

- **Title**: `Bandi di gara {Categoria} (CPV {cpv}) in Italia` (già presente)
- Migliorare cross-geo: aggiungere nel body (non nel title) varianti "bandi {categoria} per regione".

### 6.5 Bando (`/bandi/[slug]`) — già buono, una rifinitura

- **Title**: `{titolo troncato} — Bando di gara` (già presente)
- **Suggerimento**: per gli **aggiudicati**, valutare title `{oggetto} — aggiudicato a {vincitore}`
  quando il vincitore è valorizzato (cattura query "chi ha vinto [gara]"/"appalti vinti da [impresa]").
  Solo persone giuridiche (GDPR). Da A/B-valutare; non obbligatorio.

---

## 7. GEO / AEO (visibilità su motori + AI)

Obiettivo: massimizzare citazioni in AI Overview Google, Perplexity, ChatGPT, Bing Copilot.

1. **Entità chiare** in ogni scheda e hub: ente (GovernmentOrganization), luogo (AdministrativeArea
   regione/provincia/comune), importo (Offer con priceCurrency EUR), CIG/CUP come `identifier`,
   categoria CPV. Le AI estraggono triple soggetto-predicato-oggetto: rendere espliciti
   "chi (ente) ha bandito cosa (oggetto/CPV) per quanto (importo) dove (luogo) e chi ha vinto".
2. **Risposte concise in cima** (AEO): le FAQ già presenti (regione, categoria, bando) sono perfette
   per le citazioni AI. Replicarle su provincia/comune con risposte autosufficienti di 2-3 frasi che
   contengano il numero/dato chiave nella prima frase.
3. **Dataset schema** (`datasetLd` già esiste): usarlo sulla home e su un'eventuale pagina
   `/statistiche` per posizionare il sito come fonte-dati citabile e indicizzabile in Google Dataset Search.
4. **Tabelle e liste strutturate** nelle pagine hub (top comuni, top CPV, top enti): le AI preferiscono
   dati tabellari per generare risposte. Già parzialmente presente (StatCard), estendere a provincia.
5. **Freshness signals**: `lastModified` reale in sitemap (già da `updated_at`), `dateModified` nello
   schema Dataset. Aiuta le AI a preferire la fonte aggiornata.
6. **Coerenza nominale entità**: usare sempre lo stesso nome ente/luogo (no varianti) per consolidare
   l'entità agli occhi dei knowledge graph.

---

## 8. Vincoli NON negoziabili

| Vincolo | Implicazione operativa |
|---------|------------------------|
| **GDPR / privacy** | Query SOLO da `bandi_gara_public` e `bando_aggiudicatari_public`. MAI `partita_iva`, `codice_fiscale`, dati RUP, `raw_data`, `fonte_url`, `crediti_costo`. Aggiudicatari: solo **persone giuridiche** (ragione sociale). Il query layer attuale è già conforme (`BANDO_COLS`): NON allargarlo. Ogni nuova query passa dalle view safe. |
| **CTA transazionali → HUB** | Tutto il transazionale (sblocco doc, alert, registrazione, abbonamento) → `hubUrl(path, campaign)` con `utm_source=bandigaredappalto`, `utm_medium=referral`, `utm_campaign=...`. Già implementato in `site-config.ts`. Le nuove pagine provincia/comune usano lo stesso helper per le CTA (es. campaign `provincia-[sigla]`). |
| **Design system "zen" B/N** | Riusare i componenti esistenti (`BandoCard`, `BreadcrumbCantiere`, `FAQ`, `StatCard` pattern, chip). NIENTE nuovi pattern visivi. Provincia/comune = clone stilistico di `/[regione]`. |
| **Missione "serio e pulito, zero clutter"** | **Argomento decisivo a favore dell'indicizzazione selettiva (§1):** non spammiamo 50k pagine sottili. Curare = posizionamento. Pagine hub con dati veri, schede ricche indicizzate, thin in `noindex`. |
| **Ambiente produzione (rete IP)** | DB condiviso con HUB. Le query enumerano fino a 50k righe: usare sempre `fetchAllBandiRows` (paginato) o `count head:true`, MAI `select('*')` senza limite. Attenzione ai tempi di build/ISR: `generateStaticParams` su province (~107) e comuni (~150) è OK; sui bandi NON pre-renderizzare tutti (resta ISR on-demand su `/bandi/[slug]`, già così). |

---

## 9. Roadmap di implementazione (prioritizzata)

### P0 — Blocco tecnico + fondamenta SEO (subito)
1. **`src/lib/seo/indexable.ts`** — helper `isBandoIndexable` (§1.3).
2. **`getIndexableBandiSlugs`** in `bandi.ts` (§2.4).
3. **Sitemap index** via `generateSitemaps()` (§2.3) — risolve il blocco dei 50k URL. Solo indicizzabili.
4. **`robots` meta su `/bandi/[slug]`** (§1.5) — `noindex,follow` sui thin, self-canonical sempre.
5. **Query di calibrazione** (§1.4) eseguite e soglie tarate prima del deploy.
6. **`breadcrumbLd`** in `structured-data.ts` + render su tutte le pagine con breadcrumb (§5.1).

### P1 — Architettura GEO provincia (alto impatto)
7. **`src/lib/province.ts`** — whitelist + slug + intro (§3.2).
8. **Query** `getBandiByProvincia`, `getProvinciaStats` (§3.3); rendere `getBandi` provincia `eq` non `ilike`.
9. **Pagina `/[regione]/[provincia]/page.tsx`** (§3.4) con anti-duplicazione (§3.5).
10. **Blocco "Province di [Regione]"** su `/[regione]` (§4.2.1) — link regione→provincia.
11. **Cross-link** su `/bandi/[slug]` ("altri bandi in [provincia]") e `/categoria/[cpv]` ("per regione") (§4.2).
12. **Sitemap chunk province** (id 3) + BreadcrumbList provincia.

### P2 — Comuni + rifiniture AEO (consolidamento)
13. **`src/lib/comuni.ts`** + `getIndexableComuni` (soglia da §1.4) (§3.6).
14. **Pagina `/[regione]/[provincia]/[comune]/page.tsx`** (§3.6) + sitemap chunk comuni (id 4).
15. **Rifiniture AEO** (§7): `areaServed` AdministrativeArea negli schemi, `datasetLd` su home/statistiche.
16. (Opzionale) **`unavailable_after`** sui bandi aperti (§1.5); flag `indexable` materializzato in ingestion (§2.4).

---

## 10. Note di allineamento con la rete

- La regola di indicizzazione selettiva e lo schema GEO `/[regione]/[provincia]` sono **replicabili**
  su altri satelliti con dati geolocalizzati (italiacantieri.it ha già provincia/regione): vale la pena
  promuovere `province.ts` e `isBandoIndexable` (versione generica) a pattern condiviso, eventualmente
  in `@websonica/cantieri-core`, una volta validati qui.
- Sitemap index: stesso pattern adottabile su tutti i satelliti che superano i 50k URL.

---

### Fonti (best practice verificate)
- Google Search Central — [Manage large sitemaps with index files](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)
- linkbot — [Sitemap limits: 50.000 URL / 50MB](https://library.linkbot.com/what-are-the-url-and-file-size-limits-for-sitemaps-and-how-can-large-sites-adapt/)
- Search Engine Land — [Index bloat: what it is & how to fix it](https://searchengineland.com/guide/index-bloat)
- Botify — [Expired content & SEO: how to handle old listings](https://www.botify.com/blog/expired-content-seo)
- Outranking — [The Ultimate Guide to Local SEO in Italy (2025)](https://www.outranking.io/blog/guide-to-local-seo-in-italy/)
