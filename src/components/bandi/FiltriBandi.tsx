'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { CPV_GROUP_LABELS, PROCEDURA_LABELS } from '@/lib/bandi-taxonomy';

interface CpvOption {
  group: string;
  cnt: number;
}

interface Props {
  /** gruppi CPV realmente presenti, con conteggi. */
  cpvOptions: CpvOption[];
}

/**
 * Filtri bandi — naviga a /bandi con querystring.
 * Le pagine /bandi con querystring di ricerca/filtro sono noindex (gestito
 * lato page con generateMetadata): il valore unico SEO è la lista base + le
 * pagine /categoria/[cpv] indicizzabili.
 */
export default function FiltriBandi({ cpvOptions }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState('');
  const [cpv, setCpv] = useState('');
  const [procedura, setProcedura] = useState('');
  const [importoMin, setImportoMin] = useState('');
  const [importoMax, setImportoMax] = useState('');
  const [soloAperti, setSoloAperti] = useState(false);

  // sync stato dai searchParams (per deep-link)
  useEffect(() => {
    setQ(params.get('q') || '');
    setCpv(params.get('cpv') || '');
    setProcedura(params.get('procedura') || '');
    setImportoMin(params.get('importo_min') || '');
    setImportoMax(params.get('importo_max') || '');
    setSoloAperti(params.get('aperti') === '1');
  }, [params]);

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (q.trim()) qs.set('q', q.trim());
    if (cpv) qs.set('cpv', cpv);
    if (procedura) qs.set('procedura', procedura);
    if (importoMin) qs.set('importo_min', importoMin);
    if (importoMax) qs.set('importo_max', importoMax);
    if (soloAperti) qs.set('aperti', '1');
    const s = qs.toString();
    router.push(s ? `/bandi?${s}` : '/bandi');
  }

  function reset() {
    setQ('');
    setCpv('');
    setProcedura('');
    setImportoMin('');
    setImportoMax('');
    setSoloAperti(false);
    router.push('/bandi');
  }

  const hasFilters =
    !!q || !!cpv || !!procedura || !!importoMin || !!importoMax || soloAperti;

  return (
    <div className="rounded-3xl border border-border bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex w-full items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2} /> Filtra i bandi
          {hasFilters && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
              attivi
            </span>
          )}
        </span>
        <span className="text-muted-foreground">{open ? '−' : '+'}</span>
      </button>

      <form
        onSubmit={apply}
        className={`${open ? 'block' : 'hidden'} md:block px-5 pb-5 md:p-6`}
      >
        <p className="hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-5">
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} /> Filtra i bandi
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Ricerca</span>
            <span className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 focus-within:border-foreground/40">
              <Search className="h-4 w-4 text-muted-foreground" strokeWidth={2} aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Oggetto, ente, CIG…"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-sm focus:outline-none"
                aria-label="Cerca testo"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria (CPV)</span>
            <select
              value={cpv}
              onChange={(e) => setCpv(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40"
              aria-label="Filtra per categoria CPV"
            >
              <option value="">Tutte le categorie</option>
              {cpvOptions.map((o) => (
                <option key={o.group} value={o.group}>
                  {CPV_GROUP_LABELS[o.group] || `CPV ${o.group}`} ({o.cnt})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Procedura</span>
            <select
              value={procedura}
              onChange={(e) => setProcedura(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm focus:outline-none focus:border-foreground/40"
              aria-label="Filtra per procedura"
            >
              <option value="">Tutte le procedure</option>
              {Object.entries(PROCEDURA_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Importo minimo (€)</span>
            <input
              type="number"
              min={0}
              value={importoMin}
              onChange={(e) => setImportoMin(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:border-foreground/40"
              aria-label="Importo minimo"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Importo massimo (€)</span>
            <input
              type="number"
              min={0}
              value={importoMax}
              onChange={(e) => setImportoMax(e.target.value)}
              placeholder="Nessun limite"
              className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm tabular-nums focus:outline-none focus:border-foreground/40"
              aria-label="Importo massimo"
            />
          </label>

          <label className="md:col-span-2 flex items-center gap-2.5 rounded-xl border border-border bg-secondary/30 px-3 py-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={soloAperti}
              onChange={(e) => setSoloAperti(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-foreground"
            />
            <span className="text-sm text-foreground">Solo bandi con termine ancora aperto</span>
          </label>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Applica filtri
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} /> Azzera
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
