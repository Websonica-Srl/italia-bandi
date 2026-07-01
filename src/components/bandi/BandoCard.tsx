import Link from 'next/link';
import { Building2, ArrowRight, Tag, Hash } from 'lucide-react';
import { Bando } from '@/lib/supabase/queries/bandi';
import { formatEuro, truncate, bandoTitolo, decodeEntities } from '@/lib/utils';
import { proceduraLabel } from '@websonica/cantieri-core';
import { cpvGroupLabel } from '@websonica/cantieri-core';
import BandoScadenzaBadge from './BandoScadenzaBadge';

interface Props {
  bando: Bando;
  /** Se valorizzato, il link punta a un dominio esterno (cross-link da satelliti). */
  externalBase?: string;
}

/**
 * Card bando — usata in home, /bandi, /categoria/[slug], /scadenze.
 * Gestisce l'oggetto degradato dei dati grezzi con fallback editoriale.
 */
export default function BandoCard({ bando, externalBase }: Props) {
  const cpvLabel = cpvGroupLabel(bando.cpv_principale);
  const titolo = bandoTitolo(bando, cpvLabel);
  const href = externalBase
    ? `${externalBase}/bandi/${bando.slug}`
    : `/bandi/${bando.slug}`;
  const isExternal = !!externalBase;

  const inner = (
    <>
      {/* Struttura fissa non-wrap: CPV tag a sinistra (troncato), badge scadenza
          sempre in alto a destra → posizione coerente tra card con tag di
          lunghezze diverse. */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground border border-border min-w-0">
          <Tag className="h-3 w-3 flex-shrink-0" strokeWidth={2} /> <span className="truncate">{cpvLabel}</span>
        </span>
        <span className="flex-shrink-0">
          <BandoScadenzaBadge scadenza={bando.scadenza_offerte} compact />
        </span>
      </div>

      <h3 className="font-semibold text-foreground leading-snug mb-3 line-clamp-2">
        {truncate(titolo, 140)}
      </h3>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-4">
        {bando.stazione_appaltante && (
          <span className="inline-flex items-start gap-1.5">
            <Building2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
            <span className="line-clamp-1">{truncate(decodeEntities(bando.stazione_appaltante), 70)}</span>
          </span>
        )}
        <span className="inline-flex items-center gap-4 flex-wrap">
          {bando.tipo_procedura && (
            <span className="text-xs">{proceduraLabel(bando.tipo_procedura)}</span>
          )}
          {bando.cig && (
            <span className="inline-flex items-center gap-1 text-xs tabular-nums">
              <Hash className="h-3 w-3" strokeWidth={2} /> CIG {bando.cig}
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        {bando.importo_base != null ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
            {formatEuro(bando.importo_base, { compact: true })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Importo non indicato</span>
        )}
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
        >
          Dettagli <ArrowRight className="h-3 w-3" strokeWidth={2} />
        </span>
      </div>
    </>
  );

  const ariaLabel = `Bando: ${truncate(titolo, 80)}`;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="group block card-zen card-hover p-5"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className="group block card-zen card-hover p-5">
      {inner}
    </Link>
  );
}
