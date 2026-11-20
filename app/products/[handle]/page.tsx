import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductContent } from '@/lib/products/getProductContent';
import { getProductUrl } from '@/lib/utils/productUrl';
import { VariantSelectionProvider } from '@/components/product/VariantSelectionProvider';
import { VariantProductGallery } from '@/components/product/VariantProductGallery';
import { VariantPurchaseControls } from '@/components/product/VariantPurchaseControls';
import { ProductDeliveryInsights } from '@/components/product/ProductDeliveryInsights';
import { ProductViewTracker } from '@/components/analytics/ProductViewTracker';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { absoluteUrl } from '@/lib/seo/siteUrl';

export const revalidate = 300;

interface Props {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ variant?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  if (getProductContent(handle)) return {};
  const product = await getProductByHandle(handle);
  if (!product) return { robots: { index: false } };
  const description = product.seo.description || product.description.slice(0, 155);
  const image = product.featuredImage?.url;
  return {
    title: product.seo.title || product.title,
    description,
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: { title: product.seo.title || product.title, description, ...(image ? { images: [image] } : {}) },
  };
}

/**
 * A staff-editable standard PDP sourced entirely from Shopify.
 * Existing GitHub-enhanced pages retain their established SEO URLs.
 */
export default async function ShopifyProductPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const custom = getProductContent(handle);
  if (custom) permanentRedirect(getProductUrl(handle));

  const product = await getProductByHandle(handle);
  if (!product) notFound();
  if (!product.variants.length) notFound();

  const variantId = (await searchParams)?.variant ?? null;
  const imageUrls = product.images.map(image => image.url);
  const anyAvailable = product.variants.some(variant => variant.availableForSale);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url: absoluteUrl(`/products/${product.handle}`),
    image: imageUrls,
    sku: product.variants[0]?.sku ?? undefined,
    brand: { '@type': 'Brand', name: product.vendor || 'Enviro Aqua' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      offerCount: product.variants.length,
      availability: anyAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${product.handle}`),
    },
  };

  return (
    <>
      <JsonLdScript data={schema} />
      <VariantSelectionProvider variants={product.variants} initialVariantId={variantId}>
        <ProductViewTracker
          productId={product.id}
          productHandle={product.handle}
          itemName={product.title}
          brand={product.vendor || 'Enviro Aqua'}
          category={product.productType || undefined}
        />
        <article className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="mb-7 text-sm">
            <Link href="/" className="text-black/60 hover:text-brand-blue">Home</Link>
            <span className="mx-2 text-black/30" aria-hidden="true">/</span>
            <span className="font-medium text-black">Products</span>
          </nav>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 md:gap-12">
            <VariantProductGallery images={product.images} videos={product.videos} title={product.title} />
            <div className="min-w-0 md:sticky md:top-24">
              <h1 className="text-[1.8rem] font-semibold leading-tight tracking-tight text-black md:text-[2.2rem]">
                {product.title}
              </h1>
              <VariantPurchaseControls fallbackPrice={product.priceRange.minVariantPrice} showDispatchCountdown={false} />
              <ProductDeliveryInsights
                tier={product.metafields.shipping_tier ?? 'T1'}
                bulky={product.metafields.shipping_tier === 'T6' || /fountain|bubbler/i.test(product.productType ?? '')}
                fountain={/drinking fountain|water fountain/i.test(product.title)}
                pickupOnly={product.metafields.shipping_tier === 'T7'}
              />
            </div>
          </div>
          {product.description.trim() && (
            <section className="mt-12 border-t border-gray-100 pt-8">
              <h2 className="mb-4 text-xl font-semibold">Product details</h2>
              <div className="max-w-3xl whitespace-pre-line text-sm leading-7 text-black/75">
                {product.description}
              </div>
            </section>
          )}
        </article>
      </VariantSelectionProvider>
    </>
  );
}
