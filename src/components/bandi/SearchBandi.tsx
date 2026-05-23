'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';

interface Props {
  placeholder?: string;
  /** valore iniziale (es. da searchParams su /bandi). */
  defaultValue?: string;
}

/**
 * Barra di ricerca bandi → naviga a /bandi?q=...
 * La pagina /bandi con querystring è noindex (ricerca dinamica).
 */
export default function SearchBandi({
  placeholder = 'Cerca per oggetto, ente o CIG…',
  defaultValue = '',
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/bandi?q=${encodeURIComponent(term)}` : '/bandi');
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex items-center gap-2 rounded-full border border-border bg-white p-1.5 pl-5 shadow-sm focus-within:border-foreground/40 focus-within:shadow-md transition-all"
    >
      <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Cerca bandi di gara"
        className="flex-1 min-w-0 bg-transparent py-2.5 text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="submit"
        className="group inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 md:px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="hidden sm:inline">Cerca</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
      </button>
    </form>
  );
}
