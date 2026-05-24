/**
 * SINGLE SOURCE OF TRUTH per l'indicizzazione selettiva dei bandi.
 *
 * Usato da:
 *   - /bandi/[slug]            → robots meta (index vs noindex,follow)
 *   - app/sitemap.ts           → quali URL bando includere (via getIndexableBandiSlugs)
 *   - link interni / cross-link → per non spingere equity su pagine thin
 *
 * NON duplicare questa logica altrove. La versione SQL (filtro a livello DB)
 * vive in `getIndexableBandiSlugs()` in queries/bandi.ts e DEVE restare allineata
 * a questa funzione: qualunque cambio di soglia va replicato in entrambe.
 *
 * --- Calibrazione sui dati reali (2026-05-24, view bandi_gara_public, 50.882 bandi) ---
 *  Fasce misurate:
 *    - aperto (scadenza futura):                         261
 *    - storico_ricco (oggetto>=40 + importo>0 + ente):   46.428
 *    - thin (oggetto<40 OR nessun importo):               4.193
 *  NB: nella view `aggiudicatario_ragione_sociale_raw` e `importo_aggiudicazione`
 *  sono SEMPRE vuoti a livello di bando (l'aggiudicatario vive in
 *  `bando_aggiudicatari_public`, GDPR-safe). Le clausole "aggiudicato ricco" qui
 *  sotto restano per robustezza futura (se la view un giorno esponesse il campo),
 *  ma sui dati attuali la regola che decide è "aperto OR storico ricco".
 *  → Indicizzabili stimati: ~46.689 / 50.882 (resto noindex,follow).
 */
import type { Bando } from '@/lib/supabase/queries/bandi';

/** Lunghezza minima dell'oggetto per considerarlo autosufficiente (vedi calibrazione). */
export const OGGETTO_MIN_LEN = 40;

export function isBandoIndexable(b: Bando): boolean {
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
