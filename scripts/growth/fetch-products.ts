/**
 * Fetch the full Shopify product catalogue via the Admin GraphQL API
 * and write a raw JSON snapshot to scripts/growth/data/raw/.
 *
 * Run with: npm run growth:fetch
 *
 * Requires SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_TOKEN in .env.local.
 *
 * Scope: this script lives in /scripts/growth/ and must never be imported
 * by /app or /components. See CLAUDE.md.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import '@shopify/shopify-api/adapters/node';
import {
  shopifyApi,
  ApiVersion,
  Session,
  LogSeverity,
} from '@shopify/shopify-api';

const API_VERSION = ApiVersion.April26;
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env', override: false });

const Env = z.object({
  SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1, 'SHOPIFY_STORE_DOMAIN is required')
    .refine(
      (v) => v.endsWith('.myshopify.com'),
      'SHOPIFY_STORE_DOMAIN must be the *.myshopify.com host (not the custom domain)',
    ),
  SHOPIFY_ADMIN_API_TOKEN: z
    .string()
    .min(1, 'SHOPIFY_ADMIN_API_TOKEN is required')
    .refine(
      (v) => v.startsWith('shpat_') || v.startsWith('shpca_'),
      'SHOPIFY_ADMIN_API_TOKEN should start with shpat_ (custom app) or shpca_',
    ),
});

const env = Env.parse({
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_ADMIN_API_TOKEN: process.env.SHOPIFY_ADMIN_API_TOKEN,
});

type ProductNode = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  status: string;
  seo: { title: string | null; description: string | null };
  totalInventory: number | null;
  variants: {
    edges: Array<{
      node: {
        id: string;
        sku: string | null;
        barcode: string | null;
        price: string;
        inventoryQuantity: number | null;
        inventoryItem: {
          measurement: {
            weight: { value: number; unit: string } | null;
          };
        };
      };
    }>;
  };
  images: {
    edges: Array<{ node: { id: string; url: string; altText: string | null } }>;
  };
  metafields: {
    edges: Array<{
      node: {
        namespace: string;
        key: string;
        type: string;
        value: string;
      };
    }>;
  };
};

const PRODUCTS_QUERY = `
  query GetProducts($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          productType
          vendor
          tags
          status
          totalInventory
          seo { title description }
          variants(first: 100) {
            edges {
              node {
                id
                sku
                barcode
                price
                inventoryQuantity
                inventoryItem {
                  measurement {
                    weight { value unit }
                  }
                }
              }
            }
          }
          images(first: 50) {
            edges { node { id url altText } }
          }
          metafields(first: 50) {
            edges { node { namespace key type value } }
          }
        }
      }
    }
  }
`;

function buildClient() {
  const shopify = shopifyApi({
    apiKey: 'unused-for-private-app',
    apiSecretKey: 'unused-for-private-app',
    scopes: [],
    hostName: env.SHOPIFY_STORE_DOMAIN,
    apiVersion: API_VERSION,
    isEmbeddedApp: false,
    logger: { level: LogSeverity.Warning },
  });

  const session = new Session({
    id: 'offline-admin',
    shop: env.SHOPIFY_STORE_DOMAIN,
    state: 'offline',
    isOnline: false,
    accessToken: env.SHOPIFY_ADMIN_API_TOKEN,
  });

  return new shopify.clients.Graphql({ session });
}

async function fetchAllProducts(): Promise<ProductNode[]> {
  const client = buildClient();
  const all: ProductNode[] = [];
  let cursor: string | null = null;
  let page = 0;

  type Data = {
    products: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      edges: Array<{ node: ProductNode }>;
    };
  };
  type GqlResponse = {
    data?: Data;
    errors?: unknown;
  };

  while (true) {
    page += 1;
    const response = (await client.request<Data>(PRODUCTS_QUERY, {
      variables: { cursor },
    })) as GqlResponse;

    if (response.errors) {
      throw new Error(
        `Shopify GraphQL errors: ${JSON.stringify(response.errors, null, 2)}`,
      );
    }

    const products = response.data?.products;
    if (!products) throw new Error('No products payload in response');

    for (const edge of products.edges) all.push(edge.node);
    process.stdout.write(
      `  page ${page}: +${products.edges.length} (running total: ${all.length})\n`,
    );

    if (!products.pageInfo.hasNextPage) break;
    cursor = products.pageInfo.endCursor;
  }

  return all;
}

function summarise(products: ProductNode[]) {
  const totalProducts = products.length;

  const allVariants = products.flatMap((p) => p.variants.edges.map((e) => e.node));
  const totalVariants = allVariants.length;

  const byType = new Map<string, number>();
  for (const p of products) {
    const key = p.productType?.trim() || '(no product_type)';
    byType.set(key, (byType.get(key) ?? 0) + 1);
  }

  const variantsMissingBarcode = allVariants.filter(
    (v) => !v.barcode || v.barcode.trim() === '',
  ).length;

  const productsAllVariantsMissingBarcode = products.filter((p) =>
    p.variants.edges.every(
      (e) => !e.node.barcode || e.node.barcode.trim() === '',
    ),
  ).length;

  const outOfStockVariants = allVariants.filter(
    (v) => (v.inventoryQuantity ?? 0) <= 0,
  ).length;
  const outOfStockProducts = products.filter(
    (p) => (p.totalInventory ?? 0) <= 0,
  ).length;

  const draftOrArchived = products.filter((p) => p.status !== 'ACTIVE').length;
  const missingSeoTitle = products.filter((p) => !p.seo?.title).length;
  const missingSeoDescription = products.filter(
    (p) => !p.seo?.description,
  ).length;

  return {
    totalProducts,
    totalVariants,
    byType: [...byType.entries()].sort((a, b) => b[1] - a[1]),
    variantsMissingBarcode,
    productsAllVariantsMissingBarcode,
    outOfStockVariants,
    outOfStockProducts,
    draftOrArchived,
    missingSeoTitle,
    missingSeoDescription,
  };
}

function printSummary(s: ReturnType<typeof summarise>) {
  const line = (label: string, value: string | number) =>
    console.log(`  ${label.padEnd(38)} ${value}`);

  console.log('\nShopify catalogue summary');
  console.log('─'.repeat(56));
  line('Total products', s.totalProducts);
  line('Total variants', s.totalVariants);
  line('Products not ACTIVE (draft/archived)', s.draftOrArchived);
  line('Variants missing barcode/GTIN', s.variantsMissingBarcode);
  line('Products with ALL variants no barcode', s.productsAllVariantsMissingBarcode);
  line('Variants out of stock (qty ≤ 0)', s.outOfStockVariants);
  line('Products out of stock (totalInventory ≤ 0)', s.outOfStockProducts);
  line('Products missing SEO title', s.missingSeoTitle);
  line('Products missing SEO description', s.missingSeoDescription);

  console.log('\nBy product_type');
  console.log('─'.repeat(56));
  for (const [type, count] of s.byType) {
    console.log(`  ${type.padEnd(38)} ${count}`);
  }
  console.log('');
}

function writeRawSnapshot(products: ProductNode[]): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = join(here, 'data', 'raw');
  mkdirSync(outDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(outDir, `products-${timestamp}.json`);

  const payload = {
    fetchedAt: new Date().toISOString(),
    store: env.SHOPIFY_STORE_DOMAIN,
    apiVersion: API_VERSION,
    productCount: products.length,
    products,
  };

  writeFileSync(file, JSON.stringify(payload, null, 2), 'utf8');
  return file;
}

async function main() {
  console.log(`Fetching products from ${env.SHOPIFY_STORE_DOMAIN}…`);
  const products = await fetchAllProducts();
  const file = writeRawSnapshot(products);
  console.log(`\nWrote raw snapshot: ${file}`);
  printSummary(summarise(products));
}

main().catch((err) => {
  console.error('\nfetch-products failed:');
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
