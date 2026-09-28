'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics/client';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-BPEY3T2B9Q';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA4_ID) return;
    const url = window.location.href;
    trackPageView(url, document.title);
  }, [pathname]);

  if (!GA4_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="enviroaqua-google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('set', 'linker', {
            domains: ['www.enviroaqua.com.au', 'enviroaqua.com.au', 'checkout.enviroaqua.com.au'],
            accept_incoming: true
          });
          gtag('config', '${GA4_ID}', {
            send_page_view: false,
            transport_type: 'beacon'
          });
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
        `}
      </Script>
    </>
  );
}
