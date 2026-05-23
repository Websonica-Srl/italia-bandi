import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { getCantieri, type Cantiere } from '@/lib/supabase/queries/cantieri';
import { formatEuro, slugify } from '@/lib/utils';

interface Props {
  currentSlug: string;
  comune: string;
}

/**
 * Mostra fino a 3 cantieri nello stesso comune (esclude quello corrente).
 * Aumenta tempo permanenza + crosslink interni SEO.
 */
export default async function CantieriSimiliVicini({ currentSlug, comune }: Props) {
  const { data } = await getCantieri({ comune, limit: 4 });
  const altri = data.filter((c) => c.slug !== currentSlug).slice(0, 3);

  if (altri.length === 0) return null;

  return (
    <section aria-labelledby="cantieri-simili-heading" className="rounded-3xl border border-border bg-secondary/40 p-6 md:p-8">
      <div className="flex items-end justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 id="cantieri-simili-heading" className="text-lg md:text-xl font-bold mb-1">
            Altri cantieri a {comune}
          </h2>
          <p className="text-sm text-secondary-text">
            Esplora i lavori più recenti nello stesso Comune.
          </p>
        </div>
        <Link
          href={`/comune/${slugify(comune)}`}
          className="text-sm font-medium text-foreground hover:underline inline-flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Vedi tutti <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {altri.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cantiere/${c.slug}`}
              className="group block h-full rounded-2xl border border-border bg-white p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Vai al cantiere ${c.descrizione || c.protocollo || c.slug}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 text-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {c.tipo_titolo || 'Cantiere'}
                </span>
                {c.importo_lavori ? (
                  <span className="text-[10px] text-muted-foreground">
                    {formatEuro(c.importo_lavori, { compact: true })}
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-medium leading-snug text-foreground line-clamp-2 mb-2 group-hover:text-foreground/80 transition-colors">
                {c.descrizione || `${c.tipo_titolo || 'Cantiere'} ${c.protocollo || ''}`}
              </p>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                {[c.indirizzo, c.civico].filter(Boolean).join(' ') || c.quartiere || c.comune}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
