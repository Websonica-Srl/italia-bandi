/**
 * BadgeKpi - tessera KPI con icon + numero + label.
 *
 * Variante compact rispetto a StatsBox: pensata per row laterali, sidebar,
 * o griglie miste (bento). Hover sottile con tinted shadow.
 *
 * Pattern skill: stitch-design-taste (component stylings - cards usate solo
 * quando l'elevazione comunica gerarchia).
 */
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import NumberBig from './NumberBig';

type Tone = 'default' | 'muted' | 'inverted';

interface BadgeKpiProps {
  icon?: LucideIcon;
  /** Valore numerico (count-up animato) */
  value?: number;
  /** Override per stringhe non numeriche ("8.000+", "4.8/5") */
  valueOverride?: string;
  format?: 'number' | 'euro' | 'plain';
  label: string;
  /** Helper text sotto la label */
  helper?: string;
  tone?: Tone;
  /** Layout: row (icon a sinistra, dati a destra) o stack (verticale) */
  layout?: 'row' | 'stack';
  className?: string;
}

const toneClass: Record<Tone, string> = {
  default: 'bg-white border-border',
  muted: 'bg-secondary/40 border-border',
  inverted: 'bg-foreground text-background border-foreground',
};

export default function BadgeKpi({
  icon: Icon,
  value,
  valueOverride,
  format = 'number',
  label,
  helper,
  tone = 'default',
  layout = 'stack',
  className,
}: BadgeKpiProps) {
  return (
    <div
      className={cn(
        'group relative rounded-3xl border p-6 md:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(17,17,17,0.12)]',
        toneClass[tone],
        layout === 'row' && 'flex items-center gap-5',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            'inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl transition-colors',
            layout === 'stack' && 'mb-4',
            tone === 'inverted'
              ? 'bg-background/10 text-background group-hover:bg-background/20'
              : 'bg-secondary text-foreground group-hover:bg-foreground group-hover:text-background',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
      )}
      <div className={cn(layout === 'row' && 'flex-1 min-w-0')}>
        <NumberBig
          value={value ?? 0}
          valueOverride={valueOverride}
          format={format}
          size="md"
          className={cn(tone === 'inverted' && 'text-background')}
        />
        <div
          className={cn(
            'mt-1.5 text-sm font-medium',
            tone === 'inverted' ? 'text-background/80' : 'text-secondary-text',
          )}
        >
          {label}
        </div>
        {helper && (
          <div
            className={cn(
              'mt-1 text-xs',
              tone === 'inverted' ? 'text-background/55' : 'text-muted-foreground',
            )}
          >
            {helper}
          </div>
        )}
      </div>
    </div>
  );
}
