/**
 * SectionWrapper - wrapper sezioni con titolo + sottotitolo + content area.
 *
 * Applica vertical rhythm coerente (py-20 md:py-32) e composition pattern
 * con eyebrow opzionale, heading, subtitle e content slot.
 *
 * Pattern skill: stitch-design-taste (layout principles), redesign-existing-projects
 * (spacing/whitespace maximization).
 */
import { cn } from '@/lib/utils';

type Tone = 'default' | 'muted' | 'inverted';

interface SectionWrapperProps {
  /** Etichetta corta sopra il titolo (uppercase tracked) */
  eyebrow?: string;
  /** Titolo principale della sezione (h2) */
  title?: string;
  /** Sottotitolo descrittivo */
  subtitle?: string;
  /** Allineamento header */
  align?: 'left' | 'center';
  /** Sfondo: default bianco, muted secondary/30, inverted scuro */
  tone?: Tone;
  /** Spaziatura verticale: default = py-20 md:py-32, compact = py-14 md:py-20 */
  spacing?: 'default' | 'compact' | 'tight';
  /** Larghezza max header (utile per titoli lunghi) */
  headerMaxW?: 'sm' | 'md' | 'lg' | 'full';
  /** Slot opzionale a destra del titolo (es. link "vedi tutti") */
  action?: React.ReactNode;
  /** Classi extra sull'outer section */
  className?: string;
  /** Id per anchor / aria-labelledby */
  id?: string;
  /** Children = contenuto sotto l'header */
  children: React.ReactNode;
}

const toneClass: Record<Tone, string> = {
  default: 'bg-background',
  muted: 'bg-secondary/30',
  inverted: 'bg-foreground text-background',
};

const spacingClass = {
  default: 'py-20 md:py-32',
  compact: 'py-14 md:py-20',
  tight: 'py-10 md:py-14',
};

const headerMaxWClass = {
  sm: 'max-w-xl',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  full: 'max-w-none',
};

export default function SectionWrapper({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  tone = 'default',
  spacing = 'default',
  headerMaxW = 'md',
  action,
  className,
  id,
  children,
}: SectionWrapperProps) {
  const hasHeader = Boolean(eyebrow || title || subtitle);
  const isCentered = align === 'center';
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={hasHeader && title ? headingId : undefined}
      className={cn(toneClass[tone], spacingClass[spacing], className)}
    >
      <div className="container-zen">
        {hasHeader && (
          <div
            className={cn(
              'mb-12 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
              isCentered && 'md:flex-col md:items-center md:justify-center md:text-center',
            )}
          >
            <div
              className={cn(
                headerMaxWClass[headerMaxW],
                isCentered && 'mx-auto',
              )}
            >
              {eyebrow && (
                <p
                  className={cn(
                    'mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]',
                    tone === 'inverted' ? 'text-background/60' : 'text-muted-foreground',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px w-8',
                      tone === 'inverted' ? 'bg-background/30' : 'bg-foreground/30',
                    )}
                  />
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2
                  id={headingId}
                  className={cn(
                    'heading-section mb-4 text-balance',
                    tone === 'inverted' && 'text-background',
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={cn(
                    'text-base md:text-lg leading-relaxed text-pretty',
                    tone === 'inverted' ? 'text-background/70' : 'text-muted-foreground',
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {action && !isCentered && (
              <div className="flex-shrink-0">{action}</div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
