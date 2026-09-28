import { createStorefrontApiClient } from '@shopify/storefront-api-client';

/**
 * Shape of the @shopify/storefront-api-client `request<TData>()` result,
 * pinned explicitly so destructuring `{ data, errors }` does not infer
 * to `any` under strict TypeScript. Use as:
 *
 *   const result: ShopifyClientResponse<MyData> =
 *     await shopifyClient.request<MyData>(QUERY, { variables });
 *   const { data, errors } = result;
 */
export interface ShopifyResponseErrors {
  networkStatusCode?: number;
  message?: string;
  graphQLErrors?: ReadonlyArray<{ message: string }>;
}

export interface ShopifyClientResponse<TData> {
  data?: TData;
  errors?: ShopifyResponseErrors;
}

const storeDomain =
  process.env.SHOPIFY_STORE_DOMAIN ?? 'm5crww-yc.myshopify.com';
const privateAccessToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION ?? '2026-04';

if (!privateAccessToken) {
  throw new Error(
    'SHOPIFY_STOREFRONT_PRIVATE_TOKEN environment variable is required.',
  );
}
export const shopifyClient = createStorefrontApiClient({
  storeDomain,
  apiVersion,
  privateAccessToken,
});
