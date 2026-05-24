import Link from 'next/link';
import { Building2, Users, Trophy, MapPin, Tag } from 'lucide-react';
import type { LeaderboardRow } from '@/lib/supabase/queries/intelligence';
import { cpvGroupLabel } from '@/lib/bandi-taxonomy-extra';
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
}

/**
 * Tabella ranking "chi vince di piu'" (M8). Dato pubblico aggregato dalla view
 * `leaderboard_public`: ragione sociale (PG), gare vinte, quota in raggruppamento,
 * top CPV/zona. NESSUN dato sensibile. Il nome NON e' linkato a una scheda interna
 * (le schede azienda vivono sull'HUB): la CTA finale porta al network.
 */
export default function LeaderboardTable({
  rows,
  showCpv = true,
  showZona = true,
  ctaCampaign = 'leaderboard',
  ctaIntent = 'bidder-leaderboard',
}: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            Classifica delle imprese per numero di gare d&apos;appalto vinte
          </caption>
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
          <tbody>
            {rows.map((r, i) => {
              const rtiPct =
                r.gare_vinte > 0 ? r.gare_in_rti / r.gare_vinte : null;
              return (
                <tr
                  key={r.firm_slug || `${r.firm_name}-${i}`}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 tabular-nums text-muted-foreground font-medium">
                    {i + 1}
                  </td>
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
                        <Link
                          href={`/categoria/${r.top_cpv2}`}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          <Tag className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                          {cpvGroupLabel(r.top_cpv2)}
                        </Link>
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
            })}
          </tbody>
        </table>
      </div>

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
