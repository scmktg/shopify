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
  'Shop chemical dosing tanks, polyethylene chemical storage tanks, chemical bunds and complete tank-and-bund packages for water treatment, chlorine, antiscalant, pH correction and industrial dosing. Choose standalone tanks from 40L to 500L, secondary-containment bunds, or matched bunded chemical tank packages in 50L, 100L, 200L and 300L sizes.';
const META_DESCRIPTION =
  'Chemical dosing tanks, polyethylene chemical storage tanks, bunds and complete tank-and-bund packages from 40L to 500L for water-treatment and industrial dosing.';
const DEFAULT_PRODUCT_ORDER = [
  '40l-chemical-dosing-tank',
  'chemical-dosing-tank-50l',
  'chemical-bund-50l',
  'chemical-dosing-tank-and-bund-50l',
  '60l-chemical-dosing-tank',
  'chemical-dosing-tank-100l',
  'chemical-bund-100l',
  'chemical-dosing-tank-and-bund-100l',
  'chemical-dosing-tank-200l',
  'chemical-bund-200l',
  'chemical-dosing-tank-and-bund-200l',
  'chemical-dosing-tank-300l',
  'chemical-bund-400l',
  'chemical-dosing-tank-and-bund-300l',
  'chemical-dosing-tank-500l',
] as const;

const pumpsAndTanks = CATEGORIES.find((category) => category.slug === CATEGORY);

const featuredLinks = [
  {
    title: '50L chemical dosing tank',
    description: 'Compact polyethylene chemical storage tank for smaller dosing systems.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-50l',
  },
  {
    title: '100L chemical dosing tank',
    description: 'A popular standalone size for commercial water-treatment dosing.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-100l',
  },
  {
    title: '200L chemical dosing tank',
    description: 'Larger polyethylene tank for commercial and industrial dosing applications.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-200l',
  },
  {
    title: '50L bunded chemical tank package',
    description: '50L dosing tank with matching secondary-containment bund.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-and-bund-50l',
  },
  {
    title: '100L chemical tank & bund package',
    description: 'Complete 100L chemical dosing tank and matching bund in one package.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-and-bund-100l',
  },
  {
    title: '200L bunded chemical container package',
    description: 'Complete 200L tank-and-bund package for larger dosing installations.',
    href: '/pumps-and-tanks/dosing-tanks/chemical-dosing-tank-and-bund-200l',
  },
] as const;

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

      {!hasCatalogFilters(initialFilters) && !after && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="border-t border-black/10 pt-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Choose the right chemical dosing tank or bunded package
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/70 sm:text-base">
                Use a standalone polyethylene chemical dosing tank when you only need the storage and dosing vessel. Choose a chemical bund separately when secondary containment is required, or select a complete tank-and-bund package when you want the matched components supplied together. Always confirm chemical compatibility and the containment requirements that apply to your site and stored chemical.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-black/10 p-5 transition-colors hover:border-black/30"
                >
                  <h3 className="font-semibold text-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/65">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-brand-blue">
                    View product →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
