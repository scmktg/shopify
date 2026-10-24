import type { ReactNode } from 'react';
import Script from 'next/script';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { ConsentBanner } from '@/components/analytics/ConsentBanner';
import { localBusinessSchema, organisationSchema, websiteSchema } from '@/lib/seo/jsonld';
export default function StorefrontLayout({ children }: { children: ReactNode }) {
 return (<>
            <Script
              src="https://static.zip.co/lib/js/zm-widget-js/dist/zip-widget.min.js"
              strategy="afterInteractive"
            />
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
 </>);
}
