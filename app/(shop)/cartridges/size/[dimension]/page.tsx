import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/shopify/queries/getProducts';
import { ProductGrid } from '@/components/product/ProductGrid';
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
      <section className="border-b border-gray-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-gray-500">
            <Link href="/cartridges/" className="hover:text-gray-950 hover:underline">Cartridges</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span aria-current="page">{size.label}</span>
          </nav>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">{size.label} Filter Cartridges</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Replacement cartridges matching this size. Check your existing cartridge dimensions and filter compatibility before ordering.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {Object.entries(SIZES).map(([key, option]) => (
              <Link
                key={key}
                href={`/cartridges/size/${key}/`}
                aria-current={key === dimension ? 'page' : undefined}
                className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${key === dimension ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'}`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loadFailed ? (
          <p role="alert" className="rounded-lg bg-amber-50 p-5 text-sm text-amber-900">Products are temporarily unavailable. Please try again.</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-600">{products.length} matching {products.length === 1 ? 'product' : 'products'}</p>
            {products.length ? (
              <ProductGrid products={products} editorial />
            ) : (
              <div className="rounded-xl border border-gray-200 p-7">
                <h2 className="text-lg font-semibold text-gray-950">No matching cartridges found</h2>
                <p className="mt-2 text-sm text-gray-600">Browse the full cartridge range or choose another size.</p>
                <Link href="/cartridges/" className="mt-4 inline-block text-sm font-semibold text-sky-700 hover:underline">View all cartridges</Link>
              </div>
            )}
            {truncated && <p className="mt-6 text-sm text-amber-800">Additional catalogue products may not be shown. Browse all cartridges if you cannot find your replacement.</p>}
          </>
        )}
      </section>
    </>
  );
}
