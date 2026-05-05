import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product';
import { getProductUrl, isWatermarkCertified } from '@/lib/utils/productUrl';
import { PriceDisplay } from './PriceDisplay';

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = getProductUrl(product.tags, product.handle);
  const certified = isWatermarkCertified(product.tags);
  const image = product.featuredImage;

  return (
    <article className="group">
      <Link
        href={href}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded"
      >
        <div className="relative aspect-square overflow-hidden rounded border border-gray-200 bg-white">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 transition-opacity group-hover:opacity-90"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              No image
            </div>
          )}
          {certified && (
            <span className="absolute top-2 left-2 inline-flex items-center bg-brand-blue text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded">
              WaterMark Certified
            </span>
          )}
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-medium text-black line-clamp-2 group-hover:underline underline-offset-4">
            {product.title}
          </h3>
          <PriceDisplay
            money={product.price}
            className="mt-1 block text-sm font-semibold text-black"
          />
        </div>
      </Link>
    </article>
  );
}
