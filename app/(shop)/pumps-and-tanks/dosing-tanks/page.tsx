import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import { CATEGORIES } from '@/content/categories';
import {
  buildCatalogQuery,
  getCatalogFilterGroups,
  hasCatalogFilters,
  parseCatalogFilterState,
} from '@/lib/catalog/filters';
import { getProducts, type ProductsPage } from '@/lib/shopify/queries/getProducts';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import {
  breadcrumbSchema,
  collectionSchema,
  productListSchema,
} from '@/lib/seo/jsonld';
import { getProductUrl } from '@/lib/utils/productUrl';

type CategorySearchParams = Record<string, string | string[] | undefined>;

interface DosingCategoryPageProps {
  searchParams?: Promise<CategorySearchParams>;
}

const CATEGORY = 'pumps-and-tanks';
const SUBCATEGORY = 'dosing-tanks';
const PATHNAME = '/pumps-and-tanks/dosing-tanks';
const PAGE_SIZE = 24;
const TITLE = 'Chemical Dosing Tanks & Bunds';
const INTRO =
  'Chemical dosing tanks and secondary-containment bunds for water treatment, chlorine, antiscalant, pH correction and industrial dosing. Choose from square 40L and 60L tanks or round polyethylene tanks from 50L to 500L. Tanks and chemical bunds are sold separately so you can select the right combination for your installation.';
const META_DESCRIPTION =
  'Chemical dosing tanks and bunds from 40L to 500L. Polyethylene tanks and secondary-containment bunds for water-treatment dosing.';
const DEFAULT_PRODUCT_ORDER = [
  '40l-chemical-dosing-tank',
  'chemical-dosing-tank-bunded-50l',
  '60l-chemical-dosing-tank',
  'chemical-dosing-tank-bunded-100l',
  'chemical-dosing-tank-bunded-200l',
  'chemical-dosing-tank-300l',
  'chemical-dosing-tank-500l',
  'chemical-bund-50l',
  'chemical-bund-100l',
  'chemical-bund-200l',
  'chemical-bund-400l',
] as const;

const pumpsAndTanks = CATEGORIES.find((category) => category.slug === CATEGORY);

export async function generateMetadata({
  searchParams,
}: DosingCategoryPageProps): Promise<Metadata> {
  const paramsValue = (await searchParams) ?? {};
  const groups = getCatalogFilterGroups(CATEGORY, SUBCATEGORY);
  const filters = parseCatalogFilterState(paramsValue, groups);
  const shouldNoIndex = Boolean(paramsValue.after) || hasCatalogFilters(filters);

  return {
    title: TITLE,
    description: META_DESCRIPTION,
    alternates: { canonical: PATHNAME },
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

export default async function DosingCategoryPage({
  searchParams,
}: DosingCategoryPageProps) {
  const paramsValue = (await searchParams) ?? {};
  const afterParam = paramsValue.after;
  const after =
    typeof afterParam === 'string' && afterParam.length <= 500
      ? afterParam
      : null;

  const baseQuery =
    "tag:'primary-cat:pumps-and-tanks' AND tag:'sub-cat:dosing-tanks'";
  const filterGroups = getCatalogFilterGroups(CATEGORY, SUBCATEGORY);
  const initialFilters = parseCatalogFilterState(paramsValue, filterGroups);
  const query = buildCatalogQuery(baseQuery, filterGroups, initialFilters);

  let loadFailed = false;
  let page: ProductsPage;
  try {
    page = await getProducts({ query, first: PAGE_SIZE, after });
  } catch (error) {
    loadFailed = true;
    console.error('[dosing-tanks] Failed to load products', { error });
    page = {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(TITLE, PATHNAME, INTRO),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Pumps & Tanks', path: '/pumps-and-tanks' },
            { name: TITLE, path: PATHNAME },
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
        title={TITLE}
        intro={INTRO}
        categorySlug={CATEGORY}
        subcategories={pumpsAndTanks?.subcategories ?? []}
        activeSubSlug={SUBCATEGORY}
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
        categorySlug={CATEGORY}
        activeSubcategory={SUBCATEGORY}
        initialFilters={initialFilters}
        pageSize={PAGE_SIZE}
        defaultProductOrder={DEFAULT_PRODUCT_ORDER}
      />

      {page.pageInfo.hasNextPage &&
        page.pageInfo.endCursor &&
        !hasCatalogFilters(initialFilters) && (
          <div className="mx-auto max-w-7xl px-4 pb-10 text-center sm:px-6 lg:px-8">
            <Link
              href={`${PATHNAME}?after=${encodeURIComponent(page.pageInfo.endCursor)}`}
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
