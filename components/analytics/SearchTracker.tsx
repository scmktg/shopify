'use client';

import { useEffect } from 'react';
import { trackSearch } from '@/lib/analytics/client';

export function SearchTracker({ query }: { query: string }) {
  useEffect(() => {
    const track = () => { if (query.trim().length >= 2) trackSearch(query); };
    track();
    window.addEventListener('enviroaqua:analytics-consent-changed', track);
    return () => window.removeEventListener('enviroaqua:analytics-consent-changed', track);
  }, [query]);
  return null;
}

