import { Building2, Trophy } from 'lucide-react';
import type { BuyerVincitore } from '@/lib/supabase/queries/intelligence';
import { cleanRagioneSociale } from '@/lib/buyer';
import { formatNumber } from '@/lib/utils';
import { hubUrl } from '@/lib/site-config';

interface Props {
  vincitori: BuyerVincitore[];
  ente: string;
}

/**
 * Lista "A chi aggiudica questo ente" (M6) — i vincitori ricorrenti di una
 * stazione appaltante, da `buyer_public.top_vincitori` (jsonb nome+gare).
 * Solo ragioni sociali di persone giuridiche; il testo grezzo viene ripulito e
 * accorciato (alcuni record contengono descrizioni RTI lunghe).
 */
export default function BuyerTopVincitori({ vincitori, ente }: Props) {
  if (!vincitori || vincitori.length === 0) return null;

  const maxGare = Math.max(...vincitori.map((v) => v.gare || 0), 1);

  return (
    <section
      aria-labelledby="buyer-vincitori-heading"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
          <Trophy className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
            Track record dell&apos;ente
          </p>
          <h2 id="buyer-vincitori-heading" className="text-base md:text-lg font-bold leading-tight">
            A chi aggiudica le gare
          </h2>
        </div>
      </div>
      <p className="text-sm text-secondary-text mb-5 leading-relaxed">
        Le imprese che si sono aggiudicate piu&apos; gare bandite da{' '}
        <strong className="text-foreground">{ente}</strong>. Un operatore che
        ricorre spesso e&apos; gia&apos; radicato: da considerare prima di partecipare.
      </p>

      <ul className="space-y-2.5">
        {vincitori.map((v, i) => {
          const pct = Math.round(((v.gare || 0) / maxGare) * 100);
          return (
            <li
              key={`${v.nome}-${i}`}
              className="rounded-2xl border border-border bg-secondary/30 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="inline-flex items-start gap-2 font-semibold text-foreground min-w-0">
                  <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
                  <span className="leading-snug">{cleanRagioneSociale(v.nome)}</span>
                </span>
                <span className="text-sm font-bold tabular-nums text-foreground flex-shrink-0 whitespace-nowrap">
                  {formatNumber(v.gare)} {v.gare === 1 ? 'gara' : 'gare'}
                </span>
              </div>
              <div
                className="h-1.5 w-full rounded-full bg-border overflow-hidden"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-construction"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-sm text-secondary-text leading-relaxed">
        Vuoi il track record completo di queste imprese e gli alert sulle prossime
        gare di questo ente?{' '}
        <a
          href={hubUrl('/register', 'buyer_vincitori', { intent: 'bidder-buyer' })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors"
        >
          Attivali sul network ItaliaProgettisti →
        </a>
      </p>
    </section>
  );
}
