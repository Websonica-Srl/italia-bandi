"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  policy_version?: string;
}

const POLICY_VERSION = "2026-05-22";
const CONSENT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 182;
const CONSENT_ENDPOINT = "https://www.italiaprogettisti.com/api/consent";

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: "",
};

interface CookieBannerProps {
  gaId?: string | null;
}

export default function CookieBanner({ gaId }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);

  useEffect(() => {
    const savedConsent = localStorage.getItem("cookie_consent");
    let valid = false;
    if (savedConsent) {
      try {
        const c = JSON.parse(savedConsent) as CookieConsent;
        const ageMs = c.timestamp ? Date.now() - new Date(c.timestamp).getTime() : Infinity;
        valid = c.policy_version === POLICY_VERSION && ageMs < CONSENT_MAX_AGE_MS;
      } catch {
        valid = false;
      }
    }
    if (!valid) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: new Date().toISOString(),
      policy_version: POLICY_VERSION,
    };
    localStorage.setItem("cookie_consent", JSON.stringify(consentWithTimestamp));
    setIsVisible(false);
    try {
      fetch(CONSENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cookie",
          choices: { analytics: newConsent.analytics, marketing: newConsent.marketing },
          policy_version: POLICY_VERSION,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* noop */
    }
    window.dispatchEvent(new Event("cookieConsentUpdate"));

    if (!newConsent.analytics) {
      document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      if (gaId) {
        document.cookie = `_ga_${gaId.replace('G-', '')}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      document.cookie = "_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "_gat=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  };

  const acceptAll = () => saveConsent({ necessary: true, analytics: true, marketing: true, timestamp: "" });
  const rejectAll = () => saveConsent({ necessary: true, analytics: false, marketing: false, timestamp: "" });
  const savePreferences = () => saveConsent(consent);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Utilizziamo i cookie
                </h3>
                <p className="text-sm text-secondary-text">
                  Questo sito utilizza cookie tecnici necessari per il funzionamento e cookie analitici
                  per migliorare la tua esperienza. Puoi scegliere quali cookie accettare.
                  Per maggiori informazioni, consulta la nostra{" "}
                  <Link href="/legal/cookie" className="text-primary hover:underline">Cookie Policy</Link>
                  {" "}e la{" "}
                  <Link href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
              <button onClick={rejectAll} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" aria-label="Chiudi">
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
              Personalizza preferenze {showDetails ? '▲' : '▼'}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Cookie Necessari</h4>
                    <p className="text-xs text-secondary-text">Essenziali per il funzionamento del sito</p>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Sempre attivi</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Cookie Analitici</h4>
                    <p className="text-xs text-secondary-text">Google Analytics per statistiche anonime</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={consent.analytics} onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Cookie di Marketing</h4>
                    <p className="text-xs text-secondary-text">Per pubblicità personalizzate (attualmente non utilizzati)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={consent.marketing} onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 md:px-6 pb-4 md:pb-6 flex flex-col sm:flex-row gap-3">
            {showDetails ? (
              <>
                <Button variant="outline" className="flex-1" onClick={rejectAll}>Rifiuta tutti</Button>
                <Button variant="outline" className="flex-1" onClick={savePreferences}>Salva preferenze</Button>
                <Button className="flex-1" onClick={acceptAll}>Accetta tutti</Button>
              </>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={rejectAll}>Rifiuta non essenziali</Button>
                <Button className="flex-1" onClick={acceptAll}>Accetta tutti</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  const openSettings = () => {
    localStorage.removeItem("cookie_consent");
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={openSettings}>
      Gestisci Cookie
    </Button>
  );
}
