import Link from 'next/link';
import type { Product } from '@/types/product';
import { findSubcategory } from '@/content/categories';
import type { ProductContent } from '@/lib/products/schema';
import { ProductGallery } from './ProductGallery';
import { PriceDisplay } from './PriceDisplay';
import { CertificationSlot } from './CertificationSlot';
import { ProductOverview } from './ProductOverview';
import { ProductFeatures } from './ProductFeatures';
import { HeadlineSpecs } from './HeadlineSpecs';
import { RecommendedFor } from './RecommendedFor';
import { FullSpecs } from './FullSpecs';
import { ComplianceSection } from './ComplianceSection';
import { BoughtTogether } from './BoughtTogether';
import { MoreInCategory } from './MoreInCategory';
import { BrandTrustStrip } from './BrandTrustStrip';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { MobileStickyBuyBar } from '@/components/cart/MobileStickyBuyBar';
import { ProductTrustBlock, type StockStatus } from './ProductTrustBlock';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/lib/site-config';

const INSTALL_PACKAGE_TAG = 'offer:install-package';

function offersInstallPackage(content: ProductContent): boolean {
  return (content.tags ?? []).includes(INSTALL_PACKAGE_TAG);
}

interface ProductDetailProps {
  /** Shopify-sourced commerce primitives (title, price, stock, images, variants, sku, handle). */
  product: Product;
  /** Content from data/products.json[handle] — every non-commerce field. */
  content: ProductContent;
  category: string;
  subcategory: string;
}

export function ProductDetail({
  product,
  content,
  category,
  subcategory,
}: ProductDetailProps) {
  const firstVariant = product.variants[0];
  const inStock = firstVariant?.availableForSale ?? false;
  const compareAt = firstVariant?.compareAtPrice ?? null;
  const savings = computeSavings(
    product.priceRange.minVariantPrice,
    compareAt,
  );
  const stockStatus: StockStatus = !inStock
    ? 'out_of_stock'
    : firstVariant?.quantityAvailable !== null &&
        firstVariant?.quantityAvailable !== undefined &&
        firstVariant.quantityAvailable <= DEFAULT_LOW_STOCK_THRESHOLD
      ? 'low_stock'
      : 'in_stock';
  const subcategoryNode = findSubcategory(category, subcategory);
  const subcategoryLabel =
    subcategoryNode?.subcategory.label ?? humaniseSlug(subcategory);
  const boughtTogether = content.upsells?.boughtTogether ?? [];
  const moreSource = content.upsells?.moreInCategory ?? 'auto';

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 md:pb-12">
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-black/70 mb-6 flex items-center gap-2 flex-wrap"
      >
        <Link href="/" className="hover:underline underline-offset-4">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/${category}/`}
          className="hover:underline underline-offset-4"
        >
          {humaniseSlug(category)}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/${category}/${subcategory}/`}
          className="hover:underline underline-offset-4"
        >
          {humaniseSlug(subcategory)}
        </Link>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div className="md:sticky md:top-24">
          <Link
            href={`/${category}/${subcategory}/`}
            className="inline-block text-xs font-semibold uppercase tracking-wide text-brand-blue border border-brand-blue/30 bg-brand-blue-light px-3 py-1 rounded-full hover:bg-brand-blue hover:text-white transition-colors"
          >
            {subcategoryLabel}
          </Link>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-black tracking-tight">
            {product.title}
          </h1>

          {firstVariant?.sku && (
            <p className="mt-2 text-sm text-black/60">
              SKU: <span className="font-mono">{firstVariant.sku}</span>
            </p>
          )}

          <div className="mt-4 flex items-baseline justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-2 flex-wrap">
              <PriceDisplay
                money={product.priceRange.minVariantPrice}
                className="text-3xl md:text-4xl font-bold text-black tracking-tight"
              />
              <span className="text-sm text-black/50">inc GST</span>
              {compareAt && (
                <s className="ml-2 text-base text-black/60">
                  <PriceDisplay money={compareAt} />
                </s>
              )}
              {savings && (
                <span className="text-sm font-semibold text-brand-blue">
                  Save {savings.amount} ({savings.percent}%)
                </span>
              )}
            </div>
            <span className="text-sm text-black/50">
              Same price retail or trade
            </span>
          </div>

          <div className="mt-4">
            <CertificationSlot compliance={content.compliance} />
          </div>

          {firstVariant && (
            <AddToCartButton
              variantId={firstVariant.id}
              available={inStock}
              label={content.ctas?.primary ?? undefined}
              enableBuyNow
            />
          )}

          {firstVariant && (
            <ProductTrustBlock
              productId={product.id}
              sku={firstVariant.sku}
              stockStatus={stockStatus}
              stockCount={firstVariant.quantityAvailable ?? undefined}
            />
          )}

          {offersInstallPackage(content) && (
            <div className="mt-6 p-4 bg-brand-blue-light border border-brand-blue/30 rounded text-sm text-black">
              Live on the Central Coast NSW? Get this installed by a local
              plumber for $2,299 —{' '}
              <Link
                href="/whole-house-installation-package/"
                className="text-brand-blue font-semibold hover:underline underline-offset-4"
              >
                see the install package
              </Link>
              .
            </div>
          )}
        </div>
      </div>

      <HeadlineSpecs specs={content.headlineSpecs} />
      <FullSpecs specs={content.fullSpecs} />
      <ProductOverview description={content.description} />
      <ProductFeatures features={content.features} />
      <RecommendedFor items={content.recommendedFor} />
      <ComplianceSection compliance={content.compliance} />

      {boughtTogether.length > 0 && (
        <BoughtTogether handles={boughtTogether} />
      )}

      <MoreInCategory
        source={moreSource}
        category={category}
        subcategory={subcategory}
        currentHandle={product.handle}
        subcategoryLabel={subcategoryLabel}
      />

      <BrandTrustStrip />

      {firstVariant && (
        <MobileStickyBuyBar
          variantId={firstVariant.id}
          available={inStock}
          price={product.priceRange.minVariantPrice}
          title={product.title}
          thumbnail={product.featuredImage ?? product.images[0] ?? null}
        />
      )}
    </article>
  );
}

function computeSavings(
  current: { amount: string; currencyCode: string },
  compareAt: { amount: string; currencyCode: string } | null,
): { amount: string; percent: number } | null {
  if (!compareAt) return null;
  if (compareAt.currencyCode !== current.currencyCode) return null;
  const currentValue = Number.parseFloat(current.amount);
  const compareValue = Number.parseFloat(compareAt.amount);
  if (!Number.isFinite(currentValue) || !Number.isFinite(compareValue)) {
    return null;
  }
  const diff = compareValue - currentValue;
  if (diff <= 0) return null;
  const formatted = new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: current.currencyCode,
  }).format(diff);
  const percent = Math.round((diff / compareValue) * 100);
  return { amount: formatted, percent };
}

function humaniseSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ And /g, ' & ');
}
