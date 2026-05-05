'use server';

import { unstable_cache } from 'next/cache';
import {
  shopifyClient,
  type ShopifyClientResponse,
} from '../client';
import { PRODUCT_CARD_FRAGMENT } from '../fragments';
import { transformShopifyProductCard } from '../transformers';
import type { ProductCardData } from '@/types/product';
import type {
  ShopifyConnection,
  ShopifyPageInfo,
  ShopifyProductCardRaw,
} from '@/types/shopify';

export type ProductSortKey =
  | 'BEST_SELLING'
  | 'CREATED_AT'
  | 'PRICE'
  | 'TITLE'
  | 'RELEVANCE';

export interface GetProductsOptions {
  query?: string;
  first?: number;
  after?: string | null;
  sortKey?: ProductSortKey;
  reverse?: boolean;
}

export interface ProductsPage {
  products: ReadonlyArray<ProductCardData>;
  pageInfo: ShopifyPageInfo;
}

const QUERY = /* GraphQL */ `
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts(
    $query: String
    $first: Int!
    $after: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        node {
          ...ProductCardFields
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface RawResponse {
  products: ShopifyConnection<ShopifyProductCardRaw> & {
    pageInfo: ShopifyPageInfo;
  };
}

const EMPTY_PAGE: ProductsPage = {
  products: [],
  pageInfo: { hasNextPage: false, endCursor: null },
};

async function fetchProducts(options: GetProductsOptions): Promise<ProductsPage> {
  const first = Math.min(Math.max(options.first ?? 24, 1), 100);
  const variables = {
    query: options.query ?? null,
    first,
    after: options.after ?? null,
    sortKey: options.sortKey ?? null,
    reverse: options.reverse ?? false,
  };

  const result: ShopifyClientResponse<RawResponse> =
    await shopifyClient.request<RawResponse>(QUERY, { variables });
  const { data, errors } = result;

  if (errors) {
    console.error(
      '[shopify] getProducts GraphQL errors:',
      JSON.stringify(errors, null, 2),
    );
    const firstMessage =
      errors.graphQLErrors?.[0]?.message ??
      errors.message ??
      'Unknown Shopify error';
    throw new Error(`Failed to fetch products: ${firstMessage}`, {
      cause: errors,
    });
  }

  if (!data?.products) return EMPTY_PAGE;

  return {
    products: data.products.edges.map((edge) =>
      transformShopifyProductCard(edge.node),
    ),
    pageInfo: data.products.pageInfo,
  };
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<ProductsPage> {
  const cacheKey = JSON.stringify({
    q: options.query ?? '',
    f: options.first ?? 24,
    a: options.after ?? '',
    s: options.sortKey ?? '',
    r: Boolean(options.reverse),
  });
  const cached = unstable_cache(
    () => fetchProducts(options),
    ['products', cacheKey],
    { revalidate: 300, tags: ['products', 'collections'] },
  );
  return cached();
}
