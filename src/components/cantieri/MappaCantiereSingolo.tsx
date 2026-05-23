'use client';

import { useEffect, useRef } from 'react';
import { parseCoordinate } from '@/lib/utils';

interface Props {
  coordinate: string | null;
  indirizzo?: string;
  comune?: string;
}

/**
 * Mappa singolo cantiere: usa iframe OpenStreetMap (no dipendenze, no API key).
 * Se le coordinate non sono parseabili, mostra link generico a OSM.
 */
export default function MappaCantiereSingolo({ coordinate, indirizzo, comune }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseCoordinate(coordinate);

  useEffect(() => {
    if (!parsed || !ref.current) return;
    const { lat, lng } = parsed;
    const bbox = [lng - 0.005, lat - 0.003, lng + 0.005, lat + 0.003].join(',');
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    ref.current.innerHTML = `
      <iframe
        src="${src}"
        style="width:100%; height:360px; border:0; border-radius:1rem;"
        loading="lazy"
        title="Mappa cantiere"
      ></iframe>
      <a
        href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}"
        target="_blank" rel="noopener noreferrer"
        class="block mt-2 text-xs text-muted-foreground hover:text-foreground"
      >Apri in OpenStreetMap →</a>
    `;
  }, [parsed]);

  if (!parsed) {
    const search = encodeURIComponent([indirizzo, comune].filter(Boolean).join(', '));
    return (
      <div className="rounded-2xl border border-dashed border-border bg-secondary p-8 text-center text-sm text-muted-foreground">
        Coordinate non disponibili per questo cantiere.
        {search && (
          <a
            href={`https://www.openstreetmap.org/search?query=${search}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-primary hover:underline"
          >
            Cerca su OpenStreetMap →
          </a>
        )}
      </div>
    );
  }

  return <div ref={ref} className="overflow-hidden rounded-2xl border border-border" />;
}
