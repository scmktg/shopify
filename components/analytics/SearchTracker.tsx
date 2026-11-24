'use client';

import { useEffect } from 'react';
import { trackSearch } from '@/lib/analytics/client';

export function SearchTracker({ query, resultsCount }: { query: string; resultsCount?: number }) {
  useEffect(() => {
    const track = () => { if (query.trim().length >= 2) trackSearch(query, resultsCount); };
    track();
    window.addEventListener('enviroaqua:analytics-consent-changed', track);
    return () => window.removeEventListener('enviroaqua:analytics-consent-changed', track);
  }, [query, resultsCount]);
  return null;
}

