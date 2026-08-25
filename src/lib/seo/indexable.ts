/**
 * SINGLE SOURCE OF TRUTH per l'indicizzazione selettiva dei bandi.
 *
 * Usato da:
 *   - /bandi/[slug]                        → robots meta (index vs noindex,follow)
 *   - /bandi, /categoria/[slug], /scadenze,
 *     /ente/[slug]                         → robots meta di lista (via isListaIndexable)
 *   - link interni / cross-link             → per non spingere equity su pagine thin
 *
 * NON duplicare questa logica altrove.
 *
 * --- Decisione 2026-08-26 (ondata 0) ---
 * bandigaredappalto.it: ~150 impression e 0 click in Search Console negli
 * ultimi 90 giorni, a fronte di 46k schede bando pubblicate ("scaled content"
 * senza ritorno). Schede singole, liste (/bandi, /categoria/[slug],
 * /scadenze) e pagine ente (/ente/[slug]) escono dall'indice con
 * `noindex, follow`: restano navigabili e crawlabili (mantengono il silo
 * interno), ma non competono più per l'indicizzazione. La sitemap dei bandi
 * NON esiste più (rimossa in un task separato della stessa ondata, che pulisce
 * anche il chunk categorie/enti). Restano indicizzabili home, /regioni,
 * /[regione], /[regione]/[provincia], /classifiche, /classifiche/[segmento],
 * /glossario, /chi-siamo, /contatti, /iscriviti, /api-pubbliche,
 * /come-trattiamo-i-dati, legal.
 * Spec: docs/superpowers/specs/2026-08-26-cantieri-bandi-fuori-indice-contenuti-verticali.md
 * (repo italia-progettisti).
 *
 * `SCHEDE_PUBBLICHE_INDICIZZABILI = false` è l'interruttore: quando torna
 * `true`, `isBandoIndexable()` ripristina la logica di calibrazione qui sotto
 * (mai cancellata) e `isListaIndexable()` ripristina l'indicizzazione delle liste.
 *
 * --- Calibrazione storica sui dati reali (2026-05-24, view bandi_gara_public, 50.882 bandi) ---
 *  Fasce misurate:
 *    - aperto (scadenza futura):                         261
 *    - storico_ricco (oggetto>=40 + importo>0 + ente):   46.428
 *    - thin (oggetto<40 OR nessun importo):               4.193
 *  NB: nella view `aggiudicatario_ragione_sociale_raw` e `importo_aggiudicazione`
 *  sono SEMPRE vuoti a livello di bando (l'aggiudicatario vive in
 *  `bando_aggiudicatari_public`, GDPR-safe). Le clausole "aggiudicato ricco" qui
 *  sotto restano per robustezza futura (se la view un giorno esponesse il campo),
 *  ma sui dati attuali la regola che decide era "aperto OR storico ricco".
 *  → Indicizzabili stimati (quando l'interruttore è ON): ~46.689 / 50.882.
 */
import type { Bando } from '@/lib/supabase/queries/bandi';

/** Lunghezza minima dell'oggetto per considerarlo autosufficiente (vedi calibrazione). */
export const OGGETTO_MIN_LEN = 40;

/**
 * Interruttore globale: quando `false`, nessuna scheda bando e nessuna lista
 * bandi/categoria/scadenze/ente è indicizzabile (noindex,follow ovunque),
 * indipendentemente dalla calibrazione sotto. Vedi decisione 2026-08-26 sopra.
 */
export const SCHEDE_PUBBLICHE_INDICIZZABILI = false;

/** Le liste (/bandi, /categoria/[slug], /scadenze) e le pagine ente (/ente/[slug]) sono indicizzabili solo se l'interruttore è ON. */
export function isListaIndexable(): boolean {
  return SCHEDE_PUBBLICHE_INDICIZZABILI;
}

export function isBandoIndexable(b: Bando): boolean {
  if (!SCHEDE_PUBBLICHE_INDICIZZABILI) return false;

  const aperto =
    !!b.scadenza_offerte && new Date(b.scadenza_offerte) >= new Date();

  // 1) APERTO → sempre indicizzabile (max valore: si può ancora partecipare).
  if (aperto) return true;

  // 2) AGGIUDICATO RICCO → indicizzabile (chi ha vinto + quanto).
  //    Sui dati attuali non scatta (campo vuoto in view); resta per robustezza.
  const haAggiudicatario = !!(
    b.aggiudicatario_ragione_sociale_raw &&
    b.aggiudicatario_ragione_sociale_raw.trim().length > 2
  );
  const haImporto =
    (b.importo_aggiudicazione != null && b.importo_aggiudicazione > 0) ||
    (b.importo_base != null && b.importo_base > 0);
  if (haAggiudicatario && haImporto) return true;

  // 3) STORICO RICCO: oggetto descrittivo + importo + ente → indicizzabile.
  //    È la fascia che porta la massa (46.428 bandi) e cattura anche gli
  //    aggiudicati con oggetto sostanziale.
  const haOggettoRicco = !!(
    b.oggetto && b.oggetto.trim().length >= OGGETTO_MIN_LEN
  );
  const haEnte = !!(
    b.stazione_appaltante && b.stazione_appaltante.trim().length > 3
  );
  if (haOggettoRicco && haImporto && haEnte) return true;

  // 4) tutto il resto (oggetto thin, nessun importo) → NOINDEX,FOLLOW:
  //    resta crawlabile, partecipa al silo, ma fuori dall'indice.
  return false;
}
