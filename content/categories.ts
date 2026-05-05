/**
 * Single source of truth for the catalogue navigation hierarchy.
 *
 * URL slugs and tag values match docs/02-site-structure.md. Every
 * product is expected to carry exactly one `primary-cat:<slug>` tag
 * matching `category.slug` and one `sub-cat:<slug>` tag matching one
 * of the category's `subcategories[].slug`.
 *
 * Subcategories are ordered roughly by product count, biggest first,
 * to bias the megamenu and chip nav toward what shoppers see most.
 *
 * Used by: header megamenu, sitemap, breadcrumbs, category pages,
 * subcategory pages, and product-page tag validation.
 */
export interface Subcategory {
  slug: string;
  label: string;
}

export interface Category {
  slug: string;
  label: string;
  subcategories: ReadonlyArray<Subcategory>;
}

export const CATEGORIES: ReadonlyArray<Category> = [
  {
    slug: 'water-filters',
    label: 'Water Filters',
    subcategories: [
      { slug: 'under-sink', label: 'Under Sink' },
      { slug: 'whole-house', label: 'Whole House' },
      { slug: 'reverse-osmosis', label: 'Reverse Osmosis' },
      { slug: 'uv-sterilisation', label: 'UV Sterilisation' },
      { slug: 'bench-top', label: 'Bench Top' },
      { slug: 'commercial', label: 'Commercial' },
      { slug: 'parts', label: 'Parts' },
    ],
  },
  {
    slug: 'cartridges',
    label: 'Cartridges',
    subcategories: [
      { slug: 'sediment', label: 'Sediment' },
      { slug: 'carbon', label: 'Carbon' },
      { slug: 'reverse-osmosis-membranes', label: 'RO Membranes' },
      { slug: 'specialty-cartridges', label: 'Specialty Cartridges' },
      { slug: 'cartridge-sets', label: 'Cartridge Sets' },
    ],
  },
  {
    slug: 'bubblers',
    label: 'Bubblers',
    subcategories: [
      { slug: 'commercial', label: 'Commercial' },
      { slug: 'residential', label: 'Residential' },
      { slug: 'parts', label: 'Parts' },
    ],
  },
  {
    slug: 'pumps-and-tanks',
    label: 'Pumps & Tanks',
    subcategories: [
      { slug: 'pumps', label: 'Pumps' },
      { slug: 'pressure-tanks', label: 'Pressure Tanks' },
      { slug: 'dosing-tanks', label: 'Dosing Tanks' },
      { slug: 'components', label: 'Components' },
    ],
  },
  {
    slug: 'plumbing',
    label: 'Plumbing',
    subcategories: [
      { slug: 'kitchen-taps', label: 'Kitchen Taps' },
      { slug: 'bathroom-taps', label: 'Bathroom Taps' },
      { slug: 'ro-filter-taps', label: 'RO Filter Taps' },
      { slug: 'toilets', label: 'Toilets' },
      { slug: 'bundles', label: 'Bundles' },
    ],
  },
];

const CATEGORY_BY_SLUG = new Map(
  CATEGORIES.map((category) => [category.slug, category]),
);

export function findCategory(slug: string): Category | null {
  return CATEGORY_BY_SLUG.get(slug) ?? null;
}

export function findSubcategory(
  categorySlug: string,
  subSlug: string,
): { category: Category; subcategory: Subcategory } | null {
  const category = findCategory(categorySlug);
  if (!category) return null;
  const subcategory = category.subcategories.find((s) => s.slug === subSlug);
  if (!subcategory) return null;
  return { category, subcategory };
}
