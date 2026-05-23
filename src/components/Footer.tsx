import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Mail, Database, HardHat, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background isolate">
      {/* decorativo: glow construction sull'angolo */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-construction/15 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full bg-background/5 blur-3xl pointer-events-none"
      />

      {/* HERO logo wordmark stylized */}
      <div className="container-zen pt-20 md:pt-28 pb-12 md:pb-16 relative">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-y-12 gap-x-16 mb-16 md:mb-20">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-background/10 ring-1 ring-background/20 backdrop-blur-sm"
              >
                <HardHat className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-2xl font-black tracking-[-0.04em] leading-none">
                  Italia<span className="opacity-65">Cantieri</span>
                </h3>
                <p className="text-[10px] uppercase tracking-[0.22em] text-background/60 mt-1.5">
                  Network ItaliaProgettisti
                </p>
              </div>
            </div>
            <p className="text-lg md:text-xl text-background/85 leading-relaxed max-w-md text-pretty">
              Sai prima dove si lavora in Italia. Cantieri edilizi pubblici e bandi di
              gara aggregati da fonti ufficiali, aggiornati ogni giorno.
            </p>
            <div className="mt-8 space-y-2.5">
              <p className="text-xs text-background/55 flex items-center gap-2">
                <Database className="h-3.5 w-3.5" strokeWidth={1.5} /> Fonti: open data PA + albi pretori comunali
              </p>
              <p className="text-xs text-background/55">
                GDPR-compliant · k-anonymity 5 sui cantieri privati
              </p>
            </div>
          </div>

          {/* Right side: 3 colonne link */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-6">
            <div>
              <h4 className="kpi-hero-label text-background/55 mb-5">Esplora</h4>
              <ul className="space-y-3.5 text-sm">
                <li><FooterLink href="/regioni">Cantieri per regione</FooterLink></li>
                <li><FooterLink href="/bandi">Bandi pubblici</FooterLink></li>
                <li><FooterLink href="/statistiche">Statistiche nazionali</FooterLink></li>
                <li><FooterLink href="/glossario">Glossario edilizia</FooterLink></li>
                <li><FooterLink href="/per-pubbliche-amministrazioni">Per la PA</FooterLink></li>
                <li><FooterLink href="/api-pubbliche">API & sviluppatori</FooterLink></li>
                <li><FooterLink href="/chi-siamo">Chi siamo</FooterLink></li>
                <li><FooterLink href="/contatti">Contatti</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="kpi-hero-label text-background/55 mb-5">Trasparenza</h4>
              <ul className="space-y-3.5 text-sm">
                <li><FooterLink href="/legal/privacy#opposizione">Opt-out / rimozione</FooterLink></li>
                <li><FooterLink href="/legal/privacy">Privacy Policy</FooterLink></li>
                <li><FooterLink href="/legal/cookie">Cookie Policy</FooterLink></li>
                <li><FooterLink href="/legal/termini">Termini di servizio</FooterLink></li>
                <li className="pt-1">
                  <a
                    href={`mailto:${siteConfig.dpoEmail}`}
                    className="inline-flex items-center gap-1.5 text-background/75 hover:text-background transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.5} /> Contatta il DPO
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="kpi-hero-label text-background/55 mb-5">Network</h4>
              <ul className="space-y-3.5 text-sm">
                {siteConfig.network.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-background/75 hover:text-background transition-colors"
                    >
                      {s.name}
                      <ArrowUpRight
                        className="h-3 w-3 opacity-60 transition-transform group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        strokeWidth={1.75}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Logo wordmark gigante outline editorial */}
        <div className="border-t border-background/15 pt-12 md:pt-16 pb-4 md:pb-8 select-none">
          <div className="footer-logo-display text-balance leading-none">
            Italia<span className="accent">Cantieri</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-background/15 pt-8 mt-8 md:mt-12 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center text-sm text-background/55">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name} &mdash; parte del Network ItaliaProgettisti
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/legal/privacy" className="hover:text-background transition-colors">
              Privacy
            </Link>
            <Link href="/legal/termini" className="hover:text-background transition-colors">
              Termini
            </Link>
            <Link href="/legal/cookie" className="hover:text-background transition-colors">
              Cookie
            </Link>
          </div>
        </div>
        <p className="mt-3 text-xs text-background/40 max-w-3xl">
          {siteConfig.companyName} · {siteConfig.companyPiva} · Dati aggregati a fini informativi · Base legale: Art. 6.1.f GDPR (legittimo interesse)
        </p>

        {/* Press kit per giornalisti — citazione standardizzata */}
        <div className="mt-8 pt-6 border-t border-background/10">
          <p className="text-xs text-background/55 mb-2 font-semibold uppercase tracking-[0.18em]">
            Press kit per giornalisti
          </p>
          <p className="text-xs text-background/45 max-w-4xl leading-relaxed">
            <strong className="text-background/65">Italia Cantieri</strong> aggrega dati pubblici da: Open Data Comune di Bologna (1.759 cantieri),
            portali Maggioli (5 Comuni del Piemonte), Albo Pretorio Comune di Torino, archivi regionali appalti.
            Per richieste stampa, dati certificati o interviste contattare <a href="mailto:info@italiacantieri.it" className="underline hover:text-background">info@italiacantieri.it</a>.
            Citazione consigliata: <em>&ldquo;Italia Cantieri – database pubblico cantieri edilizi italiani (italiacantieri.it)&rdquo;</em>.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-background/75 hover:text-background transition-colors"
    >
      {children}
    </Link>
  );
}
