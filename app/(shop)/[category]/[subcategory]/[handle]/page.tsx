import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/ProductDetail';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';

interface ProductPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    handle: string;
  }>;
}

const META_DESCRIPTION_MAX = 155;

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return {};

  const title = product.seo.title ?? product.title;
  const description =
    product.seo.description ?? truncate(product.description, META_DESCRIPTION_MAX);
  const images = product.featuredImage ? [product.featuredImage.url] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { category, subcategory, handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      category={category}
      subcategory={subcategory}
    />
  );
}
