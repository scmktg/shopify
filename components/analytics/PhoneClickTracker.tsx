'use client';

import { useEffect } from 'react';
import { trackPhoneClick } from '@/lib/analytics/client';

/**
 * One delegated listener covers every current and future <a href="tel:...">
 * without changing the phone links or disrupting native phone dialling.
 */
export function PhoneClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href^="tel:"]');
      if (!link) return;

      const pagePath = window.location.pathname;
      const location = link.closest('footer')
        ? 'footer'
        : pagePath.startsWith('/contact')
          ? 'contact'
          : pagePath.startsWith('/products/')
            ? 'product'
            : 'other';

      trackPhoneClick(location, pagePath);
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
