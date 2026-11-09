import { AnimatedThreeWayTapShowcase } from '@/components/home/AnimatedThreeWayTapShowcase';
import { ThreeWayTapDimensions } from './ThreeWayTapDimensions';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import type { Product, ProductCardData } from '@/types/product';

const FINISH_HANDLES = [
  '3-way-filtered-kitchen-tap-for-ro-water-filters-mixer-in-black-nickel-gold-and-c',
  '3-way-filtered-kitchen-mixer-tap-brushed-gold-watermark-wels',
  '3-way-filtered-kitchen-mixer-tap-stainless-steel-watermark-wels',
  '3-way-filtered-kitchen-mixer-tap-polished-chrome-watermark-wels',
] as const;

function toCardData(product: Product): ProductCardData {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    productType: product.productType,
    tags: product.tags,
    featuredImage: product.featuredImage,
    price: product.priceRange.minVariantPrice,
    housingSize: product.metafields.housing_size,
    variants: product.variants,
  };
}

export async function ThreeWayTapFinishEditorial({ mode = 'finishes' }: { mode?: 'finishes' | 'dimensions' }) {
  const products = await Promise.all(FINISH_HANDLES.map(async (handle) => {
    const product = await getProductByHandle(handle);
    return product ? toCardData(product) : null;
  }));

  // Avoid an empty animation if Shopify's finish images are unavailable.
  if (!products.some((product) => product?.featuredImage?.url)) return null;

  return mode === 'dimensions'
    ? <ThreeWayTapDimensions products={products} />
    : <AnimatedThreeWayTapShowcase products={products} mode="product" />;
}
