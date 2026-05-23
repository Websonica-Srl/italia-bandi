import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  slug: string;
  comune: string;
  variant?: 'card' | 'compact';
}

/**
 * R1 HIGH: CTA above-the-fold scheda cantiere.
 * Pattern conversione testato: value prop chiara + 3 micro-trust ("Gratis · Senza carta · Magic link").
 * Tutti i link puntano al HUB italiaprogettisti.com con UTM tracking.
 */
export default function UnlockPremiumCTA({ slug, comune, variant = 'card' }: Props) {
  const hubUrl = `https://www.italiaprogettisti.com/register?intent=unlock&cantiere=${encodeURIComponent(
    slug,
  )}&utm_source=italiacantieri&utm_medium=scheda&utm_campaign=unlock_flow`;

  if (variant === 'compact') {
    return (
      <a
        href={hubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        Sblocca dati completi
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </a>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-foreground bg-foreground text-background p-5 md:p-7 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Decorativo */}
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-background/5 blur-2xl"
      />
      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-background/10 border border-background/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide mb-3">
            <Sparkles className="h-3 w-3" strokeWidth={2} /> Premium · Network ItaliaProgettisti
          </div>
          <h2 className="text-lg md:text-xl font-bold leading-snug mb-2">
            Vuoi sapere chi sta costruendo a {comune}?
          </h2>
          <p className="text-sm text-background/80 leading-relaxed mb-4 md:mb-0">
            Titolare, impresa esecutrice, progettista e direttore lavori sono nel nostro network professionale.
            <span className="hidden md:inline"> Sblocca i contatti diretti in 30 secondi.</span>
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end md:min-w-[200px]">
          <a
            href={hubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground"
            aria-label={`Sblocca contatti per il cantiere di ${comune} - registrazione gratuita`}
          >
            Sblocca contatti gratis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-background/70 md:justify-end">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Gratis
            </span>
            <span>· Senza carta</span>
            <span>· Magic link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
