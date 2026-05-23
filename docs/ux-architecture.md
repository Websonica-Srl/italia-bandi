# Italia Cantieri — Audit UX & Information Architecture

**Data audit:** 19/05/2026
**Agente:** ArchitectUX
**Scope:** italiacantieri.it (HUB pubblico cantieri/bandi, parte network Italia Progettisti)
**Repo analizzato:** commit `a946e2f`
**Tipo intervento:** Audit + specifica (NO modifiche codice)

---

## 1. Sintesi esecutiva

### 1.1 Verdetto generale
Il sito è **strutturalmente solido** ma ha **lacune sostanziali nel funnel di conversione** verso italiaprogettisti.com. L'IA esistente copre bene il livello "navigazione SEO" (regioni → province → comuni → cantieri) ma manca completamente di:
- **Pagine landing dedicate al funnel** (per studi, per imprese, "come funziona")
- **CTA above-the-fold sulla scheda cantiere** (la pagina con più traffico organico previsto)
- **Trust signals quantitativi** (numeri, testimonial, loghi, garanzie)
- **Differenziazione del valore** tra "consultare gratis" e "registrarsi su HUB" — l'utente non capisce *cosa ottiene in più* registrandosi

### 1.2 Cosa funziona bene
- Header semplice, nav chiara con 5 voci (rispetta la regola 5±2)
- Footer ben organizzato in 4 colonne tematiche (Esplora / Trasparenza / Network / Brand)
- Breadcrumb gerarchico presente su tutte le pagine di dettaglio
- Trust signal GDPR/open data visibile in homepage hero (badge tondo)
- Sezione "k-anonymity" sulla scheda comune è didattica e crea curiosità per il premium
- Componente `CrossLinkCorrelati` già in scheda cantiere — base solida da potenziare
- Componente `RichiediRimozioneCTA` ben distinto visivamente (giallo) — corretta separazione semantica
- Layout responsive con `container-zen`, gerarchia tipografica coerente (`heading-hero`, `heading-section`)

### 1.3 Cosa va migliorato (priorità)
| Severity | Area | Friction |
|---|---|---|
| **HIGH** | Scheda cantiere | Manca CTA premium above-the-fold; CrossLink esiste solo a fondo pagina |
| **HIGH** | Funnel HUB | Manca pagina `/iscriviti` o `/per-studi` / `/per-imprese` con value prop |
| **HIGH** | Homepage | CTA finale generico — non differenzia studio vs impresa |
| **MED** | Header | Manca link primario "Iscriviti" — solo "Sblocca Premium" che ha brand non riconoscibile |
| **MED** | Scheda comune | Sezione k-anon è OK ma "Sblocca Premium" è underline testuale, non bottone |
| **MED** | Trust signals | Mancano numeri aggregati globali (X imprese, Y studi, Z lead/mese) |
| **LOW** | Mobile menu | "Sblocca Premium" è in fondo, va portato sopra |
| **LOW** | Statistiche | Pagina non visibile collegata al funnel — opportunità SEO sprecata |

---

## 2. User Journey Map

### 2.1 Persona target principale: visitatore organico SEO

**Profilo:** professionista (geometra, architetto, ingegnere) o impresa edile/serramentista che cerca su Google query tipo:
- `"permessi costruire milano 2026"`
- `"cantieri attivi torino"`
- `"bandi gara edilizia lombardia"`
- `"SCIA bologna nome cliente"`
- `"chi sta costruendo via roma"`

### 2.2 Journey attuale (AS-IS)

```
[Google SERP]
     │
     ▼
[Scheda cantiere /cantiere/{slug}]
     │ — Vede dati pubblici (protocollo, data, importo, mappa)
     │ — Scrolla fino in fondo
     │
     ▼
[CrossLink "Cerchi imprese a {comune}?"]  ← solo a fondo pagina
     │ — Link a italiaprogettisti.com/comune/{slug}
     │
     ▼
[Atterra su italiaprogettisti.com]
     │ — NESSUNA continuità di brand
     │ — Pagina HUB non ottimizzata per visitatore cold da italiacantieri
     │ — Form registrazione non incentivato con offerta specifica
     │
     ▼
[Probabile abbandono — friction alta]
```

**Friction points identificati:**

1. **Above-the-fold scheda cantiere**: l'utente atterra, vede badge + titolo + indirizzo, ma NON vede nessun amo di conversione. Le info premium (titolare, professionisti coinvolti, cantieri correlati nella zona) NON sono mostrate neppure come "blurred preview".
2. **Mancanza di "intent matching"**: non c'è un quiz/CTA che chiede "Sei impresa che vuole intercettare lavori? Studio che cerca committenti? Cittadino curioso?" — ogni persona ha un funnel diverso.
3. **CrossLinkCorrelati troppo neutro**: dice "Cerchi professionisti a {comune}?" ma NON dice cosa l'utente ottiene (lead, alert, contatti diretti, esclusiva sui dati).
4. **CTA homepage "Registrati gratis"**: il bottone esiste ma non c'è urgenza, scarcity, social proof o anteprima del valore.
5. **Mobile: "Sblocca Premium" nel menu mobile è ultimo elemento, sotto tutti i link** — su mobile è la conversione principale, va sopra.

### 2.3 Journey target (TO-BE)

```
[Google SERP]
     │
     ▼
[Scheda cantiere /cantiere/{slug}]
     │
     ├─ ABOVE-FOLD: badge + titolo + indirizzo + CTA sticky "Vedi chi costruisce qui →"
     │              (apre modale con preview locked + redirect a registrazione)
     │
     ├─ MID-PAGE: dati amministrativi + mappa + (NEW) "Cantieri simili nella zona"
     │
     ├─ END-PAGE: 
     │   ├─ CrossLink potenziato con value prop concreta ("65 imprese attive a Milano + alert email gratis")
     │   ├─ Sezione "Premium sblocca": elenco features con check icon
     │   └─ Trust strip (loghi imprese registrate, contatori live)
     │
     ▼
[/iscriviti?from=cantiere&comune=milano&slug=xyz]  (pagina di atterraggio dedicata)
     │ — Heading personalizzato per fonte
     │ — Quiz 1-click: "Sono impresa / studio / altro"
     │ — Redirect su italiaprogettisti.com/register?type=X&utm_source=cantieri
     │
     ▼
[italiaprogettisti.com/register pre-compilato]
     │ — UTM tracking, conversione attribuita
     │
     ▼
[Utente registrato HUB]
```

---

## 3. Wireframe testuali — Pagine chiave

### 3.1 Homepage `/` (TO-BE)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (sticky)                                                  │
│ Logo │ Regioni │ Bandi │ Statistiche │ Per Studi │ Per Imprese  │
│                                          [ Iscriviti gratis ►]  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HERO (h-screen ~70vh)                                            │
│                                                                  │
│        🛡️ Database pubblico · 36.000+ cantieri tracciati         │
│                                                                  │
│   Tutti i cantieri edilizi d'Italia, in un solo posto.          │
│                                                                  │
│   Permessi PDC/SCIA/CILA + bandi pubblici aggregati da          │
│   PA italiane. Aggiornati ogni 24h.                              │
│                                                                  │
│      [ 🔍 Cerca per comune o codice ISTAT          ] [ Cerca ] │
│                                                                  │
│   Es. Milano · Bologna · Torino · vedi tutte le regioni         │
│                                                                  │
│   🟢 LIVE: 47 nuovi cantieri nelle ultime 24h                   │  ← NEW: trust signal dinamico
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STATS BAR (sticky in-section)                                    │
│  36.451 cantieri  │  20 regioni  │  7.892 comuni  │  €12.3 mld  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: "Per chi è italiacantieri.it?"                      │  ← NEW: intent split
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 🏗️ IMPRESE  │  │ 📐 STUDI    │  │ 👤 CITTADINI │          │
│  │ Trova       │  │ Intercetta  │  │ Consulta dati │          │
│  │ subappalti  │  │ cantieri    │  │ del tuo       │          │
│  │ e lavori   │  │ in fase     │  │ quartiere     │          │
│  │ vicini     │  │ progetto    │  │              │          │
│  │ [Per te ►] │  │ [Per te ►] │  │ [Esplora ►] │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CANTIERI RECENTI                                                 │
│   Grid 3 colonne, 12 card recenti                                │
│   [Vedi statistiche complete ►]                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CANTIERI PER REGIONE                                             │
│   Grid 4 colonne, 12 regioni con conteggio                       │
│   [Vedi tutte le regioni ►]                                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: TRUST STRIP                                         │  ← NEW
│  "Già 850+ studi e imprese si affidano a Italia Progettisti"     │
│  [logo loghi loghi loghi loghi]                                  │
│  ★★★★★ 4.8/5 su 120+ recensioni                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: COME FUNZIONA (3 step)                              │  ← NEW
│  1. Trova cantieri vicini   2. Sblocca dati premium   3. Contatta │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CTA REGISTRAZIONE (esistente, ma DIVISO IN DUE)                  │
│                                                                  │
│  ┌─ Sei impresa edile? ─┐    ┌─ Sei studio? ────┐               │
│  │ Ricevi alert cantieri │    │ Trova committenti  │             │
│  │ a 20km dalla sede     │    │ in fase progettuale│             │
│  │ [Registra impresa ►]  │    │ [Registra studio ►]│             │
│  └────────────────────────┘    └────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER (esistente, OK)                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Cambiamenti chiave vs AS-IS:**
- Header: aggiungere "Per Studi" e "Per Imprese" (sostituire "Trasparenza dati" che può migrare in footer)
- Bottone primario: "Iscriviti gratis" sostituisce "Sblocca Premium" (più universale)
- Hero: aggiungere "LIVE counter" delle ultime 24h (anche fake-static "ultimi giorni")
- Nuova sezione INTENT-SPLIT (3 colonne persone)
- Nuova sezione TRUST STRIP (loghi + rating)
- Nuova sezione COME FUNZIONA (3 step illustrati)
- CTA finale diviso in DUE bottoni (impresa vs studio), non uno generico

---

### 3.2 Scheda cantiere `/cantiere/[slug]` (TO-BE)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (sticky standard)                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Breadcrumb: Regioni > Lombardia > Provincia MI > Milano > Prot. │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HEADER CANTIERE                                                  │
│                                                                  │
│  [Badge: PDC] [Badge: In corso] [Badge: Ristrutturazione]       │
│                                                                  │
│  Ristrutturazione edilizia con cambio destinazione d'uso        │
│                                                                  │
│  📍 Via Roma 12, Milano (MI, Lombardia)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔓 STICKY CTA (NEW above-the-fold!)                     │    │
│  │ Vuoi sapere chi sta costruendo qui?                     │    │
│  │ Titolare, impresa esecutrice, professionisti coinvolti  │    │
│  │ [ Sblocca dati completi → registrazione gratuita ]      │    │
│  │ ✓ Gratis · ✓ Senza carta · ✓ 5 cantieri al mese gratis  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MAPPA (esistente)                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GRID DATI 2 COLONNE                                              │
│  [Dati amministrativi]    [Dati tecnici economici]              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: DATI PREMIUM LOCKED PREVIEW                         │  ← NEW
│                                                                  │
│  🔒 Disponibili nel piano gratuito ItaliaProgettisti:           │
│                                                                  │
│  ┌──────────────────────────────────────┐                       │
│  │ Titolare:      ████████████ (locked) │                       │
│  │ Impresa:       ████████████ (locked) │                       │
│  │ Progettista:   ████████████ (locked) │                       │
│  │ Direttore L.:  ████████████ (locked) │                       │
│  │ Telefono cantiere: ████ (locked)     │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
│  [ Registrati gratis per vedere → ]                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: CANTIERI SIMILI VICINI                              │  ← NEW
│  Mini-grid 3 cantieri stesso comune/categoria                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FONTE TRASPARENZA (esistente)                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: VALUE PROP DIFFERENZIATA                            │  ← NEW
│                                                                  │
│  ┌─ Se sei impresa ─┐    ┌─ Se sei studio ─┐                    │
│  │ Ricevi un alert    │    │ Intercetta nel    │                  │
│  │ ogni nuovo cantiere│    │ database 36k+     │                  │
│  │ entro 20km          │    │ committenti tuoi  │                  │
│  │ [Attiva alert ►]  │    │ [Esplora ►]      │                   │
│  └────────────────────┘    └───────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CROSSLINK ESISTENTE (potenziato con numero imprese)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OPT-OUT (esistente — OK così, mantieni colore amber separato)    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER                                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Cambiamenti chiave vs AS-IS:**
- **STICKY CTA above-the-fold**: la conversione principale è qui. Visibile in 0.5s, mostra value prop chiara
- **Dati premium locked preview**: classico schema "blurred" che mostra COSA si ottiene registrandosi (titolare, impresa, progettista, contatti) — alto impatto psicologico
- **Cantieri simili vicini**: aumenta engagement e tempo permanenza (SEO bonus) + opportunità conversione
- **Value prop differenziata** prima del CrossLink: l'utente capisce SE è per lui prima del CTA
- **Mantieni** opt-out e fonte trasparenza identiche (compliance critica)

---

### 3.3 Pagina regione `/[regione]` (TO-BE)

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER + Breadcrumb                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ HEADER REGIONE                                                   │
│  H1: Cantieri in Lombardia                                       │
│  Subtitle: 12.450 cantieri, 12 province, 1.506 comuni            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ NEW CTA contestuale                                      │    │
│  │ [Ricevi alert email nuovi cantieri in Lombardia →]       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STATS BOX 4 colonne (esistente)                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TOP CATEGORIE BarChart (esistente)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: TOP COMUNI per cantieri                             │  ← NEW
│  Lista 10 comuni più attivi con count + link                     │
│  (oggi salti dalla regione alla provincia, ma il visitatore     │
│  spesso cerca direttamente il comune)                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROVINCE GRID (esistente)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CANTIERI RECENTI GRID (esistente)                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: INTENT CONVERSION                                   │  ← NEW
│  "Operi in Lombardia? Italia Progettisti ha X imprese e Y studi  │
│  attivi nella regione."                                          │
│  [Esplora il network in Lombardia →]                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NEW SEZIONE: SEO CONTENT (long-form)                             │  ← NEW
│  Paragrafo 200-300 parole:                                       │
│  "Il mercato edilizio in Lombardia nel 2026..."                  │
│  Anchor links a sotto-sezioni: storico, trend, top categorie...  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FOOTER                                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Cambiamenti chiave vs AS-IS:**
- CTA contestuale "Ricevi alert" sotto subtitle (early conversion opportunity)
- Top comuni (skip provincia per intent SEO diretto)
- Intent conversion section dedicata
- SEO long-form content per ranking (oggi la pagina è molto skinny dal punto di vista testuale)

---

## 4. Raccomandazioni prioritizzate

### HIGH PRIORITY (implementazione 1-2h ciascuna)

#### R1. Sticky CTA above-the-fold su scheda cantiere [HIGH]
**Cosa:** Aggiungere un banner sticky (o card prominente sotto l'H1) sulla scheda `/cantiere/[slug]` con CTA "Sblocca dati completi → registrati gratis".
**Perché:** È la pagina con maggiore traffico organico previsto. Oggi l'unico CTA è a fondo pagina (`CrossLinkCorrelati`) — la maggioranza dei visitatori non scrolla fino a lì.
**File toccati:** `src/app/cantiere/[slug]/page.tsx` + nuovo componente `<UnlockPremiumCTA />`
**Implementabile in:** 30-45 min

#### R2. Sezione "Dati Premium Locked Preview" su scheda cantiere [HIGH]
**Cosa:** Mostrare quali dati sono disponibili in registrazione (titolare, impresa, progettista, contatti) come blurred/locked rows con CTA "Registrati per vedere".
**Perché:** Loss aversion + curiosity gap. L'utente VEDE cosa gli manca e ha incentivo concreto a registrarsi. Pattern provato su tutte le piattaforme freemium.
**File toccati:** nuovo componente `<DatiPremiumLocked />`, integrato in `/cantiere/[slug]/page.tsx`
**Implementabile in:** 1h

#### R3. Pagina `/iscriviti` con intent splitter [HIGH]
**Cosa:** Pagina dedicata che riceve traffico da tutti i CTA del sito, fa una domanda ("Cosa sei?") con 3 opzioni → redirect a italiaprogettisti.com con UTM + tipo precompilato.
**Perché:** Oggi tutti i CTA puntano a `italiaprogettisti.com/register` o `/abbonamenti` senza pre-qualificazione. Una pagina intermedia 1-step aumenta conversione e attribuzione.
**File toccati:** nuovo `src/app/iscriviti/page.tsx`
**Implementabile in:** 1h

#### R4. Sostituire "Sblocca Premium" con "Iscriviti gratis" nell'header [HIGH]
**Cosa:** Il bottone header dice "Sblocca Premium" — implica pagamento immediato. Cambiare in "Iscriviti gratis" (più universale, meno friction).
**Perché:** "Premium" attiva resistenza commerciale. "Gratis" rimuove friction. Il piano free di ItaliaProgettisti esiste e va valorizzato come gate per la conversione.
**File toccati:** `src/components/Header.tsx`
**Implementabile in:** 5 min

#### R5. CTA homepage diviso impresa vs studio [HIGH]
**Cosa:** La sezione CTA finale homepage è generica. Dividere in 2 card affiancate "Sei impresa edile?" / "Sei studio di progettazione?" con value prop specifica e bottone dedicato.
**Perché:** Le due persone hanno bisogni opposti (imprese cercano cantieri da subappaltare, studi cercano committenti). Un CTA generico converte male.
**File toccati:** `src/app/page.tsx`
**Implementabile in:** 30 min

### MED PRIORITY (implementazione 1-3h ciascuna)

#### R6. Pagine landing dedicate `/per-studi` e `/per-imprese` [MED]
**Cosa:** Due pagine separate con:
- Hero specifico per persona (es. "Studi: trova committenti in fase di progettazione")
- 3-4 features visuali (alert, mappa cantieri, esportazione, contatti)
- Esempi/screenshot
- Pricing (rimando a italiaprogettisti.com/abbonamenti)
- FAQ specifiche
- CTA registrazione tipizzato
**Perché:** Conversion landing pages per intent specifico. Anche utili per Google Ads e LinkedIn ads futuri.
**File toccati:** `src/app/per-studi/page.tsx`, `src/app/per-imprese/page.tsx`
**Implementabile in:** 2-3h totale

#### R7. Sezione "Come funziona" su homepage [MED]
**Cosa:** 3 step illustrati subito sotto stats box: "1. Trova cantieri vicini → 2. Sblocca dati premium → 3. Contatta titolare". Anche pagina dedicata `/come-funziona` per SEO.
**Perché:** Riduce ambiguità su cosa fa il prodotto. Necessario per visitatori cold che non conoscono la categoria.
**File toccati:** `src/app/page.tsx` + opzionale `src/app/come-funziona/page.tsx`
**Implementabile in:** 1.5h

#### R8. Trust strip homepage (loghi + numeri network) [MED]
**Cosa:** Sezione orizzontale con "Già X studi e Y imprese usano Italia Progettisti", loghi clienti, eventuale rating G2/Trustpilot.
**Perché:** Social proof critico per conversione. Numeri di network = leva del satellite.
**File toccati:** `src/app/page.tsx`
**Implementabile in:** 1h

#### R9. Potenziare `CrossLinkCorrelati` con value prop quantitativa [MED]
**Cosa:** Oggi dice "X imprese attive a {comune}". Aggiungere:
- Tag specifici (es. "12 imprese edili · 5 studi architettura")
- Bottone CTA più forte ("Esplora ora →" con frecce, non solo link sottolineato)
- Visual mini-grid di 3 logo/avatar imprese top
**File toccati:** `src/components/cantieri/CrossLinkCorrelati.tsx`
**Implementabile in:** 1h

#### R10. Convertire menu mobile con CTA in testa [MED]
**Cosa:** Spostare "Iscriviti gratis" come PRIMO elemento del menu mobile (oggi è ultimo).
**Perché:** Su mobile il CTA principale deve essere immediatamente raggiungibile. Pattern standard (vedi Linear, Vercel, Notion).
**File toccati:** `src/components/Header.tsx`
**Implementabile in:** 10 min

### LOW PRIORITY (nice-to-have, implementabili dopo)

#### R11. Pagina `/come-funziona` standalone con anchor links [LOW]
SEO/AEO friendly per query informational. Long-form content con TOC laterale.

#### R12. Sticky bar bottom-of-page con CTA su tutte le pagine [LOW]
Pattern alternativo allo sticky in-cantiere. Da A/B testare.

#### R13. Pagina `/statistiche` collegata al funnel [LOW]
Oggi è una pagina-dati neutra. Aggiungere CTA "Vuoi dati ancora più granulari? Premium" + value prop.

---

## 5. Information Architecture — proposta

### 5.1 Sitemap concettuale ottimale

```
italiacantieri.it/
│
├── /  (HOME)
│   └── Funnel hub: SEO + intent split + conversione
│
├── /iscriviti  [NEW] — pagina intent-splitter
│   └── Redirect a italiaprogettisti.com/register?type=X
│
├── /per-studi  [NEW] — landing dedicata
├── /per-imprese  [NEW] — landing dedicata
├── /come-funziona  [NEW opzionale]
│
├── /regioni  ─────────────┐
│   └── /[regione]          │
│       └── /[provincia]    │
│                           │
├── /comune/[slug]  ────────┤ (cluster SEO geografico)
├── /cantiere/[slug]  ──────┘
│
├── /bandi
│   └── /bando/[slug]
│
├── /statistiche
│
├── /chi-siamo
├── /contatti
│
├── /come-trattiamo-i-dati  (GDPR principale)
│
└── /legal/
    ├── /privacy
    ├── /cookie
    └── /termini
```

### 5.2 Navigation header proposto

**Desktop (left → right):**
- Logo "Italia Cantieri"
- Regioni
- Bandi
- Statistiche
- Per Studi *(NEW)*
- Per Imprese *(NEW)*
- *(spostare "Trasparenza dati" solo in footer)*
- **[ Iscriviti gratis ]** *(cambia da "Sblocca Premium")*

**Mobile (top → bottom):**
- **[ Iscriviti gratis ]** *(spostato in testa!)*
- Regioni
- Bandi
- Statistiche
- Per Studi
- Per Imprese
- Trasparenza dati

### 5.3 Footer proposto (modifica minimale)

Mantenere la struttura 4 colonne attuale, aggiungere:
- Colonna "Esplora": aggiungere "Per studi" e "Per imprese" sopra "Chi siamo"
- Aggiungere mini-newsletter signup ("Ricevi i nuovi cantieri della tua zona")

---

## 6. Approvazione struttura esistente

### ✅ Confermati come corretti (NON toccare)
- Header sticky con backdrop blur — buono
- Container `container-zen` con max-width consistente
- Breadcrumb gerarchico su pagine dettaglio
- Componente `RichiediRimozioneCTA` con palette amber separata (corretta semantica)
- Sezione GDPR/fonte trasparenza in scheda cantiere (compliance critica, mantenere)
- Footer 4 colonne con sezione Network
- JSON-LD structured data su scheda cantiere
- ISR `revalidate = 3600` per tutte le pagine dinamiche
- Sezione k-anonymity nella scheda comune (educativa + indirect upsell)
- `generateStaticParams` per top 20 regioni a build time

### ⚠️ Da rivedere
- Header bottone "Sblocca Premium" → "Iscriviti gratis" (R4)
- Posizione "Sblocca Premium" nel mobile menu (R10)
- CTA homepage generico → split impresa/studio (R5)
- CrossLinkCorrelati troppo neutro → potenziare con numeri/visual (R9)

### ➕ Da aggiungere (nuove pagine/componenti)
- `/iscriviti` (R3)
- `/per-studi`, `/per-imprese` (R6)
- `/come-funziona` (R11, opzionale)
- `<UnlockPremiumCTA />` per scheda cantiere (R1)
- `<DatiPremiumLocked />` per scheda cantiere (R2)
- `<TrustStrip />` per homepage (R8)
- `<IntentSplitCards />` per homepage (R7)

---

## 7. Metriche di successo (KPI suggeriti)

Per validare l'impatto delle modifiche, tracciare via GA4 + Plausible:

| KPI | Baseline (stimata) | Target post-implementazione |
|---|---|---|
| **CTR scheda cantiere → CTA Premium/Iscriviti** | 0.5-1% (solo footer link) | 3-5% (above-fold + locked preview) |
| **Conversion rate `/iscriviti` → register HUB** | n/a (pagina non esiste) | 25-35% (intent qualificato) |
| **Bounce rate scheda cantiere** | 65-75% (tipico SEO landing) | <60% (sezioni "simili" aumentano engagement) |
| **Sessioni con `_gl` parameter su italiaprogettisti.com da cantieri.it** | <1% di sessioni HUB | 5-10% in 6 mesi |
| **Tempo medio pagina scheda cantiere** | 45-60s | >90s (con cantieri simili + preview) |
| **Registrazioni HUB attribuite a cantieri.it** | 0 (no tracking) | 10-20% del totale entro Q4 |

---

## 8. Prossimi passi consigliati

### Sprint 1 (1 settimana)
- R4, R10 (header tweaks): 30 min
- R1 (sticky CTA scheda cantiere): 1h
- R5 (CTA homepage split): 30 min
- R9 (potenziamento CrossLink): 1h
- R3 (pagina `/iscriviti` minima): 1h
- Setup UTM tracking outbound link a italiaprogettisti.com: 30 min

**Totale Sprint 1: ~5h** → impatto stimato +50-100% sui CTR

### Sprint 2 (1-2 settimane)
- R2 (Dati Premium Locked): 1-2h
- R6 (pagine `/per-studi` + `/per-imprese`): 3h
- R7 (sezione "Come funziona"): 1.5h
- R8 (Trust strip): 1h

**Totale Sprint 2: ~8h** → impatto stimato +30-50% conversion rate registrazione

### Sprint 3 (backlog)
- R11, R12, R13 (nice-to-have)
- A/B test della sticky CTA vs bottom bar
- Eventuali pagine SEO long-form per cluster geografici

---

## 9. Considerazioni finali

Il lavoro fatto è **molto buono come fondazione tecnica e GDPR**, ma il sito attualmente vive come **archivio open data**, non come **lead magnet del network ItaliaProgettisti**.

Le modifiche proposte non snaturano il prodotto (resta consultabile gratuitamente come è giusto per dati pubblici PA), ma aggiungono **layer di conversione mirati** sfruttando il traffico organico naturale che le pagine cantiere genereranno.

**Punto critico operativo:** una volta implementate R1-R5, il prossimo bottleneck si sposta sul **HUB italiaprogettisti.com**: serve assicurarsi che la landing `/register?utm_source=cantieri&type=X` sia ottimizzata per ricevere traffico cold da questa fonte (UX-first signup, no domande inutili, magic link disponibile).

**Compliance:** tutte le modifiche proposte sono GDPR-compatibili. Lo schema "blurred preview" R2 non espone alcun dato — mostra solo quali campi esisteranno per utenti registrati. Mantenere intatti il `RichiediRimozioneCTA` e la sezione fonte trasparenza.

---

**Documento generato:** 19/05/2026
**Agente:** ArchitectUX
**Status:** AUDIT COMPLETATO — pronto per handoff a sviluppo
**Implementazione raccomandata:** Sprint 1 prima del primo push promozionale del sito
