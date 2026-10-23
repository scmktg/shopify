import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import {
  localBusinessSchema,
  organisationSchema,
  websiteSchema,
} from '@/lib/seo/jsonld';
import './globals.css';

export const metadata: Metadata = {
  // Canonical host is www - apex redirects to www at the edge. Pin
  // metadataBase here so every page's relative canonical resolves to
  // the www host instead of the apex (and so Next.js stops emitting
  // the missing-metadataBase warning at build time).
  metadataBase: new URL('https://www.enviroaqua.com.au'),
  title: {
    default: "Enviro Aqua - Australia's water filtration specialist",
    template: '%s | Enviro Aqua',
  },
  description:
    'Wholesale prices on water filters, cartridges, and filtration systems for every Australian home, trade, and business. One price for everyone.',
  verification: {
    other: {
      'msvalidate.01': '6370CA947FCCBE20FF859D700690C9FC',
    },
  },
  icons: {
    icon: [{ url: '/favicon.jpeg', type: 'image/jpeg' }],
    shortcut: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Admin pages (/admin/*) render their own chrome and must not carry
  // the storefront header, promo banner, footer or cart drawer.
  // Middleware writes the current pathname to `x-pathname` so we can
  // make that decision server-side without leaking client routing.
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isAdminRoute = pathname.startsWith('/admin');
  const consentRegion = (await headers()).get('x-ea-region') === 'au' ? 'au' : 'consent-required';

  return (
    <html lang="en-AU" data-ea-region={consentRegion}>
      <body className="flex flex-col min-h-screen">
        {isAdminRoute ? (
          children
        ) : (
          <>
            <Script
              src="https://static.zip.co/lib/js/zm-widget-js/dist/zip-widget.min.js"
              strategy="beforeInteractive"
            />
            <Script id="enviroaqua-consent-bootstrap" strategy="beforeInteractive">
              {"window.dataLayer = window.dataLayer || [];" +
               "window.gtag = function(){ window.dataLayer.push(arguments); };" +
               "var choice=null;try{choice=localStorage.getItem('enviroaqua:analytics-consent')}catch(e){};" +
               "var allowed=choice==='granted'||(choice!=='denied'&&document.documentElement.dataset.eaRegion==='au');" +
               "gtag('consent','default',{analytics_storage:allowed?'granted':'denied',ad_storage:allowed?'granted':'denied',ad_user_data:allowed?'granted':'denied',ad_personalization:allowed?'granted':'denied',wait_for_update:500});"}
            </Script>
            <GoogleAnalytics />
            <ConsentBanner />
            <JsonLdScript
              data={[
                organisationSchema(),
                localBusinessSchema(),
                websiteSchema(),
              ]}
            />
            <CartProvider>
              <div className="sticky top-0 z-40">
                <PromoBanner />
                <Header />
              </div>
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </>
        )}
      </body>
    </html>
  );
}
