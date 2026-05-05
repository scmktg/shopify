import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: "Enviro Aqua — Australia's water filtration specialist",
  description:
    'Wholesale prices on water filters, cartridges, and filtration systems. One price for everyone — homeowners, tradies, commercial.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en-AU">
      <body>{children}</body>
    </html>
  );
}
