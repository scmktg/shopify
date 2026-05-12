import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/siteUrl';

// This file generates the production robots.txt. Staging environments are
// expected to be blocked at the deployment layer (Vercel password
// protection / X-Robots-Tag header), NOT here — emitting a blanket
// `Disallow: /` from this route would block production after the next
// deploy. If staging-blocking is ever moved into application code, do it
// behind an env check, not unconditionally.
//
// The faceted-filter disallows below come from migration-checklist.md
// section 3c. They protect crawl budget against the WooCommerce-style
// `?filter_*`, `?orderby=`, etc. parameter combinations we inherited.
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/cart',
        '/api/',
        '/*?filter_',
        '/*?orderby=',
        '/*?per_page=',
        '/*?shop_view=',
        '/*?add-to-cart=',
        '/*?per_row=',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
