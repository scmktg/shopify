import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import {
  getCategoryIntro,
  getSubcategoryMetaDescription,
} from '@/content/category-intros';
import { getProducts, type ProductsPage } from '@/lib/shopify/queries/getProducts';
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
import {
  buildCatalogQuery,
  getCatalogFilterGroups,
  hasCatalogFilters,
  parseCatalogFilterState,
} from '@/lib/catalog/filters';

type CategorySearchParams = Record<string, string | string[] | undefined>;

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams?: Promise<CategorySearchParams>;
}

const PAGE_SIZE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const paramsValue = (await searchParams) ?? {};
  const after = paramsValue.after;
  const node = findSubcategory(category, subcategory);
  if (!node) return {};

  const groups = getCatalogFilterGroups(category, subcategory);
  const filters = parseCatalogFilterState(paramsValue, groups);
  const description =
    getSubcategoryMetaDescription(category, subcategory) ??
    `${node.subcategory.label} in our ${node.category.label.toLowerCase()} range - wholesale prices, Australia-wide delivery, and free Click & Collect from Wyong NSW.`;
  const shouldNoIndex = Boolean(after) || hasCatalogFilters(filters);

  const seoTitle =
    category === 'bubblers-and-coolers' && subcategory === 'bubblers'
      ? 'Commercial Water Bubblers & Drinking Fountains'
      : `${node.subcategory.label} | ${node.category.label}`;

  return {
    title: seoTitle,
    description,
    alternates: { canonical: `/${category}/${subcategory}` },
    ...(shouldNoIndex
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const paramsValue = (await searchParams) ?? {};
  const afterParam = paramsValue.after;
  const after =
    typeof afterParam === 'string' && afterParam.length <= 500
      ? afterParam
      : null;
  const node = findSubcategory(category, subcategory);
  if (!node) notFound();

  if (category === 'bubblers-and-coolers' && subcategory === 'bubblers') {
    permanentRedirect('/commercial-water-bubblers');
  }

  const cartridgeFacetBySubcategory: Record<string, string> = {
    sediment: 'facet:cartridge-sediment',
    carbon: 'facet:cartridge-carbon',
    'reverse-osmosis-membranes': 'facet:cartridge-ro-membrane',
    'specialty-cartridges': 'facet:cartridge-specialty',
    'cartridge-sets': 'facet:cartridge-set',
  };
  const cartridgeFacet =
    category === 'cartridges'
      ? cartridgeFacetBySubcategory[subcategory]
      : undefined;

  const baseQuery =
    category === 'plumbing' && subcategory === 'kitchen-taps'
      ? "tag:'primary-cat:plumbing' AND (tag:'sub-cat:kitchen-taps' OR tag:'sub-cat:ro-filter-taps')"
      : cartridgeFacet
        ? `tag:'primary-cat:cartridges' AND tag:'${cartridgeFacet}'`
        : `tag:'primary-cat:${category}' AND tag:'sub-cat:${subcategory}'`;
  const filterGroups = getCatalogFilterGroups(category, subcategory);
  const initialFilters = parseCatalogFilterState(paramsValue, filterGroups);
  const query = buildCatalogQuery(baseQuery, filterGroups, initialFilters);

  let loadFailed = false;
  let page: ProductsPage;
  try {
    page = await getProducts({ query, first: PAGE_SIZE, after });
  } catch (error) {
    loadFailed = true;
    console.error('[category] Failed to load subcategory products', {
      category,
      subcategory,
      error,
    });
    page = {
      products: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }

  const pathname = `/${category}/${subcategory}`;
  const title =
    category === 'bubblers-and-coolers' && subcategory === 'bubblers'
      ? 'Commercial Water Bubblers & Drinking Fountains'
      : `${node.subcategory.label} ${node.category.label}`;
  const intro = getCategoryIntro(`${category}/${subcategory}`);
  const isWholeHouse = category === 'water-filters' && subcategory === 'whole-house';

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
            page.products.map((product) => ({
              name: product.title,
              path: getProductUrl(product.handle),
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

      {isWholeHouse && (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-brand-blue/20 bg-brand-blue-light p-6 md:flex md:items-center md:justify-between md:gap-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold text-black">Need your whole-house filter installed?</h2>
              <p className="mt-2 text-black/75">
                Complete whole-house water filter installation is available across eligible Sydney and NSW Central Coast properties for <strong>$2,399 + GST supplied and installed</strong>, subject to standard installation conditions.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 md:mt-0 md:shrink-0">
              <Link href="/locations/central-coast-nsw/whole-house-water-filter-installation" className="rounded bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-hover">Central Coast installation</Link>
              <Link href="/locations/sydney-nsw/whole-house-water-filter-installation" className="rounded border border-brand-blue px-4 py-2.5 text-sm font-semibold text-brand-blue hover:bg-white">Sydney installation</Link>
            </div>
          </div>
        </section>
      )}

      {category === 'water-filters' &&
        (subcategory === 'under-sink' || subcategory === 'reverse-osmosis') && (
          <WaterFilterStageGuide subcategory={subcategory} />
        )}
      {loadFailed && (
        <div role="status" className="mx-auto mt-6 max-w-7xl rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-black">
          Products are temporarily unavailable. Please refresh the page to try again.
        </div>
      )}
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={baseQuery}
        categorySlug={category}
        activeSubcategory={subcategory}
        initialFilters={initialFilters}
        pageSize={PAGE_SIZE}
        enableSizeFilter={category === 'cartridges'}
      />
      {page.pageInfo.hasNextPage && page.pageInfo.endCursor && !hasCatalogFilters(initialFilters) && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 text-center">
          <Link href={`${pathname}?after=${encodeURIComponent(page.pageInfo.endCursor)}`} rel="next" className="text-sm font-medium text-brand-blue hover:underline underline-offset-4">
            Next catalogue page
          </Link>
        </div>
      )}
    </>
  );
}
