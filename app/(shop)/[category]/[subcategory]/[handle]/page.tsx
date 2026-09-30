import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { findSubcategory } from '@/content/categories';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import {
  getAllProductContent,
  getProductContent,
} from '@/lib/products/getProductContent';
import { markdownToPlainText } from '@/lib/products/markdown';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, productSchema } from '@/lib/seo/jsonld';

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    handle: string;
  }>;
  searchParams?: Promise<{
    variant?: string;
  }>;
}

// ISR — page is statically rendered and refreshed every 5 minutes.
// The two underlying fetches (Shopify product, products.json content)
// are themselves cached, so revalidation is cheap.
export const revalidate = 300;

const META_DESCRIPTION_MAX = 155;

interface DosingCompanionConfig {
  handle: string;
  discountAmount: string;
}

/** Matching standalone tank/bund products and their automatic pair saving. */
const DOSING_COMPANIONS: Readonly<Record<string, DosingCompanionConfig>> = {
  'chemical-dosing-tank-bunded-50l': {
    handle: 'chemical-bund-50l',
    discountAmount: '19.00',
  },
  'chemical-bund-50l': {
    handle: 'chemical-dosing-tank-bunded-50l',
    discountAmount: '19.00',
  },
  'chemical-dosing-tank-bunded-100l': {
    handle: 'chemical-bund-100l',
    discountAmount: '29.00',
  },
  'chemical-bund-100l': {
    handle: 'chemical-dosing-tank-bunded-100l',
    discountAmount: '29.00',
  },
  'chemical-dosing-tank-bunded-200l': {
    handle: 'chemical-bund-200l',
    discountAmount: '39.00',
  },
  'chemical-bund-200l': {
    handle: 'chemical-dosing-tank-bunded-200l',
    discountAmount: '39.00',
  },
  'chemical-dosing-tank-300l': {
    handle: 'chemical-bund-400l',
    discountAmount: '49.00',
  },
  'chemical-bund-400l': {
    handle: 'chemical-dosing-tank-300l',
    discountAmount: '49.00',
  },
};

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

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { category, subcategory, handle } = await params;
  const requestedVariantId = (await searchParams)?.variant ?? null;

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

  const companionConfig = DOSING_COMPANIONS[handle] ?? null;
  const companionProduct = companionConfig
    ? await getProductByHandle(companionConfig.handle)
    : null;
  const companionVariant = companionProduct?.variants[0] ?? null;
  const companion =
    companionProduct && companionVariant && companionConfig
      ? {
          title: companionProduct.title,
          variantId: companionVariant.id,
          price: companionVariant.price,
          bundleDiscount: {
            amount: companionConfig.discountAmount,
            currencyCode: companionVariant.price.currencyCode,
          },
          available: companionVariant.availableForSale,
        }
      : null;

  const node = findSubcategory(category, subcategory);
  const pathname = `/${category}/${subcategory}/${handle}`;
  // Resolve sibling handles to their canonical paths (one segment per
  // category/subcategory tuple) so the FamilySelector can navigate
  // between variants without the products map crossing the client
  // boundary. Returns null when the product has no `family` block —
  // the component renders nothing in that case.
  const familyPaths = content.family
    ? resolveFamilyPaths(content.family.siblings.map((s) => s.handle))
    : null;
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
        familyPaths={familyPaths}
        initialVariantId={requestedVariantId}
        companion={companion}
      />
    </>
  );
}

/**
 * Returns a Map of `handle -> "/<category>/<subcategory>/<handle>/"`
 * for every requested sibling that exists in products.json. Unknown
 * handles are silently dropped — the FamilySelector renders any
 * missing entry as a disabled chip, which is a graceful degradation
 * if a family member has been archived in Shopify but not yet pruned
 * from the family list.
 */
function resolveFamilyPaths(
  handles: ReadonlyArray<string>,
): ReadonlyMap<string, string> {
  const all = getAllProductContent();
  const map = new Map<string, string>();
  for (const handle of handles) {
    const entry = all[handle];
    if (!entry) continue;
    const [c, s] = entry.categories;
    map.set(handle, `/${c}/${s}/${handle}/`);
  }
  return map;
}
