import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';

const SUGGESTED_HANDLES = [
  'commercial-water-bubbler',
  'sediment-cartridge-10-x-2-5',
  'complete-bathroom-package-1b-matte-black-watermark-certified-wels-r',
] as const;

async function main(): Promise<void> {
  const handle = process.argv[2] ?? SUGGESTED_HANDLES[0];

  console.log(`[test:shopify] Fetching product by handle: "${handle}"`);
  const product = await getProductByHandle(handle);

  if (!product) {
    console.log(`[test:shopify] No product found for handle "${handle}".`);
    return;
  }

  console.log('[test:shopify] Product:');
  console.log(JSON.stringify(product, null, 2));
}

main().catch((error: unknown) => {
  console.error('[test:shopify] Failed:', error);
  process.exit(1);
});
