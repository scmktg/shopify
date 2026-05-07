import Image from 'next/image';
import Link from 'next/link';
import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';
import { getProductUrl } from '@/lib/utils/productUrl';
import { PriceDisplay } from './PriceDisplay';
import { SimpleAddToCart } from '@/components/cart/SimpleAddToCart';

import type { Product } from '@/types/product';

interface BoughtTogetherProps {
  /** Handles from products.json[handle].upsells.boughtTogether. */
  handles: ReadonlyArray<string>;
}

interface BoughtTogetherCard {
  product: Product;
  handle: string;
}

/**
 * "Frequently bought together" rail. Each card has image, title,
 * price, and an inline Add-to-cart button — this is the basket
 * builder, distinct from the "More in this category" rail (which
 * is link-only).
 *
 * Hides the rail entirely when `handles` is empty (an empty
 * cross-sell is worse than no cross-sell). Cards for handles that
 * don't resolve in Shopify are silently skipped in production with
 * a dev warning logged — a missing card is less bad than a broken
 * one.
 */
export async function BoughtTogether({ handles }: BoughtTogetherProps) {
  if (handles.length === 0) return null;

  // Guard the whole fetch path — a single Shopify-side hiccup
  // shouldn't take down the entire product page. Per-handle
  // try/catch already catches individual fetch failures; this
  // outer guard is defensive against anything else (network
  // teardown, GraphQL deserialisation, Promise.all rejection).
  let cards: ReadonlyArray<BoughtTogetherCard> = [];
  try {
    const products = await Promise.all(
      handles.map(async (handle) => {
        try {
          return await getProductByHandle(handle);
        } catch {
          return null;
        }
      }),
    );

    const collected: BoughtTogetherCard[] = [];
    products.forEach((product, index) => {
      if (!product) return;
      const handle = handles[index];
      if (!handle) return;
      collected.push({ product, handle });
    });
    cards = collected;
  } catch (error) {
    console.error('[BoughtTogether] fetch failed', error);
    if (process.env.NODE_ENV !== 'production') throw error;
    return null;
  }

  if (cards.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `[BoughtTogether] None of [${handles.join(', ')}] resolved in Shopify. Hiding rail.`,
      );
    }
    return null;
  }

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-2xl font-semibold text-black tracking-tight">
        Frequently bought together
      </h2>
      <ul
        role="list"
        className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {cards.map(({ product, handle }) => {
          const variant = product.variants[0];
          const image = product.featuredImage;
          const href = getProductUrl(handle);
          return (
            <li
              key={handle}
              className="flex gap-3 border border-gray-200 rounded p-3"
            >
              <Link
                href={href}
                className="relative flex-shrink-0 w-20 h-20 bg-white border border-gray-100 rounded overflow-hidden"
              >
                {image && (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                )}
              </Link>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <Link href={href} className="block">
                  <h3 className="text-sm font-medium text-black line-clamp-2 hover:underline underline-offset-4">
                    {product.title}
                  </h3>
                  <PriceDisplay
                    money={product.priceRange.minVariantPrice}
                    className="mt-1 block text-sm font-semibold text-black"
                  />
                </Link>
                {variant && (
                  <div className="mt-2">
                    <SimpleAddToCart
                      variantId={variant.id}
                      available={variant.availableForSale}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
