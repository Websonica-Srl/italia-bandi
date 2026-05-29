import Link from 'next/link';
import { Building2, Users, Trophy, MapPin, Tag, Lock, ArrowRight } from 'lucide-react';
import type { LeaderboardRow } from '@/lib/supabase/queries/intelligence';
import { cpvGroupLabel, cpvGroupToSlug } from '@websonica/cantieri-core';
import { formatNumber, formatPct } from '@/lib/utils';
import { hubUrl } from '@/lib/site-config';

interface Props {
  rows: LeaderboardRow[];
  /** Mostra colonna top CPV (utile nelle classifiche per regione). */
  showCpv?: boolean;
  /** Mostra colonna top zona (utile nelle classifiche per CPV). */
  showZona?: boolean;
  /** Campaign UTM per la CTA in coda alla tabella. */
  ctaCampaign?: string;
  ctaIntent?: string;
  /**
   * Soft-paywall: righe nitide leggibili in testa. Le righe successive (fino a
   * `blurRows`) restano nell'HTML (SEO) ma sfocate con overlay CTA. Default 5.
   */
  previewRows?: number;
  /** Cap massimo di righe sfocate mostrate sotto la preview (default 15). */
  blurRows?: number;
  /** Sostantivo per la CTA di sblocco: "vincitori" | "risultati" | "gare"... */
  unlockNoun?: string;
}

/** Header della tabella ranking — condiviso tra zona nitida e zona sfocata. */
function LeaderHead({ showCpv, showZona }: { showCpv: boolean; showZona: boolean }) {
  return (
    <thead>
      <tr className="border-b border-border bg-secondary/40 text-left">
        <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground w-12">
          #
        </th>
        <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">
          Impresa
        </th>
        <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground text-right whitespace-nowrap">
          Gare vinte
        </th>
        <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground text-right whitespace-nowrap hidden sm:table-cell">
          In RTI
        </th>
        {showCpv && (
          <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
            Categoria
          </th>
        )}
        {showZona && (
          <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
            Zona
          </th>
        )}
      </tr>
    </thead>
  );
}

/**
 * Riga ranking. `linked=false` (zona sfocata) rende la categoria come testo
 * statico, così la zona blurred non contiene link focusabili/cliccabili.
 */
function LeaderRow({
  r,
  index,
  showCpv,
  showZona,
  linked,
}: {
  r: LeaderboardRow;
  index: number;
  showCpv: boolean;
  showZona: boolean;
  linked: boolean;
}) {
  const rtiPct = r.gare_vinte > 0 ? r.gare_in_rti / r.gare_vinte : null;
  return (
    <tr className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
      <td className="px-4 py-3 tabular-nums text-muted-foreground font-medium">{index + 1}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-start gap-2 font-semibold text-foreground">
          <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <span className="leading-snug">{r.firm_name}</span>
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center gap-1.5 font-bold tabular-nums text-foreground">
          <Trophy className="h-3.5 w-3.5 text-construction" strokeWidth={2} aria-hidden="true" />
          {formatNumber(r.gare_vinte)}
        </span>
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
        {rtiPct != null ? (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
            {formatPct(rtiPct)}
          </span>
        ) : (
          '—'
        )}
      </td>
      {showCpv && (
        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
          {r.top_cpv2 ? (
            linked ? (
              <Link
                href={`/categoria/${cpvGroupToSlug(r.top_cpv2)}`}
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Tag className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                {cpvGroupLabel(r.top_cpv2)}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Tag className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                {cpvGroupLabel(r.top_cpv2)}
              </span>
            )
          ) : (
            '—'
          )}
        </td>
      )}
      {showZona && (
        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
          {r.top_regione ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              {r.top_regione}
            </span>
          ) : (
            '—'
          )}
        </td>
      )}
    </tr>
  );
}

/**
 * Tabella ranking "chi vince di piu'" (M8). Dato pubblico aggregato dalla view
 * `leaderboard_public`: ragione sociale (PG), gare vinte, quota in raggruppamento,
 * top CPV/zona. NESSUN dato sensibile. Il nome NON e' linkato a una scheda interna
 * (le schede azienda vivono sull'HUB): la CTA finale porta al network.
 *
 * Soft-paywall: le prime `previewRows` righe sono nitide; le successive (fino a
 * `blurRows`) restano nell'HTML per l'indicizzazione SEO ma sono sfocate via CSS
 * (blur + select-none + pointer-events-none + aria-hidden) con overlay CTA che
 * incentiva la registrazione gratuita sull'HUB.
 */
export default function LeaderboardTable({
  rows,
  showCpv = true,
  showZona = true,
  ctaCampaign = 'leaderboard',
  ctaIntent = 'bidder-leaderboard',
  previewRows = 5,
  blurRows = 15,
  unlockNoun = 'vincitori',
}: Props) {
  if (rows.length === 0) return null;

  const clearRows = rows.slice(0, previewRows);
  const lockedRows = rows.slice(previewRows, previewRows + blurRows);
  const hasLocked = lockedRows.length > 0;

  // URL di registrazione HUB con UTM dedicate allo sblocco tabella.
  // hubUrl imposta gia' utm_source=bandigaredappalto & utm_medium=referral.
  const unlockHref = hubUrl('/register', 'unlock_tabella', { intent: ctaIntent });

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Zona NITIDA: prime righe leggibili */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Classifica delle imprese per numero di gare d&apos;appalto vinte
          </caption>
          <LeaderHead showCpv={showCpv} showZona={showZona} />
          <tbody>
            {clearRows.map((r, i) => (
              <LeaderRow
                key={r.firm_slug || `${r.firm_name}-${i}`}
                r={r}
                index={i}
                showCpv={showCpv}
                showZona={showZona}
                linked
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Zona SFOCATA: dati reali nell'HTML (SEO) ma offuscati + overlay CTA */}
      {hasLocked && (
        <div className="relative border-t border-border">
          <div
            aria-hidden="true"
            className="overflow-x-auto select-none pointer-events-none blur-[4px]"
          >
            <table className="w-full text-sm">
              <tbody>
                {lockedRows.map((r, i) => (
                  <LeaderRow
                    key={r.firm_slug || `locked-${r.firm_name}-${i}`}
                    r={r}
                    index={previewRows + i}
                    showCpv={showCpv}
                    showZona={showZona}
                    linked={false}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Overlay CTA: vero link focusabile, sopra la zona sfocata */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-card/40 via-card/80 to-card px-6 text-center">
            <p className="max-w-md text-sm md:text-base font-medium text-foreground text-pretty">
              <Lock className="inline h-4 w-4 mr-1.5 -mt-0.5 text-construction" strokeWidth={2} aria-hidden="true" />
              Iscriviti gratis per vedere tutte le {formatNumber(rows.length)} {unlockNoun}
            </p>
            <a
              href={unlockHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Iscriviti gratis e sblocca la classifica
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
          </div>
        </div>
      )}

      <div className="border-t border-border bg-secondary/30 px-4 py-4 text-center">
        <p className="text-sm text-secondary-text">
          Vuoi confrontare il tuo track record con questi leader e monitorare i
          tuoi concorrenti?{' '}
          <a
            href={hubUrl('/register', ctaCampaign, { intent: ctaIntent })}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors"
          >
            Crea il tuo profilo gratuito sul network →
          </a>
        </p>
      </div>
    </div>
  );
}
