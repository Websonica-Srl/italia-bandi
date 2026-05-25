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
            <strong>{siteConfig.companyName}</strong> ({siteConfig.companyPiva}, REA BR-167176, Brindisi) è titolare
            unico del trattamento per tutto il network ItaliaProgettisti, di cui <strong>{siteConfig.domain}</strong> fa
            parte. La presente è la <strong>privacy unica di rete</strong>: il registro dei consensi è centralizzato
            sull&apos;HUB. DPO/contatto privacy:{' '}
            <a href={`mailto:${siteConfig.dpoEmail}`}>{siteConfig.dpoEmail}</a>.
          </p>

          <h2>2. Categorie di dati trattati</h2>
          <ul>
            <li>
              <strong>Dati di gara da fonti pubbliche</strong>: oggetto, stazione appaltante, importi, scadenze, CIG/CUP,
              CPV, procedura e ragioni sociali degli aggiudicatari (persone giuridiche), provenienti da TED e ANAC.
              Vedi la pagina <Link href="/come-trattiamo-i-dati">Come trattiamo i dati</Link>.
            </li>
            <li>
              <strong>Dati di navigazione</strong>: IP anonimizzato, browser, pagine visitate (solo con consenso analitico).
            </li>
            <li><strong>Dati di contatto</strong>: email forniti volontariamente per richieste opt-out / privacy.</li>
          </ul>

          <h2>3. Finalità e base giuridica</h2>
          <ul>
            <li>
              I dati delle <strong>imprese aggiudicatarie (persone giuridiche)</strong> sono fuori dall&apos;ambito di
              applicazione del GDPR (Considerando 14).
            </li>
            <li>
              Eventuali dati di <strong>persone fisiche</strong> presenti nelle fonti sono trattati ai fini di
              informazione e trasparenza del mercato degli appalti: <strong>Art. 6, par. 1, lett. f) GDPR</strong> (legittimo
              interesse), con informativa ex <strong>Art. 14 GDPR</strong> (dati raccolti da terzi).
            </li>
            <li>
              Analisi anonima del traffico per migliorare il servizio: <strong>Art. 6, par. 1, lett. a) GDPR</strong> (consenso).
            </li>
            <li>
              Gestione richieste e contatti privacy: <strong>Art. 6.1.c GDPR</strong> (obbligo legale).
            </li>
          </ul>

          <h2>4. Periodo di conservazione</h2>
          <ul>
            <li>Dati di gara e imprese aggiudicatarie (PG): archivio storico, per la rilevanza informativa del dato pubblico.</li>
            <li>Eventuali dati di persone fisiche: minimizzati e conservati per un massimo di 24-36 mesi, poi de-indicizzati o anonimizzati.</li>
            <li>Dati di navigazione (Google Analytics): 26 mesi.</li>
            <li>Email contatti privacy: 5 anni dalla chiusura del caso.</li>
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
