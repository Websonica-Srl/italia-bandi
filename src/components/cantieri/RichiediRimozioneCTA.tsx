import { siteConfig } from '@/lib/site-config';
import { ShieldAlert, Mail } from 'lucide-react';

interface Props {
  cantiereId?: string;
  protocollo?: string;
  comune?: string;
}

export default function RichiediRimozioneCTA({ cantiereId, protocollo, comune }: Props) {
  const subject = encodeURIComponent(`Richiesta opt-out / rimozione GDPR - Cantiere ${protocollo || cantiereId}`);
  const body = encodeURIComponent(
    `Salve,

richiedo la rimozione dei miei dati personali dalla scheda cantiere:
- ID: ${cantiereId || ''}
- Protocollo: ${protocollo || ''}
- Comune: ${comune || ''}
- URL: ${typeof window !== 'undefined' ? window.location.href : ''}

Indicare di seguito il diritto esercitato (Art. 15-22 GDPR) e allegare documento d'identità:

Grazie.`,
  );

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-1.5">Sono titolare di questo cantiere</h3>
          <p className="text-sm text-amber-900/80 leading-relaxed mb-4">
            Questi dati provengono da <strong>fonti pubbliche</strong> (albo pretorio / open data della Pubblica
            Amministrazione), trattati nel rispetto del GDPR (base giuridica Art. 6.1.f). Se sei il titolare puoi
            richiedere in qualsiasi momento la <strong>rimozione, la rettifica o l'opposizione</strong> (Art. 15-22 e 21 GDPR).
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${siteConfig.dpoEmail}?subject=${subject}&body=${body}`}
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-amber-900 text-amber-50 px-6 py-2.5 text-sm font-medium hover:bg-amber-900/90 transition-colors"
            >
              <Mail className="h-4 w-4" /> Richiedi opt-out / rimozione
            </a>
            <a href="/legal/privacy#opposizione" className="text-xs text-amber-900/70 underline underline-offset-2 hover:text-amber-900">
              Informativa privacy e diritti
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
