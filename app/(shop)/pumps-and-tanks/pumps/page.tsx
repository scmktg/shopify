import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findSubcategory } from '@/content/categories';
import { getCategoryIntro } from '@/content/category-intros';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CategoryView } from '@/components/category/CategoryView';
import {
  FilterPills,
  type FilterPillOption,
} from '@/components/category/FilterPills';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, collectionSchema } from '@/lib/seo/jsonld';

interface PumpsPageProps {
  searchParams: Promise<{ type?: string }>;
}

const CATEGORY = 'pumps-and-tanks';
const SUBCATEGORY = 'pumps';
const PAGE_SIZE = 24;

const TYPE_OPTIONS: ReadonlyArray<FilterPillOption> = [
  { value: null, label: 'All' },
  { value: '12v', label: '12V' },
  { value: 'ro-booster', label: 'RO Booster' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'solar', label: 'Solar' },
  { value: 'submersible', label: 'Submersible' },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.filter((o): o is FilterPillOption & { value: string } =>
    o.value !== null,
  ).map((o) => [o.value, o.label]),
);

const VALID_TYPES = new Set(Object.keys(TYPE_LABELS));

function resolveType(input: string | undefined): string | null {
  if (!input) return null;
  return VALID_TYPES.has(input) ? input : null;
}

export async function generateMetadata({
  searchParams,
}: PumpsPageProps): Promise<Metadata> {
  const { type } = await searchParams;
  const node = findSubcategory(CATEGORY, SUBCATEGORY);
  if (!node) return {};

  const filterType = resolveType(type);
  const baseTitle = `${node.subcategory.label} | ${node.category.label}`;
  const filteredTitle = filterType
    ? `${TYPE_LABELS[filterType]} ${node.subcategory.label} | ${node.category.label}`
    : baseTitle;

  return {
    title: filteredTitle,
    description:
      'Water pumps for caravans, RVs, RO systems, bore, and rainwater. Wholesale prices, tiered shipping Australia-wide from $9.95.',
    alternates: {
      // Filter URLs canonical to the unfiltered page so search
      // engines don't index every type combination.
      canonical: `/${CATEGORY}/${SUBCATEGORY}`,
    },
    robots: filterType ? { index: false, follow: true } : undefined,
  };
}

export default async function PumpsPage({ searchParams }: PumpsPageProps) {
  const { type } = await searchParams;
  const node = findSubcategory(CATEGORY, SUBCATEGORY);
  if (!node) notFound();

  const filterType = resolveType(type);
  const baseQuery = `tag:'primary-cat:${CATEGORY}' AND tag:'sub-cat:${SUBCATEGORY}'`;
  const query = filterType
    ? `${baseQuery} AND tag:'tech:${filterType}'`
    : baseQuery;
  const page = await getProducts({ query, first: PAGE_SIZE });

  const pathname = `/${CATEGORY}/${SUBCATEGORY}`;
  const title = `${node.subcategory.label} ${node.category.label}`;
  const intro = getCategoryIntro(`${CATEGORY}/${SUBCATEGORY}`);

  return (
    <>
      <JsonLdScript
        data={[
          collectionSchema(title, pathname, intro),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node.category.label, path: `/${CATEGORY}` },
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <FilterPills
          options={TYPE_OPTIONS}
          paramName="type"
          label="Pump type"
        />
      </div>
      <CategoryView
        initialProducts={page.products}
        initialPageInfo={page.pageInfo}
        query={query}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
