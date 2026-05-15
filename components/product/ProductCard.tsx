import Image from 'next/image';
import Link from 'next/link';
import type { ProductCardData } from '@/types/product';
import { getProductUrl } from '@/lib/utils/productUrl';
import { PriceDisplay } from './PriceDisplay';
import { ProductCardStars } from './ProductCardStars';

interface ProductCardProps {
  product: ProductCardData;
}

/**
 * Returns true when the variant prices span a range — the card then
 * renders "from $X" instead of a single price. Numeric compare so
 * "129.95" vs "129.9500" don't trigger a spurious range.
 */
function isPriceRange(product: ProductCardData): boolean {
  const lo = Number.parseFloat(product.price.amount);
  const hi = Number.parseFloat(product.priceMax.amount);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return false;
  return hi - lo > 0.005;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = getProductUrl(product.handle);
  const image = product.featuredImage;
  const showFrom = isPriceRange(product);

  return (
    <article className="group relative">
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
          {product.watermarkLicence && (
            <span
              role="img"
              aria-label={`WaterMark certified, licence ${product.watermarkLicence}`}
              title={`WaterMark licence ${product.watermarkLicence}`}
              className="absolute top-2 left-2 inline-flex items-center gap-1 rounded bg-wmk-red px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
            >
              <span aria-hidden="true">WMK</span>
              <span className="sr-only">WaterMark certified</span>
            </span>
          )}
        </div>
        <div className="mt-3">
          <h3 className="text-sm font-medium text-black line-clamp-2 group-hover:underline underline-offset-4">
            {product.title}
          </h3>
          {product.keySpec && (
            <p className="mt-1 text-xs text-black/60 line-clamp-1">
              {product.keySpec}
            </p>
          )}
          <ProductCardStars rating={product.rating} />
          <p className="mt-1 text-sm font-semibold text-black">
            {showFrom && (
              <span className="text-xs font-normal text-black/60 mr-1">
                from
              </span>
            )}
            <PriceDisplay money={product.price} />
          </p>
        </div>
      </Link>
    </article>
  );
}
