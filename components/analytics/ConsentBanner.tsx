'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalyticsConsent, setAnalyticsConsent } from '@/lib/analytics/client';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(getAnalyticsConsent() === null);
    const open = () => setVisible(true);
    window.addEventListener('enviroaqua:open-cookie-preferences', open);
    return () => window.removeEventListener('enviroaqua:open-cookie-preferences', open);
  }, []);

  const choose = (allowed: boolean) => {
    setAnalyticsConsent(allowed);
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <aside role="dialog" aria-label="Analytics preferences"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-gray-300 bg-white p-4 shadow-2xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-black">
          We use optional Google analytics and advertising measurement to improve our store.
          You can accept or reject optional tracking and change your choice later.
          {' '}<Link href="/privacy" className="underline">Privacy policy</Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-black">
            Reject optional
          </button>
          <button type="button" onClick={() => choose(true)}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
            Accept optional tracking
          </button>
        </div>
      </div>
    </aside>
  );
}

export function CookiePreferencesButton() {
  return (
    <button type="button" className="hover:underline underline-offset-4"
      onClick={() => window.dispatchEvent(
        new Event('enviroaqua:open-cookie-preferences')
      )}>
      Cookie preferences
    </button>
  );
}

