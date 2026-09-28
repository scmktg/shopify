import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import {
  getCategoryIntro,
  getSubcategoryMetaDescription,
} from '@/content/category-intros';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import { WaterFilterStageGuide } from '@/components/category/WaterFilterStageGuide';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
  productListSchema,
} from '@/lib/seo/jsonld';
import { getProductUrl } from '@/lib/utils/productUrl';

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams?: Promise<{ after?: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const after = (await searchParams)?.after;
  const node = findSubcategory(category, subcategory);
  if (!node) return {};
  const description =
    getSubcategoryMetaDescription(category, subcategory) ??
    `${node.subcategory.label} in our ${node.category.label.toLowerCase()} range - wholesale prices, Australia-wide delivery, and free Click & Collect from Wyong NSW.`;
  return {
    title: `${node.subcategory.label} | ${node.category.label}`,
    description,
    alternates: {
      canonical: `/${category}/${subcategory}`,
    },
    ...(after
      ? {
          robots: {
            index: false,
            follow: true,
          },
        }
      : {}),
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const afterParam = (await searchParams)?.after;
  const after =
    typeof afterParam === 'string' && afterParam.length <= 500
      ? afterParam
      : null;
  const node = findSubcategory(category, subcategory);
  if (!node) notFound();

  const query = `tag:'primary-cat:${category}' AND tag:'sub-cat:${subcategory}'`;
  const page = await getProducts({ query, first: PAGE_SIZE, after });

  const pathname = `/${category}/${subcategory}`;
  const title = `${node.subcategory.label} ${node.category.label}`;
  const intro = getCategoryIntro(`${category}/${subcategory}`);

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(title, pathname, intro),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.category.label, path: `/${category}` },
            { name: node.subcategory.label, path: pathname },
          ]),
          productListSchema(
            page.products.map((p) => ({
              name: p.title,
              path: getProductUrl(p.handle),
            })),
          ),
        ]}
      />
      <CategoryHero
        title={title}
        intro={intro}
        categorySlug={node.category.slug}
        subcategories={node.category.subcategories}
        activeSubSlug={node.subcategory.slug}
      />
      {category === 'water-filters' &&
        (subcategory === 'under-sink' || subcategory === 'reverse-osmosis') && (
          <WaterFilterStageGuide subcategory={subcategory} />
        )}
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
      {page.pageInfo.hasNextPage && page.pageInfo.endCursor && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-center">
          <Link
            href={`${pathname}?after=${encodeURIComponent(page.pageInfo.endCursor)}`}
            rel="next"
            className="text-sm font-medium text-brand-blue hover:underline underline-offset-4"
          >
            Next catalogue page
          </Link>
        </div>
      )}
    </>
  );
}
