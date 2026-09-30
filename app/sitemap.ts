import type { MetadataRoute } from 'next';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '@/content/categories';
import { listMarkdownSlugs } from '@/lib/content/markdown';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';
import { getAllProductContent } from '@/lib/products/getProductContent';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/about/our-pricing`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/shipping`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/returns`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/help`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/help/which-filter`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/use`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/water-problems`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/locations`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/showroom`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/reviews`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/whole-house-installation-package`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/watermark-certified`, changeFrequency: 'daily', priority: 0.7 },
  ];

  const editorialSections: ReadonlyArray<{
    section: string;
    priority: number;
  }> = [
    { section: 'use', priority: 0.7 },
    { section: 'water-problems', priority: 0.7 },
    { section: 'locations', priority: 0.6 },
    { section: 'help', priority: 0.5 },
  ];

  const editorialEntries: MetadataRoute.Sitemap = [];
  for (const { section, priority } of editorialSections) {
    const slugs = await listMarkdownSlugs(section);
    for (const slug of slugs) {
      editorialEntries.push({
        url: `${base}/${section}/${slug}`,
        changeFrequency: 'monthly',
        priority,
      });
    }

    // Also walk one level of nested sub-pages (e.g. /use/commercial-and-cafe/schools).
    const sectionDir = path.join(process.cwd(), 'content', section);
    let entries: import('node:fs').Dirent[] = [];
    try {
      entries = await fs.readdir(sectionDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const subDir = path.join(sectionDir, entry.name);
      const subFiles = await fs.readdir(subDir);
      for (const file of subFiles) {
        if (!file.endsWith('.md') || file === 'index.md') continue;
        const subslug = file.replace(/\.md$/, '');
        editorialEntries.push({
          url: `${base}/${section}/${entry.name}/${subslug}`,
          changeFrequency: 'monthly',
          priority: priority - 0.1,
        });
      }
    }
  }

  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.flatMap(
    (category) => [
      {
        url: `${base}/${category.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      ...category.subcategories.map((sub) => ({
        url: `${base}/${category.slug}/${sub.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ],
  );

  // Fetch Shopify's product inventory once, then join it against the same
  // canonical code-side catalogue used by PDP routing and validation.
  //
  // Do not catch this request and return a valid-but-incomplete sitemap. If
  // Shopify is temporarily unavailable, failing this regeneration lets the
  // previous ISR result remain usable rather than telling Google that every
  // product has disappeared.
  const shopifyProducts = await getAllProductHandles();
  const shopifyByHandle = new Map(
    shopifyProducts.map((product) => [product.handle, product] as const),
  );
  const productContent = getAllProductContent();

  const productEntries: MetadataRoute.Sitemap = Object.entries(productContent)
    .map(([handle, content]) => {
      const shopifyProduct = shopifyByHandle.get(handle);
      if (!shopifyProduct) return null;

      const [category, subcategory] = content.categories;
      if (!category || !subcategory) return null;

      return {
        url: `${base}/${category}/${subcategory}/${handle}`,
        lastModified: new Date(shopifyProduct.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.url.localeCompare(b.url));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...editorialEntries,
    ...productEntries,
  ];
}
