# Shopify Integration

## What Shopify handles

- Product catalogue (single source of truth)
- Inventory tracking
- Pricing
- Cart and checkout
- Payment processing
- Order management
- Shipping rates
- Email confirmations
- Refunds and returns
- Tax calculation
- Customer accounts (optional, only if customer creates one)

## What Next.js handles

- All public-facing rendering
- SEO metadata
- URL routing
- Editorial content (markdown)
- Cart UI (state pulled from Shopify cart)
- Internal linking and navigation

## Setup approach (current, 2026)

We use the **Shopify Headless sales channel** — Shopify's official, current way to manage headless storefronts. Not the legacy "Custom apps via Develop apps" flow. The Headless channel provides:

- Auto-generated public + private Storefront API tokens
- Single-screen permissions management
- Token rotation built in
- Order attribution to the headless storefront
- Multi-storefront support (we only need one)

## Headless channel setup (one-time, manual in Shopify admin)

1. **Install the Headless sales channel** from the Shopify App Store:
   - In Shopify admin → Apps → Shopify App Store
   - Search "Headless" (by Shopify)
   - Or direct link: https://apps.shopify.com/headless
   - Click "Add app" → "Add sales channel"

2. **Create a storefront**:
   - Sales channels → Headless → Add storefront
   - Name: `Enviro Aqua Web`

3. **Configure permissions** (in the new storefront's settings, "Storefront API permissions" card):
   - Read products
   - Read product inventory
   - Read product tags
   - Read product metafields
   - Read collections
   - Read collection metafields
   - Read prices
   - Read locations
   - Manage carts (read + write)
   - Read pages
   - Read content (articles, blogs)

4. **Copy the access tokens** from the "Storefront API tokens" card:
   - **Private access token** — server-side, must stay secret
   - **Public access token** — client-safe, browser-exposed, rate-limited

## Required environment variables

```
# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=<private token from Headless channel>
NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN=<public token from Headless channel>
SHOPIFY_API_VERSION=2026-04

# Site
NEXT_PUBLIC_SITE_URL=https://staging.enviroaqua.com.au

# Analytics (post-launch)
NEXT_PUBLIC_GA_ID=

# Vercel-injected (don't set manually)
VERCEL_URL=
VERCEL_ENV=
```

**API version: `2026-04`** — the current latest stable. Update quarterly when Shopify releases new versions. The previous version is supported for ~12 months as a fallback.

## Storefront API client (using the official client)

We use the **official `@shopify/storefront-api-client` package** rather than hand-rolling fetch. Less code to maintain, automatic version-aware error handling, official TypeScript types.

### Installation

```bash
npm install @shopify/storefront-api-client
```

### Client setup — `/lib/shopify/client.ts`

```ts
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

if (!process.env.SHOPIFY_STORE_DOMAIN) {
  throw new Error('SHOPIFY_STORE_DOMAIN is required');
}
if (!process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN) {
  throw new Error('SHOPIFY_STOREFRONT_PRIVATE_TOKEN is required');
}

export const shopifyClient = createStorefrontApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  apiVersion: process.env.SHOPIFY_API_VERSION ?? '2026-04',
  privateAccessToken: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
});
```

The client auto-handles:
- The correct GraphQL endpoint URL
- The correct auth header (`Shopify-Storefront-Private-Token`)
- Network error handling
- Response parsing

### Usage in queries

```ts
// /lib/shopify/queries/getProductByHandle.ts
import { shopifyClient } from '../client';
import type { Product } from '@/types/product';

const PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      vendor
      tags
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            sku
            title
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
      metafields(identifiers: [
        {namespace: "enviroaqua", key: "watermark_status"}
        {namespace: "enviroaqua", key: "watermark_licence_number"}
        {namespace: "enviroaqua", key: "watermark_certifier"}
        {namespace: "enviroaqua", key: "watermark_valid_until"}
        {namespace: "enviroaqua", key: "wels_rating_stars"}
        {namespace: "enviroaqua", key: "installation_type"}
        {namespace: "enviroaqua", key: "stages"}
        {namespace: "enviroaqua", key: "cartridge_type"}
        {namespace: "enviroaqua", key: "micron_rating"}
        {namespace: "enviroaqua", key: "housing_size"}
        {namespace: "enviroaqua", key: "connection_size"}
        {namespace: "enviroaqua", key: "flow_rate_lpm"}
        {namespace: "enviroaqua", key: "voltage"}
        {namespace: "enviroaqua", key: "capacity_l"}
        {namespace: "enviroaqua", key: "bunded"}
        {namespace: "enviroaqua", key: "key_benefits"}
        {namespace: "enviroaqua", key: "country_of_origin"}
        {namespace: "enviroaqua", key: "warranty_months"}
      ]) {
        key
        value
        type
      }
      seo {
        title
        description
      }
    }
  }
`;

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const { data, errors } = await shopifyClient.request(PRODUCT_QUERY, {
    variables: { handle },
  });
  
  if (errors) {
    console.error('Shopify error:', errors);
    throw new Error('Failed to fetch product');
  }
  
  return data?.product ?? null;
}
```

### Public client (for any client-side queries)

If we ever need browser-side queries (we should avoid this for first-paint content), use the public token:

```ts
// /lib/shopify/public-client.ts — only for client components
import { createStorefrontApiClient } from '@shopify/storefront-api-client';

export const shopifyPublicClient = createStorefrontApiClient({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
  apiVersion: process.env.SHOPIFY_API_VERSION ?? '2026-04',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN!,
});
```

## Caching strategy

Since the official client uses `fetch` under the hood, Next.js caching works the same way. We pass `next.revalidate` via the client's options:

| Query type | Strategy | Implementation |
|---|---|---|
| Product by handle | ISR, 60s revalidation | Wrap query in `fetch` cache or use `unstable_cache` |
| Collection / category | ISR, 5 min revalidation | Same |
| Cart mutations | Never cached | Pass `cache: 'no-store'` |
| Search | 30s revalidation | Aggressive cache, accepts staleness |

For granular control, wrap query functions with `unstable_cache`:

```ts
import { unstable_cache } from 'next/cache';

export const getProductByHandleCached = unstable_cache(
  getProductByHandle,
  ['product-by-handle'],
  { revalidate: 60, tags: ['products'] }
);
```

On-demand revalidation triggered by Shopify webhooks (see below) calls `revalidateTag('products')`.

## Cart implementation (Storefront API)

Carts are managed via Storefront API mutations:

| Operation | Mutation |
|---|---|
| Create cart | `cartCreate` |
| Add lines | `cartLinesAdd` |
| Update lines | `cartLinesUpdate` |
| Remove lines | `cartLinesRemove` |
| Apply discount | `cartDiscountCodesUpdate` |
| Get checkout URL | Read `cart.checkoutUrl` |

Cart ID stored in HTTP-only cookie. Cart context provider (`/components/cart/CartProvider.tsx`) wraps the app. Checkout URL redirects to Shopify-hosted checkout (compliance, security, fraud all handled by Shopify).

```ts
// /lib/shopify/cart.ts
import { shopifyClient } from './client';

export async function createCart() {
  const { data, errors } = await shopifyClient.request(CART_CREATE_MUTATION, {
    variables: { input: {} },
  });
  return data?.cartCreate?.cart;
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number) {
  const { data, errors } = await shopifyClient.request(CART_LINES_ADD_MUTATION, {
    variables: {
      cartId,
      lines: [{ merchandiseId, quantity }],
    },
  });
  return data?.cartLinesAdd?.cart;
}
```

## Webhooks

Shopify webhooks → Next.js route handlers for cache invalidation:

| Webhook | Endpoint | Action |
|---|---|---|
| `products/update` | `/api/webhooks/products` | `revalidateTag('products')` + `revalidatePath` for affected URL |
| `products/create` | `/api/webhooks/products` | `revalidateTag('products')`, regenerate sitemap |
| `products/delete` | `/api/webhooks/products` | `revalidateTag('products')`, regenerate sitemap |
| `collections/update` | `/api/webhooks/collections` | `revalidateTag('collections')` |
| `inventory_levels/update` | `/api/webhooks/inventory` | `revalidateTag('products')` for affected variant |

All webhooks must verify HMAC signature using `SHOPIFY_WEBHOOK_SECRET`. Webhook secret is set when registering the webhook in Shopify Admin → Settings → Notifications → Webhooks (or programmatically via Admin API).

```ts
// /app/api/webhooks/products/route.ts
import { revalidateTag, revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-shopify-hmac-sha256');
  
  // Verify HMAC
  const expected = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, 'utf8')
    .digest('base64');
  
  if (signature !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const product = JSON.parse(body);
  revalidateTag('products');
  // Also revalidate the specific product URL if known
  // revalidatePath(`/[category]/[sub]/${product.handle}`);
  
  return new Response('OK');
}
```

## Shopify Admin setup checklist

Before any product import:

- [ ] Headless sales channel installed
- [ ] Storefront created in Headless channel
- [ ] Permissions configured (see Setup section above)
- [ ] Private + public tokens generated and stored in Vercel env vars
- [ ] GST (10%) configured: Settings → Taxes → Australia
- [ ] Shipping zones: Australia (six-tier framework per `shipping-strategy.md`) + international optional
- [ ] Payment gateway: Shopify Payments (preferred) or fallback
- [ ] Email notifications: Settings → Notifications (review templates)
- [ ] Primary currency: AUD (Settings → Store details)
- [ ] Metafield definitions: Settings → Custom data → Products (matching docs/03-data-model.md)
- [ ] All metafields have "Storefront access" enabled

## Metafield definitions (set up once in Shopify Admin)

Settings → Custom data → Products → Add definition.

For each metafield in `/docs/03-data-model.md`:

- **Namespace**: `enviroaqua`
- **Key**: as specified
- **Type**: as specified (single line text, integer, boolean, date, etc.)
- **Description**: brief explanation
- **Validation**: applicable rules (enum values for `watermark_status`, etc.)
- **Storefront access**: **MUST be enabled** so Storefront API can read

If Storefront access isn't enabled, queries return null silently — common silent-failure mode.

## Migration import

- Final product data → CSV in Shopify import format (mapped from `migration/migration-spreadsheet.csv`)
- Imported via Shopify Admin → Products → Import
- After import: validate every product has all required metafields, tags, images, descriptions
- Trigger Vercel rebuild to populate ISR caches with new products

## Footguns to avoid

1. **Cart token expiry.** Cart tokens expire after ~10 days of inactivity. Catch the error on first interaction and create a fresh cart silently.

2. **Metafield types must match exactly.** Changing a metafield type after products use it requires recreating the metafield. Decide types upfront from `/docs/03-data-model.md`.

3. **Smart collection lag.** Smart collections update every few minutes after tag changes. Don't expect real-time. Build UX around eventual consistency.

4. **Variant images vs product images.** A product image isn't automatically a variant image. For variants with distinct images (e.g. different colours), set the variant image specifically via Admin or import.

5. **Storefront API rate limits.** ~50 requests/sec per app. Cache aggressively. Use `unstable_cache` and tag-based invalidation. Never call Shopify on every request — that's what ISR is for.

6. **Storefront access permission on metafields.** Easy to forget. If a metafield query returns null but the value exists in admin, it's the storefront-access permission.

7. **Private vs public token confusion.** Private token for server-side (higher rate limits, must stay secret). Public token for any necessary client-side queries (browser-exposed, lower limits, safe to leak). Never put the private token in `NEXT_PUBLIC_*` variables.

8. **API version drift.** Shopify ships new API versions quarterly. Old versions deprecate after ~12 months. Update `SHOPIFY_API_VERSION` env variable when upgrading; review breaking changes in Shopify changelog before bumping.

## Storefront API common queries

Stored in `/lib/shopify/queries/`:

- `getProductByHandle.ts`
- `getProductsByCollection.ts` (for category pages)
- `getCollections.ts` (for nav generation)
- `getProductRecommendations.ts` (cross-sell)
- `searchProducts.ts` (site search via predictiveSearch)
- `cart/createCart.ts`, `addCartLines.ts`, `updateCartLines.ts`, `removeCartLines.ts`

All queries use a shared `PRODUCT_FRAGMENT` (defined once in `/lib/shopify/fragments.ts`) to avoid duplicating field lists across queries. Single source of truth for what product data we fetch.
    },
    body: JSON.stringify({ query, variables }),
    cache,
    next,
  });
  if (!result.ok) throw new Error(`Shopify error: ${result.status}`);
  const json = await result.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}
```

## Caching strategy

- **Product queries**: ISR with `revalidate: 60` seconds
- **Category/collection queries**: ISR with `revalidate: 300` seconds
- **Cart queries**: never cached, always fresh
- **On-demand revalidation**: Shopify webhook → `/api/revalidate` route handler triggers `revalidatePath()` for affected URLs

## Cart implementation

- Cart created on first add-to-cart action via Storefront API mutation
- Cart ID stored in HTTP-only cookie
- Cart state managed via React Context (`/components/cart/CartProvider.tsx`)
- Cart drawer slides in from right on mobile and desktop
- Checkout button redirects to Shopify-hosted checkout URL (returned by Storefront API)

## Webhooks

Shopify webhooks → Next.js route handlers for:

| Webhook | Endpoint | Action |
|---|---|---|
| `products/update` | `/api/webhooks/products` | `revalidatePath('/[category]/[sub]/[slug]')` |
| `products/create` | `/api/webhooks/products` | Revalidate sitemap, category pages |
| `products/delete` | `/api/webhooks/products` | Revalidate sitemap, category pages |
| `collections/update` | `/api/webhooks/collections` | Revalidate category pages |
| `inventory_levels/update` | `/api/webhooks/inventory` | Revalidate affected product pages |

All webhooks verified via HMAC signature using `SHOPIFY_WEBHOOK_SECRET`.

## Shopify Admin setup checklist

Before any code:
- [ ] Create Shopify store (or use existing)
- [ ] Enable headless via "Hydrogen" channel or Storefront API directly
- [ ] Set up taxes (GST 10% for Australia)
- [ ] Set up shipping zones (Australia + international optional)
- [ ] Configure six-tier shipping profiles (T1–T5 by weight band, T6 freight-quoted) per `shipping-strategy.md`
- [ ] Connect payment gateway (Shopify Payments preferred)
- [ ] Configure email notification templates
- [ ] Set primary currency to AUD
- [ ] Set up metafield definitions matching `/docs/03-data-model.md`

## Metafield definitions (set up once in Shopify Admin)

Settings → Custom data → Products → Add definition.

For each metafield in `/docs/03-data-model.md`, create a definition with:
- Namespace: `enviroaqua`
- Key: as specified in data model doc
- Type: as specified
- Description: brief explanation
- Validation: applicable rules (enum values, etc.)
- Storefront access: enabled (so Storefront API can read)

## Migration import

- Final product data → CSV in Shopify import format
- Imported via Shopify Admin → Products → Import
- Validate: every product has all required metafields, tags, images, descriptions
- After import: rebuild static product pages via Vercel deployment

## Footguns to avoid

1. **Cart token expiry.** Tokens expire if untouched for ~10 days. Catch and recreate on first interaction.
2. **Metafield types must be exact.** Changing a metafield type after products use it requires re-creating it.
3. **Smart collection lag.** Smart collections update every few minutes — don't expect real-time tag changes.
4. **Variant images.** A product image is not the same as a variant image. For variants with different images, set the variant image specifically.
5. **Storefront API rate limits.** ~50 requests/sec per app. Cache aggressively.

## Storefront API common queries

Stored in `/lib/shopify/queries/`:
- `getProduct.ts` — by handle
- `getProductsByCollection.ts` — for category pages
- `getCollections.ts` — for nav
- `getProductRecommendations.ts` — for cross-sell
- `searchProducts.ts` — for site search
- `createCart.ts`, `addCartLines.ts`, `updateCartLines.ts`, `removeCartLines.ts` — for cart
