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
- Customer accounts (if customer chooses to create one — optional, not required)

## What Next.js handles

- All public-facing rendering
- SEO metadata
- URL routing
- Editorial content (markdown)
- Cart UI (state pulled from Shopify cart token)
- Internal linking and navigation

## Storefront API setup

1. In Shopify Admin: Apps → Develop apps → Create an app
2. Configure Storefront API access scopes (read products, read collections, manage cart, etc.)
3. Generate Storefront API access token
4. Add to environment variables:

```
SHOPIFY_STORE_DOMAIN=enviroaqua.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<token>
SHOPIFY_API_VERSION=2024-10
```

## Required environment variables

```
# Shopify
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_API_VERSION=2024-10

# Site
NEXT_PUBLIC_SITE_URL=https://enviroaqua.com.au

# Analytics (post-launch)
NEXT_PUBLIC_GA_ID=

# Vercel-injected (don't set manually)
VERCEL_URL=
VERCEL_ENV=
```

## Storefront API client pattern

Single client in `/lib/shopify/client.ts`:

```ts
const SHOPIFY_GRAPHQL_API_ENDPOINT = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
  next,
}: {
  query: string;
  variables?: Record<string, any>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
}): Promise<T> {
  const result = await fetch(SHOPIFY_GRAPHQL_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      'Content-Type': 'application/json',
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
- [ ] Configure free shipping threshold ($200 AUD)
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
