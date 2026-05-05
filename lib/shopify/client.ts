import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const privateAccessToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION;

if (!storeDomain) {
  throw new Error('SHOPIFY_STORE_DOMAIN environment variable is required.');
}
if (!privateAccessToken) {
  throw new Error(
    'SHOPIFY_STOREFRONT_PRIVATE_TOKEN environment variable is required.',
  );
}
if (!apiVersion) {
  throw new Error('SHOPIFY_API_VERSION environment variable is required.');
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain,
  apiVersion,
  privateAccessToken,
});
