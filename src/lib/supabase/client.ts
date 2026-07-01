import { createClient } from '@supabase/supabase-js';

// Satellite (vetrina SEO): anon key, sola lettura, NESSUNA auth.
// Fallback a stringhe vuote per non far crashare il build se l'env non è
// presente (in quel caso le query restituiscono errore gestito e dati vuoti).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let cached: ReturnType<typeof createClient> | null = null;

// Fetch con cache Next (revalidate 60s): evita che il data-cache di Next serva
// risultati stantii dopo un aggiornamento del DB (liste vuote in prod dopo un
// re-deploy) e riduce le chiamate ripetute a PostgREST entro la finestra ISR.
const cachedFetch: typeof fetch = (input, init) =>
  fetch(input as any, { ...(init as any), next: { revalidate: 60 } });

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Client "no-op": qualsiasi query fallirà in modo controllato (le query
    // layer loggano l'errore e ritornano dati vuoti). Evita il crash a build
    // time quando le env non sono ancora iniettate.
    return null;
  }
  if (!cached) {
    cached = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { fetch: cachedFetch },
    });
  }
  return cached;
}

const NOOP_RESULT = { data: null, count: 0, error: { message: 'supabase env not configured' } };

/** Proxy che simula la chainable API PostgREST quando il client non è disponibile. */
function noopClient(): any {
  const chain: any = new Proxy(
    {},
    {
      get(_t, prop) {
        if (prop === 'then') return undefined; // non è una promise
        if (prop === 'maybeSingle' || prop === 'single') {
          return () => Promise.resolve(NOOP_RESULT);
        }
        // ogni metodo ritorna il chain; await sul chain risolve NOOP_RESULT
        return () => chainable;
      },
    },
  );
  const chainable: any = Object.assign(
    Promise.resolve(NOOP_RESULT),
    chain,
  );
  // `.rpc(...)` deve comportarsi come `.from(...)`: ritorna il chainable così
  // che un await risolva NOOP_RESULT invece di lanciare TypeError quando le env
  // Supabase mancano (build senza credenziali).
  return { from: () => chainable, rpc: () => chainable };
}

export function createServerClient() {
  return getClient() ?? noopClient();
}

export function createSatelliteClient() {
  return createServerClient();
}
