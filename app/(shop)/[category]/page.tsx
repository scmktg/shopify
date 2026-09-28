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
import {
  buildCatalogQuery,
  getCatalogFilterGroups,
  hasCatalogFilters,
  parseCatalogFilterState,
} from '@/lib/catalog/filters';

type CategorySearchParams = Record<string, string | string[] | undefined>;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams?: Promise<CategorySearchParams>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const paramsValue = (await searchParams) ?? {};
  const after = paramsValue.after;
  const node = findCategory(category);
  if (!node) return {};

  const groups = getCatalogFilterGroups(category);
  const filters = parseCatalogFilterState(paramsValue, groups);
  const shouldNoIndex = Boolean(after) || hasCatalogFilters(filters);

  return {
    title: `${node.label} | Wholesale Prices`,
    description: `Shop ${node.label.toLowerCase()} at wholesale prices. Australia-wide delivery, free delivery on selected products, and free Click & Collect from Wyong NSW. WaterMark certified options available.`,
    alternates: {
      canonical: `/${node.slug}`,
    },
    ...(shouldNoIndex
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
  const paramsValue = (await searchParams) ?? {};
  const afterParam = paramsValue.after;
  const after =
    typeof afterParam === 'string' && afterParam.length <= 500
      ? afterParam
      : null;
  const node = findCategory(category);
  if (!node) notFound();

  const baseQuery = `tag:'primary-cat:${category}'`;
  const filterGroups = getCatalogFilterGroups(category);
  const initialFilters = parseCatalogFilterState(paramsValue, filterGroups);
  const query = buildCatalogQuery(baseQuery, filterGroups, initialFilters);

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
            page.products.map((product) => ({
              name: product.title,
              path: getProductUrl(product.handle),
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
        query={baseQuery}
        categorySlug={category}
        initialFilters={initialFilters}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
      {page.pageInfo.hasNextPage &&
        page.pageInfo.endCursor &&
        !hasCatalogFilters(initialFilters) && (
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
