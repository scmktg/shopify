'use server';

import {
  shopifyClient,
  type ShopifyClientResponse,
} from '../client';
import { PRODUCT_CARD_FRAGMENT } from '../fragments';
import { transformShopifyProductCard } from '../transformers';
import type { ProductCardData } from '@/types/product';
import { isRetiredProductHandle } from '@/lib/products/retired-products.cjs';
import type { ShopifyProductCardRaw } from '@/types/shopify';

const QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query ProductSearch($query: String!, $limit: Int!) {
    search(query: $query, types: [PRODUCT], first: $limit, prefix: LAST, unavailableProducts: LAST) {
      nodes {
        ... on Product {
          ...ProductCardFields
        }
      }
    }
  }
`;

interface RawResponse {
  search: {
    nodes: ReadonlyArray<ShopifyProductCardRaw>;
  };
}

export async function searchProducts(
  query: string,
  limit = 10,
): Promise<ReadonlyArray<ProductCardData>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const safeLimit = Math.min(Math.max(limit, 1), 24);

  const result: ShopifyClientResponse<RawResponse> =
    await shopifyClient.request<RawResponse>(QUERY, {
      variables: { query: trimmed, limit: safeLimit },
    });
  const { data, errors } = result;

  if (errors) {
    console.error(
      '[shopify] searchProducts GraphQL errors:',
      JSON.stringify(errors, null, 2),
    );
    return [];
  }

  if (!data?.search?.nodes) return [];

  return data.search.nodes.map(transformShopifyProductCard)
    .filter((product) => !isRetiredProductHandle(product.handle));
}
