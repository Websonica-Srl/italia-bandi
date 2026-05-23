'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[italia-cantieri] root error:', error);
  }, [error]);

  return (
    <section className="py-20 md:py-32">
      <div className="container-zen max-w-2xl text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary mb-6">
          <AlertTriangle className="h-8 w-8 text-foreground/60" strokeWidth={1.5} />
        </div>
        <h1 className="heading-section mb-3">Ops, qualcosa è andato storto</h1>
        <p className="text-secondary-text mb-8 leading-relaxed">
          Un errore inatteso ha bloccato il caricamento. Puoi riprovare o tornare alla home.
          Se il problema persiste, scrivici a{' '}
          <a href="mailto:info@italiacantieri.it" className="text-foreground underline font-medium">
            info@italiacantieri.it
          </a>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RotateCw className="h-4 w-4" /> Riprova
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background text-foreground px-6 py-3 font-medium hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" /> Torna alla home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground">
            Riferimento errore: <code className="font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </section>
  );
}
