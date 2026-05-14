import type { MetadataRoute } from 'next';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '@/content/categories';
import { listMarkdownSlugs } from '@/lib/content/markdown';
import { getAllProductHandles } from '@/lib/shopify/queries/getAllProductHandles';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductCategories } from '@/lib/utils/productUrl';
import { getSiteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 3600;

// Per the SEO audit (2026-05): every sitemap URL is slashless and uses
// the www host (getSiteUrl handles host); editorial pages report their
// markdown file's mtime as <lastmod> so Google sees real update dates
// instead of a uniform build timestamp.
async function markdownMtime(
  section: string,
  ...rest: string[]
): Promise<Date> {
  const file = path.join(process.cwd(), 'content', section, ...rest);
  try {
    const stats = await fs.stat(file);
    return stats.mtime;
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/about/our-pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/shipping`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/help`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/help/which-filter`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/use`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/water-problems`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/locations`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/showroom`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/reviews`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/whole-house-installation-package`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/watermark-certified`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${base}/commercial-water-bubblers`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/water-bubblers-for-gyms`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
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
        lastModified: await markdownMtime(section, `${slug}.md`),
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
          lastModified: await markdownMtime(section, entry.name, file),
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
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      ...category.subcategories.map((sub) => ({
        url: `${base}/${category.slug}/${sub.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.7,
      })),
    ],
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const handles = await getAllProductHandles();
    const resolved = await Promise.all(
      handles.map(async (entry) => {
        try {
          const product = await getProductByHandle(entry.handle);
          if (!product) return null;
          const { category, subcategory } = getProductCategories(entry.handle);
          if (!category || !subcategory) return null;
          return {
            url: `${base}/${category}/${subcategory}/${entry.handle}`,
            lastModified: new Date(entry.updatedAt),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          };
        } catch {
          return null;
        }
      }),
    );
    productEntries = resolved.filter(
      (entry): entry is NonNullable<typeof entry> => entry !== null,
    );
  } catch (caught) {
    // The full sitemap is useless without products — log loudly so build
    // logs flag the regression instead of silently shipping an empty
    // product list.
    console.error('[sitemap] product fetch failed:', caught);
  }

  const all: MetadataRoute.Sitemap = [
    ...staticEntries,
    ...categoryEntries,
    ...editorialEntries,
    ...productEntries,
  ];

  // De-dupe by URL (defensive — guards against an accidental duplicate
  // entry across the static / category / editorial lists) and sort so
  // diffs between deploys stay stable.
  const seen = new Set<string>();
  const unique: MetadataRoute.Sitemap = [];
  for (const entry of all) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    unique.push(entry);
  }
  unique.sort((a, b) => a.url.localeCompare(b.url));
  return unique;
}
