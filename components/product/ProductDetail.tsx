import Link from 'next/link';
import type {
  CartridgeType,
  InstallationType,
  Product,
  ProductMetafields,
} from '@/types/product';
import { sanitiseProductDescriptionHtml } from '@/lib/content/productHtml';
import { findSubcategory } from '@/content/categories';
import { ProductGallery } from './ProductGallery';
import { PriceDisplay } from './PriceDisplay';
import { WatermarkBadge } from './WatermarkBadge';
import { CompatibleCartridges } from './CompatibleCartridges';
import { RelatedSystems } from './RelatedSystems';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { MobileStickyBuyBar } from '@/components/cart/MobileStickyBuyBar';
import { ProductTrustBlock, type StockStatus } from './ProductTrustBlock';
import { DEFAULT_LOW_STOCK_THRESHOLD } from '@/lib/site-config';

const INSTALL_PACKAGE_HANDLES: ReadonlySet<string> = new Set([
  'wm-3-stages-20-x-4-5-triple-big-blue-whole-house-water-filter-system',
]);
const INSTALL_PACKAGE_TAG = 'offer:install-package';

function offersInstallPackage(product: Product): boolean {
  return (
    INSTALL_PACKAGE_HANDLES.has(product.handle) ||
    product.tags.includes(INSTALL_PACKAGE_TAG)
  );
}

interface ProductDetailProps {
  product: Product;
  category: string;
  subcategory: string;
}

export function ProductDetail({
  product,
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
        <div className="md:sticky md:top-24">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-black">
            {product.title}
          </h1>

          {firstVariant?.sku && (
            <p className="mt-2 text-sm text-black/60">
              SKU: <span className="font-mono">{firstVariant.sku}</span>
            </p>
          )}

          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <PriceDisplay
              money={product.priceRange.minVariantPrice}
              className="text-2xl font-semibold text-black"
            />
            {compareAt && (
              <s className="text-base text-black/60">
                <PriceDisplay money={compareAt} />
              </s>
            )}
            {savings && (
              <span className="text-sm font-semibold text-brand-blue">
                Save {savings.amount} ({savings.percent}%)
              </span>
            )}
          </div>

          {product.metafields.watermark_status && (
            <div className="mt-4">
              <WatermarkBadge status={product.metafields.watermark_status} />
            </div>
          )}

          {firstVariant && (
            <AddToCartButton
              variantId={firstVariant.id}
              available={inStock}
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

          {offersInstallPackage(product) && (
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

      <section className="mt-12 border-t border-gray-200 pt-8">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: sanitiseProductDescriptionHtml(product.descriptionHtml),
          }}
        />
      </section>

      <SpecificationsPanel metafields={product.metafields} />

      <CompatibleCartridges
        housingSize={product.metafields.housing_size}
        excludeHandle={product.handle}
      />

      <RelatedSystems
        category={category}
        subcategory={subcategory}
        subcategoryLabel={
          findSubcategory(category, subcategory)?.subcategory.label ??
          subcategory
        }
        currentHandle={product.handle}
      />

      {firstVariant && (
        <MobileStickyBuyBar
          variantId={firstVariant.id}
          available={inStock}
          price={product.priceRange.minVariantPrice}
        />
      )}
    </article>
  );
}

interface SpecRow {
  label: string;
  value: string;
}

function SpecificationsPanel({
  metafields,
}: {
  metafields: ProductMetafields;
}) {
  const rows = buildSpecificationRows(metafields);
  if (rows.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-black">Specifications</h2>
      <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between gap-4 border-b border-gray-100 py-2"
          >
            <dt className="font-medium text-black/70">{row.label}</dt>
            <dd className="text-black text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function buildSpecificationRows(
  m: ProductMetafields,
): ReadonlyArray<SpecRow> {
  const rows: SpecRow[] = [];

  // WaterMark status itself is now rendered as <WatermarkBadge> next
  // to the price; only the supporting detail rows go in the spec
  // panel so we don't duplicate the visible label.
  if (m.watermark_licence_number) {
    rows.push({
      label: 'WaterMark Licence',
      value: m.watermark_licence_number,
    });
  }
  if (m.watermark_certifier) {
    rows.push({ label: 'Certifier', value: m.watermark_certifier });
  }
  if (m.watermark_valid_until) {
    rows.push({
      label: 'Certificate Valid Until',
      value: formatIsoDate(m.watermark_valid_until),
    });
  }

  if (m.wels_rating_stars !== null) {
    rows.push({
      label: 'WELS Rating',
      value: `${m.wels_rating_stars} star${m.wels_rating_stars === 1 ? '' : 's'}`,
    });
  }
  if (m.wels_registration_number) {
    rows.push({
      label: 'WELS Registration',
      value: m.wels_registration_number,
    });
  }

  if (m.installation_type) {
    rows.push({
      label: 'Installation Type',
      value: formatInstallationType(m.installation_type),
    });
  }
  if (m.stages !== null) {
    rows.push({ label: 'Stages', value: String(m.stages) });
  }
  if (m.cartridge_type) {
    rows.push({
      label: 'Cartridge Type',
      value: formatCartridgeType(m.cartridge_type),
    });
  }
  if (m.micron_rating !== null) {
    rows.push({
      label: 'Micron Rating',
      value: `${m.micron_rating} micron`,
    });
  }
  if (m.housing_size) {
    rows.push({ label: 'Housing Size', value: m.housing_size });
  }
  if (m.connection_size) {
    rows.push({ label: 'Connection Size', value: m.connection_size });
  }
  if (m.flow_rate_lpm !== null) {
    rows.push({ label: 'Flow Rate', value: `${m.flow_rate_lpm} L/min` });
  }

  if (m.voltage) {
    rows.push({ label: 'Voltage', value: m.voltage });
  }
  if (m.capacity_l !== null) {
    rows.push({ label: 'Capacity', value: `${m.capacity_l} L` });
  }
  if (m.bunded !== null) {
    rows.push({ label: 'Bunded', value: m.bunded ? 'Yes' : 'No' });
  }

  if (m.country_of_origin) {
    rows.push({ label: 'Country of Origin', value: m.country_of_origin });
  }
  if (m.warranty_months !== null) {
    rows.push({
      label: 'Warranty',
      value:
        m.warranty_months === 1
          ? '1 month'
          : `${m.warranty_months} months`,
    });
  }

  return rows;
}

function formatInstallationType(type: InstallationType): string {
  switch (type) {
    case 'under-sink':
      return 'Under Sink';
    case 'whole-house':
      return 'Whole House';
    case 'bench-top':
      return 'Bench Top';
    case 'inline':
      return 'Inline';
    case 'countertop':
      return 'Countertop';
    case 'commercial':
      return 'Commercial';
  }
}

function formatCartridgeType(type: CartridgeType): string {
  switch (type) {
    case 'sediment':
      return 'Sediment';
    case 'carbon-cto':
      return 'Carbon (CTO)';
    case 'carbon-gac':
      return 'Carbon (GAC)';
    case 'ro-membrane':
      return 'RO Membrane';
    case 'alkaline':
      return 'Alkaline';
    case 'fluoride':
      return 'Fluoride Removal';
    case 't33':
      return 'Post-Carbon T33';
    case 'pleated':
      return 'Pleated Washable';
    case 'uf':
      return 'Ultrafiltration';
  }
}

function formatIsoDate(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', { dateStyle: 'long' }).format(
    new Date(iso),
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
