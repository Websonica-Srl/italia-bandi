import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

export const metadata: Metadata = {
  title: 'Termini di servizio',
  description: `Termini e condizioni di utilizzo di ${siteConfig.name}.`,
  alternates: { canonical: '/legal/termini' },
};

export default function TerminiPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Termini di servizio' }]} />
        <h1 className="heading-section mb-3">Termini di servizio</h1>

        <div className="prose prose-neutral max-w-none">
          <h2>1. Oggetto del servizio</h2>
          <p>
            {siteConfig.name} è un aggregatore pubblico di informazioni su cantieri edilizi italiani, raccolte
            esclusivamente da fonti pubbliche e open data della Pubblica Amministrazione. Il servizio è fornito da{' '}
            <strong>{siteConfig.companyName}</strong> ({siteConfig.companyPiva}).
          </p>

          <h2>2. Accuratezza dei dati</h2>
          <p>
            I dati pubblicati sono il risultato di un processo automatico di aggregazione e normalizzazione di fonti
            pubbliche. Pur impegnandoci a garantire la massima qualità, non possiamo garantire l&apos;assenza totale di errori
            o ritardi rispetto alla pubblicazione originale presso le PA.
          </p>
          <p>
            Per usi professionali (es. due diligence, vendita immobiliare) consigliamo sempre la verifica diretta presso
            l&apos;ente pubblico competente.
          </p>

          <h2>3. Limitazione di responsabilità</h2>
          <p>
            {siteConfig.name} non è responsabile per decisioni prese sulla base dei dati pubblicati. L&apos;utilizzo del
            servizio avviene a discrezione e rischio dell&apos;utente.
          </p>

          <h2>4. Proprietà intellettuale</h2>
          <p>
            I dati grezzi provengono da fonti pubbliche e mantengono la natura open data. L&apos;aggregazione,
            normalizzazione, presentazione e tutti gli elementi grafici di {siteConfig.name} sono protetti da copyright
            di {siteConfig.companyName}.
          </p>

          <h2>5. Privacy e GDPR</h2>
          <p>
            Per il trattamento dei dati personali, vedi la <Link href="/legal/privacy">Privacy Policy</Link> e la pagina{' '}
            <Link href="/come-trattiamo-i-dati">Come trattiamo i dati</Link>.
          </p>

          <h2>6. Modifiche ai termini</h2>
          <p>
            Ci riserviamo di modificare questi termini in qualsiasi momento. Le modifiche entrano in vigore alla data di
            pubblicazione su questa pagina.
          </p>

          <h2>7. Foro competente e legge applicabile</h2>
          <p>
            I presenti termini sono regolati dalla legge italiana. Foro competente esclusivo: Tribunale di Cuneo.
          </p>

          <p className="text-sm text-muted-foreground border-t border-border pt-4 mt-8">
            <strong>Ultimo aggiornamento:</strong>{' '}
            {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </section>
  );
}
