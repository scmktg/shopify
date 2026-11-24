'use server';

import {
  shopifyClient,
  type ShopifyClientResponse,
} from '../client';
import { getProducts } from './getProducts';
import { rankProducts } from '@/lib/products/searchRelevance';
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

  // Reuse the cached, paginated live catalogue, including newly published products.
  try {
    const catalogue: ProductCardData[] = [];
    let after: string | null = null;
    do {
      const page = await getProducts({ first: 100, after });
      catalogue.push(...page.products);
      const next = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
      if (next && next === after) throw new Error('Repeated catalogue cursor');
      after = next;
    } while (after);
    const ranked = rankProducts(catalogue, trimmed);
    if (ranked.length) return ranked.slice(0, safeLimit);
  } catch (error) {
    console.error('[shopify] catalogue search fallback:', error);
  }

  // Preserve Shopify native search for matches outside the local card fields
  // (such as descriptions) or if the catalogue request fails.
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
