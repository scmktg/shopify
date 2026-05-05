'use server';

import { shopifyClient } from '../client';
import { PRODUCT_CARD_FRAGMENT } from '../fragments';
import { transformShopifyProductCard } from '../transformers';
import type { ProductCardData } from '@/types/product';
import type { ShopifyProductCardRaw } from '@/types/shopify';

const QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, types: [PRODUCT], limit: $limit) {
      products {
        ...ProductCardFields
      }
    }
  }
`;

interface RawResponse {
  predictiveSearch: {
    products: ReadonlyArray<ShopifyProductCardRaw>;
  };
}

export async function searchProducts(
  query: string,
  limit = 10,
): Promise<ReadonlyArray<ProductCardData>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const safeLimit = Math.min(Math.max(limit, 1), 20);

  const { data, errors } = await shopifyClient.request<RawResponse>(QUERY, {
    variables: { query: trimmed, limit: safeLimit },
  });

  if (errors) {
    console.error(
      '[shopify] searchProducts GraphQL errors:',
      JSON.stringify(errors, null, 2),
    );
    return [];
  }

  if (!data?.predictiveSearch?.products) return [];

  return data.predictiveSearch.products.map(transformShopifyProductCard);
}
