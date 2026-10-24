import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
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
  icons: {
    icon: [{ url: '/favicon.jpeg', type: 'image/jpeg' }],
    shortcut: '/favicon.jpeg',
    apple: '/favicon.jpeg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
 return (<html lang="en-AU"><head><meta name="msvalidate.01" content="6370CA947FCCBE20FF859D700690C9FC" /></head><body className="flex flex-col min-h-screen">
 <Script id="enviroaqua-consent-bootstrap" strategy="beforeInteractive">
 {"window.dataLayer = window.dataLayer || [];" +
 "window.gtag = function(){window.dataLayer.push(arguments);};" +
 "var choice=null;try{choice=localStorage.getItem('enviroaqua:analytics-consent')}catch(e){};" +
 "var region='consent-required';try{var m=document.cookie.match(/(?:^|; )ea_region=([^;]*)/);if(m)region=decodeURIComponent(m[1]);}catch(e){};" +
 "var allowed=choice==='granted'||(choice!=='denied'&&region==='au');" +
 "gtag('consent','default',{analytics_storage:allowed?'granted':'denied',ad_storage:allowed?'granted':'denied',ad_user_data:allowed?'granted':'denied',ad_personalization:allowed?'granted':'denied',wait_for_update:500});"}
 </Script>{children}</body></html>);
}
