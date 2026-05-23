import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import BreadcrumbCantiere from '@/components/cantieri/BreadcrumbCantiere';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Informativa privacy di ${siteConfig.name} ai sensi dell'Art. 13 GDPR.`,
  alternates: { canonical: '/legal/privacy' },
};

export default function PrivacyPage() {
  return (
    <section className="pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="container-zen max-w-3xl">
        <BreadcrumbCantiere steps={[{ label: 'Privacy Policy' }]} />
        <h1 className="heading-section mb-3">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Informativa ai sensi degli Artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR).
        </p>

        <div className="prose prose-neutral max-w-none">
          <h2>1. Titolare del trattamento</h2>
          <p>
            <strong>{siteConfig.companyName}</strong> ({siteConfig.companyPiva}) gestisce il sito{' '}
            <strong>{siteConfig.domain}</strong>. DPO contattabile a{' '}
            <a href={`mailto:${siteConfig.dpoEmail}`}>{siteConfig.dpoEmail}</a>.
          </p>

          <h2>2. Categorie di dati trattati</h2>
          <ul>
            <li>
              <strong>Dati cantieri da fonti pubbliche</strong>: protocolli, indirizzi, importi, descrizioni provenienti da
              albi pretori comunali e open data PA. Vedi la pagina{' '}
              <Link href="/come-trattiamo-i-dati">Come trattiamo i dati</Link> per dettagli.
            </li>
            <li>
              <strong>Dati di navigazione</strong>: IP anonimizzato, browser, pagine visitate (solo con consenso analitico).
            </li>
            <li><strong>Dati di contatto</strong>: email forniti volontariamente per richieste opt-out / DPO.</li>
          </ul>

          <h2>3. Finalità e base giuridica</h2>
          <ul>
            <li>
              Pubblicazione dati cantieri ai fini di trasparenza pubblica e libertà di informazione: <strong>Art. 6.1.f
              GDPR</strong> (legittimo interesse).
            </li>
            <li>
              Analisi anonima del traffico per migliorare il servizio: <strong>Art. 6.1.a GDPR</strong> (consenso).
            </li>
            <li>
              Gestione richieste GDPR e contatti DPO: <strong>Art. 6.1.c GDPR</strong> (obbligo legale).
            </li>
          </ul>

          <h2>4. Periodo di conservazione</h2>
          <ul>
            <li>Dati cantieri: per il periodo di rilevanza pubblicistica (10 anni dal rilascio del titolo).</li>
            <li>Dati di navigazione (Google Analytics): 26 mesi.</li>
            <li>Email contatti DPO: 5 anni dalla chiusura del caso.</li>
          </ul>

          <h2>5. Destinatari</h2>
          <ul>
            <li>Supabase Inc. (USA) — hosting database, con Standard Contractual Clauses.</li>
            <li>Google LLC — Google Analytics (solo con consenso), IP anonimizzato.</li>
            <li>Railway Inc. (USA) — hosting applicativo.</li>
          </ul>

          <h2>6. Diritti dell&apos;interessato</h2>
          <p>
            Hai diritto ad accedere (Art. 15), rettificare (Art. 16), cancellare (Art. 17), limitare (Art. 18), portare
            (Art. 20) e opporti (Art. 21) al trattamento. Vedi la <Link href="/come-trattiamo-i-dati#opt-out">procedura
            opt-out</Link>.
          </p>

          <h2>7. Reclamo al Garante</h2>
          <p>
            Puoi proporre reclamo al Garante per la Protezione dei Dati Personali (Piazza Venezia 11, Roma —{' '}
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">www.garanteprivacy.it</a>).
          </p>

          <p className="text-sm text-muted-foreground border-t border-border pt-4 mt-8">
            <strong>Ultimo aggiornamento:</strong> {new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </section>
  );
}
