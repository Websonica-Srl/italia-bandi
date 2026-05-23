import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import MetaPixel from '@/components/analytics/MetaPixel';
import CookieBanner from '@/components/analytics/CookieBanner';
import { siteConfig } from '@/lib/site-config';
import { safeJsonLd, organizationLd, websiteLd } from '@/lib/seo/structured-data';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.defaultTitle,
    template: `%s | ${siteConfig.seo.titleSuffix}`,
  },
  description: siteConfig.seo.defaultDescription,
  metadataBase: new URL(siteConfig.baseUrl),
  keywords: siteConfig.seo.keywords,
  openGraph: {
    siteName: siteConfig.name,
    type: 'website',
    locale: 'it_IT',
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    url: siteConfig.baseUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
  },
  ...(siteConfig.tracking.searchConsoleId
    ? { verification: { google: siteConfig.tracking.searchConsoleId } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteLd()) }}
        />
      </head>
      <body>
        {/* Skip link per accessibilità keyboard */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-foreground focus:text-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Salta al contenuto principale
        </a>
        <GoogleAnalytics gaId={siteConfig.tracking.gaId} />
        <MetaPixel pixelId={siteConfig.tracking.metaPixelId} />
        <Header />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
        <CookieBanner gaId={siteConfig.tracking.gaId} />
        <noscript>
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px 16px',
              background: '#111',
              color: '#fff',
              textAlign: 'center',
              fontSize: '13px',
              zIndex: 999,
            }}
          >
            Italia Cantieri funziona meglio con JavaScript attivo. La ricerca avanzata richiede JS, ma puoi
            comunque consultare cantieri, regioni e bandi.
          </div>
        </noscript>
      </body>
    </html>
  );
}
