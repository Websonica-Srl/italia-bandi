import { Users2, TrendingDown, Gauge } from 'lucide-react';
import { formatNumber, formatPct } from '@/lib/utils';

interface Props {
  /** Numero offerte ricevute in gara (campo da fonte pubblica). */
  numeroOfferte: number | null;
  /** Ribasso % dell'aggiudicatario (campo da fonte pubblica). */
  ribasso: number | null;
}

/**
 * Box competitivita' della SINGOLA gara (M2) — dati da fonte pubblica ora in view:
 * numero di offerte ricevute e ribasso di aggiudicazione. Statistica
 * DESCRITTIVA del bando, non un consiglio ("dove c'e' ressa, il tuo tempo vale
 * di piu' altrove"). Renderizza solo se almeno un campo e' valorizzato.
 */
export default function CompetitivitaBox({ numeroOfferte, ribasso }: Props) {
  const hasOfferte = numeroOfferte != null && numeroOfferte > 0;
  // ribasso 0 = dato non affidabile/mancante (non un vero 0%) → trattato come n.d.
  const hasRibasso = ribasso != null && ribasso > 0;
  if (!hasOfferte && !hasRibasso) return null;

  return (
    <section
      aria-labelledby="competitivita-heading"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
          <Gauge className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
            Quanto era affollata
          </p>
          <h2 id="competitivita-heading" className="text-base md:text-lg font-bold leading-tight">
            Competitivita&apos; di questa gara
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {hasOfferte && (
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground mb-2.5 border border-border">
              <Users2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="text-2xl font-black tabular-nums tracking-tight text-foreground">
              {formatNumber(numeroOfferte)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Offerte ricevute
            </p>
          </div>
        )}
        {hasRibasso && (
          <div className="rounded-2xl border border-border bg-secondary/30 p-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground mb-2.5 border border-border">
              <TrendingDown className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <p className="text-2xl font-black tabular-nums tracking-tight text-foreground">
              {formatPct(ribasso, { fraction: false })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
              Ribasso di aggiudicazione
            </p>
          </div>
        )}
      </div>

      <p className="mt-5 text-sm text-secondary-text leading-relaxed">
        {hasOfferte
          ? 'Il numero di offerte ricevute misura quanto era contesa la gara: dove c\'e\' ressa, il tuo tempo vale di piu\' altrove. '
          : ''}
        {hasRibasso
          ? 'Il ribasso di aggiudicazione e\' lo sconto offerto dal vincitore sull\'importo a base di gara. '
          : ''}
        Sono dati storici di questa procedura, non una previsione.
      </p>
    </section>
  );
}
