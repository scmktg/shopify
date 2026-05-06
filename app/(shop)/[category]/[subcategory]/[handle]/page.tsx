import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { findSubcategory } from '@/content/categories';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductCategoryTags } from '@/lib/utils/productUrl';
import {
  metaDescriptionFromHtml,
  sanitiseProductDescriptionHtml,
} from '@/lib/content/productHtml';
import { JsonLdScript } from '@/lib/seo/JsonLdScript';
import { breadcrumbSchema, productSchema } from '@/lib/seo/jsonld';

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    handle: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category, subcategory, handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  const title = product.seo.title ?? product.title;
  // Never derive meta description from product.description (plain
  // text) — that field carries the same WordPress import debris in
  // unwrapped form and leaks into Google's SERP snippet. Use the
  // SEO description metafield first, then fall back to the first
  // clean paragraph of the sanitised HTML.
  const description =
    product.seo.description?.trim() ||
    metaDescriptionFromHtml(
      sanitiseProductDescriptionHtml(product.descriptionHtml),
    );
  const images = product.featuredImage ? [product.featuredImage.url] : [];

  return {
    title,
    description,
    alternates: {
      canonical: `/${category}/${subcategory}/${handle}/`,
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

  const productCategory = getProductCategoryTags(product.tags);
  if (
    productCategory.category !== category ||
    productCategory.subcategory !== subcategory
  ) {
    notFound();
  }

  const node = findSubcategory(category, subcategory);
  const pathname = `/${category}/${subcategory}/${handle}/`;

  return (
    <>
      <JsonLdScript
        data={[
          productSchema(product, pathname),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: node?.category.label ?? category, path: `/${category}/` },
            {
              name: node?.subcategory.label ?? subcategory,
              path: `/${category}/${subcategory}/`,
            },
            { name: product.title, path: pathname },
          ]),
        ]}
      />
      <ProductDetail
        product={product}
        category={category}
        subcategory={subcategory}
      />
    </>
  );
}
