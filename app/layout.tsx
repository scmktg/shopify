import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PromoBanner } from '@/components/layout/PromoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { localBusinessSchema, websiteSchema } from '@/lib/seo/jsonld';
import './globals.css';

export const metadata: Metadata = {
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en-AU">
      <body className="flex flex-col min-h-screen">
        <JsonLdScript data={[localBusinessSchema(), websiteSchema()]} />
        <CartProvider>
          <PromoBanner />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
