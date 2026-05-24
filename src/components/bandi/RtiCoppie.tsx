import { Link2, Building2 } from 'lucide-react';
import type { RtiPartnerRow } from '@/lib/supabase/queries/intelligence';
import { formatNumber } from '@/lib/utils';
import { hubUrl } from '@/lib/site-config';

interface Props {
  coppie: RtiPartnerRow[];
  /** Titolo del blocco; default generico. */
  title?: string;
  /** Riga di contesto sotto il titolo. */
  subtitle?: string;
  ctaCampaign?: string;
  ctaIntent?: string;
}

/**
 * Blocco "Chi si allea con chi" (M5) — coppie di imprese che si aggiudicano
 * insieme, dalla view aggregata `rti_public`. Dato pubblico (ragioni sociali PG,
 * frequenza di co-aggiudicazione). NESSUN dato sensibile. Il "con chi conviene a
 * TE" personalizzato vive sull'HUB.
 */
export default function RtiCoppie({
  coppie,
  title = 'Chi si allea con chi',
  subtitle,
  ctaCampaign = 'rti_pubblico',
  ctaIntent = 'bidder-rti',
}: Props) {
  if (coppie.length === 0) return null;

  return (
    <section
      aria-labelledby="rti-heading"
      className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
          <Link2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
            Raggruppamenti ricorrenti
          </p>
          <h2 id="rti-heading" className="text-base md:text-lg font-bold leading-tight">
            {title}
          </h2>
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-secondary-text mb-5 leading-relaxed">{subtitle}</p>
      )}

      <ul className="space-y-3 mt-4">
        {coppie.map((c, i) => (
          <li
            key={`${c.firm_a_slug}-${c.firm_b_slug}-${i}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground min-w-0">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="truncate">{c.firm_a_name}</span>
              </span>
              <Link2 className="h-3.5 w-3.5 flex-shrink-0 text-construction" strokeWidth={2} aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 font-semibold text-foreground min-w-0">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <span className="truncate">{c.firm_b_name}</span>
              </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums flex-shrink-0 whitespace-nowrap">
              {formatNumber(c.gare_condivise)} gare insieme
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-secondary-text leading-relaxed">
        Meta&apos; delle gare si vince in raggruppamento. Vuoi sapere con chi
        conviene allearti per la tua categoria e zona?{' '}
        <a
          href={hubUrl('/register', ctaCampaign, { intent: ctaIntent })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors"
        >
          Scoprilo sul network ItaliaProgettisti →
        </a>
      </p>
    </section>
  );
}
