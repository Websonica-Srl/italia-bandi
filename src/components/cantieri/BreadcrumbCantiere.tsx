import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbStep {
  label: string;
  href?: string;
}

export default function BreadcrumbCantiere({
  steps,
  inverted = false,
}: {
  steps: BreadcrumbStep[];
  /** Modalità su sfondo scuro (hero immagine). Usa testo bianco. */
  inverted?: boolean;
}) {
  // JSON-LD BreadcrumbList
  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: 'Italia Cantieri', item: 'https://www.italiacantieri.it/' },
    ...steps.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: s.label,
      ...(s.href ? { item: `https://www.italiacantieri.it${s.href}` } : {}),
    })),
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }}
      />
      <nav
        aria-label="Breadcrumb"
        className={inverted ? 'mb-0' : 'mb-6'}
      >
        <ol
          className={`flex items-center flex-wrap gap-1 text-sm ${
            inverted ? 'text-white/75' : 'text-muted-foreground'
          }`}
        >
          <li>
            <Link
              href="/"
              className={`transition-colors inline-flex items-center gap-1 ${
                inverted ? 'hover:text-white' : 'hover:text-foreground'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Italia Cantieri</span>
            </Link>
          </li>
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
              {s.href && i < steps.length - 1 ? (
                <Link
                  href={s.href}
                  className={`transition-colors ${
                    inverted ? 'hover:text-white' : 'hover:text-foreground'
                  }`}
                >
                  {s.label}
                </Link>
              ) : (
                <span
                  className={`font-medium truncate max-w-[300px] ${
                    inverted ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {s.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
