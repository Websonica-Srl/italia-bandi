import { Lock, User, HardHat, DraftingCompass, ClipboardCheck, Phone, ArrowRight } from 'lucide-react';

interface Props {
  slug: string;
  comune: string;
}

/**
 * R2 HIGH: dati premium offuscati con paywall CTA verso HUB.
 * Compliance GDPR: NESSUN dato reale viene mostrato — solo placeholder visivi.
 * Loss aversion + curiosity gap.
 */
const FIELDS = [
  { icon: User, label: 'Titolare del cantiere', placeholder: 'Mario Rossi' },
  { icon: HardHat, label: 'Impresa esecutrice', placeholder: 'Edilizia Costruzioni Srl' },
  { icon: DraftingCompass, label: 'Progettista', placeholder: 'Studio Architettura XYZ' },
  { icon: ClipboardCheck, label: 'Direttore dei lavori', placeholder: 'Ing. Giuseppe Bianchi' },
  { icon: Phone, label: 'Telefono cantiere', placeholder: '+39 02 1234567' },
];

export default function DatiPremiumLocked({ slug, comune }: Props) {
  const hubUrl = `https://www.italiaprogettisti.com/register?intent=unlock&cantiere=${encodeURIComponent(
    slug,
  )}&utm_source=italiacantieri&utm_medium=locked_preview&utm_campaign=unlock_flow`;

  return (
    <section
      aria-labelledby="dati-premium-heading"
      className="relative rounded-3xl border border-border bg-card p-6 md:p-8 overflow-hidden shadow-diffusion"
    >
      {/* Decorative construction accent line (top) */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-construction/70 to-transparent"
      />

      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
          <Lock className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow eyebrow-construction mb-1.5">
            <span>Network ItaliaProgettisti</span>
          </p>
          <h2 id="dati-premium-heading" className="text-base md:text-lg font-bold leading-tight">
            Sblocca i dati dei professionisti collegati
          </h2>
        </div>
      </div>
      <p className="text-sm text-secondary-text mb-6 leading-relaxed">
        Queste informazioni sono disponibili agli iscritti del HUB professionale.
        La registrazione base è gratuita e ti permette di consultarle.
      </p>

      {/* Lista campi locked */}
      <div className="relative">
        <ul className="space-y-3" aria-hidden="true">
          {FIELDS.map((f) => {
            const Icon = f.icon;
            return (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 transition-all duration-200 hover:bg-secondary/60"
              >
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                <span className="text-xs md:text-sm text-muted-foreground w-44 md:w-52 flex-shrink-0">
                  {f.label}
                </span>
                <span
                  className="flex-1 text-sm font-medium text-foreground/90 select-none blur-[6px]"
                  style={{ filter: 'blur(6px)' }}
                >
                  {f.placeholder}
                </span>
                <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2} aria-hidden="true" />
              </li>
            );
          })}
        </ul>

        {/* Overlay CTA */}
        <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none bg-gradient-to-t from-white via-white/70 to-transparent">
          <a
            href={hubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Registrati gratis per vedere i contatti del cantiere a ${comune}`}
          >
            Registrati gratis per vedere
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        I dati di titolari, progettisti e imprese sono inseriti dai professionisti stessi nel proprio profilo
        ItaliaProgettisti, oppure ricostruiti tramite matching pubblico (Albo, P.IVA). Conformità GDPR garantita.
      </p>
    </section>
  );
}
