"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("cookie_consent");
  if (!consent) return false;
  try {
    const parsed = JSON.parse(consent);
    return parsed.marketing === true;
  } catch {
    return false;
  }
}

interface MetaPixelProps {
  pixelId: string | null;
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(hasMarketingConsent());

    const handleChange = () => setHasConsent(hasMarketingConsent());
    window.addEventListener("storage", handleChange);
    window.addEventListener("cookieConsentUpdate", handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener("cookieConsentUpdate", handleChange);
    };
  }, []);

  if (!hasConsent || !pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
