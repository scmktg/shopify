/**
 * Canonical production hostname for this site.
 *
 * Hardcoded — do NOT read from VERCEL_URL or NEXT_PUBLIC_SITE_URL. Every
 * deployment (production, preview, local) must emit the same canonical
 * hostname in sitemaps, robots.txt, JSON-LD, llms.txt and metadataBase, so
 * that Google never indexes a *.vercel.app preview URL.
 */
const CANONICAL_SITE_URL = 'https://www.enviroaqua.com.au';

export function getSiteUrl(): string {
  return CANONICAL_SITE_URL;
}

export function absoluteUrl(path: string): string {
  if (!path.startsWith('/')) return `${CANONICAL_SITE_URL}/${path}`;
  return `${CANONICAL_SITE_URL}${path}`;
}
