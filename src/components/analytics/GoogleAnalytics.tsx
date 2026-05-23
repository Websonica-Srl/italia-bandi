"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("cookie_consent");
  if (!consent) return false;
  try {
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

export function trackPageView(url: string, gaId: string) {
  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag("config", gaId, { page_path: url });
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (hasAnalyticsConsent() && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

export const AnalyticsEvents = {
  SEARCH: (term: string) => trackEvent("search", "engagement", term),
  VIEW_PROFILE: (type: string, name: string) => trackEvent("view_item", "directory", `${type}: ${name}`),
  CONTACT_PROFILE: (type: string, name: string) => trackEvent("generate_lead", "directory", `${type}: ${name}`),
  VIEW_PROJECT: (name: string) => trackEvent("view_item", "projects", name),
  VIEW_ARTICLE: (title: string) => trackEvent("view_item", "magazine", title),
  CLICK_CTA: (cta: string) => trackEvent("click", "cta", cta),
};

interface GoogleAnalyticsProps {
  gaId: string | null;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasAnalyticsConsent());

    const handleStorageChange = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cookieConsentUpdate", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cookieConsentUpdate", handleStorageChange);
    };
  }, []);

  if (!hasConsent || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
