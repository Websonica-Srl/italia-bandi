/**
 * Componente FAQ accordion riusabile con FAQ schema.org JSON-LD.
 *
 * Uso:
 * <FAQ
 *   title="Domande frequenti sui cantieri di Milano"
 *   items={[
 *     { q: 'Domanda...', a: 'Risposta...' },
 *     ...
 *   ]}
 * />
 *
 * Renderizza:
 *  - <h2> titolo
 *  - <details> accordion (no JS richiesto, accessibile da tastiera nativamente)
 *  - <script type="application/ld+json"> con FAQPage schema
 */
import { HelpCircle } from 'lucide-react';
import { faqLd, safeJsonLd } from '@/lib/seo/structured-data';

export interface FAQItem {
  q: string;
  a: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  /** Se true non genera JSON-LD (utile quando la pagina ha gia' un FAQPage globale). */
  skipJsonLd?: boolean;
}

export default function FAQ({
  title = 'Domande frequenti',
  subtitle,
  items,
  skipJsonLd = false,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <>
      {!skipJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd(items)) }}
        />
      )}
      <section className="py-12 md:py-16" aria-labelledby="faq-heading">
        <div className="mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            <HelpCircle className="h-3.5 w-3.5" /> FAQ
          </div>
          <h2 id="faq-heading" className="heading-section mb-3">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="space-y-3">
          {items.map((f, i) => (
            <details
              key={i}
              className="group card-zen p-5 transition-shadow hover:shadow-md open:shadow-md"
            >
              <summary className="font-semibold cursor-pointer list-none flex items-start justify-between gap-3 text-foreground">
                <span className="flex-1">{f.q}</span>
                <span
                  className="text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 mt-1"
                  aria-hidden="true"
                >
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-sm text-secondary-text leading-relaxed whitespace-pre-line">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
