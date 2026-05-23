'use client';

/**
 * ScrollProgress - barra di progress sottile attaccata sotto l'header.
 *
 * Riflette lo scroll progress della pagina (0 → 100%). Hardware-accelerated
 * via scaleX transform, no layout thrash. Rispetta prefers-reduced-motion
 * (la barra resta visibile ma non si anima fluidamente — il valore salta).
 *
 * Pattern skill: design-taste-frontend (hardware acceleration, transform/opacity only),
 * redesign-existing-projects (motion upgrades - scroll-driven reveals).
 */
import { useEffect, useRef } from 'react';

interface ScrollProgressProps {
  /** Selector di un elemento target (es. "#cantiere-content") per limitare
   *  la progress a una sezione specifica. Se omesso, usa l'intera pagina. */
  targetSelector?: string;
}

export default function ScrollProgress({ targetSelector }: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bar = barRef.current;
    if (!bar) return;

    let ticking = false;

    const update = () => {
      const target = targetSelector
        ? document.querySelector<HTMLElement>(targetSelector)
        : document.documentElement;
      if (!target) return;

      const rect = (target as HTMLElement).getBoundingClientRect?.();
      let progress = 0;
      if (targetSelector && rect) {
        const total = (target as HTMLElement).offsetHeight - window.innerHeight;
        const scrolled = -rect.top;
        progress = total > 0 ? Math.max(0, Math.min(scrolled / total, 1)) : 0;
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        progress = total > 0 ? Math.max(0, Math.min(scrolled / total, 1)) : 0;
      }
      bar.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetSelector]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-[68px] md:top-[72px] left-0 right-0 z-40 h-[2px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-foreground/85 will-change-transform"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
