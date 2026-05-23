import { Clock, CalendarCheck, CalendarX } from 'lucide-react';
import { giorniAllaScadenza, formatDateShort } from '@/lib/utils';

interface Props {
  scadenza: string | null | undefined;
  /** size compatta per le card. */
  compact?: boolean;
}

/**
 * Badge stato scadenza di un bando.
 * Tutti i bandi del dataset sono "aperto": l'informazione utile è la distanza
 * dalla scadenza offerte. Tre stati visivi: in scadenza (<=7gg), aperto, scaduto.
 */
export default function BandoScadenzaBadge({ scadenza, compact = false }: Props) {
  const giorni = giorniAllaScadenza(scadenza);

  if (giorni === null) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
        <Clock className="h-3 w-3" strokeWidth={2} /> Scadenza non indicata
      </span>
    );
  }

  if (giorni < 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground border border-border">
        <CalendarX className="h-3 w-3" strokeWidth={2} /> Termine scaduto
      </span>
    );
  }

  const inScadenza = giorni <= 7;
  const cls = inScadenza
    ? 'bg-construction/15 text-foreground border-construction/40'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${cls}`}
    >
      {inScadenza ? <Clock className="h-3 w-3" strokeWidth={2.25} /> : <CalendarCheck className="h-3 w-3" strokeWidth={2} />}
      {giorni === 0
        ? 'Scade oggi'
        : giorni === 1
          ? 'Scade domani'
          : `Scade tra ${giorni} giorni`}
      {!compact && scadenza ? ` · ${formatDateShort(scadenza)}` : ''}
    </span>
  );
}
