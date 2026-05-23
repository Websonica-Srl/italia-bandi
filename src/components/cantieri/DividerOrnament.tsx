/**
 * DividerOrnament - decoratore visivo tra sezioni.
 *
 * Variante "line": linea sottile orizzontale con bullet centrale tipografico.
 * Variante "dots": tre dots equispaziati centrati.
 * Variante "label": etichetta uppercase circondata da linee (es. "— PARTE 2 —").
 *
 * Pattern skill: redesign-existing-projects (whitespace + premium typography),
 * stitch-design-taste (visual atmosphere editorial).
 */
import { cn } from '@/lib/utils';

type Variant = 'line' | 'dots' | 'label';

interface DividerOrnamentProps {
  variant?: Variant;
  label?: string;
  /** Spaziatura verticale: default = my-16 md:my-24 */
  spacing?: 'tight' | 'default' | 'loose';
  className?: string;
}

const spacingClass = {
  tight: 'my-10 md:my-14',
  default: 'my-16 md:my-24',
  loose: 'my-24 md:my-32',
};

export default function DividerOrnament({
  variant = 'line',
  label,
  spacing = 'default',
  className,
}: DividerOrnamentProps) {
  return (
    <div
      role="separator"
      aria-hidden={!label}
      aria-label={label}
      className={cn(
        'mx-auto flex items-center justify-center',
        spacingClass[spacing],
        className,
      )}
    >
      {variant === 'line' && (
        <div className="flex w-full max-w-md items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-border" />
          <span
            className="block h-1.5 w-1.5 rounded-full bg-foreground/40"
            aria-hidden="true"
          />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-border" />
        </div>
      )}
      {variant === 'dots' && (
        <div className="flex items-center gap-2">
          <span className="block h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden="true" />
          <span className="block h-1.5 w-1.5 rounded-full bg-foreground/50" aria-hidden="true" />
          <span className="block h-1.5 w-1.5 rounded-full bg-foreground/30" aria-hidden="true" />
        </div>
      )}
      {variant === 'label' && label && (
        <div className="flex w-full max-w-lg items-center gap-4">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {label}
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>
      )}
    </div>
  );
}
