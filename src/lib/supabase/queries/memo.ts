/**
 * Memo in-process con TTL per le enumerazioni full-dataset (sitemap, aggregati
 * province, chiavi buyer/leaderboard). Il server Next (standalone, processo
 * singolo su Railway) rirenderizza in ISR molte route che condividono la STESSA
 * enumerazione paginata (walk keyset/range da N query da 1000 righe): senza
 * memo ogni route ripaga l'intero walk → decine di migliaia di query al giorno
 * sul DB (audit 10/07/2026: i 3 pattern piu' costosi erano proprio questi walk
 * su bandi_gara_public, 58k+51k+49k chiamate). Con il memo il walk si paga UNA
 * volta per TTL e per processo.
 *
 * Si memoizza la Promise: dedup anche delle chiamate CONCORRENTI (piu' render
 * ISR nello stesso momento). In caso di reject la entry viene rimossa, cosi'
 * gli errori non restano in cache.
 */
const MEMO_TTL_MS = 3_600_000; // 1h, allineato al revalidate ISR delle route

const memoStore = new Map<string, { at: number; p: Promise<any> }>();

export function memoTtl<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = memoStore.get(key);
  if (hit && Date.now() - hit.at < MEMO_TTL_MS) return hit.p as Promise<T>;
  const p = fn().catch((e) => {
    memoStore.delete(key);
    throw e;
  });
  memoStore.set(key, { at: Date.now(), p });
  return p;
}
