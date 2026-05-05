# Code Conventions

## TypeScript

- **Strict mode on.** No `any` without explicit comment justification.
- **Types in `/types/`**, exported from `index.ts`.
- **Server vs client components**: explicit `"use client"` directive only when needed (interactive state, browser APIs, event handlers).

## File naming

- **Components**: PascalCase, one component per file. `ProductCard.tsx`.
- **Utilities, helpers, hooks**: camelCase. `formatPrice.ts`, `useCart.ts`.
- **App routes**: lowercase, hyphenated, matches URL. `app/water-filters/page.tsx`.
- **Markdown content**: lowercase, hyphenated. `content/water-problems/fluoride-removal.md`.

## Component structure

```tsx
// ProductCard.tsx

import type { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // ...
}
```

- Default to named exports, not default exports
- Props always typed via interface
- One component per file (small helpers can be co-located)

## Imports order

1. External packages (react, next, etc.)
2. Internal absolute imports (`@/lib`, `@/components`, `@/types`)
3. Relative imports (`./helpers`)
4. Type-only imports last

## Tailwind class order

Use `clsx` or `cn` helper for conditional classes. Order:
1. Layout (flex, grid, block)
2. Sizing (w-, h-)
3. Spacing (p-, m-)
4. Typography (text-, font-)
5. Colours (bg-, text-)
6. Borders & shadows
7. Effects (hover, focus, transition)

## Git commit messages

Conventional commits:

```
feat: add product detail page
fix: correct sku format in migration
docs: update shopify integration guide
refactor: extract cart provider into separate file
chore: update dependencies
```

One commit = one logical change. No "wip" commits in main.

## Branching

- `main` is always deployable. Vercel auto-deploys main → staging.
- Feature branches: `feat/product-detail-page`, `fix/cart-token-expiry`
- PRs preferred for non-trivial changes; direct commits to main acceptable for docs/content tweaks during early build

## Folder structure rules

- Group by domain, not by type. `/components/product/` (all product-related), not `/components/cards/`.
- Co-locate tightly related files. A complex component can have its own folder.
- `/lib/` is for shared logic. `/components/` is for UI. `/types/` is for types only. Don't mix.

## Shopify GraphQL queries

- One query per file in `/lib/shopify/queries/`
- Export as named const, all caps: `GET_PRODUCT_BY_HANDLE`
- Variables passed in via TypeScript interfaces
- Always specify a fragment for shared product fields (don't repeat the field list across queries)

```ts
export const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    ...
  }
`;

export const GET_PRODUCT_BY_HANDLE = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;
```

## Error handling

- All Shopify API calls wrapped in try/catch in the data layer
- User-facing errors: friendly messages, don't expose internals
- Server errors: log to Vercel, return appropriate status code
- Never silently swallow errors in catch blocks

## Performance rules

- **No client-side data fetching for content rendered on first paint.** Use server components.
- **Images**: always `next/image`, always with `alt`, always with explicit `width`/`height` (or `fill` with sized parent).
- **Fonts**: system stack only in v1. No `next/font/google`.
- **Third-party scripts**: load with `next/script` strategy `lazyOnload` or `afterInteractive`.

## Accessibility

- Semantic HTML always (`<button>` not `<div onClick>`)
- Skip-to-main-content link in header
- Focus states visible on all interactive elements (don't remove default outlines without replacing)
- Form labels always present (visually visible or `sr-only`)
- Colour contrast: WCAG AA minimum (4.5:1 for body text)

## Comments

- Comment **why**, not **what**.
- Public functions get JSDoc with at least a one-line description.
- TODO comments include date and reason: `// TODO 2026-05: refactor when reviews are added`.
