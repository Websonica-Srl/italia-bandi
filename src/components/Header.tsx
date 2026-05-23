'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight, HardHat } from 'lucide-react';

const navItems = [
  { label: 'Cantieri per regione', href: '/regioni' },
  { label: 'Bandi pubblici', href: '/bandi' },
  { label: 'Statistiche', href: '/statistiche' },
  { label: 'Glossario', href: '/glossario' },
  { label: 'Chi siamo', href: '/chi-siamo' },
  { label: 'Privacy', href: '/legal/privacy' },
];

const HUB_REGISTER =
  'https://www.italiaprogettisti.com/register?utm_source=italiacantieri&utm_medium=header&utm_campaign=iscriviti_gratis';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        scrolled
          ? 'header-scrolled border-b border-border'
          : 'bg-background/0 border-b border-transparent',
      ].join(' ')}
    >
      <div className="container-zen">
        <div
          className={[
            'flex items-center justify-between transition-[padding] duration-500',
            scrolled ? 'py-3' : 'py-5',
          ].join(' ')}
        >
          {/* Logo - mark sempre visibile su scroll, esegue compress lieve */}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group/logo"
            aria-label="Italia Cantieri — homepage"
          >
            <span
              aria-hidden="true"
              className={[
                'inline-flex items-center justify-center rounded-2xl bg-foreground text-background transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
                scrolled ? 'h-9 w-9' : 'h-10 w-10 md:h-11 md:w-11',
              ].join(' ')}
            >
              <HardHat
                className={scrolled ? 'h-4 w-4' : 'h-5 w-5 md:h-[22px] md:w-[22px]'}
                strokeWidth={2}
              />
            </span>
            <span className="leading-none">
              <span
                className={[
                  'block font-black tracking-[-0.04em] text-foreground transition-all duration-500',
                  scrolled ? 'text-lg md:text-xl' : 'text-xl md:text-[1.6rem]',
                ].join(' ')}
              >
                Italia<span className="text-foreground/55">Cantieri</span>
              </span>
              <span className="hidden md:block text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">
                Network ItaliaProgettisti
              </span>
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav
            className="hidden md:flex items-center gap-7 lg:gap-9"
            aria-label="Navigazione principale"
          >
            {navItems.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="text-foreground/75 hover:text-foreground transition-colors font-medium text-sm relative after:absolute after:left-0 after:right-0 after:bottom-[-8px] after:h-[2px] after:bg-foreground after:scale-x-0 after:origin-left after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:scale-x-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {i.label}
              </Link>
            ))}
          </nav>

          {/* CTA pill premium with nested icon island */}
          <div className="flex items-center gap-3">
            <a
              href={HUB_REGISTER}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex group items-center gap-2 rounded-full bg-foreground text-background pl-5 pr-1.5 py-1.5 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              aria-label="Iscriviti gratis al network ItaliaProgettisti"
            >
              Iscriviti gratis
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/15 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:bg-construction group-hover:text-foreground">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
              </span>
            </a>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="md:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-2xl hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={open ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? (
                <X className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              )}
              <span className="sr-only">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - CTA in testa per priorità conversione */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav
            className="container-zen py-4 flex flex-col gap-1"
            aria-label="Navigazione mobile"
          >
            {/* CTA primaria SPOSTATA IN TESTA (R10) */}
            <a
              href={HUB_REGISTER}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn-primary w-full justify-center mb-2"
            >
              Iscriviti gratis
              <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
            </a>
            <div className="h-px bg-border my-2" />
            {navItems.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-3 min-h-[44px] text-foreground hover:bg-accent rounded-md transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
