import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/cart',
        '/cart/',
        '/checkout/',
        '/account/',
        '/search',
        '/dev/',
        '/*?*',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
