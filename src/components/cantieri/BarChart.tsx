/**
 * Bar chart leggerissimo (no Recharts) per evitare bundle pesante.
 * Mostra barre orizzontali con value + count.
 */
import { formatNumber } from '@/lib/utils';

interface Props {
  data: { label: string; value: number; href?: string }[];
  max?: number;
  showValue?: boolean;
  colorClass?: string;
}

export default function BarChart({ data, max, showValue = true, colorClass = 'bg-primary' }: Props) {
  if (!data.length) return <div className="text-sm text-muted-foreground">Nessun dato disponibile.</div>;
  const m = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => {
        const pct = m > 0 ? (d.value / m) * 100 : 0;
        const content = (
          <>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="font-medium truncate pr-2">{d.label}</span>
              {showValue && <span className="text-muted-foreground tabular-nums">{formatNumber(d.value)}</span>}
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        );
        if (d.href) {
          return (
            <a key={i} href={d.href} className="block hover:opacity-80 transition-opacity">
              {content}
            </a>
          );
        }
        return <div key={i}>{content}</div>;
      })}
    </div>
  );
}
