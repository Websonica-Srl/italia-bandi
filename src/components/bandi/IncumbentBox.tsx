import Link from 'next/link';
import { ShieldAlert, Building2, ArrowRight } from 'lucide-react';
import type { BuyerVincitore } from '@/lib/supabase/queries/intelligence';
import { cleanRagioneSociale, buyerSlug } from '@/lib/buyer';
import { formatNumber, decodeEntities } from '@/lib/utils';

interface Props {
  ente: string;
  topVincitori: BuyerVincitore[];
  /** Quante volte ha pubblicato gare questo ente (per contesto). */
  nBandi: number;
}

/**
 * Blocco "incumbent" della scheda bando (M2): chi vince spesso da QUESTA
 * stazione appaltante, da `buyer_public.top_vincitori`. Segnala se la gara e'
 * presidiata da un operatore radicato. DATI descrittivi pubblici (ragioni
 * sociali PG); rimanda alla pagina ente per l'analisi completa e all'HUB per il
 * monitoraggio. NON da' consigli sulla singola partecipazione.
 */
export default function IncumbentBox({ ente, topVincitori, nBandi }: Props) {
  if (!topVincitori || topVincitori.length === 0) return null;
  const top = topVincitori.slice(0, 3);
  const slug = buyerSlug(ente);

  return (
    <section
      aria-labelledby="incumbent-heading"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
          <ShieldAlert className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
            Chi domina questo ente
          </p>
          <h2 id="incumbent-heading" className="text-base md:text-lg font-bold leading-tight">
            Prima di decidere se partecipare
          </h2>
        </div>
      </div>
      <p className="text-sm text-secondary-text mb-5 leading-relaxed">
        Da <strong className="text-foreground">{decodeEntities(ente)}</strong> hanno già vinto
        delle imprese, alcune più volte. Vedere chi domina questo ente ti dice se
        la gara è alla tua portata o se c&apos;è un operatore già radicato da battere.
      </p>

      <ul className="space-y-2.5">
        {top.map((v, i) => (
          <li
            key={`${v.nome}-${i}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3"
          >
            <span className="inline-flex items-start gap-2 font-semibold text-foreground min-w-0">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="leading-snug">{cleanRagioneSociale(v.nome)}</span>
            </span>
            <span className="text-sm font-bold tabular-nums text-foreground flex-shrink-0 whitespace-nowrap">
              {formatNumber(v.gare)} {v.gare === 1 ? 'gara' : 'gare'}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/ente/${slug}`}
        className="group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground rounded-full border border-border bg-white px-5 py-2.5 transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Vedi tutto lo storico di {formatNumber(nBandi)} bandi di questo ente
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </Link>
    </section>
  );
}
