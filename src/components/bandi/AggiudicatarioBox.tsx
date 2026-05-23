import { Award, Users, EuroIcon, Building2 } from 'lucide-react';
import { Aggiudicatario } from '@/lib/supabase/queries/bandi';
import { formatEuro } from '@/lib/utils';
import { hubUrl } from '@/lib/site-config';

interface Props {
  aggiudicatari: Aggiudicatario[];
  /** ragione sociale denormalizzata dal bando (fallback se nessun record). */
  fallbackRaw?: string | null;
  importoAggiudicazione?: number | null;
}

/**
 * Box "Chi ha vinto la gara" — mostra gli aggiudicatari (solo PG, ragione
 * sociale pubblica). NESSUN dato sensibile: la view bando_aggiudicatari_public
 * non espone partita_iva / codice_fiscale. Il profilo aggregato delle gare
 * vinte da un'azienda vive sull'HUB (scheda azienda).
 */
export default function AggiudicatarioBox({
  aggiudicatari,
  fallbackRaw,
  importoAggiudicazione,
}: Props) {
  const lista = aggiudicatari.length > 0
    ? aggiudicatari
    : fallbackRaw
      ? [
          {
            id: 'fallback',
            bando_id: '',
            ragione_sociale_raw: fallbackRaw,
            ruolo_rti: null,
            id_gruppo: null,
            importo_aggiudicazione: importoAggiudicazione ?? null,
            firm_id: null,
          } as Aggiudicatario,
        ]
      : [];

  if (lista.length === 0) return null;

  const isRti = lista.length > 1;

  return (
    <section
      aria-labelledby="aggiudicatario-heading"
      className="rounded-3xl border border-border bg-white p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
          <Award className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-0.5">
            {isRti ? 'Raggruppamento aggiudicatario' : 'Aggiudicatario'}
          </p>
          <h2 id="aggiudicatario-heading" className="text-base md:text-lg font-bold leading-tight">
            Chi si è aggiudicato questa gara
          </h2>
        </div>
      </div>

      <ul className="space-y-3">
        {lista.map((a) => (
          <li
            key={a.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="font-semibold text-foreground leading-snug break-words">
                  {a.ragione_sociale_raw || 'Operatore economico'}
                </p>
                {a.ruolo_rti && (
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                    <Users className="h-3 w-3" strokeWidth={2} /> Ruolo RTI: {a.ruolo_rti}
                  </p>
                )}
              </div>
            </div>
            {a.importo_aggiudicazione != null && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                <EuroIcon className="h-3.5 w-3.5" strokeWidth={2} />
                {formatEuro(a.importo_aggiudicazione, { compact: true })}
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-5 text-sm text-secondary-text leading-relaxed">
        Vuoi vedere il track record completo delle gare vinte da queste aziende e
        monitorare i tuoi concorrenti?{' '}
        <a
          href={hubUrl('/register', 'aggiudicatario_box', { intent: 'gare_vinte' })}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-construction transition-colors"
        >
          Esplora le schede azienda sul network ItaliaProgettisti →
        </a>
      </p>
    </section>
  );
}
