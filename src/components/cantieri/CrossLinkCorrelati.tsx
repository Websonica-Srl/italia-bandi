import { ArrowRight, Users, MapPin, ShieldCheck } from 'lucide-react';
import { slugify } from '@/lib/utils';

interface Props {
  comune: string;
  countImprese?: number;
  cantiereSlug?: string;
}

/**
 * R9 HIGH (potenziato): value prop quantitativa + CTA bold + visual hierarchy.
 */
export default function CrossLinkCorrelati({ comune, countImprese, cantiereSlug }: Props) {
  if (!comune) return null;
  const slug = slugify(comune);
  const utm = `utm_source=italiacantieri&utm_medium=crosslink&utm_campaign=esplora_${slug}`;
  // Link INTERNO alla pagina comune di italiacantieri (resta sul sito; il HUB non ha /comune).
  const comuneUrl = `/comune/${slug}`;
  const unlockUrl = cantiereSlug
    ? `https://www.italiaprogettisti.com/register?intent=unlock&cantiere=${encodeURIComponent(
        cantiereSlug,
      )}&${utm}`
    : `https://www.italiaprogettisti.com/register?${utm}`;

  const hasCount = countImprese && countImprese > 0;

  return (
    <section
      aria-labelledby="crosslink-heading"
      className="rounded-3xl border border-border bg-secondary p-6 md:p-8 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-foreground/60" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary-text">
              Network ItaliaProgettisti · {comune}
            </span>
          </div>
          <h3 id="crosslink-heading" className="text-lg md:text-xl font-bold mb-2 tracking-tight">
            {hasCount
              ? `${countImprese.toLocaleString('it-IT')} imprese e studi attivi a ${comune}`
              : `Esplora studi e imprese a ${comune}`}
          </h3>
          <p className="text-sm text-secondary-text leading-relaxed mb-4">
            {hasCount
              ? `Cerchi un partner locale? Sul HUB ItaliaProgettisti trovi professionisti verificati con profilo, portfolio e referenze nell'area di ${comune}.`
              : `Trova studi di progettazione e imprese edili verificate nell'area di ${comune} sul HUB professionale ItaliaProgettisti.`}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} /> Profili verificati
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" strokeWidth={2} /> 8.000+ professionisti
            </span>
            <span>· Consultazione gratuita</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:min-w-[220px]">
          <a
            href={comuneUrl}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Esplora i cantieri a ${comune}`}
          >
            Esplora i cantieri a {comune}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </a>
          <a
            href={unlockUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-foreground/20 bg-transparent px-5 py-2.5 text-xs font-medium text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sblocca contatti progettista
          </a>
        </div>
      </div>
    </section>
  );
}
