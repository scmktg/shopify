import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { findCategory, findSubcategory } from '@/content/categories';
import { canonicalProductHandle, getProductContent } from '@/lib/products/getProductContent';
import type { ProductContent } from '@/lib/products/schema';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';

interface ShopifyFallbackPageProps {
  params: Promise<{ handle: string }>;
  searchParams?: Promise<{ variant?: string }>;
}

export const revalidate = 300;

/**
 * Newly created Shopify products get a working PDP immediately.
 * A product with a curated GitHub entry still uses its existing
 * /category/subcategory/handle page, including all custom content.
 */
function fallbackCategories(tags: readonly string[]): [string, string] {
  const categoryTag = tags.find((tag) => tag.startsWith('primary-cat:'));
  const categorySlug = categoryTag?.slice('primary-cat:'.length);
  const category = categorySlug ? findCategory(categorySlug) : null;
  const subcategoryTag = tags.find((tag) => tag.startsWith('sub-cat:'));
  const subcategorySlug = subcategoryTag?.slice('sub-cat:'.length);
  if (category && subcategorySlug && findSubcategory(category.slug, subcategorySlug)) {
    return [category.slug, subcategorySlug];
  }
  // Prefer a valid category even when Shopify's subcategory tag is missing.
  if (category?.subcategories[0]) {
    return [category.slug, category.subcategories[0].slug];
  }
  return ['water-filters', 'commercial'];
}

export async function generateMetadata({ params }: ShopifyFallbackPageProps): Promise<Metadata> {
  const { handle } = await params;
  const canonicalHandle = canonicalProductHandle(handle);
  const product = await getProductByHandle(canonicalHandle);
  if (!product) return {};
  const curated = getProductContent(canonicalHandle);
  if (curated) {
    return { alternates: { canonical: getProductUrl(canonicalHandle) } };
  }
  return {
    title: product.seo.title || product.title,
    description: product.seo.description || product.description?.slice(0, 155),
    alternates: { canonical: `/products/${canonicalHandle}` },
    openGraph: {
      title: product.title,
      images: product.featuredImage ? [product.featuredImage.url] : [],
    },
  };
}

export default async function ShopifyFallbackProductPage({ params, searchParams }: ShopifyFallbackPageProps) {
  const { handle } = await params;
  const canonicalHandle = canonicalProductHandle(handle);
  const product = await getProductByHandle(canonicalHandle);
  if (!product) notFound();

  // Custom GitHub pages always take precedence over the Shopify fallback.
  const curated = getProductContent(canonicalHandle);
  if (curated) permanentRedirect(getProductUrl(canonicalHandle));

  const categories = fallbackCategories(product.tags);
  const content: ProductContent = {
    categories,
    description: product.description || undefined,
  };
  const variant = (await searchParams)?.variant ?? null;

  return (
    <ProductDetail
      product={product}
      content={content}
      category={categories[0]}
      subcategory={categories[1]}
      initialVariantId={variant}
    />
  );
}
