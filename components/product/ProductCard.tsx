import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';
import { PriceDisplay } from './PriceDisplay';
import { WatermarkBadge, isWatermarkCertified } from './WatermarkBadge';

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = getProductUrl(product.handle);
  const image = product.featuredImage;
  const watermarkCertified = isWatermarkCertified({ tags: product.tags });

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
              // Image is decorative — the card's <h3> is the labelled
              // text immediately below and carries the meaning. Empty
              // alt prevents the merchant's altText from rendering as
              // visible fallback if the image fails to load.
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-contain p-2 transition-opacity group-hover:opacity-90"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gray-100"
            />
          )}
          {watermarkCertified && (
            <WatermarkBadge
              variant="square"
              className="absolute top-2 right-2"
            />
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
