'use server';

import { unstable_cache } from 'next/cache';
import {
  shopifyClient,
  type ShopifyClientResponse,
  type ShopifyResponseErrors,
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

const MAX_FETCH_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [250, 750];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableShopifyError(errors: ShopifyResponseErrors): boolean {
  const status = errors.networkStatusCode;
  return status === undefined || status === 408 || status === 429 || status >= 500;
}

async function fetchProducts(options: GetProductsOptions): Promise<ProductsPage> {
  const first = Math.min(Math.max(options.first ?? 24, 1), 100);
  const variables = {
    query: options.query ?? null,
    first,
    after: options.after ?? null,
    sortKey: options.sortKey ?? null,
    reverse: options.reverse ?? false,
  };

  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const result: ShopifyClientResponse<RawResponse> =
        await shopifyClient.request<RawResponse>(QUERY, { variables });
      const { data, errors } = result;

      if (errors) {
        const firstMessage =
          errors.graphQLErrors?.[0]?.message ??
          errors.message ??
          'Unknown Shopify error';
        const retryable = isRetryableShopifyError(errors);

        console.error(
          `[shopify] getProducts attempt ${attempt}/${MAX_FETCH_ATTEMPTS} failed:`,
          JSON.stringify(errors, null, 2),
        );

        if (retryable && attempt < MAX_FETCH_ATTEMPTS) {
          await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 750);
          continue;
        }

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
    } catch (error) {
      if (attempt >= MAX_FETCH_ATTEMPTS) throw error;

      console.warn(
        `[shopify] getProducts network attempt ${attempt}/${MAX_FETCH_ATTEMPTS} failed; retrying`,
        error,
      );
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 750);
    }
  }

  return EMPTY_PAGE;
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
