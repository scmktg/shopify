import { unstable_cache } from 'next/cache';
import { shopifyClient } from '../client';
import { PRODUCT_FRAGMENT } from '../fragments';
import { transformShopifyProduct } from '../transformers';
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

async function fetchProductByHandle(handle: string): Promise<Product | null> {
  const { data, errors } =
    await shopifyClient.request<ShopifyProductByHandleResponse>(
      GET_PRODUCT_BY_HANDLE,
      { variables: { handle } },
    );

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
      `Failed to fetch product "${handle}": ${firstMessage}`,
      { cause: errors },
    );
  }

  if (!data?.product) return null;
  return transformShopifyProduct(data.product);
}

export function getProductByHandle(handle: string): Promise<Product | null> {
  const cached = unstable_cache(
    () => fetchProductByHandle(handle),
    ['product-by-handle', handle],
    { revalidate: 60, tags: ['products', `product:${handle}`] },
  );
  return cached();
}
