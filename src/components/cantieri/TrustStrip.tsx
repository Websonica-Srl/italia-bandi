import { Star, Users, Building2, FileText } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Props {
  totaleCantieri?: number;
  totaleSoggetti?: number;
  totaleFirms?: number;
}

/**
 * R8 (incluso in batch HIGH): trust strip per homepage.
 * Mostra social proof + numeri reali del DB (cantieri, soggetti analizzati, firms nel network).
 *
 * I numeri sono LIVE dal DB tramite getKpiStats() chiamato nelle pagine server component.
 * Fallback conservativi se i prop non sono passati (no query a vuoto sul componente).
 */
export default function TrustStrip({ totaleCantieri, totaleSoggetti, totaleFirms }: Props) {
  const cantieriLabel = totaleCantieri ? `${formatNumber(totaleCantieri)}+` : '6.500+';
  const soggettiLabel = totaleSoggetti ? formatNumber(totaleSoggetti) : '38.000+';
  const firmsLabel = totaleFirms ? `${formatNumber(totaleFirms)}+` : '37.000+';

  return (
    <section
      aria-labelledby="trust-strip-heading"
      className="py-12 md:py-14 border-y border-border bg-secondary/20"
    >
      <div className="container-zen">
        <p
          id="trust-strip-heading"
          className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6 font-semibold"
        >
          Database cantieri italiano in espansione — fonti pubbliche verificate
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Stat
            icon={FileText}
            value={cantieriLabel}
            label="Cantieri tracciati"
          />
          <Stat
            icon={Users}
            value={soggettiLabel}
            label="Soggetti analizzati"
          />
          <Stat
            icon={Building2}
            value={firmsLabel}
            label="Imprese & studi nel network"
          />
          <Stat
            icon={Star}
            value="GDPR"
            label="Compliance & trasparenza"
            highlight
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  highlight = false,
}: {
  icon: typeof Star;
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02]">
      <Icon
        className={`h-5 w-5 mb-2 ${highlight ? 'text-foreground fill-foreground' : 'text-foreground/60'}`}
        strokeWidth={highlight ? 0 : 1.75}
      />
      <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-secondary-text mt-1">{label}</div>
    </div>
  );
}
