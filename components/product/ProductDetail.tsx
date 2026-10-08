import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Product, Money, ProductImage } from '@/types/product';
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
import { FaqAccordion } from '@/components/editorial/FaqAccordion';
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
import { DosingTankComparison } from '@/components/category/DosingTankComparison';

const INSTALL_PACKAGE_TAG = 'offer:install-package';
const BRUSHED_GOLD_RO_TAP_HANDLE =
  'premium-ro-filter-tap-sus304-nsf-approved-in-black-nickel-and-gold';
const THREE_WAY_TAP_HANDLE =
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c';
const SOLD_OUT_THREE_STAGE_UV_HANDLE =
  '3-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system';
const FOUR_STAGE_UV_PATH =
  '/water-filters/whole-house/4-stages-whole-house-water-filter-and-uv-ultraviolet-sterilization-system';

function offersInstallPackage(content: ProductContent): boolean {
  return (content.tags ?? []).includes(INSTALL_PACKAGE_TAG);
}

interface PackageComponentPreview {
  title: string;
  image: ProductImage | null;
}

interface PackageUpgrade {
  title: string;
  href: string;
  price: Money;
  savings: Money;
  available: boolean;
  tank: PackageComponentPreview | null;
  bund: PackageComponentPreview | null;
  componentLink: {
    title: string;
    href: string;
  } | null;
}

interface ProductDetailProps {
  product: Product;
  content: ProductContent;
  category: string;
  subcategory: string;
  familyPaths?: ReadonlyMap<string, string> | null;
  initialVariantId?: string | null;
  packageUpgrade?: PackageUpgrade | null;
}

export function ProductDetail({
  product,
  content,
  category,
  subcategory,
  familyPaths,
  initialVariantId = null,
  packageUpgrade = null,
}: ProductDetailProps) {
  const subcategoryNode = findSubcategory(category, subcategory);
  const subcategoryLabel =
    subcategoryNode?.subcategory.label ?? humaniseSlug(subcategory);
  const boughtTogether = content.upsells?.boughtTogether ?? [];
  const moreSource = content.upsells?.moreInCategory ?? 'auto';
  const showFourStageAlternative =
    product.handle === SOLD_OUT_THREE_STAGE_UV_HANDLE;

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
          href={`/${category}`}
          className="hover:underline underline-offset-4"
        >
          {humaniseSlug(category)}
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/${category}/${subcategory}`}
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
            href={`/${category}/${subcategory}`}
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

          {!showFourStageAlternative && (
            <VariantPurchaseControls
              fallbackPrice={product.priceRange.minVariantPrice}
              singleFinish={product.handle === BRUSHED_GOLD_RO_TAP_HANDLE ? 'Brushed Gold' : undefined}
              ctaLabel={content.ctas?.primary ?? undefined}
            />
          )}

          {showFourStageAlternative && (
            <div className="mt-5 rounded-lg border border-black/15 bg-black/[0.03] p-4">
              <p className="text-sm font-semibold text-black">Sold out</p>
              <p className="mt-1 text-sm leading-6 text-black/70">
                This 3-stage UV system is currently unavailable. For the closest
                replacement, choose the upgraded 4-stage whole house system with
                UV and an additional carbon filtration stage.
              </p>
              <Link
                href={FOUR_STAGE_UV_PATH}
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/85"
              >
                View 4 Stage Whole House Water Filter System | UV
              </Link>
            </div>
          )}

          {packageUpgrade && (
            <div className="mt-5 rounded-lg border border-brand-blue/25 bg-brand-blue-light/40 p-4">
              <p className="text-sm font-semibold text-black">
                Need the complete setup?
              </p>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                {packageUpgrade.tank && packageUpgrade.bund && (
                  <div
                    className="flex shrink-0 items-center gap-2"
                    aria-label="Tank and bund package contents"
                  >
                    <PackageComponentThumbnail component={packageUpgrade.tank} />
                    <span
                      className="text-lg font-semibold text-black/40"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <PackageComponentThumbnail component={packageUpgrade.bund} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-5 text-black">
                    {packageUpgrade.title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-black/75">
                    <span className="font-semibold text-black">
                      {formatMoney(packageUpgrade.price)}
                    </span>{' '}
                    · Save {formatMoney(packageUpgrade.savings)}
                  </p>
                </div>

                <div className="shrink-0 sm:ml-auto">
                  <Link
                    href={packageUpgrade.href}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/85 sm:w-auto"
                  >
                    View package
                  </Link>
                </div>
              </div>

              {!packageUpgrade.available && (
                <p className="mt-2 text-xs font-medium text-black/55">
                  Package currently unavailable
                </p>
              )}

              {packageUpgrade.componentLink && (
                <p className="mt-3 text-xs leading-5 text-black/60">
                  <Link
                    href={packageUpgrade.componentLink.href}
                    className="font-medium text-brand-blue hover:underline underline-offset-4"
                  >
                    View {packageUpgrade.componentLink.title} separately
                  </Link>
                </p>
              )}
            </div>
          )}

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

          {subcategory === 'bubblers' && (
            <p className="mt-4 text-sm text-black/70">
              Not sure which cabinet suits your site?{' '}
              <Link
                href="/commercial-water-bubblers"
                className="font-semibold text-brand-blue hover:underline underline-offset-4"
              >
                Compare all commercial water bubblers
              </Link>
              .
            </p>
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
                href="/whole-house-installation-package"
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
      {content.faq && content.faq.length > 0 && (
        <section className="mt-10 border-t border-gray-200 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
                Questions about this model
              </h2>
              {subcategory === 'bubblers' && (
                <p className="mt-3 text-sm text-black/70">
                  For a side-by-side comparison of cooling, cabinet, bottle-fill and location options, see the{' '}
                  <Link
                    href="/commercial-water-bubblers"
                    className="font-semibold text-brand-blue hover:underline underline-offset-4"
                  >
                    commercial water bubbler guide
                  </Link>
                  .
                </p>
              )}
            </div>
            <FaqAccordion items={content.faq} />
          </div>
        </section>
      )}
      {subcategory === 'dosing-tanks' && <DosingTankComparison />}

      {!showFourStageAlternative && (
        <VariantBuyBanner
          fallbackPrice={product.priceRange.minVariantPrice}
          ctaLabel={content.ctas?.primary ?? undefined}
        />
      )}

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

      {!showFourStageAlternative && (
        <VariantMobileStickyBuyBar
          fallbackPrice={product.priceRange.minVariantPrice}
          title={product.title}
          fallbackThumbnail={product.featuredImage ?? product.images[0] ?? null}
        />
      )}
      </article>
    </VariantSelectionProvider>
  );
}

function PackageComponentThumbnail({
  component,
}: {
  component: PackageComponentPreview;
}) {
  return (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-white p-1 sm:h-14 sm:w-14">
      {component.image ? (
        <img
          src={component.image.url}
          alt={component.image.altText ?? component.title}
          width={64}
          height={64}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="px-1 text-center text-[9px] leading-tight text-black/55">
          {component.title}
        </span>
      )}
    </div>
  );
}

function formatMoney(money: Money): string {
  const value = Number.parseFloat(money.amount);
  if (!Number.isFinite(value)) return `${money.amount} ${money.currencyCode}`;
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 2,
  }).format(value);
}

function humaniseSlug(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ And /g, ' & ');
}
