'use client';

/**
 * NumberBig - numero KPI con animazione count-up.
 *
 * Usa IntersectionObserver per innescare l'animazione quando il numero entra
 * in viewport. Rispetta prefers-reduced-motion (no animazione, valore finale).
 *
 * Pattern skill: design-taste-frontend (perpetual micro-interactions,
 * staggered orchestration), redesign-existing-projects (motion upgrade).
 */
import { useEffect, useRef, useState } from 'react';
import { formatNumber, formatEuro } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Format = 'number' | 'euro' | 'plain';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface NumberBigProps {
  value: number;
  format?: Format;
  /** Suffisso opzionale (es. "+", "%", "k") - applicato solo se valueOverride non passato */
  suffix?: string;
  /** Prefisso opzionale */
  prefix?: string;
  /** Override visuale del valore renderizzato (per "8.000+", "4.8/5") */
  valueOverride?: string;
  size?: Size;
  /** Durata animazione in ms */
  duration?: number;
  /** Classe colore custom */
  className?: string;
  /** Forza disabilitazione animazione (per fallback statici) */
  static?: boolean;
}

const sizeClass: Record<Size, string> = {
  sm: 'text-2xl md:text-3xl',
  md: 'text-3xl md:text-4xl',
  lg: 'text-4xl md:text-5xl',
  xl: 'text-5xl md:text-6xl lg:text-7xl',
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function NumberBig({
  value,
  format = 'number',
  suffix,
  prefix,
  valueOverride,
  size = 'md',
  duration = 1400,
  className,
  static: forceStatic = false,
}: NumberBigProps) {
  const [display, setDisplay] = useState(forceStatic || valueOverride ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (forceStatic || valueOverride) return;
    if (typeof window === 'undefined') return;

    // Rispetta prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(elapsed / duration, 1);
              const eased = easeOutCubic(t);
              setDisplay(Math.round(value * eased));
              if (t < 1) requestAnimationFrame(tick);
              else setDisplay(value);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, forceStatic, valueOverride]);

  const formatted = valueOverride
    ? valueOverride
    : format === 'euro'
      ? formatEuro(display, { compact: true })
      : format === 'number'
        ? formatNumber(display)
        : String(display);

  return (
    <span
      ref={ref}
      className={cn(
        'font-black leading-none tracking-tighter tabular-nums text-foreground',
        sizeClass[size],
        className,
      )}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
