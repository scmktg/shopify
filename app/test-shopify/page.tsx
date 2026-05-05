import { getProductByHandle } from '@/lib/shopify/queries/getProductByHandle';

export const dynamic = 'force-dynamic';

const TEST_HANDLE =
  'chemical-dosing-tank-with-bunding-available-in-50l-100l-and-200l';

function formatError(error: unknown, depth = 0): string {
  const indent = depth === 0 ? '' : '\nCaused by:\n';
  if (error instanceof Error) {
    let out = indent + (error.stack ?? `${error.name}: ${error.message}`);
    if (error.cause !== undefined) {
      out += '\n\n' + formatError(error.cause, depth + 1);
    }
    return out;
  }
  if (typeof error === 'object' && error !== null) {
    return indent + JSON.stringify(error, null, 2);
  }
  return indent + String(error);
}

export default async function TestShopifyPage() {
  let body: string;
  try {
    const product = await getProductByHandle(TEST_HANDLE);
    body =
      product === null
        ? `No product found for handle "${TEST_HANDLE}".`
        : JSON.stringify(product, null, 2);
  } catch (error) {
    body = `Error fetching "${TEST_HANDLE}":\n\n${formatError(error)}`;
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
