import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  localBusinessSchema,
  organisationSchema,
  websiteSchema,
} from '@/lib/seo/jsonld';
import './globals.css';

export const metadata: Metadata = {
  // Canonical host is www — apex redirects to www at the edge. Pin
  // metadataBase here so every page's relative canonical resolves to
  // the www host instead of the apex (and so Next.js stops emitting
  // the missing-metadataBase warning at build time).
  metadataBase: new URL('https://www.enviroaqua.com.au'),
  title: {
    default: "Enviro Aqua — Australia's water filtration specialist",
    template: '%s | Enviro Aqua',
  },
  description:
    'Wholesale prices on water filters, cartridges, and filtration systems for every Australian home, trade, and business. One price for everyone.',
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

  return (
    <html lang="en-AU">
      <body className="flex flex-col min-h-screen">
        {isAdminRoute ? (
          children
        ) : (
          <>
            <JsonLdScript
              data={[
                organisationSchema(),
                localBusinessSchema(),
                websiteSchema(),
              ]}
            />
            <CartProvider>
              <PromoBanner />
              <Header />
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
