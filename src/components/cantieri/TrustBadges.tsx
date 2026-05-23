/**
 * Trust badges riusabili per dare credibilita' alle pagine pubbliche.
 *
 * Uso:
 * <TrustBadges variant="row" />          // versione orizzontale compatta
 * <TrustBadges variant="grid" />         // versione griglia con icone grandi
 */
import { ShieldCheck, Database, RefreshCw, Lock } from 'lucide-react';

interface Props {
  variant?: 'row' | 'grid';
  className?: string;
}

const badges = [
  {
    icon: Database,
    title: 'Fonti pubbliche verificate',
    desc: 'Solo open data PA e albi pretori dei Comuni italiani.',
  },
  {
    icon: RefreshCw,
    title: 'Aggiornato quotidianamente',
    desc: 'Nuovi cantieri importati ogni giorno dai portali ufficiali.',
  },
  {
    icon: ShieldCheck,
    title: 'GDPR-compliant',
    desc: 'k-anonymity 5 sui cantieri privati. Opt-out attivo.',
  },
  {
    icon: Lock,
    title: 'Trasparenza totale',
    desc: 'Ogni scheda dichiara fonte, data e base legale.',
  },
];

export default function TrustBadges({ variant = 'row', className = '' }: Props) {
  if (variant === 'row') {
    return (
      <div
        className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground ${className}`}
      >
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.title} className="inline-flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              <span className="font-medium">{b.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.title}
            className="card-zen p-5 text-center md:text-left"
          >
            <Icon className="h-5 w-5 text-foreground mx-auto md:mx-0 mb-3" strokeWidth={1.5} />
            <div className="font-semibold text-sm mb-1">{b.title}</div>
            <div className="text-xs text-secondary-text leading-relaxed">{b.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
