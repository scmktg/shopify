import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { CategoryHero } from '@/components/category/CategoryHero';
import { CartridgeSizeResults } from '@/components/category/CartridgeSizeResults';
import { findCategory } from '@/content/categories';
import type { ProductCardData } from '@/types/product';

const SIZES = {
  '10-x-2-5': { label: '10″ × 2.5″', height: '10', diameter: '2.5' },
  '10-x-4-5': { label: '10″ × 4.5″', height: '10', diameter: '4.5' },
  '20-x-2-5': { label: '20″ × 2.5″', height: '20', diameter: '2.5' },
  '20-x-4-5': { label: '20″ × 4.5″', height: '20', diameter: '4.5' },
} as const;

type CartridgeSize = keyof typeof SIZES;

interface PageProps {
  params: Promise<{ dimension: string }>;
}

export function generateStaticParams() {
  return Object.keys(SIZES).map((dimension) => ({ dimension }));
}

// Accept the actual inch, multiplication and decimal formats used in product
// titles, tags and Shopify's housing-size metafield; don't rely on predictive
// search matching punctuation in a literal phrase.
function normaliseSizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/(?:inches|inch|in\b|″|”|“|\")/g, ' ')
    .replace(/(?:×|✕|by)/g, 'x')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesDimension(product: ProductCardData, height: string, diameter: string): boolean {
  const pattern = new RegExp(`(?:^|[^0-9])${height}\\s*[-x×*/]\\s*${diameter.replace('.', '\\.')}(?=$|[^0-9])`, 'i');
  const values = [
    product.title,
    product.handle.replace(/-/g, ' '),
    product.housingSize ?? '',
    ...product.tags,
    ...product.variants.flatMap((variant) => [
      variant.title,
      ...variant.selectedOptions.map((option) => option.value),
    ]),
  ];
  return values.some((value) => pattern.test(normaliseSizeText(value)));
}

async function loadCartridgesBySize(height: string, diameter: string) {
  const matches: ProductCardData[] = [];
  const seen = new Set<string>();
  let after: string | null = null;
  let more = true;
  let truncated = false;

  // Keep fetching beyond the first page, since a size may have no matches
  // among the first 24 or 100 cartridges. Each Shopify page is cached.
  for (let page = 0; page < 20 && more; page += 1) {
    const result = await getProducts({
      query: "tag:'primary-cat:cartridges'",
      first: 100,
      after,
    });
    for (const product of result.products) {
      if (!seen.has(product.handle) && matchesDimension(product, height, diameter)) {
        matches.push(product);
        seen.add(product.handle);
      }
    }
    more = result.pageInfo.hasNextPage && Boolean(result.pageInfo.endCursor);
    after = result.pageInfo.endCursor;
    if (page === 19 && more) truncated = true;
  }
  return { matches, truncated };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { dimension } = await params;
  const size = SIZES[dimension as CartridgeSize];
  if (!size) return {};
  return {
    title: `${size.label} Replacement Water Filter Cartridges | Enviro Aqua`,
    description: `Browse Enviro Aqua replacement filter cartridges in ${size.label} size.`,
    alternates: { canonical: '/cartridges/' },
    robots: { index: false, follow: true },
  };
}

export default async function CartridgeSizePage({ params }: PageProps) {
  const { dimension } = await params;
  const size = SIZES[dimension as CartridgeSize];
  if (!size) notFound();

  let products: ProductCardData[] = [];
  let truncated = false;
  let loadFailed = false;
  try {
    ({ matches: products, truncated } = await loadCartridgesBySize(size.height, size.diameter));
  } catch (error) {
    console.error('[cartridges/size] Failed to load cartridge size', { dimension, error });
    loadFailed = true;
  }

  return (
    <>
      <CategoryHero
        title={`${size.label} Filter Cartridges`}
        intro={null}
        categorySlug="cartridges"
        subcategories={findCategory('cartridges')?.subcategories ?? []}
      />
      <CartridgeSizeResults
        products={products}
        dimension={dimension}
        truncated={truncated}
        loadFailed={loadFailed}
      />
    </>
  );
}
