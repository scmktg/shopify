/**
 * Returns the canonical site URL with no trailing slash.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set explicitly per environment in Vercel.
 *  2. VERCEL_URL — auto-injected on preview / production builds.
 *  3. www.enviroaqua.com.au — production hostname as a final fallback.
 *
 * The canonical host is `www` (apex 308s to www at the edge — see Fix 1
 * in needs-review.txt). Every canonical, sitemap entry, JSON-LD URL and
 * Open Graph link must resolve to the www host so Google sees a single
 * consistent origin.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;
  return 'https://www.enviroaqua.com.au';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}
