import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';

export const dynamic = 'force-dynamic';

const TEST_HANDLE = 'commercial-water-bubbler';

export default async function TestShopifyPage() {
  let body: string;
  try {
    const product = await getProductByHandle(TEST_HANDLE);
    body =
      product === null
        ? `No product found for handle "${TEST_HANDLE}".`
        : JSON.stringify(product, null, 2);
  } catch (error) {
    body = `Error fetching "${TEST_HANDLE}":\n\n${error instanceof Error ? error.stack ?? error.message : String(error)}`;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-black">
        Shopify connection test
      </h1>
      <p className="mt-2 text-sm text-black">
        Handle: <code>{TEST_HANDLE}</code>
      </p>
      <pre className="mt-4 p-4 bg-black text-white text-xs overflow-x-auto whitespace-pre-wrap break-words rounded">
        {body}
      </pre>
    </section>
  );
}
