import Link from 'next/link';
import { MapPin, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Cantiere } from '@/lib/supabase/queries/cantieri';
import { formatDateShort, formatEuro, truncate } from '@/lib/utils';

interface Props {
  cantiere: Cantiere;
  compact?: boolean;
}

export default function CantiereCard({ cantiere, compact = false }: Props) {
  const titolo = cantiere.tipo_titolo || 'Cantiere';
  const data = cantiere.data_rilascio || cantiere.data_pubblicazione;
  const indirizzoBreve = [cantiere.indirizzo, cantiere.civico].filter(Boolean).join(' ');

  return (
    <Link
      href={`/cantiere/${cantiere.slug}`}
      className="group block card-zen card-hover p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground border border-border">
          <FileText className="h-3 w-3" />
          {titolo}
        </span>
        {data && (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateShort(data)}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-foreground leading-snug mb-2 line-clamp-2">
        {truncate(cantiere.descrizione || cantiere.protocollo || 'Cantiere edilizio', compact ? 80 : 140)}
      </h3>

      <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-3">
        <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-1">
          {indirizzoBreve ? `${indirizzoBreve}, ` : ''}
          <span className="font-medium text-foreground">{cantiere.comune}</span>{' '}
          ({cantiere.provincia})
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {cantiere.importo_lavori && (
            <span className="font-semibold text-foreground">{formatEuro(cantiere.importo_lavori, { compact: true })}</span>
          )}
          {cantiere.superficie_mq && <span>{Math.round(Number(cantiere.superficie_mq))} m²</span>}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          Dettagli <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
