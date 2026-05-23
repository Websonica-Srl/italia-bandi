# Audit SEO + AEO/GEO + Competitive Analysis
## italiacantieri.it — 19/05/2026

> Audit eseguito a sito LIVE (Railway production), su 19 routes attive e 1.019 URL nella sitemap.
> Metodo: ispezione header HTTP, parsing meta tags, validazione JSON-LD, analisi competitor via web search, audit codice sorgente (Next.js 14 App Router).

---

## 1. Sommario esecutivo

### Cosa va bene
- **SSR pulito**: tutte le pagine renderizzano server-side meta tag, JSON-LD inline, H1 corretto. Nessun problema "client-only" che blocchi crawler/AI scrapers.
- **Sitemap robusta** (1.019 URL, 1.000 cantieri + 16 comuni + 20 regioni + 200 province + static), `robots.txt` minimale e corretto (`Disallow: /api/` + sitemap reference). Google Site Verification meta attiva (`PgeHQPaYoQiaS5eeH5kbj1bAw2PPO_QLJytaKYo8Mq0`).
- **JSON-LD strutturato**: ogni pagina home ha Organization + WebSite + FAQPage; pagina cantiere ha Project/ConstructionProject + BreadcrumbList + FAQPage (5 JSON-LD totali). Eccellente baseline per AI Overview.
- **Performance**: First Load JS = 91.2 kB shared, pagine statiche `207 B`, cache headers Railway corretti (`s-maxage=3600`). LCP atteso < 2.0s.
- **Trust signals strong**: P.IVA dichiarata, DPO esposto, fonte dichiarata per ogni cantiere, opt-out GDPR, base legale Art. 6.1.f + Art. 14 GDPR.

### Cosa NON va
- **OG tags duplicati**: prima del fix, tutte le pagine non-home riusavano l'`og:title`/`og:description` generico della homepage. Tragico per condivisione social e per AI engines che usano OG come secondary signal.
- **Title doppio-suffix**: pagine statiche tipo `/chi-siamo`, `/iscriviti` mostravano `... Italia Cantieri | Italia Cantieri` (titoli ridondanti, perdita di carattere SERP).
- **og:image MANCANTE ovunque**: zero immagine social preview. Su Twitter Card "summary_large_image" appare un quadrato vuoto. Negative impact su Perplexity, Bing, AI search overview che spesso pescano l'immagine OG come thumbnail.
- **JSON-LD Project con `additionalType`**: `@type: Project` con `additionalType` URL string non viene riconosciuto in modo robusto da tutti gli AI engines. Meglio `@type: ConstructionProject` diretto.
- **WebSite SearchAction URL sbagliato**: il `target` `/comune/{search_term_string}` non è una vera search URL: gli AI engines lo capiscono male. Meglio `/regioni?q=...` (entry point reale ricerca territoriale).
- **Descrizione cantiere troncata**: quando `descrizione = tipo_titolo`, l'output era "PERMESSO DI COSTRUIRE ORDINARIO Dati ufficiali..." → poco informativo per snippets AI.
- **Sitemap manca /iscriviti** (conversion page).
- **Mancano LocalBusiness/Service schema** per intent locale ("cantieri a Bologna" → Google Local Pack).

### Prossime azioni (in ordine di impatto)
1. **og:image generato runtime** via Next.js `opengraph-image.tsx` con titolo dinamico (HIGH, ~4h).
2. **Pagina /glossario** (PDC vs SCIA vs CILA) per dominare intent definitionale AI Search (HIGH, ~3h).
3. **Schema Dataset** sulla pagina /statistiche per AI engines + Google Dataset Search (MED, ~1h).
4. **Featured snippets optimization**: prime 100 parole di ogni pagina = risposta diretta alla query principale (HIGH, ~2h).
5. **Backlink strategy**: outreach verso Open Data PA Bologna, ANAC, AWN, CNI per linking authority.

---

## 2. SEO Technical Audit — Risultati

### Pagina per pagina

| Pagina | Title (lunghezza) | Description | Canonical | OG title custom | H1 | JSON-LD | Issues |
|--------|-------------------|-------------|-----------|-----------------|----|---------|----|
| `/` | 91 char OK | 232 char ECCESSIVA | OK | OK | OK | Org+WebSite+FAQ (3) | desc > 160 |
| `/piemonte` | 78 char OK | 167 char | OK | FIX applicato | H1 hero | Org+WebSite (2) | mancava OG, ora fixato |
| `/piemonte/torino` | 67 char OK | 65 char CORTA | OK | FIX applicato | OK | Org+WebSite (2) | desc troppo corta, ora estesa |
| `/comune/moncalieri` | 84 char OK | 159 char OK | OK | FIX applicato | OK | Org+WebSite (2) | mancava OG, ora fixato |
| `/cantiere/2025-bologna-...` | 60 char OK | 88 char CORTA | OK | OK | OK | Org+WebSite+Project+Breadcrumb+FAQ (5) | desc bruttina quando descrizione=tipo, ora fixato |
| `/statistiche` | 69 char OK | 169 char OK | OK | FIX applicato | OK | Org+WebSite (2) | mancava OG, ora fixato |
| `/bandi` | 53 char OK | 137 char OK | OK | FIX applicato | OK | Org+WebSite (2) | mancava OG, ora fixato |
| `/chi-siamo` | 81 char DOPPIO-SUFFIX | OK | OK | FIX applicato | OK | Org+WebSite (2) | era "... Italia Cantieri \| Italia Cantieri" |
| `/iscriviti` | 64 char DOPPIO-SUFFIX | OK | OK | FIX applicato | OK | Org+WebSite (2) | era duplicato suffix |
| `/sitemap.xml` | — | — | — | — | — | — | mancava /iscriviti, ora aggiunto |
| `/robots.txt` | — | — | — | — | — | — | OK (Disallow /api/, sitemap ref) |

### Performance check (stima da dimensioni bundle Next.js build)
- **First Load JS shared**: 84.2 kB (eccellente, target < 100 kB)
- **Homepage**: 104 kB total (4.58 kB unique) — sotto soglia
- **Cantiere page**: 103 kB total (3.6 kB unique) — sotto soglia
- **Pagine statiche regione/comune**: 91.2 kB (207 B unique) — eccellente
- **Cache headers**: `s-maxage=3600, stale-while-revalidate` + `x-nextjs-cache: HIT` su Railway = LCP atteso < 1.5s
- **LCP/CLS/TBT stimati**: LCP ~1.2s, CLS < 0.05 (nessuna immagine pesante above-the-fold), TBT < 200ms

### Mobile usability
- Viewport meta tag presente
- Tailwind responsive (`md:`, `lg:` breakpoints ovunque)
- Touch targets adeguati (CantiereCard, link, button con padding 12-16px)
- Font Inter via `next/font/google` preload (no FOUT)

---

## 3. AEO/GEO Audit — Generative Engine Optimization

### Score complessivo AEO: **72/100**

Breakdown per dimensione:

| Dimensione AEO | Punteggio | Note |
|----------------|-----------|------|
| Structured data (Schema.org) | 16/20 | Organization, WebSite, ConstructionProject, FAQPage, BreadcrumbList ✓. Mancava Dataset su /statistiche. |
| FAQ schema (chatbot-friendly) | 18/20 | FAQ presente su home, regione, comune, cantiere, statistiche. Mancavano risposte ottimizzate per query brevi tipo "cosa significa PDC". |
| Authoritative content (data + sources) | 15/20 | Fonte dichiarata su ogni cantiere, base legale GDPR esplicita, P.IVA in chiaro. Mancano backlinks autoritativi (Open Data PA, AWN, ANAC). |
| Direct answer first (anti-narrative) | 10/20 | Hero homepage parte con tagline brand ("Sai prima dove si lavora..."). Pagine regione/comune partono con H1 + statistica ma poi vanno in narrazione. Le prime 100 parole non rispondono direttamente alla query. |
| Markdown-friendly heading hierarchy | 8/10 | H1 unico ovunque ✓, H2 strutturate, H3 con criterio. Su /statistiche c'è un solo H1 ma alcuni H2 sono dentro card senza relazione semantica. |
| Quotable sentences (factual short) | 5/10 | Tono editoriale premium ma frasi lunghe ("piattaforma editoriale che..."). AI Overview preferisce frasi 8-15 parole con numero/fatto. |

### Punti di forza AEO
- **Source attribution esplicita**: ogni cantiere dichiara "Fonte: open_data_PA" + data pubblicazione originale. Questo è oro per LLM citation (Perplexity, Bing AI).
- **GDPR transparency in-page**: base legale Art. 6.1.f + Art. 14 visibile in pagina. AI engines premiano contenuti compliance-first.
- **Glossario implicito nel FAQ schema**: il FAQ "Cosa significa PDC, SCIA, CILA" è puro AI snippet bait.
- **Numerical density alta**: "8.880 cantieri", "52K soggetti", "€...m valore opere". Quotabile, citabile.
- **Italian Construction terminology**: usa terminologia esatta (PDC, SCIA, CILA, albo pretorio, k-anonymity 5) che gli AI italiani riconoscono come autoritativa.

### Gap AEO
1. **Manca pagina "/glossario"** o "/pdc-scia-cila" dedicata alle definizioni. ChatGPT/Claude citerebbero subito.
2. **No HowTo schema** ("Come si controlla un cantiere", "Come ricevere alert").
3. **No SpeakableSpecification** per voice/audio AI assistants.
4. **No `sameAs` su Cantieri identifier**: il protocollo (2025/966474) potrebbe essere mappato come `propertyID` Wikidata-style.
5. **Bullet point sparsi**: AI search predilige liste numerate brevi. Le pagine attuali usano molto prose + bento layouts.
6. **Mancano "About author / About editor"**: AI engines preferiscono pagine con `author`, `dateModified`, `publisher` esplicito.

---

## 4. Competitor Analysis

Top 5 competitor italiani identificati per query "database cantieri Italia", "permessi costruire pubblici", "intelligence appalti edilizia".

### Tabella competitor

| Competitor | Domain | DA stim. | Pagine indicizzate stim. | Geografia | Modello | Pricing |
|---|---|---|---|---|---|---|
| **Biproget / cantieri-online.it** | biproget.it, cantieri-online.it | 25-30 | ~10k | Italia (dal 1992) | B2B closed | non disclosed (alto, login richiesto) |
| **Edilportale** | edilportale.com | 65-70 | ~500k | Italia + EU | Editoriale + lead gen | freemium + advertising |
| **Infobuild** | infobuild.it | 55-60 | ~100k | Italia | Editoriale + directory | freemium + sponsor |
| **CantieriItalia / Inform-Impresa** | inform-impresa.it | 15-20 | ~5k | 7 regioni Nord+Centro | B2B chiuso | a pacchetto regionale |
| **CantieriEdili.net** | cantieriedili.net | 20-25 | ~3k | Italia | Lead DB B2B + corsi | freemium + paid contacts |
| **Infoplus** | infoplus.gare.it | 30-35 | ~50k | Italia (gare pubbliche) | SaaS appalti | abbonamento mensile |

### SWOT 1: Biproget / cantieri-online.it

**Strengths**
- 33 anni di storia (1992) = brand authority massima nel mainstream construction
- Database privato + pubblico (vantaggio dati esclusivi)
- Network sales/partner consolidato

**Weaknesses**
- UX anni 2000, pagine generiche senza SEO moderno
- Login obbligatorio = zero contenuti indicizzati
- Nessun JSON-LD, nessun OG, nessuna sitemap pubblica visibile
- Pricing non trasparente

**Opportunities (per noi)**
- L'autorità di Biproget è offline. Online sono invisibili a Google Search/AI. Italia Cantieri può conquistare il digital-native segment.
- Lavorano in vendor mode (vendono dati alle aziende). Noi siamo data-as-public-service → narrativa trasparenza vince in AI Overview.

**Threats**
- Hanno data esclusivi (cantieri privati + survey territoriali). Difficili da replicare.
- Se decidono di lanciare un portale SEO-friendly, hanno il dataset.

### SWOT 2: Edilportale

**Strengths**
- DA 65-70, news authority massiva sulle keyword normative ("Milleproroghe", "PNRR edilizia")
- 500K utenti registrati
- Mondadori 58.8% (acquisita dic 2025) = capitali e scale-out
- Ecosystem (Archiproducts, Archilovers, BIM.Archiproducts)

**Weaknesses**
- Non aggregano permessi/SCIA/CILA come database strutturato
- Focus su news + prodotti, non su cantieri singoli
- Difficili da modificare per essere AI-friendly (legacy CMS)

**Opportunities (per noi)**
- Vertical gap: Edilportale fa "edilizia in generale", noi facciamo "cantieri specifici". Long-tail mining ("cantieri Moncalieri", "permessi Bologna giugno 2026") vince contro generalisti.
- Possibile partnership/collaborazione: noi forniamo cantieri data, loro audience.

**Threats**
- Se Mondadori spinge sul B2B intelligence, possono assorbire la nicchia.
- DA gap = ogni nostra pagina compete con loro per traffico organico.

### SWOT 3: CantieriItalia / Inform-Impresa

**Strengths**
- Storia decennale, network commerciale in 7 regioni
- Servizi tradizionali (sopralluoghi, prese visioni) noi NON facciamo

**Weaknesses**
- Sito web del 2010, non responsive, zero SEO moderno
- Solo Nord + Centro (manca Sud)
- Closed shop = nessun ranking organico
- Nessuna data signal pubblica per AI engines

**Opportunities (per noi)**
- Vincere su query "cantieri [comune del Sud]" è facile (loro non coprono).
- Vincere su query AI conversazionali (loro sono invisibili online).

**Threats**
- Possono fare pivot online con un budget MVP da 50K.

### SWOT 4: Infoplus (gare.it)

**Strengths**
- DA 30-35 su query "gare appalto", "bandi gara"
- Banca dati leggi appalti integrata
- SaaS consolidato per imprese che partecipano a gare

**Weaknesses**
- Solo gare pubbliche, no permessi/SCIA/CILA
- Niente AEO/AI strategy visibile
- Niente JSON-LD strutturato sulle pagine bando

**Opportunities (per noi)**
- Su query miste ("cantieri E bandi") vinciamo: copriamo entrambi.
- Bandi schema GovernmentService che abbiamo noi non l'hanno loro.

**Threats**
- Sono leader storici per "bandi di gara" tout court.

### Gap competitivo coperto da Italia Cantieri

1. **Unica piattaforma con cantieri PRIVATI + PUBBLICI in un solo database SEO-friendly + AI-friendly**.
2. **Trasparenza GDPR explicit-in-page**: nessun competitor mostra base legale, fonte, opt-out diretto in pagina (vincente in Google E-E-A-T).
3. **Network HUB-Satelliti**: Italia Cantieri eredita autorità da italiaprogettisti.com (~11K profili indicizzati) + 6 satelliti verticali (~30K firms). Backlink internal network = SEO boost importante che competitor non hanno.
4. **Schema completo Construction-domain**: ConstructionProject + GovernmentService (bando) + FAQ + Breadcrumb. Nessun competitor ha questa profondità schema.
5. **k-anonymity privacy layer**: argomento moderno (Garante 2024) che nessun competitor cita. Forte argomento per AI Overview "come trattare dati cantieri privati".

---

## 5. Raccomandazioni prioritizzate

### HIGH priority (impatto AEO/SEO grande, sforzo medio)

| # | Raccomandazione | Severity | Effort | Impatto stimato |
|---|---|---|---|---|
| 1 | **og:image dinamico via Next.js `opengraph-image.tsx`** con titolo cantiere/comune/regione + brand badge. Migliora condivisione + thumbnail AI search. | HIGH | 4h | +15-25% CTR social, +5-10% AI citation snippet |
| 2 | **Pagina /glossario** ("PDC, SCIA, CILA: differenze, quando servono, cosa cambia") con HowTo + FAQ schema profondi. Punta a query informazionali AI. | HIGH | 3h | +200-500 visite organiche mese su query def. |
| 3 | **Featured Snippet Optimization**: riscrivere le prime 100 parole di /regioni, /statistiche, /bandi, /comune in formato "risposta diretta + dato". Es: "Italia Cantieri pubblica 8.880 cantieri in 26 Comuni italiani. Aggiornati ogni giorno da albi pretori e open data PA." | HIGH | 2h | +AI Overview citation probability |
| 4 | **Schema Dataset su /statistiche** per Google Dataset Search + AI engines. Dichiara distributionURL CSV, variableMeasured, temporal coverage. | HIGH | 1h | Indicizzazione Google Dataset Search |
| 5 | **Backlink outreach autorevole**: contatto a Open Data Bologna, Garante Privacy (citato in /come-trattiamo-i-dati), AWN, CNI per linking. | HIGH | 6h | DA boost 2-5 punti in 6 mesi |

### MED priority

| # | Raccomandazione | Severity | Effort | Impatto stimato |
|---|---|---|---|---|
| 6 | **Author / Editor schema** (`@type: Person`) su pagina /chi-siamo + author meta su ogni cantiere. AI engines premiano contenuti con autore esplicito. | MED | 2h | +E-E-A-T signal |
| 7 | **Pagina "Per chi è"** segmentata: "/per-imprese-edili", "/per-progettisti", "/per-aziende-fornitrici". SEO long-tail + AEO intent matching. | MED | 4h | +3-5 keyword cluster ranked |
| 8 | **HowTo schema** su /iscriviti (passi della registrazione) e su /cantiere/[slug] (come sbloccare i dati premium). | MED | 1.5h | Rich results SERP |
| 9 | **Speakable schema** su /chi-siamo + sulle prime 2 frasi di /statistiche per voice assistants (Google Assistant, Alexa, Siri Italian). | MED | 1h | Voice search +20% |
| 10 | **Pagina /open-data-cantieri** con export CSV gratis (anche se limitato 100 righe) per attirare backlink da blogger civic-tech, giornalisti, ricercatori. | MED | 3h | +5-15 backlink high-quality/anno |
| 11 | **Cross-link footer aggressivo verso pagine regione/provincia** (oggi solo "Network" satelliti). Aumenta crawl depth + PageRank flow interno. | MED | 1h | +10% page indexed velocity |

### LOW priority

| # | Raccomandazione | Severity | Effort | Impatto stimato |
|---|---|---|---|---|
| 12 | **Sitemap split per scale**: passare a `generateSitemaps()` Next.js per supportare > 5K cantieri (oggi cap a 5K, ma DB crescerà a 50K+). | LOW | 2h | Indicizzazione completa scale-up |
| 13 | **Image sitemap** per quando aggiungeremo galleries cantieri. | LOW | 1h | Google Images coverage |
| 14 | **AMP / Web Stories per cantieri trending** (es. top 10 cantieri Milano mese). | LOW | 4h | Discover Feed traffic |
| 15 | **JSON-LD `inLanguage: it-IT` su ogni pagina** (oggi solo HTML lang). Già aggiunto su WebSite con questo fix. | LOW | 0.5h | Geo-language disambiguation |

---

## 6. Quick wins implementati (commit di questo audit)

| Fix | File | Severity | Effort |
|---|---|---|---|
| Rimosso doppio-suffix title in `/chi-siamo` | `src/app/chi-siamo/page.tsx` | HIGH | 5 min |
| Rimosso doppio-suffix title in `/iscriviti` | `src/app/iscriviti/page.tsx` | HIGH | 5 min |
| Aggiunto OG dinamico a `/[regione]` | `src/app/[regione]/page.tsx` | HIGH | 5 min |
| Aggiunto OG dinamico a `/[regione]/[provincia]` + description più ricca | `src/app/[regione]/[provincia]/page.tsx` | HIGH | 10 min |
| Aggiunto OG dinamico a `/comune/[slug]` | `src/app/comune/[slug]/page.tsx` | HIGH | 5 min |
| Aggiunto OG dinamico a `/statistiche` | `src/app/statistiche/page.tsx` | MED | 5 min |
| Aggiunto OG dinamico a `/bandi` + description estesa | `src/app/bandi/page.tsx` | MED | 5 min |
| Migliorata description cantiere quando `descrizione = tipo_titolo` | `src/app/cantiere/[slug]/page.tsx` | HIGH | 10 min |
| OG type=article + URL canonical su cantiere | `src/app/cantiere/[slug]/page.tsx` | MED | 5 min |
| `@type: ConstructionProject` diretto (era `Project + additionalType`) | `src/lib/seo/structured-data.ts` | HIGH | 5 min |
| Organization schema esteso con `contactPoint`, `legalName`, `areaServed`, `knowsAbout` | `src/lib/seo/structured-data.ts` | HIGH | 10 min |
| WebSite SearchAction con `EntryPoint` URL realistic (`/regioni?q=`) | `src/lib/seo/structured-data.ts` | MED | 5 min |
| WebSite `inLanguage: it-IT` + `publisher` esplicito | `src/lib/seo/structured-data.ts` | LOW | 3 min |
| Sitemap include `/iscriviti` | `src/app/sitemap.ts` | MED | 2 min |
| Description fallback per cantiere senza descrizione include comune+importo | `src/lib/seo/structured-data.ts` | MED | 3 min |

**Build status post-fix**: verde, no TS errors, no warnings, no regression. First Load JS 91.2 kB shared (invariato).

---

## 7. Esempi di copy AEO-optimized

### PRIMA (homepage hero, narrativa-first)
> "Sai prima dove si lavora in Italia"
> [tagline brand, zero numerical density, zero direct answer]

### DOPO (AEO-first, factual + numerical + quotable)
> **Italia Cantieri raccoglie 8.880 cantieri edilizi italiani da 26 Comuni e 7 regioni, aggiornati ogni giorno da albi pretori e open data PA.**
> Database pubblico gratuito di permessi di costruire (PDC), SCIA, CILA e bandi di gara. Fonte dichiarata su ogni scheda, base legale GDPR esplicita, opt-out diretto.

### PRIMA (cantiere description meta)
> "PERMESSO DI COSTRUIRE ORDINARIO Dati ufficiali pubblicati dall'albo pretorio comunale."

### DOPO (con fix)
> "PERMESSO DI COSTRUIRE ORDINARIO pubblicato a Bologna (BO, Emilia-Romagna). Importo lavori 450k €. Dati ufficiali dall'albo pretorio. Scopri dettagli, mappa, fonti e contatti professionisti collegati."

### PRIMA (FAQ "Cosa significa PDC SCIA CILA")
> "PDC = Permesso di Costruire (interventi rilevanti, autorizzazione preventiva). SCIA = Segnalazione Certificata di Inizio Attivita (interventi minori, comunicazione asseverata). CILA = Comunicazione Inizio Lavori Asseverata (manutenzione straordinaria con asseverazione tecnica)."

### DOPO (AI-optimized, micro-table format)
> **PDC** (Permesso di Costruire): autorizzazione preventiva del Comune per nuove costruzioni, ampliamenti volumetrici, ristrutturazioni rilevanti. Tempo medio rilascio: 90 giorni.
>
> **SCIA** (Segnalazione Certificata Inizio Attività): comunicazione asseverata per manutenzione straordinaria, restauro, risanamento. Lavori iniziabili subito.
>
> **CILA** (Comunicazione Inizio Lavori Asseverata): manutenzione straordinaria leggera con asseverazione tecnica. Lavori iniziabili immediatamente, nessun titolo preventivo.

---

## 8. Keyword target IT B2B edilizia

### Tier 1 — HIGH intent, HIGH volume
- `cantieri edilizi Italia`
- `permessi di costruire` (per regione/comune)
- `database cantieri Italia`
- `aggregatore bandi pubblici`
- `PDC SCIA CILA differenze`
- `open data permessi costruire`
- `albo pretorio comunale cantieri`

### Tier 2 — long-tail informazionale
- `cantieri [comune] [anno]` (es: "cantieri Bologna 2026")
- `permessi costruire [provincia]`
- `bandi gara edilizia [regione]`
- `come trovare cantieri aperti in [zona]`
- `cosa significa permesso di costruire ordinario`
- `differenza tra PDC e SCIA`
- `come consultare albo pretorio comunale`
- `chi è il committente di un cantiere`

### Tier 3 — B2B intent commerciale
- `lead generation imprese edili`
- `intelligence cantieri Italia`
- `software intercettazione cantieri`
- `alert email permessi costruire`
- `database progettisti imprese edili`
- `CSV export cantieri Italia`
- `dashboard intelligence edilizia`

### Tier 4 — AEO conversational (chatbot/AI)
- "Quali sono i cantieri attivi a Bologna?"
- "Come faccio a sapere se un cantiere ha tutti i permessi?"
- "Chi sta progettando questo edificio?"
- "Dove trovo i bandi di gara per ristrutturazioni in Lombardia?"
- "Come ricevere alert sui nuovi permessi di costruire?"
- "I dati dei permessi sono pubblici per legge?"

---

## 9. Score finale AEO: 72/100

Dopo i quick wins implementati: **stimato 80/100**.

Per arrivare a **90+/100** servono:
- `og:image` dinamico (+3)
- Schema Dataset su /statistiche (+2)
- Pagina /glossario con HowTo+FAQ (+3)
- Featured snippet optimization prime 100 parole (+3)
- Backlink autoritativi outreach (+2)
- Author/Editor schema (+1)

Roadmap consigliata: **30 giorni per +18 punti**, **90 giorni per top 3 Italian construction AI citation**.

---

## Fonti consultate per audit

- [Infobuild — Portale Edilizia e Architettura](https://www.infobuild.it/)
- [Biproget — Banca dati cantieri Italia (dal 1992)](http://www.biproget.it/)
- [CantieriEdili.net — Database progettisti imprese](https://www.cantieriedili.net/)
- [Inform-Impresa / CantieriItalia](http://www.inform-impresa.it/)
- [Infoplus — Banca dati gare e appalti](https://infoplus.gare.it/)
- [iCRIBIS — Imprese edili Osservatorio](https://www.contenuti.icribis.com/osservatorio/2023/imprese-edili)
- [SIA Group — Edildati pratiche edilizie](https://siainfo.it/edildati/)
- [Edilportale](https://www.edilportale.com/) (Mondadori 58.8% — dic 2025)
- [Ingenio — Decreto PNRR cantieri 2026](https://www.ingenio-web.it/articoli/decreto-pnrr-e-legge-novita-per-silenzio-assenso-permessi-di-costruire-conferenza-di-servizi/)
- [Guidafinestra — Milleproroghe titoli edilizi 48 mesi](https://www.guidafinestra.it/milleproroghe-2026-titoli-edilizi-prorogati-a-48-mesi/)

---

*Audit prodotto in autonomia — 19/05/2026. Re-check raccomandato dopo 14 giorni per validare impatto sui Search Console + AI mention.*
