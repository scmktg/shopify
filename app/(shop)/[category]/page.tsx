import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findCategory } from '@/content/categories';
import { getCategoryIntro } from '@/content/category-intros';
import { getProducts, type ProductsPage } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
  productListSchema,
} from '@/lib/seo/jsonld';
import { getProductUrl } from '@/lib/utils/productUrl';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ after?: string }>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const after = (await searchParams)?.after;
  const node = findCategory(category);
  if (!node) return {};
  return {
    title: `${node.label} | Wholesale Prices`,
    description: `Shop ${node.label.toLowerCase()} at wholesale prices. Australia-wide delivery, free delivery on selected products, and free Click & Collect from Wyong NSW. WaterMark certified options available.`,
    alternates: {
      canonical: `/${node.slug}`,
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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const afterParam = (await searchParams)?.after;
  const after =
    typeof afterParam === 'string' && afterParam.length <= 500
      ? afterParam
      : null;
  const node = findCategory(category);
  if (!node) notFound();

  const query = `tag:'primary-cat:${category}'`;
  let loadFailed = false;
  let page: ProductsPage;
  try {
    page = await getProducts({ query, first: PAGE_SIZE, after });
  } catch (error) {
    loadFailed = true;
    console.error('[category] Failed to load category products', {
      category,
      error,
    });
    page = {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }

  const intro = getCategoryIntro(category);

  const pathname = `/${node.slug}`;

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(node.label, pathname, intro),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.label, path: pathname },
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
        title={node.label}
        intro={intro}
        categorySlug={node.slug}
        subcategories={node.subcategories}
      />
      {loadFailed && (
        <div
          role="status"
          className="mx-auto mt-6 max-w-7xl rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-black"
        >
          Products are temporarily unavailable. Please refresh the page to try again.
        </div>
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
