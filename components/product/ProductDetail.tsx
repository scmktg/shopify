import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Product } from '@/types/product';
import { findSubcategory } from '@/content/categories';
import type { ProductContent } from '@/lib/products/schema';
import { CertificationSlot } from './CertificationSlot';
import { FamilySelector } from './FamilySelector';
import { ProductOverview } from './ProductOverview';
import { ProductFeatures } from './ProductFeatures';
import { HeadlineSpecs } from './HeadlineSpecs';
import { RecommendedFor } from './RecommendedFor';
import { FullSpecs } from './FullSpecs';
import { ComplianceSection } from './ComplianceSection';
import { BoughtTogether } from './BoughtTogether';
import { MoreInCategory } from './MoreInCategory';
import { BrandTrustStrip } from './BrandTrustStrip';
import { PdpReviewsSlot } from '@/components/reviews/PdpReviewsSlot';
import { ShippingTierBlock } from './ShippingTierBlock';
import { VariantSelectionProvider } from './VariantSelectionProvider';
import { VariantProductGallery } from './VariantProductGallery';
import { VariantPurchaseControls } from './VariantPurchaseControls';
import { VariantProductTrustBlock } from './VariantProductTrustBlock';
import { VariantBuyBanner } from './VariantBuyBanner';
import { VariantMobileStickyBuyBar } from './VariantMobileStickyBuyBar';
import { ThreeWayTapHeroBenefits } from './ThreeWayTapHeroBenefits';
import { ThreeWayTapSalesSections } from './ThreeWayTapSalesSections';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';

const INSTALL_PACKAGE_TAG = 'offer:install-package';
const THREE_WAY_TAP_HANDLE =
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c';

function offersInstallPackage(content: ProductContent): boolean {
  return (content.tags ?? []).includes(INSTALL_PACKAGE_TAG);
}

interface ProductDetailProps {
  /** Shopify-sourced commerce primitives (title, price, stock, images, variants, sku, handle). */
  product: Product;
  /** Content from data/products.json[handle] - every non-commerce field. */
  content: ProductContent;
  category: string;
  subcategory: string;
  /**
   * Sibling-handle → canonical-path map for the optional family
   * selector. Provided by the page so the products map stays on the
   * server. Empty / null when `content.family` is absent.
   */
  familyPaths?: ReadonlyMap<string, string> | null;
  initialVariantId?: string | null;
}

export function ProductDetail({
  product,
  content,
  category,
  subcategory,
  familyPaths,
  initialVariantId = null,
}: ProductDetailProps) {
  const subcategoryNode = findSubcategory(category, subcategory);
  const subcategoryLabel =
    subcategoryNode?.subcategory.label ?? humaniseSlug(subcategory);
  const boughtTogether = content.upsells?.boughtTogether ?? [];
  const moreSource = content.upsells?.moreInCategory ?? 'auto';

  return (
    <VariantSelectionProvider
      variants={product.variants}
      initialVariantId={initialVariantId}
    >
      <ProductViewTracker
        itemId={product.handle}
        itemName={product.title}
        price={Number.parseFloat(product.priceRange.minVariantPrice.amount)}
        currency={product.priceRange.minVariantPrice.currencyCode}
        category={subcategoryLabel}
        brand={product.vendor || 'Enviro Aqua'}
      />
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
          <VariantProductGallery images={product.images} title={product.title} />
        </div>

        <div className="md:sticky md:top-24">
          <Link
            href={`/${category}/${subcategory}/`}
            className="group inline-flex items-center gap-0.5 text-[11px] font-semibold tracking-tight uppercase text-black/60 hover:text-black bg-black/[0.04] hover:bg-black/[0.07] pl-3 pr-2 py-1 rounded-full transition-colors"
          >
            {subcategoryLabel}
            <ChevronRight
              size={12}
              strokeWidth={2.5}
              aria-hidden="true"
              className="text-brand-blue transition-transform duration-150 group-hover:translate-x-0.5"
            />
          </Link>

          <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-black tracking-tight">
            {product.title}
          </h1>

          {product.handle === THREE_WAY_TAP_HANDLE && (
            <ThreeWayTapHeroBenefits />
          )}

          <VariantPurchaseControls
            fallbackPrice={product.priceRange.minVariantPrice}
            ctaLabel={content.ctas?.primary ?? undefined}
          />

          <div className="mt-4">
            <CertificationSlot content={content} />
          </div>

          {content.family && familyPaths && (
            <FamilySelector
              family={content.family}
              currentHandle={product.handle}
              paths={familyPaths}
            />
          )}

          <ShippingTierBlock
            tier={product.metafields.shipping_tier}
            productHandle={product.handle}
          />

          <VariantProductTrustBlock productId={product.id} />

          {offersInstallPackage(content) && (
            <div className="mt-6 p-4 bg-brand-blue-light border border-brand-blue/30 rounded text-sm text-black">
              Live on the Central Coast NSW? Get this installed by a local
              plumber for $2,299 -{' '}
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
      {product.handle === THREE_WAY_TAP_HANDLE && (
        <ThreeWayTapSalesSections />
      )}
      <FullSpecs specs={content.fullSpecs} />
      <ProductOverview
        description={content.description}
        shortDescription={content.shortDescription}
      />
      <ProductFeatures features={content.features} />
      <RecommendedFor items={content.recommendedFor} />
      <ComplianceSection compliance={content.compliance} />

      <VariantBuyBanner
        fallbackPrice={product.priceRange.minVariantPrice}
        ctaLabel={content.ctas?.primary ?? undefined}
      />

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

      <PdpReviewsSlot productHandle={product.handle} />

      <BrandTrustStrip category={category} subcategory={subcategory} />

      <VariantMobileStickyBuyBar
        fallbackPrice={product.priceRange.minVariantPrice}
        title={product.title}
        fallbackThumbnail={product.featuredImage ?? product.images[0] ?? null}
      />
      </article>
    </VariantSelectionProvider>
  );
}

function humaniseSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ And /g, ' & ');
}
