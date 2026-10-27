import Link from 'next/link';
import type { Product, Money, ProductImage } from '@/types/product';
import { findSubcategory } from '@/content/categories';
import type { ProductContent } from '@/lib/products/schema';
import { CertificationSlot } from './CertificationSlot';
import { WaterMarkCertificationBanner } from './WaterMarkCertificationBanner';
import { isLeadFree } from './WatermarkBadge';
import { FamilySelector } from './FamilySelector';
import { ProductOverview } from './ProductOverview';
import { SquareBubblerDetails } from './SquareBubblerDetails';
import { HdpeBubblerDetails } from './HdpeBubblerDetails';
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
import { shouldShowWaterMarkLeadFreeBadge } from '@/lib/products/watermarkLeadFreeBadge';

const INSTALL_PACKAGE_TAG = 'offer:install-package';
const SHIPPING_QUOTE_ONLY_HANDLE = 'commercial-reverses-osmosis-ro-500lph-water-treatment-machinery-equipment';
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
  const requiresShippingQuote = product.handle === SHIPPING_QUOTE_ONLY_HANDLE;
  const isSquareBubbler = product.handle === 'commercial-water-bubbler-filtered-stainless-steel-watermark-certified-square-des';
  const isHdpeBubbler = product.handle === 'commercial-rust-free-filtered-cold-water-bubbler-wm';
  const isEditorialBubbler = isSquareBubbler || isHdpeBubbler;

  return (
    <VariantSelectionProvider
      variants={product.variants}
      initialVariantId={initialVariantId}
    >
      <ProductViewTracker
        productId={product.id}
        productHandle={product.handle}
        itemName={product.title}
        category={subcategoryLabel}
        brand={product.vendor || 'Enviro Aqua'}
      />
      <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 md:pb-12">
      <div className="mb-7 md:w-[calc((100%-3rem)/2)]"><nav aria-label="Breadcrumb" className="mx-auto flex w-full max-w-[70vh] flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium sm:text-sm">
        <Link href={`/${category}`} className="rounded-md text-black/55 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
          {humaniseSlug(category)}
        </Link>
        <span aria-hidden="true" className="text-black/25">/</span>
        <Link href={`/${category}/${subcategory}`} className="rounded-md font-semibold text-black/80 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue">
          {subcategoryLabel}
        </Link>
      </nav></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div>
          <VariantProductGallery
            images={product.images}
            videos={subcategory === 'bubblers' ? product.videos : []}
            cinematicVideoOverlay={subcategory === 'bubblers'}
            title={product.title}
            showLeadFreeBadge={shouldShowWaterMarkLeadFreeBadge(product.handle, content)}
            watermarkLicence={content.compliance?.watermark?.licenceNumber}
          />
          {subcategory === 'bubblers' && content.compliance?.watermark?.status === 'certified' && (
            <WaterMarkCertificationBanner
              licenceNumber={content.compliance?.watermark?.licenceNumber}
              leadFree={isLeadFree(content) || shouldShowWaterMarkLeadFreeBadge(product.handle, content)}
            />
          )}
        </div>

        <div className="md:sticky md:top-24">
          <h1 className="text-[1.65rem] md:text-[2.1rem] leading-tight font-semibold text-black tracking-tight">
            {product.title}
          </h1>

          {product.handle === THREE_WAY_TAP_HANDLE && (
            <ThreeWayTapHeroBenefits />
          )}

          {content.family && familyPaths && (
            <FamilySelector
              family={content.family}
              currentHandle={product.handle}
              paths={familyPaths}
            />
          )}

          {!showFourStageAlternative && !requiresShippingQuote && (
            <VariantPurchaseControls
              fallbackPrice={product.priceRange.minVariantPrice}
              singleFinish={product.handle === BRUSHED_GOLD_RO_TAP_HANDLE ? 'Brushed Gold' : undefined}
              ctaLabel={content.ctas?.primary ?? undefined}
              offerInstallationAssistance={subcategory === 'bubblers'}
              hideWholeDollarCents={subcategory === 'bubblers'}
              showDispatchCountdown={!(subcategory === 'bubblers' && product.metafields.shipping_tier === 'T5')}
            />
          )}

          {requiresShippingQuote && (
            <div className="mt-5 rounded-lg border border-brand-blue/25 bg-brand-blue-light/40 p-5">
              <p className="text-sm font-semibold text-black">SKU: EA-WF-RO-13</p>
              <p className="mt-3 text-3xl font-bold text-black">{formatMoney(product.priceRange.minVariantPrice)}</p>
              <p className="mt-1 text-sm text-black/60">inc GST · Shipping quoted separately</p>
              <h2 className="mt-5 text-lg font-semibold text-black">Contact us for a shipping quote to purchase</h2>
              <p className="mt-2 text-sm leading-6 text-black/75">
                Our team will review your delivery location and freight requirements and provide a shipping quote before you purchase this system.
              </p>
              <a
                href="mailto:info@enviroaqua.com.au?subject=Shipping%20Quote%20-%20500%20LPH%20RO%20Plant"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-brand-blue px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover"
              >
                Contact Us for Shipping Quote
              </a>
              <p className="mt-3 text-center text-sm text-black/70">
                Or call <a href="tel:+61287728162" className="font-semibold underline underline-offset-4">(02) 8772 8162</a>
              </p>
            </div>
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
            <CertificationSlot content={content} hideCertifiedBadge={subcategory === 'bubblers'} />
          </div>


          {!requiresShippingQuote && (
            <ShippingTierBlock
              tier={product.metafields.shipping_tier}
              productHandle={product.handle}
              combinedBubblerShipping={subcategory === 'bubblers'}
            />
          )}

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

      {!isEditorialBubbler && <HeadlineSpecs specs={content.headlineSpecs} />}
      {product.handle === THREE_WAY_TAP_HANDLE && (
        <ThreeWayTapSalesSections />
      )}
      {isSquareBubbler ? (
        <SquareBubblerDetails content={content} />
      ) : isHdpeBubbler ? (
        <HdpeBubblerDetails content={content} />
      ) : (
        <>
          <FullSpecs specs={content.fullSpecs} />
          <ProductOverview
            description={content.description}
            shortDescription={content.shortDescription}
          />
          <ProductFeatures features={content.features} />
          <RecommendedFor items={content.recommendedFor} />
          <ComplianceSection compliance={content.compliance} />
        </>
      )}
      {content.faq && content.faq.length > 0 && (
        isEditorialBubbler ? (
          <section className="mt-16 border-t border-black/10 pt-12 md:mt-20 md:pt-16" aria-labelledby="square-bubbler-faq-heading">
            <div className="mx-auto max-w-5xl">
              <div className="mb-9 text-center md:mb-12">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">Helpful information</p>
                <h2 id="square-bubbler-faq-heading" className="mt-3 text-2xl font-semibold tracking-tight text-black md:text-3xl">
                  Frequently asked questions
                </h2>
                <p className="mt-3 text-sm leading-7 text-black/60">{isHdpeBubbler ? 'Everything you need to know about your granite-look drinking fountain.' : 'Everything you need to know before choosing your water bubbler.'}</p>
              </div>
              <FaqAccordion items={content.faq} variant="minimal" />
            </div>
          </section>
        ) : (
          <section className="mt-10 border-t border-gray-200 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-8 md:gap-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
                  Questions about this model
                </h2>
                {subcategory === 'bubblers' && (
                  <p className="mt-3 text-sm text-black/70">
                    For a side-by-side comparison of cooling, cabinet, bottle-fill and location options, see the{' '}
                    <Link href="/commercial-water-bubblers" className="font-semibold text-brand-blue hover:underline underline-offset-4">
                      commercial water bubbler guide
                    </Link>.
                  </p>
                )}
              </div>
              <FaqAccordion items={content.faq} />
            </div>
          </section>
        )
      )}
      {subcategory === 'dosing-tanks' && <DosingTankComparison />}

      {!showFourStageAlternative && !requiresShippingQuote && (
        <VariantBuyBanner
          fallbackPrice={product.priceRange.minVariantPrice}
          ctaLabel={content.ctas?.primary ?? undefined}
          minimal={isEditorialBubbler}
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

      {!showFourStageAlternative && !requiresShippingQuote && (
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
