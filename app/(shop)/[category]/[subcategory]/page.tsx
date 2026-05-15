import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import {
  getCategoryEditorial,
  getCategoryIntro,
  getSubcategoryMetaDescription,
} from '@/content/category-intros';
import { markdownToPlainText } from '@/lib/products/markdown';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import { CategoryEditorial } from '@/components/category/CategoryEditorial';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
} from '@/lib/seo/jsonld';

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

const PAGE_SIZE = 24;

/**
 * SEO-oriented title overrides for priority subcategory pages
 * (docs/04-seo-strategy.md). Adds a head-term modifier that ranks
 * better than the bare `${sub} | ${cat}` template; other subs fall
 * back to the default.
 */
const SUBCATEGORY_TITLE_OVERRIDES: Readonly<Record<string, string>> = {
  'water-filters/whole-house':
    'Whole House Water Filters | Big Blue, WaterMark Certified',
  'water-filters/under-sink':
    'Under Sink Water Filters | DIY or Plumber Install',
  'water-filters/reverse-osmosis':
    'Reverse Osmosis Systems | Fluoride & PFAS Removal',
};

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const node = findSubcategory(category, subcategory);
  if (!node) return {};
  const description =
    getSubcategoryMetaDescription(category, subcategory) ??
    `${node.subcategory.label} in our ${node.category.label.toLowerCase()} range — wholesale prices, tiered shipping Australia-wide from $9.95.`;
  const override = SUBCATEGORY_TITLE_OVERRIDES[`${category}/${subcategory}`];
  return {
    title: override ?? `${node.subcategory.label} | ${node.category.label}`,
    description,
    alternates: {
      canonical: `/${category}/${subcategory}`,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const node = findSubcategory(category, subcategory);
  if (!node) notFound();

  const query = `tag:'primary-cat:${category}' AND tag:'sub-cat:${subcategory}'`;
  const page = await getProducts({ query, first: PAGE_SIZE });

  const pathname = `/${category}/${subcategory}`;
  const title = `${node.subcategory.label} ${node.category.label}`;
  const intro = getCategoryIntro(`${category}/${subcategory}`);
  const editorial = getCategoryEditorial(`${category}/${subcategory}`);
  // Schema description is plain text — strip any markdown links or
  // emphasis from the intro before feeding the JSON-LD field.
  const schemaDescription = intro ? await markdownToPlainText(intro) : null;

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(title, pathname, schemaDescription),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.category.label, path: `/${category}` },
            { name: node.subcategory.label, path: pathname },
          ]),
        ]}
      />
      <CategoryHero
        title={title}
        intro={intro}
        categorySlug={node.category.slug}
        subcategories={node.category.subcategories}
        activeSubSlug={node.subcategory.slug}
      />
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
      {editorial && <CategoryEditorial sections={editorial} />}
    </>
  );
}
