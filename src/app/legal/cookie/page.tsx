import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';
import CookieSettingsClient from './CookieSettingsClient';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: `Cookie policy di ${siteConfig.name} secondo le linee guida del Garante Privacy.`,
  alternates: { canonical: '/legal/cookie' },
};

export default function CookiePolicyPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Cookie Policy' }]} />
        <h1 className="heading-section mb-3">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Informativa sull&apos;utilizzo dei cookie ai sensi dell&apos;Art. 122 D.Lgs. 196/2003 e Linee Guida del Garante Privacy
          del 10 giugno 2021.
        </p>

        <div className="prose prose-neutral max-w-none">
          <h2>Cookie tecnici (sempre attivi)</h2>
          <p>
            Cookie essenziali per il funzionamento del sito: gestione sessione, preferenze cookie. Non richiedono
            consenso.
          </p>

          <h2>Cookie analitici (opt-in)</h2>
          <p>
            Google Analytics 4 con IP anonimizzato. Servono a misurare il traffico aggregato e migliorare il servizio.
            Cookie installati solo dopo consenso esplicito tramite il banner.
          </p>
          <ul>
            <li>
              <code>_ga</code>, <code>_ga_*</code> — identificativo utente anonimo (Google), durata 26 mesi.
            </li>
            <li><code>_gid</code> — identificativo sessione (Google), durata 24 ore.</li>
          </ul>

          <h2>Cookie di marketing</h2>
          <p>Non utilizziamo cookie di marketing o profilazione.</p>

          <h2>Gestione preferenze</h2>
          <p>
            Puoi rivedere le tue preferenze in qualsiasi momento cliccando il pulsante qui sotto.
          </p>
          <div className="not-prose">
            <CookieSettingsClient />
          </div>

          <h2>Maggiori informazioni</h2>
          <p>
            Per dettagli sul trattamento generale dei dati, vedi la <Link href="/legal/privacy">Privacy Policy</Link> e la
            pagina <Link href="/come-trattiamo-i-dati">Come trattiamo i dati</Link>.
          </p>

          <p className="text-sm text-muted-foreground border-t border-border pt-4 mt-8">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </section>
  );
}
