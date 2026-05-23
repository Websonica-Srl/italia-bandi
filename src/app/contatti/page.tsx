import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, ShieldCheck, Database } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

export const metadata: Metadata = {
  title: 'Contatti',
  description: `Contatta ${siteConfig.name}: richieste informazioni, opt-out GDPR, segnalazioni dati, partnership.`,
  alternates: { canonical: '/contatti' },
};

export default function ContattiPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Contatti' }]} />
        <h1 className="heading-section mb-3">Contatti</h1>
        <p className="body-default text-muted-foreground mb-10">
          Scrivici per richieste informative, segnalazioni dati errati, partnership o esercizio dei diritti GDPR.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-border bg-white p-6">
            <Mail className="h-6 w-6 mb-3" />
            <h2 className="font-semibold mb-2">Informazioni generali</h2>
            <p className="text-sm text-secondary-text mb-4">Per qualsiasi domanda sui dati o sul servizio.</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-primary hover:underline text-sm font-medium break-all"
            >
              {siteConfig.email}
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <ShieldCheck className="h-6 w-6 mb-3" />
            <h2 className="font-semibold mb-2">DPO / Privacy</h2>
            <p className="text-sm text-secondary-text mb-4">Per opt-out, cancellazione, accesso ai dati GDPR.</p>
            <a
              href={`mailto:${siteConfig.dpoEmail}`}
              className="text-primary hover:underline text-sm font-medium break-all"
            >
              {siteConfig.dpoEmail}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary p-6">
          <Database className="h-5 w-5 mb-2" />
          <h2 className="font-semibold mb-2">Sei un Comune o un ente pubblico?</h2>
          <p className="text-sm text-secondary-text mb-3">
            Siamo interessati a integrare nuove fonti open data. Se il tuo Comune pubblica un albo pretorio digitale,
            scrivici per integrazione e indicizzazione.
          </p>
          <a
            href={`mailto:${siteConfig.email}?subject=Integrazione%20open%20data%20Comune`}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
          >
            <Mail className="h-4 w-4" /> Proponi integrazione
          </a>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {siteConfig.companyName} · {siteConfig.companyPiva}
          </p>
          <p className="mt-2">
            Vedi anche: <Link href="/come-trattiamo-i-dati" className="underline">Trasparenza dati</Link> ·{' '}
            <Link href="/legal/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
