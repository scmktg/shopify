import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { findSubcategory } from '@/content/categories';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductContent } from '@/lib/products/getProductContent';
import { markdownToPlainText } from '@/lib/products/markdown';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, productSchema } from '@/lib/seo/jsonld';

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    handle: string;
  }>;
}

// ISR — page is statically rendered and refreshed every 5 minutes.
// The two underlying fetches (Shopify product, products.json content)
// are themselves cached, so revalidation is cheap.
export const revalidate = 300;

const META_DESCRIPTION_MAX = 155;

/**
 * The root layout sets a title template of `%s | Enviro Aqua`, so the
 * value returned here must NOT already carry that suffix. Some legacy
 * products.json entries (imported from the previous WordPress build)
 * include " | Enviro Aqua" inside `seo.title`, which compounded to
 * "Foo | Enviro Aqua | Enviro Aqua" in the rendered <title>. Strip
 * any trailing brand suffix as a defence-in-depth measure so a future
 * re-import cannot reintroduce the duplicate.
 */
const BRAND_SUFFIX_RE = /\s*[\|—–-]\s*Enviro\s*Aqua\s*$/i;

function stripBrandSuffix(title: string): string {
  let out = title;
  // Strip repeatedly in case the suffix was appended more than once.
  while (BRAND_SUFFIX_RE.test(out)) {
    out = out.replace(BRAND_SUFFIX_RE, '').trim();
  }
  return out;
}

/**
 * Resolve the meta description with the documented fallback chain:
 *   1. content.seo.description
 *   2. content.shortDescription
 *   3. first ~155 chars of plain-text content.description (markdown
 *      stripped via the same renderer pipeline used for the page).
 *
 * Never reads from Shopify's `description` / `seo` fields — those
 * carry WordPress-import debris and would re-introduce the meta-tag
 * leak the brief calls out.
 */
async function resolveMetaDescription(
  content: ReturnType<typeof getProductContent>,
): Promise<string> {
  if (!content) return '';
  if (content.seo?.description?.trim()) return content.seo.description.trim();
  if (content.shortDescription?.trim()) return content.shortDescription.trim();
  return markdownToPlainText(content.description, META_DESCRIPTION_MAX);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category, subcategory, handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};
  const content = getProductContent(handle);
  if (!content) return {};

  const title = stripBrandSuffix(content.seo?.title ?? product.title);
  const description = await resolveMetaDescription(content);
  const ogImage =
    content.seo?.ogImage ??
    (product.featuredImage ? product.featuredImage.url : null);
  const images = ogImage ? [ogImage] : [];

  return {
    title,
    description,
    alternates: {
      canonical: `/${category}/${subcategory}/${handle}`,
    },
    openGraph: {
      title,
      description,
      images,
    },
    twitter: {
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, subcategory, handle } = await params;

  if (!findSubcategory(category, subcategory)) notFound();

  const product = await getProductByHandle(handle);
  if (!product) notFound();

  // Per the URL contract: every Shopify handle must have a
  // products.json entry, enforced at build time. notFound() guards
  // against the dev/edge case where the validator hasn't run.
  const content = getProductContent(handle);
  if (!content) notFound();

  // The route's [category]/[subcategory] must match the entry's
  // categories tuple. Source of truth is products.json — we no
  // longer derive routing from Shopify tags.
  if (
    content.categories[0] !== category ||
    content.categories[1] !== subcategory
  ) {
    notFound();
  }

  const node = findSubcategory(category, subcategory);
  const pathname = `/${category}/${subcategory}/${handle}`;
  // Cap at 5000 chars: search engines truncate beyond this anyway,
  // and bounding the JSON-LD payload keeps the inline <script> tag
  // small. Long-form description content still renders in full on
  // the page itself via ProductOverview.
  const descriptionPlainText = await markdownToPlainText(
    content.description,
    5000,
  );

  return (
    <>
      <JsonLdScript
        data={[
          productSchema(product, content, pathname, descriptionPlainText),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node?.category.label ?? category, path: `/${category}` },
            {
              name: node?.subcategory.label ?? subcategory,
              path: `/${category}/${subcategory}`,
            },
            { name: product.title, path: pathname },
          ]),
        ]}
      />
      <ProductDetail
        product={product}
        content={content}
        category={category}
        subcategory={subcategory}
      />
    </>
  );
}
