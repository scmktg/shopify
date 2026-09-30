import { unstable_cache } from 'next/cache';
import {
  shopifyClient,
  type ShopifyClientResponse,
} from '../client';
import { PRODUCT_FRAGMENT } from '../fragments';
import { transformShopifyProduct } from '../transformers';
import { canonicalProductHandle } from '@/lib/products/getProductContent';
import type { Product } from '@/types/product';
import type { ShopifyProductByHandleResponse } from '@/types/shopify';

const GET_PRODUCT_BY_HANDLE = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

/**
 * Uncached fetch of a single product by handle.
 *
 * Exported alongside the cached `getProductByHandle` so out-of-
 * request callers (CLI scripts, build-time tooling) can reach
 * Shopify directly. `unstable_cache` requires Next.js's request-
 * scoped incremental cache, which doesn't exist in a plain Node
 * script context — calling the cached version from a CLI script
 * throws `Invariant: incrementalCache missing in unstable_cache`.
 *
 * App Router code paths should continue to use `getProductByHandle`
 * (the cached version) so multiple components rendering the same
 * product within a request share one Shopify roundtrip.
 */
export async function fetchProductByHandle(
  handle: string,
): Promise<Product | null> {
  const canonicalHandle = canonicalProductHandle(handle);
  const result: ShopifyClientResponse<ShopifyProductByHandleResponse> =
    await shopifyClient.request<ShopifyProductByHandleResponse>(
      GET_PRODUCT_BY_HANDLE,
      { variables: { handle: canonicalHandle } },
    );
  const { data, errors } = result;

  if (errors) {
    console.error(
      '[shopify] getProductByHandle GraphQL errors:',
      JSON.stringify(errors, null, 2),
    );
    const firstMessage =
      errors.graphQLErrors?.[0]?.message ??
      errors.message ??
      'Unknown Shopify error';
    throw new Error(
      `Failed to fetch product "${canonicalHandle}": ${firstMessage}`,
      { cause: errors },
    );
  }

  if (!data?.product) return null;
  return transformShopifyProduct(data.product);
}

export function getProductByHandle(handle: string): Promise<Product | null> {
  const canonicalHandle = canonicalProductHandle(handle);
  const cached = unstable_cache(
    () => fetchProductByHandle(canonicalHandle),
    ['product-by-handle', canonicalHandle],
    { revalidate: 60, tags: ['products', `product:${canonicalHandle}`] },
  );
  return cached();
}
