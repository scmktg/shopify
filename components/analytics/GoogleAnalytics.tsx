'use client';

import Script from 'next/script';
import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { flushPendingAnalytics, getAnalyticsConsent, trackPageView } from '@/lib/analytics/client';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-BPEY3T2B9Q';
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    if (!GA4_ID) return;
    const track = () => {
      if (getAnalyticsConsent() === 'granted') {
        trackPageView(window.location.href, document.title);
      }
    };
    track();
    const onReady = () => {
      flushPendingAnalytics();
      track();
    };
    window.addEventListener('enviroaqua:analytics-consent-changed', track);
    window.addEventListener('enviroaqua:analytics-ready', onReady);
    return () => {
      window.removeEventListener('enviroaqua:analytics-consent-changed', track);
      window.removeEventListener('enviroaqua:analytics-ready', onReady);
    };
  }, [pathname, query]);

  return null;
}

export function GoogleAnalytics() {
  if (!GA4_ID) return null;
  return (
    <>
      <Script
        src={'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID}
        strategy="afterInteractive"
        onReady={flushPendingAnalytics}
      />
      <Script id="enviroaqua-google-analytics" strategy="afterInteractive">
        {"gtag('js', new Date());" +
         "gtag('set', 'linker', { domains: ['www.enviroaqua.com.au','enviroaqua.com.au','checkout.enviroaqua.com.au'], accept_incoming: true });" +
         "gtag('config', " + JSON.stringify(GA4_ID) + ", { send_page_view: false, transport_type: 'beacon' });" +
         (GOOGLE_ADS_ID ? "gtag('config', " + JSON.stringify(GOOGLE_ADS_ID) + ");" : "") +
         "window.__eaAnalyticsConfigured = true; window.dispatchEvent(new Event('enviroaqua:analytics-ready'));"}
      </Script>
      <Suspense fallback={null}><PageViewTracker /></Suspense>
    </>
  );
}

