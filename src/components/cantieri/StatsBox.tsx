import { formatNumber, formatEuro } from '@/lib/utils';

interface StatItem {
  label: string;
  value: number | string;
  format?: 'number' | 'euro' | 'plain';
  helper?: string;
}

export default function StatsBox({ items, columns = 4 }: { items: StatItem[]; columns?: 2 | 3 | 4 }) {
  const cols = columns === 2 ? 'sm:grid-cols-2' : columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid grid-cols-1 ${cols} gap-4`}>
      {items.map((s, i) => {
        const v =
          s.format === 'euro' && typeof s.value === 'number'
            ? formatEuro(s.value, { compact: true })
            : s.format === 'number' && typeof s.value === 'number'
              ? formatNumber(s.value)
              : s.value;
        return (
          <div
            key={i}
            className="group relative bg-card border border-border rounded-3xl p-6 md:p-7 shadow-diffusion transition-all duration-500 ease-out hover:-translate-y-1 hover:border-foreground/25"
          >
            <div className="stat-display text-4xl md:text-5xl text-foreground">{v}</div>
            <div className="mt-3 text-sm font-medium text-secondary-text">{s.label}</div>
            {s.helper && <div className="mt-1 text-xs text-muted-foreground">{s.helper}</div>}
            <div
              aria-hidden="true"
              className="absolute right-5 top-5 h-1.5 w-1.5 rounded-full bg-construction opacity-70"
            />
          </div>
        );
      })}
    </div>
  );
}
