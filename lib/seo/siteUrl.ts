/**
 * Returns the canonical site URL with no trailing slash.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — set explicitly per environment in Vercel.
 *  2. VERCEL_URL — auto-injected on preview / production builds.
 *  3. enviroaqua.com.au — production hostname as a final fallback.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;
  return 'https://enviroaqua.com.au';
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}
