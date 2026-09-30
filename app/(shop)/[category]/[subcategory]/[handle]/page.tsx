import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { findSubcategory } from '@/content/categories';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import {
  canonicalProductHandle,
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

export const revalidate = 300;

const META_DESCRIPTION_MAX = 155;

interface DosingPackageConfig {
  packageHandle: string;
  componentHandle: string;
  discountAmount: string;
}

const DOSING_PACKAGES: Readonly<Record<string, DosingPackageConfig>> = {
  'chemical-dosing-tank-50l': {
    packageHandle: 'chemical-dosing-tank-and-bund-50l',
    componentHandle: 'chemical-bund-50l',
    discountAmount: '19.00',
  },
  'chemical-bund-50l': {
    packageHandle: 'chemical-dosing-tank-and-bund-50l',
    componentHandle: 'chemical-dosing-tank-50l',
    discountAmount: '19.00',
  },
  'chemical-dosing-tank-100l': {
    packageHandle: 'chemical-dosing-tank-and-bund-100l',
    componentHandle: 'chemical-bund-100l',
    discountAmount: '29.00',
  },
  'chemical-bund-100l': {
    packageHandle: 'chemical-dosing-tank-and-bund-100l',
    componentHandle: 'chemical-dosing-tank-100l',
    discountAmount: '29.00',
  },
  'chemical-dosing-tank-200l': {
    packageHandle: 'chemical-dosing-tank-and-bund-200l',
    componentHandle: 'chemical-bund-200l',
    discountAmount: '39.00',
  },
  'chemical-bund-200l': {
    packageHandle: 'chemical-dosing-tank-and-bund-200l',
    componentHandle: 'chemical-dosing-tank-200l',
    discountAmount: '39.00',
  },
  'chemical-dosing-tank-300l': {
    packageHandle: 'chemical-dosing-tank-and-bund-300l',
    componentHandle: 'chemical-bund-400l',
    discountAmount: '49.00',
  },
  'chemical-bund-400l': {
    packageHandle: 'chemical-dosing-tank-and-bund-300l',
    componentHandle: 'chemical-dosing-tank-300l',
    discountAmount: '49.00',
  },
};

const BRAND_SUFFIX_RE = /\s*[\|—–-]\s*Enviro\s*Aqua\s*$/i;

function stripBrandSuffix(title: string): string {
  let out = title;
  while (BRAND_SUFFIX_RE.test(out)) {
    out = out.replace(BRAND_SUFFIX_RE, '').trim();
  }
  return out;
}

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

  const content = getProductContent(handle);
  if (!content) notFound();

  if (
    content.categories[0] !== category ||
    content.categories[1] !== subcategory
  ) {
    notFound();
  }

  const packageConfig = DOSING_PACKAGES[handle] ?? null;
  const [packageProduct, componentProduct] = packageConfig
    ? await Promise.all([
        getProductByHandle(packageConfig.packageHandle),
        getProductByHandle(packageConfig.componentHandle),
      ])
    : [null, null];
  const packageVariant = packageProduct?.variants[0] ?? null;
  const currentIsTank = handle.startsWith('chemical-dosing-tank-');
  const tankProduct = packageConfig
    ? currentIsTank
      ? product
      : componentProduct
    : null;
  const bundProduct = packageConfig
    ? currentIsTank
      ? componentProduct
      : product
    : null;
  const packageUpgrade =
    packageConfig && packageProduct && packageVariant
      ? {
          title: packageProduct.title,
          href: `/${category}/${subcategory}/${packageConfig.packageHandle}`,
          price: packageVariant.price,
          savings: {
            amount: packageConfig.discountAmount,
            currencyCode: packageVariant.price.currencyCode,
          },
          available: packageVariant.availableForSale,
          tank: tankProduct
            ? {
                title: tankProduct.title,
                image: tankProduct.featuredImage ?? tankProduct.images[0] ?? null,
              }
            : null,
          bund: bundProduct
            ? {
                title: bundProduct.title,
                image: bundProduct.featuredImage ?? bundProduct.images[0] ?? null,
              }
            : null,
          componentLink: componentProduct
            ? {
                title: componentProduct.title,
                href: `/${category}/${subcategory}/${packageConfig.componentHandle}`,
              }
            : null,
        }
      : null;

  const node = findSubcategory(category, subcategory);
  const pathname = `/${category}/${subcategory}/${handle}`;
  const familyPaths = content.family
    ? resolveFamilyPaths(content.family.siblings.map((s) => s.handle))
    : null;
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
        packageUpgrade={packageUpgrade}
      />
    </>
  );
}

function resolveFamilyPaths(
  handles: ReadonlyArray<string>,
): ReadonlyMap<string, string> {
  const all = getAllProductContent();
  const map = new Map<string, string>();
  for (const handle of handles) {
    const canonicalHandle = canonicalProductHandle(handle);
    const entry = all[canonicalHandle];
    if (!entry) continue;
    const [c, s] = entry.categories;
    map.set(handle, `/${c}/${s}/${canonicalHandle}/`);
  }
  return map;
}
