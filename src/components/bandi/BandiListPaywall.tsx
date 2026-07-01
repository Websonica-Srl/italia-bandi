'use client';

import { Lock, ArrowRight } from 'lucide-react';
import type { Bando } from '@/lib/supabase/queries/bandi';
import { formatNumber } from '@/lib/utils';
import BandoCard from './BandoCard';

interface Props {
  /** Lista di bandi della pagina/sezione corrente (gia' impaginata a monte). */
  bandi: Bando[];
  /**
   * Numero TOTALE di bandi disponibili per il contesto (per la copy della CTA
   * "vedi tutti i {N} bandi"). Se omesso usa la lunghezza della lista.
   */
  total?: number;
  /** Card nitide leggibili in testa (default 6). */
  previewCount?: number;
  /** Cap massimo di card sfocate mostrate sotto la preview (default 6). */
  blurCount?: number;
  /** Classi della griglia che avvolge le card (deve combaciare col layout host). */
  gridClassName?: string;
}

/**
 * URL di registrazione HUB per lo sblocco delle liste di bandi.
 * Coerente con la convenzione UTM del network (vedi hubUrl in site-config).
 */
const UNLOCK_HREF =
  'https://www.italiaprogettisti.com/register?utm_source=bandigaredappalto&utm_medium=referral&utm_campaign=unlock_lista&intent=bandi';

/**
 * Soft-paywall per le LISTE di bandi (griglie di BandoCard, non tabelle).
 *
 * Replica il pattern di LeaderboardTable: le prime `previewCount` card sono
 * nitide e navigabili; le successive (fino a `blurCount`) restano nell'HTML per
 * l'indicizzazione SEO ma sono sfocate (blur + select-none + pointer-events-none
 * + aria-hidden) con un overlay CTA che porta alla registrazione gratuita
 * sull'HUB. Se i bandi totali sono <= previewCount, nessun blur/overlay: mostra
 * tutto.
 *
 * Accessibilita': la zona sfocata e' aria-hidden e non contiene link cliccabili
 * (avvolta in pointer-events-none); la CTA dell'overlay e' un vero link focusabile.
 */
export default function BandiListPaywall({
  bandi,
  total,
  previewCount = 6,
  blurCount = 6,
  gridClassName = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5',
}: Props) {
  if (bandi.length === 0) return null;

  const clearBandi = bandi.slice(0, previewCount);
  const lockedBandi = bandi.slice(previewCount, previewCount + blurCount);
  const hasLocked = lockedBandi.length > 0;

  // Conteggio mostrato nella CTA: il totale del contesto se noto, altrimenti la
  // lunghezza della lista corrente.
  const totalCount = typeof total === 'number' ? total : bandi.length;

  return (
    <div>
      {/* Zona NITIDA: prime card leggibili e navigabili */}
      <div className={gridClassName}>
        {clearBandi.map((b) => (
          <BandoCard key={b.id} bando={b} />
        ))}
      </div>

      {/* Zona SFOCATA: card reali nell'HTML (SEO) ma offuscate + overlay CTA */}
      {hasLocked && (
        <div className="relative mt-4 md:mt-5">
          <div
            aria-hidden="true"
            className={`${gridClassName} select-none pointer-events-none blur-[4px]`}
          >
            {lockedBandi.map((b) => (
              <BandoCard key={`locked-${b.id}`} bando={b} />
            ))}
          </div>

          {/* Overlay CTA: vero link focusabile, sopra la zona sfocata */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-background/30 via-background/80 to-background px-6 text-center">
            <p className="max-w-md text-sm md:text-base font-medium text-foreground text-pretty">
              <Lock className="inline h-4 w-4 mr-1.5 -mt-0.5 text-construction" strokeWidth={2} aria-hidden="true" />
              Iscriviti gratis per sbloccare tutti i {formatNumber(totalCount)} bandi, con ricerca avanzata, alert ed export
            </p>
            <a
              href={UNLOCK_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Iscriviti gratis e sblocca tutti i bandi
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
