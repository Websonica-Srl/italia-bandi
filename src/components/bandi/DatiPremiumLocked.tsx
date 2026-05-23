import { Lock, FileText, Users, TrendingDown, BellRing, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { hubUrl } from '@/lib/site-config';

interface Props {
  slug: string;
}

/**
 * Dati premium del bando offuscati con paywall → CTA HUB.
 * NESSUN dato reale: solo placeholder visivi. Lo sblocco vero (unlock_bando,
 * wallet crediti) avviene esclusivamente sull'HUB italiaprogettisti.
 */
const FIELDS = [
  { icon: FileText, label: 'Documentazione di gara', placeholder: 'Disciplinare, capitolato, allegati tecnici' },
  { icon: Users, label: 'Composizione RTI completa', placeholder: 'Mandataria + mandanti + quote di partecipazione' },
  { icon: TrendingDown, label: 'Ribasso e graduatoria', placeholder: 'Offerte, ribasso aggiudicazione, esclusioni' },
  { icon: BellRing, label: 'Alert su gare simili', placeholder: 'Notifica su CPV / importo / stazione appaltante' },
  { icon: FileSpreadsheet, label: 'Export e storico', placeholder: 'CSV gare, andamento ribassi, monitoraggio concorrenti' },
];

export default function DatiPremiumLocked({ slug }: Props) {
  const url = hubUrl('/register', 'unlock_flow', { intent: 'unlock', bando: slug });

  return (
    <section
      aria-labelledby="dati-premium-heading"
      className="relative rounded-3xl border border-border bg-card p-6 md:p-8 overflow-hidden shadow-diffusion"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-construction/70 to-transparent"
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
          <Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
            Network ItaliaProgettisti
          </p>
          <h2 id="dati-premium-heading" className="text-base md:text-lg font-bold leading-tight">
            Sblocca documentazione, ribassi e monitoraggio
          </h2>
        </div>
      </div>
      <p className="text-sm text-secondary-text mb-6 leading-relaxed">
        I dati di base di questo bando sono pubblici e consultabili qui sopra. I
        documenti di gara, la graduatoria completa e gli strumenti di monitoraggio
        sono disponibili agli iscritti del network. La registrazione base è gratuita.
      </p>

      <div className="relative">
        <ul className="space-y-3" aria-hidden="true">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs md:text-sm text-muted-foreground w-48 md:w-56 flex-shrink-0">
                  {f.label}
                </span>
                <span
                  className="flex-1 text-sm font-medium text-foreground/90 select-none"
                  style={{ filter: 'blur(6px)' }}
                >
                  {f.placeholder}
                </span>
                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2} aria-hidden="true" />
              </li>
            );
          })}
        </ul>

        <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none bg-gradient-to-t from-white via-white/70 to-transparent">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Registrati gratis per sbloccare
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Dati di gara provenienti da fonti pubbliche (TED, ANAC, portali appalti).
        Conformità GDPR garantita: non pubblichiamo dati personali di persone fisiche.
      </p>
    </section>
  );
}
