import { Users, TrendingDown, Layers, Link2, Gauge } from 'lucide-react';
import type { LandscapeSummary } from '@/lib/supabase/queries/intelligence';
import { contendibilita } from '@/lib/buyer';
import { formatNumber, formatPct } from '@/lib/utils';

interface Props {
  summary: LandscapeSummary;
  /** Etichetta del segmento, es. "Lavori di costruzione" o "Lombardia". */
  segmentoLabel: string;
}

const LIVELLO_STYLE: Record<string, string> = {
  aperto: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  contendibile: 'bg-amber-50 text-amber-700 border-amber-200',
  presidiato: 'bg-rose-50 text-rose-700 border-rose-200',
};

/**
 * Blocco "Quanto e' contendibile questo segmento" (M7).
 * Statistica DESCRITTIVA da `landscape_public` (via getLandscapeSummary):
 * concentrazione (quota_top3 come metrica leggibile, HHI come dato secondario in
 * tooltip), affollamento, ribasso mediano storico, %RTI. MAI un consiglio sulla
 * singola gara ("tu offri Y%"): solo fotografia del mercato.
 */
export default function LandscapeBlock({ summary, segmentoLabel }: Props) {
  const cont = contendibilita(summary.quota_top3);
  const livelloStyle = LIVELLO_STYLE[cont.livello] || LIVELLO_STYLE.contendibile;

  return (
    <section
      aria-labelledby="landscape-heading"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
            <Gauge className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
              Panorama competitivo
            </p>
            <h2 id="landscape-heading" className="text-base md:text-lg font-bold leading-tight">
              Quanto e&apos; contendibile {segmentoLabel}
            </h2>
          </div>
        </div>
        {summary.quota_top3 != null && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${livelloStyle}`}
            title={
              summary.hhi != null
                ? `Indice di concentrazione HHI: ${summary.hhi.toFixed(3)} (0 = mercato frammentato, 1 = monopolio)`
                : undefined
            }
          >
            {cont.label}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          icon={<Users className="h-4 w-4" strokeWidth={2} />}
          value={formatNumber(summary.vincitori_distinti_tot)}
          label="Imprese che vincono"
        />
        <Metric
          icon={<Layers className="h-4 w-4" strokeWidth={2} />}
          value={
            summary.quota_top3 != null ? formatPct(summary.quota_top3) : '—'
          }
          label="Quota dei 3 maggiori"
        />
        <Metric
          icon={<TrendingDown className="h-4 w-4" strokeWidth={2} />}
          value={
            summary.ribasso_mediano != null && summary.ribasso_mediano > 0
              ? formatPct(summary.ribasso_mediano, { fraction: false })
              : '—'
          }
          label="Ribasso mediano storico"
        />
        <Metric
          icon={<Link2 className="h-4 w-4" strokeWidth={2} />}
          value={summary.pct_rti != null ? formatPct(summary.pct_rti) : '—'}
          label="Gare in raggruppamento"
        />
      </div>

      <p className="mt-5 text-sm text-secondary-text leading-relaxed">
        {summary.quota_top3 != null ? (
          <>
            Nel segmento <strong className="text-foreground">{segmentoLabel}</strong>{' '}
            i tre operatori piu&apos; attivi si aggiudicano{' '}
            <strong className="text-foreground">{formatPct(summary.quota_top3)}</strong>{' '}
            delle gare.{' '}
          </>
        ) : null}
        {summary.ribasso_mediano != null && summary.ribasso_mediano > 0 ? (
          <>
            Il ribasso mediano storico in questo segmento e&apos;{' '}
            <strong className="text-foreground">
              {formatPct(summary.ribasso_mediano, { fraction: false })}
            </strong>
            .{' '}
          </>
        ) : null}
        Sono medie storiche descrittive, non una previsione sulla singola gara.
      </p>
    </section>
  );
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/30 p-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-foreground mb-2.5 border border-border">
        {icon}
      </span>
      <p className="text-xl md:text-2xl font-black tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{label}</p>
    </div>
  );
}
