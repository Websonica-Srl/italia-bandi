import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="py-20 md:py-32">
      <div className="container-zen max-w-2xl text-center">
        <p className="text-[120px] md:text-[160px] font-black tracking-tighter leading-none text-foreground/10 mb-2">
          404
        </p>
        <h1 className="heading-section mb-3">Pagina non trovata</h1>
        <p className="text-secondary-text mb-8 leading-relaxed max-w-md mx-auto">
          La pagina che cerchi potrebbe essere stata spostata, rimossa o non essere mai esistita.
          Prova a cercare il tuo Comune o torna alla homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" /> Torna alla home
          </Link>
          <Link
            href="/regioni"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background text-foreground px-6 py-3 font-medium hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" /> Esplora i cantieri
          </Link>
        </div>
      </div>
    </section>
  );
}
